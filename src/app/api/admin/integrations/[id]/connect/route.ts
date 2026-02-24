// app/api/integrations/[id]/connect/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addIntegrationLog } from "@/lib/integrations/integrationLogs";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function POST(_: Request, { params }: Params) {
  const { id } = await params;

  const it = await prisma.integration.findUnique({ where: { id } });
  if (!it) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (!it.apiKeyEnc) {
    await prisma.integration.update({ where: { id: it.id }, data: { status: "error" } });
    await addIntegrationLog(it.id, "error", "Missing API key.");
    return NextResponse.json({ ok: false, error: "Missing API key" }, { status: 400 });
  }

  await prisma.integration.update({
    where: { id: it.id },
    data: { status: "connected", enabled: true, lastSyncAt: new Date() },
  });

  await addIntegrationLog(it.id, "info", "Connected successfully.");
  return NextResponse.json({ ok: true });
}
