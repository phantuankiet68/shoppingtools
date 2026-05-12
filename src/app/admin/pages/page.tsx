"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const PageBuilder = dynamic(() => import("@/components/admin/pages/PageClient"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Page Management" />
      <PageBuilder />
    </main>
  );
}
