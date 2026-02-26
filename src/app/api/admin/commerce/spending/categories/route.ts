import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function GET() {
  try {
    await requireAdminAuthUser();

    const items = await prisma.spendCategory.findMany({
      where: { isActive: true },
      orderBy: [{ type: "asc" }, { name: "asc" }],
      select: { id: true, name: true, type: true, icon: true, color: true },
    });

    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unauthorized" }, { status: 401 });
  }
}
