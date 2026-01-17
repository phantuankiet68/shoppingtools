"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/builder/integrations/integrations.module.css";

type IntegrationCategory = "all" | "payments" | "email" | "analytics" | "storage" | "ai" | "crm";
type IntegrationStatus = "disconnected" | "connected" | "error";
type LogLevel = "info" | "warn" | "error";

type IntegrationRow = {
  id: string;
  key: string;
  name: string;
  category: Exclude<IntegrationCategory, "all">;
  description?: string | null;

  // UI only
  icon?: string | null;

  enabled: boolean;
  status: IntegrationStatus;
  lastSyncAt?: string | null;

  // server config json (public settings only)
  config?: Record<string, any> | null;

  // flags (server)
  hasApiKey?: boolean;
  hasApiSecret?: boolean;
  webhookUrlSet?: boolean;
};

type IntegrationLog = {
  id?: string;
  createdAt?: string; // server
  at?: string; // fallback
  level: LogLevel;
  message: string;
};

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

// map key -> icon (bootstrap icons only)
const ICON_BY_KEY: Record<string, string> = {
  stripe: "bi-credit-card",
  paypal: "bi-credit-card-2-front",
  "google-analytics": "bi-bar-chart",
  postmark: "bi-envelope-paper",
  s3: "bi-cloud",
  openai: "bi-stars",
};

function iconFor(integration: IntegrationRow) {
  return ICON_BY_KEY[integration.key] || "bi-plug";
}

function toLocalTime(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export default function IntegrationsPage() {
  const [items, setItems] = useState<IntegrationRow[]>([]);
  const [cat, setCat] = useState<IntegrationCategory>("all");
  const [query, setQuery] = useState("");
  const [activeId, setActiveId] = useState<string>("");
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState({
    key: "",
    name: "",
    category: "payments" as Exclude<IntegrationCategory, "all">,
    description: "",
  });

  // form draft (local only, commit via Save)
  const [draft, setDraft] = useState({
    apiKey: "",
    apiSecret: "",
    webhookUrl: "",
    region: "",
    extraJson: "",
  });

  const [logs, setLogs] = useState<IntegrationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const toastTimer = useRef<any>(null);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }

  const active = useMemo(() => items.find((x) => x.id === activeId) || null, [items, activeId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items
      .filter((x) => (cat === "all" ? true : x.category === cat))
      .filter((x) => {
        if (!q) return true;
        return `${x.name} ${x.description ?? ""} ${x.key}`.toLowerCase().includes(q);
      })
      .sort((a, b) => {
        const score = (s: IntegrationStatus) => (s === "connected" ? 2 : s === "error" ? 1 : 0);
        return score(b.status) - score(a.status);
      });
  }, [items, cat, query]);

  async function loadList(selectFirst = false) {
    setLoading(true);
    try {
      const data = await jsonFetch<IntegrationRow[]>("/api/admin/integrations", { method: "GET" });
      const withIcons = data.map((x) => ({ ...x, icon: iconFor(x) }));
      setItems(withIcons);

      if (selectFirst) {
        const first = withIcons[0]?.id || "";
        setActiveId(first);
      } else {
        // giữ active nếu còn tồn tại
        if (activeId && !withIcons.some((x) => x.id === activeId)) {
          setActiveId(withIcons[0]?.id || "");
        }
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadLogs(id: string) {
    try {
      const data = await jsonFetch<any[]>(`/api/admin/integrations/${id}/logs`, { method: "GET" });
      const mapped: IntegrationLog[] = data.map((l) => ({
        id: l.id,
        createdAt: l.createdAt,
        at: l.at,
        level: l.level,
        message: l.message,
      }));
      setLogs(mapped);
    } catch {
      setLogs([]);
    }
  }
  async function createIntegration() {
    setBusy(true);
    try {
      const body = {
        key: createForm.key.trim(),
        name: createForm.name.trim(),
        category: createForm.category,
        description: createForm.description.trim() || null,
      };

      const created = await jsonFetch<any>("/api/admin/integrations", {
        method: "POST",
        body: JSON.stringify(body),
      });

      showToast("Created.");
      setCreateOpen(false);
      setCreateForm({ key: "", name: "", category: "payments", description: "" });

      await loadList(false);

      // auto select created
      if (created?.id) {
        setActiveId(created.id);
        setInspectorOpen(true);
        await loadLogs(created.id);
      }
    } catch (e: any) {
      showToast(e?.message || "Create failed");
    } finally {
      setBusy(false);
    }
  }

  // initial load
  useEffect(() => {
    loadList(true).catch((e) => showToast(String(e?.message || e)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when active changes: open draft from server config flags (never pull secrets)
  useEffect(() => {
    if (!active) return;

    // reset draft (secrets will be entered again if user wants)
    setDraft({
      apiKey: "",
      apiSecret: "",
      webhookUrl: "",
      region: String(active?.config?.region ?? ""),
      extraJson: active?.config?.extra ? JSON.stringify(active.config.extra, null, 2) : "",
    });

    loadLogs(active.id).catch(() => {});
  }, [active?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  function select(id: string) {
    setActiveId(id);
    setInspectorOpen(true);
  }

  function closeInspector() {
    setInspectorOpen(false);
  }

  function onKeyDownInspector(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape") closeInspector();
  }

  async function saveConfig() {
    if (!active) return;
    setBusy(true);
    try {
      // parse extra JSON if any
      let extra: any = undefined;
      const raw = draft.extraJson.trim();
      if (raw) {
        try {
          extra = JSON.parse(raw);
        } catch {
          throw new Error("Extra JSON is invalid.");
        }
      }

      const patchBody: any = {
        // store non-secret settings in config json
        config: {
          ...(active.config || {}),
          region: draft.region || "",
          extra: extra ?? active.config?.extra ?? {},
        },
      };

      // only send secrets if user typed something
      if (draft.apiKey.trim()) patchBody.apiKey = draft.apiKey.trim();
      if (draft.apiSecret.trim()) patchBody.apiSecret = draft.apiSecret.trim();
      if (draft.webhookUrl.trim()) patchBody.webhookUrl = draft.webhookUrl.trim();

      await jsonFetch(`/api/admin/integrations/${active.id}`, {
        method: "PATCH",
        body: JSON.stringify(patchBody),
      });

      showToast("Saved.");
      await loadList(false);
      await loadLogs(active.id);
      // clear typed secrets after save
      setDraft((d) => ({ ...d, apiKey: "", apiSecret: "" }));
    } catch (e: any) {
      showToast(e?.message || "Save failed");
    } finally {
      setBusy(false);
    }
  }

  async function connect() {
    if (!active) return;
    setBusy(true);
    try {
      await jsonFetch(`/api/admin/integrations/${active.id}/connect`, { method: "POST" });
      showToast("Connected.");
      await loadList(false);
      await loadLogs(active.id);
    } catch (e: any) {
      showToast(e?.message || "Connect failed");
      await loadList(false);
      await loadLogs(active.id);
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    if (!active) return;
    setBusy(true);
    try {
      await jsonFetch(`/api/admin/integrations/${active.id}/disconnect`, { method: "POST" });
      showToast("Disconnected.");
      await loadList(false);
      await loadLogs(active.id);
    } catch (e: any) {
      showToast(e?.message || "Disconnect failed");
    } finally {
      setBusy(false);
    }
  }

  async function testConnection() {
    if (!active) return;
    setBusy(true);
    try {
      await jsonFetch(`/api/admin/integrations/${active.id}/test`, { method: "POST" });
      showToast("Test OK.");
      await loadList(false);
      await loadLogs(active.id);
    } catch (e: any) {
      showToast(e?.message || "Test failed");
      await loadList(false);
      await loadLogs(active.id);
    } finally {
      setBusy(false);
    }
  }

  async function resetConfig() {
    if (!active) return;
    const ok = confirm("Reset config for this integration?");
    if (!ok) return;

    setBusy(true);
    try {
      await jsonFetch(`/api/admin/integrations/${active.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          config: {},
          clearApiKey: true,
          clearApiSecret: true,
          clearWebhookUrl: true,
          enabled: false,
        }),
      });

      showToast("Reset done.");
      await loadList(false);
      await loadLogs(active.id);
      setDraft({ apiKey: "", apiSecret: "", webhookUrl: "", region: "", extraJson: "" });
    } catch (e: any) {
      showToast(e?.message || "Reset failed");
    } finally {
      setBusy(false);
    }
  }

  const headerDisabled = !active || busy || loading;

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

        <section className={styles.sectionInline}>
          <div className={styles.searchWrap}>
            <i className="bi bi-search" />
            <input className={styles.search} placeholder={loading ? "Loading..." : "Search integrations..."} value={query} onChange={(e) => setQuery(e.target.value)} disabled={loading} />
          </div>
        </section>

        <div className={styles.topActions}>
          <button className={styles.ghostBtn} type="button" onClick={() => setCreateOpen(true)} disabled={busy || loading}>
            <i className="bi bi-plus-lg" /> Add
          </button>

          <button className={styles.ghostBtn} type="button" onClick={testConnection} disabled={headerDisabled}>
            <i className="bi bi-activity" /> Test
          </button>
          <button className={styles.ghostBtn} type="button" onClick={resetConfig} disabled={headerDisabled}>
            <i className="bi bi-arrow-counterclockwise" /> Reset
          </button>

          {active?.status === "connected" ? (
            <button className={`${styles.primaryBtn} ${styles.dangerBtn}`} type="button" onClick={disconnect} disabled={headerDisabled}>
              <i className="bi bi-plug" /> Disconnect
            </button>
          ) : (
            <button className={styles.primaryBtn} type="button" onClick={connect} disabled={headerDisabled}>
              <i className="bi bi-link-45deg" /> Connect
            </button>
          )}
        </div>
      </header>

      <div className={styles.page}>
        {/* Categories */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitle}>Categories</div>
            <div className={styles.sectionSub}>Filter integrations by category</div>
          </div>

          <div className={styles.catList}>
            {CATS.map((c) => (
              <button key={c.key} type="button" className={`${styles.catBtn} ${cat === c.key ? styles.catActive : ""}`} onClick={() => setCat(c.key)}>
                <span className={styles.catLeft}>
                  <i className={`bi ${c.icon}`} />
                  <span>{c.label}</span>
                </span>
                {cat === c.key && <i className={`bi bi-check2 ${styles.catCheck}`} />}
              </button>
            ))}
          </div>

          <div className={styles.sectionFooter}>
            <i className="bi bi-shield-check" />
            <span>
              API keys nên lưu dạng <span className={styles.mono}>encrypted</span> hoặc dùng secret store (env / KMS).
            </span>
          </div>
        </section>

        {/* Grid */}
        <section className={styles.content}>
          <div className={styles.gridWrap}>
            {loading ? (
              <div className={styles.loadingBox}>
                <i className="bi bi-arrow-repeat" />
                <span>Loading integrations...</span>
              </div>
            ) : filtered.length === 0 ? (
              <div className={styles.loadingBox}>
                <i className="bi bi-inbox" />
                <span>No integrations found.</span>
              </div>
            ) : (
              <div className={styles.grid}>
                {filtered.map((x) => {
                  const st = statusMeta(x.status);
                  const isActive = x.id === activeId;
                  const iconCls = x.icon?.startsWith("bi-") ? x.icon : "bi-plug";

                  return (
                    <div
                      key={x.id}
                      className={`${styles.card} ${isActive ? styles.cardActive : ""}`}
                      onClick={() => select(x.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") select(x.id);
                      }}
                      role="button"
                      tabIndex={0}>
                      <div className={styles.cardTop}>
                        <div className={styles.cardIcon}>
                          <i className={`bi ${iconCls}`} />
                        </div>

                        <div className={`${styles.status} ${styles[st.cls]}`}>
                          <i className={`bi ${st.icon}`} /> {st.label}
                        </div>
                      </div>

                      <div className={styles.cardTitle}>{x.name}</div>
                      <div className={styles.cardDesc}>{x.description || ""}</div>

                      <div className={styles.cardMeta}>
                        <span className={styles.badge}>
                          <i className="bi bi-folder2" /> {x.category}
                        </span>
                        <span className={styles.dot}>•</span>
                        <span className={styles.mono}>{x.key}</span>
                      </div>

                      <div className={styles.cardBottom}>
                        <span className={styles.muted}>
                          <i className="bi bi-clock" /> {x.lastSyncAt ? toLocalTime(x.lastSyncAt) : "Never synced"}
                        </span>
                        <i className="bi bi-chevron-right" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Toast */}
      {toast && <div className={styles.toast}>{toast}</div>}

      {/* Inspector Popup */}
      {inspectorOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeInspector();
          }}
          onKeyDown={onKeyDownInspector}
          tabIndex={-1}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.panelTitle}>Inspector</div>
                <div className={styles.panelSub}>Save config · Connect/Test · Logs</div>
              </div>

              <button className={styles.iconBtn} type="button" title="Close" onClick={closeInspector}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.modalBody}>
              {!active ? (
                <div className={styles.emptyInspector}>
                  <i className="bi bi-info-circle" />
                  <div>
                    <div className={styles.emptyTitle}>Select an integration</div>
                    <div className={styles.emptyText}>Click a card to edit its config.</div>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.headerRow}>
                    <div className={styles.headName}>
                      <div className={styles.headTitle}>{active.name}</div>

                      <div className={styles.headKey}>
                        <span className={styles.badge}>
                          <i className="bi bi-toggle2-on" /> {active.enabled ? "enabled" : "disabled"}
                        </span>
                        <span className={styles.badge}>
                          <i className="bi bi-key" /> {active.hasApiKey ? "API key: set" : "API key: not set"}
                        </span>
                      </div>
                    </div>

                    <button
                      className={styles.iconBtn}
                      type="button"
                      title="Toggle enabled"
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await jsonFetch(`/api/admin/integrations/${active.id}`, {
                            method: "PATCH",
                            body: JSON.stringify({ enabled: !active.enabled }),
                          });
                          await loadList(false);
                          showToast("Updated.");
                        } catch (e: any) {
                          showToast(e?.message || "Update failed");
                        } finally {
                          setBusy(false);
                        }
                      }}
                      disabled={busy}>
                      <i className={`bi ${active.enabled ? "bi-toggle2-on" : "bi-toggle2-off"}`} />
                    </button>
                  </div>

                  <div className={styles.form}>
                    <div className={styles.formTop}>
                      <div className={styles.formHint}>
                        <i className="bi bi-info-circle" />
                        <span>Secrets không được load lại từ server. Nếu muốn đổi, hãy nhập lại rồi Save.</span>
                      </div>
                      <button className={styles.primaryBtn} type="button" onClick={saveConfig} disabled={busy}>
                        <i className="bi bi-save2" /> Save
                      </button>
                    </div>

                    <label className={styles.label}>API Key (secret)</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-key" />
                      <input className={styles.input} value={draft.apiKey} onChange={(e) => setDraft((d) => ({ ...d, apiKey: e.target.value }))} placeholder="paste api key..." />
                    </div>

                    <label className={styles.label}>API Secret (secret)</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-lock" />
                      <input className={styles.input} value={draft.apiSecret} onChange={(e) => setDraft((d) => ({ ...d, apiSecret: e.target.value }))} placeholder="optional..." />
                    </div>

                    <label className={styles.label}>Webhook URL</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-link-45deg" />
                      <input
                        className={styles.input}
                        value={draft.webhookUrl}
                        onChange={(e) => setDraft((d) => ({ ...d, webhookUrl: e.target.value }))}
                        placeholder="https://yourdomain.com/api/webhooks/..."
                      />
                    </div>

                    <label className={styles.label}>Region (storage)</label>
                    <div className={styles.inputWrap}>
                      <i className="bi bi-globe2" />
                      <input className={styles.input} value={draft.region} onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))} placeholder="ap-southeast-1" />
                    </div>

                    <label className={styles.label}>Extra (JSON)</label>
                    <textarea
                      className={styles.textarea}
                      value={draft.extraJson}
                      onChange={(e) => setDraft((d) => ({ ...d, extraJson: e.target.value }))}
                      placeholder='{"bucket":"...","model":"..."}'
                    />

                    <div className={styles.smallActions}>
                      <button className={styles.ghostBtn} type="button" onClick={testConnection} disabled={busy}>
                        <i className="bi bi-activity" /> Test
                      </button>

                      {active.status === "connected" ? (
                        <button className={`${styles.ghostBtn} ${styles.dangerBtn}`} type="button" onClick={disconnect} disabled={busy}>
                          <i className="bi bi-plug" /> Disconnect
                        </button>
                      ) : (
                        <button className={styles.primaryBtn} type="button" onClick={connect} disabled={busy}>
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

                      <button className={styles.iconBtn} type="button" title="Refresh logs" onClick={() => active && loadLogs(active.id)} disabled={busy}>
                        <i className="bi bi-arrow-repeat" />
                      </button>
                    </div>

                    <div className={styles.logList}>
                      {logs.length === 0 ? (
                        <div className={styles.logsEmpty}>No logs</div>
                      ) : (
                        logs.map((l, idx) => {
                          const at = l.createdAt || l.at || "";
                          return (
                            <div key={l.id ?? idx} className={styles.logRow}>
                              <span className={`${styles.level} ${styles[l.level]}`}>{l.level}</span>
                              <div className={styles.logMsg}>{l.message}</div>
                              <div className={styles.logAt}>{at ? toLocalTime(at) : ""}</div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className={styles.tipInline}>
                      <i className="bi bi-lightbulb" />
                      <span>Tip: secrets sẽ không được trả về từ API. UI chỉ hiển thị trạng thái “set / not set”.</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
      {createOpen && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setCreateOpen(false);
          }}
          tabIndex={-1}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <div>
                <div className={styles.panelTitle}>Add Integration</div>
                <div className={styles.panelSub}>Create a new integration to test</div>
              </div>

              <button className={styles.iconBtn} type="button" title="Close" onClick={() => setCreateOpen(false)} disabled={busy}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.form}>
                <label className={styles.label}>Key (unique)</label>
                <div className={styles.inputWrap}>
                  <i className="bi bi-tag" />
                  <input className={styles.input} value={createForm.key} onChange={(e) => setCreateForm((s) => ({ ...s, key: e.target.value }))} placeholder="e.g. stripe, postmark, openai" />
                </div>

                <label className={styles.label}>Name</label>
                <div className={styles.inputWrap}>
                  <i className="bi bi-type" />
                  <input className={styles.input} value={createForm.name} onChange={(e) => setCreateForm((s) => ({ ...s, name: e.target.value }))} placeholder="Display name" />
                </div>

                <label className={styles.label}>Category</label>
                <div className={styles.inputWrap}>
                  <i className="bi bi-folder2" />
                  <select className={styles.select} value={createForm.category} onChange={(e) => setCreateForm((s) => ({ ...s, category: e.target.value as any }))}>
                    <option value="payments">payments</option>
                    <option value="email">email</option>
                    <option value="analytics">analytics</option>
                    <option value="storage">storage</option>
                    <option value="ai">ai</option>
                    <option value="crm">crm</option>
                  </select>
                </div>

                <label className={styles.label}>Description</label>
                <textarea
                  className={styles.textarea}
                  value={createForm.description}
                  onChange={(e) => setCreateForm((s) => ({ ...s, description: e.target.value }))}
                  placeholder="Short description..."
                />

                <div className={styles.smallActions}>
                  <button className={styles.ghostBtn} type="button" onClick={() => setCreateOpen(false)} disabled={busy}>
                    Cancel
                  </button>
                  <button className={styles.primaryBtn} type="button" onClick={createIntegration} disabled={busy}>
                    <i className="bi bi-plus-lg" /> Create
                  </button>
                </div>

                <div className={styles.tipInline}>
                  <i className="bi bi-lightbulb" />
                  <span>
                    Key nên dùng <span className={styles.mono}>a-z, 0-9, -</span> và phải unique.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
