// File: components/templates/home/HotTodayShop.tsx
"use client";

import React from "react";
import cls from "@/components/admin/shared/templates/ShopTemplate/styles/home/HotTodayShop/hot-today-shop.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type HotTodayProduct = {
  id: number | string;
  title: string;
  img: string;
  priceNow: number;
  priceOld?: number;
  rating?: number;
  soldText?: string; // "Đã bán 3.2k"
  discountLabel?: string; // "-21%"
  isMall?: boolean;
  vouchers?: string[]; // ["Voucher 10k", "Freeship"]
  soldPercent?: number; // 0–100 -> thanh tiến độ
};

export type HotTodayShopProps = {
  title?: string;
  viewLabel?: string;
  viewHref?: string;
  products?: HotTodayProduct[];
  preview?: boolean;
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default function HotTodayShop({
  title = "Sản phẩm bán chạy hôm nay",
  viewLabel = "Xem tất cả →",
  viewHref = "#",
  products = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    title: `Tai nghe bluetooth âm rõ #${i + 1}`,
    img: "https://placehold.co/400x400/png?text=SP+4&bg=fff&fc=111",
    priceNow: 150_000,
    priceOld: 189_000,
    rating: 4.6,
    soldText: "Đã bán 3.2k",
    discountLabel: "-21%",
    isMall: true,
    vouchers: ["Voucher 10k", "Freeship"],
    soldPercent: 72,
  })),
  preview = false,
}: HotTodayShopProps) {
  function stopLink(e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <section className={cls.hotToday}>
      <header className={cls.htHead}>
        <h3>{title}</h3>
        <a href={viewHref} className={cls.htView} onClick={stopLink}>
          {viewLabel}
        </a>
      </header>

      <div className={cls.htGrid}>
        {products.map((p) => (
          <article key={p.id} className={cls.pCard}>
            <div className={cls.thumb}>
              {p.isMall && <span className={cls.mallBadge}>Mall</span>}
              {p.discountLabel && <span className={cls.badge}>{p.discountLabel}</span>}

              <img src={p.img} alt={p.title} loading="lazy" />

              {/* Quick actions (hover) */}
              <div className={cls.quick}>
                <button type="button" aria-label="Yêu thích" onClick={stopLink}>
                  <i className="bi bi-heart" />
                </button>
                <button type="button" aria-label="Xem nhanh" onClick={stopLink}>
                  <i className="bi bi-eye" />
                </button>
              </div>
            </div>

            <a href="#" className={cls.title} onClick={stopLink}>
              {p.title}
            </a>

            {/* Rating + sold */}
            {(p.rating || p.soldText) && (
              <div className={cls.meta}>
                {p.rating && (
                  <div className={cls.rating} aria-label={`${p.rating} trên 5`}>
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-fill" />
                    <i className="bi bi-star-half" />
                    <span className={cls.score}>{p.rating.toFixed(1)}</span>
                  </div>
                )}
                {p.soldText && <span className={cls.sold}>{p.soldText}</span>}
              </div>
            )}

            {/* Price */}
            <div className={cls.price}>
              <span className={cls.now}>{currency.format(p.priceNow)}</span>
              {p.priceOld && <span className={cls.old}>{currency.format(p.priceOld)}</span>}
            </div>

            {/* Vouchers / benefits */}
            {p.vouchers?.length ? (
              <div className={cls.chips}>
                {p.vouchers.map((v, i) => (
                  <span key={i} className={`${cls.chip} ${cls.chipGhost}`}>
                    {v}
                  </span>
                ))}
              </div>
            ) : null}

            {/* Sold progress */}
            {typeof p.soldPercent === "number" && (
              <div className={cls.soldbar}>
                <div className={cls.bar} style={{ width: `${Math.min(Math.max(p.soldPercent, 0), 100)}%` }} />
                <span className={cls.soldbarText}>Đã bán {p.soldPercent}%</span>
              </div>
            )}

            <button type="button" className={cls.btnAdd} onClick={stopLink}>
              <i className="bi bi-bag-plus" />
              Thêm vào giỏ
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}

export const PRODUCT_HOT_TODAY: RegItem = {
  kind: "product.hotToday",
  label: "Products — Bán chạy hôm nay",
  defaults: {
    title: "Sản phẩm bán chạy hôm nay",
    viewLabel: "Xem tất cả →",
    viewHref: "#",
    products: Array.from({ length: 10 }).map((_, i) => ({
      id: i + 1,
      title: `Tai nghe bluetooth âm rõ #${i + 1}`,
      img: "https://placehold.co/400x400/png?text=SP+4&bg=fff&fc=111",
      priceNow: 150_000,
      priceOld: 189_000,
      rating: 4.6,
      soldText: "Đã bán 3.2k",
      discountLabel: "-21%",
      isMall: true,
      vouchers: ["Voucher 10k", "Freeship"],
      soldPercent: 72,
    })),
  },
  inspector: [
    { key: "title", label: "Tiêu đề section", kind: "text" },
    { key: "viewLabel", label: "Text link xem tất cả", kind: "text" },
    { key: "viewHref", label: "URL xem tất cả", kind: "text" },
    { key: "products", label: "Danh sách products (JSON)", kind: "textarea" },
  ],
  render: (p: any) => <HotTodayShop {...p} preview />,
};
