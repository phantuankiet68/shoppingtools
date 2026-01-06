// app/api/menu-items/bulk/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { ids } = (await req.json()) as { ids?: string[] };
    const list = Array.isArray(ids) ? ids.filter(Boolean) : [];
    if (list.length === 0) return NextResponse.json({ deleted: 0 });

    // Nếu có quan hệ children, cân nhắc xoá đệ quy theo cây
    const r = await prisma.menuItem.deleteMany({ where: { id: { in: list } } });
    return NextResponse.json({ deleted: r.count });
  } catch (e) {
    console.error("POST /api/menu-items/bulk error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
