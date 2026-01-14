// app/[locale]/v1/ui-builder/components/PagesTable.tsx
"use client";
import React from "react";
import styles from "@/styles/admin/page/page.module.css";
import type { PageRow } from "@/lib/page/types";

type Props = {
  pages: PageRow[];
  pagesLoading: boolean;
  total: number;
  page: number;
  pageSize: number;
  showingFrom: number;
  showingTo: number;
  totalPages: number;
  pageWindow: () => number[];
  goToPage: (n: number) => void;

  pagesQ: string;
  setPagesQ: (v: string) => void;
  statusFilter: "all" | "DRAFT" | "PUBLISHED";
  setStatusFilter: (v: "all" | "DRAFT" | "PUBLISHED") => void;
  sortKey: "updatedAt" | "createdAt" | "title" | "locale";
  sortDir: "asc" | "desc";
  setSortKey: (k: Props["sortKey"]) => void;
  setSortDir: (d: Props["sortDir"]) => void;

  loadPages: (p?: number) => Promise<void>;
  openPageForEdit: (id: string) => void | Promise<void>;
  togglePublish: (id: string, next: "publish" | "unpublish") => Promise<void>;
  duplicatePage: (id: string) => Promise<void>;
  deletePage: (id: string) => Promise<void>;
};

export default function PagesTable(props: Props) {
  const {
    pages,
    pagesLoading,
    total,
    page,
    pageSize,
    showingFrom,
    showingTo,
    totalPages,
    pageWindow,
    goToPage,
    pagesQ,
    setPagesQ,
    statusFilter,
    setStatusFilter,
    sortKey,
    sortDir,
    setSortKey,
    setSortDir,
    loadPages,
    openPageForEdit,
    togglePublish,
    duplicatePage,
    deletePage,
  } = props;

  const toggleSort = (key: "updatedAt" | "createdAt" | "title" | "locale") => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir(key === "title" || key === "locale" ? "asc" : "desc");
    }
  };

  return (
    <div className={`${styles.pageTable} p-2`}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchGroup}>
          <i className={`bi bi-search ${styles.searchIcon}`}></i>
          <input className={`form-control ${styles.searchInput}`} placeholder="Search by title / slug / path…" value={pagesQ} onChange={(e) => setPagesQ(e.target.value)} />
          {pagesQ && (
            <button type="button" className={styles.clearBtn} onClick={() => setPagesQ("")} aria-label="Clear" title="Clear">
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-secondary small">Status</span>
          <select className="form-select form-select-sm" style={{ width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="all">All</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-secondary small">Sort</span>
          <select
            className="form-select"
            style={{ width: 200 }}
            value={`${sortKey}:${sortDir}`}
            onChange={(e) => {
              const [k, d] = e.target.value.split(":") as any;
              setSortKey(k);
              setSortDir(d);
            }}>
            <option value="updatedAt:desc">Updated (newest)</option>
            <option value="updatedAt:asc">Updated (oldest)</option>
            <option value="createdAt:desc">Created (newest)</option>
            <option value="createdAt:asc">Created (oldest)</option>
            <option value="title:asc">Title (A→Z)</option>
            <option value="title:desc">Title (Z→A)</option>
            <option value="locale:asc">Locale (A→Z)</option>
            <option value="locale:desc">Locale (Z→A)</option>
          </select>
        </div>

        <div className="ms-auto d-flex gap-2">
          <button className={styles.btnRefresh} onClick={() => loadPages(1)} disabled={pagesLoading}>
            <i className="bi bi-arrow-repeat me-1"></i>
            {pagesLoading ? "Loading…" : "Refresh"}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={`${styles.tableWrap} ${styles.minH} mt-3`}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th style={{ width: 220 }}>ID</th>
              <th className={styles.thSort} onClick={() => toggleSort("locale")}>
                Locale
                <i className={`bi ${sortKey === "locale" ? (sortDir === "asc" ? "bi-chevron-up" : "bi-chevron-down") : "bi-arrow-down-up"} ${styles.sortIcon}`}></i>
              </th>
              <th className={styles.thSort} onClick={() => toggleSort("title")}>
                Title
                <i className={`bi ${sortKey === "title" ? (sortDir === "asc" ? "bi-chevron-up" : "bi-chevron-down") : "bi-arrow-down-up"} ${styles.sortIcon}`}></i>
              </th>
              <th>Slug</th>
              <th>Path</th>
              <th className={styles.thSort} onClick={() => toggleSort("updatedAt")}>
                Updated
                <i className={`bi ${sortKey === "updatedAt" ? (sortDir === "asc" ? "bi-chevron-up" : "bi-chevron-down") : "bi-arrow-down-up"} ${styles.sortIcon}`}></i>
              </th>
              <th>Status</th>
              <th className="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 && !pagesLoading && (
              <tr>
                <td className={styles.empty} colSpan={8}>
                  Không có kết quả nào khớp bộ lọc.
                </td>
              </tr>
            )}

            {pages.map((p) => (
              <tr key={p.id} className={styles.row} data-status={p.status}>
                <td className={`${styles.cell} ${styles.ellipsis}`} title={p.id}>
                  <code>{p.id}</code>
                </td>
                <td className={styles.cell}>
                  <span className={`${styles.badge} ${styles.badgeGray}`}>{p.locale}</span>
                </td>
                <td className={`${styles.cell} ${styles.ellipsis}`} title={p.title}>
                  {p.title}
                </td>
                <td className={`${styles.cell} ${styles.ellipsis}`} title={p.slug}>
                  <code>{p.slug}</code>
                </td>
                <td className={`${styles.cell} ${styles.ellipsis}`} title={p.path}>
                  <code>{p.path}</code>
                </td>
                <td className={`${styles.cell} ${styles.nowrap}`} title={new Date(p.updatedAt || p.createdAt || Date.now()).toLocaleString()}>
                  {new Date(p.updatedAt || p.createdAt || Date.now()).toLocaleDateString()}
                </td>
                <td className={styles.cell}>
                  <span className={`${styles.badge} ${p.status === "PUBLISHED" ? styles.badgeGreen : styles.badgeGray}`}>{p.status}</span>
                </td>
                <td className={`${styles.cell} ${styles.actions}`}>
                  <div className="btn-group">
                    <button className={`${styles.btnEdit} btn-sm btn-outline-primary`} title="Open in builder" onClick={() => openPageForEdit(p.id)}>
                      <i className="bi bi-pencil-square"></i>
                    </button>
                    <a className={`${styles.btnPreview} btn-sm btn-outline-primary`} title="Preview in new tab" href={p.path} target="_blank" rel="noreferrer">
                      <i className="bi bi-box-arrow-up-right"></i>
                    </a>
                    {p.status === "PUBLISHED" ? (
                      <button className={`${styles.btnUnpublish} btn-sm btn-outline-primary`} title="Unpublish" onClick={() => togglePublish(p.id, "unpublish")}>
                        <i className="bi bi-eye-slash"></i>
                      </button>
                    ) : (
                      <button className={`${styles.btnPublish} btn-sm btn-outline-primary`} title="Publish" onClick={() => togglePublish(p.id, "publish")}>
                        <i className="bi bi-upload"></i>
                      </button>
                    )}
                    <button className={`${styles.btnDuplicate} btn-sm btn-outline-primary`} title="Duplicate" onClick={() => duplicatePage(p.id)}>
                      <i className="bi bi-layers"></i>
                    </button>
                    <button className={`${styles.btnDelete} btn-sm btn-outline-primary`} title="Delete" onClick={() => deletePage(p.id)}>
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {pagesLoading && (
              <tr>
                <td className={styles.loading} colSpan={8}>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang tải dữ liệu…
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className={styles.pagination}>
          <div className={styles.pageInfo}>
            Đang hiển thị <strong>{showingFrom}</strong>–<strong>{showingTo}</strong> / <strong>{total}</strong>
          </div>
          <div className={styles.pageNav}>
            <button className={styles.pageBtn} disabled={page <= 1} onClick={() => goToPage(1)} title="First">
              «
            </button>
            <button className={styles.pageBtn} disabled={page <= 1} onClick={() => goToPage(page - 1)} title="Prev">
              ‹
            </button>
            {pageWindow().map((n) => (
              <button key={n} className={`${styles.pageBtn} ${n === page ? styles.pageBtnActive : ""}`} onClick={() => goToPage(n)}>
                {n}
              </button>
            ))}
            <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => goToPage(page + 1)} title="Next">
              ›
            </button>
            <button className={styles.pageBtn} disabled={page >= totalPages} onClick={() => goToPage(totalPages)} title="Last">
              »
            </button>
            <select
              className={styles.pageSize}
              value={pageSize}
              onChange={(e) => {
                /* parent sẽ setPageSize + reset page */
              }}>
              {/* gợi ý: điều khiển pageSize ở parent; hoặc truyền handler riêng nếu muốn */}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
