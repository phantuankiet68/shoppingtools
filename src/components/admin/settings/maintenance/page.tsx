"use client";

import React, { useMemo, useState } from "react";
import styles from "@/styles/admin/settings/maintenance/maintenance.module.css";

type Toast = { type: "success" | "error" | "info"; text: string };

type WindowMode = "OFF" | "SCHEDULED" | "FORCED";
type Level = "INFO" | "WARN" | "ERROR";

type MaintenanceSettings = {
  enabled: boolean; // maintenance mode
  debugMode: boolean; // admin-only verbose

  windowMode: WindowMode;
  windowStartISO: string; // local ISO string (mock)
  windowEndISO: string;

  bannerEnabled: boolean;
  bannerText: string;
  bannerTone: "INFO" | "WARN" | "DANGER";

  messageTitle: string;
  messageBody: string;
  showEta: boolean;
  etaText: string;

  allowlistIPs: string[]; // supports CIDR (mock)
  allowlistPaths: string[]; // allow public access for paths
  adminBypass: boolean; // admin can always bypass

  blockCheckoutOnly: boolean; // if true: site works but checkout blocked
  returnStatusCode: 503 | 200; // 503 or 200

  contactEmail: string;
  contactPhone: string;

  auditEnabled: boolean;
};

type LogRow = {
  id: string;
  at: string;
  level: Level;
  action: string;
  message: string;
};

type TestAccessInput = {
  ip: string;
  path: string;
  isAdmin: boolean;
};

function uid(prefix: string) {
  return `${prefix}_${Math.floor(Math.random() * 1000000)}`;
}

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

function nowISO() {
  return new Date().toISOString().slice(0, 16); // "YYYY-MM-DDTHH:mm" for input[type=datetime-local] (mock)
}

function addHoursISO(hours: number) {
  const d = new Date();
  d.setHours(d.getHours() + hours);
  return d.toISOString().slice(0, 16);
}

function normalizeListText(value: string) {
  return value
    .split(/[\n,]/g)
    .map((x) => x.trim())
    .filter(Boolean);
}

function isIpAllowed(ip: string, allowlist: string[]) {
  // mock matching: exact match only + "*" allow all
  if (allowlist.includes("*")) return true;
  return allowlist.includes(ip.trim());
}

function isPathAllowed(path: string, allowlist: string[]) {
  // supports "*" and prefix wildcard "/api/*"
  const p = path.trim() || "/";
  if (allowlist.includes("*")) return true;
  return allowlist.some((rule) => {
    const r = rule.trim();
    if (!r) return false;
    if (r.endsWith("*")) return p.startsWith(r.slice(0, -1));
    return p === r;
  });
}

export default function MaintenancePage() {
  const [toast, setToast] = useState<Toast | null>(null);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "ACCESS" | "SCHEDULE" | "BANNER" | "LOGS" | "TEST">("OVERVIEW");

  const [state, setState] = useState<MaintenanceSettings>({
    enabled: false,
    debugMode: false,

    windowMode: "OFF",
    windowStartISO: nowISO(),
    windowEndISO: addHoursISO(2),

    bannerEnabled: true,
    bannerText: "We are performing scheduled maintenance. Some features may be unavailable.",
    bannerTone: "WARN",

    messageTitle: "We’ll be back soon",
    messageBody: "Our site is currently under maintenance to improve your experience. Please try again later.",
    showEta: true,
    etaText: "Expected back: today 23:00",

    allowlistIPs: ["127.0.0.1"],
    allowlistPaths: ["/status", "/health", "/api/*"],
    adminBypass: true,

    blockCheckoutOnly: false,
    returnStatusCode: 503,

    contactEmail: "support@example.com",
    contactPhone: "+84 000 000 000",

    auditEnabled: true,
  });

  const [logs, setLogs] = useState<LogRow[]>([
    { id: "l1", at: "2026-01-14T05:10:00Z", level: "INFO", action: "Load", message: "Maintenance settings loaded (mock)." },
    { id: "l2", at: "2026-01-14T05:12:00Z", level: "WARN", action: "Schedule", message: "No active maintenance window (mock)." },
  ]);

  const [testInput, setTestInput] = useState<TestAccessInput>({
    ip: "127.0.0.1",
    path: "/checkout",
    isAdmin: false,
  });

  const [testResult, setTestResult] = useState<null | { allowed: boolean; reason: string; statusCode: number }>(null);

  function markDirty() {
    setDirty(true);
  }

  function pushLog(level: Level, action: string, message: string) {
    setLogs((prev) => [{ id: uid("log"), at: new Date().toISOString(), level, action, message }, ...prev]);
  }

  function update<K extends keyof MaintenanceSettings>(key: K, value: MaintenanceSettings[K]) {
    setState((s) => ({ ...s, [key]: value }));
    markDirty();
  }

  function validate(): { ok: boolean; msg?: string } {
    if (state.windowMode !== "OFF") {
      if (!state.windowStartISO || !state.windowEndISO) return { ok: false, msg: "Window start/end are required." };
      if (state.windowEndISO <= state.windowStartISO) return { ok: false, msg: "Window end must be after start." };
    }
    if (!state.messageTitle.trim()) return { ok: false, msg: "Message title is required." };
    if (!state.messageBody.trim()) return { ok: false, msg: "Message body is required." };
    if (state.contactEmail && !state.contactEmail.includes("@")) return { ok: false, msg: "Contact email seems invalid." };
    return { ok: true };
  }

  function computeEffectiveEnabled(): { enabled: boolean; reason: string } {
    if (!state.enabled) return { enabled: false, reason: "Maintenance switch is OFF." };

    if (state.windowMode === "FORCED") return { enabled: true, reason: "Forced mode." };

    if (state.windowMode === "OFF") return { enabled: true, reason: "No schedule window required." };

    // scheduled
    const now = new Date();
    const start = new Date(state.windowStartISO);
    const end = new Date(state.windowEndISO);
    const inWindow = now >= start && now <= end;
    return { enabled: inWindow, reason: inWindow ? "Within schedule window." : "Outside schedule window." };
  }

  function save() {
    const v = validate();
    if (!v.ok) {
      setToast({ type: "error", text: v.msg || "Invalid maintenance configuration." });
      pushLog("ERROR", "Save", v.msg || "Invalid configuration (mock).");
      return;
    }
    setToast({ type: "success", text: "Maintenance saved (mock)." });
    pushLog("INFO", "Save", "Maintenance configuration saved (mock).");
    setDirty(false);
  }

  function reset() {
    setState((s) => ({
      ...s,
      enabled: false,
      debugMode: false,
      windowMode: "OFF",
      bannerEnabled: true,
      bannerTone: "WARN",
      blockCheckoutOnly: false,
      returnStatusCode: 503,
      auditEnabled: true,
    }));
    setToast({ type: "info", text: "Reset settings (not saved yet)." });
    pushLog("WARN", "Reset", "Reset settings (mock).");
    markDirty();
  }

  async function toggleMaintenanceQuick() {
    setBusy(true);
    setToast(null);
    await new Promise((r) => setTimeout(r, 350));

    update("enabled", !state.enabled);
    const newVal = !state.enabled;
    setToast({ type: "success", text: `Maintenance ${newVal ? "enabled" : "disabled"} (mock).` });
    pushLog("INFO", "Toggle", `Maintenance toggled to ${newVal ? "ON" : "OFF"} (mock).`);
    setBusy(false);
  }

  async function runTest() {
    setBusy(true);
    setToast(null);
    setTestResult(null);
    await new Promise((r) => setTimeout(r, 350));

    const eff = computeEffectiveEnabled();

    // If maintenance not effectively enabled -> allowed
    if (!eff.enabled) {
      const res = { allowed: true, reason: `Allowed: ${eff.reason}`, statusCode: 200 };
      setTestResult(res);
      pushLog("INFO", "Test", `Access allowed (maintenance not active). ${testInput.path} from ${testInput.ip} (mock).`);
      setBusy(false);
      return;
    }

    // Maintenance active. Decide allow/bypass.
    if (state.adminBypass && testInput.isAdmin) {
      const res = { allowed: true, reason: "Allowed: admin bypass.", statusCode: 200 };
      setTestResult(res);
      pushLog("INFO", "Test", `Access allowed (admin bypass). ${testInput.path} (mock).`);
      setBusy(false);
      return;
    }

    if (isIpAllowed(testInput.ip, state.allowlistIPs)) {
      const res = { allowed: true, reason: "Allowed: IP allowlisted.", statusCode: 200 };
      setTestResult(res);
      pushLog("INFO", "Test", `Access allowed (IP allowlist). ${testInput.ip} (mock).`);
      setBusy(false);
      return;
    }

    if (isPathAllowed(testInput.path, state.allowlistPaths)) {
      const res = { allowed: true, reason: "Allowed: path allowlisted.", statusCode: 200 };
      setTestResult(res);
      pushLog("INFO", "Test", `Access allowed (path allowlist). ${testInput.path} (mock).`);
      setBusy(false);
      return;
    }

    // Block logic
    if (state.blockCheckoutOnly) {
      const isCheckout = testInput.path.startsWith("/checkout") || testInput.path.startsWith("/cart");
      if (!isCheckout) {
        const res = { allowed: true, reason: "Allowed: only checkout is blocked.", statusCode: 200 };
        setTestResult(res);
        pushLog("INFO", "Test", `Access allowed (checkout-only). ${testInput.path} (mock).`);
        setBusy(false);
        return;
      }
    }

    const statusCode = state.returnStatusCode;
    const res = { allowed: false, reason: "Blocked: maintenance active.", statusCode };
    setTestResult(res);
    pushLog("WARN", "Test", `Access blocked. ${testInput.path} from ${testInput.ip} (mock).`);
    setBusy(false);
  }

  const effective = useMemo(() => computeEffectiveEnabled(), [state.enabled, state.windowMode, state.windowStartISO, state.windowEndISO]);

  const summary = useMemo(() => {
    const ipCount = state.allowlistIPs.length;
    const pathCount = state.allowlistPaths.length;
    return { ipCount, pathCount };
  }, [state.allowlistIPs, state.allowlistPaths]);

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
              <i className="bi bi-tools" /> Maintenance
            </span>
          </div>

          <div className={styles.titleRow}>
            <h1 className={styles.title}>Maintenance</h1>
            <div className={styles.subtitle}>Control downtime, access rules, banners and diagnostics for your lowcode storefront</div>
          </div>

          <div className={styles.kpis}>
            <Kpi icon="bi-toggle-on" label="Switch" value={state.enabled ? "ON" : "OFF"} tone={state.enabled ? "ok" : "muted"} />
            <Kpi icon="bi-clock" label="Effective" value={effective.enabled ? "ACTIVE" : "INACTIVE"} tone={effective.enabled ? "warn" : "ok"} />
            <Kpi icon="bi-bug" label="Debug" value={state.debugMode ? "ON" : "OFF"} tone={state.debugMode ? "warn" : "muted"} />
            <Kpi icon="bi-shield-check" label="Bypass" value={state.adminBypass ? "Admin" : "Off"} />
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.secondaryBtn} type="button" onClick={reset}>
            <i className="bi bi-arrow-counterclockwise" /> Reset
          </button>
          <button className={styles.secondaryBtn} type="button" onClick={() => setActiveTab("TEST")}>
            <i className="bi bi-shield-lock" /> Test access
          </button>
          <button className={styles.secondaryBtn} type="button" onClick={toggleMaintenanceQuick} disabled={busy}>
            <i className={`bi ${state.enabled ? "bi-toggle-off" : "bi-toggle-on"}`} /> Quick toggle
          </button>
          <button className={styles.primaryBtn} type="button" onClick={save} disabled={!dirty}>
            <i className="bi bi-cloud-check" /> Save
          </button>
        </div>
      </div>

      {/* Preview banner */}
      {state.bannerEnabled ? (
        <div className={`${styles.banner} ${styles["banner_" + state.bannerTone]}`}>
          <i className={`bi ${state.bannerTone === "INFO" ? "bi-info-circle" : state.bannerTone === "WARN" ? "bi-exclamation-triangle" : "bi-x-octagon"}`} />
          <div className={styles.bannerText}>
            <b>Banner preview:</b> {state.bannerText}
          </div>
          <span className={styles.bannerChip}>
            <i className="bi bi-eye" /> Preview
          </span>
        </div>
      ) : null}

      {/* Tabs */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${activeTab === "OVERVIEW" ? styles.tabActive : ""}`} onClick={() => setActiveTab("OVERVIEW")} type="button">
          <i className="bi bi-sliders" /> Overview
        </button>
        <button className={`${styles.tab} ${activeTab === "ACCESS" ? styles.tabActive : ""}`} onClick={() => setActiveTab("ACCESS")} type="button">
          <i className="bi bi-shield-check" /> Access
        </button>
        <button className={`${styles.tab} ${activeTab === "SCHEDULE" ? styles.tabActive : ""}`} onClick={() => setActiveTab("SCHEDULE")} type="button">
          <i className="bi bi-calendar-event" /> Schedule
        </button>
        <button className={`${styles.tab} ${activeTab === "BANNER" ? styles.tabActive : ""}`} onClick={() => setActiveTab("BANNER")} type="button">
          <i className="bi bi-megaphone" /> Banner & Page
        </button>
        <button className={`${styles.tab} ${activeTab === "TEST" ? styles.tabActive : ""}`} onClick={() => setActiveTab("TEST")} type="button">
          <i className="bi bi-shield-lock" /> Test
        </button>
        <button className={`${styles.tab} ${activeTab === "LOGS" ? styles.tabActive : ""}`} onClick={() => setActiveTab("LOGS")} type="button">
          <i className="bi bi-journal-text" /> Logs
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
                      <i className="bi bi-tools" /> Core controls
                    </div>
                    <div className={styles.cardHint}>Maintenance switch, debug mode and behavior</div>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <Field label="Maintenance mode" hint="Disable public access temporarily.">
                      <Toggle checked={state.enabled} onChange={(v) => update("enabled", v)} labels={["Off", "On"]} />
                    </Field>

                    <Field label="Debug mode" hint="Show extra logs and diagnostics (admin only).">
                      <Toggle checked={state.debugMode} onChange={(v) => update("debugMode", v)} labels={["Off", "On"]} />
                    </Field>

                    <Field label="Block checkout only" hint="Site stays up; only cart/checkout blocked">
                      <Toggle checked={state.blockCheckoutOnly} onChange={(v) => update("blockCheckoutOnly", v)} labels={["Off", "On"]} />
                    </Field>

                    <Field label="Return status code" hint="503 recommended for maintenance">
                      <div className={styles.selectWrap}>
                        <i className={`bi bi-code-slash ${styles.selectIcon}`} />
                        <select className={styles.select} value={state.returnStatusCode} onChange={(e) => update("returnStatusCode", Number(e.target.value) as any)}>
                          <option value={503}>503 Service Unavailable</option>
                          <option value={200}>200 OK (soft maintenance)</option>
                        </select>
                      </div>
                    </Field>

                    <Field label="Admin bypass" hint="Admins can access even during maintenance">
                      <Toggle checked={state.adminBypass} onChange={(v) => update("adminBypass", v)} labels={["Off", "On"]} />
                    </Field>

                    <Field label="Audit log enabled" hint="Record actions and tests (mock)">
                      <Toggle checked={state.auditEnabled} onChange={(v) => update("auditEnabled", v)} labels={["Off", "On"]} />
                    </Field>
                  </div>

                  <div className={styles.noteCallout}>
                    <i className="bi bi-info-circle" />
                    <div>
                      <b>Effective status:</b> {effective.enabled ? "Maintenance is ACTIVE" : "Maintenance is INACTIVE"} — {effective.reason}
                    </div>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div>
                    <div className={styles.cardTitle}>
                      <i className="bi bi-telephone" /> Contact
                    </div>
                    <div className={styles.cardHint}>Shown on maintenance page (optional)</div>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <Field label="Support email">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-envelope ${styles.inputIcon}`} />
                        <input className={styles.input} value={state.contactEmail} onChange={(e) => update("contactEmail", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Support phone">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-telephone ${styles.inputIcon}`} />
                        <input className={styles.input} value={state.contactPhone} onChange={(e) => update("contactPhone", e.target.value)} />
                      </div>
                    </Field>
                  </div>

                  <div className={styles.noteCallout}>
                    <i className="bi bi-lightbulb" />
                    <div>
                      <b>Low-code tip:</b> Bạn có thể render contact này vào “Maintenance page template” ở public site.
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "ACCESS" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-shield-check" /> Access rules
                  </div>
                  <div className={styles.cardHint}>Allowlist IPs and paths for health checks / APIs</div>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <Field label="Allowlist IPs" hint='One per line or comma. Supports "*" (mock exact match only).'>
                    <textarea className={styles.textarea} value={state.allowlistIPs.join("\n")} onChange={(e) => update("allowlistIPs", normalizeListText(e.target.value))} rows={6} />
                  </Field>

                  <Field label="Allowlist paths" hint='Examples: "/status", "/health", "/api/*", "*"'>
                    <textarea className={styles.textarea} value={state.allowlistPaths.join("\n")} onChange={(e) => update("allowlistPaths", normalizeListText(e.target.value))} rows={6} />
                  </Field>
                </div>

                <div className={styles.noteCallout}>
                  <i className="bi bi-info-circle" />
                  <div>
                    <b>Best practice:</b> Trong maintenance, bạn vẫn nên allow <code>/health</code>, <code>/status</code> để monitoring không bị fail.
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "SCHEDULE" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-calendar-event" /> Maintenance window
                  </div>
                  <div className={styles.cardHint}>Optional schedule to auto-enable during a time window</div>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <Field label="Window mode" hint="How schedule affects maintenance">
                    <div className={styles.selectWrap}>
                      <i className={`bi bi-clock ${styles.selectIcon}`} />
                      <select className={styles.select} value={state.windowMode} onChange={(e) => update("windowMode", e.target.value as any)}>
                        <option value="OFF">OFF (ignore window)</option>
                        <option value="SCHEDULED">SCHEDULED (active only in window)</option>
                        <option value="FORCED">FORCED (always active when switch ON)</option>
                      </select>
                    </div>
                  </Field>

                  <Field label="Window start" hint="Local time (mock)">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-play ${styles.inputIcon}`} />
                      <input
                        className={styles.input}
                        type="datetime-local"
                        value={state.windowStartISO}
                        disabled={state.windowMode === "OFF" || state.windowMode === "FORCED"}
                        onChange={(e) => update("windowStartISO", e.target.value)}
                      />
                    </div>
                  </Field>

                  <Field label="Window end" hint="Local time (mock)">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-stop ${styles.inputIcon}`} />
                      <input
                        className={styles.input}
                        type="datetime-local"
                        value={state.windowEndISO}
                        disabled={state.windowMode === "OFF" || state.windowMode === "FORCED"}
                        onChange={(e) => update("windowEndISO", e.target.value)}
                      />
                    </div>
                  </Field>

                  <Field label="Show ETA on page">
                    <Toggle checked={state.showEta} onChange={(v) => update("showEta", v)} labels={["Off", "On"]} />
                  </Field>

                  <Field label="ETA text" hint="Displayed to users">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-alarm ${styles.inputIcon}`} />
                      <input className={styles.input} value={state.etaText} disabled={!state.showEta} onChange={(e) => update("etaText", e.target.value)} />
                    </div>
                  </Field>
                </div>

                <div className={styles.noteCallout}>
                  <i className="bi bi-info-circle" />
                  <div>
                    <b>Logic:</b> Maintenance = switch ON + (OFF/FORCED) hoặc (SCHEDULED && now in window).
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "BANNER" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-megaphone" /> Banner & Maintenance page content
                  </div>
                  <div className={styles.cardHint}>Customer-facing messaging</div>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <Field label="Banner enabled">
                    <Toggle checked={state.bannerEnabled} onChange={(v) => update("bannerEnabled", v)} labels={["Off", "On"]} />
                  </Field>

                  <Field label="Banner tone">
                    <div className={styles.selectWrap}>
                      <i className={`bi bi-palette ${styles.selectIcon}`} />
                      <select className={styles.select} value={state.bannerTone} onChange={(e) => update("bannerTone", e.target.value as any)}>
                        <option value="INFO">INFO</option>
                        <option value="WARN">WARN</option>
                        <option value="DANGER">DANGER</option>
                      </select>
                    </div>
                  </Field>

                  <Field label="Banner text">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-megaphone ${styles.inputIcon}`} />
                      <input className={styles.input} value={state.bannerText} onChange={(e) => update("bannerText", e.target.value)} />
                    </div>
                  </Field>

                  <Field label="Page title">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-type ${styles.inputIcon}`} />
                      <input className={styles.input} value={state.messageTitle} onChange={(e) => update("messageTitle", e.target.value)} />
                    </div>
                  </Field>

                  <Field label="Page body" hint="Main message shown to users">
                    <textarea className={styles.textarea} value={state.messageBody} onChange={(e) => update("messageBody", e.target.value)} rows={6} />
                  </Field>
                </div>

                <div className={styles.noteCallout}>
                  <i className="bi bi-info-circle" />
                  <div>
                    <b>Low-code tip:</b> Bạn có thể lưu message này vào DB và render server-side ở route <code>/maintenance</code>.
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
                    <i className="bi bi-shield-lock" /> Test access
                  </div>
                  <div className={styles.cardHint}>Simulate request routing (mock)</div>
                </div>
                <div className={styles.headActions}>
                  <button className={styles.primaryBtn} type="button" onClick={runTest} disabled={busy}>
                    <i className={`bi ${busy ? "bi-hourglass-split" : "bi-play-circle"}`} /> {busy ? "Testing..." : "Run test"}
                  </button>
                </div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <Field label="IP">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-pc-display ${styles.inputIcon}`} />
                      <input className={styles.input} value={testInput.ip} onChange={(e) => setTestInput((s) => ({ ...s, ip: e.target.value }))} />
                    </div>
                  </Field>

                  <Field label="Path">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-link-45deg ${styles.inputIcon}`} />
                      <input className={styles.input} value={testInput.path} onChange={(e) => setTestInput((s) => ({ ...s, path: e.target.value }))} />
                    </div>
                  </Field>

                  <Field label="Is admin">
                    <Toggle checked={testInput.isAdmin} onChange={(v) => setTestInput((s) => ({ ...s, isAdmin: v }))} labels={["No", "Yes"]} />
                  </Field>

                  <Field label="Preset">
                    <div className={styles.presetRow}>
                      <button className={styles.secondaryBtn} type="button" onClick={() => setTestInput({ ip: "127.0.0.1", path: "/checkout", isAdmin: false })}>
                        <i className="bi bi-house-door" /> Local + checkout
                      </button>
                      <button className={styles.secondaryBtn} type="button" onClick={() => setTestInput({ ip: "8.8.8.8", path: "/health", isAdmin: false })}>
                        <i className="bi bi-heart-pulse" /> External + /health
                      </button>
                      <button className={styles.secondaryBtn} type="button" onClick={() => setTestInput({ ip: "8.8.8.8", path: "/admin", isAdmin: true })}>
                        <i className="bi bi-person-badge" /> Admin bypass
                      </button>
                    </div>
                  </Field>
                </div>

                <div className={styles.hr} />

                <div className={styles.resultBox}>
                  <div className={styles.resultTitle}>
                    <i className="bi bi-terminal" /> Result
                  </div>

                  {!testResult ? (
                    <div className={styles.empty}>
                      <i className="bi bi-inbox" />
                      <div className={styles.emptyTitle}>No result</div>
                      <div className={styles.emptyHint}>Run test to see whether access is allowed.</div>
                    </div>
                  ) : (
                    <div className={`${styles.resultRow} ${testResult.allowed ? styles.resultOk : styles.resultBad}`}>
                      <i className={`bi ${testResult.allowed ? "bi-check2-circle" : "bi-x-octagon"}`} />
                      <div>
                        <div className={styles.resultMain}>
                          {testResult.allowed ? "ALLOWED" : "BLOCKED"} <span className={styles.statusCode}>HTTP {testResult.statusCode}</span>
                        </div>
                        <div className={styles.resultSub}>{testResult.reason}</div>
                      </div>
                    </div>
                  )}
                </div>

                <div className={styles.noteCallout}>
                  <i className="bi bi-info-circle" />
                  <div>
                    <b>Tip:</b> Khi Maintenance active và <b>blockCheckoutOnly</b> bật, chỉ <code>/cart</code> & <code>/checkout</code> bị chặn (mock).
                  </div>
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
                  <div className={styles.cardHint}>Actions, tests and validation messages (mock)</div>
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
                      pushLog("WARN", "Logs", "Logs cleared (mock).");
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
                      <div className={styles.emptyHint}>Logs will appear when you test or save settings.</div>
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
              <MiniRow icon="bi-toggle-on" label="Maintenance" value={state.enabled ? "ON" : "OFF"} />
              <MiniRow icon="bi-clock" label="Effective" value={effective.enabled ? "ACTIVE" : "INACTIVE"} />
              <MiniRow icon="bi-shield-check" label="Allowlist IPs" value={`${summary.ipCount}`} />
              <MiniRow icon="bi-link-45deg" label="Allowlist paths" value={`${summary.pathCount}`} />

              <div className={styles.hr} />

              <div className={styles.sideHint}>
                <i className="bi bi-lightbulb" />
                <div>
                  <b>Recommended:</b> Bật <code>503</code> để CDN/search engine hiểu đây là downtime tạm thời.
                </div>
              </div>

              <div className={styles.sideActions}>
                <button className={styles.secondaryBtn} type="button" onClick={() => setActiveTab("ACCESS")}>
                  <i className="bi bi-shield-check" /> Access
                </button>
                <button className={styles.secondaryBtn} type="button" onClick={() => setActiveTab("SCHEDULE")}>
                  <i className="bi bi-calendar-event" /> Schedule
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

function Kpi({ icon, label, value, tone }: { icon: string; label: string; value: string; tone?: "ok" | "warn" | "muted" }) {
  return (
    <div className={`${styles.kpi} ${tone === "warn" ? styles.kpiWarn : tone === "muted" ? styles.kpiMuted : ""}`}>
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
