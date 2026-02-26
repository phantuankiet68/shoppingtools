import type { BuilderMenuItem, InternalPage, SiteKind } from "@/components/admin/builder/menus/state/useMenuStore";

export type TabKey = "home" | "dashboard";

export function isTabbedConfig(v: unknown): v is { home: string[]; dashboard?: string[] } {
  return (
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Array.isArray((v as any).home) &&
    ((v as any).dashboard === undefined || Array.isArray((v as any).dashboard))
  );
}

export function forcedTabFromSet(currentSet: "home" | "v1"): TabKey {
  return currentSet === "v1" ? "dashboard" : "home";
}

export function pickBaseNames(
  tpl: string[] | { home: string[]; dashboard?: string[] } | undefined,
  forcedTab: TabKey,
): string[] {
  if (!tpl) return [];
  if (Array.isArray(tpl)) return tpl;
  return forcedTab === "dashboard" ? (tpl.dashboard ?? []) : tpl.home;
}

export function buildExistingPagesSet(internalPages: InternalPage[]): Set<string> {
  const set = new Set<string>();
  (internalPages || []).forEach((p) => {
    if (p.label) set.add(p.label.toLowerCase().trim());
    if (p.labelVi) set.add(p.labelVi.toLowerCase().trim());
    (p.aliases || []).forEach((a) => set.add(a.toLowerCase().trim()));
  });
  return set;
}

export function buildExistingTitlesSet(activeMenu: BuilderMenuItem[]): Set<string> {
  const all: string[] = [];

  const walk = (arr: BuilderMenuItem[]) => {
    arr.forEach((n) => {
      if (n?.title) all.push(String(n.title).toLowerCase().trim());
      if (n?.children?.length) walk(n.children);
    });
  };

  walk(activeMenu || []);
  return new Set(all);
}

export function normalizeNameForMatch(name: string): string {
  return (name || "")
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .trim();
}

export function findPageByName(internalPages: InternalPage[], name: string): InternalPage | undefined {
  const needle = normalizeNameForMatch(name);

  return internalPages.find((p) => {
    const pool = [p.label, p.labelVi, ...(p.aliases || [])].filter(Boolean).map((s) => String(s).toLowerCase().trim());
    return pool.includes(needle);
  });
}

export function makeNewMenuItem(params: { name: string; internalPages: InternalPage[] }): BuilderMenuItem {
  const page = findPageByName(params.internalPages, params.name);

  return {
    id: `s_${Math.random().toString(36).slice(2, 9)}`,
    title: params.name,
    icon: "",
    visible: true,
    linkType: "internal",
    externalUrl: "",
    internalPageId: page?.id ?? "home",
    rawPath: page?.path ?? "/",
    schedules: [],
    children: [],
  };
}

export function makeDragPayload(internalPages: InternalPage[], name: string) {
  const page = findPageByName(internalPages, name);

  return page
    ? { type: "new", name, linkType: "internal" as const, internalPageId: page.id, rawPath: page.path }
    : { type: "new", name, linkType: "internal" as const, internalPageId: "home", rawPath: "/" };
}

export function getSuggestBySite(siteKind: SiteKind): Record<string, string[]> {
  const out: Record<string, string[]> = {};

  if (siteKind === "ecommerce") {
    out["Product Experience"] = [
      "Product Detail",
      "Product Reviews",
      "Compare Products",
      "Recently Viewed",
      "Related Products",
    ];
    out["Trust & Conversion"] = [
      "Customer Reviews",
      "Testimonials",
      "Warranty Policy",
      "Return Process",
      "Payment Methods",
    ];
    out["Order & After Sale"] = ["Order Tracking", "Track My Order", "Order History", "Reorder"];
    out["Content & Growth"] = ["News", "Press", "Promotions Detail", "Campaigns"];
    out["Engagement"] = ["Notifications", "Subscriptions", "Newsletter", "Loyalty Program", "Reward Points"];
    out["Utilities"] = ["Store Locator", "Size Guide", "Help Center", "Live Chat"];
  }

  return out;
}

export function filterSuggest(params: {
  suggest: Record<string, string[]>;
  baseNames: string[];
  existingTitles: Set<string>;
  existingPages: Set<string>;
}): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const baseSet = new Set(params.baseNames.map((s) => s.toLowerCase().trim()));

  Object.entries(params.suggest).forEach(([group, arr]) => {
    const items = arr.filter((name) => {
      const key = name.toLowerCase().trim();
      return !baseSet.has(key) && !params.existingTitles.has(key) && !params.existingPages.has(key);
    });

    if (items.length) out[group] = items;
  });

  return out;
}
