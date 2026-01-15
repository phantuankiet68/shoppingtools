"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const StorageBuilder = dynamic(() => import("@/components/admin/integrations/storage/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Storage Management" subtitle="Configure and manage system storage" />
      <StorageBuilder />
    </main>
  );
}
