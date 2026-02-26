"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const SiteBuilder = dynamic(() => import("@/components/admin/builder/sites/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Site Management" subtitle="Customize and manage system Site" />
      <SiteBuilder />
    </main>
  );
}
