"use client";

import React from "react";
import Link from "next/link";
import cls from "@/styles/admin/templates/header/header-trustcrest.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type HeaderTrustCrestProps = {
  // Top microbar
  phone?: string;
  email?: string;
  branchText?: string;
  langText?: string;

  // Brand
  badge?: string;
  brandTitle?: string;
  brandSub?: string;

  // Search
  showSearch?: boolean;
  searchPlaceholder?: string;
  minSearchWidth?: number; // px

  // Nav
  navItemsJson?: string; // JSON: {label, href?, children?: {label, href?, icon?}[]}[]

  preview?: boolean; // chặn navigation khi xem trong Builder
};

type NavItem = {
  label: string;
  href?: string;
  children?: { label: string; href?: string; icon?: string }[];
};

export default function HeaderTrustCrest({
  // Topbar
  phone = "1900 6868",
  email = "support@trustcrest.vn",
  branchText = "Tìm chi nhánh",
  langText = "VI / EN",

  // Brand
  badge = "TC",
  brandTitle = "TrustCrest",
  brandSub = "Banking • Insurance • Finance",

  // Search
  showSearch = true,
  searchPlaceholder = "Tra cứu STK / Claim ID…",
  minSearchWidth = 280,

  // Nav
  navItemsJson = JSON.stringify([
    { label: "Về chúng tôi" },
    {
      label: "Sản phẩm",
      children: [
        { label: "Thẻ & Tài khoản", icon: "credit-card-2-front" },
        { label: "Tiết kiệm & Đầu tư", icon: "cash-coin" },
        { label: "Vay mua nhà", icon: "house-door" },
        { label: "Vay mua xe", icon: "car-front" },
      ],
    },
    {
      label: "Bảo hiểm",
      children: [
        { label: "Sức khỏe & Nhân thọ", icon: "heart-pulse" },
        { label: "Du lịch", icon: "airplane" },
        { label: "Tài sản & Trách nhiệm", icon: "building-lock" },
        { label: "Cyber Risk", icon: "shield-lock" },
      ],
    },
    {
      label: "Công cụ",
      children: [
        { label: "Tính khoản vay", icon: "calculator" },
        { label: "Lãi suất", icon: "graph-up" },
        { label: "Chi nhánh", icon: "geo-alt" },
      ],
    },
    { label: "Tin tức" },
    { label: "CTA__Mở tài khoản" },
  ]),

  preview = false,
}: HeaderTrustCrestProps) {
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
    <>
      <header className={cls.tcHeader}>
        {/* Top microbar */}
        <div className={cls.tcTop}>
          <div className="container py-1 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex gap-3">
              <span>
                <i className="bi bi-telephone" /> {phone}
              </span>
              <span className="d-none d-sm-inline">
                <i className="bi bi-envelope" /> {email}
              </span>
            </div>
            <div className="d-flex gap-3">
              <a href="#" onClick={stop}>
                <i className="bi bi-geo-alt" /> {branchText}
              </a>
              <a href="#" onClick={stop}>
                <i className="bi bi-globe2" /> {langText}
              </a>
            </div>
          </div>
        </div>

        {/* Main bar */}
        <div className="container py-2 d-flex align-items-center gap-3">
          {/* Mobile toggler (Bootstrap offcanvas) */}
          <button className="btn btn-outline-secondary d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#tcNav">
            <i className="bi bi-list" />
          </button>

          {/* Brand */}
          <Link href="#" className={cls.brand} onClick={stop}>
            <div className={cls.brandBadge}>{badge}</div>
            <div className={cls.brandTitle}>
              {brandTitle}
              <small>{brandSub}</small>
            </div>
          </Link>

          {/* Search (desktop) */}
          {showSearch && (
            <form className={`${cls.tcSearch} d-none d-xl-flex align-items-center ms-3`} role="search" style={{ minWidth: `${minSearchWidth}px` }} onSubmit={(e) => e.preventDefault()}>
              <input className="form-control" type="search" placeholder={searchPlaceholder} aria-label="Search" />
              <button className="btn" type="submit" aria-label="Search">
                <i className="bi bi-search" />
              </button>
            </form>
          )}

          {/* Nav (desktop) */}
          <nav className={`ms-auto ${cls.tcNav}`}>
            <ul className="nav align-items-center">
              {navItems.map((item, idx) => {
                const hasChildren = Array.isArray(item.children) && item.children.length > 0;

                // CTA shortcut: label bắt đầu bằng "CTA__"
                if (!hasChildren && item.label?.startsWith?.("CTA__")) {
                  const text = item.label.replace("CTA__", "");
                  return (
                    <li key={idx} className="nav-item ms-2">
                      <a className={`btn ${cls.btnCta}`} href={item.href || "#"} onClick={stop}>
                        <i className="bi bi-person-plus" /> {text}
                      </a>
                    </li>
                  );
                }

                if (!hasChildren) {
                  return (
                    <li key={idx} className="nav-item">
                      <a className="nav-link" href={item.href || "#"} onClick={stop}>
                        {item.label}
                      </a>
                    </li>
                  );
                }

                return (
                  <li key={idx} className="nav-item dropdown">
                    <a className="nav-link dropdown-toggle" href={item.href || "#"} data-bs-toggle="dropdown" onClick={stop}>
                      {item.label}
                    </a>
                    <ul className="dropdown-menu mt-2">
                      {item.children!.map((c, i2) => (
                        <li key={i2}>
                          <a className="dropdown-item d-flex align-items-center gap-2" href={c.href || "#"} onClick={stop}>
                            {c.icon && <i className={`bi bi-${c.icon}`} />}
                            {c.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </header>

      {/* Offcanvas (mobile) — dùng Bootstrap mặc định */}
      <div className="offcanvas offcanvas-start" tabIndex={-1} id="tcNav" style={{ "--bs-offcanvas-width": "300px" } as React.CSSProperties}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">{brandTitle}</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close" />
        </div>
        <div className="offcanvas-body">
          {showSearch && (
            <div className="input-group mb-3">
              <span className="input-group-text bg-light border-0">
                <i className="bi bi-search" />
              </span>
              <input type="search" className="form-control border-0" placeholder={searchPlaceholder} />
            </div>
          )}
          {navItems.map((item, idx) => (
            <a key={idx} className="btn btn-outline-secondary w-100 mb-2 text-start" href={item.href || "#"} onClick={stop}>
              {item.label.replace("CTA__", "")}
            </a>
          ))}
          <a className="btn btn-primary w-100 mt-1" href="#" onClick={stop}>
            <i className="bi bi-person-plus" /> Mở tài khoản
          </a>
        </div>
      </div>
    </>
  );
}

/* ===== RegItem cho UI Builder ===== */
export const HEADER_TRUST_CREST: RegItem = {
  kind: "HeaderTrustCrest",
  label: "Header TrustCrest (Finance – Stable)",
  defaults: {
    phone: "1900 6868",
    email: "support@trustcrest.vn",
    branchText: "Tìm chi nhánh",
    langText: "VI / EN",
    badge: "TC",
    brandTitle: "TrustCrest",
    brandSub: "Banking • Insurance • Finance",
    showSearch: true,
    searchPlaceholder: "Tra cứu STK / Claim ID…",
    minSearchWidth: 280,
    navItemsJson: JSON.stringify([
      { label: "Về chúng tôi" },
      {
        label: "Sản phẩm",
        children: [
          { label: "Thẻ & Tài khoản", icon: "credit-card-2-front" },
          { label: "Tiết kiệm & Đầu tư", icon: "cash-coin" },
          { label: "Vay mua nhà", icon: "house-door" },
          { label: "Vay mua xe", icon: "car-front" },
        ],
      },
      {
        label: "Bảo hiểm",
        children: [
          { label: "Sức khỏe & Nhân thọ", icon: "heart-pulse" },
          { label: "Du lịch", icon: "airplane" },
          { label: "Tài sản & Trách nhiệm", icon: "building-lock" },
          { label: "Cyber Risk", icon: "shield-lock" },
        ],
      },
      {
        label: "Công cụ",
        children: [
          { label: "Tính khoản vay", icon: "calculator" },
          { label: "Lãi suất", icon: "graph-up" },
          { label: "Chi nhánh", icon: "geo-alt" },
        ],
      },
      { label: "Tin tức" },
      { label: "CTA__Mở tài khoản" },
    ]),
  },
  inspector: [
    { key: "badge", label: "Logo Badge", kind: "text" },
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "brandSub", label: "Brand Subtitle", kind: "text" },

    { key: "phone", label: "Phone", kind: "text" },
    { key: "email", label: "Email", kind: "text" },
    { key: "branchText", label: "Branch text", kind: "text" },
    { key: "langText", label: "Language text", kind: "text" },

    { key: "showSearch", label: "Show desktop search", kind: "check" },
    { key: "searchPlaceholder", label: "Search placeholder", kind: "text" },
    { key: "minSearchWidth", label: "Min search width (px)", kind: "number" },

    { key: "navItemsJson", label: "Nav (JSON)", kind: "textarea" },
  ],
  render: (p) => <HeaderTrustCrest {...p} preview={true} />,
};
