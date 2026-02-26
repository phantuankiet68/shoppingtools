"use client";

import React from "react";
import cls from "@/components/admin/templates/ShopTemplate/styles/home/PromoStripShop/promo-strip-shop.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type PromoStripShopProps = {
  kicker?: string;
  title?: string;
  highlight?: string;
  subtitle?: string;
  buttonLabel?: string;
  imageSrc?: string;
  imageAlt?: string;
  preview?: boolean;
};

export default function PromoStripShop({
  kicker = "Ưu đãi hot",
  title = "Đồng hồ chính hãng –",
  highlight = "giảm đến 40%",
  subtitle = "Ưu đãi áp dụng đến 30/11 · Bảo hành chính hãng 2 năm",
  buttonLabel = "Mua ngay",
  imageSrc = "https://xuongtranhgo.com/wp-content/uploads/2022/07/DEMO-T3M-119173.jpeg",
  imageAlt = "Đồng hồ chính hãng",
  preview = false,
}: PromoStripShopProps) {
  function stop(e: React.MouseEvent<HTMLButtonElement>) {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <section className={cls.promoStrip} aria-label="Ưu đãi đặc biệt">
      <div className={cls.promoLeft}>
        {kicker && <p className={cls.kicker}>{kicker}</p>}

        <h3>
          {title} <em>{highlight}</em>
        </h3>

        {subtitle && <p className={cls.sub}>{subtitle}</p>}

        <button className={cls.promoBtn} onClick={stop}>
          {buttonLabel}
          <i className="bi bi-arrow-right" aria-hidden="true" />
        </button>
      </div>

      <figure className={cls.promoArt}>
        <img src={imageSrc} alt={imageAlt} loading="lazy" />
      </figure>
    </section>
  );
}

export const PROMO_STRIP_SHOP: RegItem = {
  kind: "promo.strip.shop",
  label: "Promo — Strip Đồng Hồ",
  defaults: {
    kicker: "Ưu đãi hot",
    title: "Đồng hồ chính hãng –",
    highlight: "giảm đến 40%",
    subtitle: "Ưu đãi áp dụng đến 30/11 · Bảo hành chính hãng 2 năm",
    buttonLabel: "Mua ngay",
    imageSrc: "https://xuongtranhgo.com/wp-content/uploads/2022/07/DEMO-T3M-119173.jpeg",
    imageAlt: "Đồng hồ chính hãng",
  },
  inspector: [
    { key: "kicker", label: "Kicker (nhãn nhỏ)", kind: "text" },
    { key: "title", label: "Tiêu đề", kind: "text" },
    { key: "highlight", label: "Phần highlight", kind: "text" },
    { key: "subtitle", label: "Mô tả", kind: "text" },
    { key: "buttonLabel", label: "Nút CTA", kind: "text" },
    { key: "imageSrc", label: "Ảnh (URL)", kind: "text" },
    { key: "imageAlt", label: "Alt ảnh", kind: "text" },
  ],
  render: (p: any) => <PromoStripShop {...p} preview />,
};
