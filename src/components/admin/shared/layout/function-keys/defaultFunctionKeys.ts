"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { FunctionKeyCode } from "@/components/admin/shared/layout/function-keys/functionKeys";

export function useDefaultFunctionKeys() {
  const router = useRouter();

  const actions = useMemo<Partial<Record<FunctionKeyCode, () => void>>>(
    () => ({
      F1: () => {
        console.log("Open Help");
      },

      F4: () => {
        window.location.reload();
      },

      F12: () => {
        router.push("/admin");
      },
    }),
    [router],
  );

  return actions;
}
