export const ADMIN_LOCALES = ["vi", "en", "ja"] as const;

export type AdminLocale = (typeof ADMIN_LOCALES)[number];

export const DEFAULT_ADMIN_LOCALE: AdminLocale = "en";

export function isAdminLocale(value: string): value is AdminLocale {
  return ADMIN_LOCALES.includes(value as AdminLocale);
}

export function countryToAdminLocale(country?: string | null): AdminLocale {
  switch ((country ?? "").toUpperCase()) {
    case "VN":
      return "vi";
    case "JP":
      return "ja";
    default:
      return "en";
  }
}