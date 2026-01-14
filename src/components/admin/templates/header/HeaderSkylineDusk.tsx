"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import cls from "@/styles/admin/templates/header/header-skyline-dusk.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type HeaderSkylineDuskProps = {
  brandTitle?: string;
  brandSub?: string;
  phone?: string;
  email?: string;
  address?: string;
  heroTitle?: string;
  heroHighlight?: string;
  heroSub?: string;
  preview?: boolean;
};

export default function HeaderSkylineDusk({
  brandTitle = "Skyline Realty",
  brandSub = "Invest • Live • Grow",
  phone = "028 3 686 686",
  email = "hello@skyline.vn",
  address = "88 Nguyễn Huệ, Q.1",
  heroTitle = "Không gian sống",
  heroHighlight = "đẳng cấp giữa đô thị",
  heroSub = "Môi giới – đầu tư – phát triển dự án. Đồng hành cùng bạn trên hành trình sở hữu BĐS mơ ước.",
  preview = false,
}: HeaderSkylineDuskProps) {
  const [isSolid, setSolid] = useState(false);

  useEffect(() => {
    const handler = () => setSolid(window.scrollY > 10);
    handler();
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const stop = (e: React.SyntheticEvent) => {
    if (preview) {
      e.preventDefault();
      e.stopPropagation();
    }
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <div className={`${cls.mgHeader} ${isSolid ? cls.isSolid : ""}`} id="header">
        {/* Microbar */}
        <div className={cls.microbar}>
          <div className="container py-1 d-flex justify-content-between align-items-center flex-wrap gap-2">
            <div className="d-flex gap-3">
              <span>
                <i className="bi bi-telephone"></i> {phone}
              </span>
              <span className="d-none d-sm-inline">
                <i className="bi bi-envelope"></i> {email}
              </span>
            </div>
            <div className="d-flex gap-3">
              <a href="#" onClick={stop}>
                <i className="bi bi-geo-alt"></i> {address}
              </a>
              <a href="#" onClick={stop}>
                <i className="bi bi-globe2"></i> VI / EN
              </a>
              <a href="#" onClick={stop}>
                <i className="bi bi-linkedin"></i> LinkedIn
              </a>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container py-2 d-flex align-items-center gap-3">
          {/* Mobile toggle */}
          <button className="btn btn-outline-light d-lg-none" data-bs-toggle="offcanvas" data-bs-target="#mgNav" type="button">
            <i className="bi bi-list"></i>
          </button>

          {/* Brand */}
          <Link href="#" className={cls.brand} onClick={stop}>
            <div className={cls.brandLogo}>MG</div>
            <div className={cls.brandTitle}>
              {brandTitle}
              <small>{brandSub}</small>
            </div>
          </Link>

          {/* Nav (Desktop) */}
          <nav className={`${cls.mgNav} ms-auto`}>
            <ul className="nav align-items-center">
              <li className="nav-item">
                <a className="nav-link" href="#" onClick={stop}>
                  Giới thiệu
                </a>
              </li>

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  Mua
                </a>
                <div className="dropdown-menu mt-2">
                  <div className="row g-2">
                    <div className="col-12 col-md-6">
                      <div className={cls.ddTitle}>Nhà ở</div>
                      <a className={cls.ddLink} href="#">
                        <div className={cls.ddIco}>
                          <i className="bi bi-house-door"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Căn hộ • Chung cư</div>
                          <p className={cls.ddSub}>1–3PN, trung tâm & ven đô</p>
                        </div>
                      </a>
                      <a className={cls.ddLink} href="#">
                        <div className={cls.ddIco}>
                          <i className="bi bi-houses"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Nhà phố • Biệt thự</div>
                          <p className={cls.ddSub}>Compound, an ninh cao</p>
                        </div>
                      </a>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className={cls.ddTitle}>Đầu tư</div>
                      <a className={cls.ddLink} href="#">
                        <div className={cls.ddIco}>
                          <i className="bi bi-buildings"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Shophouse • Officetel</div>
                          <p className={cls.ddSub}>Dòng tiền bền vững</p>
                        </div>
                      </a>
                      <a className={cls.ddLink} href="#">
                        <div className={cls.ddIco}>
                          <i className="bi bi-geo"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Đất nền • KĐT</div>
                          <p className={cls.ddSub}>Tiềm năng tăng trưởng</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </li>

              <li className="nav-item dropdown">
                <a className="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                  Thuê
                </a>
                <div className="dropdown-menu mt-2">
                  <div className="row g-2">
                    <div className="col-12 col-md-6">
                      <div className={cls.ddTitle}>Cá nhân</div>
                      <a className={cls.ddLink} href="#">
                        <div className={cls.ddIco}>
                          <i className="bi bi-door-open"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Căn hộ • Studio</div>
                          <p className={cls.ddSub}>Vị trí thuận tiện</p>
                        </div>
                      </a>
                    </div>
                    <div className="col-12 col-md-6">
                      <div className={cls.ddTitle}>Doanh nghiệp</div>
                      <a className={cls.ddLink} href="#">
                        <div className={cls.ddIco}>
                          <i className="bi bi-building"></i>
                        </div>
                        <div>
                          <div className="fw-semibold">Văn phòng</div>
                          <p className={cls.ddSub}>Hạng A/B, linh hoạt</p>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              </li>

              <li className="nav-item">
                <a className="nav-link" href="#" onClick={stop}>
                  Dự án
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#" onClick={stop}>
                  Tin tức
                </a>
              </li>
              <li className="nav-item ms-2">
                <a className={cls.btnCta} href="#" onClick={stop}>
                  <i className="bi bi-chat-dots"></i> Liên hệ tư vấn
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* ===== HERO ===== */}
      <section className={cls.duskHero}>
        <div className={cls.duskGrid}></div>
        <div className={cls.duskGlow}></div>

        <div className={`container ${cls.heroInner}`}>
          <h1 className="display-5">
            {heroTitle} <span className={cls.highlight}>{heroHighlight}</span>
          </h1>
          <p className="lead">{heroSub}</p>

          <form className={`${cls.searchBar} d-flex align-items-center gap-2 mt-3`} onSubmit={(e) => e.preventDefault()}>
            <select className="form-select">
              <option>Mua / Thuê</option>
              <option>Mua</option>
              <option>Thuê</option>
            </select>
            <input className="form-control" placeholder="Vị trí, dự án, đường (VD: Thủ Thiêm, Q.1)…" />
            <select className="form-select">
              <option>Loại hình</option>
              <option>Căn hộ</option>
              <option>Nhà phố</option>
              <option>Biệt thự</option>
              <option>Văn phòng</option>
            </select>
            <select className="form-select">
              <option>Tầm giá</option>
              <option>&lt; 2 tỷ</option>
              <option>2–5 tỷ</option>
              <option>5–10 tỷ</option>
              <option>&gt; 10 tỷ</option>
            </select>
            <button className="btn" type="submit">
              <i className="bi bi-search"></i> Tìm
            </button>
          </form>
        </div>

        <svg className={cls.skyline} viewBox="0 0 1440 120" preserveAspectRatio="none">
          <path
            fill="#1b1140"
            d="M0,100 L60,100 L60,60 L100,60 L100,30 L140,30 L140,80 L220,80 L220,50 L260,50 L260,90 L330,90 L330,40 L370,40 L370,95 L450,95 L450,55 L520,55 L520,85 L610,85 L610,45 L680,45 L680,100 L760,100 L760,60 L830,60 L830,95 L900,95 L900,50 L980,50 L980,90 L1060,90 L1060,40 L1140,40 L1140,100 L1220,100 L1220,65 L1300,65 L1300,95 L1440,95 L1440,120 L0,120 Z"
          />
        </svg>
      </section>
    </>
  );
}

/* ========= RegItem ========= */
export const HEADER_SKYLINE_DUSK: RegItem = {
  kind: "HeaderSkylineDusk",
  label: "Header Skyline Dusk",
  defaults: {
    brandTitle: "Skyline Realty",
    brandSub: "Invest • Live • Grow",
    note: "Real estate header with dusk gradient and skyline hero",
  },
  inspector: [
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "brandSub", label: "Brand Subtitle", kind: "text" },
    { key: "heroTitle", label: "Hero Title", kind: "text" },
    { key: "heroHighlight", label: "Hero Highlight", kind: "text" },
    { key: "heroSub", label: "Hero Description", kind: "textarea" },
  ],
  render: (p) => <HeaderSkylineDusk {...p} preview={true} />,
};
