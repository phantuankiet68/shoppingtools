"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const TaskBuilder = dynamic(() => import("@/components/platform/tasks/AdminTaskClient"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="File Management" />
      <TaskBuilder />
    </main>
  );
}
