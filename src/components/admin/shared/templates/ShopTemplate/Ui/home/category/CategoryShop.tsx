"use client";

import React, { useEffect, useId, useRef } from "react";
import cls from "@/components/admin/shared/templates/ShopTemplate/styles/home/category/category-shop.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type CatItem = { icon?: string; label: string };

export type CategoryShopProps = {
  title?: string;
  items?: CatItem[];
  preview?: boolean;
  panelId?: string;
  hideOnMobile?: boolean;
  theme?: { brand?: string; radius?: string; shadow?: string };
};

export default function CategoryShop({
  title = "Danh mục nổi bật",
  items = [
    { icon: "bi-handbag", label: "Thời trang nữ" },
    { icon: "bi-suit-spade", label: "Thời trang nam" },
    { icon: "bi-watch", label: "Đồng hồ" },
    { icon: "bi-phone", label: "Phụ kiện" },
    { icon: "bi-bag", label: "Túi xách" },
    { icon: "bi-shield-check", label: "Chính hãng" },
    { icon: "bi-heart", label: "Sức khoẻ & làm đẹp" },
    { icon: "bi-lightning", label: "Flash sale" },
  ],
  preview = false,
  panelId,
  hideOnMobile = false,
  theme = { brand: "#f97316", radius: "12px", shadow: "0 10px 30px rgba(0,0,0,.06)" },
}: CategoryShopProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const genId = useId();
  const id = panelId || `cats-${genId}`;

  useEffect(() => {
    if (!rootRef.current) return;
    if (theme.brand) rootRef.current.style.setProperty("--brand", theme.brand);
    if (theme.radius) rootRef.current.style.setProperty("--radius", theme.radius);
    if (theme.shadow) rootRef.current.style.setProperty("--shadow", theme.shadow);
  }, [theme.brand, theme.radius, theme.shadow]);

  const stop = (e: React.MouseEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <aside
      id={id}
      ref={rootRef as any}
      className={[cls.cats, hideOnMobile ? cls.hideMobile : ""].join(" ")}
      onClick={preview ? stop : undefined}
    >
      <h3 className={cls.title}>{title}</h3>
      <ul className={cls.catList}>
        {items.map((it, idx) => (
          <li key={idx} className={cls.catItem}>
            {it.icon ? <i className={`bi ${it.icon}`}></i> : <i className="bi bi-dot"></i>}
            {it.label}
          </li>
        ))}
      </ul>
    </aside>
  );
}

/* ===================== RegItem ===================== */
export const CATEGORY_SHOP: RegItem = {
  kind: "category.shop",
  label: "Category — Shop",
  defaults: {
    title: "Danh mục nổi bật",
    items: [
      { icon: "bi-handbag", label: "Thời trang nữ" },
      { icon: "bi-suit-spade", label: "Thời trang nam" },
      { icon: "bi-watch", label: "Đồng hồ" },
      { icon: "bi-phone", label: "Phụ kiện" },
      { icon: "bi-bag", label: "Túi xách" },
      { icon: "bi-shield-check", label: "Chính hãng" },
      { icon: "bi-heart", label: "Sức khoẻ & làm đẹp" },
      { icon: "bi-lightning", label: "Flash sale" },
    ],
    hideOnMobile: false,
    theme: { brand: "#f97316", radius: "12px", shadow: "0 10px 30px rgba(0,0,0,.06)" },
  },
  inspector: [
    { key: "title", label: "Title", kind: "text" },
    { key: "items", label: "Items (JSON)", kind: "textarea" },
    { key: "hideOnMobile", label: "Hide on Mobile", kind: "check" },
    { key: "panelId", label: "Panel Id", kind: "text" },
    { key: "theme.brand", label: "Brand Color (hex)", kind: "text" },
    { key: "theme.radius", label: "Radius", kind: "text" },
    { key: "theme.shadow", label: "Shadow", kind: "text" },
  ],
  render: (p: any) => <CategoryShop {...p} preview />,
};
