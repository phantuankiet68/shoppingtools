import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

type SEO = {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  canonicalUrl: string;
  noindex: boolean;
  nofollow: boolean;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterCard: "summary" | "summary_large_image";
  sitemapChangefreq: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  sitemapPriority: number;
  structuredData: string;
};

type SEOInput = {
  metaTitle?: string | null;
  metaDescription?: string | null;
  keywords?: string | null;
  canonicalUrl?: string | null;
  noindex?: boolean | null;
  nofollow?: boolean | null;
  ogTitle?: string | null;
  ogDescription?: string | null;
  ogImage?: string | null;
  twitterCard?: "summary" | "summary_large_image" | null;
  sitemapChangefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never" | null;
  sitemapPriority?: number | null;
  structuredData?: string | null;

  // fallback sources từ Page
  title?: string;
  seoTitle?: string | null;
  seoDesc?: string | null;
};

type SEOBody = { seo: Partial<SEO> };

function buildSeoResponse(input: SEOInput): SEO {
  const baseTitle = input.seoTitle ?? input.title ?? "";
  const baseDesc = input.seoDesc ?? "";

  return {
    metaTitle: input.metaTitle ?? baseTitle,
    metaDescription: input.metaDescription ?? baseDesc,
    keywords: input.keywords ?? "",
    canonicalUrl: input.canonicalUrl ?? "",
    noindex: input.noindex ?? false,
    nofollow: input.nofollow ?? false,
    ogTitle: input.ogTitle ?? input.metaTitle ?? baseTitle,
    ogDescription: input.ogDescription ?? input.metaDescription ?? baseDesc,
    ogImage: input.ogImage ?? "",
    twitterCard: input.twitterCard ?? "summary_large_image",
    sitemapChangefreq: input.sitemapChangefreq ?? "weekly",
    sitemapPriority: typeof input.sitemapPriority === "number" ? input.sitemapPriority : 0.7,
    structuredData: input.structuredData ?? "",
  };
}

function validateStructuredData(s?: string) {
  const t = (s ?? "").trim();
  if (!t) return;
  JSON.parse(t); // throw nếu invalid
}

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: pageId } = await ctx.params;

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { id: true, title: true, seoTitle: true, seoDesc: true },
  });

  if (!page) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  const pageSeo = await prisma.pageSEO.findUnique({
    where: { pageId },
  });

  const seo = buildSeoResponse({
    title: page.title,
    seoTitle: page.seoTitle,
    seoDesc: page.seoDesc,
    ...(pageSeo as unknown as SEOInput),
  });

  return NextResponse.json({ ok: true, seo }, { status: 200 });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id: pageId } = await ctx.params;

  const body = (await req.json().catch(() => null)) as SEOBody | null;
  const s = body?.seo;
  if (!s) return NextResponse.json({ ok: false, error: "seo required" }, { status: 400 });

  try {
    validateStructuredData(s.structuredData);
  } catch {
    return NextResponse.json({ ok: false, error: "structuredData is invalid JSON" }, { status: 400 });
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { id: true, title: true, seoTitle: true, seoDesc: true },
  });
  if (!page) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  const normalized: SEO = buildSeoResponse({
    title: page.title,
    seoTitle: page.seoTitle,
    seoDesc: page.seoDesc,
    ...(s as SEOInput),
  });

  const saved = await prisma.pageSEO.upsert({
    where: { pageId },
    create: { pageId, ...normalized },
    update: { ...normalized },
  });

  await prisma.page.update({
    where: { id: pageId },
    data: {
      seoTitle: normalized.metaTitle || null,
      seoDesc: normalized.metaDescription || null,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, seo: normalized }, { status: 200 });
}
