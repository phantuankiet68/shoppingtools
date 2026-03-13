"use client";
import React from "react";
import styles from "@/styles/admin/builder/pages/page/page.module.css";
import type { PageRow } from "@/lib/builder/pages/types";

import { PAGE_MESSAGES as M } from "@/features/builder/pages/messages";

type SortKey = "updatedAt" | "createdAt" | "title";
type SortDir = "asc" | "desc";

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
  sortKey: SortKey;
  sortDir: SortDir;
  setSortKey: (k: SortKey) => void;
  setSortDir: (d: SortDir) => void;

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

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir(key === "title" ? "asc" : "desc");
    }
  };

  return (
    <div className={`${styles.pageTable} p-2`}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.searchGroup}>
          <i className={`bi bi-search ${styles.searchIcon}`}></i>
          <input
            className={`form-control ${styles.searchInput}`}
            placeholder={M.searchPlaceholder}
            value={pagesQ}
            onChange={(e) => setPagesQ(e.target.value)}
          />
          {pagesQ && (
            <button
              type="button"
              className={styles.clearBtn}
              onClick={() => setPagesQ("")}
              aria-label="Clear"
              title="Clear"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-secondary small">{M.status}</span>
          <select
            className="form-select form-select-sm"
            style={{ width: 160 }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          >
            <option value="all">{M.allStatuses}</option>
            <option value="PUBLISHED">{M.publish}</option>
            <option value="DRAFT">{M.unpublish}</option>
          </select>
        </div>

        <div className="d-flex align-items-center gap-2">
          <span className="text-secondary small">{M.sort}</span>
          <select
            className="form-select"
            style={{ width: 220 }}
            value={`${sortKey}:${sortDir}`}
            onChange={(e) => {
              const [k, d] = e.target.value.split(":") as [SortKey, SortDir];
              setSortKey(k);
              setSortDir(d);
            }}
          >
            <option value="updatedAt:desc">Updated (newest)</option>
            <option value="updatedAt:asc">Updated (oldest)</option>
            <option value="createdAt:desc">Created (newest)</option>
            <option value="createdAt:asc">Created (oldest)</option>
            <option value="title:asc">Title (A→Z)</option>
            <option value="title:desc">Title (Z→A)</option>
          </select>
        </div>

        <div className="ms-auto d-flex gap-2">
          <button className={styles.btnRefresh} onClick={() => loadPages(1)} disabled={pagesLoading}>
            <i className="bi bi-arrow-repeat me-1"></i>
            {pagesLoading ? M.loading : M.refresh}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className={`${styles.tableWrap} ${styles.minH} mt-3`}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th style={{ width: 220 }}>{M.id}</th>

              <th className={styles.thSort} onClick={() => toggleSort("title")}>
                {M.title}
                <i
                  className={`bi ${sortKey === "title" ? (sortDir === "asc" ? "bi-chevron-up" : "bi-chevron-down") : "bi-arrow-down-up"} ${styles.sortIcon}`}
                ></i>
              </th>

              <th>{M.slug}</th>
              <th>{M.path}</th>

              <th className={styles.thSort} onClick={() => toggleSort("updatedAt")}>
                {M.updated}
                <i
                  className={`bi ${sortKey === "updatedAt" ? (sortDir === "asc" ? "bi-chevron-up" : "bi-chevron-down") : "bi-arrow-down-up"} ${styles.sortIcon}`}
                ></i>
              </th>

              <th>{M.status}</th>
              <th className="text-end">{M.actions}</th>
            </tr>
          </thead>

          <tbody>
            {pages.length === 0 && !pagesLoading && (
              <tr>
                <td className={styles.empty} colSpan={7}>
                  {M.noResults}
                </td>
              </tr>
            )}

            {pages.map((p) => (
              <tr key={p.id} className={styles.row} data-status={p.status}>
                <td className={`${styles.cell} ${styles.ellipsis}`} title={p.id}>
                  <code>{p.id}</code>
                </td>

                <td className={`${styles.cell} ${styles.ellipsis}`} title={p.title || M.untitled}>
                  {p.title || M.untitled}
                </td>

                <td className={`${styles.cell} ${styles.ellipsis}`} title={p.slug}>
                  <code>{p.slug}</code>
                </td>

                <td className={`${styles.cell} ${styles.ellipsis}`} title={p.title ?? undefined}>
                  {p.title || M.untitled}
                </td>
                <td
                  className={`${styles.cell} ${styles.nowrap}`}
                  title={new Date(p.updatedAt || p.createdAt || 0).toLocaleString()}
                >
                  {new Date(p.updatedAt || p.createdAt || 0).toLocaleDateString()}
                </td>

                <td className={styles.cell}>
                  <span
                    className={`${styles.badge} ${p.status === "PUBLISHED" ? styles.badgeGreen : styles.badgeGray}`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className={`${styles.cell} ${styles.actions}`}>
                  <div className="btn-group">
                    <button
                      className={`${styles.btnEdit} btn-sm btn-outline-primary`}
                      title={M.edit}
                      onClick={() => openPageForEdit(p.id)}
                    >
                      <i className="bi bi-pencil-square"></i>
                    </button>

                    <a
                      className={`${styles.btnPreview} btn-sm btn-outline-primary`}
                      title={M.preview}
                      href={p.path ?? undefined}
                      target={p.path ? "_blank" : undefined}
                      rel={p.path ? "noreferrer" : undefined}
                      onClick={(e) => {
                        if (!p.path) e.preventDefault();
                      }}
                    >
                      <i className="bi bi-box-arrow-up-right"></i>
                    </a>

                    {p.status === "PUBLISHED" ? (
                      <button
                        className={`${styles.btnUnpublish} btn-sm btn-outline-primary`}
                        title={M.unpublish}
                        onClick={() => togglePublish(p.id, "unpublish")}
                      >
                        <i className="bi bi-eye-slash"></i>
                      </button>
                    ) : (
                      <button
                        className={`${styles.btnPublish} btn-sm btn-outline-primary`}
                        title={M.publish}
                        onClick={() => togglePublish(p.id, "publish")}
                      >
                        <i className="bi bi-upload"></i>
                      </button>
                    )}

                    <button
                      className={`${styles.btnDuplicate} btn-sm btn-outline-primary`}
                      title={M.duplicate}
                      onClick={() => duplicatePage(p.id)}
                    >
                      <i className="bi bi-layers"></i>
                    </button>

                    <button
                      className={`${styles.btnDelete} btn-sm btn-outline-primary`}
                      title={M.delete}
                      onClick={() => deletePage(p.id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {pagesLoading && (
              <tr>
                <td className={styles.loading} colSpan={7}>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {M.loadingData}
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
              <button
                key={n}
                className={`${styles.pageBtn} ${n === page ? styles.pageBtnActive : ""}`}
                onClick={() => goToPage(n)}
              >
                {n}
              </button>
            ))}

            <button
              className={styles.pageBtn}
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
              title="Next"
            >
              ›
            </button>
            <button
              className={styles.pageBtn}
              disabled={page >= totalPages}
              onClick={() => goToPage(totalPages)}
              title="Last"
            >
              »
            </button>

            <select className={styles.pageSize} value={pageSize} onChange={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}
