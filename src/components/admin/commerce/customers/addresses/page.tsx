"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "@/styles/admin/commerce/customers/addresses/addresses.module.css";

type AddressStatus = "ACTIVE" | "INACTIVE";
type AddressType = "SHIPPING" | "BILLING";
type SortOption = "UPDATED_AT" | "CREATED_AT" | "CUSTOMER";
type TypeFilter = "ANY" | AddressType;
type StatusFilter = "ANY" | AddressStatus;

type Address = {
  id: string;
  customerId: string;
  customerName: string;
  label: string;
  type: AddressType;
  status: AddressStatus;
  isDefault: boolean;

  receiverName: string;
  phone?: string;

  line1: string;
  line2?: string;
  ward?: string;
  district?: string;
  city: string;
  region?: string;
  country: string;
  postalCode?: string;

  note?: string;
  createdAt: string;
  updatedAt: string;
};

type AddressApiItem = {
  id?: string | number;
  customerId?: string | number;
  customerName?: string;
  customer?: { id?: string | number; name?: string };

  label?: string;
  type?: AddressType | string;
  status?: AddressStatus | string;
  isDefault?: boolean;

  receiverName?: string;
  phone?: string | null;

  line1?: string;
  line2?: string | null;
  ward?: string | null;
  district?: string | null;
  city?: string;
  region?: string | null;
  country?: string;
  postalCode?: string | null;

  note?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type CustomerApiItem = {
  id: string | number;
  name?: string | null;
};

type Customer = {
  id: string;
  name: string;
};

type ApiListResponse<TItem> =
  | { items: TItem[]; total?: number; page?: number; limit?: number }
  | { data: TItem[] }
  | TItem[];

type CustomersGetResponse = {
  data: CustomerApiItem[];
  nextCursor?: string | null;
  stats?: { total?: number; active?: number; userId?: string };
};

const VI_DATE_FMT = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" });

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return VI_DATE_FMT.format(d);
}

const TYPE_META: Record<AddressType, { label: string; icon: string }> = {
  SHIPPING: { label: "Shipping", icon: "bi-truck" },
  BILLING: { label: "Billing", icon: "bi-receipt" },
};

function isAddressType(x: unknown): x is AddressType {
  return x === "SHIPPING" || x === "BILLING";
}
function isAddressStatus(x: unknown): x is AddressStatus {
  return x === "ACTIVE" || x === "INACTIVE";
}
function isTypeFilter(v: string): v is TypeFilter {
  return v === "ANY" || v === "SHIPPING" || v === "BILLING";
}
function isStatusFilter(v: string): v is StatusFilter {
  return v === "ANY" || v === "ACTIVE" || v === "INACTIVE";
}
function isSortOption(v: string): v is SortOption {
  return v === "UPDATED_AT" || v === "CREATED_AT" || v === "CUSTOMER";
}

function extractItems<T>(data: ApiListResponse<T> | unknown): T[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const obj = data as { items?: unknown; data?: unknown };
    if (Array.isArray(obj.items)) return obj.items as T[];
    if (Array.isArray(obj.data)) return obj.data as T[];
  }
  return [];
}

function normalizeCustomer(x: CustomerApiItem): Customer {
  return { id: String(x.id), name: String(x.name ?? "—") };
}

function readSiteIdFromLocalStorage(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem("siteId") || "";
}

function writeSiteIdToLocalStorage(siteId: string) {
  if (typeof window === "undefined") return;
  if (!siteId) return;
  window.localStorage.setItem("siteId", siteId);
}

function normalizeAddressFromApi(x: AddressApiItem, customerNameById: Record<string, string>): Address {
  const nowIso = new Date().toISOString();

  const type: AddressType = isAddressType(x.type) ? x.type : "SHIPPING";
  const status: AddressStatus = isAddressStatus(x.status) ? x.status : "ACTIVE";

  const customerId = String(x.customerId ?? x.customer?.id ?? "");
  const customerName = customerNameById[customerId] ?? x.customerName ?? x.customer?.name ?? "—";

  return {
    id: String(x.id ?? ""),
    customerId,
    customerName: String(customerName),

    label: String(x.label ?? ""),
    type,
    status,
    isDefault: Boolean(x.isDefault),

    receiverName: String(x.receiverName ?? ""),
    phone: x.phone ?? "",

    line1: String(x.line1 ?? ""),
    line2: x.line2 ?? "",
    ward: x.ward ?? "",
    district: x.district ?? "",
    city: String(x.city ?? ""),
    region: x.region ?? "",
    country: String(x.country ?? "VN"),
    postalCode: x.postalCode ?? "",

    note: x.note ?? "",
    createdAt: String(x.createdAt ?? nowIso),
    updatedAt: String(x.updatedAt ?? nowIso),
  };
}

async function apiFetch<T>(url: string, siteId: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(siteId ? { "x-site-id": siteId } : {}),
      ...(init?.headers || {}),
    },
    signal: init?.signal,
  });

  const text = await res.text();
  let data: unknown = null;

  try {
    data = text ? (JSON.parse(text) as unknown) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && typeof data === "object" && data !== null && ("error" in data || "message" in data)
        ? String((data as { error?: unknown; message?: unknown }).error ?? (data as { message?: unknown }).message)
        : null) || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

function writeSiteIdCookie(siteId: string) {
  if (typeof document === "undefined") return;
  if (!siteId) return;
  // 30 days
  document.cookie = `siteId=${encodeURIComponent(siteId)}; Path=/; Max-Age=${60 * 60 * 24 * 30}; SameSite=Lax`;
}

export default function AddressesPage() {
  const searchParams = useSearchParams();
  const siteIdFromQuery = (searchParams.get("siteId") || "").trim();

  const [siteId, setSiteId] = useState<string>(() => siteIdFromQuery || readSiteIdFromLocalStorage());

  // Sync siteId theo query (nếu có). Không cần disable eslint.

  React.useEffect(() => {
    if (!siteIdFromQuery) return;
    setSiteId(siteIdFromQuery);
    writeSiteIdToLocalStorage(siteIdFromQuery);
    writeSiteIdCookie(siteIdFromQuery);
  }, [siteIdFromQuery]);

  React.useEffect(() => {
    if (!siteId) return;
    writeSiteIdToLocalStorage(siteId);
    writeSiteIdCookie(siteId);
  }, [siteId]);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const customerNameById = useMemo(() => {
    return customers.reduce<Record<string, string>>((acc, c) => {
      acc[c.id] = c.name;
      return acc;
    }, {});
  }, [customers]);

  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("ANY");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ANY");
  const [onlyDefault, setOnlyDefault] = useState(false);
  const [sort, setSort] = useState<SortOption>("UPDATED_AT");

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [active, setActive] = useState<Address | null>(null);

  const [createOpen, setCreateOpen] = useState(false);

  const [page, setPage] = useState(1);
  const pageSize = 8;

  // ===== Load customers + addresses =====
  React.useEffect(() => {
    const controller = new AbortController();

    (async () => {
      setApiError("");

      if (!siteId) {
        setApiError("MISSING_SITE");
        return;
      }

      setLoading(true);
      try {
        const [customersRes, addressesRes] = await Promise.all([
          apiFetch<CustomersGetResponse>("/api/admin/commerce/customers?take=100", siteId, {
            signal: controller.signal,
          }),
          apiFetch<ApiListResponse<AddressApiItem>>("/api/admin/commerce/customers/addresses", siteId, {
            signal: controller.signal,
          }),
        ]);

        const customersItems = extractItems<CustomerApiItem>(customersRes).map(normalizeCustomer);

        const nameMap = customersItems.reduce<Record<string, string>>((acc, c) => {
          acc[c.id] = c.name;
          return acc;
        }, {});

        const rawAddresses = extractItems<AddressApiItem>(addressesRes);
        const addressesNorm = rawAddresses.map((a) => normalizeAddressFromApi(a, nameMap));

        setCustomers(customersItems);
        setAddresses(addressesNorm);
      } catch (e: unknown) {
        if (controller.signal.aborted) return;
        setApiError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();

    return () => controller.abort();
  }, [siteId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = addresses.filter((a) => {
      const matchesQuery =
        !q ||
        a.label.toLowerCase().includes(q) ||
        a.customerName.toLowerCase().includes(q) ||
        a.customerId.toLowerCase().includes(q) ||
        a.receiverName.toLowerCase().includes(q) ||
        (a.phone || "").toLowerCase().includes(q) ||
        a.id.toLowerCase().includes(q) ||
        a.line1.toLowerCase().includes(q) ||
        (a.line2 || "").toLowerCase().includes(q) ||
        (a.district || "").toLowerCase().includes(q) ||
        a.city.toLowerCase().includes(q);

      const matchesType = typeFilter === "ANY" ? true : a.type === typeFilter;
      const matchesStatus = statusFilter === "ANY" ? true : a.status === statusFilter;
      const matchesDefault = !onlyDefault ? true : a.isDefault;

      return matchesQuery && matchesType && matchesStatus && matchesDefault;
    });

    list.sort((x, y) => {
      if (sort === "CUSTOMER") return x.customerName.localeCompare(y.customerName);
      if (sort === "CREATED_AT") return +new Date(y.createdAt) - +new Date(x.createdAt);
      return +new Date(y.updatedAt) - +new Date(x.updatedAt);
    });

    return list;
  }, [addresses, query, typeFilter, statusFilter, onlyDefault, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  React.useEffect(() => {
    // clamp page when filters change
    setPage((p) => Math.min(Math.max(1, p), pageCount));
  }, [pageCount]);

  function openDrawer(a: Address) {
    setActive(a);
    setDrawerOpen(true);
  }

  function toggleSelect(id: string, v: boolean) {
    setSelected((s) => ({ ...s, [id]: v }));
  }

  function toggleSelectAllOnPage(v: boolean) {
    setSelected((prev) => {
      const next = { ...prev };
      paged.forEach((a) => (next[a.id] = v));
      return next;
    });
  }

  function clearSelection() {
    setSelected({});
  }

  async function bulkSetStatus(nextStatus: AddressStatus) {
    if (!siteId) return;

    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([id]) => id);

    if (ids.length === 0) return;

    const nowIso = new Date().toISOString();
    setAddresses((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, status: nextStatus, updatedAt: nowIso } : a)));

    try {
      await Promise.all(
        ids.map((id) =>
          apiFetch<unknown>(`/api/admin/commerce/customers/addresses/${id}`, siteId, {
            method: "PATCH",
            body: JSON.stringify({ status: nextStatus }),
          }),
        ),
      );
      clearSelection();
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Bulk update failed");
    }
  }

  async function bulkDelete() {
    if (!siteId) return;

    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([id]) => id);

    if (ids.length === 0) return;

    setAddresses((prev) => prev.filter((a) => !ids.includes(a.id)));

    try {
      await Promise.all(
        ids.map((id) =>
          apiFetch<unknown>(`/api/admin/commerce/customers/addresses/${id}`, siteId, { method: "DELETE" }),
        ),
      );
      clearSelection();
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Bulk delete failed");
    }
  }

  async function setDefault(addressId: string) {
    if (!siteId) return;

    const target = addresses.find((a) => a.id === addressId);
    if (!target) return;

    const nowIso = new Date().toISOString();
    setAddresses((prev) =>
      prev.map((a) => {
        const sameBucket = a.customerId === target.customerId && a.type === target.type;
        if (!sameBucket) return a;
        return { ...a, isDefault: a.id === addressId, updatedAt: nowIso };
      }),
    );

    try {
      await apiFetch<unknown>(`/api/admin/commerce/customers/addresses/${addressId}`, siteId, {
        method: "PATCH",
        body: JSON.stringify({ isDefault: true }),
      });
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Set default failed");
    }
  }

  async function createAddress(payload: Omit<Address, "id" | "createdAt" | "updatedAt">) {
    if (!siteId) return;

    setApiError("");

    try {
      const created = await apiFetch<AddressApiItem>("/api/admin/commerce/customers/addresses", siteId, {
        method: "POST",
        body: JSON.stringify({
          customerId: payload.customerId,
          label: payload.label,
          type: payload.type,
          status: payload.status,
          isDefault: payload.isDefault,

          receiverName: payload.receiverName,
          phone: payload.phone || null,

          line1: payload.line1,
          line2: payload.line2 || null,
          ward: payload.ward || null,
          district: payload.district || null,
          city: payload.city,
          region: payload.region || null,
          country: payload.country,
          postalCode: payload.postalCode || null,

          note: payload.note || null,
        }),
      });

      const next = normalizeAddressFromApi(created, customerNameById);

      setAddresses((prev) => {
        if (next.isDefault) {
          return [next, ...prev].map((a) => {
            const sameBucket = a.customerId === next.customerId && a.type === next.type;
            if (!sameBucket) return a;
            return { ...a, isDefault: a.id === next.id };
          });
        }
        return [next, ...prev];
      });
    } catch (e: unknown) {
      setApiError(e instanceof Error ? e.message : "Create address failed");
      throw e;
    }
  }

  const stats = useMemo(() => {
    const total = addresses.length;
    const activeCount = addresses.filter((a) => a.status === "ACTIVE").length;
    const defaultCount = addresses.filter((a) => a.isDefault).length;
    const shipping = addresses.filter((a) => a.type === "SHIPPING").length;
    return { total, activeCount, defaultCount, shipping };
  }, [addresses]);

  const onChangeTypeFilter: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const v = e.target.value;
    if (isTypeFilter(v)) setTypeFilter(v);
  };
  const onChangeStatusFilter: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const v = e.target.value;
    if (isStatusFilter(v)) setStatusFilter(v);
  };
  const onChangeSort: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const v = e.target.value;
    if (isSortOption(v)) setSort(v);
  };

  return (
    <div className={styles.page}>
      {/* Header */}
      {!siteId ? (
        <div
          style={{
            marginBottom: 12,
            padding: 12,
            border: "1px solid #fda29b",
            borderRadius: 10,
            background: "#fffbfa",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 6, color: "#b42318" }}>Missing siteId</div>
          <div style={{ fontSize: 13, marginBottom: 10, color: "#7a271a" }}>
            API yêu cầu siteId. Hãy nhập siteId (hoặc mở trang với ?siteId=YOUR_SITE_ID).
          </div>

          <SiteIdGate initialValue={readSiteIdFromLocalStorage()} onSave={(next) => setSiteId(next)} />
        </div>
      ) : null}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Addresses</h1>
            <span className={styles.subtitle}>
              Manage shipping/billing addresses across customers
              {loading ? " • Loading…" : ""}
            </span>
          </div>

          {apiError ? (
            <div style={{ marginTop: 8, fontSize: 13, color: "#b42318" }}>
              <i className="bi bi-exclamation-triangle" /> {apiError}
            </div>
          ) : null}

          <div className={styles.kpis}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Total</span>
                <i className={`bi bi-geo-alt ${styles.kpiIcon}`} />
              </div>
              <div className={styles.kpiValue}>{stats.total}</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Active</span>
                <i className={`bi bi-check2-circle ${styles.kpiIcon}`} />
              </div>
              <div className={styles.kpiValue}>{stats.activeCount}</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Default</span>
                <i className={`bi bi-bookmark-star ${styles.kpiIcon}`} />
              </div>
              <div className={styles.kpiValue}>{stats.defaultCount}</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Shipping</span>
                <i className={`bi bi-truck ${styles.kpiIcon}`} />
              </div>
              <div className={styles.kpiValue}>{stats.shipping}</div>
            </div>
          </div>
        </div>

        <div className={styles.headerRight}>
          <button
            className={styles.secondaryBtn}
            type="button"
            onClick={() => alert("Export (mock) — connect API later")}
          >
            <i className="bi bi-download" />
            Export
          </button>
          <button className={styles.primaryBtn} type="button" onClick={() => setCreateOpen(true)} disabled={!siteId}>
            <i className="bi bi-plus-lg" />
            New address
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <i className={`bi bi-search ${styles.searchIcon}`} />
          <input
            className={styles.searchInput}
            placeholder="Search by customer, label, receiver, city, phone, ID…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {query ? (
            <button className={styles.clearBtn} type="button" onClick={() => setQuery("")} aria-label="Clear">
              <i className="bi bi-x-lg" />
            </button>
          ) : null}
        </div>

        <div className={styles.filters}>
          <div className={styles.selectWrap}>
            <i className={`bi bi-funnel ${styles.selectIcon}`} />
            <select className={styles.select} value={typeFilter} onChange={onChangeTypeFilter}>
              <option value="ANY">Type: Any</option>
              <option value="SHIPPING">Type: Shipping</option>
              <option value="BILLING">Type: Billing</option>
            </select>
          </div>

          <div className={styles.selectWrap}>
            <i className={`bi bi-activity ${styles.selectIcon}`} />
            <select className={styles.select} value={statusFilter} onChange={onChangeStatusFilter}>
              <option value="ANY">Status: Any</option>
              <option value="ACTIVE">Status: Active</option>
              <option value="INACTIVE">Status: Inactive</option>
            </select>
          </div>

          <label className={styles.checkPill}>
            <input type="checkbox" checked={onlyDefault} onChange={(e) => setOnlyDefault(e.target.checked)} />
            <span>
              <i className="bi bi-bookmark-star" /> Default only
            </span>
          </label>

          <div className={styles.selectWrap}>
            <i className={`bi bi-sort-down ${styles.selectIcon}`} />
            <select className={styles.select} value={sort} onChange={onChangeSort}>
              <option value="UPDATED_AT">Sort: Updated</option>
              <option value="CREATED_AT">Sort: Created</option>
              <option value="CUSTOMER">Sort: Customer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bulk bar */}
      {selectedCount > 0 ? (
        <div className={styles.bulkBar}>
          <div className={styles.bulkLeft}>
            <span className={styles.bulkPill}>
              <i className="bi bi-check2-square" />
              {selectedCount} selected
            </span>
            <button className={styles.bulkBtn} type="button" onClick={clearSelection}>
              Clear
            </button>
          </div>

          <div className={styles.bulkRight}>
            <div className={styles.bulkGroup}>
              <button
                className={styles.bulkBtn}
                type="button"
                onClick={() => bulkSetStatus("ACTIVE")}
                disabled={!siteId}
              >
                <i className="bi bi-check-circle" /> Set Active
              </button>
              <button
                className={styles.bulkBtn}
                type="button"
                onClick={() => bulkSetStatus("INACTIVE")}
                disabled={!siteId}
              >
                <i className="bi bi-dash-circle" /> Set Inactive
              </button>
            </div>

            <button
              className={`${styles.bulkBtn} ${styles.danger}`}
              type="button"
              onClick={bulkDelete}
              disabled={!siteId}
            >
              <i className="bi bi-trash3" /> Delete
            </button>
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHead}>
          <div className={styles.tableHeadLeft}>
            <span className={styles.tableTitle}>Address book</span>
            <span className={styles.tableMeta}>
              {filtered.length} result{filtered.length === 1 ? "" : "s"}
            </span>
          </div>

          <div className={styles.tableHeadRight}>
            <button
              className={styles.iconBtn}
              type="button"
              onClick={() => alert("Columns (mock) — add builder later")}
            >
              <i className="bi bi-layout-three-columns" />
            </button>
            <button className={styles.iconBtn} type="button" onClick={() => alert("Saved views (mock) — add later")}>
              <i className="bi bi-bookmarks" />
            </button>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.thCheck}>
                  <input
                    type="checkbox"
                    checked={paged.length > 0 && paged.every((a) => !!selected[a.id])}
                    onChange={(e) => toggleSelectAllOnPage(e.target.checked)}
                    aria-label="Select all on page"
                  />
                </th>
                <th>Address</th>
                <th>Customer</th>
                <th>Type</th>
                <th>Default</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Created</th>
                <th className={styles.thActions}></th>
              </tr>
            </thead>

            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyCell}>
                    <div className={styles.empty}>
                      <i className="bi bi-geo" />
                      <div className={styles.emptyTitle}>No addresses found</div>
                      <div className={styles.emptyHint}>Try adjusting your search or filters.</div>
                      <button
                        className={styles.primaryBtn}
                        type="button"
                        onClick={() => setCreateOpen(true)}
                        disabled={!siteId}
                      >
                        <i className="bi bi-plus-lg" /> Create address
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((a) => {
                  const tm = TYPE_META[a.type];
                  return (
                    <tr key={a.id} className={styles.tr} onDoubleClick={() => openDrawer(a)}>
                      <td className={styles.tdCheck} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={!!selected[a.id]}
                          onChange={(e) => toggleSelect(a.id, e.target.checked)}
                        />
                      </td>

                      <td className={styles.tdAddress} onClick={() => openDrawer(a)}>
                        <div className={styles.addressCell}>
                          <div className={styles.pin} aria-hidden="true">
                            <i className="bi bi-geo-alt" />
                          </div>
                          <div className={styles.addressInfo}>
                            <div className={styles.addressTop}>
                              <span className={styles.addressLabel}>{a.label}</span>
                              <span className={styles.muted}>•</span>
                              <span className={styles.mono}>{a.id}</span>
                            </div>
                            <div className={styles.addressSub}>
                              <span className={styles.muted}>
                                {a.line1}
                                {a.line2 ? `, ${a.line2}` : ""}, {a.district ? `${a.district}, ` : ""}
                                {a.city}
                              </span>
                            </div>
                            <div className={styles.addressMeta}>
                              <span className={styles.muted}>
                                Receiver: <b>{a.receiverName}</b>
                              </span>
                              {a.phone ? (
                                <>
                                  <span className={styles.dot}>•</span>
                                  <span className={styles.muted}>{a.phone}</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className={styles.customerCell}>
                          <span className={styles.customerName}>{a.customerName}</span>
                          <span className={styles.customerSub}>{a.customerId}</span>
                        </div>
                      </td>

                      <td>
                        <span className={styles.pill}>
                          <i className={`bi ${tm.icon}`} /> {tm.label}
                        </span>
                      </td>

                      <td>
                        {a.isDefault ? (
                          <span className={`${styles.badge} ${styles.badgeDefault}`}>
                            <i className="bi bi-bookmark-star" /> Default
                          </span>
                        ) : (
                          <button
                            className={styles.linkBtn}
                            type="button"
                            onClick={() => setDefault(a.id)}
                            disabled={!siteId}
                          >
                            Set default
                          </button>
                        )}
                      </td>

                      <td>
                        <span
                          className={`${styles.badge} ${a.status === "ACTIVE" ? styles.badgeActive : styles.badgeInactive}`}
                        >
                          <i className={`bi ${a.status === "ACTIVE" ? "bi-check-circle" : "bi-dash-circle"}`} />
                          {a.status === "ACTIVE" ? "Active" : "Inactive"}
                        </span>
                      </td>

                      <td>{fmtDate(a.updatedAt)}</td>
                      <td>{fmtDate(a.createdAt)}</td>

                      <td className={styles.tdActions} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.rowBtn} type="button" onClick={() => openDrawer(a)} title="View">
                          <i className="bi bi-chevron-right" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className={styles.pagination}>
          <div className={styles.paginationLeft}>
            <span className={styles.muted}>
              Page <b>{page}</b> / {pageCount}
            </span>
          </div>

          <div className={styles.paginationRight}>
            <button className={styles.pageBtn} type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              <i className="bi bi-chevron-left" />
              Prev
            </button>
            <button
              className={styles.pageBtn}
              type="button"
              disabled={page >= pageCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
              <i className="bi bi-chevron-right" />
            </button>
          </div>
        </div>
      </div>

      {/* Drawer */}
      <aside className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`} aria-hidden={!drawerOpen}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitle}>
            <i className="bi bi-geo-alt" />
            Address details
          </div>
          <button className={styles.iconBtn} type="button" onClick={() => setDrawerOpen(false)} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {active ? (
          <div className={styles.drawerBody}>
            <div className={styles.drawerCard}>
              <div className={styles.drawerTop}>
                <div className={styles.drawerPin} aria-hidden="true">
                  <i className="bi bi-geo-alt-fill" />
                </div>
                <div className={styles.drawerInfo}>
                  <div className={styles.drawerName}>
                    {active.label}{" "}
                    {active.isDefault ? (
                      <span className={styles.inlineDefault}>
                        <i className="bi bi-bookmark-star-fill" /> Default
                      </span>
                    ) : null}
                  </div>
                  <div className={styles.drawerMeta}>
                    <span className={styles.mono}>{active.id}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.muted}>
                      {active.customerName} ({active.customerId})
                    </span>
                  </div>
                </div>
              </div>

              <div className={styles.drawerGrid}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Type</div>
                  <div className={styles.fieldValue}>
                    <span className={styles.pill}>
                      <i className={`bi ${TYPE_META[active.type].icon}`} /> {TYPE_META[active.type].label}
                    </span>
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Status</div>
                  <div className={styles.fieldValue}>
                    <span
                      className={`${styles.badge} ${active.status === "ACTIVE" ? styles.badgeActive : styles.badgeInactive}`}
                    >
                      <i className={`bi ${active.status === "ACTIVE" ? "bi-check-circle" : "bi-dash-circle"}`} />
                      {active.status === "ACTIVE" ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Receiver</div>
                  <div className={styles.fieldValue}>{active.receiverName}</div>
                </div>

                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Phone</div>
                  <div className={styles.fieldValue}>{active.phone || "—"}</div>
                </div>

                <div className={styles.fieldWide}>
                  <div className={styles.fieldLabel}>Full address</div>
                  <div className={styles.fieldValue}>
                    {active.line1}
                    {active.line2 ? `, ${active.line2}` : ""}
                    {active.ward ? `, ${active.ward}` : ""}
                    {active.district ? `, ${active.district}` : ""}, {active.city}
                    {active.region ? `, ${active.region}` : ""}, {active.country}
                    {active.postalCode ? ` (${active.postalCode})` : ""}
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Updated</div>
                  <div className={styles.fieldValue}>{fmtDate(active.updatedAt)}</div>
                </div>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Created</div>
                  <div className={styles.fieldValue}>{fmtDate(active.createdAt)}</div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <i className="bi bi-journal-text" /> Notes
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.noteBox}>{active.note || "—"}</div>
                </div>
              </div>

              <div className={styles.drawerActions}>
                {!active.isDefault ? (
                  <button
                    className={styles.secondaryBtn}
                    type="button"
                    onClick={() => setDefault(active.id)}
                    disabled={!siteId}
                  >
                    <i className="bi bi-bookmark-star" /> Set default
                  </button>
                ) : null}
                <button
                  className={styles.secondaryBtn}
                  type="button"
                  onClick={() => alert("Open customer (mock) — route later")}
                >
                  <i className="bi bi-box-arrow-up-right" />
                  Open customer
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.drawerBody}>
            <div className={styles.muted}>Select an address…</div>
          </div>
        )}
      </aside>

      {drawerOpen ? (
        <button className={styles.backdrop} onClick={() => setDrawerOpen(false)} aria-label="Close drawer" />
      ) : null}

      {createOpen ? (
        <CreateAddressModal
          customers={customers}
          loadingCustomers={loading && customers.length === 0}
          onClose={() => setCreateOpen(false)}
          onCreate={async (payload) => {
            await createAddress(payload);
            setCreateOpen(false);
          }}
        />
      ) : null}
    </div>
  );
}

function CreateAddressModal({
  customers,
  loadingCustomers,
  onClose,
  onCreate,
}: {
  customers: Customer[];
  loadingCustomers: boolean;
  onClose: () => void;
  onCreate: (payload: Omit<Address, "id" | "createdAt" | "updatedAt">) => Promise<void> | void;
}) {
  const [customerId, setCustomerId] = useState<string>(() => customers[0]?.id ?? "");
  const customerName = customers.find((c) => c.id === customerId)?.name ?? "";

  const [label, setLabel] = useState("Home");
  const [type, setType] = useState<AddressType>("SHIPPING");
  const [status, setStatus] = useState<AddressStatus>("ACTIVE");
  const [isDefault, setIsDefault] = useState(true);

  // receiverName: chỉ auto-fill khi user chưa “chạm” vào field
  const [receiverName, setReceiverName] = useState(customerName);
  const [receiverTouched, setReceiverTouched] = useState(false);

  const [phone, setPhone] = useState("");

  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [ward, setWard] = useState("");
  const [district, setDistrict] = useState("");
  const [city, setCity] = useState("TP. Hồ Chí Minh");
  const [country, setCountry] = useState("VN");
  const [postalCode, setPostalCode] = useState("");
  const [note, setNote] = useState("");

  const [saving, setSaving] = useState(false);

  // Nếu customers load xong mà customerId đang rỗng -> set default customer đầu
  React.useEffect(() => {
    if (customerId) return;
    if (customers.length === 0) return;
    setCustomerId(customers[0].id);
  }, [customerId, customers]);

  // Sync receiverName khi customer đổi, nhưng không đè nếu user đã sửa
  React.useEffect(() => {
    if (receiverTouched) return;
    setReceiverName(customerName);
  }, [customerName, receiverTouched]);

  const onChangeType: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const v = e.target.value;
    if (isAddressType(v)) setType(v);
  };

  const onChangeStatus: React.ChangeEventHandler<HTMLSelectElement> = (e) => {
    const v = e.target.value;
    if (isAddressStatus(v)) setStatus(v);
  };

  const canSave =
    customerId &&
    receiverName.trim().length >= 2 &&
    line1.trim().length >= 3 &&
    city.trim().length >= 2 &&
    country.trim().length >= 2 &&
    !saving;

  return (
    <div className={styles.modalRoot} role="dialog" aria-modal="true">
      <button className={styles.modalBackdrop} onClick={onClose} aria-label="Close modal" />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <i className="bi bi-geo-alt" /> New address
          </div>
          <button className={styles.iconBtn} type="button" onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              <span className={styles.labelText}>Customer</span>
              <div className={styles.selectWrap}>
                <i className={`bi bi-person ${styles.selectIcon}`} />
                <select
                  className={styles.select}
                  value={customerId}
                  disabled={loadingCustomers || customers.length === 0}
                  onChange={(e) => {
                    setCustomerId(e.target.value);
                    // đổi customer thì cho phép auto-fill lại receiver nếu user chưa gõ
                    setReceiverTouched(false);
                  }}
                >
                  {loadingCustomers ? <option value="">Loading customers…</option> : null}
                  {!loadingCustomers && customers.length === 0 ? <option value="">No customers</option> : null}
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id})
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Label</span>
              <input className={styles.input} value={label} onChange={(e) => setLabel(e.target.value)} />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Type</span>
              <div className={styles.selectWrap}>
                <i className={`bi bi-diagram-2 ${styles.selectIcon}`} />
                <select className={styles.select} value={type} onChange={onChangeType}>
                  <option value="SHIPPING">Shipping</option>
                  <option value="BILLING">Billing</option>
                </select>
              </div>
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Status</span>
              <div className={styles.selectWrap}>
                <i className={`bi bi-activity ${styles.selectIcon}`} />
                <select className={styles.select} value={status} onChange={onChangeStatus}>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </label>
          </div>

          <label className={styles.checkPill}>
            <input type="checkbox" checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            <span>
              <i className="bi bi-bookmark-star" /> Set as default (per customer + type)
            </span>
          </label>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <i className="bi bi-person-badge" /> Receiver
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.formGrid}>
                <label className={styles.label}>
                  <span className={styles.labelText}>Receiver name</span>
                  <input
                    className={styles.input}
                    value={receiverName}
                    onChange={(e) => {
                      setReceiverName(e.target.value);
                      setReceiverTouched(true);
                    }}
                  />
                </label>

                <label className={styles.label}>
                  <span className={styles.labelText}>Phone</span>
                  <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} />
                </label>
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <i className="bi bi-map" /> Address lines
            </div>
            <div className={styles.sectionBody}>
              <div className={styles.formGrid}>
                <label className={styles.label}>
                  <span className={styles.labelText}>Line 1</span>
                  <input className={styles.input} value={line1} onChange={(e) => setLine1(e.target.value)} />
                </label>

                <label className={styles.label}>
                  <span className={styles.labelText}>Line 2</span>
                  <input className={styles.input} value={line2} onChange={(e) => setLine2(e.target.value)} />
                </label>

                <label className={styles.label}>
                  <span className={styles.labelText}>Ward</span>
                  <input className={styles.input} value={ward} onChange={(e) => setWard(e.target.value)} />
                </label>

                <label className={styles.label}>
                  <span className={styles.labelText}>District</span>
                  <input className={styles.input} value={district} onChange={(e) => setDistrict(e.target.value)} />
                </label>

                <label className={styles.label}>
                  <span className={styles.labelText}>City</span>
                  <input className={styles.input} value={city} onChange={(e) => setCity(e.target.value)} />
                </label>

                <label className={styles.label}>
                  <span className={styles.labelText}>Country</span>
                  <input className={styles.input} value={country} onChange={(e) => setCountry(e.target.value)} />
                </label>

                <label className={styles.label}>
                  <span className={styles.labelText}>Postal code</span>
                  <input className={styles.input} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
                </label>
              </div>
            </div>
          </div>

          <label className={styles.label}>
            <span className={styles.labelText}>Notes</span>
            <textarea className={styles.textarea} value={note} onChange={(e) => setNote(e.target.value)} />
          </label>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.secondaryBtn} type="button" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className={styles.primaryBtn}
            type="button"
            disabled={!canSave}
            onClick={async () => {
              setSaving(true);
              try {
                await onCreate({
                  customerId,
                  customerName,
                  label: label.trim(),
                  type,
                  status,
                  isDefault,
                  receiverName: receiverName.trim(),
                  phone: phone.trim(),
                  line1: line1.trim(),
                  line2: line2.trim(),
                  ward: ward.trim(),
                  district: district.trim(),
                  city: city.trim(),
                  region: "",
                  country: country.trim(),
                  postalCode: postalCode.trim(),
                  note: note.trim(),
                });
              } finally {
                setSaving(false);
              }
            }}
          >
            <i className="bi bi-check2" />
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function SiteIdGate({ initialValue, onSave }: { initialValue: string; onSave: (siteId: string) => void }) {
  const [val, setVal] = useState(initialValue);
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Enter siteId (e.g. site_xxx)"
        style={{
          flex: 1,
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #d0d5dd",
          fontSize: 14,
        }}
      />
      <button
        type="button"
        onClick={() => {
          const next = val.trim();
          if (!next) return;
          writeSiteIdToLocalStorage(next);
          writeSiteIdCookie(next);
          onSave(next);
        }}
        style={{
          padding: "10px 12px",
          borderRadius: 10,
          border: "1px solid #d0d5dd",
          background: "white",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        Save
      </button>
    </div>
  );
}
