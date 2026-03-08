"use client";

import { useEffect, useMemo } from "react";
import { useFunctionKeysContext } from "@/components/admin/shared/layout/function-keys/FunctionKeysProvider";
import type { FunctionKeyCode } from "@/components/admin/shared/layout/function-keys/functionKeys";

type FunctionKeyActions = Partial<Record<FunctionKeyCode, () => void>>;

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;

  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export function usePageFunctionKeys(pageActions: FunctionKeyActions) {
  const { actions, setPageFunctionKeys, resetToDefault } = useFunctionKeysContext();

  useEffect(() => {
    setPageFunctionKeys(pageActions);

    return () => {
      resetToDefault();
    };
  }, [pageActions, setPageFunctionKeys, resetToDefault]);

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
