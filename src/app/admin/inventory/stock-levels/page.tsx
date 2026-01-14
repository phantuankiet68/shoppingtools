// app/admin/menu/page.tsx
"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const StockLevelBuilder = dynamic(() => import("@/components/admin/inventory/stock-levels/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Stock Level Builder" subtitle="Manage Stock Level" />
      <StockLevelBuilder />
    </main>
  );
}
