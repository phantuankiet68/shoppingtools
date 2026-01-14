"use client";

import React, { useEffect, useState, MouseEvent } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/hero/HeroOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

type LookKey = "office" | "street" | "party";

type HeroOneMetaItem = {
  iconText: string;
  label: string;
};

type HeroOnePaymentLogo = {
  label: string;
  variant?: "visa" | "mc" | "atm" | "momo" | "zalo" | "default";
};

export interface HeroOneProps {
  // Badge
  mainBadgeText?: string;
  subBadgeText?: string;

  // Title + mô tả
  headingPrefix?: string;
  headingHighlight?: string;
  headingSuffix?: string;
  description?: string;

  // CTA
  primaryCtaLabel?: string;
  secondaryCtaLabel?: string;

  // Meta stats
  metaItems?: HeroOneMetaItem[];

  // Payment logos
  paymentLogos?: HeroOnePaymentLogo[];

  // Quick categories
  quickCategories?: string[];

  // Countdown (text hiển thị)
  countdownText?: string;

  // Preview mode (chặn click/auto-rotate)
  preview?: boolean;
}

const DEFAULT_HERO_ONE_PROPS: HeroOneProps = {
  mainBadgeText: "Deal outfit hôm nay cho tín đồ thời trang",
  subBadgeText: "Set phối sẵn, lookbook & Flash Sale mỗi ngày tại Aurora Wear",

  headingPrefix: "Mix đồ",
  headingHighlight: "đẹp như lookbook",
  headingSuffix: "mà không cần đau đầu chọn từng món.",

  description: "Aurora Wear Mall gợi ý sẵn outfit công sở, dạo phố, hẹn hò… chỉ cần chọn mood, phần còn lại để chúng mình lo.",

  primaryCtaLabel: "Bắt đầu mua sắm",
  secondaryCtaLabel: "Xem outfit “đi làm hôm nay”",

  metaItems: [
    {
      iconText: "12k",
      label: "Outfit & item đang có sẵn",
    },
    {
      iconText: "4.9",
      label: "Điểm đánh giá từ khách hàng",
    },
    {
      iconText: "2h",
      label: "Giao nhanh nội thành",
    },
  ],

  paymentLogos: [
    { label: "VISA", variant: "visa" },
    { label: "MC", variant: "mc" },
    { label: "ATM", variant: "atm" },
    { label: "MOMO", variant: "momo" },
    { label: "ZALO", variant: "zalo" },
  ],

  quickCategories: ["Outfit đi làm", "Đồ dạo phố", "Date night", "Streetwear", "Phụ kiện nổi bật"],

  countdownText: "02:15:36",
  preview: false,
};

// text cho “Look hôm nay”
const LOOK_MAP: Record<LookKey, string> = {
  office: "Look hôm nay: Outfit công sở “an toàn nhưng vẫn sang” – chỉ cần thêm đôi giày cao gót là xong.",
  street: "Look hôm nay: Streetwear năng động với áo thun & jean – thêm sneaker trắng là đủ đi chơi cả ngày.",
  party: "Look hôm nay: Váy satin phối blazer – hợp đi tiệc tối hoặc hẹn hò cuối tuần.",
};

export const HeroOne: React.FC<HeroOneProps> = (props) => {
  const {
    mainBadgeText = DEFAULT_HERO_ONE_PROPS.mainBadgeText!,
    subBadgeText = DEFAULT_HERO_ONE_PROPS.subBadgeText!,
    headingPrefix = DEFAULT_HERO_ONE_PROPS.headingPrefix!,
    headingHighlight = DEFAULT_HERO_ONE_PROPS.headingHighlight!,
    headingSuffix = DEFAULT_HERO_ONE_PROPS.headingSuffix!,
    description = DEFAULT_HERO_ONE_PROPS.description!,
    primaryCtaLabel = DEFAULT_HERO_ONE_PROPS.primaryCtaLabel!,
    secondaryCtaLabel = DEFAULT_HERO_ONE_PROPS.secondaryCtaLabel!,
    metaItems = DEFAULT_HERO_ONE_PROPS.metaItems!,
    paymentLogos = DEFAULT_HERO_ONE_PROPS.paymentLogos!,
    quickCategories = DEFAULT_HERO_ONE_PROPS.quickCategories!,
    countdownText = DEFAULT_HERO_ONE_PROPS.countdownText!,
    preview = DEFAULT_HERO_ONE_PROPS.preview!,
  } = props;

  const [activeLook, setActiveLook] = useState<LookKey>("office");

  const handleDotClick = (key: LookKey) => (e: MouseEvent<HTMLSpanElement>) => {
    if (preview) {
      e.preventDefault();
      return;
    }
    setActiveLook(key);
  };

  // Auto-rotate dots (giống setInterval JS cũ)
  useEffect(() => {
    if (preview) return;

    const keys: LookKey[] = ["office", "street", "party"];
    let idx = keys.indexOf(activeLook);
    const timer = setInterval(() => {
      idx = (idx + 1) % keys.length;
      setActiveLook(keys[idx]);
    }, 6500);

    return () => clearInterval(timer);
  }, [activeLook, preview]);

  const currentLookText = LOOK_MAP[activeLook];

  // Tách phần “Look hôm nay” để <strong> giống HTML cũ
  const [lookTitle, lookRest] = currentLookText.split(":");

  return (
    <section className={styles.bsHero}>
      {/* LEFT */}
      <div className={styles.heroLeft}>
        <div>
          <div className={styles.heroBadgeRow}>
            <div className={styles.heroBadgeMain}>
              <span className={styles.heroBadgeDot} />
              <span>{mainBadgeText}</span>
            </div>
            <div className={styles.heroBadgeSub}>{subBadgeText}</div>
          </div>

          <div className={styles.heroTitle}>
            <h1>
              {headingPrefix} <span className={styles.highlight}>{headingHighlight}</span>
              <br />
              {headingSuffix}
            </h1>
            <p>
              <strong>Aurora Wear Mall</strong> {description.replace("Aurora Wear Mall", "")}
            </p>
          </div>

          <div className={styles.heroCtaRow}>
            <button className={styles.btnPrimaryGradient} type="button" onClick={preview ? (e) => e.preventDefault() : undefined}>
              {primaryCtaLabel}
              <i>➜</i>
            </button>
            <button className={styles.btnGhostLight} type="button" onClick={preview ? (e) => e.preventDefault() : undefined}>
              {secondaryCtaLabel}
              <i>★</i>
            </button>
          </div>

          <div className={styles.heroMeta}>
            {metaItems.map((item) => (
              <div key={item.label} className={styles.heroMetaItem}>
                <span className={styles.heroMetaIcon}>{item.iconText}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.heroPayments}>
            <div className={styles.heroPaymentsLabel}>Thanh toán an toàn với:</div>
            <div className={styles.paymentLogos}>
              {paymentLogos.map((logo) => {
                const variantClass = logo.variant && logo.variant !== "default" ? styles[`paymentLogo_${logo.variant}`] : "";
                return (
                  <div key={logo.label} className={`${styles.paymentLogo} ${variantClass}`}>
                    {logo.label}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.heroQuickCats}>
          {quickCategories.map((cat) => (
            <button key={cat} className={styles.heroChip} type="button" onClick={preview ? (e) => e.preventDefault() : undefined}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* RIGHT */}
      <div className={styles.heroRight}>
        <div className={styles.heroRightInner}>
          <div className={styles.heroRightTop}>
            <div className={styles.heroRightLabel}>
              <span className={styles.heroRightLabelPill} />
              <span>Flash outfit hôm nay</span>
            </div>
            <div className={styles.heroCountdown}>
              <span>Chỉ còn</span>
              <span className={styles.time}>{countdownText}</span>
            </div>
          </div>

          {/* MAIN DEAL */}
          <article className={styles.dealMainCard}>
            <div className={styles.dealThumbWrap}>
              <div className={styles.dealThumb}>
                Office
                <br />
                Set
              </div>
              <div className={styles.dealChipDiscount}>-40%</div>
            </div>
            <div className={styles.dealMainInfo}>
              <div className={styles.dealMainTitle}>Set váy + blazer công sở chuẩn trend</div>
              <div className={styles.dealMainDesc}>Form tôn dáng, ít nhăn – mix là đi làm, họp hoặc gặp đối tác được ngay.</div>
              <div className={styles.dealLabelRow}>
                <span className={styles.dealLabelPill}>Flash Sale sáng nay</span>
                <span className={styles.dealLabelTagline}>Giảm thêm cho đơn từ 799k</span>
              </div>
              <div className={styles.dealProgressRow}>
                <div className={styles.dealProgressBar}>
                  <span style={{ width: "78%" }} />
                </div>
                <span className={styles.dealProgressText}>Đã bán 78%</span>
              </div>
            </div>
            <div className={styles.dealSizeCol}>
              <div className={styles.dealSizeBadge}>S – XL</div>
              <div className={styles.dealSizeTag}>Freeship từ 499k</div>
              <div className={styles.dealMainPrice}>495.000₫</div>
            </div>
          </article>

          {/* MINI DEALS */}
          <div className={styles.miniDealsRow}>
            <article className={styles.miniDealCard}>
              <div className={styles.miniThumb} />
              <div className={styles.miniInfo}>
                <div className={styles.miniTitle}>Combo áo thun &amp; jean streetwear</div>
                <div className={styles.miniNote}>Unisex, dễ phối sneaker – đi chơi cuối tuần.</div>
                <div className={styles.miniPriceRow}>
                  <span className={styles.miniPriceNow}>349.000₫</span>
                  <span className={styles.miniPriceOff}>-32%</span>
                </div>
              </div>
            </article>

            <article className={styles.miniDealCard}>
              <div className={`${styles.miniThumb} ${styles.miniThumbAlt}`} />
              <div className={styles.miniInfo}>
                <div className={styles.miniTitle}>Outfit dạo phố nữ tính</div>
                <div className={styles.miniNote}>Váy xòe + cardigan mỏng – phù hợp đi cafe, hẹn hò.</div>
                <div className={styles.miniPriceRow}>
                  <span className={styles.miniPriceNow}>425.000₫</span>
                  <span className={styles.miniPriceOff}>-28%</span>
                </div>
              </div>
            </article>
          </div>

          {/* LOOK TODAY FOOTER */}
          <div className={styles.heroLookFooter}>
            <span className={styles.lookText}>
              <strong>{lookTitle}:</strong> {lookRest?.trim()}
            </span>
            <div className={styles.heroLookDots}>
              <span className={`${styles.lookDot} ${activeLook === "office" ? styles.lookDotActive : ""}`} onClick={handleDotClick("office")} />
              <span className={`${styles.lookDot} ${activeLook === "street" ? styles.lookDotActive : ""}`} onClick={handleDotClick("street")} />
              <span className={`${styles.lookDot} ${activeLook === "party" ? styles.lookDotActive : ""}`} onClick={handleDotClick("party")} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const HERO_ONE_REGITEM: RegItem = {
  kind: "HeroOneKind",
  label: "Hero One",
  defaults: DEFAULT_HERO_ONE_PROPS,
  inspector: [],
  render: (p) => <HeroOne {...(p as HeroOneProps)} />,
};

export default HeroOne;
