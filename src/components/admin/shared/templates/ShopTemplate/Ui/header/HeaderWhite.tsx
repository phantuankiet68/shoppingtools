// components/templates/ShopTemplate/Ui/topbar/HeaderWhite.tsx
"use client";

import React, { useState, useEffect, FormEvent, MouseEvent } from "react";

import styles from "@/components/admin/templates/ShopTemplate/styles/header/HeaderWhite.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/** ===== Types từ DB (reuse từ HeaderPro) ===== */
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

/** ===== Types cho nav (phần lấy từ DB) ===== */
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

/** ===== Props HeaderWhite ===== */
export interface HeaderWhiteProps {
  // Logo
  logoLeftText?: string; // "Aurora"
  logoRightText?: string; // "Wear"
  logoSubtitle?: string; // "Everyday Fashion & Style"

  // Search
  showSearch?: boolean;
  searchPlaceholder?: string;
  showSearchFilterChip?: boolean;
  searchFilterLabel?: string;

  // Top links
  quickOutfitLabel?: string;
  blogLabel?: string;
  loginLabel?: string;

  // Bottom nav cart badge
  bottomCartCount?: number;

  // Nav từ props (override, dùng khi không muốn load API)
  navItems?: NavItem[];

  // Tự động load menu từ API (giống HeaderPro)
  autoLoadMenu?: boolean;
  locale?: string;
  siteId?: string;
  setKey?: string; // mặc định "home"

  // Preview mode (chặn hành vi điều hướng / submit)
  preview?: boolean;
}

/** ===== DEFAULTS ===== */
const DEFAULT_HEADER_WHITE_PROPS: HeaderWhiteProps = {
  logoLeftText: "Aurora",
  logoRightText: "Wear",
  logoSubtitle: "Everyday Fashion & Style",

  showSearch: true,
  searchPlaceholder: "Tìm áo blazer, đầm dự tiệc, quần jean, set phối sẵn...",
  showSearchFilterChip: true,
  searchFilterLabel: "Lọc nhanh",

  quickOutfitLabel: "Nhìn nhanh outfit",
  blogLabel: "Blog mix & match",
  loginLabel: "Đăng nhập",

  bottomCartCount: 2,

  autoLoadMenu: true,
  locale: "en",
  setKey: "home",

  preview: false,
};

type BottomTabId = "home" | "category" | "style" | "wish" | "cart";

/** ===== Build tree từ flat DB rows (copy từ HeaderPro) ===== */
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
export const HeaderWhite: React.FC<HeaderWhiteProps> = (props) => {
  const {
    logoLeftText = DEFAULT_HEADER_WHITE_PROPS.logoLeftText,
    logoRightText = DEFAULT_HEADER_WHITE_PROPS.logoRightText,
    logoSubtitle = DEFAULT_HEADER_WHITE_PROPS.logoSubtitle,

    showSearch = DEFAULT_HEADER_WHITE_PROPS.showSearch,
    searchPlaceholder = DEFAULT_HEADER_WHITE_PROPS.searchPlaceholder,
    showSearchFilterChip = DEFAULT_HEADER_WHITE_PROPS.showSearchFilterChip,
    searchFilterLabel = DEFAULT_HEADER_WHITE_PROPS.searchFilterLabel,

    quickOutfitLabel = DEFAULT_HEADER_WHITE_PROPS.quickOutfitLabel,
    blogLabel = DEFAULT_HEADER_WHITE_PROPS.blogLabel,
    loginLabel = DEFAULT_HEADER_WHITE_PROPS.loginLabel,

    bottomCartCount = DEFAULT_HEADER_WHITE_PROPS.bottomCartCount,

    navItems: navItemsProp,
    autoLoadMenu = DEFAULT_HEADER_WHITE_PROPS.autoLoadMenu,
    locale = DEFAULT_HEADER_WHITE_PROPS.locale,
    siteId,
    setKey = DEFAULT_HEADER_WHITE_PROPS.setKey,

    preview = DEFAULT_HEADER_WHITE_PROPS.preview,
  } = props;

  /** ===== State: nav (từ DB) ===== */
  const [navItems, setNavItems] = useState<NavItem[]>(navItemsProp ?? []);
  const [navLoading, setNavLoading] = useState(false);

  useEffect(() => {
    if (!autoLoadMenu) {
      if (navItemsProp) setNavItems(navItemsProp);
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
          console.error("HeaderWhite nav load failed", res.status);
          return;
        }

        const data = await res.json();
        const rows: DbMenuItem[] = data?.items ?? [];
        const tree = buildMenuTree(rows);
        if (tree.length) {
          setNavItems(tree);
        }
      } catch (err) {
        console.error("HeaderWhite nav load error", err);
      } finally {
        setNavLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoadMenu, locale, siteId, setKey]);

  /** ===== State khác ===== */
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openDesktopSub, setOpenDesktopSub] = useState<string | null>(null);
  const [isDrawerCollectionsOpen, setIsDrawerCollectionsOpen] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTabId>("home");

  /** ===== Handlers ===== */
  const toggleDrawer = () => {
    if (preview) return;
    setIsDrawerOpen((v) => !v);
  };

  const closeDrawer = () => {
    setIsDrawerOpen(false);
    setIsDrawerCollectionsOpen(false);
  };

  const toggleDesktopSub = (id: string) => {
    setOpenDesktopSub((prev) => (prev === id ? null : id));
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (preview) return;
    const input = e.currentTarget.querySelector<HTMLInputElement>(`.${styles.searchInput}`);
    console.log("Search:", input?.value);
  };

  const handleBottomTabClick = (id: BottomTabId) => () => {
    if (preview) return;
    setActiveBottomTab(id);
  };

  const handleNavLinkClick = (href?: string) => (e: MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (preview || !href || href === "#") {
      e.preventDefault();
      return;
    }
  };

  /** =================== RENDER =================== */
  return (
    <>
      {/* overlay cho nav mobile */}
      <div
        className={`${styles.navOverlay} ${isDrawerOpen ? styles.navOverlayShow : ""}`}
        onClick={() => {
          if (preview) return;
          closeDrawer();
        }}></div>

      {/* NAV DRAWER MOBILE */}
      <aside className={`${styles.navDrawer} ${isDrawerOpen ? styles.navDrawerOpen : ""}`}>
        <div className={styles.drawerHeader}>
          <div>
            <div className={styles.logoText}>
              {logoLeftText}
              <span className={styles.logoAccent}></span>
              {logoRightText}
            </div>
            <div className={styles.logoSub}>Modern Fashion Store</div>
          </div>
          <button
            className={styles.drawerClose}
            aria-label="Đóng menu"
            type="button"
            onClick={() => {
              if (preview) return;
              closeDrawer();
            }}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.drawerDivider}></div>

        <button className={styles.drawerNavItem} type="button" disabled={preview}>
          <span className={styles.drawerNavLeft}>
            <i className="bi bi-house-door" />
            Trang chủ
          </span>
        </button>

        <button className={styles.drawerNavItem} type="button" disabled={preview}>
          <span className={styles.drawerNavLeft}>
            <i className="bi bi-fire" />
            New arrivals
          </span>
        </button>

        <button className={styles.drawerNavItem} type="button" disabled={preview}>
          <span className={styles.drawerNavLeft}>
            <i className="bi bi-stars" />
            Best sellers
          </span>
        </button>

        <button
          className={styles.drawerNavItem}
          type="button"
          onClick={() => {
            if (preview) return;
            setIsDrawerCollectionsOpen((v) => !v);
          }}>
          <span className={styles.drawerNavLeft}>
            <i className="bi bi-layers" />
            Bộ sưu tập
          </span>
          <i className={`bi ${isDrawerCollectionsOpen ? "bi-chevron-up" : "bi-chevron-down"}`} />
        </button>

        <div className={`${styles.drawerSub} ${isDrawerCollectionsOpen ? styles.drawerSubOpen : ""}`}>
          <ul>
            <li>
              <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                Workwear &amp; Office
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                Party &amp; Night Out
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                Streetwear / Y2K
              </a>
            </li>
            <li>
              <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                Minimal Chic
              </a>
            </li>
          </ul>
        </div>

        <div className={styles.drawerDivider}></div>

        <button className={styles.drawerNavItem} type="button" disabled={preview}>
          <span className={styles.drawerNavLeft}>
            <i className="bi bi-person" />
            Tài khoản của tôi
          </span>
        </button>
        <button className={styles.drawerNavItem} type="button" disabled={preview}>
          <span className={styles.drawerNavLeft}>
            <i className="bi bi-heart" />
            Danh sách yêu thích
          </span>
        </button>
        <button className={styles.drawerNavItem} type="button" disabled={preview}>
          <span className={styles.drawerNavLeft}>
            <i className="bi bi-bag" />
            Giỏ hàng
          </span>
        </button>
      </aside>

      {/* HEADER DESKTOP / TABLET */}
      <header className={styles.siteHeader}>
        <div className={styles.headerShell}>
          <div className={styles.headerInner}>
            {/* MAIN ROW */}
            <div className={styles.mainRow}>
              {/* logo + menu toggle */}
              <div className={styles.brandWrap}>
                <div>
                  <div className={styles.logoText}>
                    {logoLeftText}
                    <span className={styles.logoAccent}></span>
                    {logoRightText}
                  </div>
                  <div className={styles.logoSub}>{logoSubtitle}</div>
                </div>

                <button
                  className={styles.menuToggle}
                  type="button"
                  aria-label="Mở menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleDrawer();
                  }}>
                  <i className="bi bi-list" />
                </button>
              </div>

              {/* search */}
              {showSearch && (
                <div className={styles.searchWrap}>
                  <form className={styles.searchPill} onSubmit={handleSearchSubmit}>
                    <div className={styles.searchIcon}>
                      <i className="bi bi-search" />
                    </div>
                    <input type="text" className={styles.searchInput} placeholder={searchPlaceholder} />
                    {showSearchFilterChip && (
                      <button
                        type="button"
                        className={styles.searchExtra}
                        onClick={(e) => {
                          if (preview) {
                            e.preventDefault();
                            e.stopPropagation();
                            return;
                          }
                        }}>
                        <i className="bi bi-funnel" />
                        {searchFilterLabel}
                      </button>
                    )}
                  </form>
                </div>
              )}

              {/* top links */}
              <div className={styles.topLinks}>
                <button
                  className={styles.topLink}
                  type="button"
                  onClick={(e) => {
                    if (preview) {
                      e.preventDefault();
                      return;
                    }
                  }}>
                  <i className="bi bi-grid-3x3-gap" />
                  <span>{quickOutfitLabel}</span>
                </button>

                <button
                  className={styles.topLink}
                  type="button"
                  onClick={(e) => {
                    if (preview) {
                      e.preventDefault();
                      return;
                    }
                  }}>
                  <i className="bi bi-journal-text" />
                  <span>{blogLabel}</span>
                </button>

                <div className={styles.topSep}></div>

                <button
                  className={styles.topLink}
                  type="button"
                  onClick={(e) => {
                    if (preview) {
                      e.preventDefault();
                      return;
                    }
                  }}>
                  <i className="bi bi-person" />
                  <span>{loginLabel}</span>
                </button>

                <button
                  className={styles.iconBtn}
                  title="Yêu thích"
                  type="button"
                  onClick={(e) => {
                    if (preview) {
                      e.preventDefault();
                      return;
                    }
                  }}>
                  <i className="bi bi-heart" />
                </button>
                <button
                  className={styles.iconBtn}
                  title="Giỏ hàng"
                  type="button"
                  onClick={(e) => {
                    if (preview) {
                      e.preventDefault();
                      return;
                    }
                  }}>
                  <i className="bi bi-bag" />
                </button>
              </div>
            </div>

            {/* NAV ROW (categories static + từ DB) */}
            <nav className={styles.navRow} aria-label="Aurora Wear desktop navigation">
              {/* Static Aurora nav items */}
              <button className={`${styles.navItem} ${styles.navItemPrimary}`} type="button" disabled={preview}>
                New arrivals
              </button>
              <button className={styles.navItem} type="button" disabled={preview}>
                Best sellers
              </button>
              <button className={styles.navItem} type="button" disabled={preview}>
                Sale đến -50%
              </button>

              {/* Trang phục nữ */}
              <div
                className={`${styles.navItem} ${styles.navItemHasSub} ${openDesktopSub === "clothing" ? styles.navItemOpen : ""}`}
                onClick={() => {
                  if (preview) return;
                  toggleDesktopSub("clothing");
                }}>
                Trang phục nữ
                <i className={`bi bi-chevron-down ${styles.navCaret}`} />
                <div className={styles.submenu}>
                  <div>
                    <div className={styles.subTitle}>DRESSES</div>
                    <ul className={styles.subList}>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Đầm công sở
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Đầm dự tiệc
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Slip dress
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className={styles.subTitle}>TOPS</div>
                    <ul className={styles.subList}>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Áo sơ mi
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Áo thun basic
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Áo croptop
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className={styles.subTitle}>BOTTOMS</div>
                    <ul className={styles.subList}>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Quần jean
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Quần tây ống rộng
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Chân váy midi
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Áo khoác & Layer */}
              <div
                className={`${styles.navItem} ${styles.navItemHasSub} ${openDesktopSub === "outer" ? styles.navItemOpen : ""}`}
                onClick={() => {
                  if (preview) return;
                  toggleDesktopSub("outer");
                }}>
                Áo khoác &amp; Layer
                <i className={`bi bi-chevron-down ${styles.navCaret}`} />
                <div className={styles.submenu}>
                  <div>
                    <div className={styles.subTitle}>OUTERWEAR</div>
                    <ul className={styles.subList}>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Blazer
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Áo khoác trench
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Cardigan len
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className={styles.subTitle}>SEASONAL</div>
                    <ul className={styles.subList}>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Áo khoác dạ
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Áo phao
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Áo khoác mỏng
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className={styles.subTitle}>STYLE SET</div>
                    <ul className={styles.subList}>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Set vest nguyên bộ
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Set phối sẵn
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Phụ kiện */}
              <div
                className={`${styles.navItem} ${styles.navItemHasSub} ${openDesktopSub === "accessory" ? styles.navItemOpen : ""}`}
                onClick={() => {
                  if (preview) return;
                  toggleDesktopSub("accessory");
                }}>
                Phụ kiện
                <i className={`bi bi-chevron-down ${styles.navCaret}`} />
                <div className={styles.submenu}>
                  <div>
                    <div className={styles.subTitle}>BAGS</div>
                    <ul className={styles.subList}>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Túi kẹp nách
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Túi đeo chéo
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Mini bag <span className={styles.subTag}>New</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className={styles.subTitle}>SHOES</div>
                    <ul className={styles.subList}>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Giày cao gót
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Giày búp bê
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Boots
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className={styles.subTitle}>JEWELRY</div>
                    <ul className={styles.subList}>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Khuyên tai
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Vòng cổ
                        </a>
                      </li>
                      <li>
                        <a href="#" onClick={(e) => (preview ? e.preventDefault() : undefined)}>
                          Nhẫn / bracelet
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <button className={styles.navItem} type="button" disabled={preview}>
                Bộ sưu tập Lookbook
              </button>

              {/* Nav từ DB (HeaderPro style, nhưng dùng style Aurora) */}
              {navLoading && !navItems.length && (
                <button className={styles.navItem} type="button" disabled style={{ opacity: 0.7 }}>
                  Đang tải menu...
                </button>
              )}

              {navItems.map((item) => {
                if (!item.hasSub) {
                  return (
                    <button key={item.id} className={styles.navItem} type="button" onClick={handleNavLinkClick(item.href)}>
                      {item.iconClass && <i className={item.iconClass} />}
                      <span>{item.label}</span>
                    </button>
                  );
                }

                // Với item có sub, đơn giản chỉ render 1 nút + dropdown nhỏ dạng list
                return (
                  <div
                    key={item.id}
                    className={`${styles.navItem} ${styles.navItemHasSub}`}
                    // nếu muốn mở submenu theo state riêng thì có thể bổ sung sau
                  >
                    <button type="button" className={styles.navItem} onClick={handleNavLinkClick(item.href)}>
                      {item.iconClass && <i className={item.iconClass} />}
                      <span>{item.label}</span>
                    </button>
                  </div>
                );
              })}

              <div className={styles.navSpacer}></div>
            </nav>
          </div>
        </div>
      </header>

      {/* BOTTOM NAV MOBILE */}
      <nav className={styles.bottomNav} aria-label="Aurora Wear navigation">
        <div className={styles.bottomInner}>
          <button className={`${styles.bottomItem} ${activeBottomTab === "home" ? styles.bottomItemActive : ""}`} type="button" onClick={handleBottomTabClick("home")}>
            <i className="bi bi-house-door" />
            <span>Trang chủ</span>
          </button>
          <button className={`${styles.bottomItem} ${activeBottomTab === "category" ? styles.bottomItemActive : ""}`} type="button" onClick={handleBottomTabClick("category")}>
            <i className="bi bi-grid-3x3-gap" />
            <span>Danh mục</span>
          </button>
          <button className={`${styles.bottomItem} ${activeBottomTab === "style" ? styles.bottomItemActive : ""}`} type="button" onClick={handleBottomTabClick("style")}>
            <i className="bi bi-stars" />
            <span>Style feed</span>
          </button>
          <button className={`${styles.bottomItem} ${activeBottomTab === "wish" ? styles.bottomItemActive : ""}`} type="button" onClick={handleBottomTabClick("wish")}>
            <i className="bi bi-heart" />
            <span>Yêu thích</span>
          </button>
          <button className={`${styles.bottomItem} ${styles.bottomItemCart} ${activeBottomTab === "cart" ? styles.bottomItemActive : ""}`} type="button" onClick={handleBottomTabClick("cart")}>
            <i className="bi bi-bag" />
            <span>Giỏ hàng</span>
            {bottomCartCount && bottomCartCount > 0 && <span className={styles.bottomBadge}>{bottomCartCount}</span>}
          </button>
        </div>
      </nav>
    </>
  );
};

/** ===== RegItem cho UI Builder ===== */
export const HEADER_WHITE_REGITEM: RegItem = {
  kind: "HeaderWhiteKind",
  label: "Header White",
  defaults: DEFAULT_HEADER_WHITE_PROPS,
  inspector: [], // editor sẽ map riêng
  render: (p) => <HeaderWhite {...(p as HeaderWhiteProps)} />,
};

export default HeaderWhite;
