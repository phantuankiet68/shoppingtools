// app/admin/menu/page.tsx
"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const PricingBuilder = dynamic(() => import("@/components/admin/product/pricing/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Pricing Builder" subtitle="Manage Pricing" />
      <PricingBuilder />
    </main>
  );
}
