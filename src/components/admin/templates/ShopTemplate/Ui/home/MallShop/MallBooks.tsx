"use client";

import React, { useEffect, useRef, useState } from "react";
import cls from "@/components/admin/templates/ShopTemplate/styles/home/MallShop/mall-books.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type MallItem = {
  img: string;
  cap: string;
};

export type MallBooksProps = {
  title?: string;
  benefits?: string[];
  viewAllLabel?: string;
  viewAllHref?: string;

  posterBadge?: string;
  posterTitleTop?: string;
  posterTitleBold?: string;
  posterDiscountLabel?: string;
  posterDiscountValue?: string;
  posterTags?: string[];

  items?: MallItem[];
  preview?: boolean;
};

export default function MallBooks({
  title = "BÁN SÁCH MALL",
  benefits = ["🚚 Trả hàng miễn phí 15 ngày", "✅ Hàng chính hãng 100%", "📦 Miễn phí vận chuyển"],
  viewAllLabel = "Xem tất cả",
  viewAllHref = "#",

  posterBadge = "Bán Sách",
  posterTitleTop = "Săn deal",
  posterTitleBold = "Siêu hot",
  posterDiscountLabel = "Giảm đến",
  posterDiscountValue = "50%",
  posterTags = ["Voucher Mall", "Voucher Shop"],

  items = [
    { img: "https://placehold.co/200x200/png?text=Book+1", cap: "Ưu đãi đến 50%" },
    { img: "https://placehold.co/200x200/png?text=Book+2", cap: "Mua 1 tặng 1" },
    { img: "https://placehold.co/200x200/png?text=Book+3", cap: "Giảm thêm 20K" },
    { img: "https://placehold.co/200x200/png?text=Book+4", cap: "Quà mọi đơn" },
    { img: "https://placehold.co/200x200/png?text=Book+5", cap: "Deal độc quyền" },
    { img: "https://placehold.co/200x200/png?text=Book+6", cap: "Freeship Xtra" },
  ],
  preview = false,
}: MallBooksProps) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  function stopLink(e: React.MouseEvent<HTMLAnchorElement>) {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  const step = 240;

  const updateButtons = () => {
    const track = trackRef.current;
    if (!track) return;
    const maxScroll = track.scrollWidth - track.clientWidth;
    setCanPrev(track.scrollLeft > 0);
    setCanNext(track.scrollLeft < maxScroll - 5);
  };

  const scrollByStep = (dir: "prev" | "next") => {
    const track = trackRef.current;
    if (!track) return;
    const delta = dir === "prev" ? -step : step;
    track.scrollBy({ left: delta, behavior: "smooth" });
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    updateButtons();

    const onScroll = () => updateButtons();
    const onResize = () => updateButtons();

    track.addEventListener("scroll", onScroll);
    window.addEventListener("resize", onResize);

    return () => {
      track.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <section className={cls.mall}>
      {/* Top bar */}
      <div className={cls.mallHead}>
        <strong className={cls.mallTitle}>{title}</strong>

        {benefits?.length ? (
          <div className={cls.mallBenefits}>
            {benefits.map((b, i) => (
              <span key={i}>{b}</span>
            ))}
          </div>
        ) : null}

        <a className={cls.mallView} href={viewAllHref} onClick={stopLink}>
          {viewAllLabel}
          <i className="bi bi-arrow-right-circle" aria-hidden="true" />
        </a>
      </div>

      <div className={cls.mallBody}>
        {/* Poster trái */}
        <aside className={cls.mallPoster}>
          <div className={cls.mallBadge}>{posterBadge}</div>
          <h3>
            {posterTitleTop}
            <br />
            <b>{posterTitleBold}</b>
          </h3>
          <div className={cls.mallOff}>
            {posterDiscountLabel}
            <b>{posterDiscountValue}</b>
          </div>
          <div className={cls.mallTags}>
            {posterTags.map((t, i) => (
              <span key={i}>{t}</span>
            ))}
          </div>
        </aside>

        {/* Slider phải (2 hàng) */}
        <section className={cls.mallSlider} aria-label="Ưu đãi Bán Sách Mall">
          {canPrev && (
            <button type="button" className={`${cls.nav} ${cls.prev}`} aria-label="Trước" onClick={() => scrollByStep("prev")}>
              <i className="bi bi-chevron-left" aria-hidden="true" />
            </button>
          )}

          <div className={cls.track} ref={trackRef}>
            {items.map((p, i) => (
              <article key={i} className={cls.mallItem}>
                <img src={p.img} alt={p.cap} loading="lazy" />
                <div className={cls.cap}>{p.cap}</div>
              </article>
            ))}
          </div>

          {canNext && (
            <button type="button" className={`${cls.nav} ${cls.next}`} aria-label="Sau" onClick={() => scrollByStep("next")}>
              <i className="bi bi-chevron-right" aria-hidden="true" />
            </button>
          )}
        </section>
      </div>
    </section>
  );
}

export const MALL_BOOKS: RegItem = {
  kind: "mall.books",
  label: "Mall — Bán Sách Mall",
  defaults: {
    title: "BÁN SÁCH MALL",
    benefits: ["🚚 Trả hàng miễn phí 15 ngày", "✅ Hàng chính hãng 100%", "📦 Miễn phí vận chuyển"],
    viewAllLabel: "Xem tất cả",
    viewAllHref: "#",
    posterBadge: "Bán Sách",
    posterTitleTop: "Săn deal",
    posterTitleBold: "Siêu hot",
    posterDiscountLabel: "Giảm đến",
    posterDiscountValue: "50%",
    posterTags: ["Voucher Mall", "Voucher Shop"],
    items: [
      { img: "https://placehold.co/200x200/png?text=Book+1", cap: "Ưu đãi đến 50%" },
      { img: "https://placehold.co/200x200/png?text=Book+2", cap: "Mua 1 tặng 1" },
      { img: "https://placehold.co/200x200/png?text=Book+3", cap: "Giảm thêm 20K" },
      { img: "https://placehold.co/200x200/png?text=Book+4", cap: "Quà mọi đơn" },
      { img: "https://placehold.co/200x200/png?text=Book+5", cap: "Deal độc quyền" },
      { img: "https://placehold.co/200x200/png?text=Book+6", cap: "Freeship Xtra" },
    ],
  },
  inspector: [
    { key: "title", label: "Tiêu đề Mall", kind: "text" },
    { key: "benefits", label: "Benefits (JSON array)", kind: "textarea" },
    { key: "viewAllLabel", label: 'Nút "Xem tất cả"', kind: "text" },
    { key: "viewAllHref", label: "Link Xem tất cả", kind: "text" },
    { key: "posterBadge", label: "Badge poster", kind: "text" },
    { key: "posterTitleTop", label: "Tiêu đề trên", kind: "text" },
    { key: "posterTitleBold", label: "Tiêu đề in đậm", kind: "text" },
    { key: "posterDiscountLabel", label: "Label giảm giá", kind: "text" },
    { key: "posterDiscountValue", label: "Giá trị giảm", kind: "text" },
    { key: "posterTags", label: "Tags poster (JSON array)", kind: "textarea" },
    { key: "items", label: "Items (JSON array)", kind: "textarea" },
  ],
  render: (p: any) => <MallBooks {...p} preview />,
};
