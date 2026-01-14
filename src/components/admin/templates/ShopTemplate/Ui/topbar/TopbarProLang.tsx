// src/components/templates/TopbarProLang.tsx

import React, { useEffect, useState } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/topbar/TopbarProLang.module.css";

/**
 * ===== 1) Types =====
 */

export interface TopbarProLangTickerItem {
  text: string;
  badge: string;
}

export interface TopbarProLangLinkItem {
  label: string;
  href: string;
  iconClass?: string;
}

export interface TopbarProLangSocialItem {
  href: string;
  iconClass: string;
  ariaLabel?: string;
}

export interface TopbarProLangLanguageOption {
  value: string;
  label: string;
}

export interface TopbarProLangProps {
  /** Text nút region, ví dụ: "KV: Hồ Chí Minh" */
  regionLabel?: string;
  /** Hiện / ẩn nút region */
  showRegion?: boolean;
  /** Ticker (auto-rotate) */
  tickerItems?: TopbarProLangTickerItem[];
  /** Bật / tắt ticker */
  showTicker?: boolean;
  /** Danh sách link bên phải (Trung tâm trợ giúp, Theo dõi đơn, Đăng nhập…) */
  helpLinks?: TopbarProLangLinkItem[];
  /** Danh sách social icon */
  socialLinks?: TopbarProLangSocialItem[];
  /** Danh sách ngôn ngữ */
  languageOptions?: TopbarProLangLanguageOption[];
  /** Ngôn ngữ hiện tại (value của option) */
  currentLanguage?: string;
  /** Ẩn/hiện ô chọn ngôn ngữ */
  showLanguageSelect?: boolean;
  /** Màu gradient from (bên trái) */
  backgroundFrom?: string;
  /** Màu gradient to (bên phải) */
  backgroundTo?: string;
  /** Topbar sticky trên cùng */
  sticky?: boolean;
  /** Chế độ preview trong UI Builder (chặn click <a>) */
  preview?: boolean;
}

/**
 * ===== 2) Default data =====
 */

export const DEFAULT_TOPBAR_PRO_LANG_TICKERS: TopbarProLangTickerItem[] = [
  {
    badge: "NEW",
    text: "Ra mắt series “Thư viện kỹ năng sống cho người bận rộn”",
  },
  {
    badge: "SALE",
    text: "Ưu đãi thành viên: Giảm 15% cho đơn từ 3 đầu sách kỹ năng",
  },
  {
    badge: "GIFT",
    text: "Tặng bookmark giới hạn khi đặt trước sách mới tuần này",
  },
];

export const DEFAULT_TOPBAR_PRO_LANG_LINKS: TopbarProLangLinkItem[] = [
  {
    label: "Trung tâm trợ giúp",
    href: "#help",
    iconClass: "bi bi-life-preserver",
  },
  {
    label: "Theo dõi đơn",
    href: "#tracking",
    iconClass: "bi bi-truck",
  },
  {
    label: "Đăng nhập / Đăng ký",
    href: "#auth",
    iconClass: "bi bi-person-circle",
  },
];

export const DEFAULT_TOPBAR_PRO_LANG_SOCIALS: TopbarProLangSocialItem[] = [
  {
    href: "#facebook",
    iconClass: "bi bi-facebook",
    ariaLabel: "Facebook",
  },
  {
    href: "#tiktok",
    iconClass: "bi bi-tiktok",
    ariaLabel: "TikTok",
  },
  {
    href: "#youtube",
    iconClass: "bi bi-youtube",
    ariaLabel: "YouTube",
  },
];

export const DEFAULT_TOPBAR_PRO_LANG_LANGUAGE_OPTIONS: TopbarProLangLanguageOption[] = [
  { value: "vi", label: "Tiếng Việt" },
  { value: "en", label: "English" },
];

/**
 * ===== 3) RegItem type (đơn giản, tự chứa) =====
 * Nếu trong project của bạn đã có sẵn RegItem thì chỉ cần import thay vì define lại.
 */

export interface RegItem {
  kind: string;
  label: string;
  defaults: any;
  inspector: any[];
  render: (props: unknown) => React.ReactNode;
}

/**
 * ===== 4) Component =====
 */

export const TopbarProLang: React.FC<TopbarProLangProps> = ({
  regionLabel = "KV: Hồ Chí Minh",
  showRegion = true,
  showTicker = true,
  backgroundFrom = "#fff8ed",
  backgroundTo = "#ffffff",
  sticky = false,
  preview = false,
  showLanguageSelect = true,
  currentLanguage = "vi",
  tickerItems,
  helpLinks,
  socialLinks,
  languageOptions,
}) => {
  const tickers = tickerItems ?? DEFAULT_TOPBAR_PRO_LANG_TICKERS;
  const links = helpLinks ?? DEFAULT_TOPBAR_PRO_LANG_LINKS;
  const socials = socialLinks ?? DEFAULT_TOPBAR_PRO_LANG_SOCIALS;
  const langs = languageOptions ?? DEFAULT_TOPBAR_PRO_LANG_LANGUAGE_OPTIONS;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<"active" | "leaving" | "entering">("active");
  const [selectedLang, setSelectedLang] = useState(currentLanguage);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Sync lang from prop
  useEffect(() => {
    setSelectedLang(currentLanguage);
  }, [currentLanguage]);

  // Auto ticker rotate
  useEffect(() => {
    if (!showTicker || tickers.length <= 1) return;

    let timeoutId: number | undefined;
    const intervalId = window.setInterval(() => {
      setPhase("leaving");

      timeoutId = window.setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % tickers.length);
        setPhase("entering");

        window.requestAnimationFrame(() => {
          setPhase("active");
        });
      }, 250);
    }, 4000);

    return () => {
      window.clearInterval(intervalId);
      if (timeoutId !== undefined) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [showTicker, tickers.length]);

  const currentTicker = tickers[currentIndex];

  const tickerClassNames = [styles.tbTickerText];
  if (phase === "leaving") {
    tickerClassNames.push(styles.isLeaving);
  } else if (phase === "entering") {
    tickerClassNames.push(styles.isEntering);
  } else {
    tickerClassNames.push(styles.isActive);
  }

  const handleAnchorClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (preview) {
      e.preventDefault();
    }
  };

  return (
    <div
      className={`${styles.topbar} ${sticky ? styles.isSticky : ""}`}
      style={
        {
          // override CSS variables
          ["--tb-bg" as string]: backgroundFrom,
          ["--tb-bg-to" as string]: backgroundTo,
        } as React.CSSProperties
      }>
      <div className={styles.topbarInner}>
        {/* Left */}
        <div className={styles.tbLeft}>
          <div className={styles.tbLeftIcon}>
            <i className="bi bi-chat-dots" />
          </div>
          {showRegion && (
            <button
              type="button"
              className={styles.tbRegionBtn}
              // không alert trong UI Builder, để trống hoặc implement sau
              onClick={() => {
                // no-op
              }}>
              <i className="bi bi-geo-alt" />
              <span className={styles.regionText}>{regionLabel}</span>
              <i className="bi bi-chevron-down" />
            </button>
          )}
        </div>

        {/* Center: ticker */}
        <div className={styles.tbCenter}>
          {showTicker && tickers.length > 0 && (
            <div className={styles.tbTicker}>
              <div className={tickerClassNames.join(" ")}>
                {currentTicker.badge && <span className={styles.badge}>{currentTicker.badge}</span>}
                <span>{currentTicker.text}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right */}
        <div className={`${styles.tbRight} ${isMobileOpen ? styles.isOpen : ""}`}>
          <div className={styles.tbRightDetails}>
            <div className={styles.tbLinks}>
              {links.map((link, idx) => (
                <a key={idx} href={link.href} className={styles.tbLink} onClick={handleAnchorClick}>
                  {link.iconClass && <i className={link.iconClass} />}
                  <span>{link.label}</span>
                </a>
              ))}
            </div>

            {/* Language select */}
            {showLanguageSelect && langs.length > 0 && (
              <>
                <div className={styles.tbDivider} />
                <div className={styles.tbLangSelectWrap}>
                  <select className={styles.tbLangSelect} value={selectedLang} onChange={(e) => setSelectedLang(e.target.value)} disabled={preview}>
                    {langs.map((lang) => (
                      <option key={lang.value} value={lang.value}>
                        {lang.label}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            )}

            <div className={styles.tbDivider} />

            <div className={styles.tbSocial}>
              {socials.map((social, idx) => (
                <a key={idx} href={social.href} aria-label={social.ariaLabel} onClick={handleAnchorClick}>
                  <i className={social.iconClass} />
                </a>
              ))}
            </div>
          </div>

          {/* Mobile more button */}
          <button className={styles.tbMoreBtn} type="button" onClick={() => setIsMobileOpen((open) => !open)}>
            <i className="bi bi-three-dots" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * ===== 5) RegItem cho block =====
 */

export const TOPBAR_PRO_LANG_REGITEM: RegItem = {
  kind: "TopbarProLang",
  label: "Topbar Pro",
  defaults: {
    regionLabel: "KV: Hồ Chí Minh",
    showRegion: true,
    showTicker: true,
    backgroundFrom: "#fff8ed",
    backgroundTo: "#ffffff",
    sticky: false,
    preview: false,
    showLanguageSelect: true,
    currentLanguage: "vi",
    tickerItems: DEFAULT_TOPBAR_PRO_LANG_TICKERS,
    helpLinks: DEFAULT_TOPBAR_PRO_LANG_LINKS,
    socialLinks: DEFAULT_TOPBAR_PRO_LANG_SOCIALS,
    languageOptions: DEFAULT_TOPBAR_PRO_LANG_LANGUAGE_OPTIONS,
  } satisfies TopbarProLangProps,
  inspector: [],
  render: (p) => <TopbarProLang {...(p as TopbarProLangProps)} />,
};
