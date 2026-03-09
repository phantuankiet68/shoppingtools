// store/commerce/customers/customer.store.ts
"use client";

import { create } from "zustand";
import {
  apiGetAdminContext,
  apiListCustomers,
  apiGetCustomerDetail,
  apiPatchCustomer,
  apiDeleteCustomer,
  apiCreateCustomer,
  ApiCustomerRow,
  ApiDetailResp,
  JsonObject,
  JsonValue,
} from "@/services/commerce/customers/customer.service";

export type CustomerStatus = "ACTIVE" | "INACTIVE" | "VIP";
export type Segment = "ALL" | CustomerStatus;

export type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: CustomerStatus;
  tags: string[];
  orders: number;
  totalSpent: number;
  lastOrderAt?: string;
  createdAt: string;
  note?: string;
};

// ===== helpers =====
function normalizeTags(input: JsonValue | null): string[] {
  if (input == null) return [];

  if (typeof input === "string") {
    const s = input.trim();
    if (!s) return [];
    try {
      if (s.startsWith("[") && s.endsWith("]")) {
        const parsed = JSON.parse(s) as unknown;
        if (Array.isArray(parsed)) return parsed.map((x) => String(x)).filter(Boolean);
      }
    } catch {
      // ignore
    }
    return s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }

  if (Array.isArray(input)) {
    return input
      .map((x) => String(x))
      .map((x) => x.trim())
      .filter(Boolean);
  }

  if (typeof input === "object") {
    const obj = input as JsonObject;
    const maybe = obj["tags"] ?? obj["labels"];
    if (Array.isArray(maybe)) {
      return maybe
        .map((x) => String(x))
        .map((x) => x.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function toCustomerStatus(row: ApiCustomerRow): CustomerStatus {
  const tags = normalizeTags(row.tags);
  const isVip = tags.some((t) => t.toLowerCase() === "vip");
  if (isVip) return "VIP";
  return row.isActive ? "ACTIVE" : "INACTIVE";
}

function mapRowToUI(row: ApiCustomerRow, detail?: ApiDetailResp["data"]): Customer {
  const tags = normalizeTags(row.tags);
  const orders = row._count?.orders ?? detail?.stats?.totalOrders ?? 0;
  const totalSpent = detail?.stats?.totalSpentCents ? detail.stats.totalSpentCents / 100 : 0;

  return {
    id: row.id,
    name: row.name,
    email: row.email || "",
    phone: row.phone || "",
    status: toCustomerStatus(row),
    tags,
    orders,
    totalSpent,
    lastOrderAt: detail?.stats?.lastOrderAt || undefined,
    createdAt: row.createdAt,
    note: row.notes || "",
  };
}

// ===== store type =====
export type CustomerStore = {
  // context
  siteId: string;
  siteErr: string | null;
  initLoading: boolean;

  // data
  customers: Customer[];
  nextCursor: string | null;
  statsServer: { total?: number; active?: number } | null;
  allTagsServer: string[];

  // ui / filter
  query: string;
  segment: Segment;
  statusFilter: "ANY" | CustomerStatus;
  tagFilter: string;
  sort: "LAST_ORDER" | "TOTAL_SPENT" | "CREATED_AT";

  // selection
  selected: Record<string, boolean>;

  // states
  loading: boolean;
  err: string | null;

  // actions
  initSite: () => Promise<void>;
  setSiteId: (siteId: string) => void;

  setQuery: (v: string) => void;
  setSegment: (v: Segment) => void;
  setStatusFilter: (v: "ANY" | CustomerStatus) => void;
  setTagFilter: (v: string) => void;
  setSort: (v: CustomerStore["sort"]) => void;

  toggleSelect: (id: string, v: boolean) => void;
  bulkSelect: (ids: string[], v: boolean) => void;
  clearSelection: () => void;

  fetchCustomers: () => Promise<void>;
  loadMore: () => Promise<void>;
  openDetailAndMerge: (id: string) => Promise<Customer | null>;

  bulkSetStatus: (nextStatus: CustomerStatus) => Promise<void>;
  bulkDeactivate: () => Promise<void>;

  createCustomer: (payload: Pick<Customer, "name" | "email" | "phone" | "status" | "tags" | "note">) => Promise<void>;
};

export const useCustomerStore = create<CustomerStore>((set, get) => ({
  siteId: "",
  siteErr: null,
  initLoading: false,

  customers: [],
  nextCursor: null,
  statsServer: null,
  allTagsServer: [],

  query: "",
  segment: "ALL",
  statusFilter: "ANY",
  tagFilter: "",
  sort: "LAST_ORDER",

  selected: {},

  loading: false,
  err: null,

  // Dùng khi đồng bộ site từ useSiteStore sang customer store
  setSiteId: (siteId) =>
    set({
      siteId,
      siteErr: siteId ? null : "MISSING_SITE_ID",
    }),

  // Guard: tránh gọi profile 2 lần ở StrictMode
  initSite: async () => {
    const { siteId, initLoading } = get();
    if (siteId || initLoading) return;

    set({ initLoading: true, siteErr: null });

    try {
      const ctx = await apiGetAdminContext();
      set({
        siteId: ctx.siteId,
        siteErr: ctx.siteId ? null : "MISSING_SITE_ID",
      });
    } catch (e: unknown) {
      set({ siteErr: e instanceof Error ? e.message : "LOAD_SITE_FAILED" });
    } finally {
      set({ initLoading: false });
    }
  },

  setQuery: (v) => set({ query: v }),
  setSegment: (v) => set({ segment: v }),
  setStatusFilter: (v) => set({ statusFilter: v }),
  setTagFilter: (v) => set({ tagFilter: v }),
  setSort: (v) => set({ sort: v }),

  toggleSelect: (id, v) =>
    set((st) => ({
      selected: { ...st.selected, [id]: v },
    })),

  bulkSelect: (ids, v) =>
    set((st) => {
      const next = { ...st.selected };
      for (const id of ids) next[id] = v;
      return { selected: next };
    }),

  clearSelection: () => set({ selected: {} }),

  fetchCustomers: async () => {
    const { siteId, query, segment, statusFilter } = get();

    if (!siteId) {
      set({ siteErr: "MISSING_SITE_ID" });
      return;
    }

    const isActive =
      segment === "ACTIVE" || statusFilter === "ACTIVE"
        ? "true"
        : segment === "INACTIVE" || statusFilter === "INACTIVE"
          ? "false"
          : undefined;

    try {
      set({ loading: true, err: null, siteErr: null });

      const resp = await apiListCustomers(siteId, {
        q: query.trim() || undefined,
        isActive,
        take: 50,
      });

      const uiRows = resp.data.map((r) => mapRowToUI(r));

      const s = new Set<string>();
      uiRows.forEach((c) => c.tags.forEach((t) => s.add(t)));

      set({
        customers: uiRows,
        nextCursor: resp.nextCursor,
        statsServer: resp.stats || null,
        allTagsServer: Array.from(s).sort(),
        selected: {},
      });
    } catch (e: unknown) {
      set({ err: e instanceof Error ? e.message : "LOAD_FAILED" });
    } finally {
      set({ loading: false });
    }
  },

  loadMore: async () => {
    const { siteId, query, segment, statusFilter, nextCursor, allTagsServer } = get();

    if (!siteId) {
      set({ siteErr: "MISSING_SITE_ID" });
      return;
    }

    if (!nextCursor) return;

    const isActive =
      segment === "ACTIVE" || statusFilter === "ACTIVE"
        ? "true"
        : segment === "INACTIVE" || statusFilter === "INACTIVE"
          ? "false"
          : undefined;

    try {
      set({ loading: true, err: null, siteErr: null });

      const resp = await apiListCustomers(siteId, {
        q: query.trim() || undefined,
        isActive,
        cursor: nextCursor,
        take: 50,
      });

      const uiRows = resp.data.map((r) => mapRowToUI(r));

      const s = new Set<string>(allTagsServer);
      uiRows.forEach((c) => c.tags.forEach((t) => s.add(t)));

      set({
        customers: [...get().customers, ...uiRows],
        nextCursor: resp.nextCursor,
        allTagsServer: Array.from(s).sort(),
      });
    } catch (e: unknown) {
      set({ err: e instanceof Error ? e.message : "LOAD_MORE_FAILED" });
    } finally {
      set({ loading: false });
    }
  },

  openDetailAndMerge: async (id) => {
    const { siteId } = get();

    if (!siteId) {
      set({ siteErr: "MISSING_SITE_ID" });
      return null;
    }

    try {
      const detail = await apiGetCustomerDetail(siteId, id);
      const updated = mapRowToUI(detail.data.customer, detail.data);

      set((st) => ({
        customers: st.customers.map((x) => (x.id === id ? { ...x, ...updated } : x)),
      }));

      return updated;
    } catch {
      return null;
    }
  },

  bulkSetStatus: async (nextStatus) => {
    const { siteId, selected, customers } = get();

    if (!siteId) {
      set({ siteErr: "MISSING_SITE_ID" });
      return;
    }

    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([id]) => id);

    if (ids.length === 0) return;

    try {
      set({ loading: true, err: null, siteErr: null });

      await Promise.all(
        ids.map(async (id) => {
          const current = customers.find((x) => x.id === id);
          const curTags = current?.tags ?? [];
          const lower = curTags.map((t) => t.toLowerCase());

          if (nextStatus === "ACTIVE") {
            const nextTags = curTags.filter((t) => t.toLowerCase() !== "vip");
            await apiPatchCustomer(siteId, id, { isActive: true, tags: nextTags });
          } else if (nextStatus === "INACTIVE") {
            await apiPatchCustomer(siteId, id, { isActive: false });
          } else {
            const nextTags = lower.includes("vip") ? curTags : [...curTags, "vip"];
            await apiPatchCustomer(siteId, id, { isActive: true, tags: nextTags });
          }
        }),
      );

      set((st) => ({
        customers: st.customers.map((c) => {
          if (!ids.includes(c.id)) return c;

          if (nextStatus === "ACTIVE") {
            return {
              ...c,
              status: "ACTIVE",
              tags: c.tags.filter((t) => t.toLowerCase() !== "vip"),
            };
          }

          if (nextStatus === "INACTIVE") {
            return { ...c, status: "INACTIVE" };
          }

          return {
            ...c,
            status: "VIP",
            tags: c.tags.some((t) => t.toLowerCase() === "vip") ? c.tags : [...c.tags, "vip"],
          };
        }),
        selected: {},
      }));
    } catch (e: unknown) {
      set({ err: e instanceof Error ? e.message : "BULK_UPDATE_FAILED" });
    } finally {
      set({ loading: false });
    }
  },

  bulkDeactivate: async () => {
    const { siteId, selected } = get();

    if (!siteId) {
      set({ siteErr: "MISSING_SITE_ID" });
      return;
    }

    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([id]) => id);

    if (ids.length === 0) return;

    try {
      set({ loading: true, err: null, siteErr: null });

      await Promise.all(ids.map((id) => apiDeleteCustomer(siteId, id)));

      set((st) => ({
        customers: st.customers.map((c) => (ids.includes(c.id) ? { ...c, status: "INACTIVE" } : c)),
        selected: {},
      }));
    } catch (e: unknown) {
      set({ err: e instanceof Error ? e.message : "DELETE_FAILED" });
    } finally {
      set({ loading: false });
    }
  },

  createCustomer: async (payload) => {
    const { siteId, allTagsServer } = get();

    if (!siteId) {
      set({ siteErr: "MISSING_SITE_ID" });
      throw new Error("MISSING_SITE_ID_ON_CLIENT");
    }

    try {
      set({ loading: true, err: null, siteErr: null });

      const isActive = payload.status !== "INACTIVE";
      const tags =
        payload.status === "VIP"
          ? Array.from(new Set([...(payload.tags ?? []), "vip"]))
          : (payload.tags ?? []).filter((t) => t.toLowerCase() !== "vip");

      const row = await apiCreateCustomer(siteId, {
        name: payload.name,
        email: payload.email || undefined,
        phone: payload.phone || undefined,
        isActive,
        tags,
        notes: payload.note || undefined,
      });

      const ui = mapRowToUI(row);

      const s = new Set<string>(allTagsServer);
      ui.tags.forEach((t) => s.add(t));

      set((st) => ({
        customers: [ui, ...st.customers],
        allTagsServer: Array.from(s).sort(),
      }));
    } catch (e: unknown) {
      set({ err: e instanceof Error ? e.message : "CREATE_FAILED" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },
}));
