"use client";

import { create } from "zustand";
import type { AdminUser } from "@/services/layout/auth.service";
import { adminAuthService } from "@/services/layout/auth.service";
import { adminMenuService } from "@/services/layout/menu.service";
import { buildTree, bestMatchWithTrail, type Item } from "@/utils/layout/menu.utils";
import { stripLocale } from "@/utils/layout/path.utils";

type NotiTab = "all" | "messages" | "tasks" | "alerts";

type State = {
  // ui
  sidebarOpen: boolean;
  collapsed: boolean;

  // user + menus
  user: AdminUser | null;
  items: Item[];
  openGroups: Record<string, boolean>;
  activeKey: string;

  // dropdowns
  userMenuOpen: boolean;
  notiOpen: boolean;
  notiTab: NotiTab;

  // actions
  toggleSidebar: () => void;
  setSidebarOpen: (v: boolean) => void;
  setCollapsed: (v: boolean) => void;

  setUserMenuOpen: (v: boolean) => void;
  setNotiOpen: (v: boolean) => void;
  setNotiTab: (v: NotiTab) => void;

  loadMe: () => Promise<void>;
  loadMenu: () => Promise<void>;

  setActiveKey: (k: string) => void;
  syncActiveByPathname: (pathname: string) => void;

  toggleGroupExclusive: (k: string) => void;
  openGroupExclusive: (k: string) => void;

  logout: () => Promise<void>;
};

export const useAdminLayoutStore = create<State>((set, get) => ({
  sidebarOpen: true,
  collapsed: false,

  user: null,
  items: [],
  openGroups: {},
  activeKey: "",

  userMenuOpen: false,
  notiOpen: false,
  notiTab: "all",

  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (v) => set({ sidebarOpen: v }),
  setCollapsed: (v) => set({ collapsed: v }),

  setUserMenuOpen: (v) => set({ userMenuOpen: v }),
  setNotiOpen: (v) => set({ notiOpen: v }),
  setNotiTab: (v) => set({ notiTab: v }),

  loadMe: async () => {
    try {
      const data = await adminAuthService.me();
      set({ user: data?.user ?? null });
    } catch {}
  },

  loadMenu: async () => {
    try {
      const data = await adminMenuService.layoutMenu("v1");
      try {
        if (data?.siteId) localStorage.setItem("builder_site_id", data.siteId);
      } catch {}

      const tree = buildTree(data.items || []);
      set({ items: tree, openGroups: {} });
    } catch {
      set({ items: [] });
    }
  },

  setActiveKey: (k) => set({ activeKey: k }),

  syncActiveByPathname: (pathname: string) => {
    const items = get().items;
    if (!pathname || !items.length) return;

    const current = stripLocale(pathname);
    const res = bestMatchWithTrail(items, current);

    if (res?.hit) {
      set((s) => ({
        activeKey: res.hit.key,
        openGroups: { ...s.openGroups, ...Object.fromEntries(res.trail.map((k) => [k, true])) },
      }));

      try {
        localStorage.setItem("sb_active_key", res.hit.key);
      } catch {}
      return;
    }

    try {
      const k = localStorage.getItem("sb_active_key");
      if (k) set({ activeKey: k });
    } catch {}
  },

  toggleGroupExclusive: (gKey) =>
    set((s) => {
      const isOpen = !!s.openGroups[gKey];
      return { openGroups: isOpen ? {} : { [gKey]: true } };
    }),

  openGroupExclusive: (gKey) =>
    set((s) => {
      if (s.openGroups[gKey]) return s;
      return { openGroups: { [gKey]: true } };
    }),

  logout: async () => {
    try {
      await adminAuthService.logout();
    } finally {
      // routing do component đảm nhiệm (vì cần useRouter)
    }
  },
}));
