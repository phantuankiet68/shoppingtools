import { NextResponse } from "next/server";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import { prisma } from "@/lib/prisma";
import { ensureIntegration } from "@/lib/storage/ensureIntegration";
import { logToRow } from "@/lib/storage/dto";

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

    const logs = await prisma.storageLog.findMany({
      where: { integrationId: integration.id },
      orderBy: { at: "desc" },
      take: 200,
    });

    return jsonOk(logs.map(logToRow));
  } catch {
    return jsonBad("Unauthorized", 401);
  }
}
