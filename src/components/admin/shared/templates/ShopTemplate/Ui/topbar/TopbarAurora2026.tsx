// Ui/topbar/TopbarAurora2026.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/topbar/TopbarAurora2026.module.css";
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

export interface TopbarAurora2026Props {
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

  // Status pill
  showStatus?: boolean;
  statusText?: string;
  statusDotColor?: string;

  // Links bên phải
  links?: TopbarProLinkItem[];

  // Preview mode
  preview?: boolean;
}

export const DEFAULT_TOPBAR_AURORA_2026_PROPS: TopbarAurora2026Props = {
  logoIconClass: "bi bi-sparkles",
  brandTitle: "Aurora Hub",
  brandSubtitle: "Nền tảng Mua sắm thế hệ mới.",

  showRegionButton: true,
  regionLabel: "KV: Hồ Chí Minh",
  regionIconClass: "bi bi-geo-alt",
  regionChevronIconClass: "bi bi-chevron-down",

  showTicker: true,
  tickerLabel: "UPDATES",
  tickerItems: [
    {
      text: "AI gợi ý danh mục sách dựa trên tâm trạng đọc hôm nay.",
      badge: "AI Mode",
    },
    {
      text: "Không gian đọc ảo 3D – đồng bộ tiến độ giữa mobile và web trong thời gian thực.",
      badge: "Space Room",
    },
    {
      text: "Chế độ Focus 25 phút – hệ thống tự ẩn thông báo và ghi lại lịch sử tập trung.",
      badge: "Focus 25'",
    },
  ],

  showStatus: true,
  statusText: "Trực tuyến 24/7",
  statusDotColor: "#22c55e",

  links: [
    { label: "Trung tâm hỗ trợ", href: "#", iconClass: "bi bi-life-preserver" },
    { label: "Theo dõi đơn", href: "#", iconClass: "bi bi-truck" },
    { label: "Tài khoản", href: "#", iconClass: "bi bi-person-circle" },
  ],

  preview: false,
};

const cx = (...classes: Array<string | null | undefined | false>) => classes.filter(Boolean).join(" ");

export const TopbarAurora2026: React.FC<TopbarAurora2026Props> = (props) => {
  const {
    logoIconClass,
    brandTitle,
    brandSubtitle,
    showRegionButton,
    regionLabel,
    regionIconClass,
    regionChevronIconClass,

    showTicker,
    tickerLabel,
    tickerItems,

    backgroundColor,

    showStatus,
    statusText,
    statusDotColor,

    links,
    preview,
  } = {
    ...DEFAULT_TOPBAR_AURORA_2026_PROPS,
    ...props,
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const tbRightRef = useRef<HTMLDivElement | null>(null);

  // ticker state
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPhase, setTickerPhase] = useState<"active" | "leaving" | "entering">("active");
  const tickerItemsSafe = useMemo(() => tickerItems ?? [], [tickerItems]);
  const tickerEnabled = showTicker && tickerItemsSafe && Array.isArray(tickerItemsSafe) && tickerItemsSafe.length > 0;

  // Ticker auto-rotate
  useEffect(() => {
    if (!tickerEnabled || tickerItemsSafe.length < 2) {
      setTickerPhase("active");
      setTickerIndex(0);
      return;
    }

    let timeoutLeave: number | undefined;
    let timeoutEnter: number | undefined;
    const interval = window.setInterval(() => {
      setTickerPhase("leaving");

      timeoutLeave = window.setTimeout(() => {
        setTickerIndex((prev) => (prev + 1) % tickerItemsSafe.length);
        setTickerPhase("entering");

        // nhỏ trick để CSS transition mượt
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTickerPhase("active");
          });
        });
      }, 280);
    }, 4600);

    return () => {
      window.clearInterval(interval);
      if (timeoutLeave) window.clearTimeout(timeoutLeave);
      if (timeoutEnter) window.clearTimeout(timeoutEnter);
    };
  }, [tickerEnabled, tickerItemsSafe.length]);

  // Click outside để đóng menu mobile
  useEffect(() => {
    const handleClickOutside = (evt: MouseEvent) => {
      if (!tbRightRef.current) return;
      if (!tbRightRef.current.contains(evt.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const tickerTextClassName = cx(styles.tickerText, tickerPhase === "leaving" && styles.isLeaving, tickerPhase === "entering" && styles.isEntering, tickerPhase === "active" && styles.isActive);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href?: string) => {
    if (preview || !href || href === "#") {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const style: React.CSSProperties | undefined = backgroundColor ? ({ "--g1": backgroundColor } as React.CSSProperties) : undefined;

  const currentTicker = tickerEnabled ? tickerItemsSafe[Math.min(tickerIndex, tickerItemsSafe.length - 1)] : null;

  const safeLinks = links ?? [];

  return (
    <div className={styles.topbar}>
      <div className={styles.topbarInner} style={style}>
        {/* LEFT */}
        <div className={styles.tbLeft}>
          <div className={styles.logoCircle}>
            <i className={logoIconClass} />
          </div>
          <div className={styles.brandTextWrap}>
            <div className={styles.brandTitle}>{brandTitle}</div>
            {brandSubtitle && <div className={styles.brandSub}>{brandSubtitle}</div>}
          </div>

          {showRegionButton && (
            <button className={styles.regionBtn} type="button">
              {regionIconClass && <i className={regionIconClass} />}
              <span>{regionLabel}</span>
              {regionChevronIconClass && <i className={regionChevronIconClass} />}
            </button>
          )}
        </div>

        {/* CENTER – Ticker */}
        <div className={styles.tbCenter}>
          {tickerEnabled && currentTicker && (
            <div className={styles.ticker}>
              <div className={styles.tickerBox}>
                {tickerLabel && <span className={styles.tickerLabel}>{tickerLabel}</span>}
                <div className={tickerTextClassName}>
                  <span className={styles.main}>{currentTicker.text}</span>
                  {currentTicker.badge && <span className={styles.tag}>{currentTicker.badge}</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className={cx(styles.tbRight, isMenuOpen && styles.tbRightOpen)} ref={tbRightRef}>
          <div className={styles.tbLinks}>
            {safeLinks.map((link, idx) => (
              <a key={`${link.label}-${idx}`} className={styles.tbLink} href={link.href || "#"} onClick={(e) => handleLinkClick(e, link.href)}>
                {link.iconClass && <i className={link.iconClass} />}
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          <div className={styles.tbDivider} />

          {showStatus && statusText && (
            <div className={styles.statusPill}>
              <span className={styles.dot} style={statusDotColor ? { backgroundColor: statusDotColor } : undefined} />
              <span>{statusText}</span>
            </div>
          )}

          <button className={styles.moreBtn} type="button" onClick={() => setIsMenuOpen((v) => !v)}>
            <i className="bi bi-list" />
          </button>
        </div>
      </div>
    </div>
  );
};

// REGITEM
export const TOPBAR_AURORA_2026_REGITEM: RegItem = {
  kind: "Topbar2026",
  label: "Topbar 2026",
  defaults: DEFAULT_TOPBAR_AURORA_2026_PROPS as TopbarAurora2026Props,
  inspector: [],
  render: (p) => <TopbarAurora2026 {...(p as TopbarAurora2026Props)} />,
};
