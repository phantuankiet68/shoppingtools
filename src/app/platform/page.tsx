"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";

const DashboardA = dynamic(() => import("@/components/admin/dashboard/DashboardA"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Dashboard" />
      <DashboardA />
    </main>
  );
}
