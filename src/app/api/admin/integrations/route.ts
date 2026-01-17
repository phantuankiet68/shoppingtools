// app/api/integrations/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { maskSecret } from "@/lib/integrations/crypto";
import { z } from "zod";

export const dynamic = "force-dynamic";

function safeIntegration(i: any) {
  return {
    id: i.id,
    key: i.key,
    name: i.name,
    category: i.category,
    description: i.description,
    enabled: i.enabled,
    status: i.status,
    config: i.config,
    lastSyncAt: i.lastSyncAt,
    updatedAt: i.updatedAt,
    // chỉ trả dạng masked để UI hiển thị
    apiKeyMasked: maskSecret(i.apiKeyEnc ? "xxx" : ""), // (không thể mask nếu không decrypt; UI chỉ cần biết có/không)
    hasApiKey: !!i.apiKeyEnc,
    hasApiSecret: !!i.apiSecretEnc,
    webhookUrlSet: !!i.webhookUrlEnc,
  };
}

export async function GET() {
  const items = await prisma.integration.findMany({
    orderBy: [{ status: "desc" }, { updatedAt: "desc" }],
  });
  return NextResponse.json(items.map(safeIntegration));
}

const CreateSchema = z.object({
  key: z.string().min(2),
  name: z.string().min(2),
  category: z.enum(["payments", "email", "analytics", "storage", "ai", "crm"]),
  description: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });

  const created = await prisma.integration.create({
    data: {
      key: parsed.data.key,
      name: parsed.data.name,
      category: parsed.data.category as any,
      description: parsed.data.description,
      config: {},
      enabled: false,
      status: "disconnected",
    },
  });

  return NextResponse.json(safeIntegration(created), { status: 201 });
}
