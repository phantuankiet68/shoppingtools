import { NextRequest, NextResponse } from "next/server";
import { SystemRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type Context = {
  params: Promise<{ menuId: string }>;
};

type UpdateRolePermissionPayload = {
  systemRole?: SystemRole;
  enabled?: boolean;
};

function parseSystemRole(value: unknown): SystemRole | null {
  if (value === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (value === "ADMIN") return "ADMIN";
  if (value === "CUSTOMER") return "CUSTOMER";
  return null;
}

export async function PUT(req: NextRequest, { params }: Context) {
  try {
    const { menuId } = await params;
    const body = (await req.json()) as UpdateRolePermissionPayload;

    const systemRole = parseSystemRole(body.systemRole);
    if (!systemRole) {
      return NextResponse.json({ message: "systemRole is invalid" }, { status: 400 });
    }

    if (typeof body.enabled !== "boolean") {
      return NextResponse.json({ message: "enabled must be boolean" }, { status: 400 });
    }

    const menu = await prisma.menuItem.findUnique({
      where: { id: menuId },
      select: {
        id: true,
        visible: true,
      },
    });

    if (!menu) {
      return NextResponse.json({ message: "Menu not found" }, { status: 404 });
    }

    if (!menu.visible) {
      return NextResponse.json(
        { message: "Menu is globally hidden and cannot be assigned to a role" },
        { status: 400 },
      );
    }

    const permission = await prisma.menuRolePermission.upsert({
      where: {
        menuId_systemRole: {
          menuId,
          systemRole,
        },
      },
      update: {
        enabled: body.enabled,
      },
      create: {
        menuId,
        systemRole,
        enabled: body.enabled,
      },
      select: {
        id: true,
        menuId: true,
        systemRole: true,
        enabled: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(permission, { status: 200 });
  } catch (error) {
    console.error("[PUT /api/platform/permission/menus/[menuId]/role-permission]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
