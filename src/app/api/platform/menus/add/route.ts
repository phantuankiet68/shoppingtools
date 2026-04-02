import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/auth/roles";
import { getUserFromRequest } from "@/lib/auth/getUser";
import { MenuArea, SystemRole } from "@/generated/prisma";

type CreateMenuPayload = {
  siteId?: string;
  parentId?: string | null;
  title?: string;
  path?: string | null;
  icon?: string | null;
  sortOrder?: number;
  visible?: boolean;
  area?: MenuArea;
};

function parseArea(value: unknown): MenuArea {
  return Object.values(MenuArea).includes(value as MenuArea) ? (value as MenuArea) : MenuArea.ADMIN;
}

export async function POST(req: NextRequest) {
  try {
    const user = await getUserFromRequest(req);

    if (!user || !hasRole(user.systemRole, "SUPER_ADMIN")) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = (await req.json()) as CreateMenuPayload;

    const { siteId, parentId, title, path, icon, sortOrder, visible } = body;
    const area = parseArea(body.area);

    if (!siteId || !title) {
      return NextResponse.json({ message: "siteId and title are required" }, { status: 400 });
    }

    const nextSiteId = String(siteId).trim();
    const nextTitle = String(title).trim();

    if (!nextSiteId) {
      return NextResponse.json({ message: "siteId is required" }, { status: 400 });
    }

    if (!nextTitle) {
      return NextResponse.json({ message: "title is required" }, { status: 400 });
    }

    if (sortOrder !== undefined && !Number.isInteger(sortOrder)) {
      return NextResponse.json({ message: "sortOrder must be an integer" }, { status: 400 });
    }

    // Check site exists before create to avoid FK error MenuItem_siteId_fkey
    const site = await prisma.site.findUnique({
      where: { id: nextSiteId },
      select: { id: true },
    });

    if (!site) {
      return NextResponse.json({ message: `Site not found: ${nextSiteId}` }, { status: 400 });
    }

    const nextParentId = parentId?.trim() ? parentId.trim() : null;

    if (nextParentId) {
      const parent = await prisma.menuItem.findUnique({
        where: { id: nextParentId },
        select: { id: true, siteId: true, area: true },
      });

      if (!parent) {
        return NextResponse.json({ message: "Parent menu not found" }, { status: 404 });
      }

      if (parent.siteId !== nextSiteId) {
        return NextResponse.json({ message: "Parent menu must belong to same site" }, { status: 400 });
      }

      if (parent.area !== area) {
        return NextResponse.json({ message: "Parent menu must belong to same area" }, { status: 400 });
      }
    }

    const menu = await prisma.$transaction(async (tx) => {
      const created = await tx.menuItem.create({
        data: {
          siteId: nextSiteId,
          parentId: nextParentId,
          title: nextTitle,
          path: path?.trim() ? path.trim() : null,
          icon: icon?.trim() ? icon.trim() : null,
          sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
          visible: visible ?? true,
          area,
        },
      });

      await tx.menuRolePermission.createMany({
        data: [
          {
            menuId: created.id,
            systemRole: SystemRole.SUPER_ADMIN,
            enabled: true,
          },
          {
            menuId: created.id,
            systemRole: SystemRole.ADMIN,
            enabled: true,
          },
          {
            menuId: created.id,
            systemRole: SystemRole.CUSTOMER,
            enabled: false,
          },
        ],
        skipDuplicates: true,
      });

      return created;
    });

    return NextResponse.json(
      {
        ok: true,
        data: menu,
      },
      { status: 201 },
    );
  } catch (err) {
    console.error("CREATE_MENU_ERROR", err);

    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      if (err.code === "P2003") {
        return NextResponse.json(
          {
            message: "Foreign key constraint violated. siteId or parentId is invalid.",
            code: err.code,
            meta: err.meta ?? null,
          },
          { status: 400 },
        );
      }

      return NextResponse.json(
        {
          message: "Database error",
          code: err.code,
          meta: err.meta ?? null,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
