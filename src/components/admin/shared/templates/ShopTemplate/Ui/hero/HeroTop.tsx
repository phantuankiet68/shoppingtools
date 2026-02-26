/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/hero/HeroTop.module.css";
import type { RegItem } from "@/lib/ui-builder/types"; // chỉnh lại path cho đúng project của bạn

export interface HeroTopProps {
  preview?: boolean;
}

export const DEFAULT_HERO_TOP_PROPS: HeroTopProps = {
  preview: false,
};

type Slide = {
  date: string;
  line1: string;
  mainWord: string;
  sub: string;
  headingTitle: string;
  headingNote: string;
};

const SLIDES: Slide[] = [
  {
    date: "20❤️10",
    line1: "Chọn quà",
    mainWord: "“CHẤT”",
    sub: "Chiều nàng hết nấc",
    headingTitle: "ƯU ĐÃI 20/10",
    headingNote: "Mua outfit tặng thêm phụ kiện – set đồ hoàn chỉnh chỉ trong một lần chọn.",
  },
  {
    date: "Valentine",
    line1: "Trao nàng",
    mainWord: "“YÊU”",
    sub: "Ngọt ngào từng ánh nhìn",
    headingTitle: "BỘ SƯU TẬP HỒNG",
    headingNote: "Suit, đầm, phụ kiện tone hồng pastel • mix & match sẵn theo set cho bạn.",
  },
];

const HeroTop: React.FC<HeroTopProps> = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slide = SLIDES[currentSlide];

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
  };

  const handleCta = () => {
    if (typeof window !== "undefined") {
      window.alert("Demo: mở popup chọn quà 20/10 hoặc chuyển đến section sản phẩm khuyến mãi 💝");
    }
  };

  return (
    <section className={styles["fw-hero"]}>
      <div className={styles["fw-hero-inner"]}>
        {/* decor hearts */}
        <span className={`${styles["fw-heart"]} ${styles["h1"]}`} />
        <span className={`${styles["fw-heart"]} ${styles["h2"]}`} />
        <span className={`${styles["fw-heart"]} ${styles["h3"]}`} />

        {/* arrows */}
        <button type="button" className={`${styles["fw-arrow"]} ${styles["fw-arrow-left"]}`} onClick={handlePrev}>
          <i className="bi bi-chevron-left" />
        </button>
        <button type="button" className={`${styles["fw-arrow"]} ${styles["fw-arrow-right"]}`} onClick={handleNext}>
          <i className="bi bi-chevron-right" />
        </button>

        {/* LEFT */}
        <div className={styles["fw-left"]}>
          {/* main quote block */}
          <div className={styles["fw-box-main"]}>
            <div className={styles["fw-box-main-inner"]}>
              <div className={styles["fw-badge-date"]}>{slide.date}</div>
              <div className={styles["fw-main-line1"]}>{slide.line1}</div>
              <div className={styles["fw-main-word"]}>{slide.mainWord}</div>
              <div className={styles["fw-main-sub"]}>{slide.sub}</div>
            </div>
          </div>

          {/* heading + promos */}
          <div className={styles["fw-heading-block"]}>
            <div>
              <p className={styles["fw-heading-sub"]}>Cơ hội duy nhất trong năm</p>
              <h2 className={styles["fw-heading-title"]}>
                <span>{slide.headingTitle}</span>
              </h2>
              <p className={styles["fw-heading-note"]}>{slide.headingNote}</p>
            </div>

            <div className={styles["fw-promo-grid"]}>
              <div className={styles["fw-promo-card"]}>
                <div className={styles["fw-promo-label"]}>Ưu đãi 1</div>
                <div className={styles["fw-promo-main"]}>Giá gốc sập sàn</div>
                <div className={styles["fw-promo-sub"]}>Áp dụng cho bộ sưu tập suit hồng &amp; váy dự tiệc.</div>
              </div>
              <div className={styles["fw-promo-card"]}>
                <div className={styles["fw-promo-label"]}>Ưu đãi 2</div>
                <div className={styles["fw-promo-main"]}>Tặng thêm quà xinh</div>
                <div className={styles["fw-promo-sub"]}>Túi mini, bông tai hoặc khăn lụa theo hóa đơn.</div>
              </div>
              <div className={styles["fw-promo-card"]}>
                <div className={styles["fw-promo-label"]}>Ưu đãi 3</div>
                <div className={styles["fw-promo-main"]}>Giftcode -30%</div>
                <div className={styles["fw-promo-sub"]}>Giảm thêm so với giá niêm yết khi checkout online.</div>
              </div>
              <div className={styles["fw-promo-card"]}>
                <div className={styles["fw-promo-label"]}>Chỉ hôm nay</div>
                <div className={styles["fw-promo-main"]}>Free ship toàn quốc</div>
                <div className={styles["fw-promo-sub"]}>Đơn từ 399K, giao nhanh nội thành trong ngày.</div>
              </div>
            </div>

            <div className={styles["fw-cta-line"]}>
              <button type="button" className={styles["fw-cta-btn"]} onClick={handleCta}>
                <i className="bi bi-bag-heart" />
                ĐẶT QUÀ CHO NÀNG NGAY
              </button>
              <span className={styles["fw-cta-note"]}>Hết hạn sau 24 giờ • Số lượng quà tặng có giới hạn.</span>
            </div>
          </div>
        </div>

        {/* RIGHT: model */}
        <div className={styles["fw-right"]}>
          <div className={styles["fw-model-card"]}>
            <div className={styles["fw-model-bg"]} />
            <div className={styles["fw-model-silhouette"]} />

            <div className={styles["fw-model-tag"]}>Limited collection</div>
            <div className={styles["fw-model-chip"]}>
              <span>Suit hồng pastel</span>
              <strong>Giảm đến 30%</strong>
            </div>
          </div>
        </div>

        {/* dots */}
        <div className={styles["fw-dots"]}>
          <span className={`${styles["fw-dot"]} ${currentSlide === 0 ? styles["active"] : ""}`} />
          <span className={`${styles["fw-dot"]} ${currentSlide === 1 ? styles["active"] : ""}`} />
        </div>
      </div>
    </section>
  );
};

/* =========================================
   RegItem theo format bạn yêu cầu
   ========================================= */

export const HERO_TOP: RegItem = {
  kind: "HeroTop",
  label: "Hero Top",
  defaults: DEFAULT_HERO_TOP_PROPS,
  inspector: [],
  render: (p) => <HeroTop {...(p as HeroTopProps)} />,
};

export default HeroTop;
