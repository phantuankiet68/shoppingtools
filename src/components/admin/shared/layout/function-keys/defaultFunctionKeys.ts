import { useRouter } from "next/navigation";
import { FunctionKeyCode } from "@/components/admin/shared/layout/function-keys/functionKeys";

export function useDefaultFunctionKeys() {
  const router = useRouter();

  const actions: Partial<Record<FunctionKeyCode, () => void>> = {
    F1: () => {
      console.log("Open Help");
    },

    F4: () => {
      window.location.reload();
    },

    F12: () => {
      router.push("/admin");
    },
  };

  return actions;
}
