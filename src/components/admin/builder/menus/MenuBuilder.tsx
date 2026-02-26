"use client";

import React, { startTransition, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin/menu/menu.module.css";
import { useMenuStore, type Locale, type MenuSetKey, type SiteKind } from "@/components/admin/menu/state/useMenuStore";
import AllowedBlocks from "@/components/admin/menu/state/AllowedBlocks";
import MenuStructure from "@/components/admin/menu/state/MenuStructure";
import { flattenTriples } from "@/lib/menu/deriveTitleSlugPath";
import PopupNotice from "@/components/ui/PopupNotice";

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
  localeDefault: "en";
};

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export default function MenuBuilder() {
  const router = useRouter();
  const mounted = useMounted();

  const {
    currentSet,
    setCurrentSet,
    activeMenu,
    setActiveMenu,
    loadFromServer,
    saveToServer,
    siteKind,
    setSiteKind,
    templateKey,
    INTERNAL_PAGES,
  } = useMenuStore();

  const locale: Locale = "en";

  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [notice, setNotice] = useState<NoticeState>({ open: false });

  const [sites, setSites] = useState<SiteRow[]>([]);
  const [selectedSiteId, setSelectedSiteId] = useState<string>("");
  const [hideSiteSelect, setHideSiteSelect] = useState(false);

  const ioJson = useMemo(() => JSON.stringify(activeMenu, null, 2), [activeMenu]);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/sites", { cache: "no-store" });
        if (!res.ok) throw new Error("Load sites failed");
        const data = await res.json();
        const list: SiteRow[] = data.items || [];
        setSites(list);
        if (!mounted) return;
        const saved = localStorage.getItem("ui.selectedSiteId") || "";
        if (saved && list.some((s) => s.id === saved)) setSelectedSiteId(saved);
        else if (list.length) setSelectedSiteId(list[0].id);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [mounted]);

  useEffect(() => {
    if (!selectedSiteId) return;

    let cancelled = false;

    (async () => {
      const key = `ui.menu.currentSet.${selectedSiteId}`;
      const saved = typeof window !== "undefined" ? (localStorage.getItem(key) as MenuSetKey | null) : null;
      const effectiveSet = saved || currentSet;

      if (effectiveSet !== currentSet) {
        setCurrentSet(effectiveSet);
      }

      try {
        setLoading(true);
        await loadFromServer(locale, effectiveSet, selectedSiteId);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedSiteId, locale]);

  const loadMenu = useCallback(
    async (setKey: MenuSetKey, siteId: string) => {
      if (!siteId) return;
      setLoading(true);
      try {
        await loadFromServer(locale, setKey, siteId);
      } finally {
        setLoading(false);
      }
    },
    [loadFromServer],
  );

  useEffect(() => {
    if (!mounted) return;
    if (!selectedSiteId) return;

    const key = `ui.menu.currentSet.${selectedSiteId}`;
    const saved = (localStorage.getItem(key) as MenuSetKey | null) || null;
    const effectiveSet: MenuSetKey = saved || currentSet;

    if (effectiveSet !== currentSet) {
      setCurrentSet(effectiveSet);
      void loadMenu(effectiveSet, selectedSiteId);
    } else {
      void loadMenu(currentSet, selectedSiteId);
    }
  }, [mounted, selectedSiteId]);

  useEffect(() => {
    if (!mounted) return;
    if (!selectedSiteId) return;

    localStorage.setItem(`ui.menu.currentSet.${selectedSiteId}`, currentSet);
    setHideSiteSelect(currentSet === "v1");

    void loadMenu(currentSet, selectedSiteId);
  }, [mounted, currentSet, selectedSiteId, loadMenu]);

  async function reloadAll({ hard = false }: { hard?: boolean } = {}) {
    if (!selectedSiteId) return;
    try {
      setRefreshing(true);
      await loadFromServer(locale, currentSet, selectedSiteId);

      startTransition(() => router.refresh());

      if (hard) {
        setTimeout(() => window.location.reload(), 150);
      }
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSaveAll() {
    if (!selectedSiteId) return;
    try {
      setSaving(true);

      await saveToServer(locale, currentSet, selectedSiteId);
      const triples = flattenTriples((activeMenu as any) ?? [], INTERNAL_PAGES);
      if (triples.length > 0) {
        const res = await fetch("/api/admin/pages/sync-from-menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            siteId: selectedSiteId || undefined,
            locale,
            items: triples,
          }),
          cache: "no-store",
        });

        const raw = await res.text().catch(() => "");
        if (!res.ok) throw new Error(`Sync SEO failed: ${raw || res.status}`);

        await reloadAll({ hard: false });

        setNotice({
          open: true,
          title: "SEO Saved & Synchronized",
          message: "Menus and pages (title/slug/path) have been synchronized (according to the selected site).",
          variant: "success",
        });
        return;
      }

      await reloadAll({ hard: false });
      setNotice({
        open: true,
        title: "Menu saved",
        message: "No changes have been made to SEO synchronization. The data has been reloaded.",
        variant: "info",
      });
    } catch (e: any) {
      setNotice({
        open: true,
        title: "Save failed",
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
          title: "JSON has been copied.",
          message: "The current menu content has been copied to the clipboard.",
          variant: "success",
        }),
      () =>
        setNotice({
          open: true,
          title: "Copy failed",
          message: "The browser does not allow automatic copying.",
          variant: "warning",
        }),
    );
  }

  function importJSONFromPrompt() {
    const text = prompt("Paste JSON for the current set.");
    if (!text) return;

    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error("Invalid JSON: It must be an array");

      setActiveMenu(data);
      setNotice({
        open: true,
        title: "Import successful",
        message: "The menu has been updated according to the JSON that was just imported.",
        variant: "success",
      });

      startTransition(() => router.refresh());
    } catch (e: any) {
      setNotice({
        open: true,
        title: "Import error",
        message: e?.message ?? "Unknown error",
        variant: "error",
      });
    }
  }

  return (
    <div className={styles.container}>
      <PopupNotice
        open={notice.open}
        title={notice.title}
        message={notice.message}
        variant={notice.variant}
        onClose={() => setNotice((s) => ({ ...s, open: false }))}
        autoHideMs={2800}
      />

      <header className={styles.topbar}>
        <div className={styles.topbarRight}>
          {!hideSiteSelect && (
            <div className={styles.inline}>
              <i className="bi bi-globe2" />
              <select
                className={`${styles.formSelectSm} ${styles.selectStyled}`}
                value={selectedSiteId}
                onChange={(e) => {
                  setSelectedSiteId(e.target.value);
                  startTransition(() => router.refresh());
                }}
                aria-label="Chọn Site"
              >
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.domain} ({s.localeDefault})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.inline}>
            <i className="bi bi-layers" />
            <select
              className={`${styles.formSelectSm} ${styles.selectStyled}`}
              value={siteKind}
              onChange={(e) => setSiteKind(e.target.value as SiteKind)}
              aria-label="Loại website"
            >
              <option value="ecommerce">eCommerce</option>
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
                if (typeof window !== "undefined" && selectedSiteId) {
                  localStorage.setItem(`ui.menu.currentSet.${selectedSiteId}`, setKey);
                }
                if (selectedSiteId) {
                  setLoading(true);
                  try {
                    await loadFromServer("en", setKey, selectedSiteId);
                  } finally {
                    setLoading(false);
                  }
                }
                startTransition(() => router.refresh());
              }}
              aria-label="Select menu set"
            >
              <option value="home">Menu Home</option>
              <option value="v1">Menu admin</option>
            </select>
          </div>
        </div>

        <div className={styles.topbarRight}>
          <div className={styles.inline} style={{ gap: 6 }}>
            <button
              className={`${styles.btn} ${styles.btnOutlineSecondary}`}
              disabled={loading || refreshing || !selectedSiteId}
              onClick={async () => {
                if (!selectedSiteId) return;
                try {
                  setLoading(true);
                  await loadFromServer(locale, currentSet, selectedSiteId);
                  setNotice({
                    open: true,
                    title: "Loaded from DB",
                    message: "The menu has been loaded based on site, locale, and set.",
                    variant: "info",
                  });
                } finally {
                  setLoading(false);
                }
                startTransition(() => router.refresh());
              }}
              title="Load menu from database based on site, locale, and set."
              type="button"
            >
              <i className="bi bi-download" /> {loading ? "Loading..." : refreshing ? "Refreshing..." : "Load from DB"}
            </button>
          </div>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnOutlinePrimary}`}
            disabled={!selectedSiteId || saving}
            onClick={() => void handleSaveAll()}
            title="Save the database; then synchronize the page according to the menu (current site)."
          >
            <i className="bi bi-save" /> {saving ? "Saving..." : "Save DB"}
          </button>

          <div className={styles.inline} style={{ gap: 6 }}>
            <button className={`${styles.btn} ${styles.btnOutlineSuccess}`} onClick={exportJSON} type="button">
              <i className="bi bi-clipboard" /> Copy JSON
            </button>
            <button
              className={`${styles.btn} ${styles.btnOutlineWarning}`}
              onClick={importJSONFromPrompt}
              type="button"
            >
              <i className="bi bi-upload" /> Import JSON
            </button>
          </div>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <AllowedBlocks />
        </div>
        <div className={styles.rightCol}>
          <MenuStructure key={`ms-${currentSet}-${selectedSiteId}`} siteId={selectedSiteId} />
          <textarea
            className={`${styles.formControl} ${styles.mt}`}
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
            rows={6}
            placeholder="Export/Import JSON for the current set"
            value={ioJson}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
