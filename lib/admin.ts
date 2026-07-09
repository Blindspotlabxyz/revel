import { getPrisma } from "@/lib/prisma";

export function isEmailInAdminAllowlist(
  email: string | null | undefined
): boolean {
  if (!email) return false;

  const raw = process.env.REVEL_ADMIN_EMAILS ?? "";
  const allowlist = raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);

  return allowlist.includes(email.trim().toLowerCase());
}

export async function isUserAdmin(
  userId: string | null | undefined,
  email?: string | null
): Promise<boolean> {
  if (email && isEmailInAdminAllowlist(email)) return true;
  if (!userId) return false;

  const prisma = getPrisma();
  if (!prisma) return false;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true, email: true },
    });

    if (user?.isAdmin === true) return true;
    if (user?.email && isEmailInAdminAllowlist(user.email)) return true;
  } catch (error) {
    console.error(
      "[Revel] admin_check_failed",
      error instanceof Error ? error.message : error
    );
  }

  return false;
}