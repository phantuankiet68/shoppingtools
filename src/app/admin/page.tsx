"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";

const DashboardA = dynamic(() => import("@/components/admin/builder/pages/DashboardA"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Dashboard Management" subtitle="Build, customize, and manage system dashboards" />
      <DashboardA />
    </main>
  );
}
