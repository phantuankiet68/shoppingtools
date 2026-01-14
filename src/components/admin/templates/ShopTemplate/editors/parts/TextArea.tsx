"use client";

import React from "react";
import cls from "@/styles/admin/pages/inspector.module.css";

type Props = {
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  placeholder?: string;
};

export default function TextArea({ value, onChange, rows = 4, placeholder }: Props) {
  return <textarea className={cls.textarea} value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} />;
}
