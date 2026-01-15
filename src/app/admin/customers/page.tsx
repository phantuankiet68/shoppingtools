// app/admin/menu/page.tsx
"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const CustomerBuilder = dynamic(() => import("@/components/admin/customers/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Customer Management" subtitle="View, manage, and engage with customers" />
      <CustomerBuilder />
    </main>
  );
}
