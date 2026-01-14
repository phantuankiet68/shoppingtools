// app/admin/menu/page.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MenuStoreProvider } from "@/components/admin/menu/state/useMenuStore";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const SectionBuilder = dynamic(() => import("@/components/admin/builder/sections/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Section Builder" subtitle="Manage Section" />
      <SectionBuilder />
    </main>
  );
}
