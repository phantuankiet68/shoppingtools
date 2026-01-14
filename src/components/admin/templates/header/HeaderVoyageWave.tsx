"use client";

import React from "react";
import Link from "next/link";
import cls from "@/styles/admin/templates/header/header-voyagewave.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ===== Types ===== */
type DDItem = { label: string; href?: string; icon?: string };
type DDGroup = { title: string; items: DDItem[] };
type NavItem =
  | { label: string; href?: string; groups: DDGroup[] } // mega dropdown
  | { label: string; href?: string; children: DDItem[] } // simple dropdown
  | { label: string; href?: string }; // single link

export type HeaderVoyageWaveProps = {
  // Palette
  sea1?: string; // cyan
  sea2?: string; // deep blue
  sun?: string; // sunshine

  // Topbar
  helpText?: string;
  phone?: string;
  lang?: string;
  currency?: string;
  showLogin?: boolean;

  // Brand
  badge?: string;
  brandTitle?: string;
  brandSub?: string;
  brandHref?: string;

  // Search
  showSearch?: boolean;
  destinationPlaceholder?: string;
  guestsOptionsJson?: string; // ["1 khách","2 khách",...]
  defaultGuestsIndex?: number;

  // Nav
  navJson?: string; // NavItem[] JSON

  // Preview block navigation in Builder
  preview?: boolean;
};

export default function HeaderVoyageWave({
  // palette
  sea1 = "#00b4d8",
  sea2 = "#0077b6",
  sun = "#ffd166",

  // topbar
  helpText = "Trợ giúp",
  phone = "1900 88 66",
  lang = "VI",
  currency = "VND",
  showLogin = true,

  // brand
  badge = "TR",
  brandTitle = "TravelRealm",
  brandSub = "Explore the world",
  brandHref = "#",

  // search
  showSearch = true,
  destinationPlaceholder = "Bạn muốn đi đâu? (VD: Đà Lạt, Tokyo)",
  guestsOptionsJson = JSON.stringify(["1 khách", "2 khách", "3 khách", "4+ khách"]),
  defaultGuestsIndex = 1,

  // nav
  navJson = JSON.stringify([
    {
      label: "Chuyến bay",
      groups: [
        {
          title: "Phổ biến",
          items: [
            { label: "Hà Nội → Tokyo", icon: "geo-alt" },
            { label: "HCM → Bangkok", icon: "geo-alt" },
            { label: "Đà Nẵng → Singapore", icon: "geo-alt" },
          ],
        },
        {
          title: "Hãng bay",
          items: [{ label: "Vietnam Airlines" }, { label: "Bamboo Airways" }, { label: "Vietjet Air" }],
        },
        {
          title: "Ưu đãi",
          items: [
            { label: "Flash sale 48h", icon: "stars" },
            { label: "Voucher thành viên", icon: "gift" },
          ],
        },
      ],
    },
    {
      label: "Khách sạn",
      groups: [
        {
          title: "Thành phố hot",
          items: [{ label: "Đà Nẵng" }, { label: "Đà Lạt" }, { label: "Phú Quốc" }, { label: "Nha Trang" }],
        },
        {
          title: "Loại chỗ nghỉ",
          items: [{ label: "Resort" }, { label: "Boutique" }, { label: "Căn hộ" }],
        },
      ],
    },
    {
      label: "Tour & Trải nghiệm",
      children: [{ label: "Tour nội địa" }, { label: "Tour quốc tế" }, { label: "Vé tham quan" }],
    },
    { label: "Ưu đãi" },
  ]),

  preview = false,
}: HeaderVoyageWaveProps) {
  const stop = (e: React.SyntheticEvent) => {
    if (preview) e.preventDefault();
  };

  let navItems: NavItem[] = [];
  try {
    navItems = JSON.parse(navJson || "[]");
  } catch {
    navItems = [];
  }

  let guestsOptions: string[] = [];
  try {
    guestsOptions = JSON.parse(guestsOptionsJson || "[]");
  } catch {
    guestsOptions = ["1 khách", "2 khách", "3 khách", "4+ khách"];
  }

  return (
    <section
      className={cls.oceanWrap}
      style={
        {
          "--sea-1": sea1,
          "--sea-2": sea2,
          "--sun-1": sun,
        } as React.CSSProperties
      }>
      <div className={cls.oceanGrad}>
        {/* ==== Topbar ==== */}
        <div className={`container py-1 d-flex justify-content-between align-items-center flex-wrap gap-2 ${cls.topbar}`}>
          <div className="d-flex gap-3 align-items-center">
            <a href="#" onClick={stop}>
              <i className="bi bi-emoji-smile" /> {helpText}
            </a>
            <a href="#" onClick={stop}>
              <i className="bi bi-telephone" /> {phone}
            </a>
          </div>
          <div className="d-flex gap-3 align-items-center">
            {/* Language */}
            <div className="dropdown">
              <a className="dropdown-toggle text-white text-decoration-none" href="#" data-bs-toggle="dropdown" onClick={stop}>
                <i className="bi bi-translate" /> {lang}
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button className="dropdown-item">Tiếng Việt</button>
                </li>
                <li>
                  <button className="dropdown-item">English</button>
                </li>
                <li>
                  <button className="dropdown-item">日本語</button>
                </li>
              </ul>
            </div>
            {/* Currency */}
            <div className="dropdown">
              <a className="dropdown-toggle text-white text-decoration-none" href="#" data-bs-toggle="dropdown" onClick={stop}>
                <i className="bi bi-currency-exchange" /> {currency}
              </a>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <button className="dropdown-item">VND</button>
                </li>
                <li>
                  <button className="dropdown-item">USD</button>
                </li>
                <li>
                  <button className="dropdown-item">JPY</button>
                </li>
              </ul>
            </div>
            {showLogin && (
              <a href="#" className="text-white text-decoration-none" onClick={stop}>
                <i className="bi bi-box-arrow-in-right" /> Đăng nhập
              </a>
            )}
          </div>
        </div>

        {/* ==== Main row ==== */}
        <div className="container py-3 d-flex align-items-center gap-3">
          {/* Mobile menu button */}
          <button className="btn btn-light d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#vwNav">
            <i className="bi bi-list" />
          </button>

          {/* Brand */}
          <Link href={"/brandHref"} className={`${cls.brand}`} onClick={stop}>
            <div className={cls.brandBadge}>{badge}</div>
            <div>
              <div className="fw-bold fs-5 text-white">{brandTitle}</div>
              <small className="text-white-50">{brandSub}</small>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="ms-3 d-none d-lg-block">
            <ul className="nav gap-1">
              {navItems.map((item, idx) => {
                const any = item as any;
                const isMega = Array.isArray(any.groups);
                const hasChildren = Array.isArray(any.children);

                if (!isMega && !hasChildren) {
                  return (
                    <li key={idx} className="nav-item">
                      <a className={`nav-link px-3 ${cls.navLink}`} href={any.href || "#"} onClick={stop}>
                        {any.label}
                      </a>
                    </li>
                  );
                }

                return (
                  <li key={idx} className="nav-item dropdown">
                    <a className={`nav-link px-3 ${cls.navLink}`} href={any.href || "#"} data-bs-toggle="dropdown" onClick={stop}>
                      {/* icon gợi ý: tự thêm bằng label nếu muốn */}
                      {any.label}
                    </a>
                    <div className="dropdown-menu mt-2">
                      {isMega ? (
                        <div className="row g-3">
                          {any.groups.map((g: DDGroup, gi: number) => (
                            <div key={gi} className="col-12 col-md-4">
                              <div className={cls.ddTitle}>{g.title}</div>
                              {g.items.map((it: DDItem, ii: number) => (
                                <a key={ii} className="dropdown-item d-flex align-items-center gap-2" href={it.href || "#"} onClick={stop}>
                                  {it.icon && <i className={`bi bi-${it.icon}`} />}
                                  {it.label}
                                </a>
                              ))}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <ul className="list-unstyled mb-0">
                          {any.children.map((c: DDItem, i2: number) => (
                            <li key={i2}>
                              <a className="dropdown-item" href={c.href || "#"} onClick={stop}>
                                {c.label}
                              </a>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right buttons */}
          <div className="ms-auto d-none d-md-flex align-items-center gap-2">
            <a className="btn btn-outline-light d-inline-flex align-items-center gap-2" href="#" onClick={stop}>
              <i className="bi bi-suit-heart" />
              Yêu thích
            </a>
            <a className="btn btn-outline-light d-inline-flex align-items-center gap-2" href="#" onClick={stop}>
              <i className="bi bi-person-circle" />
              Tài khoản
            </a>
          </div>
        </div>

        {/* ==== Search card ==== */}
        {showSearch && (
          <div className="container pb-3">
            <form className={`p-2 p-md-3 ${cls.searchCard}`} onSubmit={(e) => e.preventDefault()}>
              <div className="row g-2 align-items-center">
                <div className="col-12 col-lg-4">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-0 text-white">
                      <i className="bi bi-geo-alt" />
                    </span>
                    <input type="text" className="form-control" placeholder={destinationPlaceholder} />
                  </div>
                </div>
                <div className={`col-6 col-lg-2 ${cls.vline}`}>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-0 text-white">
                      <i className="bi bi-calendar-event" />
                    </span>
                    <input type="date" className="form-control" aria-label="Ngày đi" />
                  </div>
                </div>
                <div className="col-6 col-lg-2">
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-0 text-white">
                      <i className="bi bi-calendar2-week" />
                    </span>
                    <input type="date" className="form-control" aria-label="Ngày về" />
                  </div>
                </div>
                <div className={`col-12 col-lg-2 ${cls.vline}`}>
                  <div className="input-group">
                    <span className="input-group-text bg-transparent border-0 text-white">
                      <i className="bi bi-people" />
                    </span>
                    <select className="form-select" defaultValue={Math.min(defaultGuestsIndex, guestsOptions.length - 1)}>
                      {guestsOptions.map((g, i) => (
                        <option key={i} value={i}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="col-12 col-lg-2 d-grid">
                  <button className={`btn ${cls.btnSun}`} type="submit">
                    <i className="bi bi-search" /> Tìm chuyến đi
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Curved wave bottom */}
      <svg className={cls.wave} viewBox="0 0 1440 90" preserveAspectRatio="none" aria-hidden="true">
        <path fill="#ffffff" d="M0,64 C240,96 480,0 720,24 C960,48 1200,112 1440,64 L1440,120 L0,120 Z"></path>
      </svg>

      {/* Offcanvas mobile nav */}
      <div className="offcanvas offcanvas-start" tabIndex={-1} id="vwNav" style={{ "--bs-offcanvas-width": "300px" } as React.CSSProperties}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">{brandTitle} Menu</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" />
        </div>
        <div className="offcanvas-body">
          {navItems.map((n, i) => (
            <a key={i} className="btn btn-outline-primary w-100 mb-2 text-start" href={(n as any).href || "#"} onClick={stop}>
              {(n as any).label}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== RegItem cho UI Builder ===== */
export const HEADER_VOYAGE_WAVE: RegItem = {
  kind: "HeaderVoyageWave",
  label: "Header VoyageWave (Travel – Ocean)",
  defaults: {
    sea1: "#00b4d8",
    sea2: "#0077b6",
    sun: "#ffd166",

    helpText: "Trợ giúp",
    phone: "1900 88 66",
    lang: "VI",
    currency: "VND",
    showLogin: true,

    badge: "TR",
    brandTitle: "TravelRealm",
    brandSub: "Explore the world",
    brandHref: "#",

    showSearch: true,
    destinationPlaceholder: "Bạn muốn đi đâu? (VD: Đà Lạt, Tokyo)",
    guestsOptionsJson: JSON.stringify(["1 khách", "2 khách", "3 khách", "4+ khách"]),
    defaultGuestsIndex: 1,

    navJson: JSON.stringify([
      {
        label: "Chuyến bay",
        groups: [
          {
            title: "Phổ biến",
            items: [
              { label: "Hà Nội → Tokyo", icon: "geo-alt" },
              { label: "HCM → Bangkok", icon: "geo-alt" },
              { label: "Đà Nẵng → Singapore", icon: "geo-alt" },
            ],
          },
          {
            title: "Hãng bay",
            items: [{ label: "Vietnam Airlines" }, { label: "Bamboo Airways" }, { label: "Vietjet Air" }],
          },
          {
            title: "Ưu đãi",
            items: [
              { label: "Flash sale 48h", icon: "stars" },
              { label: "Voucher thành viên", icon: "gift" },
            ],
          },
        ],
      },
      {
        label: "Khách sạn",
        groups: [
          {
            title: "Thành phố hot",
            items: [{ label: "Đà Nẵng" }, { label: "Đà Lạt" }, { label: "Phú Quốc" }, { label: "Nha Trang" }],
          },
          {
            title: "Loại chỗ nghỉ",
            items: [{ label: "Resort" }, { label: "Boutique" }, { label: "Căn hộ" }],
          },
        ],
      },
      { label: "Tour & Trải nghiệm", children: [{ label: "Tour nội địa" }, { label: "Tour quốc tế" }, { label: "Vé tham quan" }] },
      { label: "Ưu đãi" },
    ]),
  },
  inspector: [
    { key: "sea1", label: "Sea color 1", kind: "text" },
    { key: "sea2", label: "Sea color 2", kind: "text" },
    { key: "sun", label: "Sunshine", kind: "text" },

    { key: "helpText", label: "Help text", kind: "text" },
    { key: "phone", label: "Phone", kind: "text" },
    { key: "lang", label: "Language code", kind: "text" },
    { key: "currency", label: "Currency", kind: "text" },
    { key: "showLogin", label: "Show login", kind: "check" },

    { key: "badge", label: "Badge", kind: "text" },
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "brandSub", label: "Brand Subtitle", kind: "text" },
    { key: "brandHref", label: "Brand Link", kind: "text" },

    { key: "showSearch", label: "Show Search", kind: "check" },
    { key: "destinationPlaceholder", label: "Destination placeholder", kind: "text" },
    { key: "guestsOptionsJson", label: "Guests options (JSON array)", kind: "textarea" },
    { key: "defaultGuestsIndex", label: "Default guests index", kind: "number" },

    { key: "navJson", label: "Nav JSON", kind: "textarea" },
  ],
  render: (p) => <HeaderVoyageWave {...p} preview={true} />,
};
