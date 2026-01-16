"use client";
import { REGISTRY } from "@/lib/ui-builder/registry";

export default function RenderBlocksPublic({ blocks }: { blocks: Array<{ kind: string; props: any }> }) {
  return (
    <>
      {blocks.map((b, i) => {
        const reg = REGISTRY.find((r) => r.kind === b.kind);
        if (!reg) return <div key={i}>Unknown block: {b.kind}</div>;
        return <div key={i}>{reg.render(b.props ?? {})}</div>;
      })}
    </>
  );
}
