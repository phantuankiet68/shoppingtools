// app/api/integrations/[id]/test/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addIntegrationLog } from "@/lib/integrations/integrationLogs";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  const it = await prisma.integration.findUnique({ where: { id } });
  if (!it) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (it.status !== "connected") {
    await addIntegrationLog(it.id, "warn", "Not connected. Please connect first.");
    return NextResponse.json({ ok: false, error: "Not connected" }, { status: 400 });
  }

  await prisma.integration.update({ where: { id: it.id }, data: { lastSyncAt: new Date() } });
  await addIntegrationLog(it.id, "info", "Test ping OK.");
  return NextResponse.json({ ok: true });
}
