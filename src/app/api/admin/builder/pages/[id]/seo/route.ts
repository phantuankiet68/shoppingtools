import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;

  const page = await prisma.page.findUnique({
    where: { id },
    select: {
      title: true,
      seoTitle: true,
      seoDesc: true,
    },
  });

  if (!page) return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });

  return NextResponse.json({
    ok: true,
    seo: {
      metaTitle: page.seoTitle ?? page.title ?? "",
      metaDescription: page.seoDesc ?? "",
      keywords: "",
      canonicalUrl: "",
      noindex: false,
      nofollow: false,
      ogTitle: page.seoTitle ?? page.title ?? "",
      ogDescription: page.seoDesc ?? "",
      ogImage: "",
      twitterCard: "summary_large_image" as const,
      sitemapChangefreq: "weekly" as const,
      sitemapPriority: 0.7,
      structuredData: "",
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

  const updated = await prisma.page.update({
    where: { id },
    data: {
      seoTitle: s.metaTitle ?? null,
      seoDesc: s.metaDescription ?? null,
    },
    select: { id: true },
  });

  return NextResponse.json({ ok: true, id: updated.id });
}
