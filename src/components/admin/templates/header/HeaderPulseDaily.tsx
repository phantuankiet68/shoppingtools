"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import cls from "@/styles/admin/templates/header/header-pulse-daily.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type HeaderPulseDailyProps = {
  brandTitle?: string;
  brandSub?: string;
  preview?: boolean;
};

export default function HeaderPulseDaily({ brandTitle = "PulseDaily", brandSub = "Independent • Fast • Clear", preview = false }: HeaderPulseDailyProps) {
  useEffect(() => {
    // Hiển thị ngày hôm nay
    const el = document.getElementById("today");
    if (el) {
      const d = new Date();
      const f = d.toLocaleDateString("vi-VN", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
      el.textContent = f.charAt(0).toUpperCase() + f.slice(1);
    }

    // Hover mở dropdown ở desktop
    const isDesktop = () => window.matchMedia("(min-width: 992px)").matches;
    const items = document.querySelectorAll(".nav-item.dropdown");
    items.forEach((item) => {
      const t = item.querySelector('[data-bs-toggle="dropdown"]') as HTMLElement;
      if (!t) return;
      const dd = (window as any).bootstrap?.Dropdown?.getOrCreateInstance(t);
      let a: NodeJS.Timeout, b: NodeJS.Timeout;
      item.addEventListener("mouseenter", () => {
        if (isDesktop()) {
          clearTimeout(b);
          a = setTimeout(() => dd?.show(), 120);
        }
      });
      item.addEventListener("mouseleave", () => {
        if (isDesktop()) {
          clearTimeout(a);
          b = setTimeout(() => dd?.hide(), 140);
        }
      });
    });
  }, []);

  const stop = (e: React.SyntheticEvent) => {
    if (preview) e.preventDefault();
  };

  return (
    <>
      {/* ===== TOPBAR ===== */}
      <div className={cls.pdTop}>
        <div className="container py-1 d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="d-flex gap-3">
            <span>
              <i className="bi bi-calendar-event"></i> <span id="today"></span>
            </span>
            <span className="d-none d-sm-inline">
              <i className="bi bi-cloud-sun"></i> 31°C • HN
            </span>
          </div>
          <div className="d-flex gap-3">
            <a href="#" onClick={stop}>
              <i className="bi bi-newspaper"></i> e-Paper
            </a>
            <a href="#" onClick={stop}>
              <i className="bi bi-broadcast"></i> RSS
            </a>
            <a href="#" onClick={stop}>
              <i className="bi bi-globe2"></i> VI / EN
            </a>
          </div>
        </div>
      </div>

      {/* ===== HEADER ===== */}
      <header className={cls.pdHeader}>
        <div className="container py-2 d-flex align-items-center gap-3">
          {/* Mobile toggle */}
          <button className="btn btn-outline-secondary d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#pdNav">
            <i className="bi bi-list"></i>
          </button>

          {/* Brand */}
          <Link href="#" className={cls.pdBrand} onClick={stop}>
            <div className={cls.pdLogo}>PD</div>
            <div className={cls.pdTitle}>
              {brandTitle}
              <small>{brandSub}</small>
            </div>
          </Link>

          {/* Search (desktop) */}
          <form className={`${cls.pdSearch} d-none d-xl-flex align-items-center ms-3 flex-grow-1`} role="search">
            <input className="form-control" type="search" placeholder="Tìm bài viết, chuyên mục, tác giả…" />
            <button className="btn" type="submit">
              <i className="bi bi-search"></i>
            </button>
          </form>

          {/* Nav */}
          <nav className={`${cls.pdNav} ms-auto`}>
            <ul className="nav align-items-center">
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Trang chủ
                </a>
              </li>

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  Chuyên mục
                </a>
                <div className="dropdown-menu mt-2">
                  <div className="row g-2">
                    <div className="col-12 col-md-6">
                      <div className={cls.ddTitle}>Tin tức</div>
                      <a className={cls.ddLink} href="#">
                        <div className={cls.ddIco}>
                          <i className="bi bi-globe-asia-australia"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Thời sự</div>
                          <p className={cls.ddSub}>Chính sách, đô thị, giáo dục</p>
                        </div>
                      </a>
                      <a className={cls.ddLink} href="#">
                        <div className={cls.ddIco}>
                          <i className="bi bi-graph-up-arrow"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Kinh tế</div>
                          <p className={cls.ddSub}>Doanh nghiệp, thị trường</p>
                        </div>
                      </a>
                      <a className={cls.ddLink} href="#">
                        <div className={cls.ddIco}>
                          <i className="bi bi-cpu"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Công nghệ</div>
                          <p className={cls.ddSub}>AI, thiết bị, internet</p>
                        </div>
                      </a>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className={cls.ddTitle}>Phong cách sống</div>
                      <a className={cls.ddLink} href="#">
                        <div className={cls.ddIco}>
                          <i className="bi bi-activity"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Sức khỏe</div>
                          <p className={cls.ddSub}>Dinh dưỡng, workout</p>
                        </div>
                      </a>
                      <a className={cls.ddLink} href="#">
                        <div className={cls.ddIco}>
                          <i className="bi bi-camera-reels"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Giải trí</div>
                          <p className={cls.ddSub}>Phim, nhạc, show</p>
                        </div>
                      </a>
                      <a className={cls.ddLink} href="#">
                        <div className={cls.ddIco}>
                          <i className="bi bi-compass"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Du lịch</div>
                          <p className={cls.ddSub}>Địa điểm, kinh nghiệm</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#">
                  Video
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Podcast
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  Blog
                </a>
              </li>

              <li className="nav-item ms-2">
                <a className={cls.btnGhost} href="#">
                  <i className="bi bi-person"></i> Đăng nhập
                </a>
              </li>
              <li className="nav-item ms-2">
                <a className={cls.btnCta} href="#">
                  <i className="bi bi-bell"></i> Subscribe
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Category rail */}
        <div className={cls.rail}>
          <div className="container py-2">
            <div className={cls.railInner}>
              {["Mới nhất", "Phân tích", "Thế giới", "Chứng khoán", "Bất động sản", "Đời sống", "Sức khỏe", "Giáo dục", "Công nghệ", "Thể thao", "Xe", "Ẩm thực"].map((cat) => (
                <a key={cat} href="#">
                  {cat}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Trending ticker */}
        <div className={cls.ticker + " py-2"}>
          <div className="container d-flex align-items-center gap-3">
            <span className="badge bg-danger">Trending</span>
            <div className="flex-grow-1 small text-truncate">• Bộ AI tiếng Việt mã nguồn mở đạt chuẩn SOTA • Giá xăng giảm lần thứ 3 liên tiếp • Lên kế hoạch du lịch Tết sớm giúp tiết kiệm 30% •</div>
            <a className="text-decoration-none fw-bold" href="#">
              <i className="bi bi-arrow-right"></i> Xem thêm
            </a>
          </div>
        </div>
      </header>
    </>
  );
}

/* ========= RegItem ========= */
export const HEADER_PULSE_DAILY: RegItem = {
  kind: "HeaderPulseDaily",
  label: "Header PulseDaily",
  defaults: {
    brandTitle: "PulseDaily",
    brandSub: "Independent • Fast • Clear",
  },
  inspector: [
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "brandSub", label: "Brand Subtitle", kind: "text" },
  ],
  render: (p) => <HeaderPulseDaily {...p} preview={true} />,
};
