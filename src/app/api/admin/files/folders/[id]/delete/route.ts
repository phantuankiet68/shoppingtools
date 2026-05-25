import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

type Ctx = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireAdminAuthUser();

    const { id } = await ctx.params;

    const folder = await prisma.folder.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!folder) {
      return NextResponse.json({ error: "Folder not found" }, { status: 404 });
    }

    await prisma.folder.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
