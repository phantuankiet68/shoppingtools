"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const FacebookBuilder = dynamic(() => import("@/components/admin/facebook/AdminFacebookClient"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Facebook Management" />
      <FacebookBuilder />
    </main>
  );
}
