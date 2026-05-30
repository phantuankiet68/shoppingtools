"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const TiktokBuilder = dynamic(() => import("@/components/admin/tiktok/AdminTiktokClient"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Tiktok Management" />
      <TiktokBuilder />
    </main>
  );
}
