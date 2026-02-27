// services/builder/menus/state/menuItems.service.ts
import { API_ROUTES } from "@/constants/api";

export type MenuSetKey = "home" | "v1";

export type DbMenuItem = {
  id: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  setKey: MenuSetKey;
  createdAt?: string;
  updatedAt?: string;
};

export async function fetchMenuItems(params: {
  setKey: MenuSetKey;
  siteId?: string;
  page?: number;
  size?: number;
  signal?: AbortSignal;
}): Promise<DbMenuItem[]> {
  const qs = new URLSearchParams();
  qs.set("page", String(params.page ?? 1));
  qs.set("size", String(params.size ?? 1000));
  qs.set("sort", "sortOrder:asc");
  qs.set("setKey", params.setKey);
  if (params.siteId) qs.set("siteId", params.siteId);

  const res = await fetch(`/api/admin/builder/menus?${qs.toString()}`, {
    cache: "no-store",
    signal: params.signal,
  });

  if (!res.ok) throw new Error(`Load failed (${res.status})`);

  const data = await res.json();
  return (data?.items ?? []) as DbMenuItem[];
}

export async function saveMenuTree(payload: {
  setKey: MenuSetKey;
  siteId?: string;
  items: Array<{
    id: string;
    parentId: string | null;
    title: string;
    path: string | null;
    icon: string | null;
    sortOrder: number;
    visible: boolean;
    setKey: MenuSetKey;
  }>;
}): Promise<void> {
  const res = await fetch(API_ROUTES.ADMIN_BUILDER_MENUS_SAVE_TREE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(t || "Save failed");
  }
}
