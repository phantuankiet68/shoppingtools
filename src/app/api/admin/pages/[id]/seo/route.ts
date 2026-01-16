import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma, TwitterCard, Changefreq } from "@prisma/client";

const toTwitterEnum = (v?: string | null): TwitterCard | undefined => {
  if (v === "summary") return TwitterCard.SUMMARY;
  if (v === "summary_large_image") return TwitterCard.SUMMARY_LARGE_IMAGE;
  return undefined;
};

const fromTwitterEnum = (v?: TwitterCard | null) => {
  if (v === TwitterCard.SUMMARY) return "summary";
  return "summary_large_image";
};

const toChangefreqEnum = (v?: string | null): Changefreq | undefined => {
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
      return undefined;
  }
};

const fromChangefreqEnum = (v?: Changefreq | null) => {
  switch (v) {
    case Changefreq.ALWAYS:
      return "always";
    case Changefreq.HOURLY:
      return "hourly";
    case Changefreq.DAILY:
      return "daily";
    case Changefreq.WEEKLY:
      return "weekly";
    case Changefreq.MONTHLY:
      return "monthly";
    case Changefreq.YEARLY:
      return "yearly";
    case Changefreq.NEVER:
      return "never";
    default:
      return "weekly";
  }
};

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const page = await prisma.page.findUnique({
    where: { id },
    select: {
      title: true,
      seoTitle: true,
      seoDesc: true,
      coverImage: true,
      seoKeywords: true,
      canonicalUrl: true,
      noindex: true,
      nofollow: true,
      ogTitle: true,
      ogDescription: true,
      twitterCard: true,
      sitemapChangefreq: true,
      sitemapPriority: true,
      structuredData: true,
    },
  });

  if (!page) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  return NextResponse.json({
    ok: true,
    seo: {
      metaTitle: page.seoTitle ?? page.title ?? "",
      metaDescription: page.seoDesc ?? "",
      keywords: page.seoKeywords ?? "",
      canonicalUrl: page.canonicalUrl ?? "",
      noindex: !!page.noindex,
      nofollow: !!page.nofollow,
      ogTitle: page.ogTitle ?? page.seoTitle ?? page.title ?? "",
      ogDescription: page.ogDescription ?? page.seoDesc ?? "",
      ogImage: page.coverImage ?? "",
      twitterCard: fromTwitterEnum(page.twitterCard),
      sitemapChangefreq: fromChangefreqEnum(page.sitemapChangefreq),
      sitemapPriority: page.sitemapPriority ?? 0.7,
      structuredData: page.structuredData ? JSON.stringify(page.structuredData) : "",
    },
  });
}

type SEOBody = {
  seo: {
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
};

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const body = (await req.json().catch(() => null)) as SEOBody | null;
  const s = body?.seo;
  if (!s) return NextResponse.json({ ok: false, error: "seo required" }, { status: 400 });
  let structured: any = undefined;
  if (typeof s.structuredData === "string" && s.structuredData.trim()) {
    structured = JSON.parse(s.structuredData);
  }
  const updated = await prisma.page.update({
    where: { id },
    data: {
      seoTitle: s.metaTitle ?? null,
      seoDesc: s.metaDescription ?? null,
      coverImage: s.ogImage ?? null,
      seoKeywords: s.keywords ?? null,
      canonicalUrl: s.canonicalUrl ?? null,
      noindex: typeof s.noindex === "boolean" ? s.noindex : undefined,
      nofollow: typeof s.nofollow === "boolean" ? s.nofollow : undefined,
      ogTitle: s.ogTitle ?? null,
      ogDescription: s.ogDescription ?? null,
      twitterCard: toTwitterEnum(s.twitterCard) ?? undefined,
      sitemapChangefreq: toChangefreqEnum(s.sitemapChangefreq) ?? undefined,
      sitemapPriority: typeof s.sitemapPriority === "number" ? s.sitemapPriority : undefined,
      structuredData: structured,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: updated.id });
}
