// ================================
// File: components/templates/header/HeaderFlex.tsx
// ================================
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import cls from "@/styles/admin/templates/header/header-flex.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ========= Types ========= */
export type ShopVariant = "shopee" | "store-classic" | "store-compact" | "store-mega" | "store-minimal";
export type SocialName = "fb" | "tw" | "ig" | "yt" | "pin";

export type NavItem = {
  label: string;
  href?: string;
  icon?: string;
  badge?: string;
  children?: NavItem[]; // 1 cấp hoặc dùng như mega-list
};

export type TopLink = { label: string; href: string };

// mở rộng preset để hợp lệ với ocean/emerald/crimson
export type ThemePreset = "teal" | "coral" | "violet" | "amber" | "slate" | "emerald" | "crimson" | "ocean";
export type ThemeCustom = { brand: string; brand2?: string };

export type HeaderShopFlexProps = {
  variant?: ShopVariant;
  theme?: ThemePreset | ThemeCustom;
  density?: "compact" | "cozy" | "comfortable";
  logoSrc?: string;
  brandText?: string;
  brandHref?: string;
  searchPlaceholder?: string;
  cartCount?: number;
  notifCount?: number;
  userName?: string | null; // null = chưa đăng nhập
  topLinks?: TopLink[]; // topbar bên trên search
  categories: NavItem[]; // thanh danh mục dưới
  actions?: { wishlist?: boolean; orders?: boolean; help?: boolean };
  hotKeywords?: string[]; // gợi ý nhanh dưới ô tìm kiếm
  promoStrip?: { text: string; href?: string } | null; // dải voucher nhanh
  preview?: boolean; // chặn điều hướng trong canvas
  sticky?: boolean;
};

/* ========= Helpers ========= */
function parseJson<T>(json?: string, fall: T = [] as any): T {
  if (!json) return fall;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fall;
  }
}

function themeVars(theme?: ThemePreset | ThemeCustom): React.CSSProperties | undefined {
  if (!theme) return undefined;
  if (typeof theme === "string") return undefined; // preset handled by [data-theme]
  return { ["--brand" as any]: theme.brand, ["--brand-2" as any]: theme.brand2 ?? theme.brand } as React.CSSProperties;
}

/* ========= Component ========= */
export default function HeaderShopFlex({
  variant = "shopee",
  theme = "teal",
  density = "cozy",
  logoSrc = "/assets/images/logo.png",
  brandText = "LowCode",
  brandHref = "/",
  searchPlaceholder = "Tìm kiếm sản phẩm, danh mục, thương hiệu…",
  cartCount = 0,
  notifCount = 0,
  userName = null,
  topLinks = [
    { label: "Kênh người bán", href: "#" },
    { label: "Tải ứng dụng", href: "#" },
  ],
  categories = [],
  actions = { wishlist: true, orders: true, help: true },
  hotKeywords = ["Mã freeship", "Flash Sale", "iPhone 15", "Áo thun basic"],
  promoStrip = { text: "🔥 Săn voucher cuối tuần – Giảm đến 60%", href: "/voucher" },
  preview = false,
  sticky = true,
  // NEW props cho scope (giống Shopee)
  scopeOptions = ["Toàn bộ", "Trong Điện thoại", "Trong Thời trang", "Trong Laptop"],
  scopeDefault = 0,
}: HeaderShopFlexProps & { scopeOptions?: string[]; scopeDefault?: number }) {
  const [shadow, setShadow] = useState(false);
  const [openCat, setOpenCat] = useState(false); // mobile/offcanvas
  const [scopeIdx, setScopeIdx] = useState(scopeDefault);

  useEffect(() => {
    if (!sticky) return;
    const onScroll = () => setShadow(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [sticky]);

  const stopNav = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const CatLink = ({ item, className }: { item: NavItem; className?: string }) => {
    const content = (
      <>
        {item.icon && <i className={`bi ${item.icon} ${cls.liIcon}`} aria-hidden />}
        <span>{item.label}</span>
        {item.badge && <em className={cls.liBadge}>{item.badge}</em>}
      </>
    );
    if (preview || !item.href) {
      return (
        <button type="button" className={className} onClick={stopNav}>
          {content}
        </button>
      );
    }
    return (
      <Link href={(item.href as Route) || "#"} className={className}>
        {content}
      </Link>
    );
  };

  return (
    <header
      className={`${cls.header} ${sticky ? cls.sticky : ""} ${shadow ? cls.scrolled : ""}`}
      data-variant={variant}
      data-theme={typeof theme === "string" ? theme : "custom"}
      data-density={density}
      style={themeVars(theme)}>
      {/* ===== Shopee-style brand strip ===== */}
      {promoStrip && (
        <div className={cls.promoStrip} role="note">
          {promoStrip.href ? (
            <Link href={(promoStrip.href as Route) || "#"} className={cls.promoLink} onClick={preview ? (e) => stopNav(e) : undefined}>
              <i className="bi bi-lightning-charge" /> {promoStrip.text}
            </Link>
          ) : (
            <span className={cls.promoLink}>
              <i className="bi bi-lightning-charge" /> {promoStrip.text}
            </span>
          )}
        </div>
      )}

      {/* Shopee-like hero gradient band */}
      <div className={cls.heroBand}>
        {/* ===== Topbar ===== */}
        <div className={cls.topbar}>
          <div className={`${cls.max} ${cls.rowBetween}`}>
            <div className={cls.topLeft}>
              {topLinks.map((l, i) =>
                preview ? (
                  <button key={i} className={cls.topLink} onClick={stopNav} type="button">
                    {l.label}
                  </button>
                ) : (
                  <Link key={i} href={(l.href as Route) || "#"} className={cls.topLink}>
                    {l.label}
                  </Link>
                )
              )}
            </div>
            <div className={cls.topRight}>
              {userName ? (
                <button className={cls.userBtn} onClick={(e) => (preview ? stopNav(e) : undefined)}>
                  <i className="bi bi-person" /> <span>{userName}</span>
                </button>
              ) : (
                <div className={cls.authLinks}>
                  {preview ? (
                    <>
                      <button className={cls.topLink} onClick={stopNav} type="button">
                        Đăng ký
                      </button>
                      <button className={cls.topLink} onClick={stopNav} type="button">
                        Đăng nhập
                      </button>
                    </>
                  ) : (
                    <>
                      <Link href={"/signup" as Route} className={cls.topLink}>
                        Đăng ký
                      </Link>
                      <Link href={"/login" as Route} className={cls.topLink}>
                        Đăng nhập
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ===== Mainbar (logo + search + actions) ===== */}
        <div className={cls.mainbar}>
          <div className={`${cls.max} ${cls.mainGrid}`}>
            {/* Brand */}
            {preview ? (
              <button className={cls.brand} onClick={stopNav} type="button" aria-label="Homepage">
                {logoSrc ? <Image src={logoSrc} alt="Logo" width={44} height={44} className={cls.logo} /> : <span className={cls.logoFallback}>🛍</span>}
                <span className={cls.brandText}>{brandText}</span>
              </button>
            ) : (
              <Link href={(brandHref as Route) || "/"} className={cls.brand} aria-label="Homepage">
                {logoSrc ? <Image src={logoSrc} alt="Logo" width={44} height={44} className={cls.logo} /> : <span className={cls.logoFallback}>🛍</span>}
                <span className={cls.brandText}>{brandText}</span>
              </Link>
            )}

            {/* Search – scope nằm đầu, input ở giữa, nút Tìm ở cuối */}
            <div className={cls.searchWrap}>
              <form className={cls.search} role="search" onSubmit={(e) => e.preventDefault()}>
                {/* Scope pill */}
                <div className={cls.scopeWrap}>
                  <select className={cls.scopeSelect} value={scopeIdx} onChange={(e) => setScopeIdx(Number(e.target.value))} aria-label="Phạm vi tìm kiếm">
                    {scopeOptions.map((opt, i) => (
                      <option key={i} value={i}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  <span className={cls.scopeCaret} aria-hidden />
                </div>

                {/* Icon + input */}
                <i className={`bi bi-search ${cls.searchIcon}`} />
                <input className={cls.searchInput} placeholder={searchPlaceholder} aria-label="Từ khóa tìm kiếm" />

                {/* CTA tìm kiếm */}
                <button className={cls.searchBtn} type="submit">
                  <i className="bi bi-arrow-right" aria-hidden />
                </button>
              </form>

              {hotKeywords?.length ? (
                <div className={cls.hotKeywords}>
                  {hotKeywords.map((kw, i) =>
                    preview ? (
                      <button key={i} className={cls.hotLink} onClick={stopNav} type="button">
                        {kw}
                      </button>
                    ) : (
                      <Link key={i} href={("/search?q=" + encodeURIComponent(kw)) as Route} className={cls.hotLink}>
                        {kw}
                      </Link>
                    )
                  )}
                </div>
              ) : null}
            </div>

            {/* Actions */}
            <div className={cls.actions}>
              {actions?.wishlist && (
                <button className={cls.iconBtn} onClick={(e) => (preview ? stopNav(e) : undefined)} title="Đã thích" aria-label="Yêu thích">
                  <i className="bi bi-heart" />
                </button>
              )}
              {actions?.orders && (
                <button className={cls.iconBtn} onClick={(e) => (preview ? stopNav(e) : undefined)} title="Đơn hàng" aria-label="Đơn hàng">
                  <i className="bi bi-receipt" />
                </button>
              )}
              {actions?.help && (
                <button className={cls.iconBtn} onClick={(e) => (preview ? stopNav(e) : undefined)} title="Hỗ trợ" aria-label="Hỗ trợ">
                  <i className="bi bi-question-circle" />
                </button>
              )}

              <button className={cls.iconBtn} onClick={(e) => (preview ? stopNav(e) : undefined)} title="Thông báo" aria-label="Thông báo">
                <i className="bi bi-bell" />
                {notifCount > 0 && <span className={cls.badge}>{Math.min(99, notifCount)}</span>}
              </button>

              <button className={cls.cartBtn} onClick={(e) => (preview ? stopNav(e) : undefined)} aria-label="Giỏ hàng">
                <i className="bi bi-cart2" />
                <span>Giỏ hàng</span>
                {cartCount > 0 && <em className={cls.cartCount}>{Math.min(99, cartCount)}</em>}
              </button>

              {/* Mobile burger */}
              <button className={cls.burger} aria-expanded={openCat} onClick={() => setOpenCat((v) => !v)} aria-label="Menu">
                <span />
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* ========= RegItem for Canvas / Registry ========= */
export const HEADER_SHOP_FLEX: RegItem = {
  kind: "HeaderShopFlex",
  label: "Header",
  defaults: {
    variant: "shopee",
    theme: "teal",
    density: "cozy",
    logoSrc: "/assets/images/logo.png",
    brandText: "LowCode Mart",
    brandHref: "/",
    searchPlaceholder: "Flash sale, Áo thun, iPhone 15…",
    cartCount: 2,
    notifCount: 1,
    userName: null,
    topLinksJson: JSON.stringify(
      [
        { label: "Kênh người bán", href: "/seller" },
        { label: "Tải ứng dụng", href: "/apps" },
        { label: "Kết nối", href: "#" },
      ],
      null,
      2
    ),
    categoriesJson: JSON.stringify(
      [
        {
          label: "Điện thoại & Tablet",
          href: "/c/dt",
          children: [
            { label: "Apple", href: "/c/dt/apple", children: [{ label: "iPhone 15", href: "/c/dt/apple/iphone-15" }] },
            { label: "Samsung", href: "/c/dt/samsung" },
            { label: "Xiaomi", href: "/c/dt/xiaomi" },
          ],
        },
        {
          label: "Máy tính & Laptop",
          href: "/c/pc",
          children: [
            { label: "Laptop Gaming", href: "/c/pc/gaming" },
            { label: "Văn phòng", href: "/c/pc/office" },
          ],
        },
        {
          label: "Thời trang",
          href: "/c/fashion",
          children: [
            { label: "Nam", href: "/c/fashion/men" },
            { label: "Nữ", href: "/c/fashion/women" },
          ],
        },
        { label: "Mẹ & Bé", href: "/c/mom-baby" },
        { label: "Sắc đẹp", href: "/c/beauty" },
      ],
      null,
      2
    ),
    hotKeywordsJson: JSON.stringify(["Mã freeship", "Flash Sale", "iPhone 15", "Áo thun basic"], null, 2),
    promoStripJson: JSON.stringify({ text: "🔥 Săn voucher cuối tuần – Giảm đến 60%", href: "/voucher" }, null, 2),
    note: "Shopee-like ecommerce header, switchable variants + themes.",
  },
  inspector: [
    { key: "variant", label: "Variant", kind: "select", options: ["shopee", "store-classic", "store-compact", "store-mega", "store-minimal"] },
    { key: "theme", label: "Theme (preset)", kind: "select", options: ["teal", "coral", "violet", "amber", "slate", "emerald", "crimson", "ocean"] },
    { key: "density", label: "Density", kind: "select", options: ["compact", "cozy", "comfortable"] },
    { key: "brandText", label: "Brand Text", kind: "text" },
    { key: "brandHref", label: "Brand Href", kind: "text" },
    { key: "logoSrc", label: "Logo URL", kind: "text" },
    { key: "searchPlaceholder", label: "Search Placeholder", kind: "text" },
    { key: "cartCount", label: "Cart Count", kind: "number" },
    { key: "notifCount", label: "Notif Count", kind: "number" },
    { key: "userName", label: "User Name (null=guest)", kind: "text" },
    { key: "topLinksJson", label: "Top Links (JSON)", kind: "textarea" },
    { key: "categoriesJson", label: "Categories (JSON)", kind: "textarea" },
    { key: "hotKeywordsJson", label: "Hot Keywords (JSON)", kind: "textarea" },
    { key: "promoStripJson", label: "Promo Strip (JSON)", kind: "textarea" },
  ],
  render: (p) => {
    const theme = typeof p.theme === "string" ? p.theme : parseJson(p.theme);
    const topLinks = parseJson<TopLink[]>(p.topLinksJson, []);
    const categories = parseJson<NavItem[]>(p.categoriesJson, []);
    const hotKeywords = parseJson<string[]>(p.hotKeywordsJson, []);
    const promoStrip = parseJson<{ text: string; href?: string } | null>(p.promoStripJson, null);

    return (
      <div aria-label="HeaderShopFlex">
        <HeaderShopFlex
          variant={(p.variant as ShopVariant) || "shopee"}
          theme={theme as any}
          density={(p.density as any) || "cozy"}
          logoSrc={p.logoSrc}
          brandText={p.brandText}
          brandHref={p.brandHref}
          searchPlaceholder={p.searchPlaceholder}
          cartCount={Number(p.cartCount ?? 0)}
          notifCount={Number(p.notifCount ?? 0)}
          userName={p.userName ?? null}
          topLinks={topLinks}
          categories={categories}
          hotKeywords={hotKeywords}
          promoStrip={promoStrip}
          preview={true}
          sticky={false}
        />
      </div>
    );
  },
};
