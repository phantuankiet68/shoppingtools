"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import cls from "@/styles/admin/templates/header/header-account-nova.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ===== Types ===== */
export type ShopVariant = "account-nova";
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

export type HeaderAccountNovaProps = {
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

/* ===== Helpers ===== */
const isExternal = (href?: string) => typeof href === "string" && (/^(?:https?:)?\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:"));

const parseJson = <T,>(json?: string, fall: T = [] as any): T => {
  if (!json) return fall;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fall;
  }
};

/* ===== Component ===== */
export default function HeaderAccountNova({
  variant = "account-nova",
  theme = "violet",
  logoSrc = "/assets/images/logo-game.png",
  brandText = "NovaAccounts",
  brandHref = "/",
  cartCount = 0,
  userName = null,
  topLinks = [
    { label: "Người bán xác thực", href: "#" },
    { label: "Chính sách đổi trả", href: "#" },
    { label: "Hướng dẫn mua", href: "#" },
  ],
  categories = [],
  preview = false,
  sticky = true,
}: HeaderAccountNovaProps) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    if (!sticky) return;
    const onScroll = () => setCompact(window.scrollY > 28);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [sticky]);

  // Inline CSS vars for custom theme
  const customStyle =
    typeof theme === "string"
      ? undefined
      : ({
          // allow overriding gradient/tokens from inspector
          ["--brand" as any]: theme.brand,
          ["--brand2" as any]: theme.brand2 ?? theme.brand,
        } as React.CSSProperties);

  // Stop navigation in preview mode
  const stopNav = (e: React.SyntheticEvent) => {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <header className={`${cls.header} ${compact ? cls.compact : ""}`} data-variant={variant} data-theme={typeof theme === "string" ? theme : "custom"} style={customStyle} role="banner">
      {/* Top status bar */}
      <div className={cls.top}>
        <div className={`${cls.container} ${cls.topInner}`}>
          <div className={cls.topLeft}>
            <span className={cls.pill} aria-live="polite">
              <span className={cls.dot} aria-hidden />
              Tài khoản: Có sẵn
            </span>
            <span className={cls.pill}>
              <i className="bi bi-people" aria-hidden /> 24,812 người mua
            </span>
            <span className={cls.pill}>
              <i className="bi bi-globe2" aria-hidden /> Khu vực: VN
            </span>
          </div>

          <div className={cls.topRight}>
            {/* dynamic links from inspector */}
            {topLinks?.slice(0, 3).map((l, i) =>
              isExternal(l.href) ? (
                <a key={i} className={cls.topLink} href={l.href} target="_blank" rel="noreferrer">
                  {l.label}
                </a>
              ) : (
                <Link key={i} href={(l.href as Route) || "#"} className={cls.topLink} onClick={stopNav}>
                  {l.label}
                </Link>
              )
            )}
            <span className={cls.pill}>
              <i className="bi bi-shield-check" aria-hidden /> Người bán xác thực
            </span>
            <span className={cls.pill}>
              <i className="bi bi-chat-dots" aria-hidden /> Hỗ trợ 24/7
            </span>
            <div className={cls.langDrop}>
              <button className={cls.langBtn} onClick={stopNav} aria-label="Chọn ngôn ngữ">
                <i className="bi bi-translate" aria-hidden /> Tiếng Việt
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className={cls.headerMain}>
        <div className={`${cls.container} ${cls.mainInner}`}>
          {/* mobile toggler */}
          <button className={`${cls.iconBtnGhost} ${cls.mobileTog}`} data-bs-toggle="offcanvas" data-bs-target="#accountNav" aria-label="Mở menu">
            <i className="bi bi-list" />
          </button>

          <Link href={(brandHref as Route) || "/"} className={cls.brand} aria-label="Trang chủ">
            <div className={cls.logo} aria-hidden>
              {logoSrc ? <Image src={logoSrc} alt="" width={44} height={44} /> : <span>NA</span>}
            </div>
            <div className={cls.title}>
              <div className={cls.brandText}>{brandText}</div>
              <small>Bán tài khoản an toàn</small>
            </div>
          </Link>

          {/* search (desktop) */}
          <form className={`${cls.search} d-none d-xl-flex`} role="search" onSubmit={(e) => e.preventDefault()}>
            <input className="form-control" placeholder="Tìm tài khoản theo game, giá, mức rank..." aria-label="Tìm kiếm" />
            <button className={cls.iconBtn} type="submit" aria-label="Tìm kiếm">
              <i className="bi bi-search" />
            </button>
          </form>

          {/* actions */}
          <div className={cls.actions}>
            <button className={cls.iconBtn} onClick={stopNav} aria-label="Yêu thích">
              <i className="bi bi-heart" />
            </button>

            <button className={`${cls.iconBtn} ${cls.cartBtn}`} onClick={stopNav} aria-label="Giỏ hàng">
              <i className="bi bi-cart3" />
              {cartCount > 0 && <span className={cls.badge}>{Math.min(99, cartCount)}</span>}
            </button>

            <Link href={userName ? ("/profile" as Route) : ("/login" as Route)} className={cls.btnGhost} onClick={stopNav}>
              <i className="bi bi-person" aria-hidden /> <span>{userName ? userName : "Đăng nhập"}</span>
            </Link>

            <a className={cls.btnCta} href="#" onClick={stopNav}>
              <i className="bi bi-credit-card-2-front" aria-hidden /> <span>Mua ngay</span>
            </a>
          </div>
        </div>
      </div>

      {/* Nav + mega */}
      {categories?.length > 0 && (
        <nav className={cls.nav} aria-label="Danh mục chính">
          <div className={cls.container}>
            <ul className={cls.navList} role="menubar" aria-orientation="horizontal">
              {categories.map((c, i) => (
                <li key={i} className={cls.navItem} role="none">
                  {renderNav(c)}
                  {c.children?.length ? (
                    <div className={cls.dd} role="menu">
                      <div className={cls.ddInner}>
                        {c.children.map((col, j) => (
                          <div key={j} className={cls.col}>
                            <div className={cls.colTitle}>{col.label}</div>
                            {col.children?.map((s, k) => {
                              const content = (
                                <>
                                  <div className={cls.ddIco}>
                                    <i className={`bi ${s.icon || "bi-dot"}`} aria-hidden />
                                  </div>
                                  <div>
                                    <div className={cls.ddLabel}>{s.label}</div>
                                    {s.badge && <div className={cls.ddSub}>{s.badge}</div>}
                                  </div>
                                </>
                              );
                              const ext = isExternal(s.href);
                              return ext ? (
                                <a key={k} href={s.href} className={cls.ddLink} target="_blank" rel="noreferrer">
                                  {content}
                                </a>
                              ) : (
                                <Link key={k} href={(s.href as Route) || "#"} className={cls.ddLink} onClick={stopNav}>
                                  {content}
                                </Link>
                              );
                            })}
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
      )}

      {/* quick rail */}
      <div className={cls.rail}>
        <div className={`${cls.container} ${cls.railInner}`}>
          <a href="#" onClick={stopNav}>
            Tài khoản Game
          </a>
          <a href="#" onClick={stopNav}>
            Social
          </a>
          <a href="#" onClick={stopNav}>
            Streaming
          </a>
          <a href="#" onClick={stopNav}>
            Shop
          </a>
          <a href="#" onClick={stopNav}>
            VIP
          </a>
          <a href="#" onClick={stopNav}>
            Mua theo mức giá
          </a>
        </div>
      </div>

      {/* Offcanvas mobile */}
      <div className="offcanvas offcanvas-start text-bg-dark" tabIndex={-1} id="accountNav" aria-labelledby="accountNavLabel" style={{ width: "300px" }}>
        <div className="offcanvas-header">
          <h5 id="accountNavLabel">NovaAccounts</h5>
          <button type="button" className="btn-close btn-close-white" data-bs-dismiss="offcanvas" aria-label="Đóng" />
        </div>
        <div className="offcanvas-body">
          <div className="input-group mb-3">
            <span className="input-group-text bg-transparent border-0 text-light">
              <i className="bi bi-search" />
            </span>
            <input type="search" className="form-control bg-transparent border-0 text-light" placeholder="Tìm tài khoản..." aria-label="Tìm tài khoản" />
          </div>
          <div className="d-grid gap-2">
            <a className="btn btn-outline-light w-100" href="#" onClick={stopNav}>
              Tài khoản Game
            </a>
            <a className="btn btn-outline-light w-100" href="#" onClick={stopNav}>
              Social
            </a>
            <a className="btn btn-primary w-100" href="#" onClick={stopNav}>
              Mua ngay
            </a>
          </div>
        </div>
      </div>
    </header>
  );

  function renderNav(it: NavItem) {
    const content = (
      <>
        {it.icon && <i className={`bi ${it.icon} ${cls.liIcon}`} aria-hidden />}
        <span>{it.label}</span>
        {it.badge && <span className={cls.navBadge}>{it.badge}</span>}
      </>
    );

    if (preview)
      return (
        <button type="button" className={cls.navLink} onClick={stopNav} role="menuitem">
          {content}
        </button>
      );

    if (!it.href) return <span className={cls.navLink}>{content}</span>;

    const ext = isExternal(it.href);
    return ext ? (
      <a href={it.href} className={cls.navLink} target="_blank" rel="noreferrer" role="menuitem">
        {content}
      </a>
    ) : (
      <Link href={it.href as Route} className={cls.navLink} role="menuitem">
        {content}
      </Link>
    );
  }
}

/* ===== RegItem ===== */
export const HEADER_ACCOUNT_NOVA: RegItem = {
  kind: "HeaderNova",
  label: "Header Nova",
  defaults: {
    variant: "account-nova",
    theme: "violet",
    logoSrc: "/assets/images/logo-game.png",
    brandText: "NovaAccounts",
    brandHref: "/",
    cartCount: 0,
    userName: null,
    topLinksJson: JSON.stringify(
      [
        { label: "Người bán xác thực", href: "#" },
        { label: "Chính sách", href: "#" },
        { label: "Hướng dẫn mua", href: "#" },
      ],
      null,
      2
    ),
    categoriesJson: JSON.stringify(
      [
        {
          label: "Tài khoản",
          href: "/c/accounts",
          children: [
            {
              label: "Game Accounts",
              children: [
                { label: "Liên Minh", href: "/c/accounts/lm", icon: "bi-controller" },
                { label: "PUBG", href: "/c/accounts/pubg", icon: "bi-controller" },
                { label: "Free Fire", href: "/c/accounts/ff", icon: "bi-controller" },
              ],
            },
            {
              label: "Streaming / Social",
              children: [
                { label: "Twitch", href: "/c/accounts/twitch", icon: "bi-tv" },
                { label: "YouTube", href: "/c/accounts/yt", icon: "bi-youtube" },
              ],
            },
          ],
        },
        { label: "Shop", href: "/c/shop" },
        { label: "VIP", href: "/c/vip" },
        { label: "Hỗ trợ", href: "/c/support" },
      ],
      null,
      2
    ),
    note: "Neon header adapted for selling accounts",
  },
  inspector: [
    { key: "variant", label: "Variant", kind: "select", options: ["account-nova"] },
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
      <HeaderAccountNova
        variant={(p.variant as ShopVariant) || "account-nova"}
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
