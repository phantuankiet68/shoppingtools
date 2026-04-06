import crypto from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // recommended for GCM
const AUTH_TAG_LENGTH = 16;

function getSecretKey(): Buffer {
  const secret = process.env.SYSTEM_CREDENTIAL_SECRET;

  if (!secret) {
    throw new Error('Missing SYSTEM_CREDENTIAL_SECRET');
  }

  // normalize any-length secret into 32 bytes for AES-256
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptSystemCredential(plainText: string): string {
  const key = getSecretKey();
  const iv = crypto.randomBytes(IV_LENGTH);

  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  const encrypted = Buffer.concat([
    cipher.update(plainText, 'utf8'),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // version.iv.tag.ciphertext
  return [
    'v1',
    iv.toString('base64'),
    authTag.toString('base64'),
    encrypted.toString('base64'),
  ].join('.');
}

export function decryptSystemCredential(payload: string): string {
  const [version, ivB64, tagB64, encryptedB64] = payload.split('.');

  if (version !== 'v1' || !ivB64 || !tagB64 || !encryptedB64) {
    throw new Error('Invalid encrypted payload format');
  }

  const key = getSecretKey();
  const iv = Buffer.from(ivB64, 'base64');
  const authTag = Buffer.from(tagB64, 'base64');
  const encrypted = Buffer.from(encryptedB64, 'base64');

  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH,
  });

  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ]);

  return decrypted.toString('utf8');
}

export function maskSecret(value?: string | null): string {
  if (!value) return '';

  if (value.length <= 8) {
    return '••••••••';
  }

  return `${value.slice(0, 4)}••••••••${value.slice(-4)}`;
}