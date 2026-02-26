// Ui/topbar/TopbarMulti.tsx
import React, { useEffect, useRef, useState } from "react";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/topbar/TopbarMulti.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export interface TopbarProTickerItem {
  text: string;
  badge?: string;
}

export interface TopbarProLinkItem {
  label: string;
  href?: string;
  iconClass?: string;
}

export interface TopbarMultiProps {
  // Logo + brand
  logoIconClass?: string;
  brandTitle?: string;
  brandSubtitle?: string;

  // Region button
  showRegionButton?: boolean;
  regionLabel?: string;
  regionIconClass?: string;
  regionChevronIconClass?: string;

  // Ticker
  showTicker?: boolean;
  tickerLabel?: string;
  tickerItems?: TopbarProTickerItem[];

  // Background
  backgroundColor?: string;

  // Status pill (không dùng trong HTML gốc nhưng vẫn theo interface chuẩn)
  showStatus?: boolean;
  statusText?: string;
  statusDotColor?: string;

  // Links bên phải
  links?: TopbarProLinkItem[];

  // Preview mode (chặn click link)
  preview?: boolean;
}

export const DEFAULT_TOPBAR_MULTI_TICKERS: TopbarProTickerItem[] = [
  {
    text: "Giao nhanh 2H + gợi ý AI theo lịch sử đọc của bạn.",
    badge: "Smart Shipping",
  },
  {
    text: "Freeship đơn từ 200.000₫ – áp dụng toàn quốc.",
    badge: "Freeship 2026",
  },
  {
    text: "Chế độ 'Mood Mode' – chọn sách theo tâm trạng trong ngày.",
    badge: "Mood Reading",
  },
];

export const DEFAULT_TOPBAR_MULTI_LINKS: TopbarProLinkItem[] = [
  {
    label: "Hỗ trợ",
    href: "#",
    iconClass: "bi bi-life-preserver",
  },
  {
    label: "Theo dõi đơn",
    href: "#",
    iconClass: "bi bi-truck",
  },
  {
    label: "Tài khoản",
    href: "#",
    iconClass: "bi bi-person-circle",
  },
];

export const DEFAULT_TOPBAR_MULTI_PROPS: TopbarMultiProps = {
  logoIconClass: "bi bi-stars",
  brandTitle: "Aurora Neo",
  brandSubtitle: "Trải nghiệm mua sắm đa vũ trụ 2026.",

  showRegionButton: true,
  regionLabel: "KV: Hồ Chí Minh",
  regionIconClass: "bi bi-geo-alt",
  regionChevronIconClass: "bi bi-chevron-down",

  showTicker: true,
  tickerLabel: "LIVE UPDATE",
  tickerItems: DEFAULT_TOPBAR_MULTI_TICKERS,

  // Status (ẩn mặc định)
  showStatus: false,
  statusText: "Online",
  statusDotColor: "#22c55e",

  links: DEFAULT_TOPBAR_MULTI_LINKS,

  preview: false,
};

type TickerPhase = "active" | "leaving" | "entering";

const TICKER_INTERVAL = 4200;
const TICKER_LEAVE_DURATION = 260;

const TopbarMulti: React.FC<TopbarMultiProps> = (props) => {
  const {
    logoIconClass,
    brandTitle,
    brandSubtitle,
    showRegionButton = true,
    regionLabel,
    regionIconClass,
    regionChevronIconClass,
    showTicker = true,
    tickerLabel,
    tickerItems = DEFAULT_TOPBAR_MULTI_TICKERS,
    backgroundColor,
    showStatus = false,
    statusText,
    statusDotColor = "#22c55e",
    links = DEFAULT_TOPBAR_MULTI_LINKS,
    preview = false,
  } = props;

  // ===== Theme switcher internal state =====
  const [scheme, setScheme] = useState<"sunrise" | "mint" | "slate">("sunrise");

  // ===== Ticker state & behavior =====
  const [tickerIndex, setTickerIndex] = useState(0);
  const [phase, setPhase] = useState<TickerPhase>("active");
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const items = tickerItems ?? [];

  useEffect(() => {
    if (!showTicker || !items || items.length <= 1) {
      setPhase("active");
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      return;
    }

    if (intervalRef.current) window.clearInterval(intervalRef.current);
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);

    intervalRef.current = window.setInterval(() => {
      setPhase("leaving");

      timeoutRef.current = window.setTimeout(() => {
        setTickerIndex((prev) => {
          const next = (prev + 1) % items.length;
          return next;
        });
        setPhase("entering");

        // Nhảy sang active ở frame tiếp theo để CSS transition hoạt động
        requestAnimationFrame(() => {
          setPhase("active");
        });
      }, TICKER_LEAVE_DURATION);
    }, TICKER_INTERVAL);

    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, [showTicker, items.length]);

  const currentTicker = items[tickerIndex] ?? items[0];

  // ===== Mobile menu =====
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const tbRightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (!tbRightRef.current) return;
      if (!tbRightRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleMoreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsMenuOpen((v) => !v);
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href?: string) => {
    if (preview || !href || href === "#") {
      e.preventDefault();
    }
  };

  // ===== Ticker className =====
  const tickerClasses = [
    styles.tickerText,
    phase === "leaving" ? styles.isLeaving : "",
    phase === "entering" ? styles.isEntering : "",
    phase === "active" ? styles.isActive : "",
  ]
    .filter(Boolean)
    .join(" ");

  // Inline style cho override backgroundColor (đơn giản)
  const topbarStyle = backgroundColor ? ({ backgroundColor } as React.CSSProperties) : undefined;

  return (
    <div className={styles.topbar} data-scheme={scheme} style={topbarStyle}>
      <div className={styles.topbarInner}>
        {/* LEFT */}
        <div className={styles.tbLeft}>
          <div className={styles.logoCircle}>{logoIconClass && <i className={logoIconClass} />}</div>

          <div className={styles.brandTextWrap}>
            {brandTitle && <div className={styles.brandTitle}>{brandTitle}</div>}
            {brandSubtitle && <div className={styles.brandSub}>{brandSubtitle}</div>}
          </div>

          {showRegionButton && (
            <button
              type="button"
              className={styles.regionBtn}
              // Ở preview chỉ là demo, không mở popup thật
              onClick={() => {
                // có thể gắn callback thực tế ở phía app nếu cần
              }}
            >
              {regionIconClass && <i className={regionIconClass} />}
              <span>{regionLabel}</span>
              {regionChevronIconClass && <i className={regionChevronIconClass} />}
            </button>
          )}
        </div>

        {/* CENTER – Ticker */}
        <div className={styles.tbCenter}>
          {showTicker && currentTicker && (
            <div className={styles.ticker}>
              <div className={styles.tickerBox}>
                {tickerLabel && <span className={styles.tickerLabel}>{tickerLabel}</span>}
                <div className={tickerClasses}>
                  <span className={styles.main}>{currentTicker.text}</span>
                  {currentTicker.badge && <span className={styles.tag}>{currentTicker.badge}</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div
          ref={tbRightRef}
          className={[styles.tbRight, isMenuOpen ? styles.tbRightOpen : ""].filter(Boolean).join(" ")}
        >
          {/* Links desktop */}
          <div className={styles.tbLinks}>
            {(links ?? []).map((link, idx) => (
              <a
                key={idx}
                href={link.href ?? "#"}
                className={styles.tbLink}
                onClick={(e) => handleLinkClick(e, link.href)}
              >
                {link.iconClass && <i className={link.iconClass} />}
                <span>{link.label}</span>
                <i className={`bi bi-arrow-right-short ${styles.tbLinkArrow}`} />
              </a>
            ))}
          </div>

          {/* Status pill (tùy chọn, theo interface chuẩn) */}
          {showStatus && statusText && (
            <div className={styles.statusPill}>
              <span className={styles.dot} style={{ backgroundColor: statusDotColor }} />
              <span>{statusText}</span>
            </div>
          )}

          {/* Theme switcher */}
          <div className={styles.themeSwitcher}>
            <button
              type="button"
              className={[styles.themeBtn, scheme === "sunrise" ? styles.themeBtnActive : ""].filter(Boolean).join(" ")}
              onClick={() => setScheme("sunrise")}
              title="Sunrise"
            >
              <i className="bi bi-sun-fill" />
            </button>
            <button
              type="button"
              className={[styles.themeBtn, scheme === "mint" ? styles.themeBtnActive : ""].filter(Boolean).join(" ")}
              onClick={() => setScheme("mint")}
              title="Mint"
            >
              <i className="bi bi-droplet-half" />
            </button>
            <button
              type="button"
              className={[styles.themeBtn, scheme === "slate" ? styles.themeBtnActive : ""].filter(Boolean).join(" ")}
              onClick={() => setScheme("slate")}
              title="Slate"
            >
              <i className="bi bi-moon-stars-fill" />
            </button>
          </div>

          {/* Mobile menu button */}
          <button type="button" className={styles.moreBtn} onClick={handleMoreClick}>
            <i className="bi bi-list" />
          </button>

          {/* Dropdown links mobile */}
          <div className={styles.tbLinksDropdown}>
            {(links ?? []).map((link, idx) => (
              <a
                key={idx}
                href={link.href ?? "#"}
                className={styles.tbLink}
                onClick={(e) => handleLinkClick(e, link.href)}
              >
                {link.iconClass && <i className={link.iconClass} />}
                <span>{link.label}</span>
                <i className={`bi bi-arrow-right-short ${styles.tbLinkArrow}`} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopbarMulti;

export const TOPBAR_MULTI_REGITEM: RegItem = {
  kind: "TopbarMultiKind",
  label: "Topbar Multi",
  defaults: DEFAULT_TOPBAR_MULTI_PROPS as TopbarMultiProps,
  inspector: [],
  render: (p) => <TopbarMulti {...(p as TopbarMultiProps)} />,
};
