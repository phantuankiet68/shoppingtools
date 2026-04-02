import { NextRequest, NextResponse } from "next/server";
import { MenuArea, Prisma, SystemRole } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";

function parseArea(value: string | null): MenuArea | undefined {
  if (value === "PLATFORM") return "PLATFORM";
  if (value === "ADMIN") return "ADMIN";
  if (value === "SITE") return "SITE";
  return undefined;
}

function parseSystemRole(value: string | null): SystemRole {
  if (value === "SUPER_ADMIN") return "SUPER_ADMIN";
  if (value === "CUSTOMER") return "CUSTOMER";
  return "ADMIN";
}

function parseVisible(value: string | null): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function parseEnabled(value: string | null): boolean | undefined {
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return fallback;
  return Math.floor(parsed);
}

type SortKey = "title" | "path" | "area" | "visible" | "permission";
type SortDirection = "asc" | "desc";

function parseSortKey(value: string | null): SortKey {
  if (value === "path") return "path";
  if (value === "area") return "area";
  if (value === "visible") return "visible";
  if (value === "permission") return "permission";
  return "title";
}

function parseSortDirection(value: string | null): SortDirection {
  return value === "desc" ? "desc" : "asc";
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);

    const area = parseArea(url.searchParams.get("area"));
    const systemRole = parseSystemRole(url.searchParams.get("systemRole"));
    const visible = parseVisible(url.searchParams.get("visible"));
    const enabled = parseEnabled(url.searchParams.get("enabled"));
    const q = url.searchParams.get("q")?.trim() || "";
    const page = parsePositiveInt(url.searchParams.get("page"), 1);
    const size = Math.min(parsePositiveInt(url.searchParams.get("size"), 8), 100);
    const sortKey = parseSortKey(url.searchParams.get("sortKey"));
    const sortDirection = parseSortDirection(url.searchParams.get("sortDirection"));

    const where: Prisma.MenuItemWhereInput = {
      ...(area ? { area } : {}),
      ...(visible !== undefined ? { visible } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: "insensitive" } },
              { path: { contains: q, mode: "insensitive" } },
              { icon: { contains: q, mode: "insensitive" } },
              { area: { equals: parseArea(q.toUpperCase()) } },
            ],
          }
        : {}),
      ...(enabled !== undefined
        ? {
            rolePermissions: {
              some: {
                systemRole,
                enabled,
              },
            },
          }
        : {}),
    };

    const total = await prisma.menuItem.count({ where });
    const totalPages = Math.max(1, Math.ceil(total / size));
    const currentPage = Math.min(page, totalPages);
    const skip = (currentPage - 1) * size;

    const orderBy: Prisma.MenuItemOrderByWithRelationInput[] =
      sortKey === "title"
        ? [{ title: sortDirection }, { sortOrder: "asc" }, { createdAt: "asc" }]
        : sortKey === "path"
          ? [{ path: sortDirection }, { sortOrder: "asc" }, { createdAt: "asc" }]
          : sortKey === "area"
            ? [{ area: sortDirection }, { sortOrder: "asc" }, { createdAt: "asc" }]
            : sortKey === "visible"
              ? [{ visible: sortDirection }, { sortOrder: "asc" }, { createdAt: "asc" }]
              : [{ sortOrder: "asc" }, { createdAt: "asc" }];

    const menus = await prisma.menuItem.findMany({
      where,
      skip,
      take: size,
      orderBy,
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

    let normalizedMenus = menus.map((menu) => {
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
        area: menu.area,
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

    if (sortKey === "permission") {
      normalizedMenus = normalizedMenus.sort((a, b) => {
        const valueA = a.permission.enabled ? 1 : 0;
        const valueB = b.permission.enabled ? 1 : 0;

        if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
        if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;

        return a.sortOrder - b.sortOrder;
      });
    }

    const summaryResult = await prisma.menuItem.findMany({
      where: {
        ...(area ? { area } : {}),
        ...(visible !== undefined ? { visible } : {}),
        ...(q
          ? {
              OR: [
                { title: { contains: q, mode: "insensitive" } },
                { path: { contains: q, mode: "insensitive" } },
                { icon: { contains: q, mode: "insensitive" } },
                { area: { equals: parseArea(q.toUpperCase()) } },
              ],
            }
          : {}),
      },
      select: {
        id: true,
        parentId: true,
        visible: true,
        rolePermissions: {
          where: { systemRole },
          select: { enabled: true },
          take: 1,
        },
      },
    });

    const enabledCount = summaryResult.filter((item) => item.rolePermissions[0]?.enabled).length;
    const visibleCount = summaryResult.filter((item) => item.visible).length;
    const rootCount = summaryResult.filter((item) => !item.parentId).length;

    const filteredTotal =
      enabled === undefined
        ? summaryResult.length
        : summaryResult.filter((item) => (item.rolePermissions[0]?.enabled ?? false) === enabled).length;

    return NextResponse.json(
      {
        items: normalizedMenus,
        pagination: {
          page: currentPage,
          size,
          total,
          totalPages,
          hasPreviousPage: currentPage > 1,
          hasNextPage: currentPage < totalPages,
        },
        summary: {
          total: filteredTotal,
          enabled: enabled === false ? 0 : enabledCount,
          disabled: filteredTotal - (enabled === false ? 0 : enabledCount),
          visible: visibleCount,
          hidden: filteredTotal - visibleCount,
          root: rootCount,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[GET /api/platform/menus]", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
