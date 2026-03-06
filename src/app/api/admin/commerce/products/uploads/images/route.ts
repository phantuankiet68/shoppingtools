import { NextResponse } from "next/server";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const runtime = "nodejs";

function safeExtFromType(type: string) {
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
  if (type === "video/mp4") return ".mp4";
  if (type === "video/webm") return ".webm";
  if (type === "video/ogg") return ".ogv";
  if (type === "video/quicktime") return ".mov";
  return "";
}

export async function POST(req: Request) {
  try {
    await requireAdminAuthUser();

    const form = await req.formData();
    const files = form.getAll("files").filter((x): x is File => x instanceof File);

    if (files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    const now = new Date();
    const folder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    const dir = path.join(process.cwd(), "public", "uploads", folder);
    await fs.mkdir(dir, { recursive: true });

    const urls: string[] = [];

    for (const f of files) {
      const ext = safeExtFromType(f.type);
      if (!ext) {
        return NextResponse.json({ error: `Unsupported file type: ${f.type}` }, { status: 400 });
      }

      const buf = Buffer.from(await f.arrayBuffer());
      const name = `${crypto.randomBytes(16).toString("hex")}${ext}`;
      const full = path.join(dir, name);

      await fs.writeFile(full, buf);
      urls.push(`/uploads/${folder}/${name}`);
    }

    return NextResponse.json({ urls });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
