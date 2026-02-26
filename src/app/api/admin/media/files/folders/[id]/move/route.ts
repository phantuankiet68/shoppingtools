import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireAdminAuthUser();
    const { id } = await ctx.params;

    const body = await req.json().catch(() => ({}) as any);
    const parentId = (body?.parentId ?? null) as string | null;

    const current = await prisma.fileFolder.findFirst({
      where: { id, ownerId: user.id },
      select: { id: true },
    });
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (parentId) {
      if (parentId === id) return NextResponse.json({ error: "Invalid parent" }, { status: 400 });

      const parent = await prisma.fileFolder.findFirst({
        where: { id: parentId, ownerId: user.id },
        select: { id: true },
      });
      if (!parent) return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
    }

    const folder = await prisma.fileFolder.update({
      where: { id },
      data: { parentId },
      select: { id: true, name: true, parentId: true, updatedAt: true },
    });

    return NextResponse.json({ folder });
  } catch (e: any) {
    if (String(e?.code) === "P2002") {
      return NextResponse.json({ error: "Folder name already exists in this location" }, { status: 409 });
    }
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
