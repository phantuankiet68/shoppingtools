"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Footer/FooterAnnouncement.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type FooterAnnouncementInfoItem = { label: string; text: string };

export type FooterAnnouncementLinkItem = { label: string; href: string };

export type FooterAnnouncementHotlineItem = { label: string; phone: string; sub?: string };

export type FooterAnnouncementSocialItem = { label: string; href: string; icon: string };

export type FooterAnnouncementPaymentItem = {
  label: string;
  imageSrc: string;
};

export type FooterAnnouncementBrandLogoItem = {
  label: string;
  href: string;
  imageSrc: string;
};

export type FooterAnnouncementTagItem = {
  label: string;
  href: string;
};

export type FooterAnnouncementStoreItem = {
  label: string;
  href: string;
  imageSrc: string;
};

export type FooterAnnouncementCert = {
  imageSrc: string;
  title: string;
  sub?: string;
};

export type FooterAnnouncementBrand = {
  name: string;
  tag: string;
  logoSrc?: string;
  info?: FooterAnnouncementInfoItem[];
  cert?: FooterAnnouncementCert;
};

export type FooterAnnouncementProps = {
  brand?: FooterAnnouncementBrand;

  supportTitle?: string;
  hotlines?: FooterAnnouncementHotlineItem[];
  supportLinks?: FooterAnnouncementLinkItem[];

  aboutTitle?: string;
  aboutLinks?: FooterAnnouncementLinkItem[];

  partnerTitle?: string;
  partnerLinks?: FooterAnnouncementLinkItem[];

  newsletterTitle?: string;
  newsletterDesc?: string;
  placeholderEmail?: string;
  submitLabel?: string;
  submitAriaLabel?: string;

  socials?: FooterAnnouncementSocialItem[];
  paymentsTitle?: string;
  payments?: FooterAnnouncementPaymentItem[];

  qrImageSrc?: string;
  stores?: FooterAnnouncementStoreItem[];

  brandLogos?: FooterAnnouncementBrandLogoItem[];

  tagTitle?: string;
  tags?: FooterAnnouncementTagItem[];

  certificationTitle?: string;
  certificationImageSrc?: string;

  copyrightText?: string;
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_BRAND: FooterAnnouncementBrand = {
  name: "Tuan Kiet Store",
  tag: "Authentic cosmetics • Fast delivery",
  logoSrc: "/assets/templates/pay-atm-02f6dcbf23244255.png",
  info: [
    { label: "Head Office", text: "29/150 Giang Vo Street, Giang Vo Ward, Hanoi" },
    { label: "Hotline", text: "1800 6324" },
    { label: "Email", text: "support@example.com" },
  ],
  cert: {
    imageSrc: "/images/bocongthuong.png",
    title: "Registered with the Ministry of Industry and Trade",
    sub: "Verified business with transparent operations",
  },
};

const DEFAULT_SUPPORT_LINKS: FooterAnnouncementLinkItem[] = [
  { label: "Frequently Asked Questions", href: "/faq" },
  { label: "Submit a Support Request", href: "/support" },
  { label: "Ordering Guide", href: "/guide" },
  { label: "Shipping Methods", href: "/shipping" },
];

const DEFAULT_ABOUT_LINKS: FooterAnnouncementLinkItem[] = [
  { label: "About Us", href: "/about" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Beauty Blog", href: "/blog" },
  { label: "Careers", href: "/jobs" },
  { label: "Contact", href: "/contact" },
  { label: "Return Policy", href: "/refund" },
];

const DEFAULT_PARTNER_LINKS: FooterAnnouncementLinkItem[] = [
  { label: "Dermahair", href: "/dermahair" },
  { label: "Brand Partners", href: "/partners" },
  { label: "Payment Methods", href: "/payment" },
];

const DEFAULT_HOTLINES: FooterAnnouncementHotlineItem[] = [
  { label: "Hotline", phone: "1800 6324", sub: "Free of charge, 08:00 - 22:00 including weekends" },
];

const DEFAULT_SOCIALS: FooterAnnouncementSocialItem[] = [
  { label: "Facebook", href: "#", icon: "bi-facebook" },
  { label: "Instagram", href: "#", icon: "bi-instagram" },
  { label: "TikTok", href: "#", icon: "bi-tiktok" },
  { label: "YouTube", href: "#", icon: "bi-youtube" },
];

const DEFAULT_PAYMENTS: FooterAnnouncementPaymentItem[] = [
  { label: "Mastercard", imageSrc: "/assets/images/pay-mastercard.png" },
  { label: "ATM", imageSrc: "/assets/templates/pay-atm-02f6dcbf23244255.png" },
  { label: "Visa", imageSrc: "/assets/images/pay-visa.png" },
];

const DEFAULT_STORES: FooterAnnouncementStoreItem[] = [
  { label: "App Store", href: "#", imageSrc: "/assets/images/app-store.png" },
  { label: "Google Play", href: "#", imageSrc: "/assets/images/google-play.png" },
];

const DEFAULT_BRAND_LOGOS: FooterAnnouncementBrandLogoItem[] = [
  { label: "Hasaki Clinic", href: "#", imageSrc: "/images/logo-1.png" },
  { label: "Dermahair", href: "#", imageSrc: "/images/logo-2.png" },
  { label: "Synctives", href: "#", imageSrc: "/images/logo-3.png" },
  { label: "Mastige", href: "#", imageSrc: "/images/logo-4.png" },
];

const DEFAULT_TAGS: FooterAnnouncementTagItem[] = [
  { label: "Sunscreen", href: "/tag/sunscreen" },
  { label: "Micellar Water", href: "/tag/micellar-water" },
  { label: "Moisturizer", href: "/tag/moisturizer" },
  { label: "Cleanser", href: "/tag/cleanser" },
  { label: "Cotton Pads", href: "/tag/cotton-pads" },
  { label: "Face Masks", href: "/tag/face-masks" },
  { label: "L'Oreal", href: "/brand/loreal" },
  { label: "La Roche-Posay", href: "/brand/la-roche-posay" },
  { label: "Lipstick", href: "/tag/lipstick" },
  { label: "Obagi", href: "/brand/obagi" },
  { label: "Vaseline", href: "/brand/vaseline" },
  { label: "Carslan", href: "/brand/carslan" },
  { label: "CeraVe", href: "/brand/cerave" },
  { label: "Olay", href: "/brand/olay" },
  { label: "Klairs Toner", href: "/tag/klairs-toner" },
];

/* ================= JSON Helpers ================= */
function safeJson<T>(raw?: unknown): T | undefined {
  if (typeof raw !== "string" || !raw) return undefined;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function ensureBootstrapIcon(icon?: string | null): string {
  if (!icon) return "bi-circle";
  return icon.startsWith("bi-") ? icon : `bi-${icon}`;
}

/* ================= Component ================= */
export function FooterAnnouncement({
  brand,
  supportTitle = "CUSTOMER SUPPORT",
  hotlines,
  supportLinks,

  aboutTitle = "ABOUT TUAN KIET STORE",
  aboutLinks,

  partnerTitle = "PARTNERSHIPS & AFFILIATES",
  partnerLinks,

  newsletterTitle = "GET THE LATEST PROMOTIONS",
  newsletterDesc = "Subscribe with your email to receive the latest offers, priority hot deals, and personalized product suggestions from our store.",
  placeholderEmail = "Your email",
  submitLabel = "Subscribe",
  submitAriaLabel = "Subscribe to newsletter",

  socials,
  paymentsTitle = "PAYMENT METHODS",
  payments,

  qrImageSrc = "/images/qr-app.png",
  stores,

  brandLogos,

  tagTitle = "TOP SEARCHES",
  tags,

  certificationTitle = "Certified",
  certificationImageSrc = "/assets/images/bocongthuong.png",

  copyrightText = "Copyright © {year} Tuan Kiet Store",
  preview = false,
}: FooterAnnouncementProps) {
  const bd = useMemo(() => brand ?? DEFAULT_BRAND, [brand]);
  const hls = useMemo(() => hotlines ?? DEFAULT_HOTLINES, [hotlines]);
  const spls = useMemo(() => supportLinks ?? DEFAULT_SUPPORT_LINKS, [supportLinks]);
  const abls = useMemo(() => aboutLinks ?? DEFAULT_ABOUT_LINKS, [aboutLinks]);
  const ptls = useMemo(() => partnerLinks ?? DEFAULT_PARTNER_LINKS, [partnerLinks]);
  const scs = useMemo(() => socials ?? DEFAULT_SOCIALS, [socials]);
  const pays = useMemo(() => payments ?? DEFAULT_PAYMENTS, [payments]);
  const sts = useMemo(() => stores ?? DEFAULT_STORES, [stores]);
  const blogs = useMemo(() => brandLogos ?? DEFAULT_BRAND_LOGOS, [brandLogos]);
  const tgs = useMemo(() => tags ?? DEFAULT_TAGS, [tags]);

  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState("");
  const toastTimer = useRef<number | null>(null);

  useEffect(() => {
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
      showToast("Please enter a valid email address.");
      return;
    }

    setEmail("");
    showToast("Subscription successful!");
  };

  const goTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  const copy = useMemo(() => copyrightText.replace("{year}", String(currentYear)), [copyrightText, currentYear]);

  const renderNavLink = (item: FooterAnnouncementLinkItem, key: React.Key, className?: string) =>
    preview ? (
      <a key={key} href="#" className={className} onClick={onBlockClick}>
        {item.label}
      </a>
    ) : (
      <Link key={key} href={(item.href || "/") as Route} className={className}>
        {item.label}
      </Link>
    );

  return (
    <footer className={cls.footer} aria-label="Footer announcement">
      <div className={cls.top}>
        <div className={cls.container}>
          <div className={cls.brandHero}>
            <div className={cls.brandPanel}>
              <div className={cls.brandHead}>
                <div className={cls.brandHeader}>
                  {bd.logoSrc ? (
                    <div className={cls.brandLogoCard}>
                      <Image src={bd.logoSrc} alt={bd.name} width={44} height={44} className={cls.brandLogo} />
                    </div>
                  ) : null}

                  <div className={cls.brandText}>
                    <h2 className={cls.brandName}>{bd.name}</h2>
                    {bd.tag ? <span className={cls.brandTag}>{bd.tag}</span> : null}
                  </div>
                </div>

                {bd.info?.length ? (
                  <div className={cls.brandInfoList}>
                    {bd.info.map((item, i) => (
                      <div key={i} className={cls.brandInfoItem}>
                        <span className={cls.brandInfoLabel}>{item.label}</span>
                        <span className={cls.brandInfoText}>{item.text}</span>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className={cls.grid}>
                <div className={cls.col}>
                  <h3 className={cls.colTitle}>{supportTitle}</h3>

                  <div className={cls.hotlines}>
                    {hls.map((item, i) => {
                      const telHref = `tel:${item.phone.replace(/[^\d+]/g, "")}`;

                      return preview ? (
                        <a key={i} href="#" className={cls.hotline} onClick={onBlockClick}>
                          <span className={cls.hotlineLabel}>{item.label}</span>
                          <span className={cls.hotlinePhone}>{item.phone}</span>
                          {item.sub ? <span className={cls.hotlineSub}>{item.sub}</span> : null}
                        </a>
                      ) : (
                        <a key={i} href={telHref} className={cls.hotline}>
                          <span className={cls.hotlineLabel}>{item.label}</span>
                          <span className={cls.hotlinePhone}>{item.phone}</span>
                          {item.sub ? <span className={cls.hotlineSub}>{item.sub}</span> : null}
                        </a>
                      );
                    })}
                  </div>

                  <div className={cls.linkList}>
                    {spls.map((item, i) => (
                      <div key={i} className={cls.linkRow}>
                        {renderNavLink(item, i, cls.linkItem)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={cls.col}>
                  <h3 className={cls.colTitle}>{aboutTitle}</h3>

                  <div className={cls.linkList}>
                    {abls.map((item, i) => (
                      <div key={i} className={cls.linkRow}>
                        {renderNavLink(item, i, cls.linkItem)}
                      </div>
                    ))}
                  </div>
                </div>

                <div className={cls.col}>
                  <h3 className={cls.colTitle}>{partnerTitle}</h3>

                  <div className={cls.linkList}>
                    {ptls.map((item, i) => (
                      <div key={i} className={cls.linkRow}>
                        {renderNavLink(item, i, cls.linkItem)}
                      </div>
                    ))}
                  </div>

                  <div className={cls.paymentWrap}>
                    <div className={cls.paymentTitle}>{paymentsTitle}</div>

                    <div className={cls.paymentList}>
                      {pays.map((item, i) => (
                        <div key={i} className={cls.paymentCard} title={item.label}>
                          <Image
                            src={item.imageSrc}
                            alt={item.label}
                            width={64}
                            height={28}
                            sizes="64px"
                            className={cls.paymentImg}
                            style={{
                              width: "auto",
                              height: "28px",
                              maxWidth: "100%",
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className={`${cls.col} ${cls.colTrust}`}>
                  <h3 className={cls.colTitle}>{certificationTitle}</h3>

                  <div className={cls.certCard}>
                    <Image
                      src={certificationImageSrc}
                      alt={certificationTitle}
                      width={180}
                      height={68}
                      sizes="180px"
                      className={cls.certImg}
                      style={{
                        width: "180px",
                        height: "auto",
                        maxWidth: "100%",
                      }}
                    />
                    <div className={cls.certCopy}>
                      <div className={cls.certName}>{bd.cert?.title || certificationTitle}</div>
                      {bd.cert?.sub ? <div className={cls.certSub}>{bd.cert.sub}</div> : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className={cls.heroAside}>
              <div className={cls.newsCard}>
                <div className={cls.newsEyebrow}>Member perks</div>
                <h3 className={cls.newsTitle}>{newsletterTitle}</h3>
                <p className={cls.newsDesc}>{newsletterDesc}</p>

                <form className={cls.form} onSubmit={onSubmit} noValidate>
                  <label className={cls.srOnly} htmlFor="footerAnnouncementEmail">
                    Email
                  </label>

                  <input
                    suppressHydrationWarning
                    id="footerAnnouncementEmail"
                    type="email"
                    name="email"
                    className={cls.input}
                    placeholder={placeholderEmail}
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />

                  <button
                    suppressHydrationWarning
                    type="submit"
                    className={cls.submit}
                    aria-label={submitAriaLabel}
                    onClick={preview ? onBlockClick : undefined}
                  >
                    {submitLabel}
                  </button>
                </form>

                <div className={cls.socials} aria-label="Social links">
                  {scs.map((item, i) =>
                    preview ? (
                      <a key={i} href="#" className={cls.socialBtn} onClick={onBlockClick} aria-label={item.label}>
                        <i className={`bi ${ensureBootstrapIcon(item.icon)}`} aria-hidden="true" />
                      </a>
                    ) : (
                      <a key={i} href={item.href} className={cls.socialBtn} aria-label={item.label} rel="noreferrer">
                        <i className={`bi ${ensureBootstrapIcon(item.icon)}`} aria-hidden="true" />
                      </a>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={cls.copyArea}>
        <div className={cls.copySurface}>
          <p>{copy}</p>
          <p>
            Thinh Long Group Joint Stock Company | Business Registration No.: 0106505314 issued by Hanoi Department of
            Planning and Investment on 10/04/2014
          </p>
        </div>
      </div>

      <div className={`${cls.toast} ${toast ? cls.isShow : ""}`} role="status" aria-live="polite" aria-atomic="true">
        {toast}
      </div>
    </footer>
  );
}

/* ================= RegItem ================= */
export const SHOP_FOOTER_ANNOUNCEMENT: RegItem = {
  kind: "FooterAnnouncement",
  label: "Footer Announcement",
  defaults: {
    brand: JSON.stringify(DEFAULT_BRAND, null, 2),

    supportTitle: "CUSTOMER SUPPORT",
    hotlines: JSON.stringify(DEFAULT_HOTLINES, null, 2),
    supportLinks: JSON.stringify(DEFAULT_SUPPORT_LINKS, null, 2),

    aboutTitle: "ABOUT TUAN KIET STORE",
    aboutLinks: JSON.stringify(DEFAULT_ABOUT_LINKS, null, 2),

    partnerTitle: "PARTNERSHIPS & AFFILIATES",
    partnerLinks: JSON.stringify(DEFAULT_PARTNER_LINKS, null, 2),

    newsletterTitle: "GET THE LATEST PROMOTIONS",
    newsletterDesc:
      "Subscribe with your email to receive the latest offers, priority hot deals, and personalized product suggestions from our store.",
    placeholderEmail: "Your email",
    submitLabel: "Subscribe",
    submitAriaLabel: "Subscribe to newsletter",

    socials: JSON.stringify(DEFAULT_SOCIALS, null, 2),
    paymentsTitle: "PAYMENT METHODS",
    payments: JSON.stringify(DEFAULT_PAYMENTS, null, 2),

    qrImageSrc: "/images/qr-app.png",
    stores: JSON.stringify(DEFAULT_STORES, null, 2),

    brandLogos: JSON.stringify(DEFAULT_BRAND_LOGOS, null, 2),

    tagTitle: "TOP SEARCHES",
    tags: JSON.stringify(DEFAULT_TAGS, null, 2),

    certificationTitle: "Certified",
    certificationImageSrc: "/assets/images/bocongthuong.png",

    copyrightText: "Copyright © {year} Tuan Kiet Store",
  },
  inspector: [
    { key: "brand", label: "Brand (JSON)", kind: "textarea", rows: 10 },

    { key: "supportTitle", label: "Support title", kind: "text" },
    { key: "hotlines", label: "Hotlines (JSON)", kind: "textarea", rows: 8 },
    { key: "supportLinks", label: "Support links (JSON)", kind: "textarea", rows: 12 },

    { key: "aboutTitle", label: "About title", kind: "text" },
    { key: "aboutLinks", label: "About links (JSON)", kind: "textarea", rows: 12 },

    { key: "partnerTitle", label: "Partner title", kind: "text" },
    { key: "partnerLinks", label: "Partner links (JSON)", kind: "textarea", rows: 8 },

    { key: "newsletterTitle", label: "Newsletter title", kind: "text" },
    { key: "newsletterDesc", label: "Newsletter description", kind: "text" },
    { key: "placeholderEmail", label: "Email placeholder", kind: "text" },
    { key: "submitLabel", label: "Submit label", kind: "text" },
    { key: "submitAriaLabel", label: "Submit aria label", kind: "text" },

    { key: "socials", label: "Socials (JSON)", kind: "textarea", rows: 8 },
    { key: "paymentsTitle", label: "Payments title", kind: "text" },
    { key: "payments", label: "Payments (JSON)", kind: "textarea", rows: 8 },

    { key: "qrImageSrc", label: "QR image src", kind: "text" },
    { key: "stores", label: "Stores (JSON)", kind: "textarea", rows: 8 },

    { key: "brandLogos", label: "Brand logos (JSON)", kind: "textarea", rows: 10 },

    { key: "tagTitle", label: "Tag title", kind: "text" },
    { key: "tags", label: "Tags (JSON)", kind: "textarea", rows: 12 },

    { key: "certificationTitle", label: "Certification title", kind: "text" },
    { key: "certificationImageSrc", label: "Certification image src", kind: "text" },

    { key: "copyrightText", label: "Copyright text (use {year})", kind: "text" },
  ],
  render: (p) => {
    const brand = safeJson<FooterAnnouncementBrand>(p.brand);
    const hotlines = safeJson<FooterAnnouncementHotlineItem[]>(p.hotlines);
    const supportLinks = safeJson<FooterAnnouncementLinkItem[]>(p.supportLinks);
    const aboutLinks = safeJson<FooterAnnouncementLinkItem[]>(p.aboutLinks);
    const partnerLinks = safeJson<FooterAnnouncementLinkItem[]>(p.partnerLinks);
    const socials = safeJson<FooterAnnouncementSocialItem[]>(p.socials);
    const payments = safeJson<FooterAnnouncementPaymentItem[]>(p.payments);
    const stores = safeJson<FooterAnnouncementStoreItem[]>(p.stores);
    const brandLogos = safeJson<FooterAnnouncementBrandLogoItem[]>(p.brandLogos);
    const tags = safeJson<FooterAnnouncementTagItem[]>(p.tags);

    return (
      <div className="sectionContainer" aria-label="Shop Footer Announcement">
        <FooterAnnouncement
          brand={brand}
          supportTitle={String(p.supportTitle || "CUSTOMER SUPPORT")}
          hotlines={hotlines}
          supportLinks={supportLinks}
          aboutTitle={String(p.aboutTitle || "ABOUT TUAN KIET STORE")}
          aboutLinks={aboutLinks}
          partnerTitle={String(p.partnerTitle || "PARTNERSHIPS & AFFILIATES")}
          partnerLinks={partnerLinks}
          newsletterTitle={String(p.newsletterTitle || "GET THE LATEST PROMOTIONS")}
          newsletterDesc={String(
            p.newsletterDesc ||
              "Subscribe with your email to receive the latest offers, priority hot deals, and personalized product suggestions from our store.",
          )}
          placeholderEmail={String(p.placeholderEmail || "Your email")}
          submitLabel={String(p.submitLabel || "Subscribe")}
          submitAriaLabel={String(p.submitAriaLabel || "Subscribe to newsletter")}
          socials={socials}
          paymentsTitle={String(p.paymentsTitle || "PAYMENT METHODS")}
          payments={payments}
          qrImageSrc={String(p.qrImageSrc || "/images/qr-app.png")}
          stores={stores}
          brandLogos={brandLogos}
          tagTitle={String(p.tagTitle || "TOP SEARCHES")}
          tags={tags}
          certificationTitle={String(p.certificationTitle || "Certified")}
          certificationImageSrc={String(p.certificationImageSrc || "/assets/images/bocongthuong.png")}
          copyrightText={String(p.copyrightText || "Copyright © {year} Tuan Kiet Store")}
          preview={true}
        />
      </div>
    );
  },
};

export default FooterAnnouncement;
