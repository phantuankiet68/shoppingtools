import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { Prisma, FacebookPostStatus } from "@/generated/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { makeImageFileName, savePublicImage } from "@/lib/storage/publicImages";
export const runtime = "nodejs";

const MAX_BYTES = 10 * 1024 * 1024;

type Params = {
  params: Promise<{
    id: string;
  }>;
};

function isStatus(v: unknown): v is FacebookPostStatus {
  return v === "DRAFT" || v === "SCHEDULED" || v === "PUBLISHED";
}

async function removeImageFile(imageUrl: string | null) {
  try {
    if (!imageUrl) {
      return;
    }

    if (!imageUrl.startsWith("/upload/images/")) {
      return;
    }

    const relativePath = imageUrl.replace(/^\//, "");

    const fullPath = path.join(process.cwd(), "public", relativePath);

    await fs.unlink(fullPath);
  } catch (error) {
    console.error("REMOVE IMAGE FILE ERROR:", error);
  }
}

/* =========================
   GET ONE
========================= */
export async function GET(req: Request, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();

    const { id } = await params;

    const post = await prisma.facebookPost.findFirst({
      where: {
        id,

        userId: admin.id,
      },
    });

    if (!post) {
      return NextResponse.json(
        {
          error: "Post not found",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json(post);
  } catch (error) {
    console.error("GET FACEBOOK POST ERROR:", error);

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
export async function PATCH(req: Request, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();

    const { id } = await params;

    const exists = await prisma.facebookPost.findFirst({
      where: {
        id,

        userId: admin.id,
      },
    });

    if (!exists) {
      return NextResponse.json(
        {
          error: "Post not found",
        },
        {
          status: 404,
        },
      );
    }

    const form = await req.formData();

    const title = String(form.get("title") ?? "").trim();

    const description = String(form.get("description") ?? "").trim();

    const hashtags = String(form.get("hashtags") ?? "").trim();

    const href = String(form.get("href") ?? "").trim();

    const statusValue = form.get("status");

    const publishAtValue = form.get("publishAt");

    const file = form.get("image") as File | null;

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

    let imageUrl = exists.image;

    /* NEW IMAGE */

    if (file && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json(
          {
            error: "Only image files allowed",
          },
          {
            status: 400,
          },
        );
      }

      if (file.size > MAX_BYTES) {
        return NextResponse.json(
          {
            error: "Max image size is 10MB",
          },
          {
            status: 400,
          },
        );
      }

      /* REMOVE OLD IMAGE */
      await removeImageFile(exists.image);

      const buffer = Buffer.from(await file.arrayBuffer());

      const fileName = makeImageFileName(file.type);

      imageUrl = await savePublicImage(admin.id, fileName, buffer);
    }

    const data: Prisma.FacebookPostUpdateInput = {
      title,

      description,

      hashtags: hashtags || null,

      href: href || null,

      image: imageUrl,

      status: isStatus(statusValue) ? statusValue : exists.status,

      publishAt: publishAtValue ? new Date(String(publishAtValue)) : null,
    };

    const updated = await prisma.facebookPost.update({
      where: {
        id,
      },

      data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("PATCH FACEBOOK POST ERROR:", error);

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
export async function DELETE(req: Request, { params }: Params) {
  try {
    const admin = await requireAdminAuthUser();

    const { id } = await params;

    const exists = await prisma.facebookPost.findFirst({
      where: {
        id,

        userId: admin.id,
      },
    });

    if (!exists) {
      return NextResponse.json(
        {
          error: "Post not found",
        },
        {
          status: 404,
        },
      );
    }

    /* REMOVE IMAGE */
    await removeImageFile(exists.image);

    /* DELETE POST */
    await prisma.facebookPost.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE FACEBOOK POST ERROR:", error);

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
