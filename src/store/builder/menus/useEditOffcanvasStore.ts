"use client";

import { create } from "zustand";
import type { BuilderMenuItem } from "@/components/admin/builder/menus/state/useMenuStore";

type ScheduleRow = { when: string; url: string };

type DraftUpdater = BuilderMenuItem | ((prev: BuilderMenuItem) => BuilderMenuItem);

type State = {
  draft: BuilderMenuItem | null;
  saving: boolean;
  pathInput: string;
  copied: boolean;

  // setters
  setDraft: (updater: DraftUpdater) => void;
  setSaving: (v: boolean) => void;
  setPathInput: (v: string) => void;
  setCopied: (v: boolean) => void;

  // helpers
  initFromItem: (item: BuilderMenuItem, initialPath: string) => void;
  reset: () => void;

  // schedule actions
  addScheduleRow: () => void;
  delScheduleRow: (idx: number) => void;
};

export const useEditOffcanvasStore = create<State>((set, get) => ({
  draft: null,
  saving: false,
  pathInput: "",
  copied: false,

  setDraft: (updater) => {
    const current = get().draft;

    if (!current) {
      if (typeof updater === "function") return;
      set({ draft: updater });
      return;
    }

    if (typeof updater === "function") {
      const next = updater(current);
      set({ draft: next });
    } else {
      set({ draft: updater });
    }
  },

  setSaving: (v) => set({ saving: v }),
  setPathInput: (v) => set({ pathInput: v }),
  setCopied: (v) => set({ copied: v }),

  initFromItem: (item, initialPath) =>
    set({
      draft: item,
      pathInput: initialPath,
      copied: false,
    }),

  reset: () =>
    set({
      draft: null,
      saving: false,
      pathInput: "",
      copied: false,
    }),

  // --- Schedule helpers ---
  addScheduleRow: () => {
    const d = get().draft;
    if (!d) return;

    const row: ScheduleRow = { when: "", url: "" };

    set({
      draft: {
        ...d,
        schedules: [...(d.schedules || []), row],
      },
    });
  },

  delScheduleRow: (idx) => {
    const d = get().draft;
    if (!d) return;

    const next = [...(d.schedules || [])];
    next.splice(idx, 1);

    set({
      draft: {
        ...d,
        schedules: next,
      },
    });
  },
}));
