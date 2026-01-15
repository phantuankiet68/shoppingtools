"use client";

import React, { useMemo, useState } from "react";
import styles from "@/styles/admin/settings/shipping/shipping.module.css";

type Toast = { type: "success" | "error" | "info"; text: string };

type RateType = "FLAT" | "BY_WEIGHT" | "BY_PRICE";
type MethodStatus = "ACTIVE" | "INACTIVE";

type ShippingZone = {
  id: string;
  name: string;
  countries: string[]; // ISO2
  regions: string[]; // optional state/province codes
  postalCodes: string[]; // supports wildcards like "70*" (mock)
  priority: number; // higher priority wins
  enabled: boolean;
};

type ShippingRule = {
  id: string;
  type: RateType;
  min?: number; // min weight (kg) or min price
  max?: number; // max weight (kg) or max price
  price: number; // shipping fee
  note?: string;
};

type ShippingMethod = {
  id: string;
  zoneId: string;
  name: string;
  description: string;
  status: MethodStatus;

  carrier: "CUSTOM" | "DHL" | "FEDEX" | "UPS" | "GHN" | "GHTK";
  etaMinDays: number;
  etaMaxDays: number;

  freeOver?: number | null; // order total free shipping
  processingDays: number;

  rules: ShippingRule[];
};

type ShippingSettings = {
  defaultWeightUnit: "kg" | "g";
  defaultDimUnit: "cm" | "mm";
  fallbackBehavior: "DISABLE_CHECKOUT" | "SHOW_MESSAGE";
  fallbackMessage: string;

  allowPickup: boolean;
  pickupLabel: string;
  pickupInstructions: string;

  autoSelectCheapest: boolean;
};

type QuoteInput = {
  country: string;
  region: string;
  postalCode: string;
  orderTotal: number;
  weightKg: number;
};

type LogRow = {
  id: string;
  at: string;
  level: "INFO" | "WARN" | "ERROR";
  action: string;
  message: string;
};

const DEFAULT_SETTINGS: ShippingSettings = {
  defaultWeightUnit: "kg",
  defaultDimUnit: "cm",
  fallbackBehavior: "SHOW_MESSAGE",
  fallbackMessage: "No shipping methods available for your address.",
  allowPickup: true,
  pickupLabel: "Local pickup",
  pickupInstructions: "Pickup at our store during business hours.",
  autoSelectCheapest: true,
};

function uid(prefix: string) {
  return `${prefix}_${Math.floor(Math.random() * 1000000)}`;
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

function countryName(code: string) {
  const map: Record<string, string> = {
    VN: "Vietnam",
    US: "United States",
    SG: "Singapore",
    TH: "Thailand",
    JP: "Japan",
    KR: "Korea",
    AU: "Australia",
  };
  return map[code] || code;
}

function rateTypeMeta(t: RateType) {
  if (t === "FLAT") return { icon: "bi-tag", label: "Flat rate" };
  if (t === "BY_WEIGHT") return { icon: "bi-speedometer2", label: "By weight (kg)" };
  return { icon: "bi-cash-coin", label: "By price" };
}

function carrierMeta(c: ShippingMethod["carrier"]) {
  const map: Record<string, { icon: string; label: string }> = {
    CUSTOM: { icon: "bi-truck", label: "Custom" },
    DHL: { icon: "bi-truck-flatbed", label: "DHL" },
    FEDEX: { icon: "bi-truck", label: "FedEx" },
    UPS: { icon: "bi-box-seam", label: "UPS" },
    GHN: { icon: "bi-lightning-charge", label: "GHN" },
    GHTK: { icon: "bi-geo-alt", label: "GHTK" },
  };
  return map[c] || { icon: "bi-truck", label: c };
}

export default function ShippingPage() {
  const [settings, setSettings] = useState<ShippingSettings>(DEFAULT_SETTINGS);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [activeTab, setActiveTab] = useState<"ZONES" | "METHODS" | "SETTINGS" | "TEST" | "LOGS">("ZONES");
  const [busy, setBusy] = useState(false);

  const [zones, setZones] = useState<ShippingZone[]>([
    {
      id: "z_vn",
      name: "Vietnam",
      countries: ["VN"],
      regions: [],
      postalCodes: ["*"],
      priority: 100,
      enabled: true,
    },
    {
      id: "z_global",
      name: "International",
      countries: ["US", "SG", "TH", "JP", "KR", "AU"],
      regions: [],
      postalCodes: ["*"],
      priority: 10,
      enabled: true,
    },
  ]);

  const [methods, setMethods] = useState<ShippingMethod[]>([
    {
      id: "m_std_vn",
      zoneId: "z_vn",
      name: "Standard Shipping",
      description: "Delivered by local carrier (2–4 days).",
      status: "ACTIVE",
      carrier: "CUSTOM",
      etaMinDays: 2,
      etaMaxDays: 4,
      freeOver: 800000,
      processingDays: 1,
      rules: [
        { id: "r1", type: "FLAT", price: 25000, note: "Base fee" },
        { id: "r2", type: "BY_WEIGHT", min: 2, max: 5, price: 35000, note: "2–5kg" },
        { id: "r3", type: "BY_WEIGHT", min: 5, max: 9999, price: 50000, note: "5kg+" },
      ],
    },
    {
      id: "m_exp_vn",
      zoneId: "z_vn",
      name: "Express",
      description: "Fast delivery (1–2 days).",
      status: "ACTIVE",
      carrier: "GHN",
      etaMinDays: 1,
      etaMaxDays: 2,
      freeOver: null,
      processingDays: 0,
      rules: [{ id: "r4", type: "FLAT", price: 60000, note: "Express fee" }],
    },
    {
      id: "m_intl",
      zoneId: "z_global",
      name: "International Standard",
      description: "International delivery (7–14 days).",
      status: "INACTIVE",
      carrier: "DHL",
      etaMinDays: 7,
      etaMaxDays: 14,
      freeOver: null,
      processingDays: 2,
      rules: [
        { id: "r5", type: "BY_PRICE", min: 0, max: 2000000, price: 250000, note: "< 2,000,000" },
        { id: "r6", type: "BY_PRICE", min: 2000000, max: 999999999, price: 0, note: ">= 2,000,000 (promo)" },
      ],
    },
  ]);

  const [logs, setLogs] = useState<LogRow[]>([
    { id: "l1", at: "2026-01-14T05:10:00Z", level: "INFO", action: "Load", message: "Shipping settings loaded (mock)." },
    { id: "l2", at: "2026-01-14T05:12:00Z", level: "WARN", action: "Method", message: "International method is inactive (mock)." },
  ]);

  const [selectedZoneId, setSelectedZoneId] = useState<string>(zones[0]?.id || "");
  const selectedZone = useMemo(() => zones.find((z) => z.id === selectedZoneId) || null, [zones, selectedZoneId]);

  const [selectedMethodId, setSelectedMethodId] = useState<string>(methods[0]?.id || "");
  const selectedMethod = useMemo(() => methods.find((m) => m.id === selectedMethodId) || null, [methods, selectedMethodId]);

  const methodsInSelectedZone = useMemo(() => methods.filter((m) => m.zoneId === selectedZoneId), [methods, selectedZoneId]);

  const [quoteInput, setQuoteInput] = useState<QuoteInput>({
    country: "VN",
    region: "HCMC",
    postalCode: "700000",
    orderTotal: 850000,
    weightKg: 1.2,
  });

  const [quoteResult, setQuoteResult] = useState<null | {
    matchedZone?: ShippingZone;
    options: Array<{ method: ShippingMethod; fee: number; reason: string }>;
    picked?: { methodId: string; fee: number };
    fallback?: boolean;
  }>(null);

  function markDirty() {
    setDirty(true);
  }

  function pushLog(level: LogRow["level"], action: string, message: string) {
    setLogs((prev) => [{ id: uid("log"), at: new Date().toISOString(), level, action, message }, ...prev]);
  }

  function updateSettings<K extends keyof ShippingSettings>(key: K, value: ShippingSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    markDirty();
  }

  function updateZone(id: string, patch: Partial<ShippingZone>) {
    setZones((prev) => prev.map((z) => (z.id === id ? { ...z, ...patch } : z)));
    markDirty();
  }

  function updateMethod(id: string, patch: Partial<ShippingMethod>) {
    setMethods((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
    markDirty();
  }

  function addZone() {
    const name = prompt("Zone name")?.trim();
    if (!name) return;
    const z: ShippingZone = {
      id: uid("zone"),
      name,
      countries: ["VN"],
      regions: [],
      postalCodes: ["*"],
      priority: 50,
      enabled: true,
    };
    setZones((prev) => [z, ...prev]);
    setSelectedZoneId(z.id);
    setToast({ type: "success", text: "Zone created (mock)." });
    pushLog("INFO", "Zone", `Created zone "${name}" (mock).`);
    markDirty();
  }

  function deleteZone(id: string) {
    const hasMethods = methods.some((m) => m.zoneId === id);
    if (hasMethods) {
      setToast({ type: "error", text: "Cannot delete zone that has methods. Remove methods first." });
      return;
    }
    if (!confirm("Delete this zone? (mock)")) return;
    setZones((prev) => prev.filter((z) => z.id !== id));
    setSelectedZoneId((prev) => (prev === id ? zones.find((z) => z.id !== id)?.id || "" : prev));
    setToast({ type: "info", text: "Zone deleted (mock)." });
    pushLog("WARN", "Zone", `Deleted zone ${id} (mock).`);
    markDirty();
  }

  function addMethod() {
    if (!selectedZoneId) {
      setToast({ type: "error", text: "Select a zone first." });
      return;
    }
    const name = prompt("Method name")?.trim();
    if (!name) return;
    const m: ShippingMethod = {
      id: uid("method"),
      zoneId: selectedZoneId,
      name,
      description: "",
      status: "ACTIVE",
      carrier: "CUSTOM",
      etaMinDays: 2,
      etaMaxDays: 5,
      freeOver: null,
      processingDays: 1,
      rules: [{ id: uid("rule"), type: "FLAT", price: 0, note: "New rule" }],
    };
    setMethods((prev) => [m, ...prev]);
    setSelectedMethodId(m.id);
    setToast({ type: "success", text: "Method created (mock)." });
    pushLog("INFO", "Method", `Created method "${name}" (mock).`);
    markDirty();
  }

  function deleteMethod(id: string) {
    if (!confirm("Delete this method? (mock)")) return;
    setMethods((prev) => prev.filter((m) => m.id !== id));
    setSelectedMethodId((prev) => (prev === id ? methods.find((m) => m.id !== id)?.id || "" : prev));
    setToast({ type: "info", text: "Method deleted (mock)." });
    pushLog("WARN", "Method", `Deleted method ${id} (mock).`);
    markDirty();
  }

  function addRule(methodId: string) {
    const r: ShippingRule = { id: uid("rule"), type: "FLAT", price: 0, note: "" };
    setMethods((prev) => prev.map((m) => (m.id === methodId ? { ...m, rules: [r, ...m.rules] } : m)));
    markDirty();
    pushLog("INFO", "Rule", "Added rule (mock).");
  }

  function updateRule(methodId: string, ruleId: string, patch: Partial<ShippingRule>) {
    setMethods((prev) => prev.map((m) => (m.id === methodId ? { ...m, rules: m.rules.map((r) => (r.id === ruleId ? { ...r, ...patch } : r)) } : m)));
    markDirty();
  }

  function deleteRule(methodId: string, ruleId: string) {
    if (!confirm("Delete this rule? (mock)")) return;
    setMethods((prev) => prev.map((m) => (m.id === methodId ? { ...m, rules: m.rules.filter((r) => r.id !== ruleId) } : m)));
    markDirty();
    pushLog("WARN", "Rule", `Deleted rule ${ruleId} (mock).`);
  }

  function validate(): { ok: boolean; msg?: string } {
    if (zones.length === 0) return { ok: false, msg: "At least 1 zone is required." };
    for (const z of zones) {
      if (!z.name.trim()) return { ok: false, msg: "Zone name is required." };
      if (z.countries.length === 0) return { ok: false, msg: `Zone "${z.name}" needs at least 1 country.` };
    }
    for (const m of methods) {
      if (!m.name.trim()) return { ok: false, msg: "Method name is required." };
      if (!zones.some((z) => z.id === m.zoneId)) return { ok: false, msg: `Method "${m.name}" has invalid zone.` };
      if (m.etaMinDays <= 0 || m.etaMaxDays < m.etaMinDays) return { ok: false, msg: `Method "${m.name}" ETA is invalid.` };
      if (m.rules.length === 0) return { ok: false, msg: `Method "${m.name}" must have at least 1 rule.` };
      for (const r of m.rules) {
        if (r.price < 0) return { ok: false, msg: `Rule price must be >= 0 in "${m.name}".` };
        if (r.type !== "FLAT") {
          if (r.min == null || r.max == null) return { ok: false, msg: `Rule min/max required in "${m.name}".` };
          if (Number(r.min) > Number(r.max)) return { ok: false, msg: `Rule min must be <= max in "${m.name}".` };
        }
      }
    }
    return { ok: true };
  }

  function save() {
    const v = validate();
    if (!v.ok) {
      setToast({ type: "error", text: v.msg || "Invalid configuration." });
      pushLog("ERROR", "Save", v.msg || "Invalid configuration.");
      return;
    }
    setToast({ type: "success", text: "Shipping saved (mock)." });
    pushLog("INFO", "Save", "Shipping configuration saved (mock).");
    setDirty(false);
  }

  function reset() {
    setSettings(DEFAULT_SETTINGS);
    setToast({ type: "info", text: "Reset settings (not saved yet)." });
    markDirty();
    pushLog("WARN", "Reset", "Reset settings (mock).");
  }

  function matchZone(input: QuoteInput): ShippingZone | null {
    const candidates = zones
      .filter((z) => z.enabled)
      .filter((z) => z.countries.includes(input.country))
      .filter((z) => (z.regions.length ? z.regions.includes(input.region) : true))
      .filter((z) => {
        const pc = input.postalCode.trim();
        if (!z.postalCodes.length) return true;
        if (z.postalCodes.includes("*")) return true;
        return z.postalCodes.some((p) => {
          const pat = p.trim();
          if (pat.endsWith("*")) return pc.startsWith(pat.slice(0, -1));
          return pc === pat;
        });
      })
      .sort((a, b) => b.priority - a.priority);
    return candidates[0] || null;
  }

  function calcFeeForMethod(m: ShippingMethod, input: QuoteInput): { fee: number; reason: string } | null {
    if (m.status !== "ACTIVE") return null;

    // free shipping threshold
    if (m.freeOver != null && input.orderTotal >= m.freeOver) {
      return { fee: 0, reason: `Free over ${m.freeOver}` };
    }

    const weight = input.weightKg;
    const total = input.orderTotal;

    // apply first matching rule by order in list
    for (const r of m.rules) {
      if (r.type === "FLAT") return { fee: r.price, reason: r.note ? `Flat • ${r.note}` : "Flat" };
      if (r.type === "BY_WEIGHT") {
        const min = r.min ?? 0;
        const max = r.max ?? 999999;
        if (weight >= min && weight < max) return { fee: r.price, reason: r.note ? `Weight • ${r.note}` : `Weight ${min}-${max}` };
      }
      if (r.type === "BY_PRICE") {
        const min = r.min ?? 0;
        const max = r.max ?? 999999999;
        if (total >= min && total < max) return { fee: r.price, reason: r.note ? `Price • ${r.note}` : `Price ${min}-${max}` };
      }
    }
    return null;
  }

  async function runQuote() {
    setBusy(true);
    setToast(null);
    setQuoteResult(null);

    await new Promise((r) => setTimeout(r, 450));

    const z = matchZone(quoteInput);

    if (!z) {
      const fallback = settings.fallbackBehavior === "SHOW_MESSAGE";
      setQuoteResult({ options: [], fallback: true });
      setToast({
        type: fallback ? "info" : "error",
        text: fallback ? settings.fallbackMessage : "Checkout disabled: no matching zone (mock).",
      });
      pushLog("WARN", "Quote", "No matching zone (mock).");
      setBusy(false);
      return;
    }

    const zoneMethods = methods.filter((m) => m.zoneId === z.id);
    const options: Array<{ method: ShippingMethod; fee: number; reason: string }> = [];

    for (const m of zoneMethods) {
      const res = calcFeeForMethod(m, quoteInput);
      if (res) options.push({ method: m, fee: res.fee, reason: res.reason });
    }

    options.sort((a, b) => a.fee - b.fee);

    let picked: { methodId: string; fee: number } | undefined;
    if (settings.allowPickup) {
      // pickup is extra option in UI only; keep shipping options separate
    }
    if (settings.autoSelectCheapest && options.length) {
      picked = { methodId: options[0].method.id, fee: options[0].fee };
    }

    setQuoteResult({ matchedZone: z, options, picked });
    setToast({ type: "success", text: `Quote done (mock). ${options.length} option(s).` });
    pushLog("INFO", "Quote", `Quote matched zone "${z.name}" with ${options.length} option(s) (mock).`);
    setBusy(false);
  }

  const zoneSummary = useMemo(() => {
    const enabled = zones.filter((z) => z.enabled).length;
    const activeMethods = methods.filter((m) => m.status === "ACTIVE").length;
    return { enabled, totalZones: zones.length, activeMethods, totalMethods: methods.length };
  }, [zones, methods]);

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
              <i className="bi bi-truck" /> Shipping
            </span>
          </div>

          <div className={styles.titleRow}>
            <h1 className={styles.title}>Shipping</h1>
            <div className={styles.subtitle}>Zones, methods, rates, pickup and a quote tester for your lowcode storefront</div>
          </div>

          <div className={styles.kpis}>
            <Kpi icon="bi-map" label="Zones" value={`${zoneSummary.enabled}/${zoneSummary.totalZones} enabled`} />
            <Kpi icon="bi-truck" label="Methods" value={`${zoneSummary.activeMethods}/${zoneSummary.totalMethods} active`} />
            <Kpi icon="bi-lightning-charge" label="Auto cheapest" value={settings.autoSelectCheapest ? "On" : "Off"} />
            <Kpi icon="bi-shop" label="Pickup" value={settings.allowPickup ? "On" : "Off"} />
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.secondaryBtn} type="button" onClick={reset}>
            <i className="bi bi-arrow-counterclockwise" /> Reset
          </button>
          <button className={styles.secondaryBtn} type="button" onClick={() => setActiveTab("TEST")}>
            <i className="bi bi-calculator" /> Test quote
          </button>
          <button className={styles.primaryBtn} type="button" onClick={save} disabled={!dirty}>
            <i className="bi bi-cloud-check" /> Save
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === "ZONES" ? styles.tabActive : ""}`} onClick={() => setActiveTab("ZONES")} type="button">
          <i className="bi bi-map" /> Zones
        </button>
        <button className={`${styles.tab} ${activeTab === "METHODS" ? styles.tabActive : ""}`} onClick={() => setActiveTab("METHODS")} type="button">
          <i className="bi bi-truck" /> Methods
        </button>
        <button className={`${styles.tab} ${activeTab === "SETTINGS" ? styles.tabActive : ""}`} onClick={() => setActiveTab("SETTINGS")} type="button">
          <i className="bi bi-sliders" /> Settings
        </button>
        <button className={`${styles.tab} ${activeTab === "TEST" ? styles.tabActive : ""}`} onClick={() => setActiveTab("TEST")} type="button">
          <i className="bi bi-calculator" /> Test quote
        </button>
        <button className={`${styles.tab} ${activeTab === "LOGS" ? styles.tabActive : ""}`} onClick={() => setActiveTab("LOGS")} type="button">
          <i className="bi bi-journal-text" /> Logs
        </button>
      </div>

      <div className={styles.grid}>
        {/* Main */}
        <div className={styles.colMain}>
          {activeTab === "ZONES" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-map" /> Shipping zones
                  </div>
                  <div className={styles.cardHint}>Match address → zone → methods</div>
                </div>
                <div className={styles.headActions}>
                  <button className={styles.secondaryBtn} type="button" onClick={addZone}>
                    <i className="bi bi-plus-circle" /> Add zone
                  </button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.split}>
                  {/* Zone list */}
                  <div className={styles.list}>
                    {zones.map((z) => (
                      <button key={z.id} type="button" className={`${styles.listItem} ${z.id === selectedZoneId ? styles.listItemActive : ""}`} onClick={() => setSelectedZoneId(z.id)}>
                        <div className={styles.listTop}>
                          <div className={styles.listTitle}>
                            <i className="bi bi-geo-alt" /> {z.name}
                          </div>
                          <span className={`${styles.chip} ${z.enabled ? styles.chipOk : styles.chipMuted}`}>
                            <i className={`bi ${z.enabled ? "bi-check-circle" : "bi-pause-circle"}`} />
                            {z.enabled ? "Enabled" : "Disabled"}
                          </span>
                        </div>
                        <div className={styles.listSub}>
                          <span className={styles.subPill}>
                            <i className="bi bi-flag" /> {z.countries.map(countryName).join(", ")}
                          </span>
                          <span className={styles.subPill}>
                            <i className="bi bi-layers" /> Priority {z.priority}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Zone editor */}
                  <div className={styles.editor}>
                    {selectedZone ? (
                      <>
                        <div className={styles.editorHead}>
                          <div className={styles.editorTitle}>
                            <i className="bi bi-sliders" /> Edit zone
                          </div>
                          <div className={styles.editorActions}>
                            <button className={`${styles.secondaryBtn} ${styles.dangerBtn}`} type="button" onClick={() => deleteZone(selectedZone.id)}>
                              <i className="bi bi-trash3" /> Delete
                            </button>
                          </div>
                        </div>

                        <div className={styles.formGrid}>
                          <Field label="Name" hint="e.g. Vietnam / EU / US">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-type ${styles.inputIcon}`} />
                              <input className={styles.input} value={selectedZone.name} onChange={(e) => updateZone(selectedZone.id, { name: e.target.value })} />
                            </div>
                          </Field>

                          <Field label="Enabled" hint="Turn off to exclude this zone">
                            <Toggle checked={selectedZone.enabled} onChange={(v) => updateZone(selectedZone.id, { enabled: v })} labels={["Off", "On"]} />
                          </Field>

                          <Field label="Priority" hint="Higher wins when multiple match">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-layers ${styles.inputIcon}`} />
                              <input className={styles.input} type="number" value={selectedZone.priority} onChange={(e) => updateZone(selectedZone.id, { priority: Number(e.target.value || 0) })} />
                            </div>
                          </Field>

                          <Field label="Countries (ISO2)" hint="Comma separated e.g. VN,US,SG">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-flag ${styles.inputIcon}`} />
                              <input
                                className={styles.input}
                                value={selectedZone.countries.join(",")}
                                onChange={(e) =>
                                  updateZone(selectedZone.id, {
                                    countries: e.target.value
                                      .split(",")
                                      .map((x) => x.trim().toUpperCase())
                                      .filter(Boolean),
                                  })
                                }
                              />
                            </div>
                          </Field>

                          <Field label="Regions" hint="Optional state/province codes">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-map ${styles.inputIcon}`} />
                              <input
                                className={styles.input}
                                value={selectedZone.regions.join(",")}
                                onChange={(e) =>
                                  updateZone(selectedZone.id, {
                                    regions: e.target.value
                                      .split(",")
                                      .map((x) => x.trim())
                                      .filter(Boolean),
                                  })
                                }
                              />
                            </div>
                          </Field>

                          <Field label="Postal codes" hint='Supports wildcard "70*" or "*"'>
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-mailbox ${styles.inputIcon}`} />
                              <input
                                className={styles.input}
                                value={selectedZone.postalCodes.join(",")}
                                onChange={(e) =>
                                  updateZone(selectedZone.id, {
                                    postalCodes: e.target.value
                                      .split(",")
                                      .map((x) => x.trim())
                                      .filter(Boolean),
                                  })
                                }
                              />
                            </div>
                          </Field>
                        </div>

                        <div className={styles.noteCallout}>
                          <i className="bi bi-info-circle" />
                          <div>
                            <b>Low-code tip:</b> Zone matching là bước đầu: address → zone. Sau đó zone → methods → rules.
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className={styles.empty}>
                        <i className="bi bi-inbox" />
                        <div className={styles.emptyTitle}>Select a zone</div>
                        <div className={styles.emptyHint}>Choose a zone from the left to edit.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "METHODS" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-truck" /> Shipping methods
                  </div>
                  <div className={styles.cardHint}>Methods belong to a zone; each method has rules</div>
                </div>
                <div className={styles.headActions}>
                  <div className={styles.selectWrapSmall}>
                    <i className={`bi bi-map ${styles.selectIcon}`} />
                    <select className={styles.select} value={selectedZoneId} onChange={(e) => setSelectedZoneId(e.target.value)}>
                      {zones.map((z) => (
                        <option key={z.id} value={z.id}>
                          {z.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <button className={styles.secondaryBtn} type="button" onClick={addMethod}>
                    <i className="bi bi-plus-circle" /> Add method
                  </button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.split}>
                  {/* Method list */}
                  <div className={styles.list}>
                    {methodsInSelectedZone.length === 0 ? (
                      <div className={styles.empty}>
                        <i className="bi bi-inbox" />
                        <div className={styles.emptyTitle}>No methods</div>
                        <div className={styles.emptyHint}>Create a method for this zone.</div>
                      </div>
                    ) : (
                      methodsInSelectedZone.map((m) => {
                        const cm = carrierMeta(m.carrier);
                        return (
                          <button key={m.id} type="button" className={`${styles.listItem} ${m.id === selectedMethodId ? styles.listItemActive : ""}`} onClick={() => setSelectedMethodId(m.id)}>
                            <div className={styles.listTop}>
                              <div className={styles.listTitle}>
                                <i className={`bi ${cm.icon}`} /> {m.name}
                              </div>
                              <span className={`${styles.chip} ${m.status === "ACTIVE" ? styles.chipOk : styles.chipMuted}`}>
                                <i className={`bi ${m.status === "ACTIVE" ? "bi-check-circle" : "bi-pause-circle"}`} />
                                {m.status}
                              </span>
                            </div>
                            <div className={styles.listSub}>
                              <span className={styles.subPill}>
                                <i className="bi bi-clock" /> ETA {m.etaMinDays}-{m.etaMaxDays}d
                              </span>
                              <span className={styles.subPill}>
                                <i className="bi bi-list-ul" /> {m.rules.length} rule(s)
                              </span>
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>

                  {/* Method editor */}
                  <div className={styles.editor}>
                    {selectedMethod ? (
                      <>
                        <div className={styles.editorHead}>
                          <div className={styles.editorTitle}>
                            <i className="bi bi-sliders" /> Edit method
                          </div>
                          <div className={styles.editorActions}>
                            <button className={styles.secondaryBtn} type="button" onClick={() => addRule(selectedMethod.id)}>
                              <i className="bi bi-plus-lg" /> Add rule
                            </button>
                            <button className={`${styles.secondaryBtn} ${styles.dangerBtn}`} type="button" onClick={() => deleteMethod(selectedMethod.id)}>
                              <i className="bi bi-trash3" /> Delete
                            </button>
                          </div>
                        </div>

                        <div className={styles.formGrid}>
                          <Field label="Name" hint="Displayed at checkout">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-type ${styles.inputIcon}`} />
                              <input className={styles.input} value={selectedMethod.name} onChange={(e) => updateMethod(selectedMethod.id, { name: e.target.value })} />
                            </div>
                          </Field>

                          <Field label="Status" hint="Active methods appear at checkout">
                            <Toggle
                              checked={selectedMethod.status === "ACTIVE"}
                              onChange={(v) => updateMethod(selectedMethod.id, { status: v ? "ACTIVE" : "INACTIVE" })}
                              labels={["Inactive", "Active"]}
                            />
                          </Field>

                          <Field label="Carrier" hint="For grouping & integrations">
                            <div className={styles.selectWrap}>
                              <i className={`bi bi-truck ${styles.selectIcon}`} />
                              <select className={styles.select} value={selectedMethod.carrier} onChange={(e) => updateMethod(selectedMethod.id, { carrier: e.target.value as any })}>
                                {(["CUSTOM", "GHN", "GHTK", "DHL", "FEDEX", "UPS"] as const).map((c) => (
                                  <option key={c} value={c}>
                                    {carrierMeta(c).label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </Field>

                          <Field label="Description" hint="Optional">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-card-text ${styles.inputIcon}`} />
                              <input className={styles.input} value={selectedMethod.description} onChange={(e) => updateMethod(selectedMethod.id, { description: e.target.value })} />
                            </div>
                          </Field>

                          <Field label="ETA min (days)">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-clock ${styles.inputIcon}`} />
                              <input
                                className={styles.input}
                                type="number"
                                value={selectedMethod.etaMinDays}
                                onChange={(e) => updateMethod(selectedMethod.id, { etaMinDays: Math.max(1, Number(e.target.value || 1)) })}
                              />
                            </div>
                          </Field>

                          <Field label="ETA max (days)">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-clock-history ${styles.inputIcon}`} />
                              <input
                                className={styles.input}
                                type="number"
                                value={selectedMethod.etaMaxDays}
                                onChange={(e) => updateMethod(selectedMethod.id, { etaMaxDays: Math.max(1, Number(e.target.value || 1)) })}
                              />
                            </div>
                          </Field>

                          <Field label="Processing time (days)" hint="Before shipment">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-hourglass-split ${styles.inputIcon}`} />
                              <input
                                className={styles.input}
                                type="number"
                                value={selectedMethod.processingDays}
                                onChange={(e) => updateMethod(selectedMethod.id, { processingDays: Math.max(0, Number(e.target.value || 0)) })}
                              />
                            </div>
                          </Field>

                          <Field label="Free shipping over" hint="Leave empty to disable">
                            <div className={styles.inputWrap}>
                              <i className={`bi bi-gift ${styles.inputIcon}`} />
                              <input
                                className={styles.input}
                                type="number"
                                value={selectedMethod.freeOver ?? ""}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  updateMethod(selectedMethod.id, { freeOver: v === "" ? null : Math.max(0, Number(v)) });
                                }}
                              />
                            </div>
                          </Field>
                        </div>

                        <div className={styles.hr} />

                        <div className={styles.rulesHead}>
                          <div className={styles.rulesTitle}>
                            <i className="bi bi-list-ul" /> Rate rules
                          </div>
                          <div className={styles.rulesHint}>Rules are evaluated in order (top → bottom)</div>
                        </div>

                        <div className={styles.rules}>
                          {selectedMethod.rules.length === 0 ? (
                            <div className={styles.empty}>
                              <i className="bi bi-inbox" />
                              <div className={styles.emptyTitle}>No rules</div>
                              <div className={styles.emptyHint}>Add at least one rule.</div>
                            </div>
                          ) : (
                            selectedMethod.rules.map((r, idx) => {
                              const rt = rateTypeMeta(r.type);
                              return (
                                <div key={r.id} className={styles.ruleCard}>
                                  <div className={styles.ruleTop}>
                                    <div className={styles.ruleTitle}>
                                      <i className={`bi ${rt.icon}`} /> {rt.label} <span className={styles.ruleIndex}>#{idx + 1}</span>
                                    </div>
                                    <button className={`${styles.iconBtn} ${styles.dangerIconBtn}`} type="button" onClick={() => deleteRule(selectedMethod.id, r.id)} title="Delete rule">
                                      <i className="bi bi-trash3" />
                                    </button>
                                  </div>

                                  <div className={styles.ruleGrid}>
                                    <Field label="Type">
                                      <div className={styles.selectWrap}>
                                        <i className={`bi bi-sliders ${styles.selectIcon}`} />
                                        <select className={styles.select} value={r.type} onChange={(e) => updateRule(selectedMethod.id, r.id, { type: e.target.value as RateType })}>
                                          <option value="FLAT">Flat</option>
                                          <option value="BY_WEIGHT">By weight</option>
                                          <option value="BY_PRICE">By price</option>
                                        </select>
                                      </div>
                                    </Field>

                                    <Field label="Fee">
                                      <div className={styles.inputWrap}>
                                        <i className={`bi bi-cash-coin ${styles.inputIcon}`} />
                                        <input
                                          className={styles.input}
                                          type="number"
                                          value={r.price}
                                          onChange={(e) => updateRule(selectedMethod.id, r.id, { price: Math.max(0, Number(e.target.value || 0)) })}
                                        />
                                      </div>
                                    </Field>

                                    <Field label="Min" hint={r.type === "BY_WEIGHT" ? "kg" : r.type === "BY_PRICE" ? "order total" : "—"}>
                                      <div className={styles.inputWrap}>
                                        <i className={`bi bi-arrow-down ${styles.inputIcon}`} />
                                        <input
                                          className={styles.input}
                                          type="number"
                                          value={r.min ?? ""}
                                          disabled={r.type === "FLAT"}
                                          onChange={(e) => updateRule(selectedMethod.id, r.id, { min: e.target.value === "" ? undefined : Number(e.target.value) })}
                                        />
                                      </div>
                                    </Field>

                                    <Field label="Max" hint={r.type === "BY_WEIGHT" ? "kg" : r.type === "BY_PRICE" ? "order total" : "—"}>
                                      <div className={styles.inputWrap}>
                                        <i className={`bi bi-arrow-up ${styles.inputIcon}`} />
                                        <input
                                          className={styles.input}
                                          type="number"
                                          value={r.max ?? ""}
                                          disabled={r.type === "FLAT"}
                                          onChange={(e) => updateRule(selectedMethod.id, r.id, { max: e.target.value === "" ? undefined : Number(e.target.value) })}
                                        />
                                      </div>
                                    </Field>

                                    <Field label="Note" hint="Optional">
                                      <div className={styles.inputWrap}>
                                        <i className={`bi bi-chat-left-text ${styles.inputIcon}`} />
                                        <input className={styles.input} value={r.note ?? ""} onChange={(e) => updateRule(selectedMethod.id, r.id, { note: e.target.value })} />
                                      </div>
                                    </Field>
                                  </div>

                                  <div className={styles.ruleFoot}>
                                    <span className={styles.ruleHelp}>
                                      <i className="bi bi-info-circle" /> Flat ignores min/max. Others require min/max.
                                    </span>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        <div className={styles.noteCallout}>
                          <i className="bi bi-info-circle" />
                          <div>
                            <b>Low-code tip:</b> Rules nên được map vào component “Shipping selector” ở checkout. Nếu bạn muốn “first match wins” thì giữ thứ tự rules như UI này.
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className={styles.empty}>
                        <i className="bi bi-inbox" />
                        <div className={styles.emptyTitle}>Select a method</div>
                        <div className={styles.emptyHint}>Choose a method to edit its rules.</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "SETTINGS" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-sliders" /> Global shipping settings
                  </div>
                  <div className={styles.cardHint}>Units, fallback behavior, pickup, auto selection</div>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <Field label="Weight unit">
                    <div className={styles.selectWrap}>
                      <i className={`bi bi-speedometer2 ${styles.selectIcon}`} />
                      <select className={styles.select} value={settings.defaultWeightUnit} onChange={(e) => updateSettings("defaultWeightUnit", e.target.value as any)}>
                        <option value="kg">kg</option>
                        <option value="g">g</option>
                      </select>
                    </div>
                  </Field>

                  <Field label="Dimension unit">
                    <div className={styles.selectWrap}>
                      <i className={`bi bi-aspect-ratio ${styles.selectIcon}`} />
                      <select className={styles.select} value={settings.defaultDimUnit} onChange={(e) => updateSettings("defaultDimUnit", e.target.value as any)}>
                        <option value="cm">cm</option>
                        <option value="mm">mm</option>
                      </select>
                    </div>
                  </Field>

                  <Field label="Fallback behavior" hint="When no methods available">
                    <div className={styles.selectWrap}>
                      <i className={`bi bi-shield-exclamation ${styles.selectIcon}`} />
                      <select className={styles.select} value={settings.fallbackBehavior} onChange={(e) => updateSettings("fallbackBehavior", e.target.value as any)}>
                        <option value="SHOW_MESSAGE">Show message</option>
                        <option value="DISABLE_CHECKOUT">Disable checkout</option>
                      </select>
                    </div>
                  </Field>

                  <Field label="Fallback message" hint="Shown to customers">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-chat-left-text ${styles.inputIcon}`} />
                      <input className={styles.input} value={settings.fallbackMessage} onChange={(e) => updateSettings("fallbackMessage", e.target.value)} />
                    </div>
                  </Field>

                  <Field label="Auto select cheapest" hint="If multiple options">
                    <Toggle checked={settings.autoSelectCheapest} onChange={(v) => updateSettings("autoSelectCheapest", v)} labels={["Off", "On"]} />
                  </Field>

                  <Field label="Allow pickup" hint="Local pickup option">
                    <Toggle checked={settings.allowPickup} onChange={(v) => updateSettings("allowPickup", v)} labels={["Off", "On"]} />
                  </Field>

                  <Field label="Pickup label" hint="Shown at checkout">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-shop ${styles.inputIcon}`} />
                      <input className={styles.input} value={settings.pickupLabel} disabled={!settings.allowPickup} onChange={(e) => updateSettings("pickupLabel", e.target.value)} />
                    </div>
                  </Field>

                  <Field label="Pickup instructions" hint="Shown after order placed">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-info-circle ${styles.inputIcon}`} />
                      <input className={styles.input} value={settings.pickupInstructions} disabled={!settings.allowPickup} onChange={(e) => updateSettings("pickupInstructions", e.target.value)} />
                    </div>
                  </Field>
                </div>

                <div className={styles.noteCallout}>
                  <i className="bi bi-info-circle" />
                  <div>
                    <b>Low-code tip:</b> “Fallback behavior” rất quan trọng để tránh checkout bị kẹt khi user nhập địa chỉ ngoài zone.
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
                    <i className="bi bi-calculator" /> Test quote
                  </div>
                  <div className={styles.cardHint}>Simulate checkout shipping calculation (mock)</div>
                </div>
                <div className={styles.headActions}>
                  <button className={styles.primaryBtn} type="button" onClick={runQuote} disabled={busy}>
                    <i className={`bi ${busy ? "bi-hourglass-split" : "bi-play-circle"}`} /> {busy ? "Running..." : "Run quote"}
                  </button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <Field label="Country (ISO2)">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-flag ${styles.inputIcon}`} />
                      <input className={styles.input} value={quoteInput.country} onChange={(e) => setQuoteInput((s) => ({ ...s, country: e.target.value.toUpperCase() }))} />
                    </div>
                  </Field>

                  <Field label="Region/State">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-map ${styles.inputIcon}`} />
                      <input className={styles.input} value={quoteInput.region} onChange={(e) => setQuoteInput((s) => ({ ...s, region: e.target.value }))} />
                    </div>
                  </Field>

                  <Field label="Postal code">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-mailbox ${styles.inputIcon}`} />
                      <input className={styles.input} value={quoteInput.postalCode} onChange={(e) => setQuoteInput((s) => ({ ...s, postalCode: e.target.value }))} />
                    </div>
                  </Field>

                  <Field label="Order total">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-cash-coin ${styles.inputIcon}`} />
                      <input
                        className={styles.input}
                        type="number"
                        value={quoteInput.orderTotal}
                        onChange={(e) => setQuoteInput((s) => ({ ...s, orderTotal: Math.max(0, Number(e.target.value || 0)) }))}
                      />
                    </div>
                  </Field>

                  <Field label="Weight (kg)">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-speedometer2 ${styles.inputIcon}`} />
                      <input
                        className={styles.input}
                        type="number"
                        step="0.1"
                        value={quoteInput.weightKg}
                        onChange={(e) => setQuoteInput((s) => ({ ...s, weightKg: Math.max(0, Number(e.target.value || 0)) }))}
                      />
                    </div>
                  </Field>

                  <Field label="Preset">
                    <div className={styles.presetRow}>
                      <button className={styles.secondaryBtn} type="button" onClick={() => setQuoteInput({ country: "VN", region: "HCMC", postalCode: "700000", orderTotal: 850000, weightKg: 1.2 })}>
                        <i className="bi bi-pin-map" /> VN
                      </button>
                      <button className={styles.secondaryBtn} type="button" onClick={() => setQuoteInput({ country: "US", region: "CA", postalCode: "94105", orderTotal: 1500000, weightKg: 0.8 })}>
                        <i className="bi bi-globe-americas" /> US
                      </button>
                    </div>
                  </Field>
                </div>

                <div className={styles.hr} />

                <div className={styles.quoteBox}>
                  <div className={styles.quoteTitle}>
                    <i className="bi bi-receipt" /> Result
                  </div>

                  {!quoteResult ? (
                    <div className={styles.empty}>
                      <i className="bi bi-inbox" />
                      <div className={styles.emptyTitle}>No result</div>
                      <div className={styles.emptyHint}>Run quote to see matched zone and options.</div>
                    </div>
                  ) : quoteResult.fallback ? (
                    <div className={styles.fallback}>
                      <i className="bi bi-shield-exclamation" />
                      <div>
                        <div className={styles.fallbackTitle}>No matching zone</div>
                        <div className={styles.fallbackHint}>{settings.fallbackBehavior === "SHOW_MESSAGE" ? settings.fallbackMessage : "Checkout would be disabled (mock)."}</div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={styles.matchedRow}>
                        <span className={styles.matchedPill}>
                          <i className="bi bi-map" /> Zone: <b>{quoteResult.matchedZone?.name}</b>
                        </span>
                        {settings.allowPickup ? (
                          <span className={styles.matchedPill}>
                            <i className="bi bi-shop" /> Pickup: <b>{settings.pickupLabel}</b>
                          </span>
                        ) : null}
                        {quoteResult.picked ? (
                          <span className={styles.matchedPill}>
                            <i className="bi bi-check2-circle" /> Picked: <b>{quoteResult.picked.methodId}</b> ({quoteResult.picked.fee})
                          </span>
                        ) : null}
                      </div>

                      <div className={styles.optionTable}>
                        <div className={styles.optionHead}>
                          <div>Method</div>
                          <div>ETA</div>
                          <div>Fee</div>
                          <div>Reason</div>
                        </div>

                        {quoteResult.options.length === 0 ? (
                          <div className={styles.empty}>
                            <i className="bi bi-inbox" />
                            <div className={styles.emptyTitle}>No available methods</div>
                            <div className={styles.emptyHint}>All methods might be inactive or rules didn’t match.</div>
                          </div>
                        ) : (
                          quoteResult.options.map((o) => {
                            const cm = carrierMeta(o.method.carrier);
                            return (
                              <div key={o.method.id} className={styles.optionRow}>
                                <div className={styles.optionMethod}>
                                  <i className={`bi ${cm.icon}`} />
                                  <div>
                                    <div className={styles.optionName}>{o.method.name}</div>
                                    <div className={styles.optionSub}>{o.method.description || cm.label}</div>
                                  </div>
                                </div>
                                <div>
                                  {o.method.etaMinDays}-{o.method.etaMaxDays}d (+{o.method.processingDays}d)
                                </div>
                                <div className={styles.fee}>{o.fee}</div>
                                <div className={styles.reason}>{o.reason}</div>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "LOGS" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-journal-text" /> Logs
                  </div>
                  <div className={styles.cardHint}>Actions and warnings (mock)</div>
                </div>
                <div className={styles.headActions}>
                  <button className={styles.secondaryBtn} type="button" onClick={() => setToast({ type: "info", text: "Refresh logs (mock)." })}>
                    <i className="bi bi-arrow-clockwise" /> Refresh
                  </button>
                  <button
                    className={`${styles.secondaryBtn} ${styles.dangerBtn}`}
                    type="button"
                    onClick={() => {
                      setLogs([]);
                      setToast({ type: "info", text: "Logs cleared (mock)." });
                    }}>
                    <i className="bi bi-trash3" /> Clear
                  </button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.logs}>
                  {logs.length === 0 ? (
                    <div className={styles.empty}>
                      <i className="bi bi-inbox" />
                      <div className={styles.emptyTitle}>No logs</div>
                      <div className={styles.emptyHint}>Logs will appear when you change settings or run quotes.</div>
                    </div>
                  ) : (
                    logs.map((l) => (
                      <div key={l.id} className={styles.logRow}>
                        <span className={`${styles.level} ${styles["level_" + l.level]}`}>{l.level}</span>
                        <div className={styles.logMain}>
                          <div className={styles.logTop}>
                            <span className={styles.logAction}>{l.action}</span>
                            <span className={styles.logAt}>{fmtDateTime(l.at)}</span>
                          </div>
                          <div className={styles.logMsg}>{l.message}</div>
                        </div>
                      </div>
                    ))
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
                <i className="bi bi-compass" /> Overview
              </div>
              <span className={`${styles.chip} ${dirty ? styles.chipWarn : styles.chipOk}`}>
                <i className={`bi ${dirty ? "bi-dot" : "bi-check2-circle"}`} />
                {dirty ? "Unsaved" : "Saved"}
              </span>
            </div>

            <div className={styles.sideBody}>
              <MiniRow icon="bi-map" label="Enabled zones" value={`${zoneSummary.enabled}/${zoneSummary.totalZones}`} />
              <MiniRow icon="bi-truck" label="Active methods" value={`${zoneSummary.activeMethods}/${zoneSummary.totalMethods}`} />
              <MiniRow icon="bi-shop" label="Pickup" value={settings.allowPickup ? "Enabled" : "Disabled"} />
              <MiniRow icon="bi-shield-exclamation" label="Fallback" value={settings.fallbackBehavior === "SHOW_MESSAGE" ? "Message" : "Disable checkout"} />

              <div className={styles.hr} />

              <div className={styles.sideHint}>
                <i className="bi bi-info-circle" />
                <div>
                  <b>Best practice:</b> Zone priority giúp bạn “override” rule theo khu vực cụ thể (VD: HCMC ưu tiên hơn VN).
                </div>
              </div>

              <div className={styles.sideActions}>
                <button className={styles.secondaryBtn} type="button" onClick={() => setActiveTab("ZONES")}>
                  <i className="bi bi-map" /> Zones
                </button>
                <button className={styles.secondaryBtn} type="button" onClick={() => setActiveTab("METHODS")}>
                  <i className="bi bi-truck" /> Methods
                </button>
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

/* ---------------- small components ---------------- */

function Kpi({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className={styles.kpi}>
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
