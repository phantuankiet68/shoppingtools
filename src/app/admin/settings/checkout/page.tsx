"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const ShippingBuilder = dynamic(() => import("@/components/admin/settings/shipping/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Shipping Builder" subtitle="Manage Shipping" />
      <ShippingBuilder />
    </main>
  );
}
