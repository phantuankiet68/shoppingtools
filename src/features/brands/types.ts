export type SiteOption = {
  id: string;
  name?: string;
  domain?: string;
};

export type BrandRow = {
  id: string;
  name: string;
  slug: string;
  siteId: string;
  description?: string | null;
  logoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
  site?: SiteOption | null;
};

export type ApiListResponse = {
  items?: BrandRow[];
};

export type ApiError = {
  error?: string;
};

export type UploadResponse = {
  ok?: boolean;
  logoUrl?: string;
  url?: string;
  error?: string;
};

export type BrandMode = "create" | "edit";
export type LogoFilter = "all" | "with-logo" | "no-logo";
export type SortBy = "newest" | "oldest" | "name-asc" | "name-desc";
