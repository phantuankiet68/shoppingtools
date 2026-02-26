import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

function toCents(amount: number) {
  // amount = 12.34 => 1234
  return Math.round(Number(amount || 0) * 100);
}

export async function POST(req: Request) {
  try {
    const user = await requireAdminAuthUser();
    const body = await req.json().catch(() => ({}));

    // minimal validation
    const title = String(body.title ?? "").trim();
    if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

    const occurredAt = body.occurredAt ? new Date(body.occurredAt) : new Date();
    if (Number.isNaN(occurredAt.getTime())) {
      return NextResponse.json({ error: "occurredAt invalid" }, { status: 400 });
    }

    const totalCents = toCents(body.amount ?? body.total ?? 0);

    // merchant optional (create if not exists)
    let merchantId: string | null = body.merchantId ?? null;
    const merchantName = String(body.merchantName ?? "").trim();
    if (!merchantId && merchantName) {
      const m = await prisma.merchant.upsert({
        where: { name: merchantName },
        update: {},
        create: { name: merchantName },
        select: { id: true },
      });
      merchantId = m.id;
    }

    // category optional
    const categoryId: string | null = body.categoryId ?? null;

    const tx = await prisma.transaction.create({
      data: {
        userId: user.id,
        type: "EXPENSE",
        status: body.status ?? "PAID",
        method: body.method ?? "CARD",
        currency: body.currency ?? "USD",
        title,
        description: body.description ? String(body.description) : null,
        occurredAt,
        totalCents,
        subtotalCents: totalCents,
        taxCents: 0,
        merchantId,
        categoryId,
        reference: body.reference ? String(body.reference) : null,
        notes: body.notes ? String(body.notes) : null,
      },
      select: {
        id: true,
        title: true,
        occurredAt: true,
        status: true,
        method: true,
        currency: true,
        totalCents: true,
      },
    });

    return NextResponse.json({ tx });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unauthorized" }, { status: 401 });
  }
}
