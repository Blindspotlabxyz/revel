/** Client-safe signal that auth UI should render (uses public env only). */
export function isAuthClientEnabled(): boolean {
  return !!process.env.NEXT_PUBLIC_AUTH_URL;
}