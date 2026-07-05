/**
 * Prints the OAuth callback URL Auth.js will use for Google.
 * Usage: NEXTAUTH_URL=https://auth.tryrevel.xyz node scripts/verify-oauth-callback.mjs
 */

const raw = (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? "https://auth.tryrevel.xyz")
  .replace(/\/$/, "");

const callback = `${raw}/api/auth/callback/google`;

console.log("AUTH_URL / NEXTAUTH_URL:", raw);
console.log("Expected Google redirect_uri:", callback);