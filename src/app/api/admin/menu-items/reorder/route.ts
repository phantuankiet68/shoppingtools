// app/api/menu-items/reorder/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { items } = (await req.json()) as { items?: Array<{ id: string; sortOrder: number }> };
    const list = Array.isArray(items) ? items : [];
    if (list.length === 0) return NextResponse.json({ updated: 0 });

    await prisma.$transaction(
      list.map((it) =>
        prisma.menuItem.update({
          where: { id: it.id },
          data: { sortOrder: Number(it.sortOrder) || 0 },
        })
      )
    );
    return NextResponse.json({ updated: list.length });
  } catch (e) {
    console.error("POST /api/menu-items/reorder error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
