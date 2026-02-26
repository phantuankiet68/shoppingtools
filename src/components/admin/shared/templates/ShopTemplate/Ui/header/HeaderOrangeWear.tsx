// components/templates/ShopTemplate/Ui/topbar/HeaderOrangeWear.tsx
"use client";

import React, { useEffect, useRef, useState, FormEvent, MouseEvent as ReactMouseEvent } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/header/HeaderOrangeWear.module.css";
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

/** ===== Props HeaderOrangeWear ===== */
export interface HeaderOrangeWearProps {
  // Brand
  brandInitials?: string;
  brandName?: string;
  brandSubtitle?: string;
  brandBadge?: string;

  // Search
  searchPlaceholder?: string;

  // Actions
  loginLabel?: string;
  cartLabel?: string;
  cartCount?: number;

  // Nav từ props (override, dùng khi không muốn load API)
  navItems?: NavItem[];

  // Tự động load menu từ API
  autoLoadMenu?: boolean;
  locale?: string;
  siteId?: string;
  setKey?: string; // ví dụ "home"

  // Preview mode (chặn click / điều hướng / alert)
  preview?: boolean;
}

/** ===== DEFAULTS ===== */
const DEFAULT_ORANGE_HEADER_PROPS: HeaderOrangeWearProps = {
  brandInitials: "OW",
  brandName: "OrangeWear",
  brandSubtitle: "",
  brandBadge: "2025 Edition",

  searchPlaceholder: "Tìm: áo sơ mi trắng, váy công sở, áo khoác jean, set đồ đi làm...",

  loginLabel: "Đăng nhập",
  cartLabel: "Giỏ hàng",
  cartCount: 4,

  autoLoadMenu: true,
  locale: "en",
  setKey: "home",

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
export const HeaderOrangeWear: React.FC<HeaderOrangeWearProps> = (props) => {
  const {
    brandInitials = DEFAULT_ORANGE_HEADER_PROPS.brandInitials,
    brandName = DEFAULT_ORANGE_HEADER_PROPS.brandName,
    brandSubtitle = DEFAULT_ORANGE_HEADER_PROPS.brandSubtitle,
    brandBadge = DEFAULT_ORANGE_HEADER_PROPS.brandBadge,

    searchPlaceholder = DEFAULT_ORANGE_HEADER_PROPS.searchPlaceholder,

    loginLabel = DEFAULT_ORANGE_HEADER_PROPS.loginLabel,
    cartLabel = DEFAULT_ORANGE_HEADER_PROPS.cartLabel,
    cartCount = DEFAULT_ORANGE_HEADER_PROPS.cartCount,

    navItems: navItemsProp,
    autoLoadMenu = DEFAULT_ORANGE_HEADER_PROPS.autoLoadMenu,
    locale = DEFAULT_ORANGE_HEADER_PROPS.locale,
    siteId,
    setKey = DEFAULT_ORANGE_HEADER_PROPS.setKey,

    preview = DEFAULT_ORANGE_HEADER_PROPS.preview,
  } = props;

  /** ===== Sticky header ===== */
  const headerRef = useRef<HTMLElement | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /** ===== State: nav (load từ API giống HeaderPro) ===== */
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
          console.error("HeaderOrangeWear nav load failed", res.status);
          return;
        }

        const data = await res.json();
        const rows: DbMenuItem[] = data?.items ?? [];
        const tree = buildMenuTree(rows);
        if (tree.length) {
          setNavItems(tree);
        }
      } catch (err) {
        console.error("HeaderOrangeWear nav load error", err);
      } finally {
        setNavLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoadMenu, locale, siteId, setKey, navItemsProp]);

  /** ===== Dropdown "Bộ sưu tập nổi bật" ===== */
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [activeCollection, setActiveCollection] = useState("Nổi bật");
  const catBtnRef = useRef<HTMLDivElement | null>(null);
  const catDropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | globalThis.MouseEvent) => {
      const target = e.target as Node;
      if (catBtnRef.current && catDropdownRef.current && !catBtnRef.current.contains(target) && !catDropdownRef.current.contains(target)) {
        setIsCatOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside as any);
    return () => document.removeEventListener("click", handleClickOutside as any);
  }, []);

  const highlightCollections = [
    {
      id: "office",
      label: "Office Chic",
      description: "Office Chic — Công sở thanh lịch",
      iconClass: "bi bi-briefcase",
    },
    {
      id: "streetwear",
      label: "Streetwear",
      description: "Streetwear — Cá tính & năng động",
      iconClass: "bi bi-lightning",
    },
    {
      id: "weekend",
      label: "Weekend Chill",
      description: "Weekend Chill — Đi chơi cuối tuần",
      iconClass: "bi bi-cup-hot",
    },
    {
      id: "date",
      label: "Date Night",
      description: "Date Night — Hẹn hò lãng mạn",
      iconClass: "bi bi-balloon-heart",
    },
  ];

  /** ===== Search ===== */
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (preview) return;
    const keyword = searchInputRef.current?.value || "(chưa nhập)";
    // tuỳ bạn xử lý router tại đây
    alert("Tìm outfit với từ khóa: " + keyword);
  };

  const focusSearchInput = () => {
    if (!searchInputRef.current) return;
    searchInputRef.current.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
    searchInputRef.current.focus();
  };

  /** ===== Mobile nav panel + submenu accordion ===== */
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [openMobileSub, setOpenMobileSub] = useState<string | null>(null);

  const toggleMobilePanel = () => {
    setIsMobilePanelOpen((v) => !v);
  };

  const handleMobileParentClick = (id: string) => {
    setOpenMobileSub((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 960) {
        setIsMobilePanelOpen(false);
        setOpenMobileSub(null);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /** ===== Bottom tabbar actions ===== */
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleWishlistClick = () => {
    if (preview) return;
    alert("Bạn chưa có sản phẩm yêu thích nào. Hãy thêm vài item ♥");
  };

  const handleCartClick = () => {
    if (preview) return;
    alert("Đi đến giỏ hàng (demo). Ở dự án thật bạn chuyển sang /cart.");
  };

  const handleAnchorClick = (href?: string) => (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (preview || !href || href === "#") {
      e.preventDefault();
      return;
    }
    // nếu cần xử lý SPA routing thì thêm ở đây
  };

  /** =================== RENDER =================== */
  return (
    <>
      <div className={styles.siteHeaderWrap}>
        <header ref={headerRef} className={`${styles.siteHeader} ${isScrolled ? styles.isScrolled : ""}`}>
          <div className={styles.siteHeaderInner}>
            {/* === HÀNG TRÊN === */}
            <div className={styles.hdrRowTop}>
              {/* LEFT: BRAND */}
              <div className={styles.hdrLeft}>
                <a href="#" className={styles.hdrBrand} onClick={preview ? (e) => e.preventDefault() : undefined}>
                  <div className={styles.hdrLogo}>
                    <span>{brandInitials}</span>
                  </div>
                  <div className={styles.hdrBrandText}>
                    <span className={styles.hdrBrandMain}>{brandName}</span>
                    <span className={styles.hdrBrandSub}>
                      {brandSubtitle}
                      {brandBadge && <span className={styles.hdrBadgePill}>{brandBadge}</span>}
                    </span>
                  </div>
                </a>
              </div>

              {/* CENTER: CATEGORY PILL + DESKTOP NAV */}
              <div className={styles.hdrCenterTop}>
                {/* Bộ sưu tập nổi bật */}
                <div
                  className={styles.hdrCatPill}
                  ref={catBtnRef}
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCatOpen((v) => !v);
                  }}>
                  <i className="bi bi-stars" />
                  <span>{activeCollection}</span>
                  <i className="bi bi-chevron-down" />

                  <div className={`${styles.hdrCatDropdown} ${isCatOpen ? styles.isOpen : ""}`} ref={catDropdownRef}>
                    {highlightCollections.map((c) => (
                      <div
                        key={c.id}
                        className={styles.hdrCatItem}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveCollection(c.label);
                          setIsCatOpen(false);
                        }}>
                        <i className={c.iconClass} />
                        <span>{c.description}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NAV DESKTOP - LOAD TỪ API / PROPS */}
                <nav className={styles.hdrNavDesktop} aria-label="Main navigation">
                  <ul className={styles.hdrNavList}>
                    {navLoading && !navItems.length && (
                      <li className={styles.hdrNavItem}>
                        <span className={styles.hdrNavLink}>Đang tải menu...</span>
                      </li>
                    )}

                    {navItems.map((item) => (
                      <li key={item.id} className={styles.hdrNavItem}>
                        <a href={item.href} className={styles.hdrNavLink} onClick={handleAnchorClick(item.href)}>
                          {item.iconClass && <i className={item.iconClass} />}
                          <span>{item.label}</span>
                          {item.hasSub && <i className="bi bi-chevron-down" />}
                        </a>

                        {item.hasSub && (
                          <div className={styles.hdrSubmenu}>
                            <div className={styles.hdrSubmenuTitle}>{item.label}</div>
                            <ul className={styles.hdrSubmenuList}>
                              {item.subItems.map((sub) => (
                                <li key={sub.id} className={styles.hdrSubmenuItem}>
                                  <a href={sub.href} onClick={handleAnchorClick(sub.href)}>
                                    <span>
                                      {sub.iconClass && <i className={sub.iconClass} />}
                                      {sub.label}
                                    </span>
                                    <span>
                                      <i className="bi bi-chevron-right" />
                                    </span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </nav>
              </div>

              {/* RIGHT: ACTIONS + MOBILE TOGGLE */}
              <div className={styles.hdrRightTop}>
                <button
                  type="button"
                  className={styles.hdrGhostBtn}
                  onClick={
                    preview
                      ? (e) => e.preventDefault()
                      : () => {
                          // login click handler tuỳ bạn
                        }
                  }>
                  <i className="bi bi-person-circle" />
                  <span>{loginLabel}</span>
                </button>
                <button
                  type="button"
                  className={styles.hdrCartBtn}
                  onClick={
                    preview
                      ? (e) => e.preventDefault()
                      : () => {
                          handleCartClick();
                        }
                  }>
                  <i className="bi bi-bag-heart" />
                  <span>{cartLabel}</span>
                  {typeof cartCount === "number" && <span className={styles.hdrCartCount}>{cartCount}</span>}
                </button>

                {/* MOBILE TOGGLE */}
                <div className={styles.hdrMobileToggle}>
                  <button type="button" className={styles.hdrMobileSearchBtn} title="Tìm nhanh" onClick={focusSearchInput}>
                    <i className="bi bi-search" />
                  </button>
                  <button type="button" className={`${styles.hdrMobileBurger} ${isMobilePanelOpen ? styles.isActive : ""}`} aria-label="Mở menu" onClick={toggleMobilePanel}>
                    <i className="bi bi-list" />
                  </button>
                </div>
              </div>
            </div>

            {/* MOBILE PANEL (NAV + QUICK TAGS) */}
            <div className={`${styles.hdrMobilePanel} ${isMobilePanelOpen ? styles.isOpen : ""}`}>
              <div className={styles.hdrNavMobileTitle}>DANH MỤC</div>
              <ul className={styles.hdrNavMobileList}>
                {/* New In - luôn mở ở đầu (giống bản HTML) */}
                <li className={styles.hdrNavMobileItem}>
                  <div className={`${styles.hdrMobileSubmenu} ${openMobileSub === "mSubNewIn" ? styles.isOpen : ""}`}>
                    <a href="#" onClick={handleAnchorClick("#")}>
                      <span>
                        <i className="bi bi-lightning" />
                        Drop mới hôm nay
                      </span>
                      <span>New</span>
                    </a>
                    <a href="#" onClick={handleAnchorClick("#")}>
                      <span>
                        <i className="bi bi-stars" />
                        Limited collection
                      </span>
                      <span>Limited</span>
                    </a>
                  </div>
                </li>

                {/* Nữ */}
                <li className={styles.hdrNavMobileItem}>
                  <button className={styles.hdrNavMobileParent} type="button" onClick={() => handleMobileParentClick("mSubWomen")}>
                    <span>
                      <i className="bi bi-gender-female" />
                      <span>Nữ</span>
                    </span>
                    <i className="bi bi-chevron-down" />
                  </button>
                  <div className={`${styles.hdrMobileSubmenu} ${openMobileSub === "mSubWomen" ? styles.isOpen : ""}`}>
                    <a href="#" onClick={handleAnchorClick("#")}>
                      <span>
                        <i className="bi bi-droplet-half" />
                        Áo sơ&nbsp;mi
                      </span>
                      <span>Hot</span>
                    </a>
                    <a href="#" onClick={handleAnchorClick("#")}>
                      <span>
                        <i className="bi bi-scissors" />
                        Váy / Đầm
                      </span>
                      <span>Đẹp đi làm</span>
                    </a>
                    <a href="#" onClick={handleAnchorClick("#")}>
                      <span>
                        <i className="bi bi-border-style" />
                        Quần / Jeans
                      </span>
                      <span>Daily</span>
                    </a>
                  </div>
                </li>

                {/* Nam */}
                <li className={styles.hdrNavMobileItem}>
                  <button className={styles.hdrNavMobileParent} type="button" onClick={() => handleMobileParentClick("mSubMen")}>
                    <span>
                      <i className="bi bi-gender-male" />
                      <span>Nam</span>
                    </span>
                    <i className="bi bi-chevron-down" />
                  </button>
                  <div className={`${styles.hdrMobileSubmenu} ${openMobileSub === "mSubMen" ? styles.isOpen : ""}`}>
                    <a href="#" onClick={handleAnchorClick("#")}>
                      <span>
                        <i className="bi bi-shirt" />
                        Áo thun basic
                      </span>
                      <span>3 for 2</span>
                    </a>
                    <a href="#" onClick={handleAnchorClick("#")}>
                      <span>
                        <i className="bi bi-diagram-2" />
                        Áo sơ mi
                      </span>
                      <span>Office</span>
                    </a>
                  </div>
                </li>

                {/* Trẻ em */}
                <li className={styles.hdrNavMobileItem}>
                  <button className={styles.hdrNavMobileParent} type="button" onClick={() => handleMobileParentClick("mSubKids")}>
                    <span>
                      <i className="bi bi-emoji-smile" />
                      <span>Trẻ em</span>
                    </span>
                    <i className="bi bi-chevron-down" />
                  </button>
                  <div className={`${styles.hdrMobileSubmenu} ${openMobileSub === "mSubKids" ? styles.isOpen : ""}`}>
                    <a href="#" onClick={handleAnchorClick("#")}>
                      <span>
                        <i className="bi bi-brightness-high" />
                        Đi học
                      </span>
                      <span>School</span>
                    </a>
                    <a href="#" onClick={handleAnchorClick("#")}>
                      <span>
                        <i className="bi bi-balloon-heart" />
                        Đi chơi
                      </span>
                      <span>Weekend</span>
                    </a>
                  </div>
                </li>

                {/* Sale */}
                <li className={styles.hdrNavMobileItem}>
                  <button className={styles.hdrNavMobileParent} type="button" onClick={() => handleMobileParentClick("mSubSale")}>
                    <span>
                      <i className="bi bi-percent" />
                      <span>Sale cuối tuần</span>
                    </span>
                    <i className="bi bi-chevron-down" />
                  </button>
                  <div className={`${styles.hdrMobileSubmenu} ${openMobileSub === "mSubSale" ? styles.isOpen : ""}`}>
                    <a href="#" onClick={handleAnchorClick("#")}>
                      <span>
                        <i className="bi bi-clock" />
                        Flash sale 3h
                      </span>
                      <span>-50%</span>
                    </a>
                    <a href="#" onClick={handleAnchorClick("#")}>
                      <span>
                        <i className="bi bi-lightning-charge" />
                        Deal từ 99k
                      </span>
                      <span>Hot</span>
                    </a>
                  </div>
                </li>
              </ul>

              <div style={{ marginTop: 10 }}>
                <div className={styles.hdrNavMobileTitle}>GỢI Ý NHANH</div>
                <div className={styles.hdrQuickLinks}>
                  <span>Áo sơ mi trắng đi làm</span>
                  <span>Váy công sở dưới 500k</span>
                  <span>Set đồ đi Đà Lạt</span>
                  <span>Áo khoác jean unisex</span>
                </div>
              </div>
            </div>

            {/* HÀNG DƯỚI: SEARCH */}
            <div className={styles.hdrRowBottom}>
              <div className={styles.hdrSearchShell}>
                <form className={styles.hdrSearch} onSubmit={handleSearchSubmit}>
                  <div className={styles.hdrSearchInputWrap}>
                    <i className="bi bi-search" />
                    <input ref={searchInputRef} type="text" className={styles.hdrSearchInput} placeholder={searchPlaceholder} />
                  </div>

                  <div className={styles.hdrSearchActions}>
                    <button type="button" className={styles.hdrIconBtn} title="Tìm bằng giọng nói" onClick={preview ? undefined : () => {}}>
                      <i className="bi bi-mic" />
                    </button>
                    <button type="button" className={styles.hdrIconBtn} title="Quét mã sản phẩm" onClick={preview ? undefined : () => {}}>
                      <i className="bi bi-qr-code-scan" />
                    </button>
                    <button type="submit" className={styles.hdrSearchSubmit}>
                      <i className="bi bi-search" />
                      <span>Tìm outfit</span>
                    </button>
                  </div>
                </form>

                {/* QUICK TAGS DESKTOP */}
                <div className={styles.hdrQuickLinks}>
                  <span>Set đồ đi làm mỗi ngày</span>
                  <span>Áo khoác nhẹ cho dân văn phòng</span>
                  <span>Outfit đi cafe cuối tuần</span>
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* BOTTOM NAVIGATION (MOBILE TAB BAR) */}
      <nav className={styles.mobileTabbar} aria-label="Mobile navigation">
        <div className={styles.mobileTabbarInner}>
          <button type="button" className={`${styles.mobileTabBtn} ${styles.mobileTabBtnPrimary}`} onClick={scrollToTop}>
            <i className="bi bi-house-door" />
            <span>Trang chủ</span>
          </button>

          <button
            type="button"
            className={styles.mobileTabBtn}
            onClick={() => {
              setIsMobilePanelOpen((v) => !v);
            }}>
            <i className="bi bi-grid-3x3-gap" />
            <span>Danh mục</span>
          </button>

          <button type="button" className={styles.mobileTabBtn} onClick={focusSearchInput}>
            <i className="bi bi-search" />
            <span>Tìm kiếm</span>
          </button>

          <button type="button" className={styles.mobileTabBtn} onClick={handleWishlistClick}>
            <i className="bi bi-heart" />
            <span>Yêu thích</span>
          </button>

          <div className={styles.mobileTabBtnWrap}>
            <button type="button" className={styles.mobileTabBtn} onClick={handleCartClick}>
              <i className="bi bi-bag-heart" />
              <span>Giỏ hàng</span>
            </button>
            {typeof cartCount === "number" && <div className={styles.mobileTabBadge}>{cartCount}</div>}
          </div>
        </div>
      </nav>
    </>
  );
};

/** ===== RegItem cho UI Builder ===== */
export const HEADER_ORANGEWEAR_REGITEM: RegItem = {
  kind: "HeaderWear",
  label: "Header Wear",
  defaults: DEFAULT_ORANGE_HEADER_PROPS,
  inspector: [],
  render: (p) => <HeaderOrangeWear {...(p as HeaderOrangeWearProps)} />,
};

export default HeaderOrangeWear;
