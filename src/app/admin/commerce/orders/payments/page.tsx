"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const PaymentBuilder = dynamic(() => import("@/components/admin/commerce/orders/payments/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Payments" subtitle="Manage payment methods and gateways" />
      <PaymentBuilder />
    </main>
  );
}
