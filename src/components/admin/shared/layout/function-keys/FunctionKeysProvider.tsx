"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useDefaultFunctionKeys } from "./defaultFunctionKeys";
import { functionKeyMap, type FunctionKeyCode, type FunctionKeyConfig, type FunctionKeyItem } from "./functionKeys";

type FunctionKeyActions = Partial<Record<FunctionKeyCode, () => void>>;
type FunctionKeyConfigs = Partial<Record<FunctionKeyCode, FunctionKeyConfig>>;

type FunctionKeysContextValue = {
  items: FunctionKeyItem[];
  actions: FunctionKeyActions;
  setPageFunctionKeys: (configs?: FunctionKeyConfigs) => void;
  resetToDefault: () => void;
};

const FunctionKeysContext = createContext<FunctionKeysContextValue | null>(null);

function buildItems(configs: FunctionKeyConfigs) {
  return (Object.keys(configs) as FunctionKeyCode[])
    .filter((key) => !!configs[key]?.action)
    .sort((a, b) => Number(a.replace("F", "")) - Number(b.replace("F", "")))
    .map((key) => {
      const base = functionKeyMap[key];
      const override = configs[key];

      return {
        ...base,
        ...(override?.label ? { label: override.label } : {}),
        ...(override?.icon ? { icon: override.icon } : {}),
      };
    });
}

function buildActions(configs: FunctionKeyConfigs): FunctionKeyActions {
  const result: FunctionKeyActions = {};

  for (const key of Object.keys(configs) as FunctionKeyCode[]) {
    const action = configs[key]?.action;
    if (action) result[key] = action;
  }

  return result;
}

export function FunctionKeysProvider({ children }: { children: ReactNode }) {
  const defaultConfigs = useDefaultFunctionKeys();
  const [pageConfigs, setPageConfigs] = useState<FunctionKeyConfigs>({});

  const setPageFunctionKeys = useCallback((configs: FunctionKeyConfigs = {}) => {
    setPageConfigs(configs);
  }, []);

  const resetToDefault = useCallback(() => {
    setPageConfigs({});
  }, []);

  const mergedConfigs = useMemo<FunctionKeyConfigs>(
    () => ({
      ...defaultConfigs,
      ...pageConfigs,
    }),
    [defaultConfigs, pageConfigs],
  );

  const actions = useMemo(() => buildActions(mergedConfigs), [mergedConfigs]);
  const items = useMemo(() => buildItems(mergedConfigs), [mergedConfigs]);

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
