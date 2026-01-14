"use client";

import React, { useEffect, useRef, useState, MouseEvent as ReactMouseEvent } from "react";
import type { RegItem } from "@/lib/ui-builder/types";
import styles from "@/components/admin/templates/ShopTemplate/styles/topbar/AuroraTopbarPink.module.css";

export type AuroraTopbarTickerItem = {
  text: string;
  tag: string;
};

export type AuroraTopbarPinkProps = {
  brandTitle?: string;
  brandSubtitle?: string;

  regionPrefix?: string;
  regionLocation?: string;
  showRegionButton?: boolean;

  tickerLabel?: string;
  tickerItems?: AuroraTopbarTickerItem[];
  showTicker?: boolean;

  supportHref?: string;
  supportLabel?: string;

  trackHref?: string;
  trackLabel?: string;

  accountHref?: string;
  accountLabel?: string;

  statusText?: string;
  showStatus?: boolean;

  /** Để UI Builder biết đang preview, chặn <a> và interaction */
  isPreview?: boolean;

  /** Optional: custom handler nếu muốn mở popup chọn vùng */
  onRegionClick?: () => void;
};

const DEFAULT_TICKER_ITEMS: AuroraTopbarTickerItem[] = [
  { text: "Khuyến mãi 30% cho bộ sưu tập mới.", tag: "Hot" },
  { text: "Sản phẩm mới cập bến tuần này.", tag: "New" },
  { text: "Hỗ trợ khách hàng 24/7.", tag: "Support" },
];

const TICKER_INTERVAL = 4200;
const TICKER_LEAVE_MS = 250;

export const AuroraTopbarPink: React.FC<AuroraTopbarPinkProps> = ({
  brandTitle = "Aurora Pink",
  brandSubtitle = "Topbar 2025 – Hồng pastel nhẹ nhàng",

  regionPrefix = "KV:",
  regionLocation = "Hồ Chí Minh",
  showRegionButton = true,

  tickerLabel = "Tin mới",
  tickerItems,
  showTicker = true,

  supportHref = "#",
  supportLabel = "Hỗ trợ",

  trackHref = "#",
  trackLabel = "Theo dõi đơn",

  accountHref = "#",
  accountLabel = "Tài khoản",

  statusText = "Online",
  showStatus = true,

  isPreview = false,
  onRegionClick,
}) => {
  const items: AuroraTopbarTickerItem[] = tickerItems && tickerItems.length > 0 ? tickerItems : DEFAULT_TICKER_ITEMS;

  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPhase, setTickerPhase] = useState<"active" | "leaving" | "entering">("active");

  const [menuOpen, setMenuOpen] = useState(false);
  const rightRef = useRef<HTMLDivElement | null>(null);

  // Ticker animation giống bản gốc (leaving → enter → active)
  useEffect(() => {
    const length = items.length;

    if (length <= 1) {
      setTickerIndex(0);
      setTickerPhase("active");
      return;
    }

    setTickerIndex(0);
    setTickerPhase("active");

    let intervalId: number | undefined;
    let timeoutId: number | undefined;

    intervalId = window.setInterval(() => {
      setTickerPhase("leaving");

      timeoutId = window.setTimeout(() => {
        setTickerIndex((prev) => (prev + 1) % length);
        setTickerPhase("entering");

        window.requestAnimationFrame(() => {
          setTickerPhase("active");
        });
      }, TICKER_LEAVE_MS);
    }, TICKER_INTERVAL);

    return () => {
      if (intervalId) {
        window.clearInterval(intervalId);
      }
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [items.length]);

  // Click ra ngoài để đóng menu mobile
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!rightRef.current) return;
      if (!rightRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleMoreClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handleLinkClick = (e: ReactMouseEvent<HTMLAnchorElement>) => {
    if (isPreview) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const handleRegionClick = (e: ReactMouseEvent<HTMLButtonElement>) => {
    if (isPreview) {
      e.preventDefault();
      return;
    }

    if (onRegionClick) {
      onRegionClick();
      return;
    }

    // Hành vi demo giống bản HTML gốc
    window.alert("Sau này bạn có thể mở popup / dropdown chọn tỉnh thành ở đây.");
  };

  const currentItem = items[tickerIndex];

  const tickerClassName = [styles.tickerText, tickerPhase === "leaving" ? styles.isLeaving : "", tickerPhase === "entering" ? styles.isEntering : "", tickerPhase === "active" ? styles.isActive : ""]
    .filter(Boolean)
    .join(" ");

  const tbRightClassName = [styles.tbRight, menuOpen ? styles.tbRightOpen : ""].filter(Boolean).join(" ");

  return (
    <div className={styles.topbarRoot}>
      <div className={styles.topbarInner}>
        {/* LEFT */}
        <div className={styles.tbLeft}>
          <div className={styles.logoCircle}>
            <i className="bi bi-heart-fill" />
          </div>

          <div>
            <div className={styles.brandTitle}>{brandTitle}</div>
            {brandSubtitle && <div className={styles.brandSub}>{brandSubtitle}</div>}
          </div>

          {showRegionButton && (
            <button className={styles.regionBtn} type="button" onClick={handleRegionClick}>
              <i className="bi bi-geo-alt" />
              <span>
                {regionPrefix} {regionLocation}
              </span>
              <i className="bi bi-chevron-down" />
            </button>
          )}
        </div>

        {/* CENTER – Ticker */}
        {showTicker && (
          <div className={styles.tbCenter}>
            <div className={styles.ticker}>
              <div className={styles.tickerBox}>
                <span className={styles.tickerLabel}>{tickerLabel}</span>
                <div className={tickerClassName}>
                  <span>{currentItem.text}</span>
                  <span className={styles.tag}>{currentItem.tag}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT */}
        <div className={tbRightClassName} ref={rightRef}>
          <div className={styles.tbLinks}>
            <a className={styles.tbLink} href={supportHref} onClick={handleLinkClick}>
              <i className="bi bi-life-preserver" />
              <span> {supportLabel}</span>
            </a>

            <a className={styles.tbLink} href={trackHref} onClick={handleLinkClick}>
              <i className="bi bi-truck" />
              <span> {trackLabel}</span>
            </a>

            <a className={styles.tbLink} href={accountHref} onClick={handleLinkClick}>
              <i className="bi bi-person-circle" />
              <span> {accountLabel}</span>
            </a>
          </div>

          {showStatus && (
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

// RegItem giống cấu trúc TOPBAR_PRO
export const AURORA_TOPBAR_PINK: RegItem = {
  kind: "TopbarPink",
  label: "Topbar Pink",
  defaults: {
    brandTitle: "Aurora Pink",
    brandSubtitle: "Topbar 2025 – Hồng pastel nhẹ nhàng",

    regionPrefix: "KV:",
    regionLocation: "Hồ Chí Minh",
    showRegionButton: true,

    tickerLabel: "Tin mới",
    showTicker: true,
    tickerItems: [
      { text: "Khuyến mãi 30% cho bộ sưu tập mới.", tag: "Hot" },
      { text: "Sản phẩm mới cập bến tuần này.", tag: "New" },
      { text: "Hỗ trợ khách hàng 24/7.", tag: "Support" },
    ],

    supportHref: "#",
    supportLabel: "Hỗ trợ",

    trackHref: "#",
    trackLabel: "Theo dõi đơn",

    accountHref: "#",
    accountLabel: "Tài khoản",

    statusText: "Online",
    showStatus: true,

    isPreview: false,
  } satisfies AuroraTopbarPinkProps,
  inspector: [],
  render: (p) => <AuroraTopbarPink {...(p as AuroraTopbarPinkProps)} />,
};

export default AuroraTopbarPink;
