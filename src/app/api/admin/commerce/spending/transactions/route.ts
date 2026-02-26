import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

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
    const cat = url.searchParams.get("cat") ?? "All"; // "All" | categoryId | categoryType
    const onlyPaid = parseBool(url.searchParams.get("onlyPaid"));
    const sort = url.searchParams.get("sort") ?? "date_desc"; // date_desc | amount_desc | amount_asc
    const take = Math.min(100, Math.max(1, parseIntSafe(url.searchParams.get("take"), 20)));
    const skip = Math.max(0, parseIntSafe(url.searchParams.get("skip"), 0));

    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");

    const where: any = {
      userId: user.id,
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

    if (cat !== "All") {
      const looksLikeId = cat.length > 10;
      where.category = looksLikeId ? { id: cat } : { type: cat };
    }

    const orderBy: any = sort === "amount_desc" ? { totalCents: "desc" } : sort === "amount_asc" ? { totalCents: "asc" } : { occurredAt: "desc" };

    const [items, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy,
        take,
        skip,
        select: {
          id: true,
          title: true,
          description: true,
          occurredAt: true,
          status: true,
          method: true,
          currency: true,
          totalCents: true,
          merchant: { select: { id: true, name: true } },
          category: { select: { id: true, name: true, type: true, icon: true, color: true } },
        },
      }),
      prisma.transaction.count({ where }),
    ]);

    return NextResponse.json({ items, total, take, skip });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unauthorized" }, { status: 401 });
  }
}
