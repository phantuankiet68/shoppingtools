// src/components/templates/AuroraTopbarGreen.tsx
import React, { useEffect, useRef, useState } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/topbar/AuroraTopbarGreen.module.css";

export interface AuroraTopbarGreenTickerItem {
  text: string;
  badge?: string;
}

export interface AuroraTopbarGreenLinkItem {
  label: string;
  href?: string;
  iconClass?: string;
}

export interface AuroraTopbarGreenProps {
  logoIconClass?: string;
  brandTitle?: string;
  brandSubtitle?: string;

  showRegionButton?: boolean;
  regionLabel?: string;
  regionIconClass?: string;
  regionChevronIconClass?: string;

  showTicker?: boolean;
  tickerLabel?: string;
  tickerItems?: AuroraTopbarGreenTickerItem[];

  backgroundColor?: string;

  showStatus?: boolean;
  statusText?: string;
  statusDotColor?: string;

  links?: AuroraTopbarGreenLinkItem[];

  preview?: boolean;
}

// ===== DEFAULT DATA =====

export const DEFAULT_AURORA_TOPBAR_GREEN_TICKERS: AuroraTopbarGreenTickerItem[] = [
  { text: "Ưu đãi xanh – giao nhanh trong ngày.", badge: "Hot" },
  { text: "Gói thành viên Eco: tích điểm xanh mỗi đơn hàng.", badge: "Eco" },
  { text: "Miễn phí đổi trả trong 7 ngày.", badge: "Support" },
];

export const DEFAULT_AURORA_TOPBAR_GREEN_LINKS: AuroraTopbarGreenLinkItem[] = [
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

// Optional local RegItem type để tránh lỗi type khi không import được từ nơi khác
export interface RegItem {
  kind: string;
  label: string;
  defaults: any;
  inspector: any[];
  render: (props: any) => React.ReactElement;
}

export const AuroraTopbarGreen: React.FC<AuroraTopbarGreenProps> = ({
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
  const links = linksProp ?? DEFAULT_AURORA_TOPBAR_GREEN_LINKS;
  const tickerItems = tickerItemsProp ?? DEFAULT_AURORA_TOPBAR_GREEN_TICKERS;

  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPhase, setTickerPhase] = useState<"active" | "leaving" | "entering">("active");
  const tbRightRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // Auto rotate ticker
  useEffect(() => {
    if (!showTicker || tickerItems.length <= 1) {
      return;
    }

    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const startCycle = () => {
      setTickerPhase("leaving");

      timeoutId = setTimeout(() => {
        setTickerIndex((prev) => (prev + 1) % tickerItems.length);
        setTickerPhase("entering");

        requestAnimationFrame(() => {
          // Force reflow để CSS transition chạy lại
          void document.body.offsetWidth;
          setTickerPhase("active");
        });
      }, 250);
    };

    const intervalId = setInterval(startCycle, 4200);

    return () => {
      clearInterval(intervalId);
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showTicker, tickerItems.length]);

  // Click bên ngoài để đóng menu mobile
  useEffect(() => {
    if (!menuOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (!tbRightRef.current) return;
      if (!tbRightRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, [menuOpen]);

  const handleLinkClick: React.MouseEventHandler<HTMLAnchorElement> = (e) => {
    if (preview) {
      e.preventDefault();
    }
  };

  const rootStyle: React.CSSProperties = {
    // Cho phép override background qua CSS custom prop
    // nhưng vẫn set backgroundColor để tương thích
    backgroundColor,
    // custom property để CSS có thể dùng nếu cần
    ["--aurora-topbar-background" as any]: backgroundColor,
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

  const tbRightClassName = [styles.tbRight, menuOpen ? styles.tbRightOpen : ""].filter(Boolean).join(" ");

  return (
    <div className={styles.topbar} style={rootStyle}>
      <div className={styles.topbarInner}>
        {/* LEFT */}
        <div className={styles.tbLeft}>
          <div className={styles.logoCircle}>{logoIconClass ? <i className={logoIconClass} /> : null}</div>

          <div>
            <div className={styles.brandTitle}>{brandTitle}</div>
            <div className={styles.brandSub}>{brandSubtitle}</div>
          </div>

          {showRegionButton && (
            <button className={styles.regionBtn} type="button">
              {regionIconClass && <i className={regionIconClass} />}
              <span>{regionLabel}</span>
              {regionChevronIconClass && <i className={regionChevronIconClass} />}
            </button>
          )}
        </div>

        {/* CENTER */}
        <div className={styles.tbCenter}>
          {showTicker && tickerItem && (
            <div className={styles.ticker}>
              <div className={styles.tickerBox}>
                <span className={styles.tickerLabel}>{tickerLabel}</span>
                <div className={tickerTextClassName}>
                  <span>{tickerItem.text}</span>
                  {tickerItem.badge && <span className={styles.tag}>{tickerItem.badge}</span>}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT */}
        <div className={tbRightClassName} ref={tbRightRef}>
          <div className={styles.tbLinks}>
            {links.map((link, index) => (
              <a key={index} className={styles.tbLink} href={link.href || "#"} onClick={handleLinkClick}>
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

          <button className={styles.moreBtn} id="auroraTopbarGreenMoreBtn" type="button" onClick={() => setMenuOpen((open) => !open)}>
            <i className="bi bi-list" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ===== RegItem =====

export const AURORA_TOPBAR_GREEN_REGITEM: RegItem = {
  kind: "TopbarGreen",
  label: "Aurora Green",
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
    tickerItems: DEFAULT_AURORA_TOPBAR_GREEN_TICKERS,

    backgroundColor: "#a7f3d0",

    showStatus: true,
    statusText: "Online",
    statusDotColor: "#16a34a",

    links: DEFAULT_AURORA_TOPBAR_GREEN_LINKS,

    preview: false,
  } satisfies AuroraTopbarGreenProps,
  inspector: [],
  render: (p) => <AuroraTopbarGreen {...(p as AuroraTopbarGreenProps)} />,
};
