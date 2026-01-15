"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const PurchaseOrderBuilder = dynamic(() => import("@/components/admin/inventory/purchase-orders/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Purchase Order Management" subtitle="Create, track, and manage purchase orders" />
      <PurchaseOrderBuilder />
    </main>
  );
}
