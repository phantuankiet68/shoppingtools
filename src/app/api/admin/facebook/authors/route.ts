import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        {
          error: "User ID is required",
        },
        {
          status: 400,
        },
      );
    }

    const author = await prisma.facebookAuthor.findFirst({
      where: {
        userId,
      },

      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(author);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================
   CREATE
========================= */
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,

      pageId,

      pageName,

      pageAccessToken,

      autoPublish,
    } = body;

    if (!userId) {
      return NextResponse.json(
        {
          error: "User ID is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!pageId) {
      return NextResponse.json(
        {
          error: "Page ID is required",
        },
        {
          status: 400,
        },
      );
    }

    if (!pageAccessToken) {
      return NextResponse.json(
        {
          error: "Access Token is required",
        },
        {
          status: 400,
        },
      );
    }

    const created = await prisma.facebookAuthor.create({
      data: {
        userId,

        pageId,

        pageName: pageName || null,

        pageAccessToken,

        autoPublish: autoPublish ?? true,
      },
    });

    return NextResponse.json(created);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}

/* =========================
   UPDATE
========================= */
export async function PUT(req: Request) {
  try {
    const body = await req.json();

    const {
      userId,

      pageId,

      pageName,

      pageAccessToken,

      autoPublish,
    } = body;

    const existing = await prisma.facebookAuthor.findFirst({
      where: {
        userId,
      },
    });

    if (!existing) {
      return NextResponse.json(
        {
          error: "Facebook configuration not found",
        },
        {
          status: 404,
        },
      );
    }

    const updated = await prisma.facebookAuthor.update({
      where: {
        id: existing.id,
      },

      data: {
        pageId,

        pageName: pageName || null,

        pageAccessToken,

        autoPublish,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Internal server error",
      },
      {
        status: 500,
      },
    );
  }
}
