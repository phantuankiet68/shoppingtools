"use client";

import React, { useCallback, useMemo } from "react";
import { useModal } from "@/components/admin/shared/common/modal";
import styles from "@/styles/admin/builder/pages/pageList.module.css";
import type { PageRow } from "@/lib/builder/pages/types";
import { PAGE_MESSAGES as M } from "@/features/builder/pages/messages";

type SortKey = "updatedAt" | "createdAt" | "title";
type SortDir = "asc" | "desc";
type StatusFilter = "all" | "DRAFT" | "PUBLISHED";

type SiteOption = { id: string; name?: string };
type SiteFilter = "all" | string;

type PageRowWithSite = PageRow & {
  siteId?: string | null;
  site_id?: string | null;
};

type Props = {
  pages: PageRowWithSite[];
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

  sites: SiteOption[];
  sitesLoading?: boolean;
  sitesErr?: string | null;
  siteId: SiteFilter;
  setSiteId: (v: SiteFilter) => void;

  onRefresh: () => void | Promise<void>;

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

function PageList({
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
  sites,
  sitesLoading,
  sitesErr,
  siteId,
  setSiteId,
  onRefresh,
  page,
  setPage,
  total,
  totalPages,
}: Props) {
  const modal = useModal();

  const toggleSort = useCallback(
    (k: SortKey) => {
      setPage(1);

      if (sortKey === k) {
        setSortDir(sortDir === "asc" ? "desc" : "asc");
        return;
      }

      setSortKey(k);
      setSortDir(k === "title" ? "asc" : "desc");
    },
    [sortKey, sortDir, setSortDir, setSortKey, setPage],
  );

  const handleRefresh = useCallback(async () => {
    try {
      await onRefresh();
    } catch (e: unknown) {
      modal.error("Error", (e as Error)?.message || M.loadPagesError);
    }
  }, [onRefresh, modal]);

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const dateFormatter = useMemo(() => {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  }, []);

  const onStatusChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setStatus(e.target.value as StatusFilter);
      setPage(1);
    },
    [setStatus, setPage],
  );

  const onSiteChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSiteId(e.target.value as SiteFilter);
      setPage(1);
    },
    [setSiteId, setPage],
  );

  const titleSortIcon =
    sortKey === "title" ? (sortDir === "asc" ? "bi-sort-alpha-down" : "bi-sort-alpha-up") : "bi-sort-alpha-down";

  const updatedSortIcon =
    sortKey === "updatedAt" ? (sortDir === "asc" ? "bi-chevron-up" : "bi-chevron-down") : "bi-arrow-down-up";

  return (
    <aside className={styles.leftPane}>
      <div className={styles.leftHead}>
        <div className={styles.listToolbar}>
          <h2>List Pages</h2>
          <button
            className={styles.refreshBtn}
            type="button"
            onClick={() => void handleRefresh()}
            disabled={loading}
            aria-label={M.refresh}
            title={M.refresh}
          >
            <i className={`bi bi-arrow-repeat ${styles.iconLeft}`} />
          </button>
        </div>

        <div className={styles.toolbar}>
          <select
            className={styles.select}
            value={siteId || "all"}
            onChange={onSiteChange}
            aria-label="Site filter"
            disabled={!!sitesLoading}
          >
            <option value="all">{sitesLoading ? "Loading sites..." : M.allSites}</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name || s.id}
              </option>
            ))}
          </select>

          <select
            className={styles.select}
            value={status}
            onChange={onStatusChange}
            aria-label="Status filter"
            disabled={loading}
          >
            <option value="all">{M.allStatuses}</option>
            <option value="PUBLISHED">{M.publish}</option>
            <option value="DRAFT">{M.unpublish}</option>
          </select>

          <button
            className={styles.ghostBtn}
            type="button"
            onClick={() => toggleSort("updatedAt")}
            title={`${M.sort} by ${M.updated}`}
            disabled={loading}
          >
            <i className={`bi ${updatedSortIcon}`} />
            <span className={styles.btnText}>{M.updated}</span>
          </button>

          <button
            className={styles.ghostBtn}
            type="button"
            onClick={() => toggleSort("title")}
            title={`${M.sort} by ${M.title}`}
            disabled={loading}
          >
            <i className={`bi ${titleSortIcon}`} />
            <span className={styles.btnText}>{M.title}</span>
          </button>
        </div>

        {sitesErr ? <div className={styles.empty}>{sitesErr}</div> : null}

        <div className={styles.searchBox}>
          <i className={`bi bi-search ${styles.searchIcon}`} />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder={M.searchPlaceholder}
            aria-label="Search pages"
            disabled={loading}
          />
          {q && (
            <button
              className={styles.clearBtn}
              onClick={() => {
                setQ("");
                setPage(1);
              }}
              type="button"
              title="Clear"
              aria-label="Clear"
              disabled={loading}
            >
              <i className="bi bi-x-lg" />
            </button>
          )}
        </div>
      </div>

      <div className={styles.listWrap} id="listWrap">
        {pages.length === 0 && !loading && <div className={styles.empty}>{M.noResults}</div>}

        {pages.map((p) => {
          const ts = p.updatedAt || p.createdAt || 0;
          const dateText = ts ? dateFormatter.format(new Date(ts)) : "(no date)";
          const site = p.siteId ?? p.site_id ?? undefined;

          return (
            <button
              key={p.id}
              type="button"
              className={`${styles.item} ${styles.sheen} ${p.id === activeId ? styles.itemActive : ""}`}
              onClick={() => onSelect(p.id)}
              title={p.title || p.slug}
            >
              <div className={styles.itemIcon}>{initialsFromTitle(p.title || p.slug)}</div>

              <div className={styles.itemMain}>
                <div className={styles.itemTitle}>
                  <span className={styles.titleText}>{p.title || M.untitled}</span>
                  <span
                    className={`${styles.badge} ${p.status === "PUBLISHED" ? styles.badgeGreen : styles.badgeGray}`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className={styles.meta}>
                  <code className={styles.code}>{p.slug}</code>
                  <span className={styles.dot}>•</span>
                  <code className={styles.code}>{p.path}</code>

                  {site && (
                    <>
                      <span className={styles.dot}>•</span>
                      <code className={styles.code}>{site}</code>
                    </>
                  )}
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
        <button
          className={styles.pageBtn}
          type="button"
          onClick={() => canPrev && setPage(page - 1)}
          disabled={!canPrev || loading}
          aria-label="Previous page"
          title="Previous page"
        >
          <i className="bi bi-chevron-left" />
        </button>

        <div className={styles.pageInfo}>
          <span>
            {M.page} <strong>{page}</strong> / {totalPages}
          </span>
          <span className={styles.muted}>({total} items)</span>
        </div>

        <button
          className={styles.pageBtn}
          type="button"
          onClick={() => canNext && setPage(page + 1)}
          disabled={!canNext || loading}
          aria-label="Next page"
          title="Next page"
        >
          <i className="bi bi-chevron-right" />
        </button>
      </div>
    </aside>
  );
}

export default React.memo(PageList);
