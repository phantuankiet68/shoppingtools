// store/admin/useMenuBuilderUIStore.ts
"use client";

import { create } from "zustand";
import type { SiteRow } from "@/services/builder/menus/menuBuilder.service";

export type NoticeState = {
  open: boolean;
  title?: string;
  message?: string;
  variant?: "success" | "error" | "info" | "warning";
};

type UIState = {
  saving: boolean;
  loading: boolean;
  refreshing: boolean;

  notice: NoticeState;

  sites: SiteRow[];
  selectedSiteId: string;
  hideSiteSelect: boolean;

  setSaving: (v: boolean) => void;
  setLoading: (v: boolean) => void;
  setRefreshing: (v: boolean) => void;

  setNotice: (v: NoticeState | ((prev: NoticeState) => NoticeState)) => void;

  setSites: (v: SiteRow[]) => void;
  setSelectedSiteId: (v: string) => void;
  setHideSiteSelect: (v: boolean) => void;
};

export const useMenuBuilderUIStore = create<UIState>((set) => ({
  saving: false,
  loading: false,
  refreshing: false,

  notice: { open: false },

  sites: [],
  selectedSiteId: "",
  hideSiteSelect: false,

  setSaving: (v) => set({ saving: v }),
  setLoading: (v) => set({ loading: v }),
  setRefreshing: (v) => set({ refreshing: v }),

  setNotice: (v) =>
    set((s) => ({
      notice: typeof v === "function" ? v(s.notice) : v,
    })),

  setSites: (v) => set({ sites: v }),
  setSelectedSiteId: (v) => set({ selectedSiteId: v }),
  setHideSiteSelect: (v) => set({ hideSiteSelect: v }),
}));
