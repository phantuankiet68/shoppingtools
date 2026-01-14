// app/admin/menu/page.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const ChatBuilder = dynamic(() => import("@/components/admin/chat/AdminMessagesClient"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Chat Builder" subtitle="Manage message" />
      <ChatBuilder />
    </main>
  );
}
