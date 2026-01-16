// src/lib/types.ts
import type { RegItem, InspectorField } from "@/lib/ui-builder/types";

export type Block = {
  id: string;
  kind: string;
  props: Record<string, any>;
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

export type Mode = "pages" | "settings" | "design" | "code" | "preview";

export type RegistryTypes = {
  RegItem: RegItem;
  InspectorField: InspectorField;
};
