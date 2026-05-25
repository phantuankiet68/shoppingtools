import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

type Ctx = {
  params: Promise<{
    id: string;
  }>;
};

type Body = {
  parentId?: string | null;
};

export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const user = await requireAdminAuthUser();

    const { id } = await ctx.params;

    const body: Body = await req.json().catch(() => ({}));

    const parentId = (body?.parentId ?? null) as string | null;

    const current = await prisma.folder.findFirst({
      where: {
        id,
        userId: user.id,
      },
      select: {
        id: true,
      },
    });

    if (!current) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    if (parentId) {
      if (parentId === id) {
        return NextResponse.json({ error: "Invalid parent" }, { status: 400 });
      }

      const parent = await prisma.folder.findFirst({
        where: {
          id: parentId,
          userId: user.id,
        },
        select: {
          id: true,
        },
      });

      if (!parent) {
        return NextResponse.json({ error: "Parent folder not found" }, { status: 404 });
      }
    }

    const folder = await prisma.folder.update({
      where: {
        id,
      },
      data: {
        parentId,
      },
      select: {
        id: true,
        name: true,
        parentId: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      folder,
    });
  } catch (e: unknown) {
    if (typeof e === "object" && e !== null && "code" in e && String((e as { code?: string }).code) === "P2002") {
      return NextResponse.json(
        {
          error: "Folder name already exists in this location",
        },
        { status: 409 },
      );
    }

    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
