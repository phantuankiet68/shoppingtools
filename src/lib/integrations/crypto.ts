// src/lib/crypto.ts
import crypto from "crypto";

const ALG = "aes-256-gcm";

// ENCRYPTION_KEY phải là 32 bytes (base64)
function getKey(): Buffer {
  const raw = process.env.ENCRYPTION_KEY;
  if (!raw) throw new Error("Missing ENCRYPTION_KEY");
  const key = Buffer.from(raw, "base64");
  if (key.length !== 32) throw new Error("ENCRYPTION_KEY must be 32 bytes (base64)");
  return key;
}

export function encryptString(plain: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALG, key, iv);

  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  // payload: iv|tag|ciphertext (base64)
  return Buffer.concat([iv, tag, enc]).toString("base64");
}

export function decryptString(payloadB64: string): string {
  const key = getKey();
  const payload = Buffer.from(payloadB64, "base64");

  const iv = payload.subarray(0, 12);
  const tag = payload.subarray(12, 28);
  const data = payload.subarray(28);

  const decipher = crypto.createDecipheriv(ALG, key, iv);
  decipher.setAuthTag(tag);

  const dec = Buffer.concat([decipher.update(data), decipher.final()]);
  return dec.toString("utf8");
}

export function maskSecret(v?: string | null) {
  if (!v) return "";
  const s = v.trim();
  if (s.length <= 6) return "••••••";
  return s.slice(0, 3) + "••••••••" + s.slice(-3);
}
