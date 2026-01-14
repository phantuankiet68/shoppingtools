"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import cls from "@/components/admin/templates/ShopTemplate/styles/home/Testimonial/testimonials-elite.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type TestimonialItem = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  stars?: number; // 0–5
};

export type TestimonialsEliteProps = {
  heading?: string;
  subheading?: string;
  items?: TestimonialItem[];
  autoPlay?: boolean;
  intervalMs?: number;
  preview?: boolean;
};

export default function TestimonialsElite({
  heading = "Voices of Distinction",
  subheading = "Esteemed clients share their exceptional experiences with our unparalleled service",
  items = [
    {
      quote: "The discretion and sophistication of their service matches what we expect from our most exclusive properties.",
      name: "Henri Delacroix",
      role: "General Manager, The Ritz Paris",
      avatar: "https://placehold.co/100x100/jpg?text=H",
      stars: 5,
    },
    {
      quote: "An impeccable experience end-to-end. Their team anticipated needs we didn’t even know we had.",
      name: "Victoria Chen",
      role: "Principal, Aria Private Office",
      avatar: "https://placehold.co/100x100/jpg?text=V",
      stars: 5,
    },
    {
      quote: "They operate with rare professionalism and quiet excellence. Our clients constantly compliment the service.",
      name: "James Whitmore",
      role: "Partner, Whitmore & Co.",
      avatar: "https://placehold.co/100x100/jpg?text=J",
      stars: 4,
    },
    {
      quote: "A gold standard for discretion and quality. Seamless coordination across all touchpoints.",
      name: "Elena Rossi",
      role: "Director, Palatina Estates",
      avatar: "https://placehold.co/100x100/jpg?text=E",
      stars: 5,
    },
    {
      quote: "Everything felt effortless. Communication was crisp and the results, exceptional.",
      name: "Noah Hart",
      role: "CIO, Linden Family Office",
      avatar: "https://placehold.co/100x100/jpg?text=N",
      stars: 5,
    },
  ],
  autoPlay = true,
  intervalMs = 5000,
  preview = false,
}: TestimonialsEliteProps) {
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const [perView, setPerView] = useState(3);
  const [page, setPage] = useState(0);
  const [hovered, setHovered] = useState(false);

  // tính số card / view theo breakpoint
  useEffect(() => {
    function calcPerView() {
      if (typeof window === "undefined") return;
      const w = window.innerWidth;
      if (w <= 640) setPerView(1);
      else if (w <= 980) setPerView(2);
      else setPerView(3);
    }
    calcPerView();
    window.addEventListener("resize", calcPerView);
    return () => window.removeEventListener("resize", calcPerView);
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(items.length / perView)), [items.length, perView]);

  // đảm bảo page không vượt khi resize
  useEffect(() => {
    setPage((p) => Math.min(p, totalPages - 1));
  }, [totalPages]);

  // scroll khi page thay đổi
  useEffect(() => {
    const vp = viewportRef.current;
    if (!vp) return;
    const targetLeft = vp.clientWidth * page;
    vp.scrollTo({ left: targetLeft, behavior: "smooth" });
  }, [page]);

  const goTo = (i: number) => {
    const next = Math.max(0, Math.min(i, totalPages - 1));
    setPage(next);
  };

  const goPrev = () => goTo(page - 1);
  const goNext = () => goTo(page + 1);

  // autoplay
  useEffect(() => {
    if (!autoPlay || hovered || totalPages <= 1) return;

    const id = setInterval(() => {
      setPage((prev) => (prev + 1) % totalPages);
    }, intervalMs);

    return () => clearInterval(id);
  }, [autoPlay, hovered, intervalMs, totalPages]);

  return (
    <section className={cls.ts}>
      {/* Head */}
      <div className={cls.tsHead}>
        <h2>{heading}</h2>
        {subheading && <p>{subheading}</p>}
        <span className={cls.tsUnderline} />
      </div>

      {/* Slider shell */}
      <div className={cls.tsWrap}>
        <button type="button" className={`${cls.tsNav} ${cls.tsPrev}`} aria-label="Prev" onClick={goPrev} disabled={totalPages <= 1}>
          ‹
        </button>

        <div className={cls.tsViewport} ref={viewportRef} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
          <div className={cls.tsTrack}>
            {items.map((d, idx) => (
              <article key={idx} className={cls.tsCard}>
                <p className={cls.tsQuote}>{d.quote}</p>
                <div className={cls.tsUser}>
                  <span className={cls.tsAvatar}>
                    <img src={d.avatar} alt={d.name} />
                  </span>
                  <div>
                    <div className={cls.tsName}>{d.name}</div>
                    <div className={cls.tsRole}>{d.role}</div>
                    {typeof d.stars === "number" && (
                      <div className={cls.tsStars}>
                        {"★".repeat(d.stars)}
                        {"☆".repeat(Math.max(0, 5 - d.stars))}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        <button type="button" className={`${cls.tsNav} ${cls.tsNext}`} aria-label="Next" onClick={goNext} disabled={totalPages <= 1}>
          ›
        </button>
      </div>

      {/* Dots */}
      <div className={cls.tsDots}>
        {Array.from({ length: totalPages }).map((_, i) => (
          <button key={i} type="button" className={`${cls.tsDot} ${i === page ? cls.active : ""}`} onClick={() => goTo(i)} aria-label={`Trang ${i + 1}`} />
        ))}
      </div>
    </section>
  );
}

export const TESTIMONIALS_ELITE: RegItem = {
  kind: "testimonials.elite",
  label: "Testimonials — Voices of Distinction",
  defaults: {
    heading: "Voices of Distinction",
    subheading: "Esteemed clients share their exceptional experiences with our unparalleled service",
    autoPlay: true,
    intervalMs: 5000,
    items: [
      {
        quote: "The discretion and sophistication of their service matches what we expect from our most exclusive properties.",
        name: "Henri Delacroix",
        role: "General Manager, The Ritz Paris",
        avatar: "https://placehold.co/100x100/jpg?text=H",
        stars: 5,
      },
      {
        quote: "An impeccable experience end-to-end. Their team anticipated needs we didn’t even know we had.",
        name: "Victoria Chen",
        role: "Principal, Aria Private Office",
        avatar: "https://placehold.co/100x100/jpg?text=V",
        stars: 5,
      },
      {
        quote: "They operate with rare professionalism and quiet excellence. Our clients constantly compliment the service.",
        name: "James Whitmore",
        role: "Partner, Whitmore & Co.",
        avatar: "https://placehold.co/100x100/jpg?text=J",
        stars: 4,
      },
      {
        quote: "A gold standard for discretion and quality. Seamless coordination across all touchpoints.",
        name: "Elena Rossi",
        role: "Director, Palatina Estates",
        avatar: "https://placehold.co/100x100/jpg?text=E",
        stars: 5,
      },
      {
        quote: "Everything felt effortless. Communication was crisp and the results, exceptional.",
        name: "Noah Hart",
        role: "CIO, Linden Family Office",
        avatar: "https://placehold.co/100x100/jpg?text=N",
        stars: 5,
      },
    ],
  },
  inspector: [
    { key: "heading", label: "Tiêu đề", kind: "text" },
    { key: "subheading", label: "Mô tả", kind: "textarea" },
    { key: "autoPlay", label: "Auto play", kind: "check" },
    { key: "intervalMs", label: "Interval (ms)", kind: "number" },
    { key: "items", label: "Testimonials (JSON)", kind: "textarea" },
  ],
  render: (p: any) => <TestimonialsElite {...p} preview />,
};
