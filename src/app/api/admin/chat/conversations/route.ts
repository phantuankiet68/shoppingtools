import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth"; // bạn đổi sang requireAuthUser nếu chat user thường

export async function GET() {
  const me = await requireAdminAuthUser();

  const rows = await prisma.conversation.findMany({
    where: { members: { some: { userId: me.id } } },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    include: {
      members: { include: { user: { select: { id: true, email: true, image: true, profile: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1, include: { sender: { select: { id: true, email: true, profile: true } } } },
    },
    take: 50,
  });

  // Format giống UI của bạn
  const chats = rows.map((c) => {
    const last = c.messages[0];
    const other = c.type === "DIRECT" ? c.members.find((m) => m.userId !== me.id)?.user : null;

    return {
      id: c.id,
      type: c.type,
      title: c.type === "DIRECT" ? other?.profile?.firstName ?? other?.email ?? "Direct" : "Group",
      lastSender: last?.sender?.profile?.firstName ?? last?.sender?.email ?? "",
      lastText: last?.text ?? "",
      lastMessageAt: c.lastMessageAt,
      membersCount: c.members.length,
    };
  });

  return NextResponse.json({ chats });
}
