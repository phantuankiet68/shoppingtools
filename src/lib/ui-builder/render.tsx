"use client";
import React from "react";
import type { RegItem } from "@/lib/ui-builder/types";

export type Node = {
  id: string;
  kind: string;
  props: any;
  children?: Node[] | Record<string, Node[]>;
};

export function renderTree(node: Node, registry: RegItem[]): React.ReactNode {
  const reg = registry.find((r) => r.kind === node.kind);
  if (!reg) return <div className="text-danger">Unknown: {node.kind}</div>;

  const getChildren = (slot?: string): Node[] => {
    if (!node.children) return [];
    if (Array.isArray(node.children)) return !slot ? node.children : [];
    const map = node.children as Record<string, Node[]>;
    if (!slot || slot === "children") return map["children"] || [];
    return map[slot] || [];
  };

  const slots = {
    slot(name?: string) {
      return getChildren(name).map((ch) => <React.Fragment key={ch.id}>{renderTree(ch, registry)}</React.Fragment>);
    },
    slotAt(index: number, name?: string) {
      const arr = getChildren(name);
      const n = arr[index];
      return n ? renderTree(n, registry) : null;
    },
  };

  return reg.render(node.props || {}, slots);
}
