"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/admin/templates/header/header-aurora.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type HeaderAuroraProps = {
  brandTitle?: string;
  brandSub?: string;
  cartCount?: number;
  quickCats?: string[];
  auroraColors?: [string, string, string]; // [--aurora-1, --aurora-2, --aurora-3]
  preview?: boolean;
};

export default function HeaderAurora({
  brandTitle = "LowCode",
  brandSub = "Aurora Mall",
  cartCount = 3,
  quickCats = ["Bộ Quần Áo Nữ", "Áo Khoác", "Giày Dép", "Tai nghe", "Máy lọc không khí", "Chăm sóc da"],
  auroraColors = ["#69d2ff", "#6ef3c5", "#a889ff"],
  preview = false,
}: HeaderAuroraProps) {
  useEffect(() => {
    const [c1, c2, c3] = auroraColors;
    const r = document.documentElement;
    r.style.setProperty("--aurora-1", c1);
    r.style.setProperty("--aurora-2", c2);
    r.style.setProperty("--aurora-3", c3);
  }, [auroraColors]);

  const stop = (e: React.SyntheticEvent) => {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <section className={cls.auroraWrap}>
      <div className={cls.starfield}></div>

      {/* ===== HEADER ===== */}
      <header className={cls.lcHeader}>
        <div className={cls.container}>
          {/* ===== Topline ===== */}
          <div className={`${cls.topline} d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2`}>
            <div className="d-flex gap-2">
              <a href="#" onClick={stop}>
                <i className="bi bi-bag-check"></i> Kênh Người Bán
              </a>
              <a href="#" onClick={stop}>
                <i className="bi bi-rocket-takeoff"></i> Trở thành Nhà Bán
              </a>
              <a href="#" onClick={stop} className="d-none d-md-inline">
                <i className="bi bi-phone"></i> Tải ứng dụng
              </a>
            </div>
            <div className="d-flex gap-2">
              <a href="#" onClick={stop}>
                <i className="bi bi-bell"></i> Thông báo
              </a>
              <a href="#" onClick={stop}>
                <i className="bi bi-question-circle"></i> Hỗ trợ
              </a>
              <a href="#" onClick={stop} className="d-none d-sm-inline">
                <i className="bi bi-box-arrow-in-right"></i> Đăng nhập
              </a>
            </div>
          </div>

          {/* ===== Brand + Search + Icons ===== */}
          <div className="d-flex align-items-center gap-3">
            <Link href="#" className={cls.brand} onClick={stop}>
              <div className={cls.brandLogo}>LC</div>
              <div className={cls.brandTitle}>
                {brandTitle}
                <small>{brandSub}</small>
              </div>
            </Link>

            <form className={`${cls.searchGlass} flex-grow-1 d-flex align-items-center`} role="search" onSubmit={(e) => e.preventDefault()}>
              <select className="form-select" aria-label="Danh mục">
                <option>Tất cả danh mục</option>
                <option>Điện thoại - Tablet</option>
                <option>Laptop - PC</option>
                <option>Thời trang</option>
                <option>Đồ gia dụng</option>
              </select>
              <input className="form-control" type="search" placeholder="Tìm kiếm thông minh trong LowCode…" />
              <button className="btn btn-primary ms-1" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </form>

            <div className="ms-auto d-flex align-items-center gap-2">
              <a className={`${cls.iconBtn} position-relative`} href="#" onClick={stop}>
                <i className="bi bi-heart"></i>
              </a>
              <a className={`${cls.iconBtn} position-relative`} href="#" onClick={stop}>
                <i className="bi bi-cart3"></i>
                {cartCount > 0 && <span className="badge bg-danger position-absolute top-0 end-0">{cartCount}</span>}
              </a>
            </div>
          </div>

          {/* ===== Quick categories ===== */}
          <div className={`${cls.quickCats} d-flex mt-2`}>
            {quickCats.map((c, i) => (
              <a key={i} href="#" onClick={stop}>
                {c}
              </a>
            ))}
          </div>

          {/* ===== Nav (Dropdowns) ===== */}
          <nav className={`${cls.lcNav} mt-2`}>
            <ul className="nav justify-content-between">
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  Điện tử
                </a>
                <div className="dropdown-menu mt-2 p-3">
                  <div className="row g-3">
                    <div className="col-12 col-md-4">
                      <div className="title">Điện thoại & Tablet</div>
                      <a className="dropdown-item" href="#">
                        iPhone
                      </a>
                      <a className="dropdown-item" href="#">
                        Android
                      </a>
                      <a className="dropdown-item" href="#">
                        Phụ kiện sạc
                      </a>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="title">Laptop & PC</div>
                      <a className="dropdown-item" href="#">
                        Gaming
                      </a>
                      <a className="dropdown-item" href="#">
                        Màn hình
                      </a>
                      <a className="dropdown-item" href="#">
                        Bàn phím
                      </a>
                    </div>
                    <div className="col-12 col-md-4">
                      <div className="title">Smart Home</div>
                      <a className="dropdown-item" href="#">
                        Camera
                      </a>
                      <a className="dropdown-item" href="#">
                        Đèn thông minh
                      </a>
                      <a className="dropdown-item" href="#">
                        Loa & Hub
                      </a>
                    </div>
                  </div>
                </div>
              </li>
              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  Thời trang
                </a>
                <ul className="dropdown-menu mt-2">
                  <li>
                    <a className="dropdown-item" href="#">
                      Áo thun
                    </a>
                  </li>
                  <li>
                    <a className="dropdown-item" href="#">
                      Giày dép
                    </a>
                  </li>
                </ul>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Flash Sale
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Voucher
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Hàng quốc tế
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>
    </section>
  );
}

/* ========= RegItem ========= */
export const HEADER_AURORA: RegItem = {
  kind: "HeaderAurora",
  label: "Header Aurora",
  defaults: {
    brandTitle: "LowCode",
    brandSub: "Aurora Mall",
    cartCount: 3,
    note: "Aurora background header with glass search and pastel neon vibe",
  },
  inspector: [
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "brandSub", label: "Brand Subtitle", kind: "text" },
    { key: "cartCount", label: "Cart Count", kind: "number" },
  ],
  render: (p) => <HeaderAurora {...p} preview={true} />,
};
