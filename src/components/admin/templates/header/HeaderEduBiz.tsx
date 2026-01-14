"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Route } from "next";
import cls from "@/styles/admin/templates/header/header-edu-biz.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ========= Types ========= */
export type EduVariant = "edubiz-ignite";
export type ThemePreset = "vibrant" | "light" | "classic";
export type NavItem = { label: string; href?: string; icon?: string; children?: NavItem[] };
export type TopLink = { label: string; href: string };

export type HeaderEduBizProps = {
  variant?: EduVariant;
  theme?: ThemePreset;
  logoSrc?: string;
  brandText?: string;
  slogan?: string;
  phone?: string;
  email?: string;
  ctaText?: string;
  ctaHref?: string;
  topLinks?: TopLink[];
  categories?: NavItem[];
  preview?: boolean;
};

/* ========= Helpers ========= */
const isExternal = (href: string) => /^(?:https?:)?\/\//i.test(href);
const toSafe = (v: any, d: any) => (v === undefined || v === null ? d : v);

function parseJson<T>(json?: string, fall: T = [] as any): T {
  if (!json) return fall;
  try {
    return JSON.parse(json) as T;
  } catch {
    return fall;
  }
}

/* ========= Component ========= */
export default function HeaderEduBiz({
  variant = "edubiz-ignite",
  theme = "vibrant",
  logoSrc = "/assets/images/logo.png",
  brandText = "EduBiz Ignite",
  slogan = "Learn • Build • Shine",
  phone = "028 3 686 686",
  email = "hello@edubiz.vn",
  ctaText = "Đăng ký ngay",
  ctaHref = "#",
  topLinks = [
    { label: "Cơ sở", href: "#" },
    { label: "Ngôn ngữ", href: "#" },
    { label: "Học bổng", href: "#" },
  ],
  categories = [],
  preview = false,
}: HeaderEduBizProps) {
  const [shadow, setShadow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShadow(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const stopNav = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <>
      {/* ===== HEADER ===== */}
      <header className={`${cls.header} ${shadow ? cls.scrolled : ""}`} data-variant={variant} data-theme={theme}>
        {/* Topbar */}
        <div className={cls.topbar}>
          <div className={cls.max}>
            <div className={cls.topLeft}>
              <span>
                <i className="bi bi-telephone"></i> {phone}
              </span>
              <span className="d-none d-sm-inline">
                <i className="bi bi-envelope"></i> {email}
              </span>
            </div>
            <div className={cls.topRight}>
              {topLinks.map((l, i) =>
                preview ? (
                  <button key={i} className={cls.topLink} onClick={stopNav} type="button">
                    {l.label}
                  </button>
                ) : (
                  <Link key={i} href={(l.href as Route) || "#"} className={cls.topLink}>
                    {l.label}
                  </Link>
                )
              )}
            </div>
          </div>
        </div>

        {/* Mainbar */}
        <div className={cls.mainbar}>
          <div className={cls.max}>
            {/* Brand */}
            {preview ? (
              <button className={cls.brand} onClick={stopNav} type="button">
                <div className={cls.logo}>EV</div>
                <div className={cls.title}>
                  {brandText}
                  <small>{slogan}</small>
                </div>
              </button>
            ) : (
              <Link href={"/api/blog"} className={cls.brand}>
                <div className={cls.logo}>EV</div>
                <div className={cls.title}>
                  {brandText}
                  <small>{slogan}</small>
                </div>
              </Link>
            )}

            {/* Search */}
            <form className={`${cls.search} d-none d-xl-flex`} role="search" onSubmit={(e) => e.preventDefault()}>
              <select className="form-select" aria-label="Bậc học">
                <option>Tất cả bậc học</option>
                <option>Thiếu nhi</option>
                <option>THPT</option>
                <option>ĐH / CĐ</option>
                <option>Sau ĐH</option>
                <option>Ngắn hạn</option>
              </select>
              <input className="form-control" placeholder="Tìm khóa học, ngành, mã học phần…" />
              <button className="btn" type="submit">
                <i className="bi bi-search"></i>
              </button>
            </form>

            {/* Actions */}
            <div className={cls.actions}>
              <button className={`${cls.btnOutline} d-none d-md-inline`} onClick={stopNav}>
                <i className="bi bi-journal-text"></i> Tuyển sinh
              </button>
              <button className={cls.btnCta} onClick={stopNav}>
                <i className="bi bi-lightning-charge"></i> {ctaText}
              </button>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className={cls.navbar}>
          <div className={cls.max}>
            <ul className={cls.navList}>
              {categories.map((c, i) => (
                <li key={i} className={cls.navItem}>
                  {renderNav(c)}
                  {c.children?.length ? (
                    <div className={cls.dropdown}>
                      <div className={cls.dropdownInner}>
                        {c.children.map((s, j) => (
                          <div key={j} className={cls.dropdownCol}>
                            <div className={cls.colTitle}>{s.label}</div>
                            {s.children?.map((lv3, k) => (
                              <a key={k} href={lv3.href} className={cls.ddLink}>
                                {lv3.icon && <i className={`bi ${lv3.icon} ${cls.ddIco}`} />}
                                <div>
                                  <div className="fw-semibold">{lv3.label}</div>
                                </div>
                              </a>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </header>

      {/* ===== HERO ===== */}
      <section className={cls.hero}>
        <div className={cls.ribbon}></div>
        <div className={cls.heroInner}>
          <h1>
            Bật <span className={cls.highlight}>năng lượng học tập</span> — Tỏa sáng tương lai
          </h1>
          <p>Chương trình đa bậc • Kỹ năng thực chiến • Hỗ trợ nghề nghiệp.</p>

          <div className={cls.chips}>
            <a className={`${cls.chip} ${cls.purple}`} href="#">
              <span className={`${cls.dot} ${cls.purple}`}></span> STEM
            </a>
            <a className={`${cls.chip} ${cls.pink}`} href="#">
              <span className={`${cls.dot} ${cls.pink}`}></span> Ngoại ngữ
            </a>
            <a className={`${cls.chip} ${cls.orange}`} href="#">
              <span className={`${cls.dot} ${cls.orange}`}></span> Kinh doanh
            </a>
            <a className={`${cls.chip} ${cls.purple}`} href="#">
              <span className={`${cls.dot} ${cls.purple}`}></span> Thiết kế
            </a>
          </div>

          <form className={`${cls.search} ${cls.heroSearch}`} role="search" onSubmit={(e) => e.preventDefault()}>
            <select className="form-select">
              <option>Mọi hình thức</option>
              <option>Offline</option>
              <option>Online</option>
              <option>Hybrid</option>
            </select>
            <input className="form-control" placeholder="Tìm: Lập trình, IELTS, Data & AI…" />
            <button className="btn" type="submit">
              <i className="bi bi-search"></i> Tìm
            </button>
          </form>
        </div>
      </section>
    </>
  );

  function renderNav(it: NavItem) {
    const content = <span>{it.label}</span>;
    if (preview) return <button className={cls.navLink}>{content}</button>;
    if (!it.href) return <span className={cls.navLink}>{content}</span>;
    const ext = isExternal(it.href);
    return ext ? (
      <a href={it.href} className={cls.navLink} target="_blank" rel="noreferrer">
        {content}
      </a>
    ) : (
      <Link href={it.href as Route} className={cls.navLink}>
        {content}
      </Link>
    );
  }
}

/* ========= RegItem ========= */
export const HEADER_EDU_BIZ: RegItem = {
  kind: "HeaderEduBiz",
  label: "Header Edu",
  defaults: {
    variant: "edubiz-ignite",
    theme: "vibrant",
    brandText: "EduBiz Ignite",
    slogan: "Learn • Build • Shine",
    logoSrc: "/assets/images/logo.png",
    ctaText: "Đăng ký ngay",
    topLinksJson: JSON.stringify(
      [
        { label: "Cơ sở", href: "#" },
        { label: "Ngôn ngữ", href: "#" },
        { label: "Học bổng", href: "#" },
      ],
      null,
      2
    ),
    categoriesJson: JSON.stringify(
      [
        {
          label: "Chương trình",
          children: [
            {
              label: "Học thuật",
              children: [
                { label: "Đại học / Cao đẳng", href: "#" },
                { label: "Sau đại học", href: "#" },
              ],
            },
            {
              label: "Kỹ năng & Chứng chỉ",
              children: [
                { label: "Bootcamp / IT", href: "#" },
                { label: "Ngoại ngữ", href: "#" },
              ],
            },
          ],
        },
        { label: "Tuyển sinh", href: "#" },
        { label: "Tài nguyên", href: "#" },
        { label: "Tin tức", href: "#" },
        { label: "Liên hệ", href: "#" },
      ],
      null,
      2
    ),
    note: "Energetic header for course business & learning platform",
  },
  inspector: [
    { key: "brandText", label: "Brand Text", kind: "text" },
    { key: "slogan", label: "Slogan", kind: "text" },
    { key: "logoSrc", label: "Logo URL", kind: "text" },
    { key: "ctaText", label: "CTA Text", kind: "text" },
    { key: "ctaHref", label: "CTA Href", kind: "text" },
    { key: "topLinksJson", label: "Top Links (JSON)", kind: "textarea" },
    { key: "categoriesJson", label: "Categories (JSON)", kind: "textarea" },
  ],
  render: (p) => {
    const topLinks = parseJson<TopLink[]>(p.topLinksJson, []);
    const categories = parseJson<NavItem[]>(p.categoriesJson, []);
    return <HeaderEduBiz {...p} topLinks={topLinks} categories={categories} preview={true} />;
  },
};
