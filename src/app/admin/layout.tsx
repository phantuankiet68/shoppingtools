import type { ReactNode } from "react";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { ModalProvider } from "@/components/admin/shared/common/modal";
import { FunctionKeysProvider } from "@/components/admin/shared/layout/function-keys/FunctionKeysProvider";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <FunctionKeysProvider>
      <AdminLayoutClient>
        <ModalProvider>{children}</ModalProvider>
      </AdminLayoutClient>
    </FunctionKeysProvider>
  );
}
