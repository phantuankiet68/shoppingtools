"use client";

import { create } from "zustand";
import type {
  BuilderMenuItem,
  InternalPage,
  MenuLocale,
} from "@/components/admin/menus/state/useMenuStore";
import {
  makeDragPayload,
  makeNewMenuItem,
} from "@/services/menus/allowedBlocks.service";
import type { TranslateFn } from "@/services/menus/allowedBlocks.service";

type State = {
  addByName: (params: {
    name: string;
    activeMenu: BuilderMenuItem[];
    setActiveMenu: (v: BuilderMenuItem[]) => void;
    internalPages: InternalPage[];
    locale: MenuLocale;
    t: TranslateFn;
  }) => void;
  onDragStart: (
    e: React.DragEvent,
    params: {
      name: string;
      internalPages: InternalPage[];
      locale: MenuLocale;
      t: TranslateFn;
    },
  ) => void;
};

export const useAllowedBlocksStore = create<State>(() => ({
  addByName: ({ name, activeMenu, setActiveMenu, internalPages, locale, t }) => {
    const item = makeNewMenuItem({ name, internalPages, locale, t });
    setActiveMenu([...(activeMenu || []), item]);
  },

  onDragStart: (e, { name, internalPages, locale, t }) => {
    const payload = makeDragPayload(internalPages, name, locale, t);
    const json = JSON.stringify(payload);
    e.dataTransfer.setData("application/json", json);
    e.dataTransfer.setData("text/plain", json);
    e.dataTransfer.effectAllowed = "copy";
  },
}));