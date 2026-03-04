// src/services/builder/pages/add/templates.service.ts
import { REGISTRY } from "@/lib/ui-builder/registry";

export type RegistryKind = (typeof REGISTRY)[number]["kind"];

export type BuilderTemplate = {
  id: string;
  label: string;
  children: RegistryKind[];
};

function tpl(id: string, label: string, children: RegistryKind[]): BuilderTemplate {
  return { id, label, children };
}

export const TEMPLATES: readonly BuilderTemplate[] = [
  tpl("tpl-shop-green", "ShopGreen", [
    "Topbar1",
    "Header1",
    "Hero1",
    "BestSeller1",
    "Brand1",
    "Makeup1",
    "Skincare1",
    "BodyCare1",
    "KidsCare1",
    "MenCare1",
    "Accessories1",
    "Footer1",
  ]),
] as const;

export function filterTemplates(args: {
  templates: readonly BuilderTemplate[];
  query: string;
  registryByKind: Map<string, (typeof REGISTRY)[number]>;
}): BuilderTemplate[] {
  const q = args.query.trim().toLowerCase();
  if (!q) return [...args.templates];

  return args.templates
    .map((t) => {
      const matchTpl = t.label.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      if (matchTpl) return t;

      const filteredChildren = t.children.filter((k) => {
        const reg = args.registryByKind.get(k);
        const label = (reg?.label ?? "").toLowerCase();
        return k.toLowerCase().includes(q) || label.includes(q);
      });

      return { ...t, children: filteredChildren };
    })
    .filter((t) => t.children.length > 0);
}
