"use client";

import { create } from "zustand";
import { sitesService, Site } from "@/services/builder/site";

type SitesState = {
  items: Site[];
  loading: boolean;
  busy: boolean;
  activeId: string;

  toast: string | null;
  showToast: (msg: string) => void;
  clearToast: () => void;

  setActiveId: (id: string) => void;
  load: () => Promise<void>;
  createSite: (domain: string, name: string) => Promise<Site | null>;
  deleteActive: () => Promise<void>;
};

export const useSitesStore = create<SitesState>((set, get) => ({
  items: [],
  loading: true,
  busy: false,
  activeId: "",

  toast: null,
  showToast: (msg) => {
    set({ toast: msg });
    // auto clear sau 2.5s
    window.setTimeout(() => {
      // chỉ clear nếu toast vẫn là msg hiện tại (tránh race)
      if (get().toast === msg) set({ toast: null });
    }, 2500);
  },
  clearToast: () => set({ toast: null }),

  setActiveId: (id) => set({ activeId: id }),

  load: async () => {
    set({ loading: true });
    try {
      const data = await sitesService.list();
      const prev = get().activeId;

      set({
        items: data,
        activeId: prev && data.some((x) => x.id === prev) ? prev : data[0]?.id || "",
      });
    } catch (e: any) {
      get().showToast(e?.message || "Load failed");
    } finally {
      set({ loading: false });
    }
  },

  createSite: async (domain, name) => {
    if (!domain) {
      get().showToast("Domain is required");
      return null;
    }
    if (!name) {
      get().showToast("Site name is required");
      return null;
    }

    set({ busy: true });
    try {
      const created = await sitesService.create({ domain, name });

      try {
        localStorage.setItem("builder_site_id", created.id);
      } catch {}

      get().showToast("Created.");
      await get().load();
      set({ activeId: created.id });
      return created;
    } catch (e: any) {
      get().showToast(e?.message || "Create failed");
      return null;
    } finally {
      set({ busy: false });
    }
  },

  deleteActive: async () => {
    const { activeId, items } = get();
    const active = items.find((x) => x.id === activeId);
    if (!active) return;

    set({ busy: true });
    try {
      await sitesService.remove(active.id);
      get().showToast("Deleted.");
      await get().load();
    } catch (e: any) {
      get().showToast(e?.message || "Delete failed");
    } finally {
      set({ busy: false });
    }
  },
}));
