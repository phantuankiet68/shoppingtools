"use client";

import React, { useEffect, useRef, useState } from "react";
import styles from "@/components/admin/shared/templates/ShopTemplate/styles/hero/HeroWear.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ========== TYPES & DEFAULTS ========== */

export interface HeroWearProps {
  /** Preview mode trong UI Builder: disable animation/click thực tế nếu cần */
  preview?: boolean;
}

export const DEFAULT_HERO_WEAR_PROPS: HeroWearProps = {
  preview: false,
};

/* ========== COUNTER COMPONENT ========== */

interface CounterProps {
  value: number;
  inView: boolean;
  duration?: number;
  decimals?: number;
}

const Counter: React.FC<CounterProps> = ({ value, inView, duration = 1100, decimals = 0 }) => {
  const [display, setDisplay] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;
    startRef.current = null;

    const animate = (timestamp: number) => {
      if (startRef.current === null) startRef.current = timestamp;
      const elapsed = timestamp - startRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      const current = value * eased;
      const formatted = decimals > 0 ? parseFloat(current.toFixed(decimals)) : Math.round(current);

      setDisplay(formatted);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    const frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value, inView, duration, decimals]);

  return <>{display}</>;
};

/* ========== DATA ========== */

type TabKey = "outfits" | "traffic" | "perf";

interface TopMetric {
  label: string;
  value: number;
  valueSub: string;
  description: string;
  decimals?: number;
}

const TOP_METRICS: TopMetric[] = [
  {
    label: "Outfit hôm nay",
    value: 256,
    valueSub: "+24%",
    description: "Đơn set đồ bán ra trong ngày",
  },
  {
    label: "Thêm vào giỏ",
    value: 4032,
    valueSub: "lượt/ngày",
    description: "Từ banner, menu và search trên header",
  },
];

interface StatMetric {
  label: string;
  value: number;
  suffix: string;
  progress: number; // 0–100
  decimals?: number;
}

const PANEL_STATS: Record<TabKey, StatMetric[]> = {
  outfits: [
    {
      label: "Set đồ bán chạy",
      value: 83,
      suffix: "set/giờ",
      progress: 78,
    },
    {
      label: "Tỉ lệ thêm vào giỏ",
      value: 72,
      suffix: "%",
      progress: 72,
    },
    {
      label: "Combo áo + quần",
      value: 37,
      suffix: "% tổng đơn",
      progress: 64,
    },
    {
      label: "Đổi size thành công",
      value: 96,
      suffix: "% không phát sinh hoàn",
      progress: 88,
    },
  ],
  traffic: [
    {
      label: "Lượt xem lookbook",
      value: 1540,
      suffix: "lượt/giờ",
      progress: 85,
    },
    {
      label: "Khách quay lại",
      value: 62,
      suffix: "%/ngày",
      progress: 70,
    },
    {
      label: "Traffic từ banner header",
      value: 47,
      suffix: "% tổng",
      progress: 52,
    },
    {
      label: "Tỉ lệ rời trang",
      value: 9,
      suffix: "%",
      progress: 30,
    },
  ],
  perf: [
    {
      label: "TTFB trang chủ",
      value: 230,
      suffix: "ms",
      progress: 80,
    },
    {
      label: "LCP banner hero",
      value: 1.9,
      suffix: "s",
      progress: 76,
      decimals: 1,
    },
    {
      label: "CLS",
      value: 0.03,
      suffix: "score",
      progress: 30,
      decimals: 2,
    },
    {
      label: "Ảnh sản phẩm được nén",
      value: 92,
      suffix: "% bộ sưu tập",
      progress: 88,
    },
  ],
};

/* ========== COMPONENT ========== */

export const HeroWear: React.FC<HeroWearProps> = ({ preview }) => {
  const heroRef = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("outfits");

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
          }
        });
      },
      { threshold: 0.3 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleTabClick = (key: TabKey) => {
    if (preview) return;
    setActiveTab(key);
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.shell}>
        <section ref={heroRef} className={styles.heroAurora}>
          {/* LEFT */}
          <div>
            <div className={styles.heroLabelRow}>
              <div className={`${styles.pill} ${styles.pillPrimary}`}>
                <i className={styles.pillIcon} />
                <span>Aurora Blue Fashion</span>
              </div>
              <div className={`${styles.pill} ${styles.pillSoft}`}>E-Commerce • 2025 • Outfit</div>
            </div>

            <h1 className={styles.heroTitle}>
              Thổi làn gió mới cho <span>cửa hàng thời trang</span> của bạn
            </h1>

            <p className={styles.heroSub}>
              Thiết kế hero &amp; header thời trang đa layout, gợi ý outfit theo xu hướng, tối ưu trải nghiệm tìm kiếm,
              giỏ hàng và Flash Sale ngay ở phần đầu trang – nơi khách chạm vào thương hiệu đầu tiên.
            </p>

            <div className={styles.heroCtas}>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnPrimary}`}
                onClick={(e) => {
                  if (preview) e.preventDefault();
                }}
              >
                <span className={styles.iconDot} />
                Xem bộ sưu tập Aurora Blue
              </button>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnSecondary}`}
                onClick={(e) => {
                  if (preview) e.preventDefault();
                }}
              >
                Khám phá template header thời trang
                <span>⟶</span>
              </button>
            </div>

            <div className={styles.heroTags}>
              <div className={styles.tagPill}>
                <span className={styles.dot} />
                Free ship đơn từ 499K toàn quốc
              </div>
              <div className={`${styles.tagPill} ${styles.tagPillBadge}`}>
                <small>New in</small>
                <span>Lookbook Xuân &amp; Hè 2025</span>
              </div>
              <div className={`${styles.tagPill} ${styles.tagPillBadge}`}>
                <small>Stylist</small>
                Gợi ý outfit tự động cho từng dáng người
              </div>
            </div>

            <div className={styles.heroMetrics}>
              {TOP_METRICS.map((m, idx) => (
                <div key={idx} className={styles.metricCard}>
                  <div className={styles.metricLabel}>{m.label}</div>
                  <div className={styles.metricValue}>
                    <span>
                      <Counter key={`${idx}-${inView}`} value={m.value} inView={inView} decimals={m.decimals ?? 0} />
                    </span>
                    <span className={styles.metricSubValue}>{m.valueSub}</span>
                  </div>
                  <div className={styles.metricSub}>{m.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT */}
          <div className={styles.heroPreview}>
            <div className={styles.previewCard}>
              <div className={styles.previewHeader}>
                <div className={styles.previewTitle}>
                  <span className={styles.previewIcon} />
                  <div>
                    <strong>Aurora Wear Studio</strong>
                    <div>
                      <small>Bảng điều khiển outfit • Live</small>
                    </div>
                  </div>
                </div>
                <div className={styles.previewActions}>
                  <div className={`${styles.chip} ${styles.chipLive}`}>
                    <span className={styles.chipDot} />
                    LIVE SALE
                  </div>
                  <div className={styles.chip}>COLLECTION 2025</div>
                </div>
              </div>

              {/* Tabs */}
              <div className={styles.previewTabs}>
                <button
                  type="button"
                  className={`${styles.previewTab} ${activeTab === "outfits" ? styles.previewTabActive : ""}`}
                  onClick={() => handleTabClick("outfits")}
                >
                  Outfit hot
                </button>
                <button
                  type="button"
                  className={`${styles.previewTab} ${activeTab === "traffic" ? styles.previewTabActive : ""}`}
                  onClick={() => handleTabClick("traffic")}
                >
                  Lượt xem
                </button>
                <button
                  type="button"
                  className={`${styles.previewTab} ${activeTab === "perf" ? styles.previewTabActive : ""}`}
                  onClick={() => handleTabClick("perf")}
                >
                  Hiệu suất shop
                </button>
              </div>

              {/* Panel stats */}
              <div className={styles.previewGrid}>
                {PANEL_STATS[activeTab].map((s, idx) => (
                  <div key={`${activeTab}-${idx}`} className={styles.previewStat}>
                    <div className={styles.previewStatLabel}>{s.label}</div>
                    <div className={styles.previewStatValue}>
                      <span>
                        <Counter
                          value={s.value}
                          inView={inView}
                          decimals={s.decimals ?? 0}
                          key={`${activeTab}-${idx}-${inView}`}
                        />
                      </span>
                      <span className={styles.previewStatSub}>{s.suffix}</span>
                    </div>
                    <div className={styles.previewProgress}>
                      <div className={styles.previewProgressInner} style={{ width: `${s.progress}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className={styles.previewFooter}>
                <div className={styles.previewFooterLeft}>
                  <span>
                    Đang theo dõi: <strong>3 bộ sưu tập • 128 mẫu</strong>
                  </span>
                  <span>Header, banner và menu đều được tối ưu cho desktop &amp; mobile.</span>
                </div>
                <div className={styles.previewFooterUptime}>
                  <span className={styles.dot} />
                  <span>Shop uptime</span>
                  <b>99.97%</b>
                </div>
              </div>
            </div>

            {/* Floating chips */}
            <div className={`${styles.floatingChip} ${styles.floatingChipPerf}`}>
              <span className={styles.dot} />
              PERF • tải &lt; 0.8s
            </div>
            <div className={`${styles.floatingChip} ${styles.floatingChipNew}`}>
              <span className={styles.dot} />
              NEW • Aurora Blue Outfit
            </div>
            <div className={`${styles.floatingChip} ${styles.floatingChipSeller}`}>
              <span className={styles.dot} />
              Bestseller • Denim &amp; Dress
            </div>
          </div>
        </section>
      </div>
    </section>
  );
};

/* ========== REGITEM CHO UI BUILDER ========== */

export const HERO_WEAR_REGITEM: RegItem = {
  kind: "HeroWear",
  label: "Hero Wear",
  defaults: DEFAULT_HERO_WEAR_PROPS,
  inspector: [],
  render: (p) => <HeroWear {...(p as HeroWearProps)} />,
};

export default HeroWear;
