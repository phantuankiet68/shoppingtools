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

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: { id: folderId, userId: user.id },
        select: { id: true },
      });
      if (!folder) return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const originalName = safeFileName(file.name || "upload.bin");

    const rand = crypto.randomBytes(10).toString("hex");
    const storageKey = `u_${user.id}/${Date.now()}_${rand}_${originalName}`;

    const absPath = path.join(process.cwd(), "public", "upload", "files", storageKey);
    await fs.mkdir(path.dirname(absPath), { recursive: true });
    await fs.writeFile(absPath, bytes);

    const created = await prisma.file.create({
      data: {
        userId: user.id,
        folderId,
        title: originalName,
        fileName: originalName,
        mimeType: file.type || "application/octet-stream",
        size: bytes.length,
        provider: "local",
        key: storageKey,
        url: `/upload/files/${storageKey}`,
      },
      select: {
        id: true,
        title: true,
        fileName: true,
        mimeType: true,
        size: true,
        updatedAt: true,
        folderId: true,
      },
    });

    const publicUrl = `/upload/files/${storageKey}`;

    return NextResponse.json({ file: created, publicUrl }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
