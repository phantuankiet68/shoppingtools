"use client";

import React, { useEffect, useState, useRef } from "react";
import type { RegItem } from "@/lib/ui-builder/types";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/topbar/TopbarOrange2025.module.css";

export interface TopbarOrangeLink {
  label: string;
  href: string;
  icon?: string;
}

export interface TopbarOrangeTickerItem {
  text: string;
  tag?: string;
}

export interface TopbarOrange2025Props {
  brandTitle?: string;
  brandSubtitle?: string;
  regionPrefix?: string;
  regionValue?: string;
  newsLabel?: string;
  tickerItems?: TopbarOrangeTickerItem[];
  links?: TopbarOrangeLink[];
  showStatus?: boolean;
  statusText?: string;
  backgroundColor?: string;
  preview?: boolean;
}

export const TOPBAR_ORANGE_DEFAULT_TICKERS: TopbarOrangeTickerItem[] = [
  { text: "Ưu đãi tháng này giảm đến 50%.", tag: "Hot" },
  { text: "Hỗ trợ khách hàng 24/7 – phản hồi nhanh.", tag: "Support" },
  { text: "Thêm nhiều sản phẩm mới vừa cập nhật.", tag: "New" },
];

export const TOPBAR_ORANGE_DEFAULT_LINKS: TopbarOrangeLink[] = [
  { label: "Hỗ trợ", href: "#", icon: "bi-life-preserver" },
  { label: "Theo dõi đơn", href: "#", icon: "bi-truck" },
  { label: "Tài khoản", href: "#", icon: "bi-person-circle" },
];

export const TopbarOrange2025: React.FC<TopbarOrange2025Props> = ({
  brandTitle = "Aurora Orange",
  brandSubtitle = "Topbar 2025 – màu cam nổi bật",
  regionPrefix = "KV:",
  regionValue = "Hồ Chí Minh",
  newsLabel = "News",
  tickerItems,
  links,
  showStatus = true,
  statusText = "Online",
  backgroundColor = "#f97316",
  preview = false,
}) => {
  const tickers = tickerItems ?? TOPBAR_ORANGE_DEFAULT_TICKERS;
  const linkList = links ?? TOPBAR_ORANGE_DEFAULT_LINKS;

  const [tickerIndex, setTickerIndex] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const rightRef = useRef<HTMLDivElement | null>(null);

  // ticker auto-rotate
  useEffect(() => {
    if (!tickers.length) return;
    const id = setInterval(() => {
      setTickerIndex((i) => (i + 1) % tickers.length);
    }, 4200);
    return () => clearInterval(id);
  }, [tickers]);

  // click ngoài để đóng menu mobile
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!rightRef.current) return;
      if (!rightRef.current.contains(e.target as Node)) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  const current = tickers[tickerIndex];

  const tbRightClassName = [styles.tbRight, isMobileOpen && styles.tbRightOpen].filter(Boolean).join(" ");

  return (
    <div className={styles.topbar} style={{ backgroundColor }}>
      <div className={styles.topbarInner}>
        {/* LEFT */}
        <div className={styles.tbLeft}>
          <div className={styles.logoCircle}>
            <i className="bi bi-lightning-fill" />
          </div>

          <div>
            <div className={styles.brandTitle}>{brandTitle}</div>
            <div className={styles.brandSub}>{brandSubtitle}</div>
          </div>

          <button type="button" className={styles.regionBtn}>
            <i className="bi bi-geo-alt" />
            {regionPrefix} {regionValue}
            <i className="bi bi-chevron-down" />
          </button>
        </div>

        {/* CENTER */}
        <div className={styles.tbCenter}>
          <div className={styles.ticker}>
            <div className={styles.tickerBox}>
              <span className={styles.tickerLabel}>{newsLabel}</span>
              {current && (
                <div className={styles.tickerText}>
                  <span>{current.text}</span>
                  {current.tag && <span className={styles.tag}>{current.tag}</span>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div ref={rightRef} className={tbRightClassName}>
          <div className={styles.tbLinks}>
            {linkList.map((l, i) => (
              <a
                key={i}
                className={styles.tbLink}
                href={preview ? "#" : l.href}
                onClick={(e) => preview && e.preventDefault()}
              >
                {l.icon && <i className={`bi ${l.icon}`} />}
                {l.label}
              </a>
            ))}
          </div>

          {showStatus && (
            <div className={styles.statusPill}>
              <span className={styles.dot} />
              {statusText}
            </div>
          )}

          {/* NÚT MORE MOBILE */}
          <button
            className={styles.moreBtn}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileOpen((v) => !v);
            }}
            aria-label="Mở menu"
          >
            <i className="bi bi-list" />
          </button>
        </div>
      </div>
    </div>
  );
};

export const TOPBAR_ORANGE_2025: RegItem = {
  kind: "TopbarOrange2025",
  label: "Topbar Orange",
  defaults: {
    brandTitle: "Aurora Orange",
    brandSubtitle: "Topbar 2025 – màu cam nổi bật",
    regionPrefix: "KV:",
    regionValue: "Hồ Chí Minh",
    newsLabel: "News",
    tickerItems: TOPBAR_ORANGE_DEFAULT_TICKERS,
    links: TOPBAR_ORANGE_DEFAULT_LINKS,
    showStatus: true,
    statusText: "Online",
    backgroundColor: "#f97316",
  } satisfies TopbarOrange2025Props,
  inspector: [], // dùng custom editor ở CUSTOM_EDITORS
  render: (p) => <TopbarOrange2025 {...(p as TopbarOrange2025Props)} />,
};
