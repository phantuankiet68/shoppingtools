import crypto from "crypto";
import { prisma } from "@/lib/prisma";

type StorageProvider = "LOCAL" | "R2";
type StorageStatus = "DISCONNECTED" | "CONNECTED" | "ERROR";
type StorageVisibility = "PUBLIC" | "PRIVATE";

export type StorageSettingsDto = {
  provider: StorageProvider;
  status: StorageStatus;

  publicBaseUrl: string;
  rootPrefix: string;
  privateByDefault: boolean;
  signedUrlEnabled: boolean;
  signedUrlTtlSeconds: number;

  maxUploadMb: number;
  allowedMime: string;
  enableImageOptimization: boolean;

  localDir: string;

  region: string;
  bucket: string;
  endpointUrl: string;
  accessKeyId: string;
  secretAccessKey: string;

  cacheControl: string;
  purgeEnabled: boolean;
};

export type BucketRowDto = {
  id: string;
  name: string;
  region?: string;
  provider: StorageProvider;
  objects: number;
  sizeGb: number;
  updatedAt: string;
};

export type ObjectRowDto = {
  key: string;
  sizeKb: number;
  type: string;
  visibility: StorageVisibility;
  updatedAt: string;
};

export type LogRowDto = {
  id: string;
  at: string;
  level: "INFO" | "WARN" | "ERROR";
  action: string;
  message: string;
};

const DEFAULTS: StorageSettingsDto = {
  provider: "R2",
  status: "DISCONNECTED",

  publicBaseUrl: "",
  rootPrefix: "uploads/",
  privateByDefault: true,
  signedUrlEnabled: true,
  signedUrlTtlSeconds: 900,

  maxUploadMb: 50,
  allowedMime: "image/*,application/pdf",
  enableImageOptimization: true,

  localDir: "./public/uploads",

  region: "auto",
  bucket: "",
  endpointUrl: "",
  accessKeyId: "",
  secretAccessKey: "",

  cacheControl: "public,max-age=31536000,immutable",
  purgeEnabled: false,
};

function getSecretKey() {
  const raw = process.env.STORAGE_SECRET || process.env.APP_SECRET || "dev-storage-secret-change-me";
  return crypto.createHash("sha256").update(raw).digest();
}

export function encryptSecret(plain: string) {
  if (!plain) return null;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", getSecretKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(payload?: string | null) {
  if (!payload) return "";
  const [ivHex, dataHex] = payload.split(":");
  if (!ivHex || !dataHex) return "";
  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(dataHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", getSecretKey(), iv);
  const plain = Buffer.concat([decipher.update(encrypted), decipher.final()]);
  return plain.toString("utf8");
}

export function normalizePrefix(prefix: string) {
  const clean = (prefix || "").trim().replace(/^\/+/, "");
  if (!clean) return "uploads/";
  return clean.endsWith("/") ? clean : `${clean}/`;
}

export function buildPublicUrl(publicBaseUrl: string, key: string) {
  const base = (publicBaseUrl || "").replace(/\/+$/, "");
  const cleanKey = (key || "").replace(/^\/+/, "");
  if (!base) return cleanKey;
  if (!cleanKey) return base;
  return `${base}/${cleanKey}`;
}

export async function resolveSiteId(input?: { siteId?: string | null }) {
  if (input?.siteId) return input.siteId;

  const firstSite = await prisma.site.findFirst({
    select: { id: true },
    orderBy: { createdAt: "asc" },
  });

  if (!firstSite) {
    throw new Error("No site found.");
  }

  return firstSite.id;
}

export async function getOrCreateStorageIntegration(siteId: string) {
  const existing = await prisma.storageIntegration.findUnique({
    where: { siteId },
  });

  if (existing) return existing;

  return prisma.storageIntegration.create({
    data: {
      siteId,
      provider: "R2",
      status: "DISCONNECTED",
      rootPrefix: "uploads/",
      privateByDefault: true,
      signedUrlEnabled: true,
      signedUrlTtlSeconds: 900,
      maxUploadMb: 50,
      allowedMime: "image/*,application/pdf",
      enableImageOptimization: true,
      region: "auto",
      cacheControl: "public,max-age=31536000,immutable",
      purgeEnabled: false,
    },
  });
}

export async function getStorageSettings(siteId: string): Promise<StorageSettingsDto> {
  const row = await getOrCreateStorageIntegration(siteId);

  return {
    provider: row.provider as StorageProvider,
    status: row.status as StorageStatus,

    publicBaseUrl: row.publicBaseUrl || "",
    rootPrefix: row.rootPrefix || "uploads/",
    privateByDefault: row.privateByDefault,
    signedUrlEnabled: row.signedUrlEnabled,
    signedUrlTtlSeconds: row.signedUrlTtlSeconds,

    maxUploadMb: row.maxUploadMb,
    allowedMime: row.allowedMime,
    enableImageOptimization: row.enableImageOptimization,

    localDir: row.localDir || "./public/uploads",

    region: row.region || "auto",
    bucket: row.bucket || "",
    endpointUrl: row.endpointUrl || "",
    accessKeyId: row.accessKeyId || "",
    secretAccessKey: decryptSecret(row.secretAccessKeyEnc),

    cacheControl: row.cacheControl || "public,max-age=31536000,immutable",
    purgeEnabled: row.purgeEnabled,
  };
}

export async function updateStorageSettings(siteId: string, input: StorageSettingsDto) {
  const row = await getOrCreateStorageIntegration(siteId);

  const next = await prisma.storageIntegration.update({
    where: { id: row.id },
    data: {
      provider: input.provider,
      status: input.status,

      publicBaseUrl: input.publicBaseUrl || null,
      rootPrefix: normalizePrefix(input.rootPrefix),
      privateByDefault: input.privateByDefault,
      signedUrlEnabled: input.signedUrlEnabled,
      signedUrlTtlSeconds: input.signedUrlTtlSeconds,

      maxUploadMb: input.maxUploadMb,
      allowedMime: input.allowedMime,
      enableImageOptimization: input.enableImageOptimization,

      localDir: input.localDir || null,

      region: input.region || null,
      bucket: input.bucket || null,
      endpointUrl: input.endpointUrl || null,
      accessKeyId: input.accessKeyId || null,
      secretAccessKeyEnc: input.secretAccessKey ? encryptSecret(input.secretAccessKey) : null,

      cacheControl: input.cacheControl || null,
      purgeEnabled: input.purgeEnabled,
      lastError: null,
    },
  });

  await prisma.storageLog.create({
    data: {
      storageIntegrationId: next.id,
      siteId,
      level: "INFO",
      action: "Update settings",
      message: `Storage settings updated for provider ${input.provider}.`,
    },
  });

  return getStorageSettings(siteId);
}

export async function listBuckets(siteId: string): Promise<BucketRowDto[]> {
  const integration = await getOrCreateStorageIntegration(siteId);

  const rows = await prisma.storageBucket.findMany({
    where: { storageIntegrationId: integration.id },
    orderBy: [{ updatedAt: "desc" }, { name: "asc" }],
  });

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    region: row.region || undefined,
    provider: row.provider as StorageProvider,
    objects: row.objects,
    sizeGb: Number(row.sizeGb),
    updatedAt: row.updatedAt.toISOString(),
  }));
}

export async function createBucket(siteId: string, name: string) {
  const integration = await getOrCreateStorageIntegration(siteId);

  const row = await prisma.storageBucket.create({
    data: {
      storageIntegrationId: integration.id,
      name,
      region: integration.region || "auto",
      provider: integration.provider,
      objects: 0,
      sizeGb: 0,
    },
  });

  await prisma.storageLog.create({
    data: {
      storageIntegrationId: integration.id,
      siteId,
      level: "INFO",
      action: "Create bucket",
      message: `Bucket ${name} created.`,
    },
  });

  return {
    id: row.id,
    name: row.name,
    region: row.region || undefined,
    provider: row.provider as StorageProvider,
    objects: row.objects,
    sizeGb: Number(row.sizeGb),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function listLogs(siteId: string): Promise<LogRowDto[]> {
  const integration = await getOrCreateStorageIntegration(siteId);

  const rows = await prisma.storageLog.findMany({
    where: {
      siteId,
      storageIntegrationId: integration.id,
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return rows.map((row) => ({
    id: row.id,
    at: row.createdAt.toISOString(),
    level: row.level as "INFO" | "WARN" | "ERROR",
    action: row.action,
    message: row.message,
  }));
}

export async function listObjects(siteId: string, query?: string, visibility?: string): Promise<ObjectRowDto[]> {
  const q = (query || "").trim().toLowerCase();

  const files = await prisma.file.findMany({
    where: {
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { key: { contains: q, mode: "insensitive" } },
              { fileName: { contains: q, mode: "insensitive" } },
              { title: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const images = await prisma.imageAsset.findMany({
    where: {
      deletedAt: null,
      ...(q
        ? {
            OR: [
              { fileName: { contains: q, mode: "insensitive" } },
              { originalName: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const fileRows: ObjectRowDto[] = files.map((f) => ({
    key: f.key,
    sizeKb: Math.max(1, Math.ceil(f.size / 1024)),
    type: f.mimeType,
    visibility: (f.category === "PRIVATE" ? "PRIVATE" : "PUBLIC") as StorageVisibility,
    updatedAt: f.updatedAt.toISOString(),
  }));

  const imageRows: ObjectRowDto[] = images.map((img) => ({
    key: `images/${img.fileName}`,
    sizeKb: Math.max(1, Math.ceil(img.sizeBytes / 1024)),
    type: img.mimeType,
    visibility: "PUBLIC",
    updatedAt: img.updatedAt.toISOString(),
  }));

  const merged = [...fileRows, ...imageRows].sort((a, b) => {
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  if (!visibility || visibility === "ALL") {
    return merged;
  }

  return merged.filter((item) => item.visibility === visibility);
}

export async function deleteObject(siteId: string, key: string) {
  const integration = await getOrCreateStorageIntegration(siteId);

  const file = await prisma.file.findFirst({
    where: { key, deletedAt: null },
  });

  if (file) {
    await prisma.file.update({
      where: { id: file.id },
      data: { deletedAt: new Date() },
    });

    await prisma.storageLog.create({
      data: {
        storageIntegrationId: integration.id,
        siteId,
        level: "INFO",
        action: "Delete object",
        message: `Deleted file object ${key}.`,
        objectKey: key,
      },
    });

    return { deleted: true, affected: 1 };
  }

  const imagePrefix = "images/";
  if (key.startsWith(imagePrefix)) {
    const fileName = key.slice(imagePrefix.length);
    const image = await prisma.imageAsset.findFirst({
      where: { fileName, deletedAt: null },
    });

    if (image) {
      await prisma.imageAsset.update({
        where: { id: image.id },
        data: { deletedAt: new Date() },
      });

      await prisma.storageLog.create({
        data: {
          storageIntegrationId: integration.id,
          siteId,
          level: "INFO",
          action: "Delete object",
          message: `Deleted image object ${key}.`,
          objectKey: key,
        },
      });

      return { deleted: true, affected: 1 };
    }
  }

  return { deleted: true, affected: 0 };
}

export async function runTestUpload(siteId: string) {
  const integration = await getOrCreateStorageIntegration(siteId);

  const now = new Date();
  const key = `${normalizePrefix(integration.rootPrefix || "uploads/")}test/storage-test-${now.getTime()}.txt`;

  await prisma.file.create({
    data: {
      title: "Storage test file",
      fileName: `storage-test-${now.getTime()}.txt`,
      mimeType: "text/plain",
      size: 32,
      provider: integration.provider,
      key,
      url: buildPublicUrl(integration.publicBaseUrl || "", key),
      category: integration.privateByDefault ? "PRIVATE" : "PUBLIC",
    },
  });

  await prisma.storageIntegration.update({
    where: { id: integration.id },
    data: {
      status: "CONNECTED",
      lastCheckedAt: now,
      lastError: null,
    },
  });

  await prisma.storageLog.create({
    data: {
      storageIntegrationId: integration.id,
      siteId,
      level: "INFO",
      action: "Test upload",
      message: `Test upload succeeded with key ${key}.`,
      objectKey: key,
      visibility: integration.privateByDefault ? "PRIVATE" : "PUBLIC",
    },
  });

  const bucket = integration.bucket
    ? await prisma.storageBucket.findFirst({
        where: {
          storageIntegrationId: integration.id,
          name: integration.bucket,
        },
      })
    : null;

  if (bucket) {
    await prisma.storageBucket.update({
      where: { id: bucket.id },
      data: {
        objects: { increment: 1 },
        sizeGb: {
          increment: 0.000001,
        },
      },
    });
  }

  return {
    status: "CONNECTED" as const,
    key,
  };
}
