// src/store/builder/pages/add/controlsPalette.store.ts
import React from "react";

export function useControlsPaletteStore(initialOpenIds: string[]) {
  const [openTpl, setOpenTpl] = React.useState<Set<string>>(() => new Set(initialOpenIds));

  const toggleTpl = React.useCallback((id: string) => {
    setOpenTpl((prev) => {
      const n = new Set(prev);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }, []);

  const expandAll = React.useCallback((ids: string[]) => setOpenTpl(new Set(ids)), []);
  const collapseAll = React.useCallback(() => setOpenTpl(new Set()), []);

  return { openTpl, setOpenTpl, toggleTpl, expandAll, collapseAll };
}
