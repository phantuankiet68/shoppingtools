import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type CatNode = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  count: number;
  href: string;
  children: CatNode[];
};

function normalizeBasePath(p: string) {
  const s = String(p || "").trim();
  if (!s) return "/category";
  if (!s.startsWith("/")) return `/${s}`;
  return s;
}

function joinHref(basePath: string, slug: string) {
  const b = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath;
  return `${b}/${slug}`;
}

function buildTree(
  rows: Array<{
    id: string;
    parentId: string | null;
    name: string;
    slug: string;
    sortOrder: number;
    count: number;
  }>,
  basePath: string,
): CatNode[] {
  const map = new Map<string, CatNode>();

  rows.forEach((r) => {
    map.set(r.id, {
      id: r.id,
      parentId: r.parentId,
      name: r.name,
      slug: r.slug,
      sortOrder: r.sortOrder ?? 0,
      count: r.count ?? 0,
      href: joinHref(basePath, r.slug),
      children: [],
    });
  });

  const roots: CatNode[] = [];

  rows.forEach((r) => {
    const node = map.get(r.id)!;
    if (r.parentId && map.has(r.parentId)) {
      map.get(r.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRec = (arr: CatNode[]) => {
    arr.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.name.localeCompare(b.name));
    arr.forEach((n) => sortRec(n.children));
  };

  sortRec(roots);
  return roots;
}

/**
 * GET /api/admin/commerce/categories/sidebar-category?siteId=sitea01&basePath=/category
 */
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const basePath = normalizeBasePath(url.searchParams.get("basePath") ?? "/category");

    const qpSiteId = (url.searchParams.get("siteId") ?? "").trim();

    const hostHeader = req.headers.get("x-site-domain") ?? req.headers.get("host") ?? "";
    const domain = hostHeader.split(":")[0].toLowerCase();

    let resolvedSiteId = qpSiteId;

    if (!resolvedSiteId && domain) {
      const site = await prisma.site.findUnique({
        where: { domain },
        select: { id: true },
      });
      resolvedSiteId = site?.id ?? "";
    }

    if (!resolvedSiteId) {
      return NextResponse.json({ error: "Missing siteId. Please pass ?siteId=..." }, { status: 400 });
    }

    const rows = await prisma.productCategory.findMany({
      where: {
        siteId: resolvedSiteId,
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        parentId: true,
        name: true,
        slug: true,
        sortOrder: true,
        _count: { select: { products: true } },
      },
      take: 5000,
    });

    const flat = rows.map((r) => ({
      id: r.id,
      parentId: r.parentId,
      name: r.name,
      slug: r.slug,
      sortOrder: r.sortOrder ?? 0,
      count: r._count.products,
    }));

    const tree = buildTree(flat, basePath);

    return NextResponse.json({
      siteId: resolvedSiteId,
      domain,
      basePath,
      tree,
      items: flat,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}
