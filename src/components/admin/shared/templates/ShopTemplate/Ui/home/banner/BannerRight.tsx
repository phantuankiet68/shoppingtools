"use client";

import React, { useEffect, useRef } from "react";
import cls from "@/components/admin/shared/templates/ShopTemplate/styles/home/banner/banner-right.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type Banner = { src: string; alt?: string };

export type BannerRightProps = {
  banners?: Banner[];
  theme?: { shadow?: string };
  preview?: boolean;
};

export default function BannerRight({
  banners = [
    { src: "https://via.placeholder.com/520x154?text=Banner+Right+1", alt: "Banner 1" },
    { src: "https://via.placeholder.com/520x154?text=Banner+Right+2", alt: "Banner 2" },
  ],
  theme = { shadow: "0 10px 30px rgba(0,0,0,.06)" },
  preview = false,
}: BannerRightProps) {
  const rootRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!rootRef.current) return;
    if (theme.shadow) rootRef.current.style.setProperty("--shadow", theme.shadow);
  }, [theme.shadow]);

  const stop = (e: React.MouseEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <aside className={cls.rightBanners} ref={rootRef as any} onClick={preview ? stop : undefined}>
      {banners.map((b, i) => (
        <div key={i} className={cls.banner}>
          <img src={b.src} alt={b.alt || `banner-${i + 1}`} />
        </div>
      ))}
    </aside>
  );
}

/* ===================== RegItem ===================== */
export const BANNER_RIGHT: RegItem = {
  kind: "banner.right",
  label: "Banner — Right Side",
  defaults: {
    banners: [
      { src: "https://via.placeholder.com/520x154?text=Banner+Right+1", alt: "Banner 1" },
      { src: "https://via.placeholder.com/520x154?text=Banner+Right+2", alt: "Banner 2" },
    ],
    theme: { shadow: "0 10px 30px rgba(0,0,0,.06)" },
  },
  inspector: [
    { key: "banners", label: "Banners (JSON)", kind: "textarea" },
    { key: "theme.shadow", label: "Shadow", kind: "text" },
  ],
  render: (p: any) => <BannerRight {...p} preview />,
};
