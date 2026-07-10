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
import { isEmailInAdminAllowlist } from "@/lib/admin";
import { Prisma } from "@/lib/generated/prisma/client";
import { getPrisma } from "@/lib/prisma";
import { oauthFetch } from "@/lib/oauth-fetch";
import { buildAuthCookiesConfig, getAuthSecret } from "@/lib/auth-config";

const canonicalAuthUrl = pinCanonicalAuthEnv();

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
      name: user.name ?? user.username ?? user.email ?? email,
      image: user.image ?? undefined,
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
  cookies: buildAuthCookiesConfig(),
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        if (account?.provider === "google" && user.email) {
          const prisma = getPrisma();
          const email = user.email.toLowerCase();

          if (prisma) {
            let dbUser = await prisma.user.findUnique({ where: { email } });

            const googleProfile = profile as {
              name?: string;
              picture?: string;
            } | null;

            if (!dbUser) {
              try {
                dbUser = await prisma.user.create({
                  data: {
                    id: randomUUID(),
                    email,
                    name: user.name ?? googleProfile?.name ?? null,
                    image: user.image ?? googleProfile?.picture ?? null,
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
            } else if (
              (!dbUser.name && (user.name || googleProfile?.name)) ||
              (!dbUser.image && (user.image || googleProfile?.picture))
            ) {
              dbUser = await prisma.user.update({
                where: { id: dbUser.id },
                data: {
                  name:
                    dbUser.name ??
                    user.name ??
                    googleProfile?.name ??
                    null,
                  image:
                    dbUser.image ??
                    user.image ??
                    googleProfile?.picture ??
                    null,
                },
              });
            }

            token.sub = dbUser?.id ?? user.id;
            token.name =
              dbUser?.name ??
              dbUser?.username ??
              user.name ??
              googleProfile?.name ??
              token.name;
            token.username = dbUser?.username ?? undefined;
            token.email = email;
            token.picture =
              dbUser?.image ??
              user.image ??
              googleProfile?.picture ??
              token.picture;
          } else {
            token.sub = user.id;
            token.name = user.name ?? token.name;
            token.email = email;
            token.picture = user.image ?? token.picture;
          }
        } else {
          token.sub = user.id;
          token.name = user.name ?? token.name;
          token.email = user.email ?? token.email;
          token.picture = user.image ?? token.picture;
        }
      }

      if (token.sub) {
        let isAdmin = false;
        const prisma = getPrisma();

        if (prisma) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.sub },
              select: {
                isAdmin: true,
                email: true,
                name: true,
                username: true,
                image: true,
              },
            });

            if (dbUser) {
              token.name =
                dbUser.name ?? dbUser.username ?? token.name ?? dbUser.email;
              token.username = dbUser.username ?? undefined;
              token.email = dbUser.email ?? token.email;
              if (dbUser.image) token.picture = dbUser.image;
              isAdmin =
                dbUser.isAdmin === true ||
                isEmailInAdminAllowlist(dbUser.email ?? token.email);
            } else {
              isAdmin = isEmailInAdminAllowlist(token.email);
            }
          } catch {
            isAdmin = isEmailInAdminAllowlist(token.email);
          }
        } else if (token.email && isEmailInAdminAllowlist(token.email)) {
          isAdmin = true;
        }

        token.isAdmin = isAdmin;
      }

      return token;
    },
    session({ session, token }) {
      if (session.user) {
        if (token.sub) session.user.id = token.sub;
        session.user.name = token.name ?? session.user.name;
        session.user.email = token.email ?? session.user.email;
        session.user.image = token.picture ?? session.user.image;
        session.user.username =
          typeof token.username === "string" ? token.username : null;
        session.user.isAdmin = token.isAdmin === true;
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