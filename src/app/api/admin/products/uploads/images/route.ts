import { NextResponse } from "next/server";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const runtime = "nodejs"; // cần node runtime để ghi file

function safeExtFromType(type: string) {
  if (type === "image/jpeg") return ".jpg";
  if (type === "image/png") return ".png";
  if (type === "image/webp") return ".webp";
  if (type === "image/gif") return ".gif";
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

    // lưu vào /public/uploads/yyyy-mm
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
      const name = crypto.randomBytes(16).toString("hex") + ext;
      const full = path.join(dir, name);

      await fs.writeFile(full, buf);

      // URL public để dùng trong <img src="">
      urls.push(`/uploads/${folder}/${name}`);
    }

    return NextResponse.json({ urls });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Upload failed" }, { status: 500 });
  }
}
