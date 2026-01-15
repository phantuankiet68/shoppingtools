"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const PaymentBuilder = dynamic(() => import("@/components/admin/integrations/payment/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Payment Management" subtitle="Configure and manage payment methods" />
      <PaymentBuilder />
    </main>
  );
}
