import { create } from "zustand";

export type VariantItem = {
  id: string;
  productId: string;
  siteId: string;
  sku: string;
  title?: string | null;
  isActive: boolean;
  price: number | string;
  compareAtPrice?: number | string | null;
  cost?: number | string | null;
  stockQty: number;
  barcode?: string | null;
  weight?: number | string | null;
  length?: number | string | null;
  width?: number | string | null;
  height?: number | string | null;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

type VariantState = {
  variants: VariantItem[];
  loading: boolean;
  err: string;

  variantId: string;
  setVariantId: (id: string) => void;
  clearVariantId: () => void;

  loadVariants: (siteId?: string) => Promise<void>;
  hydrateFromStorage: () => void;
};

const LS_KEY = "admin.selectedVariantId";

function normalizeVariants(payload: unknown): VariantItem[] {
  if (Array.isArray(payload)) return payload as VariantItem[];

  if (payload && typeof payload === "object") {
    const obj = payload as Record<string, unknown>;

    if (Array.isArray(obj.items)) return obj.items as VariantItem[];
    if (Array.isArray(obj.variants)) return obj.variants as VariantItem[];
    if (Array.isArray(obj.data)) return obj.data as VariantItem[];
  }

  return [];
}

export const useVariantStore = create<VariantState>((set, get) => ({
  variants: [],
  loading: false,
  err: "",

  variantId: "",

  setVariantId: (id) => {
    set({ variantId: id });
    try {
      localStorage.setItem(LS_KEY, id);
    } catch {}
  },

  clearVariantId: () => {
    set({ variantId: "" });
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
  },

  hydrateFromStorage: () => {
    try {
      const id = localStorage.getItem(LS_KEY) ?? "";
      if (id) set({ variantId: id });
    } catch {}
  },

  loadVariants: async (siteId?: string) => {
    try {
      set({ loading: true, err: "" });

      const params = new URLSearchParams();
      if (siteId) params.set("siteId", siteId);

      const query = params.toString();
      const res = await fetch(`/api/admin/inventory/variants${query ? `?${query}` : ""}`, { cache: "no-store" });

      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        const errorObj = j as { error?: string; message?: string };
        throw new Error(errorObj.error ?? errorObj.message ?? "Load variants failed");
      }

      const json = (await res.json()) as unknown;
      const items = normalizeVariants(json);

      const activeItems = items.filter((x) => x.isActive !== false);

      set({ variants: activeItems });

      const current = get().variantId;
      const stillValid = current && activeItems.some((x) => x.id === current);

      if ((!current || !stillValid) && activeItems[0]?.id) {
        get().setVariantId(activeItems[0].id);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Load variants failed";
      set({ err: msg });
    } finally {
      set({ loading: false });
    }
  },
}));
