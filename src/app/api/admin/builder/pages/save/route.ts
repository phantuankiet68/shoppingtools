import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, PageStatus, TwitterCard, Changefreq } from "@prisma/client";

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
  structuredData?: string;
};

type Body = {
  id?: string;
  siteId?: string;
  domain?: string;
  title?: string;
  slug?: string; // "/" hoặc "about"
  blocks?: BlockDTO[];
  seo?: SEOIn;
};

function normalizeDomain(raw: string) {
  const v = (raw || "").trim().toLowerCase();
  if (!v) return "";
  return v
    .replace(/^https?:\/\//, "")
    .split("/")[0]
    .split(":")[0];
}
function getHeaderDomain(req: NextRequest) {
  const raw = req.headers.get("x-site-domain") || req.headers.get("host") || "";
  return normalizeDomain(raw);
}

async function resolveSiteId(req: NextRequest, body: Body) {
  if (body.siteId) {
    const s = await prisma.site.findUnique({ where: { id: body.siteId }, select: { id: true } });
    if (s) return s.id;
  }

  const bd = normalizeDomain(String(body.domain || ""));
  if (bd) {
    const s = await prisma.site.findUnique({ where: { domain: bd }, select: { id: true } });
    if (s) return s.id;
  }

  const hd = getHeaderDomain(req);
  if (hd && !["localhost", "127.0.0.1"].includes(hd)) {
    const s = await prisma.site.findUnique({ where: { domain: hd }, select: { id: true } });
    if (s) return s.id;
  }

  const first = await prisma.site.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  return first?.id ?? null;
}

function normalizeSlug(raw: string) {
  const s = (raw || "").trim();
  if (!s || s === "/") return "/";
  return s.replace(/^\/+/, "").replace(/\/+$/, "");
}

function toPathFromSlug(slug: string) {
  return slug === "/" ? "/" : `/${slug}`;
}

function mapTwitterCard(v?: "summary" | "summary_large_image"): TwitterCard {
  return v === "summary" ? TwitterCard.SUMMARY : TwitterCard.SUMMARY_LARGE_IMAGE;
}

function mapChangefreq(v?: SEOIn["sitemapChangefreq"]): Changefreq {
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

export async function POST(req: NextRequest) {
  let body: Body;

  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON body", debug: { contentType: req.headers.get("content-type") } }, { status: 400 });
  }

  try {
    const title = (body.title || "").trim();
    if (!title) {
      return NextResponse.json({ ok: false, error: "title required", debug: { title, bodyKeys: Object.keys(body || {}) } }, { status: 400 });
    }

    const siteId = await resolveSiteId(req, body);
    if (!siteId) {
      const siteCount = await prisma.site.count();
      return NextResponse.json(
        {
          ok: false,
          error: "Site not found",
          debug: {
            siteCount,
            bodySiteId: body.siteId || null,
            bodyDomain: body.domain || null,
            headerDomain: getHeaderDomain(req) || null,
            host: req.headers.get("host") || null,
          },
          hint: "Hãy đảm bảo DB có ít nhất 1 Site, hoặc gửi siteId từ client.",
        },
        { status: 400 }
      );
    }

    const finalSlug = normalizeSlug(body.slug || "/");
    const finalPath = toPathFromSlug(finalSlug);

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
      // structuredData: sẽ set ở create bên dưới (DbNull) hoặc update nếu bạn muốn cho phép sửa
    };

    const blocksJson = (body.blocks || []) as unknown as Prisma.InputJsonValue;

    if (body.id) {
      const updated = await prisma.page.updateMany({
        where: { id: body.id, siteId },
        data: {
          title,
          slug: finalSlug,
          path: finalPath,
          blocks: blocksJson,
          status: PageStatus.DRAFT,
          ...seoCommon,
          // structuredData: s.structuredData ? (s.structuredData as any) : Prisma.DbNull, // nếu bạn muốn update
        },
      });

      if (updated.count !== 1) {
        return NextResponse.json({ ok: false, error: "Page not found in current site" }, { status: 404 });
      }

      return NextResponse.json({ ok: true, id: body.id, siteId, path: finalPath });
    }

    const created = await prisma.page.create({
      data: {
        siteId,
        title,
        slug: finalSlug,
        path: finalPath,
        blocks: blocksJson,
        status: PageStatus.DRAFT,
        ...seoCommon,
        structuredData: Prisma.DbNull,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id, siteId, path: finalPath });
  } catch (e: any) {
    if (e?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Duplicated slug or path within current site" }, { status: 409 });
    }
    console.error("[api/admin/pages/save] error:", e);
    return NextResponse.json({ ok: false, error: "Internal Server Error", debug: { message: e?.message, code: e?.code } }, { status: 500 });
  }
}
