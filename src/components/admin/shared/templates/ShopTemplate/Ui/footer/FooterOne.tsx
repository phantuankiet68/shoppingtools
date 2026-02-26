"use client";

import React, { useEffect, useRef, useState, FC } from "react";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/footer/FooterOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

type TickerMessage = {
  badge: string;
  text: string;
};

const TICKER_MESSAGES: TickerMessage[] = [
  {
    badge: "NEW",
    text: "Ra mắt series “Thư viện kỹ năng sống cho người bận rộn”",
  },
  {
    badge: "SALE",
    text: "Ưu đãi thành viên: Giảm 15% cho đơn từ 3 đầu sách kỹ năng",
  },
  {
    badge: "GIFT",
    text: "Tặng bookmark giới hạn khi đặt trước sách mới tuần này",
  },
];

/**
 * Tạm thời chưa expose props ra UI Builder.
 * Sau này nếu cần config messages / labels / social link...
 * bạn có thể mở rộng type này và dùng làm defaults ở REGITEM.
 */
export type FooterOneProps = Record<string, never>;

export const DEFAULT_FOOTER_ONE_PROPS: FooterOneProps = {};

const FooterOne: FC<FooterOneProps> = (_props) => {
  const [tickerIndex, setTickerIndex] = useState(0);
  const [tickerPhase, setTickerPhase] = useState<"active" | "leaving" | "entering">("active");
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [language, setLanguage] = useState<"vi" | "en">("vi");

  const tbRightRef = useRef<HTMLDivElement | null>(null);

  // Auto ticker change
  useEffect(() => {
    let timeoutId: number | undefined;

    const tick = () => {
      setTickerPhase("leaving");

      timeoutId = window.setTimeout(() => {
        setTickerIndex((prev) => (prev + 1) % TICKER_MESSAGES.length);
        setTickerPhase("entering");

        requestAnimationFrame(() => {
          setTickerPhase("active");
        });
      }, 250);
    };

    const intervalId = window.setInterval(tick, 4000);

    return () => {
      window.clearInterval(intervalId);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, []);

  // Click outside để đóng menu right (mobile)
  useEffect(() => {
    if (!isRightOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!tbRightRef.current) return;
      if (!tbRightRef.current.contains(event.target as Node)) {
        setIsRightOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isRightOpen]);

  const handleRegionClick = () => {
    if (typeof window !== "undefined") {
      window.alert("Sau này bạn có thể mở modal / dropdown chọn tỉnh thành ở đây.");
    }
  };

  const handleMoreClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsRightOpen((prev) => !prev);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as "vi" | "en";
    setLanguage(value);
    // TODO: map vào i18n thật (chuyển URL, lưu cookie, ...)
    console.log("Đã chọn ngôn ngữ:", value);
  };

  const ticker = TICKER_MESSAGES[tickerIndex];

  const tickerClassName = [
    styles.TbTickerText,
    tickerPhase === "active" && styles.IsActive,
    tickerPhase === "leaving" && styles.IsLeaving,
    tickerPhase === "entering" && styles.IsEntering,
  ]
    .filter(Boolean)
    .join(" ");

  const tbRightClassName = [styles.TbRight, isRightOpen && styles.IsOpen].filter(Boolean).join(" ");

  return (
    <div className={styles.Topbar}>
      <div className={styles.TopbarInner}>
        {/* Left */}
        <div className={styles.TbLeft}>
          <div className={styles.TbLeftIcon}>
            <i className="bi bi-chat-dots" aria-hidden="true" />
          </div>
          <button type="button" className={styles.TbRegionBtn} onClick={handleRegionClick}>
            <i className="bi bi-geo-alt" aria-hidden="true" />
            <span className={styles.RegionText}>KV: Hồ Chí Minh</span>
            <i className="bi bi-chevron-down" aria-hidden="true" />
          </button>
        </div>

        {/* Center ticker */}
        <div className={styles.TbCenter}>
          <div className={styles.TbTicker}>
            <div className={tickerClassName}>
              <span className={styles.Badge}>{ticker.badge}</span>
              <span>{ticker.text}</span>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className={tbRightClassName} ref={tbRightRef}>
          <div className={styles.TbRightDetails}>
            <div className={styles.TbLinks}>
              <button className={styles.TbLink} type="button">
                <i className="bi bi-life-preserver" aria-hidden="true" />
                <span>Trung tâm trợ giúp</span>
              </button>
              <button className={styles.TbLink} type="button">
                <i className="bi bi-truck" aria-hidden="true" />
                <span>Theo dõi đơn</span>
              </button>
              <button className={styles.TbLink} type="button">
                <i className="bi bi-person-circle" aria-hidden="true" />
                <span>Đăng nhập / Đăng ký</span>
              </button>
            </div>

            <div className={styles.TbDivider} />

            {/* Language select */}
            <div className={styles.TbLangSelectWrap}>
              <select
                id="langSelect"
                className={styles.TbLangSelect}
                value={language}
                onChange={handleLanguageChange}
                aria-label="Chọn ngôn ngữ"
              >
                <option value="vi">Tiếng Việt</option>
                <option value="en">English</option>
              </select>
            </div>

            {/* Social */}
            <div className={styles.TbSocial}>
              <a href="#" aria-label="Facebook">
                <i className="bi bi-facebook" aria-hidden="true" />
              </a>
              <a href="#" aria-label="TikTok">
                <i className="bi bi-tiktok" aria-hidden="true" />
              </a>
              <a href="#" aria-label="YouTube">
                <i className="bi bi-youtube" aria-hidden="true" />
              </a>
            </div>
          </div>

          {/* Nút more (mobile) */}
          <button className={styles.TbMoreBtn} type="button" onClick={handleMoreClick} aria-label="Mở menu topbar">
            <i className="bi bi-three-dots" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * RegItem để đăng ký vào UI Builder
 */
export const FOOTER_ONE_REGITEM: RegItem = {
  kind: "FooterOne",
  label: "Footer One",
  defaults: DEFAULT_FOOTER_ONE_PROPS,
  inspector: [],
  render: (p) => <FooterOne {...(p as FooterOneProps)} />,
};

export default FooterOne;
