import type { ReactNode } from "react";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { ModalProvider } from "@/components/admin/shared/common/modal";
import { FunctionKeysProvider } from "@/components/admin/shared/layout/function-keys/FunctionKeysProvider";
import { AdminAuthProvider } from "@/components/admin/providers/AdminAuthProvider";
import { AdminI18nProvider } from "@/components/admin/providers/AdminI18nProvider";
import { getAdminAuth } from "@/lib/admin/get-admin-auth";
import { getAdminI18n } from "@/lib/admin/i18n/get-admin-i18n";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [adminAuth, adminI18n] = await Promise.all([
    getAdminAuth(),
    getAdminI18n(),
  ]);

  return (
    <AdminAuthProvider value={adminAuth}>
      <AdminI18nProvider value={adminI18n}>
        <FunctionKeysProvider>
          <AdminLayoutClient>
            <ModalProvider>{children}</ModalProvider>
          </AdminLayoutClient>
        </FunctionKeysProvider>
      </AdminI18nProvider>
    </AdminAuthProvider>
  );
}