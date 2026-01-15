"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const SectionBuilder = dynamic(() => import("@/components/admin/builder/sections/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Section Management" subtitle="Build, edit, and manage reusable sections" />
      <SectionBuilder />
    </main>
  );
}
