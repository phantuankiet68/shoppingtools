"use client";

import React from "react";
import Link from "next/link";
import cls from "@/styles/admin/templates/header/header-portfolio-flux.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type HeaderPortfolioFluxProps = {
  badge?: string;
  brandTitle?: string;
  brandSub?: string;
  ctaGhostText?: string;
  ctaGhostHref?: string;
  ctaPrimaryText?: string;
  ctaPrimaryHref?: string;
  includeHero?: boolean;
  heroName?: string;
  heroRole?: string;
  heroAvailableText?: string;
  heroTags?: string;
  preview?: boolean; // chặn điều hướng khi xem trong Builder
};

export default function HeaderPortfolioFlux({
  badge = "NP",
  brandTitle = "NeoPortfolio",
  brandSub = "Designer • Developer • Creator",
  ctaGhostText = "Hire me",
  ctaGhostHref = "#contact",
  ctaPrimaryText = "Download CV",
  ctaPrimaryHref = "#",
  includeHero = true,
  heroName = "Your Name",
  heroRole = "UI/UX Designer & Front-end Developer",
  heroAvailableText = "Available for freelance",
  heroTags = "Figma,React,Next.js,Tailwind,Motion",
  preview = false,
}: HeaderPortfolioFluxProps) {
  const stop = (e: React.SyntheticEvent) => {
    if (preview) e.preventDefault();
  };

  const tags = heroTags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className={cls.pfHeader}>
        <div className="container py-2 d-flex align-items-center gap-3">
          {/* Mobile toggler (chỉ UI, không dùng JS Bootstrap ở đây) */}
          <button className="btn btn-outline-secondary d-lg-none" type="button" aria-label="Open menu">
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

          {/* Nav (desktop) */}
          <nav className={`${cls.pfNav} ms-auto`}>
            <ul className="nav align-items-center">
              <li className="nav-item">
                <a className="nav-link" href="#about" onClick={stop}>
                  About
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#work" onClick={stop}>
                  Work
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#services" onClick={stop}>
                  Services
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#blog" onClick={stop}>
                  Blog
                </a>
              </li>

              <li className="nav-item ms-2">
                <a className={`btn ${cls.btnGhost}`} href={ctaGhostHref} onClick={stop}>
                  <i className="bi bi-send" />
                  &nbsp;{ctaGhostText}
                </a>
              </li>
              <li className="nav-item ms-2">
                <a className={`btn ${cls.btnCta}`} href={ctaPrimaryHref} onClick={stop}>
                  <i className="bi bi-download" />
                  &nbsp;{ctaPrimaryText}
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      {/* ===== HERO (optional) ===== */}
      {includeHero && (
        <section className={cls.hero}>
          <div className={cls.blob} />

          <div className={`container ${cls.heroInner}`}>
            <div className="row g-4 align-items-center">
              <div className="col-12 col-lg-5">
                <div className={`p-4 d-flex align-items-center gap-3 ${cls.pfCard}`}>
                  <div className={cls.avatarWrap}>
                    <div className={cls.avatarBg} />
                    {/* Thay bằng <img src="..." className={cls.avatar} alt="Avatar" /> nếu có ảnh thật */}
                    <div className={cls.avatar} aria-label="Avatar">
                      👩‍💻
                    </div>
                  </div>

                  <div>
                    <a className={cls.roleChip} href="#services" onClick={stop}>
                      <i className="bi bi-lightning-charge" />
                      {heroAvailableText}
                    </a>
                    <h1 className="h3 mt-2 mb-1 fw-bold">
                      Xin chào, mình là <span className={cls.gradText}>{heroName}</span>
                    </h1>
                    <p className="mb-0 text-secondary">{heroRole}</p>

                    <div className={`mt-3 d-flex gap-2 ${cls.social}`}>
                      <a href="#" onClick={stop} aria-label="LinkedIn">
                        <i className="bi bi-linkedin" />
                      </a>
                      <a href="#" onClick={stop} aria-label="GitHub">
                        <i className="bi bi-github" />
                      </a>
                      <a href="#" onClick={stop} aria-label="Behance">
                        <i className="bi bi-behance" />
                      </a>
                      <a href="#" onClick={stop} aria-label="Email">
                        <i className="bi bi-envelope" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="mt-3">
                  {tags.map((t, i) => (
                    <span className={cls.tag} key={i}>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="col-12 col-lg-7">
                <div className={`p-4 ${cls.pfCard}`}>
                  <h2 className="h4 fw-bold">
                    Tạo trải nghiệm số <span className={cls.gradText}>độc đáo</span>
                  </h2>
                  <p className="text-secondary mb-4">Mình thiết kế & xây dựng sản phẩm web nhanh, đẹp, dễ mở rộng — tập trung vào tốc độ, khả năng truy cập và sắc thái thương hiệu.</p>
                  <div className="d-flex gap-2 flex-wrap">
                    <a className={`btn ${cls.btnGhost}`} href="#work" onClick={stop}>
                      <i className="bi bi-images" />
                      &nbsp;Xem dự án
                    </a>
                    <a className={`btn ${cls.btnCta}`} href="#contact" onClick={stop}>
                      <i className="bi bi-send" />
                      &nbsp;Liên hệ hợp tác
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}

/* ====== RegItem cho UI Builder ====== */
export const HEADER_PORTFOLIO_FLUX: RegItem = {
  kind: "HeaderPortfolioFlux",
  label: "Header NeoPortfolio Flux",
  defaults: {
    badge: "NP",
    brandTitle: "NeoPortfolio",
    brandSub: "Designer • Developer • Creator",
    ctaGhostText: "Hire me",
    ctaGhostHref: "#contact",
    ctaPrimaryText: "Download CV",
    ctaPrimaryHref: "#",
    includeHero: true,
    heroName: "Your Name",
    heroRole: "UI/UX Designer & Front-end Developer",
    heroAvailableText: "Available for freelance",
    heroTags: "Figma,React,Next.js,Tailwind,Motion",
  },
  inspector: [
    { key: "badge", label: "Logo Badge", kind: "text" },
    { key: "brandTitle", label: "Brand Title", kind: "text" },
    { key: "brandSub", label: "Brand Subtitle", kind: "text" },
    { key: "ctaGhostText", label: "CTA Ghost Text", kind: "text" },
    { key: "ctaGhostHref", label: "CTA Ghost Link", kind: "text" },
    { key: "ctaPrimaryText", label: "CTA Primary Text", kind: "text" },
    { key: "ctaPrimaryHref", label: "CTA Primary Link", kind: "text" },
    { key: "includeHero", label: "Include Hero", kind: "check" },
    { key: "heroName", label: "Hero Name", kind: "text" },
    { key: "heroRole", label: "Hero Role", kind: "text" },
    { key: "heroAvailableText", label: "Hero Availability", kind: "text" },
    { key: "heroTags", label: "Hero Tags (comma)", kind: "text" },
  ],
  render: (p) => <HeaderPortfolioFlux {...p} preview={true} />,
};
