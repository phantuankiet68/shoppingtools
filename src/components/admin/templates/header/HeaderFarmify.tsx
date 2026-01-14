"use client";

import React from "react";
import Link from "next/link";
import cls from "@/styles/admin/templates/header/header-farmify.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ===== Types ===== */
type NavItem = { label: string; href?: string; icon?: string };
type Region = string;

export type HeaderFarmifyProps = {
  // Palette tokens
  ink?: string;
  leaf?: string;
  sun?: string;
  earth?: string;
  bgFrom?: string;
  bgMid?: string;
  bgTo?: string;

  // Topbar
  phone?: string;
  showI18n?: boolean;

  // Brand
  badge?: string;
  title?: string;
  subtitle?: string;
  brandHref?: string;

  // Region selector
  regionsJson?: string; // Region[]
  defaultRegionIndex?: number;

  // Search
  categoriesJson?: string; // string[]
  searchPlaceholder?: string;

  // Nav
  navJson?: string; // NavItem[]

  // Leaves animation
  showLeaves?: boolean;

  // Preview mode (disable links/form submit in Builder)
  preview?: boolean;
};

export default function HeaderFarmify({
  // palette (matching your HTML)
  ink = "#2b2514",
  leaf = "#4caf50",
  sun = "#fbc02d",
  earth = "#8d6e63",
  bgFrom = "#fffdf4",
  bgMid = "#fff9e7",
  bgTo = "#fff4dc",

  // topbar
  phone = "1900 6868",
  showI18n = true,

  // brand
  badge = "TP",
  title = "Farmify",
  subtitle = "Đặc sản vùng miền Việt Nam",
  brandHref = "#",

  // region
  regionsJson = JSON.stringify(["🌍 Toàn quốc", "🏔 Miền Bắc", "🏖 Miền Trung", "🌴 Miền Nam", "☕ Tây Nguyên"]),
  defaultRegionIndex = 0,

  // search
  categoriesJson = JSON.stringify(["Tất cả", "Trái cây", "Rau củ", "Đặc sản"]),
  searchPlaceholder = "Tìm: Chè Thái Nguyên, Mật ong, Cà phê Buôn Ma Thuột...",

  // nav
  navJson = JSON.stringify([
    { label: "Đặc sản theo mùa", icon: "stars" },
    { label: "Trái cây – Rau củ", icon: "flower1" },
    { label: "Đồ khô – Gia vị", icon: "cup-hot" },
    { label: "Thực phẩm chế biến", icon: "egg-fried" },
    { label: "Combo quà Tết", icon: "gift" },
    { label: "Ưu đãi", icon: "percent" },
  ]),

  // leaves
  showLeaves = true,

  preview = false,
}: HeaderFarmifyProps) {
  const stop = (e: React.SyntheticEvent) => {
    if (preview) e.preventDefault();
  };

  let regions: Region[] = [];
  try {
    regions = JSON.parse(regionsJson || "[]");
  } catch {
    regions = ["🌍 Toàn quốc"];
  }

  let cats: string[] = [];
  try {
    cats = JSON.parse(categoriesJson || "[]");
  } catch {
    cats = ["Tất cả"];
  }

  let nav: NavItem[] = [];
  try {
    nav = JSON.parse(navJson || "[]");
  } catch {
    nav = [];
  }

  return (
    <div
      className={cls.pageBg}
      style={
        {
          "--tp-ink": ink,
          "--tp-leaf": leaf,
          "--tp-sun": sun,
          "--tp-earth": earth,
          "--tp-bg-from": bgFrom,
          "--tp-bg-mid": bgMid,
          "--tp-bg-to": bgTo,
        } as React.CSSProperties
      }>
      {/* floating leaves */}
      {showLeaves && (
        <>
          <div className={cls.leaf} style={{ left: "10%", animationDelay: "0s" }} />
          <div className={cls.leaf} style={{ left: "40%", animationDelay: "3s" }} />
          <div className={cls.leaf} style={{ left: "70%", animationDelay: "1.5s" }} />
          <div className={cls.leaf} style={{ left: "85%", animationDelay: "5s" }} />
        </>
      )}

      {/* Topbar */}
      <div className={`${cls.topbar} py-1`}>
        <div className="container d-flex justify-content-between flex-wrap gap-2">
          <div>
            <i className="bi bi-telephone"></i> Hotline: {phone}
          </div>
          <div className="d-flex gap-3">
            <a href="#" onClick={stop} className="text-decoration-none">
              <i className="bi bi-geo-alt"></i> Hệ thống cửa hàng
            </a>
            {showI18n && (
              <a href="#" onClick={stop} className="text-decoration-none">
                <i className="bi bi-globe"></i> VI / EN
              </a>
            )}
          </div>
        </div>
      </div>

      <header className={`${cls.header} py-3`}>
        <div className="container d-flex align-items-center flex-wrap gap-3">
          {/* Brand */}
          <Link href={"/brandHref"} className={`${cls.brand}`} onClick={stop}>
            <div className={cls.logo}>{badge}</div>
            <div className={cls.title}>
              <div className="fw-bold fs-4">{title}</div>
              <small>{subtitle}</small>
            </div>
          </Link>

          {/* Region selector */}
          <select className={`${cls.region} ms-lg-4`} defaultValue={Math.min(defaultRegionIndex, regions.length - 1)}>
            {regions.map((r, i) => (
              <option key={i} value={i}>
                {r}
              </option>
            ))}
          </select>

          {/* Search */}
          <form className={`d-flex align-items-center flex-grow-1 mx-lg-4 mt-2 mt-lg-0 ${cls.search}`} onSubmit={(e) => e.preventDefault()}>
            <select className="form-select">
              {cats.map((c, i) => (
                <option key={i}>{c}</option>
              ))}
            </select>
            <input className="form-control" placeholder={searchPlaceholder} />
            <button className="btn px-3" type="submit">
              <i className="bi bi-search" />
            </button>
          </form>

          {/* Icons */}
          <div className="d-flex align-items-center gap-2 ms-auto">
            <button className={cls.iconBtn} aria-label="Yêu thích" type="button">
              <i className="bi bi-heart"></i>
            </button>
            <button className={cls.iconBtn} aria-label="Giỏ hàng" type="button">
              <i className="bi bi-basket3"></i>
            </button>
            <button className={cls.iconBtn} aria-label="Tài khoản" type="button">
              <i className="bi bi-person-circle"></i>
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className="container mt-3">
          <ul className={`nav justify-content-between flex-wrap ${cls.nav}`}>
            {nav.map((n, i) => (
              <li className="nav-item" key={i}>
                <a className={`nav-link ${cls.navLink}`} href={n.href || "#"} onClick={stop}>
                  {n.icon && <i className={`bi bi-${n.icon}`}></i>} {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>
    </div>
  );
}

/* ===== RegItem cho UI Builder ===== */
export const HEADER_FARMIFY: RegItem = {
  kind: "HeaderFarmify",
  label: "Header Farmify (Agri – Warm Paper)",
  defaults: {
    ink: "#2b2514",
    leaf: "#4caf50",
    sun: "#fbc02d",
    earth: "#8d6e63",
    bgFrom: "#fffdf4",
    bgMid: "#fff9e7",
    bgTo: "#fff4dc",

    phone: "1900 6868",
    showI18n: true,

    badge: "TP",
    title: "Farmify",
    subtitle: "Đặc sản vùng miền Việt Nam",
    brandHref: "#",

    regionsJson: JSON.stringify(["🌍 Toàn quốc", "🏔 Miền Bắc", "🏖 Miền Trung", "🌴 Miền Nam", "☕ Tây Nguyên"]),
    defaultRegionIndex: 0,

    categoriesJson: JSON.stringify(["Tất cả", "Trái cây", "Rau củ", "Đặc sản"]),
    searchPlaceholder: "Tìm: Chè Thái Nguyên, Mật ong, Cà phê Buôn Ma Thuột...",

    navJson: JSON.stringify([
      { label: "Đặc sản theo mùa", icon: "stars" },
      { label: "Trái cây – Rau củ", icon: "flower1" },
      { label: "Đồ khô – Gia vị", icon: "cup-hot" },
      { label: "Thực phẩm chế biến", icon: "egg-fried" },
      { label: "Combo quà Tết", icon: "gift" },
      { label: "Ưu đãi", icon: "percent" },
    ]),

    showLeaves: true,
  },
  inspector: [
    // Palette
    { key: "ink", label: "Màu chữ (ink)", kind: "text" },
    { key: "leaf", label: "Xanh lá (leaf)", kind: "text" },
    { key: "sun", label: "Vàng nắng (sun)", kind: "text" },
    { key: "earth", label: "Nâu đất (earth)", kind: "text" },
    { key: "bgFrom", label: "BG từ", kind: "text" },
    { key: "bgMid", label: "BG giữa", kind: "text" },
    { key: "bgTo", label: "BG đến", kind: "text" },

    // Topbar & brand
    { key: "phone", label: "Hotline", kind: "text" },
    { key: "showI18n", label: "Hiện đổi ngôn ngữ", kind: "check" },
    { key: "badge", label: "Badge", kind: "text" },
    { key: "title", label: "Tiêu đề", kind: "text" },
    { key: "subtitle", label: "Phụ đề", kind: "text" },
    { key: "brandHref", label: "Brand link", kind: "text" },

    // Region & search
    { key: "regionsJson", label: "Danh sách vùng (JSON)", kind: "textarea" },
    { key: "defaultRegionIndex", label: "Region mặc định (index)", kind: "number" },
    { key: "categoriesJson", label: "Danh mục tìm kiếm (JSON)", kind: "textarea" },
    { key: "searchPlaceholder", label: "Placeholder tìm kiếm", kind: "text" },

    // Nav
    { key: "navJson", label: "Nav JSON", kind: "textarea" },

    // Leaves
    { key: "showLeaves", label: "Hiệu ứng lá rơi", kind: "check" },
  ],
  render: (p) => <HeaderFarmify {...p} preview={true} />,
};
