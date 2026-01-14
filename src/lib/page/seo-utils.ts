// lib/page/seo-utils.ts
export type AutoSeoInput = {
  title: string;
  path: string; // ví dụ: /vi/trang-builder
  locale: "vi" | "en" | "ja";
  siteUrl?: string; // ví dụ: https://example.com  (nếu bỏ trống sẽ lấy window.location.origin)
};

const clamp = (s: string, max: number) => (s || "").trim().replace(/\s+/g, " ").slice(0, max);

const uniq = (arr: string[]) => [...new Set(arr.filter(Boolean))];

const wordsFromTitle = (title: string) =>
  (title || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w && w.length > 2);

export function buildAutoSEO({ title, path, locale, siteUrl }: AutoSeoInput) {
  const origin = siteUrl || (typeof window !== "undefined" ? window.location.origin : "");

  // Meta
  const metaTitle = clamp(title, 65) || "Trang mới";
  const metaDescription = clamp(
    locale === "vi"
      ? `Trang "${title}" – thông tin, mô tả và nội dung chi tiết.`
      : locale === "ja"
      ? `「${title}」のページです。概要と詳細コンテンツを紹介します。`
      : `“${title}” page – overview and details.`,
    155
  );

  // Keywords
  const base = wordsFromTitle(title);
  const extra =
    locale === "vi" ? ["zento", "ui", "builder", "form", "bootstrap"] : locale === "ja" ? ["zento", "ui", "ビルダー", "フォーム", "bootstrap"] : ["zento", "ui", "builder", "form", "bootstrap"];
  const keywords = uniq([...base, ...extra])
    .slice(0, 10)
    .join(", ");

  const canonicalUrl = origin ? `${origin}${path}` : path;

  // Open Graph
  const ogTitle = metaTitle;
  const ogDescription = metaDescription;
  const ogImage = `${origin || ""}/og-default.jpg`; // bạn có thể đổi sang ảnh mặc định của hệ thống

  // JSON-LD (WebPage)
  const structuredData = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      inLanguage: locale,
      name: metaTitle,
      description: metaDescription,
      url: canonicalUrl,
      isPartOf: { "@type": "WebSite", url: origin || undefined },
    },
    null,
    2
  );

  return {
    metaTitle,
    metaDescription,
    keywords,
    canonicalUrl,
    ogTitle,
    ogDescription,
    ogImage,
    structuredData,
  };
}
