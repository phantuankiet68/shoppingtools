"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/template/shopGreen/brand/brand1.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type BrandItem = {
  id: string;
  name: string;
  logoSrc: string;
  logoAlt?: string;
  href?: string;
};

export type Brand1Props = {
  title?: string;
  badgeText?: string;
  moreLabel?: string;
  moreHref?: string;

  /** runtime direct items */
  items?: BrandItem[];

  /** builder JSON string (Hero1-style) */
  itemsJson?: string;

  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_ITEMS: BrandItem[] = [
  { id: "br-1", name: "TiZO", logoSrc: "/images/logo.jpg", href: "/brands/tizo" },
  { id: "br-2", name: "ORJENA", logoSrc: "/images/logo.jpg", href: "/brands/orjena" },
  { id: "br-3", name: "DALIV", logoSrc: "/images/logo.jpg", href: "/brands/daliv" },
  { id: "br-4", name: "Care4u", logoSrc: "/images/logo.jpg", href: "/brands/care4u" },
  { id: "br-5", name: "MAVEX", logoSrc: "/images/logo.jpg", href: "/brands/mavex" },
  { id: "br-6", name: "Brand 6", logoSrc: "/images/logo.jpg", href: "/brands/brand-6" },
  { id: "br-7", name: "Brand 7", logoSrc: "/images/logo.jpg", href: "/brands/brand-7" },
];

/* ================= Helpers ================= */
function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function parseItems(raw?: string): BrandItem[] | undefined {
  if (!raw) return undefined;
  try {
    const val = JSON.parse(raw);
    if (!Array.isArray(val)) return undefined;

    const cleaned: BrandItem[] = [];
    for (const it of val) {
      if (!it) continue;

      const id = String(it.id ?? "");
      const name = String(it.name ?? "");
      const logoSrc = String(it.logoSrc ?? it.imageSrc ?? "");

      if (!id || !name || !logoSrc) continue;

      cleaned.push({
        id,
        name,
        logoSrc,
        logoAlt: it.logoAlt ? String(it.logoAlt) : it.logoAlt === "" ? "" : undefined,
        href: it.href ? String(it.href) : undefined,
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
export function Brand1({
  title = "Prominent brand",
  badgeText = "Hot",
  moreLabel = "View More",
  moreHref = "/brands",
  items,
  itemsJson,
  preview = false,
}: Brand1Props) {
  const resolvedItems = React.useMemo(() => {
    return items ?? parseItems(itemsJson) ?? DEFAULT_ITEMS;
  }, [items, itemsJson]);

  const viewportRef = React.useRef<HTMLDivElement | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);

  const indexRef = React.useRef(0);
  const stepRef = React.useRef(0);
  const maxRef = React.useRef(0);

  const [canPrev, setCanPrev] = React.useState(false);
  const [canNext, setCanNext] = React.useState(false);

  const block = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const applyIndex = React.useCallback((nextIndex: number) => {
    const track = trackRef.current;
    if (!track) return;

    const step = stepRef.current || 0;
    const max = maxRef.current || 0;

    indexRef.current = clamp(nextIndex, 0, max);
    track.style.transform = `translateX(-${indexRef.current * step}px)`;

    setCanPrev(indexRef.current > 0);
    setCanNext(indexRef.current < max);
  }, []);

  const compute = React.useCallback(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;

    const first = track.querySelector<HTMLElement>(`.${cls.item}`);
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

    // ổn định hơn khi có gap
    const visible = Math.max(1, Math.floor((vw + gap) / step));
    const max = Math.max(0, resolvedItems.length - visible);
    maxRef.current = max;

    applyIndex(indexRef.current);
  }, [applyIndex, resolvedItems.length]);

  const prev = React.useCallback(() => applyIndex(indexRef.current - 1), [applyIndex]);
  const next = React.useCallback(() => applyIndex(indexRef.current + 1), [applyIndex]);

  // Init + observe resize (nhẹ hơn window resize)
  React.useEffect(() => {
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

    return () => ro?.disconnect();
  }, [compute]);

  // Drag/swipe (pointer) - chỉ chạy khi không preview
  React.useEffect(() => {
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
    <section className={cls.brands} aria-label="Featured brands">
      <div className={cls.head}>
        <div className={cls.left}>
          <h2 className={cls.title}>{title}</h2>
          {!!badgeText && <span className={cls.badge}>{badgeText}</span>}
        </div>

        {preview ? (
          <button className={cls.more} type="button" onClick={block}>
            {moreLabel} <span className={cls.arrow}>→</span>
          </button>
        ) : (
          <Link className={cls.bsMore} href={moreHref as Route}>
            {moreLabel} <span className={cls.bsArrow}>→</span>
          </Link>
        )}
      </div>

      <div className={cls.body}>
        <button
          suppressHydrationWarning
          className={`${cls.navbtn} ${cls.prev}`}
          aria-label="Previous"
          type="button"
          onClick={preview ? (e) => block(e) : prev}
          disabled={!canPrev}
        >
          <i className="bi bi-chevron-left" />
        </button>

        <button
          suppressHydrationWarning
          className={`${cls.navbtn} ${cls.next}`}
          aria-label="Next"
          type="button"
          onClick={preview ? (e) => block(e) : next}
          disabled={!canNext}
        >
          <i className="bi bi-chevron-right" />
        </button>

        <div className={cls.viewport} ref={viewportRef}>
          <div className={cls.track} ref={trackRef}>
            {resolvedItems.map((it) => {
              const CardInner = (
                <div className={cls.card}>
                  <div className={cls.imgbox}>
                    <Image
                      src={it.logoSrc}
                      alt={it.logoAlt || `${it.name} logo`}
                      fill
                      sizes="20vw"
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                </div>
              );

              return (
                <div className={cls.item} key={it.id}>
                  {preview || !it.href ? (
                    <div className={cls.itemLink} role="group" aria-label={it.name}>
                      {CardInner}
                    </div>
                  ) : (
                    <Link className={cls.itemLink} href={it.href as Route} aria-label={it.name}>
                      {CardInner}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Brand1;

/* ================= RegItem (for REGISTRY) ================= */
export const SHOP_BRAND_GREEN_ONE: RegItem = {
  kind: "Brand1",
  label: "Brands",
  defaults: {
    title: "Prominent brand",
    badgeText: "Hot",
    moreLabel: "View More",
    moreHref: "/brands",

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
    const itemsStr = typeof p.items === "string" ? p.items : undefined;

    // optional: parse (no validate) để dev debug
    const _maybe = safeJson<unknown>(itemsStr);
    void _maybe;

    return (
      <div className="sectionContainer" aria-label="Shop Brands (Green One)">
        <Brand1
          title={String(p.title ?? "Prominent brand")}
          badgeText={String(p.badgeText ?? "Hot")}
          moreLabel={String(p.moreLabel ?? "View More")}
          moreHref={String(p.moreHref ?? "/brands")}
          itemsJson={itemsStr}
          preview={true}
        />
      </div>
    );
  },
};
