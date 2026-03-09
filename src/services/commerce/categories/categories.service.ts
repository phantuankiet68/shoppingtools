// src/services/categories.service.ts
import { API_ROUTES } from "@/constants/api";

export const ADMIN_BUILDER_SITES = API_ROUTES.ADMIN_BUILDER.SITES;
export const ADMIN_CATEGORIES_API = API_ROUTES.ADMIN_COMMERCE.CATEGORIES;

export type ApiCategory = {
  id: string;
  siteId: string;
  parentId: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  _count?: { products?: number };
  count?: number;
};

export type CategoryRow = {
  id: string;
  siteId: string;
  parentId: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  count: number;
};

type CategoryPatch = Partial<Pick<CategoryRow, "name" | "slug" | "parentId" | "sortOrder">>;

async function jfetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const text = await res.text().catch(() => "");
  let json: Record<string, unknown> = {};

  if (text) {
    try {
      json = JSON.parse(text);
    } catch {
      json = {};
    }
  }

  if (!res.ok) {
    const msg = (typeof json?.error === "string" && json.error) || "Request failed";
    throw new Error(msg);
  }

  return json as T;
}

function extractFirstSiteId(payload: unknown): string {
  const obj = (payload ?? {}) as Record<string, unknown>;

  const candidates =
    (Array.isArray(payload) ? payload : null) ??
    (Array.isArray(obj.items) ? obj.items : null) ??
    (Array.isArray(obj.sites) ? obj.sites : null) ??
    (Array.isArray(obj.data) ? obj.data : null) ??
    [];

  const first = candidates.find((x) => typeof x === "object" && x !== null) as Record<string, unknown> | undefined;

  return String(first?.id || first?.siteId || first?._id || "").trim();
}

function buildCategoriesUrl(siteId: string, extra?: Record<string, string | number | boolean | null | undefined>) {
  const url = new URL(ADMIN_CATEGORIES_API, window.location.origin);
  url.searchParams.set("siteId", siteId);

  if (extra) {
    for (const [key, value] of Object.entries(extra)) {
      if (value !== null && value !== undefined && value !== "") {
        url.searchParams.set(key, String(value));
      }
    }
  }

  return `${url.pathname}${url.search}`;
}

function buildCategoryDetailUrl(id: string, siteId: string) {
  const url = new URL(`${ADMIN_CATEGORIES_API}/${id}`, window.location.origin);
  url.searchParams.set("siteId", siteId);
  return `${url.pathname}${url.search}`;
}

export function slugify(input: string) {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function mapApiCategoryToRow(c: ApiCategory): CategoryRow {
  return {
    id: c.id,
    siteId: c.siteId,
    parentId: c.parentId,
    name: c.name,
    slug: c.slug,
    sortOrder: Number.isFinite(c.sortOrder) ? c.sortOrder : 0,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    count: Number(c.count ?? c._count?.products ?? 0),
  };
}

export async function getDefaultSiteId(): Promise<string> {
  const data = await jfetch<unknown>(ADMIN_BUILDER_SITES);
  const sidFromApi = extractFirstSiteId(data);
  const sidFromLS = String(localStorage.getItem("builder_site_id") ?? "").trim();
  const sid = sidFromApi || sidFromLS;

  if (!sid) {
    throw new Error("No site found. Please create/select a site first.");
  }

  localStorage.setItem("builder_site_id", sid);
  return sid;
}

export async function fetchCategoriesTree(siteId: string): Promise<CategoryRow[]> {
  const url = buildCategoriesUrl(siteId, {
    tree: 1,
    sort: "sortasc",
    pageSize: 5000,
  });

  const data = await jfetch<{ items: ApiCategory[] }>(url);
  const rows = (data.items || []).map(mapApiCategoryToRow);
  rows.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  return rows;
}

export async function createCategory(
  siteId: string,
  payload: { name: string; slug: string; parentId: string | null },
): Promise<CategoryRow> {
  const res = await jfetch<{ item: ApiCategory }>(ADMIN_CATEGORIES_API, {
    method: "POST",
    body: JSON.stringify({ siteId, ...payload }),
  });

  return mapApiCategoryToRow(res.item);
}

export async function patchCategory(siteId: string, id: string, patch: CategoryPatch): Promise<CategoryRow> {
  const res = await jfetch<{ item: ApiCategory }>(buildCategoryDetailUrl(id, siteId), {
    method: "PATCH",
    body: JSON.stringify(patch),
  });

  return mapApiCategoryToRow(res.item);
}

export async function deleteCategory(siteId: string, id: string): Promise<void> {
  await jfetch(buildCategoryDetailUrl(id, siteId), {
    method: "DELETE",
  });
}
