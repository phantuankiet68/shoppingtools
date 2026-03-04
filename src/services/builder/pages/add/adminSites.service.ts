import { API_ROUTES } from "@/constants/api";
export type SiteRow = {
  id: string;
  domain: string;
  name: string;
  localeDefault: string;
};

export async function fetchSites(signal?: AbortSignal): Promise<SiteRow[]> {
  const res = await fetch(API_ROUTES.ADMIN_BUILDER_SITES, { cache: "no-store", signal });
  if (!res.ok) return [];
  const data = await res.json().catch(() => ({}));
  return (data.items ?? []) as SiteRow[];
}
