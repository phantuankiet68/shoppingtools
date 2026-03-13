import { REGISTRY } from "@/lib/ui-builder/registry";
import { TEMPLATES } from "@/constants/builder/pages/templates.constants";
import type { BuilderTemplate } from "@/constants/builder/pages/templates.constants";

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

export { TEMPLATES };
