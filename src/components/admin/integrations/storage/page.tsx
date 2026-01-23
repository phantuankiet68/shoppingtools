"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/integrations/storage/storage.module.css";

type StorageProvider = "LOCAL" | "S3" | "R2";
type Status = "DISCONNECTED" | "CONNECTED" | "ERROR";

type StorageSettings = {
  provider: StorageProvider;
  status: Status;

  // Common
  publicBaseUrl: string;
  rootPrefix: string;
  privateByDefault: boolean;
  signedUrlEnabled: boolean;
  signedUrlTtlSeconds: number;

  maxUploadMb: number;
  allowedMime: string;
  enableImageOptimization: boolean;

  // Local
  localDir: string;

  // S3/R2
  region: string;
  bucket: string;
  endpointUrl: string;
  accessKeyId: string; // masked from API
  secretAccessKey: string; // masked from API

  // CDN
  cacheControl: string;
  purgeEnabled: boolean;
};

type BucketRow = {
  id: string;
  name: string;
  region?: string;
  provider: StorageProvider;
  objects: number;
  sizeGb: number;
  updatedAt: string;
};

type ObjectRow = {
  key: string;
  sizeKb: number;
  type: string;
  visibility: "PUBLIC" | "PRIVATE";
  updatedAt: string;
};

type LogRow = {
  id: string;
  at: string;
  level: "INFO" | "WARN" | "ERROR";
  action: string;
  message: string;
};

const defaults: StorageSettings = {
  provider: "R2",
  status: "DISCONNECTED",

  publicBaseUrl: "",
  rootPrefix: "uploads/",
  privateByDefault: true,
  signedUrlEnabled: true,
  signedUrlTtlSeconds: 900,

  maxUploadMb: 50,
  allowedMime: "image/*,application/pdf",
  enableImageOptimization: true,

  localDir: "./public/uploads",

  region: "auto",
  bucket: "",
  endpointUrl: "",
  accessKeyId: "",
  secretAccessKey: "",

  cacheControl: "public,max-age=31536000,immutable",
  purgeEnabled: false,
};

function fmtDateTime(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short" }).format(d);
}

function badgeMeta(status: Status) {
  if (status === "CONNECTED") return { cls: "badgeOk", icon: "bi-check-circle", label: "Connected" };
  if (status === "ERROR") return { cls: "badgeErr", icon: "bi-exclamation-triangle", label: "Error" };
  return { cls: "badgeOff", icon: "bi-plug", label: "Disconnected" };
}

function providerMeta(p: StorageProvider) {
  if (p === "LOCAL") return { title: "Local", icon: "bi-hdd", hint: "Store files on server disk (dev/small scale)" };
  if (p === "S3") return { title: "Amazon S3", icon: "bi-cloud", hint: "AWS S3 / S3-compatible storage" };
  return { title: "Cloudflare R2", icon: "bi-cloud-lightning", hint: "S3-compatible with zero egress to CF" };
}

function maskSecret(s: string) {
  if (!s) return "";
  const v = s.trim();
  if (v.length <= 8) return "•".repeat(v.length);
  return `${v.slice(0, 4)}••••••••••${v.slice(-4)}`;
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok || !payload?.ok) {
    throw new Error(payload?.error || `Request failed: ${res.status}`);
  }
  return payload.data as T;
}

export default function StoragePage() {
  const [settings, setSettings] = useState<StorageSettings>(defaults);
  const [dirty, setDirty] = useState(false);

  const [activeTab, setActiveTab] = useState<"CONFIG" | "BROWSER" | "LOGS">("CONFIG");
  const [toast, setToast] = useState<{ type: "success" | "error" | "info"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const [showSecrets, setShowSecrets] = useState(false);

  const [buckets, setBuckets] = useState<BucketRow[]>([]);
  const [objects, setObjects] = useState<ObjectRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);

  const [searchKey, setSearchKey] = useState("");
  const [filterVisibility, setFilterVisibility] = useState<"ALL" | "PUBLIC" | "PRIVATE">("ALL");

  const bm = badgeMeta(settings.status);
  const pm = providerMeta(settings.provider);

  const filteredObjects = useMemo(() => {
    const q = searchKey.trim().toLowerCase();
    return objects.filter((o) => {
      const matchQ = !q || o.key.toLowerCase().includes(q);
      const matchV = filterVisibility === "ALL" ? true : o.visibility === filterVisibility;
      return matchQ && matchV;
    });
  }, [objects, searchKey, filterVisibility]);

  const health = useMemo(() => {
    const mimeOk = settings.allowedMime.trim().length > 0;
    const baseOk = settings.publicBaseUrl.trim().length > 0;
    const signedOk = !settings.signedUrlEnabled || settings.signedUrlTtlSeconds > 0;

    const providerOk =
      settings.provider === "LOCAL" ? settings.localDir.trim().length > 0 : settings.bucket.trim().length > 0 && settings.accessKeyId.trim().length > 0 && settings.secretAccessKey.trim().length > 0;

    return { ok: mimeOk && baseOk && signedOk && providerOk, mimeOk, baseOk, signedOk, providerOk };
  }, [settings]);

  function markDirty() {
    setDirty(true);
  }

  function update<K extends keyof StorageSettings>(key: K, value: StorageSettings[K]) {
    setSettings((s) => ({ ...s, [key]: value }));
    markDirty();
  }

  // ✅ Fix lỗi pushLog: dùng local log (UI-only) để không bị undefined
  function pushLocalLog(level: LogRow["level"], action: string, message: string) {
    setLogs((prev) => [{ id: `ui_${Math.floor(Math.random() * 999999)}`, at: new Date().toISOString(), level, action, message }, ...prev]);
  }

  function validate(): { ok: boolean; msg?: string } {
    if (!settings.publicBaseUrl.trim()) return { ok: false, msg: "Public base URL is required." };
    if (!settings.rootPrefix.trim()) return { ok: false, msg: "Root prefix is required." };
    if (settings.maxUploadMb <= 0) return { ok: false, msg: "Max upload must be > 0." };
    if (!settings.allowedMime.trim()) return { ok: false, msg: "Allowed MIME types is required." };

    if (settings.signedUrlEnabled && settings.signedUrlTtlSeconds <= 0) return { ok: false, msg: "Signed URL TTL must be > 0." };

    if (settings.provider === "LOCAL") {
      if (!settings.localDir.trim()) return { ok: false, msg: "Local directory is required." };
      return { ok: true };
    }

    if (!settings.bucket.trim()) return { ok: false, msg: "Bucket is required." };
    if (!settings.accessKeyId.trim()) return { ok: false, msg: "Access key ID is required." };
    if (!settings.secretAccessKey.trim()) return { ok: false, msg: "Secret access key is required." };
    if (settings.provider === "S3" && !settings.region.trim()) return { ok: false, msg: "Region is required for S3." };
    if (settings.provider === "R2" && !settings.endpointUrl.trim()) return { ok: false, msg: "Endpoint URL is required for R2." };

    return { ok: true };
  }

  // ---------- API loaders ----------
  async function loadSettings() {
    const data = await api<StorageSettings>("/api/admin/storage/settings");
    setSettings(data);
    setDirty(false);
  }

  async function loadBuckets() {
    // optional route — nếu bạn chưa làm buckets thì comment dòng này và UI vẫn chạy
    const data = await api<BucketRow[]>("/api/admin/storage/buckets");
    setBuckets(data);
  }

  async function loadObjects() {
    const params = new URLSearchParams();
    if (searchKey.trim()) params.set("query", searchKey.trim());
    params.set("visibility", filterVisibility);

    const data = await api<ObjectRow[]>(`/api/admin/storage/objects?${params.toString()}`);
    setObjects(data);
  }

  async function loadLogs() {
    const data = await api<LogRow[]>("/api/admin/storage/logs");
    setLogs(data);
  }

  async function initialLoad() {
    setBusy(true);
    setToast(null);
    try {
      await loadSettings();
      await Promise.all([loadObjects(), loadLogs(), loadBuckets().catch(() => {})]);
    } catch (e: any) {
      setToast({ type: "error", text: e.message || "Failed to load storage data." });
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    initialLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === "BROWSER") loadObjects().catch(() => {});
    if (activeTab === "LOGS") loadLogs().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // ---------- Actions ----------
  function switchProvider(next: StorageProvider) {
    setSettings((s) => ({ ...s, provider: next, status: "DISCONNECTED" }));
    setDirty(true);
    setToast({ type: "info", text: `Switched to ${providerMeta(next).title}. Configure and save.` });
    pushLocalLog("INFO", "Switch provider", `Provider changed to ${providerMeta(next).title}.`);
  }

  async function save() {
    const v = validate();
    if (!v.ok) {
      setToast({ type: "error", text: v.msg || "Invalid configuration." });
      pushLocalLog("ERROR", "Save", v.msg || "Invalid configuration.");
      return;
    }

    setBusy(true);
    setToast(null);
    try {
      const data = await api<StorageSettings>("/api/admin/storage/settings", {
        method: "PUT",
        body: JSON.stringify(settings),
      });
      setSettings(data);
      setDirty(false);
      setToast({ type: "success", text: "Saved settings." });

      await Promise.all([loadLogs(), loadBuckets().catch(() => {})]);
    } catch (e: any) {
      setToast({ type: "error", text: e.message || "Save failed." });
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    setToast(null);
    try {
      // nếu backend PUT không cho cập nhật status, bạn tạo API riêng.
      const data = await api<StorageSettings>("/api/admin/storage/settings", {
        method: "PUT",
        body: JSON.stringify({ ...settings, status: "DISCONNECTED" }),
      });
      setSettings(data);
      setDirty(false);
      setToast({ type: "info", text: "Disconnected." });
      await loadLogs();
    } catch (e: any) {
      setToast({ type: "error", text: e.message || "Disconnect failed." });
    } finally {
      setBusy(false);
    }
  }

  function resetDefaults() {
    setSettings(defaults);
    setDirty(true);
    setToast({ type: "info", text: "Reset to defaults (not saved yet)." });
    pushLocalLog("WARN", "Reset", "Reset settings (UI only).");
  }

  async function testUpload() {
    const v = validate();
    if (!v.ok) {
      setToast({ type: "error", text: v.msg || "Invalid configuration." });
      return;
    }

    setBusy(true);
    setToast(null);
    try {
      await api<{ status: Status; key?: string }>("/api/admin/storage/test-upload", { method: "POST" });
      setToast({ type: "success", text: "Test upload succeeded." });

      await Promise.all([loadSettings(), loadObjects(), loadLogs()]);
      setDirty(false);
    } catch (e: any) {
      setToast({ type: "error", text: e.message || "Test upload failed." });
      await Promise.all([loadSettings().catch(() => {}), loadLogs().catch(() => {})]);
    } finally {
      setBusy(false);
    }
  }

  async function addBucket() {
    const name = prompt("Bucket name")?.trim();
    if (!name) return;

    setBusy(true);
    setToast(null);
    try {
      await api<BucketRow>("/api/admin/storage/buckets", {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      setToast({ type: "success", text: "Bucket added." });
      await Promise.all([loadBuckets().catch(() => {}), loadLogs()]);
    } catch (e: any) {
      setToast({ type: "error", text: e.message || "Add bucket failed." });
    } finally {
      setBusy(false);
    }
  }

  function purgeCdn() {
    setToast({ type: "info", text: "CDN purge queued (mock)." });
    pushLocalLog("INFO", "CDN purge", "Purge request queued (mock).");
  }

  async function deleteObject(key: string) {
    if (!confirm(`Delete object ${key}?`)) return;

    setBusy(true);
    setToast(null);
    try {
      await api<{ deleted: true; affected: number }>(`/api/admin/storage/objects?key=${encodeURIComponent(key)}`, { method: "DELETE" });
      setToast({ type: "info", text: "Object deleted." });
      await Promise.all([loadObjects(), loadLogs()]);
    } catch (e: any) {
      setToast({ type: "error", text: e.message || "Delete failed." });
    } finally {
      setBusy(false);
    }
  }

  function copyUrl(key: string) {
    const base = settings.publicBaseUrl.replace(/\/+$/, "");
    const url = `${base}/${key.replace(/^\/+/, "")}`;
    navigator.clipboard?.writeText(url);
    setToast({ type: "success", text: "Copied public URL." });
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
              <i className="bi bi-database" /> Storage
            </span>
          </div>

          <div className={styles.titleRow}>
            <h1 className={styles.title}>Storage</h1>
            <span className={styles.subtitle}>Configure file storage provider, security, limits, CDN and browse objects</span>
          </div>

          <div className={styles.headMeta}>
            <span className={`${styles.badge} ${styles[bm.cls]}`}>
              <i className={`bi ${bm.icon}`} /> {bm.label}
            </span>
            <span className={styles.metaDot}>•</span>
            <span className={styles.metaText}>
              Provider: <b>{pm.title}</b>
            </span>
            <span className={styles.metaDot}>•</span>
            <span className={styles.metaText}>
              Default: <b>{settings.privateByDefault ? "Private" : "Public"}</b>
            </span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button className={styles.secondaryBtn} type="button" onClick={resetDefaults} disabled={busy}>
            <i className="bi bi-arrow-counterclockwise" /> Reset
          </button>
          <button className={styles.secondaryBtn} type="button" onClick={disconnect} disabled={busy || settings.status === "DISCONNECTED"}>
            <i className="bi bi-plug" /> Disconnect
          </button>
          <button className={styles.primaryBtn} type="button" onClick={save} disabled={busy || !dirty}>
            <i className="bi bi-cloud-check" /> Save
          </button>
          <button className={styles.primaryBtn} type="button" onClick={testUpload} disabled={busy}>
            <i className={`bi ${busy ? "bi-hourglass-split" : "bi-upload"}`} />
            {busy ? "Testing..." : "Test upload"}
          </button>
        </div>
      </div>

      {/* Provider cards */}
      <div className={styles.providers}>
        {(["R2", "S3", "LOCAL"] as StorageProvider[]).map((k) => {
          const m = providerMeta(k);
          const active = settings.provider === k;
          return (
            <button key={k} type="button" className={`${styles.providerCard} ${active ? styles.providerActive : ""}`} onClick={() => switchProvider(k)} disabled={busy}>
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
        <button type="button" className={`${styles.tab} ${activeTab === "BROWSER" ? styles.tabActive : ""}`} onClick={() => setActiveTab("BROWSER")}>
          <i className="bi bi-folder2-open" /> Browser
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
                    <i className="bi bi-sliders" /> Common settings
                  </div>
                  <div className={styles.cardHint}>Base URL, prefix, security and limits</div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <Field label="Public base URL" hint="https://cdn.yourdomain.com">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-link-45deg ${styles.inputIcon}`} />
                        <input className={styles.input} value={settings.publicBaseUrl} onChange={(e) => update("publicBaseUrl", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Root prefix" hint="uploads/">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-folder2 ${styles.inputIcon}`} />
                        <input className={styles.input} value={settings.rootPrefix} onChange={(e) => update("rootPrefix", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Default visibility" hint="Applied to new uploads.">
                      <Toggle checked={!settings.privateByDefault} onChange={(v) => update("privateByDefault", !v)} labels={["Private", "Public"]} />
                    </Field>

                    <Field label="Signed URLs" hint="Generate temporary access links.">
                      <Toggle checked={settings.signedUrlEnabled} onChange={(v) => update("signedUrlEnabled", v)} labels={["Off", "On"]} />
                    </Field>

                    <Field label="Signed URL TTL (seconds)" hint="e.g. 900">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-hourglass-split ${styles.inputIcon}`} />
                        <input
                          className={styles.input}
                          type="number"
                          value={settings.signedUrlTtlSeconds}
                          onChange={(e) => update("signedUrlTtlSeconds", Math.max(1, Number(e.target.value || 0)))}
                          disabled={!settings.signedUrlEnabled}
                        />
                      </div>
                    </Field>

                    <Field label="Max upload (MB)" hint="Global limit.">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-upload ${styles.inputIcon}`} />
                        <input className={styles.input} type="number" value={settings.maxUploadMb} onChange={(e) => update("maxUploadMb", Math.max(1, Number(e.target.value || 0)))} />
                      </div>
                    </Field>

                    <Field label="Allowed MIME types" hint="Comma-separated patterns">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-shield-check ${styles.inputIcon}`} />
                        <input className={styles.input} value={settings.allowedMime} onChange={(e) => update("allowedMime", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Image optimization" hint="Optional pipeline (mock).">
                      <Toggle checked={settings.enableImageOptimization} onChange={(v) => update("enableImageOptimization", v)} labels={["Off", "On"]} />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Provider-specific */}
              {settings.provider === "LOCAL" ? (
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardTitle}>
                      <i className="bi bi-hdd" /> Local storage
                    </div>
                    <div className={styles.cardHint}>Use for dev or single-server deployments</div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.formGrid}>
                      <Field label="Local directory" hint="./public/uploads">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-folder2-open ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.localDir} onChange={(e) => update("localDir", e.target.value)} />
                        </div>
                      </Field>
                    </div>
                  </div>
                </div>
              ) : null}

              {settings.provider === "S3" ? (
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardTitle}>
                      <i className="bi bi-cloud" /> S3 configuration
                    </div>
                    <div className={styles.cardHint}>Bucket, region and credentials</div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.formGrid}>
                      <Field label="Bucket" hint="my-bucket">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-bucket ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.bucket} onChange={(e) => update("bucket", e.target.value)} />
                        </div>
                      </Field>

                      <Field label="Region" hint="ap-southeast-1">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-geo-alt ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.region} onChange={(e) => update("region", e.target.value)} />
                        </div>
                      </Field>

                      <Field label="Access key ID" hint="AKIA...">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-key ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.accessKeyId} onChange={(e) => update("accessKeyId", e.target.value)} />
                        </div>
                      </Field>

                      <Field label="Secret access key" hint="Store in vault/DB encrypted">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-shield-lock ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.secretAccessKey} onChange={(e) => update("secretAccessKey", e.target.value)} />
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
                        onClick={async () => {
                          setToast({ type: "info", text: "IAM policy helper (mock)." });
                          // ✅ thay pushLog -> local log + (tuỳ) refresh logs thật
                          pushLocalLog("INFO", "IAM policy", "Opened IAM policy helper (mock).");
                        }}>
                        <i className="bi bi-shield-check" /> IAM policy
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {settings.provider === "R2" ? (
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardTitle}>
                      <i className="bi bi-cloud-lightning" /> Cloudflare R2 configuration
                    </div>
                    <div className={styles.cardHint}>S3-compatible endpoint + credentials</div>
                  </div>
                  <div className={styles.cardBody}>
                    <div className={styles.formGrid}>
                      <Field label="Bucket" hint="my-r2-bucket">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-bucket ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.bucket} onChange={(e) => update("bucket", e.target.value)} />
                        </div>
                      </Field>

                      <Field label="Region" hint="auto">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-geo-alt ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.region} onChange={(e) => update("region", e.target.value)} />
                        </div>
                      </Field>

                      <Field label="Endpoint URL" hint="https://<accountid>.r2.cloudflarestorage.com">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-globe2 ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.endpointUrl} onChange={(e) => update("endpointUrl", e.target.value)} />
                        </div>
                      </Field>

                      <Field label="Access key ID" hint="...">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-key ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.accessKeyId} onChange={(e) => update("accessKeyId", e.target.value)} />
                        </div>
                      </Field>

                      <Field label="Secret access key" hint="Store in vault/DB encrypted">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-shield-lock ${styles.inputIcon}`} />
                          <input className={styles.input} value={settings.secretAccessKey} onChange={(e) => update("secretAccessKey", e.target.value)} />
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
                          update("purgeEnabled", !settings.purgeEnabled);
                          setToast({ type: "info", text: `CDN purge ${!settings.purgeEnabled ? "enabled" : "disabled"} (mock).` });
                          pushLocalLog("INFO", "Toggle purge", "Toggled CDN purge (mock).");
                        }}>
                        <i className="bi bi-lightning" /> Toggle purge
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* CDN */}
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-globe2" /> CDN & Cache
                  </div>
                  <div className={styles.cardHint}>Cache control headers and purge</div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <Field label="Cache-Control" hint="Applied to public objects (mock).">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-clock ${styles.inputIcon}`} />
                        <input className={styles.input} value={settings.cacheControl} onChange={(e) => update("cacheControl", e.target.value)} />
                      </div>
                    </Field>

                    <Field label="Purge enabled" hint="Allow purge actions from admin.">
                      <Toggle checked={settings.purgeEnabled} onChange={(v) => update("purgeEnabled", v)} labels={["Off", "On"]} />
                    </Field>
                  </div>

                  <div className={styles.inlineActions}>
                    <button className={styles.secondaryBtn} type="button" onClick={purgeCdn} disabled={!settings.purgeEnabled}>
                      <i className="bi bi-lightning-charge" /> Purge CDN
                    </button>
                    <button className={styles.secondaryBtn} type="button" onClick={addBucket}>
                      <i className="bi bi-plus-circle" /> Add bucket
                    </button>
                  </div>
                </div>
              </div>

              {/* Buckets */}
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-bucket" /> Buckets
                  </div>
                  <div className={styles.cardHint}>Overview</div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.bucketGrid}>
                    {buckets.map((b) => (
                      <div key={b.id} className={styles.bucketCard}>
                        <div className={styles.bucketTop}>
                          <div className={styles.bucketName}>
                            <i className="bi bi-bucket" /> {b.name}
                          </div>
                          <span className={`${styles.chip} ${styles.chipMuted}`}>
                            <i className="bi bi-cloud" /> {providerMeta(b.provider).title}
                          </span>
                        </div>
                        <div className={styles.bucketMeta}>
                          <span className={styles.metaPill}>
                            <i className="bi bi-files" /> {b.objects} objects
                          </span>
                          <span className={styles.metaPill}>
                            <i className="bi bi-box-seam" /> {b.sizeGb} GB
                          </span>
                          <span className={styles.metaPill}>
                            <i className="bi bi-geo-alt" /> {b.region || "—"}
                          </span>
                        </div>
                        <div className={styles.bucketFoot}>
                          <span className={styles.bucketUpdated}>Updated: {fmtDateTime(b.updatedAt)}</span>
                          <button
                            className={styles.smallBtn}
                            type="button"
                            onClick={() => {
                              setActiveTab("BROWSER");
                              setToast({ type: "info", text: `Open browser for ${b.name}` });
                            }}>
                            <i className="bi bi-folder2-open" /> Browse
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.noteCallout}>
                    <i className="bi bi-info-circle" />
                    <div>
                      <b>No-code tip:</b> expose “Upload policy” (mime, max size, visibility) để users map vào các components Upload trong builder.
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {activeTab === "BROWSER" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardTitle}>
                  <i className="bi bi-folder2-open" /> Object browser
                </div>
                <div className={styles.cardHint}>Search, filter visibility, copy URLs, delete</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.browserTools}>
                  <div className={styles.searchWrap}>
                    <i className={`bi bi-search ${styles.searchIcon}`} />
                    <input
                      className={styles.search}
                      placeholder="Search by key (e.g. uploads/avatars/...)"
                      value={searchKey}
                      onChange={(e) => setSearchKey(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") loadObjects().catch(() => {});
                      }}
                    />
                  </div>

                  <div className={styles.selectWrap}>
                    <i className={`bi bi-funnel ${styles.selectIcon}`} />
                    <select className={styles.select} value={filterVisibility} onChange={(e) => setFilterVisibility(e.target.value as any)} onBlur={() => loadObjects().catch(() => {})}>
                      <option value="ALL">All</option>
                      <option value="PUBLIC">Public</option>
                      <option value="PRIVATE">Private</option>
                    </select>
                  </div>

                  <button className={styles.secondaryBtn} type="button" onClick={() => loadObjects().catch((e) => setToast({ type: "error", text: e.message }))} disabled={busy}>
                    <i className="bi bi-arrow-clockwise" /> Refresh
                  </button>
                </div>

                <div className={styles.table}>
                  <div className={styles.thead}>
                    <div>Key</div>
                    <div>Type</div>
                    <div>Size</div>
                    <div>Visibility</div>
                    <div>Updated</div>
                    <div className={styles.tactions}>Actions</div>
                  </div>

                  {filteredObjects.length === 0 ? (
                    <div className={styles.empty}>
                      <i className="bi bi-inbox" />
                      <div className={styles.emptyTitle}>No objects</div>
                      <div className={styles.emptyHint}>Try a different filter or upload a test file.</div>
                    </div>
                  ) : (
                    filteredObjects.map((o) => (
                      <div key={o.key} className={styles.trow}>
                        <div className={styles.keyCell}>
                          <i className="bi bi-file-earmark" />
                          <span className={styles.keyText}>{o.key}</span>
                        </div>
                        <div className={styles.mono}>{o.type}</div>
                        <div>{o.sizeKb} KB</div>
                        <div>
                          <span className={`${styles.chip} ${o.visibility === "PUBLIC" ? styles.chipOk : styles.chipMuted}`}>
                            <i className={`bi ${o.visibility === "PUBLIC" ? "bi-unlock" : "bi-lock"}`} />
                            {o.visibility}
                          </span>
                        </div>
                        <div>{fmtDateTime(o.updatedAt)}</div>
                        <div className={styles.actions}>
                          <button className={styles.iconBtn} type="button" onClick={() => copyUrl(o.key)} title="Copy public URL">
                            <i className="bi bi-clipboard" />
                          </button>

                          {/* Signed URL mock */}
                          <button
                            className={styles.iconBtn}
                            type="button"
                            onClick={() => {
                              setToast({ type: "info", text: "Generate signed URL (mock)." });
                              // ✅ thay pushLog -> pushLocalLog để không lỗi
                              pushLocalLog("INFO", "Signed URL", `Generated signed URL for ${o.key} (mock).`);
                            }}
                            disabled={!settings.signedUrlEnabled}
                            title="Generate signed URL">
                            <i className="bi bi-link" />
                          </button>

                          <button className={`${styles.iconBtn} ${styles.dangerIconBtn}`} type="button" onClick={() => deleteObject(o.key)} title="Delete" disabled={busy}>
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "LOGS" ? (
            <div className={styles.card}>
              <div className={styles.cardHead}>
                <div className={styles.cardTitle}>
                  <i className="bi bi-journal-text" /> Storage logs
                </div>
                <div className={styles.cardHint}>Uploads, signed URLs, deletes</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.inlineActions}>
                  <button className={styles.secondaryBtn} type="button" onClick={() => loadLogs().catch((e) => setToast({ type: "error", text: e.message }))} disabled={busy}>
                    <i className="bi bi-arrow-clockwise" /> Refresh
                  </button>

                  {/* Clear UI-only (không xoá DB) */}
                  <button
                    className={`${styles.secondaryBtn} ${styles.dangerBtn}`}
                    type="button"
                    onClick={() => {
                      setLogs([]);
                      setToast({ type: "info", text: "Logs cleared (UI only)." });
                    }}>
                    <i className="bi bi-trash3" /> Clear
                  </button>
                </div>

                <div className={styles.logs}>
                  {logs.length === 0 ? (
                    <div className={styles.empty}>
                      <i className="bi bi-inbox" />
                      <div className={styles.emptyTitle}>No logs</div>
                      <div className={styles.emptyHint}>Logs will appear when actions are performed.</div>
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
              <div className={styles.cardHint}>Affects uploads and access</div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.dangerRow}>
                <div>
                  <div className={styles.dangerTitle}>Purge secrets</div>
                  <div className={styles.dangerHint}>Remove stored credentials (UI state only, save to apply).</div>
                </div>
                <button
                  className={`${styles.secondaryBtn} ${styles.dangerBtn}`}
                  type="button"
                  onClick={() => {
                    update("accessKeyId", "");
                    update("secretAccessKey", "");
                    setToast({ type: "info", text: "Secrets purged (not saved yet)." });
                    // ✅ thay pushLog -> pushLocalLog
                    pushLocalLog("WARN", "Purge secrets", "Purged credentials (UI only, not saved yet).");
                  }}>
                  <i className="bi bi-shield-x" /> Purge
                </button>
              </div>

              <div className={styles.dangerRow}>
                <div>
                  <div className={styles.dangerTitle}>Disable signed URLs</div>
                  <div className={styles.dangerHint}>May break private content access.</div>
                </div>
                <button
                  className={`${styles.secondaryBtn} ${styles.dangerBtn}`}
                  type="button"
                  onClick={() => {
                    update("signedUrlEnabled", false);
                    setToast({ type: "info", text: "Signed URLs disabled (not saved yet)." });
                    pushLocalLog("WARN", "Disable signed", "Signed URLs disabled (UI only, not saved yet).");
                  }}>
                  <i className="bi bi-link-45deg" /> Disable
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
              <MiniRow icon="bi-cloud" label="Provider" value={pm.title} />
              <MiniRow icon="bi-link-45deg" label="Public base URL" value={settings.publicBaseUrl || "—"} />
              <MiniRow icon="bi-folder2" label="Root prefix" value={settings.rootPrefix || "—"} />
              <MiniRow icon="bi-upload" label="Max upload" value={`${settings.maxUploadMb} MB`} />
              <MiniRow icon="bi-lock" label="Default" value={settings.privateByDefault ? "Private" : "Public"} />
              <MiniRow icon="bi-link" label="Signed URLs" value={settings.signedUrlEnabled ? `On (${settings.signedUrlTtlSeconds}s)` : "Off"} />

              <div className={styles.hr} />

              <div className={styles.sideHint}>
                <i className="bi bi-info-circle" />
                <div>
                  Trạng thái config: <b>{health.ok ? "Looks good" : "Needs attention"}</b>. (validator)
                </div>
              </div>

              <div className={styles.sideActions}>
                <button className={styles.secondaryBtn} type="button" onClick={() => setShowSecrets(true)} disabled={settings.provider === "LOCAL"}>
                  <i className="bi bi-eye" /> Secrets
                </button>
                <button className={styles.secondaryBtn} type="button" onClick={() => setActiveTab("BROWSER")}>
                  <i className="bi bi-folder2-open" /> Browser
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

            {settings.provider !== "LOCAL" ? (
              <div className={styles.secretList}>
                <SecretRow label="Access key ID" value={maskSecret(settings.accessKeyId)} />
                <SecretRow label="Secret access key" value={maskSecret(settings.secretAccessKey)} />
                {settings.provider === "R2" ? <SecretRow label="Endpoint URL" value={settings.endpointUrl || "—"} /> : null}
              </div>
            ) : (
              <div className={styles.secretRow}>
                <div className={styles.secretLabel}>Local storage</div>
                <div className={styles.secretValue}>No secrets required.</div>
              </div>
            )}

            <div className={styles.inlineActions}>
              <button
                className={styles.secondaryBtn}
                type="button"
                onClick={() => {
                  setToast({ type: "success", text: "Copied masked values (mock)." });
                  pushLocalLog("INFO", "Copy secrets", "Copied masked secrets (mock).");
                }}>
                <i className="bi bi-clipboard" /> Copy masked
              </button>
              <button
                className={styles.secondaryBtn}
                type="button"
                onClick={() => {
                  setToast({ type: "info", text: "Rotate keys (mock) — implement vault flow later." });
                  pushLocalLog("INFO", "Rotate keys", "Rotate access keys (mock).");
                }}>
                <i className="bi bi-arrow-repeat" /> Rotate keys
              </button>
            </div>
          </div>
        </div>
      </aside>

      {showSecrets ? <button className={styles.backdrop} onClick={() => setShowSecrets(false)} aria-label="Close drawer" /> : null}
    </div>
  );
}

/* ---------- small components ---------- */

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
