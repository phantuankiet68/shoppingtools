import { NextResponse } from "next/server";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { ensureIntegration } from "@/lib/storage/ensureIntegration";
import { bucketToRow } from "@/lib/storage/dto";

function jsonOk(data: any) {
  return NextResponse.json({ ok: true, data });
}
function jsonBad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function GET() {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const integration = await ensureIntegration(userId);

    const buckets = await prisma.storageBucket.findMany({
      where: { integrationId: integration.id },
      orderBy: { updatedAt: "desc" },
      take: 100,
    });

    return jsonOk(buckets.map(bucketToRow));
  } catch {
    return jsonBad("Unauthorized", 401);
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const integration = await ensureIntegration(userId);
    const body = await req.json();

    const name = String(body.name || "").trim();
    if (!name) return jsonBad("Bucket name is required.", 400);

    const created = await prisma.storageBucket.create({
      data: {
        integrationId: integration.id,
        provider: integration.provider,
        name,
        region: integration.region,
        endpointUrl: integration.endpointUrl,
        objectsCount: 0,
        sizeBytes: BigInt(0),
      },
    });

    await prisma.storageLog.create({
      data: {
        integrationId: integration.id,
        level: "INFO",
        action: "Add bucket",
        message: `Bucket ${name} added (mock).`,
        meta: { name },
      },
    });

    return jsonOk(bucketToRow(created));
  } catch (e: any) {
    // Unique constraint bucket name (nếu bạn set @@unique)
    if (String(e?.code) === "P2002") return jsonBad("Bucket already exists.", 409);
    return jsonBad("Unauthorized", 401);
  }
}
