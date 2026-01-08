import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function POST(req: Request) {
  const me = await requireAdminAuthUser();
  const body = await req.json().catch(() => ({}));
  const email = String(body.email || "")
    .toLowerCase()
    .trim();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  // 1️⃣ tìm user theo email
  const toUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  if (!toUser) {
    return NextResponse.json({ error: "USER_NOT_FOUND" }, { status: 404 });
  }

  if (toUser.id === me.id) {
    return NextResponse.json({ error: "CANNOT_ADD_SELF" }, { status: 400 });
  }

  // 2️⃣ check block
  const blocked = await prisma.block.findFirst({
    where: {
      OR: [
        { blockerId: me.id, blockedId: toUser.id },
        { blockerId: toUser.id, blockedId: me.id },
      ],
    },
  });
  if (blocked) {
    return NextResponse.json({ error: "BLOCKED" }, { status: 403 });
  }

  // 3️⃣ check existing friend / request
  const existed = await prisma.friendRequest.findFirst({
    where: {
      OR: [
        { fromId: me.id, toId: toUser.id },
        { fromId: toUser.id, toId: me.id },
      ],
    },
  });

  if (existed) {
    if (existed.status === "PENDING") {
      return NextResponse.json({ error: "REQUEST_ALREADY_SENT" }, { status: 409 });
    }
    if (existed.status === "ACCEPTED") {
      return NextResponse.json({ error: "ALREADY_FRIEND" }, { status: 409 });
    }
  }

  // 4️⃣ tạo request
  const fr = await prisma.friendRequest.create({
    data: {
      fromId: me.id,
      toId: toUser.id,
    },
    select: { id: true },
  });

  return NextResponse.json({ success: true, requestId: fr.id });
}
