// lib/storage/crypto.ts
import crypto from "crypto";

const ALGO = "aes-256-gcm";

// Convert env key -> 32 bytes key
function getKey(): Buffer {
  const raw = process.env.STORAGE_SECRETS_KEY;
  if (!raw) {
    throw new Error("Missing env STORAGE_SECRETS_KEY");
  }

  // If it's base64 and decodes to 32 bytes, use it directly
  try {
    const b = Buffer.from(raw, "base64");
    if (b.length === 32) return b;
  } catch {
    // ignore
  }

  // Otherwise derive a 32-byte key from string
  return crypto.createHash("sha256").update(raw, "utf8").digest();
}

/**
 * Encrypt plaintext -> string format: v1:<iv_b64>:<cipher_b64>:<tag_b64>
 */
export function encryptSecret(plain: string): string {
  const p = (plain ?? "").trim();
  if (!p) return "";

  const key = getKey();
  const iv = crypto.randomBytes(12); // GCM recommended 12 bytes
  const cipher = crypto.createCipheriv(ALGO, key, iv);

  const enc = Buffer.concat([cipher.update(p, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `v1:${iv.toString("base64")}:${enc.toString("base64")}:${tag.toString("base64")}`;
}

export function decryptSecret(enc: string): string {
  const v = (enc ?? "").trim();
  if (!v) return "";

  // Backward compatibility: if old data isn't in v1 format, just return empty or raw
  if (!v.startsWith("v1:")) return "";

  const [, ivB64, dataB64, tagB64] = v.split(":");
  if (!ivB64 || !dataB64 || !tagB64) return "";

  const key = getKey();
  const iv = Buffer.from(ivB64, "base64");
  const data = Buffer.from(dataB64, "base64");
  const tag = Buffer.from(tagB64, "base64");

  const decipher = crypto.createDecipheriv(ALGO, key, iv);
  decipher.setAuthTag(tag);

  const plain = Buffer.concat([decipher.update(data), decipher.final()]);
  return plain.toString("utf8");
}

/**
 * Mask for UI display (never show full secret)
 */
export function maskSecret(s: string): string {
  const v = (s ?? "").trim();
  if (!v) return "";
  if (v.length <= 8) return "•".repeat(v.length);
  return `${v.slice(0, 4)}••••••••••${v.slice(-4)}`;
}

/**
 * Utility: when UI sends "masked" value or empty, keep current secret.
 * - if incoming is empty => keep existing
 * - if incoming contains "•" (masked) => keep existing
 * - else => treat as new plaintext
 */
export function resolveSecretUpdate(existingEnc: string | null, incoming: unknown): string | null {
  const incomingStr = String(incoming ?? "").trim();
  if (!incomingStr) return existingEnc ?? null;
  if (incomingStr.includes("•")) return existingEnc ?? null;
  return encryptSecret(incomingStr);
}
