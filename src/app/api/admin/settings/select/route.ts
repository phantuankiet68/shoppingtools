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
  Prisma,
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

function getErrorMessage(error: unknown, fallback = "Server error") {
  const prismaError = asPrismaError(error);
  if (typeof prismaError.message === "string" && prismaError.message.trim()) {
    return prismaError.message;
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallback;
}

function hasUnauthMessage(error: unknown) {
  return getErrorMessage(error, "").toLowerCase().includes("unauth");
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

async function ensureSettingExists(ownerUserId: string) {
  return prisma.setting.findUnique({
    where: { ownerUserId },
    select: { id: true },
  });
}

/* ----------------------------- enum values ----------------------------- */

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

/* ----------------------------- enum normalizers ----------------------------- */

function normalizeEnum<T extends string>(value: unknown, values: readonly T[]): T | null {
  const raw = typeof value === "string" ? value.trim() : String(value ?? "").trim();
  if (!raw) return null;
  return values.includes(raw as T) ? (raw as T) : null;
}

function normalizeLanguage(value: unknown): Language | null {
  return normalizeEnum(value, LANGUAGE_VALUES);
}

function normalizeCurrency(value: unknown): Currency | null {
  return normalizeEnum(value, CURRENCY_VALUES);
}

function normalizeTheme(value: unknown): ThemeMode | null {
  return normalizeEnum(value, THEME_VALUES);
}

function normalizeFontSize(value: unknown): FontSize | null {
  return normalizeEnum(value, FONT_SIZE_VALUES);
}

function normalizeDensity(value: unknown): Density | null {
  return normalizeEnum(value, DENSITY_VALUES);
}

function normalizeWebsiteType(value: unknown): WebsiteType | null {
  return normalizeEnum(value, WEBSITE_TYPE_VALUES);
}

function normalizeDefaultLocale(value: unknown): LocaleOption | null {
  return normalizeEnum(value, LOCALE_VALUES);
}

function normalizeDefaultSort(value: unknown): SortOption | null {
  return normalizeEnum(value, SORT_VALUES);
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

  const locales = value
    .map((item) => normalizeDefaultLocale(item))
    .filter((item): item is LocaleOption => item !== null);

  return locales.length > 0 ? locales : null;
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

function mapSettingToResponse(item: Setting) {
  return {
    id: item.id,
    ownerUserId: item.ownerUserId,
    siteName: item.siteName,
    language: item.language,
    timezone: TIMEZONE_RESPONSE_MAP[item.timezone],
    currency: item.currency,
    theme: item.theme,
    accent: item.accent,
    fontSize: item.fontSize,
    radius: item.radius,
    density: item.density,
    project: {
      websiteType: item.websiteType,
      adminPreset: ADMIN_PRESET_RESPONSE_MAP[item.adminPreset],
      defaultLocale: item.defaultLocale,
      enabledLocales: item.enabledLocales,
      enableMultilingual: item.enableMultilingual,
    },
    data: {
      pageSize: item.pageSize,
      defaultSort: item.defaultSort,
      showSku: item.showSku,
      showBarcode: item.showBarcode,
      modules: item.dataModules,
    },
    integrations: item.integrations,
    security: item.security,
    advanced: item.advanced,
    autoSave: item.autoSave,
    confirmBeforeDelete: item.confirmBeforeDelete,
    autoRefresh: item.autoRefresh,
    notifyOnChange: item.notifyOnChange,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
}

/* ----------------------------- patch builder ----------------------------- */

function buildPatchData(body: Record<string, unknown>): { data: Prisma.SettingUpdateInput } | { error: string } {
  const patch: Prisma.SettingUpdateInput = {};

  if (Object.prototype.hasOwnProperty.call(body, "siteName")) {
    const siteName = String(body.siteName ?? "").trim();
    if (!siteName) return { error: "siteName cannot be empty" };
    patch.siteName = siteName;
  }

  if (Object.prototype.hasOwnProperty.call(body, "language")) {
    const language = normalizeLanguage(body.language);
    if (!language) return { error: "Invalid language" };
    patch.language = language;
  }

  if (Object.prototype.hasOwnProperty.call(body, "timezone")) {
    const timezone = normalizeTimezone(body.timezone);
    if (!timezone) return { error: "Invalid timezone" };
    patch.timezone = timezone;
  }

  if (Object.prototype.hasOwnProperty.call(body, "currency")) {
    const currency = normalizeCurrency(body.currency);
    if (!currency) return { error: "Invalid currency" };
    patch.currency = currency;
  }

  if (Object.prototype.hasOwnProperty.call(body, "theme")) {
    const theme = normalizeTheme(body.theme);
    if (!theme) return { error: "Invalid theme" };
    patch.theme = theme;
  }

  if (Object.prototype.hasOwnProperty.call(body, "accent")) {
    const accent = String(body.accent ?? "").trim();
    if (!accent) return { error: "accent cannot be empty" };
    patch.accent = accent;
  }

  if (Object.prototype.hasOwnProperty.call(body, "fontSize")) {
    const fontSize = normalizeFontSize(body.fontSize);
    if (!fontSize) return { error: "Invalid fontSize" };
    patch.fontSize = fontSize;
  }

  if (Object.prototype.hasOwnProperty.call(body, "radius")) {
    const radius = toInt(body.radius);
    if (radius === null) return { error: "Invalid radius" };
    patch.radius = radius;
  }

  if (Object.prototype.hasOwnProperty.call(body, "density")) {
    const density = normalizeDensity(body.density);
    if (!density) return { error: "Invalid density" };
    patch.density = density;
  }

  if (Object.prototype.hasOwnProperty.call(body, "websiteType")) {
    const websiteType = normalizeWebsiteType(body.websiteType);
    if (!websiteType) return { error: "Invalid websiteType" };
    patch.websiteType = websiteType;
  }

  if (Object.prototype.hasOwnProperty.call(body, "adminPreset")) {
    const adminPreset = normalizeAdminPreset(body.adminPreset);
    if (!adminPreset) return { error: "Invalid adminPreset" };
    patch.adminPreset = adminPreset;
  }

  if (Object.prototype.hasOwnProperty.call(body, "defaultLocale")) {
    const defaultLocale = normalizeDefaultLocale(body.defaultLocale);
    if (!defaultLocale) return { error: "Invalid defaultLocale" };
    patch.defaultLocale = defaultLocale;
  }

  if (Object.prototype.hasOwnProperty.call(body, "enabledLocales")) {
    const enabledLocales = normalizeEnabledLocales(body.enabledLocales);
    if (!enabledLocales) return { error: "enabledLocales must be a valid locale array" };
    patch.enabledLocales = enabledLocales;
  }

  if (Object.prototype.hasOwnProperty.call(body, "enableMultilingual")) {
    patch.enableMultilingual = Boolean(body.enableMultilingual);
  }

  if (Object.prototype.hasOwnProperty.call(body, "pageSize")) {
    const pageSize = toInt(body.pageSize);
    if (pageSize === null) return { error: "Invalid pageSize" };
    patch.pageSize = pageSize;
  }

  if (Object.prototype.hasOwnProperty.call(body, "defaultSort")) {
    const defaultSort = normalizeDefaultSort(body.defaultSort);
    if (!defaultSort) return { error: "Invalid defaultSort" };
    patch.defaultSort = defaultSort;
  }

  if (Object.prototype.hasOwnProperty.call(body, "showSku")) {
    patch.showSku = Boolean(body.showSku);
  }

  if (Object.prototype.hasOwnProperty.call(body, "showBarcode")) {
    patch.showBarcode = Boolean(body.showBarcode);
  }

  if (Object.prototype.hasOwnProperty.call(body, "dataModules")) {
    if (!isObject(body.dataModules)) return { error: "dataModules must be an object" };

    patch.dataModules = {
      blog: Boolean(body.dataModules.blog),
      shop: Boolean(body.dataModules.shop),
      booking: Boolean(body.dataModules.booking),
      membership: Boolean(body.dataModules.membership),
      seo: Boolean(body.dataModules.seo),
    };
  }

  if (Object.prototype.hasOwnProperty.call(body, "integrations")) {
    if (!isObject(body.integrations)) return { error: "integrations must be an object" };

    patch.integrations = {
      google: Boolean(body.integrations.google),
      email: Boolean(body.integrations.email),
      payment: Boolean(body.integrations.payment),
    };
  }

  if (Object.prototype.hasOwnProperty.call(body, "security")) {
    if (!isObject(body.security)) return { error: "security must be an object" };

    const sessionTimeoutMin = toInt(body.security.sessionTimeoutMin);
    if (sessionTimeoutMin === null) return { error: "Invalid security.sessionTimeoutMin" };

    patch.security = {
      twoFA: Boolean(body.security.twoFA),
      sessionTimeoutMin,
    };
  }

  if (Object.prototype.hasOwnProperty.call(body, "advanced")) {
    if (!isObject(body.advanced)) return { error: "advanced must be an object" };

    patch.advanced = {
      maintenanceMode: Boolean(body.advanced.maintenanceMode),
      debugMode: Boolean(body.advanced.debugMode),
    };
  }

  if (Object.prototype.hasOwnProperty.call(body, "autoSave")) {
    patch.autoSave = Boolean(body.autoSave);
  }

  if (Object.prototype.hasOwnProperty.call(body, "confirmBeforeDelete")) {
    patch.confirmBeforeDelete = Boolean(body.confirmBeforeDelete);
  }

  if (Object.prototype.hasOwnProperty.call(body, "autoRefresh")) {
    patch.autoRefresh = Boolean(body.autoRefresh);
  }

  if (Object.prototype.hasOwnProperty.call(body, "notifyOnChange")) {
    patch.notifyOnChange = Boolean(body.notifyOnChange);
  }

  if (Object.keys(patch).length === 0) {
    return { error: "No fields to update" };
  }

  return { data: patch };
}

/* ----------------------------- PATCH ----------------------------- */
/**
 * PATCH /api/settings/select
 * body: partial settings fields
 */
export async function PATCH(req: Request) {
  try {
    const authUser = await requireAdminAuthUser();
    const ownerUserId = getAuthUserId(authUser);

    if (!ownerUserId) {
      return jsonError("Unauthorized", 401);
    }

    const contentType = req.headers.get("content-type") ?? "";
    if (!contentType.includes("application/json")) {
      return jsonError("Content-Type must be application/json", 415);
    }

    const bodyUnknown: unknown = await req.json().catch(() => null);
    if (!isObject(bodyUnknown)) {
      return jsonError("Invalid JSON body", 400);
    }

    const exists = await ensureSettingExists(ownerUserId);
    if (!exists) {
      return jsonError("Settings not found", 404);
    }

    const patchResult = buildPatchData(bodyUnknown);
    if ("error" in patchResult) {
      return jsonError(patchResult.error, 400);
    }

    const item = await prisma.setting.update({
      where: { ownerUserId },
      data: patchResult.data,
    });

    return NextResponse.json({
      item: mapSettingToResponse(item),
    });
  } catch (error: unknown) {
    if (hasUnauthMessage(error)) {
      return jsonError("Unauthorized", 401);
    }

    return jsonError(getErrorMessage(error), 500);
  }
}
