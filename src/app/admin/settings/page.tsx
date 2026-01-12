"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/settings/page.module.css";

type ThemeMode = "light" | "dark" | "auto";
type FontSize = "sm" | "md" | "lg";
type Density = "comfortable" | "compact";
type Currency = "VND" | "USD";
type Language = "vi" | "en";
type Timezone = "Asia/Ho_Chi_Minh" | "UTC" | "Asia/Tokyo" | "Europe/London" | "America/Los_Angeles";

type Integrations = {
  google: boolean;
  email: boolean;
  payment: boolean;
};

type Security = {
  twoFA: boolean;
  sessionTimeoutMin: number; // 5..240
};

type Advanced = {
  maintenanceMode: boolean;
  debugMode: boolean;
};

type SettingsState = {
  // General
  siteName: string;
  language: Language;
  timezone: Timezone;
  currency: Currency;

  // Appearance
  theme: ThemeMode;
  accent: string; // hex
  fontSize: FontSize;
  radius: number; // 6..20

  // Content / Data
  pageSize: number; // 10..100
  defaultSort: "newest" | "oldest" | "name_asc" | "name_desc";
  showSku: boolean;
  showBarcode: boolean;

  // Behavior
  autoSave: boolean;
  confirmBeforeDelete: boolean;
  autoRefresh: boolean;
  notifyOnChange: boolean;
  density: Density;

  // Integrations
  integrations: Integrations;

  // Security
  security: Security;

  // Advanced
  advanced: Advanced;
};

const STORAGE_KEY = "admin_settings_v1";

const DEFAULTS: SettingsState = {
  siteName: "My Website",
  language: "vi",
  timezone: "Asia/Ho_Chi_Minh",
  currency: "VND",

  theme: "auto",
  accent: "#6f42c1",
  fontSize: "md",
  radius: 14,

  pageSize: 20,
  defaultSort: "newest",
  showSku: true,
  showBarcode: false,

  autoSave: true,
  confirmBeforeDelete: true,
  autoRefresh: false,
  notifyOnChange: true,
  density: "comfortable",

  integrations: { google: false, email: true, payment: false },

  security: { twoFA: false, sessionTimeoutMin: 30 },

  advanced: { maintenanceMode: false, debugMode: false },
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function safeParse<T>(raw: string | null): T | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function mergeDefaults(saved: Partial<SettingsState> | null): SettingsState {
  if (!saved) return DEFAULTS;
  return {
    ...DEFAULTS,
    ...saved,
    integrations: { ...DEFAULTS.integrations, ...(saved.integrations || {}) },
    security: { ...DEFAULTS.security, ...(saved.security || {}) },
    advanced: { ...DEFAULTS.advanced, ...(saved.advanced || {}) },
  };
}

function applyTheme(theme: ThemeMode) {
  // optional: bạn có thể đổi theo hệ thống của bạn
  // demo: gắn data-theme để CSS dùng
  const el = document.documentElement;
  el.setAttribute("data-theme", theme);
}

export default function SettingsPage() {
  const [state, setState] = useState<SettingsState>(DEFAULTS);
  const [loaded, setLoaded] = useState(false);

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const firstFieldRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const saved = safeParse<Partial<SettingsState>>(localStorage.getItem(STORAGE_KEY));
    const merged = mergeDefaults(saved);
    setState(merged);
    setLoaded(true);
    applyTheme(merged.theme);

    // focus vào field đầu cho UX
    setTimeout(() => firstFieldRef.current?.focus(), 0);
  }, []);

  // Live apply theme + density/font preview (demo)
  useEffect(() => {
    if (!loaded) return;
    applyTheme(state.theme);
  }, [state.theme, loaded]);

  const dirty = useMemo(() => {
    const raw = safeParse<Partial<SettingsState>>(localStorage.getItem(STORAGE_KEY));
    const merged = mergeDefaults(raw);
    return JSON.stringify(merged) !== JSON.stringify(state);
  }, [state]);

  function set<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function setNested(path: string[], value: any) {
    setState((s) => {
      const next: any = structuredClone(s);
      let cur = next;
      for (let i = 0; i < path.length - 1; i++) cur = cur[path[i]];
      cur[path[path.length - 1]] = value;
      return next as SettingsState;
    });
  }

  async function save() {
    setSaving(true);
    setToast(null);
    try {
      // simulate async (sau này thay bằng fetch API)
      await new Promise((r) => setTimeout(r, 250));

      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      setToast({ kind: "ok", text: "Saved settings successfully." });
    } catch (e: any) {
      setToast({ kind: "err", text: e?.message || "Failed to save." });
    } finally {
      setSaving(false);
      setTimeout(() => setToast(null), 2500);
    }
  }

  function reset() {
    setState(DEFAULTS);
    setToast({ kind: "ok", text: "Reset to defaults (not saved yet)." });
    setTimeout(() => setToast(null), 2500);
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "settings.json";
    a.click();
    URL.revokeObjectURL(url);
  }

  function clearStorage() {
    localStorage.removeItem(STORAGE_KEY);
    setToast({ kind: "ok", text: "Cleared saved settings from this browser." });
    setTimeout(() => setToast(null), 2500);
  }

  const previewVars = {
    ["--accent" as any]: state.accent,
    ["--radius" as any]: `${state.radius}px`,
    ["--fontScale" as any]: state.fontSize === "sm" ? "0.95" : state.fontSize === "lg" ? "1.05" : "1",
    ["--density" as any]: state.density === "compact" ? "0.85" : "1",
  };

  if (!loaded) return null;

  return (
    <div className={styles.page} style={previewVars}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.titleBlock}>
          <h1 className={styles.pageTitle}>Settings</h1>
          <p className={styles.pageSubtitle}>Configure your website preferences, integrations and security.</p>
        </div>

        <div className={styles.headerActions}>
          <button type="button" className={styles.btnGhost} onClick={reset} disabled={saving} title="Reset current form to defaults">
            <i className="bi bi-arrow-counterclockwise" />
            Reset
          </button>

          <button type="button" className={styles.btnPrimary} onClick={save} disabled={saving || !dirty} title={dirty ? "Save changes" : "No changes to save"}>
            {saving ? <i className="bi bi-hourglass-split" /> : <i className="bi bi-check2" />}
            Save changes
          </button>
        </div>
      </div>

      {toast ? (
        <div className={`${styles.toast} ${toast.kind === "ok" ? styles.toastOk : styles.toastErr}`} role="status">
          <i className={`bi ${toast.kind === "ok" ? "bi-check-circle" : "bi-exclamation-triangle"}`} />
          <span>{toast.text}</span>
        </div>
      ) : null}

      <div className={styles.grid}>
        {/* Left column */}
        <div className={styles.col}>
          {/* General */}
          <Section icon="bi-sliders" title="General" desc="Basics used across the website.">
            <Row label="Site name" hint="Displayed in header, emails, and browser title.">
              <input ref={firstFieldRef} className={styles.input} value={state.siteName} onChange={(e) => set("siteName", e.target.value)} placeholder="Your site name" />
            </Row>

            <Row label="Language">
              <select className={styles.select} value={state.language} onChange={(e) => set("language", e.target.value as any)}>
                <option value="vi">Vietnamese</option>
                <option value="en">English</option>
              </select>
            </Row>

            <Row label="Timezone">
              <select className={styles.select} value={state.timezone} onChange={(e) => set("timezone", e.target.value as any)}>
                <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
                <option value="UTC">UTC</option>
                <option value="Asia/Tokyo">Asia/Tokyo</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/Los_Angeles">America/Los_Angeles</option>
              </select>
            </Row>

            <Row label="Currency">
              <select className={styles.select} value={state.currency} onChange={(e) => set("currency", e.target.value as any)}>
                <option value="VND">VND</option>
                <option value="USD">USD</option>
              </select>
            </Row>
          </Section>

          {/* Appearance */}
          <Section icon="bi-palette2" title="Appearance" desc="Theme, colors and layout feel. Includes live preview.">
            <Row label="Theme mode">
              <div className={styles.segment}>
                <SegBtn active={state.theme === "light"} onClick={() => set("theme", "light")} icon="bi-sun">
                  Light
                </SegBtn>
                <SegBtn active={state.theme === "dark"} onClick={() => set("theme", "dark")} icon="bi-moon-stars">
                  Dark
                </SegBtn>
                <SegBtn active={state.theme === "auto"} onClick={() => set("theme", "auto")} icon="bi-circle-half">
                  Auto
                </SegBtn>
              </div>
            </Row>

            <Row label="Accent color" hint="Used for primary buttons, links, highlights.">
              <div className={styles.colorRow}>
                <input className={styles.color} type="color" value={state.accent} onChange={(e) => set("accent", e.target.value)} aria-label="Accent color" />
                <input className={styles.inputMono} value={state.accent} onChange={(e) => set("accent", e.target.value)} placeholder="#6f42c1" />
              </div>
            </Row>

            <Row label="Font size">
              <select className={styles.select} value={state.fontSize} onChange={(e) => set("fontSize", e.target.value as any)}>
                <option value="sm">Small</option>
                <option value="md">Default</option>
                <option value="lg">Large</option>
              </select>
            </Row>

            <Row label="Corner radius" hint="Controls how round cards/buttons are.">
              <div className={styles.rangeRow}>
                <input className={styles.range} type="range" min={6} max={20} value={state.radius} onChange={(e) => set("radius", clamp(Number(e.target.value), 6, 20))} />
                <span className={styles.pill}>{state.radius}px</span>
              </div>
            </Row>

            <div className={styles.previewCard} aria-label="Preview">
              <div className={styles.previewTop}>
                <div className={styles.previewDot} />
                <div className={styles.previewDot} />
                <div className={styles.previewDot} />
              </div>
              <div className={styles.previewBody}>
                <div className={styles.previewTitle}>Preview</div>
                <div className={styles.previewText}>Buttons, chips and cards will follow your current settings.</div>
                <div className={styles.previewActions}>
                  <button type="button" className={styles.btnPrimarySmall}>
                    <i className="bi bi-lightning-charge" /> Primary
                  </button>
                  <button type="button" className={styles.btnGhostSmall}>
                    <i className="bi bi-gear" /> Secondary
                  </button>
                </div>
              </div>
            </div>
          </Section>

          {/* Content / Data */}
          <Section icon="bi-database" title="Content & Data" desc="Defaults for listing and product fields.">
            <Row label="Items per page">
              <select className={styles.select} value={state.pageSize} onChange={(e) => set("pageSize", Number(e.target.value))}>
                {[10, 20, 30, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </Row>

            <Row label="Default sort">
              <select className={styles.select} value={state.defaultSort} onChange={(e) => set("defaultSort", e.target.value as any)}>
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="name_asc">Name A → Z</option>
                <option value="name_desc">Name Z → A</option>
              </select>
            </Row>

            <Row label="Show SKU">
              <Toggle checked={state.showSku} onChange={(v) => set("showSku", v)} />
            </Row>

            <Row label="Show Barcode">
              <Toggle checked={state.showBarcode} onChange={(v) => set("showBarcode", v)} />
            </Row>
          </Section>
        </div>

        {/* Right column */}
        <div className={styles.col}>
          {/* Behavior */}
          <Section icon="bi-magic" title="Behavior" desc="Make the app feel safe and fast for no-code users.">
            <Row label="Auto save" hint="Saves drafts automatically where supported.">
              <Toggle checked={state.autoSave} onChange={(v) => set("autoSave", v)} />
            </Row>

            <Row label="Confirm before delete">
              <Toggle checked={state.confirmBeforeDelete} onChange={(v) => set("confirmBeforeDelete", v)} />
            </Row>

            <Row label="Auto refresh">
              <Toggle checked={state.autoRefresh} onChange={(v) => set("autoRefresh", v)} />
            </Row>

            <Row label="Notify on changes" hint="Show in-app notifications for important events.">
              <Toggle checked={state.notifyOnChange} onChange={(v) => set("notifyOnChange", v)} />
            </Row>

            <Row label="Density" hint="Compact shows more rows; Comfortable is easier to read.">
              <div className={styles.segment}>
                <SegBtn active={state.density === "comfortable"} onClick={() => set("density", "comfortable")} icon="bi-arrows-expand">
                  Comfortable
                </SegBtn>
                <SegBtn active={state.density === "compact"} onClick={() => set("density", "compact")} icon="bi-arrows-angle-contract">
                  Compact
                </SegBtn>
              </div>
            </Row>
          </Section>

          {/* Integrations */}
          <Section icon="bi-plug" title="Integrations" desc="Connect services without exposing technical details.">
            <IntegrationRow
              title="Google"
              desc="Sign-in, Drive, Calendar or Gmail (depending on your app)."
              icon="bi-google"
              connected={state.integrations.google}
              onToggle={() => setNested(["integrations", "google"], !state.integrations.google)}
            />
            <IntegrationRow
              title="Email"
              desc="Send notifications and receipts via email provider."
              icon="bi-envelope"
              connected={state.integrations.email}
              onToggle={() => setNested(["integrations", "email"], !state.integrations.email)}
            />
            <IntegrationRow
              title="Payments"
              desc="Enable online payment methods for checkout."
              icon="bi-credit-card"
              connected={state.integrations.payment}
              onToggle={() => setNested(["integrations", "payment"], !state.integrations.payment)}
            />

            <div className={styles.note}>
              <i className="bi bi-info-circle" />
              <span>These toggles are UI-only for now. Wire them to OAuth/API later.</span>
            </div>
          </Section>

          {/* Security */}
          <Section icon="bi-shield-lock" title="Security" desc="Simple but effective security settings.">
            <Row label="Two-factor authentication (2FA)">
              <Toggle checked={state.security.twoFA} onChange={(v) => setNested(["security", "twoFA"], v)} />
            </Row>

            <Row label="Session timeout" hint="Auto sign-out after inactivity.">
              <div className={styles.rangeRow}>
                <input
                  className={styles.range}
                  type="range"
                  min={5}
                  max={240}
                  value={state.security.sessionTimeoutMin}
                  onChange={(e) => setNested(["security", "sessionTimeoutMin"], clamp(Number(e.target.value), 5, 240))}
                />
                <span className={styles.pill}>{state.security.sessionTimeoutMin} min</span>
              </div>
            </Row>

            <div className={styles.sessionList}>
              <div className={styles.sessionHead}>
                <div className={styles.sessionTitle}>Active sessions</div>
                <button type="button" className={styles.btnGhostSmall} onClick={() => setToast({ kind: "ok", text: "Demo: session list is UI-only." })}>
                  <i className="bi bi-arrow-repeat" /> Refresh
                </button>
              </div>

              <div className={styles.sessionItem}>
                <div className={styles.sessionLeft}>
                  <div className={styles.sessionDevice}>
                    <i className="bi bi-laptop" /> This device
                  </div>
                  <div className={styles.sessionMeta}>Ho Chi Minh City · Chrome</div>
                </div>
                <span className={styles.badgeOk}>Current</span>
              </div>

              <div className={styles.sessionItem}>
                <div className={styles.sessionLeft}>
                  <div className={styles.sessionDevice}>
                    <i className="bi bi-phone" /> Mobile
                  </div>
                  <div className={styles.sessionMeta}>Last seen: 2 days ago</div>
                </div>
                <button type="button" className={styles.btnDangerSmall} onClick={() => setToast({ kind: "ok", text: "Demo: revoked mobile session." })}>
                  <i className="bi bi-box-arrow-right" /> Revoke
                </button>
              </div>
            </div>
          </Section>

          {/* Advanced */}
          <details className={styles.advanced}>
            <summary className={styles.advancedSummary}>
              <div className={styles.advancedLeft}>
                <i className="bi bi-tools" />
                <div>
                  <div className={styles.advancedTitle}>Advanced</div>
                  <div className={styles.advancedDesc}>Developer options and maintenance tools.</div>
                </div>
              </div>
              <i className={`bi bi-chevron-down ${styles.chev}`} />
            </summary>

            <div className={styles.advancedBody}>
              <Row label="Maintenance mode" hint="Disable public access temporarily.">
                <Toggle checked={state.advanced.maintenanceMode} onChange={(v) => setNested(["advanced", "maintenanceMode"], v)} />
              </Row>

              <Row label="Debug mode" hint="Show extra logs and diagnostics (admin only).">
                <Toggle checked={state.advanced.debugMode} onChange={(v) => setNested(["advanced", "debugMode"], v)} />
              </Row>

              <div className={styles.advancedActions}>
                <button type="button" className={styles.btnGhost} onClick={exportJson}>
                  <i className="bi bi-download" /> Export JSON
                </button>
                <button type="button" className={styles.btnGhost} onClick={clearStorage}>
                  <i className="bi bi-trash3" /> Clear saved
                </button>
              </div>
            </div>
          </details>

          {/* Bottom actions (mobile friendly) */}
          <div className={styles.footerActions}>
            <button type="button" className={styles.btnGhost} onClick={reset} disabled={saving}>
              <i className="bi bi-arrow-counterclockwise" /> Reset
            </button>
            <button type="button" className={styles.btnPrimary} onClick={save} disabled={saving || !dirty}>
              {saving ? <i className="bi bi-hourglass-split" /> : <i className="bi bi-check2" />}
              Save changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- UI helpers -------------------- */

function Section(props: { icon: string; title: string; desc?: string; children: React.ReactNode }) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardIcon}>
          <i className={`bi ${props.icon}`} />
        </div>
        <div className={styles.cardHeadText}>
          <div className={styles.cardTitle}>{props.title}</div>
          {props.desc ? <div className={styles.cardDesc}>{props.desc}</div> : null}
        </div>
      </div>
      <div className={styles.cardBody}>{props.children}</div>
    </section>
  );
}

function Row(props: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className={styles.row}>
      <div className={styles.rowLeft}>
        <div className={styles.label}>{props.label}</div>
        {props.hint ? <div className={styles.hint}>{props.hint}</div> : null}
      </div>
      <div className={styles.rowRight}>{props.children}</div>
    </div>
  );
}

function Toggle(props: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" className={`${styles.toggle} ${props.checked ? styles.toggleOn : ""}`} aria-pressed={props.checked} onClick={() => props.onChange(!props.checked)}>
      <span className={styles.toggleKnob} />
    </button>
  );
}

function SegBtn(props: { active: boolean; icon: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" className={`${styles.segBtn} ${props.active ? styles.segBtnActive : ""}`} onClick={props.onClick}>
      <i className={`bi ${props.icon}`} />
      <span>{props.children}</span>
    </button>
  );
}

function IntegrationRow(props: { title: string; desc: string; icon: string; connected: boolean; onToggle: () => void }) {
  return (
    <div className={styles.integration}>
      <div className={styles.integrationLeft}>
        <div className={styles.integrationIcon}>
          <i className={`bi ${props.icon}`} />
        </div>
        <div>
          <div className={styles.integrationTitle}>{props.title}</div>
          <div className={styles.integrationDesc}>{props.desc}</div>
        </div>
      </div>
      <div className={styles.integrationRight}>
        <span className={props.connected ? styles.badgeOk : styles.badge}>{props.connected ? "Connected" : "Not connected"}</span>
        <button type="button" className={props.connected ? styles.btnGhostSmall : styles.btnPrimarySmall} onClick={props.onToggle}>
          <i className={`bi ${props.connected ? "bi-x-circle" : "bi-link-45deg"}`} />
          {props.connected ? "Disconnect" : "Connect"}
        </button>
      </div>
    </div>
  );
}
