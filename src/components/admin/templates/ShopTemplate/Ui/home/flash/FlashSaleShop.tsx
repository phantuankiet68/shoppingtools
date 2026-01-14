"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import cls from "@/components/admin/templates/ShopTemplate/styles/home/flash/flash-sale-shop.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type FlashItem = {
  id: string | number;
  title: string;
  img: string;
  priceNow: number;
  priceOld?: number;
  chip?: string; // ví dụ: "-25%" hoặc "HOT"
};

export type FlashSaleShopProps = {
  title?: string; // "⚡ FLASH SALE"
  viewAllHref?: string;
  endTime?: string; // ISO string: khi nào đếm ngược kết thúc
  items?: FlashItem[];
  currencyLocale?: string; // vi-VN
  currency?: string; // VND
  autoScrollMs?: number | null; // tự cuộn danh sách, null để tắt
  theme?: { brand?: string; radius?: string; shadow?: string; line?: string };
  preview?: boolean; // block clicks trong builder
  onAddToCart?: (item: FlashItem) => void;
  onAddToWishlist?: (item: FlashItem) => void;
};

export default function FlashSaleShop({
  title = "⚡ FLASH SALE",
  viewAllHref = "#",
  endTime,
  items = [],
  currencyLocale = "vi-VN",
  currency = "VND",
  autoScrollMs = null,
  theme = { brand: "#f97316", radius: "12px", shadow: "0 10px 30px rgba(0,0,0,.06)", line: "rgba(12,23,48,.12)" },
  preview = false,
  onAddToCart,
  onAddToWishlist,
}: FlashSaleShopProps) {
  // ===== Countdown =====
  const [left, setLeft] = useState<number>(() => {
    if (!endTime) return 0;
    return Math.max(0, new Date(endTime).getTime() - Date.now());
  });

  useEffect(() => {
    if (!endTime) return;
    const tick = () => setLeft(Math.max(0, new Date(endTime).getTime() - Date.now()));
    const t = setInterval(tick, 1000);
    tick();
    return () => clearInterval(t);
  }, [endTime]);

  const { hh, mm, ss } = useMemo(() => {
    const total = Math.floor(left / 1000);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const pad = (n: number) => (n < 10 ? `0${n}` : String(n));
    return { hh: pad(h), mm: pad(m), ss: pad(s) };
  }, [left]);

  // ===== Theme scope =====
  const rootRef = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!rootRef.current) return;
    if (theme.brand) rootRef.current.style.setProperty("--brand", theme.brand);
    if (theme.radius) rootRef.current.style.setProperty("--radius", theme.radius);
    if (theme.shadow) rootRef.current.style.setProperty("--shadow", theme.shadow);
    if (theme.line) rootRef.current.style.setProperty("--line", theme.line);
  }, [theme.brand, theme.radius, theme.shadow, theme.line]);

  // ===== Auto horizontal scroll (optional) =====
  const listRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!autoScrollMs || !listRef.current) return;
    const el = listRef.current;
    const timer = setInterval(() => {
      const max = el.scrollWidth - el.clientWidth;
      const atEnd = el.scrollLeft >= max - 4;
      el.scrollTo({ left: atEnd ? 0 : Math.min(max, el.scrollLeft + 240), behavior: "smooth" });
    }, autoScrollMs);
    return () => clearInterval(timer);
  }, [autoScrollMs]);

  const nf = useMemo(() => new Intl.NumberFormat(currencyLocale, { style: "currency", currency }), [currencyLocale, currency]);

  const stop = (e: React.MouseEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <section className={cls.fsWrap} ref={rootRef as any} onClick={preview ? stop : undefined}>
      <div className={cls.fsHead}>
        <div className={cls.fsTitle}>
          {title}
          <div className={cls.fsTimer} aria-label="Countdown">
            <span className={cls.fsBox}>{hh}</span>:<span className={cls.fsBox}>{mm}</span>:<span className={cls.fsBox}>{ss}</span>
          </div>
        </div>
        <a className={cls.fsViewall} href={viewAllHref} onClick={preview ? stop : undefined}>
          Xem tất cả <i className="bi bi-arrow-right-short" />
        </a>
      </div>

      <div className={cls.fsList} ref={listRef}>
        {items.map((p) => (
          <article key={p.id} className={cls.fsCard}>
            <div className={cls.fsThumb}>
              {p.chip && (
                <div className={cls.fsRibbon}>
                  <i className="bi bi-lightning" />
                  {p.chip}
                </div>
              )}
              <img src={p.img} alt={p.title} />
            </div>
            <div className={cls.fsBody}>
              <div className={cls.fsTitleLine} title={p.title}>
                {p.title}
              </div>
              <div className={cls.fsPrice}>{nf.format(p.priceNow)}</div>
              <div className={cls.fsActions}>
                <button className={cls.btn} onClick={() => onAddToCart?.(p)}>
                  Thêm vào giỏ
                </button>
                <button className={[cls.btn, cls.outline].join(" ")} onClick={() => onAddToWishlist?.(p)}>
                  <i className="bi bi-heart" />
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

/* ===================== RegItem ===================== */
export const FLASH_SALE_SHOP: RegItem = {
  kind: "flash.sale-shop",
  label: "Flash Sale — Shop",
  defaults: {
    title: "⚡ FLASH SALE",
    viewAllHref: "#",
    endTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    items: [
      {
        id: 1,
        title: "Sản phẩm 1 – thời trang hot",
        priceNow: 299000,
        img: "https://kconceptvn.com/wp-content/uploads/2023/09/350849990_515219250705589_1744350712436573328_n.jpg",
        chip: "-25%",
      },
      {
        id: 2,
        title: "Sản phẩm 2 – thời trang hot",
        priceNow: 319000,
        img: "https://kconceptvn.com/wp-content/uploads/2023/09/350849990_515219250705589_1744350712436573328_n.jpg",
        chip: "HOT",
      },
      {
        id: 3,
        title: "Sản phẩm 3 – thời trang hot",
        priceNow: 339000,
        img: "https://kconceptvn.com/wp-content/uploads/2023/09/350849990_515219250705589_1744350712436573328_n.jpg",
      },
    ],
    currencyLocale: "vi-VN",
    currency: "VND",
    autoScrollMs: 3500,
    theme: { brand: "#f97316", radius: "12px", shadow: "0 10px 30px rgba(0,0,0,.06)", line: "rgba(12,23,48,.12)" },
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "viewAllHref", label: "View All Href", kind: "text" },
    { key: "endTime", label: "End Time (ISO)", kind: "text" },
    { key: "items", label: "Items (JSON)", kind: "textarea" },
    { key: "currencyLocale", label: "Currency Locale", kind: "text" },
    { key: "currency", label: "Currency", kind: "text" },
    { key: "autoScrollMs", label: "Auto Scroll (ms)", kind: "number" },
    { key: "theme.brand", label: "Brand Color (hex)", kind: "text" },
    { key: "theme.radius", label: "Radius", kind: "text" },
    { key: "theme.shadow", label: "Shadow", kind: "text" },
    { key: "theme.line", label: "Line Color", kind: "text" },
  ],
  render: (p: any) => <FlashSaleShop {...p} preview />,
};
