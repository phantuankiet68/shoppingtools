"use client";

import React, { useMemo, useState } from "react";
import styles from "@/styles/admin/settings/taxes/taxes.module.css";

type Toast = { type: "success" | "error" | "info"; text: string };

type TaxMode = "INCLUSIVE" | "EXCLUSIVE";
type RoundMode = "LINE_ITEM" | "ORDER_TOTAL";
type TaxScope = "PHYSICAL" | "DIGITAL" | "SHIPPING" | "ALL";
type RuleType = "STANDARD" | "REDUCED" | "ZERO" | "EXEMPT";

type TaxRegion = {
  id: string;
  name: string; // e.g. Vietnam / EU / US-CA
  country: string; // ISO2
  region?: string; // state/province code (optional)
  postalCodes: string[]; // supports "*" or "70*"
  priority: number; // higher wins
  enabled: boolean;

  standardRate: number; // percent
  reducedRate?: number | null;
  shippingTaxable: boolean;
  digitalTaxable: boolean;
};

type TaxRule = {
  id: string;
  name: string;
  enabled: boolean;
  type: RuleType;

  scope: TaxScope;
  regionId: string | "ALL";
  productTag: string; // match product tag/category (mock)
  rateOverride?: number | null; // if set, override rate
  customerType: "ALL" | "B2B" | "B2C";
  note?: string;
};

type InvoiceSettings = {
  enableInvoices: boolean;
  invoicePrefix: string;
  requireVatIdForB2B: boolean;
  showTaxIdOnInvoice: boolean;
  companyName: string;
  companyAddress: string;
};

type TaxesSettings = {
  enabled: boolean;
  mode: TaxMode;
  rounding: RoundMode;
  pricesIncludeTaxHint: string;

  originCountry: string; // used for defaults
  taxIdLabel: string; // VAT/GST etc
  defaultRate: number; // fallback if no region matched

  applyToShipping: boolean;
  applyToDigital: boolean;

  collectVatId: boolean;
  validateVatId: boolean; // mock toggle
  exemptionIfValidVatId: boolean;

  invoice: InvoiceSettings;
};

type TestInput = {
  country: string;
  region: string;
  postalCode: string;
  orderSubtotal: number;
  shipping: number;
  digitalSubtotal: number;
  customerType: "B2B" | "B2C";
  vatIdProvided: boolean;
  productTag: string; // for rules
};

type CalcLine = {
  label: string;
  base: number;
  rate: number;
  tax: number;
};

function uid(prefix: string) {
  return `${prefix}_${Math.floor(Math.random() * 1000000)}`;
}

function clampPercent(v: number) {
  if (Number.isNaN(v)) return 0;
  return Math.max(0, Math.min(100, v));
}

function fmtMoney(n: number) {
  // mock formatting (VND style by default)
  return new Intl.NumberFormat("vi-VN").format(Math.round(n));
}

function isValidTaxId(maybe: string) {
  // mock: treat "VALID" as valid
  return maybe.trim().toUpperCase().includes("VALID");
}

function matchesPostal(pats: string[], postal: string) {
  if (!pats.length) return true;
  if (pats.includes("*")) return true;
  const pc = postal.trim();
  return pats.some((p) => {
    const pat = p.trim();
    if (pat.endsWith("*")) return pc.startsWith(pat.slice(0, -1));
    return pc === pat;
  });
}

export default function TaxesPage() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "REGIONS" | "RULES" | "INVOICES" | "TEST">("OVERVIEW");

  const [settings, setSettings] = useState<TaxesSettings>({
    enabled: true,
    mode: "EXCLUSIVE",
    rounding: "LINE_ITEM",
    pricesIncludeTaxHint: "Prices shown at checkout exclude tax (tax added at payment).",

    originCountry: "VN",
    taxIdLabel: "VAT ID",
    defaultRate: 10,

    applyToShipping: true,
    applyToDigital: true,

    collectVatId: true,
    validateVatId: false,
    exemptionIfValidVatId: true,

    invoice: {
      enableInvoices: true,
      invoicePrefix: "INV",
      requireVatIdForB2B: true,
      showTaxIdOnInvoice: true,
      companyName: "My Company LLC",
      companyAddress: "123 Nguyen Trai, Ho Chi Minh City, VN",
    },
  });

  const [regions, setRegions] = useState<TaxRegion[]>([
    {
      id: "r_vn",
      name: "Vietnam",
      country: "VN",
      postalCodes: ["*"],
      priority: 100,
      enabled: true,
      standardRate: 10,
      reducedRate: 5,
      shippingTaxable: true,
      digitalTaxable: true,
    },
    {
      id: "r_us_ca",
      name: "US - California",
      country: "US",
      region: "CA",
      postalCodes: ["*"],
      priority: 90,
      enabled: true,
      standardRate: 8.25,
      reducedRate: null,
      shippingTaxable: false,
      digitalTaxable: true,
    },
    {
      id: "r_global",
      name: "Other countries",
      country: "*",
      postalCodes: ["*"],
      priority: 10,
      enabled: true,
      standardRate: 0,
      reducedRate: null,
      shippingTaxable: false,
      digitalTaxable: false,
    },
  ]);

  const [rules, setRules] = useState<TaxRule[]>([
    {
      id: "t1",
      name: "Digital goods reduced in VN",
      enabled: true,
      type: "REDUCED",
      scope: "DIGITAL",
      regionId: "r_vn",
      productTag: "digital",
      rateOverride: 5,
      customerType: "ALL",
      note: "Example rule",
    },
    {
      id: "t2",
      name: "B2B exempt when VAT ID valid",
      enabled: true,
      type: "EXEMPT",
      scope: "ALL",
      regionId: "ALL",
      productTag: "*",
      rateOverride: 0,
      customerType: "B2B",
      note: "Requires valid VAT ID (mock)",
    },
  ]);

  const [selectedRegionId, setSelectedRegionId] = useState(regions[0]?.id || "");
  const selectedRegion = useMemo(() => regions.find((r) => r.id === selectedRegionId) || null, [regions, selectedRegionId]);

  const [selectedRuleId, setSelectedRuleId] = useState(rules[0]?.id || "");
  const selectedRule = useMemo(() => rules.find((r) => r.id === selectedRuleId) || null, [rules, selectedRuleId]);

  const [test, setTest] = useState<TestInput>({
    country: "VN",
    region: "HCMC",
    postalCode: "700000",
    orderSubtotal: 1000000,
    shipping: 30000,
    digitalSubtotal: 200000,
    customerType: "B2C",
    vatIdProvided: false,
    productTag: "default",
  });

  const [vatIdInput, setVatIdInput] = useState("");
  const [calc, setCalc] = useState<null | {
    matchedRegion?: TaxRegion;
    appliedRules: TaxRule[];
    lines: CalcLine[];
    subtotal: number;
    taxTotal: number;
    total: number;
    mode: TaxMode;
    rounding: RoundMode;
    notes: string[];
  }>(null);

  function markDirty() {
    setDirty(true);
  }

  function updateSettings<K extends keyof TaxesSettings>(key: K, value: TaxesSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    markDirty();
  }

  function updateInvoice<K extends keyof InvoiceSettings>(key: K, value: InvoiceSettings[K]) {
    setSettings((s) => ({ ...s, invoice: { ...s.invoice, [key]: value } }));
    markDirty();
  }

  function addRegion() {
    const name = prompt("Region name")?.trim();
    if (!name) return;
    const r: TaxRegion = {
      id: uid("region"),
      name,
      country: "VN",
      postalCodes: ["*"],
      priority: 50,
      enabled: true,
      standardRate: 10,
      reducedRate: null,
      shippingTaxable: true,
      digitalTaxable: true,
    };
    setRegions((prev) => [r, ...prev]);
    setSelectedRegionId(r.id);
    setToast({ type: "success", text: "Region created (mock)." });
    markDirty();
  }

  function deleteRegion(id: string) {
    const used = rules.some((t) => t.regionId === id);
    if (used) {
      setToast({ type: "error", text: "Cannot delete region used by rules. Remove rules first." });
      return;
    }
    if (!confirm("Delete this region? (mock)")) return;
    setRegions((prev) => prev.filter((r) => r.id !== id));
    setSelectedRegionId((prev) => (prev === id ? regions.find((x) => x.id !== id)?.id || "" : prev));
    setToast({ type: "info", text: "Region deleted (mock)." });
    markDirty();
  }

  function updateRegion(id: string, patch: Partial<TaxRegion>) {
    setRegions((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    markDirty();
  }

  function addRule() {
    const name = prompt("Rule name")?.trim();
    if (!name) return;
    const t: TaxRule = {
      id: uid("rule"),
      name,
      enabled: true,
      type: "STANDARD",
      scope: "ALL",
      regionId: "ALL",
      productTag: "*",
      rateOverride: null,
      customerType: "ALL",
      note: "",
    };
    setRules((prev) => [t, ...prev]);
    setSelectedRuleId(t.id);
    setToast({ type: "success", text: "Rule created (mock)." });
    markDirty();
  }

  function deleteRule(id: string) {
    if (!confirm("Delete this rule? (mock)")) return;
    setRules((prev) => prev.filter((r) => r.id !== id));
    setSelectedRuleId((prev) => (prev === id ? rules.find((x) => x.id !== id)?.id || "" : prev));
    setToast({ type: "info", text: "Rule deleted (mock)." });
    markDirty();
  }

  function updateRule(id: string, patch: Partial<TaxRule>) {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    markDirty();
  }

  function matchRegion(input: TestInput): TaxRegion | null {
    const candidates = regions
      .filter((r) => r.enabled)
      .filter((r) => r.country === "*" || r.country === input.country)
      .filter((r) => (!r.region ? true : r.region === input.region))
      .filter((r) => matchesPostal(r.postalCodes, input.postalCode))
      .sort((a, b) => b.priority - a.priority);
    return candidates[0] || null;
  }

  function applicableRules(input: TestInput, region: TaxRegion | null): TaxRule[] {
    const list = rules
      .filter((r) => r.enabled)
      .filter((r) => r.customerType === "ALL" || r.customerType === input.customerType)
      .filter((r) => r.regionId === "ALL" || (region && r.regionId === region.id))
      .filter((r) => r.productTag === "*" || r.productTag === input.productTag)
      .sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }

  function pickRate(scope: TaxScope, region: TaxRegion | null, input: TestInput, rulesApplied: TaxRule[], notes: string[]): number {
    // Base: from region standard
    let base = region ? region.standardRate : settings.defaultRate;

    // Region switches
    if (scope === "SHIPPING" && region && !region.shippingTaxable) return 0;
    if (scope === "DIGITAL" && region && !region.digitalTaxable) return 0;
    if (!settings.applyToShipping && scope === "SHIPPING") return 0;
    if (!settings.applyToDigital && scope === "DIGITAL") return 0;

    // VAT exemption rule (mock)
    const hasB2BExemptRule = rulesApplied.some((r) => r.type === "EXEMPT" && (r.scope === "ALL" || r.scope === scope));
    if (
      settings.collectVatId &&
      settings.exemptionIfValidVatId &&
      input.customerType === "B2B" &&
      input.vatIdProvided &&
      (settings.validateVatId ? isValidTaxId(vatIdInput) : true) &&
      hasB2BExemptRule
    ) {
      notes.push("B2B exemption applied (mock).");
      return 0;
    }

    // Specific overrides: first matching override by priority (mock: use rules order)
    for (const r of rulesApplied) {
      const scopeMatch = r.scope === "ALL" || r.scope === scope;
      if (!scopeMatch) continue;

      if (r.type === "ZERO") return 0;
      if (r.type === "EXEMPT") return 0;

      if (r.rateOverride != null) return clampPercent(r.rateOverride);
      if (r.type === "REDUCED" && region?.reducedRate != null) return clampPercent(region.reducedRate);
      if (r.type === "STANDARD") return clampPercent(base);
    }

    return clampPercent(base);
  }

  function roundTax(n: number) {
    // simple rounding: VND no decimals
    return Math.round(n);
  }

  async function runCalc() {
    setBusy(true);
    setToast(null);
    setCalc(null);

    await new Promise((r) => setTimeout(r, 420));

    if (!settings.enabled) {
      setCalc({
        matchedRegion: undefined,
        appliedRules: [],
        lines: [],
        subtotal: test.orderSubtotal + test.digitalSubtotal + test.shipping,
        taxTotal: 0,
        total: test.orderSubtotal + test.digitalSubtotal + test.shipping,
        mode: settings.mode,
        rounding: settings.rounding,
        notes: ["Taxes disabled."],
      });
      setToast({ type: "info", text: "Taxes are disabled." });
      setBusy(false);
      return;
    }

    const region = matchRegion(test);
    const applied = applicableRules(test, region);

    const notes: string[] = [];
    const subtotal = test.orderSubtotal + test.digitalSubtotal + test.shipping;

    const physicalBase = test.orderSubtotal;
    const digitalBase = test.digitalSubtotal;
    const shippingBase = test.shipping;

    const lines: CalcLine[] = [];

    const ratePhysical = pickRate("PHYSICAL", region, test, applied, notes);
    const rateDigital = pickRate("DIGITAL", region, test, applied, notes);
    const rateShipping = pickRate("SHIPPING", region, test, applied, notes);

    // Compute tax based on mode
    function taxFromBase(base: number, rate: number) {
      if (base <= 0 || rate <= 0) return 0;
      if (settings.mode === "EXCLUSIVE") return roundTax((base * rate) / 100);
      // inclusive: base includes tax => extract
      return roundTax(base - base / (1 + rate / 100));
    }

    if (settings.rounding === "LINE_ITEM") {
      lines.push({ label: "Physical goods", base: physicalBase, rate: ratePhysical, tax: taxFromBase(physicalBase, ratePhysical) });
      lines.push({ label: "Digital goods", base: digitalBase, rate: rateDigital, tax: taxFromBase(digitalBase, rateDigital) });
      lines.push({ label: "Shipping", base: shippingBase, rate: rateShipping, tax: taxFromBase(shippingBase, rateShipping) });
    } else {
      // ORDER_TOTAL: compute combined rate by parts (simple sum of extracted taxes)
      const t = taxFromBase(physicalBase, ratePhysical) + taxFromBase(digitalBase, rateDigital) + taxFromBase(shippingBase, rateShipping);
      lines.push({ label: "Order total (rounded)", base: subtotal, rate: -1, tax: roundTax(t) });
    }

    const taxTotal = lines.reduce((sum, l) => sum + l.tax, 0);

    const total = settings.mode === "EXCLUSIVE" ? subtotal + taxTotal : subtotal; // already included

    const regionName = region ? `${region.name} (${region.country}${region.region ? "-" + region.region : ""})` : "No region matched";

    setCalc({
      matchedRegion: region || undefined,
      appliedRules: applied,
      lines,
      subtotal,
      taxTotal,
      total,
      mode: settings.mode,
      rounding: settings.rounding,
      notes: [regionName, ...notes],
    });

    setToast({ type: "success", text: "Tax calculation done (mock)." });
    setBusy(false);
  }

  function validate(): { ok: boolean; msg?: string } {
    if (settings.defaultRate < 0 || settings.defaultRate > 100) return { ok: false, msg: "Default rate must be 0–100." };
    for (const r of regions) {
      if (!r.name.trim()) return { ok: false, msg: "Region name is required." };
      if (r.standardRate < 0 || r.standardRate > 100) return { ok: false, msg: `Standard rate invalid in "${r.name}".` };
      if (r.reducedRate != null && (r.reducedRate < 0 || r.reducedRate > 100)) return { ok: false, msg: `Reduced rate invalid in "${r.name}".` };
    }
    for (const t of rules) {
      if (!t.name.trim()) return { ok: false, msg: "Rule name is required." };
      if (t.rateOverride != null && (t.rateOverride < 0 || t.rateOverride > 100)) return { ok: false, msg: `Rule override invalid in "${t.name}".` };
    }
    return { ok: true };
  }

  function save() {
    const v = validate();
    if (!v.ok) {
      setToast({ type: "error", text: v.msg || "Invalid taxes configuration." });
      return;
    }
    setToast({ type: "success", text: "Taxes saved (mock)." });
    setDirty(false);
  }

  function reset() {
    // keep regions/rules, reset settings only
    setSettings((s) => ({
      ...s,
      enabled: true,
      mode: "EXCLUSIVE",
      rounding: "LINE_ITEM",
      pricesIncludeTaxHint: "Prices shown at checkout exclude tax (tax added at payment).",
      defaultRate: 10,
      applyToShipping: true,
      applyToDigital: true,
      collectVatId: true,
      validateVatId: false,
      exemptionIfValidVatId: true,
    }));
    setToast({ type: "info", text: "Reset settings (not saved yet)." });
    markDirty();
  }

  const overview = useMemo(() => {
    const enabledRegions = regions.filter((r) => r.enabled).length;
    const enabledRules = rules.filter((r) => r.enabled).length;
    return { enabledRegions, enabledRules, totalRegions: regions.length, totalRules: rules.length };
  }, [regions, rules]);

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
              <i className="bi bi-receipt-cutoff" /> Taxes
            </span>
          </div>

          <div className={styles.titleRow}>
            <h1 className={styles.title}>Taxes</h1>
            <div className={styles.subtitle}>Tax mode, regions & rates, exemptions and invoice settings for your lowcode store</div>
          </div>

          <div className={styles.kpis}>
            <Kpi icon="bi-toggle-on" label="Taxes" value={settings.enabled ? "Enabled" : "Disabled"} tone={settings.enabled ? "ok" : "warn"} />
            <Kpi icon="bi-percent" label="Mode" value={settings.mode === "INCLUSIVE" ? "Inclusive" : "Exclusive"} />
            <Kpi icon="bi-map" label="Regions" value={`${overview.enabledRegions}/${overview.totalRegions} enabled`} />
            <Kpi icon="bi-diagram-3" label="Rules" value={`${overview.enabledRules}/${overview.totalRules} enabled`} />
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.secondaryBtn} type="button" onClick={reset}>
            <i className="bi bi-arrow-counterclockwise" /> Reset
          </button>
          <button className={styles.secondaryBtn} type="button" onClick={() => setActiveTab("TEST")}>
            <i className="bi bi-calculator" /> Test
          </button>
          <button className={styles.primaryBtn} type="button" onClick={save} disabled={!dirty}>
            <i className="bi bi-cloud-check" /> Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === "OVERVIEW" ? styles.tabActive : ""}`} onClick={() => setActiveTab("OVERVIEW")} type="button">
          <i className="bi bi-sliders" /> Overview
        </button>
        <button className={`${styles.tab} ${activeTab === "REGIONS" ? styles.tabActive : ""}`} onClick={() => setActiveTab("REGIONS")} type="button">
          <i className="bi bi-map" /> Regions
        </button>
        <button className={`${styles.tab} ${activeTab === "RULES" ? styles.tabActive : ""}`} onClick={() => setActiveTab("RULES")} type="button">
          <i className="bi bi-diagram-3" /> Rules
        </button>
        <button className={`${styles.tab} ${activeTab === "INVOICES" ? styles.tabActive : ""}`} onClick={() => setActiveTab("INVOICES")} type="button">
          <i className="bi bi-receipt" /> Invoices
        </button>
        <button className={`${styles.tab} ${activeTab === "TEST" ? styles.tabActive : ""}`} onClick={() => setActiveTab("TEST")} type="button">
          <i className="bi bi-calculator" /> Test calculator
        </button>
      </div>

      <div className={styles.grid}>
        {/* Main */}
        <div className={styles.colMain}>
          {activeTab === "OVERVIEW" ? (
            <>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <div className={styles.cardTitle}>
                      <i className="bi bi-percent" /> Tax behavior
                    </div>
                    <div className={styles.cardHint}>Mode, rounding and where taxes apply</div>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <Field label="Taxes enabled" hint="Master switch">
                      <Toggle checked={settings.enabled} onChange={(v) => updateSettings("enabled", v)} labels={["Off", "On"]} />
                    </Field>

                    <Field label="Tax mode" hint="Inclusive vs Exclusive">
                      <div className={styles.selectWrap}>
                        <i className={`bi bi-percent ${styles.selectIcon}`} />
                        <select className={styles.select} value={settings.mode} onChange={(e) => updateSettings("mode", e.target.value as any)}>
                          <option value="EXCLUSIVE">Exclusive (add tax at checkout)</option>
                          <option value="INCLUSIVE">Inclusive (prices include tax)</option>
                        </select>
                      </div>
                    </Field>

                    <Field label="Rounding" hint="Line item vs order total">
                      <div className={styles.selectWrap}>
                        <i className={`bi bi-bounding-box ${styles.selectIcon}`} />
                        <select className={styles.select} value={settings.rounding} onChange={(e) => updateSettings("rounding", e.target.value as any)}>
                          <option value="LINE_ITEM">Line item</option>
                          <option value="ORDER_TOTAL">Order total</option>
                        </select>
                      </div>
                    </Field>

                    <Field label="Default rate (%)" hint="Used when no region matched">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-speedometer2 ${styles.inputIcon}`} />
                        <input className={styles.input} type="number" value={settings.defaultRate} onChange={(e) => updateSettings("defaultRate", clampPercent(Number(e.target.value || 0)))} />
                      </div>
                    </Field>

                    <Field label="Apply taxes to shipping">
                      <Toggle checked={settings.applyToShipping} onChange={(v) => updateSettings("applyToShipping", v)} labels={["Off", "On"]} />
                    </Field>

                    <Field label="Apply taxes to digital goods">
                      <Toggle checked={settings.applyToDigital} onChange={(v) => updateSettings("applyToDigital", v)} labels={["Off", "On"]} />
                    </Field>

                    <Field label="Customer-facing hint" hint="Shown at checkout (optional)">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-chat-left-text ${styles.inputIcon}`} />
                        <input className={styles.input} value={settings.pricesIncludeTaxHint} onChange={(e) => updateSettings("pricesIncludeTaxHint", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Origin country (ISO2)" hint="Default for your store">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-flag ${styles.inputIcon}`} />
                        <input className={styles.input} value={settings.originCountry} onChange={(e) => updateSettings("originCountry", e.target.value.toUpperCase())} />
                      </div>
                    </Field>
                  </div>

                  <div className={styles.noteCallout}>
                    <i className="bi bi-info-circle" />
                    <div>
                      <b>Low-code tip:</b> Nếu bạn dùng <b>Inclusive</b>, số thuế sẽ được “tách ra” từ giá đã gồm thuế để hiển thị trên invoice/receipt.
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <div className={styles.cardTitle}>
                      <i className="bi bi-building-check" /> Tax registration & exemptions
                    </div>
                    <div className={styles.cardHint}>VAT/GST ID collection and B2B exemption behavior</div>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <Field label="Tax ID label" hint="VAT ID / GST ID / Tax number">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-badge-tm ${styles.inputIcon}`} />
                        <input className={styles.input} value={settings.taxIdLabel} onChange={(e) => updateSettings("taxIdLabel", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Collect Tax ID" hint="Show input on checkout for B2B">
                      <Toggle checked={settings.collectVatId} onChange={(v) => updateSettings("collectVatId", v)} labels={["Off", "On"]} />
                    </Field>

                    <Field label="Validate Tax ID" hint="Mock toggle (connect real validator later)">
                      <Toggle checked={settings.validateVatId} onChange={(v) => updateSettings("validateVatId", v)} labels={["Off", "On"]} />
                    </Field>

                    <Field label="Exempt if valid Tax ID" hint="B2B can be exempt">
                      <Toggle checked={settings.exemptionIfValidVatId} onChange={(v) => updateSettings("exemptionIfValidVatId", v)} labels={["Off", "On"]} />
                    </Field>
                  </div>

                  <div className={styles.noteCallout}>
                    <i className="bi bi-shield-check" />
                    <div>
                      <b>Best practice:</b> B2B exemption thường là rule (scope ALL, customer B2B, requires valid tax id). Page này đã có mẫu rule.
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "REGIONS" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-map" /> Tax regions
                  </div>
                  <div className={styles.cardHint}>Match address → region → base rates</div>
                </div>
                <div className={styles.headActions}>
                  <button className={styles.secondaryBtn} type="button" onClick={addRegion}>
                    <i className="bi bi-plus-circle" /> Add region
                  </button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.split}>
                  <div className={styles.list}>
                    {regions.map((r) => (
                      <button key={r.id} type="button" className={`${styles.listItem} ${r.id === selectedRegionId ? styles.listItemActive : ""}`} onClick={() => setSelectedRegionId(r.id)}>
                        <div className={styles.listTop}>
                          <div className={styles.listTitle}>
                            <i className="bi bi-geo-alt" /> {r.name}
                          </div>
                          <span className={`${styles.chip} ${r.enabled ? styles.chipOk : styles.chipMuted}`}>
                            <i className={`bi ${r.enabled ? "bi-check-circle" : "bi-pause-circle"}`} />
                            {r.enabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <div className={styles.listSub}>
                          <span className={styles.subPill}>
                            <i className="bi bi-flag" /> {r.country}
                            {r.region ? `-${r.region}` : ""}
                          </span>
                          <span className={styles.subPill}>
                            <i className="bi bi-layers" /> Priority {r.priority}
                          </span>
                          <span className={styles.subPill}>
                            <i className="bi bi-percent" /> {r.standardRate}%
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className={styles.editor}>
                    {selectedRegion ? (
                      <>
                        <div className={styles.editorHead}>
                          <div className={styles.editorTitle}>
                            <i className="bi bi-sliders" /> Edit region
                          </div>
                          <div className={styles.editorActions}>
                            <button className={`${styles.secondaryBtn} ${styles.dangerBtn}`} type="button" onClick={() => deleteRegion(selectedRegion.id)}>
                              <i className="bi bi-trash3" /> Delete
                            </button>
                          </div>
                        </div>

                        <div className={styles.formGrid}>
                          <Field label="Name">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-type ${styles.inputIcon}`} />
                              <input className={styles.input} value={selectedRegion.name} onChange={(e) => updateRegion(selectedRegion.id, { name: e.target.value })} />
                            </div>
                          </Field>

                          <Field label="Enabled">
                            <Toggle checked={selectedRegion.enabled} onChange={(v) => updateRegion(selectedRegion.id, { enabled: v })} labels={["Off", "On"]} />
                          </Field>

                          <Field label="Priority" hint="Higher wins">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-layers ${styles.inputIcon}`} />
                              <input
                                className={styles.input}
                                type="number"
                                value={selectedRegion.priority}
                                onChange={(e) => updateRegion(selectedRegion.id, { priority: Number(e.target.value || 0) })}
                              />
                            </div>
                          </Field>

                          <Field label="Country (ISO2)" hint='Use "*" for fallback'>
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-flag ${styles.inputIcon}`} />
                              <input className={styles.input} value={selectedRegion.country} onChange={(e) => updateRegion(selectedRegion.id, { country: e.target.value.toUpperCase() })} />
                            </div>
                          </Field>

                          <Field label="Region/State code" hint="Optional">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-map ${styles.inputIcon}`} />
                              <input className={styles.input} value={selectedRegion.region ?? ""} onChange={(e) => updateRegion(selectedRegion.id, { region: e.target.value || undefined })} />
                            </div>
                          </Field>

                          <Field label="Postal codes" hint='Comma separated, supports "*" and "70*"'>
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-mailbox ${styles.inputIcon}`} />
                              <input
                                className={styles.input}
                                value={selectedRegion.postalCodes.join(",")}
                                onChange={(e) =>
                                  updateRegion(selectedRegion.id, {
                                    postalCodes: e.target.value
                                      .split(",")
                                      .map((x) => x.trim())
                                      .filter(Boolean),
                                  })
                                }
                              />
                            </div>
                          </Field>

                          <Field label="Standard rate (%)">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-percent ${styles.inputIcon}`} />
                              <input
                                className={styles.input}
                                type="number"
                                value={selectedRegion.standardRate}
                                onChange={(e) => updateRegion(selectedRegion.id, { standardRate: clampPercent(Number(e.target.value || 0)) })}
                              />
                            </div>
                          </Field>

                          <Field label="Reduced rate (%)" hint="Optional">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-percent ${styles.inputIcon}`} />
                              <input
                                className={styles.input}
                                type="number"
                                value={selectedRegion.reducedRate ?? ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  updateRegion(selectedRegion.id, { reducedRate: v === "" ? null : clampPercent(Number(v)) });
                                }}
                              />
                            </div>
                          </Field>

                          <Field label="Taxable: shipping">
                            <Toggle checked={selectedRegion.shippingTaxable} onChange={(v) => updateRegion(selectedRegion.id, { shippingTaxable: v })} labels={["Off", "On"]} />
                          </Field>

                          <Field label="Taxable: digital goods">
                            <Toggle checked={selectedRegion.digitalTaxable} onChange={(v) => updateRegion(selectedRegion.id, { digitalTaxable: v })} labels={["Off", "On"]} />
                          </Field>
                        </div>

                        <div className={styles.noteCallout}>
                          <i className="bi bi-info-circle" />
                          <div>
                            <b>Low-code tip:</b> Region là “base tax profile”. Rule sẽ override/miễn thuế cho trường hợp đặc biệt.
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className={styles.empty}>
                        <i className="bi bi-inbox" />
                        <div className={styles.emptyTitle}>Select a region</div>
                        <div className={styles.emptyHint}>Choose a region from the left to edit.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "RULES" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-diagram-3" /> Tax rules
                  </div>
                  <div className={styles.cardHint}>Overrides, reduced rates, zero-rate and exemptions</div>
                </div>
                <div className={styles.headActions}>
                  <button className={styles.secondaryBtn} type="button" onClick={addRule}>
                    <i className="bi bi-plus-circle" /> Add rule
                  </button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.split}>
                  <div className={styles.list}>
                    {rules.map((r) => (
                      <button key={r.id} type="button" className={`${styles.listItem} ${r.id === selectedRuleId ? styles.listItemActive : ""}`} onClick={() => setSelectedRuleId(r.id)}>
                        <div className={styles.listTop}>
                          <div className={styles.listTitle}>
                            <i className="bi bi-diagram-3" /> {r.name}
                          </div>
                          <span className={`${styles.chip} ${r.enabled ? styles.chipOk : styles.chipMuted}`}>
                            <i className={`bi ${r.enabled ? "bi-check-circle" : "bi-pause-circle"}`} />
                            {r.enabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <div className={styles.listSub}>
                          <span className={styles.subPill}>
                            <i className="bi bi-tag" /> {r.type}
                          </span>
                          <span className={styles.subPill}>
                            <i className="bi bi-layers" /> {r.scope}
                          </span>
                          <span className={styles.subPill}>
                            <i className="bi bi-people" /> {r.customerType}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  <div className={styles.editor}>
                    {selectedRule ? (
                      <>
                        <div className={styles.editorHead}>
                          <div className={styles.editorTitle}>
                            <i className="bi bi-sliders" /> Edit rule
                          </div>
                          <div className={styles.editorActions}>
                            <button className={`${styles.secondaryBtn} ${styles.dangerBtn}`} type="button" onClick={() => deleteRule(selectedRule.id)}>
                              <i className="bi bi-trash3" /> Delete
                            </button>
                          </div>
                        </div>

                        <div className={styles.formGrid}>
                          <Field label="Name">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-type ${styles.inputIcon}`} />
                              <input className={styles.input} value={selectedRule.name} onChange={(e) => updateRule(selectedRule.id, { name: e.target.value })} />
                            </div>
                          </Field>

                          <Field label="Enabled">
                            <Toggle checked={selectedRule.enabled} onChange={(v) => updateRule(selectedRule.id, { enabled: v })} labels={["Off", "On"]} />
                          </Field>

                          <Field label="Type">
                            <div className={styles.selectWrap}>
                              <i className={`bi bi-tag ${styles.selectIcon}`} />
                              <select className={styles.select} value={selectedRule.type} onChange={(e) => updateRule(selectedRule.id, { type: e.target.value as any })}>
                                <option value="STANDARD">STANDARD</option>
                                <option value="REDUCED">REDUCED</option>
                                <option value="ZERO">ZERO</option>
                                <option value="EXEMPT">EXEMPT</option>
                              </select>
                            </div>
                          </Field>

                          <Field label="Scope">
                            <div className={styles.selectWrap}>
                              <i className={`bi bi-layers ${styles.selectIcon}`} />
                              <select className={styles.select} value={selectedRule.scope} onChange={(e) => updateRule(selectedRule.id, { scope: e.target.value as any })}>
                                <option value="ALL">ALL</option>
                                <option value="PHYSICAL">PHYSICAL</option>
                                <option value="DIGITAL">DIGITAL</option>
                                <option value="SHIPPING">SHIPPING</option>
                              </select>
                            </div>
                          </Field>

                          <Field label="Region" hint='Pick region or "ALL"'>
                            <div className={styles.selectWrap}>
                              <i className={`bi bi-map ${styles.selectIcon}`} />
                              <select className={styles.select} value={selectedRule.regionId} onChange={(e) => updateRule(selectedRule.id, { regionId: e.target.value as any })}>
                                <option value="ALL">ALL</option>
                                {regions.map((r) => (
                                  <option key={r.id} value={r.id}>
                                    {r.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </Field>

                          <Field label="Customer type">
                            <div className={styles.selectWrap}>
                              <i className={`bi bi-people ${styles.selectIcon}`} />
                              <select className={styles.select} value={selectedRule.customerType} onChange={(e) => updateRule(selectedRule.id, { customerType: e.target.value as any })}>
                                <option value="ALL">ALL</option>
                                <option value="B2C">B2C</option>
                                <option value="B2B">B2B</option>
                              </select>
                            </div>
                          </Field>

                          <Field label="Product tag" hint='Use "*" for any'>
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-tag ${styles.inputIcon}`} />
                              <input className={styles.input} value={selectedRule.productTag} onChange={(e) => updateRule(selectedRule.id, { productTag: e.target.value })} />
                            </div>
                          </Field>

                          <Field label="Rate override (%)" hint="Optional override">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-percent ${styles.inputIcon}`} />
                              <input
                                className={styles.input}
                                type="number"
                                value={selectedRule.rateOverride ?? ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  updateRule(selectedRule.id, { rateOverride: v === "" ? null : clampPercent(Number(v)) });
                                }}
                              />
                            </div>
                          </Field>

                          <Field label="Note" hint="Optional">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-chat-left-text ${styles.inputIcon}`} />
                              <input className={styles.input} value={selectedRule.note ?? ""} onChange={(e) => updateRule(selectedRule.id, { note: e.target.value })} />
                            </div>
                          </Field>
                        </div>

                        <div className={styles.noteCallout}>
                          <i className="bi bi-info-circle" />
                          <div>
                            <b>Rule order:</b> Trong demo này, override được áp bằng “first applicable override” theo danh sách rule (sort theo name). Bạn có thể đổi thành drag & drop.
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className={styles.empty}>
                        <i className="bi bi-inbox" />
                        <div className={styles.emptyTitle}>Select a rule</div>
                        <div className={styles.emptyHint}>Choose a rule to edit.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "INVOICES" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-receipt" /> Invoice settings
                  </div>
                  <div className={styles.cardHint}>Invoice numbering and tax info display</div>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <Field label="Enable invoices">
                    <Toggle checked={settings.invoice.enableInvoices} onChange={(v) => updateInvoice("enableInvoices", v)} labels={["Off", "On"]} />
                  </Field>

                  <Field label="Invoice prefix" hint="e.g. INV">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-hash ${styles.inputIcon}`} />
                      <input
                        className={styles.input}
                        value={settings.invoice.invoicePrefix}
                        disabled={!settings.invoice.enableInvoices}
                        onChange={(e) => updateInvoice("invoicePrefix", e.target.value)}
                      />
                    </div>
                  </Field>

                  <Field label="Require Tax ID for B2B">
                    <Toggle checked={settings.invoice.requireVatIdForB2B} onChange={(v) => updateInvoice("requireVatIdForB2B", v)} labels={["Off", "On"]} />
                  </Field>

                  <Field label="Show Tax ID on invoice">
                    <Toggle checked={settings.invoice.showTaxIdOnInvoice} onChange={(v) => updateInvoice("showTaxIdOnInvoice", v)} labels={["Off", "On"]} />
                  </Field>

                  <Field label="Company name">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-building ${styles.inputIcon}`} />
                      <input className={styles.input} value={settings.invoice.companyName} disabled={!settings.invoice.enableInvoices} onChange={(e) => updateInvoice("companyName", e.target.value)} />
                    </div>
                  </Field>

                  <Field label="Company address">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-geo-alt ${styles.inputIcon}`} />
                      <input
                        className={styles.input}
                        value={settings.invoice.companyAddress}
                        disabled={!settings.invoice.enableInvoices}
                        onChange={(e) => updateInvoice("companyAddress", e.target.value)}
                      />
                    </div>
                  </Field>
                </div>

                <div className={styles.noteCallout}>
                  <i className="bi bi-info-circle" />
                  <div>
                    <b>Low-code tip:</b> Invoice prefix + sequence có thể được generate ở server để tránh trùng (transaction/atomic counter).
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "TEST" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-calculator" /> Test tax calculator
                  </div>
                  <div className={styles.cardHint}>Simulate tax calculation based on current settings (mock)</div>
                </div>
                <div className={styles.headActions}>
                  <button className={styles.primaryBtn} type="button" onClick={runCalc} disabled={busy}>
                    <i className={`bi ${busy ? "bi-hourglass-split" : "bi-play-circle"}`} /> {busy ? "Running..." : "Run"}
                  </button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <Field label="Country (ISO2)">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-flag ${styles.inputIcon}`} />
                      <input className={styles.input} value={test.country} onChange={(e) => setTest((s) => ({ ...s, country: e.target.value.toUpperCase() }))} />
                    </div>
                  </Field>

                  <Field label="Region/State">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-map ${styles.inputIcon}`} />
                      <input className={styles.input} value={test.region} onChange={(e) => setTest((s) => ({ ...s, region: e.target.value }))} />
                    </div>
                  </Field>

                  <Field label="Postal code">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-mailbox ${styles.inputIcon}`} />
                      <input className={styles.input} value={test.postalCode} onChange={(e) => setTest((s) => ({ ...s, postalCode: e.target.value }))} />
                    </div>
                  </Field>

                  <Field label="Customer type">
                    <div className={styles.selectWrap}>
                      <i className={`bi bi-people ${styles.selectIcon}`} />
                      <select className={styles.select} value={test.customerType} onChange={(e) => setTest((s) => ({ ...s, customerType: e.target.value as any }))}>
                        <option value="B2C">B2C</option>
                        <option value="B2B">B2B</option>
                      </select>
                    </div>
                  </Field>

                  <Field label="Physical subtotal">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-bag ${styles.inputIcon}`} />
                      <input className={styles.input} type="number" value={test.orderSubtotal} onChange={(e) => setTest((s) => ({ ...s, orderSubtotal: Math.max(0, Number(e.target.value || 0)) }))} />
                    </div>
                  </Field>

                  <Field label="Digital subtotal">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-cloud-download ${styles.inputIcon}`} />
                      <input
                        className={styles.input}
                        type="number"
                        value={test.digitalSubtotal}
                        onChange={(e) => setTest((s) => ({ ...s, digitalSubtotal: Math.max(0, Number(e.target.value || 0)) }))}
                      />
                    </div>
                  </Field>

                  <Field label="Shipping">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-truck ${styles.inputIcon}`} />
                      <input className={styles.input} type="number" value={test.shipping} onChange={(e) => setTest((s) => ({ ...s, shipping: Math.max(0, Number(e.target.value || 0)) }))} />
                    </div>
                  </Field>

                  <Field label="Product tag" hint='For rules (e.g. "digital")'>
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-tag ${styles.inputIcon}`} />
                      <input className={styles.input} value={test.productTag} onChange={(e) => setTest((s) => ({ ...s, productTag: e.target.value }))} />
                    </div>
                  </Field>

                  <Field label={`${settings.taxIdLabel} provided`}>
                    <Toggle checked={test.vatIdProvided} onChange={(v) => setTest((s) => ({ ...s, vatIdProvided: v }))} labels={["No", "Yes"]} />
                  </Field>

                  <Field label={`${settings.taxIdLabel} value`} hint='Mock validation: include "VALID"'>
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-badge-tm ${styles.inputIcon}`} />
                      <input className={styles.input} value={vatIdInput} onChange={(e) => setVatIdInput(e.target.value)} disabled={!test.vatIdProvided || !settings.collectVatId} />
                    </div>
                  </Field>
                </div>

                <div className={styles.hr} />

                <div className={styles.resultBox}>
                  <div className={styles.resultTitle}>
                    <i className="bi bi-receipt-cutoff" /> Result
                  </div>

                  {!calc ? (
                    <div className={styles.empty}>
                      <i className="bi bi-inbox" />
                      <div className={styles.emptyTitle}>No result</div>
                      <div className={styles.emptyHint}>Run calculator to see matched region and tax lines.</div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.resultMeta}>
                        <span className={styles.pill}>
                          <i className="bi bi-map" /> Region: <b>{calc.matchedRegion?.name || "None"}</b>
                        </span>
                        <span className={styles.pill}>
                          <i className="bi bi-percent" /> Mode: <b>{calc.mode}</b>
                        </span>
                        <span className={styles.pill}>
                          <i className="bi bi-bounding-box" /> Rounding: <b>{calc.rounding}</b>
                        </span>
                      </div>

                      <div className={styles.table}>
                        <div className={styles.tHead}>
                          <div>Line</div>
                          <div>Base</div>
                          <div>Rate</div>
                          <div>Tax</div>
                        </div>

                        {calc.lines.map((l, i) => (
                          <div key={i} className={styles.tRow}>
                            <div className={styles.lineLabel}>{l.label}</div>
                            <div>{fmtMoney(l.base)}</div>
                            <div>{l.rate < 0 ? "—" : `${l.rate}%`}</div>
                            <div className={styles.taxCell}>{fmtMoney(l.tax)}</div>
                          </div>
                        ))}

                        <div className={styles.tFoot}>
                          <div>Total</div>
                          <div>{fmtMoney(calc.subtotal)}</div>
                          <div className={styles.taxTotal}>Tax: {fmtMoney(calc.taxTotal)}</div>
                          <div className={styles.grand}>{fmtMoney(calc.total)}</div>
                        </div>
                      </div>

                      <div className={styles.notes}>
                        <div className={styles.notesTitle}>
                          <i className="bi bi-info-circle" /> Notes
                        </div>
                        <ul className={styles.notesList}>
                          {calc.notes.map((n, idx) => (
                            <li key={idx}>{n}</li>
                          ))}
                        </ul>
                      </div>

                      <div className={styles.notes}>
                        <div className={styles.notesTitle}>
                          <i className="bi bi-diagram-3" /> Applied rules
                        </div>
                        {calc.appliedRules.length === 0 ? (
                          <div className={styles.smallMuted}>No rules matched.</div>
                        ) : (
                          <div className={styles.ruleChips}>
                            {calc.appliedRules.map((r) => (
                              <span key={r.id} className={styles.ruleChip}>
                                <i className="bi bi-tag" /> {r.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
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
                <i className="bi bi-compass" /> Summary
              </div>
              <span className={`${styles.chip} ${dirty ? styles.chipWarn : styles.chipOk}`}>
                <i className={`bi ${dirty ? "bi-dot" : "bi-check2-circle"}`} />
                {dirty ? "Unsaved" : "Saved"}
              </span>
            </div>

            <div className={styles.sideBody}>
              <MiniRow icon="bi-toggle-on" label="Taxes" value={settings.enabled ? "Enabled" : "Disabled"} />
              <MiniRow icon="bi-percent" label="Mode" value={settings.mode} />
              <MiniRow icon="bi-map" label="Regions" value={`${overview.enabledRegions}/${overview.totalRegions}`} />
              <MiniRow icon="bi-diagram-3" label="Rules" value={`${overview.enabledRules}/${overview.totalRules}`} />

              <div className={styles.hr} />

              <div className={styles.sideHint}>
                <i className="bi bi-lightbulb" />
                <div>
                  <b>Recommended:</b> Region “fallback” (country="*") giúp tránh lỗi khi địa chỉ không match region cụ thể.
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

          {busy ? (
            <div className={styles.busyCard}>
              <i className="bi bi-hourglass-split" />
              <div>Working…</div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

/* -------- components -------- */

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

function MiniRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className={styles.miniRow}>
      <i className={`bi ${icon} ${styles.miniIcon}`} />
      <div className={styles.miniLabel}>{label}</div>
      <div className={styles.miniValue}>{value}</div>
    </div>
  );
}
