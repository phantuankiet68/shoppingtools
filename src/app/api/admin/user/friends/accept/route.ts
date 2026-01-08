import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function POST(req: Request) {
  const me = await requireAdminAuthUser();
  const body = await req.json().catch(() => ({}));
  const requestId = String(body.requestId || "");

  const fr = await prisma.friendRequest.findFirst({
    where: { id: requestId, toId: me.id, status: "PENDING" },
    select: { id: true },
  });
  if (!fr) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.friendRequest.update({
    where: { id: requestId },
    data: { status: "ACCEPTED", respondedAt: new Date() },
  });

  return NextResponse.json({ ok: true, request: updated });
}
