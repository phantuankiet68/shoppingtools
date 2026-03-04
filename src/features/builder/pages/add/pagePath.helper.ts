import { slugify } from "@/lib/page/utils";

export function ensureLeadingSlash(p?: string | null) {
  if (!p) return "/";
  return p.startsWith("/") ? p : `/${p}`;
}

export function originFromDomain(domain?: string) {
  if (!domain) return "";
  const isProd = process.env.NODE_ENV === "production";
  return `${isProd ? "https" : "http"}://${domain}`;
}

export function normalizeSlugAndPath(inputSlug: string, inputTitle: string) {
  const safeTitle = (inputTitle || "").trim() || "Untitled";
  const raw = (inputSlug || "").trim();
  const isHome = raw === "/";
  const slugCore = isHome ? "" : slugify(raw.replace(/^\//, "") || safeTitle);

  const finalSlug = isHome ? "/" : slugCore;
  const finalPath = isHome ? "/" : `/${slugCore}`;

  return { safeTitle, isHome, finalSlug, finalPath };
}
