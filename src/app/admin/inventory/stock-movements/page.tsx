// app/admin/menu/page.tsx
"use client";

import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const StockMovementBuilder = dynamic(() => import("@/components/admin/inventory/stock-movements/page"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Stock Movement Builder" subtitle="Manage Stock Movement" />
      <StockMovementBuilder />
    </main>
  );
}
