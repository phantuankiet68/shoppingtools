import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

export const runtime = "nodejs";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireAdminAuthUser();
    const { id } = await ctx.params;

    const file = await prisma.file.findFirst({
      where: { id, userId: user.id },
      select: { key: true },
    });

    if (!file) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const url = new URL(`/upload/files/${file.key}`, req.url);
    return NextResponse.redirect(url);
  } catch (e) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
