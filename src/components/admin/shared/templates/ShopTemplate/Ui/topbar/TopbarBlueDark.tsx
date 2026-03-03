// Ui/topbar/TopbarBlueDark.tsx
import React, { useEffect, useRef, useState, type CSSProperties, type MouseEvent } from "react";

import styles from "@/components/admin/shared/templates/ShopTemplate/styles/topbar/TopbarBlueDark.module.css";
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

export interface TopbarBlueDarkProps {
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

const DEFAULT_TOPBAR_BLUEDARK_TICKERS: TopbarProTickerItem[] = [
  {
    text: "Nâng cấp hệ thống đề xuất – nhanh hơn & chính xác hơn.",
    badge: "Update",
  },
  {
    text: "Ra mắt tính năng mới trong giao diện Aurora Blue.",
    badge: "New",
  },
  {
    text: "Hỗ trợ khách hàng 24/7 – phản hồi trong 3 phút.",
    badge: "Support",
  },
];

const DEFAULT_TOPBAR_BLUEDARK_LINKS: TopbarProLinkItem[] = [
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

export const DEFAULT_TOPBAR_BLUEDARK_PROPS: TopbarBlueDarkProps = {
  logoIconClass: "bi bi-lightning",
  brandTitle: "Aurora Blue",
  brandSubtitle: "Giao diện xanh đậm chuẩn 2025",

  showRegionButton: true,
  regionLabel: "KV: Hồ Chí Minh",
  regionIconClass: "bi bi-geo-alt",
  regionChevronIconClass: "bi bi-chevron-down",

  showTicker: true,
  tickerLabel: "News",
  tickerItems: DEFAULT_TOPBAR_BLUEDARK_TICKERS,

  backgroundColor: "#ffffff",

  showStatus: true,
  statusText: "Trực tuyến",
  statusDotColor: "#0b5ed7",

  links: DEFAULT_TOPBAR_BLUEDARK_LINKS,

  preview: false,
};

const TICKER_INTERVAL = 4200;
const LEAVE_DURATION = 250;

export function TopbarBlueDark(rawProps: TopbarBlueDarkProps) {
  const props: TopbarBlueDarkProps = {
    ...DEFAULT_TOPBAR_BLUEDARK_PROPS,
    ...rawProps,
  };

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
    tickerItems: inputTickerItems,
    backgroundColor,
    showStatus = true,
    statusText,
    statusDotColor,
    links = DEFAULT_TOPBAR_BLUEDARK_LINKS,
    preview = false,
  } = props;

  const tickerItems =
    inputTickerItems && inputTickerItems.length > 0 ? inputTickerItems : DEFAULT_TOPBAR_BLUEDARK_TICKERS;

  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPhase, setTickerPhase] = useState<"active" | "leaving" | "entering">("active");

  const rightRef = useRef<HTMLDivElement | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Ticker auto-rotate
  useEffect(() => {
    if (!showTicker || !tickerItems || tickerItems.length <= 1) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setTickerPhase("leaving");

      window.setTimeout(() => {
        setTickerIndex((prev) => {
          const next = (prev + 1) % tickerItems.length;
          return next;
        });

        setTickerPhase("entering");

        requestAnimationFrame(() => {
          // trigger lại layout để transition
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          document.body.offsetHeight;
          setTickerPhase("active");
        });
      }, LEAVE_DURATION);
    }, TICKER_INTERVAL);

    return () => window.clearInterval(intervalId);
  }, [showTicker, tickerItems]);

  // Click outside để đóng mobile menu
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | globalThis.MouseEvent) {
      if (!rightRef.current) return;
      const target = e.target as Node | null;
      if (target && !rightRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("click", handleClickOutside as any);
    return () => document.removeEventListener("click", handleClickOutside as any);
  }, []);

  const topbarStyle: CSSProperties | undefined = backgroundColor ? { backgroundColor } : undefined;

  let tickerTextClassName = styles.tickerText;
  if (tickerPhase === "leaving") {
    tickerTextClassName += ` ${styles.isLeaving}`;
  } else if (tickerPhase === "entering") {
    tickerTextClassName += ` ${styles.isEntering}`;
  } else {
    tickerTextClassName += ` ${styles.isActive}`;
  }

  const currentTicker = tickerItems[tickerIndex];

  const handleLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (preview) {
      e.preventDefault();
    }
  };

  const tbRightClassName = `${styles.tbRight} ${isMenuOpen ? styles.tbRightOpen : ""}`;

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
              {regionLabel && <span>{regionLabel}</span>}
              {regionChevronIconClass && <i className={regionChevronIconClass} />}
            </button>
          )}
        </div>

        {/* CENTER – ticker */}
        <div className={styles.tbCenter}>
          {showTicker && tickerItems && tickerItems.length > 0 && (
            <div className={styles.ticker}>
              <div className={styles.tickerBox}>
                {tickerLabel && <span className={styles.tickerLabel}>{tickerLabel}</span>}

                <div className={tickerTextClassName}>
                  <span>{currentTicker?.text}</span>
                  {currentTicker?.badge && <span className={styles.tag}>{currentTicker.badge}</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className={tbRightClassName} ref={rightRef}>
          <div className={styles.tbLinks}>
            {links?.map((link, idx) => (
              <a
                key={`${link.label}-${idx}`}
                className={styles.tbLink}
                href={link.href || "#"}
                onClick={handleLinkClick}
              >
                {link.iconClass && <i className={link.iconClass} />}
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          {showStatus && statusText && (
            <div className={styles.statusPill}>
              <span
                className={styles.dot}
                style={statusDotColor ? ({ backgroundColor: statusDotColor } as CSSProperties) : undefined}
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
}

// RegItem cho UI Builder
export const TOPBAR_BLUE_DARK_REGITEM: RegItem = {
  kind: "TopbarBlueDark",
  label: "Topbar Dark",
  defaults: DEFAULT_TOPBAR_BLUEDARK_PROPS as TopbarBlueDarkProps,
  inspector: [],
  render: (p) => <TopbarBlueDark {...(p as TopbarBlueDarkProps)} />,
};

export default TopbarBlueDark;
