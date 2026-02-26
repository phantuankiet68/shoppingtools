// utils/admin/menu.utils.ts
import type { ApiMenuItem } from "@/services/layout/menu.service";
import { stripLocale, normalize } from "./path.utils";

export type Item = {
  key: string;
  title: string;
  icon: string;
  path?: string | null;
  parentKey?: string | null;
  children?: Item[];
};

export function buildTree(rows: ApiMenuItem[]): Item[] {
  const vis = rows.filter((r) => r.visible);
  const map = new Map<string, Item>();

  vis.forEach((r) =>
    map.set(r.id, {
      key: r.id,
      title: r.title,
      icon: r.icon || "bi bi-dot",
      path: normalize(r.path),
      parentKey: r.parentId,
      children: [],
    }),
  );

  const roots: Item[] = [];
  vis.forEach((r) => {
    const node = map.get(r.id)!;
    if (r.parentId && map.has(r.parentId)) map.get(r.parentId)!.children!.push(node);
    else roots.push(node);
  });

  const sortMap: Record<string, number> = {};
  rows.forEach((r) => (sortMap[r.id] = r.sortOrder));

  const sortRec = (arr?: Item[]) => {
    if (!arr) return;
    arr.sort((a, b) => {
      const sa = sortMap[a.key] ?? 0;
      const sb = sortMap[b.key] ?? 0;
      if (sa !== sb) return sa - sb;
      return a.title.localeCompare(b.title);
    });
    arr.forEach((n) => sortRec(n.children));
  };

  sortRec(roots);
  return roots;
}

type MatchResult = { hit: Item; trail: string[]; np: string } | null;

export function bestMatchWithTrail(items: Item[], currentNoLocale: string): MatchResult {
  const stack: Item[] = [];
  let best: MatchResult = null;

  function dfs(arr: Item[]): void {
    for (const n of arr) {
      stack.push(n);
      const np = stripLocale(n.path || "");
      const ok =
        !!np &&
        (currentNoLocale === np || currentNoLocale.startsWith(np + "/") || (np === "/" && currentNoLocale === "/"));

      if (ok) {
        const trail = stack.slice(0, -1).map((x) => x.key);
        if (!best || np.length > best.np.length) best = { hit: n, trail, np };
      }

      if (n.children?.length) dfs(n.children);
      stack.pop();
    }
  }

  dfs(items);
  return best;
}

export const isAccountItem = (t: string) => /(account|profile|setting|logout|sign\s*out|chat)/i.test(t);

export type SectionKey = "overview" | "builder" | "commerce" | "system" | "account";

export const SECTION_TITLES: Record<SectionKey, string> = {
  overview: "OVERVIEW",
  builder: "NO-CODE BUILDER",
  commerce: "COMMERCE",
  system: "SYSTEM",
  account: "ACCOUNT",
};

export const SECTION_ORDER: SectionKey[] = ["overview", "builder", "commerce", "system", "account"];

export function sectionOfTopItem(title: string): SectionKey {
  const t = (title || "").toLowerCase();
  if (isAccountItem(title)) return "account";
  if (/(^|\s)(builder)(\s|$)/i.test(title)) return "builder";
  if (/(products|inventory|orders|customers)/i.test(t)) return "commerce";
  if (/(integrations|settings|roles|logs|system)/i.test(t)) return "system";
  return "overview";
}
