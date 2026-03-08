"use client";

import useFunctionKeys from "./useFunctionKeys";
import { useDefaultFunctionKeys } from "@/components/admin/shared/layout/function-keys/defaultFunctionKeys";
import { FunctionKeyCode } from "@/components/admin/shared/layout/function-keys/functionKeys";

type ActionMap = Partial<Record<FunctionKeyCode, () => void>>;

export default function usePageFunctionKeys(pageActions: ActionMap = {}) {
  const defaultActions = useDefaultFunctionKeys();

  const actions = {
    ...defaultActions,
    ...pageActions,
  };

  useFunctionKeys(actions);
}
