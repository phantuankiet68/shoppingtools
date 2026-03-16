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
    time: "20 min ago",
    href: "/products/laneige-lip-sleeping-mask",
    unread: true,
    thumbnail: "/assets/images/logo.jpg",
    tag: "New",
  },
  {
    id: "2",
    title: "Flash sale started",
    message: "Up to 40% off on skincare products today.",
    time: "1 hour ago",
    href: "/sale",
    unread: true,
    thumbnail: "/assets/images/logo.jpg",
    tag: "Sale",
  },
  {
    id: "3",
    title: "Back in stock",
    message: "CeraVe Foaming Cleanser is available again.",
    time: "3 hours ago",
    href: "/products/cerave-foaming-cleanser",
    unread: false,
    thumbnail: "/assets/images/logo.jpg",
    tag: "Stock",
  },
];

const DEFAULT_CART_ITEMS: CartPopupItem[] = [
  {
    id: "1",
    name: "Dán nút phím Surface Laptop 3 & 4 ...",
    price: 39000,
    qty: 2,
    href: "/products/surface-keycap",
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
  const [openMegaIndex, setOpenMegaIndex] = useState<number | null>(null);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

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

  const orderPreviewItems = useMemo(() => orders.slice(0, 6), [orders]);

  const isLoggedIn = preview ? !!isAuthed : !!currentUser;

  const displayName = useMemo(() => {
    if (!currentUser) return "Your account";
    if (currentUser.name && currentUser.name.trim()) return currentUser.name.trim();
    if (currentUser.email) return currentUser.email.split("@")[0];
    return "Your account";
  }, [currentUser]);

  const displayRole = useMemo(() => {
    return currentUser?.role || "USER";
  }, [currentUser]);

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
    setOpenMegaIndex(null);
    setCategoryOpen(false);
    setNotificationOpen(false);
    setOrderOpen(false);
    setAccountOpen(false);
  };

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (rootRef.current && rootRef.current.contains(target)) return;
      closeAll();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeAll();
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
      // no-op
    } finally {
      setCurrentUser(null);
      setAccountOpen(false);
      setAuthOpen(false);
    }
  };

  const shouldRenderNav = items.length > 0;

  return (
    <header className={cls.header} ref={rootRef}>
      <div className={cls.container}>
        <div className={cls.topRow}>
          <div className={cls.brandCol}>
            {preview ? (
              <a className={cls.logo} href="#" aria-label={brandName} onClick={onBlockClick}>
                <span className={cls.logoBadge}>
                  <Image
                    src={safeLogo}
                    alt={logoAlt}
                    fill
                    className={cls.logoImg}
                    onError={() => setSafeLogo("/assets/images/logo.jpg")}
                  />
                </span>

                <span className={cls.logoText}>
                  <span className={cls.logoName}>{brandName}</span>
                  <span className={cls.logoSub}>{brandSub}</span>
                </span>
              </a>
            ) : (
              <Link className={cls.logo} href={brandHref as Route} aria-label={brandName}>
                <span className={cls.logoBadge}>
                  <Image
                    src={safeLogo}
                    alt={logoAlt}
                    fill
                    className={cls.logoImg}
                    onError={() => {
                      const fallback = "/assets/images/logo.jpg";
                      if (safeLogo !== fallback) setSafeLogo(fallback);
                    }}
                  />
                </span>

                <span className={cls.logoText}>
                  <span className={cls.logoName}>{brandName}</span>
                  <span className={cls.logoSub}>{brandSub}</span>
                </span>
              </Link>
            )}
          </div>

          <div className={cls.searchCol}>
            <form
              className={cls.search}
              onSubmit={(e) => {
                e.preventDefault();
                if (preview) return;
                onSearchSubmit?.(query);
              }}
            >
              <span className={cls.searchIcon}>
                <i className="bi bi-search" />
              </span>

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder={searchPlaceholder}
              />

              <button type="submit" aria-label="Search" className={cls.searchBtn}>
                <i className="bi bi-search" />
              </button>
            </form>
          </div>

          <div className={cls.actionCol}>
            <div className={cls.accountWrap}>
              <button
                className={`${cls.actionBtn} ${cls.userBtn}`}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (preview) return;

                  if (!isLoggedIn) {
                    openAuth("login");
                    return;
                  }

                  setNotificationOpen(false);
                  setOrderOpen(false);
                  setCategoryOpen(false);
                  setOpenMegaIndex(null);
                  setAuthOpen(false);
                  setAccountOpen((v) => !v);
                }}
                aria-haspopup={isLoggedIn ? "menu" : "dialog"}
                aria-expanded={isLoggedIn ? accountOpen : authOpen}
              >
                <span className={cls.actionIcon}>
                  <i className="bi bi-person" />
                </span>

                <span className={cls.actionText}>
                  <span>{isLoggedIn ? `Hello, ${displayName}` : authChecked ? "Login" : "Loading..."}</span>
                  <strong>{isLoggedIn ? displayRole : "USER"}</strong>
                </span>

                <i className={`bi bi-chevron-down ${cls.actionCaret}`} />
              </button>

              {isLoggedIn && accountOpen ? (
                <div
                  className={cls.accountDropdown}
                  role="menu"
                  aria-label="Account menu"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={cls.accountDropdownHead}>
                    <div className={cls.accountDflex}>
                      <strong>{displayName}</strong>
                      <small>{displayRole}</small>
                    </div>
                    <span>{currentUser?.email}</span>
                  </div>

                  <div className={cls.accountDropdownBody}>
                    {preview ? (
                      <a href="#" className={cls.accountDropdownLink} onClick={onBlockClick}>
                        <i className="bi bi-person-circle" />
                        <span>My account</span>
                      </a>
                    ) : (
                      <Link
                        href={"/account" as Route}
                        className={cls.accountDropdownLink}
                        onClick={() => setAccountOpen(false)}
                      >
                        <i className="bi bi-person-circle" />
                        <span>My account</span>
                      </Link>
                    )}

                    {preview ? (
                      <a href="#" className={cls.accountDropdownLink} onClick={onBlockClick}>
                        <i className="bi bi-receipt" />
                        <span>My orders</span>
                      </a>
                    ) : (
                      <Link
                        href={"/account/orders" as Route}
                        className={cls.accountDropdownLink}
                        onClick={() => setAccountOpen(false)}
                      >
                        <i className="bi bi-receipt" />
                        <span>My orders</span>
                      </Link>
                    )}

                    <button type="button" className={cls.accountDropdownLogout} onClick={handleLogout}>
                      <i className="bi bi-box-arrow-right" />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : null}
            </div>

            <div className={cls.notificationWrap}>
              <button
                className={cls.actionBtn}
                type="button"
                aria-label="Notifications"
                aria-haspopup="dialog"
                aria-expanded={notificationOpen}
                onClick={(e) => {
                  if (preview) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  e.preventDefault();
                  e.stopPropagation();
                  setAccountOpen(false);
                  setOrderOpen(false);
                  setNotificationOpen((v) => !v);
                }}
              >
                <span className={cls.actionIcon}>
                  <i className="bi bi-bell" />
                </span>

                <span className={cls.actionText}>
                  <span>Updates</span>
                  <strong>Notifications</strong>
                </span>

                {unreadNotificationCount > 0 ? <span className={cls.miniBadge}>{unreadNotificationCount}</span> : null}
              </button>

              {notificationOpen && (
                <div
                  className={cls.notificationDropdown}
                  role="dialog"
                  aria-label="Notifications popup"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={cls.notificationHead}>
                    <strong>Notifications</strong>
                    <span>{unreadNotificationCount} unread</span>
                  </div>

                  <div className={cls.notificationList}>
                    {notifications.map((item) =>
                      preview ? (
                        <a
                          key={item.id}
                          href="#"
                          className={`${cls.notificationItem} ${item.unread ? cls.notificationUnread : ""}`}
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
                            <span className={cls.notificationTitle}>{item.title}</span>
                            <span className={cls.notificationMessage}>{item.message}</span>
                            <span className={cls.notificationMeta}>
                              {item.tag ? <span className={cls.notificationTag}>{item.tag}</span> : null}
                              <span className={cls.notificationTime}>{item.time}</span>
                            </span>
                          </span>
                        </a>
                      ) : (
                        <Link
                          key={item.id}
                          href={(item.href || notificationHref || "/notifications") as Route}
                          className={`${cls.notificationItem} ${item.unread ? cls.notificationUnread : ""}`}
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
                            <span className={cls.notificationTitle}>{item.title}</span>
                            <span className={cls.notificationMessage}>{item.message}</span>
                            <span className={cls.notificationMeta}>
                              {item.tag ? <span className={cls.notificationTag}>{item.tag}</span> : null}
                              <span className={cls.notificationTime}>{item.time}</span>
                            </span>
                          </span>
                        </Link>
                      ),
                    )}
                  </div>

                  <div className={cls.notificationFooter}>
                    {preview ? (
                      <a href="#" className={cls.notificationFooterBtn} onClick={onBlockClick}>
                        Go to notification center
                      </a>
                    ) : (
                      <Link
                        href={(notificationHref || "/notifications") as Route}
                        className={cls.notificationFooterBtn}
                        onClick={() => setNotificationOpen(false)}
                      >
                        Go to notification center
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className={cls.orderWrap}>
              <button
                className={cls.cartBtn}
                type="button"
                aria-label="Cart"
                aria-haspopup="dialog"
                aria-expanded={orderOpen}
                onClick={(e) => {
                  if (preview) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                  }
                  e.preventDefault();
                  e.stopPropagation();
                  setAccountOpen(false);
                  setNotificationOpen(false);
                  setOrderOpen((v) => !v);
                }}
              >
                <i className="bi bi-bag" />
                <span className={cls.badge}>{badgeCart}</span>
              </button>

              {orderOpen && (
                <div
                  className={cls.orderDropdown}
                  role="dialog"
                  aria-label="My Orders popup"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className={cls.orderHead}>
                    <span className={cls.orderHeadIcon}>
                      <i className="bi bi-receipt" />
                    </span>
                    <span className={cls.orderHeadTitle}>My Orders</span>
                  </div>

                  <div className={cls.orderList}>
                    {orderPreviewItems.map((item) =>
                      preview ? (
                        <a key={item.id} href="#" className={cls.orderItem} onClick={onBlockClick}>
                          <div className={cls.orderContent}>
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
                          </div>

                          <span className={cls.orderThumb}>
                            <Image
                              src={item.image || "/assets/images/logo.jpg"}
                              alt={item.orderNumber}
                              fill
                              className={cls.orderThumbImg}
                            />
                          </span>
                        </a>
                      ) : (
                        <Link
                          key={item.id}
                          href={(item.href || orderHref || "/account/orders") as Route}
                          className={cls.orderItem}
                          onClick={() => setOrderOpen(false)}
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
                              src={item.image || "/assets/images/logo.jpg"}
                              alt={item.orderNumber}
                              fill
                              className={cls.orderThumbImg}
                            />
                          </span>
                        </Link>
                      ),
                    )}
                  </div>

                  <div className={cls.orderFooter}>
                    {preview ? (
                      <a href="#" className={cls.orderFooterBtn} onClick={onBlockClick}>
                        Xem tất cả
                      </a>
                    ) : (
                      <Link
                        href={(orderHref || "/account/orders") as Route}
                        className={cls.orderFooterBtn}
                        onClick={() => setOrderOpen(false)}
                      >
                        Xem tất cả
                      </Link>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={cls.bottomRow}>
          <div
            className={`${cls.categoryNav} ${categoryOpen ? cls.categoryNavOpen : ""}`}
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
              setCategoryOpen((v) => !v);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setCategoryOpen((v) => !v);
              }
              if (e.key === "Escape") setCategoryOpen(false);
            }}
          >
            <div className={cls.categoryTrigger}>
              <span className={cls.categoryTriggerLeft}>
                <i className="bi bi-grid-3x3-gap" />
                <span>Product Categories</span>
              </span>
              <i className={`bi bi-chevron-down ${cls.categoryTriggerCaret}`} />
            </div>

            <div className={cls.categoryDropdown}>
              <div className={cls.categoryPanel}>
                {categoryItems.map((cat, idx) =>
                  preview ? (
                    <a key={idx} href="#" className={cls.categoryItem} onClick={onBlockClick}>
                      <span className={cls.categoryItemIcon}>{cat.emoji || "•"}</span>
                      <span className={cls.categoryItemText}>{cat.label}</span>
                      <i className="bi bi-chevron-right" />
                    </a>
                  ) : (
                    <Link key={idx} href={(cat.href || "/") as Route} className={cls.categoryItem}>
                      <span className={cls.categoryItemIcon}>{cat.emoji || "•"}</span>
                      <span className={cls.categoryItemText}>{cat.label}</span>
                      <i className="bi bi-chevron-right" />
                    </Link>
                  ),
                )}
              </div>
            </div>
          </div>

          <nav className={cls.nav} aria-label="Primary navigation">
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
                    className={`${cls.navItem} ${cls.navItemMega} ${isOpen ? cls.open : ""}`}
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
                    <i className={`bi bi-chevron-down ${cls.navCaret}`} />

                    <div className={cls.mega} role="menu" aria-label={`${it.label} menu`}>
                      <div className={cls.megaGrid}>
                        {it.columns.map((col, cIdx) => (
                          <div className={cls.megaCol} key={cIdx}>
                            {col.title ? <div className={cls.megaTitle}>{col.title}</div> : null}

                            {col.items.map((link, lIdx) =>
                              preview ? (
                                <a key={lIdx} href="#" onClick={onBlockClick}>
                                  <span>{link.label}</span>
                                  <i className="bi bi-arrow-right-short" />
                                </a>
                              ) : (
                                <Link key={lIdx} href={(link.href || "/") as Route}>
                                  <span>{link.label}</span>
                                  <i className="bi bi-arrow-right-short" />
                                </Link>
                              ),
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}

            {!shouldRenderNav && menuLoaded ? (
              preview ? (
                <a href="#" className={`${cls.navItem} ${cls.navItemActive}`} onClick={onBlockClick}>
                  <span>Home</span>
                </a>
              ) : (
                <Link href={"/" as Route} className={`${cls.navItem} ${cls.navItemActive}`}>
                  <span>Home</span>
                </Link>
              )
            ) : null}
          </nav>
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
