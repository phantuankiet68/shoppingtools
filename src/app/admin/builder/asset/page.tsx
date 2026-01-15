"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const AssetBuilder = dynamic(() => import("@/components/admin/builder/asset/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Asset Management" subtitle="Upload, organize, and manage system assets" />
      <AssetBuilder />
    </main>
  );
}
