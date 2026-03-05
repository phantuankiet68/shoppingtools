"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/product/pricing/pricing.module.css";

type PricePeriod = "mo" | "yr" | "once";

type PricingPlan = {
  id: string;
  name: string;
  badge?: string; // "Most popular"
  highlighted: boolean;

  priceCents: number;
  currency: "USD" | "VND";
  period: PricePeriod;

  description?: string;

  features: { id: string; text: string; included: boolean }[];

  ctaText: string;
  ctaHref: string;
};

type PricingBlock = {
  title: string;
  subtitle?: string;
  align: "left" | "center";
  showToggle: boolean; // monthly/yearly
  plans: PricingPlan[];
};

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatMoney(cents: number, currency: "USD" | "VND") {
  if (currency === "VND") {
    const v = Math.round(cents / 100); // treat cents as VND*100 for UI consistency
    return v.toLocaleString("vi-VN");
  }
  return (cents / 100).toFixed(0);
}

function periodLabel(p: PricePeriod) {
  if (p === "mo") return "/mo";
  if (p === "yr") return "/yr";
  return "";
}

function prettyJson(v: any) {
  try {
    return JSON.stringify(v ?? {}, null, 2);
  } catch {
    return "{}";
  }
}

export default function PricingBuilderPage() {
  const [block, setBlock] = useState<PricingBlock>(() => ({
    title: "Simple pricing",
    subtitle: "Choose a plan that fits your needs. Upgrade anytime.",
    align: "center",
    showToggle: true,
    plans: [
      {
        id: uid(),
        name: "Starter",
        badge: "",
        highlighted: false,
        priceCents: 900,
        currency: "USD",
        period: "mo",
        description: "For personal projects & small teams.",
        features: [
          { id: uid(), text: "1 workspace", included: true },
          { id: uid(), text: "Basic analytics", included: true },
          { id: uid(), text: "Email support", included: true },
          { id: uid(), text: "Custom domain", included: false },
        ],
        ctaText: "Get started",
        ctaHref: "/signup",
      },
      {
        id: uid(),
        name: "Pro",
        badge: "Most popular",
        highlighted: true,
        priceCents: 1900,
        currency: "USD",
        period: "mo",
        description: "For growing businesses and creators.",
        features: [
          { id: uid(), text: "Unlimited workspaces", included: true },
          { id: uid(), text: "Advanced analytics", included: true },
          { id: uid(), text: "Priority support", included: true },
          { id: uid(), text: "Custom domain", included: true },
        ],
        ctaText: "Start Pro",
        ctaHref: "/signup?plan=pro",
      },
      {
        id: uid(),
        name: "Business",
        badge: "",
        highlighted: false,
        priceCents: 4900,
        currency: "USD",
        period: "mo",
        description: "For teams that need control & scale.",
        features: [
          { id: uid(), text: "SAML / SSO", included: true },
          { id: uid(), text: "Audit logs", included: true },
          { id: uid(), text: "Dedicated manager", included: false },
          { id: uid(), text: "SLA & uptime", included: true },
        ],
        ctaText: "Contact sales",
        ctaHref: "/contact",
      },
    ],
  }));

  const [activePlanId, setActivePlanId] = useState<string>(() => block.plans[1]?.id || block.plans[0]?.id || "");
  const activePlan = useMemo(() => block.plans.find((p) => p.id === activePlanId) || null, [block.plans, activePlanId]);

  const [billingMode, setBillingMode] = useState<"mo" | "yr">("mo");
  const jsonText = useMemo(() => prettyJson(block), [block]);

  function patchBlock(patch: Partial<PricingBlock>) {
    setBlock((prev) => ({ ...prev, ...patch }));
  }

  function patchPlan(planId: string, patch: Partial<PricingPlan>) {
    setBlock((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => (p.id === planId ? { ...p, ...patch } : p)),
    }));
  }

  function addPlan() {
    const row: PricingPlan = {
      id: uid(),
      name: "New plan",
      badge: "",
      highlighted: false,
      priceCents: 0,
      currency: "USD",
      period: "mo",
      description: "",
      features: [
        { id: uid(), text: "New feature", included: true },
        { id: uid(), text: "Another feature", included: true },
      ],
      ctaText: "Choose plan",
      ctaHref: "/signup",
    };
    setBlock((prev) => ({ ...prev, plans: [...prev.plans, row] }));
    setTimeout(() => setActivePlanId(row.id), 0);
  }

  function duplicatePlan(id: string) {
    const p = block.plans.find((x) => x.id === id);
    if (!p) return;
    const copy: PricingPlan = {
      ...JSON.parse(JSON.stringify(p)),
      id: uid(),
      name: p.name + " Copy",
      highlighted: false,
    };
    setBlock((prev) => ({ ...prev, plans: [...prev.plans, copy] }));
    setTimeout(() => setActivePlanId(copy.id), 0);
  }

  function deletePlan(id: string) {
    const p = block.plans.find((x) => x.id === id);
    if (!p) return;
    const ok = confirm(`Delete plan "${p.name}"?`);
    if (!ok) return;

    setBlock((prev) => ({ ...prev, plans: prev.plans.filter((x) => x.id !== id) }));
    if (activePlanId === id) {
      const remain = block.plans.filter((x) => x.id !== id);
      setActivePlanId(remain[0]?.id || "");
    }
  }

  function setHighlighted(id: string, on: boolean) {
    // only one highlighted at a time
    setBlock((prev) => ({
      ...prev,
      plans: prev.plans.map((p) => ({ ...p, highlighted: p.id === id ? on : false })),
    }));
  }

  function addFeature() {
    if (!activePlan) return;
    const next = { id: uid(), text: "New feature", included: true };
    patchPlan(activePlan.id, { features: [...activePlan.features, next] });
  }

  function patchFeature(fid: string, patch: Partial<{ text: string; included: boolean }>) {
    if (!activePlan) return;
    patchPlan(activePlan.id, {
      features: activePlan.features.map((f) => (f.id === fid ? { ...f, ...patch } : f)),
    });
  }

  function removeFeature(fid: string) {
    if (!activePlan) return;
    patchPlan(activePlan.id, { features: activePlan.features.filter((f) => f.id !== fid) });
  }

  function priceForMode(p: PricingPlan) {
    // Demo: yearly = 10x monthly (2 months free)
    if (!block.showToggle) return p.priceCents;
    if (billingMode === "mo") return p.priceCents;
    return Math.round(p.priceCents * 10);
  }

  return (
    <div className={styles.shell}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Pricing Builder</div>
            <div className={styles.brandSub}>Plans · Features · Highlight · Preview · Export JSON</div>
          </div>
        </div>

        <div className={styles.topActions}>
          {block.showToggle && (
            <div className={styles.toggleWrap} aria-label="Billing toggle">
              <button type="button" className={`${styles.toggleBtn} ${billingMode === "mo" ? styles.toggleActive : ""}`} onClick={() => setBillingMode("mo")}>
                Monthly
              </button>
              <button type="button" className={`${styles.toggleBtn} ${billingMode === "yr" ? styles.toggleActive : ""}`} onClick={() => setBillingMode("yr")}>
                Yearly <span className={styles.saveTag}>save</span>
              </button>
            </div>
          )}

          <button className={styles.primaryBtn} type="button" onClick={() => navigator.clipboard.writeText(jsonText)}>
            <i className="bi bi-clipboard" /> Copy JSON
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Plans</div>
            <div className={styles.sidebarHint}>Add / duplicate / delete plans</div>
          </div>

          <div className={styles.planList}>
            {block.plans.map((p) => {
              const active = p.id === activePlanId;
              return (
                <button key={p.id} type="button" className={`${styles.planBtn} ${active ? styles.planActive : ""}`} onClick={() => setActivePlanId(p.id)}>
                  <div className={styles.planLeft}>
                    <span className={`${styles.planDot} ${p.highlighted ? styles.planDotHot : ""}`} />
                    <div className={styles.planText}>
                      <div className={styles.planName}>
                        {p.name}
                        {p.badge && <span className={styles.badge}>{p.badge}</span>}
                      </div>
                      <div className={styles.planMeta}>
                        <span className={styles.mono}>
                          {p.currency} {formatMoney(priceForMode(p), p.currency)}
                          {periodLabel(block.showToggle ? billingMode : p.period)}
                        </span>
                        <span className={styles.dot}>•</span>
                        <span className={styles.mono}>{p.features.length} features</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.planActions} onClick={(e) => e.stopPropagation()}>
                    <button className={styles.iconBtn} type="button" title="Duplicate" onClick={() => duplicatePlan(p.id)}>
                      <i className="bi bi-files" />
                    </button>
                    <button className={styles.iconBtn} type="button" title="Delete" onClick={() => deletePlan(p.id)}>
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </button>
              );
            })}
          </div>

          <div className={styles.sidebarFooter}>
            <button className={styles.ghostBtn} type="button" onClick={addPlan}>
              <i className="bi bi-plus-lg" /> Add plan
            </button>

            <div className={styles.tip}>
              <i className="bi bi-lightbulb" />
              <span>
                Lưu block này vào <span className={styles.mono}>Section.data</span> với type <span className={styles.mono}>pricing</span>.
              </span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          <div className={styles.grid}>
            {/* Editor */}
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Block settings</div>
                  <div className={styles.panelSub}>Title, subtitle, alignment, toggle</div>
                </div>
              </div>

              <div className={styles.panelBody}>
                <label className={styles.label}>Title</label>
                <div className={styles.inputWrap}>
                  <i className="bi bi-type" />
                  <input className={styles.input} value={block.title} onChange={(e) => patchBlock({ title: e.target.value })} />
                </div>

                <label className={styles.label}>Subtitle</label>
                <textarea className={styles.textarea} value={block.subtitle ?? ""} onChange={(e) => patchBlock({ subtitle: e.target.value })} placeholder="Optional" />

                <div className={styles.twoCols}>
                  <div>
                    <label className={styles.label}>Align</label>
                    <div className={styles.selectWrap}>
                      <i className="bi bi-text-center" />
                      <select className={styles.select} value={block.align} onChange={(e) => patchBlock({ align: e.target.value as any })}>
                        <option value="left">Left</option>
                        <option value="center">Center</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={styles.label}>Show billing toggle</label>
                    <button className={`${styles.toggleLine} ${block.showToggle ? styles.toggleLineOn : ""}`} type="button" onClick={() => patchBlock({ showToggle: !block.showToggle })}>
                      <i className={`bi ${block.showToggle ? "bi-toggle2-on" : "bi-toggle2-off"}`} />
                      <span>{block.showToggle ? "Enabled" : "Disabled"}</span>
                    </button>
                  </div>
                </div>

                <div className={styles.hr} />

                <div className={styles.sectionTitle}>
                  <i className="bi bi-card-list" /> Plan editor
                </div>

                {!activePlan ? (
                  <div className={styles.empty}>Select a plan on the left to edit.</div>
                ) : (
                  <>
                    <div className={styles.headerRow}>
                      <div className={styles.headLeft}>
                        <div className={styles.headTitle}>{activePlan.name}</div>
                        <div className={styles.headMeta}>
                          <span className={styles.badgeMini}>
                            <i className="bi bi-link-45deg" /> {activePlan.ctaHref}
                          </span>
                        </div>
                      </div>

                      <button
                        className={`${styles.iconBtn} ${activePlan.highlighted ? styles.hotBtn : ""}`}
                        type="button"
                        title="Highlight plan"
                        onClick={() => setHighlighted(activePlan.id, !activePlan.highlighted)}>
                        <i className={`bi ${activePlan.highlighted ? "bi-star-fill" : "bi-star"}`} />
                      </button>
                    </div>

                    <label className={styles.label}>Plan name</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-tag" />
                      <input className={styles.input} value={activePlan.name} onChange={(e) => patchPlan(activePlan.id, { name: e.target.value })} />
                    </div>

                    <label className={styles.label}>Badge (optional)</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-award" />
                      <input className={styles.input} value={activePlan.badge ?? ""} onChange={(e) => patchPlan(activePlan.id, { badge: e.target.value })} placeholder="Most popular" />
                    </div>

                    <label className={styles.label}>Description</label>
                    <textarea className={styles.textarea} value={activePlan.description ?? ""} onChange={(e) => patchPlan(activePlan.id, { description: e.target.value })} placeholder="Optional" />

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>Currency</label>
                        <div className={styles.selectWrap}>
                          <i className="bi bi-currency-dollar" />
                          <select className={styles.select} value={activePlan.currency} onChange={(e) => patchPlan(activePlan.id, { currency: e.target.value as any })}>
                            <option value="USD">USD</option>
                            <option value="VND">VND</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>Price (number)</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-cash-stack" />
                          <input
                            className={styles.input}
                            type="number"
                            value={activePlan.currency === "USD" ? Math.round(activePlan.priceCents / 100) : Math.round(activePlan.priceCents / 100)}
                            onChange={(e) => {
                              const v = clamp(Number(e.target.value || 0), 0, 1_000_000);
                              // store as cents-like (x100)
                              patchPlan(activePlan.id, { priceCents: v * 100 });
                            }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className={styles.twoCols}>
                      <div>
                        <label className={styles.label}>CTA text</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-cursor" />
                          <input className={styles.input} value={activePlan.ctaText} onChange={(e) => patchPlan(activePlan.id, { ctaText: e.target.value })} />
                        </div>
                      </div>

                      <div>
                        <label className={styles.label}>CTA href</label>
                        <div className={styles.inputWrap}>
                          <i className="bi bi-link-45deg" />
                          <input className={styles.input} value={activePlan.ctaHref} onChange={(e) => patchPlan(activePlan.id, { ctaHref: e.target.value })} />
                        </div>
                      </div>
                    </div>

                    <div className={styles.featuresHeader}>
                      <div className={styles.sectionTitle}>
                        <i className="bi bi-check2-circle" /> Features
                      </div>
                      <button className={styles.ghostBtn} type="button" onClick={addFeature}>
                        <i className="bi bi-plus-lg" /> Add feature
                      </button>
                    </div>

                    <div className={styles.features}>
                      {activePlan.features.map((f) => (
                        <div key={f.id} className={styles.featureRow}>
                          <button
                            className={`${styles.iconBtn} ${f.included ? styles.okBtn : styles.offBtn}`}
                            type="button"
                            title="Toggle"
                            onClick={() => patchFeature(f.id, { included: !f.included })}>
                            <i className={`bi ${f.included ? "bi-check2" : "bi-x"}`} />
                          </button>

                          <input className={styles.inputPlain} value={f.text} onChange={(e) => patchFeature(f.id, { text: e.target.value })} />

                          <button className={`${styles.iconBtn} ${styles.dangerBtn}`} type="button" title="Remove" onClick={() => removeFeature(f.id)}>
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>

            {/* Preview + JSON */}
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Live preview</div>
                  <div className={styles.panelSub}>Pricing cards rendered from JSON</div>
                </div>
              </div>

              <div className={styles.previewBody}>
                <div className={`${styles.previewHeader} ${block.align === "center" ? styles.center : ""}`}>
                  <div className={styles.previewTitle}>{block.title}</div>
                  {block.subtitle && <div className={styles.previewSub}>{block.subtitle}</div>}
                </div>

                <div className={styles.cards}>
                  {block.plans.map((p) => {
                    const price = priceForMode(p);
                    return (
                      <div key={p.id} className={`${styles.card} ${p.highlighted ? styles.cardHot : ""}`}>
                        {p.badge && (
                          <div className={styles.ribbon}>
                            <i className="bi bi-stars" /> {p.badge}
                          </div>
                        )}

                        <div className={styles.cardName}>{p.name}</div>
                        <div className={styles.cardDesc}>{p.description}</div>

                        <div className={styles.price}>
                          <span className={styles.currency}>{p.currency === "USD" ? "$" : "₫"}</span>
                          <span className={styles.amount}>{formatMoney(price, p.currency)}</span>
                          <span className={styles.period}>{periodLabel(block.showToggle ? billingMode : p.period)}</span>
                        </div>

                        <button className={`${styles.cta} ${p.highlighted ? styles.ctaHot : ""}`} type="button">
                          {p.ctaText} <i className="bi bi-arrow-right" />
                        </button>

                        <div className={styles.featureList}>
                          {p.features.map((f) => (
                            <div key={f.id} className={`${styles.feature} ${!f.included ? styles.featureOff : ""}`}>
                              <i className={`bi ${f.included ? "bi-check2-circle" : "bi-x-circle"}`} />
                              <span>{f.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className={styles.jsonBox}>
                  <div className={styles.jsonHeader}>
                    <div className={styles.jsonTitle}>
                      <i className="bi bi-braces" /> Block JSON
                    </div>
                    <button className={styles.ghostBtn} type="button" onClick={() => navigator.clipboard.writeText(jsonText)}>
                      <i className="bi bi-clipboard" /> Copy
                    </button>
                  </div>

                  <pre className={styles.json}>{jsonText}</pre>

                  <div className={styles.tipInline}>
                    <i className="bi bi-lightbulb" />
                    <span>
                      Khi dùng Sections: set <span className={styles.mono}>Section.type = "pricing"</span> và <span className={styles.mono}>Section.data = JSON</span>.
                    </span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
