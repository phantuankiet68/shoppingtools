// app/[locale]/v1/page.tsx
"use client";

import React from "react";
import dynamic from "next/dynamic";
import { MenuStoreProvider } from "@/components/admin/menu/state/useMenuStore";

const MenuBuilder = dynamic(() => import("@/components/admin/menu/MenuBuilder"), { ssr: false });

export default function Page() {
  return (
    <main>
      <MenuStoreProvider>
        <MenuBuilder />
      </MenuStoreProvider>
    </main>
  );
}
