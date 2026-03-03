// components/templates/ShopTemplate/Ui/hero/HeroGreen.tsx
"use client";

import React, { useEffect, useState } from "react";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/hero/HeroGreen.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/** ===== Props HeroGreen ===== */
export interface HeroGreenProps {
  /** thêm class ngoài nếu cần */
  className?: string;

  /** Bật/tắt chế độ preview (không cho tương tác, giống HeaderPro) */
  preview?: boolean;
}

/** ===== Types nội bộ ===== */
type LookKey = "office" | "weekend" | "date";

type MiniItem = {
  name: string;
  price: string;
  meta: string;
  note: string;
};

type LookConfig = {
  tag: string;
  rating: string;
  sizes: string[];
  mini1: MiniItem;
  mini2: MiniItem;
};

/** ===== CONSTANT DATA ===== */
const QUICK_CHIPS = ["Set công sở nữ", "Áo khoác & blazer", "Đầm midi dịu nhẹ", "Đồ đôi gia đình", "Unisex basic xanh"];

const LOOKBOOK_CAPTIONS = [
  "Outfit đi làm: blazer xanh, quần ống suông &amp; áo thun trắng – dễ mặc, dễ phối giày.",
  "Outfit café cuối tuần: đầm midi xanh, cardigan mỏng &amp; túi tote vải organic.",
  "Outfit dạo phố: sơ mi oversize, quần short lửng &amp; sneaker trắng cực dễ chịu.",
];

const LOOKS: Record<LookKey, LookConfig> = {
  office: {
    tag: "Office x Street",
    rating: "4.8/5 từ 2.314 đánh giá",
    sizes: ["S", "M", "L", "XL"],
    mini1: {
      name: "Blazer xanh mint",
      price: "799K",
      meta: "Size S–XL",
      note: "-15% khi mua kèm quần",
    },
    mini2: {
      name: "Quần ống suông",
      price: "599K",
      meta: "Best-seller",
      note: "Chất vải ít nhăn",
    },
  },
  weekend: {
    tag: "Weekend chill",
    rating: "4.9/5 từ 1.576 đánh giá",
    sizes: ["S", "M", "L"],
    mini1: {
      name: "Đầm midi xanh",
      price: "689K",
      meta: "Chất vải thoáng",
      note: "Tặng thắt lưng cùng tông",
    },
    mini2: {
      name: "Cardigan mỏng",
      price: "459K",
      meta: "Mặc ngoài cực xinh",
      note: "-10% khi mua kèm đầm",
    },
  },
  date: {
    tag: "Date night",
    rating: "4.7/5 từ 986 đánh giá",
    sizes: ["XS", "S", "M", "L"],
    mini1: {
      name: "Đầm slip satin",
      price: "899K",
      meta: "Có size XS",
      note: "Tặng voucher 50K",
    },
    mini2: {
      name: "Áo khoác lửng",
      price: "649K",
      meta: "Phối cùng đầm",
      note: "Giữ form tốt",
    },
  },
};

/** ===== DEFAULTS (giống HeaderPro) ===== */
const DEFAULT_HERO_GREEN_PROPS: HeroGreenProps = {
  preview: false,
};

/** ===================== UI COMPONENT ===================== */
export const HeroGreen: React.FC<HeroGreenProps> = (props) => {
  const { className, preview = DEFAULT_HERO_GREEN_PROPS.preview } = props;

  // State cho chip danh mục
  const [activeChipIndex, setActiveChipIndex] = useState(0);

  // State cho caption gợi ý phối đồ
  const [lookbookIndex, setLookbookIndex] = useState(0);

  // State look hiện tại (tabs Đi làm / Cuối tuần / Hẹn hò)
  const [activeLook, setActiveLook] = useState<LookKey>("office");

  // State chế độ xem tối giản
  const [minimalMode, setMinimalMode] = useState(false);

  // State đếm số set bán hôm nay
  const [soldCount, setSoldCount] = useState(135);

  // Auto tăng số set bán
  useEffect(() => {
    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 4); // 0–3
      setSoldCount((prev) => prev + delta);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const currentLook = LOOKS[activeLook];

  const rootClassName = [styles.agHeader, className ?? ""].filter(Boolean).join(" ");

  /** ===== Handlers (có respect preview) ===== */
  const handleChipClick = (idx: number) => {
    if (preview) return;
    setActiveChipIndex(idx);
  };

  const handleLookbookClick = () => {
    if (preview) return;
    setLookbookIndex((prev) => (prev + 1) % LOOKBOOK_CAPTIONS.length);
  };

  const handleChangeLook = (look: LookKey) => {
    if (preview) return;
    setActiveLook(look);
  };

  const handleToggleMinimal = () => {
    if (preview) return;
    setMinimalMode((v) => !v);
  };

  /** =================== RENDER =================== */
  return (
    <header className={rootClassName}>
      <section className={styles.agHero}>
        {/* LEFT */}
        <div className={styles.agLeft}>
          <div>
            <div className={styles.agPillRow}>
              <div className={styles.agPillMain}>
                <span className={styles.dot}></span>
                <span>Bộ sưu tập Aurora Green – Thu 2025</span>
              </div>
              <div className={styles.agPillSub}>
                Thời trang bền vững &bull; Vải thân thiện môi trường &bull; Mặc nhẹ nhàng cả ngày
              </div>
            </div>

            <div className={styles.agTitle}>
              <h1>
                Tủ đồ <span className={styles.highlight}>xanh trendy</span> cho mọi ngày đi làm, café và dạo phố.
              </h1>
              <p>
                Mix &amp; match set đồ văn phòng, dạo phố, hẹn hò chỉ trong vài cú click. Gợi ý sẵn outfit, size dễ
                chọn, chất liệu mát – nhẹ – ít nhăn.
              </p>
            </div>

            <div className={styles.agCtaRow}>
              <button
                className={styles.agBtnPrimary}
                type="button"
                onClick={preview ? (e) => e.preventDefault() : undefined}
              >
                Mua ngay bộ sưu tập mới
                <i>➜</i>
              </button>
              <button className={styles.agBtnGhost} type="button" onClick={handleLookbookClick}>
                Xem gợi ý phối đồ
                <i>✨</i>
              </button>
            </div>

            <div className={styles.agMetaRow}>
              <div className={styles.agMetaItem}>
                <span className={styles.ico}>🚚</span>
                <span>Freeship đơn từ 499K</span>
              </div>
              <div className={styles.agMetaItem}>
                <span className={styles.ico}>↩</span>
                <span>Đổi trả trong 7 ngày</span>
              </div>
              <div className={styles.agMetaItem}>
                <span className={styles.ico}>♻</span>
                <span>Ưu tiên chất liệu thân thiện</span>
              </div>
            </div>
          </div>

          <div>
            {/* QUICK CHIPS */}
            <div className={styles.agQuickRow}>
              {QUICK_CHIPS.map((label, idx) => (
                <button
                  key={label}
                  type="button"
                  className={`${styles.agChip} ${idx === activeChipIndex ? styles.agChipActive : ""}`}
                  onClick={() => handleChipClick(idx)}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* PAYMENT ROW */}
            <div className={styles.agPaymentRow}>
              <div className={styles.agPaymentLabel}>
                <span className={styles.dot}></span>
                <span>Thanh toán an toàn với:</span>
              </div>
              <div className={styles.agPaymentLogos}>
                {/* Thay link ảnh thật theo hệ thống của bạn */}
                <img src="https://via.placeholder.com/64x32?text=VISA" alt="Visa" />
                <img src="https://via.placeholder.com/64x32?text=MC" alt="Mastercard" />
                <img src="https://via.placeholder.com/64x32?text=MoMo" alt="MoMo" />
                <img src="https://via.placeholder.com/64x32?text=ZaloPay" alt="ZaloPay" />
                <img src="https://via.placeholder.com/64x32?text=VNPay" alt="VNPay" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.agRight}>
          <div
            className={styles.agRightInner}
            style={
              minimalMode
                ? {
                    transition: "all 0.25s ease",
                    transform: "scale(0.97)",
                    background: "rgba(255,255,255,0.97)",
                  }
                : {
                    transition: "all 0.25s ease",
                    transform: "scale(1)",
                  }
            }
          >
            <div className={styles.agSpark}></div>

            <div className={styles.agCardTop}>
              <div>
                <h3>Bảng phối đồ Aurora hôm nay</h3>
                <small
                  dangerouslySetInnerHTML={{
                    __html: LOOKBOOK_CAPTIONS[lookbookIndex],
                  }}
                />
              </div>
              <span className={styles.badge}>Trending</span>
            </div>

            {/* TABS */}
            <div className={styles.agTabs}>
              <button
                type="button"
                className={`${styles.agTab} ${activeLook === "office" ? styles.agTabActive : ""}`}
                onClick={() => handleChangeLook("office")}
              >
                Đi làm
              </button>
              <button
                type="button"
                className={`${styles.agTab} ${activeLook === "weekend" ? styles.agTabActive : ""}`}
                onClick={() => handleChangeLook("weekend")}
              >
                Cuối tuần
              </button>
              <button
                type="button"
                className={`${styles.agTab} ${activeLook === "date" ? styles.agTabActive : ""}`}
                onClick={() => handleChangeLook("date")}
              >
                Hẹn hò
              </button>
            </div>

            {/* OUTFIT MAIN */}
            <div className={styles.agOutfitMain}>
              <span className={styles.agTagPill}>{currentLook.tag}</span>
              <div className={styles.agOutfitFigure}></div>

              <div className={styles.agMiniCards}>
                {/* MINI CARD 1 */}
                <div className={styles.agMiniCard}>
                  <div className={styles.agMiniName}>{currentLook.mini1.name}</div>
                  <div className={styles.agMiniLine}>
                    <span className={styles.agPrice}>{currentLook.mini1.price}</span>
                    <span className={styles.agSizeChip}>{currentLook.mini1.meta}</span>
                  </div>
                  <div className={styles.agTagSale}>
                    <span className={styles.dot}></span>
                    <span>{currentLook.mini1.note}</span>
                  </div>
                </div>

                {/* MINI CARD 2 */}
                <div className={styles.agMiniCard}>
                  <div className={styles.agMiniName}>{currentLook.mini2.name}</div>
                  <div className={styles.agMiniLine}>
                    <span className={styles.agPrice}>{currentLook.mini2.price}</span>
                    <span>{currentLook.mini2.meta}</span>
                  </div>
                  <div className={styles.agTagSale}>
                    <span className={styles.dot}></span>
                    <span>{currentLook.mini2.note}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CARD BOTTOM */}
            <div className={styles.agCardBottom}>
              <div className={styles.agSizesRow}>
                <strong>Size được chọn nhiều:</strong>
                <div className={styles.agSizePills}>
                  {currentLook.sizes.map((s) => (
                    <span key={s} className={styles.agSizePill}>
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.agRatingRow}>
                <div className={styles.agStars}>★★★★★</div>
                <span>{currentLook.rating}</span>
              </div>
            </div>

            {/* FOOTER MINI */}
            <div className={styles.agFooterMini}>
              <span className={styles.statusDot}>
                <i></i>
                <span>Đã có {soldCount} set được bán hôm nay</span>
              </span>
              <button type="button" onClick={handleToggleMinimal}>
                {minimalMode ? "Quay lại bảng đầy đủ" : "Chế độ xem tối giản"}
              </button>
            </div>
          </div>
        </div>

        {/* BOTTOM STRIP */}
        <div className={styles.agBottomStrip}>
          <div className={styles.agStripItem}>
            <strong>Ưu đãi hôm nay:</strong>
            <span>Giảm thêm 120K cho đơn outfit từ 1.200K.</span>
          </div>
          <div className={styles.agStripItem}>
            <div className={styles.agAvatarStack}>
              <span className={styles.avatar}></span>
              <span className={styles.avatar}></span>
              <span className={styles.avatar}></span>
            </div>
            <span>
              <strong>1.8K+</strong> khách đã mua trong 24h qua.
            </span>
          </div>
          <div className={styles.agStripItem}>
            <span>
              Giao nhanh nội thành chỉ từ <strong>2 giờ</strong>.
            </span>
          </div>
          <button className={styles.agStripCta} type="button" onClick={preview ? (e) => e.preventDefault() : undefined}>
            Xem tất cả ưu đãi áp dụng ➜
          </button>
        </div>
      </section>
    </header>
  );
};

/** ===== RegItem cho UI Builder (giống HeaderPro) ===== */
export const HERO_GREEN_REGITEM: RegItem = {
  kind: "HeroGreenKind",
  label: "Hero Aurora Green",
  defaults: DEFAULT_HERO_GREEN_PROPS,
  inspector: [], // có thể bổ sung schema cấu hình sau
  render: (p) => <HeroGreen {...(p as HeroGreenProps)} />,
};

export default HeroGreen;
