import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import Ably from "ably";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const me = await requireAdminAuthUser();
  const { id } = await ctx.params;

  if (!id) return NextResponse.json({ error: "Missing conversation id" }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const text = String(body?.text || "").trim();
  if (!text) return NextResponse.json({ error: "Text is required" }, { status: 400 });

  // ✅ verify membership + lấy members để publish inbox
  const conv = await prisma.conversation.findFirst({
    where: { id, members: { some: { userId: me.id } } },
    select: {
      id: true,
      members: { select: { userId: true } },
    },
  });

  if (!conv) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const msg = await prisma.message.create({
    data: { conversationId: id, senderId: me.id, text },
    include: { sender: { select: { id: true, email: true, profile: true } } },
  });

  const senderName = msg.sender?.profile?.firstName || msg.sender?.profile?.lastName || msg.sender?.email || "User";

  let realtimeOk = false;
  let realtimeError: string | null = null;

  try {
    const apiKey = process.env.ABLY_API_KEY;
    if (!apiKey) throw new Error("Missing ABLY_API_KEY (set it in .env.local and restart dev server)");

    const ably = new Ably.Rest(apiKey);

    const payload = {
      id: msg.id,
      text: msg.text,
      createdAt: msg.createdAt,
      conversationId: id,
      sender: { id: me.id, name: senderName },
    };

    // 1) publish chat channel
    await ably.channels.get(`chat:${id}`).publish("message:new", payload);

    // 2) publish inbox per member
    const memberIds = conv.members.map((m) => m.userId).filter(Boolean);

    await Promise.all(
      memberIds.map((uid) =>
        ably.channels.get(`inbox:${uid}`).publish("inbox:new", {
          conversationId: id,
          messageId: msg.id,
          lastText: msg.text,
          lastMessageAt: msg.createdAt,
          sender: { id: me.id, name: senderName },
        })
      )
    );

    realtimeOk = true;
  } catch (e: any) {
    realtimeOk = false;
    realtimeError = e?.message ? String(e.message) : "ABLY publish failed";
    console.error("[ABLY_PUBLISH_FAILED]", e);
  }

  return NextResponse.json({ message: msg, realtimeOk, realtimeError });
}
