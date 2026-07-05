import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { siteConfig } from "@/lib/site-config";
import { getCanonicalAuthUrl, pinCanonicalAuthEnv } from "@/lib/auth-url";
import { getPrisma } from "@/lib/prisma";

const canonicalAuthUrl = pinCanonicalAuthEnv();
const useSecureCookies = canonicalAuthUrl.startsWith("https://");

const googleProvider =
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? Google({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    : null;

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
    };
  },
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers: [
    ...(googleProvider ? [googleProvider] : []),
    credentialsProvider,
  ],
  pages: {
    signIn: "/log-in",
  },
  cookies: {
    sessionToken: {
      name: useSecureCookies
        ? "__Secure-next-auth.session-token"
        : "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: useSecureCookies,
        ...(useSecureCookies ? { domain: ".tryrevel.xyz" } : {}),
      },
    },
  },
  callbacks: {
    jwt({ token, user }) {
      if (user?.id) {
        token.sub = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
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

        if (allowedOrigins.has(target.origin)) {
          return target.toString();
        }
      } catch {
        // Fall through to default.
      }

      return new URL(siteConfig.url).toString();
    },
  },
});