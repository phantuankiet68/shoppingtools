"use client";

import React, { useEffect, useMemo, useRef, useState, MouseEvent } from "react";
import styles from "@/styles/templates/ShopTemplate/hero/HeroOrange.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

type HeroOrangeTabKey = "flash" | "electronics" | "home" | "fashion";

type HeroOrangeDeal = {
  id: string;
  title: string;
  price: string;
  soldText: string;
  progressPercent: number;
  categories: HeroOrangeTabKey[];
};

const HERO_ORANGE_DEALS: HeroOrangeDeal[] = [
  {
    id: "deal-headphone",
    title: "Tai nghe Bluetooth màu cam",
    price: "159.000₫",
    soldText: "Đã bán 800+",
    progressPercent: 78,
    categories: ["flash", "electronics"],
  },
  {
    id: "deal-airfryer",
    title: "Nồi chiên không dầu Aurora",
    price: "990.000₫",
    soldText: "Đã bán 420",
    progressPercent: 64,
    categories: ["flash", "home"],
  },
  {
    id: "deal-hoodie",
    title: "Áo hoodie cam pastel 2025",
    price: "249.000₫",
    soldText: "Đã bán 1.2K",
    progressPercent: 92,
    categories: ["flash", "fashion"],
  },
  {
    id: "deal-mouse",
    title: "Chuột gaming cam RGB",
    price: "279.000₫",
    soldText: "Đã bán 310",
    progressPercent: 55,
    categories: ["electronics"],
  },
  {
    id: "deal-glass",
    title: "Bộ cốc thủy tinh cam",
    price: "189.000₫",
    soldText: "Đã bán 540",
    progressPercent: 70,
    categories: ["home"],
  },
  {
    id: "deal-tote",
    title: "Túi tote Aurora Orange",
    price: "129.000₫",
    soldText: "Đã bán 260",
    progressPercent: 48,
    categories: ["fashion"],
  },
];

export interface HeroOrangeProps {
  brandTitle?: string;
  brandSubtitle?: string;
  taglineText?: string;

  heading?: string;
  description?: string;

  pills?: { iconClass: string; text: string; hot?: boolean }[];

  metaRegions?: string[];
  metaViewersText?: string;

  mainDealBadge?: string;
  mainDealTitle?: string;
  mainDealDescription?: string;
  mainPriceNow?: string;
  mainPriceOld?: string;
  mainDiscountTag?: string;
  mainRatingText?: string;

  countdownEndHour?: number;
  countdownEndMinute?: number;
  countdownEndSecond?: number;

  sideCards?: {
    title: string;
    text: string;
    tag: string;
  }[];

  preview?: boolean;
}

const DEFAULT_HERO_ORANGE_PROPS: HeroOrangeProps = {
  brandTitle: "Aurora Orange",
  brandSubtitle: "Neo Flash Deals • 2025",
  taglineText: "Nền cam pastel & glow mềm giống topbar",
  heading: "Chạm nhẹ là săn ngay deal cam rực – mềm mắt, cháy giá 🔥",
  description:
    'Gom đồ điện tử, gia dụng & thời trang trong một khung tìm kiếm cam pastel. Mỗi lần gõ là một lần "bốc trúng" ưu đãi mới.',
  pills: [
    {
      iconClass: "bi bi-broadcast-pin",
      text: "Flash sale luân phiên mỗi 2 giờ",
      hot: true,
    },
    {
      iconClass: "bi bi-shield-check",
      text: "Hàng chính hãng 100%",
    },
    {
      iconClass: "bi bi-truck",
      text: "Freeship đơn từ 49K",
    },
    {
      iconClass: "bi bi-ticket-perforated",
      text: "Vouchers cam dành riêng cho bạn",
    },
  ],
  metaRegions: ["VN", "JP", "KR"],
  metaViewersText: "Hơn 12.340 khách đang xem Aurora Orange.",
  mainDealBadge: "Deal cam nổi bật hôm nay",
  mainDealTitle: "Combo gia dụng Neo Orange – sale sâu 52%",
  mainDealDescription: "Set nồi chiên, ấm siêu tốc & máy xay sinh tố màu cam pastel, phù hợp mọi góc bếp hiện đại.",
  mainPriceNow: "899.000₫",
  mainPriceOld: "1.899.000₫",
  mainDiscountTag: "-52%",
  mainRatingText: "4.9/5 • Đã bán 3.2K",
  countdownEndHour: 23,
  countdownEndMinute: 59,
  countdownEndSecond: 59,
  sideCards: [
    {
      title: "Voucher 100K cam",
      text: "Dùng được cho đơn từ 499K mọi ngành hàng.",
      tag: "Nhập: ORANGE100",
    },
    {
      title: "Freeship 0Đ khu vực ưu tiên",
      text: "Áp dụng cho khung giờ 20:00–22:00 hôm nay.",
      tag: "Ưu tiên Aurora",
    },
  ],
  preview: false,
};

export const HeroOrange: React.FC<HeroOrangeProps> = (props) => {
  const {
    brandTitle = DEFAULT_HERO_ORANGE_PROPS.brandTitle!,
    brandSubtitle = DEFAULT_HERO_ORANGE_PROPS.brandSubtitle!,
    taglineText = DEFAULT_HERO_ORANGE_PROPS.taglineText!,
    heading = DEFAULT_HERO_ORANGE_PROPS.heading!,
    description = DEFAULT_HERO_ORANGE_PROPS.description!,
    pills = DEFAULT_HERO_ORANGE_PROPS.pills!,
    metaRegions = DEFAULT_HERO_ORANGE_PROPS.metaRegions!,
    metaViewersText = DEFAULT_HERO_ORANGE_PROPS.metaViewersText!,
    mainDealBadge = DEFAULT_HERO_ORANGE_PROPS.mainDealBadge!,
    mainDealTitle = DEFAULT_HERO_ORANGE_PROPS.mainDealTitle!,
    mainDealDescription = DEFAULT_HERO_ORANGE_PROPS.mainDealDescription!,
    mainPriceNow = DEFAULT_HERO_ORANGE_PROPS.mainPriceNow!,
    mainPriceOld = DEFAULT_HERO_ORANGE_PROPS.mainPriceOld!,
    mainDiscountTag = DEFAULT_HERO_ORANGE_PROPS.mainDiscountTag!,
    mainRatingText = DEFAULT_HERO_ORANGE_PROPS.mainRatingText!,
    countdownEndHour,
    countdownEndMinute,
    countdownEndSecond,
    sideCards = DEFAULT_HERO_ORANGE_PROPS.sideCards!,
    preview = DEFAULT_HERO_ORANGE_PROPS.preview!,
  } = props;

  // ✅ đảm bảo 3 biến này luôn là number (không còn | undefined)
  const endHour: number = countdownEndHour ?? DEFAULT_HERO_ORANGE_PROPS.countdownEndHour!;
  const endMinute: number = countdownEndMinute ?? DEFAULT_HERO_ORANGE_PROPS.countdownEndMinute!;
  const endSecond: number = countdownEndSecond ?? DEFAULT_HERO_ORANGE_PROPS.countdownEndSecond!;

  /** ===== Countdown ===== */
  const [countdownText, setCountdownText] = useState<string>("--:--:--");

  useEffect(() => {
    const updateCountdown = () => {
      const now = new Date();
      const end = new Date();
      end.setHours(endHour, endMinute, endSecond, 999);

      const diff = end.getTime() - now.getTime();
      if (diff <= 0) {
        setCountdownText("00:00:00");
        return;
      }

      const h = String(Math.floor(diff / (1000 * 60 * 60))).padStart(2, "0");
      const m = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, "0");
      const s = String(Math.floor((diff / 1000) % 60)).padStart(2, "0");
      setCountdownText(`${h}:${m}:${s}`);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);
    return () => clearInterval(timer);
  }, [endHour, endMinute, endSecond]);

  /** ===== Deals tabs + slider ===== */
  const [activeTab, setActiveTab] = useState<HeroOrangeTabKey>("flash");
  const [sliderIndex, setSliderIndex] = useState(0);
  const [cardWidth, setCardWidth] = useState(190);
  const firstCardRef = useRef<HTMLDivElement | null>(null);

  const filteredDeals = useMemo(
    () =>
      HERO_ORANGE_DEALS.filter((deal) =>
        activeTab === "flash" ? deal.categories.includes("flash") : deal.categories.includes(activeTab),
      ),
    [activeTab],
  );

  const visibleCount = 3;
  const maxIndex = Math.max(0, filteredDeals.length - visibleCount);

  useEffect(() => {
    const measure = () => {
      if (firstCardRef.current) {
        const w = firstCardRef.current.offsetWidth;
        setCardWidth(w + 10);
      }
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  useEffect(() => {
    setSliderIndex(0);
  }, [activeTab]);

  useEffect(() => {
    if (!filteredDeals.length) return;
    const timer = setInterval(() => {
      setSliderIndex((prev) => {
        if (prev >= maxIndex) return 0;
        return prev + 1;
      });
    }, 5000);
    return () => clearInterval(timer);
  }, [filteredDeals.length, maxIndex]);

  const handleTabClick = (key: HeroOrangeTabKey) => (e: MouseEvent<HTMLButtonElement>) => {
    if (preview) {
      e.preventDefault();
      return;
    }
    setActiveTab(key);
  };

  const handlePrevClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (preview) {
      e.preventDefault();
      return;
    }
    if (!filteredDeals.length) return;
    setSliderIndex((prev) => {
      if (prev <= 0) return maxIndex;
      return prev - 1;
    });
  };

  const handleNextClick = (e: MouseEvent<HTMLButtonElement>) => {
    if (preview) {
      e.preventDefault();
      return;
    }
    if (!filteredDeals.length) return;
    setSliderIndex((prev) => {
      if (prev >= maxIndex) return 0;
      return prev + 1;
    });
  };

  const trackTransformStyle = {
    transform: `translateX(-${sliderIndex * cardWidth}px)`,
  };

  return (
    <section className={styles.heroAurora}>
      <div className={styles.heroInner}>
        {/* LEFT */}
        <div className={styles.heroLeft}>
          <div className={styles.heroLeftHead}>
            <div className={styles.heroBadgeLogo}>
              <i className="bi bi-lightning-fill" />
            </div>
            <div className={styles.heroTitleWrap}>
              <div className={styles.heroTitle}>{brandTitle}</div>
              <div className={styles.heroSubtitle}>{brandSubtitle}</div>
              <div className={styles.heroTagline}>
                <i className="bi bi-sparkles" />
                {taglineText}
              </div>
            </div>
          </div>

          <div className={styles.heroHeadingBlock}>
            <h1>{heading}</h1>
            <p>{description}</p>
          </div>

          <div className={styles.heroBadgesRow}>
            {pills?.map((pill) => (
              <div key={pill.text} className={`${styles.pill} ${pill.hot ? styles.pillHot : ""}`}>
                <i className={pill.iconClass} />
                {pill.text}
              </div>
            ))}
          </div>

          <div className={styles.heroMeta}>
            <div className={styles.heroAvatars}>
              {metaRegions?.map((r) => (
                <span key={r}>{r}</span>
              ))}
            </div>
            <div>{metaViewersText}</div>
          </div>
        </div>

        {/* RIGHT */}
        <div className={styles.heroRight}>
          <div className={styles.heroCardMain}>
            <div className={styles.heroCardMainLeft}>
              <span>
                <i className="bi bi-fire" />
                {mainDealBadge}
              </span>
              <h2>{mainDealTitle}</h2>
              <p>{mainDealDescription}</p>

              <div className={styles.heroCardMainFooter}>
                <div className={styles.priceBlock}>
                  <div className={styles.priceNow}>{mainPriceNow}</div>
                  <div className={styles.priceOld}>{mainPriceOld}</div>
                </div>
                <div className={styles.tagPercent}>{mainDiscountTag}</div>
                <div className={styles.countdown}>
                  <i className="bi bi-alarm" />
                  Còn <span>{countdownText}</span>
                </div>
              </div>
            </div>

            <div className={styles.heroCardMainRight}>
              <div className={styles.productBlob}>
                <img src="https://placehold.co/260x260/png?text=Neo+Orange" alt="Neo Orange Set" />
              </div>
              <div className={styles.heroMiniTag}>
                <i className="bi bi-star-fill" style={{ color: "#f97316" }} />
                {mainRatingText}
              </div>
            </div>
          </div>

          <div className={styles.heroSideCards}>
            {sideCards?.map((card) => (
              <div key={card.title} className={styles.sideCard}>
                <strong>{card.title}</strong>
                <span>{card.text}</span>
                <div className={styles.sideCardTag}>{card.tag}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STRIP DEALS */}
      <div className={styles.heroDealsStrip}>
        <div className={styles.heroTabs}>
          <button
            type="button"
            className={`${styles.heroTabBtn} ${activeTab === "flash" ? styles.heroTabBtnActive : ""}`}
            onClick={handleTabClick("flash")}
          >
            Flash sale hôm nay
          </button>
          <button
            type="button"
            className={`${styles.heroTabBtn} ${activeTab === "electronics" ? styles.heroTabBtnActive : ""}`}
            onClick={handleTabClick("electronics")}
          >
            Điện tử
          </button>
          <button
            type="button"
            className={`${styles.heroTabBtn} ${activeTab === "home" ? styles.heroTabBtnActive : ""}`}
            onClick={handleTabClick("home")}
          >
            Nhà cửa
          </button>
          <button
            type="button"
            className={`${styles.heroTabBtn} ${activeTab === "fashion" ? styles.heroTabBtnActive : ""}`}
            onClick={handleTabClick("fashion")}
          >
            Thời trang
          </button>
        </div>

        <div className={styles.dealsRail}>
          <div className={styles.dealsTrack} style={trackTransformStyle}>
            {filteredDeals.map((deal, idx) => (
              <article key={deal.id} className={styles.dealCard} ref={idx === 0 ? firstCardRef : undefined}>
                <div className={styles.dealCardTitle}>{deal.title}</div>
                <div className={styles.dealCardProgress}>
                  <span style={{ width: `${deal.progressPercent}%` }} />
                </div>
                <div className={styles.dealCardFooter}>
                  <div className={styles.dealCardPrice}>{deal.price}</div>
                  <span className={styles.dealCardSold}>{deal.soldText}</span>
                </div>
              </article>
            ))}
          </div>

          {filteredDeals.length > 0 && (
            <>
              <button
                type="button"
                className={`${styles.dealsArrow} ${styles.dealsArrowLeft}`}
                onClick={handlePrevClick}
              >
                <i className="bi bi-chevron-left" />
              </button>
              <button
                type="button"
                className={`${styles.dealsArrow} ${styles.dealsArrowRight}`}
                onClick={handleNextClick}
              >
                <i className="bi bi-chevron-right" />
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export const HERO_ORANGE_REGITEM: RegItem = {
  kind: "HeroOrangeKind",
  label: "Hero Orange",
  defaults: DEFAULT_HERO_ORANGE_PROPS,
  inspector: [],
  render: (p) => <HeroOrange {...(p as HeroOrangeProps)} />,
};

export default HeroOrange;
