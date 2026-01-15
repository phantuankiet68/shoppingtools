"use client";

import React, { useMemo, useState } from "react";
import styles from "@/styles/admin/integrations/webhook/webhook.module.css";

type EndpointStatus = "ENABLED" | "DISABLED";
type DeliveryStatus = "SUCCESS" | "FAILED" | "RETRYING";

type WebhookEndpoint = {
  id: string;
  name: string;
  url: string;
  status: EndpointStatus;
  secret: string;
  signingAlgo: "HMAC-SHA256";
  createdAt: string;
  updatedAt: string;

  subscribedEvents: string[];
  maxRetries: number;
  timeoutMs: number;
  backoff: "FIXED" | "EXPONENTIAL";
};

type DeliveryLog = {
  id: string;
  at: string;
  endpointId: string;
  endpointName: string;
  eventType: string;
  attempt: number;
  status: DeliveryStatus;
  httpStatus?: number;
  durationMs?: number;
  message: string;
};

const EVENT_CATALOG = [
  { group: "Auth", events: ["auth.user.created", "auth.user.login", "auth.password.reset"] },
  { group: "Orders", events: ["order.created", "order.paid", "order.fulfilled", "order.cancelled"] },
  { group: "Payments", events: ["payment.succeeded", "payment.failed", "refund.created"] },
  { group: "Email", events: ["email.sent", "email.bounced", "email.complained"] },
  { group: "Storage", events: ["storage.file.uploaded", "storage.file.deleted"] },
];

const DEFAULT_ENDPOINTS: WebhookEndpoint[] = [
  {
    id: "wh_1",
    name: "Production listener",
    url: "https://example.com/webhooks",
    status: "ENABLED",
    secret: "whsec_****************",
    signingAlgo: "HMAC-SHA256",
    createdAt: "2026-01-10T03:10:00Z",
    updatedAt: "2026-01-12T08:22:00Z",
    subscribedEvents: ["order.created", "order.paid", "payment.succeeded"],
    maxRetries: 8,
    timeoutMs: 8000,
    backoff: "EXPONENTIAL",
  },
  {
    id: "wh_2",
    name: "Staging",
    url: "https://staging.example.com/webhooks",
    status: "DISABLED",
    secret: "whsec_****************",
    signingAlgo: "HMAC-SHA256",
    createdAt: "2026-01-08T11:40:00Z",
    updatedAt: "2026-01-08T11:40:00Z",
    subscribedEvents: ["order.created", "email.sent"],
    maxRetries: 3,
    timeoutMs: 6000,
    backoff: "FIXED",
  },
];

const DEFAULT_LOGS: DeliveryLog[] = [
  {
    id: "log_1",
    at: "2026-01-14T06:30:00Z",
    endpointId: "wh_1",
    endpointName: "Production listener",
    eventType: "payment.succeeded",
    attempt: 1,
    status: "SUCCESS",
    httpStatus: 200,
    durationMs: 183,
    message: "Delivered successfully (mock).",
  },
  {
    id: "log_2",
    at: "2026-01-12T09:10:00Z",
    endpointId: "wh_1",
    endpointName: "Production listener",
    eventType: "order.paid",
    attempt: 2,
    status: "RETRYING",
    httpStatus: 502,
    durationMs: 320,
    message: "Bad gateway, retry scheduled (mock).",
  },
  {
    id: "log_3",
    at: "2026-01-12T09:08:00Z",
    endpointId: "wh_2",
    endpointName: "Staging",
    eventType: "email.sent",
    attempt: 1,
    status: "FAILED",
    httpStatus: 404,
    durationMs: 110,
    message: "Endpoint not found (mock).",
  },
];

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

function maskSecret(s: string) {
  if (!s) return "";
  const v = s.trim();
  if (v.length <= 8) return "•".repeat(v.length);
  return `${v.slice(0, 4)}••••••••••${v.slice(-4)}`;
}

function isValidUrl(url: string) {
  try {
    const u = new URL(url);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

function deliveryChipMeta(s: DeliveryStatus) {
  if (s === "SUCCESS") return { cls: "chipOk", icon: "bi-check-circle", label: "Success" };
  if (s === "RETRYING") return { cls: "chipPending", icon: "bi-arrow-repeat", label: "Retrying" };
  return { cls: "chipErr", icon: "bi-x-circle", label: "Failed" };
}

export default function WebhooksPage() {
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>(DEFAULT_ENDPOINTS);
  const [logs, setLogs] = useState<DeliveryLog[]>(DEFAULT_LOGS);

  const [activeTab, setActiveTab] = useState<"ENDPOINTS" | "EVENTS" | "LOGS" | "SETTINGS">("ENDPOINTS");
  const [selectedId, setSelectedId] = useState<string>(DEFAULT_ENDPOINTS[0]?.id || "");

  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<WebhookEndpoint>(() => ({
    id: "wh_new",
    name: "",
    url: "",
    status: "ENABLED",
    secret: "whsec_****************",
    signingAlgo: "HMAC-SHA256",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    subscribedEvents: ["order.created"],
    maxRetries: 8,
    timeoutMs: 8000,
    backoff: "EXPONENTIAL",
  }));

  // Settings (global)
  const [globalEnabled, setGlobalEnabled] = useState(true);
  const [ratePerMinute, setRatePerMinute] = useState(600);
  const [maxQueue, setMaxQueue] = useState(20000);

  const selected = useMemo(() => endpoints.find((e) => e.id === selectedId) || endpoints[0], [endpoints, selectedId]);

  const kpis = useMemo(() => {
    const enabledCount = endpoints.filter((e) => e.status === "ENABLED").length;
    const total = endpoints.length;
    const last24 = logs.filter((l) => Date.now() - new Date(l.at).getTime() < 24 * 60 * 60 * 1000).length;
    const failures = logs.filter((l) => l.status === "FAILED").length;
    return { enabledCount, total, last24, failures };
  }, [endpoints, logs]);

  function openCreate() {
    setEditingId(null);
    setDraft({
      id: `wh_${Math.floor(Math.random() * 999999)}`,
      name: "",
      url: "",
      status: "ENABLED",
      secret: "whsec_****************",
      signingAlgo: "HMAC-SHA256",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      subscribedEvents: ["order.created"],
      maxRetries: 8,
      timeoutMs: 8000,
      backoff: "EXPONENTIAL",
    });
    setShowModal(true);
  }

  function openEdit(id: string) {
    const ep = endpoints.find((e) => e.id === id);
    if (!ep) return;
    setEditingId(id);
    setDraft({ ...ep, updatedAt: new Date().toISOString() });
    setShowModal(true);
  }

  function validateDraft(): { ok: boolean; msg?: string } {
    if (!draft.name.trim()) return { ok: false, msg: "Endpoint name is required." };
    if (!isValidUrl(draft.url)) return { ok: false, msg: "Endpoint URL is invalid." };
    if (draft.subscribedEvents.length === 0) return { ok: false, msg: "Select at least one event." };
    if (draft.timeoutMs < 1000 || draft.timeoutMs > 60000) return { ok: false, msg: "Timeout must be 1000–60000 ms." };
    if (draft.maxRetries < 0 || draft.maxRetries > 20) return { ok: false, msg: "Max retries must be 0–20." };
    return { ok: true };
  }

  function saveDraft() {
    const v = validateDraft();
    if (!v.ok) {
      setToast({ type: "error", text: v.msg || "Invalid endpoint." });
      return;
    }

    setEndpoints((prev) => {
      if (editingId) {
        return prev.map((e) => (e.id === editingId ? { ...draft, id: editingId, updatedAt: new Date().toISOString() } : e));
      }
      return [{ ...draft, updatedAt: new Date().toISOString() }, ...prev];
    });

    setSelectedId(editingId || draft.id);
    setShowModal(false);
    setToast({ type: "success", text: editingId ? "Endpoint updated (mock)." : "Endpoint created (mock)." });
  }

  function removeEndpoint(id: string) {
    if (!confirm("Remove this endpoint? (mock)")) return;
    setEndpoints((prev) => prev.filter((e) => e.id !== id));
    setSelectedId((prev) => (prev === id ? endpoints.find((e) => e.id !== id)?.id || "" : prev));
    setToast({ type: "info", text: "Endpoint removed (mock)." });
  }

  function toggleEndpoint(id: string) {
    setEndpoints((prev) => prev.map((e) => (e.id === id ? { ...e, status: e.status === "ENABLED" ? "DISABLED" : "ENABLED", updatedAt: new Date().toISOString() } : e)));
    setToast({ type: "info", text: "Endpoint toggled (mock)." });
  }

  async function sendTestEvent() {
    if (!selected) return;
    if (!globalEnabled) {
      setToast({ type: "error", text: "Webhooks are globally disabled." });
      return;
    }
    if (selected.status !== "ENABLED") {
      setToast({ type: "error", text: "Endpoint is disabled." });
      return;
    }
    setBusy(true);
    setToast(null);

    await new Promise((r) => setTimeout(r, 650));

    const ok = Math.random() > 0.25; // mock
    const newLog: DeliveryLog = {
      id: `log_${Math.floor(Math.random() * 999999)}`,
      at: new Date().toISOString(),
      endpointId: selected.id,
      endpointName: selected.name,
      eventType: selected.subscribedEvents[0] || "order.created",
      attempt: 1,
      status: ok ? "SUCCESS" : "FAILED",
      httpStatus: ok ? 200 : 500,
      durationMs: 120 + Math.floor(Math.random() * 300),
      message: ok ? "Delivered successfully (mock)." : "Server error (mock).",
    };
    setLogs((prev) => [newLog, ...prev]);
    setToast({ type: ok ? "success" : "error", text: ok ? "Test delivered (mock)." : "Test failed (mock)." });
    setBusy(false);
  }

  function rotateSecret(id: string) {
    setEndpoints((prev) => prev.map((e) => (e.id === id ? { ...e, secret: "whsec_" + Math.random().toString(36).slice(2, 10) + "****************", updatedAt: new Date().toISOString() } : e)));
    setToast({ type: "success", text: "Secret rotated (mock)." });
  }

  function clearLogs() {
    setLogs([]);
    setToast({ type: "info", text: "Logs cleared (mock)." });
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.breadcrumbs}>
            <span className={styles.crumb}>
              <i className="bi bi-gear" /> System
            </span>
            <i className={`bi bi-chevron-right ${styles.crumbSep}`} />
            <span className={styles.crumb}>
              <i className="bi bi-plug" /> Integrations
            </span>
            <i className={`bi bi-chevron-right ${styles.crumbSep}`} />
            <span className={styles.crumbActive}>
              <i className="bi bi-lightning-charge" /> Webhooks
            </span>
          </div>

          <div className={styles.titleRow}>
            <h1 className={styles.title}>Webhooks</h1>
            <span className={styles.subtitle}>Create endpoints, subscribe events, sign payloads, and monitor deliveries</span>
          </div>

          <div className={styles.kpis}>
            <Kpi icon="bi-activity" label="Enabled endpoints" value={`${kpis.enabledCount}/${kpis.total}`} />
            <Kpi icon="bi-clock-history" label="Deliveries (24h)" value={String(kpis.last24)} />
            <Kpi icon="bi-exclamation-triangle" label="Failures" value={String(kpis.failures)} tone="warn" />
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.secondaryBtn} type="button" onClick={() => setActiveTab("SETTINGS")}>
            <i className="bi bi-sliders" /> Global settings
          </button>

          <button className={styles.primaryBtn} type="button" onClick={openCreate}>
            <i className="bi bi-plus-lg" /> New endpoint
          </button>

          <button className={styles.primaryBtn} type="button" onClick={sendTestEvent} disabled={busy || !selected}>
            <i className={`bi ${busy ? "bi-hourglass-split" : "bi-send-check"}`} />
            {busy ? "Sending..." : "Send test"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button type="button" className={`${styles.tab} ${activeTab === "ENDPOINTS" ? styles.tabActive : ""}`} onClick={() => setActiveTab("ENDPOINTS")}>
          <i className="bi bi-hdd-network" /> Endpoints
        </button>
        <button type="button" className={`${styles.tab} ${activeTab === "EVENTS" ? styles.tabActive : ""}`} onClick={() => setActiveTab("EVENTS")}>
          <i className="bi bi-grid-3x3-gap" /> Events
        </button>
        <button type="button" className={`${styles.tab} ${activeTab === "LOGS" ? styles.tabActive : ""}`} onClick={() => setActiveTab("LOGS")}>
          <i className="bi bi-journal-text" /> Delivery logs
        </button>
        <button type="button" className={`${styles.tab} ${activeTab === "SETTINGS" ? styles.tabActive : ""}`} onClick={() => setActiveTab("SETTINGS")}>
          <i className="bi bi-gear-wide-connected" /> Settings
        </button>
      </div>

      <div className={styles.grid}>
        {/* Main */}
        <div className={styles.colMain}>
          {activeTab === "ENDPOINTS" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardTitle}>
                  <i className="bi bi-hdd-network" /> Endpoints
                </div>
                <div className={styles.cardHint}>Select an endpoint to view details, rotate secret, and test</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.endpointList}>
                  {endpoints.length === 0 ? (
                    <Empty icon="bi-hdd-network" title="No endpoints" hint="Create an endpoint to start receiving events." />
                  ) : (
                    endpoints.map((e) => (
                      <button key={e.id} type="button" className={`${styles.endpointRow} ${selected?.id === e.id ? styles.endpointActive : ""}`} onClick={() => setSelectedId(e.id)}>
                        <div className={styles.endpointLeft}>
                          <div className={styles.endpointName}>
                            <i className="bi bi-link-45deg" /> {e.name}
                          </div>
                          <div className={styles.endpointUrl}>{e.url}</div>
                          <div className={styles.endpointMeta}>
                            <span className={`${styles.chip} ${e.status === "ENABLED" ? styles.chipOk : styles.chipMuted}`}>
                              <i className={`bi ${e.status === "ENABLED" ? "bi-check-circle" : "bi-pause-circle"}`} />
                              {e.status}
                            </span>
                            <span className={styles.metaDot}>•</span>
                            <span className={styles.metaText}>{e.subscribedEvents.length} events</span>
                            <span className={styles.metaDot}>•</span>
                            <span className={styles.metaText}>Updated: {fmtDateTime(e.updatedAt)}</span>
                          </div>
                        </div>

                        <div className={styles.endpointRight}>
                          <button
                            className={styles.iconBtn}
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              toggleEndpoint(e.id);
                            }}
                            aria-label="Toggle">
                            <i className={`bi ${e.status === "ENABLED" ? "bi-toggle2-on" : "bi-toggle2-off"}`} />
                          </button>

                          <button
                            className={styles.iconBtn}
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              openEdit(e.id);
                            }}
                            aria-label="Edit">
                            <i className="bi bi-pencil-square" />
                          </button>

                          <button
                            className={`${styles.iconBtn} ${styles.dangerIconBtn}`}
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              removeEndpoint(e.id);
                            }}
                            aria-label="Remove">
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "EVENTS" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardTitle}>
                  <i className="bi bi-grid-3x3-gap" /> Event catalog
                </div>
                <div className={styles.cardHint}>These are the events your no-code system can emit</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.eventGrid}>
                  {EVENT_CATALOG.map((g) => (
                    <div key={g.group} className={styles.eventGroup}>
                      <div className={styles.eventGroupTitle}>
                        <i className="bi bi-folder2-open" /> {g.group}
                      </div>
                      <div className={styles.eventList}>
                        {g.events.map((ev) => (
                          <div key={ev} className={styles.eventItem}>
                            <code className={styles.code}>{ev}</code>
                            <button
                              type="button"
                              className={styles.smallBtn}
                              onClick={() => {
                                navigator.clipboard?.writeText(ev);
                                setToast({ type: "success", text: "Copied event name." });
                              }}>
                              <i className="bi bi-clipboard" /> Copy
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className={styles.noteCallout}>
                  <i className="bi bi-info-circle" />
                  <div>
                    <b>Low-code tip:</b> Bạn có thể cho users tự tạo “custom events” từ workflows (ví dụ: <code className={styles.codeInline}>workflow.completed</code>).
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "LOGS" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardTitle}>
                  <i className="bi bi-journal-text" /> Delivery logs
                </div>
                <div className={styles.cardHint}>Track attempts, duration, and HTTP status</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.logActions}>
                  <button className={styles.secondaryBtn} type="button" onClick={() => setToast({ type: "info", text: "Refresh logs (mock)." })}>
                    <i className="bi bi-arrow-clockwise" /> Refresh
                  </button>
                  <button className={`${styles.secondaryBtn} ${styles.dangerBtn}`} type="button" onClick={clearLogs}>
                    <i className="bi bi-trash3" /> Clear logs
                  </button>
                </div>

                <div className={styles.logs}>
                  {logs.length === 0 ? (
                    <Empty icon="bi-inbox" title="No logs" hint="Logs will appear when events are delivered." />
                  ) : (
                    logs.map((l) => {
                      const dm = deliveryChipMeta(l.status);
                      return (
                        <div key={l.id} className={styles.logRow}>
                          <span className={`${styles.chip} ${styles[dm.cls]}`}>
                            <i className={`bi ${dm.icon}`} /> {dm.label}
                          </span>

                          <div className={styles.logMain}>
                            <div className={styles.logTop}>
                              <div className={styles.logTitle}>
                                <b>{l.eventType}</b> → {l.endpointName}
                              </div>
                              <div className={styles.logAt}>{fmtDateTime(l.at)}</div>
                            </div>

                            <div className={styles.logMeta}>
                              <span className={styles.metaPill}>
                                <i className="bi bi-repeat" /> Attempt {l.attempt}
                              </span>
                              <span className={styles.metaPill}>
                                <i className="bi bi-braces" /> HTTP {l.httpStatus ?? "—"}
                              </span>
                              <span className={styles.metaPill}>
                                <i className="bi bi-stopwatch" /> {l.durationMs ? `${l.durationMs}ms` : "—"}
                              </span>
                            </div>

                            <div className={styles.logMsg}>{l.message}</div>
                          </div>

                          <button
                            className={styles.iconBtn}
                            type="button"
                            onClick={() => {
                              setToast({ type: "info", text: "Open log detail (mock)." });
                            }}
                            aria-label="Open detail">
                            <i className="bi bi-box-arrow-up-right" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "SETTINGS" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardTitle}>
                  <i className="bi bi-gear-wide-connected" /> Global settings
                </div>
                <div className={styles.cardHint}>Applies to all webhook endpoints</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.formGrid}>
                  <Field label="Enable webhooks globally" hint="Disable will stop all deliveries.">
                    <Toggle
                      checked={globalEnabled}
                      onChange={(v) => {
                        setGlobalEnabled(v);
                        setToast({ type: "info", text: v ? "Webhooks enabled." : "Webhooks disabled." });
                      }}
                      labels={["Off", "On"]}
                    />
                  </Field>

                  <Field label="Rate limit (per minute)" hint="Global throttle (mock).">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-speedometer2 ${styles.inputIcon}`} />
                      <input className={styles.input} type="number" value={ratePerMinute} onChange={(e) => setRatePerMinute(Math.max(0, Number(e.target.value || 0)))} />
                    </div>
                  </Field>

                  <Field label="Max queue size" hint="Stop enqueuing when queue is full (mock).">
                    <div className={styles.inputWrap}>
                      <i className={`bi bi-inboxes ${styles.inputIcon}`} />
                      <input className={styles.input} type="number" value={maxQueue} onChange={(e) => setMaxQueue(Math.max(0, Number(e.target.value || 0)))} />
                    </div>
                  </Field>
                </div>

                <div className={styles.noteCallout}>
                  <i className="bi bi-info-circle" />
                  <div>Best practice: lưu payload + response để replay. Trong low-code bạn có thể expose action “Replay delivery” cho admin.</div>
                </div>

                <div className={styles.inlineActions}>
                  <button className={styles.primaryBtn} type="button" onClick={() => setToast({ type: "success", text: "Saved global settings (mock)." })}>
                    <i className="bi bi-cloud-check" /> Save
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Side: Selected endpoint details */}
        <div className={styles.colSide}>
          <div className={styles.sideCard}>
            <div className={styles.sideHead}>
              <div className={styles.sideTitle}>
                <i className="bi bi-sliders2" /> Endpoint details
              </div>
              {selected ? (
                <span className={`${styles.chip} ${selected.status === "ENABLED" ? styles.chipOk : styles.chipMuted}`}>
                  <i className={`bi ${selected.status === "ENABLED" ? "bi-check-circle" : "bi-pause-circle"}`} />
                  {selected.status}
                </span>
              ) : null}
            </div>

            <div className={styles.sideBody}>
              {!selected ? (
                <Empty icon="bi-hdd-network" title="No selection" hint="Select an endpoint to see details." />
              ) : (
                <>
                  <MiniRow icon="bi-link-45deg" label="Name" value={selected.name} />
                  <MiniRow icon="bi-globe2" label="URL" value={selected.url} />
                  <MiniRow icon="bi-shield-lock" label="Secret" value={maskSecret(selected.secret)} mono />
                  <MiniRow icon="bi-shield-check" label="Signing" value={selected.signingAlgo} />
                  <MiniRow icon="bi-stopwatch" label="Timeout" value={`${selected.timeoutMs} ms`} />
                  <MiniRow icon="bi-repeat" label="Retries" value={`${selected.maxRetries} (${selected.backoff})`} />
                  <MiniRow icon="bi-clock-history" label="Updated" value={fmtDateTime(selected.updatedAt)} />

                  <div className={styles.hr} />

                  <div className={styles.sectionTitle}>
                    <i className="bi bi-bell" /> Subscribed events
                  </div>

                  <div className={styles.pills}>
                    {selected.subscribedEvents.map((ev) => (
                      <span key={ev} className={styles.pill}>
                        {ev}
                      </span>
                    ))}
                  </div>

                  <div className={styles.inlineActions}>
                    <button className={styles.secondaryBtn} type="button" onClick={() => openEdit(selected.id)}>
                      <i className="bi bi-pencil-square" /> Edit
                    </button>
                    <button className={styles.secondaryBtn} type="button" onClick={() => rotateSecret(selected.id)}>
                      <i className="bi bi-arrow-repeat" /> Rotate secret
                    </button>
                    <button className={styles.primaryBtn} type="button" onClick={sendTestEvent} disabled={busy}>
                      <i className={`bi ${busy ? "bi-hourglass-split" : "bi-send-check"}`} /> Send test
                    </button>
                  </div>
                </>
              )}
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
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal ? (
        <>
          <div className={styles.modalBackdrop} onClick={() => setShowModal(false)} />
          <div className={styles.modal} role="dialog" aria-modal="true">
            <div className={styles.modalHead}>
              <div className={styles.modalTitle}>
                <i className="bi bi-hdd-network" /> {editingId ? "Edit endpoint" : "New endpoint"}
              </div>
              <button className={styles.iconBtn} type="button" onClick={() => setShowModal(false)} aria-label="Close">
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formGrid}>
                <Field label="Name" hint="Internal label (e.g. Shopify, Zapier, CRM).">
                  <div className={styles.inputWrap}>
                    <i className={`bi bi-tag ${styles.inputIcon}`} />
                    <input className={styles.input} value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
                  </div>
                </Field>

                <Field label="Endpoint URL" hint="https://... (POST).">
                  <div className={styles.inputWrap}>
                    <i className={`bi bi-globe2 ${styles.inputIcon}`} />
                    <input className={styles.input} value={draft.url} onChange={(e) => setDraft((d) => ({ ...d, url: e.target.value }))} />
                  </div>
                </Field>

                <Field label="Enabled" hint="Disable will stop deliveries to this endpoint.">
                  <Toggle checked={draft.status === "ENABLED"} onChange={(v) => setDraft((d) => ({ ...d, status: v ? "ENABLED" : "DISABLED" }))} labels={["Off", "On"]} />
                </Field>

                <Field label="Backoff strategy" hint="Retry scheduling policy.">
                  <div className={styles.selectWrap}>
                    <i className={`bi bi-arrow-repeat ${styles.selectIcon}`} />
                    <select className={styles.select} value={draft.backoff} onChange={(e) => setDraft((d) => ({ ...d, backoff: e.target.value as any }))}>
                      <option value="EXPONENTIAL">Exponential</option>
                      <option value="FIXED">Fixed</option>
                    </select>
                  </div>
                </Field>

                <Field label="Max retries" hint="0–20">
                  <div className={styles.inputWrap}>
                    <i className={`bi bi-repeat ${styles.inputIcon}`} />
                    <input
                      className={styles.input}
                      type="number"
                      value={draft.maxRetries}
                      onChange={(e) => setDraft((d) => ({ ...d, maxRetries: Math.max(0, Math.min(20, Number(e.target.value || 0))) }))}
                    />
                  </div>
                </Field>

                <Field label="Timeout (ms)" hint="1000–60000">
                  <div className={styles.inputWrap}>
                    <i className={`bi bi-stopwatch ${styles.inputIcon}`} />
                    <input
                      className={styles.input}
                      type="number"
                      value={draft.timeoutMs}
                      onChange={(e) => setDraft((d) => ({ ...d, timeoutMs: Math.max(1000, Math.min(60000, Number(e.target.value || 0))) }))}
                    />
                  </div>
                </Field>
              </div>

              <div className={styles.hr} />

              <div className={styles.sectionTitle}>
                <i className="bi bi-bell" /> Subscribed events
              </div>

              <div className={styles.eventPicker}>
                {EVENT_CATALOG.flatMap((g) => g.events).map((ev) => {
                  const checked = draft.subscribedEvents.includes(ev);
                  return (
                    <button
                      key={ev}
                      type="button"
                      className={`${styles.pickItem} ${checked ? styles.pickItemOn : ""}`}
                      onClick={() =>
                        setDraft((d) => ({
                          ...d,
                          subscribedEvents: checked ? d.subscribedEvents.filter((x) => x !== ev) : [...d.subscribedEvents, ev],
                        }))
                      }>
                      <i className={`bi ${checked ? "bi-check-square" : "bi-square"}`} />
                      <span className={styles.pickText}>{ev}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className={styles.modalFoot}>
              <button className={styles.secondaryBtn} type="button" onClick={() => setShowModal(false)}>
                <i className="bi bi-x" /> Cancel
              </button>
              <button className={styles.primaryBtn} type="button" onClick={saveDraft}>
                <i className="bi bi-check2" /> Save
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ---------- components ---------- */

function Kpi({ icon, label, value, tone }: { icon: string; label: string; value: string; tone?: "warn" }) {
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

function MiniRow({ icon, label, value, mono }: { icon: string; label: string; value: string; mono?: boolean }) {
  return (
    <div className={styles.miniRow}>
      <i className={`bi ${icon} ${styles.miniIcon}`} />
      <div className={styles.miniLabel}>{label}</div>
      <div className={`${styles.miniValue} ${mono ? styles.mono : ""}`}>{value}</div>
    </div>
  );
}

function Empty({ icon, title, hint }: { icon: string; title: string; hint: string }) {
  return (
    <div className={styles.empty}>
      <i className={`bi ${icon}`} />
      <div className={styles.emptyTitle}>{title}</div>
      <div className={styles.emptyHint}>{hint}</div>
    </div>
  );
}
