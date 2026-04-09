// src/store/useBuilderPagesStore.ts
"use client";

import { useCallback, useMemo, useState } from "react";
import type { PageRowWithSite, SiteFilter } from "@/services/pages/builderPages.service";
import {
  deletePage,
  duplicatePage,
  fetchPagesList,
  publishPage,
  unpublishPage,
} from "@/services/pages/builderPages.service";
import { useSiteStore } from "@/store/site/site.store";

type StatusFilter = "all" | "DRAFT" | "PUBLISHED";
type SortKey = "updatedAt" | "createdAt" | "title";
type SortDir = "asc" | "desc";

export function useBuilderPagesStore(init: {
  q: string;
  status: StatusFilter;
  sortKey: SortKey;
  sortDir: SortDir;
  page: number;
  siteId: SiteFilter;
  activeId: string | null;
}) {
  const PAGE_SIZE = 7;

  const [pages, setPages] = useState<PageRowWithSite[]>([]);
  const [loading, setLoading] = useState(false);

  const [q, setQ] = useState(init.q);
  const [status, setStatus] = useState<StatusFilter>(init.status);
  const [sortKey, setSortKey] = useState<SortKey>(init.sortKey);
  const [sortDir, setSortDir] = useState<SortDir>(init.sortDir);
  const [page, setPage] = useState<number>(init.page);
  const [total, setTotal] = useState<number>(0);
  const [activeId, setActiveId] = useState<string | null>(init.activeId);

  const sites = useSiteStore((state) => state.sites);
  const sitesLoading = useSiteStore((state) => state.loading);
  const sitesErr = useSiteStore((state) => state.err);
  const loadSites = useSiteStore((state) => state.loadSites);

  const [siteId, setSiteIdState] = useState<SiteFilter>(init.siteId ?? "all");

  const setSiteId = useCallback((next: SiteFilter) => {
    setSiteIdState(next);
  }, []);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(total / PAGE_SIZE)), [total]);

  const active = useMemo(() => {
    return pages.find((p) => p.id === activeId) ?? null;
  }, [pages, activeId]);

  const loadPages = useCallback(async () => {
    setLoading(true);
    try {
      const { items, total } = await fetchPagesList({
        q,
        page,
        pageSize: PAGE_SIZE,
        status,
        sortKey,
        sortDir,
        siteId,
      });

      setPages(items);
      setTotal(total);

      setActiveId((prev) => {
        if (!prev && items.length) return items[0].id;
        if (prev && !items.find((p) => p.id === prev)) return items[0]?.id ?? null;
        return prev;
      });

      const nextTotalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
      if (page > nextTotalPages) setPage(nextTotalPages);
    } finally {
      setLoading(false);
    }
  }, [q, page, status, sortKey, sortDir, siteId]);

  const remove = useCallback(
    async (id: string) => {
      await deletePage(id);

      const willBeCount = total - 1;
      const willBeTotalPages = Math.max(1, Math.ceil(willBeCount / PAGE_SIZE));
      if (page > willBeTotalPages) setPage(willBeTotalPages);

      await loadPages();

      if (activeId === id) {
        setActiveId(null);
      }
    },
    [total, page, loadPages, activeId],
  );

  const dup = useCallback(
    async (id: string) => {
      await duplicatePage(id);
      await loadPages();
    },
    [loadPages],
  );

  const pub = useCallback(
    async (id: string, next: "publish" | "unpublish") => {
      if (next === "publish") await publishPage(id);
      else await unpublishPage(id);

      await loadPages();
    },
    [loadPages],
  );

  return useMemo(
    () => ({
      pages,
      loading,
      q,
      status,
      sortKey,
      sortDir,
      sites,
      sitesLoading,
      sitesErr,
      siteId,
      page,
      total,
      totalPages,
      activeId,
      active,

      setQ,
      setStatus,
      setSortKey,
      setSortDir,
      setSiteId,
      setPage,
      setActiveId,

      loadSites,
      loadPages,
      remove,
      dup,
      pub,

      PAGE_SIZE,
    }),
    [
      pages,
      loading,
      q,
      status,
      sortKey,
      sortDir,
      sites,
      sitesLoading,
      sitesErr,
      siteId,
      page,
      total,
      totalPages,
      activeId,
      active,
      setSiteId,
      loadSites,
      loadPages,
      remove,
      dup,
      pub,
    ],
  );
}
