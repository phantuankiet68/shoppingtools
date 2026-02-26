import { NextResponse } from "next/server";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { ensureIntegration } from "@/lib/storage/ensureIntegration";
import { integrationToSettings } from "@/lib/storage/dto";
import { resolveSecretUpdate } from "@/lib/storage/crypto";

function jsonOk(data: any) {
  return NextResponse.json({ ok: true, data });
}
function jsonBad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

function validateSettings(body: any) {
  const publicBaseUrl = String(body.publicBaseUrl || "").trim();
  const rootPrefix = String(body.rootPrefix || "").trim();
  const maxUploadMb = Number(body.maxUploadMb || 0);
  const allowedMime = String(body.allowedMime || "").trim();

  if (!publicBaseUrl) return "Public base URL is required.";
  if (!rootPrefix) return "Root prefix is required.";
  if (!Number.isFinite(maxUploadMb) || maxUploadMb <= 0) return "Max upload must be > 0.";
  if (!allowedMime) return "Allowed MIME types is required.";

  const signedUrlEnabled = Boolean(body.signedUrlEnabled);
  const signedUrlTtlSeconds = Number(body.signedUrlTtlSeconds || 0);
  if (signedUrlEnabled && (!Number.isFinite(signedUrlTtlSeconds) || signedUrlTtlSeconds <= 0)) {
    return "Signed URL TTL must be > 0.";
  }

  const provider = String(body.provider || "").toUpperCase();
  if (!["LOCAL", "S3", "R2"].includes(provider)) return "Invalid provider.";

  if (provider === "LOCAL") {
    const localDir = String(body.localDir || "").trim();
    if (!localDir) return "Local directory is required.";
  } else {
    const bucket = String(body.bucket || "").trim();
    const accessKeyId = String(body.accessKeyId || "").trim();
    const secretAccessKey = String(body.secretAccessKey || "").trim();

    if (!bucket) return "Bucket is required.";
    // accessKey/secretKey có thể gửi dạng masked => resolveSecretUpdate sẽ giữ lại.
    // Nhưng nếu DB đang trống mà UI cũng không gửi gì thì sẽ fail khi test-upload.
    // Ở bước Save mình chỉ validate nhẹ.
    if (provider === "S3") {
      const region = String(body.region || "").trim();
      if (!region) return "Region is required for S3.";
    }
    if (provider === "R2") {
      const endpointUrl = String(body.endpointUrl || "").trim();
      if (!endpointUrl) return "Endpoint URL is required for R2.";
    }

    // Không bắt buộc accessKey/secretKey ở Save để bạn có thể lưu config trước,
    // nhưng bạn có thể bật lại validate cứng nếu muốn.
    void accessKeyId;
    void secretAccessKey;
  }

  return null;
}

export async function GET() {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const integration = await ensureIntegration(userId);
    return jsonOk(integrationToSettings(integration));
  } catch (e) {
    return jsonBad("Unauthorized", 401);
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const current = await ensureIntegration(userId);
    const body = await req.json();

    const err = validateSettings(body);
    if (err) return jsonBad(err, 400);

    const provider = String(body.provider).toUpperCase() as "LOCAL" | "S3" | "R2";

    const updated = await prisma.storageIntegration.update({
      where: { userId },
      data: {
        provider,
        // Save xong vẫn DISCONNECTED, test-upload sẽ set CONNECTED/ERROR
        status: "DISCONNECTED",

        publicBaseUrl: String(body.publicBaseUrl || "").trim(),
        rootPrefix: String(body.rootPrefix || "").trim(),
        privateByDefault: Boolean(body.privateByDefault),
        signedUrlEnabled: Boolean(body.signedUrlEnabled),
        signedUrlTtlSeconds: Number(body.signedUrlTtlSeconds || 0),

        maxUploadMb: Number(body.maxUploadMb || 0),
        allowedMime: String(body.allowedMime || "").trim(),
        enableImageOptimization: Boolean(body.enableImageOptimization),

        localDir: provider === "LOCAL" ? String(body.localDir || "").trim() : null,

        region: provider === "S3" || provider === "R2" ? String(body.region || "").trim() || null : null,
        bucket: provider === "S3" || provider === "R2" ? String(body.bucket || "").trim() || null : null,
        endpointUrl: provider === "R2" ? String(body.endpointUrl || "").trim() || null : null,

        accessKeyIdEnc: provider === "LOCAL" ? null : resolveSecretUpdate(current.accessKeyIdEnc ?? null, body.accessKeyId),
        secretAccessKeyEnc: provider === "LOCAL" ? null : resolveSecretUpdate(current.secretAccessKeyEnc ?? null, body.secretAccessKey),

        cacheControl: String(body.cacheControl || "").trim(),
        purgeEnabled: Boolean(body.purgeEnabled),
      },
    });

    await prisma.storageLog.create({
      data: {
        integrationId: updated.id,
        level: "INFO",
        action: "Save",
        message: "Storage settings saved.",
      },
    });

    return jsonOk(integrationToSettings(updated));
  } catch (e: any) {
    if (String(e?.message || "").includes("Unauthorized")) return jsonBad("Unauthorized", 401);
    return jsonBad("Server error", 500);
  }
}
