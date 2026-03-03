// components/templates/ShopTemplate/Ui/hero/HeroPro.tsx
"use client";

import React, { useEffect, useState, MouseEvent } from "react";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/hero/HeroPro.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/** ===== Types ===== */
export interface HeroProProps {
  // Badge + title
  badgeText?: string;
  titleLine1?: string;
  titleHighlight?: string;
  subtitle?: string;

  // CTA
  primaryLabel?: string;
  secondaryLabel?: string;

  // Stats
  statProductCountValue?: string;
  statProductCountLabel?: string;
  statRatingValue?: string;
  statRatingLabel?: string;
  statShippingValue?: string;
  statShippingLabel?: string;

  // Payments
  paymentLabel?: string;
  paymentMethods?: string[];

  // Flash section (right panel)
  flashLabel?: string;
  flashTitle?: string;

  // Main deal
  mainDealLabel?: string;
  mainDealDiscount?: string;
  mainDealTitle?: string;
  mainDealDescription?: string;
  mainDealRating?: string;
  mainDealPriceNow?: string;
  mainDealPriceOld?: string;
  mainDealSizes?: string[];
  mainDealActiveSize?: string;
  mainDealShippingText?: string;
  mainDealSoldPercent?: number;

  // Mini deals
  miniDeal1Title?: string;
  miniDeal1Description?: string;
  miniDeal1PriceNow?: string;
  miniDeal1PriceOld?: string;

  miniDeal2Title?: string;
  miniDeal2Description?: string;
  miniDeal2PriceNow?: string;
  miniDeal2PriceOld?: string;

  // Footer
  flashFooterText?: string;
  flashFooterLinkLabel?: string;

  // Countdown + scroll
  countdownSeconds?: number;
  flashSectionId?: string; // id của section flash sale để scroll đến

  // CTA callbacks
  onPrimaryClick?: () => void;
  onFlashClick?: () => void;
  onLookbookClick?: () => void;

  // Preview mode (chặn action)
  preview?: boolean;
}

/** ===== DEFAULTS ===== */
const DEFAULT_HERO_PRO_PROPS: HeroProProps = {
  badgeText: "Ưu đãi outfit hôm nay • Aurora Wear",
  titleLine1: "Outfit đẹp, nhẹ nhàng,",
  titleHighlight: "deal cam siêu “lời”",
  subtitle:
    "Chọn nhanh set phù hợp phong cách của bạn tại Aurora Wear Mall. Hàng chính hãng, đổi size dễ, giao nhanh nội thành.",

  primaryLabel: "Bắt đầu mua sắm",
  secondaryLabel: "Xem Flash Sale",

  statProductCountValue: "+12k",
  statProductCountLabel: "sản phẩm",
  statRatingValue: "4.9/5",
  statRatingLabel: "đánh giá",
  statShippingValue: "2h",
  statShippingLabel: "giao nhanh",

  paymentLabel: "Thanh toán an toàn với:",
  paymentMethods: ["VISA", "MC", "ATM", "MOMO", "ZALO"],

  flashLabel: "Flash outfit hôm nay",
  flashTitle: "Outfit “ngon” nhất trong khung giờ vàng",

  mainDealLabel: "Deal chính trong giờ vàng",
  mainDealDiscount: "-37%",
  mainDealTitle: "Set váy + blazer công sở chuẩn trend 2025",
  mainDealDescription: "Chất vải ít nhăn, form tôn dáng, phù hợp đi làm, họp hoặc gặp đối tác.",
  mainDealRating: "4.9",
  mainDealPriceNow: "495.000₫",
  mainDealPriceOld: "789.000₫",
  mainDealSizes: ["S", "M", "L", "XL"],
  mainDealActiveSize: "M",
  mainDealShippingText: "Freeship đơn từ 499k",
  mainDealSoldPercent: 78,

  miniDeal1Title: "Combo áo thun + quần jean",
  miniDeal1Description: "Streetwear unisex cho cuối tuần",
  miniDeal1PriceNow: "349.000₫",
  miniDeal1PriceOld: "459.000₫",

  miniDeal2Title: "Outfit dạo phố nữ tính",
  miniDeal2Description: "Chân váy xoè + cardigan nhẹ nhàng",
  miniDeal2PriceNow: "425.000₫",
  miniDeal2PriceOld: "590.000₫",

  flashFooterText: "Đang mở Flash Sale outfit cho 3 sản phẩm nổi bật.",
  flashFooterLinkLabel: "Xem tất cả Flash Sale",

  countdownSeconds: 2 * 3600 + 15 * 60 + 36, // 02:15:36
  flashSectionId: "flash-sale-section",

  preview: false,
};

/** ===== Helper: format hh:mm:ss ===== */
function formatTime(totalSeconds: number): string {
  const sec = Math.max(0, totalSeconds | 0);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/** ===================== UI COMPONENT ===================== */
export const HeroPro: React.FC<HeroProProps> = (props) => {
  const {
    badgeText = DEFAULT_HERO_PRO_PROPS.badgeText,
    titleLine1 = DEFAULT_HERO_PRO_PROPS.titleLine1,
    titleHighlight = DEFAULT_HERO_PRO_PROPS.titleHighlight,
    subtitle = DEFAULT_HERO_PRO_PROPS.subtitle,

    primaryLabel = DEFAULT_HERO_PRO_PROPS.primaryLabel,
    secondaryLabel = DEFAULT_HERO_PRO_PROPS.secondaryLabel,

    statProductCountValue = DEFAULT_HERO_PRO_PROPS.statProductCountValue,
    statProductCountLabel = DEFAULT_HERO_PRO_PROPS.statProductCountLabel,
    statRatingValue = DEFAULT_HERO_PRO_PROPS.statRatingValue,
    statRatingLabel = DEFAULT_HERO_PRO_PROPS.statRatingLabel,
    statShippingValue = DEFAULT_HERO_PRO_PROPS.statShippingValue,
    statShippingLabel = DEFAULT_HERO_PRO_PROPS.statShippingLabel,

    paymentLabel = DEFAULT_HERO_PRO_PROPS.paymentLabel,
    paymentMethods = DEFAULT_HERO_PRO_PROPS.paymentMethods,

    flashLabel = DEFAULT_HERO_PRO_PROPS.flashLabel,
    flashTitle = DEFAULT_HERO_PRO_PROPS.flashTitle,

    mainDealLabel = DEFAULT_HERO_PRO_PROPS.mainDealLabel,
    mainDealDiscount = DEFAULT_HERO_PRO_PROPS.mainDealDiscount,
    mainDealTitle = DEFAULT_HERO_PRO_PROPS.mainDealTitle,
    mainDealDescription = DEFAULT_HERO_PRO_PROPS.mainDealDescription,
    mainDealRating = DEFAULT_HERO_PRO_PROPS.mainDealRating,
    mainDealPriceNow = DEFAULT_HERO_PRO_PROPS.mainDealPriceNow,
    mainDealPriceOld = DEFAULT_HERO_PRO_PROPS.mainDealPriceOld,
    mainDealSizes = DEFAULT_HERO_PRO_PROPS.mainDealSizes,
    mainDealActiveSize = DEFAULT_HERO_PRO_PROPS.mainDealActiveSize,
    mainDealShippingText = DEFAULT_HERO_PRO_PROPS.mainDealShippingText,
    mainDealSoldPercent = DEFAULT_HERO_PRO_PROPS.mainDealSoldPercent,

    miniDeal1Title = DEFAULT_HERO_PRO_PROPS.miniDeal1Title,
    miniDeal1Description = DEFAULT_HERO_PRO_PROPS.miniDeal1Description,
    miniDeal1PriceNow = DEFAULT_HERO_PRO_PROPS.miniDeal1PriceNow,
    miniDeal1PriceOld = DEFAULT_HERO_PRO_PROPS.miniDeal1PriceOld,

    miniDeal2Title = DEFAULT_HERO_PRO_PROPS.miniDeal2Title,
    miniDeal2Description = DEFAULT_HERO_PRO_PROPS.miniDeal2Description,
    miniDeal2PriceNow = DEFAULT_HERO_PRO_PROPS.miniDeal2PriceNow,
    miniDeal2PriceOld = DEFAULT_HERO_PRO_PROPS.miniDeal2PriceOld,

    flashFooterText = DEFAULT_HERO_PRO_PROPS.flashFooterText,
    flashFooterLinkLabel = DEFAULT_HERO_PRO_PROPS.flashFooterLinkLabel,

    countdownSeconds = DEFAULT_HERO_PRO_PROPS.countdownSeconds,
    flashSectionId = DEFAULT_HERO_PRO_PROPS.flashSectionId,

    onPrimaryClick,
    onFlashClick,
    onLookbookClick,

    preview = DEFAULT_HERO_PRO_PROPS.preview,
  } = props;

  /** ===== Countdown state ===== */
  const [timeLeft, setTimeLeft] = useState<number>(countdownSeconds ?? 0);

  useEffect(() => {
    setTimeLeft(countdownSeconds ?? 0);
  }, [countdownSeconds]);

  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  /** ===== Handlers ===== */
  const handlePrimaryClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (preview) {
      e.preventDefault();
      return;
    }
    onPrimaryClick?.();
  };

  const handleFlashClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (preview) {
      e.preventDefault();
      return;
    }
    if (onFlashClick) {
      onFlashClick();
      return;
    }
    if (flashSectionId && typeof document !== "undefined") {
      const el = document.getElementById(flashSectionId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleLookbookClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (preview) {
      e.preventDefault();
      return;
    }
    onLookbookClick?.();
  };

  const soldPercentClamped = Math.max(0, Math.min(100, mainDealSoldPercent ?? 0));

  /** =================== RENDER =================== */
  return (
    <header className={styles.heroHeader}>
      <div className={styles.heroShell}>
        <section className={styles.heroHero}>
          {/* LEFT: text + CTA */}
          <div className={styles.heroMain}>
            {badgeText && (
              <span className={styles.heroBadge}>
                <i className="bi bi-fire" />
                {badgeText}
              </span>
            )}

            <h1 className={styles.heroTitle}>
              {titleLine1}
              <br />
              <span>{titleHighlight}</span>
            </h1>

            {subtitle && (
              <p className={styles.heroSub}>
                {/* Giữ nguyên về mặt text, cho phép override subtitle */}
                {subtitle}
              </p>
            )}

            <div className={styles.heroActions}>
              <button className={styles.btnPrimary} type="button" onClick={handlePrimaryClick}>
                <i className="bi bi-bag-heart" />
                <span>{primaryLabel}</span>
              </button>
              <button className={styles.btnGhost} type="button" onClick={handleFlashClick}>
                <i className="bi bi-lightning-charge" />
                <span>{secondaryLabel}</span>
              </button>
            </div>

            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{statProductCountValue}</span>
                <span className={styles.statLabel}>{statProductCountLabel}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{statRatingValue}</span>
                <span className={styles.statLabel}>{statRatingLabel}</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statNumber}>{statShippingValue}</span>
                <span className={styles.statLabel}>{statShippingLabel}</span>
              </div>
            </div>

            {/* payment methods */}
            <div className={styles.heroPayments}>
              <div className={styles.heroPaymentsLabel}>
                <i className="bi bi-shield-check" />
                <span>{paymentLabel}</span>
              </div>
              <div className={styles.paymentLogos}>
                {paymentMethods?.map((label) => (
                  <div key={label} className={styles.paymentLogo}>
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: flash outfit board */}
          <div className={styles.heroShowcase}>
            <div className={styles.heroShowcaseTop}>
              <div className={styles.heroShowcaseTitle}>
                <div className={styles.heroShowcaseLabel}>
                  <span className={styles.heroShowcaseLabelDot} />
                  <span>{flashLabel}</span>
                </div>
                <h3>{flashTitle}</h3>
              </div>
              <button className={styles.heroShowcaseLink} type="button" onClick={handleLookbookClick}>
                <span>Nhìn nhanh lookbook</span>
                <i className="bi bi-arrow-right-short" />
              </button>
            </div>

            <div className={styles.heroFloatTag}>
              <i className="bi bi-clock-history" />
              <span>Chỉ còn</span>
              <span className={styles.heroCountdown}>{formatTime(timeLeft)}</span>
            </div>

            {/* MAIN BIG DEAL */}
            <article className={styles.heroMainCard}>
              <div className={styles.heroMainCardLabel}>{mainDealLabel}</div>
              <div className={styles.heroMainCardBody}>
                <div className={styles.heroMainThumbWrap}>
                  <div className={styles.heroMainThumbBg} />
                  <div className={styles.heroMainThumb}>
                    <div className={styles.heroMainThumbPill}>
                      <i className="bi bi-percent" />
                      <span>{mainDealDiscount}</span>
                    </div>
                  </div>
                </div>
                <div className={styles.heroMainInfo}>
                  <div className={styles.heroMainInfoTop}>
                    <h4 className={styles.heroMainTitle}>{mainDealTitle}</h4>
                    {mainDealRating && (
                      <span className={styles.heroMainRating}>
                        <i className="bi bi-star-fill" />
                        {mainDealRating}
                      </span>
                    )}
                  </div>
                  <p className={styles.heroMainMeta}>{mainDealDescription}</p>
                  <div className={styles.heroMainPriceRow}>
                    <span className={styles.heroMainPriceNow}>{mainDealPriceNow}</span>
                    <span className={styles.heroMainPriceOld}>{mainDealPriceOld}</span>
                  </div>
                  <div className={styles.heroMainExtra}>
                    <div className={styles.heroMainSizes}>
                      {mainDealSizes?.map((size) => (
                        <span
                          key={size}
                          className={
                            size === mainDealActiveSize
                              ? `${styles.heroMainSize} ${styles.heroMainSizeActive}`
                              : styles.heroMainSize
                          }
                        >
                          {size}
                        </span>
                      ))}
                    </div>
                    <div className={styles.heroMainShipping}>
                      <i className="bi bi-truck" />
                      <span>{mainDealShippingText}</span>
                    </div>
                  </div>
                  <div className={styles.heroMainProgress}>
                    <div className={styles.heroMainProgressBar}>
                      <span className={styles.heroMainProgressFill} style={{ width: `${soldPercentClamped}%` }} />
                    </div>
                    <span className={styles.heroMainProgressText}>Đã bán {soldPercentClamped}%</span>
                  </div>
                </div>
              </div>
            </article>

            {/* MINI DEALS */}
            <div className={styles.heroMiniList}>
              <article className={styles.heroMiniCard}>
                <div className={`${styles.heroMiniThumb} ${styles.heroMiniThumbBlue}`} aria-hidden="true" />
                <div className={styles.heroMiniInfo}>
                  <h4 className={styles.heroMiniTitle}>{miniDeal1Title}</h4>
                  <p className={styles.heroMiniMeta}>{miniDeal1Description}</p>
                  <div className={styles.heroMiniPriceRow}>
                    <span className={styles.heroMiniPriceNow}>{miniDeal1PriceNow}</span>
                    <span className={styles.heroMiniPriceOld}>{miniDeal1PriceOld}</span>
                  </div>
                </div>
              </article>

              <article className={styles.heroMiniCard}>
                <div className={`${styles.heroMiniThumb} ${styles.heroMiniThumbPink}`} aria-hidden="true" />
                <div className={styles.heroMiniInfo}>
                  <h4 className={styles.heroMiniTitle}>{miniDeal2Title}</h4>
                  <p className={styles.heroMiniMeta}>{miniDeal2Description}</p>
                  <div className={styles.heroMiniPriceRow}>
                    <span className={styles.heroMiniPriceNow}>{miniDeal2PriceNow}</span>
                    <span className={styles.heroMiniPriceOld}>{miniDeal2PriceOld}</span>
                  </div>
                </div>
              </article>
            </div>

            <div className={styles.heroShowcaseFooter}>
              <span>{flashFooterText}</span>
              <a
                href={flashSectionId ? `#${flashSectionId}` : "#"}
                onClick={preview ? (e) => e.preventDefault() : undefined}
              >
                {flashFooterLinkLabel}
                <i className="bi bi-arrow-right-short" />
              </a>
            </div>
          </div>
        </section>
      </div>
    </header>
  );
};

/** ===== RegItem cho UI Builder ===== */
export const HERO_PRO_REGITEM: RegItem = {
  kind: "HeroProKind",
  label: "Hero Pro",
  defaults: DEFAULT_HERO_PRO_PROPS,
  inspector: [],
  render: (p) => <HeroPro {...(p as HeroProProps)} />,
};

export default HeroPro;
