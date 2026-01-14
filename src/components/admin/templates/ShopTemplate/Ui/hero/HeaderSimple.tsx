/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useEffect, useState, KeyboardEvent } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/hero/HeaderSimple.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export interface HeaderSimpleProps {
  preview?: boolean;
}

export const DEFAULT_HEADER_SIMPLE_PROPS: HeaderSimpleProps = {
  preview: false,
};

const LOCALES = ["VI", "EN", "JA"];
const MODES = ["Mode: Tất cả sản phẩm", "Mode: Chỉ áo & quần", "Mode: Gợi ý outfit tự động"];

type NavKey = "new" | "women" | "men" | "kids" | "accessories" | "sale";

const NAV_PLACEHOLDERS: Record<NavKey, string> = {
  new: "Tìm outfit hot, bộ sưu tập mới, drops hôm nay…",
  women: "Tìm váy, đầm, áo, quần, set đồ nữ…",
  men: "Tìm áo polo, hoodie, quần jean, áo sơ mi nam…",
  kids: "Tìm đồ cho bé, family look, set đồ mẹ & bé…",
  accessories: "Tìm giày, túi, thắt lưng, mũ, phụ kiện…",
  sale: "Tìm ưu đãi, flash sale, combo outfit…",
};

const HeaderSimple: React.FC<HeaderSimpleProps> = () => {
  const [isFloating, setIsFloating] = useState(false);
  const [localeIndex, setLocaleIndex] = useState(0);
  const [modeIndex, setModeIndex] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [searchPlaceholder, setSearchPlaceholder] = useState(NAV_PLACEHOLDERS.new);
  const [activeDesktopNav, setActiveDesktopNav] = useState<NavKey>("new");
  const [openSubmenu, setOpenSubmenu] = useState<NavKey | null>(null);

  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeMobileNav, setActiveMobileNav] = useState<NavKey>("new");

  const [activeBottomTab, setActiveBottomTab] = useState<"home" | "category" | "search" | "wishlist" | "account">("home");

  // FLOATING HEADER
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY || window.pageYOffset;
      setIsFloating(y > 20);
    };
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // LOCALE CYCLE
  const locale = LOCALES[localeIndex];
  const handleLocaleClick = () => {
    setLocaleIndex((i) => (i + 1) % LOCALES.length);
  };

  // MODE CYCLE
  const modeText = MODES[modeIndex];
  const handleModeClick = () => {
    setModeIndex((i) => (i + 1) % MODES.length);
  };

  // SEARCH
  const handleSearch = () => {
    const q = searchValue.trim();
    if (!q) {
      if (typeof window !== "undefined") {
        window.alert("Bạn hãy nhập sản phẩm / outfit cần tìm trong Aurora Wear nhé ✨");
      }
      return;
    }
    if (typeof window !== "undefined") {
      window.alert(`Aurora Wear đang tìm cho bạn: “${q}”`);
    }
  };

  const handleSearchKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  // DESKTOP NAV + SUBMENU
  const handleDesktopNavClick = (key: NavKey, hasSub: boolean) => {
    setActiveDesktopNav(key);
    setSearchPlaceholder(NAV_PLACEHOLDERS[key]);

    if (!hasSub) {
      setOpenSubmenu(null);
      return;
    }

    setOpenSubmenu((prev) => (prev === key ? null : key));
  };

  // MOBILE DRAWER NAV
  const handleMobileNavSelect = (key: NavKey) => {
    setActiveMobileNav(key);
    setSearchPlaceholder(NAV_PLACEHOLDERS[key]);
    setMobileNavOpen(false);
  };

  // BOTTOM NAV
  const handleBottomNavClick = (tab: "home" | "category" | "search" | "wishlist" | "account") => {
    if (tab === "search") return;
    setActiveBottomTab(tab);

    if (tab === "home") {
      if (typeof window !== "undefined") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else if (tab === "category") {
      if (typeof window !== "undefined") {
        window.alert("Mở popup danh mục trên mobile (bạn implement thêm sau).");
      }
    } else if (tab === "wishlist") {
      if (typeof window !== "undefined") {
        window.alert("Đi đến danh sách yêu thích.");
      }
    } else if (tab === "account") {
      if (typeof window !== "undefined") {
        window.alert("Đi đến trang tài khoản / đăng nhập.");
      }
    }
  };

  const handleFabSearchClick = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      // Fallback focus; không access DOM ref ở đây, để người dùng tự click
    }
  };

  return (
    <>
      {/* HEADER */}
      <header className={`${styles["header-aurora"]} ${isFloating ? styles["is-floating"] : ""}`}>
        <div className={styles["header-card"]}>
          {/* ROW 1 */}
          <div className={`${styles["header-row"]} ${styles["header-top"]}`}>
            <div className={styles["brand-block"]}>
              <div className={styles["brand-mark"]}>
                <i className="bi bi-stars" />
              </div>
              <div className={styles["brand-text-block"]}>
                <div className={styles["brand-name"]}>
                  Aurora Wear
                  <span className={styles["label"]}>BLUE EDITION</span>
                </div>
                <div className={styles["brand-sub"]}>Thời trang mỗi ngày – phối outfit nhanh, giữ mood nhẹ nhàng.</div>
              </div>
            </div>

            <div className={styles["header-top-right"]}>
              <button type="button" className={styles["pill-ghost"]}>
                <i className="bi bi-palette" />
                <span className={styles["text"]}>Mix outfit cho bạn</span>
              </button>

              <button type="button" className={styles["pill-locale"]} onClick={handleLocaleClick}>
                <i className="bi bi-translate" />
                <span className={styles["code"]}>{locale}</span>
                <i className="bi bi-chevron-down" />
              </button>

              <button type="button" className={styles["pill-account"]}>
                <div className={styles["pill-account-avatar"]}>AW</div>
                <span>Tài khoản</span>
                <i className="bi bi-chevron-down" />
              </button>

              {/* Mobile menu toggle */}
              <button type="button" className={styles["mobile-nav-toggle"]} onClick={() => setMobileNavOpen(true)}>
                <i className="bi bi-grid-3x3-gap" />
                <span>Menu</span>
              </button>
            </div>
          </div>

          {/* ROW 2 – SEARCH */}
          <div className={`${styles["header-row"]} ${styles["header-search"]}`}>
            <div className={styles["search-shell"]}>
              <button type="button" className={styles["search-mode-pill"]} onClick={handleModeClick}>
                <span className={styles["dot"]} />
                <i className="bi bi-funnel" />
                <span>{modeText}</span>
              </button>

              <div className={styles["search-input-wrap"]}>
                <input
                  className={styles["search-input"]}
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                />
                <span className={styles["search-kbd"]}>Ctrl + K</span>
              </div>

              <div className={styles["search-actions"]}>
                <button
                  type="button"
                  className={styles["btn-icon"]}
                  title="Tìm bằng giọng nói"
                  onClick={() => typeof window !== "undefined" && window.alert("Tìm kiếm bằng giọng nói sẽ được tích hợp sau 🎙️")}>
                  <i className="bi bi-mic" />
                </button>
                <button type="button" className={styles["btn-primary-search"]} title="Tìm kiếm" onClick={handleSearch}>
                  <i className="bi bi-search" />
                </button>
              </div>
            </div>

            <div className={styles["search-stats"]}>
              <div className={styles["pill-stat"]}>
                <i className="bi bi-bag" />
                <span className={styles["value"]}>3.4k</span>
                <span>mẫu đang bán</span>
              </div>
              <div className={styles["pill-stat"]}>
                <i className="bi bi-star-half" />
                <span className={styles["value"]}>4.8</span>
                <span>điểm hài lòng</span>
              </div>
            </div>
          </div>

          {/* ROW 3 – NAV (desktop) */}
          <div className={`${styles["header-row"]} ${styles["header-nav"]}`}>
            <div className={styles["nav-main"]}>
              {/* New in */}
              <button type="button" className={`${styles["nav-pill"]} ${activeDesktopNav === "new" ? styles["is-active"] : ""}`} onClick={() => handleDesktopNavClick("new", false)}>
                <i className="bi bi-lightning-charge" />
                <span>New in</span>
                <span className={styles["pill-badge"]}>Hot</span>
              </button>

              {/* Women */}
              <button
                type="button"
                className={`${styles["nav-pill"]} ${styles["has-sub"]} ${activeDesktopNav === "women" ? styles["is-active"] : ""}`}
                onClick={() => handleDesktopNavClick("women", true)}>
                <i className="bi bi-gender-female" />
                <span>Nữ</span>
                <span className={`${styles["chevron"]} bi bi-chevron-down`} />
              </button>

              {/* Men */}
              <button
                type="button"
                className={`${styles["nav-pill"]} ${styles["has-sub"]} ${activeDesktopNav === "men" ? styles["is-active"] : ""}`}
                onClick={() => handleDesktopNavClick("men", true)}>
                <i className="bi bi-gender-male" />
                <span>Nam</span>
                <span className={`${styles["chevron"]} bi bi-chevron-down`} />
              </button>

              {/* Kids */}
              <button
                type="button"
                className={`${styles["nav-pill"]} ${styles["has-sub"]} ${activeDesktopNav === "kids" ? styles["is-active"] : ""}`}
                onClick={() => handleDesktopNavClick("kids", true)}>
                <i className="bi bi-balloon-heart" />
                <span>Trẻ em</span>
                <span className={`${styles["chevron"]} bi bi-chevron-down`} />
              </button>

              {/* Accessories */}
              <button type="button" className={`${styles["nav-pill"]} ${activeDesktopNav === "accessories" ? styles["is-active"] : ""}`} onClick={() => handleDesktopNavClick("accessories", false)}>
                <i className="bi bi-handbag" />
                <span>Giày &amp; phụ kiện</span>
              </button>

              {/* Sale */}
              <button type="button" className={`${styles["nav-pill"]} ${activeDesktopNav === "sale" ? styles["is-active"] : ""}`} onClick={() => handleDesktopNavClick("sale", false)}>
                <i className="bi bi-percent" />
                <span>Sale / Combo</span>
              </button>

              <div className={styles["nav-right"]}>
                <div className={styles["nav-chip"]}>
                  <i className="bi bi-droplet-half" />
                  Mood: Calm &amp; Blue
                </div>
                <button type="button" className={styles["nav-icon-btn"]} title="Yêu thích">
                  <i className="bi bi-heart" />
                </button>
                <button type="button" className={`${styles["nav-icon-btn"]} ${styles["cart"]}`} title="Giỏ hàng">
                  <i className="bi bi-bag" />
                  <span className={styles["count"]}>3</span>
                </button>
              </div>
            </div>

            {/* SUBMENUS */}
            <div className={styles["nav-sub-wrapper"]}>
              {/* WOMEN */}
              <div className={`${styles["nav-submenu"]} ${openSubmenu === "women" ? styles["is-visible"] : ""}`}>
                <div className={styles["nav-submenu-inner"]}>
                  <div>
                    <div className={styles["nav-sub-title"]}>Danh mục chính</div>
                    <ul className={styles["nav-sub-list"]}>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Váy &amp; Đầm
                          <span className={styles["badge"]}>Party</span>
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Áo thun / Áo sơ mi
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Quần jean / Quần dài
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Chân váy
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className={styles["nav-sub-title"]}>Phong cách</div>
                    <ul className={styles["nav-sub-list"]}>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Basic hằng ngày
                          <span className={styles["badge"]}>Best</span>
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Office / Công sở
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Date / Café / Chill
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Street / Y2K
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* MEN */}
              <div className={`${styles["nav-submenu"]} ${openSubmenu === "men" ? styles["is-visible"] : ""}`}>
                <div className={styles["nav-submenu-inner"]}>
                  <div>
                    <div className={styles["nav-sub-title"]}>Danh mục chính</div>
                    <ul className={styles["nav-sub-list"]}>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Áo T-shirt / Polo
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Áo sơ mi
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Quần jean
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Quần short
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className={styles["nav-sub-title"]}>Mood &amp; Scene</div>
                    <ul className={styles["nav-sub-list"]}>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Đi làm
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Đi chơi / Du lịch
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Gym / Active
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Night out
                          <span className={styles["badge"]}>New</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* KIDS */}
              <div className={`${styles["nav-submenu"]} ${openSubmenu === "kids" ? styles["is-visible"] : ""}`}>
                <div className={styles["nav-submenu-inner"]}>
                  <div>
                    <div className={styles["nav-sub-title"]}>Nhóm tuổi</div>
                    <ul className={styles["nav-sub-list"]}>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Bé gái
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Bé trai
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Family look
                          <span className={styles["badge"]}>Hot</span>
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <div className={styles["nav-sub-title"]}>Dịp sử dụng</div>
                    <ul className={styles["nav-sub-list"]}>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Đi học
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Đi chơi
                        </a>
                      </li>
                      <li>
                        <a href="#" className={styles["nav-sub-link"]}>
                          Dự tiệc
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MOBILE NAV DRAWER */}
      <div
        className={`${styles["mobile-nav-overlay"]} ${mobileNavOpen ? styles["is-open"] : ""}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setMobileNavOpen(false);
        }}>
        <div className={styles["mobile-nav-drawer"]}>
          <div className={styles["mobile-nav-header"]}>
            <div className={styles["mobile-nav-title"]}>Menu Aurora Wear</div>
            <button type="button" className={styles["mobile-nav-close"]} onClick={() => setMobileNavOpen(false)}>
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <ul className={styles["mobile-nav-list"]}>
            <li>
              <button type="button" className={`${styles["mobile-nav-link"]} ${activeMobileNav === "new" ? styles["is-active"] : ""}`} onClick={() => handleMobileNavSelect("new")}>
                <span className={styles["mobile-nav-main"]}>
                  <i className="bi bi-lightning-charge" />
                  <span>New in</span>
                </span>
                <span className={styles["badge"]}>Hot</span>
              </button>
            </li>

            <li>
              <button type="button" className={`${styles["mobile-nav-link"]} ${activeMobileNav === "women" ? styles["is-active"] : ""}`} onClick={() => handleMobileNavSelect("women")}>
                <span className={styles["mobile-nav-main"]}>
                  <i className="bi bi-gender-female" />
                  <span>Nữ</span>
                </span>
              </button>
            </li>

            <li>
              <button type="button" className={`${styles["mobile-nav-link"]} ${activeMobileNav === "men" ? styles["is-active"] : ""}`} onClick={() => handleMobileNavSelect("men")}>
                <span className={styles["mobile-nav-main"]}>
                  <i className="bi bi-gender-male" />
                  <span>Nam</span>
                </span>
              </button>
            </li>

            <li>
              <button type="button" className={`${styles["mobile-nav-link"]} ${activeMobileNav === "kids" ? styles["is-active"] : ""}`} onClick={() => handleMobileNavSelect("kids")}>
                <span className={styles["mobile-nav-main"]}>
                  <i className="bi bi-balloon-heart" />
                  <span>Trẻ em</span>
                </span>
              </button>
            </li>

            <li>
              <button type="button" className={`${styles["mobile-nav-link"]} ${activeMobileNav === "accessories" ? styles["is-active"] : ""}`} onClick={() => handleMobileNavSelect("accessories")}>
                <span className={styles["mobile-nav-main"]}>
                  <i className="bi bi-handbag" />
                  <span>Giày &amp; phụ kiện</span>
                </span>
              </button>
            </li>

            <li>
              <button type="button" className={`${styles["mobile-nav-link"]} ${activeMobileNav === "sale" ? styles["is-active"] : ""}`} onClick={() => handleMobileNavSelect("sale")}>
                <span className={styles["mobile-nav-main"]}>
                  <i className="bi bi-percent" />
                  <span>Sale / Combo</span>
                </span>
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* BOTTOM NAV – MOBILE */}
      <nav className={styles["bottom-nav"]} aria-label="Aurora Wear navigation">
        <div className={styles["bottom-nav-inner"]}>
          <button type="button" className={`${styles["bottom-nav-item"]} ${activeBottomTab === "home" ? styles["active"] : ""}`} onClick={() => handleBottomNavClick("home")}>
            <i className="bi bi-house-door" />
            <span>Trang chủ</span>
          </button>

          <button type="button" className={`${styles["bottom-nav-item"]} ${activeBottomTab === "category" ? styles["active"] : ""}`} onClick={() => handleBottomNavClick("category")}>
            <i className="bi bi-grid-3x3-gap" />
            <span>Danh mục</span>
          </button>

          <div className={`${styles["bottom-nav-item"]} ${styles["search-center"]}`}>
            <button type="button" className={styles["bottom-nav-fab"]} onClick={handleFabSearchClick}>
              <i className="bi bi-search" />
            </button>
          </div>

          <button type="button" className={`${styles["bottom-nav-item"]} ${activeBottomTab === "wishlist" ? styles["active"] : ""}`} onClick={() => handleBottomNavClick("wishlist")}>
            <i className="bi bi-heart" />
            <span>Yêu thích</span>
          </button>

          <button type="button" className={`${styles["bottom-nav-item"]} ${activeBottomTab === "account" ? styles["active"] : ""}`} onClick={() => handleBottomNavClick("account")}>
            <i className="bi bi-person" />
            <span>Tài khoản</span>
          </button>
        </div>
      </nav>
    </>
  );
};

/* ========== RegItem cho UI builder ========== */

export const HEADER_SIMPLE: RegItem = {
  kind: "HeaderSimple",
  label: "Header Simple",
  defaults: DEFAULT_HEADER_SIMPLE_PROPS,
  inspector: [],
  render: (p) => <HeaderSimple {...(p as HeaderSimpleProps)} />,
};

export default HeaderSimple;
