"use client";

import React, { useMemo, useState } from "react";
import styles from "@/styles/admin/customers/customers.module.css";

type CustomerStatus = "ACTIVE" | "INACTIVE" | "VIP";

type ApiCustomerRow = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  tags: string | null; // stored as comma string or json string (we parse gently)
  notes: string | null;
  isActive: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  _count?: { orders?: number };
};

type ApiListResp = {
  data: ApiCustomerRow[];
  nextCursor: string | null;
  stats?: { total?: number; active?: number };
};

type ApiDetailResp = {
  data: {
    customer: ApiCustomerRow;
    stats?: {
      totalOrders?: number;
      totalSpentCents?: number;
      lastOrderAt?: string | null;
    };
    recentOrders?: any[];
  };
};

type Customer = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  status: CustomerStatus;
  tags: string[];
  orders: number;
  totalSpent: number; // USD (mocked if you only store cents in Order currency)
  lastOrderAt?: string; // ISO
  createdAt: string; // ISO
  note?: string;
};

function fmtMoney(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
function fmtDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium" }).format(d);
}

const statusMeta: Record<CustomerStatus, { label: string; icon: string }> = {
  ACTIVE: { label: "Active", icon: "bi-check-circle" },
  INACTIVE: { label: "Inactive", icon: "bi-dash-circle" },
  VIP: { label: "VIP", icon: "bi-stars" },
};

function parseTags(input: string | null | undefined): string[] {
  if (!input) return [];
  const s = input.trim();
  if (!s) return [];
  // supports:
  // - "a,b,c"
  // - '["a","b"]'
  try {
    if (s.startsWith("[") && s.endsWith("]")) {
      const arr = JSON.parse(s);
      if (Array.isArray(arr)) return arr.map((x) => String(x)).filter(Boolean);
    }
  } catch {}
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function serializeTags(tags: string[]) {
  // keep it simple: comma-separated
  return tags
    .map((t) => t.trim())
    .filter(Boolean)
    .join(",");
}

function toCustomerStatus(row: ApiCustomerRow): CustomerStatus {
  const tags = parseTags(row.tags);
  const isVip = tags.some((t) => t.toLowerCase() === "vip");
  if (isVip) return "VIP";
  return row.isActive ? "ACTIVE" : "INACTIVE";
}

function mapRowToUI(row: ApiCustomerRow, detail?: ApiDetailResp["data"]): Customer {
  const tags = parseTags(row.tags);
  const orders = row._count?.orders ?? detail?.stats?.totalOrders ?? 0;

  // If you want real totalSpent: you need currency conversion; for now:
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

async function safeJson(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    // This prevents: Unexpected token '<' (HTML error page)
    throw new Error(`API_NOT_JSON (${res.status}) ${text.slice(0, 120)}`);
  }
}

async function apiListCustomers(params: { q?: string; isActive?: "true" | "false"; cursor?: string; take?: number }) {
  const url = new URL("/api/admin/customers", window.location.origin);
  if (params.q) url.searchParams.set("q", params.q);
  if (params.isActive) url.searchParams.set("isActive", params.isActive);
  if (params.cursor) url.searchParams.set("cursor", params.cursor);
  url.searchParams.set("take", String(params.take ?? 20));

  const res = await fetch(url.toString(), { method: "GET" });
  const json = (await safeJson(res)) as ApiListResp | { error?: string };
  if (!res.ok) throw new Error((json as any)?.error || `HTTP_${res.status}`);
  return json as ApiListResp;
}

async function apiCreateCustomer(body: { name: string; email?: string; phone?: string; tags?: string; notes?: string; isActive?: boolean }) {
  const res = await fetch("/api/admin/customers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await safeJson(res);
  if (!res.ok) throw new Error(json?.error || `HTTP_${res.status}`);
  return json?.data as ApiCustomerRow;
}

async function apiPatchCustomer(id: string, body: any) {
  const res = await fetch(`/api/admin/customers/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await safeJson(res);
  if (!res.ok) throw new Error(json?.error || `HTTP_${res.status}`);
  return json?.data as ApiCustomerRow;
}

async function apiDeleteCustomer(id: string) {
  const res = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
  const json = await safeJson(res);
  if (!res.ok) throw new Error(json?.error || `HTTP_${res.status}`);
  return json?.data as { id: string; isActive: boolean; updatedAt: string };
}

async function apiGetCustomerDetail(id: string) {
  const res = await fetch(`/api/admin/customers/${id}`, { method: "GET" });
  const json = await safeJson(res);
  if (!res.ok) throw new Error(json?.error || `HTTP_${res.status}`);
  return json as ApiDetailResp;
}

export default function CustomersPage() {
  // UI state
  const [query, setQuery] = useState("");
  const [segment, setSegment] = useState<"ALL" | CustomerStatus>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ANY" | CustomerStatus>("ANY");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [sort, setSort] = useState<"LAST_ORDER" | "TOTAL_SPENT" | "CREATED_AT">("LAST_ORDER");

  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);

  // Server data
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allTagsServer, setAllTagsServer] = useState<string[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [statsServer, setStatsServer] = useState<{ total?: number; active?: number } | null>(null);

  // Pagination (client paging over loaded items) - keep your UI
  const [page, setPage] = useState(1);
  const pageSize = 8;

  // Initial load + refetch on query/status changes (debounced-ish with a small delay)
  React.useEffect(() => {
    let alive = true;
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setErr(null);

        // Map your UI filters -> API params
        // - segment/statusFilter => isActive or tag vip
        // We can't filter VIP on server unless you add it in API, so we do VIP filtering client-side.
        const isActive = segment === "ACTIVE" || statusFilter === "ACTIVE" ? "true" : segment === "INACTIVE" || statusFilter === "INACTIVE" ? "false" : undefined;

        const resp = await apiListCustomers({ q: query.trim() || undefined, isActive, take: 50 });

        if (!alive) return;

        const uiRows = resp.data.map((r) => mapRowToUI(r));
        setCustomers(uiRows);
        setNextCursor(resp.nextCursor);
        setStatsServer(resp.stats || null);

        // tags pool from data
        const s = new Set<string>();
        uiRows.forEach((c) => c.tags.forEach((t) => s.add(t)));
        setAllTagsServer(Array.from(s).sort());

        setPage(1);
        setSelected({});
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.message || "LOAD_FAILED");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    }, 250);

    return () => {
      alive = false;
      clearTimeout(t);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, segment, statusFilter]);

  const allTags = useMemo(() => {
    // keep local known tags for modal picker
    const s = new Set<string>(allTagsServer);
    customers.forEach((c) => c.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [allTagsServer, customers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    let list = customers.filter((c) => {
      const matchesQuery = !q || c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone || "").toLowerCase().includes(q) || c.id.toLowerCase().includes(q);

      const matchesSegment = segment === "ALL" ? true : c.status === segment;
      const matchesStatus = statusFilter === "ANY" ? true : c.status === statusFilter;
      const matchesTag = !tagFilter ? true : c.tags.includes(tagFilter);

      return matchesQuery && matchesSegment && matchesStatus && matchesTag;
    });

    list.sort((a, b) => {
      if (sort === "TOTAL_SPENT") return b.totalSpent - a.totalSpent;
      if (sort === "CREATED_AT") return +new Date(b.createdAt) - +new Date(a.createdAt);
      return +new Date(b.lastOrderAt || 0) - +new Date(a.lastOrderAt || 0);
    });

    return list;
  }, [customers, query, segment, statusFilter, tagFilter, sort]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paged = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page]);

  React.useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), pageCount));
  }, [pageCount]);

  function toggleSelect(id: string, v: boolean) {
    setSelected((s) => ({ ...s, [id]: v }));
  }
  function toggleSelectAllOnPage(v: boolean) {
    const next = { ...selected };
    paged.forEach((c) => {
      next[c.id] = v;
    });
    setSelected(next);
  }

  async function openDrawer(c: Customer) {
    setActiveCustomer(c);
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      const detail = await apiGetCustomerDetail(c.id);
      const updated = mapRowToUI(detail.data.customer, detail.data);
      setActiveCustomer(updated);

      // also update in list (so lastOrder/totalSpent refresh)
      setCustomers((prev) => prev.map((x) => (x.id === c.id ? { ...x, ...updated } : x)));
    } catch (e) {
      // keep drawer with basic info
    } finally {
      setDrawerLoading(false);
    }
  }

  function bulkClearSelection() {
    setSelected({});
  }

  async function bulkSetStatus(nextStatus: CustomerStatus) {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([id]) => id);

    if (ids.length === 0) return;

    try {
      setLoading(true);
      setErr(null);

      // status mapping:
      // - ACTIVE => isActive=true, remove vip tag
      // - INACTIVE => isActive=false
      // - VIP => isActive=true + add vip tag
      await Promise.all(
        ids.map(async (id) => {
          const current = customers.find((x) => x.id === id);
          const curTags = current?.tags ?? [];
          const lower = curTags.map((t) => t.toLowerCase());

          if (nextStatus === "ACTIVE") {
            const nextTags = curTags.filter((t) => t.toLowerCase() !== "vip");
            await apiPatchCustomer(id, { isActive: true, tags: serializeTags(nextTags) });
          } else if (nextStatus === "INACTIVE") {
            await apiPatchCustomer(id, { isActive: false });
          } else {
            // VIP
            const nextTags = lower.includes("vip") ? curTags : [...curTags, "vip"];
            await apiPatchCustomer(id, { isActive: true, tags: serializeTags(nextTags) });
          }
        }),
      );

      // optimistic update UI
      setCustomers((prev) =>
        prev.map((c) => {
          if (!ids.includes(c.id)) return c;
          if (nextStatus === "ACTIVE") return { ...c, status: "ACTIVE", tags: c.tags.filter((t) => t.toLowerCase() !== "vip") };
          if (nextStatus === "INACTIVE") return { ...c, status: "INACTIVE" };
          // VIP
          return { ...c, status: "VIP", tags: c.tags.some((t) => t.toLowerCase() === "vip") ? c.tags : [...c.tags, "vip"] };
        }),
      );

      bulkClearSelection();
    } catch (e: any) {
      setErr(e?.message || "BULK_UPDATE_FAILED");
    } finally {
      setLoading(false);
    }
  }

  async function bulkDelete() {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([id]) => id);

    if (ids.length === 0) return;

    try {
      setLoading(true);
      setErr(null);

      // soft delete => isActive false
      await Promise.all(ids.map((id) => apiDeleteCustomer(id)));

      setCustomers((prev) => prev.map((c) => (ids.includes(c.id) ? { ...c, status: "INACTIVE" } : c)));
      bulkClearSelection();
    } catch (e: any) {
      setErr(e?.message || "DELETE_FAILED");
    } finally {
      setLoading(false);
    }
  }

  async function createCustomer(payload: Pick<Customer, "name" | "email" | "phone" | "status" | "tags" | "note">) {
    try {
      setLoading(true);
      setErr(null);

      const isActive = payload.status !== "INACTIVE";
      const tags = payload.status === "VIP" ? Array.from(new Set([...payload.tags, "vip"])) : payload.tags.filter((t) => t.toLowerCase() !== "vip");

      const row = await apiCreateCustomer({
        name: payload.name,
        email: payload.email || undefined,
        phone: payload.phone || undefined,
        isActive,
        tags: serializeTags(tags),
        notes: payload.note || undefined,
      });

      const ui = mapRowToUI(row);
      setCustomers((p) => [ui, ...p]);

      // update tag pool
      const s = new Set<string>(allTagsServer);
      ui.tags.forEach((t) => s.add(t));
      setAllTagsServer(Array.from(s).sort());
    } catch (e: any) {
      setErr(e?.message || "CREATE_FAILED");
      throw e;
    } finally {
      setLoading(false);
    }
  }

  const stats = useMemo(() => {
    // If server provides totals, use them; else compute from loaded list
    const total = statsServer?.total ?? customers.length;
    const active = statsServer?.active ?? customers.filter((c) => c.status === "ACTIVE" || c.status === "VIP").length;
    const vip = customers.filter((c) => c.status === "VIP").length;
    const revenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
    return { total, active, vip, revenue };
  }, [customers, statsServer]);

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>Customers</h1>
            <span className={styles.subtitle}>Manage customers, segments, and engagement</span>
          </div>

          <div className={styles.kpis}>
            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Total</span>
                <i className={`bi bi-people ${styles.kpiIcon}`} />
              </div>
              <div className={styles.kpiValue}>{stats.total}</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Active</span>
                <i className={`bi bi-check2-circle ${styles.kpiIcon}`} />
              </div>
              <div className={styles.kpiValue}>{stats.active}</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>VIP</span>
                <i className={`bi bi-stars ${styles.kpiIcon}`} />
              </div>
              <div className={styles.kpiValue}>{stats.vip}</div>
            </div>

            <div className={styles.kpiCard}>
              <div className={styles.kpiTop}>
                <span className={styles.kpiLabel}>Revenue</span>
                <i className={`bi bi-cash-coin ${styles.kpiIcon}`} />
              </div>
              <div className={styles.kpiValue}>{fmtMoney(stats.revenue)}</div>
            </div>
          </div>

          {err ? (
            <div style={{ marginTop: 10, color: "#b42318", fontSize: 13 }}>
              <b>Error:</b> {err}
            </div>
          ) : null}
        </div>

        <div className={styles.headerRight}>
          <button className={styles.secondaryBtn} type="button" onClick={() => alert("Export — connect backend CSV later")}>
            <i className="bi bi-download" />
            Export
          </button>
          <button className={styles.primaryBtn} type="button" onClick={() => setCreateOpen(true)} disabled={loading}>
            <i className="bi bi-plus-lg" />
            New customer
          </button>
        </div>
      </div>

      {/* Segments */}
      <div className={styles.segmentBar}>
        <button type="button" className={`${styles.segment} ${segment === "ALL" ? styles.segmentActive : ""}`} onClick={() => setSegment("ALL")}>
          <i className="bi bi-grid" />
          All
        </button>
        <button type="button" className={`${styles.segment} ${segment === "ACTIVE" ? styles.segmentActive : ""}`} onClick={() => setSegment("ACTIVE")}>
          <i className="bi bi-check-circle" />
          Active
        </button>
        <button type="button" className={`${styles.segment} ${segment === "VIP" ? styles.segmentActive : ""}`} onClick={() => setSegment("VIP")}>
          <i className="bi bi-stars" />
          VIP
        </button>
        <button type="button" className={`${styles.segment} ${segment === "INACTIVE" ? styles.segmentActive : ""}`} onClick={() => setSegment("INACTIVE")}>
          <i className="bi bi-dash-circle" />
          Inactive
        </button>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <i className={`bi bi-search ${styles.searchIcon}`} />
          <input className={styles.searchInput} placeholder="Search by name, email, phone, or ID…" value={query} onChange={(e) => setQuery(e.target.value)} />
          {query ? (
            <button className={styles.clearBtn} type="button" onClick={() => setQuery("")} aria-label="Clear">
              <i className="bi bi-x-lg" />
            </button>
          ) : null}
        </div>

        <div className={styles.filters}>
          <div className={styles.selectWrap}>
            <i className={`bi bi-funnel ${styles.selectIcon}`} />
            <select className={styles.select} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
              <option value="ANY">Status: Any</option>
              <option value="ACTIVE">Status: Active</option>
              <option value="VIP">Status: VIP</option>
              <option value="INACTIVE">Status: Inactive</option>
            </select>
          </div>

          <div className={styles.selectWrap}>
            <i className={`bi bi-tags ${styles.selectIcon}`} />
            <select className={styles.select} value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
              <option value="">Tag: Any</option>
              {allTags.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.selectWrap}>
            <i className={`bi bi-sort-down ${styles.selectIcon}`} />
            <select className={styles.select} value={sort} onChange={(e) => setSort(e.target.value as any)}>
              <option value="LAST_ORDER">Sort: Last order</option>
              <option value="TOTAL_SPENT">Sort: Total spent</option>
              <option value="CREATED_AT">Sort: Created</option>
            </select>
          </div>

          <button
            type="button"
            className={styles.secondaryBtn}
            disabled={loading || !nextCursor}
            onClick={async () => {
              try {
                setLoading(true);
                setErr(null);
                const isActive = segment === "ACTIVE" || statusFilter === "ACTIVE" ? "true" : segment === "INACTIVE" || statusFilter === "INACTIVE" ? "false" : undefined;

                const resp = await apiListCustomers({ q: query.trim() || undefined, isActive, cursor: nextCursor || undefined, take: 50 });
                const uiRows = resp.data.map((r) => mapRowToUI(r));
                setCustomers((prev) => [...prev, ...uiRows]);
                setNextCursor(resp.nextCursor);

                const s = new Set<string>(allTagsServer);
                uiRows.forEach((c) => c.tags.forEach((t) => s.add(t)));
                setAllTagsServer(Array.from(s).sort());
              } catch (e: any) {
                setErr(e?.message || "LOAD_MORE_FAILED");
              } finally {
                setLoading(false);
              }
            }}>
            <i className="bi bi-arrow-down-circle" /> Load more
          </button>
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
            <button className={styles.bulkBtn} type="button" onClick={bulkClearSelection} disabled={loading}>
              Clear
            </button>
          </div>

          <div className={styles.bulkRight}>
            <div className={styles.bulkGroup}>
              <button className={styles.bulkBtn} type="button" onClick={() => bulkSetStatus("ACTIVE")} disabled={loading}>
                <i className="bi bi-check-circle" /> Set Active
              </button>
              <button className={styles.bulkBtn} type="button" onClick={() => bulkSetStatus("VIP")} disabled={loading}>
                <i className="bi bi-stars" /> Set VIP
              </button>
              <button className={styles.bulkBtn} type="button" onClick={() => bulkSetStatus("INACTIVE")} disabled={loading}>
                <i className="bi bi-dash-circle" /> Set Inactive
              </button>
            </div>

            <button className={`${styles.bulkBtn} ${styles.danger}`} type="button" onClick={bulkDelete} disabled={loading}>
              <i className="bi bi-trash3" /> Deactivate
            </button>
          </div>
        </div>
      ) : null}

      {/* Table */}
      <div className={styles.tableCard}>
        <div className={styles.tableHead}>
          <div className={styles.tableHeadLeft}>
            <span className={styles.tableTitle}>Customers</span>
            <span className={styles.tableMeta}>{loading ? "Loading..." : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}</span>
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
                  <input type="checkbox" checked={paged.length > 0 && paged.every((c) => !!selected[c.id])} onChange={(e) => toggleSelectAllOnPage(e.target.checked)} aria-label="Select all on page" />
                </th>
                <th>Customer</th>
                <th>Status</th>
                <th>Tags</th>
                <th className={styles.thNum}>Orders</th>
                <th className={styles.thNum}>Total spent</th>
                <th>Last order</th>
                <th>Created</th>
                <th className={styles.thActions}></th>
              </tr>
            </thead>

            <tbody>
              {paged.length === 0 ? (
                <tr>
                  <td colSpan={9} className={styles.emptyCell}>
                    <div className={styles.empty}>
                      <i className="bi bi-person-x" />
                      <div className={styles.emptyTitle}>No customers found</div>
                      <div className={styles.emptyHint}>Try adjusting your search or filters.</div>
                      <button className={styles.primaryBtn} type="button" onClick={() => setCreateOpen(true)} disabled={loading}>
                        <i className="bi bi-plus-lg" /> Create customer
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                paged.map((c) => {
                  const meta = statusMeta[c.status];
                  return (
                    <tr key={c.id} className={styles.tr} onDoubleClick={() => openDrawer(c)}>
                      <td className={styles.tdCheck} onClick={(e) => e.stopPropagation()}>
                        <input type="checkbox" checked={!!selected[c.id]} onChange={(e) => toggleSelect(c.id, e.target.checked)} />
                      </td>

                      <td className={styles.tdCustomer} onClick={() => openDrawer(c)}>
                        <div className={styles.customerCell}>
                          <div className={styles.avatar} aria-hidden="true">
                            {c.name
                              .split(" ")
                              .slice(0, 2)
                              .map((x) => x[0]?.toUpperCase())
                              .join("")}
                          </div>
                          <div className={styles.customerInfo}>
                            <div className={styles.customerName}>
                              {c.name} <span className={styles.muted}>•</span> <span className={styles.mono}>{c.id}</span>
                            </div>
                            <div className={styles.customerSub}>
                              <span className={styles.muted}>{c.email || "—"}</span>
                              {c.phone ? (
                                <>
                                  <span className={styles.dot}>•</span>
                                  <span className={styles.muted}>{c.phone}</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`${styles.badge} ${styles["badge_" + c.status]}`}>
                          <i className={`bi ${meta.icon}`} />
                          {meta.label}
                        </span>
                      </td>

                      <td>
                        <div className={styles.tagRow}>
                          {c.tags.length === 0 ? <span className={styles.muted}>—</span> : null}
                          {c.tags.slice(0, 2).map((t) => (
                            <span key={t} className={styles.tag}>
                              {t}
                            </span>
                          ))}
                          {c.tags.length > 2 ? <span className={styles.moreTag}>+{c.tags.length - 2}</span> : null}
                        </div>
                      </td>

                      <td className={styles.tdNum}>{c.orders}</td>
                      <td className={styles.tdNum}>{fmtMoney(c.totalSpent)}</td>
                      <td>{fmtDate(c.lastOrderAt)}</td>
                      <td>{fmtDate(c.createdAt)}</td>

                      <td className={styles.tdActions} onClick={(e) => e.stopPropagation()}>
                        <button className={styles.rowBtn} type="button" onClick={() => openDrawer(c)} title="View">
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
            <i className="bi bi-person-badge" />
            Customer details
          </div>
          <button className={styles.iconBtn} type="button" onClick={() => setDrawerOpen(false)} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {activeCustomer ? (
          <div className={styles.drawerBody}>
            <div className={styles.drawerCard}>
              <div className={styles.drawerTop}>
                <div className={styles.drawerAvatar} aria-hidden="true">
                  {activeCustomer.name
                    .split(" ")
                    .slice(0, 2)
                    .map((x) => x[0]?.toUpperCase())
                    .join("")}
                </div>
                <div className={styles.drawerInfo}>
                  <div className={styles.drawerName}>{activeCustomer.name}</div>
                  <div className={styles.drawerMeta}>
                    <span className={styles.mono}>{activeCustomer.id}</span>
                    <span className={styles.dot}>•</span>
                    <span className={styles.muted}>{activeCustomer.email || "—"}</span>
                  </div>
                </div>
              </div>

              {drawerLoading ? <div className={styles.muted}>Loading details…</div> : null}

              <div className={styles.drawerGrid}>
                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Status</div>
                  <div className={styles.fieldValue}>
                    <span className={`${styles.badge} ${styles["badge_" + activeCustomer.status]}`}>
                      <i className={`bi ${statusMeta[activeCustomer.status].icon}`} />
                      {statusMeta[activeCustomer.status].label}
                    </span>
                  </div>
                </div>

                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Phone</div>
                  <div className={styles.fieldValue}>{activeCustomer.phone || "—"}</div>
                </div>

                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Orders</div>
                  <div className={styles.fieldValue}>{activeCustomer.orders}</div>
                </div>

                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Total spent</div>
                  <div className={styles.fieldValue}>{fmtMoney(activeCustomer.totalSpent)}</div>
                </div>

                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Last order</div>
                  <div className={styles.fieldValue}>{fmtDate(activeCustomer.lastOrderAt)}</div>
                </div>

                <div className={styles.field}>
                  <div className={styles.fieldLabel}>Created</div>
                  <div className={styles.fieldValue}>{fmtDate(activeCustomer.createdAt)}</div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <i className="bi bi-tags" /> Tags
                </div>
                <div className={styles.sectionBody}>
                  {activeCustomer.tags.length === 0 ? <span className={styles.muted}>No tags</span> : null}
                  <div className={styles.tagRow}>
                    {activeCustomer.tags.map((t) => (
                      <span key={t} className={styles.tag}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <div className={styles.sectionTitle}>
                  <i className="bi bi-journal-text" /> Notes
                </div>
                <div className={styles.sectionBody}>
                  <div className={styles.noteBox}>{activeCustomer.note || "—"}</div>
                </div>
              </div>

              <div className={styles.drawerActions}>
                <button className={styles.secondaryBtn} type="button" onClick={() => alert("Open customer profile — route later")}>
                  <i className="bi bi-box-arrow-up-right" />
                  Open profile
                </button>
                <button className={styles.secondaryBtn} type="button" onClick={() => alert("Send email — integrate provider later")}>
                  <i className="bi bi-envelope" />
                  Email
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className={styles.drawerBody}>
            <div className={styles.muted}>Select a customer…</div>
          </div>
        )}
      </aside>

      {/* Overlay for drawer */}
      {drawerOpen ? <button className={styles.backdrop} onClick={() => setDrawerOpen(false)} aria-label="Close drawer" /> : null}

      {/* Create Modal */}
      {createOpen ? (
        <CreateCustomerModal
          onClose={() => setCreateOpen(false)}
          onCreate={async (payload) => {
            try {
              await createCustomer(payload);
              setCreateOpen(false);
            } catch {
              // error shown in header
            }
          }}
          allTags={allTags}
          loading={loading}
        />
      ) : null}
    </div>
  );
}

function CreateCustomerModal({
  onClose,
  onCreate,
  allTags,
  loading,
}: {
  onClose: () => void;
  onCreate: (payload: Pick<Customer, "name" | "email" | "phone" | "status" | "tags" | "note">) => void | Promise<void>;
  allTags: string[];
  loading: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<CustomerStatus>("ACTIVE");
  const [tags, setTags] = useState<string[]>([]);
  const [note, setNote] = useState("");

  const canSave = name.trim().length >= 2 && email.includes("@") && !loading;

  function toggleTag(t: string) {
    setTags((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  return (
    <div className={styles.modalRoot} role="dialog" aria-modal="true">
      <button className={styles.modalBackdrop} onClick={onClose} aria-label="Close modal" />
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <div className={styles.modalTitle}>
            <i className="bi bi-person-plus" /> New customer
          </div>
          <button className={styles.iconBtn} type="button" onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.formGrid}>
            <label className={styles.label}>
              <span className={styles.labelText}>Full name</span>
              <input className={styles.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nguyễn Văn A" />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Email</span>
              <input className={styles.input} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. customer@email.com" />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Phone</span>
              <input className={styles.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Optional" />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Status</span>
              <div className={styles.selectWrap}>
                <i className={`bi bi-activity ${styles.selectIcon}`} />
                <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value as CustomerStatus)}>
                  <option value="ACTIVE">Active</option>
                  <option value="VIP">VIP</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
            </label>
          </div>

          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <i className="bi bi-tags" /> Tags
            </div>
            <div className={styles.sectionBody}>
              {allTags.length === 0 ? <div className={styles.muted}>No tags available yet. Create after saving.</div> : null}
              <div className={styles.tagPickRow}>
                {allTags.map((t) => (
                  <button key={t} type="button" className={`${styles.tagPick} ${tags.includes(t) ? styles.tagPickActive : ""}`} onClick={() => toggleTag(t)}>
                    <i className={`bi ${tags.includes(t) ? "bi-check2" : "bi-plus"}`} />
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className={styles.label}>
            <span className={styles.labelText}>Notes</span>
            <textarea className={styles.textarea} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Internal notes (optional)..." />
          </label>
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.secondaryBtn} type="button" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className={styles.primaryBtn}
            type="button"
            disabled={!canSave}
            onClick={() =>
              onCreate({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                status,
                tags,
                note: note.trim(),
              })
            }>
            <i className="bi bi-check2" />
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
