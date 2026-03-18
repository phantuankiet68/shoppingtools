"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/shopGreen/footer/footerRegion.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type FooterRegionInfoItem = { label: string; text: string };

export type FooterRegionLinkItem = { label: string; href: string };

export type FooterRegionHotlineItem = { label: string; phone: string };

export type FooterRegionSocialItem = { label: string; href: string; icon: string };

export type FooterRegionPartnerItem = { label: string; href: string; imageSrc: string };

export type FooterRegionZoneItem = {
  title: string;
  desc: string;
};

export type FooterRegionCert = {
  imageSrc: string;
  title: string;
  sub: string;
};

export type FooterRegionBrand = {
  name: string;
  tag: string;
  info: FooterRegionInfoItem[];
  cert?: FooterRegionCert;
};

export type FooterRegionProps = {
  brand?: FooterRegionBrand;

  zonesTitle?: string;
  zones?: FooterRegionZoneItem[];

  linksTitle?: string;
  links?: FooterRegionLinkItem[];

  newsletterTitle?: string;
  newsletterDesc?: string;
  placeholderEmail?: string;
  submitAriaLabel?: string;
  submitLabel?: string;

  supportTitle?: string;
  hotlines?: FooterRegionHotlineItem[];
  socials?: FooterRegionSocialItem[];

  partnersTitle?: string;
  partners?: FooterRegionPartnerItem[];

  copyrightText?: string; // dùng {year}
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_BRAND: FooterRegionBrand = {
  name: "DAI LINH COSMETICS",
  tag: "Authentic beauty care with warm support across every touchpoint.",
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

const DEFAULT_ZONES: FooterRegionZoneItem[] = [
  { title: "North Region", desc: "Fast consultation and shipping support for northern customers." },
  { title: "Central Region", desc: "Balanced delivery coverage with attentive customer care." },
  { title: "South Region", desc: "High-speed order handling and responsive after-sales support." },
];

const DEFAULT_LINKS: FooterRegionLinkItem[] = [
  { label: "General policies", href: "/policy" },
  { label: "Shipping policy", href: "/shipping" },
  { label: "Return & refund", href: "/refund" },
  { label: "Shopping guide", href: "/guide" },
  { label: "Terms of service", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
];

const DEFAULT_HOTLINES: FooterRegionHotlineItem[] = [
  { label: "Hotline", phone: "19001263" },
  { label: "Support", phone: "0917002332" },
];

const DEFAULT_SOCIALS: FooterRegionSocialItem[] = [
  { label: "Facebook", href: "#", icon: "bi-facebook" },
  { label: "YouTube", href: "#", icon: "bi-youtube" },
  { label: "Instagram", href: "#", icon: "bi-instagram" },
];

const DEFAULT_PARTNERS: FooterRegionPartnerItem[] = [
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
export function FooterRegion({
  brand,
  zonesTitle = "Regional support",
  zones,
  linksTitle = "Quick links",
  links,
  newsletterTitle = "Stay connected",
  newsletterDesc = "Subscribe for selected offers, new arrivals and thoughtful updates.",
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
}: FooterRegionProps) {
  const bd = useMemo(() => brand ?? DEFAULT_BRAND, [brand]);
  const zns = useMemo(() => zones ?? DEFAULT_ZONES, [zones]);
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
    showToast("Subscribed successfully.");
  };

  const scrollRail = (dir: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const step = Math.max(220, rail.clientWidth * 0.7);
    rail.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const copy = useMemo(() => copyrightText.replace("{year}", String(year)), [copyrightText, year]);

  return (
    <footer className={cls.siteFooter} aria-label="Site footer">
      <div className={cls.footerTop}>
        <div className={cls.footerContainer}>
          {/* Brand region */}
          <div className={cls.footerHero}>
            <div className={cls.footerBrandPanel}>
              <div className={cls.footerBrandHead}>
                <div className={cls.footerLogoMark} aria-hidden="true">
                  <div className={cls.footerLogoDot} />
                </div>

                <div className={cls.footerBrandMeta}>
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
                    <Image
                      src={bd.cert.imageSrc}
                      alt="Certification"
                      width={72}
                      height={48}
                      className={cls.footerCertImg}
                    />
                  </div>

                  <div className={cls.footerCertText}>
                    <div className={cls.footerCertTitle}>{bd.cert.title}</div>
                    <div className={cls.footerCertSub}>{bd.cert.sub}</div>
                  </div>
                </div>
              ) : null}
            </div>

            <div className={cls.footerZonePanel}>
              <h3 className={cls.footerTitle}>{zonesTitle}</h3>

              <div className={cls.footerZoneGrid}>
                {zns.map((item, i) => (
                  <div key={i} className={cls.footerZoneCard}>
                    <div className={cls.footerZoneTitle}>{item.title}</div>
                    <div className={cls.footerZoneDesc}>{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Region blocks */}
          <div className={cls.footerMainGrid}>
            <nav className={cls.footerBlock} aria-label="Footer links">
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

            <div className={cls.footerBlock}>
              <h3 className={cls.footerTitle}>{supportTitle}</h3>

              <div className={cls.footerHotlines}>
                {hls.map((h, i) => {
                  const telHref = `tel:${h.phone.replace(/[^\d+]/g, "")}`;

                  return preview ? (
                    <a
                      key={i}
                      className={cls.footerHotline}
                      href="#"
                      onClick={onBlockClick}
                      aria-label={`Call ${h.label} ${h.phone}`}
                    >
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
              </div>

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

            <div className={cls.footerBlock}>
              <h3 className={cls.footerTitle}>{newsletterTitle}</h3>
              <p className={cls.footerDesc}>{newsletterDesc}</p>

              <form className={cls.footerForm} onSubmit={onSubmit} noValidate>
                <label className={cls.srOnly} htmlFor="footerRegionEmail">
                  Your email
                </label>

                <input
                  className={cls.footerInput}
                  id="footerRegionEmail"
                  type="email"
                  name="email"
                  placeholder={placeholderEmail}
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />

                <button
                  className={cls.footerSubmit}
                  type="submit"
                  aria-label={submitAriaLabel}
                  onClick={preview ? onBlockClick : undefined}
                >
                  <span>{submitLabel}</span>
                  <i className={`bi bi-arrow-right ${cls.footerSubmitIcon}`} aria-hidden="true" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Partners */}
      <div className={cls.footerPartners} aria-label="Partner websites">
        <div className={cls.footerContainer}>
          <div className={cls.footerPartnersHead}>
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
      </div>

      {/* Bottom */}
      <div className={cls.footerBottom}>
        <div className={cls.footerContainerBottom}>
          <div className={cls.footerCopy}>{copy}</div>

          <button className={cls.footerTopBtn} type="button" aria-label="Back to top" onClick={goTop}>
            <i className="bi bi-arrow-up" /> Top
          </button>
        </div>
      </div>

      {/* Toast */}
      <div
        className={`${cls.footerToast} ${toast ? cls.isShow : ""}`}
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
export const SHOP_FOOTER_GREEN_REGION: RegItem = {
  kind: "FooterRegion",
  label: "Footer Region",
  defaults: {
    brand: JSON.stringify(DEFAULT_BRAND, null, 2),

    zonesTitle: "Regional support",
    zones: JSON.stringify(DEFAULT_ZONES, null, 2),

    linksTitle: "Quick links",
    links: JSON.stringify(DEFAULT_LINKS, null, 2),

    newsletterTitle: "Stay connected",
    newsletterDesc: "Subscribe for selected offers, new arrivals and thoughtful updates.",
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

    { key: "zonesTitle", label: "Zones title", kind: "text" },
    { key: "zones", label: "Zones (JSON)", kind: "textarea", rows: 10 },

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
    const brand = safeJson<FooterRegionBrand>(typeof p.brand === "string" ? p.brand : undefined);
    const zones = safeJson<FooterRegionZoneItem[]>(typeof p.zones === "string" ? p.zones : undefined);
    const links = safeJson<FooterRegionLinkItem[]>(typeof p.links === "string" ? p.links : undefined);
    const hotlines = safeJson<FooterRegionHotlineItem[]>(typeof p.hotlines === "string" ? p.hotlines : undefined);
    const socials = safeJson<FooterRegionSocialItem[]>(typeof p.socials === "string" ? p.socials : undefined);
    const partners = safeJson<FooterRegionPartnerItem[]>(typeof p.partners === "string" ? p.partners : undefined);

    return (
      <div className="sectionContainer" aria-label="Shop Footer (Region)">
        <FooterRegion
          brand={brand}
          zonesTitle={String(p.zonesTitle || "Regional support")}
          zones={zones}
          linksTitle={String(p.linksTitle || "Quick links")}
          links={links}
          newsletterTitle={String(p.newsletterTitle || "Stay connected")}
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

export default FooterRegion;