import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function toRoleLabel(role: string) {
  return role === "ADMIN" ? "Admin" : "User";
}

export async function GET() {
  const cookieStore = await cookies();
  const rawToken = cookieStore.get("admin_session")?.value;

  if (!rawToken) {
    return Response.json({ user: null }, { status: 401 });
  }

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
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          image: true,
        },
      },
    },
  });

  if (!session?.user || !session.user.isActive) {
    return Response.json({ user: null }, { status: 401 });
  }

  const displayName = session.user.email.split("@")[0];

  await prisma.session.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  });

  return Response.json({
    user: {
      name: displayName,
      role: toRoleLabel(session.user.role),
      email: session.user.email,
      image: session.user.image,
    },
  });
}
