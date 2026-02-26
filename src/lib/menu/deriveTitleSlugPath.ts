import { slugify } from "@/lib/page/utils";
import type { BuilderMenuItem, InternalPage } from "@/components/admin/menu/state/useMenuStore";

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

function resolveInternalPath(it: BuilderMenuItem, internalPages: InternalPage[]) {
  // Ưu tiên page theo internalPageId
  const pid = it.internalPageId || "";
  const pagePath = pid ? internalPages.find((p) => p.id === pid)?.path : undefined;

  // Nếu không có pagePath thì dùng rawPath (user nhập tay)
  const raw = typeof it.rawPath === "string" ? it.rawPath : "";
  return normalizePath(pagePath || raw || "");
}

/**
 * Chỉ tạo triple cho item:
 * - visible !== false
 * - linkType === "internal"
 * - path là internal path (không phải external url)
 */
export function deriveTriple(it: BuilderMenuItem, internalPages: InternalPage[]): TSP | null {
  if (it.visible === false) return null;
  if (it.linkType !== "internal") return null;

  const title = String(it.title ?? "").trim() || "Untitled";

  const path = resolveInternalPath(it, internalPages);

  if (path) {
    // Nếu path là external (lỡ user nhập http), bỏ qua
    if (/^https?:\/\//i.test(path)) return null;
    return { title, slug: slugFromPath(path), path };
  }

  const s = slugify(title) || "untitled";
  return { title, slug: s, path: `/${s}` };
}

export function flattenTriples(items: BuilderMenuItem[], internalPages: InternalPage[]): TSP[] {
  const out: TSP[] = [];

  const walk = (nodes?: BuilderMenuItem[]) => {
    if (!nodes) return;
    for (const n of nodes) {
      const t = deriveTriple(n, internalPages);
      if (t) out.push(t);
      if (n.children?.length) walk(n.children);
    }
  };

  walk(items);

  // unique theo path
  const seen = new Set<string>();
  return out.filter((x) => {
    if (seen.has(x.path)) return false;
    seen.add(x.path);
    return true;
  });
}
