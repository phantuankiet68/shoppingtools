import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function GET() {
  const me = await requireAdminAuthUser();

  const accepted = await prisma.friendRequest.findMany({
    where: {
      status: "ACCEPTED",
      OR: [{ fromId: me.id }, { toId: me.id }],
    },
    include: {
      from: { select: { id: true, email: true, image: true, profile: true } },
      to: { select: { id: true, email: true, image: true, profile: true } },
    },
    orderBy: { respondedAt: "desc" },
    take: 200,
  });

  const friends = accepted.map((r) => (r.fromId === me.id ? r.to : r.from));
  return NextResponse.json({ friends });
}
