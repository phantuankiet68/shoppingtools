"use client";

import React, { useMemo, useState } from "react";
import styles from "@/styles/admin/integrations/email/email.module.css";

type EmailProviderKey = "SMTP" | "RESEND" | "SENDGRID";
type ProviderStatus = "DISCONNECTED" | "CONNECTED" | "ERROR";

type EmailSettings = {
  provider: EmailProviderKey;
  status: ProviderStatus;

  // Common
  fromName: string;
  fromEmail: string; // sender
  replyToEmail: string;
  testMode: boolean; // dry run
  trackOpens: boolean;
  trackClicks: boolean;

  // SMTP
  smtpHost: string;
  smtpPort: number;
  smtpSecure: boolean; // TLS
  smtpUser: string;
  smtpPass: string;

  // Resend
  resendApiKey: string;

  // SendGrid
  sendgridApiKey: string;

  // Limits (mock)
  dailyLimit: number;
  perMinuteLimit: number;
};

type DomainRow = {
  id: string;
  domain: string;
  status: "VERIFIED" | "PENDING" | "FAILED";
  lastCheckedAt: string;
};

type LogRow = {
  id: string;
  at: string;
  level: "INFO" | "WARN" | "ERROR";
  action: string;
  message: string;
};

const defaultSettings: EmailSettings = {
  provider: "RESEND",
  status: "DISCONNECTED",

  fromName: "Your App",
  fromEmail: "no-reply@yourdomain.com",
  replyToEmail: "support@yourdomain.com",
  testMode: true,
  trackOpens: true,
  trackClicks: true,

  smtpHost: "smtp.gmail.com",
  smtpPort: 587,
  smtpSecure: false,
  smtpUser: "",
  smtpPass: "",

  resendApiKey: "re_****************",
  sendgridApiKey: "",

  dailyLimit: 5000,
  perMinuteLimit: 120,
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

function providerMeta(p: EmailProviderKey) {
  if (p === "SMTP") return { title: "SMTP", icon: "bi-inboxes", hint: "Your own SMTP server / Gmail / Office365" };
  if (p === "RESEND") return { title: "Resend", icon: "bi-lightning-charge", hint: "API-based transactional email" };
  return { title: "SendGrid", icon: "bi-send", hint: "Marketing + transactional via API" };
}

function maskSecret(s: string) {
  if (!s) return "";
  const v = s.trim();
  if (v.length <= 8) return "•".repeat(v.length);
  return `${v.slice(0, 4)}••••••••••${v.slice(-4)}`;
}

export default function EmailPage() {
  const [settings, setSettings] = useState<EmailSettings>(defaultSettings);
  const [dirty, setDirty] = useState(false);

  const [activeTab, setActiveTab] = useState<"CONFIG" | "SENDER" | "LOGS">("CONFIG");
  const [testing, setTesting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);

  const [showSecrets, setShowSecrets] = useState(false);

  const [domains, setDomains] = useState<DomainRow[]>([
    { id: "dom_1", domain: "yourdomain.com", status: "PENDING", lastCheckedAt: "2026-01-12T10:02:00Z" },
    { id: "dom_2", domain: "mail.yourdomain.com", status: "FAILED", lastCheckedAt: "2026-01-10T04:20:00Z" },
  ]);

  const [logs, setLogs] = useState<LogRow[]>([
    { id: "log_1", at: "2026-01-14T06:22:00Z", level: "INFO", action: "Load", message: "Email integration page loaded (mock)." },
    { id: "log_2", at: "2026-01-12T09:05:00Z", level: "WARN", action: "Domain", message: "Sender domain not verified yet (mock)." },
  ]);

  const health = useMemo(() => {
    const senderOk = settings.fromEmail.includes("@") && settings.fromName.trim().length > 0;
    const tracking = `${settings.trackOpens ? "Opens" : ""}${settings.trackOpens && settings.trackClicks ? " + " : ""}${settings.trackClicks ? "Clicks" : ""}` || "Off";
    const verifiedCount = domains.filter((d) => d.status === "VERIFIED").length;
    return { senderOk, tracking, verifiedCount };
  }, [settings, domains]);

  function markDirty() {
    setDirty(true);
  }

  function update<K extends keyof EmailSettings>(key: K, value: EmailSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    markDirty();
  }

  function pushLog(level: LogRow["level"], action: string, message: string) {
    setLogs((prev) => [{ id: `log_${Math.floor(Math.random() * 999999)}`, at: new Date().toISOString(), level, action, message }, ...prev]);
  }

  function validate(): { ok: boolean; msg?: string } {
    if (!settings.fromName.trim()) return { ok: false, msg: "From name is required." };
    if (!settings.fromEmail.includes("@")) return { ok: false, msg: "From email is invalid." };
    if (settings.replyToEmail && !settings.replyToEmail.includes("@")) return { ok: false, msg: "Reply-to email is invalid." };

    if (settings.provider === "SMTP") {
      if (!settings.smtpHost.trim()) return { ok: false, msg: "SMTP host is required." };
      if (!settings.smtpPort || settings.smtpPort <= 0) return { ok: false, msg: "SMTP port is invalid." };
      if (!settings.smtpUser.trim()) return { ok: false, msg: "SMTP username is required." };
      if (!settings.smtpPass.trim()) return { ok: false, msg: "SMTP password is required." };
      return { ok: true };
    }

    if (settings.provider === "RESEND") {
      if (!settings.resendApiKey.trim()) return { ok: false, msg: "Resend API key is required." };
      return { ok: true };
    }

    if (settings.provider === "SENDGRID") {
      if (!settings.sendgridApiKey.trim()) return { ok: false, msg: "SendGrid API key is required." };
      return { ok: true };
    }

    return { ok: true };
  }

  function switchProvider(next: EmailProviderKey) {
    setSettings((s) => ({ ...s, provider: next, status: "DISCONNECTED" }));
    setDirty(true);
    setToast({ type: "info", text: `Switched to ${providerMeta(next).title}. Configure and connect when ready.` });
    pushLog("INFO", "Switch provider", `Provider changed to ${providerMeta(next).title} (mock).`);
  }

  function saveSettings() {
    const v = validate();
    if (!v.ok) {
      setToast({ type: "error", text: v.msg || "Invalid configuration." });
      pushLog("ERROR", "Save", v.msg || "Invalid configuration.");
      return;
    }
    setToast({ type: "success", text: "Saved settings (mock)." });
    pushLog("INFO", "Save", "Email settings saved (mock).");
    setDirty(false);
  }

  async function testEmail() {
    const v = validate();
    if (!v.ok) {
      setToast({ type: "error", text: v.msg || "Invalid configuration." });
      pushLog("ERROR", "Test email", v.msg || "Invalid configuration.");
      return;
    }

    setTesting(true);
    setToast(null);

    await new Promise((r) => setTimeout(r, 650));

    // mock result
    setSettings((s) => ({ ...s, status: "CONNECTED" }));
    setToast({ type: "success", text: settings.testMode ? "Sent test email (dry-run, mock)." : "Sent test email (mock)." });
    pushLog("INFO", "Test email", settings.testMode ? "Dry-run email sent (mock)." : "Email sent (mock).");
    setDirty(false);
    setTesting(false);
  }

  function disconnect() {
    setSettings((s) => ({ ...s, status: "DISCONNECTED" }));
    setToast({ type: "info", text: "Disconnected (mock)." });
    pushLog("WARN", "Disconnect", "Email provider disconnected (mock).");
  }

  function resetToDefaults() {
    setSettings(defaultSettings);
    setDirty(true);
    setToast({ type: "info", text: "Reset to defaults (not saved yet)." });
    pushLog("WARN", "Reset", "Reset settings to defaults (mock).");
  }

  function addDomain() {
    const domain = prompt("Enter domain (e.g. yourdomain.com)")?.trim();
    if (!domain) return;
    setDomains((prev) => [{ id: `dom_${Math.floor(Math.random() * 999999)}`, domain, status: "PENDING", lastCheckedAt: new Date().toISOString() }, ...prev]);
    setToast({ type: "info", text: "Domain added (mock). Configure DNS records to verify." });
    pushLog("INFO", "Add domain", `Added domain ${domain} (mock).`);
  }

  function verifyDomain(id: string) {
    setDomains((prev) => prev.map((d) => (d.id === id ? { ...d, status: "VERIFIED", lastCheckedAt: new Date().toISOString() } : d)));
    setToast({ type: "success", text: "Domain verified (mock)." });
    pushLog("INFO", "Verify domain", "Domain verified (mock).");
  }

  function removeDomain(id: string) {
    setDomains((prev) => prev.filter((d) => d.id !== id));
    setToast({ type: "info", text: "Domain removed (mock)." });
    pushLog("WARN", "Remove domain", "Domain removed (mock).");
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
              <i className="bi bi-envelope" /> Email
            </span>
          </div>

          <div className={styles.titleRow}>
            <h1 className={styles.title}>Email</h1>
            <span className={styles.subtitle}>Configure sender, provider credentials, tracking, and deliverability</span>
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

          <button className={styles.primaryBtn} type="button" onClick={testEmail} disabled={testing}>
            <i className={`bi ${testing ? "bi-hourglass-split" : "bi-send-check"}`} />
            {testing ? "Sending..." : "Send test email"}
          </button>
        </div>
      </div>

      {/* Provider cards */}
      <div className={styles.providers}>
        {(["RESEND", "SMTP", "SENDGRID"] as EmailProviderKey[]).map((k) => {
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
        <button type="button" className={`${styles.tab} ${activeTab === "SENDER" ? styles.tabActive : ""}`} onClick={() => setActiveTab("SENDER")}>
          <i className="bi bi-shield-check" /> Sender & Domains
        </button>
        <button type="button" className={`${styles.tab} ${activeTab === "LOGS" ? styles.tabActive : ""}`} onClick={() => setActiveTab("LOGS")}>
          <i className="bi bi-journal-text" /> Logs
        </button>
      </div>

      <div className={styles.grid}>
        {/* Main */}
        <div className={styles.colMain}>
          {activeTab === "CONFIG" ? (
            <>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-envelope-paper" /> Common settings
                  </div>
                  <div className={styles.cardHint}>Sender identity + tracking applies to all providers</div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <Field label="From name" hint="Displayed in inbox (e.g. Your App).">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-person-badge ${styles.inputIcon}`} />
                        <input className={styles.input} value={settings.fromName} onChange={(e) => update("fromName", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="From email" hint="no-reply@yourdomain.com">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-at ${styles.inputIcon}`} />
                        <input className={styles.input} value={settings.fromEmail} onChange={(e) => update("fromEmail", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Reply-to email" hint="Optional (support@...).">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-reply ${styles.inputIcon}`} />
                        <input className={styles.input} value={settings.replyToEmail} onChange={(e) => update("replyToEmail", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Environment" hint="Dry-run in test mode.">
                      <Toggle
                        checked={settings.testMode}
                        onChange={(v) => {
                          update("testMode", v);
                          setToast({ type: "info", text: v ? "Test mode enabled (dry-run)." : "Live mode enabled." });
                        }}
                        labels={["Live", "Test"]}
                      />
                    </Field>

                    <Field label="Track opens" hint="Email open tracking (pixel).">
                      <Toggle checked={settings.trackOpens} onChange={(v) => update("trackOpens", v)} labels={["Off", "On"]} />
                    </Field>

                    <Field label="Track clicks" hint="Link click tracking (redirect).">
                      <Toggle checked={settings.trackClicks} onChange={(v) => update("trackClicks", v)} labels={["Off", "On"]} />
                    </Field>

                    <Field label="Daily limit" hint="Safety limit (mock).">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-speedometer2 ${styles.inputIcon}`} />
                        <input className={styles.input} type="number" value={settings.dailyLimit} onChange={(e) => update("dailyLimit", Math.max(0, Number(e.target.value || 0)))} />
                      </div>
                    </Field>

                    <Field label="Per-minute limit" hint="Throttle to avoid spikes (mock).">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-stopwatch ${styles.inputIcon}`} />
                        <input className={styles.input} type="number" value={settings.perMinuteLimit} onChange={(e) => update("perMinuteLimit", Math.max(0, Number(e.target.value || 0)))} />
                      </div>
                    </Field>
                  </div>
                </div>
              </div>

              {settings.provider === "RESEND" ? (
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardTitle}>
                      <i className="bi bi-lightning-charge" /> Resend configuration
                    </div>
                    <div className={styles.cardHint}>API key + (optional) domain verification</div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.formGrid}>
                      <Field label="API key" hint="re_...">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-shield-lock ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.resendApiKey} onChange={(e) => update("resendApiKey", e.target.value)} />
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
                          pushLog("INFO", "Rotate key", "Rotate Resend API key (mock).");
                          setToast({ type: "info", text: "Key rotation (mock) — wire to your vault later." });
                        }}>
                        <i className="bi bi-arrow-repeat" /> Rotate key
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {settings.provider === "SENDGRID" ? (
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardTitle}>
                      <i className="bi bi-send" /> SendGrid configuration
                    </div>
                    <div className={styles.cardHint}>API key + sender authentication</div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.formGrid}>
                      <Field label="API key" hint="SG....">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-shield-lock ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.sendgridApiKey} onChange={(e) => update("sendgridApiKey", e.target.value)} />
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
                          pushLog("INFO", "Create sender", "Create SendGrid sender (mock).");
                          setToast({ type: "info", text: "Create sender flow (mock) — implement later." });
                        }}>
                        <i className="bi bi-plus-circle" /> Create sender
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {settings.provider === "SMTP" ? (
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardTitle}>
                      <i className="bi bi-inboxes" /> SMTP configuration
                    </div>
                    <div className={styles.cardHint}>Host/port/credentials for SMTP relay</div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.formGrid}>
                      <Field label="Host" hint="smtp.gmail.com">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-hdd-network ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.smtpHost} onChange={(e) => update("smtpHost", e.target.value)} />
                        </div>
                      </Field>

                      <Field label="Port" hint="587 / 465">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-diagram-3 ${styles.inputIcon}`} />
                          <input className={styles.input} type="number" value={settings.smtpPort} onChange={(e) => update("smtpPort", Math.max(1, Number(e.target.value || 0)))} />
                        </div>
                      </Field>

                      <Field label="Secure (TLS)" hint="Use 465 for implicit TLS in some servers.">
                        <Toggle checked={settings.smtpSecure} onChange={(v) => update("smtpSecure", v)} labels={["Off", "On"]} />
                      </Field>

                      <Field label="Username" hint="SMTP username/login">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-person ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.smtpUser} onChange={(e) => update("smtpUser", e.target.value)} />
                        </div>
                      </Field>

                      <Field label="Password" hint="App password recommended">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-shield-lock ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.smtpPass} onChange={(e) => update("smtpPass", e.target.value)} />
                        </div>
                      </Field>
                    </div>

                    <div className={styles.inlineActions}>
                      <button className={styles.secondaryBtn} type="button" onClick={() => setShowSecrets(true)}>
                        <i className="bi bi-eye" /> View masked secrets
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-layout-text-window-reverse" /> Templates (quick)
                  </div>
                  <div className={styles.cardHint}>Hook to your no-code template builder later</div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.templateGrid}>
                    <TemplateCard icon="bi-person-check" title="Welcome email" desc="Account created / onboarding" />
                    <TemplateCard icon="bi-key" title="Reset password" desc="OTP / reset link" />
                    <TemplateCard icon="bi-bag-check" title="Order confirmation" desc="Receipt + shipping info" />
                    <TemplateCard icon="bi-bell" title="Notifications" desc="System alerts & updates" />
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "SENDER" ? (
            <>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-shield-check" /> Sender domains
                  </div>
                  <div className={styles.cardHint}>Verify SPF/DKIM to improve deliverability (mock)</div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.inlineActions}>
                    <button className={styles.primaryBtn} type="button" onClick={addDomain}>
                      <i className="bi bi-plus-lg" /> Add domain
                    </button>
                    <button
                      className={styles.secondaryBtn}
                      type="button"
                      onClick={() => {
                        setToast({ type: "info", text: "DNS records guide (mock)." });
                        pushLog("INFO", "DNS guide", "Opened DNS records guide (mock).");
                      }}>
                      <i className="bi bi-journal-bookmark" /> DNS guide
                    </button>
                  </div>

                  <div className={styles.domainList}>
                    {domains.length === 0 ? (
                      <div className={styles.empty}>
                        <i className="bi bi-globe2" />
                        <div className={styles.emptyTitle}>No domains</div>
                        <div className={styles.emptyHint}>Add a sender domain to enable SPF/DKIM verification.</div>
                      </div>
                    ) : (
                      domains.map((d) => (
                        <div key={d.id} className={styles.domainRow}>
                          <div className={styles.domainLeft}>
                            <div className={styles.domainName}>
                              <i className="bi bi-globe2" /> {d.domain}
                            </div>
                            <div className={styles.domainMeta}>Last checked: {fmtDateTime(d.lastCheckedAt)}</div>
                          </div>

                          <div className={styles.domainRight}>
                            <span className={`${styles.chip} ${d.status === "VERIFIED" ? styles.chipOk : d.status === "FAILED" ? styles.chipErr : styles.chipPending}`}>
                              <i className={`bi ${d.status === "VERIFIED" ? "bi-check-circle" : d.status === "FAILED" ? "bi-x-circle" : "bi-hourglass-split"}`} />
                              {d.status}
                            </span>

                            {d.status !== "VERIFIED" ? (
                              <button className={styles.secondaryBtn} type="button" onClick={() => verifyDomain(d.id)}>
                                <i className="bi bi-shield-check" /> Verify
                              </button>
                            ) : null}

                            <button className={`${styles.secondaryBtn} ${styles.dangerBtn}`} type="button" onClick={() => removeDomain(d.id)}>
                              <i className="bi bi-trash3" /> Remove
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className={styles.noteCallout}>
                    <i className="bi bi-info-circle" />
                    <div>
                      <b>Tip:</b> Với no-code, bạn có thể expose “Domain verification status” để hiển thị cảnh báo trong dashboard.
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "LOGS" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardTitle}>
                  <i className="bi bi-journal-text" /> Email logs
                </div>
                <div className={styles.cardHint}>Delivery, bounces, complaints (mock)</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.inlineActions}>
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
                    <i className="bi bi-trash3" /> Clear logs
                  </button>
                </div>

                <div className={styles.logs}>
                  {logs.length === 0 ? (
                    <div className={styles.empty}>
                      <i className="bi bi-inbox" />
                      <div className={styles.emptyTitle}>No logs</div>
                      <div className={styles.emptyHint}>Logs will appear here when messages are sent.</div>
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
              <div className={styles.cardHint}>Be careful — affects verification & deliverability</div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.dangerRow}>
                <div>
                  <div className={styles.dangerTitle}>Disable emails</div>
                  <div className={styles.dangerHint}>System won’t send transactional emails until re-enabled.</div>
                </div>
                <button
                  className={`${styles.secondaryBtn} ${styles.dangerBtn}`}
                  type="button"
                  onClick={() => {
                    setSettings((s) => ({ ...s, status: "DISCONNECTED" }));
                    setToast({ type: "info", text: "Emails disabled (mock)." });
                    pushLog("WARN", "Disable emails", "Emails disabled (mock).");
                  }}>
                  <i className="bi bi-power" />
                  Disable
                </button>
              </div>

              <div className={styles.dangerRow}>
                <div>
                  <div className={styles.dangerTitle}>Purge secrets</div>
                  <div className={styles.dangerHint}>Remove stored API keys/passwords (mock).</div>
                </div>
                <button
                  className={`${styles.secondaryBtn} ${styles.dangerBtn}`}
                  type="button"
                  onClick={() => {
                    setSettings((s) => ({ ...s, resendApiKey: "", sendgridApiKey: "", smtpPass: "" }));
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

        {/* Side */}
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
              <MiniRow icon="bi-person-badge" label="From" value={settings.fromName || "—"} />
              <MiniRow icon="bi-at" label="From email" value={settings.fromEmail || "—"} />
              <MiniRow icon="bi-reply" label="Reply-to" value={settings.replyToEmail || "—"} />
              <MiniRow icon="bi-beaker" label="Mode" value={settings.testMode ? "Test" : "Live"} />
              <MiniRow icon="bi-graph-up" label="Tracking" value={health.tracking} />
              <MiniRow icon="bi-shield-check" label="Verified domains" value={String(health.verifiedCount)} />

              <div className={styles.hr} />

              <div className={styles.sideHint}>
                <i className="bi bi-info-circle" />
                <div>
                  No-code gợi ý: expose actions <b>sendEmail</b> + template variables để users map vào workflows.
                </div>
              </div>

              <div className={styles.sideActions}>
                <button className={styles.secondaryBtn} type="button" onClick={() => setActiveTab("SENDER")}>
                  <i className="bi bi-shield-check" /> Domains
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
            <div className={styles.drawerHint}>Values are masked. Store real secrets in DB/vault with encryption.</div>

            {settings.provider === "RESEND" ? (
              <div className={styles.secretList}>
                <SecretRow label="Resend API key" value={maskSecret(settings.resendApiKey)} />
              </div>
            ) : null}

            {settings.provider === "SENDGRID" ? (
              <div className={styles.secretList}>
                <SecretRow label="SendGrid API key" value={maskSecret(settings.sendgridApiKey)} />
              </div>
            ) : null}

            {settings.provider === "SMTP" ? (
              <div className={styles.secretList}>
                <SecretRow label="SMTP password" value={maskSecret(settings.smtpPass)} />
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

function SecretRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={styles.secretRow}>
      <div className={styles.secretLabel}>{label}</div>
      <div className={styles.secretValue}>{value || "—"}</div>
    </div>
  );
}

function TemplateCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <button type="button" className={styles.templateCard} onClick={() => alert(`Open template builder: ${title} (mock)`)}>
      <div className={styles.templateIcon}>
        <i className={`bi ${icon}`} />
      </div>
      <div className={styles.templateInfo}>
        <div className={styles.templateTitle}>{title}</div>
        <div className={styles.templateDesc}>{desc}</div>
      </div>
      <i className={`bi bi-chevron-right ${styles.templateArrow}`} />
    </button>
  );
}
