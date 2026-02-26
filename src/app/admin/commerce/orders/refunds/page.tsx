// app/admin/menu/page.tsx
"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const RefundBuilder = dynamic(() => import("@/components/admin/commerce/orders/refunds/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Refund Management" subtitle="Process and manage customer refunds" />
      <RefundBuilder />
    </main>
  );
}
