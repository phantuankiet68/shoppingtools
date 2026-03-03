"use client";

import React, { useState } from "react";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/hero/HeroBlue.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ========== TYPES & DEFAULTS ========== */

export interface HeroBlueProps {
  /** Preview mode trong UI Builder: chặn action thực (navigate, alert, ...) */
  preview?: boolean;
}

export const DEFAULT_HERO_BLUE_PROPS: HeroBlueProps = {
  preview: false,
};

/* ========== MOCK DATA (FILTER / BENEFIT / MINI CARD) ========== */

type FilterKey = "woman" | "man" | "unisex" | "sport" | "sale";

const FILTER_ITEMS: { key: FilterKey; label: string; icon: string }[] = [
  { key: "woman", label: "Nữ • Công sở", icon: "bi bi-gender-female" },
  { key: "man", label: "Nam • Minimal", icon: "bi bi-gender-male" },
  { key: "unisex", label: "Unisex Street", icon: "bi bi-heart" },
  { key: "sport", label: "Thể thao & Gym", icon: "bi bi-lightning-charge" },
  { key: "sale", label: "Flash Sale -60%", icon: "bi bi-fire" },
];

const SIZE_LIST = ["S", "M", "L", "XL"] as const;

const BENEFIT_TAGS = [
  { icon: "bi bi-truck", text: "Freeship đơn từ 499K" },
  { icon: "bi bi-arrow-repeat", text: "Đổi size cực nhanh" },
  { icon: "bi bi-shield-check", text: "Hàng chính hãng 100%" },
];

const MINI_CARDS = [
  {
    icon: "bi bi-credit-card-2-front",
    title: "Thanh toán an toàn",
    sub: "Ví điện tử, thẻ, COD – bảo mật nhiều lớp.",
  },
  {
    icon: "bi bi-people",
    title: "Stylist online 1:1",
    sub: "Inbox ngay để được tư vấn phối đồ theo dáng người.",
  },
];

/* ========== COMPONENT ========== */

export const HeroBlue: React.FC<HeroBlueProps> = (props) => {
  const { preview } = props;

  const [activeFilter, setActiveFilter] = useState<FilterKey>("woman");
  const [activeSize, setActiveSize] = useState<(typeof SIZE_LIST)[number]>("S");

  const handleFilterClick = (key: FilterKey) => {
    if (preview) return;
    setActiveFilter(key);
    // Thực tế: gọi API / filter danh sách sản phẩm
    console.log("Filter changed:", key);
  };

  const handleSizeClick = (size: (typeof SIZE_LIST)[number]) => {
    if (preview) return;
    setActiveSize(size);
  };

  const handleMainCtaClick = () => {
    if (preview) return;
    // Thực tế: scroll tới section sản phẩm hoặc push tới trang collection
    console.log("CTA clicked: Khám phá bộ sưu tập hôm nay");
  };

  return (
    <section className={styles.heroWrapper}>
      <div className={styles.heroInner}>
        {/* LEFT ======================================== */}
        <div className={styles.left}>
          <div className={styles.badges}>
            <div className={styles.pillBrand}>
              <div className={styles.pillBrandLogo}>AW</div>
              Aurora Wear • Fashion Aurora Blue
            </div>
            <div className={styles.pillTagline}>
              <i className="bi bi-stars" />
              Bộ sưu tập mới đã cập bến – mix đồ trong 30 giây.
            </div>
          </div>

          <h1 className={styles.heroTitle}>
            Bật <span className={styles.highlight}>phong cách mỗi ngày</span>
            <br />
            với bộ sưu tập Xuân 2026.
          </h1>

          <p className={styles.heroSub}>
            Đặt trọn tủ đồ cho tuần mới: từ outfit đi làm, đi chơi đến hẹn hò cuối tuần. Hơn 2.000 sản phẩm được cập
            nhật mỗi tuần, ưu đãi riêng cho thành viên Aurora.
          </p>

          {/* Filter categories */}
          <div className={styles.filterRow}>
            <div className={styles.filterLabel}>
              <i className="bi bi-magic" />
              Chọn nhanh phong cách bạn muốn xem:
            </div>
            <div className={styles.filterChips} id="filter-chips">
              {FILTER_ITEMS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  className={`${styles.filterChip} ${activeFilter === item.key ? styles.filterChipActive : ""}`}
                  onClick={() => handleFilterClick(item.key)}
                >
                  <i className={item.icon} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className={styles.ctaRow}>
            <button className={styles.btnPrimary} type="button" onClick={handleMainCtaClick}>
              <i className="bi bi-bag-heart" />
              Khám phá bộ sưu tập hôm nay
            </button>
            <button className={styles.btnGhost} type="button" onClick={(e) => preview && e.preventDefault()}>
              <i className="bi bi-camera" />
              Xem lookbook phối đồ
            </button>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaDot} />
            Giao nhanh 2h tại nội thành
            <span>•</span>
            <span>Đổi trả trong 7 ngày nếu không vừa size</span>
          </div>
        </div>

        {/* RIGHT ======================================== */}
        <div className={styles.right}>
          {/* FEATURED PRODUCT */}
          <div className={styles.featuredCard}>
            <div className={styles.featuredLeft}>
              <div className={styles.featuredLabel}>
                AURORA BLUE DROP
                <span className={styles.featuredBadge}>
                  <i className="bi bi-stars" />
                  New in 2026
                </span>
              </div>
              <div className={styles.featuredTitle}>Set blazer & chân váy Aurora Skyline</div>
              <div className={styles.featuredMeta}>
                Chất liệu thoáng nhẹ, giữ form tốt, phối được cả đi làm lẫn đi chơi. Thiết kế độc quyền tại Aurora Wear.
              </div>

              <div className={styles.priceRow}>
                <span className={styles.priceMain}>1.290.000đ</span>
                <span className={styles.priceOld}>1.590.000đ</span>
                <span className={styles.featuredTag}>
                  <i className="bi bi-lightning-charge" />
                  Giảm 19% hôm nay
                </span>
              </div>

              <div className={styles.sizesRow}>
                <span>Size còn lại:</span>
                {SIZE_LIST.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={`${styles.sizePill} ${activeSize === s ? styles.sizePillActive : ""}`}
                    onClick={() => handleSizeClick(s)}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.imageWrap}>
              <div className={styles.imageTag}>
                <i className="bi bi-camera-reels" />
                Gợi ý phối 3&nbsp;outfit trong 1 set
              </div>

              <div className={styles.imageContent}>
                {/* Ở bản thật bạn thay bằng hình outfit */}
                <div className={styles.modelText}>
                  Aurora Skyline Set
                  <span>Ảnh demo • Thay bằng hình sản phẩm thật trên web</span>
                </div>
              </div>

              <div className={styles.colorsRow}>
                <span>3 màu hiện có:</span>
                <div className={styles.colorDots}>
                  <div className={`${styles.colorDot} ${styles.blue}`} />
                  <div className={`${styles.colorDot} ${styles.green}`} />
                  <div className={`${styles.colorDot} ${styles.orange}`} />
                </div>
              </div>
            </div>
          </div>

          {/* BENEFITS & MINI CARDS */}
          <div className={styles.heroRightBottom}>
            <div className={styles.benefitsRow}>
              <div className={styles.benefitsTitle}>Lý do khách hàng thích Aurora Wear</div>
              <div className={styles.benefitTags}>
                {BENEFIT_TAGS.map((b, idx) => (
                  <div key={idx} className={styles.benefitTag}>
                    <i className={b.icon} />
                    {b.text}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.miniCards}>
              {MINI_CARDS.map((card, idx) => (
                <div key={idx} className={styles.miniCard}>
                  <div className={styles.miniIcon}>
                    <i className={card.icon} />
                  </div>
                  <div>
                    <div className={styles.miniTextMain}>{card.title}</div>
                    <div className={styles.miniTextSub}>{card.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* ========== REGITEM DÀNH CHO UI BUILDER ========== */

export const HERO_BLUE_REGITEM: RegItem = {
  kind: "HeroBlue",
  label: "Hero Blue",
  defaults: DEFAULT_HERO_BLUE_PROPS,
  inspector: [],
  render: (p) => <HeroBlue {...(p as HeroBlueProps)} />,
};

export default HeroBlue;
