"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const OrderBuilder = dynamic(() => import("@/components/admin/orders/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Order Management" subtitle="View, process, and manage customer orders" />
      <OrderBuilder />
    </main>
  );
}
