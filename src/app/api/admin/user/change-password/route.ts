import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function hashToken(rawToken: string) {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

function validatePassword(pw: string) {
  const atLeast8 = pw.length >= 8;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const number = /[0-9]/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);

  return {
    atLeast8,
    upper,
    lower,
    number,
    special,
    all: atLeast8 && upper && lower && number && special,
  };
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const rawToken = cookieStore.get("admin_session")?.value;
    if (!rawToken) return bad("Unauthorized", 401);

    const tokenHash = hashToken(rawToken);

    const session = await prisma.session.findFirst({
      where: {
        tokenHash,
        type: "ADMIN",
        revokedAt: null,
        expiresAt: { gt: new Date() },
      },
      select: {
        id: true,
        user: {
          select: {
            id: true,
            email: true,
            isActive: true,
            passwordHash: true,
          },
        },
      },
    });

    if (!session?.user || !session.user.isActive) return bad("Unauthorized", 401);

    const body = await req.json().catch(() => ({}));
    const confirmEmail = String(body.confirmEmail ?? "").trim();
    const currentPassword = String(body.currentPassword ?? "");
    const newPassword = String(body.newPassword ?? "");
    const signOutAll = Boolean(body.signOutAll);
    if (!confirmEmail) return bad("confirmEmail is required");
    if (confirmEmail.toLowerCase() !== session.user.email.toLowerCase()) {
      return bad("Email confirmation does not match your account email");
    }

    if (!currentPassword) return bad("Current password is required");
    const ok = await bcrypt.compare(currentPassword, session.user.passwordHash);
    if (!ok) return bad("Current password is incorrect", 403);

    const rules = validatePassword(newPassword);
    if (!rules.all) {
      return NextResponse.json(
        {
          error: "Password policy not satisfied",
          rules,
        },
        { status: 400 }
      );
    }

    const nextHash = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        passwordHash: nextHash,
        passwordUpdatedAt: new Date(),
      },
    });

    if (signOutAll) {
      await prisma.session.updateMany({
        where: {
          userId: session.user.id,
          id: { not: session.id },
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
          revokeReason: "PASSWORD_CHANGED",
        },
      });
    }

    await prisma.session.update({
      where: { id: session.id },
      data: { lastSeenAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return bad("Server error", 500);
  }
}
