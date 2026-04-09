// features/pages/messages.ts

export const PAGE_MESSAGES = {
  confirmDelete: "Delete this page? This action is irreversible.",

  // Success
  duplicateSuccess: "Page duplicated successfully.",
  seoSaveSuccess: "SEO data saved successfully.",

  // Errors
  loadPagesError: "Failed to load pages.",
  deleteError: "Failed to delete page.",
  duplicateError: "Failed to duplicate page.",
  publishError: "Failed to change publish status.",
  seoSaveError: "Failed to save SEO data.",
  pageNotFound: "Page not found.",

  // UI Labels
  searchPlaceholder: "Search by title / slug / path…",
  status: "Status",
  sort: "Sort",
  loading: "Loading…",
  refresh: "Refresh",
  noResults: "No results matched the filters.",
  loadingData: "Loading data…",
  untitled: "(untitled)",
  page: "Page",
  allSites: "All sites",
  allStatuses: "All",

  // Table Headers
  id: "ID",
  title: "Title",
  slug: "Slug",
  path: "Path",
  updated: "Updated",
  actions: "Actions",

  // Inspector / Actions
  edit: "Edit",
  preview: "Preview",
  duplicate: "Duplicate",
  delete: "Delete",
  publish: "Publish",
  unpublish: "Unpublish",
  noPageSelected: "Select a page from the list to edit its Settings & SEO.",

  // SEO Form
  seo: "SEO",
  metaTitle: "Meta Title",
  ogTitle: "OG Title",
  twitterCard: "Twitter Card",
  metaDescription: "Meta Description",
  keywords: "Keywords (optional)",
  canonicalUrl: "Canonical URL",
  noindex: "noindex",
  nofollow: "nofollow",
  ogDescription: "OG Description",
  ogImageUrl: "OG Image URL",
  sitemapChangefreq: "Sitemap Changefreq",
  sitemapPriority: "Sitemap Priority",
  structuredData: "Structured Data (JSON-LD)",
  jsonNotRequired: "Optional",
  jsonValid: "JSON is valid",
  jsonInvalid: "Invalid JSON",
  autocomplete: "Autocomplete",
  saveSeo: "Save SEO",
  saving: "Saving…",
} as const;

export type PageMessageKey = keyof typeof PAGE_MESSAGES;
