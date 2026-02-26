import React, { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import type { RegItem } from "@/lib/ui-builder/types";
import styles from "@/components/admin/templates/ShopTemplate/styles/topbar/TopbarBlue.module.css";

export interface TopbarBlueTickerItem {
  text: string;
  badge?: string;
}

export interface TopbarBlueLinkItem {
  label: string;
  href?: string;
  iconClass?: string;
}

export interface TopbarBlueProps {
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
  tickerItems?: TopbarBlueTickerItem[];

  // Màu nền topbar (override --blue-main)
  backgroundColor?: string;

  // Status pill
  showStatus?: boolean;
  statusText?: string;
  statusDotColor?: string;

  // Links bên phải
  links?: TopbarBlueLinkItem[];

  // UI Builder preview
  preview?: boolean; // true = chặn click <a>
}

/** DEFAULT DATA (mapping từ HTML/JS gốc) */
export const DEFAULT_TOPBAR_BLUE_TICKERS: TopbarBlueTickerItem[] = [
  {
    text: "Hệ thống đang hoạt động ổn định.",
    badge: "Online",
  },
  {
    text: "Nâng cấp giao diện Blue Mode 2025.",
    badge: "Update",
  },
  {
    text: "Hỗ trợ 24/7 – phản hồi trong 3 phút.",
    badge: "Support",
  },
];

export const DEFAULT_TOPBAR_BLUE_LINKS: TopbarBlueLinkItem[] = [
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

export const TOPBAR_BLUE_DEFAULTS: TopbarBlueProps = {
  // Logo + brand
  logoIconClass: "bi bi-lightning-fill",
  brandTitle: "Aurora Blue",
  brandSubtitle: "Topbar 2025 – Xanh đậm chuyên nghiệp",

  // Region
  showRegionButton: true,
  regionLabel: "KV: Hồ Chí Minh",
  regionIconClass: "bi bi-geo-alt",
  regionChevronIconClass: "bi bi-chevron-down",

  // Ticker
  showTicker: true,
  tickerLabel: "News",
  tickerItems: DEFAULT_TOPBAR_BLUE_TICKERS,

  // Background
  backgroundColor: "#0b5ed7",

  // Status
  showStatus: true,
  statusText: "Online",
  statusDotColor: "#4ade80",

  // Links
  links: DEFAULT_TOPBAR_BLUE_LINKS,

  // Preview mode
  preview: false,
};

/** UI COMPONENT */
export const TopbarBlue: React.FC<TopbarBlueProps> = (props) => {
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
    ...TOPBAR_BLUE_DEFAULTS,
    ...props,
  };

  const effectiveTickerItems = tickerItems ?? [];
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPhase, setTickerPhase] = useState<"active" | "leaving" | "entering">("active");
  const tickerTimeoutRef = useRef<number | null>(null);
  const tickerIntervalRef = useRef<number | null>(null);

  const tbRightRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Ticker behavior (giống JS gốc)
  useEffect(() => {
    if (!showTicker || effectiveTickerItems.length <= 1) {
      return;
    }

    const rotate = () => {
      setTickerPhase("leaving");

      tickerTimeoutRef.current = window.setTimeout(() => {
        setTickerIndex((prev) => (prev + 1) % effectiveTickerItems.length);
        setTickerPhase("entering");

        // Trigger reflow + chuyển sang active
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTickerPhase("active");
          });
        });
      }, 250);
    };

    tickerIntervalRef.current = window.setInterval(rotate, 4200);

    return () => {
      if (tickerIntervalRef.current !== null) {
        window.clearInterval(tickerIntervalRef.current);
      }
      if (tickerTimeoutRef.current !== null) {
        window.clearTimeout(tickerTimeoutRef.current);
      }
    };
  }, [showTicker, effectiveTickerItems.length]);

  // Click outside tbRight để đóng mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | globalThis.MouseEvent) => {
      const target = event.target as Node | null;
      if (!tbRightRef.current || !target) return;
      if (!tbRightRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleMoreClick = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (preview) {
      e.preventDefault();
    }
  };

  const tickerItem = effectiveTickerItems[tickerIndex] ?? null;

  const tickerTextClasses = [styles.tickerText];
  if (tickerPhase === "leaving") tickerTextClasses.push(styles.isLeaving);
  if (tickerPhase === "entering") tickerTextClasses.push(styles.isEntering);
  if (tickerPhase === "active") tickerTextClasses.push(styles.isActive);

  const tbRightClassName = [styles.tbRight, isMenuOpen ? styles.tbRightOpen : ""].filter(Boolean).join(" ");

  const topbarStyle: CSSProperties = {};
  if (backgroundColor) {
    (topbarStyle as any)["--blue-main"] = backgroundColor;
  }
  if (statusDotColor) {
    (topbarStyle as any)["--status-dot-color"] = statusDotColor;
  }

  return (
    <div className={styles.topbar} style={topbarStyle}>
      <div className={styles.topbarInner}>
        {/* LEFT */}
        <div className={styles.tbLeft}>
          <div className={styles.logoCircle}>{logoIconClass ? <i className={logoIconClass} /> : null}</div>

          <div>
            {brandTitle && <div className={styles.brandTitle}>{brandTitle}</div>}
            {brandSubtitle && <div className={styles.brandSub}>{brandSubtitle}</div>}
          </div>

          {showRegionButton && (
            <button className={styles.regionBtn} type="button">
              {regionIconClass && <i className={regionIconClass} />}
              {regionLabel}
              {regionChevronIconClass && <i className={regionChevronIconClass} />}
            </button>
          )}
        </div>

        {/* CENTER – ticker */}
        {showTicker && (
          <div className={styles.tbCenter}>
            <div className={styles.ticker}>
              <div className={styles.tickerBox}>
                {tickerLabel && <span className={styles.tickerLabel}>{tickerLabel}</span>}
                {tickerItem && (
                  <div className={tickerTextClasses.join(" ")}>
                    <span>{tickerItem.text}</span>
                    {tickerItem.badge && <span className={styles.tag}>{tickerItem.badge}</span>}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* RIGHT */}
        <div className={tbRightClassName} ref={tbRightRef}>
          <div className={styles.tbLinks}>
            {(links ?? []).map((link, idx) => (
              <a key={idx} className={styles.tbLink} href={link.href ?? "#"} onClick={handleLinkClick}>
                {link.iconClass && <i className={link.iconClass} />}
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          {showStatus && statusText && (
            <div className={styles.statusPill}>
              <span className={styles.dot} />
              {statusText}
            </div>
          )}

          <button className={styles.moreBtn} id="moreBtn" type="button" onClick={handleMoreClick}>
            <i className="bi bi-list" />
          </button>
        </div>
      </div>
    </div>
  );
};

/** RegItem cho UI Builder */
export const TOPBAR_BLUE_REGITEM: RegItem = {
  kind: "TopbarBlueKind",
  label: "Topbar Blue",
  defaults: TOPBAR_BLUE_DEFAULTS,
  inspector: [],
  render: (p) => <TopbarBlue {...(p as TopbarBlueProps)} />,
};

export default TopbarBlue;
