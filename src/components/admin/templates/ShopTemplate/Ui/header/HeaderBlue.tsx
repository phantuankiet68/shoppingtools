"use client";

import React, { useState, useEffect, useRef, FormEvent, MouseEvent } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/header/HeaderBlue.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ===========================
   Types cho menu (theo spec)
=========================== */

export type DbMenuItem = {
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

export type NavSubItem = {
  id: string;
  label: string;
  href: string;
  iconClass?: string;
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  iconClass?: string;
  hasSub: boolean;
  subItems: NavSubItem[];
};

export function buildMenuTree(rows: DbMenuItem[]): NavItem[] {
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

/* ===========================
   Props
=========================== */

export type HeaderBlueProps = {
  // Branding
  logoText?: string;
  brandName?: string;
  brandLocationPrefix?: string;
  brandLocationText?: string;

  // Search
  searchPlaceholder?: string;
  searchQuickTitle?: string;
  searchQuickChips?: string[];
  searchCategoryOptions?: string[];

  // Actions / labels
  orderCenterLabel?: string;
  accountLabel?: string;
  supportLabel?: string;
  cartLabel?: string;

  // Bottom nav labels
  bottomNavHomeLabel?: string;
  bottomNavCategoryLabel?: string;
  bottomNavStyleLabel?: string;
  bottomNavCartLabel?: string;
  bottomNavAccountLabel?: string;

  // Cart
  cartInitialCount?: number;

  // Menu
  navItems?: NavItem[];
  autoLoadMenu?: boolean;
  locale?: string;
  siteId?: string;
  setKey?: string;

  // Preview mode
  preview?: boolean;

  // Callbacks
  onSearch?: (query: string) => void;
  onClickStatus?: () => void;
  onClickSupport?: () => void;
  onClickAccount?: () => void;
  onClickCart?: () => void;
};

export const DEFAULT_AURORA_HEADER_COMPONENT_PROPS: HeaderBlueProps = {
  logoText: "AW",
  brandName: "AURORA WARDROBE",
  brandLocationPrefix: "Cửa hàng online",
  brandLocationText: "VN",

  searchPlaceholder: "Tìm áo, quần, váy, giày hoặc bộ sưu tập...",
  searchQuickTitle: "Gợi ý nhanh hôm nay",
  searchQuickChips: ["Flash Sale áo khoác xanh", "Bộ sưu tập NEW ARRIVAL", "Set đồ được yêu thích nhất", "Outfit đi làm tối giản", "Mix đồ đi biển"],
  searchCategoryOptions: ["Tất cả danh mục", "Thời trang nữ", "Thời trang nam", "Giày & phụ kiện", "Bộ sưu tập mới"],

  orderCenterLabel: "Trung tâm đơn hàng",
  accountLabel: "Tài khoản",
  supportLabel: "Hỗ trợ",
  cartLabel: "Giỏ hàng",

  bottomNavHomeLabel: "Trang chủ",
  bottomNavCategoryLabel: "Danh mục",
  bottomNavStyleLabel: "Mix đồ",
  bottomNavCartLabel: "Giỏ hàng",
  bottomNavAccountLabel: "Tài khoản",

  cartInitialCount: 2,

  // Menu
  navItems: [],
  autoLoadMenu: true,
  locale: "vi",
  setKey: "home",
  siteId: undefined,

  preview: false,

  onSearch: undefined,
  onClickStatus: undefined,
  onClickSupport: undefined,
  onClickAccount: undefined,
  onClickCart: undefined,
};

/* ===========================
   Component
=========================== */

const HeaderBlue: React.FC<HeaderBlueProps> = (props) => {
  const {
    logoText = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.logoText,
    brandName = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.brandName,
    brandLocationPrefix = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.brandLocationPrefix,
    brandLocationText = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.brandLocationText,

    searchPlaceholder = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.searchPlaceholder,
    searchQuickTitle = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.searchQuickTitle,
    searchQuickChips = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.searchQuickChips,
    searchCategoryOptions = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.searchCategoryOptions,

    orderCenterLabel = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.orderCenterLabel,
    accountLabel = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.accountLabel,
    supportLabel = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.supportLabel,
    cartLabel = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.cartLabel,

    bottomNavHomeLabel = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.bottomNavHomeLabel,
    bottomNavCategoryLabel = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.bottomNavCategoryLabel,
    bottomNavStyleLabel = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.bottomNavStyleLabel,
    bottomNavCartLabel = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.bottomNavCartLabel,
    bottomNavAccountLabel = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.bottomNavAccountLabel,

    cartInitialCount = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.cartInitialCount,

    navItems: navItemsProp = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.navItems,
    autoLoadMenu = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.autoLoadMenu,
    locale = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.locale,
    siteId = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.siteId,
    setKey = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.setKey,

    preview = DEFAULT_AURORA_HEADER_COMPONENT_PROPS.preview,

    onSearch,
    onClickStatus,
    onClickSupport,
    onClickAccount,
    onClickCart,
  } = props;

  // Sticky header
  const [isStuck, setIsStuck] = useState(false);

  // Nav load
  const [navItems, setNavItems] = useState<NavItem[]>(navItemsProp ?? []);
  const [navLoading, setNavLoading] = useState(false);

  // Search
  const [searchValue, setSearchValue] = useState("");
  const [suggestOpen, setSuggestOpen] = useState(false);

  // Category
  const [categoryIndex, setCategoryIndex] = useState(0);

  // Mobile nav open
  const [navOpen, setNavOpen] = useState(false);

  // Bottom nav active tab
  const [activeBottomTab, setActiveBottomTab] = useState<"home" | "category" | "style" | "cart" | "account">("home");

  // Cart count
  const [cartCount, setCartCount] = useState<number>(cartInitialCount ?? 0);

  const headerRef = useRef<HTMLElement | null>(null);
  const searchSuggestRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  /* ===========================
     Effect: Sticky header
  ============================ */
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setIsStuck(y > 24);
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ===========================
     Effect: Outside click for suggest
  ============================ */
  useEffect(() => {
    const handleClick = (e: MouseEvent | globalThis.MouseEvent) => {
      const target = e.target as Node | null;
      if (!suggestOpen) return;
      if (searchSuggestRef.current && !searchSuggestRef.current.contains(target as Node) && searchInputRef.current && target !== searchInputRef.current) {
        setSuggestOpen(false);
      }
    };

    document.addEventListener("click", handleClick as any);
    return () => document.removeEventListener("click", handleClick as any);
  }, [suggestOpen]);

  /* ===========================
     Effect: Auto load menu
  ============================ */
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
        params.set("locale", locale ?? "vi");
        params.set("setKey", setKey ?? "home");
        if (siteId) params.set("siteId", siteId);

        const res = await fetch(`/api/menu-items?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          console.error("HeaderBlue nav load failed", res.status);
          return;
        }

        const data = await res.json();
        const rows: DbMenuItem[] = data?.items ?? [];
        const tree = buildMenuTree(rows);
        if (tree.length) {
          setNavItems(tree);
        }
      } catch (err) {
        console.error("HeaderBlue nav load error", err);
      } finally {
        setNavLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoadMenu, locale, siteId, setKey, navItemsProp]);

  /* ===========================
     Handlers
  ============================ */

  const handleAnchorClick = (href?: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (preview || !href || href === "#") {
      e.preventDefault();
      return;
    }
    // SPA routing (nếu có) xử lý bên ngoài component
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (preview) return;
    const q = searchValue.trim();
    onSearch?.(q);
  };

  const handleCategoryClick = () => {
    if (!searchCategoryOptions || !searchCategoryOptions.length) return;
    const nextIndex = (categoryIndex + 1) % searchCategoryOptions.length;
    setCategoryIndex(nextIndex);
  };

  const handleStatusClick = () => {
    if (preview) return;
    onClickStatus?.();
  };

  const handleSupportClick = () => {
    if (preview) return;
    onClickSupport?.();
  };

  const handleAccountClick = () => {
    if (preview) return;
    onClickAccount?.();
  };

  const handleCartClick = () => {
    if (preview) return;
    setCartCount((c) => c + 1);
    onClickCart?.();
  };

  const handleBottomNavClick = (tab: "home" | "category" | "style" | "cart" | "account") => {
    if (preview) {
      setActiveBottomTab(tab);
      return;
    }
    setActiveBottomTab(tab);
    // Hành vi điều hướng/scroll thực tế xử lý bên ngoài (SPA routing)
  };

  const currentCategoryLabel = searchCategoryOptions && searchCategoryOptions.length ? searchCategoryOptions[categoryIndex] : undefined;

  /* ===========================
     Render
  ============================ */

  return (
    <>
      <header ref={headerRef} className={isStuck ? `${styles["site-header"]} ${styles["is-stuck"]}` : styles["site-header"]} id="siteHeader">
        <div className={styles["header-shell"]}>
          <div className={navOpen ? `${styles["header-inner"]} ${styles["nav-open"]}` : styles["header-inner"]} id="headerInner">
            {/* ROW TOP */}
            <div className={styles["header-row-top"]}>
              {/* Logo + brand */}
              <div className={styles["brand-block"]}>
                <a href="#home" onClick={handleAnchorClick("#home")}>
                  <div className={styles["brand-mark"]}>
                    <div className={styles["brand-mark-inner"]}>{logoText}</div>
                  </div>
                </a>
                <div className={styles["brand-meta"]}>
                  <div className={styles["brand-name"]}>{brandName}</div>
                  <div className={styles["brand-loc"]}>
                    <i className="bi bi-geo-alt" />
                    <span>
                      {brandLocationPrefix} • {brandLocationText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Search */}
              <form className={styles["search-block"]} onSubmit={handleSearchSubmit}>
                {currentCategoryLabel && (
                  <button type="button" className={styles["search-category"]} id="btnCategory" onClick={handleCategoryClick}>
                    <i className="bi bi-grid-3x3-gap" />
                    <span id="categoryLabel">{currentCategoryLabel}</span>
                    <i className="bi bi-chevron-down" />
                  </button>
                )}

                <div className={styles["search-input-wrap"]}>
                  <input
                    ref={searchInputRef}
                    type="text"
                    id="searchInput"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onFocus={() => setSuggestOpen(true)}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  <div className={styles["search-actions"]}>
                    <button
                      type="button"
                      className={styles["btn-icon"]}
                      id="btnMic"
                      title="Tìm bằng giọng nói"
                      onClick={(e) => {
                        if (preview) {
                          e.preventDefault();
                          return;
                        }
                        // mở tìm kiếm voice - xử lý bên ngoài nếu cần
                      }}>
                      <i className="bi bi-mic" />
                    </button>
                    <button
                      type="button"
                      className={styles["btn-icon"]}
                      id="btnScan"
                      title="Quét mã / QR"
                      onClick={(e) => {
                        if (preview) {
                          e.preventDefault();
                          return;
                        }
                        // mở quét mã / QR - xử lý bên ngoài nếu cần
                      }}>
                      <i className="bi bi-qr-code-scan" />
                    </button>
                    <button type="submit" className={styles["btn-search"]} id="btnSearch">
                      <i className="bi bi-search" />
                      Tìm kiếm
                    </button>
                  </div>
                </div>

                {/* Suggest */}
                <div className={suggestOpen ? `${styles["search-suggest"]} ${styles["visible"]}` : styles["search-suggest"]} id="searchSuggest" ref={searchSuggestRef}>
                  <div className={styles["suggest-row-title"]}>{searchQuickTitle}</div>
                  <div className={styles["suggest-chips"]} id="suggestChips">
                    {(searchQuickChips ?? []).map((chip) => (
                      <button
                        key={chip}
                        type="button"
                        className={styles["suggest-chip"]}
                        onClick={() => {
                          setSearchValue(chip);
                          searchInputRef.current?.focus();
                        }}>
                        <i className="bi bi-stars" />
                        {chip}
                      </button>
                    ))}
                  </div>
                </div>
              </form>

              {/* Actions */}
              <div className={styles["header-actions"]}>
                <button type="button" className={styles["action-pill"]} id="btnStatus" onClick={handleStatusClick}>
                  <i className="bi bi-activity" />
                  <span>{orderCenterLabel}</span>
                </button>

                <div className={styles["action-group-icons"]}>
                  <div className={styles["icon-with-label"]}>
                    <button type="button" className={styles["icon-box"]} id="btnAccount" onClick={handleAccountClick}>
                      <i className="bi bi-person-circle" />
                      <div className={styles["icon-label"]}>{accountLabel}</div>
                    </button>
                  </div>
                  <button type="button" className={styles["btn-menu-mobile"]} id="btnMenuMobile" onClick={() => setNavOpen((v) => !v)}>
                    <i className="bi bi-list" />
                  </button>
                </div>
              </div>
            </div>

            {/* ROW NAV */}
            <div className={styles["header-row-nav"]}>
              <nav className={styles["nav-main"]} aria-label="Main navigation">
                <button type="button" className={styles["nav-all"]} id="btnAllCat">
                  <i className="bi bi-grid-fill" />
                  <span>Tất cả danh mục</span>
                </button>

                <div className={styles["nav-list"]}>
                  {navLoading && !navItems.length && (
                    <div className={styles["nav-item"]}>
                      <span>Đang tải menu...</span>
                    </div>
                  )}

                  {navItems.map((item) => {
                    const hasSub = item.hasSub && item.subItems?.length > 0;
                    return (
                      <div key={item.id} className={hasSub ? `${styles["nav-item"]} ${styles["has-sub"]}` : styles["nav-item"]}>
                        <a href={item.href} onClick={handleAnchorClick(item.href)}>
                          {item.label}
                        </a>
                        {hasSub && (
                          <>
                            <i className={`bi bi-chevron-down ${styles["nav-item-arrow"]}`} />
                            <div className={styles["sub-menu"]}>
                              <div className={styles["sub-menu-row-title"]}>{item.label}</div>
                              <div className={styles["sub-menu-grid"]}>
                                {item.subItems.map((sub) => (
                                  <a key={sub.id} href={sub.href} onClick={handleAnchorClick(sub.href)}>
                                    {sub.label}
                                  </a>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </nav>

              <div className={styles["nav-tags"]}>
                <div className={styles["icon-box-list"]}>
                  <div className={styles["icon-with-label"]}>
                    <button type="button" className={styles["icon-box-help"]} id="btnSupport" onClick={handleSupportClick}>
                      <i className="bi bi-chat-dots" />
                      <span className={styles["icon-badge"]}>3</span>
                      <div className={styles["icon-label"]}>{supportLabel}</div>
                    </button>
                  </div>
                  <div className={styles["icon-with-label"]}>
                    <button type="button" className={styles["icon-box-market"]} id="btnCart" onClick={handleCartClick}>
                      <i className="bi bi-basket2" />
                      <span className={styles["icon-badge"]}>{cartCount}</span>
                      <div className={styles["icon-label"]}>{cartLabel}</div>
                    </button>
                  </div>
                </div>

                <div className={styles["nav-tag-row"]}>
                  <div className={styles["nav-tag-chip"]}>
                    <i className="bi bi-clock-history" />
                    Đơn mới 5 phút trước
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* BOTTOM NAV (MOBILE) */}
      <nav className={styles["bottom-nav"]} id="bottomNav">
        <div className={styles["bottom-nav-inner"]}>
          <button
            type="button"
            className={activeBottomTab === "home" ? `${styles["bottom-nav-item"]} ${styles["active"]}` : styles["bottom-nav-item"]}
            data-tab="home"
            onClick={() => handleBottomNavClick("home")}>
            <i className="bi bi-house-door" />
            <span>{bottomNavHomeLabel}</span>
          </button>
          <button
            type="button"
            className={activeBottomTab === "category" ? `${styles["bottom-nav-item"]} ${styles["active"]}` : styles["bottom-nav-item"]}
            data-tab="category"
            onClick={() => handleBottomNavClick("category")}>
            <i className="bi bi-grid-3x3-gap" />
            <span>{bottomNavCategoryLabel}</span>
          </button>
          <button
            type="button"
            className={activeBottomTab === "style" ? `${styles["bottom-nav-item"]} ${styles["active"]}` : styles["bottom-nav-item"]}
            data-tab="style"
            onClick={() => handleBottomNavClick("style")}>
            <i className="bi bi-magic" />
            <span>{bottomNavStyleLabel}</span>
          </button>
          <button
            type="button"
            className={activeBottomTab === "cart" ? `${styles["bottom-nav-item"]} ${styles["active"]}` : styles["bottom-nav-item"]}
            data-tab="cart"
            onClick={() => handleBottomNavClick("cart")}>
            <i className="bi bi-bag" />
            <span>{bottomNavCartLabel}</span>
          </button>
          <button
            type="button"
            className={activeBottomTab === "account" ? `${styles["bottom-nav-item"]} ${styles["active"]}` : styles["bottom-nav-item"]}
            data-tab="account"
            onClick={() => handleBottomNavClick("account")}>
            <i className="bi bi-person" />
            <span>{bottomNavAccountLabel}</span>
          </button>
        </div>
      </nav>
    </>
  );
};

/* ===========================
   RegItem cho UI Builder
=========================== */

export const HEADER_BLUE_REGITEM: RegItem = {
  kind: "HeaderDark",
  label: "Header Dark",
  defaults: DEFAULT_AURORA_HEADER_COMPONENT_PROPS,
  inspector: [],
  render: (p) => <HeaderBlue {...(p as HeaderBlueProps)} />,
};

export default HeaderBlue;
