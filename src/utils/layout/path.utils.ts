// utils/admin/path.utils.ts
export const LOCALE_PREFIX = /^\/(en)(?=\/|$)/i;

export function normalize(p?: string | null): string {
  if (!p) return "";
  let s = p.split("#")[0].split("?")[0].trim();
  if (!s.startsWith("/")) s = "/" + s;
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

export function stripLocale(p?: string | null): string {
  const s = normalize(p);
  return (s.replace(LOCALE_PREFIX, "") || "/").replace(/\/{2,}/g, "/");
}
