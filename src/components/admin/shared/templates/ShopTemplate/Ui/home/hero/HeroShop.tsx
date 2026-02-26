"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import cls from "@/components/admin/templates/ShopTemplate/styles/home/hero/hero-shop.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type Slide = { src: string; alt?: string };

export type HeroShopProps = {
  slides?: Slide[];
  height?: number; // px
  intervalMs?: number; // 3500
  autoPlay?: boolean; // true
  pauseOnHover?: boolean; // true
  loop?: boolean; // true
  theme?: { brand?: string; radius?: string; shadow?: string };
  preview?: boolean; // block clicks
};

export default function HeroShop({
  slides = [
    { src: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=1600&auto=format&fit=crop", alt: "Hero 1" },
    { src: "https://images.unsplash.com/photo-1520975682031-a47de81f1e5e?q=80&w=1600&auto=format&fit=crop", alt: "Hero 2" },
    { src: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop", alt: "Hero 3" },
  ],
  height = 385,
  intervalMs = 3500,
  autoPlay = true,
  pauseOnHover = true,
  loop = true,
  theme = { brand: "#f97316", radius: "12px", shadow: "0 10px 30px rgba(0,0,0,.06)" },
  preview = false,
}: HeroShopProps) {
  const total = slides.length;
  const [idx, setIdx] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const rootRef = useRef<HTMLElement | null>(null);

  // Apply scoped theme vars
  useEffect(() => {
    if (!rootRef.current) return;
    if (theme.brand) rootRef.current.style.setProperty("--brand", theme.brand);
    if (theme.radius) rootRef.current.style.setProperty("--radius", theme.radius);
    if (theme.shadow) rootRef.current.style.setProperty("--shadow", theme.shadow);
  }, [theme.brand, theme.radius, theme.shadow]);

  const clear = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };
  const start = () => {
    if (!autoPlay || total <= 1) return;
    clear();
    timerRef.current = setInterval(() => {
      setIdx((cur) => {
        const next = cur + 1;
        if (next < total) return next;
        return loop ? 0 : cur; // stop at last if not looping
      });
    }, intervalMs);
  };

  useEffect(() => {
    start();
    return clear;
  }, [intervalMs, autoPlay, loop, total]);

  // Pause on hover
  const onEnter = () => {
    if (pauseOnHover) clear();
  };
  const onLeave = () => {
    if (pauseOnHover) start();
  };

  // Move to specific slide
  const go = (i: number) => {
    setIdx(i % total);
  };

  // transform style
  const tx = useMemo(() => ({ transform: `translateX(-${idx * 100}%)` }), [idx]);

  const stop = (e: React.MouseEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <section className={cls.hero} ref={rootRef as any} onMouseEnter={onEnter} onMouseLeave={onLeave} onClick={preview ? stop : undefined}>
      <div className={cls.slides} style={{ ...tx }}>
        {slides.map((s, i) => (
          <div key={i} className={cls.slide} style={{ backgroundImage: `url('${s.src}')`, height }} role="img" aria-label={s.alt || `Slide ${i + 1}`}></div>
        ))}
      </div>
      <div className={cls.dots}>
        {slides.map((_, i) => (
          <button key={i} className={[cls.dot, i === idx ? cls.active : ""].join(" ")} aria-label={`Go to slide ${i + 1}`} aria-current={i === idx} onClick={() => go(i)} />
        ))}
      </div>
    </section>
  );
}

/* ===================== RegItem ===================== */
export const HERO_SHOP: RegItem = {
  kind: "hero.shop",
  label: "Hero — Shop Slider",
  defaults: {
    slides: [
      { src: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?q=80&w=1600&auto=format&fit=crop", alt: "Hero 1" },
      { src: "https://images.unsplash.com/photo-1520975682031-a47de81f1e5e?q=80&w=1600&auto=format&fit=crop", alt: "Hero 2" },
      { src: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1600&auto=format&fit=crop", alt: "Hero 3" },
    ],
    height: 385,
    intervalMs: 3500,
    autoPlay: true,
    pauseOnHover: true,
    loop: true,
    theme: { brand: "#f97316", radius: "12px", shadow: "0 10px 30px rgba(0,0,0,.06)" },
  },
  inspector: [
    { key: "slides", label: "Slides (JSON)", kind: "textarea" },
    { key: "height", label: "Height (px)", kind: "number" },
    { key: "intervalMs", label: "Interval (ms)", kind: "number" },
    { key: "autoPlay", label: "Auto Play", kind: "check" },
    { key: "pauseOnHover", label: "Pause on Hover", kind: "check" },
    { key: "loop", label: "Loop", kind: "check" },
    { key: "theme.brand", label: "Brand Color (hex)", kind: "text" },
    { key: "theme.radius", label: "Radius", kind: "text" },
    { key: "theme.shadow", label: "Shadow", kind: "text" },
  ],
  render: (p: any) => <HeroShop {...p} preview />,
};
