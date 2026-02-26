"use client";

import React from "react";
import cls from "@/styles/admin/pages/inspector.module.css";

type Props = {
  label: string;
  children: React.ReactNode;
};

export default function LabeledRow({ label, children }: Props) {
  return (
    <div className={cls.row}>
      <div className={cls.rowLabel}>{label}</div>
      <div className={cls.rowField}>{children}</div>
    </div>
  );
}
