import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { newSessionToken, hashToken } from "@/lib/session";

function getClientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? null;
}

const ADMIN_SESSION_DAYS = 1;

const MAX_FAILS_WINDOW = 5;
const WINDOW_MINUTES = 15;
const LOCK_MINUTES = 15;

function genericFail() {
  return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const userAgent = req.headers.get("user-agent") ?? null;
  const origin = req.headers.get("origin") ?? "";

  const allowedOrigin = process.env.APP_ORIGIN;
  if (allowedOrigin && origin && origin !== allowedOrigin) {
    return NextResponse.json({ message: "Invalid origin" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const email = (body?.email ?? "").toString().trim().toLowerCase();
  const password = (body?.password ?? "").toString();

  const ipAddressForAttempt = ip ?? "0.0.0.0";

  if (!email || !password) {
    await sleep(150);
    return genericFail();
  }

  const now = new Date();
  const windowStart = new Date(now.getTime() - WINDOW_MINUTES * 60 * 1000);
  const recentFails = await prisma.loginAttempt.count({
    where: {
      email,
      ipAddress: ipAddressForAttempt,
      success: false,
      createdAt: { gte: windowStart },
    },
  });

  if (recentFails >= MAX_FAILS_WINDOW) {
    await prisma.auditLog
      .create({
        data: {
          action: "ADMIN_LOGIN_BLOCKED",
          ipAddress: ip,
          userAgent,
          metaJson: {
            email,
            reason: "rate_limited",
            windowMinutes: WINDOW_MINUTES,
            maxFails: MAX_FAILS_WINDOW,
          },
        },
      })
      .catch(() => {});
    await sleep(150);
    return genericFail();
  }

  const user = await prisma.user.findUnique({ where: { email } });

  const isEligible = !!user && user.role === "ADMIN" && user.status === "ACTIVE";

  const ok = isEligible ? await verifyPassword(password, user!.passwordHash) : false;

  await prisma.loginAttempt
    .create({
      data: {
        email,
        userId: user?.id ?? null,
        ipAddress: ipAddressForAttempt,
        userAgent,
        success: ok,
      },
    })
    .catch(() => {});

  if (!ok) {
    await prisma.auditLog
      .create({
        data: {
          actorUserId: user?.id ?? null,
          action: "ADMIN_LOGIN_FAIL",
          ipAddress: ip,
          userAgent,
          metaJson: {
            email,
            reason: !user
              ? "no_user_or_ineligible"
              : user.status !== "ACTIVE"
                ? "suspended"
                : user.role !== "ADMIN"
                  ? "not_admin"
                  : "bad_password",
          },
        },
      })
      .catch(() => {});

    await sleep(150);
    return genericFail();
  }

  const token = newSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ADMIN_SESSION_DAYS * 24 * 60 * 60 * 1000);

  await prisma.$transaction([
    prisma.userSession.updateMany({
      where: { userId: user!.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.userSession.create({
      data: {
        userId: user!.id,
        refreshTokenHash: tokenHash,
        expiresAt,
        ipAddress: ip,
        userAgent,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: user!.id,
        action: "ADMIN_LOGIN_SUCCESS",
        ipAddress: ip,
        userAgent,
        metaJson: { email },
      },
    }),
  ]);

  const res = NextResponse.json({ ok: true });

  res.cookies.set("admin_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return res;
}
