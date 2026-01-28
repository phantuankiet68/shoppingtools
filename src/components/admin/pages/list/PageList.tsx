"use client";

import React, { useCallback, useMemo } from "react";
import styles from "@/styles/admin/pages/pageList.module.css";
import type { PageRow } from "@/lib/page/types";

type SortKey = "updatedAt" | "createdAt" | "title";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | "DRAFT" | "PUBLISHED";

type Props = {
  pages: PageRow[];
  loading: boolean;
  activeId: string | null;
  onSelect: (id: string) => void;
  q: string;
  setQ: (v: string) => void;
  status: StatusFilter;
  setStatus: (v: StatusFilter) => void;
  sortKey: SortKey;
  sortDir: SortDir;
  setSortKey: (k: SortKey) => void;
  setSortDir: (d: SortDir) => void;
  onRefresh: () => void;
  page: number;
  setPage: (n: number) => void;
  total: number;
  totalPages: number;
};

function initialsFromTitle(t?: string) {
  const s = (t || "").trim();
  if (!s) return "PG";
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((x) => x[0]?.toUpperCase() || "").join("") || "PG";
}

export default function PageList({ pages, loading, activeId, onSelect, q, setQ, status, setStatus, sortKey, sortDir, setSortKey, setSortDir, onRefresh, page, setPage, total, totalPages }: Props) {
  const toggleSort = useCallback(
    (k: SortKey) => {
      if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
      else {
        setSortKey(k);
        setSortDir(k === "title" ? "asc" : "desc");
      }
    },
    [sortKey, sortDir, setSortDir, setSortKey],
  );

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, { year: "numeric", month: "2-digit", day: "2-digit" });
  }, []);

  const onStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStatus(e.target.value as StatusFilter);
    },
    [setStatus],
  );

  const titleSortIcon = sortKey === "title" ? (sortDir === "asc" ? "bi-sort-alpha-down" : "bi-sort-alpha-up") : "bi-sort-alpha-down";

  const updatedSortIcon = sortKey === "updatedAt" ? (sortDir === "asc" ? "bi-chevron-up" : "bi-chevron-down") : "bi-arrow-down-up";

  return (
    <aside className={styles.leftPane}>
      <div className={styles.leftHead}>
        <div className={styles.searchBox}>
          <i className={`bi bi-search ${styles.searchIcon}`} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by title / slug / path…" />
          {q && (
            <button className={styles.clearBtn} onClick={() => setQ("")} type="button" title="Clear" aria-label="Clear">
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>

        <div className={styles.toolbar}>
          <select className={styles.select} value={status} onChange={onStatusChange} aria-label="Status filter">
            <option value="all">All</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
          </select>

          <button className={styles.ghostBtn} type="button" onClick={() => toggleSort("updatedAt")} title="Sort by updated">
            <i className={`bi ${updatedSortIcon}`} />
            <span className={styles.btnText}>Updated</span>
          </button>

          <button className={styles.ghostBtn} type="button" onClick={() => toggleSort("title")} title="Sort by title">
            <i className={`bi ${titleSortIcon}`} />
            <span className={styles.btnText}>Title</span>
          </button>

          <button className={styles.refreshBtn} type="button" onClick={onRefresh} disabled={loading} aria-label="Refresh">
            <i className={`bi bi-arrow-repeat ${styles.iconLeft}`} />
          </button>
        </div>
      </div>

      <div className={styles.listWrap} id="listWrap">
        {pages.length === 0 && !loading && <div className={styles.empty}>Không có trang nào.</div>}

        {pages.map((p) => {
          const ts = p.updatedAt || p.createdAt || Date.now();
          const dateText = dateFormatter.format(new Date(ts));

          return (
            <button key={p.id} type="button" className={`${styles.item} ${styles.sheen} ${p.id === activeId ? styles.itemActive : ""}`} onClick={() => onSelect(p.id)} title={p.title || p.slug}>
              <div className={styles.itemIcon}>{initialsFromTitle(p.title || p.slug)}</div>

              <div className={styles.itemMain}>
                <div className={styles.itemTitle}>
                  <span className={styles.titleText}>{p.title || "(untitled)"}</span>
                  <span className={`${styles.badge} ${p.status === "PUBLISHED" ? styles.badgeGreen : styles.badgeGray}`}>{p.status}</span>
                </div>

                <div className={styles.meta}>
                  <code className={styles.code}>{p.slug}</code>
                  <span className={styles.dot}>•</span>
                  <code className={styles.code}>{p.path}</code>
                </div>
              </div>

              <div className={styles.itemTime}>{dateText}</div>
            </button>
          );
        })}

        {loading && (
          <>
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
            <div className={styles.skeleton} />
          </>
        )}
      </div>

      <div className={styles.pager}>
        <button className={styles.pageBtn} type="button" onClick={() => canPrev && setPage(page - 1)} disabled={!canPrev || loading} aria-label="Previous page" title="Previous page">
          <i className="bi bi-chevron-left" />
        </button>

        <div className={styles.pageInfo}>
          <span>
            Page <strong>{page}</strong> / {totalPages}
          </span>
          <span className={styles.muted}>({total} items)</span>
        </div>

        <button className={styles.pageBtn} type="button" onClick={() => canNext && setPage(page + 1)} disabled={!canNext || loading} aria-label="Next page" title="Next page">
          <i className="bi bi-chevron-right" />
        </button>
      </div>
    </aside>
  );
}
