import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { newSessionToken, hashToken } from "@/lib/session";
import { signAdminAccessToken, signAdminRefreshToken } from "@/lib/auth/jwt";

function getClientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? req.headers.get("x-real-ip") ?? null;
}

const ADMIN_SESSION_DAYS = 1;
const MAX_FAILS_WINDOW = 5;
const WINDOW_MINUTES = 15;

function genericFail() {
  return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      passwordHash: true,
      systemRole: true,
      status: true,
    },
  });

  const isEligible =
    !!user && (user.systemRole === "ADMIN" || user.systemRole === "SUPER_ADMIN") && user.status === "ACTIVE";

  const ok = isEligible ? await verifyPassword(password, user.passwordHash) : false;

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

  if (!ok || !user) {
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
              ? "no_user"
              : user.status !== "ACTIVE"
                ? "suspended"
                : user.systemRole !== "ADMIN" && user.systemRole !== "SUPER_ADMIN"
                  ? "not_admin"
                  : "bad_password",
          },
        },
      })
      .catch(() => {});

    await sleep(150);
    return genericFail();
  }

  const safeUser = user;
  const sessionToken = newSessionToken();
  const tokenHash = hashToken(sessionToken);
  const sessionExpiresAt = new Date(Date.now() + ADMIN_SESSION_DAYS * 24 * 60 * 60 * 1000);

  const accessToken = await signAdminAccessToken({
    userId: safeUser.id,
    email: safeUser.email,
    systemRole: safeUser.systemRole,
    status: safeUser.status,
  });

  const refreshToken = await signAdminRefreshToken({
    userId: safeUser.id,
    email: safeUser.email,
    systemRole: safeUser.systemRole,
    status: safeUser.status,
  });

  await prisma.$transaction([
    prisma.userSession.updateMany({
      where: { userId: safeUser.id, revokedAt: null },
      data: { revokedAt: new Date() },
    }),
    prisma.userSession.create({
      data: {
        userId: safeUser.id,
        refreshTokenHash: tokenHash,
        expiresAt: sessionExpiresAt,
        ipAddress: ip,
        userAgent,
      },
    }),
    prisma.auditLog.create({
      data: {
        actorUserId: safeUser.id,
        action: "ADMIN_LOGIN_SUCCESS",
        ipAddress: ip,
        userAgent,
        metaJson: { email },
      },
    }),
  ]);

  const res = NextResponse.json({
    ok: true,
    redirectTo: safeUser.systemRole === "ADMIN" ? "/admin" : "/admin",
  });

  const cookieBase = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
  };

  // Session DB cũ - vẫn giữ để revoke/audit
  res.cookies.set("admin_session", sessionToken, {
    ...cookieBase,
    expires: sessionExpiresAt,
  });

  // JWT cho middleware
  res.cookies.set("admin_access_token", accessToken, {
    ...cookieBase,
    maxAge: 60 * 15,
  });

  res.cookies.set("admin_refresh_token", refreshToken, {
    ...cookieBase,
    maxAge: 60 * 60 * 24 * 7,
  });

  return res;
}
