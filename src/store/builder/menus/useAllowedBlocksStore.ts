"use client";

import { create } from "zustand";
import type { BuilderMenuItem, InternalPage } from "@/components/admin/builder/menus/state/useMenuStore";
import { makeDragPayload, makeNewMenuItem } from "@/services/builder/menus/allowedBlocks.service";

type State = {
  addByName: (params: {
    name: string;
    activeMenu: BuilderMenuItem[];
    setActiveMenu: (v: BuilderMenuItem[]) => void;
    internalPages: InternalPage[];
  }) => void;
  onDragStart: (e: React.DragEvent, params: { name: string; internalPages: InternalPage[] }) => void;
};

export const useAllowedBlocksStore = create<State>(() => ({
  addByName: ({ name, activeMenu, setActiveMenu, internalPages }) => {
    const item = makeNewMenuItem({ name, internalPages });
    setActiveMenu([...(activeMenu || []), item]);
  },

  onDragStart: (e, { name, internalPages }) => {
    const payload = makeDragPayload(internalPages, name);
    const json = JSON.stringify(payload);
    e.dataTransfer.setData("application/json", json);
    e.dataTransfer.setData("text/plain", json);
    e.dataTransfer.effectAllowed = "copy";
  },
}));
