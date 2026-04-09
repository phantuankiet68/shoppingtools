"use client";

import { useEffect, useMemo, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageList from "@/components/admin/pages/list/PageList";
import PageInspector from "@/components/admin/pages/list/PageInspector";
import { useModal } from "@/components/admin/shared/common/modal";
import styles from "@/styles/admin/pages/page/page.module.css";
import type { PageRowWithSite } from "@/services/pages/builderPages.service";
import { useBuilderPagesStore } from "@/store/pages/useBuilderPagesStore";
import { PAGE_MESSAGES } from "@/features/pages/messages";
import { TEMPLATES } from "@/constants/pages/templates.constants";

type StatusFilter = "all" | "DRAFT" | "PUBLISHED";
type SortKey = "updatedAt" | "createdAt" | "title";
type SortDir = "asc" | "desc";
type SiteFilter = "all" | string;

type TemplateGroup = "Topbar" | "Header" | "Footer" | "Sidebar" | null;

function normalizeText(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function detectTemplateGroup(page?: PageRowWithSite | null): TemplateGroup {
  if (!page) return null;

  const title = normalizeText(page.title);
  const slug = normalizeText(page.slug);
  const path = normalizeText(page.path);

  if (title === "topbar" || slug === "topbar" || path === "/topbar" || path.startsWith("/topbar/")) {
    return "Topbar";
  }

  if (title === "header" || slug === "header" || path === "/header" || path.startsWith("/header/")) {
    return "Header";
  }

  if (title === "footer" || slug === "footer" || path === "/footer" || path.startsWith("/footer/")) {
    return "Footer";
  }

  if (title === "sidebar" || slug === "sidebar" || path === "/sidebar" || path.startsWith("/sidebar/")) {
    return "Sidebar";
  }

  return null;
}

function getTemplateMetaByGroup(group: TemplateGroup) {
  if (!group) return null;

  const matched = TEMPLATES.find((tpl) => normalizeText(tpl.label) === normalizeText(group));

  if (!matched) return null;

  return {
    id: matched.id,
    name: matched.label,
  };
}

export default function PageClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const modal = useModal();

  const initQ = sp.get("q") ?? "";
  const initStatus = (sp.get("status") as StatusFilter | null) ?? "all";
  const initSort = (sp.get("sort") as SortKey | null) ?? "updatedAt";
  const initDir = (sp.get("dir") as SortDir | null) ?? "desc";

  const pageParam = Number(sp.get("page"));
  const initPage = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

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
    sitesLoading,
    sitesErr,
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

    params.set("sort", sortKey);
    params.set("dir", sortDir);

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

  const openEdit = (pageRow: PageRowWithSite) => {
    const params = new URLSearchParams({
      id: pageRow.id,
    });

    const detectedGroup = detectTemplateGroup(pageRow);
    const templateMeta = getTemplateMetaByGroup(detectedGroup);

    if (detectedGroup && templateMeta) {
      params.set("templateGroup", detectedGroup);
      params.set("templateId", templateMeta.id);
      params.set("templateName", templateMeta.name);
    }

    router.push(`/admin/builder/pages/add?${params.toString()}`);
  };

  function openPreview(p: PageRowWithSite) {
    if (!p.path) return;

    if (/^https?:\/\//i.test(p.path)) {
      window.open(p.path, "_blank");
      return;
    }

    const base = p.siteDomain ? `http://${p.siteDomain}` : "";
    const nextPath = p.path.startsWith("/") ? p.path : `/${p.path}`;
    window.open(`${base}${nextPath}`, "_blank");
  }

  useEffect(() => {
    const t = window.setTimeout(() => {
      loadPages().catch((e: unknown) => {
        modal.error("Error", (e as Error)?.message || PAGE_MESSAGES.loadPagesError);
      });
    }, 260);

    return () => window.clearTimeout(t);
  }, [loadPages, modal]);

  const didMountRef = useRef(false);
  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    setPage(1);
  }, [siteId, setPage]);

  useEffect(() => {
    loadSites().catch((e: unknown) => {
      modal.error("Error", (e as Error)?.message || "Failed to load sites.");
    });
  }, [loadSites, modal]);

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

  const activeTemplateGroup = useMemo(() => detectTemplateGroup(active), [active]);

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
          sitesLoading={sitesLoading}
          sitesErr={sitesErr}
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
          onEdit={() => active && openEdit(active)}
          onPreview={() => active && openPreview(active)}
          onPublish={() => active && pubAction(active.id, "publish")}
          onUnpublish={() => active && pubAction(active.id, "unpublish")}
          onDuplicate={() => active && dupAction(active.id)}
          onDelete={() => active && del(active.id)}
        />
      </div>

      {active && activeTemplateGroup ? (
        <div style={{ display: "none" }} data-template-group={activeTemplateGroup} />
      ) : null}
    </div>
  );
}
