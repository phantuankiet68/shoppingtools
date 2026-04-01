"use client";

import { CSSProperties, ReactNode, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/settings/page.module.css";

type ThemeMode = "light" | "dark" | "auto";
type FontSize = "sm" | "md" | "lg";
type Density = "comfortable" | "compact";
type Currency = "VND" | "USD";
type Language = "vi" | "en" | "ja";
type Timezone = "Asia/Ho_Chi_Minh" | "UTC" | "Asia/Tokyo" | "Europe/London" | "America/Los_Angeles";
type WebsiteType = "landing" | "blog" | "company" | "ecommerce" | "booking" | "news" | "lms" | "directory";
type AdminPreset = "minimal-admin" | "content-admin" | "commerce-admin" | "booking-admin";
type LocaleOption = "vi" | "en" | "ja";
type SortOption = "newest" | "oldest" | "name_asc" | "name_desc";
type SiteStatus = "DRAFT" | "ACTIVE" | "SUSPENDED";
type ToastState = { kind: "ok" | "err"; text: string } | null;

type Integrations = {
  google: boolean;
  email: boolean;
  payment: boolean;
};

type Security = {
  twoFA: boolean;
  sessionTimeoutMin: number;
};

type Advanced = {
  maintenanceMode: boolean;
  debugMode: boolean;
};

type ProjectConfig = {
  websiteType: WebsiteType;
  adminPreset: AdminPreset;
  defaultLocale: LocaleOption;
  enabledLocales: LocaleOption[];
  enableMultilingual: boolean;
};

type DataModules = {
  blog: boolean;
  shop: boolean;
  booking: boolean;
  membership: boolean;
  seo: boolean;
};

type DataConfig = {
  pageSize: number;
  defaultSort: SortOption;
  showSku: boolean;
  showBarcode: boolean;
  modules: DataModules;
};

type SettingsState = {
  siteName: string;
  language: Language;
  timezone: Timezone;
  currency: Currency;
  theme: ThemeMode;
  accent: string;
  fontSize: FontSize;
  radius: number;
  density: Density;
  project: ProjectConfig;
  data: DataConfig;
  integrations: Integrations;
  security: Security;
  advanced: Advanced;
  autoSave: boolean;
  confirmBeforeDelete: boolean;
  autoRefresh: boolean;
  notifyOnChange: boolean;
};

type SettingsSelectPatch = Partial<{
  siteName: string;
  language: Language;
  timezone: Timezone;
  currency: Currency;
  theme: ThemeMode;
  accent: string;
  fontSize: FontSize;
  radius: number;
  density: Density;
  websiteType: WebsiteType;
  adminPreset: AdminPreset;
  defaultLocale: LocaleOption;
  enabledLocales: LocaleOption[];
  enableMultilingual: boolean;
  pageSize: number;
  defaultSort: SortOption;
  showSku: boolean;
  showBarcode: boolean;
  dataModules: DataModules;
  integrations: Integrations;
  security: Security;
  advanced: Advanced;
  autoSave: boolean;
  confirmBeforeDelete: boolean;
  autoRefresh: boolean;
  notifyOnChange: boolean;
}>;

type SiteFormState = {
  name: string;
  domain: string;
  status: SiteStatus;
  isPublic: boolean;
  seoTitleDefault: string;
  seoDescDefault: string;
  themeConfig: string;
};

type SiteRecord = {
  id: string;
  name: string;
  domain: string;
  ownerUserId: string;
  status: SiteStatus;
  isPublic: boolean;
  publishedAt: string | null;
  themeConfig: Record<string, unknown> | null;
  seoTitleDefault: string | null;
  seoDescDefault: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
};

type Option<T extends string> = {
  value: T;
  label: string;
  desc?: string;
};

type SectionMeta = {
  id: string;
  title: string;
  badge?: string;
};

type SettingsApiResponse = {
  item: SettingsState | null;
  error?: string;
};

type HydratedState = {
  settings: SettingsState;
  persistedSettings: SettingsState;
  createdSite: SiteRecord | null;
  siteForm: SiteFormState;
};

const STORAGE_KEY = "admin_settings_v2";
const SITE_STORAGE_KEY = "single_site_record_v1";
const OWNER_STORAGE_KEY = "single_site_owner_id";
const DEFAULT_OWNER_ID = "local-user";

const SETTINGS_API_URL = "/api/admin/settings";
const SETTINGS_SELECT_API_URL = "/api/admin/settings/select";

const LOCALE_OPTIONS: LocaleOption[] = ["vi", "en", "ja"];
const PAGE_SIZE_OPTIONS = [10, 20, 30, 50, 100] as const;
const SITE_STATUS_OPTIONS: SiteStatus[] = ["DRAFT", "ACTIVE", "SUSPENDED"];

const WEBSITE_TYPE_OPTIONS: Option<WebsiteType>[] = [
  { value: "landing", label: "Landing Page", desc: "Website giới thiệu đơn giản, tập trung chuyển đổi." },
  { value: "blog", label: "Blog / Content", desc: "Quản lý bài viết, category, tag, SEO." },
  { value: "company", label: "Company Profile", desc: "Giới thiệu doanh nghiệp, đội ngũ, dịch vụ." },
  { value: "ecommerce", label: "Ecommerce", desc: "Sản phẩm, đơn hàng, khách hàng, thanh toán." },
  { value: "booking", label: "Booking", desc: "Dịch vụ, lịch hẹn, nhân sự, khung giờ." },
  { value: "news", label: "News / Magazine", desc: "Tin tức, chuyên mục, biên tập nội dung." },
  { value: "lms", label: "Course / LMS", desc: "Khoá học, bài học, giảng viên, học viên." },
  { value: "directory", label: "Directory / Listing", desc: "Danh mục địa điểm, listing, bộ lọc." },
];

const ADMIN_PRESET_OPTIONS: Option<AdminPreset>[] = [
  { value: "minimal-admin", label: "Minimal Admin", desc: "Đơn giản, gọn, phù hợp MVP." },
  { value: "content-admin", label: "Content Admin", desc: "Tối ưu cho nội dung, bài viết, trang." },
  { value: "commerce-admin", label: "Commerce Admin", desc: "Tối ưu cho sản phẩm, đơn hàng, khách." },
  { value: "booking-admin", label: "Booking Admin", desc: "Tối ưu cho lịch hẹn, lịch làm việc." },
];

const THEME_OPTIONS: Option<ThemeMode>[] = [
  { value: "auto", label: "Auto" },
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
];

const FONT_SIZE_OPTIONS: Option<FontSize>[] = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Default" },
  { value: "lg", label: "Large" },
];

const LANGUAGE_OPTIONS: Option<Language>[] = [
  { value: "vi", label: "Vietnamese" },
  { value: "en", label: "English" },
  { value: "ja", label: "Japanese" },
];

const CURRENCY_OPTIONS: Option<Currency>[] = [
  { value: "VND", label: "VND" },
  { value: "USD", label: "USD" },
];

const TIMEZONE_OPTIONS: Option<Timezone>[] = [
  { value: "Asia/Ho_Chi_Minh", label: "Asia/Ho_Chi_Minh" },
  { value: "UTC", label: "UTC" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo" },
  { value: "Europe/London", label: "Europe/London" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles" },
];

const SORT_OPTIONS: Option<SortOption>[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name_asc", label: "Name A → Z" },
  { value: "name_desc", label: "Name Z → A" },
];

const BLUEPRINTS: Record<WebsiteType, { recommendedAdmin: AdminPreset; modules: DataModules }> = {
  landing: {
    recommendedAdmin: "minimal-admin",
    modules: { blog: false, shop: false, booking: false, membership: false, seo: true },
  },
  blog: {
    recommendedAdmin: "content-admin",
    modules: { blog: true, shop: false, booking: false, membership: false, seo: true },
  },
  company: {
    recommendedAdmin: "content-admin",
    modules: { blog: true, shop: false, booking: false, membership: false, seo: true },
  },
  ecommerce: {
    recommendedAdmin: "commerce-admin",
    modules: { blog: true, shop: true, booking: false, membership: true, seo: true },
  },
  booking: {
    recommendedAdmin: "booking-admin",
    modules: { blog: false, shop: false, booking: true, membership: false, seo: true },
  },
  news: {
    recommendedAdmin: "content-admin",
    modules: { blog: true, shop: false, booking: false, membership: false, seo: true },
  },
  lms: {
    recommendedAdmin: "content-admin",
    modules: { blog: true, shop: false, booking: false, membership: true, seo: true },
  },
  directory: {
    recommendedAdmin: "content-admin",
    modules: { blog: false, shop: false, booking: false, membership: false, seo: true },
  },
};

const DEFAULTS: SettingsState = {
  siteName: "My Website",
  language: "vi",
  timezone: "Asia/Ho_Chi_Minh",
  currency: "VND",
  theme: "auto",
  accent: "#6f42c1",
  fontSize: "md",
  radius: 18,
  density: "comfortable",
  project: {
    websiteType: "landing",
    adminPreset: "minimal-admin",
    defaultLocale: "vi",
    enabledLocales: ["vi", "en"],
    enableMultilingual: false,
  },
  data: {
    pageSize: 20,
    defaultSort: "newest",
    showSku: true,
    showBarcode: false,
    modules: {
      blog: false,
      shop: false,
      booking: false,
      membership: false,
      seo: true,
    },
  },
  autoSave: true,
  confirmBeforeDelete: true,
  autoRefresh: false,
  notifyOnChange: true,
  integrations: { google: false, email: true, payment: false },
  security: { twoFA: false, sessionTimeoutMin: 30 },
  advanced: { maintenanceMode: false, debugMode: false },
};

const DEFAULT_SITE_FORM: SiteFormState = {
  name: "My Website",
  domain: "",
  status: "DRAFT",
  isPublic: false,
  seoTitleDefault: "",
  seoDescDefault: "",
  themeConfig: '{\n  "accent": "#6f42c1",\n  "radius": 18,\n  "theme": "auto"\n}',
};

const SECTION_META: SectionMeta[] = [
  { id: "site", title: "Create Site", badge: "Launch" },
  { id: "overview", title: "Project Overview", badge: "Core" },
  { id: "blueprint", title: "Website Blueprint", badge: "Strategy" },
  { id: "localization", title: "Localization", badge: "i18n" },
  { id: "modules", title: "Schema Modules", badge: "Data" },
  { id: "behavior", title: "Behavior", badge: "UX" },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
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
    project: {
      ...DEFAULTS.project,
      ...saved.project,
      enabledLocales: saved.project?.enabledLocales ?? DEFAULTS.project.enabledLocales,
    },
    data: {
      ...DEFAULTS.data,
      ...saved.data,
      modules: {
        ...DEFAULTS.data.modules,
        ...saved.data?.modules,
      },
    },
    integrations: {
      ...DEFAULTS.integrations,
      ...saved.integrations,
    },
    security: {
      ...DEFAULTS.security,
      ...saved.security,
    },
    advanced: {
      ...DEFAULTS.advanced,
      ...saved.advanced,
    },
  };
}

function getStoredSettings() {
  if (typeof window === "undefined") return DEFAULTS;
  return mergeDefaults(safeParse<Partial<SettingsState>>(window.localStorage.getItem(STORAGE_KEY)));
}

function storeSettings(settings: SettingsState) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

function getStoredSite() {
  if (typeof window === "undefined") return null;
  return safeParse<SiteRecord>(window.localStorage.getItem(SITE_STORAGE_KEY));
}

function getOwnerUserId() {
  if (typeof window === "undefined") return DEFAULT_OWNER_ID;
  return window.localStorage.getItem(OWNER_STORAGE_KEY) ?? DEFAULT_OWNER_ID;
}

function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme);
}

function getPreviewVars(state: SettingsState): CSSProperties {
  return {
    ["--accent" as string]: state.accent,
    ["--radius" as string]: `${state.radius}px`,
    ["--fontScale" as string]: state.fontSize === "sm" ? "0.95" : state.fontSize === "lg" ? "1.05" : "1",
    ["--density" as string]: state.density === "compact" ? "0.88" : "1",
  };
}

function getBlueprintSummary(state: SettingsState) {
  const currentBlueprint = BLUEPRINTS[state.project.websiteType];
  const activeModules = Object.entries(state.data.modules)
    .filter(([, enabled]) => enabled)
    .map(([key]) => key);

  return {
    recommendedAdmin: currentBlueprint.recommendedAdmin,
    activeModules,
  };
}

function slugifyDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/https?:\/\//g, "")
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `site_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function validateDomain(domain: string) {
  const normalized = slugifyDomain(domain);
  const regex = /^(?!-)(?:[a-z0-9-]+\.)+[a-z]{2,}$/;
  return regex.test(normalized);
}

function buildSiteForm(settings: SettingsState, site?: SiteRecord | null): SiteFormState {
  if (!site) {
    return {
      ...DEFAULT_SITE_FORM,
      name: settings.siteName,
    };
  }

  return {
    name: site.name,
    domain: site.domain,
    status: site.status,
    isPublic: site.isPublic,
    seoTitleDefault: site.seoTitleDefault ?? "",
    seoDescDefault: site.seoDescDefault ?? "",
    themeConfig: site.themeConfig ? JSON.stringify(site.themeConfig, null, 2) : DEFAULT_SITE_FORM.themeConfig,
  };
}

function getOptionDescription<T extends string>(options: Option<T>[], value: T) {
  return options.find((option) => option.value === value)?.desc;
}

function formatDate(iso: string | null) {
  if (!iso) return "—";

  try {
    return new Date(iso).toLocaleString("vi-VN");
  } catch {
    return iso;
  }
}

function getHydratedState(): HydratedState {
  const settings = getStoredSettings();
  const createdSite = getStoredSite();

  return {
    settings,
    persistedSettings: settings,
    createdSite,
    siteForm: buildSiteForm(settings, createdSite),
  };
}

async function readSettingsFromApi(): Promise<SettingsState | null> {
  const res = await fetch(SETTINGS_API_URL, {
    method: "GET",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
  });

  const json = (await res.json().catch(() => null)) as SettingsApiResponse | null;

  if (!res.ok) {
    throw new Error(json?.error || "Không thể tải settings.");
  }

  return json?.item ? mergeDefaults(json.item) : null;
}

async function saveSettingsToApi(settings: SettingsState): Promise<SettingsState> {
  const res = await fetch(SETTINGS_API_URL, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(settings),
  });

  const json = (await res.json().catch(() => null)) as SettingsApiResponse | null;

  if (!res.ok || !json?.item) {
    throw new Error(json?.error || "Không thể lưu settings.");
  }

  return mergeDefaults(json.item);
}

async function patchSettingsToApi(patch: SettingsSelectPatch): Promise<SettingsState> {
  const res = await fetch(SETTINGS_SELECT_API_URL, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(patch),
  });

  const json = (await res.json().catch(() => null)) as SettingsApiResponse | null;

  if (!res.ok || !json?.item) {
    throw new Error(json?.error || "Không thể cập nhật settings.");
  }

  return mergeDefaults(json.item);
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(DEFAULTS);
  const [persistedSettings, setPersistedSettings] = useState<SettingsState>(DEFAULTS);
  const [siteForm, setSiteForm] = useState<SiteFormState>(DEFAULT_SITE_FORM);
  const [createdSite, setCreatedSite] = useState<SiteRecord | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreatingSite, setIsCreatingSite] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const firstFieldRef = useRef<HTMLInputElement | null>(null);
  const toastTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      const localState = getHydratedState();

      setSettings(localState.settings);
      setPersistedSettings(localState.persistedSettings);
      setCreatedSite(localState.createdSite);
      setSiteForm(localState.siteForm);
      setIsHydrated(true);

      try {
        const remoteSettings = await readSettingsFromApi();

        if (!mounted || !remoteSettings) return;

        setSettings(remoteSettings);
        setPersistedSettings(remoteSettings);
        setSiteForm((prev) => ({
          ...prev,
          name: remoteSettings.siteName,
        }));
        storeSettings(remoteSettings);
      } catch {
        // fallback local/default silently
      } finally {
        if (mounted) {
          firstFieldRef.current?.focus();
        }
      }
    }

    void hydrate();

    return () => {
      mounted = false;

      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    applyTheme(settings.theme);
  }, [isHydrated, settings.theme]);

  const dirty = useMemo(
    () => JSON.stringify(persistedSettings) !== JSON.stringify(settings),
    [persistedSettings, settings],
  );
  const normalizedDomain = useMemo(() => slugifyDomain(siteForm.domain), [siteForm.domain]);
  const canCreateSite = !createdSite && Boolean(siteForm.name.trim()) && validateDomain(siteForm.domain);
  const blueprintSummary = useMemo(() => getBlueprintSummary(settings), [settings]);
  const previewVars = useMemo(() => getPreviewVars(settings), [settings]);

  const stats = useMemo(
    () => [
      { label: "Active modules", value: String(blueprintSummary.activeModules.length).padStart(2, "0") },
      { label: "Locales", value: String(settings.project.enabledLocales.length).padStart(2, "0") },
      { label: "Theme", value: settings.theme.toUpperCase() },
      { label: "Status", value: createdSite?.status ?? "NEW" },
    ],
    [
      blueprintSummary.activeModules.length,
      createdSite?.status,
      settings.project.enabledLocales.length,
      settings.theme,
    ],
  );

  function showToast(nextToast: Exclude<ToastState, null>, duration = 2600) {
    setToast(nextToast);

    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, duration);
  }

  async function savePatch(nextSettings: SettingsState, patch: SettingsSelectPatch) {
    try {
      const saved = await patchSettingsToApi(patch);
      setPersistedSettings(saved);
      storeSettings(saved);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể cập nhật settings.";
      showToast({ kind: "err", text: message });
      setPersistedSettings((prev) => prev);
      storeSettings(nextSettings);
    }
  }

  function updateSettings(
    updater: (prev: SettingsState) => SettingsState,
    patch?: SettingsSelectPatch,
    options?: { syncPersistedOnPatch?: boolean },
  ) {
    let nextValue: SettingsState = settings;

    setSettings((prev) => {
      nextValue = updater(prev);
      return nextValue;
    });

    storeSettings(nextValue);

    if (patch) {
      void savePatch(nextValue, patch);

      if (options?.syncPersistedOnPatch !== false) {
        setPersistedSettings(nextValue);
      }
    }
  }

  function setField<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    updateSettings((prev) => ({ ...prev, [key]: value }));
  }

  function setProjectField<K extends keyof ProjectConfig>(
    key: K,
    value: ProjectConfig[K],
    patch?: SettingsSelectPatch,
  ) {
    updateSettings(
      (prev) => ({
        ...prev,
        project: {
          ...prev.project,
          [key]: value,
        },
      }),
      patch,
    );
  }

  function setModuleField<K extends keyof DataModules>(key: K, value: DataModules[K]) {
    const nextModules = {
      ...settings.data.modules,
      [key]: value,
    };

    updateSettings(
      (prev) => ({
        ...prev,
        data: {
          ...prev.data,
          modules: {
            ...prev.data.modules,
            [key]: value,
          },
        },
      }),
      { dataModules: nextModules },
    );
  }

  function setSiteField<K extends keyof SiteFormState>(key: K, value: SiteFormState[K]) {
    setSiteForm((prev) => ({ ...prev, [key]: value }));
  }

  function setLanguage(value: Language) {
    updateSettings((prev) => ({ ...prev, language: value }), { language: value });
  }

  function setTimezone(value: Timezone) {
    updateSettings((prev) => ({ ...prev, timezone: value }), { timezone: value });
  }

  function setCurrency(value: Currency) {
    updateSettings((prev) => ({ ...prev, currency: value }), { currency: value });
  }

  function setDensity(value: Density) {
    updateSettings((prev) => ({ ...prev, density: value }), { density: value });
  }

  function setWebsiteType(value: WebsiteType) {
    const blueprint = BLUEPRINTS[value];
    const nextModules = { ...blueprint.modules };

    updateSettings(
      (prev) => ({
        ...prev,
        project: {
          ...prev.project,
          websiteType: value,
          adminPreset: blueprint.recommendedAdmin,
        },
        data: {
          ...prev.data,
          modules: nextModules,
        },
      }),
      {
        websiteType: value,
        adminPreset: blueprint.recommendedAdmin,
        dataModules: nextModules,
      },
    );

    showToast({ kind: "ok", text: "Đã áp dụng blueprint mới." }, 2000);
  }

  function setAdminPreset(value: AdminPreset) {
    setProjectField("adminPreset", value, { adminPreset: value });
  }

  function setEnableMultilingual(value: boolean) {
    setProjectField("enableMultilingual", value, { enableMultilingual: value });
  }

  function setDefaultLocale(value: LocaleOption) {
    setProjectField("defaultLocale", value, { defaultLocale: value });
  }

  function toggleLocale(locale: LocaleOption) {
    let nextLocales: LocaleOption[] = [];
    let nextDefaultLocale: LocaleOption = settings.project.defaultLocale;

    updateSettings(
      (prev) => {
        const exists = prev.project.enabledLocales.includes(locale);
        const enabledLocales = exists
          ? prev.project.enabledLocales.filter((item) => item !== locale)
          : [...prev.project.enabledLocales, locale];

        const safeLocales = enabledLocales.length ? enabledLocales : [prev.project.defaultLocale];
        const defaultLocale = safeLocales.includes(prev.project.defaultLocale)
          ? prev.project.defaultLocale
          : safeLocales[0];

        nextLocales = safeLocales;
        nextDefaultLocale = defaultLocale;

        return {
          ...prev,
          project: {
            ...prev.project,
            enabledLocales: safeLocales,
            defaultLocale,
          },
        };
      },
      {
        enabledLocales: nextLocales,
        defaultLocale: nextDefaultLocale,
      },
    );
  }

  function setBehaviorField<K extends "autoSave" | "confirmBeforeDelete" | "autoRefresh" | "notifyOnChange">(
    key: K,
    value: SettingsState[K],
  ) {
    updateSettings((prev) => ({ ...prev, [key]: value }), { [key]: value } as SettingsSelectPatch);
  }

  async function save() {
    setIsSaving(true);
    setToast(null);

    try {
      const saved = await saveSettingsToApi(settings);
      setSettings(saved);
      setPersistedSettings(saved);
      storeSettings(saved);
      showToast({ kind: "ok", text: "Lưu cấu hình thành công." });
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể lưu cấu hình.";
      showToast({ kind: "err", text: message });
    } finally {
      setIsSaving(false);
    }
  }

  async function createSite() {
    if (createdSite) {
      showToast({ kind: "err", text: "Mỗi tài khoản chỉ được tạo 1 site." });
      return;
    }

    if (!siteForm.name.trim()) {
      showToast({ kind: "err", text: "Vui lòng nhập tên site." });
      return;
    }

    if (!validateDomain(siteForm.domain)) {
      showToast({ kind: "err", text: "Domain không hợp lệ. Ví dụ: demo.example.com" });
      return;
    }

    setIsCreatingSite(true);
    setToast(null);

    try {
      const ownerUserId = getOwnerUserId();
      const parsedThemeConfig = siteForm.themeConfig.trim()
        ? (JSON.parse(siteForm.themeConfig) as Record<string, unknown>)
        : null;

      const now = new Date().toISOString();
      const nextSite: SiteRecord = {
        id: createId(),
        name: siteForm.name.trim(),
        domain: normalizedDomain,
        ownerUserId,
        status: siteForm.status,
        isPublic: siteForm.isPublic,
        publishedAt: siteForm.status === "ACTIVE" ? now : null,
        themeConfig: parsedThemeConfig,
        seoTitleDefault: siteForm.seoTitleDefault.trim() || null,
        seoDescDefault: siteForm.seoDescDefault.trim() || null,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      };

      await new Promise((resolve) => setTimeout(resolve, 300));

      window.localStorage.setItem(SITE_STORAGE_KEY, JSON.stringify(nextSite));
      window.localStorage.setItem(OWNER_STORAGE_KEY, ownerUserId);

      setCreatedSite(nextSite);
      setSiteForm(buildSiteForm(settings, nextSite));
      setSettings((prev) => ({ ...prev, siteName: nextSite.name }));

      showToast({ kind: "ok", text: "Tạo site thành công và đã khóa 1 site / account." });
    } catch (error: unknown) {
      const message =
        error instanceof SyntaxError
          ? "themeConfig phải là JSON hợp lệ."
          : error instanceof Error
            ? error.message
            : "Không thể tạo site.";

      showToast({ kind: "err", text: message });
    } finally {
      setIsCreatingSite(false);
    }
  }

  function reset() {
    setSettings(DEFAULTS);
    storeSettings(DEFAULTS);
    showToast({ kind: "ok", text: "Đã reset về mặc định, chưa lưu." });
  }

  if (!isHydrated) return null;

  return (
    <div className={styles.page} style={previewVars}>
      <div className={styles.shell}>
        <SettingsSidebar sections={SECTION_META} />

        <main className={styles.main}>
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <div className={styles.stats}>
                {stats.map((item) => (
                  <div key={item.label} className={styles.statCard}>
                    <span>{item.label}</span>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.heroActions}>
              <button type="button" className={styles.btnGhost} onClick={reset} disabled={isSaving}>
                Reset
              </button>
              <button type="button" className={styles.btnPrimary} onClick={save} disabled={isSaving || !dirty}>
                {isSaving ? "Saving..." : dirty ? "Save changes" : "Saved"}
              </button>
            </div>
          </section>

          {toast && (
            <div className={`${styles.toast} ${toast.kind === "ok" ? styles.toastOk : styles.toastErr}`} role="status">
              {toast.text}
            </div>
          )}

          <div className={styles.contentLayout}>
            <div className={styles.contentColumn}>
              <SectionCard id="site" title="Create Site" badge="Launch">
                <CreateSiteSection
                  siteForm={siteForm}
                  createdSite={createdSite}
                  normalizedDomain={normalizedDomain}
                  canCreateSite={canCreateSite}
                  isCreatingSite={isCreatingSite}
                  onCreateSite={createSite}
                  onSiteFieldChange={setSiteField}
                />
              </SectionCard>

              <SectionCard id="overview" title="Project Overview" badge="Core">
                <OverviewSection
                  settings={settings}
                  firstFieldRef={firstFieldRef}
                  onSiteNameChange={(value) => setField("siteName", value)}
                  onLanguageChange={setLanguage}
                  onTimezoneChange={setTimezone}
                  onCurrencyChange={setCurrency}
                  onDensityChange={setDensity}
                />
              </SectionCard>

              <SectionCard id="blueprint" title="Website Blueprint" badge="Strategy">
                <BlueprintSection
                  settings={settings}
                  blueprintSummary={blueprintSummary}
                  onApplyBlueprint={setWebsiteType}
                  onAdminPresetChange={setAdminPreset}
                />
              </SectionCard>

              <SectionCard id="localization" title="Localization" badge="i18n">
                <LocalizationSection
                  settings={settings}
                  onDefaultLocaleChange={setDefaultLocale}
                  onEnableMultilingualChange={setEnableMultilingual}
                  onToggleLocale={toggleLocale}
                />
              </SectionCard>

              <SectionCard id="modules" title="Schema Modules" badge="Data">
                <ModulesSection modules={settings.data.modules} onModuleChange={setModuleField} />
              </SectionCard>

              <SectionCard id="behavior" title="Behavior" badge="UX">
                <BehaviorSection
                  autoSave={settings.autoSave}
                  confirmBeforeDelete={settings.confirmBeforeDelete}
                  autoRefresh={settings.autoRefresh}
                  notifyOnChange={settings.notifyOnChange}
                  onChange={setBehaviorField}
                />
              </SectionCard>
            </div>

            <SettingsSummary settings={settings} createdSite={createdSite} blueprintSummary={blueprintSummary} />
          </div>
        </main>
      </div>
    </div>
  );
}

function SettingsSidebar({ sections }: { sections: SectionMeta[] }) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarTop}>
        <div className={styles.brandMark}>S</div>

        <div className={styles.brandContent}>
          <p className={styles.sidebarEyebrow}>Settings Workspace</p>
          <div className={styles.statusRow}>
            <h2 className={styles.sidebarTitle}>System Design</h2>
            <span className={styles.workspaceStatus}>Live</span>
          </div>
        </div>
      </div>

      <div className={styles.sidebarSectionTitle}>Navigation</div>

      <nav className={styles.nav}>
        {sections.map((section, index) => (
          <a key={section.id} href={`#${section.id}`} className={styles.navLink}>
            <div className={styles.navLeft}>
              <span className={styles.navIndex}>{String(index + 1).padStart(2, "0")}</span>
              <span className={styles.navText}>{section.title}</span>
            </div>

            {section.badge ? <span className={styles.navBadge}>{section.badge}</span> : null}
          </a>
        ))}
      </nav>

      <div className={styles.sidebarFooter}>
        <span className={styles.dot} />
        <span>Workspace ready</span>
      </div>
    </aside>
  );
}

function SettingsSummary({
  settings,
  createdSite,
  blueprintSummary,
}: {
  settings: SettingsState;
  createdSite: SiteRecord | null;
  blueprintSummary: ReturnType<typeof getBlueprintSummary>;
}) {
  return (
    <aside className={styles.summaryColumn}>
      <div className={styles.summaryCard}>
        <div className={styles.summaryHead}>
          <p className={styles.summaryEyebrow}>Summary</p>
          <h3 className={styles.summaryTitle}>Configuration Snapshot</h3>
        </div>

        <SummaryList
          items={[
            ["Website type", settings.project.websiteType],
            ["Admin preset", settings.project.adminPreset],
            ["Theme", settings.theme],
            ["Locales", settings.project.enabledLocales.join(", ")],
            ["Modules", blueprintSummary.activeModules.length ? blueprintSummary.activeModules.join(", ") : "none"],
            ["Auto save", settings.autoSave ? "enabled" : "disabled"],
            ["2FA", settings.security.twoFA ? "enabled" : "disabled"],
          ]}
        />
      </div>

      <div className={styles.summaryCard}>
        <div className={styles.summaryHead}>
          <p className={styles.summaryEyebrow}>Site</p>
          <h3 className={styles.summaryTitle}>Current Site State</h3>
        </div>

        {createdSite ? (
          <SummaryList
            items={[
              ["Name", createdSite.name],
              ["Domain", createdSite.domain],
              ["Status", createdSite.status],
              ["Public", createdSite.isPublic ? "true" : "false"],
              ["Created", formatDate(createdSite.createdAt)],
              ["Published", formatDate(createdSite.publishedAt)],
            ]}
          />
        ) : (
          <div className={styles.emptyState}>
            <strong>Chưa có site được tạo</strong>
          </div>
        )}
      </div>

      <div className={styles.summaryCard}>
        <div className={styles.summaryHead}>
          <p className={styles.summaryEyebrow}>Live Style</p>
          <h3 className={styles.summaryTitle}>Preview Tokens</h3>
        </div>

        <div className={styles.tokenGrid}>
          <div className={styles.tokenBox}>
            <span>Accent</span>
            <strong>{settings.accent}</strong>
          </div>
          <div className={styles.tokenBox}>
            <span>Radius</span>
            <strong>{settings.radius}px</strong>
          </div>
          <div className={styles.tokenBox}>
            <span>Font</span>
            <strong>{settings.fontSize}</strong>
          </div>
          <div className={styles.tokenBox}>
            <span>Density</span>
            <strong>{settings.density}</strong>
          </div>
        </div>
      </div>
    </aside>
  );
}

function OverviewSection({
  settings,
  firstFieldRef,
  onSiteNameChange,
  onLanguageChange,
  onTimezoneChange,
  onCurrencyChange,
  onDensityChange,
}: {
  settings: SettingsState;
  firstFieldRef: React.RefObject<HTMLInputElement | null>;
  onSiteNameChange: (value: string) => void;
  onLanguageChange: (value: Language) => void;
  onTimezoneChange: (value: Timezone) => void;
  onCurrencyChange: (value: Currency) => void;
  onDensityChange: (value: Density) => void;
}) {
  return (
    <>
      <FieldRow label="Site name" hint="Tên hiển thị chính của project.">
        <input
          ref={firstFieldRef}
          className={styles.input}
          value={settings.siteName}
          onChange={(event) => onSiteNameChange(event.target.value)}
          placeholder="Your site name"
        />
      </FieldRow>

      <FieldGrid>
        <FieldRow label="Language">
          <SelectField value={settings.language} options={LANGUAGE_OPTIONS} onChange={onLanguageChange} />
        </FieldRow>

        <FieldRow label="Timezone">
          <SelectField value={settings.timezone} options={TIMEZONE_OPTIONS} onChange={onTimezoneChange} />
        </FieldRow>

        <FieldRow label="Currency">
          <SelectField value={settings.currency} options={CURRENCY_OPTIONS} onChange={onCurrencyChange} />
        </FieldRow>

        <FieldRow label="Density">
          <div className={styles.segment}>
            <SegBtn active={settings.density === "comfortable"} onClick={() => onDensityChange("comfortable")}>
              Comfortable
            </SegBtn>
            <SegBtn active={settings.density === "compact"} onClick={() => onDensityChange("compact")}>
              Compact
            </SegBtn>
          </div>
        </FieldRow>
      </FieldGrid>
    </>
  );
}

function BlueprintSection({
  settings,
  blueprintSummary,
  onApplyBlueprint,
  onAdminPresetChange,
}: {
  settings: SettingsState;
  blueprintSummary: ReturnType<typeof getBlueprintSummary>;
  onApplyBlueprint: (value: WebsiteType) => void;
  onAdminPresetChange: (value: AdminPreset) => void;
}) {
  return (
    <>
      <FieldRow label="Website type" hint="Preset khởi tạo cho hệ thống, vẫn có thể tinh chỉnh thủ công phía dưới.">
        <div className={styles.stack}>
          <SelectField
            value={settings.project.websiteType}
            options={WEBSITE_TYPE_OPTIONS}
            onChange={onApplyBlueprint}
          />
          <p className={styles.helperText}>
            {getOptionDescription(WEBSITE_TYPE_OPTIONS, settings.project.websiteType)}
          </p>
        </div>
      </FieldRow>

      <FieldRow label="Admin preset" hint="Kiểu giao diện admin gợi ý theo mục tiêu vận hành.">
        <div className={styles.stack}>
          <SelectField
            value={settings.project.adminPreset}
            options={ADMIN_PRESET_OPTIONS}
            onChange={onAdminPresetChange}
          />
          <p className={styles.helperText}>
            {getOptionDescription(ADMIN_PRESET_OPTIONS, settings.project.adminPreset)}
          </p>
        </div>
      </FieldRow>

      <div className={styles.highlightBox}>
        <div className={styles.highlightRow}>
          <span>Recommended preset</span>
          <strong>{blueprintSummary.recommendedAdmin}</strong>
        </div>
        <div className={styles.highlightRow}>
          <span>Current type</span>
          <strong>{settings.project.websiteType}</strong>
        </div>
      </div>
    </>
  );
}

function LocalizationSection({
  settings,
  onEnableMultilingualChange,
  onDefaultLocaleChange,
  onToggleLocale,
}: {
  settings: SettingsState;
  onEnableMultilingualChange: (value: boolean) => void;
  onDefaultLocaleChange: (value: LocaleOption) => void;
  onToggleLocale: (value: LocaleOption) => void;
}) {
  return (
    <>
      <FieldGrid>
        <FieldRow label="Enable multilingual">
          <Toggle checked={settings.project.enableMultilingual} onChange={onEnableMultilingualChange} />
        </FieldRow>

        <FieldRow label="Default locale">
          <select
            className={styles.select}
            value={settings.project.defaultLocale}
            onChange={(event) => onDefaultLocaleChange(event.target.value as LocaleOption)}
          >
            {settings.project.enabledLocales.map((locale) => (
              <option key={locale} value={locale}>
                {locale.toUpperCase()}
              </option>
            ))}
          </select>
        </FieldRow>
      </FieldGrid>

      <FieldRow label="Enabled locales" hint="Chọn các locale sẽ được active trên project.">
        <div className={styles.segment}>
          {LOCALE_OPTIONS.map((locale) => (
            <SegBtn
              key={locale}
              active={settings.project.enabledLocales.includes(locale)}
              onClick={() => onToggleLocale(locale)}
            >
              {locale.toUpperCase()}
            </SegBtn>
          ))}
        </div>
      </FieldRow>

      <div className={styles.inlineList}>
        {settings.project.enabledLocales.map((locale) => (
          <span key={locale} className={styles.tag}>
            {locale.toUpperCase()}
          </span>
        ))}
      </div>
    </>
  );
}

function ModulesSection({
  modules,
  onModuleChange,
}: {
  modules: DataModules;
  onModuleChange: <K extends keyof DataModules>(key: K, value: DataModules[K]) => void;
}) {
  return (
    <div className={styles.switchGrid}>
      <ToggleCard
        title="Blog module"
        desc="Bài viết, category, tag, editorial."
        checked={modules.blog}
        onChange={(value) => onModuleChange("blog", value)}
      />
      <ToggleCard
        title="Shop module"
        desc="Sản phẩm, giá, đơn hàng, kho."
        checked={modules.shop}
        onChange={(value) => onModuleChange("shop", value)}
      />
      <ToggleCard
        title="Booking module"
        desc="Lịch hẹn, slot, trạng thái."
        checked={modules.booking}
        onChange={(value) => onModuleChange("booking", value)}
      />
      <ToggleCard
        title="Membership module"
        desc="Phân quyền, gói thành viên, quyền truy cập."
        checked={modules.membership}
        onChange={(value) => onModuleChange("membership", value)}
      />
      <ToggleCard
        title="SEO module"
        desc="Meta title, description, slug, index rules."
        checked={modules.seo}
        onChange={(value) => onModuleChange("seo", value)}
      />
    </div>
  );
}

function BehaviorSection({
  autoSave,
  confirmBeforeDelete,
  autoRefresh,
  notifyOnChange,
  onChange,
}: {
  autoSave: boolean;
  confirmBeforeDelete: boolean;
  autoRefresh: boolean;
  notifyOnChange: boolean;
  onChange: <K extends "autoSave" | "confirmBeforeDelete" | "autoRefresh" | "notifyOnChange">(
    key: K,
    value: SettingsState[K],
  ) => void;
}) {
  return (
    <div className={styles.switchGrid}>
      <ToggleCard
        title="Auto save"
        desc="Tự động lưu thay đổi để giảm thao tác."
        checked={autoSave}
        onChange={(value) => onChange("autoSave", value)}
      />
      <ToggleCard
        title="Confirm before delete"
        desc="Yêu cầu xác nhận trước khi xóa dữ liệu."
        checked={confirmBeforeDelete}
        onChange={(value) => onChange("confirmBeforeDelete", value)}
      />
      <ToggleCard
        title="Auto refresh"
        desc="Tự động refresh dữ liệu ở dashboard/list."
        checked={autoRefresh}
        onChange={(value) => onChange("autoRefresh", value)}
      />
      <ToggleCard
        title="Notify on changes"
        desc="Hiển thị feedback khi hệ thống có thay đổi."
        checked={notifyOnChange}
        onChange={(value) => onChange("notifyOnChange", value)}
      />
    </div>
  );
}

function SectionCard({
  id,
  title,
  badge,
  children,
}: {
  id: string;
  title: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <section id={id} className={styles.sectionCard}>
      <div className={styles.sectionHead}>
        {badge ? <span className={styles.sectionBadge}>{badge}</span> : null}
        <h2 className={styles.sectionTitle}>{title}</h2>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

function FieldGrid({ children }: { children: ReactNode }) {
  return <div className={styles.fieldGrid}>{children}</div>;
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <div className={styles.fieldRow}>
      <div className={styles.fieldMeta}>
        <label className={styles.label}>{label}</label>
        {hint ? <p className={styles.hint}>{hint}</p> : null}
      </div>
      <div className={styles.fieldControl}>{children}</div>
    </div>
  );
}

function SummaryList({ items }: { items: [string, string][] }) {
  return (
    <div className={styles.summaryList}>
      {items.map(([label, value]) => (
        <div key={label} className={styles.summaryItem}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

type CreateSiteSectionProps = {
  siteForm: SiteFormState;
  createdSite: SiteRecord | null;
  normalizedDomain: string;
  canCreateSite: boolean;
  isCreatingSite: boolean;
  onCreateSite: () => void;
  onSiteFieldChange: <K extends keyof SiteFormState>(key: K, value: SiteFormState[K]) => void;
};

function CreateSiteSection({
  siteForm,
  createdSite,
  normalizedDomain,
  canCreateSite,
  isCreatingSite,
  onCreateSite,
  onSiteFieldChange,
}: CreateSiteSectionProps) {
  const siteLocked = Boolean(createdSite);

  return (
    <div className={styles.siteSection}>
      <div className={styles.formColumns}>
        <div className={styles.formColumn}>
          <FieldRow label="Site name">
            <input
              className={styles.input}
              value={siteForm.name}
              onChange={(event) => onSiteFieldChange("name", event.target.value)}
              placeholder="My Website"
              disabled={siteLocked}
            />
          </FieldRow>

          <FieldRow label="Domain" hint="Ví dụ: demo.example.com">
            <div className={styles.stack}>
              <input
                className={styles.input}
                value={siteForm.domain}
                onChange={(event) => onSiteFieldChange("domain", slugifyDomain(event.target.value))}
                placeholder="demo.example.com"
                disabled={siteLocked}
              />
              <p className={styles.helperText}>
                Normalized domain: <strong>{normalizedDomain || "—"}</strong>
              </p>
            </div>
          </FieldRow>

          <FieldRow label="Status">
            <select
              className={styles.select}
              value={siteForm.status}
              onChange={(event) => onSiteFieldChange("status", event.target.value as SiteStatus)}
              disabled={siteLocked}
            >
              {SITE_STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </FieldRow>

          <FieldRow label="Public site">
            <Toggle
              checked={siteForm.isPublic}
              onChange={(value) => onSiteFieldChange("isPublic", value)}
              disabled={siteLocked}
            />
          </FieldRow>
        </div>

        <div className={styles.formColumn}>
          <FieldRow label="SEO title default">
            <input
              className={styles.input}
              value={siteForm.seoTitleDefault}
              onChange={(event) => onSiteFieldChange("seoTitleDefault", event.target.value)}
              placeholder="Default SEO title"
              disabled={siteLocked}
            />
          </FieldRow>

          <FieldRow label="SEO description default">
            <textarea
              className={styles.textarea}
              value={siteForm.seoDescDefault}
              onChange={(event) => onSiteFieldChange("seoDescDefault", event.target.value)}
              placeholder="Default SEO description"
              rows={4}
              disabled={siteLocked}
            />
          </FieldRow>

          <FieldRow label="Theme config JSON" hint='Dữ liệu sẽ map vào field "themeConfig".'>
            <textarea
              className={styles.textareaCode}
              value={siteForm.themeConfig}
              onChange={(event) => onSiteFieldChange("themeConfig", event.target.value)}
              rows={8}
              disabled={siteLocked}
            />
          </FieldRow>
        </div>
      </div>

      <div className={styles.siteFooter}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={onCreateSite}
          disabled={isCreatingSite || !canCreateSite}
        >
          {isCreatingSite ? "Creating..." : "Create site"}
        </button>

        {createdSite ? (
          <div className={styles.statusNote}>
            <strong>Site đã tạo:</strong> {createdSite.name} · {createdSite.domain} · {createdSite.status}
          </div>
        ) : (
          <div className={styles.statusNote}>
            Sau khi tạo site, form sẽ bị khóa để đảm bảo mỗi tài khoản chỉ có một site.
          </div>
        )}
      </div>
    </div>
  );
}

function SelectField<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <select className={styles.select} value={value} onChange={(event) => onChange(event.target.value as T)}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function Toggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      className={`${styles.toggle} ${checked ? styles.toggleOn : ""}`}
      aria-pressed={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
    >
      <span className={styles.toggleKnob} />
    </button>
  );
}

function SegBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button type="button" className={`${styles.segBtn} ${active ? styles.segBtnActive : ""}`} onClick={onClick}>
      {children}
    </button>
  );
}

function ToggleCard({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className={styles.toggleCard}>
      <div className={styles.toggleCardHead}>
        <div>
          <h4>{title}</h4>
          <p>{desc}</p>
        </div>
        <Toggle checked={checked} onChange={onChange} />
      </div>
    </div>
  );
}
