import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

type UserProfile = {
  firstName?: string | null;
  lastName?: string | null;
  username?: string | null;
};

type ConversationMemberRow = {
  userId: string | null;
  user: {
    id: string;
    email: string | null;
    image: string | null;
    profile: UserProfile | null;
  } | null;
};

type ConversationMessageRow = {
  id: string;
  text: string;
  createdAt: Date;
  sender: {
    id: string;
    email: string | null;
    profile: UserProfile | null;
  } | null;
};

type ConversationRow = {
  id: string;
  type: "DIRECT" | "GROUP" | string;
  lastMessageAt: Date | null;
  updatedAt: Date;
  members: ConversationMemberRow[];
  messages: ConversationMessageRow[];
};

export async function GET() {
  const me = await requireAdminAuthUser();

  const rows = (await prisma.conversation.findMany({
    where: { members: { some: { userId: me.id } } },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
    include: {
      members: {
        include: {
          user: { select: { id: true, email: true, image: true, profile: true } },
        },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
        include: { sender: { select: { id: true, email: true, profile: true } } },
      },
    },
    take: 50,
  })) as unknown as ConversationRow[];

  // Format giống UI của bạn
  const chats = rows.map((c) => {
    const last = c.messages[0];
    const otherMember = c.type === "DIRECT" ? c.members.find((m) => m.userId !== me.id) : null;
    const other = otherMember?.user;

    const title = c.type === "DIRECT" ? (other?.profile?.firstName ?? other?.email ?? "Direct") : "Group";

    const lastSenderProfile = last?.sender?.profile;
    const lastSender = lastSenderProfile?.firstName ?? last?.sender?.email ?? "";

    return {
      id: c.id,
      type: c.type,
      title,
      lastSender,
      lastText: last?.text ?? "",
      lastMessageAt: c.lastMessageAt,
      membersCount: c.members.length,
    };
  });

  return NextResponse.json({ chats });
}
