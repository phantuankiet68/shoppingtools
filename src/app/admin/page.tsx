"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
const DashboardA = dynamic(() => import("@/components/admin/pages/DashboardA"), { ssr: false });

export default function Page() {
  const { t, locale } = useAdminI18n();
  return (
    <main>
      <AdminPageTitle title="Dashboard" />
      <DashboardA />
    </main>
  );
}
