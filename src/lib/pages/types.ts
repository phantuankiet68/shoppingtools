import type { RegItem, InspectorField } from "@/lib/ui-builder/types";

type TranslateFn = (key: string, params?: Record<string, string>) => string;

type BuildAutoSEOInput = {
  title?: string | null;
  path?: string | null;
  siteName?: string | null;
  category?: string | null;
};

export type Block = {
  id: string;
  kind: string;
  props: Record<string, unknown>;
};

export type PageRow = {
  id: string;
  siteId: string;
  siteDomain: string | null;
  siteName: string | null;
  title: string;
  slug: string;
  path: string | null;
  status: "DRAFT" | "PUBLISHED";
  createdAt: string;
  updatedAt: string;
};

export type SEO = {
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

export type DropMeta =
  | {
      type: "row-col";
      parentRowId: string;
      colIndex: number;
    }
  | {
      type: "section";
      parentSectionId: string;
      slot: string;
    };

export type InternalProps = {
  _parentRowId?: string;
  _parentColIndex?: number;
  __parent?: {
    id: string;
    slot: string;
  };
};

export type Mode = "pages" | "settings" | "design" | "code" | "preview";

export type RegistryTypes = {
  RegItem: RegItem;
  InspectorField: InspectorField;
};

function ensureLeadingSlash(p?: string | null) {
  if (!p) return "/";

  const s = p.trim();

  return s.startsWith("/") ? s : `/${s}`;
}

function cleanupTitle(t: TranslateFn, title?: string | null) {
  return (title || t("seo.defaultTitle")).trim();
}

function isHomePage(path: string) {
  return path === "/" || path === "/home";
}

function buildMetaTitle(t: TranslateFn, title: string, siteName: string, isHome: boolean) {
  if (isHome) {
    return t("seo.homeMetaTitle").replace("{siteName}", siteName);
  }

  return t("seo.pageMetaTitle").replace("{title}", title).replace("{siteName}", siteName);
}

function buildOgTitle(t: TranslateFn, title: string, siteName: string, isHome: boolean) {
  if (isHome) {
    return t("seo.homeOgTitle").replace("{siteName}", siteName);
  }

  return t("seo.pageOgTitle").replace("{title}", title).replace("{siteName}", siteName);
}

function buildMetaDescription(t: TranslateFn, title: string, siteName: string, isHome: boolean) {
  if (isHome) {
    return t("seo.homeMetaDescription").replace("{siteName}", siteName);
  }

  return t("seo.pageMetaDescription").replace("{title}", title).replace("{siteName}", siteName);
}

function buildKeywords(t: TranslateFn, title: string, category?: string | null, siteName?: string | null) {
  const keywords =
    t("seo.keywords")
      ?.split(",")
      .map((item) => item.trim()) || [];

  return [title, category, siteName, ...keywords].filter(Boolean).join(", ");
}

function buildOgDescription(t: TranslateFn, title: string, siteName: string, isHome: boolean) {
  if (isHome) {
    return t("seo.homeOgDescription").replace("{siteName}", siteName);
  }

  return t("seo.pageOgDescription").replace("{title}", title).replace("{siteName}", siteName);
}

export function fillAutoSEO(
  t: TranslateFn,
  input: BuildAutoSEOInput,
): {
  seo: SEO;
} {
  const path = ensureLeadingSlash(input.path);

  const title = cleanupTitle(t, input.title);

  const siteName = (input.siteName || "Zento Shop").trim();

  const isHome = isHomePage(path);

  const metaTitle = buildMetaTitle(t, title, siteName, isHome).slice(0, 70);

  const metaDescription = buildMetaDescription(t, title, siteName, isHome).slice(0, 160);

  const ogTitle = buildOgTitle(t, title, siteName, isHome).slice(0, 95);

  const ogDescription = buildOgDescription(t, title, siteName, isHome).slice(0, 200);

  const structuredData = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      name: title,
      url: path,
      description: metaDescription,
      publisher: {
        "@type": "Organization",
        name: siteName,
      },
    },
    null,
    2,
  );

  return {
    seo: {
      metaTitle,
      metaDescription,
      keywords: buildKeywords(t, title, input.category, siteName),
      canonicalUrl: path,
      noindex: false,
      nofollow: false,
      ogTitle,
      ogDescription,
      ogImage: "",
      twitterCard: "summary_large_image",
      sitemapChangefreq: "weekly",
      sitemapPriority: isHome ? 1 : 0.8,
      structuredData,
    },
  };
}
