"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageList from "@/components/admin/builder/pages/list/PageList";
import PageInspector from "@/components/admin/builder/pages/list/PageInspector";
import { useModal } from "@/components/admin/shared/common/modal";
import styles from "@/styles/admin/builder/pages/page/page.module.css";
import type { PageRowWithSite } from "@/services/builder/pages/builderPages.service";
import { useBuilderPagesStore } from "@/store/builder/pages/useBuilderPagesStore";
import { PAGE_MESSAGES } from "@/features/builder/pages/messages";

type StatusFilter = "all" | "DRAFT" | "PUBLISHED";
type SortKey = "updatedAt" | "createdAt" | "title";
type SortDir = "asc" | "desc";
type SiteFilter = "all" | string;

export default function UiBuilderListPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const modal = useModal();

  const initQ = sp.get("q") ?? "";
  const initStatus = (sp.get("status") as StatusFilter | null) ?? "all";
  const initSort = (sp.get("sort") as SortKey | null) ?? "updatedAt";
  const initDir = (sp.get("dir") as SortDir | null) ?? "desc";
  const initPage = Math.max(1, Number(sp.get("page") || "1"));
  const initSiteId = (sp.get("siteId") as SiteFilter | null) ?? "all";
  const initActiveId = sp.get("id");

  const store = useBuilderPagesStore({
    q: initQ,
    status: initStatus,
    sortKey: initSort,
    sortDir: initDir,
    page: initPage,
    siteId: initSiteId,
    activeId: initActiveId,
  });

  const {
    q,
    status,
    sortKey,
    sortDir,
    siteId,
    page,
    activeId,
    loadSites,
    loadPages,
    setPage,
    setActiveId,
    remove,
    dup,
    pub,
    pages,
    loading,
    sites,
    total,
    totalPages,
    active,
  } = store;

  useEffect(() => {
    const params = new URLSearchParams(sp.toString());

    if (q) params.set("q", q);
    else params.delete("q");

    if (status !== "all") params.set("status", status);
    else params.delete("status");

    if (sortKey) params.set("sort", sortKey);
    if (sortDir) params.set("dir", sortDir);

    if (siteId !== "all") params.set("siteId", siteId);
    else params.delete("siteId");

    if (page !== 1) params.set("page", String(page));
    else params.delete("page");

    if (activeId) params.set("id", activeId);
    else params.delete("id");

    const nextSearch = params.toString();
    if (nextSearch !== sp.toString()) {
      router.replace(`?${nextSearch}`, { scroll: false });
    }
  }, [q, status, sortKey, sortDir, siteId, page, activeId, router, sp]);

  const openEdit = (id: string) => {
    router.push(`/admin/builder/pages/add?id=${encodeURIComponent(id)}`);
  };

  function openPreview(p: PageRowWithSite) {
    if (!p.path) return;

    if (/^https?:\/\//i.test(p.path)) {
      window.open(p.path, "_blank");
      return;
    }

    const base = p.siteDomain ? `http://${p.siteDomain}` : "";
    const path = p.path.startsWith("/") ? p.path : `/${p.path}`;
    window.open(`${base}${path}`, "_blank");
  }

  useEffect(() => {
    loadSites().catch((e: unknown) => {
      modal.error("Error", (e as Error)?.message || "Failed to load sites.");
    });
  }, [loadSites, modal]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      loadPages().catch((e: unknown) => {
        modal.error("Error", (e as Error)?.message || PAGE_MESSAGES.loadPagesError);
      });
    }, 260);

    return () => window.clearTimeout(t);
  }, [loadPages, modal]);

  useEffect(() => {
    setPage(1);
  }, [siteId, setPage]);

  async function del(id: string) {
    const current = pages.find((p) => p.id === id);

    modal.confirmDelete(
      "Delete page?",
      `Delete “${current?.title ?? "this page"}”? This action cannot be undone.`,
      async () => {
        try {
          await remove(id);
          modal.success("Success", `Deleted “${current?.title ?? "this page"}” successfully.`);
        } catch (e: unknown) {
          modal.error("Error", (e as Error)?.message || PAGE_MESSAGES.deleteError);
        }
      },
    );
  }

  async function dupAction(id: string) {
    const current = pages.find((p) => p.id === id);

    try {
      await dup(id);
      modal.success("Success", `Duplicated “${current?.title ?? "this page"}” successfully.`);
    } catch (e: unknown) {
      modal.error("Error", (e as Error)?.message || PAGE_MESSAGES.duplicateError);
    }
  }

  async function pubAction(id: string, next: "publish" | "unpublish") {
    const current = pages.find((p) => p.id === id);

    try {
      await pub(id, next);
      modal.success(
        "Success",
        next === "publish"
          ? `Published “${current?.title ?? "this page"}” successfully.`
          : `Unpublished “${current?.title ?? "this page"}” successfully.`,
      );
    } catch (e: unknown) {
      modal.error("Error", (e as Error)?.message || PAGE_MESSAGES.publishError);
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.grid}>
        <PageList
          pages={pages}
          loading={loading}
          activeId={activeId}
          onSelect={setActiveId}
          q={q}
          setQ={store.setQ}
          status={status}
          setStatus={store.setStatus}
          sortKey={sortKey}
          sortDir={sortDir}
          setSortKey={store.setSortKey}
          setSortDir={store.setSortDir}
          sites={sites}
          siteId={siteId}
          setSiteId={store.setSiteId}
          onRefresh={loadPages}
          page={page}
          setPage={setPage}
          total={total}
          totalPages={totalPages}
        />

        <PageInspector
          page={active}
          onEdit={() => active && openEdit(active.id)}
          onPreview={() => active && openPreview(active)}
          onPublish={() => active && pubAction(active.id, "publish")}
          onUnpublish={() => active && pubAction(active.id, "unpublish")}
          onDuplicate={() => active && dupAction(active.id)}
          onDelete={() => active && del(active.id)}
        />
      </div>
    </div>
  );
}
