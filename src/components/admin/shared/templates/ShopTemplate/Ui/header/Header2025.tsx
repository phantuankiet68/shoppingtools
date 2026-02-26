"use client";

import React, { useEffect, useState, FormEvent } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/header/Header2025.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/** ===== Types DB giống HeaderPro ===== */
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

/** ===== Props ===== */
export interface Header2025Props {
  // Brand
  brandTitle?: string;
  brandSubtitle?: string;

  // Hotline / account / cart
  hotline?: string;
  accountLabel?: string;
  cartText?: string;
  cartCount?: number;

  // Search
  showSearch?: boolean;
  searchPlaceholder?: string;

  // DB menu props
  navItems?: NavItem[];
  autoLoadMenu?: boolean;
  locale?: string;
  siteId?: string;
  setKey?: string;

  // Preview mode (chặn điều hướng / alert thật)
  preview?: boolean;
}

/** ===== Defaults ===== */
const DEFAULT_HEADER_2025_PROPS: Header2025Props = {
  brandTitle: "Aurora Wear",
  brandSubtitle: "Everyday Minimal Street Style",
  hotline: "1900 6868",
  accountLabel: "Đăng nhập",
  cartText: "2 sản phẩm",
  cartCount: 2,

  showSearch: true,
  searchPlaceholder: "Tìm áo, quần, váy, sneaker...",

  autoLoadMenu: true,
  locale: "en",
  setKey: "home",

  preview: false,
};

/** ===== Build tree từ DB (reuse logic HeaderPro) ===== */
function buildMenuTree(rows: DbMenuItem[]): NavItem[] {
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

/** =========================================
 *              COMPONENT
 * ======================================== */
export const Header2025: React.FC<Header2025Props> = (props) => {
  const {
    brandTitle = DEFAULT_HEADER_2025_PROPS.brandTitle,
    brandSubtitle = DEFAULT_HEADER_2025_PROPS.brandSubtitle,

    hotline = DEFAULT_HEADER_2025_PROPS.hotline,
    accountLabel = DEFAULT_HEADER_2025_PROPS.accountLabel,
    cartText = DEFAULT_HEADER_2025_PROPS.cartText,
    cartCount = DEFAULT_HEADER_2025_PROPS.cartCount,

    showSearch = DEFAULT_HEADER_2025_PROPS.showSearch,
    searchPlaceholder = DEFAULT_HEADER_2025_PROPS.searchPlaceholder,

    navItems: navItemsProp,
    autoLoadMenu = DEFAULT_HEADER_2025_PROPS.autoLoadMenu,
    locale = DEFAULT_HEADER_2025_PROPS.locale,
    siteId,
    setKey = DEFAULT_HEADER_2025_PROPS.setKey,

    preview = DEFAULT_HEADER_2025_PROPS.preview,
  } = props;

  /** ===== State: search & gợi ý ===== */
  const [searchValue, setSearchValue] = useState("");
  const [searchCategoryIndex, setSearchCategoryIndex] = useState(0);
  const quickCategories = ["Tất cả", "Áo", "Quần", "Váy / Đầm", "Phụ kiện"];
  const quickTags = ["Áo thun oversize", "Jeans ống rộng", "Áo khoác unisex", "Sneaker trắng"];

  /** ===== State: bottom nav, search popup, mobile nav ===== */
  const [activeBottomTab, setActiveBottomTab] = useState<"home" | "category" | "wishlist" | "account">("home");
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [openMobileNavItemId, setOpenMobileNavItemId] = useState<string | null>(null);

  /** ===== State: menu từ DB ===== */
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
          console.error("Header2025 nav load failed", res.status);
          return;
        }

        const data = await res.json();
        const rows: DbMenuItem[] = data?.items ?? [];
        const tree = buildMenuTree(rows);
        setDbNavItems(tree);
      } catch (err) {
        console.error("Header2025 nav load error", err);
      } finally {
        setNavLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoadMenu, locale, siteId, setKey]);

  /** ===== Handlers ===== */
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const keyword = searchValue.trim();
    if (!keyword) return;

    if (preview) {
      console.log("[Header2025 preview] search:", keyword);
      return;
    }
    console.log("[Header2025] search:", keyword);
  };

  const handleQuickTagClick = (keyword: string) => {
    setSearchValue(keyword);
  };

  const handleCategoryCycle = () => {
    setSearchCategoryIndex((idx) => (idx + 1) % quickCategories.length);
  };

  const handleBottomTabClick = (tab: "home" | "category" | "wishlist" | "account") => {
    setActiveBottomTab(tab);
    if (tab === "category") {
      setIsMobileNavOpen(true);
    }
  };

  const handleFabSearchClick = () => {
    setIsMobileSearchOpen((v) => !v);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeMobileSearch = () => setIsMobileSearchOpen(false);
  const openMobileNav = () => setIsMobileNavOpen(true);
  const closeMobileNav = () => setIsMobileNavOpen(false);

  const handleMobileNavToggleItem = (id: string) => {
    setOpenMobileNavItemId((prev) => (prev === id ? null : id));
  };

  const currentCategory = quickCategories[searchCategoryIndex];

  /** ===== JSX ===== */
  return (
    <div className={`${styles.pageWrapper} ${isMobileSearchOpen ? styles.pageWrapperSearchOpen : ""} ${isMobileNavOpen ? styles.pageWrapperMobileNavOpen : ""}`}>
      <header className={styles.siteHeader}>
        <div className={styles.headerInner}>
          {/* ROW 1 */}
          <div className={styles.headerMain}>
            {/* Brand */}
            <div className={styles.brandBox}>
              <a href="#" className={styles.brandLink} onClick={preview ? (e) => e.preventDefault() : undefined}>
                <div className={styles.brandMark}>A</div>
                <div className={styles.brandTextWrap}>
                  <span className={styles.brandTitle}>{brandTitle}</span>
                  <span className={styles.brandSub}>{brandSubtitle}</span>
                </div>
              </a>
            </div>

            {/* Search */}
            {showSearch && (
              <form className={styles.headerSearch} id="headerSearch" onSubmit={handleSearchSubmit}>
                <div className={styles.searchRow}>
                  <div className={styles.searchBox}>
                    <button className={styles.searchSelect} type="button" onClick={handleCategoryCycle}>
                      <i className="bi bi-grid-3x3-gap" />
                      <span id="searchCategoryLabel">{currentCategory}</span>
                    </button>

                    <div className={styles.searchInputWrap}>
                      <i className="bi bi-search" />
                      <input id="searchInput" type="text" className={styles.searchInput} placeholder={searchPlaceholder} value={searchValue} onChange={(e) => setSearchValue(e.target.value)} />
                    </div>

                    <div className={styles.searchUtils}>
                      <button
                        className={styles.searchIconBtn}
                        type="button"
                        onClick={
                          preview
                            ? (e) => {
                                e.preventDefault();
                                console.log("[Header2025 preview] mic click");
                              }
                            : undefined
                        }>
                        <i className="bi bi-mic" />
                      </button>
                      <button
                        className={styles.searchIconBtn}
                        type="button"
                        onClick={
                          preview
                            ? (e) => {
                                e.preventDefault();
                                console.log("[Header2025 preview] qr click");
                              }
                            : undefined
                        }>
                        <i className="bi bi-qr-code-scan" />
                      </button>
                    </div>
                  </div>

                  <button className={styles.searchSubmit} type="submit" id="searchBtn">
                    <i className="bi bi-arrow-right" />
                    <span>Tìm kiếm</span>
                  </button>
                </div>

                <div className={styles.searchTags}>
                  <span className={styles.searchTagsLabel}>Gợi ý nhanh:</span>
                  {quickTags.map((tag) => (
                    <button key={tag} className={styles.searchTagBtn} type="button" onClick={() => handleQuickTagClick(tag)}>
                      {tag}
                    </button>
                  ))}
                </div>
              </form>
            )}

            {/* Actions */}
            <div className={styles.headerActions}>
              <button
                className={styles.haItem}
                type="button"
                onClick={
                  preview
                    ? (e) => {
                        e.preventDefault();
                        console.log("[Header2025 preview] hotline click");
                      }
                    : undefined
                }>
                <i className="bi bi-headset" />
                <div className={styles.haItemMain}>
                  <span className={styles.haLabel}>Hotline</span>
                  <span className={styles.haValue}>{hotline}</span>
                </div>
              </button>

              <button
                className={styles.haItem}
                type="button"
                onClick={
                  preview
                    ? (e) => {
                        e.preventDefault();
                        console.log("[Header2025 preview] account click");
                      }
                    : undefined
                }>
                <i className="bi bi-person-circle" />
                <div className={styles.haItemMain}>
                  <span className={styles.haLabel}>Xin chào</span>
                  <span className={styles.haValue}>{accountLabel}</span>
                </div>
              </button>

              <button
                className={`${styles.haItem} ${styles.haCart}`}
                type="button"
                onClick={
                  preview
                    ? (e) => {
                        e.preventDefault();
                        console.log("[Header2025 preview] cart click");
                      }
                    : undefined
                }>
                <i className="bi bi-bag-check" />
                <div className={styles.haItemMain}>
                  <span className={styles.haLabel}>Giỏ hàng</span>
                  <span className={styles.haValue}>{cartText}</span>
                </div>
                {typeof cartCount === "number" && cartCount > 0 && <div className={styles.badgeDot}>{cartCount > 99 ? "99+" : cartCount}</div>}
              </button>
            </div>
          </div>

          {/* ROW 2: NAV + FILTERS */}
          <div className={styles.headerNavRow}>
            <div className={styles.navLeft}>
              <button
                className={styles.navPillMain}
                type="button"
                onClick={
                  preview
                    ? (e) => {
                        e.preventDefault();
                        console.log("[Header2025 preview] main collection");
                      }
                    : undefined
                }>
                <i className="bi bi-stars" />
                <div>
                  <span>Bộ sưu tập mới</span>
                </div>
              </button>

              {/* Mobile nav toggle */}
              <button className={styles.navToggle} type="button" id="navToggle" onClick={openMobileNav}>
                <i className="bi bi-list" />
                <span>Menu</span>
              </button>

              {/* Desktop nav links (static + DB) */}
              <nav className={styles.navLinks}>
                <ul className={styles.navLinksList}>
                  {/* Static items */}
                  <li className={styles.navItem}>
                    <button className={`${styles.navLink} ${styles.navLinkActive}`} type="button">
                      <span className={styles.navLinkText}>Hàng mới về</span>
                      <span className={styles.navLabelPill}>New</span>
                    </button>
                  </li>

                  {/* Nữ */}
                  <li className={styles.navItem}>
                    <button className={`${styles.navLink} ${styles.hasSub}`} type="button">
                      <span className={styles.navLinkText}>Nữ</span>
                      <i className={`bi bi-chevron-down ${styles.navCaret}`} />
                    </button>
                    <div className={styles.navSub}>
                      <div className={styles.navSubTitle}>NỮ • STYLE</div>
                      <ul className={styles.navSubList}>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Áo thun basic</span>
                        </li>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Áo sơ mi công sở</span>
                        </li>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Váy &amp; đầm</span>
                        </li>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Quần jeans ống rộng</span>
                        </li>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Set đồ matching</span>
                        </li>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Đồ mặc nhà</span>
                        </li>
                      </ul>
                    </div>
                  </li>

                  {/* Nam */}
                  <li className={styles.navItem}>
                    <button className={`${styles.navLink} ${styles.hasSub}`} type="button">
                      <span className={styles.navLinkText}>Nam</span>
                      <i className={`bi bi-chevron-down ${styles.navCaret}`} />
                    </button>
                    <div className={styles.navSub}>
                      <div className={styles.navSubTitle}>NAM • STREET</div>
                      <ul className={styles.navSubList}>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Áo thun oversize</span>
                        </li>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Áo polo</span>
                        </li>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Áo khoác bomber</span>
                        </li>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Quần jogger</span>
                        </li>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Quần tây slim-fit</span>
                        </li>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Phụ kiện (nón, dây nịt)</span>
                        </li>
                      </ul>
                    </div>
                  </li>

                  {/* Unisex */}
                  <li className={styles.navItem}>
                    <button className={`${styles.navLink} ${styles.hasSub}`} type="button">
                      <span className={styles.navLinkText}>Unisex</span>
                      <i className={`bi bi-chevron-down ${styles.navCaret}`} />
                    </button>
                    <div className={styles.navSub}>
                      <div className={styles.navSubTitle}>UNISEX • DAILY</div>
                      <ul className={styles.navSubList}>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Hoodie</span>
                        </li>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Sweater</span>
                        </li>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Áo khoác gió</span>
                        </li>
                        <li className={styles.navSubLink}>
                          <i className="bi bi-dot" />
                          <span>Set couple</span>
                        </li>
                      </ul>
                    </div>
                  </li>

                  {/* Sale / Lookbook */}
                  <li className={styles.navItem}>
                    <button className={styles.navLink} type="button">
                      <span className={styles.navLinkText}>Sale cuối tuần</span>
                      <span className={styles.navLabelPill} style={{ background: "#fee2e2", color: "#b91c1c" }}>
                        -50%
                      </span>
                    </button>
                  </li>
                  <li className={styles.navItem}>
                    <button className={styles.navLink} type="button">
                      <span className={styles.navLinkText}>Lookbook</span>
                    </button>
                  </li>

                  {/* ===== Menu DB append bên phải ===== */}
                  {navLoading && !dbNavItems.length && (
                    <li className={styles.navItem}>
                      <button type="button" className={styles.navLink} disabled>
                        <span className={styles.navLinkText}>Đang tải menu...</span>
                      </button>
                    </li>
                  )}

                  {dbNavItems.map((item) => (
                    <li key={item.id} className={styles.navItem}>
                      {item.hasSub ? (
                        <>
                          <button className={`${styles.navLink} ${styles.hasSub}`} type="button">
                            <span className={styles.navLinkText}>{item.label}</span>
                            <i className={`bi bi-chevron-down ${styles.navCaret}`} />
                          </button>
                          <div className={styles.navSub}>
                            <div className={styles.navSubTitle}>{item.label}</div>
                            <ul className={styles.navSubList}>
                              {item.subItems.map((sub) => (
                                <li key={sub.id} className={styles.navSubLink}>
                                  <i className="bi bi-dot" />
                                  <span>{sub.label}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <button
                          className={styles.navLink}
                          type="button"
                          onClick={(e) => {
                            if (preview) {
                              e.preventDefault();
                              console.log("[Header2025 preview] DB nav click", item.href);
                            } else if (item.href && item.href !== "#") {
                              window.location.href = item.href;
                            }
                          }}>
                          <span className={styles.navLinkText}>{item.label}</span>
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
            </div>

            {/* Filters bên phải */}
            <div className={styles.navFilters}>
              <button className={styles.filterChip} type="button">
                <i className="bi bi-magic" />
                Outfit đi làm
              </button>
              <button className={styles.filterChip} type="button">
                <i className="bi bi-moon-stars" />
                Đồ chill tối
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* OVERLAY search (mobile) */}
      <div className={styles.searchOverlay} onClick={closeMobileSearch}></div>

      {/* MOBILE NAV PANEL + OVERLAY */}
      <div className={styles.mobileNavOverlay} onClick={closeMobileNav}></div>
      <aside className={styles.mobileNavPanel}>
        <div className={styles.mobileNavHeader}>
          <div>
            <div className={styles.mobileNavTitle}>Aurora Wear</div>
            <div className={styles.mobileNavSubtitle}>Menu nhanh &amp; danh mục</div>
          </div>
          <button className={styles.mobileNavClose} type="button" onClick={closeMobileNav}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
        <div className={styles.mobileNavBody}>
          <div className={styles.mobileNavSectionTitle}>Khám phá</div>
          <ul className={styles.mobileNavList}>
            {/* Static */}
            <li className={styles.mobileNavItem}>
              <button className={styles.mobileNavBtn} type="button">
                <div className={styles.mobileNavBtnMain}>
                  <i className="bi bi-sparkles" />
                  <span>Hàng mới về</span>
                </div>
                <span className={styles.mobileNavBadge}>New</span>
              </button>
            </li>

            {/* Nữ */}
            <li className={`${styles.mobileNavItem} ${openMobileNavItemId === "female" ? styles.mobileNavItemOpen : ""}`}>
              <button className={`${styles.mobileNavBtn} ${styles.mobileToggle}`} type="button" onClick={() => handleMobileNavToggleItem("female")}>
                <div className={styles.mobileNavBtnMain}>
                  <i className="bi bi-gender-female" />
                  <span>Nữ</span>
                </div>
                <i className="bi bi-chevron-down" />
              </button>
              <div className={styles.mobileNavSub}>
                <ul>
                  <li>Áo thun basic</li>
                  <li>Áo sơ mi công sở</li>
                  <li>Váy &amp; đầm</li>
                  <li>Quần jeans ống rộng</li>
                  <li>Set đồ matching</li>
                  <li>Đồ mặc nhà</li>
                </ul>
              </div>
            </li>

            {/* Nam */}
            <li className={`${styles.mobileNavItem} ${openMobileNavItemId === "male" ? styles.mobileNavItemOpen : ""}`}>
              <button className={`${styles.mobileNavBtn} ${styles.mobileToggle}`} type="button" onClick={() => handleMobileNavToggleItem("male")}>
                <div className={styles.mobileNavBtnMain}>
                  <i className="bi bi-gender-male" />
                  <span>Nam</span>
                </div>
                <i className="bi bi-chevron-down" />
              </button>
              <div className={styles.mobileNavSub}>
                <ul>
                  <li>Áo thun oversize</li>
                  <li>Áo polo</li>
                  <li>Áo khoác bomber</li>
                  <li>Quần jogger</li>
                  <li>Quần tây slim-fit</li>
                </ul>
              </div>
            </li>

            {/* Unisex */}
            <li className={`${styles.mobileNavItem} ${openMobileNavItemId === "unisex" ? styles.mobileNavItemOpen : ""}`}>
              <button className={`${styles.mobileNavBtn} ${styles.mobileToggle}`} type="button" onClick={() => handleMobileNavToggleItem("unisex")}>
                <div className={styles.mobileNavBtnMain}>
                  <i className="bi bi-people" />
                  <span>Unisex</span>
                </div>
                <i className="bi bi-chevron-down" />
              </button>
              <div className={styles.mobileNavSub}>
                <ul>
                  <li>Hoodie</li>
                  <li>Sweater</li>
                  <li>Áo khoác gió</li>
                  <li>Set couple</li>
                </ul>
              </div>
            </li>

            {/* Sale + Lookbook */}
            <li className={styles.mobileNavItem}>
              <button className={styles.mobileNavBtn} type="button">
                <div className={styles.mobileNavBtnMain}>
                  <i className="bi bi-ticket-perforated" />
                  <span>Sale cuối tuần</span>
                </div>
                <span className={styles.mobileNavBadge}>-50%</span>
              </button>
            </li>

            <li className={styles.mobileNavItem}>
              <button className={styles.mobileNavBtn} type="button">
                <div className={styles.mobileNavBtnMain}>
                  <i className="bi bi-camera" />
                  <span>Lookbook</span>
                </div>
                <i className="bi bi-chevron-right" />
              </button>
            </li>

            {/* Append menu DB trong mobile */}
            {dbNavItems.length > 0 && (
              <>
                <div className={styles.mobileNavSectionTitle}>Danh mục khác</div>
                {dbNavItems.map((item) => {
                  const id = `db-${item.id}`;
                  if (!item.hasSub) {
                    return (
                      <li key={item.id} className={styles.mobileNavItem}>
                        <button
                          className={styles.mobileNavBtn}
                          type="button"
                          onClick={(e) => {
                            if (preview) {
                              e.preventDefault();
                              console.log("[Header2025 preview] mobile DB nav click", item.href);
                            } else if (item.href && item.href !== "#") {
                              window.location.href = item.href;
                            }
                          }}>
                          <div className={styles.mobileNavBtnMain}>
                            {item.iconClass && <i className={item.iconClass} />}
                            <span>{item.label}</span>
                          </div>
                        </button>
                      </li>
                    );
                  }

                  return (
                    <li key={item.id} className={`${styles.mobileNavItem} ${openMobileNavItemId === id ? styles.mobileNavItemOpen : ""}`}>
                      <button className={`${styles.mobileNavBtn} ${styles.mobileToggle}`} type="button" onClick={() => handleMobileNavToggleItem(id)}>
                        <div className={styles.mobileNavBtnMain}>
                          {item.iconClass && <i className={item.iconClass} />}
                          <span>{item.label}</span>
                        </div>
                        <i className="bi bi-chevron-down" />
                      </button>
                      <div className={styles.mobileNavSub}>
                        <ul>
                          {item.subItems.map((sub) => (
                            <li key={sub.id}>{sub.label}</li>
                          ))}
                        </ul>
                      </div>
                    </li>
                  );
                })}
              </>
            )}
          </ul>

          <div className={styles.mobileNavSectionTitle}>Tài khoản</div>
          <ul className={styles.mobileNavList}>
            <li className={styles.mobileNavItem}>
              <button className={styles.mobileNavBtn} type="button">
                <div className={styles.mobileNavBtnMain}>
                  <i className="bi bi-person-circle" />
                  <span>Đăng nhập / Đăng ký</span>
                </div>
              </button>
            </li>
            <li className={styles.mobileNavItem}>
              <button className={styles.mobileNavBtn} type="button">
                <div className={styles.mobileNavBtnMain}>
                  <i className="bi bi-heart" />
                  <span>Sản phẩm yêu thích</span>
                </div>
              </button>
            </li>
          </ul>
        </div>
      </aside>

      {/* BOTTOM NAV – mobile tab bar */}
      <nav className={styles.bottomNav} aria-label="Aurora Wear navigation">
        <div className={styles.bottomNavInner}>
          <button className={`${styles.bottomNavItem} ${activeBottomTab === "home" ? styles.bottomNavItemActive : ""}`} type="button" onClick={() => handleBottomTabClick("home")}>
            <i className="bi bi-house-door" />
            <span>Trang chủ</span>
          </button>

          <button className={`${styles.bottomNavItem} ${activeBottomTab === "category" ? styles.bottomNavItemActive : ""}`} type="button" onClick={() => handleBottomTabClick("category")}>
            <i className="bi bi-grid-3x3-gap" />
            <span>Danh mục</span>
          </button>

          <div className={styles.bottomNavFabWrap} data-tab="search">
            <button className={styles.bottomNavFab} id="fabSearch" type="button" onClick={handleFabSearchClick}>
              <i className="bi bi-search" />
            </button>
          </div>

          <button className={`${styles.bottomNavItem} ${activeBottomTab === "wishlist" ? styles.bottomNavItemActive : ""}`} type="button" onClick={() => handleBottomTabClick("wishlist")}>
            <i className="bi bi-heart" />
            <span>Yêu thích</span>
          </button>

          <button className={`${styles.bottomNavItem} ${activeBottomTab === "account" ? styles.bottomNavItemActive : ""}`} type="button" onClick={() => handleBottomTabClick("account")}>
            <i className="bi bi-person" />
            <span>Tài khoản</span>
          </button>
        </div>
      </nav>
    </div>
  );
};

/** ===== RegItem cho UI Builder ===== */
export const HEADER_2025_REGITEM: RegItem = {
  kind: "Header2025Kind",
  label: "Header 2025",
  defaults: DEFAULT_HEADER_2025_PROPS,
  inspector: [],
  render: (p) => <Header2025 {...(p as Header2025Props)} />,
};

export default Header2025;
