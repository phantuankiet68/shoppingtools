import type { RegItem, InspectorField } from "@/lib/ui-builder/types";
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
  | { type: "row-col"; parentRowId: string; colIndex: number }
  | { type: "section"; parentSectionId: string; slot: string };

export type InternalProps = {
  _parentRowId?: string;
  _parentColIndex?: number;
  __parent?: { id: string; slot: string };
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

function cleanupTitle(title?: string | null) {
  return (title || "Sản phẩm nổi bật").trim();
}

function isHomePage(path: string) {
  return path === "/" || path === "/home";
}

function buildMetaTitle(title: string, siteName: string, isHome: boolean) {
  if (isHome) return `${siteName} - Mua sắm dễ dàng, sản phẩm đẹp và giá tốt`;
  return `${title} | ${siteName}`;
}

function buildMetaDescription(title: string, siteName: string, isHome: boolean) {
  if (isHome) {
    return `Khám phá ${siteName} với nhiều sản phẩm đẹp, giá tốt, dễ chọn mua và tối ưu trải nghiệm trên mọi thiết bị.`;
  }

  return `Khám phá ${title} tại ${siteName}. Thông tin rõ ràng, hình ảnh đẹp, trải nghiệm mua sắm mượt mà và dễ chuyển đổi.`;
}

function buildOgTitle(title: string, siteName: string, isHome: boolean) {
  if (isHome) return `${siteName} | Ưu đãi hấp dẫn mỗi ngày`;
  return `${title} - Xem ngay tại ${siteName}`;
}

function buildOgDescription(title: string, siteName: string, isHome: boolean) {
  if (isHome) {
    return `Mua sắm nhanh hơn với giao diện đẹp, nội dung rõ ràng và nhiều ưu đãi hấp dẫn tại ${siteName}.`;
  }

  return `Xem ngay ${title} tại ${siteName} với thông tin nổi bật, nội dung hấp dẫn và trải nghiệm mua sắm tối ưu.`;
}

function buildKeywords(title: string, category?: string | null, siteName?: string | null) {
  return [title, category, siteName, "mua online", "giá tốt", "ưu đãi", "shopping online"].filter(Boolean).join(", ");
}

export function fillAutoSEO(input: BuildAutoSEOInput): { seo: SEO } {
  const path = ensureLeadingSlash(input.path);
  const title = cleanupTitle(input.title);
  const siteName = (input.siteName || "Zento Shop").trim();
  const isHome = isHomePage(path);

  const metaTitle = buildMetaTitle(title, siteName, isHome).slice(0, 70);
  const metaDescription = buildMetaDescription(title, siteName, isHome).slice(0, 160);
  const ogTitle = buildOgTitle(title, siteName, isHome).slice(0, 95);
  const ogDescription = buildOgDescription(title, siteName, isHome).slice(0, 200);

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
      keywords: buildKeywords(title, input.category, siteName),
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
