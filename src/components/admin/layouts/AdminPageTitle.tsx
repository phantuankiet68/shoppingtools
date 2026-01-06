"use client";

import { useEffect } from "react";
import { useAdminTitle } from "@/components/admin/AdminTitleContext";

export default function AdminPageTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  const { setMeta } = useAdminTitle();

  useEffect(() => {
    setMeta({ title, subtitle });
  }, [title, subtitle, setMeta]);

  return null;
}
