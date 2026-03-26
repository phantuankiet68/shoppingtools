"use client";

import React, { useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Route } from "next";
import styles from "@/styles/templates/sections/HotNew/HotNewOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";

export type HotNewOneItem = {
  id?: string | number;
  title: string;
  href: string;
  imageSrc?: string;
  category?: string;
  excerpt?: string;
  readTime?: number;
  views?: number;
  comments?: number;
  rating?: number;
  badge?: string;
  accent?: "pink" | "cyan" | "orange" | "purple" | "blue";
  isFeatured?: boolean;
  isTrending?: boolean;
  author?: string;
  publishedAt?: string;
  tags?: string[];
};

export type HotNewOneProps = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  viewAllText?: string;
  viewAllHref?: string;
  apiUrl?: string;
  posts?: HotNewOneItem[];
  preview?: boolean;
  sectionAriaLabel?: string;
};

type ApiRecord = Record<string, unknown>;

const POSTS_API_URL = "/api/v1/posts/hot-news";
const ALL_TAB = "All";

function safeJson<T>(raw?: unknown): T | undefined {
  if (typeof raw !== "string" || !raw) return undefined;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

function toStringSafe(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toNumber(value: unknown, fallback = Number.NaN): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^\d.-]/g, ""));
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  return fallback;
}

function dedupeStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((item) => item.trim()).filter(Boolean)));
}

function formatCompact(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) return "0";
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1).replace(".0", "")}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1).replace(".0", "")}K`;
  return new Intl.NumberFormat("en-US").format(value);
}

function formatReadTime(value?: number): string {
  if (typeof value !== "number" || Number.isNaN(value) || value <= 0) return "5 min";
  return `${Math.round(value)} min`;
}

function formatDate(value?: string): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function normalizeCategory(value?: string): string {
  if (!value) return ALL_TAB;

  const lowered = value.trim().toLowerCase();

  if (/(skincare|skin care|da|mụn|serum|dưỡng da|duong da)/.test(lowered)) return "Skincare";
  if (/(makeup|make up|son|phấn|má hồng|nền|blush)/.test(lowered)) return "Makeup";
  if (/(body|bodycare|body care|hair|tóc|cơ thể)/.test(lowered)) return "Body Care";
  if (/(trend|trending|hot)/.test(lowered)) return "Trending";
  if (/(routine|tips|guide|mẹo)/.test(lowered)) return "Quick Tips";

  return value
    .split(/[-_/]/g)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function getImageFromRecord(item: ApiRecord): string {
  const image = item.image && typeof item.image === "object" ? (item.image as ApiRecord) : undefined;
  const thumbnail = item.thumbnail && typeof item.thumbnail === "object" ? (item.thumbnail as ApiRecord) : undefined;
  const coverImage =
    item.coverImage && typeof item.coverImage === "object" ? (item.coverImage as ApiRecord) : undefined;

  const direct =
    toStringSafe(item.imageSrc) ||
    toStringSafe(item.image) ||
    toStringSafe(item.thumbnail) ||
    toStringSafe(item.coverImage) ||
    toStringSafe(image?.url) ||
    toStringSafe(image?.src) ||
    toStringSafe(thumbnail?.url) ||
    toStringSafe(thumbnail?.src) ||
    toStringSafe(coverImage?.url) ||
    toStringSafe(coverImage?.src);

  if (direct) return direct;

  if (Array.isArray(item.images) && item.images.length > 0) {
    const first = item.images[0];

    if (typeof first === "string") return first;

    if (first && typeof first === "object") {
      const record = first as ApiRecord;
      return (
        toStringSafe(record.url) ||
        toStringSafe(record.src) ||
        toStringSafe(record.image) ||
        toStringSafe(record.imageSrc) ||
        "/images/placeholder-news.png"
      );
    }
  }

  return "/images/placeholder-news.png";
}

function buildHref(item: ApiRecord): string {
  const href = toStringSafe(item.href);
  if (href) return href;

  const slug = toStringSafe(item.slug);
  if (slug) return `/posts/${slug}`;

  const id = item.id ?? item._id;
  if (typeof id === "string" || typeof id === "number") return `/posts/${String(id)}`;

  return "/posts";
}

function computeTags(item: ApiRecord): string[] {
  if (Array.isArray(item.tags)) {
    return dedupeStrings(item.tags.map((tag) => (typeof tag === "string" ? tag : ""))).slice(0, 3);
  }

  const candidates = [
    toStringSafe(item.tag),
    toStringSafe(item.feature),
    toStringSafe(item.topic),
    toStringSafe(item.category),
  ];

  return dedupeStrings(candidates).slice(0, 3);
}

function pickAccent(index: number, rawAccent?: string): HotNewOneItem["accent"] {
  const normalized = rawAccent?.toLowerCase();

  if (
    normalized === "pink" ||
    normalized === "cyan" ||
    normalized === "orange" ||
    normalized === "purple" ||
    normalized === "blue"
  ) {
    return normalized;
  }

  const accents: HotNewOneItem["accent"][] = ["pink", "cyan", "orange", "purple", "blue"];
  return accents[index % accents.length];
}

function normalizeItem(raw: unknown, index: number): HotNewOneItem | null {
  if (!raw || typeof raw !== "object") return null;

  const item = raw as ApiRecord;

  const title =
    toStringSafe(item.title) ||
    toStringSafe(item.name) ||
    toStringSafe(item.postTitle) ||
    toStringSafe(item.articleTitle);

  if (!title) return null;

  const category = normalizeCategory(
    toStringSafe(item.category) || toStringSafe(item.group) || toStringSafe(item.segment) || toStringSafe(item.topic),
  );

  const views = toNumber(item.views ?? item.viewCount ?? item.totalViews, 0);
  const comments = toNumber(item.comments ?? item.commentCount ?? item.totalComments, 0);
  const readTime = toNumber(item.readTime ?? item.readMinutes ?? item.readingTime, 5);
  const rating = toNumber(item.rating ?? item.score, Number.NaN);

  return {
    id: (item.id as string | number | undefined) ?? (item._id as string | number | undefined) ?? index + 1,
    title,
    href: buildHref(item),
    imageSrc: getImageFromRecord(item),
    category,
    excerpt:
      toStringSafe(item.excerpt) ||
      toStringSafe(item.summary) ||
      toStringSafe(item.description) ||
      toStringSafe(item.shortDescription),
    readTime: Number.isFinite(readTime) ? Math.max(1, Math.round(readTime)) : 5,
    views: Number.isFinite(views) ? Math.max(0, Math.round(views)) : 0,
    comments: Number.isFinite(comments) ? Math.max(0, Math.round(comments)) : 0,
    rating: Number.isFinite(rating) ? Number(rating.toFixed(1)) : undefined,
    badge: toStringSafe(item.badge) || (index === 0 ? "Featured" : category),
    accent: pickAccent(index, toStringSafe(item.accent)),
    isFeatured: Boolean(item.isFeatured ?? index === 0),
    isTrending: Boolean(item.isTrending ?? index < 4),
    author: toStringSafe(item.author),
    publishedAt: toStringSafe(item.publishedAt),
    tags: computeTags(item),
  };
}

function extractPosts(payload: unknown): HotNewOneItem[] {
  const source = payload as HotNewOneItem[] | { data?: unknown; items?: unknown; posts?: unknown; result?: unknown };

  const list = Array.isArray(source)
    ? source
    : Array.isArray(source?.data)
      ? source.data
      : Array.isArray(source?.items)
        ? source.items
        : Array.isArray(source?.posts)
          ? source.posts
          : Array.isArray(source?.result)
            ? source.result
            : [];

  return list.map((item, index) => normalizeItem(item, index)).filter((item): item is HotNewOneItem => Boolean(item));
}

function getTabs(items: HotNewOneItem[]): string[] {
  const categories = dedupeStrings(
    items
      .map((item) => item.category)
      .filter((category): category is string => Boolean(category) && category !== ALL_TAB),
  );

  return [ALL_TAB, ...categories].slice(0, 7);
}

function articleAriaLabel(item: HotNewOneItem): string {
  const category = item.category ? `, category ${item.category}` : "";
  const readTime = item.readTime ? `, ${formatReadTime(item.readTime)}` : "";
  return `${item.title}${category}${readTime}`;
}

function getAccentClass(accent?: HotNewOneItem["accent"]): string {
  switch (accent) {
    case "cyan":
      return styles.accentCyan;
    case "orange":
      return styles.accentOrange;
    case "purple":
      return styles.accentPurple;
    case "blue":
      return styles.accentBlue;
    case "pink":
    default:
      return styles.accentPink;
  }
}

function MetaInline({ readTime, views, comments }: { readTime?: number; views?: number; comments?: number }) {
  return (
    <div className={styles.metaInline}>
      <span>{formatReadTime(readTime)}</span>
      <span className={styles.metaDot}>•</span>
      <span>{formatCompact(views)} views</span>
      {typeof comments === "number" && comments > 0 ? (
        <>
          <span className={styles.metaDot}>•</span>
          <span>{formatCompact(comments)} comments</span>
        </>
      ) : null}
    </div>
  );
}

export function HotNewOne({
  eyebrow = "FEATURED ARTICLES",
  title = "Discover topics people are reading right now",
  subtitle = "A modern layout with a clear content rhythm and an optimized reading experience across all devices.",
  viewAllText = "View all",
  viewAllHref = "/posts",
  apiUrl = POSTS_API_URL,
  posts,
  preview = false,
  sectionAriaLabel = "Featured articles",
}: HotNewOneProps) {
  const regionId = useId();
  const [remotePosts, setRemotePosts] = useState<HotNewOneItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(ALL_TAB);

  const items = useMemo(() => {
    if (Array.isArray(posts) && posts.length > 0) return posts.slice(0, 12);
    return remotePosts.slice(0, 12);
  }, [posts, remotePosts]);

  const tabs = useMemo(() => getTabs(items), [items]);

  const filteredItems = useMemo(() => {
    if (activeTab === ALL_TAB) return items;
    return items.filter((item) => item.category === activeTab);
  }, [activeTab, items]);

  const heroPost = filteredItems[0];
  const sidePosts = filteredItems.slice(1, 4);
  const gridPosts = filteredItems.slice(4, 10);
  const trendingPosts = filteredItems.slice(0, 4);

  useEffect(() => {
    if (!tabs.includes(activeTab)) setActiveTab(ALL_TAB);
  }, [tabs, activeTab]);

  useEffect(() => {
    if (Array.isArray(posts) && posts.length > 0) return;

    const controller = new AbortController();

    const fetchPosts = async () => {
      try {
        setLoading(true);

        const res = await fetch(apiUrl, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
          cache: "no-store",
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);

        const data = (await res.json()) as unknown;
        setRemotePosts(extractPosts(data));
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("HotNewOne fetch error:", error);
        setRemotePosts([]);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void fetchPosts();

    return () => controller.abort();
  }, [apiUrl, posts]);

  const headingId = `${regionId}-hot-news-title`;
  const descId = `${regionId}-hot-news-description`;

  const onBlockClick = (e: React.SyntheticEvent) => {
    if (!preview) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const renderLink = (item: HotNewOneItem, children: React.ReactNode, className?: string) =>
    preview ? (
      <a href="#" onClick={onBlockClick} className={className} aria-label={articleAriaLabel(item)}>
        {children}
      </a>
    ) : (
      <Link href={(item.href || "/posts") as Route} className={className} aria-label={articleAriaLabel(item)}>
        {children}
      </Link>
    );

  if (loading && items.length === 0) {
    return (
      <section className={styles.section} aria-labelledby={headingId} aria-describedby={descId}>
        <div className={styles.container}>
          <div className={styles.emptyState}>Loading articles...</div>
        </div>
      </section>
    );
  }

  if (!heroPost) {
    return (
      <section className={styles.section} aria-labelledby={headingId} aria-describedby={descId}>
        <div className={styles.container}>
          <div className={styles.emptyState}>No articles available yet.</div>
        </div>
      </section>
    );
  }

  return (
    <section
      className={styles.section}
      aria-label={sectionAriaLabel}
      aria-labelledby={headingId}
      aria-describedby={descId}
    >
      <div className={styles.container}>
        <div className={styles.shell}>
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <p className={styles.eyebrow}>{eyebrow}</p>
              <h2 id={headingId} className={styles.title}>
                {title}
              </h2>
              <p id={descId} className={styles.subtitle}>
                {subtitle}
              </p>
            </div>

            <div className={styles.headerActions}>
              <div className={styles.tabs} role="tablist" aria-label="Article filters">
                {tabs.map((tab, index) => {
                  const isActive = tab === activeTab;

                  return (
                    <button
                      key={`${tab}-${index}`}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      className={`${styles.tab} ${isActive ? styles.tabActive : ""}`}
                      onClick={() => setActiveTab(tab)}
                    >
                      {tab}
                    </button>
                  );
                })}
              </div>

              {!preview ? (
                <Link href={(viewAllHref || "/posts") as Route} className={styles.viewAll}>
                  {viewAllText}
                </Link>
              ) : (
                <a href="#" onClick={onBlockClick} className={styles.viewAll}>
                  {viewAllText}
                </a>
              )}
            </div>
          </div>

          <div className={styles.topGrid}>
            <article className={styles.heroCard}>
              {renderLink(
                heroPost,
                <>
                  <div className={styles.heroMedia}>
                    <Image
                      src={heroPost.imageSrc || "/images/placeholder-news.png"}
                      alt={heroPost.title}
                      fill
                      className={styles.heroImage}
                      sizes="(max-width: 991px) 100vw, 66vw"
                    />
                    <div className={styles.heroOverlay} />
                    <div className={styles.heroBadgeRow}>
                      <span className={styles.heroBadge}>{heroPost.badge || "Featured"}</span>
                      {heroPost.category ? <span className={styles.heroCategory}>{heroPost.category}</span> : null}
                    </div>
                  </div>

                  <div className={styles.heroBody}>
                    <div className={styles.heroTopMeta}>
                      {heroPost.author ? <span>{heroPost.author}</span> : null}
                      {heroPost.publishedAt ? (
                        <>
                          <span className={styles.metaDot}>•</span>
                          <span>{formatDate(heroPost.publishedAt)}</span>
                        </>
                      ) : null}
                    </div>

                    <h3 className={styles.heroTitle}>{heroPost.title}</h3>

                    <p className={styles.heroExcerpt}>
                      {heroPost.excerpt ||
                        "Featured content presented in a clean layout, with clear hierarchy and a modern reading experience."}
                    </p>

                    <div className={styles.heroFooter}>
                      <MetaInline readTime={heroPost.readTime} views={heroPost.views} comments={heroPost.comments} />
                      {typeof heroPost.rating === "number" ? (
                        <span className={styles.ratingPill}>★ {heroPost.rating.toFixed(1)}</span>
                      ) : null}
                    </div>
                  </div>
                </>,
                styles.heroLink,
              )}
            </article>

            <aside className={styles.sideColumn} aria-label="More featured articles">
              {sidePosts.map((item, index) => (
                <article key={item.id ?? index} className={styles.sideCard}>
                  {renderLink(
                    item,
                    <>
                      <div className={styles.sideCardBody}>
                        <div className={styles.sideCardTop}>
                          <span className={`${styles.sideAccent} ${getAccentClass(item.accent)}`} />
                          <span className={styles.sideCategory}>{item.category || "Trending"}</span>
                        </div>

                        <h3 className={styles.sideTitle}>{item.title}</h3>

                        <p className={styles.sideExcerpt}>
                          {item.excerpt || "A concise and engaging summary designed to improve click-through rate."}
                        </p>

                        <MetaInline readTime={item.readTime} views={item.views} comments={item.comments} />
                      </div>

                      <div className={styles.sideThumbWrap}>
                        <Image
                          src={item.imageSrc || "/images/placeholder-news.png"}
                          alt={item.title}
                          fill
                          className={styles.sideThumb}
                          sizes="160px"
                        />
                      </div>
                    </>,

                    styles.sideLink,
                  )}
                </article>
              ))}
            </aside>
          </div>

          <div className={styles.bottomGrid}>
            <div className={styles.mainFeed}>
              <div className={styles.feedHeader}>
                <h3 className={styles.feedTitle}>More articles to explore</h3>
                <p className={styles.feedSub}>
                  Optimized for reading flow, fast scanning, and a clean modern interface.
                </p>
              </div>

              <div className={styles.cardGrid}>
                {gridPosts.map((item, index) => (
                  <article key={item.id ?? index} className={styles.storyCard}>
                    {renderLink(
                      item,
                      <>
                        <div className={styles.storyMedia}>
                          <Image
                            src={item.imageSrc || "/images/placeholder-news.png"}
                            alt={item.title}
                            fill
                            className={styles.storyImage}
                            sizes="(max-width: 767px) 100vw, (max-width: 1279px) 50vw, 33vw"
                          />
                          <div className={styles.storyMediaOverlay} />
                          {item.category ? <span className={styles.storyCategory}>{item.category}</span> : null}
                        </div>

                        <div className={styles.storyBody}>
                          <div className={styles.storyTags}>
                            {(item.tags || []).slice(0, 2).map((tag, tagIndex) => (
                              <span key={`${tag}-${tagIndex}`} className={styles.storyTag}>
                                {tag}
                              </span>
                            ))}
                          </div>

                          <h4 className={styles.storyTitle}>{item.title}</h4>

                          <p className={styles.storyExcerpt}>
                            {item.excerpt || "Clear, modern content cards designed for a reader-friendly experience."}
                          </p>

                          <div className={styles.storyFooter}>
                            <MetaInline readTime={item.readTime} views={item.views} comments={item.comments} />
                          </div>
                        </div>
                      </>,
                      styles.storyLink,
                    )}
                  </article>
                ))}
              </div>
            </div>

            <aside className={styles.rail}>
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <h3 className={styles.panelTitle}>Trending</h3>
                  <span className={styles.panelBadge}>Hot</span>
                </div>

                <div className={styles.trendingList}>
                  {trendingPosts.map((item, index) => (
                    <article key={item.id ?? index} className={styles.trendingItem}>
                      {renderLink(
                        item,
                        <>
                          <span className={styles.trendingIndex}>{String(index + 1).padStart(2, "0")}</span>

                          <div className={styles.trendingContent}>
                            <h4 className={styles.trendingTitle}>{item.title}</h4>
                            <div className={styles.trendingMeta}>
                              <span>{item.category || "News"}</span>
                              <span className={styles.metaDot}>•</span>
                              <span>{formatCompact(item.views)} views</span>
                            </div>
                          </div>
                        </>,
                        styles.trendingLink,
                      )}
                    </article>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </div>
      </div>
    </section>
  );
}

export const SHOP_HOT_NEW_ONE: RegItem = {
  kind: "HotNewOne",
  label: "Hot New One",
  defaults: {
    eyebrow: "FEATURED ARTICLES",
    title: "Discover topics people are reading right now",
    subtitle: "A modern layout with a clear content rhythm and an optimized reading experience across all devices.",
    viewAllText: "View all",
    viewAllHref: "/posts",
    apiUrl: POSTS_API_URL,
    posts: JSON.stringify([], null, 2),
  },
  inspector: [
    { key: "eyebrow", label: "Eyebrow", kind: "text" },
    { key: "title", label: "Title", kind: "text" },
    { key: "subtitle", label: "Subtitle", kind: "text" },
    { key: "viewAllText", label: "View all text", kind: "text" },
    { key: "viewAllHref", label: "View all URL", kind: "text" },
    { key: "apiUrl", label: "Posts API URL", kind: "text" },
    { key: "posts", label: "Posts override (JSON)", kind: "textarea", rows: 12 },
  ],
  render: (p) => {
    const posts = safeJson<HotNewOneItem[]>(p.posts);

    return (
      <div className="sectionContainer" aria-label="Hot New One">
        <HotNewOne
          eyebrow={String(p.eyebrow || "FEATURED ARTICLES")}
          title={String(p.title || "Discover topics people are reading right now")}
          subtitle={String(
            p.subtitle ||
              "A modern layout with a clear content rhythm and an optimized reading experience across all devices.",
          )}
          viewAllText={String(p.viewAllText || "View all")}
          viewAllHref={String(p.viewAllHref || "/posts")}
          apiUrl={String(p.apiUrl || POSTS_API_URL)}
          posts={posts}
          preview={true}
        />
      </div>
    );
  },
};

export default HotNewOne;
