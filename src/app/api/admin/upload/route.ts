import { NextResponse } from "next/server";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const runtime = "nodejs";

function safeImageExtFromType(type: string) {
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  if (type === "image/svg+xml") return ".svg";
  return "";
}

function safeBaseName(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

export async function POST(req: Request) {
  try {
    await requireAdminAuthUser();

    const form = await req.formData();
    const file = form.get("file");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const ext = safeImageExtFromType(file.type);
    if (!ext) {
      return NextResponse.json({ error: `Unsupported image type: ${file.type}` }, { status: 400 });
    }

    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json({ error: `${file.name} is too large. Max size is 5MB` }, { status: 400 });
    }

    const dir = path.join(process.cwd(), "public", "assets", "templates");
    await fs.mkdir(dir, { recursive: true });

    const buf = Buffer.from(await file.arrayBuffer());

    const originalName = typeof file.name === "string" && file.name.trim() ? file.name.trim() : "templates";
    const baseName = safeBaseName(originalName.replace(/\.[^.]+$/, "")) || "templates";
    const fileName = `${baseName}-${crypto.randomBytes(8).toString("hex")}${ext}`;
    const fullPath = path.join(dir, fileName);

    await fs.writeFile(fullPath, buf);

    return NextResponse.json({
      success: true,
      url: `/assets/templates/${fileName}`,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
