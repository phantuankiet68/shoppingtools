// components/templates/ShopTemplate/Ui/topbar/HeaderAuroraOrangeNeo2025.tsx
"use client";

import React, { useState, useEffect, useMemo, FormEvent, MouseEvent } from "react";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/header/HeaderAuroraOrangeNeo2025.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type HeaderAuroraOrangeNeo2025MenuItem = {
  id: string;
  label: string;
  href?: string;
  parentId?: string | null;
  iconClass?: string | null;
  children?: HeaderAuroraOrangeNeo2025MenuItem[];
};

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

export type HeaderAuroraOrangeNeo2025Config = {
  // Menu & API
  autoLoadMenu?: boolean;
  menuApiUrl?: string;
  menuItems?: HeaderAuroraOrangeNeo2025MenuItem[];

  locale?: string;
  siteId?: string;
  setKey?: string;

  // Logo
  logoText?: string;
  logoSubtitle?: string;
  logoHref?: string;
  logoIconClass?: string;

  // Search
  searchPlaceholder?: string;
  showCategoryDropdown?: boolean;
  categoryLabel?: string;
  showFilterButton?: boolean;
  highlightChips?: string[];

  // Actions
  showWishlist?: boolean;
  showCart?: boolean;
  cartCount?: number;
  showAuth?: boolean;
  authLabel?: string;
  showVoucherPill?: boolean;
  voucherLabel?: string;
  showNavBadge?: boolean;
  navBadgeText?: string;

  // Preview mode
  isPreviewMode?: boolean;
  onPreviewBlockClickKey?: string;
};

export interface HeaderAuroraOrangeNeo2025Props extends HeaderAuroraOrangeNeo2025Config {
  onMenuLoaded?: (items: HeaderAuroraOrangeNeo2025MenuItem[]) => void;
  onMenuItemClick?: (item: HeaderAuroraOrangeNeo2025MenuItem) => void;
  onSearchSubmit?: (keyword: string) => void;
  onPreviewBlockClick?: (blockKey: string) => void;
  className?: string;
}

const DEFAULT_CONFIG: HeaderAuroraOrangeNeo2025Config = {
  autoLoadMenu: false,
  menuApiUrl: undefined,
  locale: "en",
  siteId: undefined,
  setKey: "home",

  logoText: "Aurora Orange",
  logoSubtitle: "Neo Flash Deals • 2025",
  logoHref: "/",
  logoIconClass: "bi bi-lightning-charge-fill",

  searchPlaceholder: "Tìm điện thoại, đồ gia dụng, phụ kiện, thời trang...",
  showCategoryDropdown: true,
  categoryLabel: "Danh mục",
  showFilterButton: true,
  highlightChips: ["Flash sale", "Freeship", "Voucher 50K", "Điện thoại", "Đồ gia dụng"],

  showWishlist: true,
  showCart: true,
  cartCount: 3,
  showAuth: true,
  authLabel: "Đăng nhập",
  showVoucherPill: true,
  voucherLabel: "Săn voucher 100K",
  showNavBadge: true,
  navBadgeText: "Mã giảm giá mới hôm nay",

  isPreviewMode: false,
  onPreviewBlockClickKey: undefined,
};

function mapDbMenuToItems(rows: DbMenuItem[]): HeaderAuroraOrangeNeo2025MenuItem[] {
  const visible = rows.filter((r) => r.visible);
  const byId: Record<string, HeaderAuroraOrangeNeo2025MenuItem> = {};
  const roots: HeaderAuroraOrangeNeo2025MenuItem[] = [];

  visible
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .forEach((row) => {
      byId[row.id] = {
        id: row.id,
        label: row.title,
        href: row.path ?? "#",
        parentId: row.parentId,
        iconClass: row.icon,
        children: [],
      };
    });

  Object.values(byId).forEach((item) => {
    if (item.parentId && byId[item.parentId]) {
      byId[item.parentId].children?.push(item);
    } else {
      roots.push(item);
    }
  });

  return roots;
}

const HeaderAuroraOrangeNeo2025: React.FC<HeaderAuroraOrangeNeo2025Props> = (props) => {
  const {
    autoLoadMenu = DEFAULT_CONFIG.autoLoadMenu,
    menuApiUrl = DEFAULT_CONFIG.menuApiUrl,
    menuItems,
    locale = DEFAULT_CONFIG.locale,
    siteId = DEFAULT_CONFIG.siteId,
    setKey = DEFAULT_CONFIG.setKey,

    logoText = DEFAULT_CONFIG.logoText,
    logoSubtitle = DEFAULT_CONFIG.logoSubtitle,
    logoHref = DEFAULT_CONFIG.logoHref,
    logoIconClass = DEFAULT_CONFIG.logoIconClass,

    searchPlaceholder = DEFAULT_CONFIG.searchPlaceholder,
    showCategoryDropdown = DEFAULT_CONFIG.showCategoryDropdown,
    categoryLabel = DEFAULT_CONFIG.categoryLabel,
    showFilterButton = DEFAULT_CONFIG.showFilterButton,
    highlightChips = DEFAULT_CONFIG.highlightChips,

    showWishlist = DEFAULT_CONFIG.showWishlist,
    showCart = DEFAULT_CONFIG.showCart,
    cartCount = DEFAULT_CONFIG.cartCount,
    showAuth = DEFAULT_CONFIG.showAuth,
    authLabel = DEFAULT_CONFIG.authLabel,
    showVoucherPill = DEFAULT_CONFIG.showVoucherPill,
    voucherLabel = DEFAULT_CONFIG.voucherLabel,
    showNavBadge = DEFAULT_CONFIG.showNavBadge,
    navBadgeText = DEFAULT_CONFIG.navBadgeText,

    isPreviewMode = DEFAULT_CONFIG.isPreviewMode,
    onPreviewBlockClickKey = DEFAULT_CONFIG.onPreviewBlockClickKey,

    onMenuLoaded,
    onMenuItemClick,
    onSearchSubmit,
    onPreviewBlockClick,
    className,
  } = props;

  const [internalMenu, setInternalMenu] = useState<HeaderAuroraOrangeNeo2025MenuItem[]>(menuItems ?? []);
  const [navLoading, setNavLoading] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [activeChip, setActiveChip] = useState<string | null>(null);

  // Keep internal menu in sync when not auto-loading
  useEffect(() => {
    if (!autoLoadMenu && menuItems) {
      setInternalMenu(menuItems);
      onMenuLoaded?.(menuItems);
    }
  }, [autoLoadMenu, menuItems, onMenuLoaded]);

  // Case 1: explicit menuApiUrl has highest priority
  useEffect(() => {
    if (!autoLoadMenu || !menuApiUrl) return;

    let mounted = true;

    (async () => {
      try {
        setNavLoading(true);
        const res = await fetch(menuApiUrl, { cache: "no-store" });
        if (!res.ok) {
          console.error("HeaderAuroraOrangeNeo2025 menuApiUrl load failed", res.status);
          return;
        }

        const data = await res.json();
        let items: HeaderAuroraOrangeNeo2025MenuItem[] = [];

        if (Array.isArray(data)) {
          items = data;
        } else if (Array.isArray(data?.items)) {
          items = data.items;
        }

        if (mounted && items.length) {
          setInternalMenu(items);
          onMenuLoaded?.(items);
        }
      } catch (e) {
        console.error("HeaderAuroraOrangeNeo2025 menuUrl load error", e);
      } finally {
        if (mounted) setNavLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [autoLoadMenu, menuApiUrl, onMenuLoaded]);

  // Case 2: autoLoadMenu without explicit menuApiUrl → /api/menu-items
  useEffect(() => {
    if (!autoLoadMenu || menuApiUrl) return;

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
          console.error("HeaderAuroraOrangeNeo2025 nav load failed", res.status);
          return;
        }

        const data = await res.json();
        const rows: DbMenuItem[] = data?.items ?? [];
        const mapped = mapDbMenuToItems(rows);

        if (mapped.length) {
          setInternalMenu(mapped);
          onMenuLoaded?.(mapped);
        }
      } catch (err) {
        console.error("HeaderAuroraOrangeNeo2025 nav load error", err);
      } finally {
        setNavLoading(false);
      }
    };

    load();
  }, [autoLoadMenu, menuApiUrl, locale, siteId, setKey, onMenuLoaded]);

  const topLevelMenu = useMemo(() => internalMenu ?? [], [internalMenu]);

  const effectiveCartCount = cartCount ?? 0;

  const handlePreviewClick = (e?: MouseEvent) => {
    if (!isPreviewMode) return;
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (onPreviewBlockClick && onPreviewBlockClickKey) {
      onPreviewBlockClick(onPreviewBlockClickKey);
    }
  };

  const handleLogoClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (isPreviewMode) {
      handlePreviewClick(e);
    }
  };

  const handleNavClick = (e: MouseEvent<HTMLAnchorElement>, item: HeaderAuroraOrangeNeo2025MenuItem) => {
    if (isPreviewMode) {
      handlePreviewClick(e);
      return;
    }
    onMenuItemClick?.(item);
  };

  const handleSearchSubmit = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const keyword = searchKeyword.trim();
    if (!keyword) return;

    if (isPreviewMode) {
      handlePreviewClick();
      return;
    }

    onSearchSubmit?.(keyword);
  };

  const handleChipClick = (chip: string) => {
    setActiveChip(chip);
    if (!searchKeyword) {
      setSearchKeyword(chip);
    }
  };

  const wrapperClassName = [
    styles.siteHeader,
    isMenuOpen ? styles.headerOpen : "",
    className ?? "",
    isPreviewMode ? styles.previewMode : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <header
      className={wrapperClassName}
      data-preview-block={onPreviewBlockClickKey}
      onClick={isPreviewMode ? handlePreviewClick : undefined}
    >
      <div className={styles.hdInner}>
        {/* LEFT: Brand / Logo */}
        <div className={styles.hdLeft}>
          <a href={logoHref || "#"} className={styles.brandLink} onClick={handleLogoClick}>
            <span className={styles.brandLogo}>{logoIconClass ? <i className={logoIconClass} /> : null}</span>
            <span className={styles.brandText}>
              {logoText && <span className={styles.brandMain}>{logoText}</span>}
              {logoSubtitle && <span className={styles.brandSub}>{logoSubtitle}</span>}
            </span>
          </a>
        </div>

        {/* MID: Nav + Search */}
        <div className={styles.hdMid}>
          <div className={styles.navRow}>
            {topLevelMenu.map((item) => (
              <a
                key={item.id}
                href={item.href || "#"}
                className={styles.navLink}
                onClick={(e) => handleNavClick(e, item)}
              >
                {item.label}
              </a>
            ))}

            {navLoading && <span className={styles.navLoading}>Đang tải...</span>}

            {showNavBadge && navBadgeText && (
              <div className={styles.navPill}>
                <i className="bi bi-fire" />
                {navBadgeText}
              </div>
            )}
          </div>

          <form className={styles.searchShell} onSubmit={handleSearchSubmit} onClick={(e) => e.stopPropagation()}>
            {showCategoryDropdown && (
              <button
                className={styles.searchCategoryBtn}
                type="button"
                onClick={isPreviewMode ? handlePreviewClick : undefined}
              >
                <i className="bi bi-grid-3x3-gap-fill" />
                <span>{categoryLabel}</span>
                <i className="bi bi-chevron-down" />
              </button>
            )}

            <div className={styles.searchInputWrap}>
              <div className={styles.searchInputRow}>
                <input
                  type="text"
                  className={styles.searchInput}
                  placeholder={searchPlaceholder}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                />
                {showFilterButton && (
                  <button
                    className={styles.searchFilterBtn}
                    type="button"
                    onClick={isPreviewMode ? handlePreviewClick : undefined}
                  >
                    <i className="bi bi-sliders" />
                  </button>
                )}
              </div>
              {highlightChips && highlightChips.length > 0 && (
                <div className={styles.searchChips}>
                  {highlightChips.map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      className={chip === activeChip ? `${styles.chip} ${styles.chipActive}` : styles.chip}
                      onClick={() => handleChipClick(chip)}
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className={styles.searchBtn}
              type="submit"
              onClick={isPreviewMode ? (e) => handlePreviewClick(e) : undefined}
            >
              <i className="bi bi-search" />
            </button>
          </form>
        </div>

        {/* RIGHT: Actions */}
        <div className={styles.hdRight}>
          <div className={styles.actionCol}>
            {showVoucherPill && voucherLabel && (
              <button
                className={styles.voucherPill}
                type="button"
                onClick={isPreviewMode ? handlePreviewClick : undefined}
              >
                <i className="bi bi-ticket-perforated" />
                {voucherLabel}
              </button>
            )}

            <div className={styles.iconsRow}>
              {showWishlist && (
                <button
                  className={styles.iconBtn}
                  type="button"
                  title="Yêu thích"
                  onClick={isPreviewMode ? handlePreviewClick : undefined}
                >
                  <i className="bi bi-heart" />
                </button>
              )}

              {showCart && (
                <button
                  className={styles.iconBtn}
                  type="button"
                  title="Giỏ hàng"
                  onClick={isPreviewMode ? handlePreviewClick : undefined}
                >
                  <i className="bi bi-bag" />
                  {effectiveCartCount > 0 && <span className={styles.cartBadge}>{effectiveCartCount}</span>}
                </button>
              )}

              {showAuth && authLabel && (
                <button
                  className={styles.loginBtn}
                  type="button"
                  onClick={isPreviewMode ? handlePreviewClick : undefined}
                >
                  <i className="bi bi-person" />
                  {authLabel}
                </button>
              )}

              <button
                className={styles.menuToggle}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isPreviewMode) {
                    handlePreviewClick(e);
                    return;
                  }
                  setIsMenuOpen((prev) => !prev);
                }}
              >
                <i className="bi bi-list" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export const HEADER_AURORA_ORANGE_NEO_2025_REGITEM: RegItem = {
  kind: "HeaderOrange",
  label: "Header Orange",
  defaults: DEFAULT_CONFIG,
  inspector: [],
  render: (p) => (<HeaderAuroraOrangeNeo2025 {...(p as HeaderAuroraOrangeNeo2025Props)} />) as React.ReactElement,
};

export default HeaderAuroraOrangeNeo2025;
