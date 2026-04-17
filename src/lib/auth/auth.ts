import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { SystemRole, UserStatus } from "@/generated/prisma";

function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export type AdminAuthUser = {
  id: string;
  email: string;
  systemRole: SystemRole;
  status: UserStatus;
};

export async function getAdminAuthUser(): Promise<AdminAuthUser | null> {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("admin_session")?.value;
  if (!rawToken) return null;

  const tokenHash = hashToken(rawToken);

  const session = await prisma.userSession.findFirst({
    where: {
      refreshTokenHash: tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },

      // ✅ FIX CHUẨN
      user: {
        is: {
          systemRole: SystemRole.ADMIN,
          status: UserStatus.ACTIVE,
        },
      },
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          email: true,
          systemRole: true, // ✅ FIX
          status: true,
        },
      },
    },
  });

  const user = session?.user;
  if (!user) return null;

  await prisma.userSession.update({
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