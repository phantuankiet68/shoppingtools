"use client";

import React from "react";
import cls from "@/components/admin/shared/templates/ShopTemplate/styles/home/sections/main-hero-shop.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

import CategoryShop, {
  type CategoryShopProps,
} from "@/components/admin/shared/templates/ShopTemplate/Ui/home/category/CategoryShop";
import HeroShop, { type HeroShopProps } from "@/components/admin/shared/templates/ShopTemplate/Ui/home/hero/HeroShop";
import BannerRight, {
  type BannerRightProps,
} from "@/components/admin/shared/templates/ShopTemplate/Ui/home/banner/BannerRight";

export type MainHeroShopProps = {
  showCategory?: boolean;
  showRightBanners?: boolean;

  catWidth?: number;
  rightWidth?: number;

  categoryProps?: CategoryShopProps;
  heroProps?: HeroShopProps;
  rightBannersProps?: BannerRightProps;
  gap?: number;
};

export default function MainHeroShop({
  showCategory = true,
  showRightBanners = true,
  catWidth = 260,
  rightWidth = 260,
  categoryProps,
  heroProps,
  rightBannersProps,
  gap = 16,
}: MainHeroShopProps) {
  return (
    <section
      className={cls.mainHero}
      style={{
        ["--cat-w" as any]: `${catWidth}px`,
        ["--right-w" as any]: `${rightWidth}px`,
        ["--gap" as any]: `${gap}px`,
      }}
    >
      {showCategory && (
        <div className={cls.colCat}>
          <CategoryShop {...(categoryProps || {})} />
        </div>
      )}

      <div className={cls.colHero}>
        <HeroShop {...(heroProps || {})} />
      </div>

      {showRightBanners && (
        <div className={cls.colRight}>
          <BannerRight {...(rightBannersProps || {})} />
        </div>
      )}
    </section>
  );
}

/* ===================== RegItem ===================== */
export const MAIN_HERO_SHOP: RegItem = {
  kind: "section.main-hero-shop",
  label: "Section — Main Hero (Category + Hero + Banners)",
  defaults: {
    showCategory: true,
    showRightBanners: true,
    categoryProps: {
      title: "Danh mục nổi bật",
      panelId: "catsPanel",
      hideOnMobile: false,
      theme: { brand: "#f97316", radius: "12px", shadow: "0 10px 30px rgba(0,0,0,.06)" },
    },
    heroProps: {
      height: 385,
      intervalMs: 3500,
      autoPlay: true,
      pauseOnHover: true,
      loop: true,
      theme: { brand: "#f97316", radius: "12px", shadow: "0 10px 30px rgba(0,0,0,.06)" },
    },
    rightBannersProps: {
      banners: [
        { src: "https://via.placeholder.com/520x154?text=Banner+Right+1", alt: "Banner 1" },
        { src: "https://via.placeholder.com/520x154?text=Banner+Right+2", alt: "Banner 2" },
      ],
      theme: { shadow: "0 10px 30px rgba(0,0,0,.06)" },
    },
  },
  inspector: [
    { key: "showCategory", label: "Show Category", kind: "check" },
    { key: "showRightBanners", label: "Show Right Banners", kind: "check" },

    { key: "catWidth", label: "Category Width (px)", kind: "number" },
    { key: "rightWidth", label: "Right Width (px)", kind: "number" },
    { key: "gap", label: "Gap (px)", kind: "number" },

    { key: "categoryProps", label: "Category Props (JSON)", kind: "textarea" },
    { key: "heroProps", label: "Hero Props (JSON)", kind: "textarea" },
    { key: "rightBannersProps", label: "Right Props (JSON)", kind: "textarea" },
  ],
  render: (p: any) => <MainHeroShop {...p} />,
};
