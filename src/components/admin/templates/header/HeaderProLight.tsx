"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import cls from "@/styles/admin/templates/header/header-pro-light.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ========= Types ========= */
export type ShopVariant = "pro-light";
export type ThemePreset = "teal" | "coral" | "violet" | "amber" | "slate";
export type ThemeCustom = { brand: string; brand2?: string };

export type NavItem = {
  label: string;
  href?: string;
  icon?: string;
  badge?: string;
  children?: NavItem[];
};

export type TopLink = { label: string; href: string };

export type HeaderProLightProps = {
  variant?: ShopVariant;
  theme?: ThemePreset | ThemeCustom;
  logoSrc?: string;
  brandText?: string;
  brandHref?: string;
  cartCount?: number;
  userName?: string | null;
  topLinks?: TopLink[];
  categories: NavItem[];
  preview?: boolean;
  sticky?: boolean;
};

/* ========= Helpers ========= */
const isExternal = (href: string) => /^(?:https?:)?\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");

const parseJson = <T,>(json?: string, fall: T = [] as any): T => {
  if (!json) return fall;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fall;
  }
};

/* ========= Component ========= */
export default function HeaderProLight({
  variant = "pro-light",
  theme = "teal",
  logoSrc = "/assets/images/logo.png",
  brandText = "LowCode Mall",
  brandHref = "/",
  cartCount = 2,
  userName = null,
  topLinks = [
    { label: "Kênh Người Bán", href: "#" },
    { label: "Trở thành Nhà Bán", href: "#" },
    { label: "Tải ứng dụng", href: "#" },
  ],
  categories = [],
  preview = false,
  sticky = true,
}: HeaderProLightProps) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (!sticky) return;
    const onScroll = () => setCompact(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sticky]);

  const stopNav = (e: React.SyntheticEvent) => {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <header className={`${cls.header} ${compact ? cls.compact : ""}`} data-variant={variant} data-theme={typeof theme === "string" ? theme : "custom"}>
      {/* ===== Topbar ===== */}
      <div className={cls.topbar}>
        <div className={`${cls.max} ${cls.rowBetween}`}>
          <div className={cls.topLeft}>
            {topLinks.map((l, i) =>
              preview ? (
                <button key={i} className={cls.topLink} onClick={stopNav}>
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
              <button className={cls.userBtn} onClick={stopNav}>
                <i className="bi bi-person" /> <span>{userName}</span>
              </button>
            ) : (
              <div className={cls.authLinks}>
                {preview ? (
                  <>
                    <button className={cls.topLink}>Đăng ký</button>
                    <button className={cls.topLink}>Đăng nhập</button>
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

      {/* ===== Main bar ===== */}
      <div className={cls.mainbar}>
        <div className={`${cls.max} ${cls.mainGrid}`}>
          <Link href={(brandHref as Route) || "/"} className={cls.brand}>
            <div className={cls.logoBox}>{logoSrc ? <Image src={logoSrc} alt="Logo" width={38} height={38} /> : <span>LC</span>}</div>
            <div className={cls.brandName}>
              <div>{brandText}</div>
              <small>Mall</small>
            </div>
          </Link>

          {/* Search */}
          <form className={cls.search} onSubmit={(e) => e.preventDefault()}>
            <select className={cls.select}>
              <option>Tất cả danh mục</option>
              <option>Điện thoại - Tablet</option>
              <option>Laptop - PC</option>
              <option>Thời trang</option>
              <option>Đồ gia dụng</option>
            </select>
            <input className={cls.input} placeholder="Tìm trong LowCode Mall..." />
            <button className={cls.searchBtn}>
              <i className="bi bi-search" />
            </button>
          </form>

          {/* Actions */}
          <div className={cls.actions}>
            <button className={cls.iconBtn} onClick={stopNav}>
              <i className="bi bi-heart" />
            </button>
            <button className={cls.iconBtn} onClick={stopNav}>
              <i className="bi bi-cart3" />
              {cartCount > 0 && <span className={cls.badge}>{cartCount}</span>}
            </button>
            <button className={`${cls.loginBtn}`} onClick={stopNav}>
              <i className="bi bi-person-circle" /> <span>Đăng nhập</span>
            </button>
          </div>
        </div>
      </div>

      {/* ===== Nav bar ===== */}
      <nav className={cls.nav}>
        <div className={cls.max}>
          <ul className={cls.navList}>
            {categories.map((c, i) => (
              <li key={i} className={cls.navItem}>
                {renderNav(c)}
                {c.children?.length ? (
                  <div className={cls.dropdown}>
                    <div className={cls.dropdownInner}>
                      {c.children.map((col, j) => (
                        <div key={j} className={cls.col}>
                          <div className={cls.colTitle}>{col.label}</div>
                          {col.children?.map((s, k) => (
                            <Link key={k} href={(s.href as Route) || "#"} className={cls.tile}>
                              <i className={`bi ${s.icon || "bi-dot"}`} />
                              <span>{s.label}</span>
                            </Link>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      </nav>
    </header>
  );

  function renderNav(it: NavItem) {
    const content = (
      <>
        {it.icon && <i className={`bi ${it.icon} ${cls.liIcon}`} />}
        <span>{it.label}</span>
      </>
    );
    if (preview)
      return (
        <button type="button" className={cls.navLink} onClick={stopNav}>
          {content}
        </button>
      );
    if (!it.href) return <span className={cls.navLink}>{content}</span>;
    const ext = isExternal(it.href);
    return ext ? (
      <a href={it.href} className={cls.navLink} target="_blank" rel="noreferrer">
        {content}
      </a>
    ) : (
      <Link href={it.href as Route} className={cls.navLink}>
        {content}
      </Link>
    );
  }
}

/* ========= RegItem ========= */
export const HEADER_PRO_LIGHT: RegItem = {
  kind: "HeaderProLight",
  label: "Header Pro",
  defaults: {
    variant: "pro-light",
    theme: "teal",
    logoSrc: "/assets/images/logo.png",
    brandText: "LowCode",
    brandHref: "/",
    cartCount: 2,
    userName: null,
    topLinksJson: JSON.stringify(
      [
        { label: "Kênh Người Bán", href: "#" },
        { label: "Trở thành Nhà Bán", href: "#" },
        { label: "Tải ứng dụng", href: "#" },
      ],
      null,
      2
    ),
    categoriesJson: JSON.stringify(
      [
        {
          label: "Điện tử",
          href: "/c/electronics",
          children: [
            {
              label: "Điện thoại & Tablet",
              children: [
                { label: "iPhone", href: "#" },
                { label: "Android", href: "#" },
                { label: "Máy tính bảng", href: "#" },
              ],
            },
            {
              label: "Laptop & PC",
              children: [
                { label: "Ultrabook", href: "#" },
                { label: "Gaming", href: "#" },
              ],
            },
          ],
        },
        { label: "Thời trang", href: "#" },
        { label: "Làm đẹp", href: "#" },
        { label: "Nhà cửa", href: "#" },
        { label: "Flash Sale", href: "#" },
      ],
      null,
      2
    ),
    note: "Premium light gradient ecommerce header",
  },
  inspector: [
    { key: "variant", label: "Variant", kind: "select", options: ["pro-light"] },
    { key: "theme", label: "Theme", kind: "select", options: ["teal", "coral", "violet", "amber", "slate"] },
    { key: "brandText", label: "Brand Text", kind: "text" },
    { key: "logoSrc", label: "Logo URL", kind: "text" },
    { key: "brandHref", label: "Brand Href", kind: "text" },
    { key: "cartCount", label: "Cart Count", kind: "number" },
    { key: "userName", label: "User Name", kind: "text" },
    { key: "topLinksJson", label: "Top Links (JSON)", kind: "textarea" },
    { key: "categoriesJson", label: "Categories (JSON)", kind: "textarea" },
  ],
  render: (p) => {
    const topLinks = parseJson<TopLink[]>(p.topLinksJson, []);
    const categories = parseJson<NavItem[]>(p.categoriesJson, []);
    return (
      <HeaderProLight
        variant={(p.variant as ShopVariant) || "pro-light"}
        theme={p.theme as any}
        logoSrc={p.logoSrc}
        brandText={p.brandText}
        brandHref={p.brandHref}
        cartCount={Number(p.cartCount ?? 0)}
        userName={p.userName ?? null}
        topLinks={topLinks}
        categories={categories}
        preview={true}
        sticky={false}
      />
    );
  },
};
