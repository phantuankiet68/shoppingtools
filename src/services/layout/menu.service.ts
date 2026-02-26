// services/admin/menu.service.ts
export type Locale = "en";

export type ApiMenuItem = {
  id: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  locale: Locale;
  setKey?: "home" | "v1" | string;
};

export const adminMenuService = {
  async layoutMenu(setKey = "v1") {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("size", "1000");
    params.set("sort", "sortOrder:asc");
    params.set("setKey", setKey);

    const res = await fetch(`/api/admin/builder/menus/layout?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load menu");
    return (await res.json()) as { siteId?: string; items?: ApiMenuItem[] };
  },
};
