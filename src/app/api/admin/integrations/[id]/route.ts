// app/api/integrations/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { encryptString } from "@/lib/integrations/crypto";
import { z } from "zod";

export const dynamic = "force-dynamic";

const PatchSchema = z.object({
  enabled: z.boolean().optional(),
  config: z.record(z.string(), z.unknown()).optional(),

  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  webhookUrl: z.string().optional(),

  // allow clearing
  clearApiKey: z.boolean().optional(),
  clearApiSecret: z.boolean().optional(),
  clearWebhookUrl: z.boolean().optional(),
});

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  const item = await prisma.integration.findUnique({ where: { id } });
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    id: item.id,
    key: item.key,
    name: item.name,
    category: item.category,
    description: item.description,
    enabled: item.enabled,
    status: item.status,
    config: item.config,
    lastSyncAt: item.lastSyncAt,
    hasApiKey: !!(item as any).apiKeyEnc,
    hasApiSecret: !!(item as any).apiSecretEnc,
    webhookUrlSet: !!(item as any).webhookUrlEnc,
  });
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const { id } = await ctx.params;

  const body = await req.json().catch(() => ({}) as any);
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const data: any = {};
  if (typeof parsed.data.enabled === "boolean") data.enabled = parsed.data.enabled;
  if (parsed.data.config) data.config = parsed.data.config;

  if (parsed.data.apiKey !== undefined) {
    data.apiKeyEnc = parsed.data.apiKey.trim() ? encryptString(parsed.data.apiKey.trim()) : null;
  }
  if (parsed.data.apiSecret !== undefined) {
    data.apiSecretEnc = parsed.data.apiSecret.trim() ? encryptString(parsed.data.apiSecret.trim()) : null;
  }
  if (parsed.data.webhookUrl !== undefined) {
    data.webhookUrlEnc = parsed.data.webhookUrl.trim() ? encryptString(parsed.data.webhookUrl.trim()) : null;
  }

  if (parsed.data.clearApiKey) data.apiKeyEnc = null;
  if (parsed.data.clearApiSecret) data.apiSecretEnc = null;
  if (parsed.data.clearWebhookUrl) data.webhookUrlEnc = null;

  const updated = await prisma.integration.update({
    where: { id },
    data,
  });

  return NextResponse.json({
    id: updated.id,
    enabled: updated.enabled,
    status: updated.status,
    lastSyncAt: updated.lastSyncAt,
    hasApiKey: !!(updated as any).apiKeyEnc,
    hasApiSecret: !!(updated as any).apiSecretEnc,
    webhookUrlSet: !!(updated as any).webhookUrlEnc,
    config: updated.config,
  });
}
