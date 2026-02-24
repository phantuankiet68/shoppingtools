import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } | { params: Promise<{ id: string }> },
) {
  const params = "then" in (ctx as any).params ? await (ctx as any).params : (ctx as any).params;
  const id = params?.id;

  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const logs = await prisma.integrationLog.findMany({
    where: { integrationId: id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(logs);
}
