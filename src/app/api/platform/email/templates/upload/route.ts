import { NextResponse } from "next/server";

import fs from "fs/promises";
import path from "path";

import sharp from "sharp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          success: false,
          message: "File is required",
        },
        { status: 400 },
      );
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid image type",
        },
        { status: 400 },
      );
    }

    const maxSize = 10 * 1024 * 1024;

    if (file.size > maxSize) {
      return NextResponse.json(
        {
          success: false,
          message: "Image too large",
        },
        { status: 400 },
      );
    }

    const now = new Date();

    const year = String(now.getFullYear());

    const month = String(now.getMonth() + 1).padStart(2, "0");

    const day = String(now.getDate()).padStart(2, "0");

    const uploadDir = path.join(process.cwd(), "public", "uploads", "platform", year, month, day);

    await fs.mkdir(uploadDir, {
      recursive: true,
    });

    const buffer = Buffer.from(await file.arrayBuffer());

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.webp`;

    const outputPath = path.join(uploadDir, fileName);

    await sharp(buffer)
      .resize({
        width: 1200,
        withoutEnlargement: true,
      })
      .webp({
        quality: 80,
      })
      .toFile(outputPath);

    const imageUrl = `/uploads/platform/${year}/${month}/${day}/${fileName}`;

    return NextResponse.json({
      success: true,
      url: imageUrl,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Upload failed",
      },
      {
        status: 500,
      },
    );
  }
}
