// src/services/categories.service.ts
export const ADMIN_BUILDER_SITES = "/api/admin/builder/sites";

export type ApiCategory = {
  id: string;
  siteId: string;
  parentId: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  _count?: { products?: number };
  count?: number;
};

export type CategoryRow = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  count: number;
};

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
    parentId: c.parentId,
    name: c.name,
    slug: c.slug,
    sortOrder: Number.isFinite(c.sortOrder) ? c.sortOrder : 0,
    count: Number(c.count ?? c._count?.products ?? 0),
  };
}

export async function getDefaultSiteId(): Promise<string> {
  const data = await jfetch<unknown>(ADMIN_BUILDER_SITES);
  const sidFromApi = extractFirstSiteId(data);
  const sidFromLS = String(localStorage.getItem("builder_site_id") ?? "").trim();
  const sid = sidFromApi || sidFromLS;
  if (!sid) throw new Error("No site found. Please create/select a site first.");
  localStorage.setItem("builder_site_id", sid);
  return sid;
}

export async function fetchCategoriesTree(siteId: string): Promise<CategoryRow[]> {
  const data = await jfetch<{ items: ApiCategory[] }>(
    `/api/admin/commerce/categories?siteId=${encodeURIComponent(siteId)}&tree=1&sort=sortasc&pageSize=5000`,
  );
  const rows = (data.items || []).map(mapApiCategoryToRow);
  rows.sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  return rows;
}

export async function createCategory(siteId: string, payload: { name: string; slug: string; parentId: string | null }) {
  const res = await jfetch<{ item: ApiCategory }>("/api/admin/commerce/categories", {
    method: "POST",
    body: JSON.stringify({ siteId, ...payload }),
  });
  return mapApiCategoryToRow(res.item);
}

export async function patchCategory(
  siteId: string,
  id: string,
  patch: Partial<Pick<CategoryRow, "name" | "slug" | "parentId" | "sortOrder">>,
) {
  await jfetch(`/api/admin/commerce/categories/${id}?siteId=${encodeURIComponent(siteId)}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}

export async function deleteCategory(siteId: string, id: string) {
  await jfetch(`/api/admin/commerce/categories/${id}?siteId=${encodeURIComponent(siteId)}`, {
    method: "DELETE",
  });
}
