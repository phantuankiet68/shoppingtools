"use client";

import { useEffect } from "react";
import { useAdminTitle } from "@/components/admin/AdminTitleContext";

type Props = {
  title: string;
  subtitle?: string;
};

export default function AdminPageTitle({ title, subtitle }: Props) {
  const { setMeta } = useAdminTitle();

  useEffect(() => {
    setMeta({ title, subtitle });
  }, [title, subtitle, setMeta]);

  return null;
}