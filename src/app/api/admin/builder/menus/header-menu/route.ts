import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MenuSetKey, Prisma } from "@prisma/client";

export const runtime = "nodejs";

const DEFAULT_SET_KEY: MenuSetKey = "home"; // header menu của trang Home

async function resolveSiteId(req: Request, maybeSiteId?: string | null) {
  if (maybeSiteId) {
    const ok = await prisma.site.findUnique({ where: { id: maybeSiteId }, select: { id: true } });
    if (ok) return ok.id;
  }

  const h = req.headers;
  const domain = h.get("x-site-domain") ?? h.get("host")?.split(":")[0]?.toLowerCase() ?? "";
  if (domain) {
    const s = await prisma.site.findUnique({ where: { domain }, select: { id: true } });
    if (s) return s.id;
  }

  const first = await prisma.site.findFirst({ select: { id: true }, orderBy: { createdAt: "asc" } });
  if (!first) throw new Error("No Site found. Seed the Site table first.");
  return first.id;
}

type MenuRow = {
  id: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  setKey: MenuSetKey;
};

type TreeNode = {
  key: string;
  title: string;
  icon: string;
  path: string | null;
  parentKey: string | null;
  children: TreeNode[];
};

function buildTree(rows: MenuRow[]): TreeNode[] {
  const map = new Map<string, TreeNode>();

  rows.forEach((r) => {
    map.set(r.id, {
      key: r.id,
      title: r.title,
      icon: r.icon || "bi bi-dot",
      path: r.path,
      parentKey: r.parentId,
      children: [],
    });
  });

  const roots: TreeNode[] = [];
  rows.forEach((r) => {
    const node = map.get(r.id)!;
    if (r.parentId && map.has(r.parentId)) map.get(r.parentId)!.children.push(node);
    else roots.push(node);
  });

  const sortMap: Record<string, number> = {};
  rows.forEach((r) => (sortMap[r.id] = r.sortOrder));

  const sortRec = (arr: TreeNode[]) => {
    arr.sort((a, b) => {
      const sa = sortMap[a.key] ?? 0;
      const sb = sortMap[b.key] ?? 0;
      if (sa !== sb) return sa - sb;
      return a.title.localeCompare(b.title);
    });
    arr.forEach((n) => sortRec(n.children));
  };

  sortRec(roots);
  return roots;
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);

    const siteIdParam = url.searchParams.get("siteId");
    const siteId = await resolveSiteId(req, siteIdParam);

    // setKey mặc định = "home"
    const setKey = (url.searchParams.get("setKey") as MenuSetKey) || DEFAULT_SET_KEY;

    const includeHidden = url.searchParams.get("includeHidden") === "1";
    const tree = url.searchParams.get("tree") !== "0"; // mặc định trả tree

    const where: Prisma.MenuItemWhereInput = {
      siteId,
      setKey,
      ...(includeHidden ? {} : { visible: true }),
    };

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
        setKey: true,
      },
    });

    return NextResponse.json({
      siteId,
      setKey,
      ...(tree ? { tree: buildTree(items as MenuRow[]) } : { items }),
    });
  } catch (e) {
    console.error("GET /api/public/header-menu error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
