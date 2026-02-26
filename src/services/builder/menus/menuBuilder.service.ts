// services/builder/menus/menuBuilder.service.ts

export type SiteRow = {
  id: string;
  domain: string;
  name: string;
  localeDefault?: "en";
};

async function safeText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

export async function fetchSites(): Promise<SiteRow[]> {
  const res = await fetch("/api/admin/builder/sites", { cache: "no-store" });
  if (!res.ok) throw new Error("Load sites failed");
  const data = await res.json();
  if (Array.isArray(data)) return data as SiteRow[];
  if (data && Array.isArray((data as any).items)) return (data as any).items as SiteRow[];
  return [];
}

export async function syncPagesFromMenu(payload: { siteId?: string; items: any[] }) {
  const res = await fetch("/api/admin/builder/pages/sync-from-menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  if (!res.ok) {
    const raw = await safeText(res);
    throw new Error(`Sync SEO failed: ${raw || res.status}`);
  }
}
