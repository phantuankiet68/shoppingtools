import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { requireAdminAuthUser } from "@/lib/auth/auth";

export const runtime = "nodejs";

/* =========================
   GET
========================= */

export async function GET() {
  try {
    const admin = await requireAdminAuthUser();

    const item = await prisma.tikTokAuthor.findFirst({
      where: {
        userId: admin.id,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      item,
    });
  } catch (error) {
    console.error("GET TIKTOK AUTHOR ERROR:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================
   POST
========================= */

export async function POST(req: Request) {
  try {
    const admin = await requireAdminAuthUser();

    const body = await req.json();

    const existing = await prisma.tikTokAuthor.findFirst({
      where: {
        userId: admin.id,
      },
    });

    if (existing) {
      const updated = await prisma.tikTokAuthor.update({
        where: {
          id: existing.id,
        },

        data: {
          tiktokOpenId: body.tiktokOpenId,

          username: body.username,

          displayName: body.displayName,

          avatar: body.avatar,

          accessToken: body.accessToken,

          refreshToken: body.refreshToken,

          autoPublish: body.autoPublish,
        },
      });

      return NextResponse.json(updated);
    }

    const created = await prisma.tikTokAuthor.create({
      data: {
        userId: admin.id,

        tiktokOpenId: body.tiktokOpenId,

        username: body.username,

        displayName: body.displayName,

        avatar: body.avatar,

        accessToken: body.accessToken,

        refreshToken: body.refreshToken,

        autoPublish: body.autoPublish,
      },
    });

    return NextResponse.json(created, {
      status: 201,
    });
  } catch (error) {
    console.error("CREATE TIKTOK AUTHOR ERROR:", error);

    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      },
    );
  }
}
