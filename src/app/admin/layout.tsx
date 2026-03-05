import type { ReactNode } from "react";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { ModalProvider } from "@/components/admin/shared/common/modal";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <AdminLayoutClient>
      <ModalProvider>{children}</ModalProvider>
    </AdminLayoutClient>
  );
}
