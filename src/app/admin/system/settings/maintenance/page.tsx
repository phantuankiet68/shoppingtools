"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const MaintenanceBuilder = dynamic(() => import("@/components/admin/system/settings/maintenance/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Maintenance Builder" subtitle="Manage Maintenance" />
      <MaintenanceBuilder />
    </main>
  );
}
