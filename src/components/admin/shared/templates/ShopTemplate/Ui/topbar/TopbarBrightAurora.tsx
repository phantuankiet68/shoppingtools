// Ui/topbar/TopbarBrightAurora.tsx
import React, { CSSProperties, useEffect, useRef, useState } from "react";
import type { RegItem } from "@/lib/ui-builder/types";

import styles from "@/components/admin/shared/templates/ShopTemplate/styles/topbar/TopbarBrightAurora.module.css";

export interface TopbarProTickerItem {
  text: string;
  badge?: string;
}

export interface TopbarProLinkItem {
  label: string;
  href?: string;
  iconClass?: string;
}

export interface TopbarBrightAuroraProps {
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

  // Preview mode (chặn click link)
  preview?: boolean;
}

// ===== DEFAULTS =====

export const DEFAULT_TOPBAR_BRIGHT_AURORA_TICKERS: TopbarProTickerItem[] = [
  {
    text: "Ra mắt trải nghiệm “Mood Reading” – chọn sách theo cảm xúc.",
    badge: "New",
  },
  {
    text: "Gói đọc Premium 2026 – truy cập 65+ thư viện đối tác.",
    badge: "Premium",
  },
  {
    text: "Không gian đọc sáng tạo: Light Mode Aurora vừa được cập nhật.",
    badge: "Update",
  },
];

export const DEFAULT_TOPBAR_BRIGHT_AURORA_LINKS: TopbarProLinkItem[] = [
  {
    label: "Trung tâm hỗ trợ",
    href: "#",
    iconClass: "bi bi-life-preserver",
  },
  {
    label: "Theo dõi đơn",
    href: "#",
    iconClass: "bi bi-truck",
  },
  {
    label: "Tài khoản của tôi",
    href: "#",
    iconClass: "bi bi-person-circle",
  },
];

export const DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS: TopbarBrightAuroraProps = {
  logoIconClass: "bi bi-stars",
  brandTitle: "Aurora Hub",
  brandSubtitle: "Không gian đọc & trải nghiệm 2026",

  showRegionButton: true,
  regionLabel: "KV: Hồ Chí Minh",
  regionIconClass: "bi bi-geo-alt",
  regionChevronIconClass: "bi bi-chevron-down",

  showTicker: true,
  tickerLabel: "Updates",
  tickerItems: DEFAULT_TOPBAR_BRIGHT_AURORA_TICKERS,

  backgroundColor: "#ffe8d6",

  showStatus: true,
  statusText: "Online",
  statusDotColor: "#22c55e",

  links: DEFAULT_TOPBAR_BRIGHT_AURORA_LINKS,

  preview: false,
};

// ===== COMPONENT =====

type TickerPhase = "active" | "leaving" | "entering";

export const TopbarBrightAurora: React.FC<TopbarBrightAuroraProps> = (props) => {
  const {
    logoIconClass = DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS.logoIconClass,
    brandTitle = DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS.brandTitle,
    brandSubtitle = DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS.brandSubtitle,

    showRegionButton = DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS.showRegionButton,
    regionLabel = DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS.regionLabel,
    regionIconClass = DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS.regionIconClass,
    regionChevronIconClass = DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS.regionChevronIconClass,

    showTicker = DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS.showTicker,
    tickerLabel = DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS.tickerLabel,

    backgroundColor = DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS.backgroundColor,

    showStatus = DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS.showStatus,
    statusText = DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS.statusText,
    statusDotColor = props.statusDotColor ?? DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS.statusDotColor,

    preview = DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS.preview,
  } = props;

  // Ticker & links derive từ props (hoặc dùng default nếu rỗng)
  const tickerItems: TopbarProTickerItem[] =
    props.tickerItems && props.tickerItems.length > 0 ? props.tickerItems : DEFAULT_TOPBAR_BRIGHT_AURORA_TICKERS;

  const links: TopbarProLinkItem[] =
    props.links && props.links.length > 0 ? props.links : DEFAULT_TOPBAR_BRIGHT_AURORA_LINKS;

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPhase, setTickerPhase] = useState<TickerPhase>("active");

  const tbRightRef = useRef<HTMLDivElement | null>(null);
  const intervalRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

  // ===== TICKER BEHAVIOR =====
  useEffect(() => {
    const hasTicker = showTicker && tickerItems && tickerItems.length >= 2;

    if (!hasTicker) {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
      }
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }
      setTickerPhase("active");
      setTickerIndex(0);
      return;
    }

    const rotate = () => {
      setTickerPhase("leaving");

      timeoutRef.current = window.setTimeout(() => {
        setTickerIndex((prev) => {
          const next = (prev + 1) % tickerItems.length;
          return next;
        });
        setTickerPhase("entering");

        requestAnimationFrame(() => {
          setTickerPhase("active");
        });
      }, 260);
    };

    intervalRef.current = window.setInterval(rotate, 4200);

    return () => {
      if (intervalRef.current != null) {
        window.clearInterval(intervalRef.current);
      }
      if (timeoutRef.current != null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, [showTicker, tickerItems]);

  // ===== CLICK OUTSIDE MOBILE MENU =====
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!tbRightRef.current) return;
      if (!tbRightRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (preview) {
      e.preventDefault();
    }
  };

  const tbRightClassName = isMenuOpen ? `${styles.tbRight} ${styles.tbRightOpen}` : styles.tbRight;

  const tickerTextClassName = [
    styles.tickerText,
    tickerPhase === "leaving" && styles.isLeaving,
    tickerPhase === "entering" && styles.isEntering,
    tickerPhase === "active" && styles.isActive,
  ]
    .filter(Boolean)
    .join(" ");

  const currentTicker = tickerItems[tickerIndex];

  const topbarStyle: CSSProperties = {
    // cho phép override g1 bằng backgroundColor
    ["--g1" as any]: backgroundColor,
  };

  return (
    <div className={styles.topbar} style={topbarStyle}>
      <div className={styles.topbarInner}>
        {/* LEFT */}
        <div className={styles.tbLeft}>
          <div className={styles.logoCircle}>{logoIconClass && <i className={logoIconClass} />}</div>

          <div className={styles.brandTextWrap}>
            {brandTitle && <div className={styles.brandTitle}>{brandTitle}</div>}
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
        {showTicker && (
          <div className={styles.tbCenter}>
            <div className={styles.ticker}>
              <div className={styles.tickerBox}>
                {tickerLabel && <span className={styles.tickerLabel}>{tickerLabel}</span>}
                <div className={tickerTextClassName}>
                  <span>{currentTicker?.text}</span>
                  {currentTicker?.badge && <span className={styles.tag}>{currentTicker.badge}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT */}
        <div className={tbRightClassName} ref={tbRightRef}>
          <div className={styles.tbLinks}>
            {links.map((link: TopbarProLinkItem, idx: number) => (
              <a
                key={`${link.label}-${idx}`}
                href={link.href || "#"}
                className={styles.tbLink}
                onClick={handleLinkClick}
              >
                {link.iconClass && <i className={link.iconClass} />}
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          {showStatus && (
            <div className={styles.statusPill}>
              <span
                className={styles.dot}
                style={{
                  backgroundColor: statusDotColor || "#22c55e",
                }}
              />
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

// ===== REGITEM =====

export const TOPBAR_BRIGHT_AURORA_REGITEM: RegItem = {
  kind: "TopbarBright",
  label: "Topbar Bright",
  defaults: DEFAULT_TOPBAR_BRIGHT_AURORA_PROPS as TopbarBrightAuroraProps,
  inspector: [],
  render: (p) => <TopbarBrightAurora {...(p as TopbarBrightAuroraProps)} />,
};
