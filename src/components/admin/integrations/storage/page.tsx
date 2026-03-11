"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/integrations/storage/storage.module.css";

type StorageProvider = "LOCAL" | "R2";
type Status = "DISCONNECTED" | "CONNECTED" | "ERROR";
type Visibility = "PUBLIC" | "PRIVATE";
type TabKey = "CONFIG" | "BROWSER" | "LOGS";

type StorageSettings = {
  provider: StorageProvider;
  status: Status;

  publicBaseUrl: string;
  rootPrefix: string;
  privateByDefault: boolean;
  signedUrlEnabled: boolean;
  signedUrlTtlSeconds: number;

  maxUploadMb: number;
  allowedMime: string;
  enableImageOptimization: boolean;

  localDir: string;

  region: string;
  bucket: string;
  endpointUrl: string;
  accessKeyId: string;
  secretAccessKey: string;

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
  visibility: Visibility;
  updatedAt: string;
};

type LogRow = {
  id: string;
  at: string;
  level: "INFO" | "WARN" | "ERROR";
  action: string;
  message: string;
};

type ToastState = {
  type: "success" | "error" | "info";
  text: string;
} | null;

const API_BASE = "/api/admin/integrations/storage";

const DEFAULTS: StorageSettings = {
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

function formatDateTime(iso: string) {
  if (!iso) return "—";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatSizeKb(sizeKb: number) {
  if (!Number.isFinite(sizeKb) || sizeKb <= 0) return "0 KB";
  if (sizeKb < 1024) return `${sizeKb} KB`;

  const mb = sizeKb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;

  const gb = mb / 1024;
  return `${gb.toFixed(2)} GB`;
}

function maskSecret(value: string) {
  if (!value) return "";
  const clean = value.trim();
  if (clean.length <= 8) return "•".repeat(clean.length);
  return `${clean.slice(0, 4)}••••••••••${clean.slice(-4)}`;
}

function normalizePrefix(prefix: string) {
  const clean = prefix.trim().replace(/^\/+/, "");
  if (!clean) return "uploads/";
  return clean.endsWith("/") ? clean : `${clean}/`;
}

function joinUrl(base: string, path: string) {
  const left = (base || "").replace(/\/+$/, "");
  const right = (path || "").replace(/^\/+/, "");
  if (!left) return right;
  if (!right) return left;
  return `${left}/${right}`;
}

function buildPublicUrl(settings: StorageSettings, objectKey: string) {
  const base = settings.publicBaseUrl.trim();
  if (!base) return "";
  return joinUrl(base, objectKey);
}

function badgeMeta(status: Status) {
  if (status === "CONNECTED") {
    return { cls: "badgeOk", icon: "bi-check-circle", label: "Connected" };
  }

  if (status === "ERROR") {
    return { cls: "badgeErr", icon: "bi-exclamation-triangle", label: "Error" };
  }

  return { cls: "badgeOff", icon: "bi-plug", label: "Disconnected" };
}

function providerMeta(provider: StorageProvider) {
  if (provider === "LOCAL") {
    return {
      title: "Local",
      icon: "bi-hdd",
      hint: "Lưu file trên máy chủ cục bộ",
    };
  }

  return {
    title: "Cloudflare R2",
    icon: "bi-cloud-lightning",
    hint: "Object storage cho production",
  };
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || `Request failed: ${response.status}`);
  }

  return payload.data as T;
}

export default function StoragePage() {
  const [settings, setSettings] = useState<StorageSettings>(DEFAULTS);
  const [dirty, setDirty] = useState(false);

  const [activeTab, setActiveTab] = useState<TabKey>("CONFIG");
  const [toast, setToast] = useState<ToastState>(null);

  const [busy, setBusy] = useState(false);
  const [showSecrets, setShowSecrets] = useState(false);
  const [showRawSecret, setShowRawSecret] = useState(false);

  const [buckets, setBuckets] = useState<BucketRow[]>([]);
  const [objects, setObjects] = useState<ObjectRow[]>([]);
  const [logs, setLogs] = useState<LogRow[]>([]);

  const [searchKey, setSearchKey] = useState("");
  const [appliedSearchKey, setAppliedSearchKey] = useState("");
  const [filterVisibility, setFilterVisibility] = useState<"ALL" | Visibility>("ALL");

  const didInitRef = useRef(false);
  const loadedBrowserRef = useRef(false);
  const loadedLogsRef = useRef(false);

  const bm = useMemo(() => badgeMeta(settings.status), [settings.status]);
  const pm = useMemo(() => providerMeta(settings.provider), [settings.provider]);

  const filteredObjects = useMemo(() => {
    return objects;
  }, [objects]);

  const health = useMemo(() => {
    const baseOk = settings.publicBaseUrl.trim().length > 0;
    const prefixOk = settings.rootPrefix.trim().length > 0;
    const mimeOk = settings.allowedMime.trim().length > 0;
    const uploadOk = settings.maxUploadMb > 0;
    const signedOk = !settings.signedUrlEnabled || settings.signedUrlTtlSeconds > 0;

    const providerOk =
      settings.provider === "LOCAL"
        ? settings.localDir.trim().length > 0
        : settings.bucket.trim().length > 0 &&
          settings.endpointUrl.trim().length > 0 &&
          settings.accessKeyId.trim().length > 0 &&
          settings.secretAccessKey.trim().length > 0;

    return {
      ok: baseOk && prefixOk && mimeOk && uploadOk && signedOk && providerOk,
      baseOk,
      prefixOk,
      mimeOk,
      uploadOk,
      signedOk,
      providerOk,
    };
  }, [settings]);

  const showError = useCallback((message: string) => {
    setToast({ type: "error", text: message });
  }, []);

  const showInfo = useCallback((message: string) => {
    setToast({ type: "info", text: message });
  }, []);

  const showSuccess = useCallback((message: string) => {
    setToast({ type: "success", text: message });
  }, []);

  const updateSetting = useCallback(<K extends keyof StorageSettings>(key: K, value: StorageSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  }, []);

  const validate = useCallback((): { ok: boolean; msg?: string } => {
    if (!settings.publicBaseUrl.trim()) {
      return { ok: false, msg: "Public base URL là bắt buộc." };
    }

    if (!settings.rootPrefix.trim()) {
      return { ok: false, msg: "Root prefix là bắt buộc." };
    }

    if (settings.maxUploadMb <= 0) {
      return { ok: false, msg: "Max upload phải lớn hơn 0." };
    }

    if (!settings.allowedMime.trim()) {
      return { ok: false, msg: "Allowed MIME types là bắt buộc." };
    }

    if (settings.signedUrlEnabled && settings.signedUrlTtlSeconds <= 0) {
      return { ok: false, msg: "Signed URL TTL phải lớn hơn 0." };
    }

    if (settings.provider === "LOCAL") {
      if (!settings.localDir.trim()) {
        return { ok: false, msg: "Local directory là bắt buộc." };
      }
      return { ok: true };
    }

    if (!settings.bucket.trim()) {
      return { ok: false, msg: "Bucket là bắt buộc." };
    }

    if (!settings.endpointUrl.trim()) {
      return { ok: false, msg: "Endpoint URL là bắt buộc." };
    }

    if (!settings.accessKeyId.trim()) {
      return { ok: false, msg: "Access key ID là bắt buộc." };
    }

    if (!settings.secretAccessKey.trim()) {
      return { ok: false, msg: "Secret access key là bắt buộc." };
    }

    return { ok: true };
  }, [settings]);

  const loadSettings = useCallback(async () => {
    const data = await api<StorageSettings>(`${API_BASE}/settings`);
    setSettings({
      ...DEFAULTS,
      ...data,
      provider: data.provider === "LOCAL" ? "LOCAL" : "R2",
    });
    setDirty(false);
  }, []);

  const loadBuckets = useCallback(async () => {
    const data = await api<BucketRow[]>(`${API_BASE}/buckets`);
    setBuckets(data.filter((item) => item.provider === "LOCAL" || item.provider === "R2"));
  }, []);

  const loadObjects = useCallback(
    async (opts?: { query?: string; visibility?: "ALL" | Visibility }) => {
      const params = new URLSearchParams();

      const nextQuery = (opts?.query ?? appliedSearchKey).trim();
      const nextVisibility = opts?.visibility ?? filterVisibility;

      if (nextQuery) {
        params.set("query", nextQuery);
      }

      params.set("visibility", nextVisibility);

      const data = await api<ObjectRow[]>(`${API_BASE}/objects?${params.toString()}`);
      setObjects(data);
      loadedBrowserRef.current = true;
    },
    [appliedSearchKey, filterVisibility],
  );

  const loadLogs = useCallback(async () => {
    const data = await api<LogRow[]>(`${API_BASE}/logs`);
    setLogs(data);
    loadedLogsRef.current = true;
  }, []);

  const initialLoad = useCallback(async () => {
    setBusy(true);
    setToast(null);

    try {
      await Promise.all([loadSettings(), loadBuckets()]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Không thể tải cấu hình storage.";
      setToast({ type: "error", text: message });
    } finally {
      setBusy(false);
    }
  }, [loadBuckets, loadSettings]);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    void initialLoad();
  }, [initialLoad]);

  useEffect(() => {
    if (activeTab === "BROWSER" && !loadedBrowserRef.current) {
      void loadObjects().catch(() => {});
    }

    if (activeTab === "LOGS" && !loadedLogsRef.current) {
      void loadLogs().catch(() => {});
    }
  }, [activeTab, loadLogs, loadObjects]);

  const switchProvider = useCallback(
    (next: StorageProvider) => {
      setSettings((prev) => ({
        ...prev,
        provider: next,
        status: "DISCONNECTED",
      }));
      setDirty(true);
      showInfo(`Đã chuyển sang ${providerMeta(next).title}. Hãy kiểm tra cấu hình và lưu lại.`);
    },
    [showInfo],
  );

  const save = useCallback(async () => {
    const result = validate();
    if (!result.ok) {
      showError(result.msg || "Cấu hình chưa hợp lệ.");
      return;
    }

    setBusy(true);
    setToast(null);

    try {
      const payload: StorageSettings = {
        ...settings,
        rootPrefix: normalizePrefix(settings.rootPrefix),
      };

      const data = await api<StorageSettings>(`${API_BASE}/settings`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });

      setSettings({
        ...DEFAULTS,
        ...data,
        provider: data.provider === "LOCAL" ? "LOCAL" : "R2",
      });
      setDirty(false);
      showSuccess("Đã lưu cấu hình storage.");

      await Promise.all([loadBuckets().catch(() => {}), loadLogs().catch(() => {})]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Lưu cấu hình thất bại.";
      showError(message);
    } finally {
      setBusy(false);
    }
  }, [loadBuckets, loadLogs, settings, showError, showSuccess, validate]);

  const disconnect = useCallback(async () => {
    setBusy(true);
    setToast(null);

    try {
      const data = await api<StorageSettings>(`${API_BASE}/settings`, {
        method: "PUT",
        body: JSON.stringify({ ...settings, status: "DISCONNECTED" }),
      });

      setSettings({
        ...DEFAULTS,
        ...data,
        provider: data.provider === "LOCAL" ? "LOCAL" : "R2",
      });
      setDirty(false);
      showInfo("Đã ngắt kết nối storage.");
      await loadLogs().catch(() => {});
    } catch (error) {
      const message = error instanceof Error ? error.message : "Disconnect thất bại.";
      showError(message);
    } finally {
      setBusy(false);
    }
  }, [loadLogs, settings, showError, showInfo]);

  const resetDefaults = useCallback(() => {
    setSettings(DEFAULTS);
    setDirty(true);
    showInfo("Đã reset về mặc định. Chưa lưu xuống hệ thống.");
  }, [showInfo]);

  const testUpload = useCallback(async () => {
    const result = validate();
    if (!result.ok) {
      showError(result.msg || "Cấu hình chưa hợp lệ.");
      return;
    }

    setBusy(true);
    setToast(null);

    try {
      await api<{ status: Status; key?: string }>(`${API_BASE}/test-upload`, {
        method: "POST",
      });

      showSuccess("Test upload thành công.");
      await Promise.all([
        loadSettings().catch(() => {}),
        loadBuckets().catch(() => {}),
        activeTab === "BROWSER" ? loadObjects().catch(() => {}) : Promise.resolve(),
        activeTab === "LOGS" ? loadLogs().catch(() => {}) : Promise.resolve(),
      ]);
      setDirty(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Test upload thất bại.";
      showError(message);
      await Promise.all([loadSettings().catch(() => {}), loadLogs().catch(() => {})]);
    } finally {
      setBusy(false);
    }
  }, [activeTab, loadBuckets, loadLogs, loadObjects, loadSettings, showError, showSuccess, validate]);

  const addBucket = useCallback(async () => {
    const name = window.prompt("Bucket name")?.trim();
    if (!name) return;

    setBusy(true);
    setToast(null);

    try {
      await api<BucketRow>(`${API_BASE}/buckets`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });

      showSuccess("Đã tạo bucket.");
      await Promise.all([loadBuckets().catch(() => {}), loadLogs().catch(() => {})]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tạo bucket thất bại.";
      showError(message);
    } finally {
      setBusy(false);
    }
  }, [loadBuckets, loadLogs, showError, showSuccess]);

  const purgeCdn = useCallback(() => {
    showInfo("Đã đưa yêu cầu purge CDN vào hàng đợi.");
  }, [showInfo]);

  const deleteObject = useCallback(
    async (key: string) => {
      const accepted = window.confirm(`Xóa object "${key}"?`);
      if (!accepted) return;

      setBusy(true);
      setToast(null);

      try {
        await api<{ deleted: true; affected: number }>(`${API_BASE}/objects?key=${encodeURIComponent(key)}`, {
          method: "DELETE",
        });

        showSuccess("Đã xóa object.");
        await Promise.all([loadObjects().catch(() => {}), loadLogs().catch(() => {})]);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Xóa object thất bại.";
        showError(message);
      } finally {
        setBusy(false);
      }
    },
    [loadLogs, loadObjects, showError, showSuccess],
  );

  const copyUrl = useCallback(
    async (key: string) => {
      try {
        const url = buildPublicUrl(settings, key);

        if (!url) {
          showError("Public base URL chưa được cấu hình.");
          return;
        }

        await navigator.clipboard.writeText(url);
        showSuccess("Đã copy public URL.");
      } catch {
        showError("Không thể copy URL.");
      }
    },
    [settings, showError, showSuccess],
  );

  const runSearch = useCallback(async () => {
    const next = searchKey.trim();
    setAppliedSearchKey(next);
    try {
      await loadObjects({ query: next, visibility: filterVisibility });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Tìm kiếm thất bại.";
      showError(message);
    }
  }, [filterVisibility, loadObjects, searchKey, showError]);

  const changeVisibilityFilter = useCallback(
    async (value: "ALL" | Visibility) => {
      setFilterVisibility(value);
      try {
        await loadObjects({ query: searchKey.trim(), visibility: value });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Lọc dữ liệu thất bại.";
        showError(message);
      }
    },
    [loadObjects, searchKey, showError],
  );

  const providerCards: StorageProvider[] = ["R2", "LOCAL"];

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "CONFIG" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("CONFIG")}
          >
            <i className="bi bi-sliders" /> Configuration
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "BROWSER" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("BROWSER")}
          >
            <i className="bi bi-folder2-open" /> Browser
          </button>
          <button
            type="button"
            className={`${styles.tab} ${activeTab === "LOGS" ? styles.tabActive : ""}`}
            onClick={() => setActiveTab("LOGS")}
          >
            <i className="bi bi-journal-text" /> Logs
          </button>
        </div>

        <div className={styles.providers}>
          {providerCards.map((provider) => {
            const meta = providerMeta(provider);
            const active = settings.provider === provider;

            return (
              <button
                key={provider}
                type="button"
                className={`${styles.providerCard} ${active ? styles.providerActive : ""}`}
                onClick={() => switchProvider(provider)}
                disabled={busy}
              >
                <div className={styles.providerTop}>
                  <div className={styles.providerIcon}>
                    <i className={`bi ${meta.icon}`} />
                  </div>

                  <div className={styles.providerInfo}>
                    <div className={styles.providerTitle}>{meta.title}</div>
                    <div className={styles.cardHint}>{meta.hint}</div>
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

        <div className={styles.headerRight}>
          <button className={styles.secondaryBtn} type="button" onClick={resetDefaults} disabled={busy}>
            <i className="bi bi-arrow-counterclockwise" /> Reset
          </button>

          <button
            className={styles.secondaryBtn}
            type="button"
            onClick={disconnect}
            disabled={busy || settings.status === "DISCONNECTED"}
          >
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

      <div className={styles.grid}>
        <div className={styles.colMain}>
          {activeTab === "CONFIG" ? (
            <>
              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-sliders" /> Common settings
                  </div>
                  <div className={styles.cardHint}>Base URL, prefix, access policy và upload limits</div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <Field label="Public base URL" hint="Ví dụ: https://cdn.yourdomain.com">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-link-45deg ${styles.inputIcon}`} />
                        <input
                          className={styles.input}
                          value={settings.publicBaseUrl}
                          onChange={(e) => updateSetting("publicBaseUrl", e.target.value)}
                        />
                      </div>
                    </Field>

                    <Field label="Root prefix" hint="Ví dụ: uploads/">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-folder2 ${styles.inputIcon}`} />
                        <input
                          className={styles.input}
                          value={settings.rootPrefix}
                          onChange={(e) => updateSetting("rootPrefix", e.target.value)}
                        />
                      </div>
                    </Field>

                    <Field label="Default visibility" hint="Áp dụng cho file mới upload">
                      <Toggle
                        checked={!settings.privateByDefault}
                        onChange={(v) => updateSetting("privateByDefault", !v)}
                        labels={["Private", "Public"]}
                      />
                    </Field>

                    <Field label="Signed URLs" hint="Tạo link truy cập tạm thời cho private asset">
                      <Toggle
                        checked={settings.signedUrlEnabled}
                        onChange={(v) => updateSetting("signedUrlEnabled", v)}
                        labels={["Off", "On"]}
                      />
                    </Field>

                    <Field label="Signed URL TTL (seconds)" hint="Ví dụ: 900">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-hourglass-split ${styles.inputIcon}`} />
                        <input
                          className={styles.input}
                          type="number"
                          min={1}
                          value={settings.signedUrlTtlSeconds}
                          onChange={(e) =>
                            updateSetting("signedUrlTtlSeconds", Math.max(1, Number(e.target.value || 0)))
                          }
                          disabled={!settings.signedUrlEnabled}
                        />
                      </div>
                    </Field>

                    <Field label="Max upload (MB)" hint="Giới hạn dung lượng upload toàn hệ thống">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-upload ${styles.inputIcon}`} />
                        <input
                          className={styles.input}
                          type="number"
                          min={1}
                          value={settings.maxUploadMb}
                          onChange={(e) => updateSetting("maxUploadMb", Math.max(1, Number(e.target.value || 0)))}
                        />
                      </div>
                    </Field>

                    <Field label="Allowed MIME types" hint="Ví dụ: image/*,application/pdf">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-shield-check ${styles.inputIcon}`} />
                        <input
                          className={styles.input}
                          value={settings.allowedMime}
                          onChange={(e) => updateSetting("allowedMime", e.target.value)}
                        />
                      </div>
                    </Field>

                    <Field label="Image optimization" hint="Bật nếu hệ thống có pipeline optimize ảnh">
                      <Toggle
                        checked={settings.enableImageOptimization}
                        onChange={(v) => updateSetting("enableImageOptimization", v)}
                        labels={["Off", "On"]}
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {settings.provider === "LOCAL" ? (
                <div className={styles.card}>
                  <div className={styles.cardHead}>
                    <div className={styles.cardTitle}>
                      <i className="bi bi-hdd" /> Local storage
                    </div>
                    <div className={styles.cardHint}>Phù hợp cho dev hoặc triển khai nhỏ trên một server</div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.formGrid}>
                      <Field label="Local directory" hint="Ví dụ: ./public/uploads">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-folder2-open ${styles.inputIcon}`} />
                          <input
                            className={styles.input}
                            value={settings.localDir}
                            onChange={(e) => updateSetting("localDir", e.target.value)}
                          />
                        </div>
                      </Field>
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
                    <div className={styles.cardHint}>Storage chuyên nghiệp cho web production</div>
                  </div>

                  <div className={styles.cardBody}>
                    <div className={styles.formGrid}>
                      <Field label="Bucket" hint="Ví dụ: web-assets">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-bucket ${styles.inputIcon}`} />
                          <input
                            className={styles.input}
                            value={settings.bucket}
                            onChange={(e) => updateSetting("bucket", e.target.value)}
                          />
                        </div>
                      </Field>

                      <Field label="Region" hint='Thông thường dùng "auto"'>
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-geo-alt ${styles.inputIcon}`} />
                          <input
                            className={styles.input}
                            value={settings.region}
                            onChange={(e) => updateSetting("region", e.target.value)}
                          />
                        </div>
                      </Field>

                      <Field label="Endpoint URL" hint="Ví dụ: https://accountid.r2.cloudflarestorage.com">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-globe2 ${styles.inputIcon}`} />
                          <input
                            className={styles.input}
                            value={settings.endpointUrl}
                            onChange={(e) => updateSetting("endpointUrl", e.target.value)}
                          />
                        </div>
                      </Field>

                      <Field label="Access key ID" hint="Key truy cập R2">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-key ${styles.inputIcon}`} />
                          <input
                            className={styles.input}
                            value={settings.accessKeyId}
                            onChange={(e) => updateSetting("accessKeyId", e.target.value)}
                          />
                        </div>
                      </Field>

                      <Field label="Secret access key" hint="Nên lưu encrypted trong DB hoặc vault">
                        <div className={styles.inputWrap}>
                          <i className={`bi bi-shield-lock ${styles.inputIcon}`} />
                          <input
                            className={styles.input}
                            type={showRawSecret ? "text" : "password"}
                            value={settings.secretAccessKey}
                            onChange={(e) => updateSetting("secretAccessKey", e.target.value)}
                          />
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
                        onClick={() => setShowRawSecret((prev) => !prev)}
                      >
                        <i className={`bi ${showRawSecret ? "bi-eye-slash" : "bi-eye"}`} />{" "}
                        {showRawSecret ? "Hide key" : "Show key"}
                      </button>

                      <button
                        className={styles.secondaryBtn}
                        type="button"
                        onClick={() => {
                          updateSetting("purgeEnabled", !settings.purgeEnabled);
                          showInfo(`CDN purge ${!settings.purgeEnabled ? "enabled" : "disabled"}.`);
                        }}
                      >
                        <i className="bi bi-lightning" /> Toggle purge
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-globe2" /> CDN & Cache
                  </div>
                  <div className={styles.cardHint}>Cache-control cho public asset và thao tác purge</div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.formGrid}>
                    <Field label="Cache-Control" hint="Áp dụng cho public objects">
                      <div className={styles.inputWrap}>
                        <i className={`bi bi-clock ${styles.inputIcon}`} />
                        <input
                          className={styles.input}
                          value={settings.cacheControl}
                          onChange={(e) => updateSetting("cacheControl", e.target.value)}
                        />
                      </div>
                    </Field>

                    <Field label="Purge enabled" hint="Cho phép thao tác purge từ admin">
                      <Toggle
                        checked={settings.purgeEnabled}
                        onChange={(v) => updateSetting("purgeEnabled", v)}
                        labels={["Off", "On"]}
                      />
                    </Field>
                  </div>

                  <div className={styles.inlineActions}>
                    <button
                      className={styles.secondaryBtn}
                      type="button"
                      onClick={purgeCdn}
                      disabled={!settings.purgeEnabled}
                    >
                      <i className="bi bi-lightning-charge" /> Purge CDN
                    </button>

                    <button className={styles.secondaryBtn} type="button" onClick={addBucket}>
                      <i className="bi bi-plus-circle" /> Add bucket
                    </button>
                  </div>
                </div>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHead}>
                  <div className={styles.cardTitle}>
                    <i className="bi bi-bucket" /> Buckets
                  </div>
                  <div className={styles.cardHint}>Tổng quan bucket đang quản lý</div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.bucketGrid}>
                    {buckets.map((bucket) => (
                      <div key={bucket.id} className={styles.bucketCard}>
                        <div className={styles.bucketTop}>
                          <div className={styles.bucketName}>
                            <i className="bi bi-bucket" /> {bucket.name}
                          </div>

                          <span className={`${styles.chip} ${styles.chipMuted}`}>
                            <i className="bi bi-cloud" /> {providerMeta(bucket.provider).title}
                          </span>
                        </div>

                        <div className={styles.bucketMeta}>
                          <span className={styles.metaPill}>
                            <i className="bi bi-files" /> {bucket.objects} objects
                          </span>
                          <span className={styles.metaPill}>
                            <i className="bi bi-box-seam" /> {bucket.sizeGb} GB
                          </span>
                          <span className={styles.metaPill}>
                            <i className="bi bi-geo-alt" /> {bucket.region || "—"}
                          </span>
                        </div>

                        <div className={styles.bucketFoot}>
                          <span className={styles.bucketUpdated}>Updated: {formatDateTime(bucket.updatedAt)}</span>
                          <button
                            className={styles.smallBtn}
                            type="button"
                            onClick={() => {
                              setActiveTab("BROWSER");
                              showInfo(`Đang mở browser cho bucket ${bucket.name}.`);
                            }}
                          >
                            <i className="bi bi-folder2-open" /> Browse
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className={styles.noteCallout}>
                    <i className="bi bi-info-circle" />
                    <div className={styles.noteCircle}>
                      <b>Gợi ý triển khai:</b> dùng storage này làm nguồn upload chung cho avatar, ảnh bài viết, PDF và
                      file đính kèm trong web app.
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
                <div className={styles.cardHint}>Tìm kiếm, lọc visibility, copy URL và xóa file</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.browserTools}>
                  <div className={styles.searchWrap}>
                    <i className={`bi bi-search ${styles.searchIcon}`} />
                    <input
                      className={styles.search}
                      placeholder="Search by key..."
                      value={searchKey}
                      onChange={(e) => setSearchKey(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          void runSearch();
                        }
                      }}
                    />
                  </div>

                  <div className={styles.selectWrap}>
                    <i className={`bi bi-funnel ${styles.selectIcon}`} />
                    <select
                      className={styles.select}
                      value={filterVisibility}
                      onChange={(e) => {
                        void changeVisibilityFilter(e.target.value as "ALL" | Visibility);
                      }}
                    >
                      <option value="ALL">All</option>
                      <option value="PUBLIC">Public</option>
                      <option value="PRIVATE">Private</option>
                    </select>
                  </div>

                  <button
                    className={styles.secondaryBtn}
                    type="button"
                    onClick={() => void runSearch()}
                    disabled={busy}
                  >
                    <i className="bi bi-search" /> Search
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
                      <div className={styles.emptyHint}>Thử bộ lọc khác hoặc chạy test upload.</div>
                    </div>
                  ) : (
                    filteredObjects.map((object) => {
                      const publicUrl = buildPublicUrl(settings, object.key);

                      return (
                        <div key={object.key} className={styles.trow}>
                          <div className={styles.keyCell}>
                            <i className="bi bi-file-earmark" />
                            <span className={styles.keyText}>{object.key}</span>
                          </div>

                          <div className={styles.mono}>{object.type}</div>
                          <div>{formatSizeKb(object.sizeKb)}</div>

                          <div>
                            <span
                              className={`${styles.chip} ${object.visibility === "PUBLIC" ? styles.chipOk : styles.chipMuted}`}
                            >
                              <i className={`bi ${object.visibility === "PUBLIC" ? "bi-unlock" : "bi-lock"}`} />
                              {object.visibility}
                            </span>
                          </div>

                          <div>{formatDateTime(object.updatedAt)}</div>

                          <div className={styles.actions}>
                            <button
                              className={styles.iconBtn}
                              type="button"
                              onClick={() => void copyUrl(object.key)}
                              title="Copy public URL"
                            >
                              <i className="bi bi-clipboard" />
                            </button>

                            <button
                              className={styles.iconBtn}
                              type="button"
                              onClick={() => {
                                if (!settings.signedUrlEnabled) return;
                                showInfo(`Signed URL flow sẽ dùng API/backend thực tế.`);
                              }}
                              disabled={!settings.signedUrlEnabled}
                              title="Generate signed URL"
                            >
                              <i className="bi bi-link" />
                            </button>

                            {object.visibility === "PUBLIC" && publicUrl ? (
                              <a
                                className={styles.iconBtn}
                                href={publicUrl}
                                target="_blank"
                                rel="noreferrer"
                                title="Open public URL"
                              >
                                <i className="bi bi-box-arrow-up-right" />
                              </a>
                            ) : null}

                            <button
                              className={`${styles.iconBtn} ${styles.dangerIconBtn}`}
                              type="button"
                              onClick={() => void deleteObject(object.key)}
                              title="Delete"
                              disabled={busy}
                            >
                              <i className="bi bi-trash3" />
                            </button>
                          </div>
                        </div>
                      );
                    })
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
                <div className={styles.cardHint}>Theo dõi upload, delete, signed URL và thay đổi cấu hình</div>
              </div>

              <div className={styles.cardBody}>
                <div className={styles.inlineActions}>
                  <button
                    className={`${styles.secondaryBtn} ${styles.dangerBtn}`}
                    type="button"
                    onClick={() => {
                      setLogs([]);
                      showInfo("Đã clear log trên UI.");
                    }}
                  >
                    <i className="bi bi-trash3" /> Clear
                  </button>
                </div>

                <div className={styles.logs}>
                  {logs.length === 0 ? (
                    <div className={styles.empty}>
                      <i className="bi bi-inbox" />
                      <div className={styles.emptyTitle}>No logs</div>
                      <div className={styles.emptyHint}>Log sẽ hiển thị khi có thao tác storage.</div>
                    </div>
                  ) : (
                    logs.map((log) => (
                      <div key={log.id} className={styles.logRow}>
                        <span className={`${styles.level} ${styles["level_" + log.level]}`}>{log.level}</span>

                        <div className={styles.logMain}>
                          <div className={styles.logTop}>
                            <span className={styles.logAction}>{log.action}</span>
                            <span className={styles.logAt}>{formatDateTime(log.at)}</span>
                          </div>

                          <div className={styles.logMsg}>{log.message}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          ) : null}

          <div className={styles.card}>
            <div className={styles.cardHead}>
              <div className={styles.cardTitle}>
                <i className="bi bi-exclamation-octagon" /> Danger zone
              </div>
              <div className={styles.cardHint}>Các thao tác ảnh hưởng tới upload và access</div>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.dangerRow}>
                <div>
                  <div className={styles.dangerTitle}>Purge secrets</div>
                  <div className={styles.dangerHint}>Xóa credential khỏi form. Cần Save để áp dụng thật.</div>
                </div>

                <button
                  className={`${styles.secondaryBtn} ${styles.dangerBtn}`}
                  type="button"
                  onClick={() => {
                    updateSetting("accessKeyId", "");
                    updateSetting("secretAccessKey", "");
                    showInfo("Đã xóa secrets trên form. Chưa lưu xuống hệ thống.");
                  }}
                >
                  <i className="bi bi-shield-x" /> Purge
                </button>
              </div>

              <div className={styles.dangerRow}>
                <div>
                  <div className={styles.dangerTitle}>Disable signed URLs</div>
                  <div className={styles.dangerHint}>
                    Có thể làm private asset không còn truy cập được qua link tạm thời.
                  </div>
                </div>

                <button
                  className={`${styles.secondaryBtn} ${styles.dangerBtn}`}
                  type="button"
                  onClick={() => {
                    updateSetting("signedUrlEnabled", false);
                    showInfo("Đã tắt signed URLs trên form. Chưa lưu xuống hệ thống.");
                  }}
                >
                  <i className="bi bi-link-45deg" /> Disable
                </button>
              </div>
            </div>
          </div>
        </div>

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
              <MiniRow
                icon="bi-link"
                label="Signed URLs"
                value={settings.signedUrlEnabled ? `On (${settings.signedUrlTtlSeconds}s)` : "Off"}
              />

              <div className={styles.hr} />

              <div className={styles.sideHint}>
                <i className="bi bi-info-circle" />
                <div>
                  Trạng thái config: <b>{health.ok ? "Looks good" : "Needs attention"}</b>
                </div>
              </div>

              <div className={styles.sideActions}>
                <button
                  className={styles.secondaryBtn}
                  type="button"
                  onClick={() => setShowSecrets(true)}
                  disabled={settings.provider === "LOCAL"}
                >
                  <i className="bi bi-eye" /> Secrets
                </button>

                <button className={styles.secondaryBtn} type="button" onClick={() => setActiveTab("BROWSER")}>
                  <i className="bi bi-folder2-open" /> Browser
                </button>
              </div>
            </div>
          </div>

          <div className={styles.sideCard}>
            <div className={styles.sideHead}>
              <div className={styles.sideTitle}>
                <i className="bi bi-diagram-3" /> Web usage
              </div>
            </div>

            <div className={styles.sideBody}>
              <MiniRow
                icon="bi-person-circle"
                label="Avatar"
                value={`${normalizePrefix(settings.rootPrefix)}avatars/...`}
              />
              <MiniRow icon="bi-image" label="Media" value={`${normalizePrefix(settings.rootPrefix)}images/...`} />
              <MiniRow
                icon="bi-file-earmark-pdf"
                label="Documents"
                value={`${normalizePrefix(settings.rootPrefix)}docs/...`}
              />
              <MiniRow
                icon="bi-shield-lock"
                label="Private files"
                value={settings.signedUrlEnabled ? "Use signed URL" : "Disabled"}
              />
            </div>
          </div>

          {toast ? (
            <div className={`${styles.toast} ${styles["toast_" + toast.type]}`}>
              <i
                className={`bi ${toast.type === "success" ? "bi-check2-circle" : toast.type === "error" ? "bi-x-circle" : "bi-info-circle"}`}
              />
              <div className={styles.toastText}>{toast.text}</div>
              <button
                className={styles.toastClose}
                onClick={() => setToast(null)}
                aria-label="Close toast"
                type="button"
              >
                <i className="bi bi-x" />
              </button>
            </div>
          ) : null}
        </div>
      </div>

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
            <div className={styles.drawerHint}>
              Hiển thị bản masked để kiểm tra. Secret thật nên được lưu mã hóa trong DB hoặc vault.
            </div>

            {settings.provider !== "LOCAL" ? (
              <div className={styles.secretList}>
                <SecretRow label="Access key ID" value={maskSecret(settings.accessKeyId)} />
                <SecretRow label="Secret access key" value={maskSecret(settings.secretAccessKey)} />
                <SecretRow label="Endpoint URL" value={settings.endpointUrl || "—"} />
              </div>
            ) : (
              <div className={styles.secretRow}>
                <div className={styles.secretLabel}>Local storage</div>
                <div className={styles.secretValue}>Không cần secret.</div>
              </div>
            )}

            <div className={styles.inlineActions}>
              <button
                className={styles.secondaryBtn}
                type="button"
                onClick={async () => {
                  try {
                    const content = [
                      `Access key ID: ${maskSecret(settings.accessKeyId) || "—"}`,
                      `Secret access key: ${maskSecret(settings.secretAccessKey) || "—"}`,
                      `Endpoint URL: ${settings.endpointUrl || "—"}`,
                    ].join("\n");
                    await navigator.clipboard.writeText(content);
                    showSuccess("Đã copy masked values.");
                  } catch {
                    showError("Không thể copy masked values.");
                  }
                }}
              >
                <i className="bi bi-clipboard" /> Copy masked
              </button>

              <button
                className={styles.secondaryBtn}
                type="button"
                onClick={() => {
                  showInfo("Rotate keys flow chưa được tích hợp backend.");
                }}
              >
                <i className="bi bi-arrow-repeat" /> Rotate keys
              </button>
            </div>
          </div>
        </div>
      </aside>

      {showSecrets ? (
        <button
          className={styles.backdrop}
          onClick={() => setShowSecrets(false)}
          aria-label="Close drawer"
          type="button"
        />
      ) : null}
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

function Toggle({
  checked,
  onChange,
  labels,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  labels?: [string, string];
}) {
  const off = labels?.[0] || "Off";
  const on = labels?.[1] || "On";

  return (
    <button
      type="button"
      className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
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
