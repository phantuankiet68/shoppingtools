import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function POST(req: Request) {
  const me = await requireAdminAuthUser();
  const body = await req.json().catch(() => ({}));
  const otherUserId = String(body.otherUserId || "");

  if (!otherUserId || otherUserId === me.id) {
    return NextResponse.json({ error: "Invalid otherUserId" }, { status: 400 });
  }

  // ✅ check friend accepted (2 chiều)
  const isFriend = await prisma.friendRequest.findFirst({
    where: {
      status: "ACCEPTED",
      OR: [
        { fromId: me.id, toId: otherUserId },
        { fromId: otherUserId, toId: me.id },
      ],
    },
    select: { id: true },
  });
  if (!isFriend) {
    return NextResponse.json({ error: "NOT_FRIEND" }, { status: 403 });
  }

  // find existing DIRECT
  const existing = await prisma.conversation.findFirst({
    where: {
      type: "DIRECT",
      AND: [{ members: { some: { userId: me.id } } }, { members: { some: { userId: otherUserId } } }],
    },
    select: { id: true },
  });
  if (existing) return NextResponse.json({ conversationId: existing.id });

  const created = await prisma.conversation.create({
    data: {
      type: "DIRECT",
      members: { create: [{ userId: me.id }, { userId: otherUserId }] },
    },
    select: { id: true },
  });

  return NextResponse.json({ conversationId: created.id });
}
