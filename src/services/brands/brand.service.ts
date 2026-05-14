import type { ApiError, ApiListResponse, BrandRow, UploadResponse } from "@/features/commerce/brands/types";
import { API_ROUTES } from "@/constants/api";

export function slugify(input: string) {
  return String(input ?? "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export async function parseErrorResponse(r: Response, text: string, fallback: string) {
  let errMsg = `${fallback} (${r.status})`;

  try {
    const json = JSON.parse(text) as ApiError;
    if (json.error) errMsg = `${errMsg}: ${json.error}`;
  } catch {
    if (text) errMsg = `${errMsg}: ${text.slice(0, 220)}`;
  }

  return errMsg;
}

export async function getBrands(siteId?: string, signal?: AbortSignal): Promise<BrandRow[]> {
  const params = new URLSearchParams();

  if (siteId?.trim()) {
    params.set("siteId", siteId.trim());
  }

  const url = params.toString()
    ? `${API_ROUTES.ADMIN_BRAND.BRAND_API}?${params.toString()}`
    : API_ROUTES.ADMIN_BRAND.BRAND_API;

  const r = await fetch(url, {
    method: "GET",
    cache: "no-store",
    credentials: "include",
    signal,
  });

  const text = await r.text();

  if (!r.ok) {
    throw new Error(await parseErrorResponse(r, text, "Load failed"));
  }

  const json = JSON.parse(text) as ApiListResponse;
  return json.items ?? [];
}

export async function uploadBrandLogo(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);

  const r = await fetch(API_ROUTES.ADMIN_BRAND.BRAND_IMAGE_UPLOAD_API, {
    method: "POST",
    body: formData,
    credentials: "include",
    cache: "no-store",
  });

  const text = await r.text();

  let json: UploadResponse = {};
  try {
    json = JSON.parse(text) as UploadResponse;
  } catch {
    throw new Error("Upload logo failed");
  }

  if (!r.ok) {
    throw new Error(json.error || `Upload logo failed (${r.status})`);
  }

  const uploadedLogoUrl = json.logoUrl || json.url || "";
  if (!uploadedLogoUrl) {
    throw new Error("Upload thành công nhưng không nhận được logoUrl");
  }

  return uploadedLogoUrl;
}

export type UpsertBrandPayload = {
  name: string;
  slug: string;
  siteId: string;
  description?: string | null;
  logoUrl?: string | null;
};

export async function createBrand(payload: UpsertBrandPayload) {
  const r = await fetch(API_ROUTES.ADMIN_BRAND.BRAND_API, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
    credentials: "include",
  });

  const text = await r.text();

  if (!r.ok) {
    throw new Error(await parseErrorResponse(r, text, "Create failed"));
  }

  return text;
}

export async function updateBrand(brandId: string, payload: UpsertBrandPayload) {
  const r = await fetch(`${API_ROUTES.ADMIN_BRAND.BRAND_API}/${brandId}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
    credentials: "include",
  });

  const text = await r.text();

  if (!r.ok) {
    throw new Error(await parseErrorResponse(r, text, "Update failed"));
  }

  return text;
}

export async function deleteBrand(brandId: string) {
  const r = await fetch(`${API_ROUTES.ADMIN_BRAND.BRAND_API}/${brandId}`, {
    method: "DELETE",
    cache: "no-store",
    credentials: "include",
  });

  const text = await r.text();

  if (!r.ok) {
    throw new Error(await parseErrorResponse(r, text, "Delete failed"));
  }

  return text;
}

export async function publishBrand(brandId: string) {
  const r = await fetch(`${API_ROUTES.ADMIN_BRAND.BRAND_API}/${brandId}/publish`, {
    method: "POST",
    cache: "no-store",
    credentials: "include",
  });

  const text = await r.text();

  if (!r.ok) {
    throw new Error(await parseErrorResponse(r, text, "Publish failed"));
  }

  return text;
}
