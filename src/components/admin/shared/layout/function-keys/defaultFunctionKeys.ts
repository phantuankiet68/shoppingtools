"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { FunctionKeyCode, FunctionKeyConfig } from "@/components/admin/shared/layout/function-keys/functionKeys";

type FunctionKeyConfigs = Partial<Record<FunctionKeyCode, FunctionKeyConfig>>;

export function useDefaultFunctionKeys(): FunctionKeyConfigs {
  const router = useRouter();

  return useMemo<FunctionKeyConfigs>(
    () => ({
      F1: {
        action: () => {
          console.log("Open Help");
        },
      },

      F4: {
        action: () => {
          window.location.reload();
        },
      },

      F12: {
        action: () => {
          router.push("/admin");
        },
      },
    }),
    [router],
  );
}
