// components/templates/ShopTemplate/Ui/topbar/HeaderGreen.tsx
"use client";

import React, { useEffect, useRef, useState, FormEvent, MouseEvent as ReactMouseEvent, KeyboardEvent } from "react";

import styles from "@/components/admin/shared/templates/ShopTemplate/styles/header/HeaderGreen.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/** ===== Types từ DB ===== */
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
export interface HeaderGreenProps {
  // Topbar
  topbarMessage?: string;
  topbarLinkText?: string;

  // Brand
  brandIconClass?: string;
  brandTitle?: string;
  brandSubtitle?: string;
  brandHighlight?: string;

  // Search
  searchPlaceholder?: string;
  searchTaglinePrefix?: string;
  searchTaglineTag?: string;

  // Actions
  showWishlist?: boolean;
  showAccount?: boolean;
  showCart?: boolean;
  cartCount?: number;

  // Nav
  navItems?: NavItem[];
  autoLoadMenu?: boolean;
  locale?: string;
  siteId?: string;
  setKey?: string;

  // Suggest cho popup search
  popupSuggestions?: string[];

  // Preview mode
  preview?: boolean;
}

/** ===== DEFAULTS ===== */
const DEFAULT_HEADER_GREEN_PROPS: HeaderGreenProps = {
  // Topbar
  topbarMessage: "Miễn phí vận chuyển đơn từ 199K",
  topbarLinkText: "Theo dõi đơn hàng",

  // Brand
  brandIconClass: "bi bi-flower2",
  brandTitle: "Aurora Green",
  brandSubtitle: "Thời trang dành cho",
  brandHighlight: "người sống xanh",

  // Search
  searchPlaceholder: "Tìm: áo thun, áo croptop, chân váy, sneaker...",
  searchTaglinePrefix: "Gợi ý:",
  searchTaglineTag: "#OOTD",

  // Actions
  showWishlist: true,
  showAccount: true,
  showCart: true,
  cartCount: 3,

  // Nav
  autoLoadMenu: true,
  locale: "en",
  setKey: "home",

  // Popup suggestions
  popupSuggestions: ["Áo thun basic", "Áo croptop nữ", "Váy midi xếp ly", "Quần jeans ống rộng", "Sneaker trắng"],

  preview: false,
};

/** Build tree từ flat DB rows */
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

/** ===================== COMPONENT ===================== */
export const HeaderGreen: React.FC<HeaderGreenProps> = (props) => {
  const {
    topbarMessage = DEFAULT_HEADER_GREEN_PROPS.topbarMessage,
    topbarLinkText = DEFAULT_HEADER_GREEN_PROPS.topbarLinkText,

    brandIconClass = DEFAULT_HEADER_GREEN_PROPS.brandIconClass,
    brandTitle = DEFAULT_HEADER_GREEN_PROPS.brandTitle,
    brandSubtitle = DEFAULT_HEADER_GREEN_PROPS.brandSubtitle,
    brandHighlight = DEFAULT_HEADER_GREEN_PROPS.brandHighlight,

    searchPlaceholder = DEFAULT_HEADER_GREEN_PROPS.searchPlaceholder,
    searchTaglinePrefix = DEFAULT_HEADER_GREEN_PROPS.searchTaglinePrefix,
    searchTaglineTag = DEFAULT_HEADER_GREEN_PROPS.searchTaglineTag,

    showWishlist = DEFAULT_HEADER_GREEN_PROPS.showWishlist,
    showAccount = DEFAULT_HEADER_GREEN_PROPS.showAccount,
    showCart = DEFAULT_HEADER_GREEN_PROPS.showCart,
    cartCount = DEFAULT_HEADER_GREEN_PROPS.cartCount,

    navItems: navItemsProp,
    autoLoadMenu = DEFAULT_HEADER_GREEN_PROPS.autoLoadMenu,
    locale = DEFAULT_HEADER_GREEN_PROPS.locale,
    siteId,
    setKey = DEFAULT_HEADER_GREEN_PROPS.setKey,

    popupSuggestions = DEFAULT_HEADER_GREEN_PROPS.popupSuggestions,

    preview = DEFAULT_HEADER_GREEN_PROPS.preview,
  } = props;

  /** ===== Sticky header shrink ===== */
  const [isTight, setIsTight] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setIsTight(window.scrollY > 10);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /** ===== Nav from API ===== */
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
          console.error("HeaderGreen nav load failed", res.status);
          return;
        }

        const data = await res.json();
        const rows: DbMenuItem[] = data?.items ?? [];
        const tree = buildMenuTree(rows);
        if (tree.length) {
          setNavItems(tree);
        }
      } catch (err) {
        console.error("HeaderGreen nav load error", err);
      } finally {
        setNavLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoadMenu, locale, siteId, setKey, navItemsProp]);

  /** ===== Search logic dùng chung ===== */
  const desktopSearchInputRef = useRef<HTMLInputElement | null>(null);
  const popupSearchInputRef = useRef<HTMLInputElement | null>(null);

  const doSearch = (val: string) => {
    if (preview) return;
    alert("Tìm kiếm: " + (val || "(chưa nhập từ khóa)"));
  };

  const handleDesktopSearchClick = () => {
    const val = desktopSearchInputRef.current?.value ?? "";
    doSearch(val);
  };

  /** ===== Search popup (mobile) ===== */
  const [isSearchPopupOpen, setIsSearchPopupOpen] = useState(false);

  const openSearchPopup = () => {
    setIsSearchPopupOpen(true);
  };

  const closeSearchPopup = () => {
    setIsSearchPopupOpen(false);
  };

  useEffect(() => {
    if (!isSearchPopupOpen) return;
    const handler = (e: KeyboardEvent | any) => {
      if ((e as any).key === "Escape") {
        setIsSearchPopupOpen(false);
      }
    };
    window.addEventListener("keydown", handler as any);
    return () => window.removeEventListener("keydown", handler as any);
  }, [isSearchPopupOpen]);

  const handlePopupSearch = () => {
    const val = popupSearchInputRef.current?.value ?? "";
    doSearch(val);
  };

  const handlePopupInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handlePopupSearch();
    } else if (e.key === "Escape") {
      e.preventDefault();
      closeSearchPopup();
    }
  };

  const handleSuggestionClick = (q: string) => {
    if (!popupSearchInputRef.current) return;
    popupSearchInputRef.current.value = q;
    popupSearchInputRef.current.focus();
  };

  /** ===== Mobile menu overlay + accordion ===== */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMobileIndex, setOpenMobileIndex] = useState<number | null>(null);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((v) => !v);
  };

  const handleMobileOverlayClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setIsMobileMenuOpen(false);
      setOpenMobileIndex(null);
    }
  };

  const handleMobileItemToggle = (idx: number, hasSub: boolean) => () => {
    if (!hasSub) return;
    setOpenMobileIndex((prev) => (prev === idx ? null : idx));
  };

  /** ===== Bottom tabbar ===== */
  type TabKey = "home" | "category" | "cart" | "wishlist" | "account";
  const [activeTab, setActiveTab] = useState<TabKey>("home");

  const setTab = (tab: TabKey) => () => {
    setActiveTab(tab);
    switch (tab) {
      case "home":
        window.scrollTo({ top: 0, behavior: "smooth" });
        break;
      case "category":
        setIsMobileMenuOpen(true);
        break;
      case "cart":
        if (!preview) {
          alert("Đi đến giỏ hàng (demo). Ở dự án thật bạn chuyển sang /cart.");
        }
        break;
      case "wishlist":
        if (!preview) {
          alert("Bạn chưa có sản phẩm yêu thích nào. Hãy thêm vài item ♥");
        }
        break;
      case "account":
        if (!preview) {
          alert("Đi đến tài khoản (demo).");
        }
        break;
    }
  };

  /** ===== Link click handler (preview-safe) ===== */
  const handleAnchorClick = (href?: string) => (e: ReactMouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
    if (preview || !href || href === "#") {
      e.preventDefault();
      return;
    }
    // chỗ này nếu dùng next/link thì thay bằng router push
  };

  /** =================== RENDER =================== */
  return (
    <>
      {/* TOPBAR */}
      <div className={styles.topbar}>
        <div className={styles.topbarInner}>
          <span>{topbarMessage}</span>
          <button
            type="button"
            className={styles.tbLink}
            onClick={
              preview
                ? (e) => e.preventDefault()
                : () => {
                    // Theo dõi đơn hàng - tuỳ bạn xử lý real link
                  }
            }
          >
            {topbarLinkText}
          </button>
        </div>
      </div>

      {/* HEADER SHELL */}
      <div className={styles.headerShell}>
        <div className={`${styles.headerBg} ${isTight ? styles.isTight : ""}`}>
          <div className={styles.headerInner}>
            {/* Brand */}
            <div className={styles.brandBlock}>
              <div className={styles.brandLogoWrap}>
                <div className={styles.brandLogo}>{brandIconClass && <i className={brandIconClass} />}</div>
                <div className={styles.brandOrbit} />
              </div>
              <div className={styles.brandText}>
                <div className={styles.brandMain}>{brandTitle}</div>
                <div className={styles.brandSub}>
                  {brandSubtitle} {brandHighlight && <span className={styles.highlight}>{brandHighlight}</span>}
                </div>
              </div>
            </div>

            {/* Search Desktop */}
            <div className={styles.searchDesktop}>
              <div className={styles.searchInputWrap}>
                <i className="bi bi-search" />
                <input ref={desktopSearchInputRef} type="text" placeholder={searchPlaceholder} />
                <button type="button" onClick={preview ? undefined : handleDesktopSearchClick}>
                  <i className="bi bi-magic" />
                  <span>Tìm nhanh</span>
                </button>
              </div>
              <div className={styles.searchTagline}>
                {searchTaglinePrefix} {searchTaglineTag && <span>{searchTaglineTag}</span>}
              </div>
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              {showWishlist && (
                <button
                  className={`${styles.btnIcon} ${styles.desktopOnly}`}
                  title="Yêu thích"
                  type="button"
                  onClick={
                    preview
                      ? (e) => e.preventDefault()
                      : () => {
                          alert("Bạn chưa có sản phẩm yêu thích nào. Hãy thêm vài item ♥");
                        }
                  }
                >
                  <i className="bi bi-heart" />
                </button>
              )}

              {showAccount && (
                <button
                  className={`${styles.btnIcon} ${styles.desktopOnly}`}
                  title="Tài khoản"
                  type="button"
                  onClick={
                    preview
                      ? (e) => e.preventDefault()
                      : () => {
                          alert("Đi đến tài khoản (demo).");
                        }
                  }
                >
                  <i className="bi bi-person" />
                </button>
              )}

              {showCart && (
                <button
                  className={`${styles.btnIcon} ${styles.btnCart}`}
                  title="Giỏ hàng"
                  type="button"
                  onClick={
                    preview
                      ? (e) => e.preventDefault()
                      : () => {
                          alert("Đi đến giỏ hàng (demo). Ở dự án thật bạn chuyển sang /cart.");
                        }
                  }
                >
                  <i className="bi bi-bag-heart" />
                  {typeof cartCount === "number" && <span className={styles.cartCount}>{cartCount}</span>}
                  <span>Giỏ</span>
                </button>
              )}

              {/* Mobile search */}
              <button
                className={`${styles.btnIcon} ${styles.mobileOnly}`}
                id="openSearch"
                title="Tìm kiếm"
                type="button"
                onClick={openSearchPopup}
              >
                <i className="bi bi-search" />
              </button>

              {/* Mobile menu */}
              <button
                className={`${styles.btnIcon} ${styles.mobileOnly}`}
                id="openMenu"
                title="Menu"
                type="button"
                onClick={toggleMobileMenu}
              >
                <i className="bi bi-list" />
              </button>
            </div>
          </div>

          {/* NAV DESKTOP (dùng navItems từ API) */}
          <nav className={styles.navRow}>
            <ul className={styles.navMain}>
              {/* Static buttons giống design gốc */}
              <li className={styles.navItem}>
                <button
                  className={`${styles.navBtn} ${styles.navPrimary}`}
                  type="button"
                  onClick={handleAnchorClick("#")}
                >
                  <i className="bi bi-stars" />
                  Mới về
                </button>
              </li>

              <li className={styles.navItem}>
                <button className={styles.navBtn} type="button" onClick={handleAnchorClick("#")}>
                  <i className="bi bi-lightning-charge" />
                  Best seller
                </button>
              </li>

              {navLoading && !navItems.length && (
                <li className={styles.navItem}>
                  <span className={styles.navLink}>Đang tải menu...</span>
                </li>
              )}

              {navItems.map((item) => (
                <li key={item.id} className={styles.navItem}>
                  {item.hasSub ? (
                    <>
                      <button className={styles.navBtn} type="button" onClick={handleAnchorClick(item.href)}>
                        {item.iconClass && <i className={item.iconClass} />}
                        <span>{item.label}</span>
                        <i className="bi bi-chevron-down" />
                      </button>
                      <div className={styles.submenu}>
                        <div className={styles.submenuSectionTitle}>{item.label}</div>
                        {item.subItems.map((sub) => (
                          <a key={sub.id} href={sub.href} onClick={handleAnchorClick(sub.href)}>
                            <span>{sub.label}</span>
                          </a>
                        ))}
                      </div>
                    </>
                  ) : (
                    <a href={item.href} className={styles.navLink} onClick={handleAnchorClick(item.href)}>
                      {item.iconClass && <i className={item.iconClass} />}
                      <span>{item.label}</span>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      {/* SEARCH POPUP (MOBILE) */}
      <div
        className={`${styles.searchPopupOverlay} ${isSearchPopupOpen ? styles.isOpen : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            closeSearchPopup();
          }
        }}
      >
        <div className={styles.searchPopup}>
          <div className={styles.searchPopupHeader}>
            <div className={styles.searchPopupTitle}>Tìm kiếm sản phẩm</div>
            <button className={styles.searchPopupClose} type="button" onClick={closeSearchPopup}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className={styles.searchPopupRow}>
            <input
              ref={popupSearchInputRef}
              type="text"
              placeholder="Nhập từ khóa: áo, quần, váy..."
              onKeyDown={handlePopupInputKeyDown}
            />
            <button type="button" onClick={preview ? undefined : handlePopupSearch}>
              <i className="bi bi-search" />
            </button>
          </div>

          <div className={styles.searchPopupSuggestLabel}>Gợi ý nhanh:</div>
          <div className={styles.searchPopupChips}>
            {popupSuggestions?.map((label) => (
              <button
                key={label}
                type="button"
                className={styles.searchPopupChip}
                onClick={() => handleSuggestionClick(label)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MOBILE MENU OVERLAY */}
      <div
        className={`${styles.mobileMenuOverlay} ${isMobileMenuOpen ? styles.isOpen : ""}`}
        onClick={handleMobileOverlayClick}
      >
        <div className={styles.mobileMenuPanel}>
          <div className={styles.mobileMenuHeader}>
            <div className={styles.mobileMenuTitle}>Danh mục thời trang {brandTitle}</div>
            <button className={styles.mobileMenuClose} type="button" onClick={() => setIsMobileMenuOpen(false)}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <ul className={styles.mobileMenuList}>
            {/* Static items giống bản HTML */}
            <li className={styles.mobileMenuItem}>
              <button className={styles.mobileMenuToggle} type="button" onClick={handleAnchorClick("#")}>
                <span>Mới về</span>
              </button>
            </li>

            <li className={styles.mobileMenuItem}>
              <button className={styles.mobileMenuToggle} type="button" onClick={handleAnchorClick("#")}>
                <span>Best seller</span>
              </button>
            </li>

            {/* Items từ API */}
            {navItems.map((item, idx) => {
              const hasSub = item.hasSub && item.subItems.length > 0;
              const isOpen = openMobileIndex === idx;
              return (
                <li key={item.id} className={`${styles.mobileMenuItem} ${isOpen ? styles.isOpen : ""}`}>
                  <button
                    className={styles.mobileMenuToggle}
                    type="button"
                    onClick={handleMobileItemToggle(idx, hasSub)}
                  >
                    <span>{item.label}</span>
                    {hasSub && <i className="bi bi-chevron-down" />}
                  </button>
                  {hasSub && (
                    <div className={styles.mobileSubmenu}>
                      {item.subItems.map((sub) => (
                        <a key={sub.id} href={sub.href} onClick={handleAnchorClick(sub.href)}>
                          {sub.label}
                        </a>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* BOTTOM TAB BAR (MOBILE) */}
      <div className={styles.bottomTabbar}>
        <button
          className={`${styles.tabItem} ${activeTab === "home" ? styles.active : ""}`}
          type="button"
          onClick={setTab("home")}
        >
          <i className="bi bi-house" />
          <span>Home</span>
        </button>
        <button
          className={`${styles.tabItem} ${activeTab === "category" ? styles.active : ""}`}
          type="button"
          onClick={setTab("category")}
        >
          <i className="bi bi-grid-3x3-gap" />
          <span>Danh mục</span>
        </button>
        <button
          className={`${styles.tabItem} ${activeTab === "cart" ? styles.active : ""}`}
          type="button"
          onClick={setTab("cart")}
        >
          <i className="bi bi-bag" />
          <span>Giỏ</span>
        </button>
        <button
          className={`${styles.tabItem} ${activeTab === "wishlist" ? styles.active : ""}`}
          type="button"
          onClick={setTab("wishlist")}
        >
          <i className="bi bi-heart" />
          <span>Yêu thích</span>
        </button>
        <button
          className={`${styles.tabItem} ${activeTab === "account" ? styles.active : ""}`}
          type="button"
          onClick={setTab("account")}
        >
          <i className="bi bi-person" />
          <span>Tài khoản</span>
        </button>
      </div>
    </>
  );
};

/** ===== RegItem cho UI Builder ===== */
export const HEADER_GREEN_REGITEM: RegItem = {
  kind: "HeaderGreenKind",
  label: "Header Green",
  defaults: DEFAULT_HEADER_GREEN_PROPS,
  inspector: [],
  render: (p) => <HeaderGreen {...(p as HeaderGreenProps)} />,
};

export default HeaderGreen;
