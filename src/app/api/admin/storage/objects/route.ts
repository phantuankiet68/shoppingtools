import { NextResponse } from "next/server";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { ensureIntegration } from "@/lib/storage/ensureIntegration";
import { objectToRow } from "@/lib/storage/dto";

function jsonOk(data: any) {
  return NextResponse.json({ ok: true, data });
}
function jsonBad(msg: string, status = 400) {
  return NextResponse.json({ ok: false, error: msg }, { status });
}

export async function GET(req: Request) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const integration = await ensureIntegration(userId);

    const { searchParams } = new URL(req.url);
    const query = (searchParams.get("query") || "").trim();
    const visibility = (searchParams.get("visibility") || "ALL").toUpperCase();

    const where: any = {
      integrationId: integration.id,
      deletedAt: null,
    };

    if (query) {
      where.key = { contains: query, mode: "insensitive" };
    }
    if (visibility === "PUBLIC" || visibility === "PRIVATE") {
      where.visibility = visibility;
    }

    const objects = await prisma.storageObject.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 200,
    });

    return jsonOk(objects.map(objectToRow));
  } catch {
    return jsonBad("Unauthorized", 401);
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await requireAdminAuthUser();
    const userId = admin.id;

    const integration = await ensureIntegration(userId);
    const { searchParams } = new URL(req.url);
    const key = (searchParams.get("key") || "").trim();
    if (!key) return jsonBad("Missing key", 400);

    // Soft delete DB record (real delete from S3/R2 bạn làm sau)
    const updated = await prisma.storageObject.updateMany({
      where: { integrationId: integration.id, key, deletedAt: null },
      data: { deletedAt: new Date() },
    });

    await prisma.storageLog.create({
      data: {
        integrationId: integration.id,
        level: "WARN",
        action: "Delete object",
        message: `Deleted ${key} (DB only).`,
        meta: { key, affected: updated.count },
      },
    });

    return jsonOk({ deleted: true, affected: updated.count });
  } catch {
    return jsonBad("Unauthorized", 401);
  }
}
