import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type HotNewsResponseItem = {
  id: string;
  title: string;
  href: string;
  imageSrc: string;
  category: string;
  excerpt: string;
  readTime: number;
  views: number;
  comments: number;
  rating?: number;
  badge?: string;
  accent?: "pink" | "cyan" | "orange" | "purple" | "blue";
  isFeatured: boolean;
  isTrending: boolean;
  author?: string;
  publishedAt?: string;
  tags: string[];
};

function toNumber(value: Prisma.Decimal | number | string | null | undefined): number | undefined {
  if (value == null) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
}

function mapNewsToHotNewsItem(news: {
  id: string;
  title: string;
  slug: string;
  href: string | null;
  imageSrc: string | null;
  category: string | null;
  excerpt: string | null;
  readTime: number;
  views: number;
  comments: number;
  rating: Prisma.Decimal | null;
  badge: string | null;
  accent: "pink" | "cyan" | "orange" | "purple" | "blue";
  isFeatured: boolean;
  isTrending: boolean;
  author: string | null;
  publishedAt: Date | null;
  tags: string[];
}): HotNewsResponseItem {
  return {
    id: news.id,
    title: news.title,
    href: news.href || `/posts/${news.slug}`,
    imageSrc: news.imageSrc || "/images/placeholder-news.png",
    category: news.category || "Trending",
    excerpt: news.excerpt || "",
    readTime: news.readTime || 5,
    views: news.views || 0,
    comments: news.comments || 0,
    rating: toNumber(news.rating),
    badge: news.badge || undefined,
    accent: news.accent,
    isFeatured: news.isFeatured,
    isTrending: news.isTrending,
    author: news.author || undefined,
    publishedAt: news.publishedAt?.toISOString(),
    tags: Array.isArray(news.tags) ? news.tags : [],
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const limitParam = Number(searchParams.get("limit") || 12);
    const category = searchParams.get("category");
    const featuredOnly = searchParams.get("featured") === "true";
    const trendingOnly = searchParams.get("trending") === "true";

    const take = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 24) : 12;

    const where: Prisma.NewsWhereInput = {
      status: "PUBLISHED",
      ...(category && category !== "Tất cả" ? { category } : {}),
      ...(featuredOnly ? { isFeatured: true } : {}),
      ...(trendingOnly ? { isTrending: true } : {}),
    };

    const news = await prisma.news.findMany({
      where,
      orderBy: [{ isFeatured: "desc" }, { isTrending: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      take,
      select: {
        id: true,
        title: true,
        slug: true,
        href: true,
        imageSrc: true,
        category: true,
        excerpt: true,
        readTime: true,
        views: true,
        comments: true,
        rating: true,
        badge: true,
        accent: true,
        isFeatured: true,
        isTrending: true,
        author: true,
        publishedAt: true,
        tags: true,
      },
    });

    const data = news.map(mapNewsToHotNewsItem);

    return NextResponse.json(
      {
        data,
        meta: {
          total: data.length,
          limit: take,
          category: category || null,
          featured: featuredOnly,
          trending: trendingOnly,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("GET /api/v1/posts/hot-news error:", error);

    return NextResponse.json(
      {
        data: [],
        error: "Không thể tải danh sách bài viết nổi bật.",
      },
      { status: 500 },
    );
  }
}
