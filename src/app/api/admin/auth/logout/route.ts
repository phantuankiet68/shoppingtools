import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  const rawToken = req.cookies.get("admin_session")?.value ?? null;

  if (rawToken) {
    const tokenHash = hashToken(rawToken);

    await prisma.userSession
      .updateMany({
        where: { refreshTokenHash: tokenHash, revokedAt: null },
        data: { revokedAt: new Date() },
      })
      .catch(() => {});
  }

  const res = NextResponse.json({ ok: true });

  // xóa cookie chắc chắn
  res.cookies.set("admin_session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return res;
}
