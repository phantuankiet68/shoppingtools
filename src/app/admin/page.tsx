"use client";

import dynamic from "next/dynamic";
const DashboardA = dynamic(() => import("@/components/admin/dashboard/DashboardA"), { ssr: false });

export default function Page() {
  return (
    <main>
      <DashboardA />
    </main>
  );
}
