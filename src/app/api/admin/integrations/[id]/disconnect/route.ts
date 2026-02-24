// app/api/integrations/[id]/disconnect/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { addIntegrationLog } from "@/lib/integrations/integrationLogs";

export const dynamic = "force-dynamic";

// ✅ Next 16 validator expects params to be Promise
type Params = { params: Promise<{ id: string }> };

export async function POST(_: Request, { params }: Params) {
  const { id } = await params;

  const it = await prisma.integration.findUnique({ where: { id } });
  if (!it) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.integration.update({
    where: { id: it.id },
    data: { status: "disconnected", enabled: false, lastSyncAt: null },
  });

  await addIntegrationLog(it.id, "warn", "Disconnected.");
  return NextResponse.json({ ok: true });
}
