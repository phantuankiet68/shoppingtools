"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Header/HeaderAnnouncement.module.css";
import type { RegItem } from "@/lib/ui-builder/types";
import HeaderAuthModal from "@/components/admin/shared/popup/header/HeaderAuthModal";
import { getMe, logoutUser } from "@/store/auth/auth-client";

export type MegaColumn = {
  title: string;
  items: { label: string; href: string }[];
};

export type NavItem =
  | { type: "link"; label: string; href: string; icon: string }
  | { type: "mega"; label: string; icon: string; columns: MegaColumn[] };

export type ProductNotificationItem = {
  id: string;
  title: string;
  message: string;
  time: string;
  href?: string;
  unread?: boolean;
  thumbnail?: string;
  tag?: string;
};

export type OrderPopupItem = {
  id: string;
  orderNumber: string;
  placedAt: string;
  deliveryText: string;
  deliveryTone?: "success" | "warning" | "muted";
  rating?: number;
  image?: string;
  href?: string;
};

export type HeaderMenuMode = "auto" | "custom";

export type HeaderAnnouncementProps = {
  brandHref?: string;
  brandName?: string;
  brandSub?: string;
  logoSrc: string;
  logoAlt?: string;
  searchPlaceholder?: string;
  onSearchSubmit?: (q: string) => void;
  badgeCart?: number;
  navItems?: NavItem[];
  notifications?: ProductNotificationItem[];
  notificationHref?: string;
  preview?: boolean;
  menuApiUrl?: string;
  menuSetKey?: string;
  menuMode?: HeaderMenuMode;
  isAuthed?: boolean;
  orders?: OrderPopupItem[];
  orderHref?: string;
  siteId?: string;
  siteDomain?: string;
};

type AuthMode = "login" | "register";
type PopupKey = "notification" | "order" | "account" | null;

type ApiLayoutItem = {
  id: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
};

type ApiTreeNode = {
  key: string;
  title: string;
  icon: string;
  path: string | null;
  parentKey: string | null;
  children?: ApiTreeNode[];
};

type CurrentUser = {
  id: string;
  email: string;
  role: string;
  status: string;
  image?: string | null;
  name?: string | null;
};

type ProductSearchItem = {
  id: string;
  name: string;
  slug: string;
  shortDescription?: string | null;
  productType?: string | null;
  tags?: string[];
  price?: string | null;
  marketPrice?: string | null;
  savingPrice?: string | null;
  productQty?: number;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  brand?: {
    id: string;
    name: string;
    slug: string;
    logoUrl?: string | null;
  } | null;
  image?: {
    id: string;
    url: string;
    sort?: number | null;
  } | null;
};

type ProductSearchResponse = {
  siteId?: string;
  domain?: string;
  keyword?: string;
  items?: ProductSearchItem[];
  total?: number;
  error?: string;
};

const HEADER_ORDER = [
  "Home",
  "Shop",
  "Products",
  "New Arrivals",
  "Best Sellers",
  "Featured",
  "Flash Sale",
  "Deals",
  "Contact",
] as const;

const HEADER_ALLOWED = new Set<string>(HEADER_ORDER);

const AUTO_SEED_HINTS = new Set<string>([
  "Categories",
  "Collections",
  "Brands",
  "Trending",
  "Offers",
  "Coupons",
  "Gift Cards",
  "Wishlist",
  "Cart",
  "Checkout",
  "My Account",
  "My Orders",
  "Order Tracking",
  "Addresses",
  "About Us",
  "FAQ",
  "Blog",
  "Shipping Info",
  "Return Policy",
  "Size Guide",
  "Privacy Policy",
  "Terms & Conditions",
]);

const FALLBACK_IMAGE = "/assets/images/logo.jpg";

const DEFAULT_NOTIFICATIONS: ProductNotificationItem[] = [
  {
    id: "1",
    title: "New product available",
    message: "Laneige Lip Sleeping Mask has just arrived.",
    time: "20 min ago",
    href: "/products/laneige-lip-sleeping-mask",
    unread: true,
    thumbnail: FALLBACK_IMAGE,
    tag: "New",
  },
  {
    id: "2",
    title: "Flash sale started",
    message: "Up to 40% off on skincare products today.",
    time: "1 hour ago",
    href: "/sale",
    unread: true,
    thumbnail: FALLBACK_IMAGE,
    tag: "Sale",
  },
  {
    id: "3",
    title: "Back in stock",
    message: "CeraVe Foaming Cleanser is available again.",
    time: "3 hours ago",
    href: "/products/cerave-foaming-cleanser",
    unread: false,
    thumbnail: FALLBACK_IMAGE,
    tag: "Stock",
  },
];

const DEFAULT_ORDERS: OrderPopupItem[] = [
  {
    id: "1",
    orderNumber: "#999012",
    placedAt: "20-Dec-2019, 3:00 PM",
    deliveryText: "Estimated Delivery on 21 Dec",
    deliveryTone: "success",
    rating: 1,
    image: FALLBACK_IMAGE,
    href: "/account/orders/999012",
  },
  {
    id: "2",
    orderNumber: "#6660212",
    placedAt: "15-Dec-2019, 1:00 PM",
    deliveryText: "Delivered on 16 Dec",
    deliveryTone: "warning",
    rating: 4,
    image: FALLBACK_IMAGE,
    href: "/account/orders/6660212",
  },
  {
    id: "3",
    orderNumber: "#551221",
    placedAt: "14-Dec-2019, 3:00 PM",
    deliveryText: "Delivered on 15 Dec",
    deliveryTone: "warning",
    rating: 4,
    image: FALLBACK_IMAGE,
    href: "/account/orders/551221",
  },
];

function normalizePath(path?: string | null): string {
  const value = String(path || "").trim();
  if (!value) return "/";
  return value.startsWith("/") ? value : `/${value}`;
}

function normalizeIcon(raw?: string | null): string {
  const value = String(raw || "").trim();
  if (!value) return "bi-dot";
  return value.replace(/^bi\s+bi-/i, "bi-").replace(/^bi\s+/i, "").trim();
}

function buildTreeFromItems(rows: ApiLayoutItem[]): ApiTreeNode[] {
  const visibleRows = rows.filter((row) => row.visible);
  const nodeMap = new Map<string, ApiTreeNode>();
  const orderMap = new Map<string, number>();

  for (const row of visibleRows) {
    nodeMap.set(row.id, {
      key: row.id,
      title: row.title,
      icon: normalizeIcon(row.icon),
      path: row.path,
      parentKey: row.parentId,
      children: [],
    });
    orderMap.set(row.id, row.sortOrder);
  }

  const roots: ApiTreeNode[] = [];

  for (const row of visibleRows) {
    const node = nodeMap.get(row.id);
    if (!node) continue;

    if (row.parentId && nodeMap.has(row.parentId)) {
      nodeMap.get(row.parentId)?.children?.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortTree = (nodes: ApiTreeNode[]) => {
    nodes.sort((a, b) => {
      const aOrder = orderMap.get(a.key) ?? 0;
      const bOrder = orderMap.get(b.key) ?? 0;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.title.localeCompare(b.title);
    });

    nodes.forEach((node) => {
      if (node.children?.length) sortTree(node.children);
    });
  };

  sortTree(roots);
  return roots;
}

function sortByHeaderOrder<T extends { title: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const aIndex = HEADER_ORDER.indexOf(a.title as (typeof HEADER_ORDER)[number]);
    const bIndex = HEADER_ORDER.indexOf(b.title as (typeof HEADER_ORDER)[number]);
    const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    return safeA - safeB;
  });
}

function isAutoGeneratedMenu(tree: ApiTreeNode[]): boolean {
  if (tree.length >= 12) return true;

  let hintCount = 0;
  for (const item of tree) {
    if (AUTO_SEED_HINTS.has(item.title)) {
      hintCount += 1;
    }
  }

  return hintCount >= 4;
}

function resolveHeaderTree(tree: ApiTreeNode[], menuMode: HeaderMenuMode): ApiTreeNode[] {
  if (menuMode === "custom") {
    return tree;
  }

  if (!isAutoGeneratedMenu(tree)) {
    return tree;
  }

  const filtered = tree.filter((item) => HEADER_ALLOWED.has(item.title));
  return sortByHeaderOrder(filtered);
}

function treeToNavItems(tree: ApiTreeNode[]): NavItem[] {
  return tree.map((node) => {
    const children = node.children ?? [];

    if (!children.length) {
      return {
        type: "link",
        label: node.title,
        href: normalizePath(node.path),
        icon: normalizeIcon(node.icon),
      } satisfies NavItem;
    }

    const columns = children
      .map((child) => {
        const items = (child.children ?? [])
          .filter((item) => item.title && item.path)
          .map((item) => ({
            label: item.title,
            href: normalizePath(item.path),
          }));

        if (!items.length && child.path) {
          return {
            title: child.title,
            items: [{ label: child.title, href: normalizePath(child.path) }],
          };
        }

        return {
          title: child.title,
          items,
        };
      })
      .filter((column) => column.title && column.items.length);

    if (!columns.length) {
      return {
        type: "link",
        label: node.title,
        href: normalizePath(node.path),
        icon: normalizeIcon(node.icon),
      } satisfies NavItem;
    }

    return {
      type: "mega",
      label: node.title,
      icon: normalizeIcon(node.icon),
      columns,
    } satisfies NavItem;
  });
}

function renderStars(rating = 0) {
  return Array.from({ length: 5 }, (_, index) => {
    const filled = index < Math.max(0, Math.min(5, rating));
    return (
      <i key={index} className={`bi ${filled ? "bi-star-fill" : "bi-star"} ${cls.orderStar}`} aria-hidden="true" />
    );
  });
}

function buildProductHref(slug?: string | null) {
  const clean = String(slug || "").trim();
  if (!clean) return "/products";
  return `/products/${clean}`;
}

type SmartLinkProps = {
  preview?: boolean;
  href: string;
  className?: string;
  onClick?: () => void;
  children: React.ReactNode;
};

function SmartLink({ preview, href, className, onClick, children }: SmartLinkProps) {
  if (preview) {
    return (
      <a
        href="#"
        className={className}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href as Route} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

export function HeaderAnnouncement({
  brandHref = "/",
  brandName = "Tuan Kiet Store",
  brandSub = "COSMETICS",
  logoSrc,
  logoAlt = "",
  searchPlaceholder = "What are you looking for today?",
  onSearchSubmit,
  badgeCart = 0,
  navItems,
  notifications = DEFAULT_NOTIFICATIONS,
  notificationHref = "/notifications",
  preview = false,
  menuApiUrl = "/api/admin/menus/header-menu",
  menuSetKey = "home",
  menuMode = "auto",
  isAuthed = false,
  orders = DEFAULT_ORDERS,
  orderHref = "/account/orders",
  siteId = "",
  siteDomain = "",
}: HeaderAnnouncementProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  const [mounted, setMounted] = useState(false);
  const [safeLogo, setSafeLogo] = useState(logoSrc || FALLBACK_IMAGE);
  const [apiNav, setApiNav] = useState<NavItem[]>([]);
  const [query, setQuery] = useState("");
  const [openMegaIndex, setOpenMegaIndex] = useState<number | null>(null);
  const [activePopup, setActivePopup] = useState<PopupKey>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [isPinned, setIsPinned] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authChecked, setAuthChecked] = useState(preview);
  const [headerHeight, setHeaderHeight] = useState(0);

  const [productResults, setProductResults] = useState<ProductSearchItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTouched, setSearchTouched] = useState(false);

  const items = useMemo(() => (navItems?.length ? navItems : apiNav), [navItems, apiNav]);
  const unreadNotificationCount = useMemo(() => notifications.filter((item) => item.unread).length, [notifications]);
  const orderPreviewItems = useMemo(() => orders.slice(0, 6), [orders]);
  const isLoggedIn = preview ? Boolean(isAuthed) : authChecked && Boolean(currentUser);
  const trimmedQuery = query.trim();

  const displayName = useMemo(() => {
    if (!currentUser) return "Your account";
    if (currentUser.name?.trim()) return currentUser.name.trim();
    if (currentUser.email) return currentUser.email.split("@")[0];
    return "Your account";
  }, [currentUser]);

  const displayRole = currentUser?.role || "Account";

  const closeAll = () => {
    setOpenMegaIndex(null);
    setActivePopup(null);
  };

  const closeSearchDropdown = () => {
    setSearchOpen(false);
  };

  const togglePopup = (key: Exclude<PopupKey, null>) => {
    setAuthOpen(false);
    setOpenMegaIndex(null);
    setSearchOpen(false);
    setActivePopup((current) => (current === key ? null : key));
  };

  useEffect(() => setMounted(true), []);
  useEffect(() => setSafeLogo(logoSrc || FALLBACK_IMAGE), [logoSrc]);

  useEffect(() => {
    if (!mounted || !headerRef.current) return;
    setHeaderHeight(headerRef.current.offsetHeight);
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    if (preview) {
      setAuthChecked(true);
      return;
    }

    let alive = true;

    (async () => {
      try {
        const response = await getMe();
        if (alive) setCurrentUser(response.user);
      } catch {
        if (alive) setCurrentUser(null);
      } finally {
        if (alive) setAuthChecked(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, [mounted, preview]);

  useEffect(() => {
    if (!mounted || preview || navItems?.length) return;

    let alive = true;

    (async () => {
      try {
        const params = new URLSearchParams({
          setKey: menuSetKey || "home",
          tree: "1",
          includeHidden: "0",
          page: "1",
          size: "1000",
          sort: "sortOrder:asc",
        });

        if (siteId) params.set("siteId", siteId);

        const response = await fetch(`${menuApiUrl}?${params.toString()}`, {
          cache: "no-store",
          credentials: "include",
          headers: siteDomain ? { "x-site-domain": siteDomain } : undefined,
        });

        if (!response.ok) throw new Error("Failed to load menu");

        const data = (await response.json()) as {
          tree?: ApiTreeNode[];
          items?: ApiLayoutItem[];
        };

        const rawTree =
          Array.isArray(data.tree) && data.tree.length
            ? data.tree
            : Array.isArray(data.items)
              ? buildTreeFromItems(data.items)
              : [];

        const finalTree = resolveHeaderTree(rawTree, menuMode);

        if (alive) setApiNav(treeToNavItems(finalTree));
      } catch {
        if (alive) setApiNav([]);
      }
    })();

    return () => {
      alive = false;
    };
  }, [mounted, preview, navItems, menuApiUrl, menuSetKey, menuMode, siteId, siteDomain]);

  useEffect(() => {
    if (!mounted || preview) return;

    const onScroll = () => {
      const nextPinned = window.scrollY > 80;
      setIsPinned((prev) => (prev === nextPinned ? prev : nextPinned));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [mounted, preview]);

  useEffect(() => {
    if (!mounted) return;

    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      if (!target || rootRef.current?.contains(target)) return;
      closeAll();
      setAuthOpen(false);
      closeSearchDropdown();
    };

    const onEscape = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      closeAll();
      setAuthOpen(false);
      closeSearchDropdown();
    };

    document.addEventListener("click", onDocumentClick);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("click", onDocumentClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, [mounted]);

  useEffect(() => {
    if (!mounted || preview) return;

    const keyword = trimmedQuery;
    if (!keyword) {
      setProductResults([]);
      setSearchLoading(false);
      setSearchOpen(false);
      return;
    }

    let alive = true;
    const controller = new AbortController();

    const timer = window.setTimeout(async () => {
      try {
        setSearchLoading(true);

        const params = new URLSearchParams({
          keyword,
          limit: "8",
        });

        if (siteId) params.set("siteId", siteId);

        const response = await fetch(`/api/v1/products?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...(siteDomain ? { "x-site-domain": siteDomain } : {}),
          },
        });

        if (!response.ok) {
          throw new Error("Failed to search products");
        }

        const data = (await response.json()) as ProductSearchResponse;
        if (!alive) return;

        setProductResults(Array.isArray(data.items) ? data.items : []);
        setSearchOpen(true);
      } catch {
        if (!alive) return;
        setProductResults([]);
        setSearchOpen(true);
      } finally {
        if (alive) setSearchLoading(false);
      }
    }, 300);

    return () => {
      alive = false;
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [mounted, preview, trimmedQuery, siteId, siteDomain]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      setCurrentUser(null);
      setActivePopup(null);
      setAuthOpen(false);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextQuery = query.trim();
    if (!nextQuery) {
      setProductResults([]);
      setSearchOpen(false);
      return;
    }

    if (!preview) {
      onSearchSubmit?.(nextQuery);
    }

    setSearchOpen(false);
  };

  return (
    <div style={{ height: isPinned ? headerHeight : undefined }}>
      <header
        ref={(node) => {
          headerRef.current = node;
          rootRef.current = node;
        }}
        className={`${cls.header} ${isPinned ? cls.headerPinned : ""}`}
        suppressHydrationWarning
      >
        <div className={cls.mainShell}>
          <div className={cls.container}>
            <div className={cls.mainRow}>
              <div className={cls.leftZone}>
                <SmartLink preview={preview} href={brandHref} className={cls.logo}>
                  <span className={cls.logoBadge}>
                    <Image
                      src={safeLogo}
                      alt={logoAlt}
                      fill
                      sizes="64px"
                      className={cls.logoImg}
                      onError={() => setSafeLogo(FALLBACK_IMAGE)}
                    />
                  </span>

                  <span className={cls.logoText}>
                    <span className={cls.logoName}>{brandName}</span>
                    <span className={cls.logoSub}>{brandSub}</span>
                  </span>
                </SmartLink>
              </div>

              <div className={cls.centerZone}>
                <form className={cls.search} onSubmit={handleSearchSubmit}>
                  <div className={cls.searchBox}>
                    <div className={cls.leftIcon}>
                      <i className="bi bi-search" />
                    </div>

                    <input
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setSearchTouched(true);
                      }}
                      onFocus={() => {
                        if (trimmedQuery) setSearchOpen(true);
                      }}
                      type="text"
                      placeholder={searchPlaceholder || "Search product..."}
                      autoComplete="off"
                      suppressHydrationWarning
                    />

                    {!!query && (
                      <button
                        type="button"
                        className={cls.clearBtn}
                        onClick={() => {
                          setQuery("");
                          setProductResults([]);
                          setSearchTouched(false);
                          setSearchOpen(false);
                        }}
                        aria-label="Clear search"
                      >
                        <i className="bi bi-x" />
                      </button>
                    )}

                    <button type="submit" className={cls.searchBtn} aria-label="Search">
                      <i className="bi bi-search" />
                      <span>Search</span>
                    </button>
                  </div>

                  {searchTouched && trimmedQuery && searchOpen && (
                    <div className={cls.searchDropdown} role="listbox" aria-label="Product search suggestions">
                      {searchLoading ? (
                        <div className={cls.searchState}>Đang tìm sản phẩm...</div>
                      ) : productResults.length > 0 ? (
                        <>
                          <div className={cls.searchDropdownList}>
                            {productResults.map((item) => (
                              <SmartLink
                                key={item.id}
                                preview={preview}
                                href={buildProductHref(item.slug)}
                                className={cls.searchItem}
                                onClick={() => {
                                  setSearchOpen(false);
                                  setOpenMegaIndex(null);
                                  setActivePopup(null);
                                }}
                              >
                                <span className={cls.searchItemThumb}>
                                  <Image
                                    src={item.image?.url || FALLBACK_IMAGE}
                                    alt={item.name}
                                    fill
                                    sizes="56px"
                                    className={cls.searchItemThumbImg}
                                  />
                                </span>

                                <span className={cls.searchItemBody}>
                                  <span className={cls.searchItemName}>{item.name}</span>

                                  {!!item.shortDescription && (
                                    <span className={cls.searchItemDesc}>{item.shortDescription}</span>
                                  )}

                                  <span className={cls.searchItemMeta}>
                                    {item.brand?.name ? (
                                      <span className={cls.searchItemBrand}>{item.brand.name}</span>
                                    ) : null}

                                    {item.category?.name ? (
                                      <span className={cls.searchItemCategory}>{item.category.name}</span>
                                    ) : null}

                                    {item.price ? <strong className={cls.searchItemPrice}>{item.price}</strong> : null}
                                  </span>
                                </span>
                              </SmartLink>
                            ))}
                          </div>

                          <button type="submit" className={cls.searchViewAll} onClick={() => setSearchOpen(false)}>
                            Xem tất cả kết quả cho “{trimmedQuery}”
                          </button>
                        </>
                      ) : (
                        <div className={cls.searchState}>Không tìm thấy sản phẩm phù hợp.</div>
                      )}
                    </div>
                  )}
                </form>
              </div>

              <div className={cls.rightZone}>
                <div className={cls.accountWrap}>
                  <button
                    className={`${cls.actionBtn} ${cls.accountBtn}`}
                    type="button"
                    suppressHydrationWarning
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();

                      if (preview) return;
                      if (!isLoggedIn) {
                        setOpenMegaIndex(null);
                        setActivePopup(null);
                        setSearchOpen(false);
                        setAuthMode("login");
                        setAuthOpen(true);
                        return;
                      }

                      togglePopup("account");
                    }}
                    aria-haspopup={isLoggedIn ? "menu" : "dialog"}
                    aria-expanded={isLoggedIn ? activePopup === "account" : authOpen}
                  >
                    <span className={cls.actionIcon}>
                      <i className="bi bi-person" />
                    </span>
                    <span className={cls.actionText}>
                      <span>{isLoggedIn ? `Hello, ${displayName}` : authChecked ? "Login" : "Loading..."}</span>
                      <strong>{isLoggedIn ? displayRole : "Account"}</strong>
                    </span>
                    <i className={`bi bi-chevron-down ${cls.actionCaret}`} />
                  </button>

                  {mounted && isLoggedIn && activePopup === "account" && (
                    <div className={cls.accountDropdown} role="menu" aria-label="Account menu">
                      <div className={cls.accountDropdownHead}>
                        <div className={cls.accountDflex}>
                          <strong>{displayName}</strong>
                          <small>{displayRole}</small>
                        </div>
                        <span>{currentUser?.email}</span>
                      </div>

                      <div className={cls.accountDropdownBody}>
                        <SmartLink preview={preview} href="/account" className={cls.accountDropdownLink} onClick={closeAll}>
                          <i className="bi bi-person-circle" />
                          <span>My account</span>
                        </SmartLink>
                        <button
                          type="button"
                          suppressHydrationWarning
                          className={cls.accountDropdownLogout}
                          onClick={handleLogout}
                        >
                          <i className="bi bi-box-arrow-right" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className={cls.notificationWrap}>
                  <button
                    className={cls.actionBtn}
                    type="button"
                    aria-label="Notifications"
                    aria-haspopup="dialog"
                    aria-expanded={activePopup === "notification"}
                    suppressHydrationWarning
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (!preview) togglePopup("notification");
                    }}
                  >
                    <span className={cls.actionIcon}>
                      <i className="bi bi-bell" />
                    </span>
                    <span className={cls.actionText}>
                      <span>Updates</span>
                      <strong>Notifications</strong>
                    </span>
                    {unreadNotificationCount > 0 && <span className={cls.miniBadge}>{unreadNotificationCount}</span>}
                  </button>

                  {mounted && activePopup === "notification" && (
                    <div className={cls.notificationDropdown} role="dialog" aria-label="Notifications popup">
                      <div className={cls.notificationHead}>
                        <div className={cls.notificationHeadLeft}>
                          <div className={cls.notificationHeadIcon}>
                            <i className="bi bi-bell" />
                          </div>
                          <div className={cls.notificationHeadText}>
                            <strong>Notifications</strong>
                            <span>
                              You have <b>{unreadNotificationCount}</b> unread updates
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={cls.notificationList}>
                        {notifications.map((item) => (
                          <SmartLink
                            key={item.id}
                            preview={preview}
                            href={item.href || notificationHref}
                            className={`${cls.notificationItem} ${item.unread ? cls.notificationUnread : ""}`}
                            onClick={closeAll}
                          >
                            <span className={cls.notificationThumb}>
                              <Image
                                src={item.thumbnail || FALLBACK_IMAGE}
                                alt={item.title}
                                fill
                                sizes="56px"
                                className={cls.notificationThumbImg}
                              />
                            </span>

                            <span className={cls.notificationBody}>
                              <span className={cls.notificationTitle}>{item.title}</span>
                              <span className={cls.notificationMessage}>{item.message}</span>
                              <span className={cls.notificationMeta}>
                                {item.tag ? <span className={cls.notificationTag}>{item.tag}</span> : null}
                                <span className={cls.notificationTime}>{item.time}</span>
                              </span>
                            </span>
                          </SmartLink>
                        ))}
                      </div>

                      <div className={cls.notificationFooter}>
                        <button type="button" className={cls.notificationFooterLink} suppressHydrationWarning>
                          Mark all as read
                        </button>
                        <SmartLink
                          preview={preview}
                          href={notificationHref}
                          className={cls.notificationFooterBtn}
                          onClick={closeAll}
                        >
                          Go to notification center
                        </SmartLink>
                      </div>
                    </div>
                  )}
                </div>

                <div className={cls.orderWrap}>
                  <button
                    className={cls.cartBtn}
                    type="button"
                    aria-label="Orders"
                    aria-haspopup="dialog"
                    aria-expanded={activePopup === "order"}
                    suppressHydrationWarning
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      if (!preview) togglePopup("order");
                    }}
                  >
                    <i className="bi bi-bag" />
                    <span className={cls.badge}>{badgeCart}</span>
                  </button>

                  {mounted && activePopup === "order" && (
                    <div className={cls.orderDropdown} role="dialog" aria-label="My Orders popup">
                      <div className={cls.orderHead}>
                        <span className={cls.orderHeadIcon}>
                          <i className="bi bi-receipt" />
                        </span>
                        <span className={cls.orderHeadTitle}>My Orders</span>
                      </div>

                      <div className={cls.orderList}>
                        {orderPreviewItems.map((item) => (
                          <SmartLink
                            key={item.id}
                            preview={preview}
                            href={item.href || orderHref}
                            className={cls.orderItem}
                            onClick={closeAll}
                          >
                            <span className={cls.orderContent}>
                              <div className={cls.orderTopRow}>
                                <span className={cls.orderNumber}>Order#: {item.orderNumber}</span>
                                <span className={cls.orderDate}>{item.placedAt}</span>
                              </div>

                              <span className={cls.orderBottomRow}>
                                <span
                                  className={`${cls.orderDelivery} ${
                                    item.deliveryTone === "success"
                                      ? cls.orderDeliverySuccess
                                      : item.deliveryTone === "warning"
                                        ? cls.orderDeliveryWarning
                                        : cls.orderDeliveryMuted
                                  }`}
                                >
                                  {item.deliveryText}
                                </span>

                                <span className={cls.orderRating}>
                                  <span className={cls.orderRatingLabel}>You Rated</span>
                                  <span className={cls.orderStars}>{renderStars(item.rating || 0)}</span>
                                </span>
                              </span>
                            </span>

                            <span className={cls.orderThumb}>
                              <Image
                                src={item.image || FALLBACK_IMAGE}
                                alt={item.orderNumber}
                                fill
                                sizes="72px"
                                className={cls.orderThumbImg}
                              />
                            </span>
                          </SmartLink>
                        ))}
                      </div>

                      <div className={cls.orderFooter}>
                        <SmartLink preview={preview} href={orderHref} className={cls.orderFooterBtn} onClick={closeAll}>
                          Xem tất cả
                        </SmartLink>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className={cls.navWrap}>
              <div className={cls.categoryNav}>
                <SmartLink preview={preview} href="/best-sellers" className={cls.categoryTrigger}>
                  <span className={cls.categoryTriggerLeft}>
                    <i className="bi bi-grid-3x3-gap" />
                    <span>Best Sellers</span>
                  </span>
                  <i className={`bi bi-chevron-right ${cls.categoryTriggerCaret}`} />
                </SmartLink>
              </div>

              <nav className={cls.nav} aria-label="Primary navigation">
                {items.map((item, index) => {
                  const iconClass = `bi ${item.icon}`;
                  const isMegaOpen = openMegaIndex === index;

                  if (item.type === "link") {
                    return (
                      <SmartLink
                        key={`${item.label}-${item.href}`}
                        preview={preview}
                        href={item.href}
                        className={cls.navItem}
                      >
                        <i className={iconClass} />
                        <span>{item.label}</span>
                      </SmartLink>
                    );
                  }

                  return (
                    <div
                      key={`${item.label}-${index}`}
                      className={`${cls.navItem} ${cls.navItemMega} ${isMegaOpen ? cls.open : ""}`}
                      tabIndex={0}
                      role="button"
                      aria-haspopup="true"
                      aria-expanded={isMegaOpen}
                      onMouseEnter={() => !preview && mounted && setOpenMegaIndex(index)}
                      onMouseLeave={() => !preview && mounted && setOpenMegaIndex(null)}
                      onClick={(event) => {
                        if (preview) {
                          event.preventDefault();
                          event.stopPropagation();
                          return;
                        }
                        setOpenMegaIndex((current) => (current === index ? null : index));
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          setOpenMegaIndex((current) => (current === index ? null : index));
                        }
                        if (event.key === "Escape") setOpenMegaIndex(null);
                      }}
                    >
                      <i className={iconClass} />
                      <span>{item.label}</span>
                      <i className={`bi bi-chevron-down ${cls.navCaret}`} />

                      <div className={cls.mega} role="menu" aria-label={`${item.label} menu`}>
                        <div className={cls.megaInner}>
                          <div className={cls.megaGrid}>
                            {item.columns.map((column) => (
                              <div className={cls.megaCol} key={column.title}>
                                {column.title && <h4>{column.title}</h4>}

                                {column.items.map((link) => (
                                  <SmartLink
                                    key={`${link.label}-${link.href}`}
                                    preview={preview}
                                    href={link.href}
                                    className={cls.megaLink}
                                  >
                                    <span className={cls.megaLabel}>{link.label}</span>
                                    <i className={`bi bi-arrow-right-short ${cls.megaIcon}`} />
                                  </SmartLink>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>

        <HeaderAuthModal
          open={authOpen}
          mode={authMode}
          onModeChange={setAuthMode}
          onClose={() => setAuthOpen(false)}
          onSuccess={({ user }) => {
            setCurrentUser(user);
            setAuthChecked(true);
            setAuthOpen(false);
            closeAll();
          }}
        />
      </header>
    </div>
  );
}

function parseNavItems(raw?: string): NavItem[] | undefined {
  if (!raw) return undefined;

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;

    const cleaned: NavItem[] = [];

    for (const item of parsed) {
      if (item?.type === "link" && item?.label && item?.href && item?.icon) {
        cleaned.push({
          type: "link",
          label: String(item.label),
          href: String(item.href),
          icon: String(item.icon),
        });
        continue;
      }

      if (item?.type === "mega" && item?.label && item?.icon && Array.isArray(item.columns)) {
        const columns = item.columns
          .filter(Boolean)
          .map((column: any) => ({
            title: String(column?.title ?? ""),
            items: Array.isArray(column?.items)
              ? column.items
                  .filter(Boolean)
                  .map((entry: any) => ({
                    label: String(entry?.label ?? ""),
                    href: String(entry?.href ?? ""),
                  }))
                  .filter((entry: { label: string; href: string }) => entry.label && entry.href)
              : [],
          }))
          .filter((column: MegaColumn) => column.title && column.items.length);

        if (columns.length) {
          cleaned.push({
            type: "mega",
            label: String(item.label),
            icon: String(item.icon),
            columns,
          });
        }
      }
    }

    return cleaned.length ? cleaned : undefined;
  } catch {
    return undefined;
  }
}

export const SHOP_HEADER_ANNOUNCEMENT: RegItem = {
  kind: "HeaderAnnouncement",
  label: "Header Announcement",
  defaults: {
    brandHref: "/",
    brandName: "Tuan Kiet Store",
    brandSub: "COSMETICS",
    logoSrc: FALLBACK_IMAGE,
    logoAlt: "Tuan Kiet Store",
    searchPlaceholder: "What are you looking for today?",
    badgeCart: 0,
    navItems: "[]",
    menuApiUrl: "/api/admin/menus/header-menu",
    menuSetKey: "home",
    menuMode: "auto",
    isAuthed: 0,
  },
  inspector: [
    { key: "brandHref", label: "Brand Href", kind: "text" },
    { key: "brandName", label: "Brand Name", kind: "text" },
    { key: "brandSub", label: "Brand Sub", kind: "text" },
    { key: "logoSrc", label: "Logo Src", kind: "text" },
    { key: "logoAlt", label: "Logo Alt", kind: "text" },
    { key: "searchPlaceholder", label: "Search Placeholder", kind: "text" },
    { key: "badgeCart", label: "Badge (Cart)", kind: "number" },
    { key: "menuApiUrl", label: "Menu API URL", kind: "text" },
    { key: "menuSetKey", label: "Menu setKey", kind: "text" },
    { key: "menuMode", label: "Menu mode (auto/custom)", kind: "text" },
    { key: "isAuthed", label: "Is Authed (0/1)", kind: "number" },
    { key: "navItems", label: "Nav Items (JSON, preview)", kind: "textarea", rows: 10 },
  ],
  render: (props) => {
    const data = props as Record<string, any>;
    const navItems = parseNavItems(data.navItems);
    const menuMode: HeaderMenuMode = data.menuMode === "custom" ? "custom" : "auto";

    return (
      <div aria-label="Shop Header Announcement">
        <HeaderAnnouncement
          brandHref={data.brandHref}
          brandName={data.brandName}
          brandSub={data.brandSub}
          logoSrc={data.logoSrc}
          logoAlt={data.logoAlt}
          searchPlaceholder={data.searchPlaceholder}
          badgeCart={data.badgeCart}
          preview={data.preview}
          navItems={navItems}
          menuApiUrl={data.menuApiUrl || "/api/admin/menus/header-menu"}
          menuSetKey={data.menuSetKey || "home"}
          menuMode={menuMode}
          isAuthed={Number(data.isAuthed) === 1}
        />
      </div>
    );
  },
};

export default HeaderAnnouncement;
