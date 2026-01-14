"use client";

import React, { useEffect, useState } from "react";
import cls from "@/components/admin/templates/ShopTemplate/styles/home/ShockBannerShop/shock-banner-shop.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type ShockCard = {
  title: string;
  subtitle: string;
  href?: string;
  variant?: "blue" | "orange";
};

export type ShockBannerShopProps = {
  labelSmall?: string; // "Khung giờ"
  labelStrong?: string; // "Giảm sốc"
  giantNumber?: number; // số lớn ở giữa (5)
  durationSeconds?: number; // thời gian đếm ngược (giây)
  cards?: ShockCard[];
  preview?: boolean;
};

function pad2(n: number) {
  return n.toString().padStart(2, "0");
}

export default function ShockBannerShop({
  labelSmall = "Khung giờ",
  labelStrong = "Giảm sốc",
  giantNumber = 5,
  // mặc định: 3 giờ giảm sốc (3 * 60 * 60)
  durationSeconds = 3 * 60 * 60,
  cards = [
    {
      title: "GIẢM 10%",
      subtitle: "CHO ĐƠN HÀNG TỪ 599K",
      href: "#",
      variant: "blue",
    },
    {
      title: "TẶNG ÁO THUN",
      subtitle: "100% COTTON (199K)",
      href: "#",
      variant: "orange",
    },
  ],
  preview = false,
}: ShockBannerShopProps) {
  const [timeLeft, setTimeLeft] = useState(durationSeconds);

  useEffect(() => {
    // reset khi durationSeconds đổi
    setTimeLeft(durationSeconds);

    if (!durationSeconds || durationSeconds <= 0) return;

    const id = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(id);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [durationSeconds]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  function stopLink(e: React.MouseEvent<HTMLAnchorElement>) {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  return (
    <section className={cls.shockBanner}>
      {/* Left side */}
      <div className={cls.sbLeft}>
        <div className={cls.sbTitle}>
          <span>{labelSmall}</span>
          <strong>{labelStrong}</strong>
        </div>

        <div className={cls.sbGiant}>{giantNumber}</div>

        <div className={cls.sbTimer} aria-label="Đếm ngược">
          <div className={cls.sbBox}>
            <span>{pad2(hours)}</span>
            <small>GIỜ</small>
          </div>
          <div className={cls.sbBox}>
            <span>{pad2(minutes)}</span>
            <small>PHÚT</small>
          </div>
          <div className={cls.sbBox}>
            <span>{pad2(seconds)}</span>
            <small>GIÂY</small>
          </div>
        </div>
      </div>

      {/* Right side – cards */}
      <div className={cls.sbRight}>
        {cards.map((c, idx) => {
          const variantClass = c.variant === "blue" ? cls.sbBlue : c.variant === "orange" ? cls.sbOrange : "";

          return (
            <a key={idx} href={c.href || "#"} className={`${cls.sbCard} ${variantClass}`} onClick={stopLink}>
              <div className={cls.sbCardTitle}>{c.title}</div>
              <div className={cls.sbCardSub}>{c.subtitle}</div>
            </a>
          );
        })}
      </div>
    </section>
  );
}

export const BANNER_SHOCK: RegItem = {
  kind: "banner.shock",
  label: "Banner — Khung giờ giảm sốc",
  defaults: {
    labelSmall: "Khung giờ",
    labelStrong: "Giảm sốc",
    giantNumber: 5,
    durationSeconds: 3 * 60 * 60, // 3 giờ
    cards: [
      {
        title: "GIẢM 10%",
        subtitle: "CHO ĐƠN HÀNG TỪ 599K",
        href: "#",
        variant: "blue",
      },
      {
        title: "TẶNG ÁO THUN",
        subtitle: "100% COTTON (199K)",
        href: "#",
        variant: "orange",
      },
    ],
  },
  inspector: [
    { key: "labelSmall", label: "Label nhỏ (span)", kind: "text" },
    { key: "labelStrong", label: "Label đậm (strong)", kind: "text" },
    { key: "giantNumber", label: "Số lớn (giữa)", kind: "number" },
    { key: "durationSeconds", label: "Thời gian (giây)", kind: "number" },
    { key: "cards", label: "Cards (JSON array)", kind: "textarea" },
  ],
  render: (p: any) => <ShockBannerShop {...p} preview />,
};
