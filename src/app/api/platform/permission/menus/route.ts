import { NextRequest, NextResponse } from "next/server";
import { MenuSetKey, SystemRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

function parseSetKey(value: string | null): MenuSetKey {
  if (value === "v1") return "v1";
  return "home";
}

function parseSystemRole(value: string | null): SystemRole {
  if (value === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (value === "CUSTOMER") return "CUSTOMER";
  return "ADMIN";
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const setKey = parseSetKey(url.searchParams.get("setKey"));
    const systemRole = parseSystemRole(url.searchParams.get("systemRole"));

    const menus = await prisma.menuItem.findMany({
      where: {
        setKey,
        visible: true,
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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
        rolePermissions: {
          where: {
            systemRole,
          },
          select: {
            id: true,
            systemRole: true,
            enabled: true,
            createdAt: true,
            updatedAt: true,
          },
          take: 1,
        },
      },
    });

    const normalizedMenus = menus.map((menu) => {
      const permission = menu.rolePermissions[0] ?? null;

      return {
        id: menu.id,
        siteId: menu.siteId,
        parentId: menu.parentId,
        title: menu.title,
        path: menu.path,
        icon: menu.icon,
        sortOrder: menu.sortOrder,
        visible: menu.visible,
        setKey: menu.setKey,
        createdAt: menu.createdAt,
        updatedAt: menu.updatedAt,
        permission: permission
          ? {
              id: permission.id,
              systemRole: permission.systemRole,
              enabled: permission.enabled,
              createdAt: permission.createdAt,
              updatedAt: permission.updatedAt,
            }
          : {
              id: null,
              systemRole,
              enabled: false,
              createdAt: null,
              updatedAt: null,
            },
      };
    });

    return NextResponse.json(normalizedMenus, { status: 200 });
  } catch (error) {
    console.error("[GET /api/platform/permission/menus]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
