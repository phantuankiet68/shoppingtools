import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }, // ✅ Next 15: params là Promise
) {
  const me = await requireAdminAuthUser();

  const { id } = await ctx.params; // ✅ unwrap
  if (!id) return NextResponse.json({ error: "Missing conversation id" }, { status: 400 });

  const ok = await prisma.conversation.findFirst({
    where: { id, members: { some: { userId: me.id } } },
    select: { id: true },
  });
  if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const messages = await prisma.message.findMany({
    where: { conversationId: id },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: { sender: { select: { id: true, email: true, profile: true } } },
  });

  return NextResponse.json({ messages });
}
