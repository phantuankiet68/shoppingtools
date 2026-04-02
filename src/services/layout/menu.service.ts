// services/admin/menu.service.ts
import type { MenuArea, SystemRole } from "@/generated/prisma";

export type ApiMenuItem = {
  id: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  area: MenuArea;
};

export type ApiMenuTreeNode = {
  key: string;
  title: string;
  icon: string;
  path: string | null;
  parentKey: string | null;
  children?: ApiMenuTreeNode[];
};

export type LayoutMenuResponse = {
  area: MenuArea | null;
  systemRole: SystemRole;
  items: ApiMenuItem[];
};

export type LayoutMenuTreeResponse = {
  area: MenuArea | null;
  systemRole: SystemRole;
  tree: ApiMenuTreeNode[];
};

export const adminMenuService = {
  async layoutMenu(options?: { area?: MenuArea; includeHidden?: boolean }) {
    const params = new URLSearchParams();

    if (options?.area) {
      params.set("area", options.area);
    }

    if (options?.includeHidden) {
      params.set("includeHidden", "1");
    }

    const res = await fetch(`/api/admin/builder/menus/layout?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load menu");
    }

    return (await res.json()) as LayoutMenuResponse;
  },

  async layoutMenuTree(options?: { area?: MenuArea; includeHidden?: boolean }) {
    const params = new URLSearchParams();
    params.set("tree", "1");

    if (options?.area) {
      params.set("area", options.area);
    }

    if (options?.includeHidden) {
      params.set("includeHidden", "1");
    }

    const res = await fetch(`/api/admin/menus/layout?${params.toString()}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load menu tree");
    }

    return (await res.json()) as LayoutMenuTreeResponse;
  },
};
