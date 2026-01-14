// app/admin/menu/page.tsx
"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const CategoriesBuilder = dynamic(() => import("@/components/admin/product/categories/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Categories Builder" subtitle="Manage Categories" />
      <CategoriesBuilder />
    </main>
  );
}
