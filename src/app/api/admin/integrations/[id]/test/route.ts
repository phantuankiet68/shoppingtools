// app/api/integrations/[id]/test/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addIntegrationLog } from "@/lib/integrations/integrationLogs";

export const dynamic = "force-dynamic";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const it = await prisma.integration.findUnique({ where: { id: params.id } });
  if (!it) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (it.status !== "connected") {
    await addIntegrationLog(it.id, "warn", "Not connected. Please connect first.");
    return NextResponse.json({ ok: false, error: "Not connected" }, { status: 400 });
  }

  await prisma.integration.update({ where: { id: it.id }, data: { lastSyncAt: new Date() } });
  await addIntegrationLog(it.id, "info", "Test ping OK.");
  return NextResponse.json({ ok: true });
}
