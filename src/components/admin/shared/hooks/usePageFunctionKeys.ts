"use client";

import { useEffect, useMemo } from "react";
import { useFunctionKeysContext } from "@/components/admin/shared/layout/function-keys/FunctionKeysProvider";
import type {
  FunctionKeyCode,
  FunctionKeyInput,
} from "@/components/admin/shared/layout/function-keys/functionKeys";

function isTypingTarget(target: EventTarget | null) {
  const el = target as HTMLElement | null;
  if (!el) return false;

  const tag = el.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || el.isContentEditable;
}

export function usePageFunctionKeys(pageConfigs: FunctionKeyInput) {
  const { actions, setPageFunctionKeys, resetToDefault } =
    useFunctionKeysContext();

  // =========================================================
  // 🔥 FIX 1: chỉ set khi mount + khi config thật sự đổi
  // =========================================================
  const memoConfigs = useMemo(() => pageConfigs, [pageConfigs]);

  useEffect(() => {
    setPageFunctionKeys(memoConfigs);

    // ❌ KHÔNG reset mỗi lần dependency đổi nữa
    // chỉ reset khi unmount
    return () => {
      resetToDefault();
    };
  }, [memoConfigs, setPageFunctionKeys, resetToDefault]);

  // =========================================================
  // 🔥 FIX 2: tránh object mới mỗi render
  // =========================================================
  const mergedActions = useMemo(() => actions, [actions]);

  // =========================================================
  // 🔥 FIX 3: event listener ổn định
  // =========================================================
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