"use client";

import React, { useState } from "react";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/hero/HeroYellow.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* =========================================
 *      TYPES & DEFAULT PROPS
 * =======================================*/

export interface HeroOneProps {
  preview?: boolean;
}

const DEFAULT_HERO_ONE_PROPS: HeroOneProps = {
  preview: false,
};

/* =========================================
 *      DATA MOCK (TAGS, CATEGORY)
 * =======================================*/

const CATEGORY_LIST = [
  { label: "Nữ", icon: "bi bi-gender-female" },
  { label: "Nam", icon: "bi bi-gender-male" },
  { label: "Unisex", icon: "bi bi-universal-access-circle" },
  { label: "Capsule 7 ngày", icon: "bi bi-lightning-charge" },
  { label: "Chất liệu hữu cơ", icon: "bi bi-droplet" },
];

const QUICK_TAGS = [
  { label: "Set công sở 5 ngày không trùng", hot: true },
  { label: "Outfit đi chơi cuối tuần", hot: false },
  { label: "Mix quần jeans & áo basic", hot: false },
  { label: "Đồ tập gym & yoga", hot: false },
  { label: "Look xanh – chất liệu organic", hot: false },
];

const MINI_STYLES = [
  {
    title: "Capsule 7 ngày",
    sub: "5–7 món đồ, phối được cả tuần.",
    tag: "Từ 1.899k",
  },
  {
    title: "Office ready",
    sub: "Blazer, quần âu & sơ mi xanh.",
    tag: "Best-seller",
  },
  {
    title: "Streetwear",
    sub: "Hoodie, jogger & sneaker.",
    tag: "Hot trend",
  },
];

/* =========================================
 *              COMPONENT
 * =======================================*/

export const HeroOne: React.FC<HeroOneProps> = (props) => {
  const { preview } = props;

  const [activeCat, setActiveCat] = useState(0);
  const [search, setSearch] = useState("");

  return (
    <section className={styles.heroWrapper}>
      <div className={styles.heroInner}>
        {/* ============ LEFT ============ */}
        <div className={styles.left}>
          {/* Badges */}
          <div className={styles.badgeRow}>
            <div className={styles.pillMain}>
              <span className={styles.pillMainIcon}>
                <i className="bi bi-bag-heart-fill" />
              </span>
              Aurora Green Wear • Tủ đồ “xanh” 2025
            </div>

            <div className={styles.pillSub}>
              <i className="bi bi-truck" />
              Giao nhanh & đổi trả trong 7 ngày
            </div>
          </div>

          {/* Title */}
          <h1 className={styles.heroTitle}>
            Phối đồ <span>xanh – chuẩn gu</span> cho cả tuần chỉ trong một lần chạm.
          </h1>

          <p className={styles.heroSub}>
            Outfit công sở, streetwear, activewear & capsule wardrobe tối giản — gợi ý sẵn theo từng ngày, từng mood,
            giữ phong cách nhưng vẫn thân thiện môi trường.
          </p>

          {/* Category pills */}
          <div className={styles.categoryRow}>
            {CATEGORY_LIST.map((c, idx) => (
              <button
                key={idx}
                className={`${styles.categoryPill} ${idx === activeCat ? styles.active : ""}`}
                onClick={() => !preview && setActiveCat(idx)}
              >
                <i className={c.icon}></i>
                {c.label}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className={styles.searchBox}>
            <div className={styles.chip} onClick={() => !preview && setSearch("Lookbook capsule 7 ngày")}>
              <i className="bi bi-stars"></i>
              Gợi ý nhanh
            </div>

            <input
              type="text"
              placeholder="Tìm outfit / set đồ bạn muốn…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              disabled={preview}
            />

            <button type="button" onClick={(e) => preview && e.preventDefault()}>
              <i className="bi bi-search" />
              Tìm kiếm
            </button>
          </div>

          {/* Quick tags */}
          <div className={styles.tagsRow}>
            {QUICK_TAGS.map((t, idx) => (
              <button
                key={idx}
                className={`${styles.tag} ${t.hot ? styles.tagHot : ""}`}
                onClick={() => !preview && setSearch(t.label)}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* CTA */}
          <div className={styles.ctaRow}>
            <button className={styles.btnGhost} onClick={(e) => preview && e.preventDefault()}>
              <i className="bi bi-grid-3x3-gap" />
              Tạo tủ đồ capsule 7 ngày
            </button>

            <button className={styles.btnGhost} onClick={(e) => preview && e.preventDefault()}>
              <i className="bi bi-rulers" />
              Hỗ trợ chọn size chuẩn
            </button>

            <div className={styles.trustBadge}>
              <span className={styles.trustIcon}>
                <i className="bi bi-stars" />
              </span>
              4.9/5 từ 8.320 đánh giá
            </div>
          </div>
        </div>

        {/* ============ RIGHT ============ */}
        <div className={styles.right}>
          {/* Lookbook card */}
          <div className={styles.lookCard}>
            <div>
              <div className={styles.lookTitle}>
                “Lookbook Xanh – Công sở 5 ngày”
                <span className={styles.newBadge}>Mới</span>
              </div>

              <p className={styles.lookSub}>
                Ít món đồ hơn, mix-match thông minh cho cả tuần đi làm mà vẫn giữ vibe “xanh” & gọn tủ.
              </p>

              <div className={styles.statLine}>
                <i className="bi bi-clock-history"></i>
                Tiết kiệm ~30 phút mỗi sáng
              </div>
            </div>

            <div className={styles.visualBox}>
              <div className={styles.frame}>
                <div className={styles.frameInner}>
                  <div className={styles.silhouette}></div>
                  <span>Set từ</span>
                  <strong>499k</strong>
                </div>
              </div>

              <div className={styles.frameTag}>
                <i className="bi bi-camera-reels" />
                Xem gợi ý
              </div>
            </div>
          </div>

          {/* Mini styles */}
          <div className={styles.miniRow}>
            <div className={styles.miniHeader}>
              <span className={styles.label}>
                <i className="bi bi-lightning-charge-fill" />
                Style nổi bật tuần này
              </span>
            </div>

            <div className={styles.miniGrid}>
              {MINI_STYLES.map((m, idx) => (
                <div key={idx} className={styles.miniCard}>
                  <div className={styles.miniTitle}>{m.title}</div>
                  <div className={styles.miniSub}>{m.sub}</div>
                  <span className={styles.miniTag}>{m.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

/* =========================================
 *          REGITEM CHO UI BUILDER
 * =======================================*/

export const HERO_ONE_REGITEM: RegItem = {
  kind: "HeroOneKind",
  label: "Hero One",
  defaults: DEFAULT_HERO_ONE_PROPS,
  inspector: [],
  render: (p) => <HeroOne {...(p as HeroOneProps)} />,
};

export default HeroOne;
