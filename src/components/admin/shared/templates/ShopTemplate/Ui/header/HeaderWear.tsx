"use client";

import React, { useState, useEffect, useRef, MouseEvent, FormEvent } from "react";

import styles from "@/components/admin/templates/ShopTemplate/styles/header/HeaderWear.module.css";
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

/** ===== Types cho nav ===== */
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

/** ===== Props HeaderWear ===== */
export interface HeaderWearProps {
  // Logo
  logoIconClass?: string;
  logoTitle?: string;
  logoSubtitle?: string;

  // Search
  showSearch?: boolean;
  searchPlaceholder?: string;

  // Actions
  accountLabel?: string;
  accountSubLabel?: string;
  orderLabel?: string;
  orderSubLabel?: string;
  cartCount?: number;

  // Nav từ props (override, dùng khi không muốn load API)
  navItems?: NavItem[];

  // Tự động load menu từ API
  autoLoadMenu?: boolean;
  locale?: string;
  siteId?: string;
  setKey?: string; // mặc định "home"

  // Promo bên phải menu
  showNavPromo?: boolean;
  navPromoBadge?: string;
  navPromoLabel?: string;
  navPromoSubLabel?: string;

  // Preview mode (chặn click)
  preview?: boolean;
}

/** ===== DEFAULTS ===== */
const DEFAULT_HEADER_WEAR_PROPS: HeaderWearProps = {
  logoIconClass: "bi bi-stars",
  logoTitle: "Aurora Wear",
  logoSubtitle: "Thời trang mỗi ngày – phối outfit nhanh, giữ mood nhẹ nhàng.",

  showSearch: true,
  searchPlaceholder: "Tìm áo, quần, váy, giày hoặc combo mix sẵn…",

  accountLabel: "Tài khoản",
  accountSubLabel: "Đăng nhập / Đăng ký",
  orderLabel: "Đơn hàng",
  orderSubLabel: "Theo dõi trạng thái",
  cartCount: 3,

  autoLoadMenu: true,
  locale: "en",
  setKey: "home",

  showNavPromo: true,
  navPromoBadge: "Blue",
  navPromoLabel: "Mood: Calm & Blue",
  navPromoSubLabel: "Gợi ý outfit theo tâm trạng",

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

/** ===================== UI COMPONENT ===================== */
export const HeaderWear: React.FC<HeaderWearProps> = (props) => {
  const {
    logoIconClass = DEFAULT_HEADER_WEAR_PROPS.logoIconClass,
    logoTitle = DEFAULT_HEADER_WEAR_PROPS.logoTitle,
    logoSubtitle = DEFAULT_HEADER_WEAR_PROPS.logoSubtitle,

    showSearch = DEFAULT_HEADER_WEAR_PROPS.showSearch,
    searchPlaceholder = DEFAULT_HEADER_WEAR_PROPS.searchPlaceholder,

    accountLabel = DEFAULT_HEADER_WEAR_PROPS.accountLabel,
    accountSubLabel = DEFAULT_HEADER_WEAR_PROPS.accountSubLabel,
    orderLabel = DEFAULT_HEADER_WEAR_PROPS.orderLabel,
    orderSubLabel = DEFAULT_HEADER_WEAR_PROPS.orderSubLabel,
    cartCount = DEFAULT_HEADER_WEAR_PROPS.cartCount,

    navItems: navItemsProp,
    autoLoadMenu = DEFAULT_HEADER_WEAR_PROPS.autoLoadMenu,
    locale = DEFAULT_HEADER_WEAR_PROPS.locale,
    siteId,
    setKey = DEFAULT_HEADER_WEAR_PROPS.setKey,

    showNavPromo = DEFAULT_HEADER_WEAR_PROPS.showNavPromo,
    navPromoBadge = DEFAULT_HEADER_WEAR_PROPS.navPromoBadge,
    navPromoLabel = DEFAULT_HEADER_WEAR_PROPS.navPromoLabel,
    navPromoSubLabel = DEFAULT_HEADER_WEAR_PROPS.navPromoSubLabel,

    preview = DEFAULT_HEADER_WEAR_PROPS.preview,
  } = props;

  /** ===== State: nav ===== */
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
          console.error("HeaderWear nav load failed", res.status);
          return;
        }

        const data = await res.json();
        const rows: DbMenuItem[] = data?.items ?? [];
        const tree = buildMenuTree(rows);
        if (tree.length) {
          setNavItems(tree);
        }
      } catch (err) {
        console.error("HeaderWear nav load error", err);
      } finally {
        setNavLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoadMenu, locale, siteId, setKey]);

  /** ===== Search category dropdown (giữ đơn giản như mẫu) ===== */
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [activeCat, setActiveCat] = useState("Tất cả danh mục");

  const catBtnRef = useRef<HTMLButtonElement | null>(null);
  const catDropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | globalThis.MouseEvent) => {
      const target = e.target as Node;
      if (catBtnRef.current && catDropRef.current && !catBtnRef.current.contains(target) && !catDropRef.current.contains(target)) {
        setIsCatOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside as any);
    return () => document.removeEventListener("click", handleClickOutside as any);
  }, []);

  /** ===== Mobile nav toggle ===== */
  const [isNavOpen, setIsNavOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | globalThis.MouseEvent) => {
      const target = e.target as Node;
      if (headerRef.current && !headerRef.current.contains(target)) {
        setIsNavOpen(false);
        setOpenSubIndex(null);
      }
    };
    document.addEventListener("click", handleClickOutside as any);
    return () => document.removeEventListener("click", handleClickOutside as any);
  }, []);

  /** ===== Submenu toggle ===== */
  const [openSubIndex, setOpenSubIndex] = useState<number | null>(null);

  const handleRootNavClick = (idx: number, hasSub: boolean, href: string) => (e: MouseEvent) => {
    if (!hasSub) {
      if (preview) {
        e.preventDefault();
        return;
      }
      return; // để browser điều hướng
    }
    e.preventDefault();
    e.stopPropagation();
    setOpenSubIndex((prev) => (prev === idx ? null : idx));
  };

  const handleLinkClick = (href?: string) => (e: MouseEvent) => {
    if (preview || !href) {
      e.preventDefault();
      return;
    }
  };

  /** ===== Search submit ===== */
  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (preview) return;
    const input = e.currentTarget.querySelector<HTMLInputElement>(`.${styles.hdSearchInput}`);
    console.log("Search:", input?.value);
  };

  /** =================== RENDER =================== */
  return (
    <header ref={headerRef} className={`${styles.siteHeader} ${isNavOpen ? styles.navOpen : ""}`}>
      <div className={styles.hdInner}>
        {/* LOGO */}
        <a href="#" className={styles.hdLogo} onClick={preview ? (e) => e.preventDefault() : undefined}>
          <div className={styles.hdLogoMark}>{logoIconClass && <i className={logoIconClass} />}</div>
          <div>
            <div className={styles.hdLogoTitle}>{logoTitle}</div>
            <div className={styles.hdLogoSub}>{logoSubtitle}</div>
          </div>
        </a>

        {/* SEARCH */}
        <div className={styles.hdCenter}>
          {showSearch && (
            <>
              <form className={styles.hdSearch} onSubmit={handleSearchSubmit}>
                <button
                  type="button"
                  className={styles.hdSearchCat}
                  ref={catBtnRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCatOpen((v) => !v);
                  }}>
                  <i className="bi bi-grid" />
                  <span>{activeCat}</span>
                  <i className="bi bi-chevron-down" />
                </button>
                <input className={styles.hdSearchInput} placeholder={searchPlaceholder} />
                <button className={styles.hdSearchBtn} type="submit">
                  <i className="bi bi-search" />
                  <span>Tìm kiếm</span>
                </button>
              </form>

              {/* CATEGORY DROPDOWN */}
              <div className={`${styles.hdCatDropdown} ${isCatOpen ? styles.isOpen : ""}`} ref={catDropRef}>
                {["Tất cả danh mục", "Thời trang nữ", "Thời trang nam", "Đồ trẻ em", "Đồ thể thao", "Đồ mặc nhà / ngủ", "Phụ kiện & Túi ví", "Giày dép"].map((label) => (
                  <button
                    key={label}
                    className={label === activeCat ? styles.isActive : undefined}
                    type="button"
                    onClick={() => {
                      setActiveCat(label);
                      setIsCatOpen(false);
                    }}>
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ACTIONS */}
        <div className={styles.hdRight}>
          <button className={styles.hdAction} type="button" onClick={preview ? (e) => e.preventDefault() : undefined}>
            <div className={styles.hdActionIcon}>
              <i className="bi bi-person" />
            </div>
            <div className={styles.hdActionText}>
              <span className={styles.label}>{accountLabel}</span>
              <span className={styles.sub}>{accountSubLabel}</span>
            </div>
          </button>

          <button className={styles.hdAction} type="button" onClick={preview ? (e) => e.preventDefault() : undefined}>
            <div className={styles.hdActionIcon}>
              <i className="bi bi-clipboard-check" />
            </div>
            <div className={styles.hdActionText}>
              <span className={styles.label}>{orderLabel}</span>
              <span className={styles.sub}>{orderSubLabel}</span>
            </div>
          </button>

          <button className={styles.hdCart} type="button" onClick={preview ? (e) => e.preventDefault() : undefined}>
            <div className={styles.hdCartIcon}>
              <i className="bi bi-bag" />
              {cartCount && cartCount > 0 && <span className={styles.hdCartBadge}>{cartCount}</span>}
            </div>
          </button>

          <button
            className={styles.hdMenuToggle}
            id="hdMenuToggle"
            type="button"
            aria-label="Mở menu"
            onClick={(e) => {
              e.stopPropagation();
              setIsNavOpen((v) => !v);
            }}>
            <i className="bi bi-list" />
          </button>
        </div>
      </div>

      {/* ========= MAIN NAV ========= */}
      <nav className={styles.hdMainnav} id="hdMainNav">
        <ul className={styles.hdNavList}>
          {navLoading && !navItems.length && (
            <li className={styles.hdNavItem}>
              <span className={styles.hdNavLink}>Đang tải menu...</span>
            </li>
          )}

          {/* Nút "New / Sale hôm nay" tuỳ bạn rename trong CSS */}
          <button className={styles.hdNavlink} type="button">
            <span>✨ New in / Sale hôm nay</span>
          </button>

          {/* Menu chính từ API / props */}
          {navItems.map((item, idx) => {
            if (!item.hasSub) {
              return (
                <li className={styles.hdNavItem} key={item.id}>
                  <a href={item.href} className={styles.hdNavLinkSimple ?? styles.hdNavLink} onClick={handleLinkClick(item.href)}>
                    {item.iconClass && <i className={item.iconClass} />}
                    <span>{item.label}</span>
                  </a>
                </li>
              );
            }

            const isOpen = openSubIndex === idx;

            return (
              <li key={item.id} className={`${styles.hdNavItem} ${styles.hasSub ?? ""} ${isOpen ? styles.isOpenSub : ""}`}>
                <button className={`${styles.hdNavLink} ${idx === 0 ? styles.isActive : ""}`} type="button" onClick={handleRootNavClick(idx, true, item.href)}>
                  <span>
                    {item.iconClass && <i className={item.iconClass} />}
                    {item.label}
                  </span>
                  <i className={`bi bi-chevron-down ${styles.hdNavCaret}`} />
                </button>
                <div className={styles.hdSubmenu}>
                  {item.subItems.map((sub) => (
                    <a key={sub.id} href={sub.href} onClick={handleLinkClick(sub.href)}>
                      <span>
                        {sub.iconClass && <i className={sub.iconClass} />}
                        {sub.label}
                      </span>
                      <span>
                        <i className="bi bi-chevron-right" />
                      </span>
                    </a>
                  ))}
                </div>
              </li>
            );
          })}

          {/* Promo khu vực bên phải nav */}
          {showNavPromo && (
            <li className={`${styles.hdNavItem} ${styles.hdNavPromo ?? ""}`}>
              <button type="button" className={styles.hdNavPromoBtn || styles.hdNavLink} onClick={preview ? (e) => e.preventDefault() : undefined}>
                {navPromoBadge && <span className={styles.hdNavPromoBadge}>{navPromoBadge}</span>}
                <div className={styles.hdNavPromoTextWrapper ?? ""}>
                  <span className={styles.hdNavPromoLabel ?? ""}>{navPromoLabel}</span>
                  {navPromoSubLabel && <span className={styles.hdNavPromoSub ?? ""}>{navPromoSubLabel}</span>}
                </div>
              </button>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
};

/** ===== RegItem cho UI Builder ===== */
export const HEADER_WEAR_REGITEM: RegItem = {
  kind: "HeaderWearKind",
  label: "Header Wear",
  defaults: DEFAULT_HEADER_WEAR_PROPS,
  inspector: [], // editor sẽ map riêng
  render: (p) => <HeaderWear {...(p as HeaderWearProps)} />,
};

export default HeaderWear;
