"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Header/HeaderUtility.module.css";
import type { RegItem } from "@/lib/ui-builder/types";
import HeaderAuthModal from "@/components/admin/shared/popup/header/HeaderAuthModal";
import { getMe, logoutUser } from "@/store/auth/auth-client";

export type UtilityBadge = {
  label: string;
  tone?: "default" | "primary" | "success" | "warning" | "danger";
};

export type UtilityMegaColumn = {
  title: string;
  items: { label: string; href: string; note?: string }[];
};

export type UtilityNavItem =
  | {
      type: "link";
      label: string;
      href: string;
      active?: boolean;
      badge?: string;
    }
  | {
      type: "mega";
      label: string;
      active?: boolean;
      badge?: string;
      columns: UtilityMegaColumn[];
    };

export type UtilityQuickAction = {
  label: string;
  href: string;
  icon?: string;
  badge?: string;
};

export type UtilityAnnouncement = {
  id: string;
  label: string;
  href?: string;
  emphasis?: boolean;
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
  spotlightText?: string;
  spotlightHref?: string;
  announcementLabel?: string;
  announcements?: UtilityAnnouncement[];
  navItems?: UtilityNavItem[];
  quickActions?: UtilityQuickAction[];
  utilityFeatures?: UtilityFeature[];
  menuApiUrl?: string;
  menuSetKey?: string;
  menuSiteIdKey?: string;
  onSearchSubmit?: (q: string) => void;
  preview?: boolean;
  isAuthed?: boolean;
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
  icon?: string;
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

function toSlug(input?: string | null): string {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

function buildTreeFromItems(rows: ApiLayoutItem[]): ApiTreeNode[] {
  const visibleRows = (rows || []).filter((r) => !!r.visible);

  const map = new Map<string, ApiTreeNode>();
  visibleRows.forEach((r) => {
    map.set(r.id, {
      key: r.id,
      title: r.title,
      path: r.path,
      parentKey: r.parentId,
      children: [],
    });
  });

  const roots: ApiTreeNode[] = [];
  visibleRows.forEach((r) => {
    const node = map.get(r.id)!;
    if (r.parentId && map.has(r.parentId)) {
      map.get(r.parentId)!.children!.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortMap: Record<string, number> = {};
  rows.forEach((r) => {
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

function treeToNavItems(tree: ApiTreeNode[]): UtilityNavItem[] {
  const out: UtilityNavItem[] = [];

  for (const n of tree || []) {
    const children = n.children || [];

    if (!children.length) {
      out.push({
        type: "link",
        label: n.title,
        href: normalizePath(n.path),
      });
      continue;
    }

    const columns: UtilityMegaColumn[] = children
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
      });
      continue;
    }

    out.push({
      type: "mega",
      label: n.title,
      columns,
    });
  }

  return out;
}

const DEFAULT_NAV_ITEMS: UtilityNavItem[] = [
  { type: "link", label: "Trang chủ", href: "/", active: true },
  { type: "link", label: "Sản phẩm mới", href: "/new-arrivals", badge: "New" },
  { type: "link", label: "Flash Sale", href: "/sale", badge: "Hot" },
  {
    type: "mega",
    label: "Danh mục",
    columns: [
      {
        title: "Chăm sóc cá nhân",
        items: [
          { label: "Dưỡng da", href: "/beauty/skincare", note: "Best seller" },
          { label: "Trang điểm", href: "/beauty/makeup" },
          { label: "Chăm sóc tóc", href: "/beauty/haircare" },
        ],
      },
      {
        title: "Thiết bị & phụ kiện",
        items: [
          { label: "Điện thoại", href: "/tech/phones" },
          { label: "Phụ kiện", href: "/tech/accessories" },
          { label: "Gia dụng", href: "/home-living" },
        ],
      },
      {
        title: "Gia đình",
        items: [
          { label: "Mẹ & bé", href: "/mom-baby" },
          { label: "Nhà bếp", href: "/home-kitchen" },
          { label: "Quà tặng", href: "/gifts" },
        ],
      },
    ],
  },
  { type: "link", label: "Thương hiệu", href: "/brands" },
  { type: "link", label: "Xu hướng", href: "/trending" },
  { type: "link", label: "Hỗ trợ", href: "/support" },
];

const DEFAULT_QUICK_ACTIONS: UtilityQuickAction[] = [
  { label: "Yêu thích", href: "/wishlist", icon: "bi-heart" },
  { label: "Theo dõi đơn", href: "/account/orders", icon: "bi-box-seam" },
  { label: "Cửa hàng", href: "/shops", icon: "bi-shop", badge: "24/7" },
];

const DEFAULT_ANNOUNCEMENTS: UtilityAnnouncement[] = [
  { id: "1", label: "Miễn phí vận chuyển cho đơn từ 499K", href: "/shipping-policy", emphasis: true },
  { id: "2", label: "Hoàn xu cho thành viên thân thiết", href: "/membership" },
  { id: "3", label: "Bộ sưu tập hè đã lên kệ", href: "/summer-collection" },
];

const DEFAULT_FEATURES: UtilityFeature[] = [
  { label: "Giao nhanh", value: "2H nội thành" },
  { label: "Bảo đảm", value: "Đổi trả 15 ngày" },
  { label: "Hỗ trợ", value: "Live chat 24/7" },
];

export function HeaderUtility({
  brandHref = "/",
  brandName = "Tuan Kiet Store",
  brandSub = "Modern commerce experience",
  logoSrc = "/assets/images/logo.jpg",
  logoAlt = "Tuan Kiet Store",
  logoText = "TK",
  searchPlaceholder = "Tìm kiếm sản phẩm, bộ sưu tập hoặc thương hiệu",
  searchButtonText = "Tìm ngay",
  searchCapsuleText = "AI Search",
  spotlightTitle = "Bộ sưu tập mùa mới",
  spotlightText = "Nâng cấp trải nghiệm mua sắm với giao diện premium cho retail 2026.",
  spotlightHref = "/collections/new-season",
  announcementLabel = "Tin mới",
  announcements = DEFAULT_ANNOUNCEMENTS,
  navItems,
  quickActions = DEFAULT_QUICK_ACTIONS,
  utilityFeatures = DEFAULT_FEATURES,
  menuApiUrl = "/api/admin/builder/menus/header-menu",
  menuSetKey = "home",
  menuSiteIdKey = "builder_site_id",
  onSearchSubmit,
  preview = false,
  isAuthed = false,
}: HeaderUtilityProps) {
  const rootRef = useRef<HTMLElement | null>(null);

  const [safeLogo, setSafeLogo] = useState(logoSrc || "/assets/images/logo.jpg");
  const [query, setQuery] = useState("");
  const [apiNav, setApiNav] = useState<UtilityNavItem[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [openMegaIndex, setOpenMegaIndex] = useState<number | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    setSafeLogo(logoSrc || "/assets/images/logo.jpg");
  }, [logoSrc]);

  const items = useMemo(() => {
    if (navItems && navItems.length > 0) return navItems;
    if (apiNav.length > 0) return apiNav;
    return DEFAULT_NAV_ITEMS;
  }, [navItems, apiNav]);

  const isLoggedIn = preview ? !!isAuthed : !!currentUser;

  const displayName = useMemo(() => {
    if (!currentUser) return "Đăng nhập";
    if (currentUser.name && currentUser.name.trim()) return currentUser.name.trim();
    if (currentUser.email) return currentUser.email.split("@")[0];
    return "Đăng nhập";
  }, [currentUser]);

  const displayRole = useMemo(() => currentUser?.role || "Khách hàng", [currentUser]);

  const initials = useMemo(() => {
    const name = displayName.trim();
    if (!name) return "U";
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

        if (!res.ok) throw new Error("Failed to load utility header menu");

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

        if (!alive) return;
        setApiNav(treeToNavItems(tree));
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

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (rootRef.current && rootRef.current.contains(target)) return;
      setOpenMegaIndex(null);
      setAccountOpen(false);
      setMobileOpen(false);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpenMegaIndex(null);
        setAccountOpen(false);
        setMobileOpen(false);
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
    setAuthMode(mode);
    setAuthOpen(true);
    setAccountOpen(false);
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

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (preview) return;
    onSearchSubmit?.(query);
  };

  const renderLink = (href: string, className: string, children: React.ReactNode, key?: string) => {
    if (preview) {
      return (
        <a key={key} href="#" className={className} onClick={onBlockClick}>
          {children}
        </a>
      );
    }

    return (
      <Link key={key} href={(href || "/") as Route} className={className}>
        {children}
      </Link>
    );
  };

  const renderNavItem = (item: UtilityNavItem, idx: number, mobile = false) => {
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
            onClick={() => setOpenMegaIndex((cur) => (cur === idx ? null : idx))}
          >
            <span>{item.label}</span>
            <i className={`bi ${openMegaIndex === idx ? "bi-dash" : "bi-plus"}`} />
          </button>

          <div className={`${cls.mobileMegaBody} ${openMegaIndex === idx ? cls.mobileMegaBodyOpen : ""}`}>
            {item.columns.map((col, cIdx) => (
              <div key={cIdx} className={cls.mobileMegaColumn}>
                <div className={cls.mobileMegaTitle}>{col.title}</div>
                <div className={cls.mobileMegaLinks}>
                  {col.items.map((link, lIdx) =>
                    renderLink(
                      link.href,
                      cls.mobileSubLink,
                      <>
                        <span>{link.label}</span>
                        {link.note ? <small>{link.note}</small> : null}
                      </>,
                      `ml-${idx}-${cIdx}-${lIdx}`,
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
        tabIndex={0}
        role="button"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <span>{item.label}</span>
        <span className={cls.navMeta}>
          {item.badge ? <em className={cls.navBadge}>{item.badge}</em> : null}
          <i className={`bi bi-chevron-down ${cls.navCaret}`} />
        </span>

        <div className={cls.megaMenu} role="menu" aria-label={`${item.label} menu`}>
          <div className={cls.megaMenuInner}>
            <div className={cls.megaMenuHero}>
              <span className={cls.megaHeroBadge}>Explore</span>
              <strong>{item.label}</strong>
              <p>
                Thiết kế menu chuyên nghiệp cho nền tảng bán hàng đa danh mục, dễ mở rộng và tối ưu trải nghiệm điều
                hướng.
              </p>
            </div>

            <div className={cls.megaGrid}>
              {item.columns.map((col, cIdx) => (
                <div key={cIdx} className={cls.megaCol}>
                  <div className={cls.megaTitle}>{col.title}</div>
                  <div className={cls.megaLinks}>
                    {col.items.map((link, lIdx) =>
                      renderLink(
                        link.href,
                        cls.megaLink,
                        <>
                          <span>{link.label}</span>
                          {link.note ? <small>{link.note}</small> : null}
                        </>,
                        `d-${idx}-${cIdx}-${lIdx}`,
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
              <Link href={brandHref as Route} className={cls.brand}>
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
                <span className={cls.searchToplineText}>Tìm nhanh hơn với giao diện bán hàng thế hệ mới</span>
              </div>

              <div className={cls.searchShell}>
                <span className={cls.searchIconWrap}>
                  <i className="bi bi-search" />
                </span>

                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
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
                  ? renderLink("/", `${cls.navItem} ${cls.navItemActive}`, <span>Trang chủ</span>, "home-fallback")
                  : null}
              </nav>
            </div>
          </div>

          <div className={cls.accountZone}>
            {renderLink(
              spotlightHref || "/",
              cls.spotlightCard,
              <>
                <span className={cls.spotlightBadge}>Curated</span>
                <strong>{spotlightTitle}</strong>
                <small>{spotlightText}</small>
              </>,
              "spotlight",
            )}

            <button
              type="button"
              className={cls.accountBtn}
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

                setAccountOpen((cur) => !cur);
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
                <strong>{isLoggedIn ? displayName : authChecked ? "Đăng nhập" : "Đang tải..."}</strong>
                <small>{isLoggedIn ? displayRole : "Mở hồ sơ khách hàng"}</small>
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
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setMobileOpen((cur) => !cur);
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
                onClick={(e) => e.stopPropagation()}
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
                  {renderLink("/account", cls.accountLink, <span>Hồ sơ của tôi</span>, "acc-1")}
                  {renderLink("/account/orders", cls.accountLink, <span>Đơn hàng</span>, "acc-2")}
                  {renderLink("/wishlist", cls.accountLink, <span>Danh sách yêu thích</span>, "acc-3")}
                </div>

                <button type="button" className={cls.logoutBtn} onClick={handleLogout}>
                  <i className="bi bi-box-arrow-right" />
                  <span>Đăng xuất</span>
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
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                placeholder={searchPlaceholder}
                className={cls.mobileSearchInput}
                aria-label="Search"
              />
              <button type="submit" className={cls.mobileSearchBtn}>
                {searchButtonText}
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
        onSuccess={({ user }) => {
          setCurrentUser(user);
          setAuthOpen(false);
          setAccountOpen(false);
        }}
      />
    </header>
  );
}

function parseNavItems(raw?: string): UtilityNavItem[] | undefined {
  if (!raw) return undefined;

  try {
    const val = JSON.parse(raw);
    if (!Array.isArray(val)) return undefined;

    const cleaned: UtilityNavItem[] = [];

    for (const it of val) {
      if (it?.type === "link" && it?.label && it?.href) {
        cleaned.push({
          type: "link",
          label: String(it.label),
          href: String(it.href),
          active: !!it.active,
          badge: it.badge ? String(it.badge) : undefined,
        });
        continue;
      }

      if (it?.type === "mega" && it?.label && Array.isArray(it?.columns)) {
        const cols: UtilityMegaColumn[] = it.columns
          .filter(Boolean)
          .map((c: any) => ({
            title: String(c?.title ?? ""),
            items: Array.isArray(c?.items)
              ? c.items
                  .filter(Boolean)
                  .map((x: any) => ({
                    label: String(x?.label ?? ""),
                    href: String(x?.href ?? ""),
                    note: x?.note ? String(x.note) : undefined,
                  }))
                  .filter((x: any) => x.label && x.href)
              : [],
          }))
          .filter((c: UtilityMegaColumn) => c.title && c.items.length);

        if (cols.length) {
          cleaned.push({
            type: "mega",
            label: String(it.label),
            columns: cols,
            active: !!it.active,
            badge: it.badge ? String(it.badge) : undefined,
          });
        }
      }
    }

    return cleaned.length ? cleaned : undefined;
  } catch {
    return undefined;
  }
}

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
    searchPlaceholder: "Tìm kiếm sản phẩm, bộ sưu tập hoặc thương hiệu",
    searchButtonText: "Tìm ngay",
    searchCapsuleText: "AI Search",
    spotlightTitle: "Bộ sưu tập mùa mới",
    spotlightText: "Nâng cấp trải nghiệm mua sắm với giao diện premium cho retail 2026.",
    spotlightHref: "/collections/new-season",
    announcementLabel: "Tin mới",
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
    { key: "logoText", label: "Logo Text", kind: "text" },
    { key: "searchPlaceholder", label: "Search Placeholder", kind: "text" },
    { key: "searchButtonText", label: "Search Button Text", kind: "text" },
    { key: "searchCapsuleText", label: "Search Capsule Text", kind: "text" },
    { key: "spotlightTitle", label: "Spotlight Title", kind: "text" },
    { key: "spotlightText", label: "Spotlight Text", kind: "textarea", rows: 4 },
    { key: "spotlightHref", label: "Spotlight Href", kind: "text" },
    { key: "announcementLabel", label: "Announcement Label", kind: "text" },
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
      <div aria-label="Shop Header Utility">
        <HeaderUtility
          brandHref={p.brandHref}
          brandName={p.brandName}
          brandSub={p.brandSub}
          logoSrc={p.logoSrc}
          logoAlt={p.logoAlt}
          logoText={p.logoText}
          searchPlaceholder={p.searchPlaceholder}
          searchButtonText={p.searchButtonText}
          searchCapsuleText={p.searchCapsuleText}
          spotlightTitle={p.spotlightTitle}
          spotlightText={p.spotlightText}
          spotlightHref={p.spotlightHref}
          announcementLabel={p.announcementLabel}
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

export default HeaderUtility;
