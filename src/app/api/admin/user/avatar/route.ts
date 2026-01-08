import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth"; // sửa path auth của bạn
import path from "path";
import fs from "fs/promises";
import sharp from "sharp";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 100 * 1024 * 1024; // 100MB (thô)
const OUT_SIZE = 512; // avatar size
const WEBP_QUALITY = 80;

export async function POST(req: Request) {
  try {
    const user = await requireAdminAuthUser();

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "File too large (max 100MB)" }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    const optimized = await sharp(inputBuffer).rotate().resize(OUT_SIZE, OUT_SIZE, { fit: "cover" }).webp({ quality: WEBP_QUALITY }).toBuffer();

    const dir = path.join(process.cwd(), "public", "uploads", "avatars");
    await fs.mkdir(dir, { recursive: true });

    const filename = `${user.id}-${Date.now()}.webp`;
    const filepath = path.join(dir, filename);
    await fs.writeFile(filepath, optimized);

    const imageUrl = `/uploads/avatars/${filename}`;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { image: imageUrl },
      select: { image: true },
    });

    return NextResponse.json({ image: updated.image });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
