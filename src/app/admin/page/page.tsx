// app/admin/menu/page.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const PageBuilder = dynamic(() => import("@/components/admin/pages/PageClient"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Page Builder" subtitle="Manage pages builder" />
      <PageBuilder />
    </main>
  );
}
