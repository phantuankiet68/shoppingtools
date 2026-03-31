import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";
import type {
  AdminPreset,
  Currency,
  Density,
  FontSize,
  Language,
  LocaleOption,
  Setting,
  SortOption,
  ThemeMode,
  Timezone,
  WebsiteType,
} from "@prisma/client";

/* ----------------------------- utils ----------------------------- */

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

type PrismaErrorLike = {
  code?: string;
  meta?: { target?: unknown };
  message?: string;
};

function asPrismaError(error: unknown): PrismaErrorLike {
  if (typeof error !== "object" || error === null) return {};

  const obj = error as Record<string, unknown>;
  const meta = typeof obj.meta === "object" && obj.meta !== null ? (obj.meta as Record<string, unknown>) : undefined;

  return {
    code: typeof obj.code === "string" ? obj.code : undefined,
    meta: meta ? { target: meta.target } : undefined,
    message: typeof obj.message === "string" ? obj.message : undefined,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function toInt(value: unknown) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : null;
}

function getAuthUserId(authUser: unknown): string | null {
  if (!authUser || typeof authUser !== "object") return null;

  const obj = authUser as Record<string, unknown>;
  const candidate = obj.id ?? obj.userId ?? obj.user_id ?? obj.uid;

  if (typeof candidate !== "string") return null;

  const trimmed = candidate.trim();
  return trimmed || null;
}

/* ----------------------------- enum guards ----------------------------- */

const LANGUAGE_VALUES = ["vi", "en"] as const satisfies readonly Language[];
const TIMEZONE_VALUES = [
  "Asia_Ho_Chi_Minh",
  "UTC",
  "Asia_Tokyo",
  "Europe_London",
  "America_Los_Angeles",
] as const satisfies readonly Timezone[];
const CURRENCY_VALUES = ["VND", "USD"] as const satisfies readonly Currency[];
const THEME_VALUES = ["light", "dark", "auto"] as const satisfies readonly ThemeMode[];
const FONT_SIZE_VALUES = ["sm", "md", "lg"] as const satisfies readonly FontSize[];
const DENSITY_VALUES = ["comfortable", "compact"] as const satisfies readonly Density[];
const WEBSITE_TYPE_VALUES = [
  "landing",
  "blog",
  "company",
  "ecommerce",
  "booking",
  "news",
  "lms",
  "directory",
] as const satisfies readonly WebsiteType[];
const LOCALE_VALUES = ["vi", "en", "ja"] as const satisfies readonly LocaleOption[];
const SORT_VALUES = ["newest", "oldest", "name_asc", "name_desc"] as const satisfies readonly SortOption[];

function normalizeEnum<T extends string>(value: unknown, values: readonly T[]): T | null {
  const raw = typeof value === "string" ? value.trim() : String(value ?? "").trim();
  if (!raw) return null;
  return values.includes(raw as T) ? (raw as T) : null;
}

function normalizeTimezone(value: unknown): Timezone | null {
  const raw = typeof value === "string" ? value.trim() : String(value ?? "").trim();

  switch (raw) {
    case "Asia/Ho_Chi_Minh":
    case "Asia_Ho_Chi_Minh":
      return "Asia_Ho_Chi_Minh";
    case "UTC":
      return "UTC";
    case "Asia/Tokyo":
    case "Asia_Tokyo":
      return "Asia_Tokyo";
    case "Europe/London":
    case "Europe_London":
      return "Europe_London";
    case "America/Los_Angeles":
    case "America_Los_Angeles":
      return "America_Los_Angeles";
    default:
      return null;
  }
}

function normalizeAdminPreset(value: unknown): AdminPreset | null {
  const raw = typeof value === "string" ? value.trim() : String(value ?? "").trim();

  switch (raw) {
    case "minimal-admin":
    case "minimal_admin":
      return "minimal_admin";
    case "content-admin":
    case "content_admin":
      return "content_admin";
    case "commerce-admin":
    case "commerce_admin":
      return "commerce_admin";
    case "booking-admin":
    case "booking_admin":
      return "booking_admin";
    default:
      return null;
  }
}

function normalizeEnabledLocales(value: unknown): LocaleOption[] | null {
  if (!Array.isArray(value)) return null;

  const normalized = value
    .map((item) => normalizeEnum(item, LOCALE_VALUES))
    .filter((item): item is LocaleOption => item !== null);

  return normalized.length > 0 ? normalized : null;
}

/* ----------------------------- payload normalize ----------------------------- */

type NormalizedSettingsData = {
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
  dataModules: {
    blog: boolean;
    shop: boolean;
    booking: boolean;
    membership: boolean;
    seo: boolean;
  };
  integrations: {
    google: boolean;
    email: boolean;
    payment: boolean;
  };
  security: {
    twoFA: boolean;
    sessionTimeoutMin: number;
  };
  advanced: {
    maintenanceMode: boolean;
    debugMode: boolean;
  };
  autoSave: boolean;
  confirmBeforeDelete: boolean;
  autoRefresh: boolean;
  notifyOnChange: boolean;
};

function normalizeSettingsPayload(body: Record<string, unknown>): { data: NormalizedSettingsData } | { error: string } {
  const project = isObject(body.project) ? body.project : null;
  const data = isObject(body.data) ? body.data : null;
  const integrations = isObject(body.integrations) ? body.integrations : null;
  const security = isObject(body.security) ? body.security : null;
  const advanced = isObject(body.advanced) ? body.advanced : null;
  const modules = data && isObject(data.modules) ? data.modules : null;

  if (!project || !data || !integrations || !security || !advanced || !modules) {
    return { error: "Invalid settings payload" };
  }

  const siteName = String(body.siteName ?? "").trim();
  if (!siteName) return { error: "siteName is required" };

  const accent = String(body.accent ?? "").trim();
  if (!accent) return { error: "accent is required" };

  const language = normalizeEnum(body.language, LANGUAGE_VALUES);
  if (!language) return { error: "Invalid language" };

  const timezone = normalizeTimezone(body.timezone);
  if (!timezone) return { error: "Invalid timezone" };

  const currency = normalizeEnum(body.currency, CURRENCY_VALUES);
  if (!currency) return { error: "Invalid currency" };

  const theme = normalizeEnum(body.theme, THEME_VALUES);
  if (!theme) return { error: "Invalid theme" };

  const fontSize = normalizeEnum(body.fontSize, FONT_SIZE_VALUES);
  if (!fontSize) return { error: "Invalid fontSize" };

  const density = normalizeEnum(body.density, DENSITY_VALUES);
  if (!density) return { error: "Invalid density" };

  const websiteType = normalizeEnum(project.websiteType, WEBSITE_TYPE_VALUES);
  if (!websiteType) return { error: "Invalid websiteType" };

  const adminPreset = normalizeAdminPreset(project.adminPreset);
  if (!adminPreset) return { error: "Invalid adminPreset" };

  const defaultLocale = normalizeEnum(project.defaultLocale, LOCALE_VALUES);
  if (!defaultLocale) return { error: "Invalid defaultLocale" };

  const enabledLocales = normalizeEnabledLocales(project.enabledLocales);
  if (!enabledLocales) return { error: "Invalid enabledLocales" };

  const defaultSort = normalizeEnum(data.defaultSort, SORT_VALUES);
  if (!defaultSort) return { error: "Invalid defaultSort" };

  const radius = toInt(body.radius);
  if (radius === null) return { error: "Invalid radius" };

  const pageSize = toInt(data.pageSize);
  if (pageSize === null) return { error: "Invalid pageSize" };

  const sessionTimeoutMin = toInt(security.sessionTimeoutMin);
  if (sessionTimeoutMin === null) {
    return { error: "Invalid security.sessionTimeoutMin" };
  }

  return {
    data: {
      siteName,
      language,
      timezone,
      currency,
      theme,
      accent,
      fontSize,
      radius,
      density,
      websiteType,
      adminPreset,
      defaultLocale,
      enabledLocales,
      enableMultilingual: Boolean(project.enableMultilingual),
      pageSize,
      defaultSort,
      showSku: Boolean(data.showSku),
      showBarcode: Boolean(data.showBarcode),
      dataModules: {
        blog: Boolean(modules.blog),
        shop: Boolean(modules.shop),
        booking: Boolean(modules.booking),
        membership: Boolean(modules.membership),
        seo: Boolean(modules.seo),
      },
      integrations: {
        google: Boolean(integrations.google),
        email: Boolean(integrations.email),
        payment: Boolean(integrations.payment),
      },
      security: {
        twoFA: Boolean(security.twoFA),
        sessionTimeoutMin,
      },
      advanced: {
        maintenanceMode: Boolean(advanced.maintenanceMode),
        debugMode: Boolean(advanced.debugMode),
      },
      autoSave: Boolean(body.autoSave),
      confirmBeforeDelete: Boolean(body.confirmBeforeDelete),
      autoRefresh: Boolean(body.autoRefresh),
      notifyOnChange: Boolean(body.notifyOnChange),
    },
  };
}

/* ----------------------------- response mapper ----------------------------- */

const TIMEZONE_RESPONSE_MAP: Record<Timezone, string> = {
  Asia_Ho_Chi_Minh: "Asia/Ho_Chi_Minh",
  UTC: "UTC",
  Asia_Tokyo: "Asia/Tokyo",
  Europe_London: "Europe/London",
  America_Los_Angeles: "America/Los_Angeles",
};

const ADMIN_PRESET_RESPONSE_MAP: Record<AdminPreset, string> = {
  minimal_admin: "minimal-admin",
  content_admin: "content-admin",
  commerce_admin: "commerce-admin",
  booking_admin: "booking-admin",
};

function mapSettingToResponse(setting: Setting) {
  return {
    id: setting.id,
    ownerUserId: setting.ownerUserId,
    siteName: setting.siteName,
    language: setting.language,
    timezone: TIMEZONE_RESPONSE_MAP[setting.timezone],
    currency: setting.currency,
    theme: setting.theme,
    accent: setting.accent,
    fontSize: setting.fontSize,
    radius: setting.radius,
    density: setting.density,
    project: {
      websiteType: setting.websiteType,
      adminPreset: ADMIN_PRESET_RESPONSE_MAP[setting.adminPreset],
      defaultLocale: setting.defaultLocale,
      enabledLocales: setting.enabledLocales,
      enableMultilingual: setting.enableMultilingual,
    },
    data: {
      pageSize: setting.pageSize,
      defaultSort: setting.defaultSort,
      showSku: setting.showSku,
      showBarcode: setting.showBarcode,
      modules: setting.dataModules,
    },
    integrations: setting.integrations,
    security: setting.security,
    advanced: setting.advanced,
    autoSave: setting.autoSave,
    confirmBeforeDelete: setting.confirmBeforeDelete,
    autoRefresh: setting.autoRefresh,
    notifyOnChange: setting.notifyOnChange,
    createdAt: setting.createdAt,
    updatedAt: setting.updatedAt,
  };
}

/* ----------------------------- GET ----------------------------- */
/**
 * GET /api/settings
 */
export async function GET() {
  try {
    const authUser = await requireAdminAuthUser();
    const ownerUserId = getAuthUserId(authUser);

    if (!ownerUserId) return jsonError("Unauthorized", 401);

    const item = await prisma.setting.findUnique({
      where: { ownerUserId },
    });

    if (!item) {
      return NextResponse.json({ item: null });
    }

    return NextResponse.json({
      item: mapSettingToResponse(item),
    });
  } catch (error: unknown) {
    const msg = asPrismaError(error).message ?? "";
    if (msg.toLowerCase().includes("unauth")) return jsonError("Unauthorized", 401);
    return jsonError(msg || "Server error", 500);
  }
}

/* ----------------------------- PUT ----------------------------- */
/**
 * PUT /api/settings
 * body: full settings payload from page.tsx
 */
export async function PUT(req: Request) {
  try {
    const authUser = await requireAdminAuthUser();
    const ownerUserId = getAuthUserId(authUser);

    if (!ownerUserId) return jsonError("Unauthorized", 401);

    const ct = req.headers.get("content-type") || "";
    if (!ct.includes("application/json")) {
      return jsonError("Content-Type must be application/json", 415);
    }

    const bodyUnknown: unknown = await req.json().catch(() => null);
    if (!isObject(bodyUnknown)) {
      return jsonError("Invalid JSON body", 400);
    }

    const normalized = normalizeSettingsPayload(bodyUnknown);
    if ("error" in normalized) {
      return jsonError(normalized.error, 400);
    }

    const item = await prisma.setting.upsert({
      where: { ownerUserId },
      update: normalized.data,
      create: {
        ownerUserId,
        ...normalized.data,
      },
    });

    return NextResponse.json({
      item: mapSettingToResponse(item),
    });
  } catch (error: unknown) {
    const pe = asPrismaError(error);
    const msg = pe.message ?? "";

    if (msg.toLowerCase().includes("unauth")) {
      return jsonError("Unauthorized", 401);
    }

    if (pe.code === "P2002") {
      return jsonError("Settings already exists", 409);
    }

    return jsonError(msg || "Server error", 500);
  }
}
