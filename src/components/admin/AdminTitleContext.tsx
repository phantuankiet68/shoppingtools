"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type AdminHeaderMeta = {
  title: string;
  subtitle?: string;
};

type Ctx = {
  meta: AdminHeaderMeta;
  setMeta: (m: AdminHeaderMeta) => void;
};

const AdminTitleContext = createContext<Ctx | null>(null);

export function AdminTitleProvider({ children }: { children: React.ReactNode }) {
  const [meta, setMeta] = useState<AdminHeaderMeta>({
    title: "Dashboard",
    subtitle: "Overview & statistics",
  });

  const value = useMemo(() => ({ meta, setMeta }), [meta]);
  return <AdminTitleContext.Provider value={value}>{children}</AdminTitleContext.Provider>;
}

export function useAdminTitle() {
  const ctx = useContext(AdminTitleContext);
  if (!ctx) throw new Error("useAdminTitle must be used inside AdminTitleProvider");
  return ctx;
}
