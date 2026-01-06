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
  level1: ["Thời trang", "Điện tử", "Gia dụng", "Sách"],
  level2ByL1: {
    "Thời trang": ["Áo sơ mi", "Quần jeans", "Giày", "Phụ kiện"],
    "Điện tử": ["Tivi", "Điện thoại", "Laptop", "Tai nghe"],
    "Gia dụng": ["Nồi chiên không dầu", "Nồi cơm", "Máy lọc không khí", "Máy hút bụi"],
    Sách: ["Sách mới", "Kinh doanh", "Kỹ năng", "Thiếu nhi"],
  },
};

const INTERNAL_PAGE_SETS: Record<SiteKind, InternalPage[]> = {
  ecommerce: [
    // ======== HOME / DISCOVERY ========
    { id: "home", path: "/", label: "Home", labelVi: "Trang chủ", aliases: ["🏠 Trang chủ", "Trang chủ", "Home"], tags: ["nav", "landing"] },
    { id: "search", path: "/search", label: "Search", labelVi: "Tìm kiếm", aliases: ["Tìm kiếm", "Search"], tags: ["nav"] },
    { id: "categories", path: "/categories", label: "All Categories", labelVi: "Danh mục", aliases: ["Danh mục", "Categories"], tags: ["nav"] },
    { id: "products", path: "/products", label: "Products", labelVi: "Sản phẩm", aliases: ["🛍️ Sản phẩm", "Sản phẩm", "Products"], tags: ["nav"] },
    { id: "collections", path: "/collections", label: "Collections", labelVi: "Bộ sưu tập", aliases: ["Bộ sưu tập"], tags: ["marketing"] },
    { id: "new-arrivals", path: "/new", label: "New Arrivals", labelVi: "Hàng mới", aliases: ["🆕 Hàng mới", "Hàng mới"], tags: ["marketing", "nav"] },
    { id: "best-sellers", path: "/best-sellers", label: "Best Sellers", labelVi: "Bán chạy", aliases: ["Bán chạy", "Best Sellers"], tags: ["marketing"] },
    { id: "promotions", path: "/promotions", label: "Promotions", labelVi: "Khuyến mãi", aliases: ["💎 Khuyến mãi", "Khuyến mãi"], tags: ["marketing", "nav"] },
    { id: "promotions-coupons", path: "/promotions/coupons", label: "Coupons", labelVi: "Mã giảm", tags: ["marketing"] },
    { id: "promotions-flash", path: "/promotions/flash-sale", label: "Flash Sale", labelVi: "Flash Sale", tags: ["marketing"] },
    { id: "promotions-combo", path: "/promotions/combo", label: "Combos", labelVi: "Combo hot", tags: ["marketing"] },

    // ======== CONTENT / SEO ========
    { id: "blog", path: "/blog", label: "Blog", labelVi: "Blog / Cẩm nang", aliases: ["📰 Blog", "Blog / Cẩm nang", "Cẩm nang"], tags: ["seo", "content", "nav"] },
    { id: "guides", path: "/guides", label: "Buying Guides", labelVi: "Hướng dẫn mua hàng", aliases: ["Hướng dẫn"], tags: ["seo", "content"] },
    { id: "about", path: "/about-us", label: "About Us", labelVi: "Về chúng tôi", aliases: ["Giới thiệu", "About"], tags: ["seo"] },

    // ======== SUPPORT ========
    { id: "contact", path: "/contact", label: "Contact", labelVi: "Liên hệ", aliases: ["📞 Liên hệ", "Liên hệ"], tags: ["support", "nav"] },
    { id: "support-center", path: "/support", label: "Support Center", labelVi: "Trung tâm CSKH", tags: ["support"] },
    { id: "live-chat", path: "/support/chat", label: "Live Chat", labelVi: "Chat trực tuyến", tags: ["support"] },
    { id: "faq", path: "/support/faq", label: "FAQ", labelVi: "Câu hỏi thường gặp", tags: ["support", "seo"] },
    { id: "shipping", path: "/support/shipping", label: "Shipping Policy", labelVi: "Vận chuyển", tags: ["support"] },
    { id: "returns", path: "/support/returns", label: "Returns & Refunds", labelVi: "Đổi trả & Hoàn tiền", tags: ["support"] },
    { id: "stores", path: "/stores", label: "Stores", labelVi: "Hệ thống cửa hàng", tags: ["support"] },

    // ======== ACCOUNT / CHECKOUT ========
    { id: "account", path: "/account", label: "Account", labelVi: "Tài khoản", aliases: ["👤 Tài khoản", "Tài khoản"], tags: ["account", "nav"] },
    { id: "sign-in", path: "/account/sign-in", label: "Sign in / Sign up", labelVi: "Đăng nhập / Đăng ký", tags: ["account"] },
    { id: "orders", path: "/account/orders", label: "My Orders", labelVi: "Đơn hàng của tôi", tags: ["account"] },
    { id: "wishlist", path: "/account/wishlist", label: "Wishlist", labelVi: "Yêu thích", tags: ["account"] },
    { id: "cart", path: "/cart", label: "Cart", labelVi: "Giỏ hàng", aliases: ["Giỏ hàng"], tags: ["checkout"] },
    { id: "checkout", path: "/checkout", label: "Checkout", labelVi: "Thanh toán", tags: ["checkout"] },

    // ======== LEGAL ========
    { id: "privacy", path: "/legal/privacy", label: "Privacy Policy", labelVi: "Chính sách bảo mật", tags: ["legal", "seo"] },
    { id: "terms", path: "/legal/terms", label: "Terms of Service", labelVi: "Điều khoản sử dụng", tags: ["legal"] },

    // ======== LEGACY / V1 (giữ nếu còn dùng) ========
    { id: "v1-home", path: "/v1", label: "V1 Home", tags: ["legacy"] },
    { id: "v1-products", path: "/v1/products", label: "V1 Products", tags: ["legacy"] },
    { id: "v1-reports", path: "/v1/reports", label: "V1 Reports", tags: ["legacy"] },
    { id: "v1-new", path: "/v1/new", label: "V1 New", tags: ["legacy"] },

    // ======== ADMIN / DASHBOARD (nên có) ========
    { id: "admin", path: "/admin", label: "Dashboard", labelVi: "Bảng điều khiển", aliases: ["Dashboard"], tags: ["admin"] },
    { id: "admin-orders", path: "/admin/orders", label: "Orders", labelVi: "Đơn hàng", tags: ["admin"] },
    { id: "admin-products", path: "/admin/products", label: "Products", labelVi: "Sản phẩm", tags: ["admin"] },
    { id: "admin-categories", path: "/admin/categories", label: "Categories", labelVi: "Danh mục", tags: ["admin"] },
    { id: "admin-inventory", path: "/admin/inventory", label: "Inventory", labelVi: "Tồn kho", tags: ["admin"] },
    { id: "admin-discounts", path: "/admin/discounts", label: "Discounts", labelVi: "Khuyến mãi", tags: ["admin"] },
    { id: "admin-customers", path: "/admin/customers", label: "Customers", labelVi: "Khách hàng", tags: ["admin"] },
    { id: "admin-reviews", path: "/admin/reviews", label: "Reviews", labelVi: "Đánh giá", tags: ["admin"] },
    { id: "admin-content", path: "/admin/content", label: "Content", labelVi: "Nội dung", tags: ["admin"] },
    { id: "admin-reports", path: "/admin/reports", label: "Reports", labelVi: "Báo cáo", tags: ["admin"] },
    { id: "admin-settings", path: "/admin/settings", label: "Settings", labelVi: "Cài đặt", tags: ["admin"] },
  ],
  corporate: [
    { id: "home", path: "/", label: "Home", labelVi: "Trang chủ", aliases: ["Trang chủ", "Home"], tags: ["nav", "landing"] },
    { id: "about", path: "/about", label: "About", labelVi: "Giới thiệu", tags: ["nav"] },
    { id: "services", path: "/services", label: "Services", labelVi: "Dịch vụ", tags: ["nav"] },
    { id: "solutions", path: "/solutions", label: "Solutions", labelVi: "Giải pháp", tags: ["nav"] },
    { id: "case-studies", path: "/case-studies", label: "Case Studies", labelVi: "Case study", tags: ["content"] },
    { id: "blog", path: "/blog", label: "Blog", labelVi: "Blog", tags: ["content", "seo"] },
    { id: "careers", path: "/careers", label: "Careers", labelVi: "Tuyển dụng", tags: ["nav"] },
    { id: "contact", path: "/contact", label: "Contact", labelVi: "Liên hệ", tags: ["nav"] },
  ],
  education: [
    { id: "home", path: "/", label: "Home", labelVi: "Trang chủ", tags: ["nav", "landing"] },
    { id: "courses", path: "/courses", label: "Courses", labelVi: "Khóa học", tags: ["nav"] },
    { id: "tracks", path: "/tracks", label: "Learning Paths", labelVi: "Lộ trình", tags: ["nav"] },
    { id: "resources", path: "/resources", label: "Resources", labelVi: "Tài nguyên", tags: ["content"] },
    { id: "blog", path: "/blog", label: "Blog", labelVi: "Blog", tags: ["seo", "content"] },
    { id: "pricing", path: "/pricing", label: "Pricing", labelVi: "Bảng giá", tags: ["nav"] },
    { id: "account", path: "/account", label: "Account", labelVi: "Tài khoản", tags: ["account", "nav"] },
    { id: "contact", path: "/contact", label: "Contact", labelVi: "Liên hệ", tags: ["nav"] },
  ],
};

const TEMPLATE_ALLOWED_BY_SITE: Record<SiteKind, TemplateAllowed> = {
  ecommerce: {
    header: {
      home: ["Trang chủ", "Danh mục", "Sản phẩm", "Hàng mới", "Bán chạy", "Khuyến mãi", "Blog / Cẩm nang", "Liên hệ", "Tài khoản", "Giỏ hàng"],
      dashboard: ["Dashboard", "Đơn hàng", "Sản phẩm", "Danh mục", "Tồn kho", "Khuyến mãi", "Khách hàng", "Đánh giá", "Nội dung", "Báo cáo", "Cài đặt"],
    },

    mega: ["Thời trang", "Điện tử", "Gia dụng", "Sách"],

    drawer: ["Trang chủ", "Danh mục", "Sản phẩm", "Hàng mới", "Bán chạy", "Khuyến mãi", "Blog / Cẩm nang", "Tài khoản", "Giỏ hàng", "Liên hệ", "Trung tâm CSKH", "Câu hỏi thường gặp"],

    sidebar: ["Tài khoản", "Đơn hàng của tôi", "Yêu thích", "Đăng nhập / Đăng ký"],
  },

  corporate: {
    header: {
      home: ["Trang chủ", "Giới thiệu", "Dịch vụ", "Giải pháp", "Dự án", "Tin tức", "Tuyển dụng", "Liên hệ"],
      dashboard: ["Dashboard", "Quản lý dự án", "Quản lý khách hàng", "Quản lý dịch vụ", "Bài viết & Blog", "Tuyển dụng nội bộ", "Báo cáo kinh doanh", "Cài đặt hệ thống"],
    },
  },

  education: {
    header: {
      home: ["Trang chủ", "Khóa học", "Lộ trình học", "Blog / Cẩm nang", "Giảng viên", "Calendar", "Mind Map", "Liên hệ", "Tài khoản"],
      dashboard: ["Dashboard", "Khóa học của tôi", "Lộ trình học tập", "Calendar", "Mind Map", "Issue", "Profile", "Cài đặt"],
    },

    sidebar: ["Dashboard", "Khóa học của tôi", "Lộ trình học tập", "Calendar", "Mind Map", "Issue", "Profile", "Cài đặt"],

    mega: ["Khóa học", "Lộ trình học", "Blog", "Giảng viên"],
    drawer: ["Trang chủ", "Khóa học", "Lộ trình học", "Blog / Cẩm nang", "Calendar", "Mind Map", "Liên hệ", "Tài khoản"],
  },
};

/* =========================
 * Exports giữ API tĩnh (mặc định ecommerce)
 * =======================*/
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
    if (bad.length && !confirm(`Một số item external chưa có URL:\n- ${bad.join("\n- ")}\nVẫn muốn lưu chứ?`)) return;

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
          removed = it; // bắt được node bị xoá
          continue; // không push vào out
        }
        if (it.children?.length) {
          const nextChildren = walk(it.children);
          if (nextChildren !== it.children) {
            out.push({ ...it, children: nextChildren }); // copy node khi children đổi
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
