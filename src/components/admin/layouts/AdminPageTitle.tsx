"use client";

import { useEffect } from "react";
import { useAdminTitle } from "@/components/admin/AdminTitleContext";

type Props = {
  title: string;
};

export default function AdminPageTitle({ title }: Props) {
  const { setMeta } = useAdminTitle();

  useEffect(() => {
    setMeta({ title });
  }, [title, setMeta]);

  return null;
}
