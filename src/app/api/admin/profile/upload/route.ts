import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

import fs from "fs/promises";
import path from "path";
import sharp from "sharp";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const VALID_TYPES = ["avatar", "logo", "banner", "cover"] as const;

type UploadType = (typeof VALID_TYPES)[number];

export async function POST(req: Request) {
  try {
    const authUser = await requireAdminAuthUser();

    const formData = await req.formData();

    const file = formData.get("file");

    const type = formData.get("type");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: "File is required",
        },
        {
          status: 400,
        },
      );
    }

    if (typeof type !== "string" || !VALID_TYPES.includes(type as UploadType)) {
      return NextResponse.json(
        {
          error: "Invalid upload type",
        },
        {
          status: 400,
        },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        {
          error: "Only image files are allowed",
        },
        {
          status: 400,
        },
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        {
          error: "File too large",
        },
        {
          status: 400,
        },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    let width = 512;
    let height = 512;

    switch (type) {
      case "avatar":
      case "logo":
        width = 512;
        height = 512;
        break;

      case "banner":
        width = 1600;
        height = 500;
        break;

      case "cover":
        width = 1920;
        height = 600;
        break;
    }

    const optimizedImage = await sharp(buffer)
      .rotate()
      .resize(width, height, {
        fit: "cover",
      })
      .webp({
        quality: 85,
      })
      .toBuffer();

    const uploadDir = path.join(process.cwd(), "public", "uploads", type);

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    const fileName = `${authUser.id}-${Date.now()}.webp`;

    const filePath = path.join(uploadDir, fileName);

    await fs.writeFile(filePath, optimizedImage);

    const imageUrl = `/uploads/${type}/${fileName}`;

    const updateData = {
      [type]: imageUrl,
    };

    await prisma.profile.upsert({
      where: {
        userId: authUser.id,
      },

      create: {
        userId: authUser.id,
        ...updateData,
      },

      update: updateData,
    });

    return NextResponse.json({
      success: true,
      type,
      image: imageUrl,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Upload failed",
      },
      {
        status: 500,
      },
    );
  }
}
