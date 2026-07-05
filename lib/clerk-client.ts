export function isClerkClientEnabled(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_DISABLE_CLERK !== "true"
  );
}