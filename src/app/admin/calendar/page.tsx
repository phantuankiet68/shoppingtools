"use client";

import React from "react";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const CalendarBuilder = dynamic(() => import("@/components/admin/calendar/calendarAdmin"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Menus" subtitle="Manage navigation & links" />
        <CalendarBuilder />
    </main>
  );
}
