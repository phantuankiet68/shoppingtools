// File: components/templates/home/PromoShop.tsx
"use client";

import React from "react";
import cls from "@/components/admin/templates/ShopTemplate/styles/home/promo/promo-shop.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type PromoTone = "red" | "blue";

export type PromoCardConfig = {
  title: string; // có thể dùng \n để xuống dòng
  subtitle?: string;
  ctaLabel?: string;
  href?: string;
  imageUrl?: string;
  tone?: PromoTone; // red | blue -> đổi overlay
};

export type PromoShopProps = {
  cards?: [PromoCardConfig, PromoCardConfig];
  preview?: boolean;
};

export default function PromoShop({
  cards = [
    {
      title: "ĐỒNG HỒ MOVADO\nCHÍNH HÃNG",
      subtitle: "Tặng quà khủng · Ưu đãi hơn 30%",
      ctaLabel: "Mua ngay",
      href: "#",
      imageUrl: "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?q=80&w=1600&auto=format&fit=crop",
      tone: "red",
    },
    {
      title: "THẾ GIỚI GIÀY NỮ\nCÁ TÍNH 2018",
      subtitle: "Hàng nhập khẩu chính hãng 100%",
      ctaLabel: "Khám phá",
      href: "#",
      imageUrl: "https://images.unsplash.com/photo-1520975682031-a47de81f1e5e?q=80&w=1600&auto=format&fit=crop",
      tone: "blue",
    },
  ],
  preview = false,
}: PromoShopProps) {
  function stop(e: React.MouseEvent<HTMLAnchorElement>) {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <section className={cls.promoGrid} aria-label="Khuyến mãi nổi bật">
      {cards.map((card, idx) => {
        const { title, subtitle, ctaLabel = "Xem ngay", href = "#", imageUrl, tone = "red" } = card;

        const lines = title.split("\n");

        return (
          <a key={idx} href={href} className={cls.promoCard} onClick={stop} aria-label={title.replace(/\n/g, " ")}>
            {imageUrl && <img className={cls.promoBg} src={imageUrl} alt={title.replace(/\n/g, " ")} />}

            <div className={tone === "blue" ? `${cls.promoOverlay} ${cls.promoOverlayBlue}` : cls.promoOverlay}></div>

            <div className={cls.promoContent}>
              <h3>
                {lines.map((line, i) => (
                  <React.Fragment key={i}>
                    {line}
                    {i < lines.length - 1 && <br />}
                  </React.Fragment>
                ))}
              </h3>
              {subtitle && <p>{subtitle}</p>}
              <span className={cls.promoCta}>{ctaLabel}</span>
            </div>
          </a>
        );
      })}
    </section>
  );
}

export const PROMO_SHOP: RegItem = {
  kind: "promo.shop",
  label: "Promo — 2 Card Khuyến Mãi",
  defaults: {
    cards: [
      {
        title: "ĐỒNG HỒ MOVADO\nCHÍNH HÃNG",
        subtitle: "Tặng quà khủng · Ưu đãi hơn 30%",
        ctaLabel: "Mua ngay",
        href: "#",
        imageUrl: "https://images.unsplash.com/photo-1511385348-a52b4a160dc2?q=80&w=1600&auto=format&fit=crop",
        tone: "red",
      },
      {
        title: "THẾ GIỚI GIÀY NỮ\nCÁ TÍNH 2018",
        subtitle: "Hàng nhập khẩu chính hãng 100%",
        ctaLabel: "Khám phá",
        href: "#",
        imageUrl: "https://images.unsplash.com/photo-1520975682031-a47de81f1e5e?q=80&w=1600&auto=format&fit=crop",
        tone: "blue",
      },
    ],
  },
  inspector: [
    {
      key: "cards",
      label: "Cards (JSON)",
      kind: "textarea",
    },
  ],
  render: (p: any) => <PromoShop {...p} preview />,
};
