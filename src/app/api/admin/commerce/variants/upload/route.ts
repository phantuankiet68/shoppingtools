import { NextResponse } from "next/server";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const runtime = "nodejs";

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]);

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

function safeImageExtFromType(type: string): string {
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  if (type === "image/svg+xml") return ".svg";
  return "";
}

export async function POST(req: Request) {
  try {
    await requireAdminAuthUser();

    const form = await req.formData();
    const file = form.get("file");
    const variantId = String(form.get("variantId") ?? "").trim();

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }

    if (!variantId) {
      return NextResponse.json({ error: "variantId is required" }, { status: 400 });
    }

    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return NextResponse.json({ error: `Unsupported image type: ${file.type}` }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: "File is empty" }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large. Max size is ${MAX_FILE_SIZE_BYTES / (1024 * 1024)}MB` },
        { status: 400 },
      );
    }

    const ext = safeImageExtFromType(file.type);
    if (!ext) {
      return NextResponse.json({ error: `Cannot determine file extension for type: ${file.type}` }, { status: 400 });
    }

    const variant = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
        deletedAt: null,
      },
      select: {
        id: true,
        productId: true,
        siteId: true,
        sku: true,
      },
    });

    if (!variant) {
      return NextResponse.json({ error: "Variant not found" }, { status: 404 });
    }

    const now = new Date();
    const folder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const dir = path.join(process.cwd(), "public", "uploads", "commerce", "variants", folder);

    await fs.mkdir(dir, { recursive: true });

    const buffer = Buffer.from(await file.arrayBuffer());
    const filename = `${crypto.randomBytes(16).toString("hex")}${ext}`;
    const fullPath = path.join(dir, filename);

    await fs.writeFile(fullPath, buffer);

    const url = `/uploads/commerce/variants/${folder}/${filename}`;

    return NextResponse.json({
      ok: true,
      url,
      imageUrl: url,
      variantId: variant.id,
      productId: variant.productId,
      siteId: variant.siteId,
      filename,
      mimeType: file.type,
      size: file.size,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
