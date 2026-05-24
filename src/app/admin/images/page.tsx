"use client";
import dynamic from "next/dynamic";
import AdminPageTitle from "@/components/admin/layouts/AdminPageTitle";
const ImageBuilder = dynamic(() => import("@/components/admin/images/AdminImagesClient"), { ssr: false });

export default function Page() {
  return (
    <main>
      <AdminPageTitle title="Image Management" />
      <ImageBuilder />
    </main>
  );
}
