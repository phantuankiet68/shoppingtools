// src/components/menu/useMenuStore.tsx
"use client";

import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Locale = "vi" | "en" | "ja";
export type MenuSetKey = "home" | "v1";
export type SiteKind = "ecommerce" | "corporate" | "education";
export type TemplateKey = "header" | "sidebar" | "mega" | "drawer";

export type InternalPage = {
  id: string;
  path: string;
  label: string;
  labelVi?: string;
  aliases?: string[];
  tags?: string[];
};

export type TemplateAllowed = {
  [template in TemplateKey]?: string[] | { home: string[]; dashboard: string[] };
};

export type BuilderMenuItem = {
  id: string;
  title: string;
  icon?: string | null;
  linkType: "external" | "internal" | "scheduled";
  externalUrl?: string;
  newTab?: boolean;
  internalPageId?: string;
  rawPath?: string | null;
  schedules?: Array<{ when: string; url: string }>;
  children?: BuilderMenuItem[];
};

type DbMenuItem = {
  id: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  locale: Locale;
  setKey: MenuSetKey;
  createdAt?: string;
  updatedAt?: string;
};

export const ECOM_CATEGORY_PRESETS: {
  level1: string[];
  level2ByL1: Record<string, string[]>;
} = {
  level1: ["Fashion", "Electronics", "Home Appliances", "Books"],
  level2ByL1: {
    Fashion: ["Shirt", "Jeans", "Shoes", "Accessories"],
    Electronics: ["TV", "Phone", "Laptop", "Headphones"],
    "Home Appliances": ["Air Fryer", "Rice Cooker", "Air Purifier", "Vacuum Cleaner"],
    Books: ["New Books", "Business", "Skills", "Children"],
  },
};

const INTERNAL_PAGE_SETS: Record<SiteKind, InternalPage[]> = {
  ecommerce: [
    // ======== HOME / DISCOVERY ========
    { id: "home", path: "/", label: "Home", labelVi: "Home", aliases: ["Home", "Home"], tags: ["nav", "landing"] },
    { id: "search", path: "/search", label: "Search", labelVi: "Search", aliases: ["Search"], tags: ["nav"] },
    { id: "categories", path: "/categories", label: "All Categories", labelVi: "Categories", aliases: ["Categories"], tags: ["nav"] },
    { id: "products", path: "/products", label: "Products", labelVi: "Products", aliases: ["Products", "Products"], tags: ["nav"] },
    { id: "collections", path: "/collections", label: "Collections", labelVi: "Collections", aliases: ["Collections"], tags: ["marketing"] },
    { id: "new-arrivals", path: "/new", label: "New Arrivals", labelVi: "New Arrivals", aliases: ["New Arrivals", "New Arrivals"], tags: ["marketing", "nav"] },
    { id: "best-sellers", path: "/best-sellers", label: "Best Sellers", labelVi: "Best Sellers", aliases: ["Best Sellers"], tags: ["marketing"] },
    { id: "promotions", path: "/promotions", label: "Promotions", labelVi: "Promotions", aliases: ["Promotions", "Promotions"], tags: ["marketing", "nav"] },
    { id: "promotions-coupons", path: "/promotions/coupons", label: "Coupons", labelVi: "Coupons", tags: ["marketing"] },
    { id: "promotions-flash", path: "/promotions/flash-sale", label: "Flash Sale", labelVi: "Flash Sale", tags: ["marketing"] },
    { id: "promotions-combo", path: "/promotions/combo", label: "Combos", labelVi: "Hot Combos", tags: ["marketing"] },

    // ======== CONTENT / SEO ========
    { id: "blog", path: "/blog", label: "Blog", labelVi: "Blog / Guides", aliases: ["Blog", "Guides"], tags: ["seo", "content", "nav"] },
    { id: "guides", path: "/guides", label: "Buying Guides", labelVi: "Buying Guides", aliases: ["Guides"], tags: ["seo", "content"] },
    { id: "about", path: "/about-us", label: "About Us", labelVi: "About Us", aliases: ["Introduction", "About"], tags: ["seo"] },

    // ======== SUPPORT ========
    { id: "contact", path: "/contact", label: "Contact", labelVi: "Contact", aliases: ["Contact", "Contact"], tags: ["support", "nav"] },
    { id: "support-center", path: "/support", label: "Support Center", labelVi: "Customer Support Center", tags: ["support"] },
    { id: "live-chat", path: "/support/chat", label: "Live Chat", labelVi: "Live Chat", tags: ["support"] },
    { id: "faq", path: "/support/faq", label: "FAQ", labelVi: "Frequently Asked Questions", tags: ["support", "seo"] },
    { id: "shipping", path: "/support/shipping", label: "Shipping Policy", labelVi: "Shipping", tags: ["support"] },
    { id: "returns", path: "/support/returns", label: "Returns & Refunds", labelVi: "Returns & Refunds", tags: ["support"] },
    { id: "stores", path: "/stores", label: "Stores", labelVi: "Store System", tags: ["support"] },

    // ======== ACCOUNT / CHECKOUT ========
    { id: "account", path: "/account", label: "Account", labelVi: "Account", aliases: ["Account", "Account"], tags: ["account", "nav"] },
    { id: "sign-in", path: "/account/sign-in", label: "Sign in / Sign up", labelVi: "Sign in / Sign up", tags: ["account"] },
    { id: "orders", path: "/account/orders", label: "My Orders", labelVi: "My Orders", tags: ["account"] },
    { id: "wishlist", path: "/account/wishlist", label: "Wishlist", labelVi: "Wishlist", tags: ["account"] },
    { id: "cart", path: "/cart", label: "Cart", labelVi: "Cart", aliases: ["Cart"], tags: ["checkout"] },
    { id: "checkout", path: "/checkout", label: "Checkout", labelVi: "Checkout", tags: ["checkout"] },

    // ======== LEGAL ========
    { id: "privacy", path: "/legal/privacy", label: "Privacy Policy", labelVi: "Privacy Policy", tags: ["legal", "seo"] },
    { id: "terms", path: "/legal/terms", label: "Terms of Service", labelVi: "Terms of Service", tags: ["legal"] },

    // ======== LEGACY ========
    { id: "v1-home", path: "/v1", label: "V1 Home", tags: ["legacy"] },
    { id: "v1-products", path: "/v1/products", label: "V1 Products", tags: ["legacy"] },
    { id: "v1-reports", path: "/v1/reports", label: "V1 Reports", tags: ["legacy"] },
    { id: "v1-new", path: "/v1/new", label: "V1 New", tags: ["legacy"] },

    // ======== ADMIN ========
    { id: "admin", path: "/admin", label: "Dashboard", labelVi: "Dashboard", aliases: ["Dashboard"], tags: ["admin"] },
    { id: "admin-orders", path: "/admin/orders", label: "Orders", labelVi: "Orders", tags: ["admin"] },
    { id: "admin-products", path: "/admin/products", label: "Products", labelVi: "Products", tags: ["admin"] },
    { id: "admin-categories", path: "/admin/categories", label: "Categories", labelVi: "Categories", tags: ["admin"] },
    { id: "admin-inventory", path: "/admin/inventory", label: "Inventory", labelVi: "Inventory", tags: ["admin"] },
    { id: "admin-discounts", path: "/admin/discounts", label: "Discounts", labelVi: "Discounts", tags: ["admin"] },
    { id: "admin-customers", path: "/admin/customers", label: "Customers", labelVi: "Customers", tags: ["admin"] },
    { id: "admin-reviews", path: "/admin/reviews", label: "Reviews", labelVi: "Reviews", tags: ["admin"] },
    { id: "admin-content", path: "/admin/content", label: "Content", labelVi: "Content", tags: ["admin"] },
    { id: "admin-reports", path: "/admin/reports", label: "Reports", labelVi: "Reports", tags: ["admin"] },
    { id: "admin-settings", path: "/admin/settings", label: "Settings", labelVi: "Settings", tags: ["admin"] },
  ],
  corporate: [
    { id: "home", path: "/", label: "Home", labelVi: "Home", aliases: ["Home"], tags: ["nav", "landing"] },
    { id: "about", path: "/about", label: "About", labelVi: "About Us", tags: ["nav"] },
    { id: "services", path: "/services", label: "Services", labelVi: "Services", tags: ["nav"] },
    { id: "solutions", path: "/solutions", label: "Solutions", labelVi: "Solutions", tags: ["nav"] },
    { id: "case-studies", path: "/case-studies", label: "Case Studies", labelVi: "Case Studies", tags: ["content"] },
    { id: "blog", path: "/blog", label: "Blog", labelVi: "Blog", tags: ["content", "seo"] },
    { id: "careers", path: "/careers", label: "Careers", labelVi: "Careers", tags: ["nav"] },
    { id: "contact", path: "/contact", label: "Contact", labelVi: "Contact", tags: ["nav"] },
  ],
  education: [
    { id: "home", path: "/", label: "Home", labelVi: "Home", tags: ["nav", "landing"] },
    { id: "courses", path: "/courses", label: "Courses", labelVi: "Courses", tags: ["nav"] },
    { id: "tracks", path: "/tracks", label: "Learning Paths", labelVi: "Learning Paths", tags: ["nav"] },
    { id: "resources", path: "/resources", label: "Resources", labelVi: "Resources", tags: ["content"] },
    { id: "blog", path: "/blog", label: "Blog", labelVi: "Blog", tags: ["seo", "content"] },
    { id: "pricing", path: "/pricing", label: "Pricing", labelVi: "Pricing", tags: ["nav"] },
    { id: "account", path: "/account", label: "Account", labelVi: "Account", tags: ["account", "nav"] },
    { id: "contact", path: "/contact", label: "Contact", labelVi: "Contact", tags: ["nav"] },
  ],
};

const TEMPLATE_ALLOWED_BY_SITE: Record<SiteKind, TemplateAllowed> = {
  ecommerce: {
    header: {
      home: ["Home", "Categories", "Products", "New Arrivals", "Best Sellers", "Promotions", "Blog / Guides", "Contact", "Account", "Cart"],
      dashboard: ["Dashboard", "Orders", "Products", "Categories", "Inventory", "Promotions", "Customers", "Reviews", "Content", "Reports", "Settings"],
    },

    mega: ["Fashion", "Electronics", "Home Appliances", "Books"],

    drawer: ["Home", "Categories", "Products", "New Arrivals", "Best Sellers", "Promotions", "Blog / Guides", "Account", "Cart", "Contact", "Customer Support Center", "Frequently Asked Questions"],

    sidebar: ["Account", "My Orders", "Wishlist", "Sign in / Sign up"],
  },

  corporate: {
    header: {
      home: ["Home", "About Us", "Services", "Solutions", "Projects", "News", "Careers", "Contact"],
      dashboard: ["Dashboard", "Project Management", "Customer Management", "Service Management", "Articles & Blog", "Internal Recruitment", "Business Reports", "System Settings"],
    },
  },

  education: {
    header: {
      home: ["Home", "Courses", "Learning Paths", "Blog / Guides", "Instructors", "Calendar", "Mind Map", "Contact", "Account"],
      dashboard: ["Dashboard", "My Courses", "Learning Paths", "Calendar", "Mind Map", "Issues", "Profile", "Settings"],
    },

    sidebar: ["Dashboard", "My Courses", "Learning Paths", "Calendar", "Mind Map", "Issues", "Profile", "Settings"],

    mega: ["Courses", "Learning Paths", "Blog", "Instructors"],

    drawer: ["Home", "Courses", "Learning Paths", "Blog / Guides", "Calendar", "Mind Map", "Contact", "Account"],
  },
};

export const INTERNAL_PAGES: InternalPage[] = INTERNAL_PAGE_SETS["ecommerce"];
export const TEMPLATE_ALLOWED: TemplateAllowed = TEMPLATE_ALLOWED_BY_SITE["ecommerce"];

/* =========================
 * LocalStorage key & utils
 * =======================*/
const LS_KEY = "menu_builder_v2_dualsets";

export function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function normalizePath(p?: string | null): string | null {
  if (!p) return null;
  let s = p.trim();
  s = s.split("#")[0].split("?")[0];
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

function computeScheduledUrl(schedules: Array<{ when: string; url: string }> | undefined, now: Date): string {
  if (!schedules?.length) return "";
  const pick = schedules
    .map((s) => ({ when: new Date(s.when), url: s.url }))
    .filter((s) => !isNaN(s.when.getTime()) && s.when <= now)
    .sort((a, b) => b.when.getTime() - a.when.getTime())[0];
  return pick?.url || "";
}

function buildTree(rows: DbMenuItem[]): (DbMenuItem & { children: DbMenuItem[] })[] {
  const byId = new Map<string, DbMenuItem & { children: DbMenuItem[] }>();
  const roots: (DbMenuItem & { children: DbMenuItem[] })[] = [];
  rows
    .slice()
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .forEach((r) => byId.set(r.id, { ...r, children: [] }));
  byId.forEach((node) => {
    if (node.parentId && byId.has(node.parentId)) byId.get(node.parentId)!.children.push(node);
    else roots.push(node);
  });
  return roots;
}

function inferLinkFromPath(
  path: string | null | undefined,
  internalPages: InternalPage[]
): {
  linkType: BuilderMenuItem["linkType"];
  externalUrl?: string;
  internalPageId?: string;
  rawPath?: string | null;
} {
  const raw = path ?? null;
  const norm = normalizePath(path);
  if (!norm) return { linkType: "internal", rawPath: raw };

  const isExternal = /^https?:\/\//i.test(norm);
  if (isExternal) return { linkType: "external", externalUrl: raw ?? undefined, rawPath: raw };

  const pageId = internalPages.find((p) => normalizePath(p.path) === norm)?.id;
  if (pageId) return { linkType: "internal", internalPageId: pageId, rawPath: raw };

  return { linkType: "internal", internalPageId: undefined, rawPath: raw };
}

function mapDbTreeToBuilder(nodes: (DbMenuItem & { children?: DbMenuItem[] })[], internalPages: InternalPage[]): BuilderMenuItem[] {
  const walk = (n: DbMenuItem & { children?: DbMenuItem[] }): BuilderMenuItem => {
    const inferred = inferLinkFromPath(n.path, internalPages);
    return {
      id: n.id,
      title: n.title,
      icon: n.icon ?? undefined,
      linkType: inferred.linkType,
      externalUrl: inferred.externalUrl,
      newTab: inferred.linkType === "external" ? false : undefined,
      internalPageId: inferred.internalPageId,
      rawPath: inferred.rawPath ?? n.path ?? null,
      schedules: [],
      children: (n.children ?? []).map(walk),
    };
  };
  return nodes.map(walk);
}

function resolvePathFromBuilder(item: BuilderMenuItem, internalPages: InternalPage[]): string | null {
  const raw = (item as any).rawPath ? String((item as any).rawPath).trim() : "";
  if (raw) return normalizePath(raw);

  if (item.linkType === "external") {
    return item.externalUrl?.trim() || null;
  }
  if (item.linkType === "internal") {
    const p = item.internalPageId ? internalPages.find((x) => x.id === item.internalPageId) : undefined;
    if (p?.path) return normalizePath(p.path);
    return null;
  }
  if (item.linkType === "scheduled") return null;
  return null;
}

function flattenBuilderToDb(tree: BuilderMenuItem[], locale: Locale, setKey: MenuSetKey, internalPages: InternalPage[]): Omit<DbMenuItem, "createdAt" | "updatedAt">[] {
  const out: Omit<DbMenuItem, "createdAt" | "updatedAt">[] = [];
  const walk = (nodes: BuilderMenuItem[], parentId: string | null) => {
    nodes.forEach((n, idx) => {
      out.push({
        id: n.id,
        parentId,
        title: n.title,
        path: resolvePathFromBuilder(n, internalPages),
        icon: (n.icon ?? null) as string | null,
        sortOrder: idx + 1,
        visible: true,
        locale,
        setKey,
      });
      if (n.children?.length) walk(n.children, n.id);
    });
  };
  walk(tree, null);
  return out;
}

type MenuState = { home: BuilderMenuItem[]; v1: BuilderMenuItem[] };

type Ctx = {
  siteKind: SiteKind;
  setSiteKind: (k: SiteKind) => void;
  templateKey: TemplateKey;
  setTemplateKey: (k: TemplateKey) => void;

  menus: MenuState;
  setMenus: React.Dispatch<React.SetStateAction<MenuState>>;
  currentSet: MenuSetKey;
  setCurrentSet: (k: MenuSetKey) => void;

  activeMenu: BuilderMenuItem[];
  setActiveMenu: (next: BuilderMenuItem[] | ((prev: BuilderMenuItem[]) => BuilderMenuItem[])) => void;

  addBlankItem: () => void;
  removeItemById: (id: string, arr?: BuilderMenuItem[]) => [BuilderMenuItem | null, BuilderMenuItem[]];
  findItem: (id: string, arr?: BuilderMenuItem[]) => BuilderMenuItem | null;
  moveToRoot: (item: BuilderMenuItem) => void;
  moveToChildren: (parentId: string, item: BuilderMenuItem) => void;
  buildHref: (it: BuilderMenuItem, now: Date) => string;
  hasScheduled: (arr?: BuilderMenuItem[]) => boolean;

  loadFromServer: (locale: Locale, setKey: MenuSetKey, siteId?: string) => Promise<void>;
  saveToServer: (locale: Locale, setKey: MenuSetKey, siteId?: string) => Promise<void>;

  TEMPLATE_ALLOWED: TemplateAllowed;
  INTERNAL_PAGES: InternalPage[];
};

const MenuCtx = createContext<Ctx | null>(null);

export function MenuStoreProvider({ children }: { children: ReactNode }) {
  const [siteKind, setSiteKind] = useState<SiteKind>("ecommerce");
  const [templateKey, setTemplateKey] = useState<TemplateKey>("header");

  const PAGES = useMemo(() => INTERNAL_PAGE_SETS[siteKind], [siteKind]);
  const TEMPLATES = useMemo(() => TEMPLATE_ALLOWED_BY_SITE[siteKind], [siteKind]);

  const [menus, setMenus] = useState<MenuState>({ home: [], v1: [] });
  const [currentSet, setCurrentSet] = useState<MenuSetKey>("home");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw);
      if (saved?.home && saved?.v1) setMenus(saved);
    } catch {}
  }, []);
  useEffect(() => {
    localStorage.setItem(LS_KEY, JSON.stringify(menus));
  }, [menus]);

  const activeMenu = useMemo(() => menus[currentSet], [menus, currentSet]);
  const setActiveMenu = (nextOrFn: BuilderMenuItem[] | ((prev: BuilderMenuItem[]) => BuilderMenuItem[])) => {
    setMenus((m) => {
      const prev = (m[currentSet] ?? []) as BuilderMenuItem[];
      const computed = typeof nextOrFn === "function" ? (nextOrFn as (p: BuilderMenuItem[]) => BuilderMenuItem[])(prev) : nextOrFn;
      return { ...m, [currentSet]: computed };
    });
  };

  const loadFromServer = async (locale: Locale, setKey: MenuSetKey, siteId?: string) => {
    const params = new URLSearchParams();
    params.set("page", "1");
    params.set("size", "1000");
    params.set("sort", "sortOrder:asc");
    params.set("locale", locale);
    params.set("setKey", setKey);
    if (siteId) params.set("siteId", siteId);

    const res = await fetch(`/api/admin/menu-items?${params.toString()}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Load failed (${res.status})`);
    const data = await res.json();
    const rows: DbMenuItem[] = data?.items ?? [];

    const treeDb = buildTree(rows);
    const builderTree = mapDbTreeToBuilder(treeDb, PAGES);
    setMenus((m) => ({ ...m, [setKey]: builderTree }));
  };

  const saveToServer = async (locale: Locale, setKey: MenuSetKey, siteId?: string) => {
    const bad: string[] = [];
    const scan = (nodes: BuilderMenuItem[]) => {
      nodes.forEach((n) => {
        if (n.linkType === "external" && !(n.externalUrl?.trim() || (n as any).rawPath?.trim())) bad.push(n.title || n.id);
        if (n.children?.length) scan(n.children);
      });
    };
    scan(activeMenu);
    if (bad.length && !confirm(`Some external items do not have URLs:\n- ${bad.join("\n- ")}\nDo you still want to save?`)) return;

    const items = flattenBuilderToDb(activeMenu, locale, setKey, PAGES);

    const payload: any = { locale, setKey, items };
    if (siteId) payload.siteId = siteId;

    const res = await fetch("/api/admin/menu-items/save-tree", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const t = await res.text().catch(() => "");
      throw new Error(t || "Save failed");
    }
  };

  function addBlankItem() {
    const item: BuilderMenuItem = {
      id: uid(),
      title: "New Item",
      icon: "",
      linkType: "internal",
      externalUrl: "",
      newTab: false,
      internalPageId: "home",
      rawPath: "/",
      schedules: [],
      children: [],
    };
    setActiveMenu([...(activeMenu || []), item]);
  }

  function removeItemById(id: string, arr: BuilderMenuItem[] = activeMenu) {
    return removeItemByIdPure(id, arr);
  }

  function removeItemByIdPure(id: string, source: BuilderMenuItem[]): [BuilderMenuItem | null, BuilderMenuItem[]] {
    let removed: BuilderMenuItem | null = null;

    const walk = (arr: BuilderMenuItem[]): BuilderMenuItem[] => {
      const out: BuilderMenuItem[] = [];
      for (const it of arr) {
        if (it.id === id) {
          removed = it;
          continue;
        }
        if (it.children?.length) {
          const nextChildren = walk(it.children);
          if (nextChildren !== it.children) {
            out.push({ ...it, children: nextChildren });
          } else {
            out.push(it);
          }
        } else {
          out.push(it);
        }
      }
      return out;
    };

    const next = walk(source);
    return [removed, next];
  }

  function findItem(id: string, arr: BuilderMenuItem[] = activeMenu): BuilderMenuItem | null {
    for (const it of arr) {
      if (it.id === id) return it;
      if (it.children?.length) {
        const f = findItem(id, it.children);
        if (f) return f;
      }
    }
    return null;
  }

  function moveToRoot(item: BuilderMenuItem) {
    setActiveMenu([...(activeMenu || []), item]);
  }

  function moveToChildren(parentId: string, item: BuilderMenuItem) {
    const next = (activeMenu || []).map((it) => (it.id === parentId ? { ...it, children: [...(it.children || []), item] } : it));
    setActiveMenu(next);
  }

  function buildHref(it: BuilderMenuItem, now: Date): string {
    if (it.linkType === "external") {
      const raw = (it as any).rawPath;
      return it.externalUrl || (raw ? String(raw).trim() : "") || "";
    }
    if (it.linkType === "internal") {
      const raw = (it as any).rawPath;
      if (raw && String(raw).trim()) return String(raw).trim();
      const p = it.internalPageId ? PAGES.find((x) => x.id === it.internalPageId) : undefined;
      return p?.path ?? "";
    }
    if (it.linkType === "scheduled") return computeScheduledUrl(it.schedules, now);
    return "";
  }

  const hasScheduled = (arr: BuilderMenuItem[] = activeMenu): boolean => arr.some((m) => m.linkType === "scheduled" || (m.children?.length && hasScheduled(m.children)));

  const value: Ctx = {
    siteKind,
    setSiteKind,
    templateKey,
    setTemplateKey,

    menus,
    setMenus,
    currentSet,
    setCurrentSet,

    activeMenu,
    setActiveMenu,

    addBlankItem,
    removeItemById,
    findItem,
    moveToRoot,
    moveToChildren,
    buildHref,
    hasScheduled,

    loadFromServer,
    saveToServer,

    TEMPLATE_ALLOWED: TEMPLATES,
    INTERNAL_PAGES: PAGES,
  };

  return <MenuCtx.Provider value={value}>{children}</MenuCtx.Provider>;
}

export function useMenuStore() {
  const ctx = useContext(MenuCtx);
  if (!ctx) throw new Error("useMenuStore must be used inside <MenuStoreProvider>");
  return ctx;
}
