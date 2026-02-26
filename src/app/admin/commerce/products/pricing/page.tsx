"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const PricingBuilder = dynamic(() => import("@/components/admin/commerce/products/pricing/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Pricing Management" subtitle="Configure and manage product pricing" />
      <PricingBuilder />
    </main>
  );
}
