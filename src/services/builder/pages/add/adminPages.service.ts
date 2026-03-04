import { API_ROUTES } from "@/constants/api";
import type { Block, SEO } from "@/lib/page/types";

export type AdminPageDto = {
  id: string;
  title?: string;
  slug?: string;
  siteId?: string;
  blocks?: unknown[];
  seo?: Partial<SEO>;
};

export async function fetchAdminPage(id: string, signal?: AbortSignal): Promise<AdminPageDto | null> {
  const res = await fetch(API_ROUTES.ADMIN_BUILDER_PAGE(id), {
    cache: "no-store",
    signal,
  });

  if (!res.ok) return null;

  const json = await res.json().catch(() => ({}));
  return (json.page ?? null) as AdminPageDto | null;
}

export async function saveAdminPage(args: {
  body: {
    id?: string;
    title: string;
    slug: string;
    path: string;
    blocks: Pick<Block, "id" | "kind" | "props">[];
    seo: SEO;
  };
  siteDomain: string;
}): Promise<{ ok: true; id?: string } | { ok: false; error: string }> {
  const res = await fetch(API_ROUTES.ADMIN_BUILDER_PAGES_SAVE, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-site-domain": args.siteDomain || "",
    },
    body: JSON.stringify(args.body),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.ok) return { ok: false, error: json?.error || "Save failed" };

  return { ok: true, id: json?.id };
}

export async function publishAdminPage(args: {
  id: string;
  siteDomain: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const res = await fetch(API_ROUTES.ADMIN_BUILDER_PAGES_PUBLISH, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-site-domain": args.siteDomain || "",
    },
    body: JSON.stringify({ id: args.id }),
  });

  const json = await res.json().catch(() => ({}));
  if (!res.ok || json?.ok === false) return { ok: false, error: json?.error || "Publish failed" };

  return { ok: true };
}
