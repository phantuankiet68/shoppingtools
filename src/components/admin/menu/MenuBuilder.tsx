// app/components/menu/MenuBuilder.tsx
"use client";

import React, { useEffect, useMemo, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin/menu/menu.module.css";
import { useMenuStore, type Locale, type MenuSetKey, type SiteKind } from "@/components/admin/menu/state/useMenuStore";
import AllowedBlocks from "@/components/admin/menu/state/AllowedBlocks";
import MenuStructure from "@/components/admin/menu/state/MenuStructure";
import { flattenTriples } from "@/lib/menu/deriveTitleSlugPath";
import PopupNotice from "@/components/ui/PopupNotice";

function useStateSafe<T>(init: T) {
  const [val, setVal] = useState<T>(init);
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);
  return [ready ? val : init, setVal] as const;
}

type NoticeState = {
  open: boolean;
  title?: string;
  message?: string;
  variant?: "success" | "error" | "info" | "warning";
};

type SiteRow = {
  id: string;
  domain: string;
  name: string;
  localeDefault: "vi" | "en" | "ja";
};

type Props = {
  locale: Locale;
  siteId?: string;
};

export default function MenuBuilder() {
  const router = useRouter();
  const { currentSet, setCurrentSet, activeMenu, setActiveMenu, loadFromServer, saveToServer, siteKind, setSiteKind, templateKey } = useMenuStore();

  const [locale] = useStateSafe<Locale>("vi");
  const [saving, setSaving] = useStateSafe(false);
  const [loading, setLoading] = useStateSafe(false);
  const [refreshing, setRefreshing] = useState(false);

  const [notice, setNotice] = useState<NoticeState>({ open: false });
  const ioJson = useMemo(() => JSON.stringify(activeMenu, null, 2), [activeMenu]);

  const [sites, setSites] = useState<SiteRow[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/sites", { cache: "no-store" });
        if (!res.ok) throw new Error("Load sites failed");
        const data = await res.json();
        const list: SiteRow[] = data.items || [];
        setSites(list);

        const saved = typeof window !== "undefined" ? localStorage.getItem("ui.selectedSiteId") || "" : "";
        if (saved && list.some((s) => s.id === saved)) {
          setSelectedSiteId(saved);
        } else if (list.length) {
          setSelectedSiteId(list[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  useEffect(() => {
    if (selectedSiteId) localStorage.setItem("ui.selectedSiteId", selectedSiteId);
  }, [selectedSiteId]);

  useEffect(() => {
    if (!selectedSiteId) return;
    (async () => {
      try {
        setLoading(true);
        await loadFromServer(locale, currentSet, selectedSiteId);
      } finally {
        setLoading(false);
      }
    })();
  }, [selectedSiteId]);

  async function reloadAll({ hard = false }: { hard?: boolean } = {}) {
    try {
      setRefreshing(true);
      await loadFromServer(locale, currentSet, selectedSiteId);
      startTransition(() => {
        router.refresh();
      });
      if (hard) {
        setTimeout(() => {
          window.location.reload();
        }, 150);
      }
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSaveAll() {
    try {
      setSaving(true);
      await saveToServer(locale, currentSet, selectedSiteId);

      const triples = flattenTriples(locale, (activeMenu as any) ?? []);
      if (triples.length > 0) {
        const res = await fetch("/api/admin/pages/sync-from-menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteId: selectedSiteId || undefined, // ✅ gửi siteId
            locale,
            items: triples,
          }),
          cache: "no-store",
        });

        if (!res.ok) {
          const msg = await res.text().catch(() => "");
          throw new Error(`Sync SEO thất bại: ${msg || res.status}`);
        }

        await reloadAll({ hard: false });

        setNotice({
          open: true,
          title: "Đã lưu & đồng bộ SEO",
          message: "Menu và Page (title/slug/path) đã được đồng bộ (theo site đã chọn).",
          variant: "success",
        });
        return;
      }

      await reloadAll({ hard: false });
      setNotice({
        open: true,
        title: "Đã lưu Menu",
        message: "Không có thay đổi để đồng bộ SEO. Dữ liệu đã được load lại.",
        variant: "info",
      });
    } catch (e: any) {
      setNotice({
        open: true,
        title: "Lưu thất bại",
        message: e?.message ?? "Unknown error",
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }

  function exportJSON() {
    navigator.clipboard?.writeText(ioJson).then(
      () =>
        setNotice({
          open: true,
          title: "Đã copy JSON",
          message: "Nội dung menu hiện tại đã copy vào clipboard.",
          variant: "success",
        }),
      () =>
        setNotice({
          open: true,
          title: "Copy thất bại",
          message: "Trình duyệt không cho phép copy tự động.",
          variant: "warning",
        })
    );
  }

  function importJSONFromPrompt() {
    const text = prompt("Paste JSON cho bộ hiện tại");
    if (!text) return;
    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("Invalid JSON: phải là mảng");
      setActiveMenu(data);
      setNotice({
        open: true,
        title: "Import thành công",
        message: "Đã cập nhật menu theo JSON vừa nhập.",
        variant: "success",
      });
      startTransition(() => {
        router.refresh();
      });
    } catch (e: any) {
      setNotice({
        open: true,
        title: "Import lỗi",
        message: e?.message ?? "Unknown error",
        variant: "error",
      });
    }
  }

  return (
    <div className={styles.container}>
      <PopupNotice open={notice.open} title={notice.title} message={notice.message} variant={notice.variant} onClose={() => setNotice((s) => ({ ...s, open: false }))} autoHideMs={2800} />

      <header className={styles.topbar}>
        <h1 className={styles.h4}>⚙️ Menu Builder</h1>
        <div className={styles.topbarRight}>
          <div className={styles.inline}>
            <i className="bi bi-globe2" />
            <select
              className={`${styles.formSelectSm} ${styles.selectStyled}`}
              value={selectedSiteId}
              onChange={(e) => {
                setSelectedSiteId(e.target.value);
                startTransition(() => router.refresh());
              }}
              aria-label="Chọn Site">
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} — {s.domain} ({s.localeDefault})
                </option>
              ))}
            </select>
          </div>

          <div className={styles.inline}>
            <i className="bi bi-layers" />
            <select className={`${styles.formSelectSm} ${styles.selectStyled}`} value={siteKind} onChange={(e) => setSiteKind(e.target.value as SiteKind)} aria-label="Loại website">
              <option value="ecommerce">Bán hàng (eCommerce)</option>
              <option value="corporate">Doanh nghiệp (Corporate)</option>
              <option value="education">Học tập (Education)</option>
            </select>
          </div>
          <div className={styles.inline}>
            <i className="bi bi-diagram-3" />
            <select
              className={`${styles.formSelectSm} ${styles.selectStyled}`}
              value={currentSet}
              onChange={async (e) => {
                const setKey = e.target.value as MenuSetKey;
                setCurrentSet(setKey);
                setLoading(true);
                try {
                  await loadFromServer(locale, setKey, selectedSiteId);
                } finally {
                  setLoading(false);
                }
                startTransition(() => {
                  router.refresh();
                });
              }}
              aria-label="Chọn bộ menu">
              <option value="home">Menu cho Home</option>
              <option value="v1">Menu cho /v1 (có Submenu)</option>
            </select>
          </div>

          <div className={styles.inline} style={{ gap: 6 }}>
            <button
              className={`${styles.btn} ${styles.btnOutlineSecondary}`}
              disabled={loading || refreshing || !selectedSiteId}
              onClick={async () => {
                try {
                  setLoading(true);
                  await loadFromServer(locale, currentSet, selectedSiteId);
                  setNotice({
                    open: true,
                    title: "Đã tải từ DB",
                    message: "Menu đã được load theo site + locale + set.",
                    variant: "info",
                  });
                } finally {
                  setLoading(false);
                }
                startTransition(() => {
                  router.refresh();
                });
              }}
              title="Load menu từ DB theo site + locale + set">
              <i className="bi bi-download" /> {loading ? "Loading..." : refreshing ? "Refreshing..." : "Load từ DB"}
            </button>
          </div>

          <div className={styles.inline} style={{ gap: 6 }}>
            <button className={`${styles.btn} ${styles.btnOutlinePrimary}`} disabled={saving || !selectedSiteId} onClick={handleSaveAll} title="Lưu DB; sau đó đồng bộ Page theo Menu (site hiện tại)">
              <i className="bi bi-save" /> {saving ? "Saving..." : "Save về DB"}
            </button>
          </div>

          <div className={styles.inline} style={{ gap: 6 }}>
            <button className={`${styles.btn} ${styles.btnOutlineSuccess}`} onClick={exportJSON}>
              <i className="bi bi-clipboard" /> Copy JSON
            </button>
            <button className={`${styles.btn} ${styles.btnOutlineWarning}`} onClick={importJSONFromPrompt}>
              <i className="bi bi-upload" /> Import JSON
            </button>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <AllowedBlocks key={`ab-${currentSet}-${siteKind}-${templateKey}-${selectedSiteId}`} />
        </div>
        <div className={styles.rightCol}>
          <MenuStructure key={`ms-${currentSet}-${selectedSiteId}`} locale={locale} siteId={selectedSiteId} />

          <textarea
            className={`${styles.formControl} ${styles.mt}`}
            style={{
              position: "absolute",
              opacity: 0,
              pointerEvents: "none",
              height: 0,
              width: 0,
            }}
            rows={6}
            placeholder="Export/Import JSON cho bộ hiện tại"
            defaultValue={ioJson}
            onBlur={(e) => {
              try {
                const data = JSON.parse(e.target.value || "[]");
                if (Array.isArray(data)) setActiveMenu(data);
                startTransition(() => {
                  router.refresh();
                });
              } catch {}
            }}
          />
        </div>
      </div>
    </div>
  );
}
