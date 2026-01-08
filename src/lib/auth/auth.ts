import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export type AdminAuthUser = {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  isActive: boolean;
};

export async function getAdminAuthUser(): Promise<AdminAuthUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("admin_session")?.value;
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);

  const session = await prisma.session.findFirst({
    where: {
      tokenHash,
      type: "ADMIN",
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      user: { select: { id: true, email: true, role: true, isActive: true } },
    },
  });

  const user = session?.user;
  if (!user || !user.isActive) return null;

  // optional: touch lastSeenAt (giống API bạn đang làm)
  await prisma.session.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  });

  return user;
}

export async function requireAdminAuthUser(): Promise<AdminAuthUser> {
  const u = await getAdminAuthUser();
  if (!u) throw new Error("UNAUTHORIZED");
  return u;
}

export async function getAdminAuthUserId(): Promise<string | null> {
  const u = await getAdminAuthUser();
  return u?.id ?? null;
}
