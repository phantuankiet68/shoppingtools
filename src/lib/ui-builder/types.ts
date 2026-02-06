import React from "react";

export type FieldKind = "text" | "textarea" | "check" | "select" | "number";

export type InspectorField =
  | { key: string; label: string; kind: "text"; placeholder?: string }
  | { key: string; label: string; kind: "textarea"; placeholder?: string; rows?: number }
  | { key: string; label: string; kind: "check" }
  | { key: string; label: string; kind: "select"; options: string[] }
  | { key: string; label: string; kind: "number"; min?: number; max?: number; step?: number };

export type RegItem = {
  kind: string;
  label: string;
  defaults: Record<string, any>;
  inspector: InspectorField[];
  render: (props: any, slots?: any) => React.ReactNode;
};
