"use client";

import React, { useState, FormEvent, useEffect } from "react";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/header/HeaderSimple.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/** ===== Types từ DB (giống HeaderPro) ===== */
type DbMenuItem = {
  id: string;
  siteId: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  locale: string;
  setKey: string;
};

type NavSubItem = {
  id: string;
  label: string;
  href: string;
  iconClass?: string;
};

type NavItem = {
  id: string;
  label: string;
  href: string;
  iconClass?: string;
  hasSub: boolean;
  subItems: NavSubItem[];
};

export interface HeaderSimpleProps {
  // Logo / brand
  brandName?: string; // Aurora Wear
  brandBadge?: string; // CAPSULE WARDROBE

  // Search
  showSearch?: boolean;
  searchPlaceholder?: string;

  // Right actions
  showQuickGrid?: boolean;
  cartCount?: number;
  userName?: string; // "Thinh"
  userTierLabel?: string; // "Aurora Tier • Style Nova"
  userInitials?: string; // "TN"
  showUserShell?: boolean;

  // Contact line
  phone?: string;
  email?: string;
  address?: string;

  // Bottom nav mobile
  showBottomNav?: boolean;

  // Nav từ props / DB
  navItems?: NavItem[];
  autoLoadMenu?: boolean;
  locale?: string;
  siteId?: string;
  setKey?: string;

  // Preview mode (chặn hành vi thật, chỉ log)
  preview?: boolean;
}

const DEFAULT_HEADER_SIMPLE_PROPS: HeaderSimpleProps = {
  brandName: "Aurora Wear",
  brandBadge: "CAPSULE WARDROBE",

  showSearch: true,
  searchPlaceholder: "Search outfit, váy, áo, quần, giày...",

  showQuickGrid: true,
  cartCount: 2,
  userName: "Thinh",
  userTierLabel: "Aurora Tier • Style Nova",
  userInitials: "TN",
  showUserShell: true,

  phone: "+012-888888",
  email: "support@aurorawear.com",
  address: "Aurora Avenue",

  showBottomNav: true,

  autoLoadMenu: true,
  locale: "en",
  setKey: "home",

  preview: false,
};

type NavKey = "moi-ve" | "nu" | "nam" | "unisex" | "sale" | "lookbook";
type BottomTab = "home" | "category" | "wishlist" | "account";

/** ===== Build tree từ flat DB rows (giống HeaderPro) ===== */
function buildMenuTree(rows: DbMenuItem[]): NavItem[] {
  const byId = new Map<string, DbMenuItem>();
  rows.forEach((r) => byId.set(r.id, r));

  const childrenMap = new Map<string, DbMenuItem[]>();
  rows.forEach((r) => {
    if (!r.parentId) return;
    const arr = childrenMap.get(r.parentId) ?? [];
    arr.push(r);
    childrenMap.set(r.parentId, arr);
  });

  const roots = rows.filter((r) => !r.parentId).sort((a, b) => a.sortOrder - b.sortOrder);

  const nav: NavItem[] = roots.map((root) => {
    const children = (childrenMap.get(root.id) ?? []).sort((a, b) => a.sortOrder - b.sortOrder);
    return {
      id: root.id,
      label: root.title,
      href: root.path ?? "#",
      iconClass: root.icon ?? undefined,
      hasSub: children.length > 0,
      subItems: children.map((c) => ({
        id: c.id,
        label: c.title,
        href: c.path ?? "#",
        iconClass: c.icon ?? undefined,
      })),
    };
  });

  return nav;
}

/** ===================== UI COMPONENT ===================== */
export const HeaderSimple: React.FC<HeaderSimpleProps> = (props) => {
  const {
    brandName = DEFAULT_HEADER_SIMPLE_PROPS.brandName,
    brandBadge = DEFAULT_HEADER_SIMPLE_PROPS.brandBadge,

    showSearch = DEFAULT_HEADER_SIMPLE_PROPS.showSearch,
    searchPlaceholder = DEFAULT_HEADER_SIMPLE_PROPS.searchPlaceholder,

    showQuickGrid = DEFAULT_HEADER_SIMPLE_PROPS.showQuickGrid,
    cartCount = DEFAULT_HEADER_SIMPLE_PROPS.cartCount,
    userName = DEFAULT_HEADER_SIMPLE_PROPS.userName,
    userTierLabel = DEFAULT_HEADER_SIMPLE_PROPS.userTierLabel,
    userInitials = DEFAULT_HEADER_SIMPLE_PROPS.userInitials,
    showUserShell = DEFAULT_HEADER_SIMPLE_PROPS.showUserShell,

    phone = DEFAULT_HEADER_SIMPLE_PROPS.phone,
    email = DEFAULT_HEADER_SIMPLE_PROPS.email,
    address = DEFAULT_HEADER_SIMPLE_PROPS.address,

    showBottomNav = DEFAULT_HEADER_SIMPLE_PROPS.showBottomNav,

    navItems: navItemsProp,
    autoLoadMenu = DEFAULT_HEADER_SIMPLE_PROPS.autoLoadMenu,
    locale = DEFAULT_HEADER_SIMPLE_PROPS.locale,
    siteId,
    setKey = DEFAULT_HEADER_SIMPLE_PROPS.setKey,

    preview = DEFAULT_HEADER_SIMPLE_PROPS.preview,
  } = props;

  /** ===== State static nav ===== */
  const [activeNav, setActiveNav] = useState<NavKey>("moi-ve");
  const [isBottomOpen, setIsBottomOpen] = useState(false); // mobile toggle bottom nav
  const [openMobileSub, setOpenMobileSub] = useState<string | null>(null); // dùng cho cả static & DB
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>("home");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);

  /** ===== State nav từ DB ===== */
  const [dbNavItems, setDbNavItems] = useState<NavItem[]>(navItemsProp ?? []);
  const [navLoading, setNavLoading] = useState(false);

  useEffect(() => {
    if (!autoLoadMenu) {
      if (navItemsProp) setDbNavItems(navItemsProp);
      return;
    }

    const load = async () => {
      try {
        setNavLoading(true);
        const params = new URLSearchParams();
        params.set("page", "1");
        params.set("size", "200");
        params.set("sort", "sortOrder:asc");
        params.set("locale", locale ?? "en");
        params.set("setKey", setKey ?? "home");
        if (siteId) params.set("siteId", siteId);

        const res = await fetch(`/api/menu-items?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          console.error("HeaderSimple nav load failed", res.status);
          return;
        }

        const data = await res.json();
        const rows: DbMenuItem[] = data?.items ?? [];
        const tree = buildMenuTree(rows);
        setDbNavItems(tree);
      } catch (err) {
        console.error("HeaderSimple nav load error", err);
      } finally {
        setNavLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoadMenu, locale, siteId, setKey, navItemsProp]);

  /** ===== Handlers ===== */
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const input = e.currentTarget.querySelector<HTMLInputElement>(`.${styles.searchInput}`);
    const keyword = input?.value.trim();
    if (preview) {
      console.log("[HeaderSimple preview] Search:", keyword);
      return;
    }
    console.log("[HeaderSimple] Search:", keyword);
  };

  const handleNavClick = (key: NavKey, hasSub: boolean) => (e: React.MouseEvent<HTMLButtonElement>) => {
    const isMobile = typeof window !== "undefined" ? window.innerWidth <= 840 : false;

    if (isMobile && hasSub) {
      e.preventDefault();
      const isOpen = openMobileSub === key;
      setOpenMobileSub(isOpen ? null : key);
      return;
    }

    setActiveNav(key);
  };

  const handleDbNavClick = (id: string, hasSub: boolean) => (e: React.MouseEvent<HTMLButtonElement>) => {
    const isMobile = typeof window !== "undefined" ? window.innerWidth <= 840 : false;

    if (isMobile && hasSub) {
      e.preventDefault();
      const key = `db-${id}`;
      const isOpen = openMobileSub === key;
      setOpenMobileSub(isOpen ? null : key);
      return;
    }

    // desktop: có thể active / điều hướng sau này
    if (preview) {
      e.preventDefault();
      console.log("[HeaderSimple preview] DB nav click", id);
    }
  };

  const handleAvatarClick = () => {
    if (preview) {
      console.log("[HeaderSimple preview] Avatar click");
      return;
    }
    console.log("[HeaderSimple] Avatar click");
  };

  const handleBottomTabClick = (tab: BottomTab) => () => {
    setActiveBottomTab(tab);
  };

  const openMobileSearch = () => {
    if (preview) {
      console.log("[HeaderSimple preview] open mobile search");
      return;
    }
    setIsMobileSearchOpen(true);
  };

  const closeMobileSearch = () => {
    setIsMobileSearchOpen(false);
  };

  return (
    <div className={styles.headerRoot}>
      <header className={styles.headerAurora}>
        <div className={`${styles.headerInner} ${isBottomOpen ? styles.headerInnerOpenBottom : ""}`}>
          {/* TOP ROW */}
          <div className={styles.hdrRowMain}>
            {/* LEFT */}
            <div className={styles.hdrLeft}>
              <div className={styles.hdrLogoPill}>
                <i className="bi bi-stars" />
              </div>
              <div className={styles.hdrBrandText}>
                <div className={styles.hdrBrandMain}>{brandName}</div>
                {brandBadge && (
                  <div className={styles.hdrBrandMain}>
                    <span className={styles.badge}>{brandBadge}</span>
                  </div>
                )}
              </div>
            </div>

            {/* CENTER: SEARCH */}
            {showSearch && (
              <div className={styles.hdrCenter}>
                <form className={styles.hdrSearchShell} onSubmit={handleSearchSubmit}>
                  <div className={styles.hdrSearchInner}>
                    <i className={`bi bi-search ${styles.hdrSearchIconLeft}`} />
                    <div className={styles.hdrSearchMain}>
                      <input className={styles.searchInput} type="text" placeholder={searchPlaceholder} />
                    </div>
                  </div>
                  <button className={styles.hdrSearchBtn} type="submit">
                    <i className="bi bi-search" />
                  </button>
                </form>
              </div>
            )}

            {/* RIGHT */}
            <div className={styles.hdrRight}>
              {showQuickGrid && (
                <button
                  className={styles.hdrQuickGrid}
                  type="button"
                  title="Danh mục"
                  onClick={(e) => {
                    if (preview) {
                      e.preventDefault();
                      console.log("[HeaderSimple preview] quick grid click");
                    }
                  }}
                >
                  <i className="bi bi-grid-3x3-gap" />
                </button>
              )}

              <div className={styles.hdrDivider} />

              <div className={styles.hdrIconGroup}>
                <button
                  className={styles.hdrIconPill}
                  type="button"
                  onClick={(e) => {
                    if (preview) {
                      e.preventDefault();
                      console.log("[HeaderSimple preview] person icon click");
                    }
                  }}
                >
                  <i className="bi bi-person" />
                </button>
                <button
                  className={styles.hdrIconPill}
                  type="button"
                  onClick={(e) => {
                    if (preview) {
                      e.preventDefault();
                      console.log("[HeaderSimple preview] bag icon click");
                      return;
                    }
                  }}
                >
                  <i className="bi bi-bag" />
                  {cartCount && cartCount > 0 && (
                    <span className={styles.badge}>{cartCount > 99 ? "99+" : cartCount}</span>
                  )}
                </button>
              </div>

              {showUserShell && (
                <div className={styles.hdrUserShell}>
                  <div className={styles.hdrUserText}>
                    {userName && <strong>{`Xin chào, ${userName}`}</strong>}
                    {userTierLabel && (
                      <span className={styles.tier}>
                        <i className="bi bi-gem" />
                        {userTierLabel}
                      </span>
                    )}
                  </div>
                  <button className={styles.hdrAvatarWrap} type="button" onClick={handleAvatarClick}>
                    <span className={styles.hdrAvatarInitials}>{userInitials}</span>
                  </button>
                </div>
              )}

              {/* Mobile menu button */}
              <button className={styles.hdrMenuBtn} type="button" onClick={() => setIsBottomOpen((v) => !v)}>
                <i className="bi bi-list" />
              </button>
            </div>
          </div>

          {/* BOTTOM ROW: NAV + CONTACT */}
          <div className={styles.hdrRowBottom}>
            <nav className={styles.hdrNav} aria-label="HeaderSimple navigation">
              {/* Static Aurora menu */}
              <div className={styles.hdrNavItem}>
                <button
                  className={`${styles.hdrNavLink} ${activeNav === "moi-ve" ? styles.hdrNavLinkActive : ""}`}
                  type="button"
                  onClick={handleNavClick("moi-ve", false)}
                >
                  Mới về
                </button>
              </div>

              <div
                className={`${styles.hdrNavItem} ${styles.hasSub} ${openMobileSub === "nu" ? styles.hdrNavItemOpen : ""}`}
              >
                <button
                  className={`${styles.hdrNavLink} ${activeNav === "nu" ? styles.hdrNavLinkActive : ""}`}
                  type="button"
                  onClick={handleNavClick("nu", true)}
                >
                  Nữ
                  <i className={`bi bi-chevron-down ${styles.chevron}`} />
                </button>
                <div className={styles.hdrSubmenu}>
                  <div className={styles.hdrSubmenuGrid}>
                    <div>
                      <div className={styles.hdrSubmenuTitle}>Danh mục</div>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Váy &amp; đầm
                      </button>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Áo blouse &amp; sơ mi
                      </button>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Quần tây &amp; culottes
                      </button>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Chân váy
                      </button>
                    </div>
                    <div>
                      <div className={styles.hdrSubmenuTitle}>BST nổi bật</div>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Office Chic 9–6
                      </button>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Weekend Coffee Date
                      </button>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Soft Girl Street
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={`${styles.hdrNavItem} ${styles.hasSub} ${openMobileSub === "nam" ? styles.hdrNavItemOpen : ""}`}
              >
                <button
                  className={`${styles.hdrNavLink} ${activeNav === "nam" ? styles.hdrNavLinkActive : ""}`}
                  type="button"
                  onClick={handleNavClick("nam", true)}
                >
                  Nam
                  <i className={`bi bi-chevron-down ${styles.chevron}`} />
                </button>
                <div className={styles.hdrSubmenu}>
                  <div className={styles.hdrSubmenuGrid}>
                    <div>
                      <div className={styles.hdrSubmenuTitle}>Danh mục</div>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Áo sơ mi
                      </button>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Áo thun basic
                      </button>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Quần chinos
                      </button>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Jogger &amp; jeans
                      </button>
                    </div>
                    <div>
                      <div className={styles.hdrSubmenuTitle}>Phong cách</div>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Workday Minimal
                      </button>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Smart Casual
                      </button>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Studio Streetwear
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.hdrNavItem}>
                <button
                  className={`${styles.hdrNavLink} ${activeNav === "unisex" ? styles.hdrNavLinkActive : ""}`}
                  type="button"
                  onClick={handleNavClick("unisex", false)}
                >
                  Unisex
                </button>
              </div>

              <div
                className={`${styles.hdrNavItem} ${styles.hasSub} ${openMobileSub === "sale" ? styles.hdrNavItemOpen : ""}`}
              >
                <button
                  className={`${styles.hdrNavLink} ${activeNav === "sale" ? styles.hdrNavLinkActive : ""}`}
                  type="button"
                  onClick={handleNavClick("sale", true)}
                >
                  Sale %
                  <i className={`bi bi-chevron-down ${styles.chevron}`} />
                </button>
                <div className={styles.hdrSubmenu}>
                  <div className={styles.hdrSubmenuGrid}>
                    <div>
                      <div className={styles.hdrSubmenuTitle}>Theo mức giảm</div>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Giảm đến 30%
                      </button>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Giảm đến 50%
                      </button>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Giảm đến 70%
                      </button>
                    </div>
                    <div>
                      <div className={styles.hdrSubmenuTitle}>Ưu đãi</div>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Thành viên Nova
                      </button>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Combo Capsule 3 món
                      </button>
                      <button className={styles.hdrSubmenuLink} type="button">
                        Flash sale 2h tối
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.hdrNavItem}>
                <button
                  className={`${styles.hdrNavLink} ${activeNav === "lookbook" ? styles.hdrNavLinkActive : ""}`}
                  type="button"
                  onClick={handleNavClick("lookbook", false)}
                >
                  Lookbook
                </button>
              </div>

              {/* ===== Nav từ DB ===== */}
              {navLoading && !dbNavItems.length && (
                <div className={styles.hdrNavItem}>
                  <button className={styles.hdrNavLink} type="button" disabled style={{ opacity: 0.7 }}>
                    Đang tải menu...
                  </button>
                </div>
              )}

              {dbNavItems.map((item) => {
                const key = `db-${item.id}`;
                if (!item.hasSub) {
                  return (
                    <div key={item.id} className={styles.hdrNavItem}>
                      <button className={styles.hdrNavLink} type="button" onClick={handleDbNavClick(item.id, false)}>
                        {item.iconClass && <i className={item.iconClass} />}
                        <span>{item.label}</span>
                      </button>
                    </div>
                  );
                }

                return (
                  <div
                    key={item.id}
                    className={`${styles.hdrNavItem} ${styles.hasSub} ${openMobileSub === key ? styles.hdrNavItemOpen : ""}`}
                  >
                    <button className={styles.hdrNavLink} type="button" onClick={handleDbNavClick(item.id, true)}>
                      {item.iconClass && <i className={item.iconClass} />}
                      <span>{item.label}</span>
                      <i className={`bi bi-chevron-down ${styles.chevron}`} style={{ marginLeft: 6 }} />
                    </button>
                    <div className={styles.hdrSubmenu}>
                      <div className={styles.hdrSubmenuList}>
                        {item.subItems.map((sub) => (
                          <button
                            key={sub.id}
                            className={styles.hdrSubmenuLink}
                            type="button"
                            onClick={(e) => {
                              if (preview) {
                                e.preventDefault();
                                console.log("[HeaderSimple preview] DB sub click", sub.href);
                              }
                            }}
                          >
                            {sub.iconClass && <i className={sub.iconClass} />}
                            <span>{sub.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </nav>

            {/* Contact */}
            <div className={styles.hdrContact}>
              {phone && (
                <div className={styles.hdrContactItem}>
                  <i className="bi bi-telephone" />
                  <span>{phone}</span>
                </div>
              )}
              {email && (
                <div className={styles.hdrContactItem}>
                  <i className="bi bi-envelope" />
                  <span>{email}</span>
                </div>
              )}
              {address && (
                <div className={styles.hdrContactItem}>
                  <i className="bi bi-geo-alt" />
                  <span>{address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE SEARCH OVERLAY */}
      <div
        className={`${styles.mobileSearchOverlay} ${isMobileSearchOpen ? styles.mobileSearchOverlayShow : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeMobileSearch();
          }
        }}
      >
        <div className={styles.mobileSearchPanel}>
          <div className={styles.mobileSearchHeader}>
            <span>Tìm kiếm nhanh</span>
            <button className={styles.mobileSearchClose} type="button" onClick={closeMobileSearch}>
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <div className={styles.mobileSearchInput}>
            <i className="bi bi-search" />
            <input type="text" placeholder="Nhập tên sản phẩm, mã item hoặc thương hiệu..." />
          </div>
        </div>
      </div>

      {/* BOTTOM NAV MOBILE */}
      {showBottomNav && (
        <nav className={styles.bottomNav} aria-label="HeaderSimple bottom navigation">
          <div className={styles.bottomNavInner}>
            <button
              className={`${styles.bottomNavItem} ${activeBottomTab === "home" ? styles.bottomNavItemActive : ""}`}
              type="button"
              onClick={handleBottomTabClick("home")}
            >
              <i className="bi bi-house-door" />
              <span>Trang chủ</span>
            </button>

            <button
              className={`${styles.bottomNavItem} ${activeBottomTab === "category" ? styles.bottomNavItemActive : ""}`}
              type="button"
              onClick={handleBottomTabClick("category")}
            >
              <i className="bi bi-grid-3x3-gap" />
              <span>Danh mục</span>
            </button>

            <div className={`${styles.bottomNavItem} ${styles.searchCenter}`}>
              <button className={styles.bottomNavFab} type="button" onClick={openMobileSearch}>
                <i className="bi bi-search" />
              </button>
            </div>

            <button
              className={`${styles.bottomNavItem} ${activeBottomTab === "wishlist" ? styles.bottomNavItemActive : ""}`}
              type="button"
              onClick={handleBottomTabClick("wishlist")}
            >
              <i className="bi bi-heart" />
              <span>Yêu thích</span>
            </button>

            <button
              className={`${styles.bottomNavItem} ${activeBottomTab === "account" ? styles.bottomNavItemActive : ""}`}
              type="button"
              onClick={handleBottomTabClick("account")}
            >
              <i className="bi bi-person" />
              <span>Tài khoản</span>
            </button>
          </div>
        </nav>
      )}
    </div>
  );
};

/** ===== RegItem cho UI Builder ===== */
export const HEADER_SIMPLE_REGITEM: RegItem = {
  kind: "HeaderSimpleKind",
  label: "Header Simple",
  defaults: DEFAULT_HEADER_SIMPLE_PROPS,
  inspector: [],
  render: (p) => <HeaderSimple {...(p as HeaderSimpleProps)} />,
};

export default HeaderSimple;
