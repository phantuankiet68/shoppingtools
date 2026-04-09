import type { PageRow } from "@/lib/builder/pages/types";
import { API_ROUTES } from "@/constants/api";

type StatusFilter = "all" | "DRAFT" | "PUBLISHED";
type SortKey = "updatedAt" | "createdAt" | "title";
type SortDir = "asc" | "desc";

export type SiteOption = { id: string; name?: string };
export type SiteFilter = "all" | string;

// Extend safely in case API returns different naming
export type PageRowWithSite = PageRow & {
  siteId?: string | null;
  site_id?: string | null;
  siteDomain?: string | null;
};

export type ListPagesInput = {
  q: string;
  page: number;
  pageSize: number;
  status: StatusFilter;
  sortKey: SortKey;
  sortDir: SortDir;
  siteId: SiteFilter;
};

export type ListPagesResult = {
  items: PageRowWithSite[];
  total: number;
  derivedSites: SiteOption[];
};

function normalizeSitesFromSitesApi(json: unknown): SiteOption[] {
  const data = json as { items?: unknown[]; sites?: unknown[] };

  const items: SiteOption[] = (data.items || data.sites || []).map((s: unknown) => {
    if (typeof s === "object" && s) {
      const obj = s as Record<string, unknown>;
      const id = String(obj.id ?? obj.site_id ?? "");
      const name = obj.name ? String(obj.name) : undefined;
      return { id, name };
    }
    return { id: String(s) };
  });

  // uniq by id
  return Array.from(new Map(items.filter((x) => x.id).map((x) => [x.id, x])).values());
}

function deriveSitesFromPages(items: PageRowWithSite[]): SiteOption[] {
  const uniqueIds = Array.from(new Set(items.map((p) => p.siteId ?? p.site_id).filter((x): x is string => Boolean(x))));
  return uniqueIds.map((id) => ({ id }));
}

export async function fetchSites(): Promise<SiteOption[]> {
  const res = await fetch(API_ROUTES.ADMIN_BUILDER_SITES);
  if (!res.ok) throw new Error("Failed to load sites");

  const json = (await res.json()) as unknown;
  return normalizeSitesFromSitesApi(json);
}

export async function fetchPagesList(input: ListPagesInput): Promise<ListPagesResult> {
  const { q, page, pageSize, status, sortKey, sortDir, siteId } = input;

  const params = new URLSearchParams({
    q,
    offset: String((page - 1) * pageSize),
    limit: String(pageSize),
    sort: sortKey,
    dir: sortDir,
  });

  if (status !== "all") params.set("status", status);
  if (siteId !== "all") params.set("siteId", siteId);

  const res = await fetch(`${API_ROUTES.ADMIN_BUILDER.PAGES_LIST}?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to load pages");

  const json = (await res.json()) as { items?: unknown[]; total?: unknown };
  const items = (json.items || []) as PageRowWithSite[];

  return {
    items,
    total: Number(json.total ?? items.length),
    derivedSites: deriveSitesFromPages(items),
  };
}

export async function deletePage(id: string): Promise<void> {
  const res = await fetch(API_ROUTES.ADMIN_BUILDER.PAGE(id), { method: "DELETE" });
  if (!res.ok) throw new Error("Delete failed");
}

export async function duplicatePage(id: string): Promise<void> {
  const res = await fetch(API_ROUTES.ADMIN_BUILDER.PAGE_DUPLICATE(id), { method: "POST" });
  if (!res.ok) throw new Error("Duplicate failed");
}

export async function publishPage(id: string): Promise<void> {
  const res = await fetch(API_ROUTES.ADMIN_BUILDER.PAGE_PUBLISH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("publish failed");
}

export async function unpublishPage(id: string): Promise<void> {
  const res = await fetch(API_ROUTES.ADMIN_BUILDER.PAGE_UNPUBLISH, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  if (!res.ok) throw new Error("unpublish failed");
}
