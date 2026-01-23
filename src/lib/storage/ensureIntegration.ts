import { prisma } from "@/lib/prisma";

export async function ensureIntegration(userId: string) {
  const existing = await prisma.storageIntegration.findUnique({ where: { userId } });
  if (existing) return existing;

  return prisma.storageIntegration.create({
    data: {
      userId,
      provider: "R2",
      status: "DISCONNECTED",

      publicBaseUrl: "https://cdn.yourdomain.com",
      rootPrefix: "uploads/",
      privateByDefault: true,
      signedUrlEnabled: true,
      signedUrlTtlSeconds: 900,

      maxUploadMb: 50,
      allowedMime: "image/*,application/pdf",
      enableImageOptimization: true,

      localDir: "./public/uploads",

      region: "auto",
      bucket: "my-app-bucket",
      endpointUrl: "https://<accountid>.r2.cloudflarestorage.com",

      cacheControl: "public,max-age=31536000,immutable",
      purgeEnabled: false,
    },
  });
}
