// services/admin/builder/sites.service.ts
import { API_ROUTES } from "@/constants/api";

export type SiteStatus = "DRAFT" | "ACTIVE" | "SUSPENDED";

export type Site = {
  id: string;
  domain: string;
  name: string;
  status: SiteStatus;
  isPublic: boolean;
  publishedAt: string | null;
  seoTitleDefault: string | null;
  seoDescDefault: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateSitePayload = {
  domain: string;
  name: string;
};

export type UpdateSitePayload = {
  domain: string;
  name: string;
  status: SiteStatus;
  isPublic: boolean;
  publishedAt: string | null;
  seoTitleDefault: string | null;
  seoDescDefault: string | null;
};

type ApiErrorShape = { error?: string } | { error?: { fieldErrors?: Record<string, string[]>; formErrors?: string[] } };

async function jsonFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  const text = await res.text().catch(() => "");

  const maybeJson = (() => {
    try {
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  })() as (T & ApiErrorShape) | null;

  if (!res.ok) {
    // cast to known error shape so we can inspect fields without using `any`
    const errObj = maybeJson as ApiErrorShape | null;
    const error = errObj?.error;

    const msg =
      typeof error === "string"
        ? error
        : Object.values(error?.fieldErrors || {})
            .flat()
            .filter(Boolean)[0] ||
          error?.formErrors?.[0] ||
          text ||
          `Request failed: ${res.status}`;

    throw new Error(msg);
  }

  if (maybeJson !== null) return maybeJson as T;
  return (text ? (JSON.parse(text) as T) : ({} as T)) as T;
}

export const sitesService = {
  list(): Promise<Site[]> {
    return jsonFetch(API_ROUTES.ADMIN_BUILDER_SITES, { method: "GET" });
  },

  create(payload: CreateSitePayload): Promise<Site> {
    return jsonFetch(API_ROUTES.ADMIN_BUILDER_SITES, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  update(id: string, payload: UpdateSitePayload): Promise<Site> {
    return jsonFetch(API_ROUTES.ADMIN_BUILDER_SITE(id), {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  },

  remove(id: string): Promise<void> {
    return jsonFetch(API_ROUTES.ADMIN_BUILDER_SITE(id), { method: "DELETE" });
  },
};
