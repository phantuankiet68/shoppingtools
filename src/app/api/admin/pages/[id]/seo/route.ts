import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Map helpers (client <-> DB enum)
const toTwitterEnum = (v?: string | null) => (v === "summary" ? "SUMMARY" : v === "summary_large_image" ? "SUMMARY_LARGE_IMAGE" : undefined);

const fromTwitterEnum = (v?: string | null) => (v === "SUMMARY" ? "summary" : v === "SUMMARY_LARGE_IMAGE" ? "summary_large_image" : "summary_large_image");

const toChangefreqEnum = (v?: string | null) => {
  switch (v) {
    case "always":
      return "ALWAYS";
    case "hourly":
      return "HOURLY";
    case "daily":
      return "DAILY";
    case "weekly":
      return "WEEKLY";
    case "monthly":
      return "MONTHLY";
    case "yearly":
      return "YEARLY";
    case "never":
      return "NEVER";
    default:
      return undefined;
  }
};
const fromChangefreqEnum = (v?: string | null) => {
  switch (v) {
    case "ALWAYS":
      return "always";
    case "HOURLY":
      return "hourly";
    case "DAILY":
      return "daily";
    case "WEEKLY":
      return "weekly";
    case "MONTHLY":
      return "monthly";
    case "YEARLY":
      return "yearly";
    case "NEVER":
      return "never";
    default:
      return "weekly";
  }
};

export async function GET(_req: NextRequest, ctx: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = await ctx.params;

  const page = await prisma.page.findUnique({
    where: { id },
    select: {
      title: true,
      locale: true,
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
    structuredData?: string; // JSON string
  };
};

export async function POST(req: NextRequest, ctx: { params: Promise<{ locale: string; id: string }> }) {
  const { id } = await ctx.params;
  const body = (await req.json()) as SEOBody;
  const s = body?.seo;
  if (!s) return NextResponse.json({ ok: false, error: "seo required" }, { status: 400 });

  let structured: any = undefined;
  if (typeof s.structuredData === "string" && s.structuredData.trim()) {
    try {
      structured = JSON.parse(s.structuredData);
    } catch {
      /* ignore invalid JSON */
    }
  }

  const updated = await prisma.page.update({
    where: { id },
    data: {
      seoTitle: s.metaTitle ?? undefined,
      seoDesc: s.metaDescription ?? undefined,
      coverImage: s.ogImage ?? undefined,

      seoKeywords: s.keywords ?? undefined,
      canonicalUrl: s.canonicalUrl ?? undefined,
      noindex: typeof s.noindex === "boolean" ? s.noindex : undefined,
      nofollow: typeof s.nofollow === "boolean" ? s.nofollow : undefined,

      ogTitle: s.ogTitle ?? undefined,
      ogDescription: s.ogDescription ?? undefined,
      twitterCard: toTwitterEnum(s.twitterCard) as any,

      sitemapChangefreq: toChangefreqEnum(s.sitemapChangefreq) as any,
      sitemapPriority: typeof s.sitemapPriority === "number" ? s.sitemapPriority : undefined,

      structuredData: structured, // null/undefined sẽ giữ nguyên hoặc ghi null tuỳ prisma
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: updated.id });
}
