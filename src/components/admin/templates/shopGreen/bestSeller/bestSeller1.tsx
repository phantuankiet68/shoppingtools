"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/template/shopGreen/bestSeller/bestSeller1.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type BestSellerItem = {
  id: string;
  name: string;
  imageSrc: string;
  imageAlt?: string;
  href?: string;

  price: string; // "125,000₫"
  tag?: string; // "-20%" | "HOT"
  category?: string; // "Skincare"

  rating?: number; // 4.8
  ratingCount?: number; // 128
};

export type BestSeller1Props = {
  title?: string;
  badgeText?: string;
  moreLabel?: string;
  moreHref?: string;

  /** runtime direct items */
  items?: BestSellerItem[];

  /** builder JSON string */
  itemsJson?: string;

  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_ITEMS: BestSellerItem[] = [
  {
    id: "bs-1",
    name: "Hydrating Cleanser",
    imageSrc: "/images/product.jpg",
    price: "125,000₫",
    tag: "-20%",
    category: "Skincare",
    rating: 4.8,
    ratingCount: 128,
    href: "/product/hydrating-cleanser",
  },
  {
    id: "bs-2",
    name: "Vitamin C Serum",
    imageSrc: "/images/product.jpg",
    price: "219,000₫",
    tag: "HOT",
    category: "Serum",
    rating: 4.7,
    ratingCount: 96,
    href: "/product/vitamin-c-serum",
  },
  {
    id: "bs-3",
    name: "Daily Sunscreen SPF50+",
    imageSrc: "/images/product.jpg",
    price: "189,000₫",
    tag: "-40%",
    category: "Sunscreen",
    rating: 4.9,
    ratingCount: 212,
    href: "/product/daily-sunscreen-spf50",
  },
  {
    id: "bs-4",
    name: "Barrier Moisturizer",
    imageSrc: "/images/product.jpg",
    price: "175,000₫",
    category: "Moisturizer",
    rating: 4.6,
    ratingCount: 74,
    href: "/product/barrier-moisturizer",
  },
  {
    id: "bs-5",
    name: "Gentle Toner",
    imageSrc: "/images/product.jpg",
    price: "149,000₫",
    category: "Skincare",
    rating: 4.5,
    ratingCount: 51,
    href: "/product/gentle-toner",
  },
];

/* ================= Helpers ================= */
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseItems(raw?: string): BestSellerItem[] | undefined {
  if (!raw) return undefined;
  try {
    const val = JSON.parse(raw);
    if (!Array.isArray(val)) return undefined;

    const cleaned: BestSellerItem[] = [];
    for (const it of val) {
      if (!it) continue;
      const id = String(it.id ?? "");
      const name = String(it.name ?? "");
      const imageSrc = String(it.imageSrc ?? "");
      const price = String(it.price ?? "");

      if (!id || !name || !imageSrc || !price) continue;

      cleaned.push({
        id,
        name,
        imageSrc,
        price,
        imageAlt: it.imageAlt ? String(it.imageAlt) : undefined,
        href: it.href ? String(it.href) : undefined,
        tag: it.tag ? String(it.tag) : undefined,
        category: it.category ? String(it.category) : undefined,
        rating: typeof it.rating === "number" ? it.rating : undefined,
        ratingCount: typeof it.ratingCount === "number" ? it.ratingCount : undefined,
      });
    }

    return cleaned.length ? cleaned : undefined;
  } catch {
    return undefined;
  }
}

function safeJson<T>(raw?: string): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

/* ================= Component ================= */
export function BestSeller1({ title = "Best-Selling Products", badgeText = "Hot", moreLabel = "View More", moreHref = "/best-sellers", items, itemsJson, preview = false }: BestSeller1Props) {
  const resolvedItems = useMemo(() => {
    // ưu tiên runtime items, sau đó itemsJson, cuối cùng fallback DEFAULT
    return items ?? parseItems(itemsJson) ?? DEFAULT_ITEMS;
  }, [items, itemsJson]);

  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const indexRef = useRef(0);
  const stepRef = useRef(0);
  const maxRef = useRef(0);

  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const block = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const applyIndex = useCallback((nextIndex: number) => {
    const track = trackRef.current;
    if (!track) return;

    const step = stepRef.current || 0;
    const max = maxRef.current || 0;

    indexRef.current = clamp(nextIndex, 0, max);
    track.style.transform = `translateX(-${indexRef.current * step}px)`;

    setCanPrev(indexRef.current > 0);
    setCanNext(indexRef.current < max);
  }, []);

  const compute = useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const first = track.querySelector<HTMLElement>(`.${cls.bsItem}`);
    const gap = parseFloat(getComputedStyle(track).gap || "0") || 0;

    if (!first) {
      stepRef.current = 0;
      maxRef.current = 0;
      indexRef.current = 0;
      setCanPrev(false);
      setCanNext(false);
      return;
    }

    const itemW = first.getBoundingClientRect().width;
    const step = itemW + gap;
    stepRef.current = step;

    const vw = viewport.getBoundingClientRect().width;

    // tính visible ổn định hơn khi có gap
    const visible = Math.max(1, Math.floor((vw + gap) / step));
    const max = Math.max(0, resolvedItems.length - visible);
    maxRef.current = max;

    applyIndex(indexRef.current);
  }, [applyIndex, resolvedItems.length]);

  const prev = useCallback(() => applyIndex(indexRef.current - 1), [applyIndex]);
  const next = useCallback(() => applyIndex(indexRef.current + 1), [applyIndex]);

  // Init + observe resize (nhẹ hơn window resize)
  useEffect(() => {
    compute();

    const viewport = viewportRef.current;
    if (!viewport) return;

    let ro: ResizeObserver | null = null;

    if (typeof ResizeObserver !== "undefined") {
      ro = new ResizeObserver(() => compute());
      ro.observe(viewport);
    } else {
      const onResize = () => compute();
      window.addEventListener("resize", onResize);
      return () => window.removeEventListener("resize", onResize);
    }

    return () => {
      ro?.disconnect();
    };
  }, [compute]);

  // Drag/swipe (pointer) - chỉ chạy khi không preview
  useEffect(() => {
    if (preview) return;

    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    let dragging = false;
    let startX = 0;
    let startTranslate = 0;

    let raf: number | null = null;
    let nextTranslate = 0;

    const getTranslateX = () => {
      const t = getComputedStyle(track).transform;
      if (!t || t === "none") return 0;
      const m = new DOMMatrixReadOnly(t);
      return m.m41;
    };

    const clampTranslate = (tx: number) => {
      const step = stepRef.current || 0;
      const max = maxRef.current || 0;
      const minTx = -max * step;
      const maxTx = 0;
      return clamp(tx, minTx, maxTx);
    };

    const setTranslate = (tx: number) => {
      track.style.transform = `translateX(${tx}px)`;
    };

    const onDown = (e: PointerEvent) => {
      // chặn right-click/middle-click (touch thường vẫn là 0)
      if (e.button !== 0) return;

      dragging = true;
      startX = e.clientX;
      startTranslate = getTranslateX();
      nextTranslate = startTranslate;

      try {
        viewport.setPointerCapture(e.pointerId);
      } catch {
        // ignore
      }

      viewport.style.cursor = "grabbing";
      track.style.transition = "none";
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;

      const dx = e.clientX - startX;
      nextTranslate = clampTranslate(startTranslate + dx);

      if (raf != null) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        setTranslate(nextTranslate);
      });
    };

    const onEnd = () => {
      if (!dragging) return;
      dragging = false;

      viewport.style.cursor = "default";
      track.style.transition = "transform .45s ease";

      const step = stepRef.current || 0;
      if (step <= 0) {
        compute();
        return;
      }

      // translateX âm -> abs để snap index
      const moved = Math.abs(getTranslateX());
      const snapped = Math.round(moved / step);
      applyIndex(snapped);
    };

    viewport.addEventListener("pointerdown", onDown);
    viewport.addEventListener("pointermove", onMove);
    viewport.addEventListener("pointerup", onEnd);
    viewport.addEventListener("pointercancel", onEnd);

    return () => {
      if (raf != null) cancelAnimationFrame(raf);
      viewport.removeEventListener("pointerdown", onDown);
      viewport.removeEventListener("pointermove", onMove);
      viewport.removeEventListener("pointerup", onEnd);
      viewport.removeEventListener("pointercancel", onEnd);
    };
  }, [applyIndex, compute, preview]);

  return (
    <section className={cls.bs} aria-label="Best Sellers">
      <div className={cls.bsHead}>
        <div className={cls.bsLeft}>
          <h2 className={cls.bsTitle}>{title}</h2>
          {!!badgeText && <span className={cls.bsBadge}>{badgeText}</span>}
        </div>

        {preview ? (
          <button className={cls.bsMore} type="button" onClick={block}>
            {moreLabel} <span className={cls.bsArrow}>→</span>
          </button>
        ) : (
          <Link className={cls.bsMore} href={moreHref as Route}>
            {moreLabel} <span className={cls.bsArrow}>→</span>
          </Link>
        )}
      </div>

      <div className={cls.bsBody}>
        <button className={`${cls.navbtn} ${cls.prev}`} aria-label="Previous" type="button" onClick={preview ? (e) => block(e) : prev} disabled={!canPrev}>
          <i className="bi bi-chevron-left" />
        </button>

        <button className={`${cls.navbtn} ${cls.next}`} aria-label="Next" type="button" onClick={preview ? (e) => block(e) : next} disabled={!canNext}>
          <i className="bi bi-chevron-right" />
        </button>

        <div className={cls.bsViewport} ref={viewportRef}>
          <div className={cls.bsTrack} ref={trackRef}>
            {resolvedItems.map((it) => {
              const rating = it.rating;

              const CardInner = (
                <div className={cls.card}>
                  <div className={cls.imgbox}>
                    <Image
                      src={it.imageSrc}
                      alt={it.imageAlt || it.name}
                      fill
                      sizes="(max-width: 620px) 50vw, (max-width: 860px) 33vw, (max-width: 1120px) 25vw, 20vw"
                      style={{ objectFit: "contain" }}
                    />
                  </div>

                  <div className={cls.pInfo}>
                    <div className={cls.pTop}>
                      <h3 className={cls.pName} title={it.name}>
                        {it.name}
                      </h3>

                      <div className={cls.pPriceWrap}>
                        <span className={cls.pPrice}>{it.price}</span>
                        {!!it.tag && <span className={cls.pTag}>{it.tag}</span>}
                      </div>
                    </div>

                    <div className={cls.pMeta}>
                      {!!it.category && <span className={cls.pCategory}>{it.category}</span>}

                      {rating != null && (
                        <div className={cls.pRating} aria-label={`Rated ${rating} out of 5`}>
                          <span className={cls.pStars}>★★★★★</span>
                          <span className={cls.pScore}>{rating.toFixed(1)}</span>
                          {it.ratingCount != null && <span className={cls.pCount}>({it.ratingCount})</span>}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );

              return (
                <article className={cls.bsItem} key={it.id}>
                  {preview || !it.href ? (
                    <div className={cls.itemLink} role="group" aria-label={it.name}>
                      {CardInner}
                    </div>
                  ) : (
                    <Link className={cls.itemLink} href={it.href as Route}>
                      {CardInner}
                    </Link>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default BestSeller1;

/* ================= RegItem (for REGISTRY) ================= */
export const SHOP_BEST_SELLER_GREEN_ONE: RegItem = {
  kind: "BestSeller1",
  label: "Best Seller",
  defaults: {
    title: "Best-Selling Products",
    badgeText: "Hot",
    moreLabel: "View More",
    moreHref: "/best-sellers",

    // giống Hero1: lưu JSON string cho textarea
    items: JSON.stringify(DEFAULT_ITEMS, null, 2),
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "badgeText", label: "Badge", kind: "text" },
    { key: "moreLabel", label: "More label", kind: "text" },
    { key: "moreHref", label: "More href", kind: "text" },

    { key: "items", label: "Items (JSON)", kind: "textarea", rows: 14 },
  ],
  render: (p) => {
    // giữ style giống Hero1: parse từ registry props (string) -> truyền vào component ở preview
    // items ưu tiên sanitize bằng parseItems (có validate required fields)
    const itemsStr = typeof p.items === "string" ? p.items : undefined;

    // fallback: nếu bạn muốn giữ an toàn kiểu dữ liệu:
    // - safeJson chỉ parse (không validate)
    // - parseItems validate bắt buộc id/name/imageSrc/price
    // -> dùng parseItems là chính
    const _maybe = safeJson<unknown>(itemsStr);
    void _maybe; // tránh warning nếu TS strict + noUnusedLocals

    return (
      <div className="sectionContainer" aria-label="Shop Best Seller (Green One)">
        <BestSeller1
          title={String(p.title ?? "Best-Selling Products")}
          badgeText={String(p.badgeText ?? "Hot")}
          moreLabel={String(p.moreLabel ?? "View More")}
          moreHref={String(p.moreHref ?? "/best-sellers")}
          itemsJson={itemsStr}
          preview={true}
        />
      </div>
    );
  },
};
