import { getPrisma } from "@/lib/prisma";

export async function isUserAdmin(userId: string | null | undefined): Promise<boolean> {
  if (!userId) return false;

  const prisma = getPrisma();
  if (!prisma) return false;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  return user?.isAdmin === true;
}