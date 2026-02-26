"use client";

import React, { useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/settings/store/store.module.css";

type Toast = { type: "success" | "error" | "info"; text: string };

type StoreSettings = {
  storeName: string;
  legalName: string;
  tagline: string;

  primaryDomain: string;
  checkoutDomain: string;
  forceHttps: boolean;

  timezone: string;
  locale: string;
  currency: string;

  supportEmail: string;
  supportPhone: string;

  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  postalCode: string;
  country: string;

  logoUrl: string;
  faviconUrl: string;
  brandPrimary: string;
  brandAccent: string;

  seoTitleTemplate: string;
  seoDescriptionDefault: string;
  ogImageUrl: string;

  facebookUrl: string;
  instagramUrl: string;
  tiktokUrl: string;
  youtubeUrl: string;

  storeEnabled: boolean; // public availability
};

const DEFAULTS: StoreSettings = {
  storeName: "My No-code Store",
  legalName: "My Company LLC",
  tagline: "Build, publish, sell — fast.",

  primaryDomain: "https://shop.example.com",
  checkoutDomain: "https://checkout.example.com",
  forceHttps: true,

  timezone: "Asia/Ho_Chi_Minh",
  locale: "vi-VN",
  currency: "VND",

  supportEmail: "support@example.com",
  supportPhone: "+84 900 000 000",

  addressLine1: "123 Nguyen Trai",
  addressLine2: "Ward 7",
  city: "Ho Chi Minh City",
  region: "HCMC",
  postalCode: "700000",
  country: "VN",

  logoUrl: "https://placehold.co/240x80/png",
  faviconUrl: "https://placehold.co/64x64/png",
  brandPrimary: "#38bdf8",
  brandAccent: "#6366f1",

  seoTitleTemplate: "{{pageTitle}} | My No-code Store",
  seoDescriptionDefault: "A modern store built with no-code. Fast checkout, great UX.",
  ogImageUrl: "https://placehold.co/1200x630/png",

  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",

  storeEnabled: true,
};

const TZ_OPTIONS = ["Asia/Ho_Chi_Minh", "Asia/Bangkok", "Asia/Singapore", "Asia/Tokyo", "Europe/London", "America/Los_Angeles"];

const LOCALE_OPTIONS = ["vi-VN", "en-US", "en-GB", "ja-JP"];
const CURRENCY_OPTIONS = ["VND", "USD", "EUR", "SGD", "JPY"];

function isValidUrl(maybe: string) {
  if (!maybe.trim()) return true; // allow empty for optional fields
  try {
    const u = new URL(maybe);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

function isValidEmail(maybe: string) {
  if (!maybe.trim()) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(maybe.trim());
}

function clampHexColor(v: string) {
  const s = v.trim();
  if (!s) return "#000000";
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s.toLowerCase();
  return "#38bdf8";
}

export default function StorePage() {
  const [state, setState] = useState<StoreSettings>(DEFAULTS);
  const [activeTab, setActiveTab] = useState<"PROFILE" | "BRAND" | "SEO" | "SOCIAL" | "ADVANCED">("PROFILE");
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [busy, setBusy] = useState(false);

  const fileLogoRef = useRef<HTMLInputElement | null>(null);
  const fileFaviconRef = useRef<HTMLInputElement | null>(null);
  const fileOgRef = useRef<HTMLInputElement | null>(null);

  const health = useMemo(() => {
    const domainOk = isValidUrl(state.primaryDomain) && isValidUrl(state.checkoutDomain);
    const emailOk = isValidEmail(state.supportEmail);
    const logoOk = isValidUrl(state.logoUrl);
    const ogOk = isValidUrl(state.ogImageUrl);
    const ok = domainOk && emailOk && logoOk && ogOk;
    return { ok, domainOk, emailOk, logoOk, ogOk };
  }, [state]);

  function markDirty() {
    setDirty(true);
  }

  function update<K extends keyof StoreSettings>(key: K, value: StoreSettings[K]) {
    setState((s) => ({ ...s, [key]: value }));
    markDirty();
  }

  function validate(): { ok: boolean; msg?: string } {
    if (!state.storeName.trim()) return { ok: false, msg: "Store name is required." };
    if (!isValidUrl(state.primaryDomain)) return { ok: false, msg: "Primary domain is invalid." };
    if (!isValidUrl(state.checkoutDomain)) return { ok: false, msg: "Checkout domain is invalid." };
    if (!isValidEmail(state.supportEmail)) return { ok: false, msg: "Support email is invalid." };

    if (!isValidUrl(state.logoUrl)) return { ok: false, msg: "Logo URL is invalid." };
    if (!isValidUrl(state.faviconUrl)) return { ok: false, msg: "Favicon URL is invalid." };
    if (!isValidUrl(state.ogImageUrl)) return { ok: false, msg: "OG Image URL is invalid." };

    return { ok: true };
  }

  function reset() {
    setState(DEFAULTS);
    setDirty(true);
    setToast({ type: "info", text: "Reset to defaults (not saved yet)." });
  }

  function save() {
    const v = validate();
    if (!v.ok) {
      setToast({ type: "error", text: v.msg || "Invalid settings." });
      return;
    }
    setToast({ type: "success", text: "Store settings saved (mock)." });
    setDirty(false);
  }

  async function simulateUpload(kind: "logo" | "favicon" | "og") {
    setBusy(true);
    setToast(null);
    await new Promise((r) => setTimeout(r, 650));
    const url = kind === "logo" ? "https://placehold.co/240x80/png" : kind === "favicon" ? "https://placehold.co/64x64/png" : "https://placehold.co/1200x630/png";
    if (kind === "logo") update("logoUrl", url);
    if (kind === "favicon") update("faviconUrl", url);
    if (kind === "og") update("ogImageUrl", url);
    setToast({ type: "success", text: `Uploaded ${kind} (mock).` });
    setBusy(false);
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.breadcrumbs}>
            <span className={styles.crumb}>
              <i className="bi bi-gear" /> Settings
            </span>
            <i className={`bi bi-chevron-right ${styles.crumbSep}`} />
            <span className={styles.crumbActive}>
              <i className="bi bi-shop" /> Store
            </span>
          </div>

          <div className={styles.titleRow}>
            <h1 className={styles.title}>Store</h1>
            <div className={styles.subtitle}>Manage store identity, domains, branding and SEO defaults</div>
          </div>

          <div className={styles.kpis}>
            <Kpi icon="bi-heart-pulse" label="Config health" value={health.ok ? "Good" : "Needs attention"} tone={health.ok ? "ok" : "warn"} />
            <Kpi icon="bi-globe2" label="Primary domain" value={new URL(state.primaryDomain).host} />
            <Kpi icon="bi-cash-coin" label="Currency" value={state.currency} />
            <Kpi icon="bi-clock" label="Timezone" value={state.timezone} />
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.secondaryBtn} type="button" onClick={reset}>
            <i className="bi bi-arrow-counterclockwise" /> Reset
          </button>

          <button className={styles.secondaryBtn} type="button" onClick={() => setToast({ type: "info", text: "Preview store branding (mock)." })}>
            <i className="bi bi-eye" /> Preview
          </button>

          <button className={styles.primaryBtn} type="button" onClick={save} disabled={!dirty}>
            <i className="bi bi-cloud-check" /> Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === "PROFILE" ? styles.tabActive : ""}`} onClick={() => setActiveTab("PROFILE")} type="button">
          <i className="bi bi-card-text" /> Profile
        </button>
        <button className={`${styles.tab} ${activeTab === "BRAND" ? styles.tabActive : ""}`} onClick={() => setActiveTab("BRAND")} type="button">
          <i className="bi bi-palette2" /> Brand
        </button>
        <button className={`${styles.tab} ${activeTab === "SEO" ? styles.tabActive : ""}`} onClick={() => setActiveTab("SEO")} type="button">
          <i className="bi bi-search" /> SEO
        </button>
        <button className={`${styles.tab} ${activeTab === "SOCIAL" ? styles.tabActive : ""}`} onClick={() => setActiveTab("SOCIAL")} type="button">
          <i className="bi bi-share" /> Social
        </button>
        <button className={`${styles.tab} ${activeTab === "ADVANCED" ? styles.tabActive : ""}`} onClick={() => setActiveTab("ADVANCED")} type="button">
          <i className="bi bi-sliders" /> Advanced
        </button>
      </div>

      <div className={styles.grid}>
        {/* Main */}
        <div className={styles.colMain}>
          {activeTab === "PROFILE" ? (
            <>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-card-text" /> Store identity
                  </div>
                  <div className={styles.cardHint}>Name, legal info and store availability</div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <Field label="Store name" hint="Displayed to customers">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-shop ${styles.inputIcon}`} />
                        <input className={styles.input} value={state.storeName} onChange={(e) => update("storeName", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Legal name" hint="Invoices / contracts">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-building ${styles.inputIcon}`} />
                        <input className={styles.input} value={state.legalName} onChange={(e) => update("legalName", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Tagline" hint="Optional">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-stars ${styles.inputIcon}`} />
                        <input className={styles.input} value={state.tagline} onChange={(e) => update("tagline", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Store enabled" hint="Disable to hide storefront">
                      <Toggle checked={state.storeEnabled} onChange={(v) => update("storeEnabled", v)} labels={["Off", "On"]} />
                    </Field>
                  </div>

                  <div className={styles.noteCallout}>
                    <i className="bi bi-info-circle" />
                    <div>
                      <b>Low-code tip:</b> `storeEnabled=false` có thể dùng để bật/tắt storefront hoặc hiển thị banner “Coming soon”.
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-globe2" /> Domains
                  </div>
                  <div className={styles.cardHint}>Primary domain and checkout domain</div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <Field label="Primary domain" hint="https://shop.example.com">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-globe2 ${styles.inputIcon}`} />
                        <input className={styles.input} value={state.primaryDomain} onChange={(e) => update("primaryDomain", e.target.value)} />
                      </div>
                      {!isValidUrl(state.primaryDomain) ? <InlineWarn text="Invalid URL" /> : null}
                    </Field>

                    <Field label="Checkout domain" hint="https://checkout.example.com">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-bag-check ${styles.inputIcon}`} />
                        <input className={styles.input} value={state.checkoutDomain} onChange={(e) => update("checkoutDomain", e.target.value)} />
                      </div>
                      {!isValidUrl(state.checkoutDomain) ? <InlineWarn text="Invalid URL" /> : null}
                    </Field>

                    <Field label="Force HTTPS" hint="Recommended">
                      <Toggle checked={state.forceHttps} onChange={(v) => update("forceHttps", v)} labels={["Off", "On"]} />
                    </Field>

                    <Field label="DNS check" hint="Verify CNAME/A records (mock)">
                      <button className={styles.secondaryBtn} type="button" onClick={() => setToast({ type: "info", text: "DNS check started (mock)." })}>
                        <i className="bi bi-shield-check" /> Run check
                      </button>
                    </Field>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-geo-alt" /> Regional
                  </div>
                  <div className={styles.cardHint}>Timezone, locale, currency</div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <Field label="Timezone" hint="Used for orders, analytics, emails">
                      <div className={styles.selectWrap}>
                        <i className={`bi bi-clock ${styles.selectIcon}`} />
                        <select className={styles.select} value={state.timezone} onChange={(e) => update("timezone", e.target.value)}>
                          {TZ_OPTIONS.map((tz) => (
                            <option key={tz} value={tz}>
                              {tz}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Field>

                    <Field label="Locale" hint="Language & formatting">
                      <div className={styles.selectWrap}>
                        <i className={`bi bi-translate ${styles.selectIcon}`} />
                        <select className={styles.select} value={state.locale} onChange={(e) => update("locale", e.target.value)}>
                          {LOCALE_OPTIONS.map((lc) => (
                            <option key={lc} value={lc}>
                              {lc}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Field>

                    <Field label="Currency" hint="Displayed prices and payments">
                      <div className={styles.selectWrap}>
                        <i className={`bi bi-cash-coin ${styles.selectIcon}`} />
                        <select className={styles.select} value={state.currency} onChange={(e) => update("currency", e.target.value)}>
                          {CURRENCY_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </Field>

                    <Field label="Format sample" hint="Preview formatting (mock)">
                      <div className={styles.sample}>
                        <span className={styles.samplePill}>
                          <i className="bi bi-receipt" /> 1.234.567 {state.currency}
                        </span>
                        <span className={styles.samplePill}>
                          <i className="bi bi-calendar3" /> {new Intl.DateTimeFormat(state.locale, { dateStyle: "medium" }).format(new Date())}
                        </span>
                      </div>
                    </Field>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-telephone" /> Contact
                  </div>
                  <div className={styles.cardHint}>Support email, phone and address</div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <Field label="Support email" hint="Required">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-envelope ${styles.inputIcon}`} />
                        <input className={styles.input} value={state.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} />
                      </div>
                      {!isValidEmail(state.supportEmail) ? <InlineWarn text="Invalid email" /> : null}
                    </Field>

                    <Field label="Support phone" hint="Optional">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-telephone ${styles.inputIcon}`} />
                        <input className={styles.input} value={state.supportPhone} onChange={(e) => update("supportPhone", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Address line 1">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-geo-alt ${styles.inputIcon}`} />
                        <input className={styles.input} value={state.addressLine1} onChange={(e) => update("addressLine1", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Address line 2" hint="Optional">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-pin-map ${styles.inputIcon}`} />
                        <input className={styles.input} value={state.addressLine2} onChange={(e) => update("addressLine2", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="City">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-building ${styles.inputIcon}`} />
                        <input className={styles.input} value={state.city} onChange={(e) => update("city", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Region/State">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-map ${styles.inputIcon}`} />
                        <input className={styles.input} value={state.region} onChange={(e) => update("region", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Postal code">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-mailbox ${styles.inputIcon}`} />
                        <input className={styles.input} value={state.postalCode} onChange={(e) => update("postalCode", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Country">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-flag ${styles.inputIcon}`} />
                        <input className={styles.input} value={state.country} onChange={(e) => update("country", e.target.value)} />
                      </div>
                    </Field>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "BRAND" ? (
            <>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-palette2" /> Brand assets
                  </div>
                  <div className={styles.cardHint}>Logo, favicon and colors</div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.assetGrid}>
                    <AssetCard
                      title="Logo"
                      hint="Recommended 240×80 PNG/SVG"
                      url={state.logoUrl}
                      icon="bi-image"
                      onUpload={() => fileLogoRef.current?.click()}
                      onMockUpload={() => simulateUpload("logo")}
                      busy={busy}
                    />
                    <AssetCard
                      title="Favicon"
                      hint="Recommended 64×64 PNG/ICO"
                      url={state.faviconUrl}
                      icon="bi-grid-3x3-gap"
                      onUpload={() => fileFaviconRef.current?.click()}
                      onMockUpload={() => simulateUpload("favicon")}
                      busy={busy}
                    />
                    <AssetCard
                      title="OpenGraph"
                      hint="Recommended 1200×630"
                      url={state.ogImageUrl}
                      icon="bi-card-image"
                      onUpload={() => fileOgRef.current?.click()}
                      onMockUpload={() => simulateUpload("og")}
                      busy={busy}
                    />
                  </div>

                  {/* Hidden inputs - keep for real upload later */}
                  <input ref={fileLogoRef} type="file" hidden onChange={() => setToast({ type: "info", text: "Real upload handler: connect Storage integration later." })} />
                  <input ref={fileFaviconRef} type="file" hidden onChange={() => setToast({ type: "info", text: "Real upload handler: connect Storage integration later." })} />
                  <input ref={fileOgRef} type="file" hidden onChange={() => setToast({ type: "info", text: "Real upload handler: connect Storage integration later." })} />

                  <div className={styles.hr} />

                  <div className={styles.formGrid}>
                    <Field label="Primary color" hint="Hex #RRGGBB">
                      <div className={styles.colorRow}>
                        <input className={styles.color} type="color" value={clampHexColor(state.brandPrimary)} onChange={(e) => update("brandPrimary", e.target.value)} />
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-droplet ${styles.inputIcon}`} />
                          <input className={styles.input} value={state.brandPrimary} onChange={(e) => update("brandPrimary", e.target.value)} />
                        </div>
                      </div>
                    </Field>

                    <Field label="Accent color" hint="Hex #RRGGBB">
                      <div className={styles.colorRow}>
                        <input className={styles.color} type="color" value={clampHexColor(state.brandAccent)} onChange={(e) => update("brandAccent", e.target.value)} />
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-droplet-half ${styles.inputIcon}`} />
                          <input className={styles.input} value={state.brandAccent} onChange={(e) => update("brandAccent", e.target.value)} />
                        </div>
                      </div>
                    </Field>

                    <Field label="Theme preview" hint="Mock preview">
                      <div className={styles.previewBox}>
                        <div className={styles.previewTop}>
                          <span className={styles.previewLogo}>
                            <i className="bi bi-shop" /> {state.storeName}
                          </span>
                          <span className={styles.previewChip}>
                            <i className="bi bi-stars" /> {state.tagline || "Your tagline"}
                          </span>
                        </div>
                        <div className={styles.previewBtns}>
                          <span className={styles.previewPrimary} style={{ background: state.brandPrimary }}>
                            Primary
                          </span>
                          <span className={styles.previewAccent} style={{ background: state.brandAccent }}>
                            Accent
                          </span>
                        </div>
                      </div>
                    </Field>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "SEO" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardTitle}>
                  <i className="bi bi-search" /> SEO defaults
                </div>
                <div className={styles.cardHint}>Title template, meta description and OG image</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <Field label="Title template" hint="Use {{pageTitle}}">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-type ${styles.inputIcon}`} />
                      <input className={styles.input} value={state.seoTitleTemplate} onChange={(e) => update("seoTitleTemplate", e.target.value)} />
                    </div>
                  </Field>

                  <Field label="Default meta description" hint="Used when page has none">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-card-text ${styles.inputIcon}`} />
                      <textarea className={styles.textarea} value={state.seoDescriptionDefault} onChange={(e) => update("seoDescriptionDefault", e.target.value)} />
                    </div>
                  </Field>

                  <Field label="OG Image URL" hint="1200×630 recommended">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-card-image ${styles.inputIcon}`} />
                      <input className={styles.input} value={state.ogImageUrl} onChange={(e) => update("ogImageUrl", e.target.value)} />
                    </div>
                    {!isValidUrl(state.ogImageUrl) ? <InlineWarn text="Invalid URL" /> : null}
                  </Field>

                  <Field label="SEO preview" hint="Mock">
                    <div className={styles.seoPreview}>
                      <div className={styles.seoTitle}>{state.seoTitleTemplate.replace("{{pageTitle}}", "Home")}</div>
                      <div className={styles.seoUrl}>{state.primaryDomain.replace(/\/+$/, "")}</div>
                      <div className={styles.seoDesc}>{state.seoDescriptionDefault}</div>
                    </div>
                  </Field>
                </div>

                <div className={styles.noteCallout}>
                  <i className="bi bi-info-circle" />
                  <div>
                    <b>Low-code tip:</b> cho users override SEO theo từng page trong builder; nếu trống thì dùng defaults ở đây.
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "SOCIAL" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardTitle}>
                  <i className="bi bi-share" /> Social links
                </div>
                <div className={styles.cardHint}>Used for footer and social previews</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <Field label="Facebook" hint="Optional">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-facebook ${styles.inputIcon}`} />
                      <input className={styles.input} value={state.facebookUrl} onChange={(e) => update("facebookUrl", e.target.value)} />
                    </div>
                    {!isValidUrl(state.facebookUrl) ? <InlineWarn text="Invalid URL" /> : null}
                  </Field>

                  <Field label="Instagram" hint="Optional">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-instagram ${styles.inputIcon}`} />
                      <input className={styles.input} value={state.instagramUrl} onChange={(e) => update("instagramUrl", e.target.value)} />
                    </div>
                    {!isValidUrl(state.instagramUrl) ? <InlineWarn text="Invalid URL" /> : null}
                  </Field>

                  <Field label="TikTok" hint="Optional">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-music-note-beamed ${styles.inputIcon}`} />
                      <input className={styles.input} value={state.tiktokUrl} onChange={(e) => update("tiktokUrl", e.target.value)} />
                    </div>
                    {!isValidUrl(state.tiktokUrl) ? <InlineWarn text="Invalid URL" /> : null}
                  </Field>

                  <Field label="YouTube" hint="Optional">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-youtube ${styles.inputIcon}`} />
                      <input className={styles.input} value={state.youtubeUrl} onChange={(e) => update("youtubeUrl", e.target.value)} />
                    </div>
                    {!isValidUrl(state.youtubeUrl) ? <InlineWarn text="Invalid URL" /> : null}
                  </Field>
                </div>

                <div className={styles.socialPreview}>
                  <div className={styles.socialTitle}>
                    <i className="bi bi-eye" /> Preview
                  </div>
                  <div className={styles.socialBtns}>
                    <a className={styles.socialBtn} href={state.facebookUrl || "#"} onClick={(e) => !state.facebookUrl && e.preventDefault()}>
                      <i className="bi bi-facebook" /> Facebook
                    </a>
                    <a className={styles.socialBtn} href={state.instagramUrl || "#"} onClick={(e) => !state.instagramUrl && e.preventDefault()}>
                      <i className="bi bi-instagram" /> Instagram
                    </a>
                    <a className={styles.socialBtn} href={state.tiktokUrl || "#"} onClick={(e) => !state.tiktokUrl && e.preventDefault()}>
                      <i className="bi bi-music-note-beamed" /> TikTok
                    </a>
                    <a className={styles.socialBtn} href={state.youtubeUrl || "#"} onClick={(e) => !state.youtubeUrl && e.preventDefault()}>
                      <i className="bi bi-youtube" /> YouTube
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "ADVANCED" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardTitle}>
                  <i className="bi bi-sliders" /> Advanced
                </div>
                <div className={styles.cardHint}>Export, copy config and danger actions (mock)</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.advancedGrid}>
                  <div className={styles.advancedCard}>
                    <div className={styles.advancedTitle}>
                      <i className="bi bi-clipboard-data" /> Export config
                    </div>
                    <div className={styles.advancedHint}>Use JSON for backups or migrations</div>
                    <button
                      className={styles.secondaryBtn}
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(JSON.stringify(state, null, 2));
                        setToast({ type: "success", text: "Copied config JSON to clipboard." });
                      }}>
                      <i className="bi bi-clipboard" /> Copy JSON
                    </button>
                  </div>

                  <div className={styles.advancedCard}>
                    <div className={styles.advancedTitle}>
                      <i className="bi bi-box-arrow-up-right" /> Open storefront
                    </div>
                    <div className={styles.advancedHint}>Open primary domain (mock)</div>
                    <button
                      className={styles.secondaryBtn}
                      type="button"
                      onClick={() => {
                        setToast({ type: "info", text: "Open storefront (mock)." });
                      }}>
                      <i className="bi bi-globe2" /> Open
                    </button>
                  </div>
                </div>

                <div className={styles.hr} />

                <div className={styles.dangerZone}>
                  <div className={styles.dangerTitle}>
                    <i className="bi bi-exclamation-octagon" /> Danger zone
                  </div>

                  <div className={styles.dangerRow}>
                    <div>
                      <div className={styles.dangerRowTitle}>Disable store</div>
                      <div className={styles.dangerRowHint}>Hide storefront and block checkout.</div>
                    </div>
                    <button
                      className={`${styles.secondaryBtn} ${styles.dangerBtn}`}
                      type="button"
                      onClick={() => {
                        update("storeEnabled", false);
                        setToast({ type: "info", text: "Store disabled (not saved yet)." });
                      }}>
                      <i className="bi bi-pause-circle" /> Disable
                    </button>
                  </div>

                  <div className={styles.dangerRow}>
                    <div>
                      <div className={styles.dangerRowTitle}>Reset branding</div>
                      <div className={styles.dangerRowHint}>Set colors & assets back to defaults.</div>
                    </div>
                    <button
                      className={`${styles.secondaryBtn} ${styles.dangerBtn}`}
                      type="button"
                      onClick={() => {
                        update("brandPrimary", DEFAULTS.brandPrimary);
                        update("brandAccent", DEFAULTS.brandAccent);
                        update("logoUrl", DEFAULTS.logoUrl);
                        update("faviconUrl", DEFAULTS.faviconUrl);
                        update("ogImageUrl", DEFAULTS.ogImageUrl);
                        setToast({ type: "info", text: "Brand reset (not saved yet)." });
                      }}>
                      <i className="bi bi-arrow-counterclockwise" /> Reset brand
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Side */}
        <div className={styles.colSide}>
          <div className={styles.sideCard}>
            <div className={styles.sideHead}>
              <div className={styles.sideTitle}>
                <i className="bi bi-shield-check" /> Validation
              </div>
              <span className={`${styles.chip} ${health.ok ? styles.chipOk : styles.chipWarn}`}>
                <i className={`bi ${health.ok ? "bi-check-circle" : "bi-exclamation-triangle"}`} />
                {health.ok ? "All good" : "Check fields"}
              </span>
            </div>

            <div className={styles.sideBody}>
              <CheckRow ok={health.domainOk} label="Domains valid" />
              <CheckRow ok={health.emailOk} label="Support email valid" />
              <CheckRow ok={health.logoOk} label="Logo URL valid" />
              <CheckRow ok={health.ogOk} label="OG image URL valid" />

              <div className={styles.hr} />

              <div className={styles.sidePreview}>
                <div className={styles.sidePreviewTop}>
                  <img className={styles.sideLogo} src={state.logoUrl} alt="logo" />
                  <div className={styles.sideName}>{state.storeName}</div>
                </div>
                <div className={styles.sideSub}>{state.tagline || "Your tagline goes here"}</div>
                <div className={styles.sidePills}>
                  <span className={styles.pill} style={{ borderColor: state.brandPrimary }}>
                    <i className="bi bi-droplet" /> {state.brandPrimary}
                  </span>
                  <span className={styles.pill} style={{ borderColor: state.brandAccent }}>
                    <i className="bi bi-droplet-half" /> {state.brandAccent}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {toast ? (
            <div className={`${styles.toast} ${styles["toast_" + toast.type]}`}>
              <i className={`bi ${toast.type === "success" ? "bi-check2-circle" : toast.type === "error" ? "bi-x-circle" : "bi-info-circle"}`} />
              <div className={styles.toastText}>{toast.text}</div>
              <button className={styles.toastClose} onClick={() => setToast(null)} aria-label="Close toast">
                <i className="bi bi-x" />
              </button>
            </div>
          ) : null}

          <div className={styles.tipCard}>
            <div className={styles.tipTitle}>
              <i className="bi bi-lightbulb" /> Implementation tips
            </div>
            <ul className={styles.tipList}>
              <li>Lưu settings theo tenant/workspace (nếu multi-tenant).</li>
              <li>Assets nên upload qua Storage integration (R2/S3) và lưu URL vào đây.</li>
              <li>SEO defaults merge với SEO per-page trong builder.</li>
              <li>Domain verify có thể check DNS + TLS (cron/job).</li>
            </ul>
          </div>
        </div>
      </div>

      {/* busy overlay (tiny) */}
      {busy ? (
        <div className={styles.busy}>
          <div className={styles.busyCard}>
            <i className="bi bi-hourglass-split" />
            <div>Working…</div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ---------------- components ---------------- */

function Kpi({ icon, label, value, tone }: { icon: string; label: string; value: string; tone?: "ok" | "warn" }) {
  return (
    <div className={`${styles.kpi} ${tone === "warn" ? styles.kpiWarn : ""}`}>
      <i className={`bi ${icon}`} />
      <div className={styles.kpiText}>
        <div className={styles.kpiLabel}>{label}</div>
        <div className={styles.kpiValue}>{value}</div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>
        {label} {hint ? <span className={styles.fieldHint}>{hint}</span> : null}
      </span>
      <div className={styles.fieldControl}>{children}</div>
    </label>
  );
}

function Toggle({ checked, onChange, labels }: { checked: boolean; onChange: (v: boolean) => void; labels?: [string, string] }) {
  const off = labels?.[0] || "Off";
  const on = labels?.[1] || "On";
  return (
    <button type="button" className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`} onClick={() => onChange(!checked)} aria-pressed={checked}>
      <span className={styles.toggleKnob} />
      <span className={styles.toggleText}>{checked ? on : off}</span>
    </button>
  );
}

function InlineWarn({ text }: { text: string }) {
  return (
    <div className={styles.inlineWarn}>
      <i className="bi bi-exclamation-triangle" /> {text}
    </div>
  );
}

function CheckRow({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className={styles.checkRow}>
      <i className={`bi ${ok ? "bi-check-circle" : "bi-x-circle"} ${ok ? styles.okIcon : styles.errIcon}`} />
      <div className={styles.checkLabel}>{label}</div>
    </div>
  );
}

function AssetCard({
  title,
  hint,
  url,
  icon,
  onUpload,
  onMockUpload,
  busy,
}: {
  title: string;
  hint: string;
  url: string;
  icon: string;
  onUpload: () => void;
  onMockUpload: () => void;
  busy: boolean;
}) {
  return (
    <div className={styles.assetCard}>
      <div className={styles.assetTop}>
        <div className={styles.assetTitle}>
          <i className={`bi ${icon}`} /> {title}
        </div>
        <div className={styles.assetHint}>{hint}</div>
      </div>

      <div className={styles.assetPreview}>
        <img src={url} alt={title} />
      </div>

      <div className={styles.assetActions}>
        <button className={styles.secondaryBtn} type="button" onClick={onUpload} disabled={busy}>
          <i className="bi bi-upload" /> Upload
        </button>
        <button className={styles.primaryBtn} type="button" onClick={onMockUpload} disabled={busy}>
          <i className={`bi ${busy ? "bi-hourglass-split" : "bi-magic"}`} /> Mock upload
        </button>
      </div>
    </div>
  );
}
