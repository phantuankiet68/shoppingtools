import React from "react";
import type { CSSProperties } from "react";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/topbar/TopbarGreenYellowGradient2025.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export interface TopbarGreenYellowGradient2025TickerItem {
  text: string;
  badge?: string;
}

export interface TopbarGreenYellowGradient2025LinkItem {
  label: string;
  href?: string;
  iconClass?: string;
}

export interface TopbarGreenYellowGradient2025Props {
  logoIconClass?: string;
  brandTitle?: string;
  brandSubtitle?: string;

  showRegionButton?: boolean;
  regionLabel?: string;
  regionIconClass?: string;
  regionChevronIconClass?: string;

  showTicker?: boolean;
  tickerLabel?: string;
  tickerItems?: TopbarGreenYellowGradient2025TickerItem[];

  backgroundColor?: string;

  showStatus?: boolean;
  statusText?: string;
  statusDotColor?: string;

  links?: TopbarGreenYellowGradient2025LinkItem[];

  preview?: boolean;
}

/* =======================
 * DEFAULT DATA
 * ======================= */

export const DEFAULT_TGYG2025_TICKERS: TopbarGreenYellowGradient2025TickerItem[] = [
  { text: "Ưu đãi mùa xanh – giao nhanh trong ngày.", badge: "Hot" },
  { text: "Mua 2 tặng 1 cho sản phẩm organic.", badge: "Eco" },
  { text: "Miễn phí đổi trả 7 ngày.", badge: "Free" },
];

export const DEFAULT_TGYG2025_LINKS: TopbarGreenYellowGradient2025LinkItem[] = [
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

/* =======================
 * COMPONENT
 * ======================= */

export const TopbarGreenYellowGradient2025: React.FC<TopbarGreenYellowGradient2025Props> = ({
  logoIconClass = "bi bi-sun-fill",
  brandTitle = "Aurora Green",
  brandSubtitle = "Topbar 2025 – Gradient xanh lá → vàng",

  showRegionButton = true,
  regionLabel = "KV: Hồ Chí Minh",
  regionIconClass = "bi bi-geo-alt",
  regionChevronIconClass = "bi bi-chevron-down",

  showTicker = true,
  tickerLabel = "Tin mới",
  tickerItems,

  backgroundColor = "#a7f3d0",

  showStatus = true,
  statusText = "Online",
  statusDotColor = "#16a34a",

  links,

  preview = false,
}) => {
  const [activeTickerIndex, setActiveTickerIndex] = React.useState(0);
  const [tickerPhase, setTickerPhase] = React.useState<"active" | "leaving" | "entering">("active");
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const rightRef = React.useRef<HTMLDivElement | null>(null);

  const tickerList = tickerItems ?? DEFAULT_TGYG2025_TICKERS;
  const linkList = links ?? DEFAULT_TGYG2025_LINKS;

  // Override màu g1 trong gradient
  const topbarStyle: CSSProperties = {};
  if (backgroundColor) {
    (topbarStyle as any)["--g1"] = backgroundColor;
  }

  // Auto rotate ticker
  React.useEffect(() => {
    if (!showTicker || tickerList.length <= 1) return;

    const interval = window.setInterval(() => {
      setTickerPhase("leaving");

      window.setTimeout(() => {
        setActiveTickerIndex((prev) => (prev + 1) % tickerList.length);
        setTickerPhase("entering");

        window.requestAnimationFrame(() => {
          // trigger lại transition
          void document.body.offsetWidth;
          setTickerPhase("active");
        });
      }, 250);
    }, 4200);

    return () => {
      window.clearInterval(interval);
    };
  }, [showTicker, tickerList.length]);

  // Đóng menu mobile khi click ngoài
  React.useEffect(() => {
    if (!isMenuOpen) return;

    const handleClick = (e: MouseEvent) => {
      if (!rightRef.current) return;
      if (!rightRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClick);
    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, [isMenuOpen]);

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (preview) {
      e.preventDefault();
    }
  };

  const currentTicker = tickerList[activeTickerIndex];

  const tickerClassName = [
    styles.tickerText,
    tickerPhase === "active" ? styles.isActive : tickerPhase === "leaving" ? styles.isLeaving : styles.isEntering,
  ]
    .filter(Boolean)
    .join(" ");

  const tbRightClassName = [styles.tbRight, isMenuOpen ? styles.tbRightOpen : ""].filter(Boolean).join(" ");

  return (
    <div className={styles.topbar} style={topbarStyle}>
      <div className={styles.topbarInner}>
        {/* LEFT */}
        <div className={styles.tbLeft}>
          <div className={styles.logoCircle}>{logoIconClass ? <i className={logoIconClass} /> : null}</div>

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
        {showTicker && tickerList.length > 0 && (
          <div className={styles.tbCenter}>
            <div className={styles.ticker}>
              <div className={styles.tickerBox}>
                {tickerLabel && <span className={styles.tickerLabel}>{tickerLabel}</span>}

                <div className={tickerClassName}>
                  <span>{currentTicker.text}</span>
                  {currentTicker.badge && <span className={styles.tag}>{currentTicker.badge}</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RIGHT */}
        <div className={tbRightClassName} ref={rightRef}>
          <div className={styles.tbLinks}>
            {linkList.map((link, index) => (
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

          <button className={styles.moreBtn} type="button" onClick={() => setIsMenuOpen((prev) => !prev)}>
            <i className="bi bi-list" />
          </button>
        </div>
      </div>
    </div>
  );
};

/* =======================
 * REGITEM
 * ======================= */

export const TOPBAR_GREEN_YELLOW_GRADIENT_2025_REGITEM: RegItem = {
  kind: "TopbarYellow",
  label: "Topbar Yellow",
  defaults: {
    logoIconClass: "bi bi-sun-fill",
    brandTitle: "Aurora Green",
    brandSubtitle: "Topbar 2025 – Gradient xanh lá → vàng",

    showRegionButton: true,
    regionLabel: "KV: Hồ Chí Minh",
    regionIconClass: "bi bi-geo-alt",
    regionChevronIconClass: "bi bi-chevron-down",

    showTicker: true,
    tickerLabel: "Tin mới",
    tickerItems: DEFAULT_TGYG2025_TICKERS,

    backgroundColor: "#a7f3d0",

    showStatus: true,
    statusText: "Online",
    statusDotColor: "#16a34a",

    links: DEFAULT_TGYG2025_LINKS,

    preview: false,
  } satisfies TopbarGreenYellowGradient2025Props,
  inspector: [],
  render: (p) => <TopbarGreenYellowGradient2025 {...(p as TopbarGreenYellowGradient2025Props)} />,
};
