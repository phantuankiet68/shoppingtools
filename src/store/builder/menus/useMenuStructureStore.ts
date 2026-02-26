"use client";

import { create } from "zustand";
import type { BuilderMenuItem } from "@/components/admin/builder/menus/state/useMenuStore";

type MenuItem = BuilderMenuItem;

type MenuStructureState = {
  editing: MenuItem | null;
  q: string;

  confirmOpen: boolean;
  pendingDeleteId: string | null;
  busy: boolean;

  setEditing: (v: MenuItem | null) => void;
  setQ: (v: string) => void;

  askDelete: (id: string) => void;
  closeConfirm: () => void;

  setBusy: (v: boolean) => void;
  clearDeleteState: () => void;
};

export const useMenuStructureStore = create<MenuStructureState>((set) => ({
  editing: null,
  q: "",

  confirmOpen: false,
  pendingDeleteId: null,
  busy: false,

  setEditing: (v) => set({ editing: v }),
  setQ: (v) => set({ q: v }),

  askDelete: (id) => set({ pendingDeleteId: id, confirmOpen: true }),
  closeConfirm: () => set({ confirmOpen: false, pendingDeleteId: null }),

  setBusy: (v) => set({ busy: v }),

  clearDeleteState: () => set({ confirmOpen: false, pendingDeleteId: null, busy: false }),
}));
