import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createUserSession, setSessionCookie } from "@/lib/auth/session";
import { getRequestMeta } from "@/lib/auth/request";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body?.name ?? "").trim();
    const email = String(body?.email ?? "")
      .trim()
      .toLowerCase();
    const password = String(body?.password ?? "");

    if (!name) {
      return NextResponse.json({ message: "Vui lòng nhập họ tên." }, { status: 400 });
    }

    if (!isValidEmail(email)) {
      return NextResponse.json({ message: "Email không hợp lệ." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ message: "Mật khẩu phải có ít nhất 6 ký tự." }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json({ message: "Email đã được sử dụng." }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        role: "USER",
        status: "ACTIVE",
      },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Nếu sau này bạn có Profile model chuẩn, có thể create profile tại đây bằng `name`

    const meta = getRequestMeta(req);
    const session = await createUserSession({
      userId: user.id,
      ipAddress: meta.ipAddress,
      userAgent: meta.userAgent,
    });

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        targetUserId: user.id,
        action: "AUTH_REGISTER",
        ipAddress: meta.ipAddress,
        userAgent: meta.userAgent,
        metaJson: {
          email,
        },
      },
    });

    const response = NextResponse.json(
      {
        message: "Đăng ký thành công.",
        user,
      },
      { status: 201 },
    );

    setSessionCookie(response, session.token, session.expiresAt);

    return response;
  } catch (error) {
    console.error("REGISTER_ERROR", error);
    return NextResponse.json({ message: "Đăng ký thất bại." }, { status: 500 });
  }
}
