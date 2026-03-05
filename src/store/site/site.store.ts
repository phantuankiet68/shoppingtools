import { create } from "zustand";

export type SiteItem = {
  id: string;
  name?: string;
  domain?: string;
};

type SiteState = {
  sites: SiteItem[];
  loading: boolean;
  err: string;

  siteId: string; // selected
  setSiteId: (id: string) => void;

  loadSites: () => Promise<void>;
  hydrateFromStorage: () => void;
};

const LS_KEY = "admin.selectedSiteId";

function normalizeSites(payload: unknown): SiteItem[] {
  // API trả về array trực tiếp: [{...}, {...}]
  if (Array.isArray(payload)) return payload as SiteItem[];

  // API trả về object: { items: [...] } hoặc { sites: [...] }
  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items as SiteItem[];
    if (Array.isArray(obj.sites)) return obj.sites as SiteItem[];
  }

  return [];
}

export const useSiteStore = create<SiteState>((set, get) => ({
  sites: [],
  loading: false,
  err: "",

  siteId: "",

  setSiteId: (id) => {
    set({ siteId: id });
    try {
      localStorage.setItem(LS_KEY, id);
    } catch {}
  },

  hydrateFromStorage: () => {
    try {
      const id = localStorage.getItem(LS_KEY) ?? "";
      if (id) set({ siteId: id });
    } catch {}
  },

  loadSites: async () => {
    try {
      set({ loading: true, err: "" });

      const res = await fetch("/api/admin/builder/sites", { cache: "no-store" });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const errorObj = j as { error?: string; message?: string };
        throw new Error(errorObj.error ?? errorObj.message ?? "Load sites failed");
      }

      const json = (await res.json()) as unknown;
      const items = normalizeSites(json);

      set({ sites: items });

      // auto select nếu chưa có siteId hoặc siteId hiện tại không còn tồn tại
      const current = get().siteId;
      const stillValid = current && items.some((x) => x.id === current);

      if ((!current || !stillValid) && items[0]?.id) {
        get().setSiteId(items[0].id);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Load sites failed";
      set({ err: msg });
    } finally {
      set({ loading: false });
    }
  },
}));
