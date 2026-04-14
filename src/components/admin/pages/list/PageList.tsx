"use client";

import React, { useCallback, useMemo } from "react";
import { useModal } from "@/components/admin/shared/common/modal";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
import styles from "@/styles/admin/pages/pageList.module.css";
import type { PageRow } from "@/lib/pages/types";

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

function initialsFromTitle(title?: string) {
  const s = (title || "").trim();
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
  const { t } = useAdminI18n();

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
      modal.error(
        t("pageList.common.error"),
        (e as Error)?.message || t("pageList.errors.loadPages"),
      );
    }
  }, [onRefresh, modal, t]);

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
          <h2>{t("pageList.title")}</h2>
          <button
            className={styles.refreshBtn}
            type="button"
            onClick={() => void handleRefresh()}
            disabled={loading}
            aria-label={t("pageList.common.refresh")}
            title={t("pageList.common.refresh")}
          >
            <i className={`bi bi-arrow-repeat ${styles.iconLeft}`} />
          </button>
        </div>

        <div className={styles.toolbar}>
          <select
            className={styles.select}
            value={siteId || "all"}
            onChange={onSiteChange}
            aria-label={t("pageList.filters.site")}
            disabled={!!sitesLoading}
          >
            <option value="all">
              {sitesLoading ? t("pageList.sites.loading") : t("pageList.sites.all")}
            </option>
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
            aria-label={t("pageList.filters.status")}
            disabled={loading}
          >
            <option value="all">{t("pageList.status.all")}</option>
            <option value="PUBLISHED">{t("pageList.status.published")}</option>
            <option value="DRAFT">{t("pageList.status.draft")}</option>
          </select>

          <button
            className={styles.ghostBtn}
            type="button"
            onClick={() => toggleSort("updatedAt")}
            title={`${t("pageList.common.sort")} ${t("pageList.fields.updated")}`}
            disabled={loading}
          >
            <i className={`bi ${updatedSortIcon}`} />
            <span className={styles.btnText}>{t("pageList.fields.updated")}</span>
          </button>

          <button
            className={styles.ghostBtn}
            type="button"
            onClick={() => toggleSort("title")}
            title={`${t("pageList.common.sort")} ${t("pageList.fields.title")}`}
            disabled={loading}
          >
            <i className={`bi ${titleSortIcon}`} />
            <span className={styles.btnText}>{t("pageList.fields.title")}</span>
          </button>
          <div className={styles.searchBox}>
            <i className={`bi bi-search ${styles.searchIcon}`} />
            <input
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder={t("pageList.searchPlaceholder")}
              aria-label={t("pageList.searchAria")}
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
                title={t("pageList.common.clear")}
                aria-label={t("pageList.common.clear")}
                disabled={loading}
              >
                <i className="bi bi-x-lg" />
              </button>
            )}
          </div>
        </div>

        {sitesErr ? <div className={styles.empty}>{sitesErr}</div> : null}
      </div>

      <div className={styles.listWrap} id="listWrap">
        {pages.length === 0 && !loading && <div className={styles.empty}>{t("pageList.noResults")}</div>}

        {pages.map((p) => {
          const ts = p.updatedAt || p.createdAt || 0;
          const dateText = ts ? dateFormatter.format(new Date(ts)) : t("pageList.common.noDate");

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
                  <span className={styles.titleText}>{p.title || t("pageList.untitled")}</span>
                  <span
                    className={`${styles.badge} ${p.status === "PUBLISHED" ? styles.badgeGreen : styles.badgeGray}`}
                  >
                    {p.status === "PUBLISHED"
                      ? t("pageList.status.published")
                      : t("pageList.status.draft")}
                  </span>
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
        <button
          className={styles.pageBtn}
          type="button"
          onClick={() => canPrev && setPage(page - 1)}
          disabled={!canPrev || loading}
          aria-label={t("pageList.pagination.previous")}
          title={t("pageList.pagination.previous")}
        >
          <i className="bi bi-chevron-left" />
        </button>

        <div className={styles.pageInfo}>
          <span>
            {t("pageList.pagination.page")} <strong>{page}</strong> / {totalPages}
          </span>
          <span className={styles.muted}>
            ({total} {t("pageList.pagination.items")})
          </span>
        </div>

        <button
          className={styles.pageBtn}
          type="button"
          onClick={() => canNext && setPage(page + 1)}
          disabled={!canNext || loading}
          aria-label={t("pageList.pagination.next")}
          title={t("pageList.pagination.next")}
        >
          <i className="bi bi-chevron-right" />
        </button>
      </div>
    </aside>
  );
}

export default React.memo(PageList);