"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin/builder/menus/menu.module.css";

import { useMenuStore, type MenuSetKey, type SiteKind } from "@/components/admin/builder/menus/state/useMenuStore";
import AllowedBlocks from "@/components/admin/builder/menus/state/AllowedBlocks";
import MenuStructure from "@/components/admin/builder/menus/state/MenuStructure";
import { flattenTriples } from "@/lib/menu/deriveTitleSlugPath";
import { fetchSites, syncPagesFromMenu } from "@/services/builder/menus/menuBuilder.service";
import { useMenuBuilderUIStore } from "@/store/builder/menus/useMenuBuilderUIStore";
import { MENU_MESSAGES as M } from "@/features/builder/menus/messages";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useModal } from "@/components/admin/shared/common/modal";

export default function MenuBuilder() {
  const router = useRouter();
  const modal = useModal();
  const [q, setQ] = useState("");

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
    addBlankItem,
  } = useMenuStore();

  const {
    saving,
    loading,
    refreshing,
    sites,
    selectedSiteId,
    hideSiteSelect,
    setSaving,
    setLoading,
    setRefreshing,
    setSites,
    setSelectedSiteId,
    setHideSiteSelect,
  } = useMenuBuilderUIStore();

  const ioJson = useMemo(() => JSON.stringify(activeMenu, null, 2), [activeMenu]);

  const reloadAll = useCallback(
    async ({ hard = false }: { hard?: boolean } = {}) => {
      if (!selectedSiteId) return;

      try {
        setRefreshing(true);
        await loadFromServer(currentSet, selectedSiteId);
        router.refresh();

        if (hard) {
          setTimeout(() => window.location.reload(), 150);
        }
      } finally {
        setRefreshing(false);
      }
    },
    [selectedSiteId, setRefreshing, loadFromServer, currentSet, router],
  );

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
        modal.error("Load failed", (e as Error)?.message ?? M.error.unknown);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [currentSet, selectedSiteId, loadFromServer, setLoading, modal]);

  const handleSaveAll = useCallback(async () => {
    if (!selectedSiteId) {
      modal.error("Missing site", "Please select a site first.");
      return;
    }

    try {
      setSaving(true);

      await saveToServer(currentSet, selectedSiteId);

      const triples = flattenTriples(activeMenu, INTERNAL_PAGES);

      if (triples.length > 0) {
        await syncPagesFromMenu({
          siteId: selectedSiteId,
          items: triples,
        });

        await reloadAll({ hard: false });

        modal.success(M.notice.seoSavedTitle, M.notice.seoSavedMsg);
        return;
      }

      await reloadAll({ hard: false });

      modal.success(M.notice.menuSavedTitle, M.notice.menuSavedMsg);
    } catch (e: unknown) {
      modal.error(M.notice.saveFailedTitle, (e as Error)?.message ?? M.error.unknown);
    } finally {
      setSaving(false);
    }
  }, [selectedSiteId, setSaving, saveToServer, currentSet, activeMenu, INTERNAL_PAGES, reloadAll, modal]);

  const importJSONFromPrompt = useCallback(() => {
    const text = prompt(M.prompt.pasteJson);
    if (!text) return;

    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) {
        throw new Error(M.error.invalidJsonArray);
      }

      setActiveMenu(data);

      modal.success(M.notice.importSuccessTitle, M.notice.importSuccessMsg);
      router.refresh();
    } catch (e: unknown) {
      modal.error(M.notice.importErrorTitle, (e as Error)?.message ?? M.error.unknown);
    }
  }, [setActiveMenu, modal, router]);

  const pageFunctionKeys = useMemo(
    () => ({
      F5: () => addBlankItem(),
      F8: () => importJSONFromPrompt(),
      F9: () => "",
      F10: () => {
        void handleSaveAll();
      },
    }),
    [addBlankItem, importJSONFromPrompt, handleSaveAll],
  );

  usePageFunctionKeys(pageFunctionKeys);

  return (
    <div className={styles.container}>
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
          <div className={styles.search} style={{ position: "relative" }}>
            <i
              className={`bi bi-search ${styles.iconSearch}`}
              aria-hidden
              style={{
                position: "absolute",
                left: 10,
                top: "50%",
                transform: "translateY(-50%)",
                opacity: 0.6,
              }}
            />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tiêu đề hoặc đường dẫn…"
              aria-label="Tìm trong menu"
              className={styles.searchInput}
            />
          </div>

          {q ? (
            <button
              className={`${styles.btn} ${styles.btnOutlineSecondary}`}
              onClick={() => setQ("")}
              title="Xoá từ khoá"
              type="button"
            >
              <i className="bi bi-x-circle" /> Clear
            </button>
          ) : null}

          {saving ? (
            <span className={styles.smallHelp} aria-live="polite">
              Đang lưu...
            </span>
          ) : null}

          {loading || refreshing ? (
            <span className={styles.smallHelp} aria-live="polite">
              {loading ? "Đang tải..." : "Đang làm mới..."}
            </span>
          ) : null}
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.leftCol}>
          <AllowedBlocks />
        </div>

        <div className={styles.rightCol}>
          <MenuStructure q={q} setQ={setQ} />
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
