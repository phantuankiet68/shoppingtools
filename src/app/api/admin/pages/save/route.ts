// src/app/[locale]/api/pages/save/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, PageStatus, TwitterCard, Changefreq, Locale } from "@prisma/client";

function getDomainFromHeaders(req: NextRequest) {
  const raw = req.headers.get("x-site-domain") || req.headers.get("host") || "";
  return raw.split(":")[0].toLowerCase();
}

// Lấy site hiện tại theo domain (có thể cache layer khác nếu muốn)
async function getSiteIdFromReq(req: NextRequest) {
  const domain = getDomainFromHeaders(req);
  const site = await prisma.site.findUnique({
    where: { domain },
    select: { id: true },
  });
  return site?.id || null;
}

async function resolveSiteId(req: NextRequest, body: Partial<Body>) {
  // 1) Ưu tiên siteId từ body (nếu có & hợp lệ)
  if (body.siteId) {
    const s = await prisma.site.findUnique({ where: { id: body.siteId }, select: { id: true } });
    if (s) return s.id;
  }

  // 2) Nếu body có domain (dev có thể gửi domain sitea.local)
  if (body.domain) {
    const s = await prisma.site.findUnique({ where: { domain: String(body.domain).toLowerCase() }, select: { id: true } });
    if (s) return s.id;
  }

  // 3) Header (x-site-domain / host)
  const domain = getDomainFromHeaders(req);
  if (domain) {
    const s = await prisma.site.findUnique({ where: { domain }, select: { id: true } });
    if (s) return s.id;
  }

  // 4) Fallback: lấy site đầu tiên (nên dùng cho dev)
  const first = await prisma.site.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  return first?.id ?? null;
}

// Map twitter card string -> enum
function mapTwitterCard(v?: "summary" | "summary_large_image"): TwitterCard {
  return v === "summary" ? TwitterCard.SUMMARY : TwitterCard.SUMMARY_LARGE_IMAGE;
}
function mapChangefreq(v?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never"): Changefreq {
  switch (v) {
    case "always":
      return Changefreq.ALWAYS;
    case "hourly":
      return Changefreq.HOURLY;
    case "daily":
      return Changefreq.DAILY;
    case "weekly":
      return Changefreq.WEEKLY;
    case "monthly":
      return Changefreq.MONTHLY;
    case "yearly":
      return Changefreq.YEARLY;
    case "never":
      return Changefreq.NEVER;
    default:
      return Changefreq.WEEKLY;
  }
}

// Body types từ client
type BlockDTO = { kind: string; props: Record<string, any> };
type SEOIn = {
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string;
  canonicalUrl?: string;
  noindex?: boolean;
  nofollow?: boolean;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: "summary" | "summary_large_image";
  sitemapChangefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  sitemapPriority?: number;
  structuredData?: string; // JSON-LD string | "" (clear) | undefined (no touch)
};
type Body = {
  id?: string;
  siteId?: string; // 👈 NEW
  domain?: string; // 👈 NEW (ví dụ: 'sitea.local')
  locale: "vi" | "en" | "ja";
  title: string;
  slug: string;
  path?: string;
  blocks: BlockDTO[];
  seo?: SEOIn;
};
// Map "vi"|"en"|"ja" -> enum Locale của Prisma (vi/en/ja hoặc VI/EN/JA tuỳ bạn đã định nghĩa)
function toLocaleEnum(v: Body["locale"]): Locale {
  // Nếu enum của bạn là chữ thường (vi|en|ja) thì:
  return v as unknown as Locale;

  // Nếu enum là HOA (VI|EN|JA) thì dùng:
  // const map = { vi: Locale.VI, en: Locale.EN, ja: Locale.JA } as const;
  // return map[v];
}

/** JSON-LD: update */
function parseStructuredForUpdate(raw: string | undefined): Prisma.InputJsonValue | typeof Prisma.DbNull | undefined {
  if (raw === undefined) return undefined;
  if (raw.trim() === "") return Prisma.DbNull;
  try {
    return JSON.parse(raw) as Prisma.InputJsonValue;
  } catch {
    return undefined;
  }
}
/** JSON-LD: create */
function parseStructuredForCreate(raw: string | undefined): Prisma.InputJsonValue | typeof Prisma.DbNull {
  if (raw === undefined || raw.trim() === "") return Prisma.DbNull;
  try {
    return JSON.parse(raw) as Prisma.InputJsonValue;
  } catch {
    return Prisma.DbNull;
  }
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ locale: string }> }) {
  try {
    await ctx.params; // giữ chữ ký route động

    const body = (await req.json()) as Body;

    // Resolve siteId theo thứ tự ưu tiên
    const siteId = await resolveSiteId(req, body);
    if (!siteId) {
      return NextResponse.json({ ok: false, error: "Site not found (provide siteId/domain or set header x-site-domain)" }, { status: 400 });
    }

    // Validate cơ bản
    if (!body?.title?.trim() || !body?.locale) {
      return NextResponse.json({ ok: false, error: "title/locale required" }, { status: 400 });
    }

    // Chuẩn hoá slug/path
    const isHome = body.slug === "/";
    const finalSlug = isHome ? "/" : (body.slug || "").trim();
    const finalPath = `/${body.locale}${isHome ? "" : `/${finalSlug}`}`;
    const localeEnum = toLocaleEnum(body.locale);

    const s = body.seo || {};
    const seoCommon = {
      seoTitle: s.metaTitle ?? null,
      seoDesc: s.metaDescription ?? null,
      coverImage: s.ogImage ?? null,
      seoKeywords: s.keywords ?? null,
      canonicalUrl: s.canonicalUrl ?? null,
      noindex: !!s.noindex,
      nofollow: !!s.nofollow,
      ogTitle: s.ogTitle ?? null,
      ogDescription: s.ogDescription ?? null,
      twitterCard: mapTwitterCard(s.twitterCard),
      sitemapChangefreq: mapChangefreq(s.sitemapChangefreq),
      sitemapPriority: typeof s.sitemapPriority === "number" ? s.sitemapPriority : 0.7,
    };

    const blocksJson = body.blocks as unknown as Prisma.InputJsonValue;

    if (body.id) {
      // UPDATE: khóa theo id + siteId để không ghi nhầm site khác
      const structuredUpdate = parseStructuredForUpdate(s.structuredData);
      const updated = await prisma.page.updateMany({
        where: { id: body.id, siteId },
        data: {
          locale: localeEnum,
          title: body.title.trim(),
          slug: finalSlug,
          path: finalPath,
          blocks: blocksJson,
          status: PageStatus.DRAFT,
          ...seoCommon,
          ...(structuredUpdate !== undefined ? { structuredData: structuredUpdate } : {}),
        },
      });

      if (updated.count !== 1) {
        return NextResponse.json({ ok: false, error: "Page not found in current site" }, { status: 404 });
      }
      return NextResponse.json({ ok: true, id: body.id });
    } else {
      // CREATE
      const structuredCreate = parseStructuredForCreate(s.structuredData);
      const created = await prisma.page.create({
        data: {
          siteId, // 👈 đảm bảo gán site
          locale: localeEnum,
          title: body.title.trim(),
          slug: finalSlug,
          path: finalPath,
          blocks: blocksJson,
          status: PageStatus.DRAFT,
          ...seoCommon,
          structuredData: structuredCreate,
        },
        select: { id: true },
      });
      return NextResponse.json({ ok: true, id: created.id });
    }
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Duplicated slug or path within current site" }, { status: 409 });
    }
    console.error("[pages/save] error:", e);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}
