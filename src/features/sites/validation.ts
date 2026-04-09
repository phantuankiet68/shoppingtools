// features/builder/sites/validation.ts
import type { SiteRow, SitesListResponse } from "./types";

export function normalizeSitesResponse(data: any): SitesListResponse {
  const items: SiteRow[] = Array.isArray(data?.items) ? data.items : [];
  return { items };
}

export function isValidSiteRow(x: any): x is SiteRow {
  return (
    x &&
    typeof x.id === "string" &&
    typeof x.domain === "string" &&
    typeof x.name === "string" &&
    x.localeDefault === "en"
  );
}
