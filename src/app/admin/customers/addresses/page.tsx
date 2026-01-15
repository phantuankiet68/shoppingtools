// app/admin/menu/page.tsx
"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const AddresseBuilder = dynamic(() => import("@/components/admin/customers/addresses/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Address Management" subtitle="Manage customer billing and shipping addresses" />
      <AddresseBuilder />
    </main>
  );
}
