"use client";

import React from "react";
import { REGISTRY } from "@/lib/ui-builder/registry";

type Block = { kind: string; props: any };
type RegistryItem = (typeof REGISTRY)[number];
type Slots = Parameters<RegistryItem["render"]>[1];

const emptySlots: Slots = {
  slot: (() => null) as Slots["slot"],
  slotAt: (() => null) as Slots["slotAt"],
};

export default function RenderBlocksPublic({
  blocks,
  productSlug,
  currentPath,
  rawSegments,
}: {
  blocks: Block[];
  productSlug?: string | null;
  currentPath?: string;
  rawSegments?: string[];
}) {
  return (
    <>
      {blocks.map((b, i) => {
        const reg = REGISTRY.find((r) => r.kind === b.kind);

        if (!reg) {
          return <div key={`${b.kind}-${i}`}>Unknown block: {b.kind}</div>;
        }

        const enrichedProps = {
          ...b.props,
          productSlug,
          currentPath,
          rawSegments,
        };

        return <React.Fragment key={`${b.kind}-${i}`}>{reg.render(enrichedProps ?? {}, emptySlots)}</React.Fragment>;
      })}
    </>
  );
}
