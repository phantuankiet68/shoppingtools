"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/template/shopGreen/footer/footer1.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type FooterInfoItem = { label: string; text: string };

export type FooterLinkItem = { label: string; href: string };

export type FooterHotlineItem = { label: string; phone: string };

export type FooterSocialItem = { label: string; href: string; icon: string };

export type FooterPartnerItem = { label: string; href: string; imageSrc: string };

export type FooterCert = {
  imageSrc: string;
  title: string;
  sub: string;
};

export type FooterBrand = {
  name: string;
  tag: string;
  info: FooterInfoItem[];
  cert?: FooterCert;
};

export type Footer1Props = {
  brand?: FooterBrand;

  linksTitle?: string;
  links?: FooterLinkItem[];

  newsletterTitle?: string;
  newsletterDesc?: string;
  placeholderEmail?: string;
  submitAriaLabel?: string;

  supportTitle?: string;
  hotlines?: FooterHotlineItem[];
  socials?: FooterSocialItem[];

  partnersTitle?: string;
  partners?: FooterPartnerItem[];

  copyrightText?: string; // dùng {year}
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_BRAND: FooterBrand = {
  name: "DAI LINH COSMETICS",
  tag: "Authentic products • Fast support",
  info: [
    { label: "Address", text: "Số 29/150 Giảng Võ, Phường Giảng Võ, Hà Nội" },
    { label: "Phone", text: "024.3538 1818" },
    { label: "Business ID", text: "0101251137" },
  ],
  cert: {
    imageSrc: "/images/bocongthuong.png",
    title: "Verified business",
    sub: "Registered with authorities",
  },
};

const DEFAULT_LINKS: FooterLinkItem[] = [
  { label: "General policies", href: "/policy" },
  { label: "Shipping policy", href: "/shipping" },
  { label: "Return & refund", href: "/refund" },
  { label: "Shopping guide", href: "/guide" },
  { label: "Terms of service", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
  { label: "Payment methods", href: "/payment" },
];

const DEFAULT_HOTLINES: FooterHotlineItem[] = [
  { label: "Hotline", phone: "19001263" },
  { label: "Support", phone: "0917002332" },
];

const DEFAULT_SOCIALS: FooterSocialItem[] = [
  { label: "Facebook", href: "#", icon: "bi-facebook" },
  { label: "YouTube", href: "#", icon: "bi-youtube" },
  { label: "Zalo", href: "#", icon: "bi-chat-dots" },
];

const DEFAULT_PARTNERS: FooterPartnerItem[] = [
  { label: "Partner 1", href: "#", imageSrc: "/images/partner1.png" },
  { label: "Partner 2", href: "#", imageSrc: "/images/partner2.png" },
  { label: "Partner 3", href: "#", imageSrc: "/images/partner3.png" },
];

/* ================= JSON Helpers (like Hero1) ================= */
function safeJson<T>(raw?: string): T | undefined {
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

/* ================= Component ================= */
export function Footer1({
  brand,
  linksTitle = "Information",
  links,
  newsletterTitle = "Newsletter",
  newsletterDesc = "Subscribe to get new arrivals and special deals.",
  placeholderEmail = "Enter your email",
  submitAriaLabel = "Subscribe",
  supportTitle = "Customer support",
  hotlines,
  socials,
  partnersTitle = "Linked websites",
  partners,
  copyrightText = "© {year} DAI LINH COSMETICS. All rights reserved.",
  preview = false,
}: Footer1Props) {
  const bd = useMemo(() => brand ?? DEFAULT_BRAND, [brand]);
  const lks = useMemo(() => links ?? DEFAULT_LINKS, [links]);
  const hls = useMemo(() => hotlines ?? DEFAULT_HOTLINES, [hotlines]);
  const scs = useMemo(() => socials ?? DEFAULT_SOCIALS, [socials]);
  const pts = useMemo(() => partners ?? DEFAULT_PARTNERS, [partners]);

  const railRef = useRef<HTMLDivElement | null>(null);

  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState<string>("");
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
    showToast("Subscribed! Check your inbox soon.");
  };

  const scrollRail = (dir: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const step = Math.max(220, rail.clientWidth * 0.75);
    rail.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const copy = useMemo(() => copyrightText.replace("{year}", String(year)), [copyrightText, year]);

  return (
    <footer className={cls.siteFooter} aria-label="Site footer">
      <div className={cls.footerTop}>
        <div className={cls.footerContainerTop}>
          {/* Brand / Company */}
          <div className={`${cls.footerCol} ${cls.footerBrand}`}>
            <div className={cls.footerBrandHead}>
              <div className={cls.footerLogoDot} aria-hidden="true" />
              <div>
                <div className={cls.footerBrandName}>{bd.name}</div>
                <div className={cls.footerBrandTag}>{bd.tag}</div>
              </div>
            </div>

            <ul className={cls.footerInfoList}>
              {bd.info.map((x, i) => (
                <li key={i} className={cls.footerInfoItem}>
                  <span className={cls.footerInfoLabel}>{x.label}</span>
                  <span className={cls.footerInfoText}>{x.text}</span>
                </li>
              ))}
            </ul>

            {bd.cert ? (
              <div className={cls.footerCert}>
                <div className={cls.footerCertImgWrap} aria-hidden="true">
                  <Image src={bd.cert.imageSrc} alt="Certification" width={72} height={48} className={cls.footerCertImg} />
                </div>
                <div className={cls.footerCertText}>
                  <div className={cls.footerCertTitle}>{bd.cert.title}</div>
                  <div className={cls.footerCertSub}>{bd.cert.sub}</div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Links */}
          <nav className={`${cls.footerCol} ${cls.footerLinks}`} aria-label="Footer links">
            <h3 className={cls.footerTitle}>{linksTitle}</h3>

            <ul className={cls.footerLinkList}>
              {lks.map((it, i) =>
                preview ? (
                  <li key={i}>
                    <a className={cls.footerLink} href="#" onClick={onBlockClick}>
                      {it.label}
                    </a>
                  </li>
                ) : (
                  <li key={i}>
                    <Link className={cls.footerLink} href={(it.href || "/") as Route}>
                      {it.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </nav>

          {/* Newsletter + Support */}
          <div className={`${cls.footerCol} ${cls.footerNews}`}>
            <h3 className={cls.footerTitle}>{newsletterTitle}</h3>
            <p className={cls.footerDesc}>{newsletterDesc}</p>

            <form className={cls.footerForm} onSubmit={onSubmit} noValidate>
              <label className={cls.srOnly} htmlFor="footerEmail">
                Your email
              </label>

              <input
                className={cls.footerInput}
                id="footerEmail"
                type="email"
                name="email"
                placeholder={placeholderEmail}
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <button className={cls.footerSubmit} type="submit" aria-label={submitAriaLabel} onClick={preview ? onBlockClick : undefined}>
                <i className={`bi bi-arrow-right ${cls.footerSubmitIcon}`} aria-hidden="true" />
              </button>
            </form>

            <div className={cls.footerSupport}>
              <div className={cls.footerSupportTitle}>{supportTitle}</div>

              {hls.map((h, i) => {
                const telHref = `tel:${h.phone.replace(/[^\d+]/g, "")}`;
                return preview ? (
                  <a key={i} className={cls.footerHotline} href="#" onClick={onBlockClick} aria-label={`Call ${h.label} ${h.phone}`}>
                    <span className={cls.footerPhoneIcon} aria-hidden="true">
                      <i className="bi bi-telephone-fill" />
                    </span>
                    <span className={cls.footerHotlineText}>
                      <span className={cls.footerHotlineLabel}>{h.label}</span>
                      <span className={cls.footerHotlineNumber}>{h.phone}</span>
                    </span>
                  </a>
                ) : (
                  <a key={i} className={cls.footerHotline} href={telHref} aria-label={`Call ${h.label} ${h.phone}`}>
                    <span className={cls.footerPhoneIcon} aria-hidden="true">
                      <i className="bi bi-telephone-fill" />
                    </span>
                    <span className={cls.footerHotlineText}>
                      <span className={cls.footerHotlineLabel}>{h.label}</span>
                      <span className={cls.footerHotlineNumber}>{h.phone}</span>
                    </span>
                  </a>
                );
              })}

              <div className={cls.footerSocial} aria-label="Social links">
                {scs.map((s, i) =>
                  preview ? (
                    <a key={i} className={cls.footerSocialBtn} href="#" onClick={onBlockClick} aria-label={s.label}>
                      <i className={`bi ${s.icon}`} aria-hidden="true" />
                    </a>
                  ) : (
                    <a key={i} className={cls.footerSocialBtn} href={s.href} aria-label={s.label} rel="noreferrer">
                      <i className={`bi ${s.icon}`} aria-hidden="true" />
                    </a>
                  ),
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partners */}
      <div className={cls.footerPartners} aria-label="Partner websites">
        <div className={cls.footerContainerPartnersHead}>
          <h3 className={cls.footerPartnersTitle}>{partnersTitle}</h3>

          <div className={cls.footerPartnersControls}>
            <button className={cls.footerPartnerNav} type="button" aria-label="Previous" onClick={() => scrollRail(-1)}>
              <i className="bi bi-arrow-left" />
            </button>
            <button className={cls.footerPartnerNav} type="button" aria-label="Next" onClick={() => scrollRail(1)}>
              <i className="bi bi-arrow-right" />
            </button>
          </div>
        </div>

        <div className={cls.footerPartnersRail} ref={railRef}>
          {pts.map((p, i) =>
            preview ? (
              <a key={i} className={cls.footerPartnerCard} href="#" onClick={onBlockClick} aria-label={p.label}>
                <Image src={p.imageSrc} alt={p.label} width={180} height={70} className={cls.footerPartnerImg} />
              </a>
            ) : (
              <a key={i} className={cls.footerPartnerCard} href={p.href} aria-label={p.label} rel="noreferrer">
                <Image src={p.imageSrc} alt={p.label} width={180} height={70} className={cls.footerPartnerImg} />
              </a>
            ),
          )}
        </div>
      </div>

      {/* Bottom */}
      <div className={cls.footerBottom}>
        <div className={cls.footerContainerBottomRow}>
          <div className={cls.footerCopy}>{copy}</div>

          <button className={cls.footerTopBtn} type="button" aria-label="Back to top" onClick={goTop}>
            <i className="bi bi-arrow-up" /> Top
          </button>
        </div>
      </div>

      {/* Toast */}
      <div className={`${cls.footerToast} ${toast ? cls.isShow : ""}`} role="status" aria-live="polite" aria-atomic="true">
        {toast}
      </div>
    </footer>
  );
}

/* ================= RegItem ================= */
export const SHOP_FOOTER_GREEN_ONE: RegItem = {
  kind: "Footer1",
  label: "Footer",
  defaults: {
    brand: JSON.stringify(DEFAULT_BRAND, null, 2),

    linksTitle: "Information",
    links: JSON.stringify(DEFAULT_LINKS, null, 2),

    newsletterTitle: "Newsletter",
    newsletterDesc: "Subscribe to get new arrivals and special deals.",
    placeholderEmail: "Enter your email",
    submitAriaLabel: "Subscribe",

    supportTitle: "Customer support",
    hotlines: JSON.stringify(DEFAULT_HOTLINES, null, 2),
    socials: JSON.stringify(DEFAULT_SOCIALS, null, 2),

    partnersTitle: "Linked websites",
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

    { key: "supportTitle", label: "Support title", kind: "text" },
    { key: "hotlines", label: "Hotlines (JSON)", kind: "textarea", rows: 8 },
    { key: "socials", label: "Socials (JSON)", kind: "textarea", rows: 8 },

    { key: "partnersTitle", label: "Partners title", kind: "text" },
    { key: "partners", label: "Partners (JSON)", kind: "textarea", rows: 10 },

    { key: "copyrightText", label: "Copyright text (use {year})", kind: "text" },
  ],
  render: (p) => {
    const brand = safeJson<FooterBrand>(p.brand);
    const links = safeJson<FooterLinkItem[]>(p.links);
    const hotlines = safeJson<FooterHotlineItem[]>(p.hotlines);
    const socials = safeJson<FooterSocialItem[]>(p.socials);
    const partners = safeJson<FooterPartnerItem[]>(p.partners);

    return (
      <div className="sectionContainer" aria-label="Shop Footer (Green One)">
        <Footer1
          brand={brand}
          linksTitle={String(p.linksTitle || "Information")}
          links={links}
          newsletterTitle={String(p.newsletterTitle || "Newsletter")}
          newsletterDesc={String(p.newsletterDesc || "")}
          placeholderEmail={String(p.placeholderEmail || "Enter your email")}
          submitAriaLabel={String(p.submitAriaLabel || "Subscribe")}
          supportTitle={String(p.supportTitle || "Customer support")}
          hotlines={hotlines}
          socials={socials}
          partnersTitle={String(p.partnersTitle || "Linked websites")}
          partners={partners}
          copyrightText={String(p.copyrightText || "© {year} DAI LINH COSMETICS. All rights reserved.")}
          preview={true}
        />
      </div>
    );
  },
};

export default Footer1;
