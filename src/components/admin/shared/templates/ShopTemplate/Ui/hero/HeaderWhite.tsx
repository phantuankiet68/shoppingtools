/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/hero/HeaderWhite.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export interface HeroWhiteProps {
  preview?: boolean;
}

export const DEFAULT_HERO_WHITE_PROPS: HeroWhiteProps = {
  preview: false,
};

type Variant = "a" | "b";

type MoodKey = "work" | "cafe" | "date" | "home";

interface MoodConfig {
  label: string;
  iconClass: string;
  focus: string;
  moodLine: string; // text cho cardMood
  highlight: string; // phần gợi ý
  stats1: string;
  stats2: string;
}

const MOODS: Record<MoodKey, MoodConfig> = {
  work: {
    label: "Đi làm",
    iconClass: "bi bi-briefcase",
    focus: "Look công sở – gọn gàng, thanh lịch",
    moodLine: "Đi làm · Studio chic",
    highlight: "Blazer pastel + quần tây high-waist + sneaker trắng. Thêm túi xách beige để giữ tone thanh lịch.",
    stats1: "+128 set công sở gợi ý hôm nay",
    stats2: "9.204 lượt mix / tuần",
  },
  cafe: {
    label: "Đi chơi / cafe",
    iconClass: "bi bi-cup-hot",
    focus: "Outfit cafe – nhẹ nhàng, thoải mái",
    moodLine: "Cafe · Casual comfy",
    highlight: "Áo thun basic + quần jean ống rộng + cardigan mỏng. Gợi ý thêm 1 chiếc tote canvas.",
    stats1: "+86 set cuối tuần",
    stats2: "7.891 lượt mix / tuần",
  },
  date: {
    label: "Hẹn hò",
    iconClass: "bi bi-heart",
    focus: "Date night – nổi bật nhưng tinh tế",
    moodLine: "Date night · Soft glow",
    highlight: "Đầm satin midi + sandal cao gót + túi mini. Thêm khuyên tai vàng để tăng điểm nhấn.",
    stats1: "+54 set hẹn hò hôm nay",
    stats2: "4.312 lượt mix / tuần",
  },
  home: {
    label: "Ở nhà / effortless",
    iconClass: "bi bi-house-door",
    focus: "Outfit đơn giản, dễ mặc mỗi ngày",
    moodLine: "Ở nhà · Effortless chic",
    highlight: "Set đồ lounge cotton + sneaker / dép slide. Đủ đẹp để bước ra ngoài 5 phút vẫn ổn.",
    stats1: "+39 set stay-in",
    stats2: "2.745 lượt mix / tuần",
  },
};

const HeroWhite: React.FC<HeroWhiteProps> = () => {
  const [variant, setVariant] = useState<Variant>("a");
  const [activeMood, setActiveMood] = useState<MoodKey>("work");

  const moodConfig = MOODS[activeMood];

  const handleToggleVariant = (v: Variant) => {
    setVariant(v);
  };

  const handleStartMix = () => {
    if (typeof window !== "undefined") {
      window.alert("Demo: Bắt đầu mix outfit theo phong cách của bạn 👗👕👟");
    }
  };

  return (
    <section className={`${styles["aurora-hero"]} ${variant === "b" ? styles["variant-b"] : ""}`}>
      <div className={styles["aurora-hero-inner"]}>
        {/* Toggle style A/B */}
        <div className={styles["ah-style-toggle"]}>
          <button type="button" className={`${styles["ah-style-btn"]} ${variant === "a" ? styles["active"] : ""}`} onClick={() => handleToggleVariant("a")}>
            Studio
          </button>
          <button type="button" className={`${styles["ah-style-btn"]} ${variant === "b" ? styles["active"] : ""}`} onClick={() => handleToggleVariant("b")}>
            Street
          </button>
        </div>

        {/* LEFT: TEXT / CTA */}
        <div className={styles["ah-left"]}>
          <div className={styles["ah-left-top"]}>
            <div className={styles["ah-badge"]}>
              <span className={styles["ah-dot"]} />
              Aurora Wear · New Season
            </div>
            <div className={styles["ah-pill-tag"]}>
              <i className="bi bi-stars" />
              Mix &amp; match outfit trong 10 giây
            </div>
          </div>

          <h1 className={styles["ah-title"]}>
            Biến tủ đồ của bạn thành <span>“outfit OS”</span> cho mọi khoảnh khắc.
          </h1>

          <p className={styles["ah-desc"]}>
            Chọn mood, không gian và dịp mặc – Aurora sẽ gợi ý outfit hoàn chỉnh từ áo, quần, phụ kiện đến đôi giày phù hợp, tối ưu theo phong cách và ngân sách của bạn.
          </p>

          <div className={styles["ah-cta-row"]}>
            <button type="button" className={styles["ah-btn-main"]} onClick={handleStartMix}>
              <i className="bi bi-play-fill" />
              Bắt đầu mix outfit ngay
            </button>
            <button type="button" className={styles["ah-btn-ghost"]}>
              <i className="bi bi-magic" />
              Để AI chọn set đồ giúp tôi
            </button>
          </div>

          {/* Mood chips */}
          <div className={styles["ah-mood-row"]}>
            {(Object.entries(MOODS) as [MoodKey, MoodConfig][]).map(([key, cfg]) => (
              <button key={key} type="button" className={`${styles["ah-mood-chip"]} ${activeMood === key ? styles["active"] : ""}`} onClick={() => setActiveMood(key)}>
                <i className={cfg.iconClass} />
                {cfg.label}
              </button>
            ))}
          </div>

          {/* Stats */}
          <div className={styles["ah-stats"]}>
            <div className={styles["ah-stat-card"]}>
              <div className={styles["ah-stat-label"]}>Outfit gợi ý hôm nay</div>
              <div className={styles["ah-stat-value"]}>{moodConfig.stats1}</div>
            </div>
            <div className={styles["ah-stat-card"]}>
              <div className={styles["ah-stat-label"]}>Khách đã mix outfit</div>
              <div className={styles["ah-stat-value"]}>{moodConfig.stats2}</div>
            </div>
            <div className={styles["ah-stat-card"]}>
              <div className={styles["ah-stat-label"]}>Tỷ lệ thêm vào giỏ</div>
              <div className={styles["ah-stat-value"]}>87% sau khi xem gợi ý</div>
            </div>
          </div>
        </div>

        {/* RIGHT: MINI OUTFIT CARD */}
        <div className={styles["ah-right"]}>
          <div className={styles["ah-card"]}>
            <div className={styles["ah-card-header"]}>
              <div>
                <div className={styles["ah-card-title"]}>Outfit đề xuất hôm nay</div>
                <div className={styles["ah-card-sub"]}>{`Mood: ${moodConfig.label} · ${moodConfig.focus}`}</div>
              </div>
              <div className={styles["ah-chip-small"]}>
                <i className="bi bi-lightning-charge-fill" />
                Smart Styling
              </div>
            </div>

            <div className={styles["ah-card-body"]}>
              <div className={styles["ah-products-grid"]}>
                <div className={styles["ah-product-card"]}>
                  <div className={styles["ah-product-img"]} />
                  <div className={styles["ah-product-meta"]}>
                    <div className={styles["ah-product-name"]}>Blazer pastel</div>
                    <div className={styles["ah-product-price"]}>799.000₫</div>
                    <div className={styles["ah-product-tag"]}>best seller</div>
                  </div>
                </div>
                <div className={styles["ah-product-card"]}>
                  <div className={styles["ah-product-img"]} />
                  <div className={styles["ah-product-meta"]}>
                    <div className={styles["ah-product-name"]}>Quần tây high-waist</div>
                    <div className={styles["ah-product-price"]}>649.000₫</div>
                    <div className={styles["ah-product-tag"]}>new in</div>
                  </div>
                </div>
                <div className={styles["ah-product-card"]}>
                  <div className={styles["ah-product-img"]} />
                  <div className={styles["ah-product-meta"]}>
                    <div className={styles["ah-product-name"]}>Sneaker trắng clean</div>
                    <div className={styles["ah-product-price"]}>990.000₫</div>
                    <div className={styles["ah-product-tag"]}>daily wear</div>
                  </div>
                </div>
              </div>
              <div className={styles["ah-card-body-note"]}>
                <strong>Gợi ý:</strong> {moodConfig.highlight}
              </div>
            </div>

            <div className={styles["ah-timeline"]}>
              <div className={styles["ah-timeline-times"]}>
                <span>Đặt trước 15:00</span>
                <span>Hôm nay</span>
                <span>+2 ngày</span>
              </div>
              <div className={styles["ah-timeline-bar"]}>
                <div className={styles["ah-slot"]}>
                  <div className={`${styles["ah-slot-fill"]} ${styles["long"]}`} />
                </div>
                <div className={styles["ah-slot"]}>
                  <div className={styles["ah-slot-fill"]} />
                </div>
                <div className={styles["ah-slot"]}>
                  <div className={`${styles["ah-slot-fill"]} ${styles["short"]}`} />
                </div>
              </div>
            </div>

            <div className={styles["ah-card-footer"]}>
              <span>
                Ưu đãi set này: <strong>-15% &amp; freeship</strong>
              </span>
              <span className={styles["ah-mini-tag"]}>
                <i className="bi bi-bag-heart" />
                Thêm toàn bộ vào giỏ
              </span>
            </div>

            <div className={styles["ah-orb"]} />
          </div>
        </div>
      </div>
    </section>
  );
};

/* ========== RegItem cho UI-builder (theo mẫu bạn yêu cầu) ========== */

export const HERO_WHITE: RegItem = {
  kind: "HeroWhite",
  label: "Hero White",
  defaults: DEFAULT_HERO_WHITE_PROPS,
  inspector: [],
  render: (p) => <HeroWhite {...(p as HeroWhiteProps)} />,
};

export default HeroWhite;
