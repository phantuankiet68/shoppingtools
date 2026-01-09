import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";

export const runtime = "nodejs";

function safeFileName(name: string) {
  return name.replace(/[^\p{L}\p{N}\-_. ]/gu, "_").slice(0, 180);
}

export async function POST(req: Request) {
  try {
    const user = await requireAdminAuthUser();
    const form = await req.formData();

    const folderIdRaw = form.get("folderId");
    const folderId = typeof folderIdRaw === "string" && folderIdRaw ? folderIdRaw : null;

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file is required" }, { status: 400 });
    }

    // check folder belongs to user
    if (folderId) {
      const folder = await prisma.fileFolder.findFirst({
        where: { id: folderId, ownerId: user.id },
        select: { id: true },
      });
      if (!folder) return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const originalName = safeFileName(file.name || "upload.bin");

    const rand = crypto.randomBytes(10).toString("hex");
    const storageKey = `u_${user.id}/${Date.now()}_${rand}_${originalName}`;

    // ✅ public path per your request:
    const absPath = path.join(process.cwd(), "public", "upload", "files", storageKey);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, bytes);

    const created = await prisma.storedFile.create({
      data: {
        ownerId: user.id,
        folderId,
        name: originalName,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: bytes.length,
        storageKey,
      },
      select: { id: true, name: true, mimeType: true, sizeBytes: true, updatedAt: true, folderId: true },
    });

    // public url (note: this is public!)
    const publicUrl = `/upload/files/${storageKey}`;

    return NextResponse.json({ file: created, publicUrl }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
