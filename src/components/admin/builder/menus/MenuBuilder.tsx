"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin/menu/menu.module.css";

import { useMenuStore, type MenuSetKey, type SiteKind } from "@/components/admin/builder/menus/state/useMenuStore";
import AllowedBlocks from "@/components/admin/builder/menus/state/AllowedBlocks";
import MenuStructure from "@/components/admin/builder/menus/state/MenuStructure";
import { flattenTriples } from "@/lib/menu/deriveTitleSlugPath";
import PopupNotice from "@/components/ui/PopupNotice";

import { fetchSites, syncPagesFromMenu } from "@/services/builder/menus/menuBuilder.service";
import { useMenuBuilderUIStore } from "@/store/builder/menus/useMenuBuilderUIStore";

export default function MenuBuilder() {
  const router = useRouter();

  const {
    currentSet,
    setCurrentSet,
    activeMenu,
    setActiveMenu,
    loadFromServer,
    saveToServer,
    siteKind,
    setSiteKind,
    INTERNAL_PAGES,
  } = useMenuStore();

  const {
    saving,
    loading,
    refreshing,
    notice,
    sites,
    selectedSiteId,
    hideSiteSelect,
    setSaving,
    setLoading,
    setRefreshing,
    setNotice,
    setSites,
    setSelectedSiteId,
    setHideSiteSelect,
  } = useMenuBuilderUIStore();

  const ioJson = useMemo(() => JSON.stringify(activeMenu, null, 2), [activeMenu]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const list = await fetchSites();
        if (cancelled) return;
        setSites(list);
      } catch (e) {
        console.error("fetchSites failed:", e);
        setSites([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setSites]);

  useEffect(() => {
    if (!sites.length) return;

    const saved = localStorage.getItem("ui.selectedSiteId") || "";
    const nextId = saved && sites.some((s) => s.id === saved) ? saved : sites[0].id;

    if (!selectedSiteId || !sites.some((s) => s.id === selectedSiteId)) {
      setSelectedSiteId(nextId);
    }
  }, [sites, selectedSiteId, setSelectedSiteId]);

  useEffect(() => {
    if (!selectedSiteId) return;
    localStorage.setItem("ui.selectedSiteId", selectedSiteId);
  }, [selectedSiteId]);

  useEffect(() => {
    setHideSiteSelect(currentSet === "v1");
  }, [currentSet, setHideSiteSelect]);

  useEffect(() => {
    if (!selectedSiteId) return;

    let cancelled = false;

    (async () => {
      try {
        setLoading(true);
        await loadFromServer(currentSet, selectedSiteId);
      } catch (e) {
        console.error("loadFromServer failed:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentSet, selectedSiteId, loadFromServer, setLoading]);

  async function reloadAll({ hard = false }: { hard?: boolean } = {}) {
    if (!selectedSiteId) return;
    try {
      setRefreshing(true);
      await loadFromServer(currentSet, selectedSiteId);
      router.refresh();
      if (hard) setTimeout(() => window.location.reload(), 150);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleSaveAll() {
    if (!selectedSiteId) return;

    try {
      setSaving(true);

      await saveToServer(currentSet, selectedSiteId);

      const triples = flattenTriples((activeMenu as any) ?? [], INTERNAL_PAGES);

      if (triples.length > 0) {
        await syncPagesFromMenu({
          siteId: selectedSiteId || undefined,
          items: triples,
        });

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

      router.refresh();
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
                onChange={(e) => setSelectedSiteId(e.target.value)}
                aria-label="Chọn Site"
              >
                {!sites.length ? <option value="">No sites</option> : null}
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
              onChange={(e) => {
                const setKey = e.target.value as MenuSetKey;
                setCurrentSet(setKey);
                if (selectedSiteId) {
                  localStorage.setItem(`ui.menu.currentSet.${selectedSiteId}`, setKey);
                }
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
                  await loadFromServer(currentSet, selectedSiteId);
                  setNotice({
                    open: true,
                    title: "Loaded from DB",
                    message: "The menu has been loaded based on site and set.",
                    variant: "info",
                  });
                } finally {
                  setLoading(false);
                }
                router.refresh();
              }}
              title="Load menu from database based on site and set."
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
