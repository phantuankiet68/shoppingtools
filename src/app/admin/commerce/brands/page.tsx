"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const BrandsBuilder = dynamic(() => import("@/components/admin/commerce/brands/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Brands Management" />
      <BrandsBuilder />
    </main>
  );
}
