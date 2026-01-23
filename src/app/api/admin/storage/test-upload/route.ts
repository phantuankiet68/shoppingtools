import { NextResponse } from "next/server";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { ensureIntegration } from "@/lib/storage/ensureIntegration";

function jsonOk(data: any) {
  return NextResponse.json({ ok: true, data });
}
function jsonBad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

function validateForTest(i: any) {
  if (!String(i.publicBaseUrl || "").trim()) return "Public base URL is required.";
  if (!String(i.rootPrefix || "").trim()) return "Root prefix is required.";
  if (i.signedUrlEnabled && (!i.signedUrlTtlSeconds || i.signedUrlTtlSeconds <= 0)) return "Signed URL TTL must be > 0.";
  if (i.maxUploadMb <= 0) return "Max upload must be > 0.";
  if (!String(i.allowedMime || "").trim()) return "Allowed MIME types is required.";

  if (i.provider === "LOCAL") {
    if (!String(i.localDir || "").trim()) return "Local directory is required.";
    return null;
  }

  // S3/R2
  if (!String(i.bucket || "").trim()) return "Bucket is required.";
  if (!String(i.accessKeyIdEnc || "").trim()) return "Access key is required.";
  if (!String(i.secretAccessKeyEnc || "").trim()) return "Secret key is required.";
  if (i.provider === "S3" && !String(i.region || "").trim()) return "Region is required for S3.";
  if (i.provider === "R2" && !String(i.endpointUrl || "").trim()) return "Endpoint URL is required for R2.";

  return null;
}

export async function POST() {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const integration = await ensureIntegration(userId);

    const err = validateForTest(integration);
    if (err) {
      await prisma.storageIntegration.update({
        where: { userId },
        data: { status: "ERROR", lastError: err, lastTestedAt: new Date() },
      });
      await prisma.storageLog.create({
        data: {
          integrationId: integration.id,
          level: "ERROR",
          action: "Test upload",
          message: err,
        },
      });
      return jsonBad(err, 400);
    }

    // Mock: coi như test ok
    const now = new Date();
    const prefix = (integration.rootPrefix || "uploads/").replace(/\/?$/, "/");
    const key = `${prefix}tests/test_${Date.now()}.txt`;

    await prisma.storageIntegration.update({
      where: { userId },
      data: { status: "CONNECTED", lastError: null, lastTestedAt: now },
    });

    // Tạo object record mock để Browser thấy ngay
    await prisma.storageObject.create({
      data: {
        integrationId: integration.id,
        provider: integration.provider,
        bucket: integration.bucket ?? "local",
        key,
        sizeBytes: BigInt(2048),
        mimeType: "text/plain",
        visibility: integration.privateByDefault ? "PRIVATE" : "PUBLIC",
        lastModifiedAt: now,
      },
    });

    await prisma.storageLog.create({
      data: {
        integrationId: integration.id,
        level: "INFO",
        action: "Test upload",
        message: `Upload OK (mock): ${key}`,
        meta: { key },
      },
    });

    return jsonOk({ status: "CONNECTED", key });
  } catch {
    return jsonBad("Unauthorized", 401);
  }
}
