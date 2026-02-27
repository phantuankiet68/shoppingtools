"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin/menu/menu.module.css";

import { useMenuStore, type MenuSetKey, type SiteKind } from "@/components/admin/builder/menus/state/useMenuStore";
import AllowedBlocks from "@/components/admin/builder/menus/state/AllowedBlocks";
import MenuStructure from "@/components/admin/builder/menus/state/MenuStructure";
import { flattenTriples } from "@/lib/menu/deriveTitleSlugPath";
import PopupNotice from "@/components/ui/PopupNotice";

import { fetchSites, syncPagesFromMenu } from "@/services/builder/menus/menuBuilder.service";
import { useMenuBuilderUIStore } from "@/store/builder/menus/useMenuBuilderUIStore";

import { MENU_MESSAGES as M } from "@/features/builder/menus/messages";

export default function MenuBuilder() {
  const router = useRouter();

  // Builder data store
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

  // UI store
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

  // -----------------------------
  // Helpers
  // -----------------------------
  const openNotice = useCallback(
    (next: { title: string; message: string; variant: "success" | "info" | "warning" | "error" }) => {
      setNotice({ open: true, ...next });
    },
    [setNotice],
  );

  const reloadAll = useCallback(
    async ({ hard = false }: { hard?: boolean } = {}) => {
      if (!selectedSiteId) return;

      try {
        setRefreshing(true);
        await loadFromServer(currentSet, selectedSiteId);
        router.refresh();

        if (hard) {
          // Keep it small; reload is optional and controlled by the caller
          setTimeout(() => window.location.reload(), 150);
        }
      } finally {
        setRefreshing(false);
      }
    },
    [selectedSiteId, setRefreshing, loadFromServer, currentSet, router],
  );

  // -----------------------------
  // Effects: fetch sites
  // -----------------------------
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const list = await fetchSites();
        if (cancelled) return;
        setSites(list);
      } catch (e) {
        console.error("fetchSites failed:", e);
        if (!cancelled) setSites([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setSites]);

  // Pick initial site
  useEffect(() => {
    if (!sites.length) return;

    const saved = localStorage.getItem("ui.selectedSiteId") || "";
    const nextId = saved && sites.some((s) => s.id === saved) ? saved : sites[0].id;

    if (!selectedSiteId || !sites.some((s) => s.id === selectedSiteId)) {
      setSelectedSiteId(nextId);
    }
  }, [sites, selectedSiteId, setSelectedSiteId]);

  // Persist selected site
  useEffect(() => {
    if (!selectedSiteId) return;
    localStorage.setItem("ui.selectedSiteId", selectedSiteId);
  }, [selectedSiteId]);

  // Hide site selector for some sets
  useEffect(() => {
    setHideSiteSelect(currentSet === "v1");
  }, [currentSet, setHideSiteSelect]);

  // Load menu data whenever set/site changes
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

  // -----------------------------
  // Actions
  // -----------------------------
  const handleLoadFromDb = useCallback(async () => {
    if (!selectedSiteId) return;

    try {
      setLoading(true);
      await loadFromServer(currentSet, selectedSiteId);

      openNotice({
        title: M.notice.loadDbTitle,
        message: M.notice.loadDbMsg,
        variant: "info",
      });
    } finally {
      setLoading(false);
    }

    router.refresh();
  }, [selectedSiteId, setLoading, loadFromServer, currentSet, openNotice, router]);

  const handleSaveAll = useCallback(async () => {
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

        openNotice({
          title: M.notice.seoSavedTitle,
          message: M.notice.seoSavedMsg,
          variant: "success",
        });
        return;
      }

      await reloadAll({ hard: false });

      openNotice({
        title: M.notice.menuSavedTitle,
        message: M.notice.menuSavedMsg,
        variant: "info",
      });
    } catch (e: any) {
      openNotice({
        title: M.notice.saveFailedTitle,
        message: e?.message ?? M.error.unknown,
        variant: "error",
      });
    } finally {
      setSaving(false);
    }
  }, [selectedSiteId, setSaving, saveToServer, currentSet, activeMenu, INTERNAL_PAGES, reloadAll, openNotice]);

  const exportJSON = useCallback(() => {
    navigator.clipboard?.writeText(ioJson).then(
      () =>
        openNotice({
          title: M.notice.jsonCopiedTitle,
          message: M.notice.jsonCopiedMsg,
          variant: "success",
        }),
      () =>
        openNotice({
          title: M.notice.copyFailedTitle,
          message: M.notice.copyFailedMsg,
          variant: "warning",
        }),
    );
  }, [ioJson, openNotice]);

  const importJSONFromPrompt = useCallback(() => {
    const text = prompt(M.prompt.pasteJson);
    if (!text) return;

    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) throw new Error(M.error.invalidJsonArray);

      setActiveMenu(data);

      openNotice({
        title: M.notice.importSuccessTitle,
        message: M.notice.importSuccessMsg,
        variant: "success",
      });

      router.refresh();
    } catch (e: any) {
      openNotice({
        title: M.notice.importErrorTitle,
        message: e?.message ?? M.error.unknown,
        variant: "error",
      });
    }
  }, [setActiveMenu, openNotice, router]);

  // -----------------------------
  // Render
  // -----------------------------
  const loadBtnLabel = loading ? M.btn.loading : refreshing ? M.btn.refreshing : M.btn.loadFromDb;

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
                aria-label={M.aria.chooseSite}
              >
                {!sites.length ? <option value="">{M.misc.noSites}</option> : null}
                {sites.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.domain} ({(s as any).localeDefault})
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
              aria-label={M.aria.siteKind}
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
              aria-label={M.aria.selectMenuSet}
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
              onClick={() => void handleLoadFromDb()}
              title={M.tooltip.loadFromDb}
              type="button"
            >
              <i className="bi bi-download" /> {loadBtnLabel}
            </button>
          </div>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnOutlinePrimary}`}
            disabled={!selectedSiteId || saving}
            onClick={() => void handleSaveAll()}
            title={M.tooltip.saveDb}
          >
            <i className="bi bi-save" /> {saving ? M.btn.saving : M.btn.saveDb}
          </button>

          <div className={styles.inline} style={{ gap: 6 }}>
            <button className={`${styles.btn} ${styles.btnOutlineSuccess}`} onClick={exportJSON} type="button">
              <i className="bi bi-clipboard" /> {M.btn.copyJson}
            </button>
            <button
              className={`${styles.btn} ${styles.btnOutlineWarning}`}
              onClick={importJSONFromPrompt}
              type="button"
            >
              <i className="bi bi-upload" /> {M.btn.importJson}
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

          {/* Hidden textarea to allow quick copy/paste via developer tools if needed */}
          <textarea
            className={`${styles.formControl} ${styles.mt}`}
            style={{ position: "absolute", opacity: 0, pointerEvents: "none", height: 0, width: 0 }}
            rows={6}
            placeholder={M.misc.exportImportPlaceholder}
            value={ioJson}
            readOnly
          />
        </div>
      </div>
    </div>
  );
}
