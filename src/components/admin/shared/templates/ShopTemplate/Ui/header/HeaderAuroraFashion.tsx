// components/templates/ShopTemplate/Ui/topbar/HeaderAuroraFashion.tsx
"use client";

import React, { useState, useEffect, MouseEvent, FormEvent } from "react";

import styles from "@/components/admin/shared/templates/ShopTemplate/styles/header/HeaderAuroraFashion.module.css";
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

/** ===== Props HeaderAuroraFashion ===== */
export interface HeaderAuroraFashionProps {
  // Logo / Brand
  logoIconClass?: string;
  brandTitle?: string;
  brandSubtitle?: string;

  // Meta pills dưới brand
  metaPills?: {
    iconClass?: string;
    label: string;
  }[];

  // Search
  searchPlaceholder?: string;
  showSearchChips?: boolean;
  searchChips?: string[];

  // Actions
  showWishlist?: boolean;
  wishlistLabel?: string;
  showAccount?: boolean;
  accountLabel?: string;
  showCart?: boolean;
  cartCount?: number;
  cartTotalText?: string; // "1.250.000₫"

  // Nav từ props hoặc API
  navItems?: NavItem[];
  autoLoadMenu?: boolean;
  locale?: string;
  siteId?: string;
  setKey?: string;

  // Bottom nav (mobile)
  showBottomNav?: boolean;

  // Preview mode (chặn alert / điều hướng)
  preview?: boolean;

  // Extra class
  className?: string;
}

/** ===== DEFAULTS ===== */
const DEFAULT_HEADER_AURORA_PROPS: HeaderAuroraFashionProps = {
  logoIconClass: "bi bi-stars",
  brandTitle: "Aurora Wardrobe",
  brandSubtitle: "Boutique thời trang – Mix & match chuẩn",

  metaPills: [
    { iconClass: "bi bi-truck", label: "Free ship > 499k" },
    { iconClass: "bi bi-bag-heart", label: "Đổi trả 7 ngày" },
  ],

  searchPlaceholder: "Tìm áo, quần, váy, set đồ, phụ kiện...",
  showSearchChips: true,
  searchChips: ["Set đồ đi làm", "Váy midi dự tiệc", "Áo khoác denim nữ", "Phụ kiện basic <199k"],

  showWishlist: true,
  wishlistLabel: "Yêu thích",
  showAccount: true,
  accountLabel: "Tài khoản",
  showCart: true,
  cartCount: 3,
  cartTotalText: "1.250.000₫",

  autoLoadMenu: false,
  locale: "en",
  setKey: "home",

  showBottomNav: true,
  preview: false,
};

/** Build tree từ flat DB rows -> NavItem[] */
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
export const HeaderAuroraFashion: React.FC<HeaderAuroraFashionProps> = (props) => {
  const {
    logoIconClass = DEFAULT_HEADER_AURORA_PROPS.logoIconClass,
    brandTitle = DEFAULT_HEADER_AURORA_PROPS.brandTitle,
    brandSubtitle = DEFAULT_HEADER_AURORA_PROPS.brandSubtitle,
    metaPills = DEFAULT_HEADER_AURORA_PROPS.metaPills ?? [],

    searchPlaceholder = DEFAULT_HEADER_AURORA_PROPS.searchPlaceholder,
    showSearchChips = DEFAULT_HEADER_AURORA_PROPS.showSearchChips,
    searchChips = DEFAULT_HEADER_AURORA_PROPS.searchChips ?? [],

    showWishlist = DEFAULT_HEADER_AURORA_PROPS.showWishlist,
    wishlistLabel = DEFAULT_HEADER_AURORA_PROPS.wishlistLabel,
    showAccount = DEFAULT_HEADER_AURORA_PROPS.showAccount,
    accountLabel = DEFAULT_HEADER_AURORA_PROPS.accountLabel,
    showCart = DEFAULT_HEADER_AURORA_PROPS.showCart,
    cartCount = DEFAULT_HEADER_AURORA_PROPS.cartCount,
    cartTotalText = DEFAULT_HEADER_AURORA_PROPS.cartTotalText,

    navItems: navItemsProp,
    autoLoadMenu = DEFAULT_HEADER_AURORA_PROPS.autoLoadMenu,
    locale = DEFAULT_HEADER_AURORA_PROPS.locale,
    siteId,
    setKey = DEFAULT_HEADER_AURORA_PROPS.setKey,

    showBottomNav = DEFAULT_HEADER_AURORA_PROPS.showBottomNav,
    preview = DEFAULT_HEADER_AURORA_PROPS.preview,
    className,
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
          console.error("HeaderAuroraFashion nav load failed", res.status);
          return;
        }

        const data = await res.json();
        const rows: DbMenuItem[] = data?.items ?? [];
        const tree = buildMenuTree(rows);
        if (tree.length) {
          setNavItems(tree);
        }
      } catch (err) {
        console.error("HeaderAuroraFashion nav load error", err);
      } finally {
        setNavLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoadMenu, locale, siteId, setKey]);

  /** ===== Search & chips ===== */
  const [searchValue, setSearchValue] = useState("");

  const handleRunSearch = (keyword: string) => {
    const q = keyword.trim();
    if (!q) {
      if (!preview) {
        alert("Vui lòng nhập từ khóa cần tìm 👗");
      }
      return;
    }
    if (!preview) {
      alert("Thực hiện tìm kiếm: " + q);
    } else {
      console.log("Preview search:", q);
    }
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    handleRunSearch(searchValue);
  };

  const handleChipClick = (keyword: string) => () => {
    setSearchValue(keyword);
  };

  /** ===== Nav submenu open (mobile) ===== */
  const [openNavIndex, setOpenNavIndex] = useState<number | null>(null);
  const [activeNavIndex, setActiveNavIndex] = useState<number>(0);

  const handleNavMainClick = (idx: number, hasSub: boolean) => (e: MouseEvent<HTMLButtonElement>) => {
    if (hasSub) {
      e.preventDefault();
      setOpenNavIndex((prev) => (prev === idx ? null : idx));
    }
    setActiveNavIndex(idx);
  };

  /** ===== Search popup mobile ===== */
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchValueMobile, setSearchValueMobile] = useState("");

  const openSearchModal = () => setIsSearchModalOpen(true);
  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
    setSearchValueMobile("");
  };

  const handleMobileSearchSubmit = () => {
    handleRunSearch(searchValueMobile);
    closeSearchModal();
  };

  /** ===== Bottom nav ===== */
  type BottomKey = "home" | "category" | "style" | "cart" | "account";
  const [bottomActive, setBottomActive] = useState<BottomKey>("home");

  const handleBottomNavClick = (key: BottomKey) => () => {
    setBottomActive(key);
    if (preview) return;
    switch (key) {
      case "home":
        alert("Đi tới Trang chủ.");
        break;
      case "category":
        alert("Mở danh mục sản phẩm.");
        break;
      case "style":
        alert("Gợi ý mix & match outfit.");
        break;
      case "cart":
        alert("Mở giỏ hàng.");
        break;
      case "account":
        alert("Mở trang tài khoản / đăng nhập.");
        break;
    }
  };

  /** =================== RENDER =================== */
  const rootClassName = `${styles.headerShell} ${className ?? ""}`.trim();

  return (
    <>
      <header className={rootClassName}>
        <div className={styles.headerInner}>
          {/* ===== MAIN TOP BLOCK ===== */}
          <div className={styles.headerMain}>
            {/* LEFT: Logo + Brand */}
            <div className={styles.hLeft}>
              <div className={styles.logoChip}>{logoIconClass && <i className={logoIconClass} />}</div>
              <div className={styles.brandBlock}>
                <div className={styles.brandMain}>{brandTitle}</div>
                {brandSubtitle && <div className={styles.brandSubtitle}>{brandSubtitle}</div>}
                {!!metaPills.length && (
                  <div className={styles.brandMetaRow}>
                    {metaPills.map((pill, idx) => (
                      <div key={idx} className={styles.metaPill}>
                        {pill.iconClass && <i className={pill.iconClass} />}
                        <span>{pill.label}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* CENTER: Search */}
            <div className={styles.hCenter}>
              {/* Search card (desktop / tablet) */}
              <form className={styles.searchCard} onSubmit={handleSearchSubmit}>
                <button
                  className={styles.btnCat}
                  type="button"
                  onClick={() => {
                    if (preview) return;
                    alert("Mở popover chọn danh mục (Women / Men / Phụ kiện...) 📂");
                  }}
                >
                  <i className="bi bi-grid" />
                  <span className={styles.label}>Danh mục</span>
                  <span className={styles.chevron}>
                    <i className="bi bi-chevron-down" />
                  </span>
                </button>

                <div className={styles.searchInputWrap}>
                  <input
                    className={styles.searchInput}
                    type="text"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                  <span className={styles.searchShortcut}>Enter</span>
                </div>

                <button
                  className={styles.btnVoice}
                  type="button"
                  onClick={() => {
                    if (preview) return;
                    alert("Tính năng tìm kiếm bằng giọng nói sẽ được cập nhật ✨");
                  }}
                >
                  <i className="bi bi-mic-fill" />
                </button>

                <button className={styles.btnSearch} type="submit">
                  <i className="bi bi-search" />
                  <span>Tìm kiếm</span>
                </button>
              </form>

              {/* Nút mở popup search (mobile) */}
              <button className={styles.searchTriggerMobile} type="button" onClick={openSearchModal}>
                <i className="bi bi-search" />
                <span>Tìm kiếm sản phẩm</span>
              </button>

              {/* Tags dưới search (desktop) */}
              {showSearchChips && (
                <div className={styles.searchTags}>
                  {searchChips.map((chip) => (
                    <button key={chip} type="button" className={styles.searchChip} onClick={handleChipClick(chip)}>
                      <span>{chip}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* RIGHT: Actions */}
            <div className={styles.hRight}>
              {showWishlist && (
                <button
                  className={styles.iconBtn}
                  type="button"
                  onClick={() => {
                    if (preview) return;
                    alert("Danh sách sản phẩm yêu thích của bạn đang trống.");
                  }}
                >
                  <div className={styles.iconCircle}>
                    <i className="bi bi-heart" />
                  </div>
                  <span className={styles.label}>{wishlistLabel}</span>
                </button>
              )}

              {showAccount && (
                <button
                  className={styles.iconBtn}
                  type="button"
                  onClick={() => {
                    if (preview) return;
                    alert("Đi tới màn đăng nhập / tài khoản.");
                  }}
                >
                  <div className={styles.iconCircle}>
                    <i className="bi bi-person" />
                  </div>
                  <span className={styles.label}>{accountLabel}</span>
                </button>
              )}
            </div>
          </div>

          {/* ===== NAV BAR + SUBMENU ===== */}
          <nav className={styles.headerNav}>
            <div className={styles.navInner}>
              <button
                className={styles.navAll}
                type="button"
                onClick={() => {
                  if (preview) return;
                  alert("Mở mega menu tất cả bộ sưu tập (sẽ gắn UI sau) 🛍️");
                }}
              >
                <i className="bi bi-list-ul" />
                <span>Tất cả bộ sưu tập</span>
              </button>

              {/* Loading */}
              {navLoading && !navItems.length && (
                <div className={styles.navItem}>
                  <button className={styles.navLinkMain} type="button">
                    Đang tải menu...
                  </button>
                </div>
              )}

              {/* Menu mặc định giống HTML khi không truyền navItems */}
              {(!navItems || navItems.length === 0) && (
                <>
                  {/* Thời trang nữ */}
                  <div className={`${styles.navItem} ${openNavIndex === 0 ? styles.isOpen : ""}`}>
                    <button
                      className={`${styles.navLinkMain} ${activeNavIndex === 0 ? styles.active : ""}`}
                      type="button"
                      onClick={handleNavMainClick(0, true)}
                    >
                      Thời trang nữ
                      <i className="bi bi-chevron-down" />
                    </button>
                    <div className={styles.submenu}>
                      <a href="#">Áo thun / Áo sơ mi</a>
                      <a href="#">Váy &amp; Đầm dự tiệc</a>
                      <a href="#">Quần jeans / Quần ống rộng</a>
                      <a href="#">Set đồ phối sẵn</a>
                    </div>
                  </div>

                  {/* Thời trang nam */}
                  <div className={`${styles.navItem} ${openNavIndex === 1 ? styles.isOpen : ""}`}>
                    <button
                      className={`${styles.navLinkMain} ${activeNavIndex === 1 ? styles.active : ""}`}
                      type="button"
                      onClick={handleNavMainClick(1, true)}
                    >
                      Thời trang nam
                      <i className="bi bi-chevron-down" />
                    </button>
                    <div className={styles.submenu}>
                      <a href="#">Áo polo / T-shirt</a>
                      <a href="#">Sơ mi công sở</a>
                      <a href="#">Quần jogger / kaki</a>
                      <a href="#">Áo khoác / Jacket</a>
                    </div>
                  </div>

                  {/* Đồ couple */}
                  <div className={`${styles.navItem} ${openNavIndex === 2 ? styles.isOpen : ""}`}>
                    <button
                      className={`${styles.navLinkMain} ${activeNavIndex === 2 ? styles.active : ""}`}
                      type="button"
                      onClick={handleNavMainClick(2, true)}
                    >
                      Đồ couple
                      <i className="bi bi-chevron-down" />
                    </button>
                    <div className={styles.submenu}>
                      <a href="#">Áo đôi</a>
                      <a href="#">Đồ ngủ couple</a>
                      <a href="#">Set đồ dã ngoại</a>
                    </div>
                  </div>

                  {/* Phụ kiện */}
                  <div className={`${styles.navItem} ${openNavIndex === 3 ? styles.isOpen : ""}`}>
                    <button
                      className={`${styles.navLinkMain} ${activeNavIndex === 3 ? styles.active : ""}`}
                      type="button"
                      onClick={handleNavMainClick(3, true)}
                    >
                      Phụ kiện
                      <i className="bi bi-chevron-down" />
                    </button>
                    <div className={styles.submenu}>
                      <a href="#">Túi xách / Ví</a>
                      <a href="#">Mũ / Nón</a>
                      <a href="#">Trang sức</a>
                      <a href="#">Thắt lưng</a>
                    </div>
                  </div>

                  {/* Sale */}
                  <div className={styles.navItem}>
                    <button
                      className={`${styles.navLinkMain} ${activeNavIndex === 4 ? styles.active : ""}`}
                      type="button"
                      onClick={handleNavMainClick(4, false)}
                    >
                      Sale cuối mùa
                    </button>
                  </div>
                </>
              )}

              {/* Menu từ API / props */}
              {navItems &&
                navItems.length > 0 &&
                navItems.map((item, idx) => (
                  <div
                    key={item.id}
                    className={`${styles.navItem} ${item.hasSub && openNavIndex === idx ? styles.isOpen : ""}`}
                  >
                    <button
                      type="button"
                      className={`${styles.navLinkMain} ${activeNavIndex === idx ? styles.active : ""}`}
                      onClick={handleNavMainClick(idx, item.hasSub)}
                    >
                      <span>{item.label}</span>
                      {item.hasSub && <i className="bi bi-chevron-down" />}
                    </button>
                    {item.hasSub && (
                      <div className={styles.submenu}>
                        {item.subItems.map((sub) => (
                          <a
                            key={sub.id}
                            href={sub.href}
                            onClick={(e) => {
                              if (preview) e.preventDefault();
                            }}
                          >
                            {sub.label}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              <span className={styles.navPillHighlight}>
                <i className="bi bi-lightning" />
                Deal giờ vàng • -50%
              </span>

              {showCart && (
                <button
                  className={styles.cartBtn}
                  type="button"
                  onClick={() => {
                    if (preview) return;
                    alert("Đi tới trang giỏ hàng của bạn 💜");
                  }}
                >
                  <div className={styles.cartIconWrap}>
                    <i className="bi bi-bag-check" />
                    {typeof cartCount === "number" && cartCount > 0 && (
                      <span className={styles.cartBadge}>{cartCount}</span>
                    )}
                  </div>
                  <div className={styles.cartText}>
                    <span className={styles.cartLabel}>Giỏ hàng</span>
                    <span className={styles.cartTotal}>{cartTotalText}</span>
                  </div>
                </button>
              )}
            </div>
          </nav>
        </div>
      </header>

      {/* ===== BOTTOM NAV – MOBILE TAB BAR ===== */}
      {showBottomNav && (
        <nav className={styles.bottomNav} aria-label="Thanh điều hướng dưới mobile">
          <div className={styles.bottomNavInner}>
            <button
              type="button"
              className={`${styles.bottomNavItem} ${bottomActive === "home" ? styles.active : ""}`}
              onClick={handleBottomNavClick("home")}
            >
              <i className="bi bi-house-door" />
              <span>Trang chủ</span>
            </button>

            <button
              type="button"
              className={`${styles.bottomNavItem} ${bottomActive === "category" ? styles.active : ""}`}
              onClick={handleBottomNavClick("category")}
            >
              <i className="bi bi-grid-3x3-gap" />
              <span>Danh mục</span>
            </button>

            <button
              type="button"
              className={`${styles.bottomNavItem} ${bottomActive === "style" ? styles.active : ""}`}
              onClick={handleBottomNavClick("style")}
            >
              <i className="bi bi-magic" />
              <span>Mix đồ</span>
            </button>

            <button
              type="button"
              className={`${styles.bottomNavItem} ${bottomActive === "cart" ? styles.active : ""}`}
              onClick={handleBottomNavClick("cart")}
            >
              <i className="bi bi-bag" />
              <span>Giỏ hàng</span>
            </button>

            <button
              type="button"
              className={`${styles.bottomNavItem} ${bottomActive === "account" ? styles.active : ""}`}
              onClick={handleBottomNavClick("account")}
            >
              <i className="bi bi-person" />
              <span>Tài khoản</span>
            </button>
          </div>
        </nav>
      )}

      {/* ===== POPUP SEARCH MOBILE ===== */}
      <div className={`${styles.searchModal} ${isSearchModalOpen ? styles.open : ""}`} aria-hidden={!isSearchModalOpen}>
        <div className={styles.searchModalBackdrop} onClick={closeSearchModal} />
        <div className={styles.searchModalPanel}>
          <div className={styles.searchModalHeader}>
            <i className="bi bi-search" />
            <input
              className={styles.searchModalInput}
              type="text"
              placeholder={searchPlaceholder}
              value={searchValueMobile}
              onChange={(e) => setSearchValueMobile(e.target.value)}
            />
            <button
              className={styles.searchCloseBtn}
              type="button"
              onClick={closeSearchModal}
              aria-label="Đóng tìm kiếm"
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>
          <button className={styles.searchModalBtn} type="button" onClick={handleMobileSearchSubmit}>
            <span>Tìm kiếm</span>
            <i className="bi bi-arrow-return-right" />
          </button>

          <div className={styles.searchModalTags}>
            <div className={styles.searchModalTagsTitle}>Gợi ý nhanh</div>
            <div className={styles.searchModalTagsGrid}>
              {searchChips.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  className={styles.searchChipMobile}
                  onClick={() => setSearchValueMobile(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

/** ===== RegItem cho UI Builder ===== */
export const HEADER_AURORA_FASHION_REGITEM: RegItem = {
  kind: "HeaderBlue",
  label: "Header Blue",
  defaults: DEFAULT_HEADER_AURORA_PROPS,
  inspector: [],
  render: (p) => <HeaderAuroraFashion {...(p as HeaderAuroraFashionProps)} />,
};

export default HeaderAuroraFashion;
