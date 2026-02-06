"use client";

import React from "react";
import { REGISTRY } from "@/lib/ui-builder/registry";

type Block = { kind: string; props: any };

export default function RenderBlocksPublic({ blocks }: { blocks: Block[] }) {
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <>
      {blocks.map((b, i) => {
        const reg = REGISTRY.find((r) => r.kind === b.kind);

        if (!reg) {
          return (
            <div key={`${b.kind}-${i}`} suppressHydrationWarning>
              Unknown block: {b.kind}
            </div>
          );
        }
        return (
          <div key={`${b.kind}-${i}`} suppressHydrationWarning>
            {reg.render(b.props ?? {})}
          </div>
        );
      })}
    </>
  );
}
