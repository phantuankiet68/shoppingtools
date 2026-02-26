"use client";

import React, { useState } from "react";
import styles from "@/components/admin/templates/ShopTemplate/styles/hero/HeroDark.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ========== TYPES & DEFAULTS ========== */

export interface HeroDarkProps {
  preview?: boolean;
}

export const DEFAULT_HERO_DARK_PROPS: HeroDarkProps = {
  preview: false,
};

/* ========== SCENARIO DATA ========== */

type ScenarioId = "office" | "street" | "party" | "active";

interface Scenario {
  id: ScenarioId;
  iconClass: string;
  label: string;
  title: React.ReactNode;
  sub: string;
  lookTag: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: "office",
    iconClass: "bi-briefcase",
    label: "Lookbook công sở",
    title: (
      <>
        <span className={styles.highlight}>Lookbook công sở</span> – thanh lịch nhưng vẫn rất chill.
      </>
    ),
    sub: "Áo sơ mi pastel, quần vải ống suông, blazer oversize – đủ để bạn đi làm, đi họp và đi hẹn hò sau giờ làm.",
    lookTag: "Công sở pastel · 9–5 mood",
  },
  {
    id: "street",
    iconClass: "bi-lightning-fill",
    label: "Streetwear cuối tuần",
    title: (
      <>
        <span className={styles.highlight}>Streetwear cuối tuần</span> – năng lượng cho mọi cuộc hẹn.
      </>
    ),
    sub: "Áo phông graphic, quần cargo, sneaker trắng – combo chuẩn để đi cafe, xem phim và tụ tập bạn bè.",
    lookTag: "Streetwear & sneaker",
  },
  {
    id: "party",
    iconClass: "bi-stars",
    label: "Đầm tiệc & hẹn hò",
    title: (
      <>
        <span className={styles.highlight}>Đầm tiệc &amp; hẹn hò</span> – đủ nổi bật mà không quá gắt.
      </>
    ),
    sub: "Đầm satin, slip dress và blazer khoác ngoài – phối sẵn màu để bạn chỉ cần chọn size.",
    lookTag: "Date night · satin dress",
  },
  {
    id: "active",
    iconClass: "bi-activity",
    label: "Active & athleisure",
    title: (
      <>
        <span className={styles.highlight}>Active &amp; athleisure</span> – mặc đẹp cả khi tập.
      </>
    ),
    sub: "Legging ôm vừa, bra top tôn dáng, khoác gió nhẹ – vừa chạy bộ, vừa đi siêu thị vẫn hợp.",
    lookTag: "Athleisure · gym to street",
  },
];

/* ========== COMPONENT ========== */

export const HeroDark: React.FC<HeroDarkProps> = ({ preview }) => {
  const [activeScenarioId, setActiveScenarioId] = useState<ScenarioId>("office");

  const activeScenario = SCENARIOS.find((s) => s.id === activeScenarioId) ?? SCENARIOS[0];

  const handleScenarioClick = (id: ScenarioId) => {
    if (preview) return;
    setActiveScenarioId(id);
  };

  return (
    <section className={styles.heroAurora}>
      {/* LEFT */}
      <article className={styles.heroLeft}>
        <div className={styles.heroBadgeRow}>
          <div className={styles.heroBadge}>
            <span className={`${styles.tag} ${styles.tagBlue}`}>NEW DROP</span>
            Bộ sưu tập pastel 04.2025
          </div>
          <div className={styles.heroBadge}>
            <span className={`${styles.tag} ${styles.tagNew}`}>FREESHIP</span>
            Đơn từ 499K tại HN · HCM
          </div>
          <div className={styles.heroBadge}>
            <span className={`${styles.tag} ${styles.tagBlue}`}>TRY AT HOME</span>
            Đổi trả trong 7 ngày
          </div>
        </div>

        <h1 className={styles.heroTitle}>{activeScenario.title}</h1>

        <p className={styles.heroSub}>{activeScenario.sub}</p>

        <div className={styles.heroCtaRow}>
          <button
            type="button"
            className={styles.heroCtaPrimary}
            onClick={(e) => {
              if (preview) e.preventDefault();
            }}>
            Mở lookbook hôm nay
            <span className={styles.heroCtaPrimaryBadge}>Gợi ý outfit theo thời tiết</span>
          </button>
          <button
            type="button"
            className={styles.heroCtaGhost}
            onClick={(e) => {
              if (preview) e.preventDefault();
            }}>
            <i className="bi bi-play-circle-fill" />
            Xem cách phối đồ nhanh
          </button>
        </div>

        <div className={styles.heroScenarios}>
          {SCENARIOS.map((scenario) => (
            <button
              key={scenario.id}
              type="button"
              className={`${styles.scenarioChip} ${scenario.id === activeScenarioId ? styles.scenarioChipActive : ""}`}
              onClick={() => handleScenarioClick(scenario.id)}>
              <i className={`bi ${scenario.iconClass}`} />
              {scenario.label}
            </button>
          ))}
        </div>

        <div className={styles.heroMetrics}>
          <div className={styles.heroMetricPill}>
            <span className={`${styles.metricDot} ${styles.metricDotGreen}`} />
            <span>+32% khách quay lại tuần này</span>
          </div>
          <div className={styles.heroMetricPill}>
            <span className={`${styles.metricDot} ${styles.metricDotOrange}`} />
            <span>Thời gian xem lookbook trung bình 4.2 phút</span>
          </div>
          <div className={styles.heroMetricPill}>
            <span className={`${styles.metricDot} ${styles.metricDotCyan}`} />
            <span>Mix &amp; match tự động theo size</span>
          </div>
        </div>
      </article>

      {/* RIGHT */}
      <aside className={styles.heroRight}>
        <div className={styles.lookbookCard}>
          <div className={styles.lookbookHeader}>
            <div>
              <div className={styles.lookbookTitle}>Aurora Daily Look</div>
              <div className={styles.lookbookTagText}>{activeScenario.lookTag}</div>
            </div>
            <div className={styles.lookbookTag}>
              <i className="bi bi-sun" />
              <span>Hôm nay · 24–30°C</span>
            </div>
          </div>

          <div className={styles.lookbookMain}>
            <div className={styles.lookPhoto}>
              <div className={styles.lookPhotoInner} />
              <div className={styles.lookPhotoFloating}>
                <span className={styles.lookFloatingLabel}>SET CHỈ TỪ</span>
                <strong className={styles.lookFloatingPrice}>599K</strong>
                <span className={styles.lookFloatingSub}>3 items</span>
              </div>
            </div>

            <div className={styles.lookInfo}>
              <div className={styles.lookInfoTitle}>Set 3 món: sơ mi pastel, quần suông, túi mini.</div>
              <p className={styles.lookInfoDesc}>Combo đã mix sẵn theo màu &amp; dáng, phù hợp với hầu hết dáng người. Chỉ cần chọn size, không phải suy nghĩ phối đồ.</p>
              <div className={styles.lookSizes}>
                <span className={`${styles.sizePill} ${styles.sizePillMain}`}>Size M</span>
                <span className={styles.sizePill}>Size S</span>
                <span className={styles.sizePill}>Size L</span>
                <span className={styles.sizePill}>Size XL</span>
              </div>
              <div className={styles.lookUsers}>
                <div className={styles.avatarStack}>
                  <span>H</span>
                  <span>T</span>
                  <span>Y</span>
                </div>
                <div className={styles.lookUsersText}>
                  Hơn <strong>1.2K khách</strong> đã thêm set tương tự vào giỏ trong 7 ngày qua.
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.heroRightBottom}>
          <div className={styles.miniCard}>
            <div className={styles.miniLabel}>Vận chuyển</div>
            <div className={styles.miniValue}>Giao nhanh 2h</div>
            <div className={styles.miniTrend}>
              <i className="bi bi-truck" />
              <span>Áp dụng tại nội thành</span>
            </div>
            <div className={styles.miniExtra}>Đơn sau 20h sẽ giao trong buổi sáng hôm sau.</div>
          </div>
          <div className={styles.miniCard}>
            <div className={styles.miniLabel}>Thử &amp; đổi</div>
            <div className={styles.miniValue}>Đổi size miễn phí</div>
            <div className={`${styles.miniTrend} ${styles.miniTrendCyan}`}>
              <i className="bi bi-arrow-repeat" />
              <span>Trong 7 ngày</span>
            </div>
            <div className={styles.miniExtra}>Giữ tem &amp; hóa đơn, đổi nhanh trong app hoặc tại cửa hàng.</div>
          </div>
        </div>
      </aside>
    </section>
  );
};

/* ========== REGITEM ========== */

export const HERO_DARK_REGITEM: RegItem = {
  kind: "HeroDark",
  label: "Hero Dark",
  defaults: DEFAULT_HERO_DARK_PROPS,
  inspector: [],
  render: (p) => <HeroDark {...(p as HeroDarkProps)} />,
};

export default HeroDark;
