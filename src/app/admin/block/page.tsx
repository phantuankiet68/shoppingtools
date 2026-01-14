// app/admin/menu/page.tsx
"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const BlockBuilder = dynamic(() => import("@/components/admin/builder/blocks/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Block Builder" subtitle="Manage Block" />
      <BlockBuilder />
    </main>
  );
}
