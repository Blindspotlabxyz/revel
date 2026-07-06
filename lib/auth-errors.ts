/** User-facing copy for Auth.js ?error= query params on /log-in. */
export function authErrorMessage(code: string | null): string | null {
  if (!code) return null;

  switch (code) {
    case "Configuration":
      return "Google sign-in could not finish because this machine could not reach Google's servers (connection timed out). Try disabling VPN/firewall for Node, use email/password, or test on production.";
    case "OAuthCallback":
    case "CallbackRouteError":
      return "Google sign-in was interrupted while exchanging the authorization code. Check your network connection and try again.";
    case "OAuthAccountNotLinked":
    case "AccountNotLinked":
      return "This Google account is not linked to an existing Revel account. Sign up first or use the same email you registered with.";
    case "AccessDenied":
      return "Google sign-in was cancelled or denied.";
    case "Verification":
      return "The sign-in link expired or is invalid. Please try again.";
    default:
      return `Sign-in failed (${code}). Please try again or use email/password.`;
  }
}