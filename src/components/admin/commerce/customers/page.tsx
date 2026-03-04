"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/commerce/customers/customers.module.css";
import { useShallow } from "zustand/react/shallow";
import { useCustomerStore } from "@/store/commerce/customers/customer.store";
import type { CustomerStore, CustomerStatus, Customer } from "@/store/commerce/customers/customer.store";

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

export default function CustomersPage() {
  const store = useCustomerStore(
    useShallow((s: CustomerStore) => ({
      siteId: s.siteId,
      siteErr: s.siteErr,

      customers: s.customers,
      nextCursor: s.nextCursor,
      statsServer: s.statsServer,
      allTagsServer: s.allTagsServer,

      query: s.query,
      segment: s.segment,
      statusFilter: s.statusFilter,
      tagFilter: s.tagFilter,
      sort: s.sort,

      selected: s.selected,
      loading: s.loading,
      err: s.err,

      initSite: s.initSite,
      setQuery: s.setQuery,
      setSegment: s.setSegment,
      setStatusFilter: s.setStatusFilter,
      setTagFilter: s.setTagFilter,
      setSort: s.setSort,

      toggleSelect: s.toggleSelect,
      bulkSelect: s.bulkSelect,
      clearSelection: s.clearSelection,

      fetchCustomers: s.fetchCustomers,
      loadMore: s.loadMore,
      openDetailAndMerge: s.openDetailAndMerge,

      bulkSetStatus: s.bulkSetStatus,
      bulkDeactivate: s.bulkDeactivate,
      createCustomer: s.createCustomer,
    })),
  );

  const {
    siteId,
    siteErr,

    customers,
    nextCursor,
    statsServer,
    allTagsServer,

    query,
    segment,
    statusFilter,
    tagFilter,
    sort,

    selected,
    loading,
    err,

    initSite,
    setQuery,
    setSegment,
    setStatusFilter,
    setTagFilter,
    setSort,

    toggleSelect,
    bulkSelect,
    clearSelection,

    fetchCustomers,
    loadMore,
    openDetailAndMerge,

    bulkSetStatus,
    bulkDeactivate,
    createCustomer,
  } = store;

  // ✅ init site (store đã guard StrictMode)
  useEffect(() => {
    initSite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ✅ refetch when filters change (debounce 250ms)
  useEffect(() => {
    if (!siteId) return;
    const t = window.setTimeout(() => {
      fetchCustomers();
    }, 250);
    return () => window.clearTimeout(t);
  }, [siteId, query, segment, statusFilter, fetchCustomers]);

  // Drawer (store-backed, avoid stale objects)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCustomerId, setActiveCustomerId] = useState<string | null>(null);
  const [drawerLoading, setDrawerLoading] = useState(false);

  const [createOpen, setCreateOpen] = useState(false);

  // Pagination (client paging over loaded items)
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const selectedCount = useMemo(() => Object.values(selected).filter(Boolean).length, [selected]);

  const allTags = useMemo(() => {
    const s = new Set<string>(allTagsServer);
    customers.forEach((c) => c.tags.forEach((t) => s.add(t)));
    return Array.from(s).sort();
  }, [allTagsServer, customers]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const list = customers.filter((c) => {
      const matchesQuery =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone || "").toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);

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

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), pageCount));
  }, [pageCount]);

  // ✅ derive active customer from store (avoid stale local copy)
  const activeCustomer = useMemo(() => {
    if (!activeCustomerId) return null;
    return customers.find((c) => c.id === activeCustomerId) ?? null;
  }, [customers, activeCustomerId]);

  // ✅ select all with single store update
  function toggleSelectAllOnPage(v: boolean) {
    bulkSelect(
      paged.map((c) => c.id),
      v,
    );
  }

  async function openDrawer(c: Customer) {
    setActiveCustomerId(c.id);
    setDrawerOpen(true);
    setDrawerLoading(true);
    try {
      await openDetailAndMerge(c.id);
    } finally {
      setDrawerLoading(false);
    }
  }

  const stats = useMemo(() => {
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

          {siteErr ? (
            <div style={{ marginTop: 10, color: "#b42318", fontSize: 13 }}>
              <b>Site error:</b> {siteErr}
            </div>
          ) : null}

          {err ? (
            <div style={{ marginTop: 10, color: "#b42318", fontSize: 13 }}>
              <b>Error:</b> {err}
            </div>
          ) : null}
        </div>

        <div className={styles.headerRight}>
          <button
            className={styles.secondaryBtn}
            type="button"
            onClick={() => alert("Export — connect backend CSV later")}
          >
            <i className="bi bi-download" />
            Export
          </button>

          <button
            className={styles.primaryBtn}
            type="button"
            onClick={() => setCreateOpen(true)}
            disabled={loading || !siteId}
          >
            <i className="bi bi-plus-lg" />
            New customer
          </button>
        </div>
      </div>

      {/* Segments */}
      <div className={styles.segmentBar}>
        <button
          type="button"
          className={`${styles.segment} ${segment === "ALL" ? styles.segmentActive : ""}`}
          onClick={() => setSegment("ALL")}
        >
          <i className="bi bi-grid" />
          All
        </button>
        <button
          type="button"
          className={`${styles.segment} ${segment === "ACTIVE" ? styles.segmentActive : ""}`}
          onClick={() => setSegment("ACTIVE")}
        >
          <i className="bi bi-check-circle" />
          Active
        </button>
        <button
          type="button"
          className={`${styles.segment} ${segment === "VIP" ? styles.segmentActive : ""}`}
          onClick={() => setSegment("VIP")}
        >
          <i className="bi bi-stars" />
          VIP
        </button>
        <button
          type="button"
          className={`${styles.segment} ${segment === "INACTIVE" ? styles.segmentActive : ""}`}
          onClick={() => setSegment("INACTIVE")}
        >
          <i className="bi bi-dash-circle" />
          Inactive
        </button>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <i className={`bi bi-search ${styles.searchIcon}`} />
          <input
            className={styles.searchInput}
            placeholder="Search by name, email, phone, or ID…"
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
            <select
              className={styles.select}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "ANY" | CustomerStatus)}
            >
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
            <select
              className={styles.select}
              value={sort}
              onChange={(e) => setSort(e.target.value as "LAST_ORDER" | "TOTAL_SPENT" | "CREATED_AT")}
            >
              <option value="LAST_ORDER">Sort: Last order</option>
              <option value="TOTAL_SPENT">Sort: Total spent</option>
              <option value="CREATED_AT">Sort: Created</option>
            </select>
          </div>

          <button
            className={styles.secondaryBtn}
            disabled={loading || !nextCursor || !siteId}
            onClick={loadMore}
            type="button"
          >
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
            <button className={styles.bulkBtn} type="button" onClick={clearSelection} disabled={loading}>
              Clear
            </button>
          </div>

          <div className={styles.bulkRight}>
            <div className={styles.bulkGroup}>
              <button
                className={styles.bulkBtn}
                type="button"
                onClick={() => bulkSetStatus("ACTIVE")}
                disabled={loading || !siteId}
              >
                <i className="bi bi-check-circle" /> Set Active
              </button>
              <button
                className={styles.bulkBtn}
                type="button"
                onClick={() => bulkSetStatus("VIP")}
                disabled={loading || !siteId}
              >
                <i className="bi bi-stars" /> Set VIP
              </button>
              <button
                className={styles.bulkBtn}
                type="button"
                onClick={() => bulkSetStatus("INACTIVE")}
                disabled={loading || !siteId}
              >
                <i className="bi bi-dash-circle" /> Set Inactive
              </button>
            </div>

            <button
              className={`${styles.bulkBtn} ${styles.danger}`}
              type="button"
              onClick={bulkDeactivate}
              disabled={loading || !siteId}
            >
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
            <span className={styles.tableMeta}>
              {!siteId
                ? "Loading site..."
                : loading
                  ? "Loading..."
                  : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
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
                    checked={paged.length > 0 && paged.every((c) => !!selected[c.id])}
                    onChange={(e) => toggleSelectAllOnPage(e.target.checked)}
                    aria-label="Select all on page"
                  />
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
                      <div className={styles.emptyHint}>
                        {!siteId ? "Waiting for site context..." : "Try adjusting your search or filters."}
                      </div>
                      <button
                        className={styles.primaryBtn}
                        type="button"
                        onClick={() => setCreateOpen(true)}
                        disabled={loading || !siteId}
                      >
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
                        <input
                          type="checkbox"
                          checked={!!selected[c.id]}
                          onChange={(e) => toggleSelect(c.id, e.target.checked)}
                          aria-label={`Select customer ${c.name}`}
                        />
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
                              {c.name} <span className={styles.muted}>•</span>{" "}
                              <span className={styles.mono}>{c.id}</span>
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
                <button
                  className={styles.secondaryBtn}
                  type="button"
                  onClick={() => alert("Open customer profile — route later")}
                >
                  <i className="bi bi-box-arrow-up-right" />
                  Open profile
                </button>
                <button
                  className={styles.secondaryBtn}
                  type="button"
                  onClick={() => alert("Send email — integrate provider later")}
                >
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
      {drawerOpen ? (
        <button className={styles.backdrop} onClick={() => setDrawerOpen(false)} aria-label="Close drawer" />
      ) : null}

      {/* Create Modal */}
      {createOpen ? (
        <CreateCustomerModal
          onClose={() => setCreateOpen(false)}
          onCreate={async (payload) => {
            await createCustomer(payload);
            setCreateOpen(false);
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
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Nguyễn Văn A"
              />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Email</span>
              <input
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. customer@email.com"
              />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Phone</span>
              <input
                className={styles.input}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Optional"
              />
            </label>

            <label className={styles.label}>
              <span className={styles.labelText}>Status</span>
              <div className={styles.selectWrap}>
                <i className={`bi bi-activity ${styles.selectIcon}`} />
                <select
                  className={styles.select}
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CustomerStatus)}
                >
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
              {allTags.length === 0 ? (
                <div className={styles.muted}>No tags available yet. Create after saving.</div>
              ) : null}
              <div className={styles.tagPickRow}>
                {allTags.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className={`${styles.tagPick} ${tags.includes(t) ? styles.tagPickActive : ""}`}
                    onClick={() => toggleTag(t)}
                  >
                    <i className={`bi ${tags.includes(t) ? "bi-check2" : "bi-plus"}`} />
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className={styles.label}>
            <span className={styles.labelText}>Notes</span>
            <textarea
              className={styles.textarea}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Internal notes (optional)..."
            />
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
            }
          >
            <i className="bi bi-check2" />
            Create
          </button>
        </div>
      </div>
    </div>
  );
}
