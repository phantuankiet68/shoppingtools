"use client";

import React, { useMemo, useState } from "react";
import styles from "@/styles/admin/customers/addresses/addresses.module.css";

type AddressStatus = "ACTIVE" | "INACTIVE";
type AddressType = "SHIPPING" | "BILLING";

type Address = {
  id: string;
  customerId: string;
  customerName: string;
  label: string; // e.g. "Home", "Office"
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
  createdAt: string; // ISO
  updatedAt: string; // ISO
};

type ApiListResponse = { items: any[]; total?: number; page?: number; limit?: number } | { data: any[] } | any;

const seed: Address[] = [
  {
    id: "addr_2001",
    customerId: "cus_1001",
    customerName: "Nguyễn Minh Anh",
    label: "Home",
    type: "SHIPPING",
    status: "ACTIVE",
    isDefault: true,
    receiverName: "Nguyễn Minh Anh",
    phone: "0901 234 567",
    line1: "12 Nguyễn Huệ",
    line2: "Tầng 6, Căn 602",
    ward: "Bến Nghé",
    district: "Quận 1",
    city: "TP. Hồ Chí Minh",
    country: "VN",
    postalCode: "700000",
    note: "Gọi trước 15 phút.",
    createdAt: "2025-11-15T03:10:00Z",
    updatedAt: "2026-01-10T08:30:00Z",
  },
  {
    id: "addr_2002",
    customerId: "cus_1002",
    customerName: "Trần Quốc Huy",
    label: "Office",
    type: "BILLING",
    status: "ACTIVE",
    isDefault: true,
    receiverName: "Trần Quốc Huy",
    phone: "0988 111 222",
    line1: "88 Lý Thường Kiệt",
    district: "Hoàn Kiếm",
    city: "Hà Nội",
    country: "VN",
    createdAt: "2025-10-02T02:00:00Z",
    updatedAt: "2025-12-28T10:00:00Z",
  },
  {
    id: "addr_2003",
    customerId: "cus_1004",
    customerName: "Phạm Nhật Long",
    label: "Home",
    type: "SHIPPING",
    status: "ACTIVE",
    isDefault: false,
    receiverName: "Phạm Nhật Long",
    phone: "0912 999 333",
    line1: "23 Trần Hưng Đạo",
    district: "Hải Châu",
    city: "Đà Nẵng",
    country: "VN",
    createdAt: "2025-11-20T07:40:00Z",
    updatedAt: "2026-01-12T13:40:00Z",
  },
  {
    id: "addr_2004",
    customerId: "cus_1005",
    customerName: "Vũ Gia Hân",
    label: "Parents",
    type: "SHIPPING",
    status: "INACTIVE",
    isDefault: false,
    receiverName: "Vũ Gia Hân",
    phone: "",
    line1: "5 Nguyễn Trãi",
    district: "Ninh Kiều",
    city: "Cần Thơ",
    country: "VN",
    note: "Không giao cuối tuần.",
    createdAt: "2025-09-09T07:00:00Z",
    updatedAt: "2025-10-01T02:10:00Z",
  },
];

function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(d);
}

function typeMeta(t: AddressType) {
  return t === "SHIPPING" ? { label: "Shipping", icon: "bi-truck" } : { label: "Billing", icon: "bi-receipt" };
}

/** Normalize response item -> Address UI type */
function normalizeFromApi(x: any): Address {
  // Support several shapes:
  // 1) API already returns customerName
  // 2) API returns { customer: { name } }
  const customerName = x.customerName ?? x.customer?.name ?? "—";

  return {
    id: String(x.id),
    customerId: String(x.customerId ?? x.customer?.id ?? ""),
    customerName: String(customerName),

    label: String(x.label ?? ""),
    type: (x.type ?? "SHIPPING") as AddressType,
    status: (x.status ?? "ACTIVE") as AddressStatus,
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
    createdAt: String(x.createdAt ?? new Date().toISOString()),
    updatedAt: String(x.updatedAt ?? new Date().toISOString()),
  };
}

async function apiFetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

  // Try parse JSON even on error
  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg = (data && (data.error || data.message)) || `Request failed (${res.status})`;
    throw new Error(msg);
  }

  return data as T;
}

export default function AddressesPage() {
  const [addresses, setAddresses] = useState<Address[]>(seed);

  // api state
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  // toolbar
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"ANY" | AddressType>("ANY");
  const [statusFilter, setStatusFilter] = useState<"ANY" | AddressStatus>("ANY");
  const [onlyDefault, setOnlyDefault] = useState(false);
  const [sort, setSort] = useState<"UPDATED_AT" | "CREATED_AT" | "CUSTOMER">("UPDATED_AT");

  // selection
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  // drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [active, setActive] = useState<Address | null>(null);

  // modal create
  const [createOpen, setCreateOpen] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // ========= API LOAD =========
  React.useEffect(() => {
    let mounted = true;

    (async () => {
      setLoading(true);
      setApiError("");
      try {
        const data = await apiFetch<ApiListResponse>("/api/admin/addresses");

        // Accept: {items: []} OR {data: []} OR [] directly
        const rawItems: any[] = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : Array.isArray(data?.data) ? data.data : [];

        const normalized = rawItems.map(normalizeFromApi);

        if (mounted) {
          setAddresses(normalized);
        }
      } catch (e: any) {
        if (mounted) {
          setApiError(e?.message || "Failed to load addresses");
          // keep seed as fallback
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  // ========= Derived UI =========
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = addresses.filter((a) => {
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
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);

  React.useEffect(() => {
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
    const next = { ...selected };
    paged.forEach((a) => (next[a.id] = v));
    setSelected(next);
  }

  function clearSelection() {
    setSelected({});
  }

  // ========= API actions =========

  async function bulkSetStatus(nextStatus: AddressStatus) {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([id]) => id);

    if (ids.length === 0) return;

    // optimistic UI
    setAddresses((prev) => prev.map((a) => (ids.includes(a.id) ? { ...a, status: nextStatus, updatedAt: new Date().toISOString() } : a)));

    try {
      await Promise.all(
        ids.map((id) =>
          apiFetch(`/api/admin/addresses/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ status: nextStatus }),
          }),
        ),
      );
      clearSelection();
    } catch (e: any) {
      setApiError(e?.message || "Bulk update failed");
      // (optional) reload from server
    }
  }

  async function bulkDelete() {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([id]) => id);

    if (ids.length === 0) return;

    // optimistic UI
    setAddresses((prev) => prev.filter((a) => !ids.includes(a.id)));

    try {
      await Promise.all(ids.map((id) => apiFetch(`/api/admin/addresses/${id}`, { method: "DELETE" })));
      clearSelection();
    } catch (e: any) {
      setApiError(e?.message || "Bulk delete failed");
      // (optional) reload from server
    }
  }

  async function setDefault(addressId: string) {
    const target = addresses.find((a) => a.id === addressId);
    if (!target) return;

    // optimistic UI: default unique per customer+type
    setAddresses((prev) =>
      prev.map((a) => {
        const sameBucket = a.customerId === target.customerId && a.type === target.type;
        if (!sameBucket) return a;
        return {
          ...a,
          isDefault: a.id === addressId,
          updatedAt: new Date().toISOString(),
        };
      }),
    );

    try {
      await apiFetch(`/api/admin/addresses/${addressId}`, {
        method: "PATCH",
        body: JSON.stringify({ isDefault: true }),
      });
    } catch (e: any) {
      setApiError(e?.message || "Set default failed");
      // (optional) reload from server
    }
  }

  async function createAddress(payload: Omit<Address, "id" | "createdAt" | "updatedAt">) {
    setApiError("");
    try {
      const created = await apiFetch<any>("/api/admin/addresses", {
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

      const next = normalizeFromApi(created);

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
    } catch (e: any) {
      setApiError(e?.message || "Create address failed");
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

  return (
    <div className={styles.page}>
      {/* Header */}
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
          <button className={styles.secondaryBtn} type="button" onClick={() => alert("Export (mock) — connect API later")}>
            <i className="bi bi-download" />
            Export
          </button>
          <button className={styles.primaryBtn} type="button" onClick={() => setCreateOpen(true)}>
            <i className="bi bi-plus-lg" />
            New address
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <i className={`bi bi-search ${styles.searchIcon}`} />
          <input className={styles.searchInput} placeholder="Search by customer, label, receiver, city, phone, ID…" value={query} onChange={(e) => setQuery(e.target.value)} />
          {query ? (
            <button className={styles.clearBtn} type="button" onClick={() => setQuery("")} aria-label="Clear">
              <i className="bi bi-x-lg" />
            </button>
          ) : null}
        </div>

        <div className={styles.filters}>
          <div className={styles.selectWrap}>
            <i className={`bi bi-funnel ${styles.selectIcon}`} />
            <select className={styles.select} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
              <option value="ANY">Type: Any</option>
              <option value="SHIPPING">Type: Shipping</option>
              <option value="BILLING">Type: Billing</option>
            </select>
          </div>

          <div className={styles.selectWrap}>
            <i className={`bi bi-activity ${styles.selectIcon}`} />
            <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
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
            <select className={styles.select} value={sort} onChange={(e) => setSort(e.target.value as any)}>
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
              <button className={styles.bulkBtn} type="button" onClick={() => bulkSetStatus("ACTIVE")}>
                <i className="bi bi-check-circle" /> Set Active
              </button>
              <button className={styles.bulkBtn} type="button" onClick={() => bulkSetStatus("INACTIVE")}>
                <i className="bi bi-dash-circle" /> Set Inactive
              </button>
            </div>

            <button className={`${styles.bulkBtn} ${styles.danger}`} type="button" onClick={bulkDelete}>
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
            <button className={styles.iconBtn} type="button" onClick={() => alert("Columns (mock) — add builder later")}>
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
                  <input type="checkbox" checked={paged.length > 0 && paged.every((a) => !!selected[a.id])} onChange={(e) => toggleSelectAllOnPage(e.target.checked)} aria-label="Select all on page" />
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
                      <button className={styles.primaryBtn} type="button" onClick={() => setCreateOpen(true)}>
                        <i className="bi bi-plus-lg" /> Create address
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((a) => {
                  const tm = typeMeta(a.type);
                  return (
                    <tr key={a.id} className={styles.tr} onDoubleClick={() => openDrawer(a)}>
                      <td className={styles.tdCheck} onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={!!selected[a.id]} onChange={(e) => toggleSelect(a.id, e.target.checked)} />
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
                          <button className={styles.linkBtn} type="button" onClick={() => setDefault(a.id)}>
                            Set default
                          </button>
                        )}
                      </td>

                      <td>
                        <span className={`${styles.badge} ${a.status === "ACTIVE" ? styles.badgeActive : styles.badgeInactive}`}>
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
            <button className={styles.pageBtn} type="button" disabled={page >= pageCount} onClick={() => setPage((p) => p + 1)}>
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
                      <i className={`bi ${typeMeta(active.type).icon}`} /> {typeMeta(active.type).label}
                    </span>
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Status</div>
                  <div className={styles.fieldValue}>
                    <span className={`${styles.badge} ${active.status === "ACTIVE" ? styles.badgeActive : styles.badgeInactive}`}>
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
                  <button className={styles.secondaryBtn} type="button" onClick={() => setDefault(active.id)}>
                    <i className="bi bi-bookmark-star" /> Set default
                  </button>
                ) : null}
                <button className={styles.secondaryBtn} type="button" onClick={() => alert("Open customer (mock) — route later")}>
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

      {drawerOpen ? <button className={styles.backdrop} onClick={() => setDrawerOpen(false)} aria-label="Close drawer" /> : null}

      {/* Create Modal */}
      {createOpen ? (
        <CreateAddressModal
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

function CreateAddressModal({ onClose, onCreate }: { onClose: () => void; onCreate: (payload: Omit<Address, "id" | "createdAt" | "updatedAt">) => Promise<void> | void }) {
  // Minimal “customer select” mock (in real app load from DB)
  const customers = [
    { id: "cus_1001", name: "Nguyễn Minh Anh" },
    { id: "cus_1002", name: "Trần Quốc Huy" },
    { id: "cus_1004", name: "Phạm Nhật Long" },
    { id: "cus_1005", name: "Vũ Gia Hân" },
  ];

  const [customerId, setCustomerId] = useState(customers[0]?.id || "");
  const customerName = customers.find((c) => c.id === customerId)?.name || "";

  const [label, setLabel] = useState("Home");
  const [type, setType] = useState<AddressType>("SHIPPING");
  const [status, setStatus] = useState<AddressStatus>("ACTIVE");
  const [isDefault, setIsDefault] = useState(true);

  const [receiverName, setReceiverName] = useState(customerName);
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

  React.useEffect(() => {
    setReceiverName(customerName);
  }, [customerName]);

  const canSave = customerId && receiverName.trim().length >= 2 && line1.trim().length >= 3 && city.trim().length >= 2 && country.trim().length >= 2 && !saving;

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
                <select className={styles.select} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
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
              <input className={styles.input} value={label} onChange={(e) => setLabel(e.target.value)} placeholder="Home / Office / Warehouse..." />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Type</span>
              <div className={styles.selectWrap}>
                <i className={`bi bi-diagram-2 ${styles.selectIcon}`} />
                <select className={styles.select} value={type} onChange={(e) => setType(e.target.value as AddressType)}>
                  <option value="SHIPPING">Shipping</option>
                  <option value="BILLING">Billing</option>
                </select>
              </div>
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Status</span>
              <div className={styles.selectWrap}>
                <i className={`bi bi-activity ${styles.selectIcon}`} />
                <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value as AddressStatus)}>
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
                  <input className={styles.input} value={receiverName} onChange={(e) => setReceiverName(e.target.value)} />
                </label>
                <label className={styles.label}>
                  <span className={styles.labelText}>Phone</span>
                  <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
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
                  <input className={styles.input} value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Street, building..." />
                </label>
                <label className={styles.label}>
                  <span className={styles.labelText}>Line 2</span>
                  <input className={styles.input} value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Apt, floor (optional)" />
                </label>
                <label className={styles.label}>
                  <span className={styles.labelText}>Ward</span>
                  <input className={styles.input} value={ward} onChange={(e) => setWard(e.target.value)} placeholder="Optional" />
                </label>
                <label className={styles.label}>
                  <span className={styles.labelText}>District</span>
                  <input className={styles.input} value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="Optional" />
                </label>
                <label className={styles.label}>
                  <span className={styles.labelText}>City</span>
                  <input className={styles.input} value={city} onChange={(e) => setCity(e.target.value)} />
                </label>
                <label className={styles.label}>
                  <span className={styles.labelText}>Country</span>
                  <input className={styles.input} value={country} onChange={(e) => setCountry(e.target.value)} placeholder="VN" />
                </label>
                <label className={styles.label}>
                  <span className={styles.labelText}>Postal code</span>
                  <input className={styles.input} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="Optional" />
                </label>
              </div>
            </div>
          </div>

          <label className={styles.label}>
            <span className={styles.labelText}>Notes</span>
            <textarea className={styles.textarea} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal notes (optional)..." />
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
            }}>
            <i className="bi bi-check2" />
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
