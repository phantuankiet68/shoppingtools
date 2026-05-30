import { NextRequest, NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { Prisma, TikTokPostStatus } from "@/generated/prisma";

import { requireAdminAuthUser } from "@/lib/auth/auth";

import { deletePublicVideo } from "@/lib/storage/publicVideos";

export const runtime = "nodejs";

function isStatus(value: unknown): value is TikTokPostStatus {
  return (
    value === "DRAFT" || value === "SCHEDULED" || value === "PUBLISHING" || value === "PUBLISHED" || value === "FAILED"
  );
}

/* =========================
   GET DETAIL
========================= */
export async function GET(
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

    const item = await prisma.tikTokPost.findUnique({
      where: {
        id,
      },

      include: {
        tiktokAuthor: true,
      },
    });

    if (!item) {
      return NextResponse.json(
        {
          error: "Post not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("GET TIKTOK POST ERROR:", error);

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

    const status = isStatus(body.status) ? body.status : undefined;

    const updated = await prisma.tikTokPost.update({
      where: {
        id,
      },

      data: {
        ...(body.title !== undefined
          ? {
              title: body.title,
            }
          : {}),

        ...(body.description !== undefined
          ? {
              description: body.description,
            }
          : {}),

        ...(body.hashtags !== undefined
          ? {
              hashtags: body.hashtags,
            }
          : {}),

        ...(body.seoKeywords !== undefined
          ? {
              seoKeywords: body.seoKeywords,
            }
          : {}),

        ...(body.href !== undefined
          ? {
              href: body.href,
            }
          : {}),

        ...(body.cta !== undefined
          ? {
              cta: body.cta,
            }
          : {}),

        ...(status
          ? {
              status,
            }
          : {}),

        ...(body.publishAt !== undefined
          ? {
              publishAt: body.publishAt ? new Date(body.publishAt) : null,
            }
          : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH TIKTOK POST ERROR:", error);

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

    const item = await prisma.tikTokPost.findUnique({
      where: {
        id,
      },
    });

    if (!item) {
      return NextResponse.json(
        {
          error: "Post not found",
        },
        {
          status: 404,
        },
      );
    }

    if (item.video && !item.videoDeletedAt) {
      await deletePublicVideo(item.video);
    }

    await prisma.tikTokPost.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE TIKTOK POST ERROR:", error);

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
