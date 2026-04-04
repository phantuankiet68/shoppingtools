import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MenuArea } from "@/generated/prisma";

type Context = {
  params: Promise<{ menuId: string }>;
};

type UpdateMenuPayload = {
  title?: string;
  path?: string | null;
  icon?: string | null;
  sortOrder?: number;
  visible?: boolean;
  area?: MenuArea;
  siteId?: string;
  parentId?: string | null;
};

function parseMenuArea(value: unknown): MenuArea | null {
  return Object.values(MenuArea).includes(value as MenuArea) ? (value as MenuArea) : null;
}

export async function PUT(req: NextRequest, { params }: Context) {
  try {
    const { menuId } = await params;
    const body = (await req.json()) as UpdateMenuPayload;

    const menu = await prisma.menuItem.findUnique({
      where: { id: menuId },
      select: { id: true },
    });

    if (!menu) {
      return NextResponse.json({ message: "Menu not found" }, { status: 404 });
    }

    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) {
      return NextResponse.json({ message: "title is required" }, { status: 400 });
    }

    const area = parseMenuArea(body.area);
    if (!area) {
      return NextResponse.json({ message: "area is invalid" }, { status: 400 });
    }

    if (typeof body.sortOrder !== "number" || Number.isNaN(body.sortOrder)) {
      return NextResponse.json({ message: "sortOrder must be a valid number" }, { status: 400 });
    }

    if (typeof body.visible !== "boolean") {
      return NextResponse.json({ message: "visible must be boolean" }, { status: 400 });
    }

    if (typeof body.siteId !== "string" || !body.siteId.trim()) {
      return NextResponse.json({ message: "siteId is required" }, { status: 400 });
    }

    if (body.parentId && body.parentId === menuId) {
      return NextResponse.json({ message: "parentId cannot equal menuId" }, { status: 400 });
    }

    const updated = await prisma.menuItem.update({
      where: { id: menuId },
      data: {
        title,
        path: typeof body.path === "string" && body.path.trim() ? body.path.trim() : null,
        icon: typeof body.icon === "string" && body.icon.trim() ? body.icon.trim() : null,
        sortOrder: body.sortOrder,
        visible: body.visible,
        area,
        siteId: body.siteId.trim(),
        parentId: body.parentId && body.parentId.trim() ? body.parentId.trim() : null,
      },
      select: {
        id: true,
        siteId: true,
        parentId: true,
        title: true,
        path: true,
        icon: true,
        sortOrder: true,
        visible: true,
        area: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/platform/menus/[menuId]]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}