import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MenuArea, Prisma, SystemRole } from "@/generated/prisma";
import { getUserFromRequest } from "@/lib/auth/getUser";
import { isAdmin } from "@/lib/auth/roles";

export const runtime = "nodejs";

type LayoutItem = {
  id: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  area: MenuArea;
};

type TreeNode = {
  key: string;
  title: string;
  icon: string;
  path: string | null;
  parentKey: string | null;
  children?: TreeNode[];
};

function resolveAreaByRole(systemRole: SystemRole): MenuArea | null {
  switch (systemRole) {
    case "SUPER_ADMIN":
      return "PLATFORM";
    case "ADMIN":
      return "ADMIN";
    case "CUSTOMER":
      return "SITE";
    default:
      return null;
  }
}

function buildTree(rows: LayoutItem[]): TreeNode[] {
  const map = new Map<string, TreeNode>();

  for (const row of rows) {
    map.set(row.id, {
      key: row.id,
      title: row.title,
      icon: row.icon || "bi bi-dot",
      path: row.path,
      parentKey: row.parentId,
      children: [],
    });
  }

  const roots: TreeNode[] = [];
  const sortMap = new Map<string, number>();

  for (const row of rows) {
    sortMap.set(row.id, row.sortOrder);
  }

  for (const row of rows) {
    const node = map.get(row.id)!;

    if (row.parentId && map.has(row.parentId)) {
      map.get(row.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortRecursive = (nodes?: TreeNode[]) => {
    if (!nodes?.length) return;

    nodes.sort((a, b) => {
      const aSort = sortMap.get(a.key) ?? 0;
      const bSort = sortMap.get(b.key) ?? 0;

      if (aSort !== bSort) return aSort - bSort;
      return a.title.localeCompare(b.title);
    });

    for (const node of nodes) {
      sortRecursive(node.children);
    }
  };

  sortRecursive(roots);

  return roots;
}

async function requireBackofficeUser(req: NextRequest) {
  const user = await getUserFromRequest(req);

  if (!user) return null;
  if (user.status !== "ACTIVE") return null;
  if (!isAdmin(user.systemRole)) return null;

  return user;
}

export async function GET(req: NextRequest) {
  try {
    const authUser = await requireBackofficeUser(req);

    if (!authUser) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const url = new URL(req.url);
    const includeHidden = url.searchParams.get("includeHidden") === "1";
    const tree = url.searchParams.get("tree") === "1";

    const area = resolveAreaByRole(authUser.systemRole as SystemRole);

    if (!area) {
      return NextResponse.json({ message: "Unsupported system role" }, { status: 403 });
    }

    const where = {
      area,
      ...(includeHidden ? {} : { visible: true }),
      rolePermissions: {
        some: {
          systemRole: authUser.systemRole as SystemRole,
          enabled: true,
        },
      },
    } satisfies Prisma.MenuItemWhereInput;

    const items = await prisma.menuItem.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
      select: {
        id: true,
        parentId: true,
        title: true,
        path: true,
        icon: true,
        sortOrder: true,
        visible: true,
        area: true,
      },
    });

    if (tree) {
      return NextResponse.json(
        {
          area,
          systemRole: authUser.systemRole,
          tree: buildTree(items as LayoutItem[]),
        },
        { status: 200 },
      );
    }

    return NextResponse.json(
      {
        area,
        systemRole: authUser.systemRole,
        items,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/admin/menus/layout error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
