"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import type { PageRow } from "@/lib/page/types";
import { TopNav } from "@/components/admin/pages";
import PageList from "@/components/admin/pages/list/PageList";
import PageInspector from "@/components/admin/pages/list/PageInspector";
import styles from "./page.module.css";

type Locale = "vi" | "en" | "ja";

export default function UiBuilderListPage() {
  const router = useRouter();
  const { locale } = useParams<{ locale: Locale }>();
  const sp = useSearchParams();

  // ===== URL-derived filters
  const initQ = sp.get("q") ?? "";
  const initStatus = (sp.get("status") as "all" | "DRAFT" | "PUBLISHED" | null) ?? "all";
  const initSort = (sp.get("sort") as "updatedAt" | "createdAt" | "title" | "locale" | null) ?? "updatedAt";
  const initDir = (sp.get("dir") as "asc" | "desc" | null) ?? "desc";
  const initPage = Math.max(1, Number(sp.get("page") || "1")); // 👈 NEW

  // ===== List state
  const [pages, setPages] = useState<PageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState(initQ);
  const [status, setStatus] = useState<"all" | "DRAFT" | "PUBLISHED">(initStatus);
  const [sortKey, setSortKey] = useState<"updatedAt" | "createdAt" | "title" | "locale">(initSort);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(initDir);

  // 👇 NEW: pagination
  const PAGE_SIZE = 8;
  const [page, setPage] = useState<number>(initPage);
  const [total, setTotal] = useState<number>(0);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const [hasMore, setHasMore] = useState<boolean>(false);

  // selection
  const [activeId, setActiveId] = useState<string | null>(sp.get("id"));
  const active = useMemo(() => pages.find((p) => p.id === activeId) ?? null, [pages, activeId]);

  // alerts
  const [msg, setMsg] = useState("");

  // ===== URL sync
  const pushQuery = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status !== "all") params.set("status", status);
    params.set("sort", sortKey);
    params.set("dir", sortDir);
    params.set("page", String(page)); // 👈 NEW
    if (activeId) params.set("id", activeId);
    router.replace(`/api/admin/pages?${params.toString()}`);
  };

  // ===== API
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

      // 👇 Nên gọi theo route có locale (phù hợp chữ ký API bạn đang dùng)
      const res = await fetch(`/api/admin/pages?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to load pages");
      const json = await res.json(); // {items,total,hasMore}
      const items: PageRow[] = json.items || [];
      setPages(items);
      setTotal(json.total ?? items.length);
      setHasMore(!!json.hasMore);

      // ensure selection exists
      if (!activeId && items.length) setActiveId(items[0].id);
      if (activeId && !items.find((p) => p.id === activeId)) setActiveId(items[0]?.id ?? null);

      // nếu page > totalPages (ví dụ filter ra ít hơn), kéo page về cuối
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
    if (!confirm("Xoá page này? Hành động không thể hoàn tác.")) return;
    try {
      const res = await fetch(`/api/pages/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      // sau khi xoá, nếu trang hiện tại hết dữ liệu thì lùi 1 trang
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
      const res = await fetch(`/api/pages/${id}/duplicate`, { method: "POST" });
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
      const res = await fetch(`/api/pages/${next}`, {
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

  // open
  const openEdit = (id: string) => router.push(`/api/admin/pages/add?id=${encodeURIComponent(id)}`);
  const openCreate = () => router.push(`v1/menu`);

  // effects
  useEffect(() => {
    loadPages(); /* eslint-disable-next-line */
  }, []);
  useEffect(() => {
    const t = setTimeout(() => {
      loadPages();
      pushQuery();
    }, 260);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, [q, status, sortKey, sortDir, page]); // 👈 NEW: page
  useEffect(() => {
    pushQuery(); /* eslint-disable-next-line */
  }, [activeId]);

  function openPreview(page: PageRow) {
    if (!page.path) return;
    if (/^https?:\/\//i.test(page.path)) {
      window.open(page.path, "_blank");
      return;
    }
    const base = page.siteDomain ? `http://${page.siteDomain}` : "";
    window.open(`${base}${page.path.startsWith("/") ? page.path : `/${page.path}`}`, "_blank");

    console.log(base);
  }

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
