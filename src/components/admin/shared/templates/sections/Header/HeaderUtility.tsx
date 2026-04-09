"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link, { type LinkProps } from "next/link";
import cls from "@/styles/templates/sections/Header/HeaderUtility.module.css";
import type { RegItem } from "@/lib/ui-builder/types";
import HeaderAuthModal from "@/components/admin/shared/popup/header/HeaderAuthModal";
import { getMe, logoutUser } from "@/store/auth/auth-client";

type Href = LinkProps["href"];
type AuthMode = "login" | "register";
type UnknownRecord = Record<string, unknown>;

export type UtilityMegaItem = {
  label: string;
  href: string;
  note?: string;
};

export type UtilityMegaColumn = {
  title: string;
  items: UtilityMegaItem[];
};

export type UtilityNavLinkItem = {
  type: "link";
  label: string;
  href: string;
  active?: boolean;
  badge?: string;
};

export type UtilityNavMegaItem = {
  type: "mega";
  label: string;
  active?: boolean;
  badge?: string;
  columns: UtilityMegaColumn[];
};

export type UtilityNavItem = UtilityNavLinkItem | UtilityNavMegaItem;

export type UtilityQuickAction = {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
};

export type UtilityFeature = {
  label: string;
  value: string;
};

export type HeaderUtilityProps = {
  brandHref?: string;
  brandName?: string;
  brandSub?: string;
  logoSrc?: string;
  logoAlt?: string;
  logoText?: string;
  searchPlaceholder?: string;
  searchButtonText?: string;
  searchCapsuleText?: string;
  spotlightTitle?: string;
  spotlightHref?: string;
  navItems?: UtilityNavItem[];
  quickActions?: UtilityQuickAction[];
  utilityFeatures?: UtilityFeature[];
  menuApiUrl?: string;
  menuSetKey?: string;
  menuSiteIdKey?: string;
  onSearchSubmit?: (query: string) => void;
  preview?: boolean;
  isAuthed?: boolean;
};

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
  icon?: string;
  path: string | null;
  parentKey: string | null;
  children: ApiTreeNode[];
};

type ApiMenuResponse = {
  tree?: ApiTreeNode[];
  items?: ApiLayoutItem[];
};

type CurrentUser = {
  id: string;
  email: string;
  role: string;
  status: string;
  image?: string | null;
  name?: string | null;
};

const DEFAULT_NAV_ITEMS: UtilityNavItem[] = [
  { type: "link", label: "Home", href: "/", active: true },
  { type: "link", label: "New Arrivals", href: "/new-arrivals", badge: "New" },
  { type: "link", label: "Flash Sale", href: "/sale", badge: "Hot" },
  {
    type: "mega",
    label: "Categories",
    columns: [
      {
        title: "Personal Care",
        items: [
          { label: "Skincare", href: "/beauty/skincare", note: "Best seller" },
          { label: "Makeup", href: "/beauty/makeup" },
          { label: "Haircare", href: "/beauty/haircare" },
        ],
      },
      {
        title: "Devices & Accessories",
        items: [
          { label: "Phones", href: "/tech/phones" },
          { label: "Accessories", href: "/tech/accessories" },
          { label: "Home Living", href: "/home-living" },
        ],
      },
      {
        title: "Family",
        items: [
          { label: "Mom & Baby", href: "/mom-baby" },
          { label: "Kitchen", href: "/home-kitchen" },
          { label: "Gifts", href: "/gifts" },
        ],
      },
    ],
  },
  { type: "link", label: "Brands", href: "/brands" },
  { type: "link", label: "Trending", href: "/trending" },
  { type: "link", label: "Support", href: "/support" },
];

const DEFAULT_QUICK_ACTIONS: UtilityQuickAction[] = [
  { label: "Wishlist", href: "/wishlist", icon: "bi-heart" },
  { label: "Track Order", href: "/account/orders", icon: "bi-box-seam" },
  { label: "Stores", href: "/shops", icon: "bi-shop", badge: "24/7" },
];

const DEFAULT_FEATURES: UtilityFeature[] = [
  { label: "Fast Delivery", value: "2h in city" },
  { label: "Guarantee", value: "15-day returns" },
  { label: "Support", value: "24/7 live chat" },
];

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

function normalizePath(path?: string | null): string {
  const value = String(path ?? "").trim();
  if (!value) return "/";
  return value.startsWith("/") ? value : `/${value}`;
}

function toStringOrUndefined(value: unknown): string | undefined {
  return isString(value) && value.trim() ? value : undefined;
}

function toBoolean(value: unknown): boolean {
  return isBoolean(value) ? value : false;
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function buildTreeFromItems(rows: ApiLayoutItem[]): ApiTreeNode[] {
  const visibleRows = rows.filter((row) => row.visible);
  const nodeMap = new Map<string, ApiTreeNode>();

  for (const row of visibleRows) {
    nodeMap.set(row.id, {
      key: row.id,
      title: row.title,
      icon: row.icon ?? undefined,
      path: row.path,
      parentKey: row.parentId,
      children: [],
    });
  }

  const roots: ApiTreeNode[] = [];

  for (const row of visibleRows) {
    const node = nodeMap.get(row.id);
    if (!node) continue;

    if (row.parentId && nodeMap.has(row.parentId)) {
      nodeMap.get(row.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortOrderMap = new Map(rows.map((row) => [row.id, row.sortOrder] as const));

  const sortRecursive = (nodes: ApiTreeNode[]): void => {
    nodes.sort((a, b) => {
      const aOrder = sortOrderMap.get(a.key) ?? 0;
      const bOrder = sortOrderMap.get(b.key) ?? 0;
      if (aOrder !== bOrder) return aOrder - bOrder;
      return a.title.localeCompare(b.title);
    });

    for (const node of nodes) {
      sortRecursive(node.children);
    }
  };

  sortRecursive(roots);
  return roots;
}

function treeToNavItems(tree: ApiTreeNode[]): UtilityNavItem[] {
  const navItems: UtilityNavItem[] = [];

  for (const node of tree) {
    if (node.children.length === 0) {
      navItems.push({
        type: "link",
        label: node.title,
        href: normalizePath(node.path),
      });
      continue;
    }

    const columns: UtilityMegaColumn[] = node.children
      .map((child) => {
        const items: UtilityMegaItem[] = child.children
          .filter((grandChild) => grandChild.title && grandChild.path)
          .map((grandChild) => ({
            label: grandChild.title,
            href: normalizePath(grandChild.path),
          }));

        if (items.length === 0 && child.path) {
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
      .filter((column) => column.title && column.items.length > 0);

    if (columns.length === 0) {
      navItems.push({
        type: "link",
        label: node.title,
        href: normalizePath(node.path),
      });
      continue;
    }

    navItems.push({
      type: "mega",
      label: node.title,
      columns,
    });
  }

  return navItems;
}

function parseNavItems(raw?: string): UtilityNavItem[] | undefined {
  if (!raw) return undefined;

  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return undefined;

    const cleaned: UtilityNavItem[] = [];

    for (const item of parsed) {
      if (!isRecord(item)) continue;

      if (item.type === "link" && isString(item.label) && isString(item.href)) {
        cleaned.push({
          type: "link",
          label: item.label,
          href: item.href,
          active: toBoolean(item.active),
          badge: toStringOrUndefined(item.badge),
        });
        continue;
      }

      if (item.type === "mega" && isString(item.label) && Array.isArray(item.columns)) {
        const columns: UtilityMegaColumn[] = item.columns
          .map((column): UtilityMegaColumn | null => {
            if (!isRecord(column) || !isString(column.title) || !Array.isArray(column.items)) {
              return null;
            }

            const items: UtilityMegaItem[] = column.items
              .map((entry): UtilityMegaItem | null => {
                if (!isRecord(entry)) return null;
                if (!isString(entry.label) || !isString(entry.href)) return null;

                return {
                  label: entry.label,
                  href: entry.href,
                  note: toStringOrUndefined(entry.note),
                };
              })
              .filter((entry): entry is UtilityMegaItem => entry !== null);

            if (items.length === 0) return null;

            return {
              title: column.title,
              items,
            };
          })
          .filter((column): column is UtilityMegaColumn => column !== null);

        if (columns.length > 0) {
          cleaned.push({
            type: "mega",
            label: item.label,
            columns,
            active: toBoolean(item.active),
            badge: toStringOrUndefined(item.badge),
          });
        }
      }
    }

    return cleaned.length > 0 ? cleaned : undefined;
  } catch {
    return undefined;
  }
}

export function HeaderUtility({
  brandHref = "/",
  brandName = "Tuan Kiet Store",
  brandSub = "Modern commerce experience",
  logoSrc = "/assets/images/logo.jpg",
  logoAlt = "Tuan Kiet Store",
  logoText = "TK",
  searchPlaceholder = "Search for products, collections, or brands",
  searchButtonText = "Search",
  searchCapsuleText = "AI Search",
  spotlightTitle = "New Season Collection",
  spotlightHref = "/collections/new-season",
  navItems,
  quickActions = DEFAULT_QUICK_ACTIONS,
  utilityFeatures = DEFAULT_FEATURES,
  menuApiUrl = "/api/admin/menus/header-menu",
  menuSetKey = "home",
  menuSiteIdKey = "builder_site_id",
  onSearchSubmit,
  preview = false,
  isAuthed = false,
}: HeaderUtilityProps) {
  const rootRef = useRef<HTMLElement | null>(null);

  const [safeLogo, setSafeLogo] = useState<string>(logoSrc || "/assets/images/logo.jpg");
  const [query, setQuery] = useState<string>("");
  const [apiNav, setApiNav] = useState<UtilityNavItem[]>([]);
  const [menuLoaded, setMenuLoaded] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [accountOpen, setAccountOpen] = useState<boolean>(false);
  const [openMegaIndex, setOpenMegaIndex] = useState<number | null>(null);
  const [authOpen, setAuthOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);

  useEffect(() => {
    setSafeLogo(logoSrc || "/assets/images/logo.jpg");
  }, [logoSrc]);

  const items = useMemo<UtilityNavItem[]>(() => {
    if (navItems && navItems.length > 0) return navItems;
    if (apiNav.length > 0) return apiNav;
    return DEFAULT_NAV_ITEMS;
  }, [navItems, apiNav]);

  const isLoggedIn = preview ? Boolean(isAuthed) : Boolean(currentUser);

  const displayName = useMemo<string>(() => {
    if (!currentUser) return "Sign In";
    if (currentUser.name && currentUser.name.trim()) return currentUser.name.trim();
    if (currentUser.email) return currentUser.email.split("@")[0];
    return "Sign In";
  }, [currentUser]);

  const displayRole = useMemo<string>(() => currentUser?.role || "Customer", [currentUser]);

  const initials = useMemo<string>(() => {
    const name = displayName.trim();
    if (!name) return "U";

    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

    const first = parts[0]?.[0] ?? "";
    const last = parts[parts.length - 1]?.[0] ?? "";
    return `${first}${last}`.toUpperCase();
  }, [displayName]);

  const onBlockClick = (event: React.SyntheticEvent): void => {
    if (!preview) return;
    event.preventDefault();
    event.stopPropagation();
  };

  useEffect(() => {
    if (preview) {
      setAuthChecked(true);
      return;
    }

    let cancelled = false;

    async function loadCurrentUser(): Promise<void> {
      try {
        const response = await getMe();
        if (!cancelled) {
          setCurrentUser(response.user);
        }
      } catch {
        if (!cancelled) {
          setCurrentUser(null);
        }
      } finally {
        if (!cancelled) {
          setAuthChecked(true);
        }
      }
    }

    void loadCurrentUser();

    return () => {
      cancelled = true;
    };
  }, [preview]);

  useEffect(() => {
    const controller = new AbortController();

    async function loadMenu(): Promise<void> {
      try {
        const params = new URLSearchParams({
          setKey: menuSetKey || "home",
          tree: "1",
          includeHidden: "0",
          page: "1",
          size: "1000",
          sort: "sortOrder:asc",
        });

        const siteId = typeof window !== "undefined" ? window.localStorage.getItem(menuSiteIdKey) : null;
        if (siteId) {
          params.set("siteId", siteId);
        }

        const response = await fetch(`${menuApiUrl}?${params.toString()}`, {
          cache: "no-store",
          credentials: "include",
          signal: controller.signal,
          headers: {
            "x-site-domain": typeof window !== "undefined" ? window.location.host : "",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to load utility header menu");
        }

        const data: ApiMenuResponse = await response.json();

        const tree = Array.isArray(data.tree) && data.tree.length > 0
          ? data.tree
          : Array.isArray(data.items) && data.items.length > 0
            ? buildTreeFromItems(data.items)
            : [];

        setApiNav(treeToNavItems(tree));
        setMenuLoaded(true);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        setApiNav([]);
        setMenuLoaded(true);
      }
    }

    void loadMenu();

    return () => {
      controller.abort();
    };
  }, [menuApiUrl, menuSetKey, menuSiteIdKey]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent): void => {
      const target = event.target as HTMLElement | null;
      if (!target) return;
      if (rootRef.current && rootRef.current.contains(target)) return;

      setOpenMegaIndex(null);
      setAccountOpen(false);
      setMobileOpen(false);
    };

    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key === "Escape") {
        setOpenMegaIndex(null);
        setAccountOpen(false);
        setMobileOpen(false);
        setAuthOpen(false);
      }
    };

    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const openAuth = (mode: AuthMode): void => {
    setAuthMode(mode);
    setAuthOpen(true);
    setAccountOpen(false);
  };

  const handleLogout = async (): Promise<void> => {
    try {
      await logoutUser();
    } catch {
      // ignore logout error and still clear client state
    } finally {
      setCurrentUser(null);
      setAccountOpen(false);
      setAuthOpen(false);
    }
  };

  const handleSearch = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (preview) return;
    onSearchSubmit?.(query);
  };

  const renderLink = (
    href: string,
    className: string,
    children: React.ReactNode,
    key?: string,
  ): React.ReactNode => {
    if (preview) {
      return (
        <a key={key} href="#" className={className} onClick={onBlockClick}>
          {children}
        </a>
      );
    }

    const normalizedHref: Href = normalizePath(href);

    return (
      <Link key={key} href={normalizedHref} className={className}>
        {children}
      </Link>
    );
  };

  const renderNavItem = (item: UtilityNavItem, idx: number, mobile = false): React.ReactNode => {
    if (item.type === "link") {
      const className = mobile
        ? `${cls.mobileNavItem} ${item.active ? cls.mobileNavItemActive : ""}`
        : `${cls.navItem} ${item.active ? cls.navItemActive : ""}`;

      return renderLink(
        item.href,
        className,
        <>
          <span>{item.label}</span>
          {item.badge ? <em className={cls.navBadge}>{item.badge}</em> : null}
        </>,
        `${mobile ? "m" : "d"}-${idx}`,
      );
    }

    if (mobile) {
      return (
        <div key={`m-${idx}`} className={cls.mobileMegaBlock}>
          <button
            type="button"
            className={cls.mobileMegaToggle}
            onClick={() => setOpenMegaIndex((current) => (current === idx ? null : idx))}
          >
            <span>{item.label}</span>
            <i className={`bi ${openMegaIndex === idx ? "bi-dash" : "bi-plus"}`} />
          </button>

          <div className={`${cls.mobileMegaBody} ${openMegaIndex === idx ? cls.mobileMegaBodyOpen : ""}`}>
            {item.columns.map((column, columnIndex) => (
              <div key={columnIndex} className={cls.mobileMegaColumn}>
                <div className={cls.mobileMegaTitle}>{column.title}</div>
                <div className={cls.mobileMegaLinks}>
                  {column.items.map((link, linkIndex) =>
                    renderLink(
                      link.href,
                      cls.mobileSubLink,
                      <>
                        <span>{link.label}</span>
                        {link.note ? <small>{link.note}</small> : null}
                      </>,
                      `ml-${idx}-${columnIndex}-${linkIndex}`,
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    }

    const isOpen = openMegaIndex === idx;

    return (
      <div
        key={`d-${idx}`}
        className={`${cls.navItem} ${cls.navItemMega} ${isOpen ? cls.navItemOpen : ""} ${item.active ? cls.navItemActive : ""}`}
        onMouseEnter={() => {
          if (!preview) setOpenMegaIndex(idx);
        }}
        tabIndex={0}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <button
          type="button"
          className={cls.navMegaTrigger}
          onClick={(event) => {
            if (preview) {
              event.preventDefault();
              event.stopPropagation();
              return;
            }
            setOpenMegaIndex((current) => (current === idx ? null : idx));
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setOpenMegaIndex((current) => (current === idx ? null : idx));
            }
            if (event.key === "Escape") {
              setOpenMegaIndex(null);
            }
          }}
          aria-haspopup="menu"
          aria-expanded={isOpen}
        >
          <span>{item.label}</span>
          <span className={cls.navMeta}>
            {item.badge ? <em className={cls.navBadge}>{item.badge}</em> : null}
            <i className={`bi bi-chevron-down ${cls.navCaret}`} />
          </span>
        </button>

        <div
          className={cls.megaMenu}
          role="menu"
          aria-label={`${item.label} menu`}
          onMouseEnter={() => {
            if (!preview) setOpenMegaIndex(idx);
          }}
          onMouseLeave={() => {
            if (!preview) setOpenMegaIndex(null);
          }}
        >
          <div className={cls.megaMenuInner}>
            <div className={cls.megaMenuHero}>
              <div className="d-flex ju-space-between">
                <span className={cls.megaHeroBadge}>Explore</span>
                <strong>{item.label}</strong>
              </div>
              <p>Professional navigation design for modern commerce platforms.</p>
            </div>

            <div className={cls.megaGrid}>
              {item.columns.map((column, columnIndex) => (
                <div key={columnIndex} className={cls.megaCol}>
                  <div className={cls.megaColTitle}>{column.title}</div>
                  <div className={cls.megaLinks}>
                    {column.items.map((link, linkIndex) =>
                      renderLink(
                        link.href,
                        cls.megaLink,
                        <>
                          <span>{link.label}</span>
                          {link.note ? <small>{link.note}</small> : null}
                        </>,
                        `d-${idx}-${columnIndex}-${linkIndex}`,
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const featurePills = utilityFeatures.slice(0, 3);

  return (
    <header className={cls.header} ref={rootRef}>
      <div className={cls.backdrop} />

      <div className={cls.container}>
        <div className={cls.mainRow}>
          <div className={cls.brandZone}>
            {preview ? (
              <a href="#" className={cls.brand} onClick={onBlockClick}>
                <span className={cls.logoShell}>
                  <span className={cls.logoGlow} />
                  <span className={cls.logoFrame}>
                    <Image
                      src={safeLogo}
                      alt={logoAlt}
                      fill
                      className={cls.logoImage}
                      onError={() => setSafeLogo("/assets/images/logo.jpg")}
                    />
                  </span>
                </span>

                <span className={cls.brandText}>
                  <strong>{brandName}</strong>
                  <small>{brandSub}</small>
                </span>
              </a>
            ) : (
              <Link href={(brandHref || "/") as Href} className={cls.brand}>
                <span className={cls.logoShell}>
                  <span className={cls.logoGlow} />
                  <span className={cls.logoFrame}>
                    {logoSrc ? (
                      <Image
                        src={safeLogo}
                        alt={logoAlt}
                        fill
                        className={cls.logoImage}
                        onError={() => setSafeLogo("/assets/images/logo.jpg")}
                      />
                    ) : (
                      <span className={cls.logoText}>{logoText}</span>
                    )}
                  </span>
                </span>

                <span className={cls.brandText}>
                  <strong>{brandName}</strong>
                  <small>{brandSub}</small>
                </span>
              </Link>
            )}

            <div className={cls.featureRail}>
              {featurePills.map((item, idx) => (
                <span key={idx} className={cls.featurePill}>
                  <strong>{item.label}</strong>
                  <small>{item.value}</small>
                </span>
              ))}
            </div>
          </div>

          <div className={cls.searchZone}>
            <form className={cls.searchForm} onSubmit={handleSearch}>
              <div className={cls.searchTopline}>
                <span className={cls.searchCapsule}>{searchCapsuleText}</span>
                <span className={cls.searchToplineText}>Search faster with a next-generation commerce interface</span>
              </div>

              <div className={cls.searchShell}>
                <span className={cls.searchIconWrap}>
                  <i className="bi bi-search" />
                </span>

                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  type="text"
                  className={cls.searchInput}
                  placeholder={searchPlaceholder}
                  aria-label="Search"
                />

                <button type="button" className={cls.voiceBtn} aria-label="Voice search">
                  <i className="bi bi-mic" />
                </button>

                <button type="submit" className={cls.searchBtn}>
                  {searchButtonText}
                </button>
              </div>
            </form>

            <div className={cls.navbar}>
              <nav className={cls.nav} aria-label="Primary navigation">
                {items.map((item, idx) => renderNavItem(item, idx))}
                {!items.length && menuLoaded
                  ? renderLink("/", `${cls.navItem} ${cls.navItemActive}`, <span>Home</span>, "home-fallback")
                  : null}
              </nav>
            </div>
          </div>

          <div className={cls.accountZone}>
            {renderLink(
              spotlightHref || "/",
              cls.spotlightCard,
              <>
                <div className="d-flex align-items gap-2">
                  <span className={cls.spotlightBadge}>Curated</span>
                  <strong>{spotlightTitle}</strong>
                </div>
              </>,
              "spotlight",
            )}

            <button
              type="button"
              className={cls.accountBtn}
              aria-haspopup={isLoggedIn ? "menu" : "dialog"}
              aria-expanded={isLoggedIn ? accountOpen : authOpen}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();

                if (preview) return;

                if (!isLoggedIn) {
                  openAuth("login");
                  return;
                }

                setAccountOpen((current) => !current);
              }}
            >
              <span className={cls.accountAvatar}>
                {currentUser?.image ? (
                  <Image src={currentUser.image} alt={displayName} fill className={cls.accountAvatarImg} />
                ) : (
                  <span>{initials}</span>
                )}
              </span>

              <span className={cls.accountInfo}>
                <strong>{isLoggedIn ? displayName : authChecked ? "Sign In" : "Loading..."}</strong>
                <small>{isLoggedIn ? displayRole : "Open customer profile"}</small>
              </span>

              <span className={cls.accountArrow}>
                <i className={`bi ${accountOpen ? "bi-chevron-up" : "bi-chevron-down"}`} />
              </span>
            </button>

            <button
              type="button"
              className={cls.mobileToggle}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                setMobileOpen((current) => !current);
                setAccountOpen(false);
                setOpenMegaIndex(null);
              }}
            >
              <i className={`bi ${mobileOpen ? "bi-x-lg" : "bi-list"}`} />
            </button>

            {isLoggedIn && accountOpen ? (
              <div
                className={cls.accountDropdown}
                role="menu"
                aria-label="Account menu"
                onClick={(event) => event.stopPropagation()}
              >
                <div className={cls.accountCard}>
                  <span className={cls.accountCardAvatar}>
                    {currentUser?.image ? (
                      <Image src={currentUser.image} alt={displayName} fill className={cls.accountCardAvatarImg} />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </span>

                  <div className={cls.accountCardBody}>
                    <strong>{displayName}</strong>
                    <small>{currentUser?.email}</small>
                    <span>{displayRole}</span>
                  </div>
                </div>

                <div className={cls.accountLinks}>
                  {renderLink("/account", cls.accountLink, <span>My Profile</span>, "acc-1")}
                  {renderLink("/account/orders", cls.accountLink, <span>Orders</span>, "acc-2")}
                  {renderLink("/wishlist", cls.accountLink, <span>Wishlist</span>, "acc-3")}
                </div>

                <button type="button" className={cls.logoutBtn} onClick={() => void handleLogout()}>
                  <i className="bi bi-box-arrow-right" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className={`${cls.mobilePanel} ${mobileOpen ? cls.mobilePanelOpen : ""}`}>
        <div className={cls.mobilePanelInner}>
          <form className={cls.mobileSearchForm} onSubmit={handleSearch}>
            <div className={cls.mobileSearchShell}>
              <i className="bi bi-search" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                type="text"
                placeholder={searchPlaceholder}
                className={cls.mobileSearchInput}
                aria-label="Search"
              />
              <button type="submit" className={cls.mobileSearchBtn}>
                <span>{searchButtonText}</span>
              </button>
            </div>
          </form>

          <div className={cls.mobileUtilityActions}>
            {quickActions.map((action, idx) =>
              renderLink(
                action.href,
                cls.mobileUtilityAction,
                <>
                  {action.icon ? <i className={`bi ${action.icon}`} /> : null}
                  <span>{action.label}</span>
                </>,
                `mqa-${idx}`,
              ),
            )}
          </div>

          <div className={cls.mobileNav}>{items.map((item, idx) => renderNavItem(item, idx, true))}</div>
        </div>
      </div>

      <HeaderAuthModal
        open={authOpen}
        mode={authMode}
        onModeChange={setAuthMode}
        onClose={() => setAuthOpen(false)}
        onSuccess={({ user }: { user: CurrentUser }) => {
          setCurrentUser(user);
          setAuthOpen(false);
          setAccountOpen(false);
        }}
      />
    </header>
  );
}

type HeaderUtilityRegistryProps = Record<string, unknown>;

export const SHOP_HEADER_UTILITY: RegItem = {
  kind: "HeaderUtility",
  label: "Header Utility",
  defaults: {
    brandHref: "/",
    brandName: "Tuan Kiet Store",
    brandSub: "Modern commerce experience",
    logoSrc: "/assets/images/logo.jpg",
    logoAlt: "Tuan Kiet Store",
    logoText: "TK",
    searchPlaceholder: "Search for products, collections, or brands",
    searchButtonText: "Search",
    searchCapsuleText: "AI Search",
    spotlightTitle: "New Season Collection",
    spotlightHref: "/collections/new-season",
    navItems: "[]",
    menuApiUrl: "/api/admin/menus/header-menu",
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
    { key: "logoText", label: "Logo Text", kind: "text" },
    { key: "searchPlaceholder", label: "Search Placeholder", kind: "text" },
    { key: "searchButtonText", label: "Search Button Text", kind: "text" },
    { key: "searchCapsuleText", label: "Search Capsule Text", kind: "text" },
    { key: "spotlightTitle", label: "Spotlight Title", kind: "text" },
    { key: "spotlightHref", label: "Spotlight Href", kind: "text" },
    { key: "menuApiUrl", label: "Menu API URL", kind: "text" },
    { key: "menuSetKey", label: "Menu setKey", kind: "text" },
    { key: "menuSiteIdKey", label: "LocalStorage siteId key", kind: "text" },
    { key: "isAuthed", label: "Is Authed (0/1)", kind: "number" },
    { key: "navItems", label: "Nav Items (JSON, preview)", kind: "textarea", rows: 10 },
  ],
  render: (props) => {
    const p = props as HeaderUtilityRegistryProps;
    const parsedNavItems = parseNavItems(toStringOrUndefined(p.navItems));

    return (
      <div aria-label="Shop Header Utility">
        <HeaderUtility
          brandHref={toStringOrUndefined(p.brandHref) ?? "/"}
          brandName={toStringOrUndefined(p.brandName) ?? "Tuan Kiet Store"}
          brandSub={toStringOrUndefined(p.brandSub) ?? "Modern commerce experience"}
          logoSrc={toStringOrUndefined(p.logoSrc) ?? "/assets/images/logo.jpg"}
          logoAlt={toStringOrUndefined(p.logoAlt) ?? "Tuan Kiet Store"}
          logoText={toStringOrUndefined(p.logoText) ?? "TK"}
          searchPlaceholder={
            toStringOrUndefined(p.searchPlaceholder) ?? "Search for products, collections, or brands"
          }
          searchButtonText={toStringOrUndefined(p.searchButtonText) ?? "Search"}
          searchCapsuleText={toStringOrUndefined(p.searchCapsuleText) ?? "AI Search"}
          spotlightTitle={toStringOrUndefined(p.spotlightTitle) ?? "New Season Collection"}
          spotlightHref={toStringOrUndefined(p.spotlightHref) ?? "/collections/new-season"}
          preview={Boolean(p.preview)}
          navItems={parsedNavItems}
          menuApiUrl={toStringOrUndefined(p.menuApiUrl) ?? "/api/admin/menus/header-menu"}
          menuSetKey={toStringOrUndefined(p.menuSetKey) ?? "home"}
          menuSiteIdKey={toStringOrUndefined(p.menuSiteIdKey) ?? "builder_site_id"}
          isAuthed={toNumber(p.isAuthed) === 1}
        />
      </div>
    );
  },
};

export default HeaderUtility;