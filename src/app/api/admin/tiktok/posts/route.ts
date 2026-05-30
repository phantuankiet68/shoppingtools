import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

import { Prisma, TikTokPostStatus } from "@/generated/prisma";

import { requireAdminAuthUser } from "@/lib/auth/auth";

export const runtime = "nodejs";

const MAX_VIDEO_BYTES = 500 * 1024 * 1024;

function isStatus(value: unknown): value is TikTokPostStatus {
  return (
    value === "DRAFT" || value === "SCHEDULED" || value === "PUBLISHING" || value === "PUBLISHED" || value === "FAILED"
  );
}

/* =========================
   GET
========================= */
export async function GET(req: Request) {
  try {
    await requireAdminAuthUser();

    const url = new URL(req.url);

    const q = url.searchParams.get("q")?.trim() || "";

    const statusParam = url.searchParams.get("status");

    const status = isStatus(statusParam) ? statusParam : undefined;

    const date = url.searchParams.get("date") || undefined;

    const ci = (value: string) =>
      ({
        contains: value,

        mode: Prisma.QueryMode.insensitive,
      }) as const;

    const where: Prisma.TikTokPostWhereInput = {
      ...(status
        ? {
            status,
          }
        : {}),

      ...(q
        ? {
            OR: [
              {
                title: ci(q),
              },

              {
                description: ci(q),
              },

              {
                hashtags: ci(q),
              },

              {
                seoKeywords: ci(q),
              },
            ],
          }
        : {}),

      ...(date
        ? {
            publishAt: {
              gte: new Date(`${date}T00:00:00.000Z`),

              lte: new Date(`${date}T23:59:59.999Z`),
            },
          }
        : {}),
    };

    const items = await prisma.tikTokPost.findMany({
      where,

      include: {
        tiktokAuthor: true,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      items,

      total: items.length,

      page: 1,

      pageSize: items.length,

      pageCount: 1,
    });
  } catch (error) {
    console.error("GET TIKTOK POSTS ERROR:", error);

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

    const form = await req.formData();

    const tiktokAuthorId = String(form.get("tiktokAuthorId") ?? "").trim();

    const title = String(form.get("title") ?? "").trim();

    const description = String(form.get("description") ?? "").trim();

    const hashtags = String(form.get("hashtags") ?? "").trim();

    const seoKeywords = String(form.get("seoKeywords") ?? "").trim();

    const href = String(form.get("href") ?? "").trim();

    const cta = String(form.get("cta") ?? "").trim();

    const statusValue = form.get("status");

    const publishAtValue = form.get("publishAt");

    const file = form.get("video") as File | null;

    /* VALIDATION */

    if (!title) {
      return NextResponse.json(
        {
          error: {
            title: "Title is required",
          },
        },
        {
          status: 400,
        },
      );
    }

    if (!description) {
      return NextResponse.json(
        {
          error: {
            description: "Description is required",
          },
        },
        {
          status: 400,
        },
      );
    }

    if (!file || file.size <= 0) {
      return NextResponse.json(
        {
          error: {
            video: "Video is required",
          },
        },
        {
          status: 400,
        },
      );
    }

    if (!file.type.startsWith("video/")) {
      return NextResponse.json(
        {
          error: "Only video files allowed",
        },
        {
          status: 400,
        },
      );
    }

    if (file.size > MAX_VIDEO_BYTES) {
      return NextResponse.json(
        {
          error: "Max video size is 500MB",
        },
        {
          status: 400,
        },
      );
    }

    /* TODO:
       Upload video to storage
       Example:
       Cloudinary / S3 / local
    */

    const videoUrl = `/uploads/tiktok/${Date.now()}-${file.name}`;

    const created = await prisma.tikTokPost.create({
      data: {
        user: {
          connect: {
            id: admin.id,
          },
        },

        ...(tiktokAuthorId
          ? {
              tiktokAuthor: {
                connect: {
                  id: tiktokAuthorId,
                },
              },
            }
          : {}),

        title,

        description,

        hashtags: hashtags || null,

        seoKeywords: seoKeywords || null,

        href: href || null,

        cta: cta || null,

        video: videoUrl,

        status: isStatus(statusValue) ? statusValue : publishAtValue ? "SCHEDULED" : "DRAFT",

        publishAt: publishAtValue ? new Date(String(publishAtValue)) : null,
      },
    });

    return NextResponse.json(created, {
      status: 201,
    });
  } catch (error) {
    console.error("POST TIKTOK POST ERROR:", error);

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
