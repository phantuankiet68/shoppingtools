"use client";

import React from "react";
import cls from "@/styles/admin/pages/inspector.module.css";

type Props = {
  value: string;
  onChange: (v: string) => void;

  placeholder?: string;

  // 🔥 Thêm các prop mới
  type?: React.HTMLInputTypeAttribute; // "text" | "number" | "password" | ...
  disabled?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  className?: string;
};

export default function TextInput({ value, onChange, placeholder, type = "text", disabled, inputMode, className }: Props) {
  return <input className={className ?? cls.input} type={type} value={value} disabled={disabled} inputMode={inputMode} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />;
}
