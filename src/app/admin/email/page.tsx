"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const AdminEmailClient = dynamic(() => import("@/components/admin/email/AdminEmailClient"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Facebook Management" />
      <AdminEmailClient />
    </main>
  );
}
