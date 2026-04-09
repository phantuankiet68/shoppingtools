import { API_ROUTES } from "@/constants/api";

async function safeText(res: Response) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

export async function patchMenuItem(
  id: string,
  payload: { title: string; icon: string | null; path: string | null; visible?: boolean },
): Promise<void> {
  const url = new URL(API_ROUTES.ADMIN_BUILDER_MENUS(id), window.location.origin);

  const res = await fetch(url.toString(), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok && res.status !== 404) {
    const txt = await safeText(res);
    throw new Error(txt || String(res.status));
  }
}
