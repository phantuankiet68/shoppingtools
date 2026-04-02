import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/session";

const ACCESS_TOKEN_COOKIE = "admin_access_token";
const SESSION_COOKIE = "admin_session";

function expireCookie(res: NextResponse, name: string) {
  res.cookies.set(name, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function POST(req: NextRequest) {
  const rawSession = req.cookies.get(SESSION_COOKIE)?.value ?? null;

  if (rawSession) {
    const tokenHash = hashToken(rawSession);

    await prisma.userSession
      .updateMany({
        where: {
          refreshTokenHash: tokenHash,
          revokedAt: null,
        },
        data: {
          revokedAt: new Date(),
        },
      })
      .catch(() => {});
  }

  const res = NextResponse.json({ ok: true });

  expireCookie(res, SESSION_COOKIE);
  expireCookie(res, ACCESS_TOKEN_COOKIE);

  return res;
}
