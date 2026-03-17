"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Header/HeaderTicker.module.css";
import type { RegItem } from "@/lib/ui-builder/types";
import HeaderAuthModal from "@/components/admin/shared/popup/header/HeaderAuthModal";
import { getMe, logoutUser } from "@/store/auth/auth-client";

export type MegaColumn = {
  title: string;
  items: { label: string; href: string }[];
};

export type NavItem =
  | { type: "link"; label: string; href: string; active?: boolean }
  | { type: "mega"; label: string; columns: MegaColumn[]; active?: boolean };

export type QuickLinkItem = {
  label: string;
  href: string;
};

export type TrendingKeyword = {
  label: string;
  href: string;
};

export type HeaderCompactProps = {
  brandHref?: string;
  brandName?: string;
  brandSub?: string;
  logoSrc?: string;
  logoAlt?: string;
  logoText?: string;
  searchPlaceholder?: string;
  searchButtonText?: string;
  cameraTitle?: string;
  publishText?: string;
  publishHref?: string;
  qrImageSrc?: string;
  qrTitle?: string;
  qrHint?: string;
  navItems?: NavItem[];
  quickLinks?: QuickLinkItem[];
  trendingKeywords?: TrendingKeyword[];
  onSearchSubmit?: (q: string) => void;
  menuApiUrl?: string;
  menuSetKey?: string;
  menuSiteIdKey?: string;
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

  const sortRec = (items?: ApiTreeNode[]) => {
    if (!items) return;
    items.sort((a, b) => {
      const sa = sortMap[a.key] ?? 0;
      const sb = sortMap[b.key] ?? 0;
      if (sa !== sb) return sa - sb;
      return a.title.localeCompare(b.title);
    });
    items.forEach((it) => sortRec(it.children));
  };

  sortRec(roots);
  return roots;
}

function treeToNavItems(tree: ApiTreeNode[]): NavItem[] {
  const out: NavItem[] = [];

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

const DEFAULT_NAV_ITEMS: NavItem[] = [
  { type: "link", label: "Trang chủ", href: "/", active: true },
  { type: "link", label: "Flash Sale", href: "/flash-sale" },
  { type: "link", label: "Khuyến mãi", href: "/sale" },
  {
    type: "mega",
    label: "Danh mục",
    columns: [
      {
        title: "Làm đẹp",
        items: [
          { label: "Chăm sóc da", href: "/beauty/skincare" },
          { label: "Trang điểm", href: "/beauty/makeup" },
          { label: "Nước hoa", href: "/beauty/fragrance" },
        ],
      },
      {
        title: "Thiết bị",
        items: [
          { label: "Điện thoại", href: "/tech/phones" },
          { label: "Phụ kiện", href: "/tech/accessories" },
          { label: "Thiết bị gia dụng", href: "/home-living" },
        ],
      },
      {
        title: "Mẹ & Bé",
        items: [
          { label: "Tã bỉm", href: "/mom-baby/diapers" },
          { label: "Sữa", href: "/mom-baby/milk" },
          { label: "Đồ dùng", href: "/mom-baby/tools" },
        ],
      },
    ],
  },
  { type: "link", label: "Nguồn hàng", href: "/sources" },
  { type: "link", label: "Xu hướng", href: "/trending" },
  { type: "link", label: "Hỗ trợ", href: "/support" },
];

const DEFAULT_QUICK_LINKS: QuickLinkItem[] = [
  { label: "Yêu thích", href: "/wishlist" },
  { label: "Sản phẩm mới", href: "/new-arrivals" },
  { label: "Bán chạy", href: "/best-sellers" },
];

const DEFAULT_TRENDING: TrendingKeyword[] = [
  { label: "serum", href: "/search?q=serum" },
  { label: "sữa rửa mặt", href: "/search?q=sua-rua-mat" },
  { label: "máy sấy tóc", href: "/search?q=may-say-toc" },
  { label: "tai nghe", href: "/search?q=tai-nghe" },
];

export function HeaderCompact({
  brandHref = "/",
  brandName = "Tuan Kiet Store",
  brandSub = "Nguồn hàng tốt mỗi ngày",
  logoSrc,
  logoAlt = "Tuan Kiet Store",
  logoText = "1688",
  searchPlaceholder = "Tìm kiếm sản phẩm, thương hiệu hoặc nhà cung cấp",
  searchButtonText = "Tìm kiếm",
  cameraTitle = "Tìm bằng hình ảnh",
  publishText = "Đăng nhập",
  publishHref = "/login",
  qrImageSrc = "/assets/images/logo.jpg",
  qrTitle = "Tải ứng dụng",
  qrHint = "Quét QR để xem nhanh",
  navItems,
  quickLinks = DEFAULT_QUICK_LINKS,
  trendingKeywords = DEFAULT_TRENDING,
  onSearchSubmit,
  menuApiUrl = "/api/admin/builder/menus/header-menu",
  menuSetKey = "home",
  menuSiteIdKey = "builder_site_id",
  preview = false,
  isAuthed = false,
}: HeaderCompactProps) {
  const rootRef = useRef<HTMLElement | null>(null);

  const [query, setQuery] = useState("");
  const [safeLogo, setSafeLogo] = useState(logoSrc || "/assets/images/logo.jpg");
  const [apiNav, setApiNav] = useState<NavItem[]>([]);
  const [menuLoaded, setMenuLoaded] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMegaIndex, setOpenMegaIndex] = useState<number | null>(null);
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
    if (apiNav.length > 0) return apiNav;
    return DEFAULT_NAV_ITEMS;
  }, [navItems, apiNav]);

  const isLoggedIn = preview ? !!isAuthed : !!currentUser;

  const displayName = useMemo(() => {
    if (!currentUser) return "Tài khoản";
    if (currentUser.name && currentUser.name.trim()) return currentUser.name.trim();
    if (currentUser.email) return currentUser.email.split("@")[0];
    return "Tài khoản";
  }, [currentUser]);

  const displayRole = useMemo(() => currentUser?.role || "Thành viên", [currentUser]);

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

        if (!res.ok) throw new Error("Failed to load compact header menu");

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

  const renderBrand = () => {
    const inner = (
      <>
        <div className={cls.brandMark}>
          {logoSrc ? (
            <span className={cls.brandImageWrap}>
              <Image
                src={safeLogo}
                alt={logoAlt}
                fill
                className={cls.brandImage}
                onError={() => setSafeLogo("/assets/images/logo.jpg")}
              />
            </span>
          ) : (
            <span className={cls.brandWordmark}>{logoText}</span>
          )}

          <span className={cls.brandTagline}>{brandSub}</span>
        </div>

        <span className={cls.brandText}>
          <strong>{brandName}</strong>
          <small>{brandSub}</small>
        </span>
      </>
    );

    if (preview) {
      return (
        <a href="#" className={cls.brand} aria-label={brandName} onClick={onBlockClick}>
          {inner}
        </a>
      );
    }

    return (
      <Link href={brandHref as Route} className={cls.brand} aria-label={brandName}>
        {inner}
      </Link>
    );
  };

  const renderNavItem = (item: NavItem, idx: number, mobile = false) => {
    if (item.type === "link") {
      const className = mobile
        ? `${cls.mobileNavItem} ${item.active ? cls.mobileNavItemActive : ""}`
        : `${cls.navItem} ${item.active ? cls.navItemActive : ""}`;

      if (preview) {
        return (
          <a key={`${mobile ? "m" : "d"}-${idx}`} href="#" className={className} onClick={onBlockClick}>
            <span>{item.label}</span>
          </a>
        );
      }

      return (
        <Link key={`${mobile ? "m" : "d"}-${idx}`} href={(item.href || "/") as Route} className={className}>
          <span>{item.label}</span>
        </Link>
      );
    }

    if (mobile) {
      return (
        <div key={`m-${idx}`} className={cls.mobileMegaBlock}>
          <div className={cls.mobileMegaTitle}>{item.label}</div>
          <div className={cls.mobileMegaLinks}>
            {item.columns.flatMap((col, cIdx) =>
              col.items.map((link, lIdx) =>
                preview ? (
                  <a key={`m-${idx}-${cIdx}-${lIdx}`} href="#" className={cls.mobileSubLink} onClick={onBlockClick}>
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={`m-${idx}-${cIdx}-${lIdx}`}
                    href={(link.href || "/") as Route}
                    className={cls.mobileSubLink}
                  >
                    {link.label}
                  </Link>
                ),
              ),
            )}
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
        <i className={`bi bi-chevron-down ${cls.navCaret}`} />

        <div className={cls.megaMenu} role="menu" aria-label={`${item.label} menu`}>
          <div className={cls.megaGrid}>
            {item.columns.map((col, cIdx) => (
              <div key={cIdx} className={cls.megaCol}>
                <div className={cls.megaTitle}>{col.title}</div>
                <div className={cls.megaLinks}>
                  {col.items.map((link, lIdx) =>
                    preview ? (
                      <a key={lIdx} href="#" className={cls.megaLink} onClick={onBlockClick}>
                        {link.label}
                      </a>
                    ) : (
                      <Link key={lIdx} href={(link.href || "/") as Route} className={cls.megaLink}>
                        {link.label}
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
  };

  return (
    <header className={cls.header} ref={rootRef}>
      <div className={cls.container}>
        <div className={cls.topbar}>
          <div className={cls.topbarLeft}>
            {quickLinks.map((item, idx) =>
              preview ? (
                <a key={idx} href="#" className={cls.quickLink} onClick={onBlockClick}>
                  {item.label}
                </a>
              ) : (
                <Link key={idx} href={(item.href || "/") as Route} className={cls.quickLink}>
                  {item.label}
                </Link>
              ),
            )}
          </div>

          <div className={cls.topbarRight}>
            {preview ? (
              <a href="#" className={cls.publishBtn} onClick={onBlockClick}>
                {publishText}
              </a>
            ) : (
              <Link href={(publishHref || "/login") as Route} className={cls.publishBtn}>
                {publishText}
              </Link>
            )}
          </div>
        </div>

        <div className={cls.mainRow}>
          <div className={cls.brandCol}>{renderBrand()}</div>

          <div className={cls.searchCol}>
            <form className={cls.searchForm} onSubmit={handleSearch}>
              <div className={cls.searchFieldWrap}>
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className={cls.searchInput}
                  placeholder={searchPlaceholder}
                  aria-label="Search"
                />
              </div>

              <button
                type="button"
                className={cls.cameraBtn}
                title={cameraTitle}
                aria-label={cameraTitle}
                onClick={(e) => {
                  if (preview) {
                    e.preventDefault();
                    e.stopPropagation();
                  }
                }}
              >
                <i className="bi bi-camera" />
              </button>

              <button type="submit" className={cls.searchBtn}>
                {searchButtonText}
              </button>
            </form>

            <div className={cls.trendingRow}>
              {trendingKeywords.map((item, idx) =>
                preview ? (
                  <a key={idx} href="#" className={cls.trendingLink} onClick={onBlockClick}>
                    {item.label}
                  </a>
                ) : (
                  <Link key={idx} href={(item.href || "/") as Route} className={cls.trendingLink}>
                    {item.label}
                  </Link>
                ),
              )}
            </div>
          </div>

          <div className={cls.rightCol}>
            <div className={cls.qrBox}>
              <span className={cls.qrImageWrap}>
                <Image src={qrImageSrc || "/assets/images/logo.jpg"} alt={qrTitle} fill className={cls.qrImage} />
              </span>

              <span className={cls.qrText}>
                <strong>{qrTitle}</strong>
                <small>{qrHint}</small>
              </span>
            </div>

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
                <small>{isLoggedIn ? displayRole : "Tài khoản"}</small>
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
                  {preview ? (
                    <a href="#" className={cls.accountLink} onClick={onBlockClick}>
                      Hồ sơ của tôi
                    </a>
                  ) : (
                    <Link href={"/account" as Route} className={cls.accountLink} onClick={() => setAccountOpen(false)}>
                      Hồ sơ của tôi
                    </Link>
                  )}

                  {preview ? (
                    <a href="#" className={cls.accountLink} onClick={onBlockClick}>
                      Đơn hàng
                    </a>
                  ) : (
                    <Link
                      href={"/account/orders" as Route}
                      className={cls.accountLink}
                      onClick={() => setAccountOpen(false)}
                    >
                      Đơn hàng
                    </Link>
                  )}

                  {preview ? (
                    <a href="#" className={cls.accountLink} onClick={onBlockClick}>
                      Yêu thích
                    </a>
                  ) : (
                    <Link href={"/wishlist" as Route} className={cls.accountLink} onClick={() => setAccountOpen(false)}>
                      Yêu thích
                    </Link>
                  )}
                </div>

                <button type="button" className={cls.logoutBtn} onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            ) : null}
          </div>
        </div>

        <div className={cls.navbar}>
          <nav className={cls.nav} aria-label="Primary navigation">
            {items.map((item, idx) => renderNavItem(item, idx))}
            {!items.length && menuLoaded ? (
              preview ? (
                <a href="#" className={`${cls.navItem} ${cls.navItemActive}`} onClick={onBlockClick}>
                  Trang chủ
                </a>
              ) : (
                <Link href={"/" as Route} className={`${cls.navItem} ${cls.navItemActive}`}>
                  Trang chủ
                </Link>
              )
            ) : null}
          </nav>
        </div>
      </div>

      <div className={`${cls.mobilePanel} ${mobileOpen ? cls.mobilePanelOpen : ""}`}>
        <div className={cls.mobilePanelInner}>
          <form className={cls.mobileSearchForm} onSubmit={handleSearch}>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className={cls.mobileSearchInput}
              placeholder={searchPlaceholder}
              aria-label="Search"
            />
            <button type="submit" className={cls.mobileSearchBtn}>
              {searchButtonText}
            </button>
          </form>

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

function parseNavItems(raw?: string): NavItem[] | undefined {
  if (!raw) return undefined;

  try {
    const val = JSON.parse(raw);
    if (!Array.isArray(val)) return undefined;

    const cleaned: NavItem[] = [];

    for (const it of val) {
      if (it?.type === "link" && it?.label && it?.href) {
        cleaned.push({
          type: "link",
          label: String(it.label),
          href: String(it.href),
          active: !!it.active,
        });
        continue;
      }

      if (it?.type === "mega" && it?.label && Array.isArray(it?.columns)) {
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
            columns: cols,
            active: !!it.active,
          });
        }
      }
    }

    return cleaned.length ? cleaned : undefined;
  } catch {
    return undefined;
  }
}

export const SHOP_HEADER_TICKER: RegItem = {
  kind: "HeaderTicker",
  label: "Header Ticker",
  defaults: {
    brandHref: "/",
    brandName: "Tuan Kiet Store",
    brandSub: "Nguồn hàng tốt mỗi ngày",
    logoSrc: "",
    logoAlt: "Tuan Kiet Store",
    logoText: "1688",
    searchPlaceholder: "Tìm kiếm sản phẩm, thương hiệu hoặc nhà cung cấp",
    searchButtonText: "Tìm kiếm",
    cameraTitle: "Tìm bằng hình ảnh",
    publishText: "Đăng nhập",
    publishHref: "/login",
    qrImageSrc: "/assets/images/logo.jpg",
    qrTitle: "Tải ứng dụng",
    qrHint: "Quét QR để xem nhanh",
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
    { key: "cameraTitle", label: "Camera Button Title", kind: "text" },
    { key: "publishText", label: "Publish/Login Text", kind: "text" },
    { key: "publishHref", label: "Publish/Login Href", kind: "text" },
    { key: "qrImageSrc", label: "QR Image Src", kind: "text" },
    { key: "qrTitle", label: "QR Title", kind: "text" },
    { key: "qrHint", label: "QR Hint", kind: "text" },
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
      <div aria-label="Shop Header Compact">
        <HeaderCompact
          brandHref={p.brandHref}
          brandName={p.brandName}
          brandSub={p.brandSub}
          logoSrc={p.logoSrc}
          logoAlt={p.logoAlt}
          logoText={p.logoText}
          searchPlaceholder={p.searchPlaceholder}
          searchButtonText={p.searchButtonText}
          cameraTitle={p.cameraTitle}
          publishText={p.publishText}
          publishHref={p.publishHref}
          qrImageSrc={p.qrImageSrc}
          qrTitle={p.qrTitle}
          qrHint={p.qrHint}
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

export default HeaderCompact;
