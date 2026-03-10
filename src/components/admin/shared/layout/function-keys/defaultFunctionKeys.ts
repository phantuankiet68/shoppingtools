"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import type { FunctionKeyCode, FunctionKeyInput } from "@/components/admin/shared/layout/function-keys/functionKeys";

type FunctionKeyDefaults = Partial<Record<FunctionKeyCode, () => void>> | FunctionKeyInput;

export function useDefaultFunctionKeys(): FunctionKeyDefaults {
  const router = useRouter();

  return useMemo(
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
}
