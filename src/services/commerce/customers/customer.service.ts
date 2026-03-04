// services/commerce/customers/customer.service.ts
"use client";

import { API_ENDPOINTS } from "@/constants/api";

// ---- Prisma Json typing (no `any`) ----
export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray;
export type JsonObject = { [key: string]: JsonValue };
export type JsonArray = JsonValue[];

export type ApiCustomerRow = {
  id: string;
  siteId?: string;
  userId?: string | null;

  name: string;
  email: string | null;
  phone: string | null;

  tags: JsonValue | null; // Prisma Json?
  notes: string | null;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { orders?: number };
};

export type ApiListResp = {
  data: ApiCustomerRow[];
  nextCursor: string | null;
  stats?: { total?: number; active?: number };
};

export type ApiDetailResp = {
  data: {
    customer: ApiCustomerRow;
    stats?: {
      totalOrders?: number;
      totalSpentCents?: number;
      lastOrderAt?: string | null;
    };
    recentOrders?: {
      id: string;
      number: number;
      reference: string | null;
      status: string;
      paymentStatus: string;
      fulfillmentStatus: string;
      currency: string;
      subtotalCents: number;
      discountCents: number;
      shippingCents: number;
      taxCents: number;
      totalCents: number;
      createdAt: string;
      updatedAt: string;
      _count: { items: number };
    }[];
  };
};

async function safeJson(res: Response): Promise<unknown> {
  const text = await res.text();
  try {
    return JSON.parse(text) as unknown;
  } catch {
    throw new Error(`API_NOT_JSON (${res.status}) ${text.slice(0, 120)}`);
  }
}

function headersWithSite(siteId: string) {
  return {
    "Content-Type": "application/json",
    "x-site-id": siteId,
  } as Record<string, string>;
}

// ✅ ADMIN CONTEXT: load siteId
export async function apiGetAdminContext(): Promise<{ siteId: string }> {
  // dùng endpoint trong constants
  const res = await fetch(API_ENDPOINTS.ADMIN.PROFILE, { cache: "no-store" });
  const json = (await safeJson(res)) as {
    user?: { profile?: { siteId?: string | null } | null } | null;
    error?: string;
  };

  if (!res.ok) throw new Error(json?.error || `HTTP_${res.status}`);

  const siteId = String(json?.user?.profile?.siteId || "");
  if (!siteId) throw new Error("MISSING_SITE_ID");

  return { siteId };
}

// ✅ LIST
export async function apiListCustomers(
  siteId: string,
  params: { q?: string; isActive?: "true" | "false"; cursor?: string; take?: number },
) {
  const base = API_ENDPOINTS.COMMERCE.CUSTOMERS;

  // Lưu ý: URL() cần absolute, nên dùng window.location.origin ở client
  const url = new URL(base, window.location.origin);

  if (params.q) url.searchParams.set("q", params.q);
  if (params.isActive) url.searchParams.set("isActive", params.isActive);
  if (params.cursor) url.searchParams.set("cursor", params.cursor);
  url.searchParams.set("take", String(params.take ?? 20));

  const res = await fetch(url.toString(), { method: "GET", headers: { "x-site-id": siteId } });
  const json = (await safeJson(res)) as ApiListResp | { error?: string };

  if (!res.ok) throw new Error((json as { error?: string })?.error || `HTTP_${res.status}`);
  return json as ApiListResp;
}

// ✅ CREATE
export async function apiCreateCustomer(
  siteId: string,
  body: {
    name: string;
    email?: string;
    phone?: string;
    tags?: JsonValue | null;
    notes?: string;
    isActive?: boolean;
  },
) {
  const res = await fetch(API_ENDPOINTS.COMMERCE.CUSTOMERS, {
    method: "POST",
    headers: headersWithSite(siteId),
    body: JSON.stringify(body),
  });

  const json = (await safeJson(res)) as { data?: ApiCustomerRow; error?: string };
  if (!res.ok) throw new Error(json?.error || `HTTP_${res.status}`);
  return json?.data as ApiCustomerRow;
}

// ✅ PATCH
export async function apiPatchCustomer(siteId: string, id: string, body: Record<string, unknown>) {
  const res = await fetch(API_ENDPOINTS.COMMERCE.CUSTOMER_DETAIL(id), {
    method: "PATCH",
    headers: headersWithSite(siteId),
    body: JSON.stringify(body),
  });

  const json = (await safeJson(res)) as { data?: ApiCustomerRow; error?: string };
  if (!res.ok) throw new Error(json?.error || `HTTP_${res.status}`);
  return json?.data as ApiCustomerRow;
}

// ✅ DELETE (soft delete/deactivate)
export async function apiDeleteCustomer(siteId: string, id: string) {
  const res = await fetch(API_ENDPOINTS.COMMERCE.CUSTOMER_DETAIL(id), {
    method: "DELETE",
    headers: { "x-site-id": siteId },
  });

  const json = (await safeJson(res)) as {
    data?: { id: string; isActive: boolean; updatedAt: string };
    error?: string;
  };

  if (!res.ok) throw new Error(json?.error || `HTTP_${res.status}`);
  return json?.data as { id: string; isActive: boolean; updatedAt: string };
}

// ✅ DETAIL
export async function apiGetCustomerDetail(siteId: string, id: string) {
  const res = await fetch(API_ENDPOINTS.COMMERCE.CUSTOMER_DETAIL(id), {
    method: "GET",
    headers: { "x-site-id": siteId },
  });

  const json = (await safeJson(res)) as ApiDetailResp | { error?: string };
  if (!res.ok) throw new Error((json as { error?: string })?.error || `HTTP_${res.status}`);
  return json as ApiDetailResp;
}
