// services/admin/builder/sites.service.ts
export type Site = {
  id: string;
  domain: string;
  name: string;
  createdAt: string;
  updatedAt: string;
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
    const msg =
      typeof (maybeJson as any)?.error === "string"
        ? (maybeJson as any).error
        : Object.values((maybeJson as any)?.error?.fieldErrors || {})
            .flat()
            .filter(Boolean)[0] ||
          (maybeJson as any)?.error?.formErrors?.[0] ||
          text ||
          `Request failed: ${res.status}`;

    throw new Error(msg);
  }

  if (maybeJson !== null) return maybeJson as T;
  return (text ? (JSON.parse(text) as T) : ({} as T)) as T;
}

export const sitesService = {
  list(): Promise<Site[]> {
    return jsonFetch("/api/admin/builder/sites", { method: "GET" });
  },
  create(payload: { domain: string; name: string }): Promise<Site> {
    return jsonFetch("/api/admin/builder/sites", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  remove(id: string): Promise<void> {
    return jsonFetch(`/api/admin/builder/sites/${id}`, { method: "DELETE" });
  },
};
