import type { ReactNode } from "react";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { ModalProvider } from "@/components/admin/shared/common/modal";
import { FunctionKeysProvider } from "@/components/admin/shared/layout/function-keys/FunctionKeysProvider";
import { AdminAuthProvider } from "@/components/admin/providers/AdminAuthProvider";
import { getAdminAuth } from "@/lib/admin/get-admin-auth";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const adminAuth = await getAdminAuth();

  return (
    <AdminAuthProvider value={adminAuth}>
      <FunctionKeysProvider>
        <AdminLayoutClient>
          <ModalProvider>{children}</ModalProvider>
        </AdminLayoutClient>
      </FunctionKeysProvider>
    </AdminAuthProvider>
  );
}