// app/admin/menu/page.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MenuStoreProvider } from "@/components/admin/menu/state/useMenuStore";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const MenuBuilder = dynamic(() => import("@/components/admin/menu/MenuBuilder"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Menu Builder" subtitle="Manage navigation & links" />
      <MenuStoreProvider>
        <MenuBuilder />
      </MenuStoreProvider>
    </main>
  );
}
