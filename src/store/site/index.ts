"use client";

import { create } from "zustand";
import { sitesService, Site, UpdateSitePayload } from "@/services/site";

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
  updateActive: (payload: UpdateSitePayload) => Promise<Site | null>;
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
    window.setTimeout(() => {
      if (get().toast === msg) set({ toast: null });
    }, 2500);
  },
  clearToast: () => set({ toast: null }),

  setActiveId: (id) => set({ activeId: id }),

load: async () => {
  set({ loading: true });

  try {
    const res = await fetch("/api/admin/sites", {
      cache: "no-store",
    });

    if (!res.ok) {
      throw new Error("Failed to load sites");
    }

    const json = await res.json();

    set({
      items: Array.isArray(json?.items) ? json.items : [],
      loading: false,
    });
  } catch (error) {
    set({
      items: [],
      loading: false,
      toast: error instanceof Error ? error.message : "Failed to load sites",
    });
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Create failed";
      get().showToast(msg);
      return null;
    } finally {
      set({ busy: false });
    }
  },

  updateActive: async (payload) => {
    const { activeId, items } = get();
    const active = items.find((x) => x.id === activeId);

    if (!active) {
      get().showToast("No active site selected");
      return null;
    }

    if (!payload.domain?.trim()) {
      get().showToast("Domain is required");
      return null;
    }

    if (!payload.name?.trim()) {
      get().showToast("Site name is required");
      return null;
    }

    set({ busy: true });
    try {
      const updated = await sitesService.update(active.id, payload);

      set((state) => ({
        items: state.items.map((item) => (item.id === active.id ? updated : item)),
      }));

      get().showToast("Saved.");
      return updated;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Update failed";
      get().showToast(msg);
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
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Delete failed";
      get().showToast(msg);
    } finally {
      set({ busy: false });
    }
  },
}));
