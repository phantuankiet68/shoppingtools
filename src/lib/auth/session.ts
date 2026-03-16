import crypto from "crypto";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { AUTH_COOKIE_NAME, SESSION_EXPIRES_IN_MS, SESSION_EXPIRES_IN_SECONDS } from "./constants";

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

export function generateSessionToken() {
  return crypto.randomBytes(32).toString("hex");
}

export async function createUserSession(params: {
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) {
  const token = generateSessionToken();
  const refreshTokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_EXPIRES_IN_MS);

  await prisma.userSession.create({
    data: {
      userId: params.userId,
      refreshTokenHash,
      expiresAt,
      ipAddress: params.ipAddress ?? null,
      userAgent: params.userAgent ?? null,
      lastSeenAt: new Date(),
    },
  });

  return {
    token,
    expiresAt,
  };
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
    maxAge: SESSION_EXPIRES_IN_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse) {
  response.cookies.set({
    name: AUTH_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
    maxAge: 0,
  });
}

export async function getCurrentSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;

  if (!token) return null;

  const refreshTokenHash = sha256(token);

  const session = await prisma.userSession.findUnique({
    where: { refreshTokenHash },
    include: {
      user: true,
    },
  });

  if (!session) return null;
  if (session.revokedAt) return null;
  if (session.expiresAt.getTime() <= Date.now()) return null;
  if (session.user.status !== "ACTIVE") return null;

  return session;
}

export async function revokeSessionByToken(token: string) {
  const refreshTokenHash = sha256(token);

  await prisma.userSession.updateMany({
    where: {
      refreshTokenHash,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });
}
