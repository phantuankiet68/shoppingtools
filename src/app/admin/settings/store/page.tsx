"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const StoreBuilder = dynamic(() => import("@/components/admin/settings/store/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Store Builder" subtitle="Manage Store" />
      <StoreBuilder />
    </main>
  );
}
