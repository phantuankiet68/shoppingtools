"use client";

import React, { useMemo, useState } from "react";
import styles from "@/styles/admin/integrations/payment/payment.module.css";

type ProviderKey = "STRIPE" | "PAYPAL" | "MANUAL";

type ProviderStatus = "DISCONNECTED" | "CONNECTED" | "ERROR";

type PaymentSettings = {
  provider: ProviderKey;
  status: ProviderStatus;

  // Common
  currency: string; // ISO, e.g. USD, VND
  captureMode: "AUTOMATIC" | "MANUAL";
  enable3DS: boolean;
  testMode: boolean;

  // Stripe
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;

  // PayPal
  paypalClientId: string;
  paypalClientSecret: string;
  paypalWebhookId: string;

  // Manual
  manualInstructions: string;
};

type LogRow = {
  id: string;
  at: string; // ISO
  level: "INFO" | "WARN" | "ERROR";
  action: string;
  message: string;
};

const defaultSettings: PaymentSettings = {
  provider: "STRIPE",
  status: "DISCONNECTED",

  currency: "USD",
  captureMode: "AUTOMATIC",
  enable3DS: true,
  testMode: true,

  stripePublishableKey: "pk_test_****************",
  stripeSecretKey: "sk_test_****************",
  stripeWebhookSecret: "whsec_****************",

  paypalClientId: "",
  paypalClientSecret: "",
  paypalWebhookId: "",

  manualInstructions: "Please transfer to bank account XXXX-XXXX and include your order ID in the notes.",
};

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

function badgeMeta(status: ProviderStatus) {
  if (status === "CONNECTED") return { cls: "badgeOk", icon: "bi-check-circle", label: "Connected" };
  if (status === "ERROR") return { cls: "badgeErr", icon: "bi-exclamation-triangle", label: "Error" };
  return { cls: "badgeOff", icon: "bi-plug", label: "Disconnected" };
}

function providerMeta(p: ProviderKey) {
  if (p === "STRIPE") return { title: "Stripe", icon: "bi-credit-card-2-front", hint: "Cards, wallets, subscriptions" };
  if (p === "PAYPAL") return { title: "PayPal", icon: "bi-paypal", hint: "PayPal checkout & cards" };
  return { title: "Manual", icon: "bi-receipt", hint: "Bank transfer / COD / custom" };
}

function maskSecret(s: string) {
  if (!s) return "";
  const clean = s.trim();
  if (clean.length <= 8) return "•".repeat(clean.length);
  return `${clean.slice(0, 4)}••••••••••${clean.slice(-4)}`;
}

export default function PaymentPage() {
  const [settings, setSettings] = useState<PaymentSettings>(defaultSettings);
  const [dirty, setDirty] = useState(false);

  const [activeTab, setActiveTab] = useState<"CONFIG" | "WEBHOOKS" | "LOGS">("CONFIG");

  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const [showSecrets, setShowSecrets] = useState(false);

  const [logs, setLogs] = useState<LogRow[]>([
    {
      id: "log_1",
      at: "2026-01-14T06:18:00Z",
      level: "INFO",
      action: "Health check",
      message: "Payment integration page loaded (mock).",
    },
    {
      id: "log_2",
      at: "2026-01-12T09:05:00Z",
      level: "WARN",
      action: "Webhook",
      message: "No webhook events received in the last 48h (mock).",
    },
  ]);

  // Mock webhook health
  const webhookHealth = useMemo(() => {
    const ok = settings.status === "CONNECTED" && settings.provider !== "MANUAL";
    return {
      enabled: settings.provider !== "MANUAL",
      lastEventAt: ok ? "2026-01-12T10:01:00Z" : "",
      signatureOk: ok,
      endpoint: ok ? "https://yourdomain.com/api/webhooks/payment" : "",
    };
  }, [settings]);

  function markDirty() {
    setDirty(true);
  }

  function update<K extends keyof PaymentSettings>(key: K, value: PaymentSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    markDirty();
  }

  function switchProvider(next: ProviderKey) {
    setSettings((s) => {
      const meta = providerMeta(next);
      // Keep common settings; reset status to disconnected when switching
      return {
        ...s,
        provider: next,
        status: "DISCONNECTED",
        // small quality-of-life: if switching to manual, ensure webhook not relevant
        manualInstructions: next === "MANUAL" ? s.manualInstructions || "Please transfer to bank account..." : s.manualInstructions,
      };
    });
    setDirty(true);
    setToast({ type: "info", text: `Switched to ${providerMeta(next).title}. Configure and connect when ready.` });
  }

  function validate(): { ok: boolean; msg?: string } {
    if (!settings.currency.trim()) return { ok: false, msg: "Currency is required." };

    if (settings.provider === "STRIPE") {
      if (!settings.stripePublishableKey.trim()) return { ok: false, msg: "Stripe publishable key is required." };
      if (!settings.stripeSecretKey.trim()) return { ok: false, msg: "Stripe secret key is required." };
      return { ok: true };
    }

    if (settings.provider === "PAYPAL") {
      if (!settings.paypalClientId.trim()) return { ok: false, msg: "PayPal client ID is required." };
      if (!settings.paypalClientSecret.trim()) return { ok: false, msg: "PayPal client secret is required." };
      return { ok: true };
    }

    // MANUAL
    if (!settings.manualInstructions.trim()) return { ok: false, msg: "Manual instructions are required." };
    return { ok: true };
  }

  function pushLog(level: LogRow["level"], action: string, message: string) {
    setLogs((prev) => [
      {
        id: `log_${Math.floor(Math.random() * 999999)}`,
        at: new Date().toISOString(),
        level,
        action,
        message,
      },
      ...prev,
    ]);
  }

  async function testConnection() {
    const v = validate();
    if (!v.ok) {
      setToast({ type: "error", text: v.msg || "Invalid configuration." });
      pushLog("ERROR", "Test connection", v.msg || "Invalid configuration.");
      return;
    }

    setTesting(true);
    setToast(null);

    // mock latency
    await new Promise((r) => setTimeout(r, 650));

    // mock result
    const ok = settings.provider !== "MANUAL";
    if (ok) {
      setSettings((s) => ({ ...s, status: "CONNECTED" }));
      setToast({ type: "success", text: "Connection successful (mock)." });
      pushLog("INFO", "Test connection", "Connected successfully (mock).");
    } else {
      setSettings((s) => ({ ...s, status: "CONNECTED" })); // manual considered connected
      setToast({ type: "success", text: "Manual payment is ready (mock)." });
      pushLog("INFO", "Test connection", "Manual payment enabled (mock).");
    }

    setTesting(false);
    setDirty(false);
  }

  function saveSettings() {
    const v = validate();
    if (!v.ok) {
      setToast({ type: "error", text: v.msg || "Invalid configuration." });
      pushLog("ERROR", "Save", v.msg || "Invalid configuration.");
      return;
    }
    // mock save
    setToast({ type: "success", text: "Saved settings (mock)." });
    pushLog("INFO", "Save", "Payment settings saved (mock).");
    setDirty(false);
  }

  function disconnect() {
    setSettings((s) => ({ ...s, status: "DISCONNECTED" }));
    setToast({ type: "info", text: "Disconnected (mock)." });
    pushLog("WARN", "Disconnect", "Payment disconnected (mock).");
  }

  function resetToDefaults() {
    setSettings(defaultSettings);
    setDirty(true);
    setToast({ type: "info", text: "Reset to defaults (not saved yet)." });
    pushLog("WARN", "Reset", "Reset settings to defaults (mock).");
  }

  function clearLogs() {
    setLogs([]);
    setToast({ type: "info", text: "Logs cleared (mock)." });
  }

  const bm = badgeMeta(settings.status);
  const pm = providerMeta(settings.provider);

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
              <i className="bi bi-credit-card" /> Payment
            </span>
          </div>

          <div className={styles.titleRow}>
            <h1 className={styles.title}>Payment</h1>
            <span className={styles.subtitle}>Configure provider, capture mode, currency, and webhooks</span>
          </div>

          <div className={styles.headMeta}>
            <span className={`${styles.badge} ${styles[bm.cls]}`}>
              <i className={`bi ${bm.icon}`} />
              {bm.label}
            </span>
            <span className={styles.metaDot}>•</span>
            <span className={styles.metaText}>
              Provider: <b>{pm.title}</b>
            </span>
            <span className={styles.metaDot}>•</span>
            <span className={styles.metaText}>
              Mode: <b>{settings.testMode ? "Test" : "Live"}</b>
            </span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.secondaryBtn} type="button" onClick={resetToDefaults}>
            <i className="bi bi-arrow-counterclockwise" />
            Reset
          </button>

          <button className={styles.secondaryBtn} type="button" onClick={disconnect} disabled={settings.status === "DISCONNECTED"}>
            <i className="bi bi-plug" />
            Disconnect
          </button>

          <button className={styles.primaryBtn} type="button" onClick={saveSettings} disabled={!dirty}>
            <i className="bi bi-cloud-check" />
            Save
          </button>

          <button className={styles.primaryBtn} type="button" onClick={testConnection} disabled={testing}>
            <i className={`bi ${testing ? "bi-hourglass-split" : "bi-activity"}`} />
            {testing ? "Testing..." : "Test connection"}
          </button>
        </div>
      </div>

      {/* Provider cards */}
      <div className={styles.providers}>
        {(["STRIPE", "PAYPAL", "MANUAL"] as ProviderKey[]).map((k) => {
          const m = providerMeta(k);
          const active = settings.provider === k;
          return (
            <button key={k} type="button" className={`${styles.providerCard} ${active ? styles.providerActive : ""}`} onClick={() => switchProvider(k)}>
              <div className={styles.providerTop}>
                <div className={styles.providerIcon}>
                  <i className={`bi ${m.icon}`} />
                </div>
                <div className={styles.providerInfo}>
                  <div className={styles.providerTitle}>{m.title}</div>
                  <div className={styles.providerHint}>{m.hint}</div>
                </div>
                {active ? (
                  <span className={styles.activePill}>
                    <i className="bi bi-check2" /> Active
                  </span>
                ) : (
                  <span className={styles.choosePill}>Choose</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button type="button" className={`${styles.tab} ${activeTab === "CONFIG" ? styles.tabActive : ""}`} onClick={() => setActiveTab("CONFIG")}>
          <i className="bi bi-sliders" /> Configuration
        </button>
        <button type="button" className={`${styles.tab} ${activeTab === "WEBHOOKS" ? styles.tabActive : ""}`} onClick={() => setActiveTab("WEBHOOKS")}>
          <i className="bi bi-lightning-charge" /> Webhooks
        </button>
        <button type="button" className={`${styles.tab} ${activeTab === "LOGS" ? styles.tabActive : ""}`} onClick={() => setActiveTab("LOGS")}>
          <i className="bi bi-journal-text" /> Logs
        </button>
      </div>

      {/* Content grid */}
      <div className={styles.grid}>
        {/* Left: forms */}
        <div className={styles.colMain}>
          {activeTab === "CONFIG" ? (
            <>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-gear-wide-connected" /> Common settings
                  </div>
                  <div className={styles.cardHint}>Applies to all providers</div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <Field label="Currency" hint="3-letter ISO code (USD, VND, ...).">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-currency-exchange ${styles.inputIcon}`} />
                        <input className={styles.input} value={settings.currency} onChange={(e) => update("currency", e.target.value.toUpperCase())} placeholder="USD" />
                      </div>
                    </Field>

                    <Field label="Capture mode" hint="Automatic capture on authorization or manual capture later.">
                      <div className={styles.selectWrap}>
                        <i className={`bi bi-toggle2-on ${styles.selectIcon}`} />
                        <select className={styles.select} value={settings.captureMode} onChange={(e) => update("captureMode", e.target.value as any)}>
                          <option value="AUTOMATIC">Automatic</option>
                          <option value="MANUAL">Manual</option>
                        </select>
                      </div>
                    </Field>

                    <Field label="3D Secure" hint="Enable 3DS for supported payment flows (recommended).">
                      <Toggle checked={settings.enable3DS} onChange={(v) => update("enable3DS", v)} />
                    </Field>

                    <Field label="Environment" hint="Use test keys in test mode. Switch to live when ready.">
                      <Toggle
                        checked={settings.testMode}
                        onChange={(v) => {
                          update("testMode", v);
                          setToast({ type: "info", text: v ? "Test mode enabled." : "Live mode enabled. Double-check your keys!" });
                        }}
                        labels={["Live", "Test"]}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {settings.provider === "STRIPE" ? (
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardTitle}>
                      <i className="bi bi-credit-card-2-front" /> Stripe configuration
                    </div>
                    <div className={styles.cardHint}>Keys are stored securely (mock). Use secrets drawer to view masked values.</div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.formGrid}>
                      <Field label="Publishable key" hint="pk_test_... / pk_live_...">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-key ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.stripePublishableKey} onChange={(e) => update("stripePublishableKey", e.target.value)} />
                        </div>
                      </Field>

                      <Field label="Secret key" hint="sk_test_... / sk_live_...">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-shield-lock ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.stripeSecretKey} onChange={(e) => update("stripeSecretKey", e.target.value)} />
                        </div>
                      </Field>

                      <Field label="Webhook secret" hint="whsec_... (used to verify signature)">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-lightning-charge ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.stripeWebhookSecret} onChange={(e) => update("stripeWebhookSecret", e.target.value)} />
                        </div>
                      </Field>
                    </div>

                    <div className={styles.inlineActions}>
                      <button className={styles.secondaryBtn} type="button" onClick={() => setShowSecrets(true)}>
                        <i className="bi bi-eye" /> View masked secrets
                      </button>
                      <button
                        className={styles.secondaryBtn}
                        type="button"
                        onClick={() => {
                          pushLog("INFO", "Rotate keys", "Rotate Stripe keys (mock).");
                          setToast({ type: "info", text: "Key rotation flow (mock) — implement with your secret vault later." });
                        }}>
                        <i className="bi bi-arrow-repeat" /> Rotate keys
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {settings.provider === "PAYPAL" ? (
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardTitle}>
                      <i className="bi bi-paypal" /> PayPal configuration
                    </div>
                    <div className={styles.cardHint}>Client credentials for API calls (mock).</div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.formGrid}>
                      <Field label="Client ID" hint="From PayPal developer dashboard">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-key ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.paypalClientId} onChange={(e) => update("paypalClientId", e.target.value)} />
                        </div>
                      </Field>

                      <Field label="Client secret" hint="Keep this private">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-shield-lock ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.paypalClientSecret} onChange={(e) => update("paypalClientSecret", e.target.value)} />
                        </div>
                      </Field>

                      <Field label="Webhook ID" hint="Optional, depending on setup">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-lightning-charge ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.paypalWebhookId} onChange={(e) => update("paypalWebhookId", e.target.value)} />
                        </div>
                      </Field>
                    </div>

                    <div className={styles.inlineActions}>
                      <button className={styles.secondaryBtn} type="button" onClick={() => setShowSecrets(true)}>
                        <i className="bi bi-eye" /> View masked secrets
                      </button>
                      <button
                        className={styles.secondaryBtn}
                        type="button"
                        onClick={() => {
                          pushLog("INFO", "Create webhook", "Create PayPal webhook (mock).");
                          setToast({ type: "info", text: "Webhook creation flow (mock) — wire to API later." });
                        }}>
                        <i className="bi bi-plus-circle" /> Create webhook
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {settings.provider === "MANUAL" ? (
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardTitle}>
                      <i className="bi bi-receipt" /> Manual payment instructions
                    </div>
                    <div className={styles.cardHint}>Shown to customer at checkout.</div>
                  </div>

                  <div className={styles.cardBody}>
                    <Field label="Instructions" hint="Bank transfer, COD steps, or any payment instruction.">
                      <textarea
                        className={styles.textarea}
                        value={settings.manualInstructions}
                        onChange={(e) => update("manualInstructions", e.target.value)}
                        placeholder="Type your instructions..."
                      />
                    </Field>

                    <div className={styles.inlineActions}>
                      <button
                        className={styles.secondaryBtn}
                        type="button"
                        onClick={() => {
                          pushLog("INFO", "Preview", "Preview manual instructions (mock).");
                          setToast({ type: "info", text: "Preview (mock) — show this content in your checkout UI." });
                        }}>
                        <i className="bi bi-eye" /> Preview
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </>
          ) : null}

          {activeTab === "WEBHOOKS" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardTitle}>
                  <i className="bi bi-lightning-charge" /> Webhook status
                </div>
                <div className={styles.cardHint}>Signature verification + last event tracking (mock).</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.webhookGrid}>
                  <Stat icon="bi-broadcast" label="Webhook enabled" value={webhookHealth.enabled ? "Yes" : "No"} tone={webhookHealth.enabled ? "ok" : "muted"} />
                  <Stat icon="bi-shield-check" label="Signature valid" value={webhookHealth.signatureOk ? "OK" : "—"} tone={webhookHealth.signatureOk ? "ok" : "muted"} />
                  <Stat
                    icon="bi-clock-history"
                    label="Last event"
                    value={webhookHealth.lastEventAt ? fmtDateTime(webhookHealth.lastEventAt) : "—"}
                    tone={webhookHealth.lastEventAt ? "info" : "muted"}
                  />
                </div>

                <div className={styles.hr} />

                <Field label="Endpoint URL" hint="Configure this in your provider dashboard.">
                  <div className={styles.copyRow}>
                    <div className={styles.monoBox}>{webhookHealth.endpoint || "Not available for Manual provider."}</div>
                    <button
                      className={styles.secondaryBtn}
                      type="button"
                      disabled={!webhookHealth.endpoint}
                      onClick={() => {
                        navigator.clipboard?.writeText(webhookHealth.endpoint);
                        setToast({ type: "success", text: "Copied endpoint URL." });
                      }}>
                      <i className="bi bi-clipboard" /> Copy
                    </button>
                  </div>
                </Field>

                <div className={styles.inlineActions}>
                  <button
                    className={styles.primaryBtn}
                    type="button"
                    disabled={settings.provider === "MANUAL"}
                    onClick={() => {
                      pushLog("INFO", "Send test event", "Sent test webhook event (mock).");
                      setToast({ type: "success", text: "Sent test webhook event (mock)." });
                    }}>
                    <i className="bi bi-send" /> Send test event
                  </button>

                  <button
                    className={styles.secondaryBtn}
                    type="button"
                    onClick={() => {
                      pushLog("INFO", "Verify signature", "Verified webhook signature (mock).");
                      setToast({ type: "success", text: "Signature verification OK (mock)." });
                    }}
                    disabled={settings.provider === "MANUAL"}>
                    <i className="bi bi-shield-check" /> Verify signature
                  </button>
                </div>

                <div className={styles.noteCallout}>
                  <i className="bi bi-info-circle" />
                  <div>
                    <b>Tip:</b> In low-code, bạn có thể expose webhook event builder (payment_succeeded, refund_created, …) để users map vào workflows.
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "LOGS" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardTitle}>
                  <i className="bi bi-journal-text" /> Integration logs
                </div>
                <div className={styles.cardHint}>Useful for debugging payment flows (mock).</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.inlineActions}>
                  <button className={styles.secondaryBtn} type="button" onClick={() => setToast({ type: "info", text: "Refresh logs (mock)." })}>
                    <i className="bi bi-arrow-clockwise" /> Refresh
                  </button>
                  <button className={`${styles.secondaryBtn} ${styles.dangerBtn}`} type="button" onClick={clearLogs}>
                    <i className="bi bi-trash3" /> Clear logs
                  </button>
                </div>

                <div className={styles.logs}>
                  {logs.length === 0 ? (
                    <div className={styles.empty}>
                      <i className="bi bi-inbox" />
                      <div className={styles.emptyTitle}>No logs</div>
                      <div className={styles.emptyHint}>Logs will appear here when events occur.</div>
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

          {/* Danger zone */}
          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardTitle}>
                <i className="bi bi-exclamation-octagon" /> Danger zone
              </div>
              <div className={styles.cardHint}>Be careful — these actions can affect checkout.</div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.dangerRow}>
                <div>
                  <div className={styles.dangerTitle}>Disable payments</div>
                  <div className={styles.dangerHint}>Customers won’t be able to checkout until re-enabled.</div>
                </div>
                <button
                  className={`${styles.secondaryBtn} ${styles.dangerBtn}`}
                  type="button"
                  onClick={() => {
                    setSettings((s) => ({ ...s, status: "DISCONNECTED" }));
                    setToast({ type: "info", text: "Payments disabled (mock)." });
                    pushLog("WARN", "Disable payments", "Payments disabled (mock).");
                  }}>
                  <i className="bi bi-power" />
                  Disable
                </button>
              </div>

              <div className={styles.dangerRow}>
                <div>
                  <div className={styles.dangerTitle}>Purge secrets</div>
                  <div className={styles.dangerHint}>Remove stored keys/secrets (mock). Recommended before exporting system.</div>
                </div>
                <button
                  className={`${styles.secondaryBtn} ${styles.dangerBtn}`}
                  type="button"
                  onClick={() => {
                    setSettings((s) => ({
                      ...s,
                      stripeSecretKey: "",
                      stripeWebhookSecret: "",
                      paypalClientSecret: "",
                    }));
                    setDirty(true);
                    setToast({ type: "info", text: "Secrets purged (not saved yet)." });
                    pushLog("WARN", "Purge secrets", "Secrets purged (mock).");
                  }}>
                  <i className="bi bi-shield-x" />
                  Purge
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: summary / health */}
        <div className={styles.colSide}>
          <div className={styles.sideCard}>
            <div className={styles.sideHead}>
              <div className={styles.sideTitle}>
                <i className="bi bi-heart-pulse" /> Health
              </div>
              <span className={`${styles.badge} ${styles[bm.cls]}`}>
                <i className={`bi ${bm.icon}`} /> {bm.label}
              </span>
            </div>

            <div className={styles.sideBody}>
              <MiniRow icon="bi-plug" label="Provider" value={pm.title} />
              <MiniRow icon="bi-currency-exchange" label="Currency" value={settings.currency || "—"} />
              <MiniRow icon="bi-toggle2-on" label="Capture" value={settings.captureMode === "AUTOMATIC" ? "Automatic" : "Manual"} />
              <MiniRow icon="bi-shield-check" label="3DS" value={settings.enable3DS ? "Enabled" : "Disabled"} />
              <MiniRow icon="bi-beaker" label="Mode" value={settings.testMode ? "Test" : "Live"} />

              <div className={styles.hr} />

              <div className={styles.sideHint}>
                <i className="bi bi-info-circle" />
                <div>
                  Kết nối Payment là “core integration”. Với no-code, hãy expose actions:
                  <b> charge, refund, verify webhook</b> để map vào workflows.
                </div>
              </div>

              <div className={styles.sideActions}>
                <button className={styles.secondaryBtn} type="button" onClick={() => setActiveTab("WEBHOOKS")}>
                  <i className="bi bi-lightning-charge" /> Webhooks
                </button>
                <button className={styles.secondaryBtn} type="button" onClick={() => setActiveTab("LOGS")}>
                  <i className="bi bi-journal-text" /> Logs
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
        </div>
      </div>

      {/* Secrets drawer */}
      <aside className={`${styles.drawer} ${showSecrets ? styles.drawerOpen : ""}`} aria-hidden={!showSecrets}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitle}>
            <i className="bi bi-shield-lock" /> Masked secrets
          </div>
          <button className={styles.iconBtn} type="button" onClick={() => setShowSecrets(false)} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.drawerBody}>
          <div className={styles.drawerCard}>
            <div className={styles.drawerHint}>Values are masked for safety. Store real secrets in your vault/DB with encryption.</div>

            {settings.provider === "STRIPE" ? (
              <div className={styles.secretList}>
                <SecretRow label="Stripe publishable key" value={settings.stripePublishableKey} />
                <SecretRow label="Stripe secret key" value={maskSecret(settings.stripeSecretKey)} />
                <SecretRow label="Stripe webhook secret" value={maskSecret(settings.stripeWebhookSecret)} />
              </div>
            ) : null}

            {settings.provider === "PAYPAL" ? (
              <div className={styles.secretList}>
                <SecretRow label="PayPal client ID" value={settings.paypalClientId || "—"} />
                <SecretRow label="PayPal client secret" value={maskSecret(settings.paypalClientSecret)} />
                <SecretRow label="PayPal webhook ID" value={settings.paypalWebhookId || "—"} />
              </div>
            ) : null}

            {settings.provider === "MANUAL" ? (
              <div className={styles.secretList}>
                <SecretRow label="Manual provider" value="No secrets required." />
              </div>
            ) : null}

            <div className={styles.inlineActions}>
              <button
                className={styles.secondaryBtn}
                type="button"
                onClick={() => {
                  setToast({ type: "success", text: "Copied masked values (mock)." });
                  pushLog("INFO", "Copy secrets", "Copied masked secrets (mock).");
                }}>
                <i className="bi bi-clipboard" /> Copy masked
              </button>
            </div>
          </div>
        </div>
      </aside>

      {showSecrets ? <button className={styles.backdrop} onClick={() => setShowSecrets(false)} aria-label="Close drawer" /> : null}
    </div>
  );
}

/* ---------- Small UI components ---------- */

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

function Toggle({
  checked,
  onChange,
  labels,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  labels?: [string, string]; // [off, on]
}) {
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

function Stat({ icon, label, value, tone }: { icon: string; label: string; value: string; tone: "ok" | "info" | "muted" }) {
  return (
    <div className={styles.stat}>
      <div className={styles.statTop}>
        <i className={`bi ${icon} ${styles.statIcon}`} />
        <span className={styles.statLabel}>{label}</span>
      </div>
      <div className={`${styles.statValue} ${tone === "ok" ? styles.statOk : tone === "info" ? styles.statInfo : styles.statMuted}`}>{value}</div>
    </div>
  );
}

function SecretRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.secretRow}>
      <div className={styles.secretLabel}>{label}</div>
      <div className={styles.secretValue}>{value || "—"}</div>
    </div>
  );
}
