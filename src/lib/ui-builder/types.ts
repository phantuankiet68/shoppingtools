import React from "react";

export type FieldKind = "text" | "textarea" | "check" | "select" | "number";

export type InspectorField =
  | { key: string; label: string; kind: "text"; placeholder?: string }
  | { key: string; label: string; kind: "textarea"; placeholder?: string; rows?: number }
  | { key: string; label: string; kind: "check" }
  | { key: string; label: string; kind: "select"; options: string[] }
  | { key: string; label: string; kind: "number"; min?: number; max?: number; step?: number };

export type Slots = {
  slot: (name?: string) => React.ReactNode;
  slotAt: (idx: number, name?: string) => React.ReactNode;
};

export type RegItem = {
  kind: string;
  label: string;
  defaults: Record<string, unknown>;
  inspector: InspectorField[];
  render: (props: Record<string, unknown>, slots: Slots) => React.ReactNode;
};
