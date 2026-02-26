// =====================================================
// FILE: components/templates/header/HeaderShop.tsx
// =====================================================
"use client";

import React, { useEffect, useId, useMemo } from "react";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/components/admin/shared/templates/ShopTemplate/styles/home/header/header-shop.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ===================== Types ===================== */
export type MenuItem = { label: string; href?: string };
export type CategoryOption = { value: string; label: string };

export type HeaderShopProps = {
  brandText?: string;
  brandHref?: string;
  logoIcon?: string;
  categories?: CategoryOption[];
  searchPlaceholder?: string;
  hotline?: string;
  hotlineTime?: string;
  wishCount?: number;
  cartCount?: number;
  navItems?: MenuItem[];
  theme?: { brand?: string; muted?: string };
  preview?: boolean;
};

export default function HeaderShop({
  brandText = "BanSach.com",
  brandHref = "/",
  logoIcon = "bi-bag-check-fill",
  categories = [
    { value: "all", label: "Tất cả" },
    { value: "fashion", label: "Thời trang" },
    { value: "shoes", label: "Giày dép" },
    { value: "accessories", label: "Phụ kiện" },
  ],
  searchPlaceholder = "Tìm kiếm sản phẩm… (nhấn / để focus)",
  hotline = "0963.334.837",
  hotlineTime = "8:00–21:00",
  wishCount = 0,
  cartCount = 0,
  navItems = [
    { label: "Trang chủ", href: "/" },
    { label: "Thời trang", href: "/c/fashion" },
    { label: "Giày dép", href: "/c/shoes" },
    { label: "Phụ kiện", href: "/c/accessories" },
    { label: "Sản phẩm", href: "/products" },
    { label: "Khuyến mãi", href: "/deals" },
    { label: "Liên hệ", href: "/contact" },
    { label: "Tin tức", href: "/news" },
  ],
  theme = { brand: "#f97316", muted: "#6b7280" },
  preview = false,
}: HeaderShopProps) {
  useEffect(() => {
    const el = document.querySelector(`.${cls.header}`) as HTMLElement | null;
    if (!el) return;
    if (theme?.brand) el.style.setProperty("--brand", theme.brand);
    if (theme?.muted) el.style.setProperty("--muted", theme.muted);
  }, [theme?.brand, theme?.muted]);

  const stop = (e: React.MouseEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const inputId = useId();
  const selectId = useMemo(() => `${inputId}-select`, [inputId]);

  return (
    <header className={cls.header} onClick={preview ? stop : undefined} aria-hidden={preview || undefined}>
      <div className={[cls.container, cls.headerRow].join(" ")}>
        {/* Logo */}
        <a className={cls.logo} href={brandHref} aria-label="Trang chủ">
          <i className={`bi ${logoIcon}`}></i>
          {brandText}
        </a>

        {/* Search with category, voice, suggestions */}
        <div className={cls.search} role="search">
          <label className="sr-only" htmlFor={inputId}>
            Tìm kiếm
          </label>
          <select id={selectId} aria-label="Danh mục" className={cls.catSelect} defaultValue={categories[0]?.value}>
            {categories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
          <input id={inputId} placeholder={searchPlaceholder} autoComplete="off" className={cls.searchInput} />
          <button className={cls.iconBtn} aria-label="Tìm bằng giọng nói">
            <i className="bi bi-mic" />
          </button>
          <button className={cls.iconBtn} aria-label="Quét mã">
            <i className="bi bi-qr-code-scan" />
          </button>
          <button className={[cls.btn, cls.searchBtn].join(" ")}>
            <i className="bi bi-search" />
            <span className={cls.labelHide}>Tìm</span>
          </button>
          <div className={cls.suggest} aria-live="polite">
            <h5>Gợi ý nhanh</h5>
            <ul></ul>
          </div>
        </div>

        {/* Actions: account + hotline */}
        <div className={cls.headerActions}>
          {/* Account dropdown */}
          <div className={[cls.ha, cls.alt].join(" ")}>
            <i className="bi bi-person-circle" style={{ fontSize: 20 }} />
            <span>Tài khoản</span>
            <div className={cls.dropdown} role="menu">
              <div className={cls.inner}>
                <a className={cls.item} href="#">
                  <i className="bi bi-box-arrow-in-right" />
                  Đăng nhập
                </a>
                <a className={cls.item} href="#">
                  <i className="bi bi-person-add" />
                  Đăng ký
                </a>
                <div className={cls.hr}></div>
                <a className={cls.item} href="#">
                  <i className="bi bi-receipt" />
                  Đơn hàng của tôi
                </a>
                <a className={cls.item} href="#">
                  <i className="bi bi-geo-alt" />
                  Sổ địa chỉ
                </a>
              </div>
            </div>
          </div>

          {/* Hotline */}
          <div className={cls.ha} aria-label="Hotline hỗ trợ">
            <i className="bi bi-headset" style={{ fontSize: 20, color: "var(--brand)" }} />
            <div className={cls.contact}>
              <div style={{ fontWeight: 500 }}>{hotline}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{hotlineTime}</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== Nav ===== */}
      <div className={cls.navWrap}>
        <div className={[cls.container, cls.nav].join(" ")}>
          <button className={cls.allcatsBtn}>
            <i className="bi bi-list" />
            <span className={cls.labelHide}>Danh mục sản phẩm</span>
          </button>

          <div className={cls.menuLink}>
            {navItems.map((m, i) => (
              <a key={i} href={m.href || "#"}>
                {m.label}
              </a>
            ))}
          </div>

          <div className={cls.notification}>
            {/* Wishlist */}
            <div className={[cls.ha, cls.alt].join(" ")}>
              <i className="bi bi-heart" />
              <div className={cls.bubble}>{wishCount}</div>
              <div className={cls.dropdown}>
                <div className={cls.inner}>Chưa có sản phẩm yêu thích.</div>
              </div>
            </div>

            {/* Cart */}
            <div className={[cls.ha, cls.alt].join(" ")}>
              <i className="bi bi-cart3" style={{ fontSize: 15 }} />
              <div className={cls.bubble}>{cartCount}</div>
              <div className={cls.dropdown}>
                <div className={cls.inner}>Giỏ hàng trống.</div>
                <div className={cls.miniCartFoot}>
                  <button className={[cls.btn, cls.outline].join(" ")}>Xem giỏ</button>
                  <button className={cls.btn}>Thanh toán</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ===================== RegItem ===================== */
export const HEADER_SHOP: RegItem = {
  kind: "header.shop-basic",
  label: "Header — Shop (Basic)",
  defaults: {
    brandText: "BanSach.com",
    brandHref: "/",
    logoIcon: "bi-bag-check-fill",
    categories: [
      { value: "all", label: "Tất cả" },
      { value: "fashion", label: "Thời trang" },
      { value: "shoes", label: "Giày dép" },
      { value: "accessories", label: "Phụ kiện" },
    ],
    searchPlaceholder: "Tìm kiếm sản phẩm… (nhấn / để focus)",
    hotline: "0963.334.837",
    hotlineTime: "8:00–21:00",
    wishCount: 0,
    cartCount: 0,
    navItems: [
      { label: "Trang chủ", href: "/" },
      { label: "Thời trang", href: "/c/fashion" },
      { label: "Giày dép", href: "/c/shoes" },
      { label: "Phụ kiện", href: "/c/accessories" },
      { label: "Sản phẩm", href: "/products" },
      { label: "Khuyến mãi", href: "/deals" },
      { label: "Liên hệ", href: "/contact" },
      { label: "Tin tức", href: "/news" },
    ],
    theme: { brand: "#f97316", muted: "#6b7280" },
  },
  inspector: [
    { key: "brandText", label: "Brand Text", kind: "text" },
    { key: "brandHref", label: "Brand Href", kind: "text" },
    { key: "logoIcon", label: "Logo Icon (bi-*)", kind: "text" },

    { key: "searchPlaceholder", label: "Search Placeholder", kind: "text" },

    { key: "hotline", label: "Hotline", kind: "text" },
    { key: "hotlineTime", label: "Hotline Time", kind: "text" },

    { key: "wishCount", label: "Wish Count", kind: "number" },
    { key: "cartCount", label: "Cart Count", kind: "number" },

    { key: "navItems", label: "Nav Items (JSON)", kind: "textarea" },
    { key: "categories", label: "Categories (JSON)", kind: "textarea" },

    { key: "theme.brand", label: "Brand Color (hex)", kind: "text" },
    { key: "theme.muted", label: "Muted Color (hex)", kind: "text" },
  ],
  render: (p: any) => <HeaderShop {...p} preview />,
};
