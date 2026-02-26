// File: components/templates/home/ProductTopWeek.tsx
"use client";

import React from "react";
import cls from "@/components/admin/shared/templates/ShopTemplate/styles/home/ProductTopWeek/product-top-week.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type ProductItem = {
  id: number | string;
  title: string;
  priceNow: number;
  priceOld?: number;
  img: string;
  rating?: number; // 4.8, 4.5...
  soldText?: string; // ví dụ: "Đã bán 1.2k"
};

export type ProductTopWeekProps = {
  title?: string;
  tag?: string;
  products?: ProductItem[];
  preview?: boolean;
};

const currency = new Intl.NumberFormat("vi-VN", {
  style: "currency",
  currency: "VND",
});

export default function ProductTopWeek({
  title = "Top bán chạy nhất tuần",
  tag = "Cập nhật hàng ngày",
  products = Array.from({ length: 10 }).map((_, i) => ({
    id: i + 1,
    title: `Sản phẩm ${i + 1} – thời trang hot`,
    priceNow: 299_000 + i * 20_000,
    priceOld: 399_000 + i * 22_000,
    img: "https://kconceptvn.com/wp-content/uploads/2023/09/350849990_515219250705589_1744350712436573328_n.jpg",
    rating: 4.8,
    soldText: "Đã bán 1.2k",
  })),
  preview = false,
}: ProductTopWeekProps) {
  function stop(e: React.MouseEvent<HTMLButtonElement>) {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <section className={cls.section} aria-label={title}>
      <div className={cls.head}>
        <h2>{title}</h2>
        {tag && <span className={cls.tag}>{tag}</span>}
      </div>

      <div className={cls.prodGrid}>
        {products.map((p) => (
          <article key={p.id} className={cls.card}>
            <div className={cls.thumb}>
              {/* Có thể đổi sang <Image> nếu bạn muốn */}
              <img src={p.img} alt={p.title} loading="lazy" />
            </div>
            <div className={cls.body}>
              <div className={cls.title}>{p.title}</div>

              <div className={cls.price}>
                <span className={cls.now}>{currency.format(p.priceNow)}</span>
                {p.priceOld && <span className={cls.old}>{currency.format(p.priceOld)}</span>}
              </div>

              <div className={cls.metaRow}>
                {p.rating && <span className={cls.rating}>★ {p.rating.toFixed(1)}</span>}
                {p.soldText && <span className={cls.sold}>{p.soldText}</span>}
              </div>

              <div className={cls.cta}>
                <button type="button" className={cls.btnPrimary} onClick={stop}>
                  Thêm vào giỏ
                </button>
                <button type="button" className={cls.btnGhost} onClick={stop}>
                  Yêu thích
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export const PRODUCT_TOP_WEEK: RegItem = {
  kind: "product.topWeek",
  label: "Products — Top bán chạy tuần",
  defaults: {
    title: "Top bán chạy nhất tuần",
    tag: "Cập nhật hàng ngày",
    products: Array.from({ length: 10 }).map((_, i) => ({
      id: i + 1,
      title: `Sản phẩm ${i + 1} – thời trang hot`,
      priceNow: 299_000 + i * 20_000,
      priceOld: 399_000 + i * 22_000,
      img: "https://kconceptvn.com/wp-content/uploads/2023/09/350849990_515219250705589_1744350712436573328_n.jpg",
      rating: 4.8,
      soldText: "Đã bán 1.2k",
    })),
  },
  inspector: [
    { key: "title", label: "Tiêu đề section", kind: "text" },
    { key: "tag", label: "Tag (badge)", kind: "text" },
    { key: "products", label: "Products (JSON)", kind: "textarea" },
  ],
  render: (p: any) => <ProductTopWeek {...p} preview />,
};
