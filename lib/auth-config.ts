import { shouldPinCanonicalAuthUrl } from "@/lib/auth-url";
import { siteConfig } from "@/lib/site-config";

type AuthCookieOptions = {
  httpOnly: boolean;
  sameSite: "lax";
  path: string;
  secure: boolean;
  domain?: string;
  maxAge?: number;
};

export const AUTH_COOKIE_DOMAIN = ".tryrevel.xyz";

/** Secure + cross-subdomain cookies only on production tryrevel.xyz hosts. */
export function useSecureAuthCookies(): boolean {
  return shouldPinCanonicalAuthUrl();
}

/** Omit domain on localhost; pin to apex in production for cross-subdomain sessions. */
export function getAuthCookieDomain(): string | undefined {
  return useSecureAuthCookies() ? AUTH_COOKIE_DOMAIN : undefined;
}

function sharedAuthCookieOptions(
  overrides: Partial<AuthCookieOptions> = {}
): AuthCookieOptions {
  const domain = getAuthCookieDomain();
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: useSecureAuthCookies(),
    ...(domain ? { domain } : {}),
    ...overrides,
  };
}

/** __Host- CSRF cookies must not include a Domain attribute. */
function hostOnlyAuthCookieOptions(): AuthCookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: true,
  };
}

export function getSessionTokenCookieName(): string {
  return useSecureAuthCookies()
    ? "__Secure-next-auth.session-token"
    : "next-auth.session-token";
}

export function buildAuthCookiesConfig() {
  const secure = useSecureAuthCookies();
  const shared = sharedAuthCookieOptions();
  const prefix = secure ? "__Secure-" : "";

  return {
    sessionToken: {
      name: getSessionTokenCookieName(),
      options: shared,
    },
    callbackUrl: {
      name: `${prefix}authjs.callback-url`,
      options: shared,
    },
    csrfToken: {
      name: secure ? "__Host-authjs.csrf-token" : "authjs.csrf-token",
      options: secure ? hostOnlyAuthCookieOptions() : sharedAuthCookieOptions(),
    },
    pkceCodeVerifier: {
      name: `${prefix}authjs.pkce.code_verifier`,
      options: sharedAuthCookieOptions({ maxAge: 60 * 15 }),
    },
    state: {
      name: `${prefix}authjs.state`,
      options: sharedAuthCookieOptions({ maxAge: 60 * 15 }),
    },
    nonce: {
      name: `${prefix}authjs.nonce`,
      options: shared,
    },
  };
}

function joinUrl(base: string, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base.replace(/\/$/, "")}${normalized}`;
}

export function authSignInUrl(): string {
  if (shouldPinCanonicalAuthUrl()) {
    return joinUrl(siteConfig.authUrl, "/log-in");
  }
  return "/log-in";
}

export function authSignUpUrl(): string {
  if (shouldPinCanonicalAuthUrl()) {
    return joinUrl(siteConfig.authUrl, "/sign-up");
  }
  return "/sign-up";
}

/** Full-page sign-in URL with redirect_url for cross-subdomain auth gates. */
export function authSignInRedirectUrl(returnBackUrl: string): string {
  const signInPath = authSignInUrl();
  const signIn = signInPath.startsWith("http")
    ? new URL(signInPath)
    : new URL(signInPath, returnBackUrl);
  signIn.searchParams.set("redirect_url", returnBackUrl);
  return signIn.toString();
}

export function getAuthSecret(): string | undefined {
  return process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
}

export function isAuthConfigured(): boolean {
  return !!(
    getAuthSecret() &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET
  );
}