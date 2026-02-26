// components/templates/ShopTemplate/Ui/topbar/HeaderAurora.tsx
"use client";

import React, { useState, useEffect, useRef, FormEvent, MouseEvent as ReactMouseEvent, KeyboardEvent } from "react";

import styles from "@/components/admin/shared/templates/ShopTemplate/styles/header/HeaderAurora.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/** ===== Nav types (chuẩn giống HeaderPro) ===== */
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

/** Build tree từ flat DB rows (giống HeaderPro) */
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

/** ===== Các type phụ cho content Aurora ===== */
type TickerItem = {
  tag: string;
  content: string;
};

type BottomNavItem = {
  id: string;
  label: string;
  iconClass: string;
};

export interface HeaderAuroraProps {
  // Brand
  brandName?: string;
  brandChip?: string;

  // Search
  searchPlaceholder?: string;
  searchMobilePlaceholder?: string;
  searchButtonLabel?: string;
  searchHints?: string[];
  searchSuggests?: string[];

  // User
  welcomeName?: string;
  userRole?: string;
  notifCount?: number;
  cartCount?: number;

  // Ticker
  tickerTitle?: string;
  tickerItems?: TickerItem[];

  // Bottom nav (tab bar)
  bottomNavItems?: BottomNavItem[];

  // Nav từ props / API (giống HeaderPro)
  navItems?: NavItem[];
  autoLoadMenu?: boolean;
  locale?: string;
  siteId?: string;
  setKey?: string;

  // Preview mode
  preview?: boolean;
}

/** ===== Defaults ===== */
const DEFAULT_HEADER_AURORA_PROPS: HeaderAuroraProps = {
  brandName: "Aurora Wear",
  brandChip: "Fashion Studio",

  searchPlaceholder: "Tìm đầm maxi, áo blazer, sneaker trắng hoặc mã đơn hàng...",
  searchMobilePlaceholder: "Tìm outfit, sản phẩm, mã đơn...",
  searchButtonLabel: "Tìm outfit",
  searchHints: ["Lookbook Thu Đông 2025", "Basic Capsule Wardrobe", "Sale cuối mùa -50%", "Sneaker & Túi mini"],
  searchSuggests: [
    "Set suit công sở nữ",
    "Áo thun basic oversize",
    "Sneaker trắng phối đồ",
    "Đầm satin dự tiệc",
    "Cardigan len Hàn Quốc",
  ],

  welcomeName: "Xin chào, Bạn",
  userRole: "Aurora Member",
  notifCount: 5,
  cartCount: 3,

  tickerTitle: "Aurora Wear Updates",
  tickerItems: [
    {
      tag: "NEW",
      content: "Ra mắt collection Aura Blue – phối được 12 outfit với 8 items.",
    },
    {
      tag: "SALE",
      content: "Flash Sale cuối tuần – Giảm đến 50% áo khoác, blazer, knit wear.",
    },
    {
      tag: "STYLE",
      content: "Thêm 20+ gợi ý mix đồ kèm ảnh thật từ khách hàng Aurora Club.",
    },
  ],

  bottomNavItems: [
    { id: "home", label: "Trang chủ", iconClass: "bi bi-house-door" },
    { id: "category", label: "Danh mục", iconClass: "bi bi-grid-3x3-gap" },
    { id: "style", label: "Mix đồ", iconClass: "bi bi-magic" },
    { id: "cart", label: "Giỏ hàng", iconClass: "bi bi-bag" },
    { id: "account", label: "Tài khoản", iconClass: "bi bi-person" },
  ],

  // giống HeaderPro: tự load menu
  autoLoadMenu: true,
  locale: "en",
  setKey: "home",

  preview: false,
};

/** ===================== UI COMPONENT ===================== */
export const HeaderAurora: React.FC<HeaderAuroraProps> = (props) => {
  const {
    brandName = DEFAULT_HEADER_AURORA_PROPS.brandName,
    brandChip = DEFAULT_HEADER_AURORA_PROPS.brandChip,

    searchPlaceholder = DEFAULT_HEADER_AURORA_PROPS.searchPlaceholder,
    searchMobilePlaceholder = DEFAULT_HEADER_AURORA_PROPS.searchMobilePlaceholder,
    searchButtonLabel = DEFAULT_HEADER_AURORA_PROPS.searchButtonLabel,
    searchHints = DEFAULT_HEADER_AURORA_PROPS.searchHints!,
    searchSuggests = DEFAULT_HEADER_AURORA_PROPS.searchSuggests!,

    welcomeName = DEFAULT_HEADER_AURORA_PROPS.welcomeName,
    userRole = DEFAULT_HEADER_AURORA_PROPS.userRole,
    notifCount = DEFAULT_HEADER_AURORA_PROPS.notifCount,
    cartCount = DEFAULT_HEADER_AURORA_PROPS.cartCount,

    tickerTitle = DEFAULT_HEADER_AURORA_PROPS.tickerTitle,
    tickerItems = DEFAULT_HEADER_AURORA_PROPS.tickerItems!,

    bottomNavItems = DEFAULT_HEADER_AURORA_PROPS.bottomNavItems!,

    navItems: navItemsProp,
    autoLoadMenu = DEFAULT_HEADER_AURORA_PROPS.autoLoadMenu,
    locale = DEFAULT_HEADER_AURORA_PROPS.locale,
    siteId,
    setKey = DEFAULT_HEADER_AURORA_PROPS.setKey,

    preview = DEFAULT_HEADER_AURORA_PROPS.preview,
  } = props;

  /** ===== Nav state: y hệt pattern HeaderPro ===== */
  const [navItems, setNavItems] = useState<NavItem[]>(navItemsProp ?? []);
  const [navLoading, setNavLoading] = useState(false);

  useEffect(() => {
    if (!autoLoadMenu) {
      // không auto load → dùng navItems từ props nếu có
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
          console.error("HeaderAurora nav load failed", res.status);
          return;
        }

        const data = await res.json();
        const rows: DbMenuItem[] = data?.items ?? [];
        const tree = buildMenuTree(rows);
        if (tree.length) {
          setNavItems(tree);
        }
      } catch (err) {
        console.error("HeaderAurora nav load error", err);
      } finally {
        setNavLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoLoadMenu, locale, siteId, setKey]);

  /** ===== Search category (desktop + modal) ===== */
  const [categoryLabel, setCategoryLabel] = useState("Tất cả danh mục");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const [categoryLabelModal, setCategoryLabelModal] = useState("Tất cả danh mục");
  const [isCategoryOpenModal, setIsCategoryOpenModal] = useState(false);

  const categoryBtnRef = useRef<HTMLButtonElement | null>(null);
  const categoryDropdownRef = useRef<HTMLDivElement | null>(null);
  const categoryBtnModalRef = useRef<HTMLButtonElement | null>(null);
  const categoryDropdownModalRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        categoryBtnRef.current &&
        categoryDropdownRef.current &&
        !categoryBtnRef.current.contains(target) &&
        !categoryDropdownRef.current.contains(target)
      ) {
        setIsCategoryOpen(false);
      }
      if (
        categoryBtnModalRef.current &&
        categoryDropdownModalRef.current &&
        !categoryBtnModalRef.current.contains(target) &&
        !categoryDropdownModalRef.current.contains(target)
      ) {
        setIsCategoryOpenModal(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  /** ===== Search suggest (desktop) ===== */
  const [searchValue, setSearchValue] = useState("");
  const [searchModalValue, setSearchModalValue] = useState("");
  const [showSuggest, setShowSuggest] = useState(false);
  const suggestHideTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchFocus = () => {
    if (suggestHideTimeout.current) {
      clearTimeout(suggestHideTimeout.current);
      suggestHideTimeout.current = null;
    }
    setShowSuggest(true);
  };

  const handleSearchBlur = () => {
    suggestHideTimeout.current = setTimeout(() => {
      setShowSuggest(false);
    }, 130);
  };

  const handleSelectSuggest = (text: string) => {
    setSearchValue(text);
    setShowSuggest(false);
  };

  const handleSelectHint = (text: string) => {
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      setSearchModalValue(text);
    } else {
      setSearchValue(text);
    }
  };

  /** ===== Search submit ===== */
  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (preview) return;
    const value = searchValue.trim() || "(trống)";
    console.log("Thực hiện tìm outfit:", value);
  };

  const handleSearchModalSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (preview) return;
    const value = searchModalValue.trim() || "(trống)";
    console.log("[Mobile popup] Thực hiện tìm outfit:", value);
  };

  /** ===== Theme toggle (dark / light) ===== */
  const [isLightTheme, setIsLightTheme] = useState(true);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const body = document.body;
    body.setAttribute("data-theme", isLightTheme ? "light" : "dark");
  }, [isLightTheme]);

  const handleThemeToggle = () => {
    if (preview) return;
    setIsLightTheme((v) => !v);
  };

  /** ===== Voice demo ===== */
  const handleVoiceClick =
    (isModal = false) =>
    () => {
      if (preview) return;
      console.log(
        isModal
          ? "Giả lập: bắt đầu lắng nghe giọng nói (mobile popup)."
          : "Giả lập: bắt đầu lắng nghe giọng nói (desktop).",
      );
    };

  /** ===== Nav active & submenu open ===== */
  const [activeNavIndex, setActiveNavIndex] = useState<number>(0);
  const [openSubIndex, setOpenSubIndex] = useState<number | null>(null);

  const handleNavPillClick =
    (idx: number, hasSub: boolean, href: string) => (e: ReactMouseEvent<HTMLButtonElement>) => {
      if (hasSub) {
        e.stopPropagation();
        setOpenSubIndex((prev) => (prev === idx ? null : idx));
      } else {
        setOpenSubIndex(null);
        setActiveNavIndex(idx);
        if (preview || !href || href === "#") {
          e.preventDefault();
          return;
        }
        // navigate nếu cần
      }
    };

  useEffect(() => {
    const handleDocClick = () => {
      setOpenSubIndex(null);
    };
    document.addEventListener("click", handleDocClick);
    return () => document.removeEventListener("click", handleDocClick);
  }, []);

  /** ===== Bottom nav ===== */
  const [activeBottomTab, setActiveBottomTab] = useState<string>("home");

  const handleBottomNavClick = (id: string) => (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (preview) {
      e.preventDefault();
      return;
    }
    setActiveBottomTab(id);
    if (id === "home") {
      setActiveNavIndex(0);
    }
  };

  /** ===== Popup search mobile ===== */
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const searchModalPanelRef = useRef<HTMLDivElement | null>(null);

  const openSearchModal = () => {
    if (preview) return;
    setIsSearchModalOpen(true);
  };

  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
  };

  const handleSearchModalOverlayClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      closeSearchModal();
    }
  };

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent | globalThis.KeyboardEvent) => {
      if (e.key === "Escape") {
        closeSearchModal();
      }
    };
    document.addEventListener("keydown", handleEsc as any);
    return () => document.removeEventListener("keydown", handleEsc as any);
  }, []);

  /** ===== Helpers chặn anchor khi preview ===== */
  const handleAnchorClick = (href?: string) => (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (preview || !href || href === "#") {
      e.preventDefault();
      return;
    }
  };

  /** =================== RENDER =================== */
  return (
    <>
      <div className={styles["page-wrap"]}>
        <header className={styles["site-header"]}>
          <div className={styles["site-header-inner"]}>
            {/* ===== ROW 1: BRAND + SEARCH + USER ===== */}
            <div className={styles["header-main"]}>
              {/* BRAND */}
              <div className={styles["brand-block"]}>
                <div className={styles["brand-logo"]}>
                  <i className="bi bi-bag-heart-fill" />
                </div>
                <div className={styles["brand-text"]}>
                  <div className={styles["brand-name"]}>{brandName}</div>
                  <span className={styles["brand-chip"]}>{brandChip}</span>
                </div>
              </div>

              {/* SEARCH */}
              <div className={styles["search-block"]}>
                <button type="button" className={styles["search-mobile-trigger"]} onClick={openSearchModal}>
                  <i className="bi bi-search" />
                  <span>{searchMobilePlaceholder}</span>
                </button>

                <form className={styles["search-main"]} onSubmit={handleSearchSubmit}>
                  {/* Category select (desktop) */}
                  <div className={styles["search-select"]}>
                    <button
                      type="button"
                      id="categoryBtn"
                      ref={categoryBtnRef}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsCategoryOpen((v) => !v);
                      }}
                    >
                      <span id="categoryLabel">{categoryLabel}</span>
                      <i className="bi bi-chevron-down" />
                    </button>
                    <div
                      className={`${styles["select-dropdown"]} ${isCategoryOpen ? styles["open"] : ""}`}
                      id="categoryDropdown"
                      ref={categoryDropdownRef}
                    >
                      {[
                        {
                          label: "Tất cả danh mục",
                          icon: "bi bi-grid",
                        },
                        {
                          label: "Nữ · Đầm & Váy",
                          icon: "bi bi-gender-female",
                        },
                        {
                          label: "Nam · Áo sơ mi, Polo",
                          icon: "bi bi-person-standing",
                        },
                        {
                          label: "Unisex · Hoodie, Sweatshirt",
                          icon: "bi bi-lightning-charge",
                        },
                        {
                          label: "Phụ kiện · Túi, Giày, Mũ",
                          icon: "bi bi-handbag",
                        },
                      ].map((opt) => (
                        <div
                          key={opt.label}
                          className={`${styles["select-option"]} ${opt.label === categoryLabel ? styles["active"] : ""}`}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setCategoryLabel(opt.label);
                            setIsCategoryOpen(false);
                          }}
                        >
                          <i className={opt.icon} />
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Input + suggest */}
                  <div className={styles["search-input-wrap"]}>
                    <div className={styles["search-input-inner"]}>
                      <i className="bi bi-search" />
                      <input
                        id="searchInput"
                        type="text"
                        placeholder={searchPlaceholder}
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onFocus={handleSearchFocus}
                        onBlur={handleSearchBlur}
                      />
                      <div className={styles["search-input-right"]}>
                        <span className={styles["badge-shortcut"]}>Ctrl + K</span>
                        <button type="button" className={styles["icon-btn"]} onClick={handleVoiceClick(false)}>
                          <i className="bi bi-mic" />
                        </button>
                        <button
                          type="button"
                          className={styles["icon-btn"]}
                          onClick={(e) => {
                            if (preview) {
                              e.preventDefault();
                              return;
                            }
                            console.log("Fake QR scan click");
                          }}
                        >
                          <i className="bi bi-qr-code-scan" />
                        </button>
                      </div>
                    </div>

                    <div
                      className={`${styles["search-suggest"]} ${showSuggest ? styles["visible"] : ""}`}
                      id="searchSuggest"
                    >
                      <div className={styles["suggest-title"]}>Gợi ý tìm nhanh</div>
                      <div className={styles["suggest-list"]}>
                        {searchSuggests.map((text) => (
                          <button
                            key={text}
                            type="button"
                            className={styles["suggest-item"]}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelectSuggest(text);
                            }}
                          >
                            {text}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button type="submit" className={styles["search-submit"]} id="searchBtn">
                    {searchButtonLabel}
                    <i className="bi bi-arrow-right" />
                  </button>
                </form>

                <div className={styles["search-hints"]}>
                  {searchHints.map((hint) => (
                    <button
                      key={hint}
                      type="button"
                      className={styles["hint-pill"]}
                      onClick={() => handleSelectHint(hint)}
                    >
                      {hint}
                    </button>
                  ))}
                </div>
              </div>

              {/* USER / STATS */}
              <div className={styles["user-block"]}>
                <div className={styles["user-actions"]}>
                  <div className={styles["icon-badge"]}>
                    <button
                      type="button"
                      className={styles["icon-btn"]}
                      onClick={(e) => {
                        if (preview) {
                          e.preventDefault();
                          return;
                        }
                        console.log("Open notifications");
                      }}
                    >
                      <i className="bi bi-bell" />
                    </button>
                    {notifCount && notifCount > 0 && (
                      <span className={styles["badge-count"]} id="notifCount">
                        {notifCount}
                      </span>
                    )}
                  </div>

                  <div className={styles["icon-badge"]}>
                    <button
                      type="button"
                      className={styles["icon-btn"]}
                      onClick={(e) => {
                        if (preview) {
                          e.preventDefault();
                          return;
                        }
                        console.log("Open cart");
                      }}
                    >
                      <i className="bi bi-bag" />
                    </button>
                    {cartCount && cartCount > 0 && <span className={styles["badge-count"]}>{cartCount}</span>}
                  </div>

                  <button
                    type="button"
                    className={styles["theme-toggle"]}
                    onClick={handleThemeToggle}
                    title="Đổi giao diện sáng/tối"
                  >
                    <i className={isLightTheme ? "bi bi-moon-stars" : "bi bi-brightness-high"} />
                  </button>

                  <button
                    type="button"
                    className={styles["user-chip"]}
                    onClick={(e) => {
                      if (preview) {
                        e.preventDefault();
                        return;
                      }
                      console.log("Open user menu");
                    }}
                  >
                    <span className={styles["user-avatar"]}>AW</span>
                    <span className={styles["user-chip-main"]}>
                      <span className={styles["user-name"]}>{welcomeName}</span>
                      <span className={styles["user-role"]}>{userRole}</span>
                    </span>
                    <i className="bi bi-chevron-down" style={{ fontSize: 11 }} />
                  </button>
                </div>
              </div>
            </div>

            {/* ===== ROW 2: NAV + SUBMENU ===== */}
            <div className={styles["header-nav"]}>
              <div className={styles["nav-left"]} id="navLeft">
                {navLoading && !navItems.length && (
                  <div className={styles["nav-item"]}>
                    <span className={styles["nav-pill"]}>Đang tải menu...</span>
                  </div>
                )}

                {navItems.map((item, idx) => {
                  const isActive = activeNavIndex === idx && !item.hasSub;
                  const isOpen = openSubIndex === idx;

                  return (
                    <div
                      key={item.id}
                      className={`${styles["nav-item"]} ${item.hasSub ? styles["has-sub"] : ""} ${isOpen ? styles["open"] : ""}`}
                    >
                      <button
                        type="button"
                        className={`${styles["nav-pill"]} ${isActive || isOpen ? styles["active"] : ""}`}
                        onClick={handleNavPillClick(idx, item.hasSub, item.href)}
                      >
                        {item.iconClass && <i className={item.iconClass} aria-hidden="true" />}
                        {item.label}
                        {item.hasSub && <i className={`bi bi-chevron-down ${styles["caret"]}`} />}
                      </button>

                      {item.hasSub && item.subItems.length > 0 && (
                        <div className={styles["nav-sub"]}>
                          <div className={styles["nav-sub-grid"]}>
                            {item.subItems.map((sub) => (
                              <a
                                key={sub.id}
                                href={sub.href}
                                className={styles["nav-sub-link"]}
                                onClick={handleAnchorClick(sub.href)}
                              >
                                {sub.iconClass && <i className={sub.iconClass} />}
                                {sub.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className={styles["nav-right"]}>
                <div className={styles["nav-status"]}>
                  <span className={styles["nav-status-dot"]} />
                  Đơn hàng xử lý nhanh
                  <span className={styles["badge"]}>Ship trong 24h</span>
                </div>

                <button
                  type="button"
                  className={styles["nav-locale"]}
                  onClick={(e) => {
                    if (preview) {
                      e.preventDefault();
                      return;
                    }
                    console.log("Change locale");
                  }}
                >
                  <span className={styles["flag"]}>🇻🇳</span>
                  <span>VI</span>
                  <i className="bi bi-chevron-down" />
                </button>
              </div>
            </div>

            {/* ===== ROW 3: TICKER ===== */}
            <div className={styles["header-ticker"]}>
              <div className={styles["ticker-label"]}>
                <i className="bi bi-broadcast-pin" />
                {tickerTitle}
              </div>
              <div className={styles["ticker-track"]}>
                <div className={styles["ticker-inner"]} id="tickerInner">
                  {tickerItems.concat(tickerItems).map((item, idx) => (
                    <div key={`${item.tag}-${idx}`} className={styles["ticker-item"]}>
                      <span className={styles["ticker-tag"]}>{item.tag}</span>
                      <span>{item.content}</span>
                      <span className={styles["ticker-bullet"]} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </header>
      </div>

      {/* ===== BOTTOM NAV (TAB BAR MOBILE) ===== */}
      <nav className={styles["bottom-nav"]}>
        <div className={styles["bottom-nav-inner"]}>
          {bottomNavItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`${styles["bottom-nav-item"]} ${activeBottomTab === item.id ? styles["active"] : ""}`}
              data-tab={item.id}
              onClick={handleBottomNavClick(item.id)}
            >
              <i className={item.iconClass} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* ===== POPUP SEARCH MOBILE ===== */}
      <div
        className={`${styles["search-modal"]} ${isSearchModalOpen ? styles["open"] : ""}`}
        id="searchModal"
        onClick={handleSearchModalOverlayClick}
      >
        <div className={styles["search-modal-panel"]} ref={searchModalPanelRef}>
          <div className={styles["search-modal-header"]}>
            <div className={styles["search-modal-title"]}>Tìm kiếm outfit &amp; sản phẩm</div>
            <button
              type="button"
              className={styles["search-modal-close"]}
              id="searchModalClose"
              onClick={(e) => {
                e.stopPropagation();
                closeSearchModal();
              }}
            >
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <form className={styles["search-main"]} onSubmit={handleSearchModalSubmit}>
            <div className={styles["search-select"]}>
              <button
                type="button"
                id="categoryBtnModal"
                ref={categoryBtnModalRef}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCategoryOpenModal((v) => !v);
                }}
              >
                <span id="categoryLabelModal">{categoryLabelModal}</span>
                <i className="bi bi-chevron-down" />
              </button>
              <div
                className={`${styles["select-dropdown"]} ${isCategoryOpenModal ? styles["open"] : ""}`}
                id="categoryDropdownModal"
                ref={categoryDropdownModalRef}
              >
                {[
                  {
                    label: "Tất cả danh mục",
                    icon: "bi bi-grid",
                  },
                  {
                    label: "Nữ · Đầm & Váy",
                    icon: "bi bi-gender-female",
                  },
                  {
                    label: "Nam · Áo sơ mi, Polo",
                    icon: "bi bi-person-standing",
                  },
                  {
                    label: "Unisex · Hoodie, Sweatshirt",
                    icon: "bi bi-lightning-charge",
                  },
                  {
                    label: "Phụ kiện · Túi, Giày, Mũ",
                    icon: "bi bi-handbag",
                  },
                ].map((opt) => (
                  <div
                    key={opt.label}
                    className={`${styles["select-option"]} ${opt.label === categoryLabelModal ? styles["active"] : ""}`}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setCategoryLabelModal(opt.label);
                      setIsCategoryOpenModal(false);
                    }}
                  >
                    <i className={opt.icon} />
                    {opt.label}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles["search-input-wrap"]}>
              <div className={styles["search-input-inner"]}>
                <i className="bi bi-search" />
                <input
                  id="searchInputModal"
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchModalValue}
                  onChange={(e) => setSearchModalValue(e.target.value)}
                />
                <div className={styles["search-input-right"]}>
                  <button type="button" className={styles["icon-btn"]} onClick={handleVoiceClick(true)}>
                    <i className="bi bi-mic" />
                  </button>
                  <button
                    type="button"
                    className={styles["icon-btn"]}
                    onClick={(e) => {
                      if (preview) {
                        e.preventDefault();
                        return;
                      }
                      console.log("Fake QR scan click (modal)");
                    }}
                  >
                    <i className="bi bi-qr-code-scan" />
                  </button>
                </div>
              </div>
            </div>

            <button type="submit" className={styles["search-submit"]} id="searchBtnModal">
              {searchButtonLabel}
              <i className="bi bi-arrow-right" />
            </button>
          </form>

          <div className={styles["search-modal-hints"]}>
            <span>Gợi ý:</span>
            {searchHints.map((hint) => (
              <button
                key={`modal-${hint}`}
                type="button"
                className={styles["hint-pill"]}
                onClick={() => handleSelectHint(hint)}
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

/** ===== RegItem cho UI Builder ===== */
export const HEADER_AURORA_REGITEM: RegItem = {
  kind: "HeaderAuroraKind",
  label: "Header Aurora",
  defaults: DEFAULT_HEADER_AURORA_PROPS,
  inspector: [],
  render: (p) => <HeaderAurora {...(p as HeaderAuroraProps)} />,
};

export default HeaderAurora;
