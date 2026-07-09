import { auth as nextAuth } from "@/auth";
import { isUserAdmin } from "@/lib/admin";
import { isAuthConfigured } from "@/lib/auth-config";

export function isAuthEnabled(): boolean {
  return isAuthConfigured();
}

export async function getCurrentUserId(): Promise<string | null> {
  if (!isAuthEnabled()) return null;

  try {
    const session = await nextAuth();
    return session?.user?.id ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentUserEmail(): Promise<string | null> {
  if (!isAuthEnabled()) return null;

  try {
    const session = await nextAuth();
    return session?.user?.email ?? null;
  } catch {
    return null;
  }
}

export async function getCurrentUserName(): Promise<string | null> {
  if (!isAuthEnabled()) return null;

  try {
    const session = await nextAuth();
    return session?.user?.name ?? null;
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

export async function getCurrentUserIsAdmin(): Promise<boolean> {
  const userId = await getCurrentUserId();
  return isUserAdmin(userId);
}

export async function requireAdminUserId(): Promise<string> {
  const userId = await requireUserId();
  const admin = await isUserAdmin(userId);
  if (!admin) {
    throw new Error("Admin access required");
  }
  return userId;
}