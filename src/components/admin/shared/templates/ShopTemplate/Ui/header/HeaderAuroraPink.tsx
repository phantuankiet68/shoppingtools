// components/templates/ShopTemplate/Ui/topbar/HeaderAuroraPink.tsx
"use client";

import React, { useEffect, useMemo, useState, FormEvent } from "react";
import styles from "@/styles/templates/ShopTemplate/header/HeaderAuroraPink.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/** ===== Types menu dùng trong UI ===== */
export type HeaderAuroraPinkMenuItem = {
  id: string;
  label: string;
  href?: string;
  parentId?: string | null;
  iconClass?: string;
  children?: HeaderAuroraPinkMenuItem[];
};

export type HeaderAuroraPinkConfig = {
  /** Menu: auto load hay truyền tay */
  autoLoadMenu?: boolean;
  /** Nếu truyền menu API custom thì dùng URL này */
  menuApiUrl?: string;
  /** Truyền sẵn menu (override autoLoadMenu) */
  menuItems?: HeaderAuroraPinkMenuItem[];

  /** Logo */
  logoText?: string;
  logoSubtitle?: string;
  logoHref?: string;
  logoIconClass?: string;

  /** Preview mode (chặn click, phục vụ builder) */
  isPreviewMode?: boolean;
  onPreviewBlockClickKey?: string;

  /** Search */
  searchPlaceholder?: string;
  showCategoryDropdown?: boolean;
  categoryLabel?: string;

  /** Actions */
  showWishlist?: boolean;
  showCart?: boolean;
  cartCount?: number;
  showAuth?: boolean;
  authLabel?: string;

  /** Tham số cho auto-load menu /api/admin/menus */
  locale?: string;
  siteId?: string;
  setKey?: string;
};

export interface HeaderAuroraPinkProps extends HeaderAuroraPinkConfig {
  onMenuLoaded?: (items: HeaderAuroraPinkMenuItem[]) => void;
  onMenuItemClick?: (item: HeaderAuroraPinkMenuItem) => void;
  onSearchSubmit?: (keyword: string) => void;
  onPreviewBlockClick?: (blockKey: string) => void;
  className?: string;
}

/** ===== Types DB giống HeaderPro (dùng khi auto load từ /api/admin/menus) ===== */
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

/** ===== Helpers ===== */
const defaultMenu: HeaderAuroraPinkMenuItem[] = [
  { id: "home", label: "Trang chủ", href: "#" },
  { id: "new", label: "Bộ sưu tập mới", href: "#" },
  { id: "dress", label: "Đầm & Váy", href: "#" },
  { id: "accessories", label: "Phụ kiện", href: "#" },
  { id: "sale", label: "Sale pastel", href: "#" },
];

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(" ");

function buildMenuTree(items: HeaderAuroraPinkMenuItem[]): HeaderAuroraPinkMenuItem[] {
  if (!items) return [];
  const map = new Map<string, HeaderAuroraPinkMenuItem>();
  const roots: HeaderAuroraPinkMenuItem[] = [];

  items.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });

  items.forEach((item) => {
    const node = map.get(item.id)!;
    if (item.parentId) {
      const parent = map.get(item.parentId);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

/** Map từ rows DB sang flat menu items cho Aurora Pink */
function mapDbMenuToAuroraMenu(rows: DbMenuItem[]): HeaderAuroraPinkMenuItem[] {
  if (!rows?.length) return [];
  // giống HeaderPro: lấy roots theo parentId, nhưng AuroraPink chỉ cần label/href
  return rows
    .filter((r) => !r.parentId) // chỉ lấy menu root; nếu muốn, có thể giữ parentId để build tree
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((r) => ({
      id: r.id,
      label: r.title,
      href: r.path ?? "#",
      parentId: r.parentId,
      iconClass: r.icon ?? undefined,
    }));
}

/** ===== DEFAULTS ===== */
const DEFAULT_CONFIG: HeaderAuroraPinkConfig = {
  autoLoadMenu: false,
  logoText: "Aurora Pink",
  logoSubtitle: "Fashion & Lifestyle 2025",
  logoHref: "#",
  logoIconClass: "bi bi-heart",
  searchPlaceholder: "Tìm váy, áo, phụ kiện pastel...",
  showCategoryDropdown: true,
  categoryLabel: "Danh mục",
  showWishlist: true,
  showCart: true,
  cartCount: 3,
  showAuth: true,
  authLabel: "Đăng nhập",
  locale: "vi",
  setKey: "home",
};

const HeaderAuroraPink: React.FC<HeaderAuroraPinkProps> = (props) => {
  const {
    autoLoadMenu = DEFAULT_CONFIG.autoLoadMenu,
    menuApiUrl,
    menuItems,
    onMenuLoaded,
    onMenuItemClick,
    onSearchSubmit,
    onPreviewBlockClick,
    onPreviewBlockClickKey = "header-aurora-pink",

    logoText = DEFAULT_CONFIG.logoText,
    logoSubtitle = DEFAULT_CONFIG.logoSubtitle,
    logoHref = DEFAULT_CONFIG.logoHref,
    logoIconClass = DEFAULT_CONFIG.logoIconClass,

    isPreviewMode,

    searchPlaceholder = DEFAULT_CONFIG.searchPlaceholder,
    showCategoryDropdown = DEFAULT_CONFIG.showCategoryDropdown,
    categoryLabel = DEFAULT_CONFIG.categoryLabel,

    showWishlist = DEFAULT_CONFIG.showWishlist,
    showCart = DEFAULT_CONFIG.showCart,
    cartCount = DEFAULT_CONFIG.cartCount,
    showAuth = DEFAULT_CONFIG.showAuth,
    authLabel = DEFAULT_CONFIG.authLabel,

    locale = DEFAULT_CONFIG.locale,
    siteId,
    setKey = DEFAULT_CONFIG.setKey,

    className,
  } = props;

  const [internalMenu, setInternalMenu] = useState<HeaderAuroraPinkMenuItem[]>(
    menuItems && menuItems.length ? menuItems : defaultMenu,
  );
  const [activeMenuId, setActiveMenuId] = useState<string | null>(internalMenu[0]?.id ?? null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [navLoading, setNavLoading] = useState(false);

  /** ===== useEffect 1: auto load menu từ custom menuApiUrl (nếu có) ===== */
  useEffect(() => {
    let isMounted = true;

    if (!autoLoadMenu || !menuApiUrl) return;

    (async () => {
      try {
        const res = await fetch(menuApiUrl);
        if (!res.ok) return;
        const data = (await res.json()) as HeaderAuroraPinkMenuItem[];
        if (!isMounted) return;

        setInternalMenu(data);
        onMenuLoaded?.(data);
      } catch (e) {
        console.error("HeaderAuroraPink menu load error (menuApiUrl)", e);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [autoLoadMenu, menuApiUrl, onMenuLoaded]);

  /** ===== useEffect 2: auto load menu từ /api/admin/menus (giống HeaderPro) ===== */
  useEffect(() => {
    // Nếu đang dùng menuApiUrl thì không gọi /api/admin/menus nữa
    if (!autoLoadMenu || menuApiUrl) {
      // Nếu autoLoadMenu = false mà có navItems truyền từ ngoài thì sync vào state
      if (!autoLoadMenu && menuItems && menuItems.length) {
        setInternalMenu(menuItems);
      }
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

        const res = await fetch(`/api/admin/menus?${params.toString()}`, {
          cache: "no-store",
        });

        if (!res.ok) {
          console.error("HeaderAuroraPink nav load failed", res.status);
          return;
        }

        const data = await res.json();
        const rows: DbMenuItem[] = data?.items ?? [];
        const mapped = mapDbMenuToAuroraMenu(rows);
        if (mapped.length) {
          setInternalMenu(mapped);
          onMenuLoaded?.(mapped);
        }
      } catch (err) {
        console.error("HeaderAuroraPink nav load error", err);
      } finally {
        setNavLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoadMenu, menuApiUrl, locale, siteId, setKey]);

  /** ===== useEffect 3: đồng bộ menuItems từ props ===== */
  useEffect(() => {
    if (menuItems && menuItems.length && !autoLoadMenu) {
      setInternalMenu(menuItems);
    }
  }, [menuItems, autoLoadMenu]);

  const menuTree = useMemo(() => buildMenuTree(internalMenu), [internalMenu]);

  const handleHeaderClickForPreview = () => {
    if (isPreviewMode && onPreviewBlockClick) {
      onPreviewBlockClick(onPreviewBlockClickKey);
    }
  };

  const handleMenuClick = (item: HeaderAuroraPinkMenuItem) => {
    setActiveMenuId(item.id);
    onMenuItemClick?.(item);
  };

  const handleSearchSubmitInternal = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = keyword.trim();
    if (!trimmed) {
      if (!onSearchSubmit) {
        alert("Bạn hãy nhập từ khóa cần tìm nhé 💖");
      }
      return;
    }

    if (onSearchSubmit) {
      onSearchSubmit(trimmed);
    } else {
      alert("Giả lập tìm kiếm: " + trimmed);
    }
  };

  const headerClassName = cx(styles.siteHeader, isMobileOpen && styles.siteHeaderOpen, className);

  return (
    <header className={headerClassName} onClick={handleHeaderClickForPreview}>
      <div className={styles.hdInner}>
        {/* LEFT – Brand */}
        <div className={styles.hdLeft}>
          <a href={logoHref} className={styles.hdBrand} onClick={(e) => isPreviewMode && e.preventDefault()}>
            <span className={styles.hdLogo}>{logoIconClass && <i className={logoIconClass} />}</span>
            <span className={styles.hdBrandText}>
              {logoText && <span className={styles.hdBrandMain}>{logoText}</span>}
              {logoSubtitle && <span className={styles.hdBrandSub}>{logoSubtitle}</span>}
            </span>
          </a>
        </div>

        {/* CENTER – Nav + Search */}
        <div className={styles.hdCenter}>
          <nav className={styles.hdNav}>
            {navLoading && !menuTree.length && <span className={styles.hdNavLink}>Đang tải menu...</span>}

            {menuTree.map((item) => {
              const isActive = activeMenuId === item.id;
              const hasChildren = item.children && item.children.length > 0;

              return (
                <div key={item.id} className={styles.hdNavItemWrapper}>
                  <a
                    href={item.href ?? "#"}
                    className={cx(styles.hdNavLink, isActive && styles.hdNavLinkActive)}
                    onClick={(e) => {
                      if (isPreviewMode) e.preventDefault();
                      handleMenuClick(item);
                    }}
                  >
                    {item.label}
                  </a>

                  {hasChildren && (
                    <div className={styles.hdSubmenu}>
                      {item.children!.map((child) => (
                        <a
                          key={child.id}
                          href={child.href ?? "#"}
                          className={styles.hdSubmenuLink}
                          onClick={(e) => {
                            if (isPreviewMode) e.preventDefault();
                            handleMenuClick(child);
                          }}
                        >
                          {child.label}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <form className={styles.hdSearch} onSubmit={handleSearchSubmitInternal}>
            {showCategoryDropdown && (
              <button
                className={styles.hdCatBtn}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  // chỗ để mở dropdown category nếu sau này cần
                }}
              >
                <i className="bi bi-grid-3x3-gap" />
                {categoryLabel && <span>{categoryLabel}</span>}
                <i className="bi bi-chevron-down" />
              </button>
            )}

            <input
              type="text"
              className={styles.hdSearchInput}
              placeholder={searchPlaceholder}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <button className={styles.hdSearchBtn} type="submit">
              <i className="bi bi-search" />
            </button>
          </form>
        </div>

        {/* RIGHT – actions */}
        <div className={styles.hdRight}>
          {showWishlist && (
            <button
              className={styles.hdIconBtn}
              type="button"
              title="Yêu thích"
              onClick={(e) => isPreviewMode && e.preventDefault()}
            >
              <i className="bi bi-heart" />
            </button>
          )}

          {showCart && (
            <button
              className={cx(styles.hdIconBtn, styles.hdCart)}
              type="button"
              title="Giỏ hàng"
              onClick={(e) => isPreviewMode && e.preventDefault()}
            >
              <i className="bi bi-bag" />
              {typeof cartCount === "number" && cartCount > 0 && (
                <span className={styles.hdCartBadge}>{cartCount}</span>
              )}
            </button>
          )}

          {showAuth && (
            <button className={styles.hdAuthBtn} type="button" onClick={(e) => isPreviewMode && e.preventDefault()}>
              <i className="bi bi-person" />
              {authLabel}
            </button>
          )}

          <button
            className={styles.hdMenuToggle}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileOpen((v) => !v);
            }}
          >
            <i className="bi bi-list" />
          </button>
        </div>
      </div>
    </header>
  );
};

/** ===== RegItem cho UI Builder (bạn đang thiếu) ===== */
export const HEADER_AURORA_PINK_REGITEM: RegItem = {
  kind: "HeaderPink",
  label: "Header Pink",
  defaults: DEFAULT_CONFIG,
  inspector: [], // phần editor đã tách riêng như HeaderProEditor
  render: (p) => <HeaderAuroraPink {...(p as HeaderAuroraPinkProps)} />,
};

export default HeaderAuroraPink;
