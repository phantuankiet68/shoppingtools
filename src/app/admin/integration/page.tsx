// app/admin/menu/page.tsx
"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const IntegrationBuilder = dynamic(() => import("@/components/admin/builder/integration/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Integration Builder" subtitle="Manage Integration" />
      <IntegrationBuilder />
    </main>
  );
}
