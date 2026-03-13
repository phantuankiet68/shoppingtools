"use client";

// src/components/admin/shared/templates/sections/Topbar/TopbarAnnouncement.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { RegItem } from "@/lib/ui-builder/types";
import styles from "@/styles/templates/sections/Topbar/TopbarAnnouncement.module.css";

export interface TopbarAnnouncementTickerItem {
  text: string;
  badge?: string;
}

export interface TopbarAnnouncementLinkItem {
  label: string;
  href?: string;
  iconClass?: string;
}

export interface TopbarAnnouncementProps extends Record<string, unknown> {
  logoIconClass?: string;
  brandTitle?: string;
  brandSubtitle?: string;

  showRegionButton?: boolean;
  regionLabel?: string;
  regionIconClass?: string;
  regionChevronIconClass?: string;

  showTicker?: boolean;
  tickerLabel?: string;
  tickerItems?: TopbarAnnouncementTickerItem[];

  backgroundColor?: string;

  showStatus?: boolean;
  statusText?: string;
  statusDotColor?: string;

  links?: TopbarAnnouncementLinkItem[];

  preview?: boolean;
}

/* ===== DEFAULT DATA ===== */

export const DEFAULT_TOPBAR_ANNOUNCEMENT_TICKERS: TopbarAnnouncementTickerItem[] = [
  { text: "Ưu đãi xanh – giao nhanh trong ngày.", badge: "Hot" },
  { text: "Miễn phí đổi trả trong 7 ngày.", badge: "Support" },
];

export const DEFAULT_TOPBAR_ANNOUNCEMENT_LINKS: TopbarAnnouncementLinkItem[] = [
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

export const TopbarAnnouncement: React.FC<TopbarAnnouncementProps> = ({
  logoIconClass = "bi bi-leaf-fill",
  brandTitle = "Aurora Green",
  brandSubtitle = "Topbar 2025 – Xanh lá nhạt, nhẹ mắt",

  showRegionButton = true,
  regionLabel = "KV: Hồ Chí Minh",
  regionIconClass = "bi bi-geo-alt",
  regionChevronIconClass = "bi bi-chevron-down",

  showTicker = true,
  tickerLabel = "Tin mới",
  tickerItems: tickerItemsProp,
  backgroundColor = "#a7f3d0",

  showStatus = true,
  statusText = "Online",
  statusDotColor,

  links: linksProp,
  preview = false,
}) => {
  const links = useMemo(
    () => (linksProp?.length ? linksProp : DEFAULT_TOPBAR_ANNOUNCEMENT_LINKS),
    [linksProp],
  );

  const tickerItems = useMemo(
    () => (tickerItemsProp?.length ? tickerItemsProp : DEFAULT_TOPBAR_ANNOUNCEMENT_TICKERS),
    [tickerItemsProp],
  );

  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPhase, setTickerPhase] = useState<"active" | "leaving" | "entering">("active");
  const [menuOpen, setMenuOpen] = useState(false);

  const tbRightRef = useRef<HTMLDivElement | null>(null);
  const rotateIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rotateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const mountedRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;

      if (rotateIntervalRef.current) {
        clearInterval(rotateIntervalRef.current);
        rotateIntervalRef.current = null;
      }

      if (rotateTimeoutRef.current) {
        clearTimeout(rotateTimeoutRef.current);
        rotateTimeoutRef.current = null;
      }

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!showTicker || tickerItems.length <= 1) {
      setTickerIndex(0);
      setTickerPhase("active");

      if (rotateIntervalRef.current) {
        clearInterval(rotateIntervalRef.current);
        rotateIntervalRef.current = null;
      }

      if (rotateTimeoutRef.current) {
        clearTimeout(rotateTimeoutRef.current);
        rotateTimeoutRef.current = null;
      }

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }

      return;
    }

    const runCycle = () => {
      if (!mountedRef.current) return;

      setTickerPhase("leaving");

      if (rotateTimeoutRef.current) {
        clearTimeout(rotateTimeoutRef.current);
      }

      rotateTimeoutRef.current = setTimeout(() => {
        if (!mountedRef.current) return;

        setTickerIndex((prev) => (prev + 1) % tickerItems.length);
        setTickerPhase("entering");

        if (rafRef.current !== null) {
          cancelAnimationFrame(rafRef.current);
        }

        rafRef.current = requestAnimationFrame(() => {
          if (!mountedRef.current) return;
          setTickerPhase("active");
        });
      }, 250);
    };

    rotateIntervalRef.current = setInterval(runCycle, 4200);

    return () => {
      if (rotateIntervalRef.current) {
        clearInterval(rotateIntervalRef.current);
        rotateIntervalRef.current = null;
      }

      if (rotateTimeoutRef.current) {
        clearTimeout(rotateTimeoutRef.current);
        rotateTimeoutRef.current = null;
      }

      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [showTicker, tickerItems.length]);

  useEffect(() => {
    if (!menuOpen || preview) return;

    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) return;

      if (tbRightRef.current?.contains(target)) return;
      setMenuOpen(false);
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, [menuOpen, preview]);

  useEffect(() => {
    if (preview && menuOpen) {
      setMenuOpen(false);
    }
  }, [preview, menuOpen]);

  const handlePreventInPreview = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleLinkClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleRegionClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // Placeholder cho action sau này
  };

  const handleMoreClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    setMenuOpen((open) => !open);
  };

  const rootStyle: React.CSSProperties & Record<string, string> = {
    backgroundColor,
    "--topbar-announcement-background": backgroundColor,
  };

  const tickerItem = tickerItems[tickerIndex];

  const tickerTextClassName = [
    styles.tickerText,
    tickerPhase === "leaving" ? styles.isLeaving : "",
    tickerPhase === "entering" ? styles.isEntering : "",
    tickerPhase === "active" ? styles.isActive : "",
  ]
    .filter(Boolean)
    .join(" ");

  const tbRightClassName = [styles.tbRight, menuOpen ? styles.tbRightOpen : ""]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={styles.topbar}
      style={rootStyle}
      onClick={handlePreventInPreview}
      aria-label="Topbar Announcement"
    >
      <div className={styles.topbarInner}>
        <div className={styles.tbLeft}>
          <div className={styles.logoCircle} aria-hidden="true">
            {logoIconClass ? <i className={logoIconClass} /> : null}
          </div>

          <div>
            <div className={styles.brandTitle}>{brandTitle}</div>
            <div className={styles.brandSub}>{brandSubtitle}</div>
          </div>

          {showRegionButton && (
            <button
              className={styles.regionBtn}
              type="button"
              onClick={handleRegionClick}
              aria-label={regionLabel}
            >
              {regionIconClass ? <i className={regionIconClass} aria-hidden="true" /> : null}
              <span>{regionLabel}</span>
              {regionChevronIconClass ? (
                <i className={regionChevronIconClass} aria-hidden="true" />
              ) : null}
            </button>
          )}
        </div>

        <div className={styles.tbCenter}>
          {showTicker && tickerItem ? (
            <div className={styles.ticker}>
              <div className={styles.tickerBox}>
                <span className={styles.tickerLabel}>{tickerLabel}</span>

                <div className={tickerTextClassName}>
                  <span>{tickerItem.text}</span>
                  {tickerItem.badge ? <span className={styles.tag}>{tickerItem.badge}</span> : null}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className={tbRightClassName} ref={tbRightRef}>
          <div className={styles.tbLinks}>
            {links.map((link, index) => (
              <a
                key={`${link.label}-${index}`}
                className={styles.tbLink}
                href={link.href || "#"}
                onClick={handleLinkClick}
              >
                {link.iconClass ? <i className={link.iconClass} aria-hidden="true" /> : null}
                <span>{link.label}</span>
              </a>
            ))}
          </div>

          {showStatus ? (
            <div className={styles.statusPill}>
              <span
                className={styles.dot}
                style={statusDotColor ? { backgroundColor: statusDotColor } : undefined}
              />
              <span>{statusText}</span>
            </div>
          ) : null}

          <button
            className={styles.moreBtn}
            id="topbarAnnouncementMoreBtn"
            type="button"
            onClick={handleMoreClick}
            aria-label="Mở menu topbar"
            aria-expanded={menuOpen}
          >
            <i className="bi bi-list" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const SHOP_TOPBAR_ANNOUNCEMENT: RegItem = {
  kind: "Announcement",
  label: "Announcement",
  defaults: {
    logoIconClass: "bi bi-leaf-fill",
    brandTitle: "Aurora Green",
    brandSubtitle: "Topbar 2025 – Xanh lá nhạt, nhẹ mắt",

    showRegionButton: true,
    regionLabel: "KV: Hồ Chí Minh",
    regionIconClass: "bi bi-geo-alt",
    regionChevronIconClass: "bi bi-chevron-down",

    showTicker: true,
    tickerLabel: "Tin mới",
    tickerItems: DEFAULT_TOPBAR_ANNOUNCEMENT_TICKERS,

    backgroundColor: "#a7f3d0",

    showStatus: true,
    statusText: "Online",
    statusDotColor: "#16a34a",

    links: DEFAULT_TOPBAR_ANNOUNCEMENT_LINKS,

    preview: false,
  },
  inspector: [],
  render: (props) => <TopbarAnnouncement {...(props as TopbarAnnouncementProps)} />,
};

export default TopbarAnnouncement;