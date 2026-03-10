"use client";

import { useEffect, useMemo } from "react";
import { useFunctionKeysContext } from "@/components/admin/shared/layout/function-keys/FunctionKeysProvider";
import type { FunctionKeyCode, FunctionKeyInput } from "@/components/admin/shared/layout/function-keys/functionKeys";

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;

  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export function usePageFunctionKeys(pageConfigs: FunctionKeyInput) {
  const { actions, setPageFunctionKeys, resetToDefault } = useFunctionKeysContext();

  useEffect(() => {
    setPageFunctionKeys(pageConfigs);

    return () => {
      resetToDefault();
    };
  }, [pageConfigs, setPageFunctionKeys, resetToDefault]);

  const mergedActions = useMemo(
    () => ({
      ...actions,
    }),
    [actions],
  );

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key as FunctionKeyCode;
      const action = mergedActions[key];

      if (!action) return;
      if (isTypingTarget(e.target)) return;

      e.preventDefault();
      action();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mergedActions]);
}
