import NextAuth from "next-auth";
import { customFetch } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import { siteConfig } from "@/lib/site-config";
import {
  getCanonicalAuthUrl,
  isLocalAuthHost,
  pinCanonicalAuthEnv,
} from "@/lib/auth-url";
import { Prisma } from "@/lib/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import { oauthFetch } from "@/lib/oauth-fetch";
import { getAuthSecret } from "@/lib/auth-config";

const canonicalAuthUrl = pinCanonicalAuthEnv();
const useProductionCookies =
  process.env.NODE_ENV === "production" &&
  canonicalAuthUrl.startsWith("https://");

const credentialsProvider = Credentials({
  name: "Email and password",
  credentials: {
    email: { label: "Email", type: "email" },
    password: { label: "Password", type: "password" },
  },
  async authorize(credentials) {
    const email = credentials?.email?.toString().trim().toLowerCase();
    const password = credentials?.password?.toString();

    if (!email || !password) {
      return null;
    }

    const prisma = getPrisma();
    if (!prisma) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user?.passwordHash) {
      return null;
    }

    const passwordMatches = await bcrypt.compare(password, user.passwordHash);
    if (!passwordMatches) {
      return null;
    }

    return {
      id: user.id,
      email: user.email ?? email,
      name: user.email ?? email,
    };
  },
});

const googleEnabled = !!(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: getAuthSecret(),
  trustHost: true,
  debug: process.env.AUTH_DEBUG === "true",
  session: { strategy: "jwt" },
  providers: [
    ...(googleEnabled
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            [customFetch]: oauthFetch,
          }),
        ]
      : []),
    credentialsProvider,
  ],
  pages: {
    signIn: "/log-in",
    error: "/log-in",
  },
  cookies: {
    sessionToken: {
      name: useProductionCookies
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useProductionCookies,
        ...(useProductionCookies ? { domain: ".tryrevel.xyz" } : {}),
      },
    },
  },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        if (account?.provider === "google" && user.email) {
          const prisma = getPrisma();
          const email = user.email.toLowerCase();

          if (prisma) {
            let dbUser = await prisma.user.findUnique({ where: { email } });

            if (!dbUser) {
              try {
                dbUser = await prisma.user.create({
                  data: {
                    id: randomUUID(),
                    email,
                  },
                });
              } catch (error) {
                if (
                  error instanceof Prisma.PrismaClientKnownRequestError &&
                  error.code === "P2002"
                ) {
                  dbUser = await prisma.user.findUnique({ where: { email } });
                } else {
                  throw error;
                }
              }
            }

            token.sub = dbUser?.id ?? user.id;
          } else {
            token.sub = user.id;
          }

          const googleProfile = profile as {
            name?: string;
            picture?: string;
          } | null;

          token.name = user.name ?? googleProfile?.name ?? token.name;
          token.email = email;
          token.picture =
            user.image ?? googleProfile?.picture ?? token.picture;
        } else {
          token.sub = user.id;
          token.name = user.name ?? token.name;
          token.email = user.email ?? token.email;
          token.picture = user.image ?? token.picture;
        }
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.image = token.picture ?? session.user.image;
      }
      return session;
    },
    redirect({ url }) {
      const authOrigin = new URL(canonicalAuthUrl).origin;

      if (url.startsWith("/")) {
        return `${authOrigin}${url}`;
      }

      try {
        const target = new URL(url);
        const allowedOrigins = new Set([
          new URL(siteConfig.url).origin,
          new URL(siteConfig.docsUrl).origin,
          new URL(siteConfig.legalUrl).origin,
          new URL(siteConfig.authUrl).origin,
          authOrigin,
        ]);

        if (isLocalAuthHost()) {
          allowedOrigins.add("http://localhost:3000");
          allowedOrigins.add("http://127.0.0.1:3000");
        }

        if (allowedOrigins.has(target.origin)) {
          return target.toString();
        }
      } catch {
        // Fall through to default.
      }

      return isLocalAuthHost()
        ? canonicalAuthUrl
        : new URL(siteConfig.url).toString();
    },
  },
});