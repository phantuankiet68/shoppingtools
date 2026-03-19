"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Footer/FooterMinimal.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type FooterMinimalInfoItem = { label: string; text: string };

export type FooterMinimalLinkItem = { label: string; href: string };

export type FooterMinimalHotlineItem = { label: string; phone: string };

export type FooterMinimalSocialItem = { label: string; href: string; icon: string };

export type FooterMinimalPartnerItem = { label: string; href: string; imageSrc: string };

export type FooterMinimalCert = {
  imageSrc: string;
  title: string;
  sub: string;
};

export type FooterMinimalBrand = {
  name: string;
  tag: string;
  info: FooterMinimalInfoItem[];
  cert?: FooterMinimalCert;
};

export type FooterMinimalProps = {
  brand?: FooterMinimalBrand;

  linksTitle?: string;
  links?: FooterMinimalLinkItem[];

  newsletterTitle?: string;
  newsletterDesc?: string;
  placeholderEmail?: string;
  submitAriaLabel?: string;
  submitLabel?: string;

  supportTitle?: string;
  hotlines?: FooterMinimalHotlineItem[];
  socials?: FooterMinimalSocialItem[];

  partnersTitle?: string;
  partners?: FooterMinimalPartnerItem[];

  copyrightText?: string;
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_BRAND: FooterMinimalBrand = {
  name: "DAI LINH COSMETICS",
  tag: "Authentic beauty care with a calm, thoughtful experience.",
  info: [
    { label: "Address", text: "Số 29/150 Giảng Võ, Phường Giảng Võ, Hà Nội" },
    { label: "Phone", text: "024.3538 1818" },
    { label: "Business ID", text: "0101251137" },
  ],
  cert: {
    imageSrc: "/images/bocongthuong.png",
    title: "Bộ Công Thương",
    sub: "Đã thông báo/đăng ký theo quy định",
  },
};

const DEFAULT_LINKS: FooterMinimalLinkItem[] = [
  { label: "General policies", href: "/policy" },
  { label: "Shipping policy", href: "/shipping" },
  { label: "Return & refund", href: "/refund" },
  { label: "Shopping guide", href: "/guide" },
  { label: "Terms of service", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
];

const DEFAULT_HOTLINES: FooterMinimalHotlineItem[] = [
  { label: "Hotline", phone: "19001263" },
  { label: "Support", phone: "0917002332" },
];

const DEFAULT_SOCIALS: FooterMinimalSocialItem[] = [
  { label: "Facebook", href: "#", icon: "bi-facebook" },
  { label: "YouTube", href: "#", icon: "bi-youtube" },
  { label: "Instagram", href: "#", icon: "bi-instagram" },
  { label: "TikTok", href: "#", icon: "bi-tiktok" },
];

const DEFAULT_PARTNERS: FooterMinimalPartnerItem[] = [
  { label: "Partner 1", href: "#", imageSrc: "/images/partner1.png" },
  { label: "Partner 2", href: "#", imageSrc: "/images/partner2.png" },
  { label: "Partner 3", href: "#", imageSrc: "/images/partner3.png" },
];

/* ================= JSON Helpers ================= */
function safeJson<T>(raw?: string): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

/* ================= Component ================= */
export function FooterMinimal({
  brand,
  linksTitle = "Quick links",
  links,
  newsletterTitle = "Stay in touch",
  newsletterDesc = "Subscribe for thoughtful updates, selected offers and new arrivals.",
  placeholderEmail = "Enter your email",
  submitAriaLabel = "Subscribe",
  submitLabel = "Subscribe",
  supportTitle = "Support",
  hotlines,
  socials,
  partnersTitle = "Partners",
  partners,
  copyrightText = "© {year} DAI LINH COSMETICS. All rights reserved.",
  preview = false,
}: FooterMinimalProps) {
  const bd = useMemo(() => brand ?? DEFAULT_BRAND, [brand]);
  const lks = useMemo(() => links ?? DEFAULT_LINKS, [links]);
  const hls = useMemo(() => hotlines ?? DEFAULT_HOTLINES, [hotlines]);
  const scs = useMemo(() => socials ?? DEFAULT_SOCIALS, [socials]);
  const pts = useMemo(() => partners ?? DEFAULT_PARTNERS, [partners]);

  const railRef = useRef<HTMLDivElement | null>(null);

  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
    setYear(new Date().getFullYear());
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(""), 2200);
  };

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = email.trim();
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val);

    if (!ok) {
      showToast("Please enter a valid email.");
      return;
    }

    setEmail("");
    showToast("Subscribed successfully.");
  };

  const scrollRail = (dir: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const step = Math.max(220, rail.clientWidth * 0.72);
    rail.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const copy = useMemo(() => copyrightText.replace("{year}", String(year)), [copyrightText, year]);

  return (
    <footer className={cls.siteFooter} aria-label="Site footer">
      <div className={cls.shell}>
        <div className={cls.mainGrid}>
          <div className={cls.brandCard}>
            <div className={cls.brandTop}>
              <div className={cls.brandBadge}>Premium beauty</div>

              <div className={cls.brandHead}>
                <div className={cls.logoMark} aria-hidden="true">
                  <span className={cls.logoDot} />
                </div>

                <div className={cls.brandMeta}>
                  <h2 className={cls.brandName}>{bd.name}</h2>
                  <p className={cls.brandTag}>{bd.tag}</p>
                </div>
              </div>

              <div className={cls.brandHighlights}>
                <span className={cls.highlightPill}>Authentic products</span>
                <span className={cls.highlightPill}>Thoughtful service</span>
                <span className={cls.highlightPill}>Official distribution</span>
              </div>
            </div>

            <div className={cls.infoList}>
              {bd.info.map((item, i) => (
                <div key={i} className={cls.infoRow}>
                  <span className={cls.infoLabel}>{item.label}</span>
                  <span className={cls.infoText}>{item.text}</span>
                </div>
              ))}
            </div>

            <div className={cls.socialRow} aria-label="Social links">
              {scs.map((s, i) =>
                preview ? (
                  <a
                    key={i}
                    className={cls.socialBtn}
                    href="#"
                    onClick={onBlockClick}
                    aria-label={s.label}
                  >
                    <i className={`bi ${s.icon}`} aria-hidden="true" />
                  </a>
                ) : (
                  <a
                    key={i}
                    className={cls.socialBtn}
                    href={s.href}
                    aria-label={s.label}
                    rel="noreferrer"
                  >
                    <i className={`bi ${s.icon}`} aria-hidden="true" />
                  </a>
                ),
              )}
            </div>
          </div>

          <div className={cls.centerCol}>
            <div className={cls.linksCard}>
              <h3 className={cls.cardTitle}>{linksTitle}</h3>

              <ul className={cls.linkList}>
                {lks.map((it, i) =>
                  preview ? (
                    <li key={i}>
                      <a className={cls.linkItem} href="#" onClick={onBlockClick}>
                        <span>{it.label}</span>
                        <i className="bi bi-arrow-up-right" aria-hidden="true" />
                      </a>
                    </li>
                  ) : (
                    <li key={i}>
                      <Link className={cls.linkItem} href={(it.href || "/") as Route}>
                        <span>{it.label}</span>
                        <i className="bi bi-arrow-up-right" aria-hidden="true" />
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>

            <div className={cls.supportCard}>
              <h3 className={cls.cardTitle}>{supportTitle}</h3>

              <div className={cls.hotlineGrid}>
                {hls.map((h, i) => {
                  const telHref = `tel:${h.phone.replace(/[^\d+]/g, "")}`;

                  return preview ? (
                    <a
                      key={i}
                      className={cls.hotlineCard}
                      href="#"
                      onClick={onBlockClick}
                      aria-label={`Call ${h.label} ${h.phone}`}
                    >
                      <span className={cls.hotlineIcon} aria-hidden="true">
                        <i className="bi bi-headset" />
                      </span>

                      <span className={cls.hotlineMeta}>
                        <span className={cls.hotlineLabel}>{h.label}</span>
                        <span className={cls.hotlineNumber}>{h.phone}</span>
                      </span>
                    </a>
                  ) : (
                    <a
                      key={i}
                      className={cls.hotlineCard}
                      href={telHref}
                      aria-label={`Call ${h.label} ${h.phone}`}
                    >
                      <span className={cls.hotlineIcon} aria-hidden="true">
                        <i className="bi bi-headset" />
                      </span>

                      <span className={cls.hotlineMeta}>
                        <span className={cls.hotlineLabel}>{h.label}</span>
                        <span className={cls.hotlineNumber}>{h.phone}</span>
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={cls.rightCol}>
            <div className={cls.newsCard}>
              <div className={cls.cardEyebrow}>Newsletter</div>
              <h3 className={cls.newsTitle}>{newsletterTitle}</h3>
              <p className={cls.newsDesc}>{newsletterDesc}</p>

              <form className={cls.newsForm} onSubmit={onSubmit} noValidate>
                <label className={cls.srOnly} htmlFor="footerMinimalEmail">
                  Your email
                </label>

                <div className={cls.inputWrap}>
                  <i className={`bi bi-envelope ${cls.inputIcon}`} aria-hidden="true" />
                  <input
                    className={cls.newsInput}
                    id="footerMinimalEmail"
                    type="email"
                    name="email"
                    placeholder={placeholderEmail}
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <button
                  className={cls.newsSubmit}
                  type="submit"
                  aria-label={submitAriaLabel}
                  onClick={preview ? onBlockClick : undefined}
                >
                  <span>{submitLabel}</span>
                  <i className="bi bi-arrow-right" aria-hidden="true" />
                </button>
              </form>
            </div>

            {bd.cert ? (
              <div className={cls.certCard}>
                <div className={cls.certHead}>
                  <div className={cls.cardEyebrow}>Chứng nhận</div>
                </div>

                <div className={cls.certBody}>
                  <div className={cls.certImageWrap}>
                    <Image
                      src={bd.cert.imageSrc}
                      alt={bd.cert.title}
                      width={90}
                      height={60}
                      className={cls.certImage}
                    />
                  </div>

                  <div className={cls.certMeta}>
                    <div className={cls.certTitle}>{bd.cert.title}</div>
                    <div className={cls.certSub}>{bd.cert.sub}</div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className={cls.partnerSection} aria-label="Partner websites">
          <div className={cls.partnerHead}>
            <div>
              <div className={cls.cardEyebrow}>Partners</div>
              <h3 className={cls.partnerTitle}>{partnersTitle}</h3>
            </div>

            <div className={cls.partnerControls}>
              <button
                className={cls.partnerNav}
                type="button"
                aria-label="Previous"
                onClick={() => scrollRail(-1)}
              >
                <i className="bi bi-arrow-left" />
              </button>

              <button
                className={cls.partnerNav}
                type="button"
                aria-label="Next"
                onClick={() => scrollRail(1)}
              >
                <i className="bi bi-arrow-right" />
              </button>
            </div>
          </div>

          <div className={cls.partnerRail} ref={railRef}>
            {pts.map((p, i) =>
              preview ? (
                <a
                  key={i}
                  className={cls.partnerCard}
                  href="#"
                  onClick={onBlockClick}
                  aria-label={p.label}
                >
                  <Image
                    src={p.imageSrc}
                    alt={p.label}
                    width={180}
                    height={70}
                    className={cls.partnerImg}
                  />
                </a>
              ) : (
                <a
                  key={i}
                  className={cls.partnerCard}
                  href={p.href}
                  aria-label={p.label}
                  rel="noreferrer"
                >
                  <Image
                    src={p.imageSrc}
                    alt={p.label}
                    width={180}
                    height={70}
                    className={cls.partnerImg}
                  />
                </a>
              ),
            )}
          </div>
        </div>

        <div className={cls.footerBottom}>
          <div className={cls.copyText}>{copy}</div>

          <button className={cls.topBtn} type="button" aria-label="Back to top" onClick={goTop}>
            <i className="bi bi-arrow-up" />
            <span>Top</span>
          </button>
        </div>
      </div>

      <div
        className={`${cls.toast} ${toast ? cls.isShow : ""}`}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {toast}
      </div>
    </footer>
  );
}

/* ================= RegItem ================= */
export const SHOP_FOOTER_MINIMAL: RegItem = {
  kind: "FooterMinimal",
  label: "Footer Minimal",
  defaults: {
    brand: JSON.stringify(DEFAULT_BRAND, null, 2),

    linksTitle: "Quick links",
    links: JSON.stringify(DEFAULT_LINKS, null, 2),

    newsletterTitle: "Stay in touch",
    newsletterDesc: "Subscribe for thoughtful updates, selected offers and new arrivals.",
    placeholderEmail: "Enter your email",
    submitAriaLabel: "Subscribe",
    submitLabel: "Subscribe",

    supportTitle: "Support",
    hotlines: JSON.stringify(DEFAULT_HOTLINES, null, 2),
    socials: JSON.stringify(DEFAULT_SOCIALS, null, 2),

    partnersTitle: "Partners",
    partners: JSON.stringify(DEFAULT_PARTNERS, null, 2),

    copyrightText: "© {year} DAI LINH COSMETICS. All rights reserved.",
  },
  inspector: [
    { key: "brand", label: "Brand (JSON)", kind: "textarea", rows: 12 },

    { key: "linksTitle", label: "Links title", kind: "text" },
    { key: "links", label: "Links (JSON)", kind: "textarea", rows: 12 },

    { key: "newsletterTitle", label: "Newsletter title", kind: "text" },
    { key: "newsletterDesc", label: "Newsletter desc", kind: "text" },
    { key: "placeholderEmail", label: "Email placeholder", kind: "text" },
    { key: "submitAriaLabel", label: "Submit aria label", kind: "text" },
    { key: "submitLabel", label: "Submit label", kind: "text" },

    { key: "supportTitle", label: "Support title", kind: "text" },
    { key: "hotlines", label: "Hotlines (JSON)", kind: "textarea", rows: 8 },
    { key: "socials", label: "Socials (JSON)", kind: "textarea", rows: 8 },

    { key: "partnersTitle", label: "Partners title", kind: "text" },
    { key: "partners", label: "Partners (JSON)", kind: "textarea", rows: 10 },

    { key: "copyrightText", label: "Copyright text (use {year})", kind: "text" },
  ],
  render: (p) => {
    const brand = safeJson<FooterMinimalBrand>(typeof p.brand === "string" ? p.brand : undefined);
    const links = safeJson<FooterMinimalLinkItem[]>(typeof p.links === "string" ? p.links : undefined);
    const hotlines = safeJson<FooterMinimalHotlineItem[]>(typeof p.hotlines === "string" ? p.hotlines : undefined);
    const socials = safeJson<FooterMinimalSocialItem[]>(typeof p.socials === "string" ? p.socials : undefined);
    const partners = safeJson<FooterMinimalPartnerItem[]>(typeof p.partners === "string" ? p.partners : undefined);

    return (
      <div className="sectionContainer" aria-label="Shop Footer (Minimal)">
        <FooterMinimal
          brand={brand}
          linksTitle={String(p.linksTitle || "Quick links")}
          links={links}
          newsletterTitle={String(p.newsletterTitle || "Stay in touch")}
          newsletterDesc={String(p.newsletterDesc || "")}
          placeholderEmail={String(p.placeholderEmail || "Enter your email")}
          submitAriaLabel={String(p.submitAriaLabel || "Subscribe")}
          submitLabel={String(p.submitLabel || "Subscribe")}
          supportTitle={String(p.supportTitle || "Support")}
          hotlines={hotlines}
          socials={socials}
          partnersTitle={String(p.partnersTitle || "Partners")}
          partners={partners}
          copyrightText={String(p.copyrightText || "© {year} DAI LINH COSMETICS. All rights reserved.")}
          preview={true}
        />
      </div>
    );
  },
};

export default FooterMinimal;