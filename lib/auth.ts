import { auth, currentUser } from "@clerk/nextjs/server";

export function isClerkEnabled(): boolean {
  return (
    !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY &&
    !!process.env.CLERK_SECRET_KEY &&
    process.env.NEXT_PUBLIC_DISABLE_CLERK !== "true"
  );
}

export async function getCurrentUserId(): Promise<string | null> {
  if (!isClerkEnabled()) return null;

  try {
    const { userId } = await auth();
    return userId;
  } catch {
    return null;
  }
}

export async function getCurrentUserEmail(): Promise<string | null> {
  if (!isClerkEnabled()) return null;

  try {
    const user = await currentUser();
    return user?.emailAddresses[0]?.emailAddress ?? null;
  } catch {
    return null;
  }
}

export async function requireUserId(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Authentication required");
  }
  return userId;
}