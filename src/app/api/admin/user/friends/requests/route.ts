import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function GET(req: Request) {
  const me = await requireAdminAuthUser();
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get("type") || "incoming") as "incoming" | "outgoing";

  const where = type === "incoming" ? { toId: me.id, status: "PENDING" as const } : { fromId: me.id, status: "PENDING" as const };

  const requests = await prisma.friendRequest.findMany({
    where,
    include: {
      from: { select: { id: true, email: true, image: true, profile: true } },
      to: { select: { id: true, email: true, image: true, profile: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json({ requests });
}
