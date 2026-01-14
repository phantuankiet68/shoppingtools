"use client";

import React, { useState, useEffect, useRef, FormEvent, MouseEvent, KeyboardEvent } from "react";
import type { RegItem } from "@/lib/ui-builder/types";
import styles from "@/components/admin/templates/ShopTemplate/styles/header/HeaderFashion.module.css";

/* ============================
 * Types cho menu / nav
 * ============================ */

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

/* ============================
 * buildMenuTree – dựng tree từ DbMenuItem
 * ============================ */

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

/* ============================
 * Props
 * ============================ */

export type HeaderFashionProps = {
  // Branding
  brandName?: string;
  brandTagline?: string;
  logoIconClass?: string;

  // Search
  searchPlaceholder?: string;
  searchHint?: string;
  searchEmptyMessage?: string;
  searchAlertPrefix?: string;
  searchCategoryOptions?: string[];

  // Mode toggle
  modeInitial?: "light" | "night";

  // Counters / badges
  showFavorites?: boolean;
  favoritesCount?: number;
  showCart?: boolean;
  cartCount?: number;

  // Account
  accountLabel?: string;

  // Nav / menu
  navItems?: NavItem[];
  autoLoadMenu?: boolean;
  locale?: string;
  siteId?: string;
  setKey?: string;
  primaryNavId?: string;

  // Mobile menu
  mobileMenuTitle?: string;

  // Bottom nav labels
  bottomNavHomeLabel?: string;
  bottomNavCategoryLabel?: string;
  bottomNavWishlistLabel?: string;
  bottomNavAccountLabel?: string;

  // Popup search
  popupSearchPlaceholder?: string;
  popupSuggestTitle?: string;
  popupSuggestTags?: string[];

  // Preview mode – chặn điều hướng / alert / modal demo
  preview?: boolean;
};

/* ============================
 * Defaults
 * ============================ */

export const DEFAULT_HEADER_AURORA_PROPS: HeaderFashionProps = {
  brandName: "Aurora Wear",
  brandTagline: "Mix & 2026.",
  logoIconClass: "bi bi-stars",

  searchPlaceholder: "Tìm áo, quần, váy, outfit mix & match…",
  searchHint: "Enter để gợi ý outfit",
  searchEmptyMessage: "Hãy nhập sản phẩm hoặc kiểu outfit bạn muốn nhé ✨",
  searchAlertPrefix: "Aurora Wear đang gợi ý outfit cho",

  searchCategoryOptions: ["Tất cả danh mục", "Nữ", "Nam", "Unisex", "Office wear", "Basic / Minimal"],

  modeInitial: "light",

  showFavorites: true,
  favoritesCount: 12,
  showCart: true,
  cartCount: 3,

  accountLabel: "Tài khoản",

  navItems: [],

  autoLoadMenu: true,
  locale: "vi",
  setKey: "home",
  siteId: undefined,

  primaryNavId: "today-collection",

  mobileMenuTitle: "Danh mục",

  bottomNavHomeLabel: "Trang chủ",
  bottomNavCategoryLabel: "Danh mục",
  bottomNavWishlistLabel: "Yêu thích",
  bottomNavAccountLabel: "Tài khoản",

  popupSearchPlaceholder: "Tìm áo, quần, váy, outfit…",
  popupSuggestTitle: "Gợi ý nhanh",
  popupSuggestTags: ["Áo khoác 2026", "Quần jean nữ", "Mix & match", "Outfit công sở"],

  preview: false,
};

/* ============================
 * Component
 * ============================ */

const HeaderAuroraWear: React.FC<HeaderFashionProps> = (props) => {
  const {
    brandName = DEFAULT_HEADER_AURORA_PROPS.brandName,
    brandTagline = DEFAULT_HEADER_AURORA_PROPS.brandTagline,
    logoIconClass = DEFAULT_HEADER_AURORA_PROPS.logoIconClass,

    searchPlaceholder = DEFAULT_HEADER_AURORA_PROPS.searchPlaceholder,
    searchHint = DEFAULT_HEADER_AURORA_PROPS.searchHint,
    searchEmptyMessage = DEFAULT_HEADER_AURORA_PROPS.searchEmptyMessage,
    searchAlertPrefix = DEFAULT_HEADER_AURORA_PROPS.searchAlertPrefix,
    searchCategoryOptions = DEFAULT_HEADER_AURORA_PROPS.searchCategoryOptions,

    modeInitial = DEFAULT_HEADER_AURORA_PROPS.modeInitial,

    showFavorites = DEFAULT_HEADER_AURORA_PROPS.showFavorites,
    favoritesCount = DEFAULT_HEADER_AURORA_PROPS.favoritesCount,
    showCart = DEFAULT_HEADER_AURORA_PROPS.showCart,
    cartCount = DEFAULT_HEADER_AURORA_PROPS.cartCount,

    accountLabel = DEFAULT_HEADER_AURORA_PROPS.accountLabel,

    navItems: navItemsProp = DEFAULT_HEADER_AURORA_PROPS.navItems,
    autoLoadMenu = DEFAULT_HEADER_AURORA_PROPS.autoLoadMenu,
    locale = DEFAULT_HEADER_AURORA_PROPS.locale,
    siteId = DEFAULT_HEADER_AURORA_PROPS.siteId,
    setKey = DEFAULT_HEADER_AURORA_PROPS.setKey,
    primaryNavId = DEFAULT_HEADER_AURORA_PROPS.primaryNavId,

    mobileMenuTitle = DEFAULT_HEADER_AURORA_PROPS.mobileMenuTitle,

    bottomNavHomeLabel = DEFAULT_HEADER_AURORA_PROPS.bottomNavHomeLabel,
    bottomNavCategoryLabel = DEFAULT_HEADER_AURORA_PROPS.bottomNavCategoryLabel,
    bottomNavWishlistLabel = DEFAULT_HEADER_AURORA_PROPS.bottomNavWishlistLabel,
    bottomNavAccountLabel = DEFAULT_HEADER_AURORA_PROPS.bottomNavAccountLabel,

    popupSearchPlaceholder = DEFAULT_HEADER_AURORA_PROPS.popupSearchPlaceholder,
    popupSuggestTitle = DEFAULT_HEADER_AURORA_PROPS.popupSuggestTitle,
    popupSuggestTags = DEFAULT_HEADER_AURORA_PROPS.popupSuggestTags,

    preview = DEFAULT_HEADER_AURORA_PROPS.preview,
  } = props;

  /* Nav auto load */
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
        params.set("locale", locale ?? "vi");
        params.set("setKey", setKey ?? "home");
        if (siteId) params.set("siteId", siteId);

        const res = await fetch(`/api/menu-items?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          console.error("HeaderAuroraWear nav load failed", res.status);
          return;
        }

        const data = await res.json();
        const rows: DbMenuItem[] = data?.items ?? [];
        const tree = buildMenuTree(rows);
        if (tree.length) {
          setNavItems(tree);
        }
      } catch (err) {
        console.error("HeaderAuroraWear nav load error", err);
      } finally {
        setNavLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoadMenu, locale, siteId, setKey, navItemsProp]);

  /* UI state */

  const [isNight, setIsNight] = useState(modeInitial === "night");
  const [headerShrink, setHeaderShrink] = useState(false);
  const [headerHidden, setHeaderHidden] = useState(false);
  const lastScrollYRef = useRef(0);

  const [headerSearchQuery, setHeaderSearchQuery] = useState("");
  const [headerCategoryIndex, setHeaderCategoryIndex] = useState(0);

  const [openNavId, setOpenNavId] = useState<string | null>(null);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openMobileNavId, setOpenMobileNavId] = useState<string | null>(null);

  const [activeBottomTab, setActiveBottomTab] = useState<"home" | "category" | "wishlist" | "account">("home");

  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);
  const [popupSearchQuery, setPopupSearchQuery] = useState("");

  const headerRef = useRef<HTMLElement | null>(null);
  const popupSearchInputRef = useRef<HTMLInputElement | null>(null);

  /* Scroll effect – shrink + hide nhẹ khi scroll xuống */
  useEffect(() => {
    const handleScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setHeaderShrink(y > 16);

      const goingDown = y > lastScrollYRef.current && y > 80;
      setHeaderHidden(goingDown);

      lastScrollYRef.current = y;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* Focus input khi mở popup search */
  useEffect(() => {
    if (isSearchPopupOpen && popupSearchInputRef.current) {
      popupSearchInputRef.current.focus();
    }
  }, [isSearchPopupOpen]);

  /* Helpers */

  const handleAnchorClick = (href?: string) => (e: MouseEvent<HTMLAnchorElement>) => {
    if (preview || !href || href === "#") {
      e.preventDefault();
      return;
    }
    // nếu cần, xử lý SPA routing tại đây (next/router,...)
  };

  const handleSearch = (source: "header" | "popup") => (e?: MouseEvent<HTMLButtonElement> | FormEvent<HTMLFormElement>) => {
    if (e) {
      e.preventDefault();
    }
    if (preview) return;

    const value = source === "header" ? headerSearchQuery.trim() : popupSearchQuery.trim();

    if (!value) {
      window.alert(searchEmptyMessage ?? "");
      return;
    }

    window.alert(`${searchAlertPrefix}: “${value}”`);
  };

  const handleSearchKeyDown = (source: "header" | "popup") => (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch(source)();
    }
  };

  const handleVoiceClick = () => {
    if (preview) return;
    window.alert("Tính năng gợi ý bằng giọng nói sẽ được tích hợp sau 🎙️");
  };

  const handleCategoryCycle = () => {
    const len = searchCategoryOptions?.length ?? 0;
    if (!len) return;
    setHeaderCategoryIndex((prev) => (prev + 1) % len);
  };

  const toggleMode = () => {
    setIsNight((prev) => !prev);
    if (!document || !document.body) return;
    if (!isNight) {
      document.body.classList.add("reading-night");
    } else {
      document.body.classList.remove("reading-night");
    }
  };

  const toggleDesktopNavSub = (id: string) => {
    setOpenNavId((prev) => (prev === id ? null : id));
  };

  const toggleMobileNavSub = (id: string) => {
    setOpenMobileNavId((prev) => (prev === id ? null : id));
  };

  const handleBottomNavClick = (tab: "home" | "category" | "wishlist" | "account") => {
    if (tab === "home") {
      setActiveBottomTab("home");
      if (!preview) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      return;
    }

    if (tab === "category") {
      setActiveBottomTab("category");
      if (!preview) {
        window.alert("Mở popup danh mục / page danh mục.");
      }
      return;
    }

    if (tab === "wishlist") {
      setActiveBottomTab("wishlist");
      if (!preview) {
        window.alert("Đi tới danh sách sản phẩm yêu thích.");
      }
      return;
    }

    if (tab === "account") {
      setActiveBottomTab("account");
      if (!preview) {
        window.alert("Đi tới trang tài khoản / đăng nhập.");
      }
    }
  };

  const handleFabSearchClick = () => {
    if (preview) return;
    setIsSearchPopupOpen(true);
  };

  const handleCloseSearchPopup = () => {
    setIsSearchPopupOpen(false);
  };

  /* Class names */

  const headerClassName = [styles.headerAurora, headerShrink ? styles.isShrink : "", headerHidden ? styles.headerAuroraHidden : ""].filter(Boolean).join(" ");

  /* Render */

  const currentCategoryLabel = searchCategoryOptions && searchCategoryOptions.length ? searchCategoryOptions[headerCategoryIndex % searchCategoryOptions.length] : undefined;

  return (
    <>
      <header ref={headerRef} className={headerClassName} id="headerAurora">
        <div className={styles.headerInner}>
          {/* LEFT */}
          <div className={styles.hLeft}>
            <div className={styles.logoPill}>{logoIconClass ? <i className={logoIconClass} /> : null}</div>

            <div className={styles.brandBlock}>
              <div className={styles.brandMain}>{brandName}</div>
              {brandTagline && <div className={styles.sub}>{brandTagline}</div>}
            </div>

            {/* Mobile menu button */}
            <button type="button" className={`${styles.btnIcon} ${styles.mobileMenuBtn}`} onClick={() => setMobileMenuOpen(true)} aria-label="Mở menu">
              <i className="bi bi-list" />
            </button>
          </div>

          {/* CENTER – search (ẩn bớt trên mobile theo CSS) */}
          <div className={styles.hCenter}>
            <div className={styles.searchShell}>
              {currentCategoryLabel && (
                <button type="button" className={styles.searchCategory} onClick={handleCategoryCycle}>
                  <i className="bi bi-grid-3x3-gap" />
                  <span>{currentCategoryLabel}</span>
                  <i className="bi bi-chevron-down" />
                </button>
              )}

              <div className={styles.searchInputWrap}>
                <input
                  className={styles.searchInput}
                  type="text"
                  value={headerSearchQuery}
                  onChange={(e) => setHeaderSearchQuery(e.target.value)}
                  onKeyDown={handleSearchKeyDown("header")}
                  placeholder={searchPlaceholder}
                />
                {searchHint && <span className={styles.searchInputHint}>{searchHint}</span>}
              </div>

              <div className={styles.searchActions}>
                <button type="button" className={styles.btnIcon} title="Tìm bằng giọng nói" onClick={handleVoiceClick}>
                  <i className="bi bi-mic" />
                </button>
                <button type="button" className={styles.btnSearchMain} title="Tìm kiếm" onClick={handleSearch("header")}>
                  <i className="bi bi-search" />
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className={styles.hRight}>
            <div className={styles.buttonRight}>
              {showFavorites && (
                <button type="button" className={`${styles.btnIcon} ${styles.badged}`} title="Yêu thích">
                  <i className="bi bi-heart" />
                  <span className={styles.badge}>{favoritesCount}</span>
                </button>
              )}
              {showCart && (
                <button type="button" className={`${styles.btnIcon} ${styles.badged}`} title="Giỏ hàng">
                  <i className="bi bi-bag" />
                  <span className={styles.badge}>{cartCount}</span>
                </button>
              )}
              <button type="button" className={`${styles.modeToggle} ${isNight ? styles.isNight : ""}`} id="modeToggle" onClick={toggleMode}>
                <span className={styles.dot} />
                <i className={isNight ? "bi bi-moon-stars" : "bi bi-sun"} />
                <span className={styles.label} id="modeLabel">
                  {isNight ? "Night" : "Light"}
                </span>
              </button>
              <button type="button" className={styles.userChip} id="userMenu">
                <div className={styles.userAvatar}>{brandName?.charAt(0) ?? "A"}</div>
                <span>{accountLabel}</span>
                <i className="bi bi-chevron-down" />
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM NAV – desktop / tablet */}
        <div className={styles.headerBottom}>
          <nav className={styles.nav} aria-label="Main navigation">
            <ul className={styles.navScroller} id="navScroller">
              {navLoading && !navItems.length && (
                <li className={styles.navGroup}>
                  <span className={styles.navPill}>Đang tải menu...</span>
                </li>
              )}

              {navItems.map((item) => {
                const hasSub = item.hasSub && item.subItems.length > 0;
                const isOpen = openNavId === item.id;

                const groupClassName = [styles.navGroup, hasSub ? styles.hasSub : "", isOpen ? styles.isOpen : ""].filter(Boolean).join(" ");

                const pillClassName = [styles.navPill, item.id === primaryNavId ? styles.isPrimary : ""].filter(Boolean).join(" ");

                return (
                  <li key={item.id} className={groupClassName}>
                    {hasSub ? (
                      <>
                        <button
                          type="button"
                          className={`${pillClassName} ${styles.navTrigger}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleDesktopNavSub(item.id);
                          }}>
                          {item.iconClass && <i className={item.iconClass} />}
                          {item.label}
                          <i className={`bi bi-chevron-down ${styles.chevron}`} />
                        </button>

                        <div className={styles.navSub}>
                          {/* Title / tagline có thể tuỳ chỉnh sau qua props nếu cần */}
                          <div className={styles.navSubTitle}>{item.label}</div>
                          <ul className={styles.navSubList}>
                            {item.subItems.map((sub) => (
                              <li key={sub.id}>
                                <a href={sub.href} onClick={handleAnchorClick(sub.href)}>
                                  <button type="button">
                                    <span>{sub.label}</span>
                                  </button>
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </>
                    ) : (
                      <a href={item.href} onClick={handleAnchorClick(item.href)}>
                        <button type="button" className={pillClassName}>
                          {item.iconClass && <i className={item.iconClass} />}
                          {item.label}
                        </button>
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      {/* MOBILE MENU (off-canvas) */}
      <div className={`${styles.mobileMenu} ${mobileMenuOpen ? styles.isOpen : ""}`} id="mobileMenu">
        <div className={styles.mobileMenuHeader}>
          <span>{mobileMenuTitle}</span>
          <button type="button" id="mobileMenuClose" onClick={() => setMobileMenuOpen(false)}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <ul className={styles.mobileMenuList}>
          {navItems.map((item) => {
            const hasSub = item.hasSub && item.subItems.length > 0;
            const isOpen = openMobileNavId === item.id;

            if (hasSub) {
              return (
                <li key={item.id} className={`${styles.mobileItem} ${styles.hasSub} ${isOpen ? styles.open : ""}`}>
                  <button type="button" className={styles.mobileLink} onClick={() => toggleMobileNavSub(item.id)}>
                    {item.label}
                    <i className="bi bi-chevron-down" />
                  </button>
                  <ul className={styles.mobileSub}>
                    {item.subItems.map((sub) => (
                      <li key={sub.id}>
                        <a href={sub.href} onClick={handleAnchorClick(sub.href)}>
                          {sub.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </li>
              );
            }

            return (
              <li key={item.id} className={styles.mobileItem}>
                <a href={item.href} onClick={handleAnchorClick(item.href)}>
                  {item.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>

      {/* BOTTOM NAV – mobile tab bar */}
      <nav className={styles.bottomNav} aria-label="Aurora Wear navigation">
        <div className={styles.bottomNavInner}>
          <button type="button" className={`${styles.bottomNavItem} ${activeBottomTab === "home" ? styles.active : ""}`} onClick={() => handleBottomNavClick("home")}>
            <i className="bi bi-house-door" />
            <span>{bottomNavHomeLabel}</span>
          </button>

          <button type="button" className={`${styles.bottomNavItem} ${activeBottomTab === "category" ? styles.active : ""}`} onClick={() => handleBottomNavClick("category")}>
            <i className="bi bi-grid-3x3-gap" />
            <span>{bottomNavCategoryLabel}</span>
          </button>

          <div className={`${styles.bottomNavItem} ${styles.searchCenter}`}>
            <button type="button" className={styles.bottomNavFab} id="fabSearch" onClick={handleFabSearchClick}>
              <i className="bi bi-search" />
            </button>
          </div>

          <button type="button" className={`${styles.bottomNavItem} ${activeBottomTab === "wishlist" ? styles.active : ""}`} onClick={() => handleBottomNavClick("wishlist")}>
            <i className="bi bi-heart" />
            <span>{bottomNavWishlistLabel}</span>
          </button>

          <button type="button" className={`${styles.bottomNavItem} ${activeBottomTab === "account" ? styles.active : ""}`} onClick={() => handleBottomNavClick("account")}>
            <i className="bi bi-person" />
            <span>{bottomNavAccountLabel}</span>
          </button>
        </div>
      </nav>

      {/* POPUP SEARCH (mobile) */}
      <div
        className={`${styles.searchPopup} ${isSearchPopupOpen ? styles.show : ""}`}
        id="searchPopup"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            handleCloseSearchPopup();
          }
        }}>
        <div className={styles.searchPopupInner}>
          <form className={styles.searchPopupHeader} onSubmit={handleSearch("popup")}>
            <input
              ref={popupSearchInputRef}
              type="text"
              value={popupSearchQuery}
              onChange={(e) => setPopupSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown("popup")}
              placeholder={popupSearchPlaceholder}
            />
            <button type="button" className={styles.searchPopupClose} id="searchClose" onClick={handleCloseSearchPopup}>
              <i className="bi bi-x-lg" />
            </button>
          </form>

          <div className={styles.searchPopupSuggest}>
            {popupSuggestTitle && <p>{popupSuggestTitle}</p>}
            <div className={styles.suggestTags}>
              {popupSuggestTags?.map((tag) => (
                <button key={tag} type="button" onClick={() => setPopupSearchQuery(tag)}>
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/* ============================
 * RegItem cho UI Builder
 * ============================ */

export const HEADER_FASHION_REGITEM: RegItem = {
  kind: "HeaderFashionKind",
  label: "Header Fashion",
  defaults: DEFAULT_HEADER_AURORA_PROPS,
  inspector: [],
  render: (p) => <HeaderAuroraWear {...(p as HeaderFashionProps)} />,
};

export default HeaderAuroraWear;
