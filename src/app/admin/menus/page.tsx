"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MenuStoreProvider } from "@/components/admin/menus/state/useMenuStore";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const MenuBuilder = dynamic(() => import("@/components/admin/menus/MenuBuilder"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Menus" subtitle="Manage navigation & links" />
      <MenuStoreProvider>
        <MenuBuilder />
      </MenuStoreProvider>
    </main>
  );
}
