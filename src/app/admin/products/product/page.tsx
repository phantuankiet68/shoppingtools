"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const ProductBuilder = dynamic(() => import("@/components/admin/products/product/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Product Builder" subtitle="Build and manage products with flexible options" />
      <ProductBuilder />
    </main>
  );
}
