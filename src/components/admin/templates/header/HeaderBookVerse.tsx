"use client";

import React from "react";
import Link from "next/link";
import cls from "@/styles/admin/templates/header/header-bookverse.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type HeaderBookVerseProps = {
  // Topbar
  hotline?: string;
  storeText?: string;
  langText?: string;
  accountText?: string;

  // Brand
  badge?: string;
  brandTitle?: string;
  brandSub?: string;

  // Search
  showIsbn?: boolean;
  placeholder?: string;

  // Nav
  navItemsJson?: string; // JSON: { label, href?, children?: {label,href}[] }[]

  preview?: boolean; // chặn navigation khi xem trong Builder
};

type NavItem = {
  label: string;
  href?: string;
  children?: { label: string; href?: string }[];
};

export default function HeaderBookVerse({
  hotline = "Liên hệ: 1900 6868",
  storeText = "Hệ thống cửa hàng",
  langText = "VI / EN",
  accountText = "Tài khoản",
  badge = "BV",
  brandTitle = "BookVerse",
  brandSub = "Hiệu sách của bạn",
  showIsbn = true,
  placeholder = "Tìm sách, tác giả hoặc mã ISBN...",
  navItemsJson = JSON.stringify([
    {
      label: "Thể loại",
      children: [{ label: "Tiểu thuyết" }, { label: "Kinh tế" }, { label: "Tâm lý - Kỹ năng" }, { label: "Sách thiếu nhi" }, { label: "Lịch sử - Văn hóa" }],
    },
    { label: "Sách mới" },
    { label: "Bán chạy" },
    { label: "Combo ưu đãi" },
    { label: "Tác giả nổi bật" },
    { label: "Liên hệ" },
  ]),
  preview = false,
}: HeaderBookVerseProps) {
  const stop = (e: React.SyntheticEvent) => {
    if (preview) e.preventDefault();
  };

  let navItems: NavItem[] = [];
  try {
    navItems = JSON.parse(navItemsJson || "[]");
  } catch {
    navItems = [];
  }

  return (
    <header className={`${cls.bookHeader} shadow-sm`}>
      <div className={cls.bookmark} aria-hidden="true" />

      {/* Topbar */}
      <div className={cls.topbar}>
        <div className="container d-flex justify-content-between align-items-center">
          <div className="d-flex gap-3">
            <a href="#" onClick={stop}>
              <i className="bi bi-telephone" /> {hotline}
            </a>
            <a href="#" onClick={stop}>
              <i className="bi bi-geo-alt" /> {storeText}
            </a>
          </div>
          <div className="d-flex gap-3">
            <a href="#" onClick={stop}>
              <i className="bi bi-translate" /> {langText}
            </a>
            <a href="#" onClick={stop}>
              <i className="bi bi-person-circle" /> {accountText}
            </a>
          </div>
        </div>
      </div>

      {/* Middle */}
      <div className="container py-3 d-flex align-items-center justify-content-between flex-wrap gap-3">
        {/* Brand */}
        <Link href="#" className={cls.brand} onClick={stop}>
          <div className={cls.brandLogo}>{badge}</div>
          <div>
            <div className="fs-4 fw-bold">{brandTitle}</div>
            <small>{brandSub}</small>
          </div>
        </Link>

        {/* Search */}
        <form className={`${cls.searchBox} d-flex flex-grow-1 mx-lg-4`} role="search" onSubmit={(e) => e.preventDefault()}>
          <select aria-label="Danh mục">
            <option>Tất cả</option>
            <option>Sách</option>
            <option>Tác giả</option>
            {showIsbn && <option>ISBN</option>}
          </select>
          <input type="text" placeholder={placeholder} aria-label="Search" />
          <button type="submit" className="d-inline-flex align-items-center gap-1">
            <i className="bi bi-search" />
          </button>
        </form>

        {/* Icons */}
        <div className="d-flex align-items-center">
          <button className={cls.iconBtn} aria-label="Yêu thích">
            <i className="bi bi-heart" />
          </button>
          <button className={`${cls.iconBtn} position-relative`} aria-label="Giỏ hàng">
            <i className="bi bi-cart3" />
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">2</span>
          </button>
        </div>
      </div>

      {/* Nav */}
      <nav className={cls.bookNav}>
        <div className="container">
          <ul className="nav justify-content-center flex-wrap">
            {navItems.map((item, idx) => {
              const hasChildren = Array.isArray(item.children) && item.children.length > 0;
              if (hasChildren) {
                return (
                  <li key={idx} className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href={item.href || "#"} data-bs-toggle="dropdown" onClick={stop}>
                      {item.label}
                    </a>
                    <ul className="dropdown-menu">
                      {item.children!.map((c, i2) => (
                        <li key={i2}>
                          <a className="dropdown-item" href={c.href || "#"} onClick={stop}>
                            {c.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              }
              return (
                <li key={idx} className="nav-item">
                  <a className="nav-link" href={item.href || "#"} onClick={stop}>
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </header>
  );
}

/* ===== RegItem cho UI Builder ===== */
export const HEADER_BOOK_VERSE: RegItem = {
  kind: "HeaderBookVerse",
  label: "Header BookVerse (Books)",
  defaults: {
    hotline: "Liên hệ: 1900 6868",
    storeText: "Hệ thống cửa hàng",
    langText: "VI / EN",
    accountText: "Tài khoản",
    badge: "BV",
    brandTitle: "BookVerse",
    brandSub: "Hiệu sách của bạn",
    showIsbn: true,
    placeholder: "Tìm sách, tác giả hoặc mã ISBN...",
    navItemsJson: JSON.stringify([
      {
        label: "Thể loại",
        children: [{ label: "Tiểu thuyết" }, { label: "Kinh tế" }, { label: "Tâm lý - Kỹ năng" }, { label: "Sách thiếu nhi" }, { label: "Lịch sử - Văn hóa" }],
      },
      { label: "Sách mới" },
      { label: "Bán chạy" },
      { label: "Combo ưu đãi" },
      { label: "Tác giả nổi bật" },
      { label: "Liên hệ" },
    ]),
  },
  inspector: [
    { key: "badge", label: "Logo Badge", kind: "text" },
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "brandSub", label: "Brand Subtitle", kind: "text" },

    { key: "hotline", label: "Hotline text", kind: "text" },
    { key: "storeText", label: "Store text", kind: "text" },
    { key: "langText", label: "Language text", kind: "text" },
    { key: "accountText", label: "Account text", kind: "text" },

    { key: "showIsbn", label: "Show ISBN in select", kind: "check" },
    { key: "placeholder", label: "Search placeholder", kind: "text" },

    { key: "navItemsJson", label: "Nav (JSON)", kind: "textarea" },
  ],
  render: (p) => <HeaderBookVerse {...p} preview={true} />,
};
