import type { Block, DropMeta, InternalProps } from "@/lib/page/types";
import { uid } from "@/lib/page/utils";
import { REGISTRY } from "@/lib/ui-builder/registry";

export function normalizeBlocks(raw: unknown[]): Block[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((b) => {
      const item = b as Record<string, unknown>;
      const id = typeof item?.id === "string" && item.id ? item.id : crypto.randomUUID();
      const kind = String(item?.kind ?? "");
      const props = item?.props && typeof item.props === "object" ? (item.props as Record<string, unknown>) : {};
      return { id, kind, props } as Block;
    })
    .filter((b) => b.kind);
}

export function getRoots(list: Block[]) {
  return list.filter((b) => {
    const p = b.props as InternalProps;
    const inRow = !!p._parentRowId;
    const inSection = !!p.__parent?.id;
    return !inRow && !inSection;
  });
}

export function remapIds(list: Block[]) {
  const idMap = new Map<string, string>();
  const mapId = (oldId: string) => {
    if (!idMap.has(oldId)) idMap.set(oldId, uid());
    return idMap.get(oldId)!;
  };

  const clone = list.map((b) => {
    const nb: Block = {
      id: mapId(b.id),
      kind: b.kind,
      props: JSON.parse(JSON.stringify(b.props || {})),
    };
    return nb;
  });

  clone.forEach((b) => {
    const p = b.props as InternalProps;
    if (p._parentRowId && idMap.has(p._parentRowId)) p._parentRowId = idMap.get(p._parentRowId)!;
    if (p.__parent?.id && idMap.has(p.__parent.id)) p.__parent.id = idMap.get(p.__parent.id)!;
  });

  return clone;
}

/** Tách logic drop template thành helper để Page mỏng hơn */
export function buildDroppedTemplateBlocks(txt: string, meta: DropMeta | null): Block[] | null {
  if (!txt.startsWith("template:")) return null;

  const templateId = txt.replace("template:", "").trim();
  const made = composeTemplateBlocks(templateId);
  if (made.length === 0) return [];

  const mapped = made.map((b) => ({ ...b, props: JSON.parse(JSON.stringify(b.props || {})) }));

  if (meta?.type === "row-col") {
    const roots = getRoots(mapped);
    roots.forEach((rb) => {
      const p = rb.props as Record<string, unknown>;
      p._parentRowId = meta.parentRowId;
      p._parentColIndex = meta.colIndex;
      if (p.__parent) delete p.__parent;
    });
  } else if (meta?.type === "section") {
    const roots = getRoots(mapped);
    roots.forEach((rb) => {
      const p = rb.props as Record<string, unknown>;
      p.__parent = { id: meta.parentSectionId, slot: meta.slot || "children" };
      if (p._parentRowId) delete p._parentRowId;
      if (p._parentColIndex !== undefined) delete p._parentColIndex;
    });
  }

  return remapIds(mapped);
}

export function buildDroppedSingleBlock(kind: string, meta: DropMeta | null): Block {
  const reg = REGISTRY.find((r) => r.kind === kind);
  const def = reg?.defaults || {};
  const props: Record<string, unknown> = { ...def };

  if (meta?.type === "row-col") {
    props._parentRowId = meta.parentRowId;
    props._parentColIndex = meta.colIndex;
  } else if (meta?.type === "section") {
    props.__parent = { id: meta.parentSectionId, slot: meta.slot || "children" };
  }

  return { id: uid(), kind, props };
}

function composeTemplateBlocks(templateId: string): Block[] {
  const make = (kind: string, props: Record<string, unknown> = {}): Block => ({ id: uid(), kind, props });

  if (templateId === "tpl-header-only") {
    return [
      make("HeaderPro", {
        title: "Zento",
        itemsJson: JSON.stringify([
          { label: "Home", href: "/" },
          { label: "Pages", href: "admin/pages" },
        ]),
      }),
    ];
  }

  if (templateId === "tpl-hero-2col") {
    const row = make("Row", { cols: 2, gap: 24 });

    const left = make("BannerPro", {
      eyebrow: "LowCode Builder",
      title: "Design faster with",
      highlight: "Blocks",
      subtitle: "Kéo thả để lắp nhanh các khối UI.",
      ctaLabel: "Get Started",
      ctaHref: "/get-started",
      palette: "sunrise",
    });
    (left.props as Record<string, unknown>)._parentRowId = row.id;
    (left.props as Record<string, unknown>)._parentColIndex = 0;

    const right = make("Text", { text: "Bạn có thể kéo thêm block vào từng cột.", fontSize: 16, mt: 8 });
    (right.props as Record<string, unknown>)._parentRowId = row.id;
    (right.props as Record<string, unknown>)._parentColIndex = 1;

    return [row, left, right];
  }

  if (templateId === "tpl-landing-basic") {
    const header = make("HeaderPro", {
      title: "Zento",
      itemsJson: JSON.stringify([
        { label: "Home", href: "/" },
        { label: "About", href: "/about" },
      ]),
    });

    const section = make("Section", { title: "Welcome" });

    const hero = make("BannerPro", {
      eyebrow: "Next.js 15 + CSS Modules",
      title: "Build pages with",
      highlight: "Blocks & Templates",
      subtitle: "Auto path & locale đến từ Menu – đúng kiểu low-code.",
      ctaLabel: "Docs",
      ctaHref: "/docs",
      palette: "coral",
    });
    (hero.props as InternalProps).__parent = { id: section.id, slot: "children" };

    const row = make("Row", { cols: 3, gap: 16 });
    (row.props as InternalProps).__parent = { id: section.id, slot: "children" };

    const t1 = make("Text", { text: "⚡ Kéo thả nhanh" });
    (t1.props as InternalProps)._parentRowId = row.id;
    (t1.props as InternalProps)._parentColIndex = 0;

    const t2 = make("Text", { text: "🧩 Template sẵn" });
    (t2.props as InternalProps)._parentRowId = row.id;
    (t2.props as InternalProps)._parentColIndex = 1;

    const t3 = make("Text", { text: "🔗 Sync từ Menu" });
    (t3.props as InternalProps)._parentRowId = row.id;
    (t3.props as InternalProps)._parentColIndex = 2;

    return [header, section, hero, row, t1, t2, t3];
  }

  return [];
}
