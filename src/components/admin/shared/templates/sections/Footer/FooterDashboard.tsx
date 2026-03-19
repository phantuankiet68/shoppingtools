"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Footer/FooterDashboard.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

/* ================= Types ================= */
export type FooterDashboardInfoItem = { label: string; text: string };

export type FooterDashboardLinkItem = { label: string; href: string };

export type FooterDashboardHotlineItem = { label: string; phone: string };

export type FooterDashboardSocialItem = { label: string; href: string; icon: string };

export type FooterDashboardPartnerItem = { label: string; href: string; imageSrc: string };

export type FooterDashboardMetricItem = {
  label: string;
  value: string;
};

export type FooterDashboardCert = {
  imageSrc: string;
  title: string;
  sub: string;
};

export type FooterDashboardBrand = {
  name: string;
  tag: string;
  info: FooterDashboardInfoItem[];
  cert?: FooterDashboardCert;
};

export type FooterDashboardProps = {
  brand?: FooterDashboardBrand;

  metricsTitle?: string;
  metrics?: FooterDashboardMetricItem[];

  linksTitle?: string;
  links?: FooterDashboardLinkItem[];

  newsletterTitle?: string;
  newsletterDesc?: string;
  placeholderEmail?: string;
  submitAriaLabel?: string;
  submitLabel?: string;

  supportTitle?: string;
  hotlines?: FooterDashboardHotlineItem[];
  socials?: FooterDashboardSocialItem[];

  partnersTitle?: string;
  partners?: FooterDashboardPartnerItem[];

  copyrightText?: string;
  preview?: boolean;
};

/* ================= Defaults ================= */
const DEFAULT_BRAND: FooterDashboardBrand = {
  name: "DAI LINH COSMETICS",
  tag: "Clean beauty, warm support and trusted service every day.",
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

const DEFAULT_METRICS: FooterDashboardMetricItem[] = [
  { label: "Customers", value: "120K+" },
  { label: "Orders", value: "450K+" },
  { label: "Products", value: "8.5K+" },
];

const DEFAULT_LINKS: FooterDashboardLinkItem[] = [
  { label: "General policies", href: "/policy" },
  { label: "Shipping policy", href: "/shipping" },
  { label: "Return & refund", href: "/refund" },
  { label: "Shopping guide", href: "/guide" },
  { label: "Terms of service", href: "/terms" },
  { label: "Privacy policy", href: "/privacy" },
];

const DEFAULT_HOTLINES: FooterDashboardHotlineItem[] = [
  { label: "Hotline", phone: "19001263" },
  { label: "Support", phone: "0917002332" },
];

const DEFAULT_SOCIALS: FooterDashboardSocialItem[] = [
  { label: "LinkedIn", href: "#", icon: "bi-linkedin" },
  { label: "YouTube", href: "#", icon: "bi-youtube" },
  { label: "Twitter", href: "#", icon: "bi-twitter-x" },
];

const DEFAULT_PARTNERS: FooterDashboardPartnerItem[] = [
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

/* ================= Helpers ================= */
function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "");
}

function isExternalHref(href: string) {
  return /^(https?:)?\/\//i.test(href) || href.startsWith("mailto:") || href.startsWith("tel:");
}

function hrefTarget(href: string) {
  return href.startsWith("http") ? "_blank" : undefined;
}

function splitLinksToColumns(items: FooterDashboardLinkItem[]) {
  const size = Math.ceil(items.length / 3) || 1;
  return [
    items.slice(0, size),
    items.slice(size, size * 2),
    items.slice(size * 2),
  ].filter((group) => group.length > 0);
}

/* ================= Component ================= */
export function FooterDashboard({
  brand,
  metricsTitle = "Highlights",
  metrics,
  linksTitle = "Quick links",
  links,
  newsletterTitle = "Subscribe to our newsletter",
  newsletterDesc = "Receive curated product stories, launches and selected offers.",
  placeholderEmail = "E-mail",
  submitAriaLabel = "Subscribe",
  submitLabel = "Subscribe",
  supportTitle = "Contact us",
  hotlines,
  socials,
  partnersTitle = "Trusted partners",
  partners,
  copyrightText = "© {year} DAI LINH COSMETICS. All rights reserved.",
  preview = false,
}: FooterDashboardProps) {
  const bd = useMemo(() => brand ?? DEFAULT_BRAND, [brand]);
  const mts = useMemo(() => metrics ?? DEFAULT_METRICS, [metrics]);
  const lks = useMemo(() => links ?? DEFAULT_LINKS, [links]);
  const hls = useMemo(() => hotlines ?? DEFAULT_HOTLINES, [hotlines]);
  const scs = useMemo(() => socials ?? DEFAULT_SOCIALS, [socials]);
  const pts = useMemo(() => partners ?? DEFAULT_PARTNERS, [partners]);

  const railRef = useRef<HTMLDivElement | null>(null);
  const toastTimer = useRef<number | null>(null);

  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [email, setEmail] = useState("");
  const [toast, setToast] = useState("");

  useEffect(() => {
    setYear(new Date().getFullYear());

    return () => {
      if (toastTimer.current) {
        window.clearTimeout(toastTimer.current);
      }
    };
  }, []);

  const copy = useMemo(() => {
    return copyrightText.replace("{year}", String(year));
  }, [copyrightText, year]);

  const linkColumns = useMemo(() => splitLinksToColumns(lks), [lks]);

  const showToast = (msg: string) => {
    setToast(msg);

    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
    }

    toastTimer.current = window.setTimeout(() => {
      setToast("");
    }, 2200);
  };

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (preview) {
      showToast("Preview mode only.");
      return;
    }

    const value = email.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

    if (!isValid) {
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

  const goTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className={cls.siteFooter} aria-label="Site footer">
      <div className={cls.footerShell}>

        <div className={cls.footerTop}>
          <div className={cls.footerOrb} aria-hidden="true">
          <button
            type="button"
            className={cls.footerOrbButton}
            onClick={preview ? onBlockClick : goTop}
            aria-label="Get started"
          >
            <span className={cls.footerOrbRingText}>GET STARTED</span>
            <span className={cls.footerOrbArrow}>
              <i className="bi bi-arrow-up-right" />
            </span>
          </button>
        </div>
          <div className={cls.footerContainer}>
            <div className={cls.footerBoard}>
              <section className={cls.footerHero} aria-label="Brand overview">
                <div className={cls.footerBrandBlock}>
                  <div className={cls.footerBrandHead}>
                    <div className={cls.footerLogoWordmark} aria-label={bd.name}>
                      <span className={cls.footerLogoLead}>PL</span>
                      <span className={cls.footerLogoLine} />
                      <span className={cls.footerLogoTail}>ATFORM.</span>
                    </div>
                  </div>

                  <div className={cls.footerNavColumns} aria-label={linksTitle}>
                    {linkColumns.map((group, columnIndex) => (
                      <nav key={`col-${columnIndex}`} className={cls.footerNavColumn}>
                        <h3 className={cls.footerPanelTitle}>
                          {columnIndex === 0
                            ? "Insights"
                            : columnIndex === 1
                              ? "Company"
                              : "What we do"}
                        </h3>

                        <ul className={cls.footerLinkList}>
                          {group.map((item, index) => {
                            if (preview) {
                              return (
                                <li key={`${item.label}-${index}`}>
                                  <a className={cls.footerLink} href="#" onClick={onBlockClick}>
                                    {item.label}
                                  </a>
                                </li>
                              );
                            }

                            if (isExternalHref(item.href || "#")) {
                              return (
                                <li key={`${item.label}-${index}`}>
                                  <a
                                    className={cls.footerLink}
                                    href={item.href || "#"}
                                    rel="noreferrer"
                                    target={hrefTarget(item.href || "#")}
                                  >
                                    {item.label}
                                  </a>
                                </li>
                              );
                            }

                            return (
                              <li key={`${item.label}-${index}`}>
                                <Link className={cls.footerLink} href={(item.href || "/") as Route}>
                                  {item.label}
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      </nav>
                    ))}
                  </div>
                  <div className={cls.footerContactList}>
                      {hls.map((item, index) => {
                        const telHref = `tel:${normalizePhone(item.phone)}`;

                        if (preview) {
                          return (
                            <a
                              key={`${item.label}-${index}`}
                              className={cls.footerContactItem}
                              href="#"
                              onClick={onBlockClick}
                              aria-label={`${item.label} ${item.phone}`}
                            >
                              <span className={cls.footerContactIcon} aria-hidden="true">
                                <i className="bi bi-telephone" />
                              </span>
                              <span className={cls.footerContactText}>
                                <span className={cls.footerContactLabel}>{item.label}</span>
                                <span className={cls.footerContactValue}>{item.phone}</span>
                              </span>
                            </a>
                          );
                        }

                        return (
                          <a
                            key={`${item.label}-${index}`}
                            className={cls.footerContactItem}
                            href={telHref}
                            aria-label={`${item.label} ${item.phone}`}
                          >
                            <span className={cls.footerContactIcon} aria-hidden="true">
                              <i className="bi bi-telephone" />
                            </span>
                            <span className={cls.footerContactText}>
                              <span className={cls.footerContactLabel}>{item.label}</span>
                              <span className={cls.footerContactValue}>{item.phone}</span>
                            </span>
                          </a>
                        );
                      })}

                      <a
                        className={cls.footerContactItem}
                        href={preview ? "#" : "mailto:info@platform.com"}
                        onClick={preview ? onBlockClick : undefined}
                        aria-label="Email info@platform.com"
                      >
                        <span className={cls.footerContactIcon} aria-hidden="true">
                          <i className="bi bi-envelope" />
                        </span>
                        <span className={cls.footerContactText}>
                          <span className={cls.footerContactLabel}>E-mail</span>
                          <span className={cls.footerContactValue}>info@platform.com</span>
                        </span>
                      </a>

                      <a
                        className={cls.footerContactItem}
                        href={preview ? "#" : "/contact"}
                        onClick={preview ? onBlockClick : undefined}
                        aria-label="Schedule a meeting"
                      >
                        <span className={cls.footerContactIcon} aria-hidden="true">
                          <i className="bi bi-people" />
                        </span>
                        <span className={cls.footerContactText}>
                          <span className={cls.footerContactLabel}>Meeting</span>
                          <span className={cls.footerContactValue}>Schedule a meeting</span>
                        </span>
                      </a>
                    </div>
                </div>

                <aside className={cls.footerSidePanel}>
                  <section className={cls.footerNewsletterPanel} aria-label={newsletterTitle}>
                    <h3 className={cls.footerNewsletterTitle}>{newsletterTitle}</h3>
                    <p className={cls.footerDesc}>{newsletterDesc}</p>

                    <form className={cls.footerForm} onSubmit={onSubmit} noValidate>
                      <label className={cls.srOnly} htmlFor="footerDashboardEmail">
                        Your email
                      </label>

                      <div className={cls.footerInputWrap}>
                        <input
                          id="footerDashboardEmail"
                          className={cls.footerInput}
                          type="email"
                          name="email"
                          autoComplete="email"
                          placeholder={placeholderEmail}
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />

                        <button
                          className={cls.footerSubmit}
                          type="submit"
                          aria-label={submitAriaLabel}
                          onClick={preview ? onBlockClick : undefined}
                        >
                          <span className={cls.srOnly}>{submitLabel}</span>
                          <i className={`bi bi-arrow-up-right ${cls.footerSubmitIcon}`} aria-hidden="true" />
                        </button>
                      </div>
                    </form>
                  </section>
                   <div className={cls.footerMetaRow}>
                    <div className={cls.footerSocial} aria-label="Social links">
                      {scs.map((item, index) => {
                        if (preview) {
                          return (
                            <a
                              key={`${item.label}-${index}`}
                              className={cls.footerSocialBtn}
                              href="#"
                              onClick={onBlockClick}
                              aria-label={item.label}
                            >
                              <i className={`bi ${item.icon}`} aria-hidden="true" />
                            </a>
                          );
                        }

                        return (
                          <a
                            key={`${item.label}-${index}`}
                            className={cls.footerSocialBtn}
                            href={item.href}
                            aria-label={item.label}
                            rel="noreferrer"
                            target={hrefTarget(item.href)}
                          >
                            <i className={`bi ${item.icon}`} aria-hidden="true" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                </aside>
              </section>

              <section className={cls.footerStatsStrip} aria-label={metricsTitle}>
                <h3 className={cls.srOnly}>{metricsTitle}</h3>

                <div className={cls.footerMetricsGrid}>
                  {mts.map((item, index) => (
                    <article key={`${item.label}-${index}`} className={cls.footerMetricItem}>
                      <div className={cls.footerMetricValue}>{item.value}</div>
                      <div className={cls.footerMetricLabel}>{item.label}</div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className={cls.footerBottom}>
          <div className={cls.footerContainerBottom}>
            <div className={cls.footerBottomLeft}>
              <div className={cls.footerCopy}>{copy}</div>
              <div className={cls.footerPolicyLinks}>
                {preview ? (
                  <>
                    <a href="#" onClick={onBlockClick} className={cls.footerPolicyLink}>
                      Terms and Conditions
                    </a>
                    <span className={cls.footerPolicyDot}>|</span>
                    <a href="#" onClick={onBlockClick} className={cls.footerPolicyLink}>
                      Privacy Policy
                    </a>
                  </>
                ) : (
                  <>
                    <Link href={"/terms" as Route} className={cls.footerPolicyLink}>
                      Terms and Conditions
                    </Link>
                    <span className={cls.footerPolicyDot}>|</span>
                    <Link href={"/privacy" as Route} className={cls.footerPolicyLink}>
                      Privacy Policy
                    </Link>
                  </>
                )}
              </div>
            </div>

            <button className={cls.footerTopBtn} type="button" aria-label="Back to top" onClick={goTop}>
              <i className="bi bi-arrow-up" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

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
export const SHOP_FOOTER_DASHBOARD: RegItem = {
  kind: "FooterDashboard",
  label: "Footer Dashboard",
  defaults: {
    brand: JSON.stringify(DEFAULT_BRAND, null, 2),

    metricsTitle: "Highlights",
    metrics: JSON.stringify(DEFAULT_METRICS, null, 2),

    linksTitle: "Quick links",
    links: JSON.stringify(DEFAULT_LINKS, null, 2),

    newsletterTitle: "Subscribe to our newsletter",
    newsletterDesc: "Receive curated product stories, launches and selected offers.",
    placeholderEmail: "E-mail",
    submitAriaLabel: "Subscribe",
    submitLabel: "Subscribe",

    supportTitle: "Contact us",
    hotlines: JSON.stringify(DEFAULT_HOTLINES, null, 2),
    socials: JSON.stringify(DEFAULT_SOCIALS, null, 2),

    partnersTitle: "Trusted partners",
    partners: JSON.stringify(DEFAULT_PARTNERS, null, 2),

    copyrightText: "© {year} DAI LINH COSMETICS. All rights reserved.",
  },
  inspector: [
    { key: "brand", label: "Brand (JSON)", kind: "textarea", rows: 12 },

    { key: "metricsTitle", label: "Metrics title", kind: "text" },
    { key: "metrics", label: "Metrics (JSON)", kind: "textarea", rows: 8 },

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
    const brand = safeJson<FooterDashboardBrand>(typeof p.brand === "string" ? p.brand : undefined);
    const metrics = safeJson<FooterDashboardMetricItem[]>(typeof p.metrics === "string" ? p.metrics : undefined);
    const links = safeJson<FooterDashboardLinkItem[]>(typeof p.links === "string" ? p.links : undefined);
    const hotlines = safeJson<FooterDashboardHotlineItem[]>(typeof p.hotlines === "string" ? p.hotlines : undefined);
    const socials = safeJson<FooterDashboardSocialItem[]>(typeof p.socials === "string" ? p.socials : undefined);
    const partners = safeJson<FooterDashboardPartnerItem[]>(typeof p.partners === "string" ? p.partners : undefined);

    return (
      <div className="sectionContainer" aria-label="Shop Footer (Dashboard)">
        <FooterDashboard
          brand={brand}
          metricsTitle={String(p.metricsTitle || "Highlights")}
          metrics={metrics}
          linksTitle={String(p.linksTitle || "Quick links")}
          links={links}
          newsletterTitle={String(p.newsletterTitle || "Subscribe to our newsletter")}
          newsletterDesc={String(p.newsletterDesc || "")}
          placeholderEmail={String(p.placeholderEmail || "E-mail")}
          submitAriaLabel={String(p.submitAriaLabel || "Subscribe")}
          submitLabel={String(p.submitLabel || "Subscribe")}
          supportTitle={String(p.supportTitle || "Contact us")}
          hotlines={hotlines}
          socials={socials}
          partnersTitle={String(p.partnersTitle || "Trusted partners")}
          partners={partners}
          copyrightText={String(p.copyrightText || "© {year} DAI LINH COSMETICS. All rights reserved.")}
          preview={true}
        />
      </div>
    );
  },
};

export default FooterDashboard;