// app/admin/menu/page.tsx
"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const VariantsBuilder = dynamic(() => import("@/components/admin/commerce/products/variants/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Variant Management" subtitle="Create and manage product variants" />
      <VariantsBuilder />
    </main>
  );
}
