import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

// helpers
function parseBool(v: string | null) {
  return v === "1" || v === "true";
}
function parseIntSafe(v: string | null, def = 0) {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : def;
}

export async function GET(req: Request) {
  try {
    const user = await requireAdminAuthUser();
    const url = new URL(req.url);

    const q = (url.searchParams.get("q") ?? "").trim();
    const cat = url.searchParams.get("cat") ?? "All"; // "All" | categoryId | categoryType (optional)
    const onlyPaid = parseBool(url.searchParams.get("onlyPaid"));

    // date range (optional)
    const from = url.searchParams.get("from"); // ISO
    const to = url.searchParams.get("to"); // ISO

    const whereTx: any = {
      userId: user.id,
      // only expense transactions for "spending"
      type: "EXPENSE",
      ...(onlyPaid ? { status: "PAID" } : {}),
      ...(from || to
        ? {
            occurredAt: {
              ...(from ? { gte: new Date(from) } : {}),
              ...(to ? { lte: new Date(to) } : {}),
            },
          }
        : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { description: { contains: q, mode: "insensitive" } },
              { merchant: { name: { contains: q, mode: "insensitive" } } },
              { category: { name: { contains: q, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    // filter by category:
    // - if cat === "All" => no filter
    // - if cat looks like categoryId (cuid) => categoryId filter
    // - OR you can pass catType like "INVENTORY" / "SOFTWARE"...
    if (cat !== "All") {
      // simple heuristic: if starts with "c" and length > 10 => treat as cuid (optional)
      const looksLikeId = cat.length > 10;
      whereTx.category = looksLikeId ? { id: cat } : { type: cat };
    }

    // ============ 1) Totals ============
    const txAgg = await prisma.transaction.aggregate({
      where: whereTx,
      _sum: { totalCents: true },
    });

    const paidAgg = await prisma.transaction.aggregate({
      where: { ...whereTx, status: "PAID" },
      _sum: { totalCents: true },
    });

    // subscriptions: category.type == SOFTWARE
    const subsAgg = await prisma.transaction.aggregate({
      where: { ...whereTx, category: { type: "SOFTWARE" } },
      _sum: { totalCents: true },
    });

    // avg/day: nếu có from/to thì tính theo range, không thì tạm dùng 30 ngày
    const now = new Date();
    const startForAvg = from ? new Date(from) : new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29);
    const endForAvg = to ? new Date(to) : now;
    const days = Math.max(1, Math.ceil((endForAvg.getTime() - startForAvg.getTime()) / (1000 * 60 * 60 * 24)));

    const totalCents = txAgg._sum.totalCents ?? 0;
    const paidCents = paidAgg._sum.totalCents ?? 0;
    const subsCents = subsAgg._sum.totalCents ?? 0;
    const avgPerDayCents = Math.round(totalCents / days);

    // ============ 2) Spark: last 12 tx amounts ============
    const lastTxs = await prisma.transaction.findMany({
      where: whereTx,
      orderBy: { occurredAt: "desc" },
      take: 12,
      select: { totalCents: true },
    });
    const spark = lastTxs.map((t) => t.totalCents).reverse();

    // ============ 3) Spending by Category (sum) ============
    // groupBy categoryId (null grouped separately)
    const byCatRaw = await prisma.transaction.groupBy({
      by: ["categoryId"],
      where: whereTx,
      _sum: { totalCents: true },
    });

    const catIds = byCatRaw.map((x) => x.categoryId).filter(Boolean) as string[];
    const cats = await prisma.spendCategory.findMany({
      where: { id: { in: catIds } },
      select: { id: true, name: true, type: true, icon: true, color: true },
    });
    const catMap = new Map(cats.map((c) => [c.id, c]));

    const byCategory = byCatRaw
      .map((row) => {
        const meta = row.categoryId ? catMap.get(row.categoryId) : null;
        return {
          categoryId: row.categoryId,
          name: meta?.name ?? "Uncategorized",
          type: meta?.type ?? "OTHER",
          icon: meta?.icon ?? null,
          color: meta?.color ?? null,
          totalCents: row._sum.totalCents ?? 0,
        };
      })
      .sort((a, b) => b.totalCents - a.totalCents);

    // ============ 4) Inventory metrics + P&L (simple) ============
    // received receipts
    const receiptAgg = await prisma.inventoryReceipt.aggregate({
      where: { userId: user.id, status: "RECEIVED" },
      _sum: { totalCents: true },
    });

    // qty received
    const receivedItems = await prisma.inventoryReceiptItem.aggregate({
      where: { receipt: { userId: user.id, status: "RECEIVED" } },
      _sum: { qty: true },
    });

    // sales metrics
    const salesDelivering = await prisma.salesItem.aggregate({
      where: { order: { userId: user.id, status: "DELIVERING" } },
      _sum: { qty: true, totalCents: true },
    });
    const salesDelivered = await prisma.salesItem.aggregate({
      where: { order: { userId: user.id, status: "DELIVERED" } },
      _sum: { qty: true, totalCents: true },
    });

    // refunds (RETURNED orders): sum items total
    const refundsAgg = await prisma.salesItem.aggregate({
      where: { order: { userId: user.id, status: "RETURNED" } },
      _sum: { totalCents: true, qty: true },
    });

    // COGS: sum(qty * product.unitCostCents) for delivering+delivered
    // Prisma aggregate doesn't do multiplication; do with findMany small projection
    const salesForCogs = await prisma.salesItem.findMany({
      where: { order: { userId: user.id, status: { in: ["DELIVERING", "DELIVERED"] } } },
      select: { qty: true, product: { select: { unitCostCents: true } } },
    });
    const cogsCents = salesForCogs.reduce((s, it) => s + it.qty * (it.product?.unitCostCents ?? 0), 0);

    const revenueCents = (salesDelivering._sum.totalCents ?? 0) + (salesDelivered._sum.totalCents ?? 0);

    const refundsCents = refundsAgg._sum.totalCents ?? 0;

    const grossProfitCents = revenueCents - cogsCents - refundsCents;

    // inStockQty (simple): received - (delivering+delivered) + returnedQty
    const receivedQty = receivedItems._sum.qty ?? 0;
    const deliveringQty = salesDelivering._sum.qty ?? 0;
    const deliveredQty = salesDelivered._sum.qty ?? 0;
    const returnedQty = refundsAgg._sum.qty ?? 0;

    const soldQty = deliveringQty + deliveredQty;
    const inStockQty = Math.max(0, receivedQty - soldQty + returnedQty);

    // ============ 5) revenue 12 months ============
    const start12m = new Date(now.getFullYear(), now.getMonth() - 11, 1);
    const end12m = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    const deliveredOrders = await prisma.salesOrder.findMany({
      where: { userId: user.id, status: "DELIVERED", orderedAt: { gte: start12m, lt: end12m } },
      select: { orderedAt: true, totalCents: true },
    });

    const months: { key: string; label: string; totalCents: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(start12m.getFullYear(), start12m.getMonth() + i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const label = d.toLocaleString("en-US", { month: "short", year: "numeric" });
      months.push({ key, label, totalCents: 0 });
    }
    const idx = new Map(months.map((m, i) => [m.key, i]));

    for (const o of deliveredOrders) {
      const d = o.orderedAt;
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      const i = idx.get(key);
      if (i !== undefined) months[i].totalCents += o.totalCents;
    }

    const revenue12mTotalCents = months.reduce((a, m) => a + m.totalCents, 0);
    const revenue12mMaxCents = Math.max(1, ...months.map((m) => m.totalCents));

    return NextResponse.json({
      totals: {
        totalCents,
        paidCents,
        subsCents,
        avgPerDayCents,
        days,
      },
      spark,
      byCategory,
      inventory: {
        receivedQty,
        soldQty,
        inStockQty,
        deliveringQty,
        returnedQty,
        inventorySpendPaidCents: receiptAgg._sum.totalCents ?? 0,
      },
      pnl: {
        revenueCents,
        cogsCents,
        refundsCents,
        grossProfitCents,
      },
      revenue12m: {
        months,
        totalCents: revenue12mTotalCents,
        maxCents: revenue12mMaxCents,
      },
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unauthorized" }, { status: 401 });
  }
}
