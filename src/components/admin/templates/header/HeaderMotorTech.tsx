"use client";

import React from "react";
import Link from "next/link";
import cls from "@/styles/admin/templates/header/header-motortech.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type HeaderMotorTechProps = {
  brandTitle?: string;
  brandSub?: string;
  badge?: string;
  preview?: boolean;
};

export default function HeaderMotorTech({ brandTitle = "MotorTech", brandSub = "Xe • Phụ kiện • Cơ khí / Điện máy", badge = "MK", preview = false }: HeaderMotorTechProps) {
  const stop = (e: React.SyntheticEvent) => {
    if (preview) e.preventDefault();
  };

  return (
    <>
      {/* ===== TOPBAR ===== */}
      <div className={cls.pkTop}>
        <div className="container d-flex justify-content-between flex-wrap gap-2 py-1">
          <div>
            <i className="bi bi-telephone"></i> 1900 8866
          </div>
          <div className="d-flex gap-3">
            <a href="#" onClick={stop}>
              <i className="bi bi-geo-alt"></i> Đại lý
            </a>
            <a href="#" onClick={stop}>
              <i className="bi bi-globe"></i> VI / EN
            </a>
            <a href="#" onClick={stop}>
              <i className="bi bi-person-circle"></i> Đăng nhập
            </a>
          </div>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <header className={`${cls.pkHeader} py-3`}>
        <div className="container d-flex align-items-center gap-3 flex-wrap">
          {/* Brand */}
          <Link href="#" className={cls.pkBrand} onClick={stop}>
            <div className={cls.pkBadge}>{badge}</div>
            <div className={cls.pkTitle}>
              {brandTitle}
              <small>{brandSub}</small>
            </div>
          </Link>

          {/* Search */}
          <form className={`${cls.pkSearch} d-flex align-items-center flex-grow-1 mx-3`} role="search">
            <select className="form-select">
              <option>Tất cả danh mục</option>
              <option>Xe</option>
              <option>Phụ kiện</option>
              <option>Thiết bị cơ khí</option>
              <option>Điện / Điện máy</option>
            </select>
            <input className="form-control" type="search" placeholder="Tìm kiếm sản phẩm, model, mã phụ tùng..." />
            <button className="btn" type="submit">
              <i className="bi bi-search"></i>
            </button>
          </form>

          {/* Icons */}
          <div className="d-flex align-items-center gap-2">
            <button className={cls.iconBtn}>
              <i className="bi bi-heart"></i>
            </button>
            <button className={`${cls.iconBtn} position-relative`}>
              <i className="bi bi-cart3"></i>
              <span className={cls.pkBadgeNum}>2</span>
            </button>
            <button className={cls.iconBtn}>
              <i className="bi bi-person"></i>
            </button>
          </div>
        </div>

        {/* Nav */}
        <nav className={`${cls.pkNav} container mt-3`}>
          <ul className="nav justify-content-between flex-wrap">
            <li className="nav-item dropdown">
              <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                <i className="bi bi-truck"></i> Xe
              </a>
              <ul className="dropdown-menu">
                <li>
                  <a className="dropdown-item" href="#">
                    Ô tô
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Xe máy
                  </a>
                </li>
                <li>
                  <a className="dropdown-item" href="#">
                    Xe điện
                  </a>
                </li>
              </ul>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <i className="bi bi-gear"></i> Phụ tùng
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <i className="bi bi-tools"></i> Cơ khí
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <i className="bi bi-lightning"></i> Điện máy
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">
                <i className="bi bi-percent"></i> Ưu đãi
              </a>
            </li>
          </ul>
        </nav>
      </header>
    </>
  );
}

/* ========= RegItem ========= */
export const HEADER_MOTORTECH: RegItem = {
  kind: "HeaderMotorTech",
  label: "Header MotorTech",
  defaults: {
    brandTitle: "MotorTech",
    brandSub: "Xe • Phụ kiện • Cơ khí / Điện máy",
    badge: "MK",
  },
  inspector: [
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "brandSub", label: "Brand Subtitle", kind: "text" },
    { key: "badge", label: "Logo Badge", kind: "text" },
  ],
  render: (p) => <HeaderMotorTech {...p} preview={true} />,
};
