export type AutoSeoInput = {
  title: string;
  path: string;
  siteUrl?: string;
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

export function buildAutoSEO({ title, path, siteUrl }: AutoSeoInput) {
  const origin = siteUrl || (typeof window !== "undefined" ? window.location.origin : "");

  const metaTitle = clamp(title, 65) || "New page";
  const metaDescription = clamp(`Page "${title}" – information, description, and detailed content.`, 155);

  const base = wordsFromTitle(title);
  const extra = ["zento", "ui", "builder", "form", "bootstrap"];
  const keywords = uniq([...base, ...extra])
    .slice(0, 10)
    .join(", ");

  const canonicalUrl = origin ? `${origin}${path}` : path;

  const ogTitle = metaTitle;
  const ogDescription = metaDescription;
  const ogImage = `${origin || ""}/og-default.jpg`;

  // JSON-LD (WebPage)
  const structuredData = JSON.stringify(
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
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
