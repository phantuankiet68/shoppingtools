import path from "path";
import crypto from "crypto";
import { mkdir, writeFile } from "fs/promises";

export function publicImagesDir(userId: string) {
  return path.join(process.cwd(), "public", "upload", "images", userId);
}

export function safeExtFromMime(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/jpeg") return "jpg";
  if (mime === "image/webp") return "webp";
  if (mime === "image/gif") return "gif";
  return "bin";
}

export function makeImageFileName(mime: string) {
  const ext = safeExtFromMime(mime);
  const rand = crypto.randomBytes(8).toString("hex");
  return `${Date.now()}_${rand}.${ext}`;
}

export async function savePublicImage(userId: string, fileName: string, buffer: Buffer) {
  const dir = publicImagesDir(userId);
  await mkdir(dir, { recursive: true });

  const fullPath = path.join(dir, fileName);
  await writeFile(fullPath, buffer);
  const publicUrl = `/upload/images/${userId}/${fileName}`;
  return publicUrl;
}
