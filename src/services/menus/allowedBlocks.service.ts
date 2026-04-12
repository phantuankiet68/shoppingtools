import type {
  BuilderMenuItem,
  InternalPage,
  SiteKind,
  MenuLocale,
} from "@/components/admin/menus/state/useMenuStore";

export type TabKey = "home" | "dashboard";
export type TranslateFn = (key: string) => string;

export function isTabbedConfig(v: unknown): v is { home: string[]; dashboard?: string[] } {
  return (
    !!v &&
    typeof v === "object" &&
    !Array.isArray(v) &&
    Array.isArray((v as { home?: unknown }).home) &&
    (
      (v as { dashboard?: unknown }).dashboard === undefined ||
      Array.isArray((v as { dashboard?: unknown }).dashboard)
    )
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

export function normalizeNameForMatch(name: string): string {
  return (name || "")
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
    .trim();
}

function getPagePath(page: InternalPage, locale: MenuLocale): string {
  return page.paths?.[locale] ?? page.paths?.en ?? "/";
}

function getPageDisplayName(page: InternalPage, t: TranslateFn): string {
  return page.labelKey ? t(page.labelKey) : page.id;
}

function getPageCandidateNames(page: InternalPage, t: TranslateFn): string[] {
  const names = new Set<string>();

  names.add(normalizeNameForMatch(page.id));

  if (page.labelKey) {
    names.add(normalizeNameForMatch(page.labelKey));
    names.add(normalizeNameForMatch(t(page.labelKey)));
  }

  (page.aliases || []).forEach((alias) => {
    names.add(normalizeNameForMatch(alias));
  });

  return Array.from(names).filter(Boolean);
}

export function buildExistingPagesSet(
  internalPages: InternalPage[],
  t: TranslateFn,
): Set<string> {
  const set = new Set<string>();

  (internalPages || []).forEach((page) => {
    getPageCandidateNames(page, t).forEach((name) => set.add(name));
  });

  return set;
}

export function buildExistingTitlesSet(activeMenu: BuilderMenuItem[]): Set<string> {
  const all: string[] = [];

  const walk = (arr: BuilderMenuItem[]) => {
    arr.forEach((node) => {
      if (node?.title) all.push(normalizeNameForMatch(String(node.title)));
      if (node?.children?.length) walk(node.children);
    });
  };

  walk(activeMenu || []);
  return new Set(all);
}

export function findPageByName(
  internalPages: InternalPage[],
  name: string,
  t: TranslateFn,
): InternalPage | undefined {
  const needle = normalizeNameForMatch(name);

  return internalPages.find((page) => {
    const pool = getPageCandidateNames(page, t);
    return pool.includes(needle);
  });
}

export function makeNewMenuItem(params: {
  name: string;
  internalPages: InternalPage[];
  locale: MenuLocale;
  t: TranslateFn;
}): BuilderMenuItem {
  const page = findPageByName(params.internalPages, params.name, params.t);

  return {
    id: `s_${Math.random().toString(36).slice(2, 9)}`,
    title: page ? getPageDisplayName(page, params.t) : params.name,
    icon: page?.icon ?? "",
    visible: true,
    linkType: "internal",
    externalUrl: "",
    internalPageId: page?.id ?? null,
    rawPath: page ? getPagePath(page, params.locale) : "",
    schedules: [],
    children: [],
  };
}

export function makeDragPayload(
  internalPages: InternalPage[],
  name: string,
  locale: MenuLocale,
  t: TranslateFn,
) {
  const page = findPageByName(internalPages, name, t);

  return page
    ? {
        type: "new",
        name: getPageDisplayName(page, t),
        linkType: "internal" as const,
        internalPageId: page.id,
        rawPath: getPagePath(page, locale),
      }
    : {
        type: "new",
        name,
        linkType: "internal" as const,
        internalPageId: null,
        rawPath: "",
      };
}

function ecommerceSuggest(): Record<string, string[]> {
  return {
    "menus.allowedBlocks.groups.productExperience": [
      "menus.allowedBlocks.items.productDetail",
      "menus.allowedBlocks.items.productReviews",
      "menus.allowedBlocks.items.compareProducts",
      "menus.allowedBlocks.items.recentlyViewed",
      "menus.allowedBlocks.items.relatedProducts",
    ],
    "menus.allowedBlocks.groups.trustConversion": [
      "menus.allowedBlocks.items.customerReviews",
      "menus.allowedBlocks.items.testimonials",
      "menus.allowedBlocks.items.warrantyPolicy",
      "menus.allowedBlocks.items.returnProcess",
      "menus.allowedBlocks.items.paymentMethods",
    ],
    "menus.allowedBlocks.groups.orderAfterSale": [
      "menus.allowedBlocks.items.orderTracking",
      "menus.allowedBlocks.items.trackMyOrder",
      "menus.allowedBlocks.items.orderHistory",
      "menus.allowedBlocks.items.reorder",
    ],
    "menus.allowedBlocks.groups.contentGrowth": [
      "menus.allowedBlocks.items.news",
      "menus.allowedBlocks.items.press",
      "menus.allowedBlocks.items.promotionsDetail",
      "menus.allowedBlocks.items.campaigns",
    ],
    "menus.allowedBlocks.groups.engagement": [
      "menus.allowedBlocks.items.notifications",
      "menus.allowedBlocks.items.subscriptions",
      "menus.allowedBlocks.items.newsletter",
      "menus.allowedBlocks.items.loyaltyProgram",
      "menus.allowedBlocks.items.rewardPoints",
    ],
    "menus.allowedBlocks.groups.utilities": [
      "menus.allowedBlocks.items.storeLocator",
      "menus.allowedBlocks.items.sizeGuide",
      "menus.allowedBlocks.items.helpCenter",
      "menus.allowedBlocks.items.liveChat",
    ],
  };
}

export function getSuggestBySite(siteKind: SiteKind): Record<string, string[]> {
  if (siteKind === "ecommerce") {
    return ecommerceSuggest();
  }

  return {};
}

export function filterSuggest(params: {
  suggest: Record<string, string[]>;
  baseNames: string[];
  existingTitles: Set<string>;
  existingPages: Set<string>;
}): Record<string, string[]> {
  const out: Record<string, string[]> = {};
  const baseSet = new Set(params.baseNames.map((s) => normalizeNameForMatch(s)));

  Object.entries(params.suggest).forEach(([group, arr]) => {
    const seen = new Set<string>();

    const items = arr.filter((name) => {
      const key = normalizeNameForMatch(name);

      if (seen.has(key)) return false;
      seen.add(key);

      return !baseSet.has(key) && !params.existingTitles.has(key);
    });

    if (items.length) out[group] = items;
  });

  return out;
}