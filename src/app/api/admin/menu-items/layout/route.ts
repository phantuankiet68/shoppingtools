import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Locale, MenuSetKey, Prisma } from "@prisma/client";

export const runtime = "nodejs";

type LayoutItem = {
  id: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  locale: Locale;
  setKey: MenuSetKey;
};

const LOCALES: Locale[] = ["en"];
const SET_KEYS: MenuSetKey[] = ["home", "v1"];

function isLocale(v: string | null): v is Locale {
  return !!v && (LOCALES as string[]).includes(v);
}

function isMenuSetKey(v: string | null): v is MenuSetKey {
  return !!v && (SET_KEYS as string[]).includes(v);
}

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

type TreeNode = {
  key: string;
  title: string;
  icon: string;
  path: string | null;
  parentKey: string | null;
  children?: TreeNode[];
};

function buildTree(rows: LayoutItem[]): TreeNode[] {
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
    if (r.parentId && map.has(r.parentId)) map.get(r.parentId)!.children!.push(node);
    else roots.push(node);
  });
  const sortMap: Record<string, number> = {};
  rows.forEach((r) => (sortMap[r.id] = r.sortOrder));

  const sortRec = (arr?: TreeNode[]) => {
    if (!arr) return;
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

    const setKeyParam = url.searchParams.get("setKey");
    const setKey: MenuSetKey = isMenuSetKey(setKeyParam) ? setKeyParam : "v1";

    const localeParam = url.searchParams.get("locale");
    const locale: Locale = isLocale(localeParam) ? localeParam : "en";

    const includeHidden = url.searchParams.get("includeHidden") === "1";
    const tree = url.searchParams.get("tree") === "1";

    const where: Prisma.MenuItemWhereInput = {
      siteId,
      setKey,
      locale,
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
        locale: true,
        setKey: true,
      },
    });

    if (tree) {
      return NextResponse.json({
        siteId,
        setKey,
        locale,
        tree: buildTree(items as LayoutItem[]),
      });
    }

    return NextResponse.json({
      siteId,
      setKey,
      locale,
      items,
    });
  } catch (e) {
    console.error("GET /api/admin/menu-items/layout error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
