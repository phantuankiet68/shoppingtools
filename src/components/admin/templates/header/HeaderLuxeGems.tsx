"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/admin/templates/header/header-luxe-gems.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type HeaderLuxeGemsProps = {
  logoText?: string;
  logoHighlight?: string;
  phone?: string;
  topLinks?: { label: string; href: string }[];
  navItems?: { label: string; href?: string; children?: { label: string; href: string }[] }[];
  cartCount?: number;
  preview?: boolean;
};

export default function HeaderLuxeGems({
  logoText = "Luxe",
  logoHighlight = "Gems",
  phone = "1800 8686",
  topLinks = [
    { label: "Hệ thống cửa hàng", href: "#" },
    { label: "VI / EN", href: "#" },
  ],
  navItems = [
    { label: "Trang chủ", href: "#" },
    {
      label: "Bộ sưu tập",
      children: [
        { label: "Vòng cổ", href: "#" },
        { label: "Nhẫn", href: "#" },
        { label: "Bông tai", href: "#" },
        { label: "Lắc tay", href: "#" },
      ],
    },
    { label: "Kim cương", href: "#" },
    { label: "Quà tặng", href: "#" },
    { label: "Liên hệ", href: "#" },
  ],
  cartCount = 3,
  preview = false,
}: HeaderLuxeGemsProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  const stop = (e: React.MouseEvent) => {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <>
      {/* ===== TOPBAR ===== */}
      <div className={cls.topbar}>
        <div className={`${cls.container} d-flex justify-content-between align-items-center flex-wrap gap-2`}>
          <div className={cls.topLeft}>
            <i className="bi bi-geo-alt"></i> Hệ thống cửa hàng
          </div>
          <div className="d-flex align-items-center gap-3">
            <a href="#" onClick={stop}>
              <i className="bi bi-telephone"></i> {phone}
            </a>
            <a href="#" onClick={stop}>
              <i className="bi bi-globe2"></i> VI / EN
            </a>
          </div>
        </div>
      </div>

      {/* ===== HEADER MAIN ===== */}
      <header className={`${cls.header} py-3`}>
        <div className={`${cls.container} d-flex align-items-center justify-content-between flex-wrap gap-3`}>
          {/* Logo */}
          <Link href="#" className={cls.logo} onClick={stop}>
            {logoText} <span>{logoHighlight}</span>
          </Link>

          {/* Nav */}
          <nav className={cls.nav}>
            <ul className="nav gap-3 justify-content-center flex-wrap">
              {navItems.map((n, i) =>
                n.children ? (
                  <li key={i} className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown" onClick={stop}>
                      {n.label}
                    </a>
                    <ul className="dropdown-menu">
                      {n.children.map((c, j) => (
                        <li key={j}>
                          <a className="dropdown-item" href={c.href} onClick={stop}>
                            {c.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                ) : (
                  <li key={i} className="nav-item">
                    <a className="nav-link" href={n.href} onClick={stop}>
                      {n.label}
                    </a>
                  </li>
                )
              )}
            </ul>
          </nav>

          {/* Actions */}
          <div className="d-flex align-items-center gap-2 position-relative" ref={searchRef}>
            <button className={cls.searchToggle} onClick={() => setSearchOpen((p) => !p)}>
              <i className="bi bi-search"></i>
            </button>
            <button className={cls.iconBtn}>
              <i className="bi bi-heart"></i>
            </button>
            <button className={`${cls.iconBtn} position-relative`}>
              <i className="bi bi-bag"></i>
              {cartCount > 0 && <span className={cls.iconBadge}>{cartCount}</span>}
            </button>
            <button className={cls.iconBtn}>
              <i className="bi bi-person-circle"></i>
            </button>

            {/* Search area */}
            <div className={`${cls.searchArea} ${searchOpen ? cls.active : ""}`}>
              <input type="text" placeholder="Tìm kiếm trang sức..." />
              <button type="button">
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}

/* ========= RegItem ========= */
export const HEADER_LUXE_GEMS: RegItem = {
  kind: "HeaderLuxe",
  label: "Header LuxeGems",
  defaults: {
    logoText: "Luxe",
    logoHighlight: "Gems",
    phone: "1800 8686",
    cartCount: 3,
    note: "Luxury jewelry header with gold elegance and minimalism",
  },
  inspector: [
    { key: "logoText", label: "Logo Text", kind: "text" },
    { key: "logoHighlight", label: "Logo Highlight", kind: "text" },
    { key: "phone", label: "Phone", kind: "text" },
  ],
  render: (p) => <HeaderLuxeGems {...p} preview={true} />,
};
