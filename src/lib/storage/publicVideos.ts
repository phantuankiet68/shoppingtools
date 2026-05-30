import fs from "fs/promises";

import path from "path";

import crypto from "crypto";

const PUBLIC_DIR = path.join(process.cwd(), "public");

const VIDEO_DIR = path.join(PUBLIC_DIR, "uploads", "tiktok");

export async function ensureVideoDir() {
  await fs.mkdir(VIDEO_DIR, {
    recursive: true,
  });
}

export function makeVideoFileName(fileName: string) {
  const ext = path.extname(fileName);

  const id = crypto.randomUUID();

  return `${Date.now()}-${id}${ext}`;
}

export async function savePublicVideo(fileName: string, buffer: Buffer) {
  await ensureVideoDir();

  const fullPath = path.join(VIDEO_DIR, fileName);

  await fs.writeFile(fullPath, buffer);

  return `/uploads/tiktok/${fileName}`;
}

export async function deletePublicVideo(videoPath: string) {
  try {
    const normalized = videoPath.replace(/^\/+/, "");

    const fullPath = path.join(process.cwd(), "public", normalized);

    await fs.unlink(fullPath);

    return true;
  } catch (error) {
    console.error("DELETE VIDEO ERROR:", error);

    return false;
  }
}
