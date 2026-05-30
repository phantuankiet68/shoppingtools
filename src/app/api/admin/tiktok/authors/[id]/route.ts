import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { requireAdminAuthUser } from "@/lib/auth/auth";

export const runtime = "nodejs";

/* =========================
   PATCH
========================= */

export async function PATCH(
  req: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    await requireAdminAuthUser();

    const { id } = await context.params;

    const body = await req.json();

    const updated = await prisma.tikTokAuthor.update({
      where: {
        id,
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
  } catch (error) {
    console.error("UPDATE TIKTOK AUTHOR ERROR:", error);

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
   DELETE
========================= */

export async function DELETE(
  _: NextRequest,
  context: {
    params: Promise<{
      id: string;
    }>;
  },
) {
  try {
    await requireAdminAuthUser();

    const { id } = await context.params;

    await prisma.tikTokAuthor.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE TIKTOK AUTHOR ERROR:", error);

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
