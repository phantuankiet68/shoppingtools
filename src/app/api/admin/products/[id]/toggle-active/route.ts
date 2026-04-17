import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAdminAuthUser();
    const { id } = await ctx.params;

    const current = await prisma.product.findFirst({
      where: { id, userId: user.id },
      select: { id: true, isActive: true },
    });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const updated = await prisma.product.update({
      where: { id },
      data: { isActive: !current.isActive },
      select: { id: true, isActive: true, updatedAt: true },
    });

    return NextResponse.json({ item: updated });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
