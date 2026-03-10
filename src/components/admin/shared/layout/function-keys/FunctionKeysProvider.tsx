"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { useDefaultFunctionKeys } from "./defaultFunctionKeys";
import {
  functionKeyMap,
  type FunctionKeyCode,
  type FunctionKeyConfig,
  type FunctionKeyInput,
  type FunctionKeyItem,
} from "./functionKeys";

type FunctionKeyActions = Partial<Record<FunctionKeyCode, () => void>>;
type FunctionKeyConfigs = Partial<Record<FunctionKeyCode, FunctionKeyConfig>>;

type FunctionKeysContextValue = {
  items: FunctionKeyItem[];
  actions: FunctionKeyActions;
  setPageFunctionKeys: (configs?: FunctionKeyInput) => void;
  resetToDefault: () => void;
};

const FunctionKeysContext = createContext<FunctionKeysContextValue | null>(null);

function normalizeFunctionKeyInput(input: FunctionKeyInput = {}): FunctionKeyConfigs {
  const result: FunctionKeyConfigs = {};

  for (const key of Object.keys(input) as FunctionKeyCode[]) {
    const value = input[key];
    if (!value) continue;

    if (typeof value === "function") {
      result[key] = { action: value };
    } else {
      result[key] = value;
    }
  }

  return result;
}

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
  const defaultInput = useDefaultFunctionKeys();
  const [pageInput, setPageInput] = useState<FunctionKeyInput>({});

  const setPageFunctionKeys = useCallback((configs: FunctionKeyInput = {}) => {
    setPageInput(configs);
  }, []);

  const resetToDefault = useCallback(() => {
    setPageInput({});
  }, []);

  const mergedConfigs = useMemo<FunctionKeyConfigs>(() => {
    const normalizedDefault = normalizeFunctionKeyInput(defaultInput);
    const normalizedPage = normalizeFunctionKeyInput(pageInput);

    return {
      ...normalizedDefault,
      ...normalizedPage,
    };
  }, [defaultInput, pageInput]);

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
