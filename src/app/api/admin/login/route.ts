import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { newSessionToken, hashToken } from "@/lib/session";

function getClientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? null;
}

const ADMIN_SESSION_DAYS = 1; // admin session ngắn (khuyến nghị)
const MAX_FAILS = 5;

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? null;
  const origin = req.headers.get("origin") ?? "";

  // (Bổ trợ CSRF/Origin) – login là endpoint nhạy cảm
  // Nếu bạn deploy cùng domain, có thể check origin bắt đầu bằng base url của bạn
  const allowedOrigin = process.env.APP_ORIGIN; // ví dụ: https://example.com
  if (allowedOrigin && origin && origin !== allowedOrigin) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const email = (body?.email ?? "").toString().trim().toLowerCase();
  const password = (body?.password ?? "").toString();

  // UX bảo mật: không leak email tồn tại hay không
  const genericFail = () => NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

  if (!email || !password) return genericFail();

  const user = await prisma.user.findUnique({ where: { email } });

  // Log attempt (optional table)
  await prisma.loginAttempt
    .create({
      data: { email, ip: ip ?? "", success: false },
    })
    .catch(() => {});

  if (!user || !user.isActive) {
    // Audit log fail (không gắn userId nếu không tồn tại)
    await prisma.auditLog
      .create({
        data: {
          action: "ADMIN_LOGIN_FAIL",
          result: "FAIL",
          ip,
          userAgent,
          metaJson: { email },
        },
      })
      .catch(() => {});
    return genericFail();
  }

  // Must be admin
  if (user.role !== "ADMIN") {
    await prisma.auditLog
      .create({
        data: {
          userId: user.id,
          action: "ADMIN_LOGIN_FAIL",
          result: "FAIL",
          ip,
          userAgent,
          metaJson: { reason: "not_admin" },
        },
      })
      .catch(() => {});
    return genericFail();
  }

  // Lockout check
  if (user.lockedUntil && user.lockedUntil > new Date()) {
    await prisma.auditLog
      .create({
        data: {
          userId: user.id,
          action: "ADMIN_LOGIN_FAIL",
          result: "FAIL",
          ip,
          userAgent,
          metaJson: { reason: "locked" },
        },
      })
      .catch(() => {});
    return genericFail();
  }

  const ok = await verifyPassword(password, user.passwordHash);

  if (!ok) {
    const nextFails = user.failedLoginCount + 1;

    // progressive lockout
    let lockedUntil: Date | null = null;
    if (nextFails >= MAX_FAILS) {
      // ví dụ: khoá 15 phút
      lockedUntil = new Date(Date.now() + 15 * 60 * 1000);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: nextFails,
        lockedUntil,
      },
    });

    await prisma.auditLog
      .create({
        data: {
          userId: user.id,
          action: "ADMIN_LOGIN_FAIL",
          result: "FAIL",
          ip,
          userAgent,
          metaJson: { reason: "bad_password", fails: nextFails },
        },
      })
      .catch(() => {});

    return genericFail();
  }

  // Success: reset fails + rotate session (revoke old ADMIN sessions)
  const token = newSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.session.updateMany({
      where: { userId: user.id, type: "ADMIN", revokedAt: null },
      data: { revokedAt: new Date(), revokeReason: "rotated_on_login" },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null },
    }),
    prisma.session.create({
      data: {
        userId: user.id,
        type: "ADMIN",
        tokenHash,
        expiresAt,
        ip,
        userAgent,
      },
    }),
    prisma.auditLog.create({
      data: {
        userId: user.id,
        action: "ADMIN_LOGIN_SUCCESS",
        result: "SUCCESS",
        ip,
        userAgent,
      },
    }),
  ]);

  const res = NextResponse.json({ ok: true });

  // Cookie HttpOnly + Secure + SameSite
  res.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return res;
}
