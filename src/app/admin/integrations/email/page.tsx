"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const EmailBuilder = dynamic(() => import("@/components/admin/integrations/email/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Email Management" subtitle="Create, configure, and manage system emails" />
      <EmailBuilder />
    </main>
  );
}
