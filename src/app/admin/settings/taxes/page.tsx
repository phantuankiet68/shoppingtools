"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const TaxesBuilder = dynamic(() => import("@/components/admin/system/settings/taxes/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Taxes Builder" subtitle="Manage Taxes" />
      <TaxesBuilder />
    </main>
  );
}
