// Ui/topbar/TopbarBlueAurora.tsx
import React, { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";

import styles from "@/components/admin/shared/templates/ShopTemplate/styles/topbar/TopbarBlueAurora.module.css";
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

export interface TopbarBlueAuroraProps {
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

export const DEFAULT_TOPBAR_BLUE_AURORA_PROPS: TopbarBlueAuroraProps = {
  logoIconClass: "bi bi-lightning",
  brandTitle: "Aurora Blue",
  brandSubtitle: "Không gian sáng tạo – phiên bản Blue 2026",

  showRegionButton: true,
  regionLabel: "KV: Hồ Chí Minh",
  regionIconClass: "bi bi-geo-alt",
  regionChevronIconClass: "bi bi-chevron-down",

  showTicker: true,
  tickerLabel: "NEWS",
  tickerItems: [
    {
      text: "Cập nhật giao diện Blue Mode 2026 – nhanh & sáng hơn.",
      badge: "Update",
    },
    {
      text: "Nâng cấp bộ máy đề xuất – chính xác 40% hơn.",
      badge: "AI",
    },
    {
      text: "Thêm chế độ đọc ban ngày: Blue Clear Mode.",
      badge: "New",
    },
  ],

  backgroundColor: "#ffffff",

  showStatus: true,
  statusText: "Online",
  statusDotColor: "#0b5ed7",

  links: [
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
  ],

  preview: false,
};

type Phase = "active" | "leaving" | "entering";

export const TopbarBlueAurora: React.FC<TopbarBlueAuroraProps> = (props) => {
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
    tickerItems,

    backgroundColor,

    showStatus = true,
    statusText,
    statusDotColor,

    links,
    preview = false,
  } = { ...DEFAULT_TOPBAR_BLUE_AURORA_PROPS, ...props };

  // --------- Ticker state ----------
  const effectiveTickerItems = tickerItems ?? [];
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>("active");

  const timeoutRef = useRef<number | null>(null);
  const intervalRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Không rotate nếu không showTicker hoặc < 2 item
    if (!showTicker || effectiveTickerItems.length < 2) {
      return;
    }

    const rotate = () => {
      setPhase("leaving");

      // Sau 260ms đổi nội dung + phase entering
      timeoutRef.current = window.setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % effectiveTickerItems.length);
        setPhase("entering");

        rafRef.current = window.requestAnimationFrame(() => {
          // force reflow
          // eslint-disable-next-line @typescript-eslint/no-unused-expressions
          document.body.offsetHeight;
          setPhase("active");
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
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
    };
  }, [showTicker, effectiveTickerItems.length]);

  const currentTickerItem = effectiveTickerItems[activeIndex] ?? effectiveTickerItems[0];

  // --------- Mobile menu ----------
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const tbRightRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!tbRightRef.current) return;
      if (!tbRightRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleMenu = () => {
    setIsMenuOpen((open) => !open);
  };

  const handleLinkClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const tbRightClassName = [styles.tbRight, isMenuOpen ? styles.tbRightOpen : ""].filter(Boolean).join(" ");

  const tickerTextClassName = [
    styles.tickerText,
    phase === "leaving" ? styles.isLeaving : phase === "entering" ? styles.isEntering : styles.isActive,
  ]
    .filter(Boolean)
    .join(" ");

  const topbarStyle: CSSProperties | undefined = backgroundColor ? { backgroundColor } : undefined;

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
            <button type="button" className={styles.regionBtn}>
              {regionIconClass && <i className={regionIconClass} />}
              <span>{regionLabel}</span>
              {regionChevronIconClass && <i className={regionChevronIconClass} />}
            </button>
          )}
        </div>

        {/* CENTER – Ticker */}
        {showTicker && effectiveTickerItems.length > 0 && (
          <div className={styles.tbCenter}>
            <div className={styles.ticker}>
              <div className={styles.tickerBox}>
                {tickerLabel && <span className={styles.tickerLabel}>{tickerLabel}</span>}
                <div className={tickerTextClassName}>
                  <span>{currentTickerItem.text}</span>
                  {currentTickerItem.badge && <span className={styles.tag}>{currentTickerItem.badge}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT */}
        <div className={tbRightClassName} ref={tbRightRef}>
          <div className={styles.tbLinks}>
            {(links ?? []).map((link, index) => (
              <a
                key={`${link.label}-${index}`}
                className={styles.tbLink}
                href={link.href ?? "#"}
                onClick={handleLinkClick}
              >
                {link.iconClass && <i className={link.iconClass} />}
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          {showStatus && (
            <div className={styles.statusPill}>
              <span className={styles.dot} style={statusDotColor ? { backgroundColor: statusDotColor } : undefined} />
              <span>{statusText}</span>
            </div>
          )}

          <button type="button" className={styles.moreBtn} onClick={handleToggleMenu}>
            <i className="bi bi-list" />
          </button>
        </div>
      </div>
    </div>
  );
};

// RegItem
export const TOPBAR_BLUE_AURORA_REGITEM: RegItem = {
  kind: "TopbarAurora",
  label: "Topbar Aurora",
  defaults: DEFAULT_TOPBAR_BLUE_AURORA_PROPS as TopbarBlueAuroraProps,
  inspector: [],
  render: (p) => <TopbarBlueAurora {...(p as TopbarBlueAuroraProps)} />,
};
