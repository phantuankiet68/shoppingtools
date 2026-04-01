import { NextRequest, NextResponse } from "next/server";
import { MenuSetKey } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ workspaceId: string; id: string; menuId: string }>;
};

type UpdateMenuPayload = {
  title?: string;
  path?: string | null;
  icon?: string | null;
  sortOrder?: number;
  visible?: boolean;
  parentId?: string | null;
  setKey?: MenuSetKey;
};

function normalizeOptionalString(value: unknown) {
  if (value === null || value === undefined) return null;
  const nextValue = String(value).trim();
  return nextValue.length > 0 ? nextValue : null;
}

export async function GET(_: NextRequest, { params }: Context) {
  try {
    const { workspaceId, id: siteId, menuId } = await params;

    const menu = await prisma.menuItem.findFirst({
      where: {
        id: menuId,
        siteId,
        site: {
          workspaceId,
          deletedAt: null,
        },
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
        setKey: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!menu) {
      return NextResponse.json({ message: "Menu not found" }, { status: 404 });
    }

    return NextResponse.json(menu, { status: 200 });
  } catch (error) {
    console.error("[GET /api/platform/permission/workspaces/[workspaceId]/sites/[id]/menus/[menuId]]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  try {
    const { workspaceId, id: siteId, menuId } = await params;
    const body = (await req.json()) as UpdateMenuPayload;

    const existingMenu = await prisma.menuItem.findFirst({
      where: {
        id: menuId,
        siteId,
        site: {
          workspaceId,
          deletedAt: null,
        },
      },
      select: {
        id: true,
        siteId: true,
        parentId: true,
      },
    });

    if (!existingMenu) {
      return NextResponse.json({ message: "Menu not found" }, { status: 404 });
    }

    if (body.parentId) {
      const parentExists = await prisma.menuItem.findFirst({
        where: {
          id: body.parentId,
          siteId,
        },
        select: { id: true },
      });

      if (!parentExists) {
        return NextResponse.json({ message: "Parent menu not found" }, { status: 400 });
      }

      if (body.parentId === menuId) {
        return NextResponse.json({ message: "Menu cannot be its own parent" }, { status: 400 });
      }
    }

    const data: {
      title?: string;
      path?: string | null;
      icon?: string | null;
      sortOrder?: number;
      visible?: boolean;
      parentId?: string | null;
      setKey?: MenuSetKey;
    } = {};

    if (body.title !== undefined) {
      const nextTitle = String(body.title).trim();

      if (!nextTitle) {
        return NextResponse.json({ message: "Title is required" }, { status: 400 });
      }

      data.title = nextTitle;
    }

    if (body.path !== undefined) {
      data.path = normalizeOptionalString(body.path);
    }

    if (body.icon !== undefined) {
      data.icon = normalizeOptionalString(body.icon);
    }

    if (body.sortOrder !== undefined) {
      if (!Number.isInteger(body.sortOrder)) {
        return NextResponse.json({ message: "sortOrder must be an integer" }, { status: 400 });
      }

      data.sortOrder = body.sortOrder;
    }

    if (body.visible !== undefined) {
      data.visible = Boolean(body.visible);
    }

    if (body.parentId !== undefined) {
      data.parentId = normalizeOptionalString(body.parentId);
    }

    if (body.setKey !== undefined) {
      data.setKey = body.setKey;
    }

    const updatedMenu = await prisma.menuItem.update({
      where: { id: menuId },
      data,
      select: {
        id: true,
        siteId: true,
        parentId: true,
        title: true,
        path: true,
        icon: true,
        sortOrder: true,
        visible: true,
        setKey: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(updatedMenu, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/platform/permission/workspaces/[workspaceId]/sites/[id]/menus/[menuId]]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
