"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const ThemeBuilder = dynamic(() => import("@/components/admin/builder/theme/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Theme Management" subtitle="Customize and manage system themes" />
      <ThemeBuilder />
    </main>
  );
}
