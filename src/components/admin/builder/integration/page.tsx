"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/builder/integrations/integrations.module.css";

type IntegrationCategory = "all" | "payments" | "email" | "analytics" | "storage" | "ai" | "crm";

type IntegrationStatus = "disconnected" | "connected" | "error";

type IntegrationRow = {
  id: string;
  key: string; // "stripe", "paypal", "mailchimp"...
  name: string;
  category: Exclude<IntegrationCategory, "all">;
  description: string;
  icon: string; // bootstrap icon class
  status: IntegrationStatus;
  lastSyncAt?: string | null;
  config: {
    enabled: boolean;
    apiKey?: string;
    apiSecret?: string;
    webhookUrl?: string;
    region?: string;
    extra?: Record<string, any>;
  };
  logs: { at: string; level: "info" | "warn" | "error"; message: string }[];
};

function nowIso() {
  return new Date().toISOString();
}

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function maskKey(v?: string) {
  if (!v) return "";
  if (v.length <= 6) return "••••••";
  return v.slice(0, 3) + "••••••••" + v.slice(-3);
}

function statusMeta(s: IntegrationStatus) {
  switch (s) {
    case "connected":
      return { label: "Connected", icon: "bi-check2-circle", cls: "ok" as const };
    case "error":
      return { label: "Error", icon: "bi-exclamation-triangle", cls: "bad" as const };
    default:
      return { label: "Disconnected", icon: "bi-plug", cls: "off" as const };
  }
}

const CATS: { key: IntegrationCategory; label: string; icon: string }[] = [
  { key: "all", label: "All", icon: "bi-grid" },
  { key: "payments", label: "Payments", icon: "bi-credit-card" },
  { key: "email", label: "Email", icon: "bi-envelope" },
  { key: "analytics", label: "Analytics", icon: "bi-graph-up" },
  { key: "storage", label: "Storage", icon: "bi-hdd" },
  { key: "ai", label: "AI", icon: "bi-stars" },
  { key: "crm", label: "CRM", icon: "bi-people" },
];

const SEED: IntegrationRow[] = [
  {
    id: uid(),
    key: "stripe",
    name: "Stripe",
    category: "payments",
    description: "Accept card payments, subscriptions, webhooks.",
    icon: "bi-stripe", // NOTE: bootstrap icons không có bi-stripe; sẽ fallback nếu thiếu
    status: "disconnected",
    lastSyncAt: null,
    config: { enabled: false, apiKey: "", apiSecret: "", webhookUrl: "" },
    logs: [{ at: nowIso(), level: "info", message: "Integration created." }],
  },
  {
    id: uid(),
    key: "paypal",
    name: "PayPal",
    category: "payments",
    description: "Checkout & payments, capture and refunds.",
    icon: "bi-credit-card-2-front",
    status: "connected",
    lastSyncAt: nowIso(),
    config: { enabled: true, apiKey: "pk_live_xxx", apiSecret: "sk_live_xxx", webhookUrl: "https://example.com/webhooks/paypal" },
    logs: [
      { at: nowIso(), level: "info", message: "Webhook verified." },
      { at: nowIso(), level: "info", message: "Last sync succeeded." },
    ],
  },
  {
    id: uid(),
    key: "google-analytics",
    name: "Google Analytics",
    category: "analytics",
    description: "Track page views & events.",
    icon: "bi-bar-chart",
    status: "connected",
    lastSyncAt: nowIso(),
    config: { enabled: true, apiKey: "G-XXXXXXX", apiSecret: "", webhookUrl: "" },
    logs: [{ at: nowIso(), level: "info", message: "Measurement ID set." }],
  },
  {
    id: uid(),
    key: "postmark",
    name: "Postmark",
    category: "email",
    description: "Transactional email delivery.",
    icon: "bi-envelope-paper",
    status: "error",
    lastSyncAt: nowIso(),
    config: { enabled: true, apiKey: "server_token_xxx", apiSecret: "", webhookUrl: "" },
    logs: [{ at: nowIso(), level: "error", message: "Authentication failed (401)." }],
  },
  {
    id: uid(),
    key: "s3",
    name: "S3 Compatible Storage",
    category: "storage",
    description: "Store uploads on S3 / R2 / MinIO.",
    icon: "bi-cloud",
    status: "disconnected",
    lastSyncAt: null,
    config: { enabled: false, apiKey: "", apiSecret: "", region: "ap-southeast-1", extra: { bucket: "" } },
    logs: [{ at: nowIso(), level: "info", message: "Not configured." }],
  },
  {
    id: uid(),
    key: "openai",
    name: "AI (OpenAI)",
    category: "ai",
    description: "Generate content, embeddings, assistants.",
    icon: "bi-stars",
    status: "disconnected",
    lastSyncAt: null,
    config: { enabled: false, apiKey: "", apiSecret: "", extra: { model: "gpt-4.1-mini" } },
    logs: [{ at: nowIso(), level: "info", message: "Add an API key to enable." }],
  },
];

export default function IntegrationsPage() {
  const [items, setItems] = useState<IntegrationRow[]>(() => SEED.map((x) => JSON.parse(JSON.stringify(x))));
  const [cat, setCat] = useState<IntegrationCategory>("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>(() => items[0]?.id || "");

  const active = useMemo(() => items.find((x) => x.id === activeId) || null, [items, activeId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((x) => (cat === "all" ? true : x.category === cat))
      .filter((x) => (q ? (x.name + " " + x.description + " " + x.key).toLowerCase().includes(q) : true))
      .sort((a, b) => {
        const score = (s: IntegrationStatus) => (s === "connected" ? 2 : s === "error" ? 1 : 0);
        return score(b.status) - score(a.status);
      });
  }, [items, cat, query]);

  function select(id: string) {
    setActiveId(id);
  }

  function patchActive(patch: Partial<IntegrationRow>) {
    if (!active) return;
    setItems((prev) => prev.map((x) => (x.id === active.id ? { ...x, ...patch } : x)));
  }

  function patchActiveConfig(patch: Partial<IntegrationRow["config"]>) {
    if (!active) return;
    setItems((prev) => prev.map((x) => (x.id === active.id ? { ...x, config: { ...x.config, ...patch } } : x)));
  }

  function addLog(level: "info" | "warn" | "error", message: string) {
    if (!active) return;
    setItems((prev) => prev.map((x) => (x.id === active.id ? { ...x, logs: [{ at: nowIso(), level, message }, ...x.logs].slice(0, 12) } : x)));
  }

  function connect() {
    if (!active) return;

    // demo: fake validation
    const hasKey = !!active.config.apiKey?.trim();
    if (!hasKey) {
      patchActive({ status: "error" });
      addLog("error", "Missing API key.");
      return;
    }

    patchActive({
      status: "connected",
      lastSyncAt: nowIso(),
      config: { ...active.config, enabled: true },
    });
    addLog("info", "Connected successfully.");
  }

  function disconnect() {
    if (!active) return;
    patchActive({
      status: "disconnected",
      lastSyncAt: null,
      config: { ...active.config, enabled: false },
    });
    addLog("warn", "Disconnected.");
  }

  function testConnection() {
    if (!active) return;
    if (active.status !== "connected") {
      addLog("warn", "Not connected. Please connect first.");
      return;
    }
    addLog("info", "Test ping OK.");
    patchActive({ lastSyncAt: nowIso() });
  }

  function resetConfig() {
    if (!active) return;
    const ok = confirm("Reset config for this integration?");
    if (!ok) return;

    patchActive({
      status: "disconnected",
      lastSyncAt: null,
      config: { enabled: false, apiKey: "", apiSecret: "", webhookUrl: "", region: "", extra: {} },
    });
    addLog("info", "Config reset.");
  }

  return (
    <div className={styles.shell}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Integrations</div>
            <div className={styles.brandSub}>Connect services · Store config · Test · Logs</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.ghostBtn} type="button" onClick={testConnection} disabled={!active}>
            <i className="bi bi-activity" /> Test
          </button>
          <button className={styles.ghostBtn} type="button" onClick={resetConfig} disabled={!active}>
            <i className="bi bi-arrow-counterclockwise" /> Reset
          </button>
          {active?.status === "connected" ? (
            <button className={`${styles.primaryBtn} ${styles.dangerBtn}`} type="button" onClick={disconnect}>
              <i className="bi bi-plug" /> Disconnect
            </button>
          ) : (
            <button className={styles.primaryBtn} type="button" onClick={connect} disabled={!active}>
              <i className="bi bi-link-45deg" /> Connect
            </button>
          )}
        </div>
      </header>

      <div className={styles.body}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Categories</div>
            <div className={styles.sidebarHint}>Filter integrations by category</div>
          </div>

          <div className={styles.catList}>
            {CATS.map((c) => (
              <button key={c.key} type="button" className={`${styles.catBtn} ${cat === c.key ? styles.catActive : ""}`} onClick={() => setCat(c.key)}>
                <i className={`bi ${c.icon}`} />
                <span>{c.label}</span>
                {cat === c.key && <i className="bi bi-check2" />}
              </button>
            ))}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.tip}>
              <i className="bi bi-shield-check" />
              <span>
                API keys nên lưu dạng <span className={styles.mono}>encrypted</span> hoặc dùng secret store (env / KMS).
              </span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <i className="bi bi-search" />
              <input className={styles.search} placeholder="Search integrations..." value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>

          <div className={styles.content}>
            {/* Grid */}
            <section className={styles.grid}>
              {filtered.map((x) => {
                const st = statusMeta(x.status);
                const isActive = x.id === activeId;

                // bootstrap-icons không có icon brand như Stripe -> fallback
                const safeIcon = x.icon.startsWith("bi-") ? x.icon : "bi-plug";

                return (
                  <div key={x.id} className={`${styles.card} ${isActive ? styles.cardActive : ""}`} onClick={() => select(x.id)} role="button" tabIndex={0}>
                    <div className={styles.cardTop}>
                      <div className={styles.cardIcon}>
                        <i className={`bi ${safeIcon}`} />
                      </div>
                      <div className={`${styles.status} ${styles[st.cls]}`}>
                        <i className={`bi ${st.icon}`} /> {st.label}
                      </div>
                    </div>

                    <div className={styles.cardTitle}>{x.name}</div>
                    <div className={styles.cardDesc}>{x.description}</div>

                    <div className={styles.cardMeta}>
                      <span className={styles.badge}>
                        <i className="bi bi-folder2" /> {x.category}
                      </span>
                      <span className={styles.dot}>•</span>
                      <span className={styles.mono}>{x.key}</span>
                    </div>

                    <div className={styles.cardBottom}>
                      <span className={styles.muted}>
                        <i className="bi bi-clock" /> {x.lastSyncAt ? new Date(x.lastSyncAt).toLocaleString() : "Never synced"}
                      </span>
                      <i className="bi bi-chevron-right" />
                    </div>
                  </div>
                );
              })}
            </section>

            {/* Inspector */}
            <aside className={styles.inspector}>
              <div className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <div className={styles.panelTitle}>Inspector</div>
                    <div className={styles.panelSub}>Config · Webhook · Logs</div>
                  </div>
                </div>

                {!active ? (
                  <div className={styles.panelBody}>
                    <div className={styles.emptyInspector}>
                      <i className="bi bi-info-circle" />
                      <div>
                        <div className={styles.emptyTitle}>Select an integration</div>
                        <div className={styles.emptyText}>Click a card to edit its config.</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.panelBody}>
                    <div className={styles.headerRow}>
                      <div className={styles.headName}>
                        <div className={styles.headTitle}>{active.name}</div>
                        <div className={styles.headKey}>
                          <span className={styles.badge}>
                            <i className="bi bi-key" /> {maskKey(active.config.apiKey)}
                          </span>
                          <span className={styles.badge}>
                            <i className="bi bi-toggle2-on" /> {active.config.enabled ? "enabled" : "disabled"}
                          </span>
                        </div>
                      </div>

                      <button className={styles.iconBtn} type="button" title="Toggle enabled" onClick={() => patchActiveConfig({ enabled: !active.config.enabled })}>
                        <i className={`bi ${active.config.enabled ? "bi-toggle2-on" : "bi-toggle2-off"}`} />
                      </button>
                    </div>

                    <div className={styles.form}>
                      <label className={styles.label}>API Key</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-key" />
                        <input className={styles.input} value={active.config.apiKey ?? ""} onChange={(e) => patchActiveConfig({ apiKey: e.target.value })} placeholder="e.g. sk_live_..." />
                      </div>

                      <label className={styles.label}>API Secret (optional)</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-lock" />
                        <input className={styles.input} value={active.config.apiSecret ?? ""} onChange={(e) => patchActiveConfig({ apiSecret: e.target.value })} placeholder="••••••" />
                      </div>

                      <label className={styles.label}>Webhook URL (optional)</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-link-45deg" />
                        <input
                          className={styles.input}
                          value={active.config.webhookUrl ?? ""}
                          onChange={(e) => patchActiveConfig({ webhookUrl: e.target.value })}
                          placeholder="https://yourdomain.com/api/webhooks/..."
                        />
                      </div>

                      <label className={styles.label}>Region (storage integrations)</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-globe2" />
                        <input className={styles.input} value={active.config.region ?? ""} onChange={(e) => patchActiveConfig({ region: e.target.value })} placeholder="ap-southeast-1" />
                      </div>

                      <div className={styles.smallActions}>
                        <button className={styles.ghostBtn} type="button" onClick={testConnection}>
                          <i className="bi bi-activity" /> Test
                        </button>

                        {active.status === "connected" ? (
                          <button className={`${styles.ghostBtn} ${styles.dangerBtn}`} type="button" onClick={disconnect}>
                            <i className="bi bi-plug" /> Disconnect
                          </button>
                        ) : (
                          <button className={styles.primaryBtn} type="button" onClick={connect}>
                            <i className="bi bi-link-45deg" /> Connect
                          </button>
                        )}
                      </div>
                    </div>

                    <div className={styles.logs}>
                      <div className={styles.logsHeader}>
                        <div className={styles.logsTitle}>
                          <i className="bi bi-journal-text" /> Logs
                        </div>
                        <button className={styles.iconBtn} type="button" title="Add demo log" onClick={() => addLog("info", "Saved config.")}>
                          <i className="bi bi-plus-lg" />
                        </button>
                      </div>

                      <div className={styles.logList}>
                        {active.logs.length === 0 ? (
                          <div className={styles.logsEmpty}>No logs</div>
                        ) : (
                          active.logs.map((l, idx) => (
                            <div key={idx} className={styles.logRow}>
                              <span className={`${styles.level} ${styles[l.level]}`}>{l.level}</span>
                              <div className={styles.logMsg}>{l.message}</div>
                              <div className={styles.logAt}>{new Date(l.at).toLocaleString()}</div>
                            </div>
                          ))
                        )}
                      </div>

                      <div className={styles.tipInline}>
                        <i className="bi bi-lightbulb" />
                        <span>
                          Khi nối DB: lưu config vào <span className={styles.mono}>Integration.config</span> (Json) và status vào field riêng.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
