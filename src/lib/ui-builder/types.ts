// src/lib/ui-builder/types.ts
import React from "react";

/** Các kiểu field mà inspector hỗ trợ */
export type FieldKind = "text" | "textarea" | "check" | "select" | "number";

export type InspectorField =
  | { key: string; label: string; kind: "text"; placeholder?: string }
  | { key: string; label: string; kind: "textarea"; placeholder?: string; rows?: number }
  | { key: string; label: string; kind: "check" }
  | { key: string; label: string; kind: "select"; options: string[] }
  | { key: string; label: string; kind: "number"; min?: number; max?: number; step?: number };
  
export type RegItem = {
  kind: string;              // khóa định danh (ổn định, đừng đổi)
  label: string;             // label hiển thị ở Palette
  defaults: Record<string, any>;
  inspector: InspectorField[];
  // Với block có slot, Canvas có thể truyền thêm tham số thứ 2 (slots)
  render: (props: any, slots?: any) => React.ReactNode;
};
