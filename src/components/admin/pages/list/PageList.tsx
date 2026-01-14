"use client";
import React from "react";
import styles from "@/styles/admin/page/page.module.css";
import type { PageRow } from "@/lib/page/types";

type Props = {
  pages: PageRow[];
  loading: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;

  q: string;
  setQ: (v: string) => void;
  status: "all" | "DRAFT" | "PUBLISHED";
  setStatus: (v: "all" | "DRAFT" | "PUBLISHED") => void;
  sortKey: "updatedAt" | "createdAt" | "title" | "locale";
  sortDir: "asc" | "desc";
  setSortKey: (k: Props["sortKey"]) => void;
  setSortDir: (d: Props["sortDir"]) => void;

  onRefresh: () => void;

  // 👇 NEW
  page: number;
  setPage: (n: number) => void;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

export default function PageList({
  pages,
  loading,
  activeId,
  onSelect,
  q,
  setQ,
  status,
  setStatus,
  sortKey,
  sortDir,
  setSortKey,
  setSortDir,
  onRefresh,
  page,
  setPage,
  total,
  totalPages,
  hasMore,
}: Props) {
  const toggleSort = (k: Props["sortKey"]) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(k);
      setSortDir(k === "title" || k === "locale" ? "asc" : "desc");
    }
  };

  const canPrev = page > 1;
  const canNext = page < totalPages; // hoặc dựa trên hasMore

  return (
    <aside className={styles.leftPane}>
      <div className={styles.leftHead}>
        <div className={styles.searchBox}>
          <i className={`bi bi-search ${styles.searchIcon}`} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title / slug / path…" />
          {q && (
            <button className={styles.clearBtn} onClick={() => setQ("")} title="Clear" aria-label="Clear">
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>

        <div className={styles.toolbar}>
          <select className="form-select form-select-sm" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            <option value="all">All</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>

          <button className={styles.ghostBtn} onClick={() => toggleSort("updatedAt")} title="Sort by updated">
            <i className={`bi ${sortKey === "updatedAt" ? (sortDir === "asc" ? "bi-chevron-up" : "bi-chevron-down") : "bi-arrow-down-up"}`} />
            <span className="ms-1">Updated</span>
          </button>
          <button className={styles.ghostBtn} onClick={() => toggleSort("title")} title="Sort by title">
            <i className="bi bi-sort-alpha-down" />
            <span className="ms-1">Title</span>
          </button>

          <button className={styles.refreshBtn} onClick={onRefresh} disabled={loading}>
            <i className="bi bi-arrow-repeat me-1" />
            {loading ? "Loading…" : ""}
          </button>
        </div>
      </div>

      <div className={styles.listWrap} id="listWrap">
        {pages.length === 0 && !loading && <div className={styles.empty}>Không có trang nào.</div>}

        {pages.map((p) => (
          <button key={p.id} className={`${styles.item} ${styles.sheen} ${p.id === activeId ? styles.itemActive : ""}`} onClick={() => onSelect(p.id)} title={p.title || p.slug}>
            <div className={styles.itemIcon}>{p.locale.toUpperCase()}</div>
            <div className="overflow-hidden">
              <div className={styles.itemTitle}>
                {p.title || "(untitled)"}
                <span className={`${styles.badge} ${p.status === "PUBLISHED" ? styles.badgeGreen : styles.badgeGray}`}>{p.status}</span>
              </div>
              <div className={styles.meta}>
                <code className={styles.code}>{p.slug}</code>
                <span className="mx-1">•</span>
                <code className={styles.code}>{p.path}</code>
              </div>
            </div>
            <div className={styles.itemTime}>{new Date(p.updatedAt || p.createdAt || Date.now()).toLocaleDateString()}</div>
          </button>
        ))}

        {loading && (
          <>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
          </>
        )}
      </div>

      {/* 👇 NEW: Pagination footer */}
      <div className={styles.pager}>
        <button className={styles.pageBtn} onClick={() => canPrev && setPage(page - 1)} disabled={!canPrev || loading} aria-label="Previous page" title="Previous page">
          <i className="bi bi-chevron-left" />
        </button>

        <div className={styles.pageInfo}>
          Page <strong>{page}</strong> / {totalPages}
          <span className="ms-2 text-muted">({total} items)</span>
        </div>

        <button className={styles.pageBtn} onClick={() => canNext && setPage(page + 1)} disabled={!canNext || loading} aria-label="Next page" title="Next page">
          <i className="bi bi-chevron-right" />
        </button>
      </div>
    </aside>
  );
}
