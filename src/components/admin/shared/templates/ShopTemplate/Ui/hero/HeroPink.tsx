// components/templates/ShopTemplate/Ui/hero/HeroPink.tsx
"use client";

import React, { useEffect, useState, MouseEvent } from "react";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/hero/HeroPink.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/** ===== Types cho hero data bên phải ===== */
type HeroMiniItem = {
  title: string;
  now: string;
  old: string;
  sold: string;
  badge: string;
};

type HeroTabKey = "new" | "best" | "sale";

type HeroTabData = {
  tag: string;
  price: string;
  desc: string;
  fav: string;
  sold: string;
  pill: string;
  items: HeroMiniItem[];
};

/** ===== Props HeroPink ===== */
export interface HeroPinkProps {
  // Eyebrow
  eyebrowTag?: string;
  eyebrowText?: string;

  // Title
  titleLine1Prefix?: string;
  titleHighlight?: string;
  titleLine2?: string;

  // Subtitle
  subtitle?: string;

  // Badges bên dưới subtitle
  badges?: { iconClass: string; text: string }[];

  // CTA
  primaryLabel?: string;
  secondaryLabel?: string;

  // Meta row
  metaMainText?: string; // phần "Đã có hơn 12.340+ khách hàng yêu Aurora Pink."
  metaExtraText?: string; // phần "Size từ XS đến XXL, phù hợp nhiều dáng người."

  // Callbacks
  onPrimaryClick?: () => void;
  onSecondaryClick?: () => void;

  // Preview mode (chặn action)
  preview?: boolean;
}

/** ===== DEFAULTS ===== */
const DEFAULT_HERO_PINK_PROPS: HeroPinkProps = {
  eyebrowTag: "Aurora Pink Drop",
  eyebrowText: "Bộ sưu tập pastel cho mùa xuân 2025",
  titleLine1Prefix: "Chạm vào",
  titleHighlight: "thế giới pastel",
  titleLine2: "dịu nhẹ & nữ tính.",
  subtitle:
    "Những thiết kế mềm mại, tông hồng sữa – kem – nude, được sinh ra để xuất hiện trong tủ đồ của bạn. Mix & match nhẹ nhàng nhưng vẫn nổi bật trong mọi khung hình.",
  badges: [
    { iconClass: "bi bi-truck", text: "Freeship đơn từ 299k" },
    { iconClass: "bi bi-arrow-repeat", text: "Đổi trả trong 7 ngày" },
    { iconClass: "bi bi-shield-check", text: "Thanh toán an toàn" },
  ],
  primaryLabel: "Khám phá BST mới",
  secondaryLabel: "Xem lookbook pastel",
  metaMainText: "Đã có hơn 12.340+ khách hàng yêu Aurora Pink.",
  metaExtraText: "Size từ XS đến XXL, phù hợp nhiều dáng người.",
  preview: false,
};

/** ===== DATA cho panel bên phải (tabs) ===== */
const HERO_TABS_DATA: Record<HeroTabKey, HeroTabData> = {
  new: {
    tag: "Look Pastel Iconic",
    price: "459.000₫",
    desc: "Set váy voan phối cardigan len mỏng, tông hồng sương mờ dành cho chiều cuối tuần.",
    fav: "1.248 lượt yêu thích",
    sold: "Đã bán 890+",
    pill: "Pastel of the Day",
    items: [
      {
        title: "Đầm slip satin màu sữa",
        now: "389.000₫",
        old: "439.000₫",
        sold: "Đã bán 530+",
        badge: "New",
      },
      {
        title: "Cardigan len mỏng hồng phấn",
        now: "329.000₫",
        old: "379.000₫",
        sold: "Đã bán 412+",
        badge: "Limited",
      },
      {
        title: "Chân váy xếp ly pastel",
        now: "299.000₫",
        old: "349.000₫",
        sold: "Đã bán 610+",
        badge: "-15%",
      },
    ],
  },
  best: {
    tag: "Top Pastel Lover",
    price: "429.000₫",
    desc: "Combo áo blouse ren + chân váy chữ A, hợp mọi dáng người, ghi điểm tuyệt đối khi đi làm.",
    fav: "2.304 lượt yêu thích",
    sold: "Đã bán 1.320+",
    pill: "Best seller tuần này",
    items: [
      {
        title: "Blouse tay phồng ren hoa",
        now: "349.000₫",
        old: "399.000₫",
        sold: "Đã bán 740+",
        badge: "Hot",
      },
      {
        title: "Váy baby doll pastel",
        now: "409.000₫",
        old: "479.000₫",
        sold: "Đã bán 680+",
        badge: "4.9★",
      },
      {
        title: "Set matching pastel đôi",
        now: "799.000₫",
        old: "899.000₫",
        sold: "Đã bán 320+",
        badge: "Couple",
      },
    ],
  },
  sale: {
    tag: "Pastel Sale Festival",
    price: "Từ 199.000₫",
    desc: "Flash sale 3 ngày | Các item pastel được yêu thích nhất giảm đến 35%.",
    fav: "985 lượt thả tim",
    sold: "Đã bán 1.540+",
    pill: "Ưu đãi 3 ngày",
    items: [
      {
        title: "Đầm midi pastel kèm thắt lưng",
        now: "259.000₫",
        old: "369.000₫",
        sold: "Đã bán 520+",
        badge: "-30%",
      },
      {
        title: "Áo len cổ tim cloud pink",
        now: "219.000₫",
        old: "329.000₫",
        sold: "Đã bán 450+",
        badge: "-28%",
      },
      {
        title: "Túi kẹp nách mini pastel",
        now: "199.000₫",
        old: "289.000₫",
        sold: "Đã bán 380+",
        badge: "-31%",
      },
    ],
  },
};

/** ===================== UI COMPONENT ===================== */
export const HeroPink: React.FC<HeroPinkProps> = (props) => {
  const {
    eyebrowTag = DEFAULT_HERO_PINK_PROPS.eyebrowTag,
    eyebrowText = DEFAULT_HERO_PINK_PROPS.eyebrowText,
    titleLine1Prefix = DEFAULT_HERO_PINK_PROPS.titleLine1Prefix,
    titleHighlight = DEFAULT_HERO_PINK_PROPS.titleHighlight,
    titleLine2 = DEFAULT_HERO_PINK_PROPS.titleLine2,
    subtitle = DEFAULT_HERO_PINK_PROPS.subtitle,
    badges = DEFAULT_HERO_PINK_PROPS.badges,
    primaryLabel = DEFAULT_HERO_PINK_PROPS.primaryLabel,
    secondaryLabel = DEFAULT_HERO_PINK_PROPS.secondaryLabel,
    metaMainText = DEFAULT_HERO_PINK_PROPS.metaMainText,
    metaExtraText = DEFAULT_HERO_PINK_PROPS.metaExtraText,
    onPrimaryClick,
    onSecondaryClick,
    preview = DEFAULT_HERO_PINK_PROPS.preview,
  } = props;

  /** ===== State tabs + mini item active ===== */
  const [activeTab, setActiveTab] = useState<HeroTabKey>("new");
  const [activeMiniIndex, setActiveMiniIndex] = useState<number>(0);

  // reset mini active khi đổi tab
  useEffect(() => {
    setActiveMiniIndex(0);
  }, [activeTab]);

  // Auto rotate tab 5s
  useEffect(() => {
    const keys: HeroTabKey[] = ["new", "best", "sale"];
    const timer = setInterval(() => {
      setActiveTab((prev) => {
        const idx = keys.indexOf(prev);
        const nextIdx = (idx + 1) % keys.length;
        return keys[nextIdx];
      });
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const tabData = HERO_TABS_DATA[activeTab];

  /** ===== Handlers ===== */
  const handlePrimaryClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (preview) {
      e.preventDefault();
      return;
    }
    onPrimaryClick?.();
  };

  const handleSecondaryClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (preview) {
      e.preventDefault();
      return;
    }
    onSecondaryClick?.();
  };

  const handleTabClick = (key: HeroTabKey) => (e: MouseEvent<HTMLButtonElement>) => {
    if (preview) {
      e.preventDefault();
      return;
    }
    setActiveTab(key);
  };

  /** =================== RENDER =================== */
  return (
    <section className={styles.heroAuroraPink}>
      <div className={styles.heroInner}>
        {/* LEFT */}
        <div>
          <div className={styles.heroLeftEyebrow}>
            {eyebrowTag && <span className={styles.eyebrowTag}>{eyebrowTag}</span>}
            {eyebrowText}
          </div>

          <h1 className={styles.heroTitle}>
            {titleLine1Prefix} <span className={styles.highlight}>{titleHighlight}</span>
            <br />
            {titleLine2}
          </h1>

          {subtitle && <p className={styles.heroSub}>{subtitle}</p>}

          <div className={styles.heroBadges}>
            {badges?.map((badge) => (
              <div key={badge.text} className={styles.heroBadgePill}>
                <i className={badge.iconClass} />
                {badge.text}
              </div>
            ))}
          </div>

          <div className={styles.heroActions}>
            <button className={styles.btnPrimary} type="button" onClick={handlePrimaryClick}>
              {primaryLabel}
              <i className="bi bi-arrow-right-short" />
            </button>
            <button className={styles.btnGhost} type="button" onClick={handleSecondaryClick}>
              <i className="bi bi-play-circle" />
              {secondaryLabel}
            </button>
          </div>

          <div className={styles.heroMetaRow}>
            <span className={styles.heroMetaDot} />
            <span>{metaMainText}</span>
            <span>|</span>
            <span>{metaExtraText}</span>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.heroRightPanel}>
          <div className={styles.heroCardMain}>
            <div className={styles.heroCardContent}>
              {/* Media + main price */}
              <div className={styles.heroCardMedia}>
                <div className={styles.heroCardMediaMain}>
                  <div className={styles.heroCardTag}>
                    <i className="bi bi-stars" />
                    <span>{tabData.tag}</span>
                  </div>

                  <div className={styles.heroCardPriceBlock}>
                    <div className={styles.heroCardPriceMain}>{tabData.price}</div>
                    <div className={styles.heroCardPriceSub}>{tabData.desc}</div>
                    <div className={styles.heroCardMetaMini}>
                      <span>
                        <i className="bi bi-heart-fill" />
                        {tabData.fav}
                      </span>
                      <span>
                        <i className="bi bi-bag-heart" />
                        {tabData.sold}
                      </span>
                    </div>
                  </div>

                  <div className={styles.heroCardDress} />
                  <div className={styles.heroCardPill}>
                    <i className="bi bi-lightning-charge-fill" />
                    <span>{tabData.pill}</span>
                  </div>
                </div>
              </div>

              {/* Tabs + mini list */}
              <div>
                <div className={styles.heroTabs}>
                  <button
                    type="button"
                    className={`${styles.heroTab} ${activeTab === "new" ? styles.heroTabActive : ""}`}
                    onClick={handleTabClick("new")}
                  >
                    <i className="bi bi-magic" />
                    New in
                  </button>
                  <button
                    type="button"
                    className={`${styles.heroTab} ${activeTab === "best" ? styles.heroTabActive : ""}`}
                    onClick={handleTabClick("best")}
                  >
                    <i className="bi bi-heart" />
                    Best seller
                  </button>
                  <button
                    type="button"
                    className={`${styles.heroTab} ${activeTab === "sale" ? styles.heroTabActive : ""}`}
                    onClick={handleTabClick("sale")}
                  >
                    <i className="bi bi-percent" />
                    Sale pastel
                  </button>
                </div>

                <div className={styles.heroCardList}>
                  {tabData.items.map((item, idx) => (
                    <article
                      key={item.title}
                      className={`${styles.heroMiniItem} ${idx === activeMiniIndex ? styles.heroMiniItemActive : ""}`}
                      onMouseEnter={() => setActiveMiniIndex(idx)}
                    >
                      <div className={styles.heroMiniThumb} />
                      <div>
                        <h4 className={styles.heroMiniTitle}>{item.title}</h4>
                        <div className={styles.heroMiniPrice}>
                          <span className={styles.heroMiniPriceNow}>{item.now}</span>
                          <span className={styles.heroMiniPriceOld}>{item.old}</span>
                        </div>
                        <div className={styles.heroMiniExtra}>
                          <span className={styles.heroMiniSold}>
                            <i className="bi bi-fire" />
                            {item.sold}
                          </span>
                          <span className={styles.heroMiniBadge}>{item.badge}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>

                <div className={styles.heroRightFooter}>
                  <span>Gợi ý từ Aurora Pink cho hôm nay</span>
                  <div className={styles.heroDots}>
                    <span className={`${styles.heroDot} ${styles.heroDotActive}`} />
                    <span className={styles.heroDot} />
                    <span className={styles.heroDot} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/** ===== RegItem cho UI Builder ===== */
export const HERO_PINK_REGITEM: RegItem = {
  kind: "HeroPinkKind",
  label: "Hero Pink",
  defaults: DEFAULT_HERO_PINK_PROPS,
  inspector: [],
  render: (p) => <HeroPink {...(p as HeroPinkProps)} />,
};

export default HeroPink;
