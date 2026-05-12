import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, PageStatus } from "@/generated/prisma";

type BlockDTO = { kind: string; props: Record<string, unknown> };

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
  slug?: string;
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

export async function POST(req: NextRequest) {
  let body: Body;

  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json(
      { ok: false, error: "Invalid JSON body", debug: { contentType: req.headers.get("content-type") } },
      { status: 400 },
    );
  }

  try {
    const title = (body.title || "").trim();
    if (!title) {
      return NextResponse.json(
        { ok: false, error: "title required", debug: { title, bodyKeys: Object.keys(body || {}) } },
        { status: 400 },
      );
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
        { status: 400 },
      );
    }

    const finalSlug = normalizeSlug(body.slug || "/");
    const finalPath = toPathFromSlug(finalSlug);

    const s = body.seo || {};
    const seoData = {
      metaTitle: s.metaTitle ?? null,
      metaDescription: s.metaDescription ?? null,
      keywords: s.keywords ?? null,
      canonicalUrl: s.canonicalUrl ?? null,
      noindex: !!s.noindex,
      nofollow: !!s.nofollow,
      ogTitle: s.ogTitle ?? null,
      ogDescription: s.ogDescription ?? null,
      ogImage: s.ogImage ?? null,
      twitterCard: s.twitterCard ?? null,
      sitemapChangefreq: s.sitemapChangefreq ?? null,
      sitemapPriority: typeof s.sitemapPriority === "number" ? s.sitemapPriority : 0.7,
      structuredData: s.structuredData ?? null,
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
          seoTitle: seoData.metaTitle,
          seoDesc: seoData.metaDescription,
        },
      });

      if (updated.count !== 1) {
        return NextResponse.json({ ok: false, error: "Page not found in current site" }, { status: 404 });
      }
      await prisma.pageSEO.upsert({
        where: { pageId: body.id },
        create: { pageId: body.id, ...seoData },
        update: seoData,
      });

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
        seoTitle: seoData.metaTitle,
        seoDesc: seoData.metaDescription,
        seo: {
          create: seoData,
        },
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: created.id, siteId, path: finalPath });
  } catch (e: unknown) {
    const error = e as { code?: string; message?: string };
    if (error?.code === "P2002") {
      return NextResponse.json({ ok: false, error: "Duplicated slug or path within current site" }, { status: 409 });
    }
    console.error("[api/admin/builder/pages/save] error:", e);
    return NextResponse.json(
      { ok: false, error: "Internal Server Error", debug: { message: error?.message, code: error?.code } },
      { status: 500 },
    );
  }
}
