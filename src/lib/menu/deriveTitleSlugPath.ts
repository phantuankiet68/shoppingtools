import { slugify } from "@/lib/page/utils";

export type InternalPage = {
  id: string;
  path: string;
};

export type MenuItemType = "PAGE" | "CUSTOM_URL";

export type BasicMenuItem = {
  id: string;
  title?: string | null;
  type: MenuItemType;
  pageId?: string | null;
  customUrl?: string | null;
  visible?: boolean;
  children?: BasicMenuItem[];
};

export type TSP = { title: string; slug: string; path: string };

function normalizePath(p?: string | null) {
  if (!p) return "";
  let s = String(p).trim();
  s = s.split("#")[0].split("?")[0];
  if (s && !/^https?:\/\//i.test(s) && !s.startsWith("/")) s = `/${s}`;
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

function slugFromPath(path: string) {
  const clean = normalizePath(path);
  if (!clean || clean === "/") return "/";
  const segs = clean.split("/").filter(Boolean);
  return segs[segs.length - 1] || "/";
}

export function deriveTriple(it: BasicMenuItem, internalPages: InternalPage[]): TSP | null {
  if (it.visible === false) return null;

  if (it.type !== "PAGE") return null;

  const title = String(it.title ?? "").trim() || "Untitled";

  const pid = it.pageId ?? null;
  const pagePath = pid ? internalPages.find((p) => p.id === pid)?.path : undefined;
  const path = normalizePath(pagePath);

  if (path) {
    return { title, slug: slugFromPath(path), path };
  }

  const s = slugify(title) || "untitled";
  return { title, slug: s, path: `/${s}` };
}

export function flattenTriples(items: BasicMenuItem[], internalPages: InternalPage[]): TSP[] {
  const out: TSP[] = [];

  const walk = (nodes?: BasicMenuItem[]) => {
    if (!nodes) return;
    for (const n of nodes) {
      const t = deriveTriple(n, internalPages);
      if (t) out.push(t);
      if (n.children?.length) walk(n.children);
    }
  };

  walk(items);

  const seen = new Set<string>();
  return out.filter((x) => {
    if (seen.has(x.path)) return false;
    seen.add(x.path);
    return true;
  });
}
