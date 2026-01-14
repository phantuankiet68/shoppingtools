// app/(admin)/menu/lib/deriveTitleSlugPath.ts
import { slugify } from "@/lib/page/utils";

export type Locale = "vi" | "en" | "ja";

export type BasicMenuItem = {
  id: string;
  title?: string;
  label?: string;
  name?: string;

  linkType?: "internal" | "external" | "scheduled";
  internalPageId?: string | null;
  externalUrl?: string | null;

  href?: string | null;
  path?: string | null;
  url?: string | null;
  rawPath?: string | null;

  // ✅ optional (nếu menu có field visible)
  visible?: boolean;

  children?: BasicMenuItem[];
};

export type TSP = { title: string; slug: string; path: string };

function pickTitle(it: BasicMenuItem) {
  return (it.title || it.label || it.name || "").trim();
}

function pickHref(it: BasicMenuItem) {
  // ưu tiên rawPath vì đây là thứ bạn đang lưu/preview trong builder
  return (it.rawPath ?? it.href ?? it.path ?? it.url ?? "").trim();
}

function isExternalHref(href: string) {
  return /^https?:\/\//i.test(href);
}

function isLocalePrefixed(href: string, locale: Locale) {
  return href === `/` || href.startsWith(``);
}

function looksLikeHome(href: string) {
  const h = href.trim();
  return h === "/" || h === "";
}

// ✅ route legacy: không ép locale
function isV1Path(href: string) {
  return href === "/v1" || href.startsWith("/v1/");
}

// chỉ chấp nhận internal path kiểu "/a/b-c"
function isCleanInternalPath(href: string) {
  return /^\/[a-z0-9\-\/]*$/i.test(href);
}

export function deriveTriple(locale: Locale, it: BasicMenuItem): TSP | null {
  // ✅ bỏ qua item ẩn (nếu dùng visible)
  if (it.visible === false) return null;

  // chỉ sync seo cho internal
  if (it.linkType && it.linkType !== "internal") return null;

  const title = pickTitle(it) || "Untitled";
  const hrefRaw = pickHref(it);

  // external -> bỏ
  if (hrefRaw && isExternalHref(hrefRaw)) return null;

  // home
  if (looksLikeHome(hrefRaw)) {
    return { title, slug: "/", path: `/` };
  }

  // v1: không ép locale
  if (hrefRaw && isV1Path(hrefRaw) && isCleanInternalPath(hrefRaw)) {
    const segs = hrefRaw.split("/").filter(Boolean);
    const last = segs.pop() || "";
    const slug = hrefRaw === "/v1" ? "v1" : last;
    return { title, slug, path: hrefRaw };
  }

  // path nội bộ hợp lệ
  if (hrefRaw && isCleanInternalPath(hrefRaw)) {
    // nếu đã có /vi /en /ja -> giữ nguyên
    if (isLocalePrefixed(hrefRaw, locale)) {
      const segs = hrefRaw.split("/").filter(Boolean);
      const last = segs.pop() || "";
      const slug = hrefRaw === `/` ? "/" : last;
      return { title, slug, path: hrefRaw };
    }

    // chưa có locale -> prefix
    const withPrefix = hrefRaw === "/" ? `/` : `${hrefRaw.replace(/^\//, "")}`;
    const segs = withPrefix.split("/").filter(Boolean);
    const last = segs.pop() || "";
    const slug = withPrefix === `/` ? "/" : last;
    return { title, slug, path: withPrefix };
  }

  // fallback: tạo slug từ title
  const s = slugify(title) || "untitled";
  return { title, slug: s, path: `${s}` };
}

export function flattenTriples(locale: Locale, items: BasicMenuItem[]): TSP[] {
  const out: TSP[] = [];

  const walk = (nodes?: BasicMenuItem[]) => {
    if (!nodes) return;
    for (const n of nodes) {
      const t = deriveTriple(locale, n);
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
