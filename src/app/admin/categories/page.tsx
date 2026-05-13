"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const CategoriesBuilder = dynamic(() => import("@/components/admin/categories/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Category Management" />
      <CategoriesBuilder />
    </main>
  );
}
