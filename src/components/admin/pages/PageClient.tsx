"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PageRow } from "@/lib/page/types";
import { TopNav } from "@/components/admin/pages";
import PageList from "@/components/admin/pages/list/PageList";
import PageInspector from "@/components/admin/pages/list/PageInspector";
import styles from "@/styles/admin/page/page.module.css";

export default function UiBuilderListPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const initQ = sp.get("q") ?? "";
  const initStatus = (sp.get("status") as "all" | "DRAFT" | "PUBLISHED" | null) ?? "all";
  const initSort = (sp.get("sort") as "updatedAt" | "createdAt" | "title" | null) ?? "updatedAt";
  const initDir = (sp.get("dir") as "asc" | "desc" | null) ?? "desc";
  const initPage = Math.max(1, Number(sp.get("page") || "1"));
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState(initQ);
  const [status, setStatus] = useState<"all" | "DRAFT" | "PUBLISHED">(initStatus);
  const [sortKey, setSortKey] = useState<"updatedAt" | "createdAt" | "title">(initSort);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(initDir);
  const PAGE_SIZE = 8;
  const [page, setPage] = useState<number>(initPage);
  const [total, setTotal] = useState<number>(0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [activeId, setActiveId] = useState<string | null>(sp.get("id"));
  const active = useMemo(() => pages.find((p) => p.id === activeId) ?? null, [pages, activeId]);
  const [msg, setMsg] = useState("");

  async function loadPages() {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        q,
        offset: String((page - 1) * PAGE_SIZE),
        limit: String(PAGE_SIZE),
        sort: sortKey,
        dir: sortDir,
      });
      if (status !== "all") params.set("status", status);
      const res = await fetch(`/api/admin/pages/list?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load pages");
      const json = await res.json();
      const items: PageRow[] = json.items || [];
      setPages(items);
      setTotal(json.total ?? items.length);
      setHasMore(!!json.hasMore);
      if (!activeId && items.length) setActiveId(items[0].id);
      if (activeId && !items.find((p) => p.id === activeId)) setActiveId(items[0]?.id ?? null);
      const nextTotalPages = Math.max(1, Math.ceil((json.total ?? 0) / PAGE_SIZE));
      if (page > nextTotalPages) setPage(nextTotalPages);
    } catch (e: any) {
      setMsg(e?.message || "Load pages error");
      setTimeout(() => setMsg(""), 1800);
    } finally {
      setLoading(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this page? This action is irreversible.")) return;
    try {
      const res = await fetch(`/api/admin/pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      const willBeCount = total - 1;
      const willBeTotalPages = Math.max(1, Math.ceil(willBeCount / PAGE_SIZE));
      if (page > willBeTotalPages) setPage(willBeTotalPages);

      await loadPages();
      if (activeId === id) setActiveId(null);
    } catch (e: any) {
      setMsg(e?.message || "Delete error");
      setTimeout(() => setMsg(""), 1800);
    }
  }

  async function dup(id: string) {
    try {
      const res = await fetch(`/api/admin/pages/${id}/duplicate`, { method: "POST" });
      if (!res.ok) throw new Error("Duplicate failed");
      await loadPages();
      setMsg("Đã nhân bản page");
      setTimeout(() => setMsg(""), 1200);
    } catch (e: any) {
      setMsg(e?.message || "Duplicate error");
      setTimeout(() => setMsg(""), 1800);
    }
  }

  async function pub(id: string, next: "publish" | "unpublish") {
    try {
      const res = await fetch(`/api/admin/pages/${next}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error(`${next} failed`);
      await loadPages();
    } catch (e: any) {
      setMsg(e?.message || "Publish/Unpublish error");
      setTimeout(() => setMsg(""), 1800);
    }
  }

  const openEdit = (id: string) => router.push(`/admin/builder/page/add?id=${encodeURIComponent(id)}`);
  const openCreate = () => router.push(`/admin/menu`);

  function openPreview(page: PageRow) {
    if (!page.path) return;
    if (/^https?:\/\//i.test(page.path)) {
      window.open(page.path, "_blank");
      return;
    }
    const base = page.siteDomain ? `http://${page.siteDomain}` : "";
    window.open(`${base}${page.path.startsWith("/") ? page.path : `/${page.path}`}`, "_blank");
  }

  useEffect(() => {
    loadPages();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      loadPages();
    }, 260);
    return () => clearTimeout(t);
  }, [q, status, sortKey, sortDir, page]);

  return (
    <div className={styles.wrap}>
      <TopNav pageId={null} mode="pages" onSwitch={() => {}} onSave={() => {}} saving={false} onCreate={openCreate} />

      {msg && (
        <div className="container-fluid">
          <div className="alert alert-warning py-2 px-3 my-2 small">
            <i className="bi bi-exclamation-triangle me-1" /> {msg}
          </div>
        </div>
      )}

      <div className={styles.grid}>
        <PageList
          pages={pages}
          loading={loading}
          activeId={activeId}
          onSelect={setActiveId}
          q={q}
          setQ={setQ}
          status={status}
          setStatus={setStatus}
          sortKey={sortKey}
          sortDir={sortDir}
          setSortKey={setSortKey}
          setSortDir={setSortDir}
          onRefresh={loadPages}
          page={page}
          setPage={setPage}
          total={total}
          totalPages={totalPages}
          hasMore={hasMore}
        />

        <PageInspector
          page={active}
          onEdit={() => active && openEdit(active.id)}
          onPreview={() => active && openPreview(active)}
          onPublish={() => active && pub(active.id, "publish")}
          onUnpublish={() => active && pub(active.id, "unpublish")}
          onDuplicate={() => active && dup(active.id)}
          onDelete={() => active && del(active.id)}
        />
      </div>
    </div>
  );
}
