import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/session";

function toRoleLabel(role: string) {
  return role === "ADMIN" ? "Admin" : "User";
}

export async function GET() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("admin_session")?.value ?? null;

  if (!rawToken) {
    return Response.json({ user: null }, { status: 401 });
  }

  const tokenHash = hashToken(rawToken);

  const session = await prisma.userSession.findFirst({
    where: {
      refreshTokenHash: tokenHash,
      revokedAt: null,
      expiresAt: { gt: new Date() },
    },
    select: {
      id: true,
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          status: true, // ✅ thay isActive
        },
      },
    },
  });

  // chỉ cho ADMIN + ACTIVE
  if (!session?.user || session.user.role !== "ADMIN" || session.user.status !== "ACTIVE") {
    return Response.json({ user: null }, { status: 401 });
  }

  const displayName = session.user.email.includes("@") ? session.user.email.split("@")[0] : session.user.email;

  // update lastSeenAt (best-effort)
  await prisma.userSession
    .update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    })
    .catch(() => {});

  return Response.json({
    user: {
      name: displayName,
      role: toRoleLabel(session.user.role),
      email: session.user.email,
      image: null, // ✅ schema User chưa có image
    },
  });
}
