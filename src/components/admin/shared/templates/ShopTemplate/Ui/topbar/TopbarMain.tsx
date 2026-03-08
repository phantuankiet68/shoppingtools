"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import styles from "@/styles/templates/ShopTemplate/topbar/TopbarMain.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

type SocialLink = {
  icon: "facebook" | "tiktok" | "youtube";
  href: string;
};

type Device = "desktop" | "tablet" | "mobile";

export type TopbarMainProps = {
  logoText?: string;
  phoneNumber?: string;
  email?: string;
  socialLinks?: SocialLink[];
  sticky?: boolean;
  preview?: boolean;
  message?: string;
  regionLabel?: string;
  backgroundColor?: string;
  _device?: Device; // NEW: chỉ dùng trong builder
};
const DEFAULT_TICKER_MESSAGES = [
  "Flash Sale 11.11 – Giảm đến 70% cho sách best-seller",
  "Tặng bookmark cho mọi đơn từ 3 cuốn trở lên",
  "Giao nhanh trong 2h tại Hà Nội & TP.HCM",
];

const DEFAULT_BADGES = ["HOT", "NEW", "FAST"];

export const TopbarMain: React.FC<TopbarMainProps> = ({
  logoText = "BookStore",
  phoneNumber = "1900 1234",
  email = "support@example.com",
  socialLinks = [
    { icon: "facebook", href: "#" },
    { icon: "tiktok", href: "#" },
    { icon: "youtube", href: "#" },
  ],
  sticky = false,
  preview = false,
  message = "Freeship toàn quốc cho đơn từ 299.000₫",
  regionLabel = "KV: Hồ Chí Minh",
  backgroundColor,
  _device, // NEW
}) => {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPhase, setTickerPhase] = useState<"active" | "leaving" | "entering">("active");
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // simple ticker animation
  useEffect(() => {
    if (!DEFAULT_TICKER_MESSAGES.length) return;

    const interval = setInterval(() => {
      setTickerPhase("leaving");

      setTimeout(() => {
        setTickerIndex((prev) => (prev + 1) % DEFAULT_TICKER_MESSAGES.length);
        setTickerPhase("entering");

        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setTickerPhase("active");
          });
        });
      }, 250);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const onRegionClick = () => {
    if (preview) return;
    alert("Sau này bạn có thể mở modal / dropdown chọn tỉnh thành ở đây.");
  };

  const onMoreClick = () => {
    setIsMobileOpen((v) => !v);
  };

  const tickerClassNames = [
    styles.tickerText,
    tickerPhase === "active" && styles.tickerActive,
    tickerPhase === "leaving" && styles.tickerLeaving,
    tickerPhase === "entering" && styles.tickerEntering,
  ]
    .filter(Boolean)
    .join(" ");

  const rightWrapperClassName = [styles.tbRight, isMobileOpen && styles.tbRightOpen].filter(Boolean).join(" ");

  const currentBadge = DEFAULT_BADGES[tickerIndex % DEFAULT_BADGES.length];
  const currentMessage = DEFAULT_TICKER_MESSAGES[tickerIndex];

  const wrapperStyle = backgroundColor ? { background: backgroundColor } : undefined;

  const deviceClass = _device === "tablet" ? styles.deviceTablet : _device === "mobile" ? styles.deviceMobile : "";

  const wrapperClassName = [styles.topbar, sticky && styles.sticky, deviceClass].filter(Boolean).join(" ");
  return (
    <div className={wrapperClassName} style={wrapperStyle}>
      <div className={styles.topbarInner}>
        {/* LEFT */}
        <div className={styles.tbLeft}>
          <div className={styles.tbLeftIcon}>
            {/* dùng Bootstrap Icons (có thể import ở _app hoặc layout) */}
            <i className="bi bi-truck" aria-hidden />
          </div>
          <div className={styles.tbMessage}>
            {message.includes(logoText) ? (
              message
            ) : (
              <>
                {message} <strong>{logoText}</strong>
              </>
            )}
          </div>
          <button type="button" className={styles.tbRegionBtn} onClick={onRegionClick}>
            <i className={`${styles.tbRegionBtnIcon} bi bi-geo-alt`} aria-hidden />
            <span className={styles.regionText}>{regionLabel}</span>
            <i className={`${styles.tbRegionBtnIcon} bi bi-chevron-down`} aria-hidden />
          </button>
        </div>

        {/* CENTER TICKER – ẩn trên tablet/mobile bằng CSS */}
        <div className={styles.tbCenter}>
          <div className={styles.tbTicker}>
            <div className={tickerClassNames}>
              <span className={styles.tickerBadge}>{currentBadge}</span>
              <span>{currentMessage}</span>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={rightWrapperClassName}>
          <div className={styles.tbRightDetails}>
            <div className={styles.tbLinks}>
              <button className={styles.tbLink} type="button">
                Trung tâm trợ giúp
              </button>
              <button className={styles.tbLink} type="button">
                Theo dõi đơn
              </button>
              <button className={styles.tbLink} type="button">
                Đăng nhập / Đăng ký
              </button>
            </div>

            <div className={styles.tbDivider} />

            <div className={styles.tbLinks}>
              <span className={styles.tbLink}>📞 {phoneNumber}</span>
              <Link href={`mailto:${email}`} className={styles.tbLink}>
                ✉️ {email}
              </Link>
            </div>

            <div className={styles.tbDivider} />

            <div className={styles.tbSocial}>
              {socialLinks.map((s) => {
                const iconClass =
                  s.icon === "facebook" ? "bi-facebook" : s.icon === "tiktok" ? "bi-tiktok" : "bi-youtube";

                return (
                  <a
                    key={s.icon}
                    href={s.href}
                    aria-label={s.icon}
                    className={styles.tbSocialIcon}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <i className={`bi ${iconClass}`} aria-hidden />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Nút More (chỉ hiện trên mobile) */}
          <button className={styles.tbMoreBtn} type="button" onClick={onMoreClick} aria-label="Xem thêm">
            <i className="bi bi-three-dots" aria-hidden />
          </button>
        </div>
      </div>
    </div>
  );
};

export const TOPBAR_PRO: RegItem = {
  kind: "TopbarPro",
  label: "Topbar (Pro)",
  defaults: {
    logoText: "BookStore",
    phoneNumber: "1900 1234",
    email: "support@example.com",
    socialLinks: [
      { icon: "facebook", href: "#" },
      { icon: "tiktok", href: "#" },
      { icon: "youtube", href: "#" },
    ],
    sticky: false,
    preview: false,
    message: "Freeship toàn quốc cho đơn từ 299.000₫",
    regionLabel: "KV: Hồ Chí Minh",
    backgroundColor: "#fff8ed",
  } satisfies TopbarMainProps,
  inspector: [],
  render: (p) => <TopbarMain {...(p as TopbarMainProps)} />,
};
