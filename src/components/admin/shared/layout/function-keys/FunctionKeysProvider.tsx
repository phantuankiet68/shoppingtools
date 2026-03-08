"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useDefaultFunctionKeys } from "./defaultFunctionKeys";
import { functionKeyMap, type FunctionKeyCode, type FunctionKeyItem } from "./functionKeys";

type FunctionKeyActions = Partial<Record<FunctionKeyCode, () => void>>;

type FunctionKeysContextValue = {
  items: FunctionKeyItem[];
  actions: FunctionKeyActions;
  setPageFunctionKeys: (extraActions?: FunctionKeyActions) => void;
  resetToDefault: () => void;
};

const FunctionKeysContext = createContext<FunctionKeysContextValue | null>(null);

function buildItems(actions: FunctionKeyActions) {
  return (Object.keys(actions) as FunctionKeyCode[])
    .sort((a, b) => {
      const aNum = Number(a.replace("F", ""));
      const bNum = Number(b.replace("F", ""));
      return aNum - bNum;
    })
    .map((key) => functionKeyMap[key]);
}

export function FunctionKeysProvider({ children }: { children: ReactNode }) {
  const defaultActions = useDefaultFunctionKeys();
  const [pageActions, setPageActions] = useState<FunctionKeyActions>({});

  const setPageFunctionKeys = useCallback((extraActions: FunctionKeyActions = {}) => {
    setPageActions(extraActions);
  }, []);

  const resetToDefault = useCallback(() => {
    setPageActions({});
  }, []);

  const actions = useMemo<FunctionKeyActions>(
    () => ({
      ...defaultActions,
      ...pageActions,
    }),
    [defaultActions, pageActions],
  );

  const items = useMemo(() => buildItems(actions), [actions]);

  const value = useMemo<FunctionKeysContextValue>(
    () => ({
      items,
      actions,
      setPageFunctionKeys,
      resetToDefault,
    }),
    [items, actions, setPageFunctionKeys, resetToDefault],
  );

  return <FunctionKeysContext.Provider value={value}>{children}</FunctionKeysContext.Provider>;
}

export function useFunctionKeysContext() {
  const ctx = useContext(FunctionKeysContext);
  if (!ctx) {
    throw new Error("useFunctionKeysContext must be used within FunctionKeysProvider");
  }
  return ctx;
}
