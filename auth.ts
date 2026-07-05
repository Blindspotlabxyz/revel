import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { siteConfig } from "@/lib/site-config";

const useSecureCookies = (process.env.NEXTAUTH_URL ?? "").startsWith("https://");

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.NEXTAUTH_SECRET,
  trustHost: true,
  providers:
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : [],
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
    redirect({ url, baseUrl }) {
      const authOrigin = new URL(
        process.env.NEXTAUTH_URL ?? siteConfig.authUrl
      ).origin;

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