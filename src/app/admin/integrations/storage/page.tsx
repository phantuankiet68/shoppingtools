"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const WebhookBuilder = dynamic(() => import("@/components/admin/integrations/webhook/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Webhook Management" subtitle="Configure and manage webhook endpoints" />
      <WebhookBuilder />
    </main>
  );
}
