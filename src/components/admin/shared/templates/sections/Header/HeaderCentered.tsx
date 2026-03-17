"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Header/HeaderCentered.module.css";
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

export type CategoryMenuItem = {
  label: string;
  href: string;
  emoji?: string;
};

export type CartPopupItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
  image?: string;
  href?: string;
};

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

export type HeaderCenteredProps = {
  brandHref?: string;
  brandName?: string;
  brandSub?: string;
  logoSrc: string;
  logoAlt?: string;
  searchPlaceholder?: string;
  onSearchSubmit?: (q: string) => void;
  badgeStoreLocator?: number;
  badgeCart?: number;
  navItems?: NavItem[];
  categoryItems?: CategoryMenuItem[];
  notifications?: ProductNotificationItem[];
  notificationHref?: string;
  preview?: boolean;
  menuApiUrl?: string;
  menuSetKey?: string;
  menuSiteIdKey?: string;
  isAuthed?: boolean;
  cartItems?: CartPopupItem[];
  cartHref?: string;
  orders?: OrderPopupItem[];
  orderHref?: string;
};

type AuthMode = "login" | "register";

type ApiLayoutItem = {
  id: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  locale: string;
  setKey: string;
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

function normalizePath(p?: string | null): string {
  const s = String(p || "").trim();
  if (!s) return "/";
  return s.startsWith("/") ? s : `/${s}`;
}

function toIcon(raw?: string | null): string {
  const s = String(raw || "").trim();
  if (!s) return "bi-dot";
  return s
    .replace(/^bi\s+/i, "")
    .replace(/^bi\s+bi-/i, "bi-")
    .replace(/^bi\s+bi\s+/i, "");
}

function formatMoney(v: number): string {
  try {
    return new Intl.NumberFormat("vi-VN").format(v);
  } catch {
    return String(v);
  }
}

function buildTreeFromItems(rows: ApiLayoutItem[]): ApiTreeNode[] {
  const vis = (rows || []).filter((r) => !!r.visible);

  const map = new Map<string, ApiTreeNode>();
  vis.forEach((r) => {
    map.set(r.id, {
      key: r.id,
      title: r.title,
      icon: toIcon(r.icon),
      path: r.path,
      parentKey: r.parentId,
      children: [],
    });
  });

  const roots: ApiTreeNode[] = [];
  vis.forEach((r) => {
    const node = map.get(r.id)!;
    if (r.parentId && map.has(r.parentId)) {
      map.get(r.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortMap: Record<string, number> = {};
  (rows || []).forEach((r) => {
    sortMap[r.id] = r.sortOrder;
  });

  const sortRec = (arr?: ApiTreeNode[]) => {
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

function treeToNavItems(tree: ApiTreeNode[]): NavItem[] {
  const out: NavItem[] = [];

  for (const n of tree || []) {
    const icon = toIcon(n.icon);
    const children = n.children || [];

    if (!children.length) {
      out.push({
        type: "link",
        label: n.title,
        href: normalizePath(n.path),
        icon,
      });
      continue;
    }

    const columns: MegaColumn[] = children
      .map((c) => {
        const grand = c.children || [];

        const colItems = grand
          .filter((g) => !!g?.title && !!g?.path)
          .map((g) => ({
            label: g.title,
            href: normalizePath(g.path),
          }));

        if (!colItems.length && c.path) {
          return {
            title: c.title,
            items: [{ label: c.title, href: normalizePath(c.path) }],
          };
        }

        return { title: c.title, items: colItems };
      })
      .filter((col) => col.title && col.items.length);

    if (!columns.length) {
      out.push({
        type: "link",
        label: n.title,
        href: normalizePath(n.path),
        icon,
      });
      continue;
    }

    out.push({
      type: "mega",
      label: n.title,
      icon,
      columns,
    });
  }

  return out;
}

function renderStars(rating = 0) {
  return Array.from({ length: 5 }, (_, idx) => {
    const filled = idx < Math.max(0, Math.min(5, rating));
    return <i key={idx} className={`bi ${filled ? "bi-star-fill" : "bi-star"} ${cls.orderStar}`} aria-hidden="true" />;
  });
}

const DEFAULT_CATEGORY_ITEMS: CategoryMenuItem[] = [
  { label: "New Arrivals", href: "/new-arrivals", emoji: "🆕" },
  { label: "Best Sellers", href: "/best-sellers", emoji: "🔥" },
  { label: "Promotions", href: "/sale", emoji: "🏷️" },
  { label: "Accessories", href: "/accessories", emoji: "⌚" },
  { label: "Personal Care", href: "/beauty", emoji: "💄" },
  { label: "Health Care", href: "/health", emoji: "💊" },
  { label: "Home Appliances", href: "/home-living", emoji: "🏠" },
  { label: "Technology", href: "/tech", emoji: "📱" },
  { label: "Sports & Outdoor", href: "/sports", emoji: "🏃" },
  { label: "Mother & Baby", href: "/mom-baby", emoji: "🍼" },
  { label: "Gifts", href: "/gifts", emoji: "🎁" },
];

const DEFAULT_NOTIFICATIONS: ProductNotificationItem[] = [
  {
    id: "1",
    title: "New product available",
    message: "Laneige Lip Sleeping Mask has just arrived.",
    time: "20s",
    href: "/products/laneige-lip-sleeping-mask",
    unread: true,
    thumbnail: "/assets/images/logo.jpg",
    tag: "New",
  },
  {
    id: "2",
    title: "Flash sale started",
    message: "Up to 40% off on skincare products today.",
    time: "1h",
    href: "/sale",
    unread: true,
    thumbnail: "/assets/images/logo.jpg",
    tag: "Sale",
  },
  {
    id: "3",
    title: "Back in stock",
    message: "CeraVe Foaming Cleanser is available again.",
    time: "3h",
    href: "/products/cerave-foaming-cleanser",
    unread: false,
    thumbnail: "/assets/images/logo.jpg",
    tag: "Stock",
  },
  {
    id: "4",
    title: "Order update",
    message: "Your recent order is being prepared for shipping.",
    time: "Today",
    href: "/account/orders",
    unread: false,
    thumbnail: "/assets/images/logo.jpg",
    tag: "Order",
  },
];

const DEFAULT_CART_ITEMS: CartPopupItem[] = [
  {
    id: "1",
    name: "Dán nút phím Surface Laptop 3 & 4",
    price: 39000,
    qty: 2,
    href: "/products/surface-keycap",
    image: "/assets/images/logo.jpg",
  },
  {
    id: "2",
    name: "Lip Sleeping Mask Mini",
    price: 129000,
    qty: 1,
    href: "/products/lip-sleeping-mask",
    image: "/assets/images/logo.jpg",
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
    image: "/assets/images/logo.jpg",
    href: "/account/orders/999012",
  },
  {
    id: "2",
    orderNumber: "#6660212",
    placedAt: "15-Dec-2019, 1:00 PM",
    deliveryText: "Delivered on 16 Dec",
    deliveryTone: "warning",
    rating: 4,
    image: "/assets/images/logo.jpg",
    href: "/account/orders/6660212",
  },
];

export function HeaderCentered({
  brandHref = "/",
  brandName = "Tuan Kiet Store",
  brandSub = "COSMETICS",
  logoSrc,
  logoAlt = "",
  searchPlaceholder = "What are you looking for today?",
  onSearchSubmit,
  badgeStoreLocator = 2,
  badgeCart = 0,
  navItems,
  categoryItems = DEFAULT_CATEGORY_ITEMS,
  notifications = DEFAULT_NOTIFICATIONS,
  notificationHref = "/notifications",
  preview = false,
  menuApiUrl = "/api/admin/builder/menus/header-menu",
  menuSetKey = "home",
  menuSiteIdKey = "builder_site_id",
  isAuthed = false,
  cartItems = DEFAULT_CART_ITEMS,
  cartHref = "/cart",
  orders = DEFAULT_ORDERS,
  orderHref = "/account/orders",
}: HeaderCenteredProps) {
  const rootRef = useRef<HTMLElement | null>(null);

  const [safeLogo, setSafeLogo] = useState(logoSrc || "/assets/images/logo.jpg");
  const [apiNav, setApiNav] = useState<NavItem[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);

  const [query, setQuery] = useState("");
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [openMegaIndex, setOpenMegaIndex] = useState<number | null>(null);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setSafeLogo(logoSrc || "/assets/images/logo.jpg");
  }, [logoSrc]);

  const items = useMemo(() => {
    if (navItems && navItems.length > 0) return navItems;
    return apiNav;
  }, [navItems, apiNav]);

  const unreadNotificationCount = useMemo(() => notifications.filter((x) => x.unread).length, [notifications]);

  const orderPreviewItems = useMemo(() => orders.slice(0, 3), [orders]);
  const cartPreviewItems = useMemo(() => cartItems.slice(0, 4), [cartItems]);

  const cartTotal = useMemo(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.qty, 0);
  }, [cartItems]);

  const isLoggedIn = preview ? !!isAuthed : !!currentUser;

  const displayName = useMemo(() => {
    if (!currentUser) return "Guest";
    if (currentUser.name && currentUser.name.trim()) return currentUser.name.trim();
    if (currentUser.email) return currentUser.email.split("@")[0];
    return "Guest";
  }, [currentUser]);

  const displayRole = useMemo(() => currentUser?.role || "Member", [currentUser]);

  const initials = useMemo(() => {
    const name = displayName.trim();
    if (!name) return "G";
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
    return `${parts[0][0] || ""}${parts[parts.length - 1][0] || ""}`.toUpperCase();
  }, [displayName]);

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (preview) {
      setAuthChecked(true);
      return;
    }

    let alive = true;

    (async () => {
      try {
        const res = await getMe();
        if (!alive) return;
        setCurrentUser(res.user);
      } catch {
        if (!alive) return;
        setCurrentUser(null);
      } finally {
        if (!alive) return;
        setAuthChecked(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, [preview]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const qs = new URLSearchParams();
        qs.set("setKey", menuSetKey || "home");
        qs.set("tree", "1");
        qs.set("includeHidden", "0");
        qs.set("page", "1");
        qs.set("size", "1000");
        qs.set("sort", "sortOrder:asc");

        const siteId = typeof window !== "undefined" ? localStorage.getItem(menuSiteIdKey) : null;

        if (siteId) qs.set("siteId", siteId);

        const res = await fetch(`${menuApiUrl}?${qs.toString()}`, {
          cache: "no-store",
          credentials: "include",
          headers: {
            "x-site-domain": typeof window !== "undefined" ? window.location.host : "",
          },
        });

        if (!res.ok) throw new Error("Failed to load header menu");

        const data = (await res.json()) as {
          tree?: ApiTreeNode[];
          items?: ApiLayoutItem[];
        };

        let tree: ApiTreeNode[] = [];

        if (Array.isArray(data.tree) && data.tree.length) {
          tree = data.tree;
        } else if (Array.isArray(data.items) && data.items.length) {
          tree = buildTreeFromItems(data.items);
        }

        const mapped = treeToNavItems(tree);

        if (!alive) return;
        setApiNav(mapped);
        setMenuLoaded(true);
      } catch {
        if (!alive) return;
        setApiNav([]);
        setMenuLoaded(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, [menuApiUrl, menuSetKey, menuSiteIdKey]);

  const closeAll = () => {
    setCategoryOpen(false);
    setOpenMegaIndex(null);
    setNotificationOpen(false);
    setCartOpen(false);
    setAccountOpen(false);
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (rootRef.current && rootRef.current.contains(target)) return;
      closeAll();
      setMobileNavOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAll();
        setMobileNavOpen(false);
        setAuthOpen(false);
      }
    };

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const openAuth = (mode: AuthMode) => {
    closeAll();
    setAuthMode(mode);
    setAuthOpen(true);
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch {
      // noop
    } finally {
      setCurrentUser(null);
      setAccountOpen(false);
      setAuthOpen(false);
    }
  };

  const shouldRenderNav = items.length > 0;

  const openPanel = (panel: "notifications" | "cart" | "account" | "categories") => {
    setNotificationOpen(panel === "notifications" ? !notificationOpen : false);
    setCartOpen(panel === "cart" ? !cartOpen : false);
    setAccountOpen(panel === "account" ? !accountOpen : false);
    setCategoryOpen(panel === "categories" ? !categoryOpen : false);
    if (panel !== "categories") {
      setOpenMegaIndex(null);
    }
  };

  return (
    <header className={cls.header} ref={rootRef}>
      <div className={cls.backdrop} />

      <div className={cls.container}>
        <div className={cls.topbar}>
          <div className={cls.brandArea}>
            {preview ? (
              <a className={cls.brand} href="#" aria-label={brandName} onClick={onBlockClick}>
                <span className={cls.brandLogo}>
                  <Image
                    src={safeLogo}
                    alt={logoAlt}
                    fill
                    className={cls.brandLogoImg}
                    onError={() => setSafeLogo("/assets/images/logo.jpg")}
                  />
                </span>

                <span className={cls.brandText}>
                  <span className={cls.brandName}>{brandName}</span>
                  <span className={cls.brandSub}>{brandSub}</span>
                </span>
              </a>
            ) : (
              <Link className={cls.brand} href={brandHref as Route} aria-label={brandName}>
                <span className={cls.brandLogo}>
                  <Image
                    src={safeLogo}
                    alt={logoAlt}
                    fill
                    className={cls.brandLogoImg}
                    onError={() => {
                      const fallback = "/assets/images/logo.jpg";
                      if (safeLogo !== fallback) setSafeLogo(fallback);
                    }}
                  />
                </span>

                <span className={cls.brandText}>
                  <span className={cls.brandName}>{brandName}</span>
                  <span className={cls.brandSub}>{brandSub}</span>
                </span>
              </Link>
            )}
          </div>

          <div className={cls.searchArea}>
            <form
              className={cls.search}
              onSubmit={(e) => {
                e.preventDefault();
                if (preview) return;
                onSearchSubmit?.(query);
              }}
            >
              <div className={cls.searchLead}>
                <i className="bi bi-search" />
              </div>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder={searchPlaceholder}
                aria-label="Search"
              />

              <div className={cls.searchQuick}>
                <span>Trending</span>
                <button type="submit" aria-label="Search" className={cls.searchSubmit}>
                  <i className="bi bi-arrow-up-right" />
                </button>
              </div>
            </form>
          </div>

          <div className={cls.toolsArea}>
            <button
              type="button"
              className={cls.toolBtn}
              aria-label="Notifications"
              aria-haspopup="dialog"
              aria-expanded={notificationOpen}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (preview) return;
                openPanel("notifications");
              }}
            >
              <span className={cls.toolIcon}>
                <i className="bi bi-bell" />
              </span>
              {unreadNotificationCount > 0 ? <span className={cls.toolBadge}>{unreadNotificationCount}</span> : null}
            </button>

            <button
              type="button"
              className={cls.toolBtn}
              aria-label="Cart"
              aria-haspopup="dialog"
              aria-expanded={cartOpen}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (preview) return;
                openPanel("cart");
              }}
            >
              <span className={cls.toolIcon}>
                <i className="bi bi-bag" />
              </span>
              <span className={cls.toolBadgeAlt}>{badgeCart}</span>
            </button>

            <button
              type="button"
              className={cls.profileBtn}
              aria-haspopup={isLoggedIn ? "menu" : "dialog"}
              aria-expanded={isLoggedIn ? accountOpen : authOpen}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (preview) return;

                if (!isLoggedIn) {
                  openAuth("login");
                  return;
                }

                openPanel("account");
              }}
            >
              <span className={cls.profileAvatar}>
                {currentUser?.image ? (
                  <Image src={currentUser.image} alt={displayName} fill className={cls.profileAvatarImg} />
                ) : (
                  <span>{initials}</span>
                )}
              </span>

              <span className={cls.profileMeta}>
                <strong>{isLoggedIn ? displayName : authChecked ? "Sign in" : "Loading..."}</strong>
                <small>{isLoggedIn ? displayRole : "Your account"}</small>
              </span>

              <i className={`bi bi-chevron-down ${cls.profileCaret}`} />
            </button>

            <button
              type="button"
              className={cls.mobileToggle}
              aria-label="Toggle menu"
              aria-expanded={mobileNavOpen}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMobileNavOpen((v) => !v);
                closeAll();
              }}
            >
              <i className={`bi ${mobileNavOpen ? "bi-x-lg" : "bi-list"}`} />
            </button>

            {notificationOpen && (
              <div
                className={cls.panelDropdownNoti}
                role="dialog"
                aria-label="Notifications panel"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={cls.panelHead}>
                  <div className={cls.panelInfo}>
                    <div className={cls.panelIcon}>
                      <i className="bi bi-bell"></i>
                    </div>

                    <div className={cls.panelText}>
                      <strong>Notifications</strong>
                      <span>{unreadNotificationCount} unread updates</span>
                    </div>
                  </div>

                  <div className={cls.panelActions}>
                    <button type="button" className={cls.panelRefresh}>
                      <i className="bi bi-arrow-clockwise"></i>
                    </button>
                  </div>
                </div>

                <div className={cls.notificationList}>
                  {notifications.map((item) =>
                    preview ? (
                      <a
                        key={item.id}
                        href="#"
                        className={`${cls.notificationCard} ${item.unread ? cls.notificationCardUnread : ""}`}
                        onClick={onBlockClick}
                      >
                        <span className={cls.notificationThumb}>
                          <Image
                            src={item.thumbnail || "/assets/images/logo.jpg"}
                            alt={item.title}
                            fill
                            className={cls.notificationThumbImg}
                          />
                        </span>

                        <span className={cls.notificationBody}>
                          <span className={cls.notificationTop}>
                            <strong>{item.title}</strong>
                            {item.tag ? <span className={cls.notificationPill}>{item.time}</span> : null}
                          </span>
                          <span className={cls.notificationMessage}>{item.message}</span>
                        </span>
                      </a>
                    ) : (
                      <Link
                        key={item.id}
                        href={(item.href || notificationHref || "/notifications") as Route}
                        className={`${cls.notificationCard} ${item.unread ? cls.notificationCardUnread : ""}`}
                        onClick={() => setNotificationOpen(false)}
                      >
                        <span className={cls.notificationThumb}>
                          <Image
                            src={item.thumbnail || "/assets/images/logo.jpg"}
                            alt={item.title}
                            fill
                            className={cls.notificationThumbImg}
                          />
                        </span>

                        <span className={cls.notificationBody}>
                          <span className={cls.notificationTop}>
                            <strong>{item.title}</strong>
                            {item.tag ? <span className={cls.notificationPill}>{item.time}</span> : null}
                          </span>
                          <span className={cls.notificationMessage}>{item.message}</span>
                        </span>
                      </Link>
                    ),
                  )}
                </div>

                <div className={cls.panelFooter}>
                  {preview ? (
                    <a href="#" className={cls.panelPrimary} onClick={onBlockClick}>
                      Open notification center
                    </a>
                  ) : (
                    <Link
                      href={(notificationHref || "/notifications") as Route}
                      className={cls.panelPrimary}
                      onClick={() => setNotificationOpen(false)}
                    >
                      Open notification center
                    </Link>
                  )}
                </div>
              </div>
            )}

            {cartOpen && (
              <div
                className={cls.panelDropdown}
                role="dialog"
                aria-label="Cart panel"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={cls.panelHead}>
                  <div className={cls.panelHeadContent}>
                    <div className={cls.panelHeadIcon}>
                      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <path
                          d="M3 5h2l1.2 6.2a2 2 0 0 0 2 1.6h7.9a2 2 0 0 0 2-1.5L20 7H7"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="10" cy="18" r="1.6" fill="currentColor" />
                        <circle cx="17" cy="18" r="1.6" fill="currentColor" />
                      </svg>
                    </div>

                    <div className={cls.panelHeadText}>
                      <strong>Shopping Cart</strong>
                      <span>
                        You have <b>{cartItems.length}</b> item{cartItems.length > 1 ? "s" : ""} in your cart
                      </span>
                    </div>
                  </div>

                  <div className={cls.panelPriceBox}>
                    <small>Total</small>
                    <span className={cls.panelPrice}>{formatMoney(cartTotal)}đ</span>
                  </div>
                </div>

                <div className={cls.cartList}>
                  {cartPreviewItems.map((item) =>
                    preview ? (
                      <a key={item.id} href="#" className={cls.cartCard} onClick={onBlockClick}>
                        <span className={cls.cartThumb}>
                          <Image
                            src={item.image || "/assets/images/logo.jpg"}
                            alt={item.name}
                            fill
                            className={cls.cartThumbImg}
                          />
                        </span>

                        <span className={cls.cartBody}>
                          <strong>{item.name}</strong>
                          <small>
                            {item.qty} × {formatMoney(item.price)}đ
                          </small>
                        </span>
                      </a>
                    ) : (
                      <Link
                        key={item.id}
                        href={(item.href || cartHref || "/cart") as Route}
                        className={cls.cartCard}
                        onClick={() => setCartOpen(false)}
                      >
                        <span className={cls.cartThumb}>
                          <Image
                            src={item.image || "/assets/images/logo.jpg"}
                            alt={item.name}
                            fill
                            className={cls.cartThumbImg}
                          />
                        </span>

                        <span className={cls.cartBody}>
                          <strong>{item.name}</strong>
                          <small>
                            {item.qty} × {formatMoney(item.price)}đ
                          </small>
                        </span>
                      </Link>
                    ),
                  )}
                </div>

                <div className={cls.panelFooterGrid}>
                  {preview ? (
                    <a href="#" className={cls.panelSecondary} onClick={onBlockClick}>
                      View cart
                    </a>
                  ) : (
                    <Link
                      href={(cartHref || "/cart") as Route}
                      className={cls.panelSecondary}
                      onClick={() => setCartOpen(false)}
                    >
                      View cart
                    </Link>
                  )}

                  {preview ? (
                    <a href="#" className={cls.panelPrimary} onClick={onBlockClick}>
                      Checkout
                    </a>
                  ) : (
                    <Link
                      href={(cartHref || "/cart") as Route}
                      className={cls.panelPrimary}
                      onClick={() => setCartOpen(false)}
                    >
                      Checkout
                    </Link>
                  )}
                </div>
              </div>
            )}

            {isLoggedIn && accountOpen ? (
              <div
                className={cls.profileDropdown}
                role="menu"
                aria-label="Account menu"
                onClick={(e) => e.stopPropagation()}
              >
                <div className={cls.profileCard}>
                  <span className={cls.profileCardAvatar}>
                    {currentUser?.image ? (
                      <Image src={currentUser.image} alt={displayName} fill className={cls.profileCardAvatarImg} />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </span>

                  <div className={cls.profileCardBody}>
                    <div className="d-flex gap-5 ju-space-between">
                      <strong>{displayName}</strong>
                      <span>{displayRole}</span>
                    </div>
                    <small>{currentUser?.email}</small>
                  </div>
                </div>

                <div className={cls.profileLinks}>
                  {preview ? (
                    <a href="#" className={cls.profileLink} onClick={onBlockClick}>
                      <i className="bi bi-person-circle" />
                      <span>My account</span>
                    </a>
                  ) : (
                    <Link href={"/account" as Route} className={cls.profileLink} onClick={() => setAccountOpen(false)}>
                      <i className="bi bi-person-circle" />
                      <span>My account</span>
                    </Link>
                  )}

                  {preview ? (
                    <a href="#" className={cls.profileLink} onClick={onBlockClick}>
                      <i className="bi bi-clock-history" />
                      <span>Recent orders</span>
                    </a>
                  ) : (
                    <Link
                      href={(orderHref || "/account/orders") as Route}
                      className={cls.profileLink}
                      onClick={() => setAccountOpen(false)}
                    >
                      <i className="bi bi-clock-history" />
                      <span>Recent orders</span>
                    </Link>
                  )}

                  {preview ? (
                    <a href="#" className={cls.profileLink} onClick={onBlockClick}>
                      <i className="bi bi-heart" />
                      <span>Wishlist</span>
                    </a>
                  ) : (
                    <Link href={"/wishlist" as Route} className={cls.profileLink} onClick={() => setAccountOpen(false)}>
                      <i className="bi bi-heart" />
                      <span>Wishlist</span>
                    </Link>
                  )}
                </div>

                <div className={cls.profileOrders}>
                  <div className={cls.profileOrdersHead}>
                    <strong>Recent orders</strong>
                    {preview ? (
                      <a href="#" onClick={onBlockClick}>
                        View all
                      </a>
                    ) : (
                      <Link href={(orderHref || "/account/orders") as Route} onClick={() => setAccountOpen(false)}>
                        View all
                      </Link>
                    )}
                  </div>

                  <div className={cls.profileOrderList}>
                    {orderPreviewItems.map((item) =>
                      preview ? (
                        <a key={item.id} href="#" className={cls.profileOrderCard} onClick={onBlockClick}>
                          <div className={cls.profileOrderMeta}>
                            <strong>{item.orderNumber}</strong>
                            <small>{item.placedAt}</small>
                          </div>
                          <div className={cls.profileOrderFoot}>
                            <span
                              className={`${cls.orderTone} ${
                                item.deliveryTone === "success"
                                  ? cls.orderToneSuccess
                                  : item.deliveryTone === "warning"
                                    ? cls.orderToneWarning
                                    : cls.orderToneMuted
                              }`}
                            >
                              {item.deliveryText}
                            </span>
                            <span className={cls.orderStars}>{renderStars(item.rating || 0)}</span>
                          </div>
                        </a>
                      ) : (
                        <Link
                          key={item.id}
                          href={(item.href || orderHref || "/account/orders") as Route}
                          className={cls.profileOrderCard}
                          onClick={() => setAccountOpen(false)}
                        >
                          <div className={cls.profileOrderMeta}>
                            <strong>{item.orderNumber}</strong>
                            <small>{item.placedAt}</small>
                          </div>
                          <div className={cls.profileOrderFoot}>
                            <span
                              className={`${cls.orderTone} ${
                                item.deliveryTone === "success"
                                  ? cls.orderToneSuccess
                                  : item.deliveryTone === "warning"
                                    ? cls.orderToneWarning
                                    : cls.orderToneMuted
                              }`}
                            >
                              {item.deliveryText}
                            </span>
                            <span className={cls.orderStars}>{renderStars(item.rating || 0)}</span>
                          </div>
                        </Link>
                      ),
                    )}
                  </div>
                </div>

                <button type="button" className={cls.logoutBtn} onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right" />
                  <span>Logout</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className={`${cls.navbar} ${mobileNavOpen ? cls.navbarOpen : ""}`}>
          <div className={cls.navLeft}>
            <div
              className={`${cls.categoryTrigger} ${categoryOpen ? cls.categoryTriggerOpen : ""}`}
              tabIndex={0}
              role="button"
              aria-haspopup="true"
              aria-expanded={categoryOpen}
              onMouseEnter={() => !preview && setCategoryOpen(true)}
              onMouseLeave={() => !preview && setCategoryOpen(false)}
              onClick={(e) => {
                if (preview) {
                  e.preventDefault();
                  e.stopPropagation();
                }
                openPanel("categories");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  openPanel("categories");
                }
                if (e.key === "Escape") setCategoryOpen(false);
              }}
            >
              <span className={cls.categoryTriggerInner}>
                <i className="bi bi-grid-3x3-gap-fill" />
                <span>Categories</span>
              </span>

              {badgeStoreLocator > 0 ? <span className={cls.categoryMiniBadge}>{badgeStoreLocator}</span> : null}

              <i className={`bi bi-chevron-down ${cls.categoryCaret}`} />

              <div className={cls.categoryDropdown}>
                <div className={cls.categoryDropdownInner}>
                  {categoryItems.map((cat, idx) =>
                    preview ? (
                      <a key={idx} href="#" className={cls.categoryLink} onClick={onBlockClick}>
                        <span className={cls.categoryEmoji}>{cat.emoji || "•"}</span>
                        <span>{cat.label}</span>
                        <i className="bi bi-arrow-up-right" />
                      </a>
                    ) : (
                      <Link key={idx} href={(cat.href || "/") as Route} className={cls.categoryLink}>
                        <span className={cls.categoryEmoji}>{cat.emoji || "•"}</span>
                        <span>{cat.label}</span>
                        <i className="bi bi-arrow-up-right" />
                      </Link>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          <nav className={cls.navCenter} aria-label="Primary navigation">
            {shouldRenderNav &&
              items.map((it, idx) => {
                const iconCls = `bi ${it.icon}`;
                const isOpen = openMegaIndex === idx;

                if (it.type !== "mega") {
                  return preview ? (
                    <a key={idx} className={cls.navItem} href="#" onClick={onBlockClick}>
                      <i className={iconCls} />
                      <span>{it.label}</span>
                    </a>
                  ) : (
                    <Link key={idx} className={cls.navItem} href={(it.href || "/") as Route}>
                      <i className={iconCls} />
                      <span>{it.label}</span>
                    </Link>
                  );
                }

                return (
                  <div
                    key={idx}
                    className={`${cls.navItem} ${cls.navItemMega} ${isOpen ? cls.navItemOpen : ""}`}
                    tabIndex={0}
                    role="button"
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                    onMouseEnter={() => !preview && setOpenMegaIndex(idx)}
                    onMouseLeave={() => !preview && setOpenMegaIndex(null)}
                    onClick={(e) => {
                      if (preview) {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                      setOpenMegaIndex((cur) => (cur === idx ? null : idx));
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setOpenMegaIndex((cur) => (cur === idx ? null : idx));
                      }
                      if (e.key === "Escape") setOpenMegaIndex(null);
                    }}
                  >
                    <i className={iconCls} />
                    <span>{it.label}</span>
                    <i className={`bi bi-chevron-down ${cls.navChevron}`} />

                    <div className={cls.megaMenu} role="menu" aria-label={`${it.label} menu`}>
                      <div className={cls.megaMenuInner}>
                        {it.columns.map((col, cIdx) => (
                          <div className={cls.megaColumn} key={cIdx}>
                            <div className={cls.megaColumnLinks}>
                              {col.items.map((link, lIdx) =>
                                preview ? (
                                  <a key={lIdx} href="#" className={cls.megaLink} onClick={onBlockClick}>
                                    <span>{link.label}</span>
                                    <i className="bi bi-arrow-right-short" />
                                  </a>
                                ) : (
                                  <Link key={lIdx} href={(link.href || "/") as Route} className={cls.megaLink}>
                                    <span>{link.label}</span>
                                    <i className="bi bi-arrow-right-short" />
                                  </Link>
                                ),
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

            {!shouldRenderNav && menuLoaded ? (
              preview ? (
                <a href="#" className={cls.navItem} onClick={onBlockClick}>
                  <i className="bi bi-house" />
                  <span>Home</span>
                </a>
              ) : (
                <Link href={"/" as Route} className={cls.navItem}>
                  <i className="bi bi-house" />
                  <span>Home</span>
                </Link>
              )
            ) : null}
          </nav>

          <div className={cls.navRight}>
            {preview ? (
              <a href="#" className={cls.navHighlight} onClick={onBlockClick}>
                <i className="bi bi-lightning-charge-fill" />
                <span>Today Deals</span>
              </a>
            ) : (
              <Link href={"/sale" as Route} className={cls.navHighlight}>
                <i className="bi bi-lightning-charge-fill" />
                <span>Today Deals</span>
              </Link>
            )}
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
          setAuthOpen(false);
          setAccountOpen(false);
        }}
      />
    </header>
  );
}

function parseNavItems(raw?: string): NavItem[] | undefined {
  if (!raw) return undefined;

  try {
    const val = JSON.parse(raw);
    if (!Array.isArray(val)) return undefined;

    const cleaned: NavItem[] = [];

    for (const it of val) {
      if (it?.type === "link" && it?.label && it?.href && it?.icon) {
        cleaned.push({
          type: "link",
          label: String(it.label),
          href: String(it.href),
          icon: String(it.icon),
        });
        continue;
      }

      if (it?.type === "mega" && it?.label && it?.icon && Array.isArray(it?.columns)) {
        const cols: MegaColumn[] = it.columns
          .filter(Boolean)
          .map((c: any) => ({
            title: String(c?.title ?? ""),
            items: Array.isArray(c?.items)
              ? c.items
                  .filter(Boolean)
                  .map((x: any) => ({
                    label: String(x?.label ?? ""),
                    href: String(x?.href ?? ""),
                  }))
                  .filter((x: any) => x.label && x.href)
              : [],
          }))
          .filter((c: MegaColumn) => c.title && c.items.length);

        if (cols.length) {
          cleaned.push({
            type: "mega",
            label: String(it.label),
            icon: String(it.icon),
            columns: cols,
          });
        }
      }
    }

    return cleaned.length ? cleaned : undefined;
  } catch {
    return undefined;
  }
}

export const SHOP_HEADER_CENTERED: RegItem = {
  kind: "HeaderCentered",
  label: "Header Centered",
  defaults: {
    brandHref: "/",
    brandName: "Tuan Kiet Store",
    brandSub: "COSMETICS",
    logoSrc: "/assets/images/logo.jpg",
    logoAlt: "Tuan Kiet Store",
    searchPlaceholder: "What are you looking for today?",
    badgeStoreLocator: 2,
    badgeCart: 0,
    navItems: "[]",
    menuApiUrl: "/api/admin/builder/menus/header-menu",
    menuSetKey: "home",
    menuSiteIdKey: "builder_site_id",
    isAuthed: 0,
  },
  inspector: [
    { key: "brandHref", label: "Brand Href", kind: "text" },
    { key: "brandName", label: "Brand Name", kind: "text" },
    { key: "brandSub", label: "Brand Sub", kind: "text" },
    { key: "logoSrc", label: "Logo Src", kind: "text" },
    { key: "logoAlt", label: "Logo Alt", kind: "text" },
    { key: "searchPlaceholder", label: "Search Placeholder", kind: "text" },
    { key: "badgeStoreLocator", label: "Badge (Store)", kind: "number" },
    { key: "badgeCart", label: "Badge (Cart)", kind: "number" },
    { key: "menuApiUrl", label: "Menu API URL", kind: "text" },
    { key: "menuSetKey", label: "Menu setKey", kind: "text" },
    { key: "menuSiteIdKey", label: "LocalStorage siteId key", kind: "text" },
    { key: "isAuthed", label: "Is Authed (0/1)", kind: "number" },
    { key: "navItems", label: "Nav Items (JSON, preview)", kind: "textarea", rows: 10 },
  ],
  render: (props) => {
    const p = props as Record<string, any>;
    const navItems = parseNavItems(p.navItems);

    return (
      <div aria-label="Shop Header Centered">
        <HeaderCentered
          brandHref={p.brandHref}
          brandName={p.brandName}
          brandSub={p.brandSub}
          logoSrc={p.logoSrc}
          logoAlt={p.logoAlt}
          searchPlaceholder={p.searchPlaceholder}
          badgeStoreLocator={p.badgeStoreLocator}
          badgeCart={p.badgeCart}
          preview={p.preview}
          navItems={navItems}
          menuApiUrl={p.menuApiUrl || "/api/admin/builder/menus/header-menu"}
          menuSetKey={p.menuSetKey || "home"}
          menuSiteIdKey={p.menuSiteIdKey || "builder_site_id"}
          isAuthed={Number(p.isAuthed) === 1}
        />
      </div>
    );
  },
};

export default HeaderCentered;
