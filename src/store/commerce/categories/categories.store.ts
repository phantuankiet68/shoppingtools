// src/store/categories.store.ts
"use client";

import { create } from "zustand";
import {
  CategoryRow,
  fetchCategoriesTree,
  getDefaultSiteId,
  createCategory,
  patchCategory,
  deleteCategory,
} from "@/services/commerce/categories/categories.service";

type CategoriesState = {
  siteId: string;
  siteLoading: boolean;
  siteErr: string;

  rows: CategoryRow[];
  loading: boolean;
  busy: boolean;
  err: string;

  activeId: string;
  q: string;

  initSite: () => Promise<void>;
  loadTree: (siteId?: string) => Promise<void>;

  setActiveId: (id: string) => void;
  setQ: (q: string) => void;

  createOne: (parentId: string | null, name: string) => Promise<CategoryRow>;
  patchOne: (
    id: string,
    patch: Partial<Pick<CategoryRow, "name" | "slug" | "parentId" | "sortOrder">>,
  ) => Promise<void>;
  removeOne: (id: string) => Promise<void>;
};

export const useCategoriesStore = create<CategoriesState>((set, get) => ({
  siteId: "",
  siteLoading: true,
  siteErr: "",

  rows: [],
  loading: true,
  busy: false,
  err: "",

  activeId: "",
  q: "",

  initSite: async () => {
    set({ siteLoading: true, siteErr: "" });
    try {
      const sid = await getDefaultSiteId();
      set({ siteId: sid });
    } catch (error: unknown) {
      const e = error as Error;
      set({ siteErr: e?.message || "Failed to load sites", siteId: "" });
    } finally {
      set({ siteLoading: false });
    }
  },

  loadTree: async (passedSiteId?: string) => {
    const sid = (passedSiteId ?? get().siteId).trim();
    if (!sid) return;

    set({ loading: true, err: "" });
    try {
      const rows = await fetchCategoriesTree(sid);
      set({
        rows,
        activeId: get().activeId && rows.some((x) => x.id === get().activeId) ? get().activeId : rows[0]?.id || "",
      });
    } catch (error: unknown) {
      const e = error as Error;
      set({ err: e?.message || "Failed to load categories", rows: [], activeId: "" });
    } finally {
      set({ loading: false });
    }
  },

  setActiveId: (id) => set({ activeId: id }),
  setQ: (q) => set({ q }),

  createOne: async (parentId, name) => {
    const sid = get().siteId.trim();
    if (!sid) throw new Error("Missing site");

    set({ busy: true });
    try {
      const row = await createCategory(sid, { name, slug: name, parentId }); // slug sẽ được page slugify trước khi gọi
      const next = [...get().rows, row].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
      set({ rows: next, activeId: row.id });
      return row;
    } finally {
      set({ busy: false });
    }
  },

  patchOne: async (id, patch) => {
    const sid = get().siteId.trim();
    if (!sid) throw new Error("Missing site");

    await patchCategory(sid, id, patch);
    // optimistic local update (nhẹ)
    set({
      rows: get().rows.map((x) => (x.id === id ? { ...x, ...patch } : x)),
    });
  },

  removeOne: async (id) => {
    const sid = get().siteId.trim();
    if (!sid) throw new Error("Missing site");

    set({ busy: true });
    try {
      await deleteCategory(sid, id);
      const next = get()
        .rows.filter((x) => x.id !== id)
        .map((x) => (x.parentId === id ? { ...x, parentId: null } : x));
      set({
        rows: next,
        activeId: get().activeId === id ? next[0]?.id || "" : get().activeId,
      });
    } finally {
      set({ busy: false });
    }
  },
}));
