"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin/menus/menu.module.css";

import {
  useMenuStore,
  type SiteKind,
} from "@/components/admin/menus/state/useMenuStore";
import AllowedBlocks from "@/components/admin/menus/state/AllowedBlocks";
import MenuStructure from "@/components/admin/menus/state/MenuStructure";
import { flattenTriples } from "@/lib/menu/deriveTitleSlugPath";
import { fetchSites, syncPagesFromMenu } from "@/services/menus/menuBuilder.service";
import { useMenuBuilderUIStore } from "@/store/menus/useMenuBuilderUIStore";
import { MENU_MESSAGES as M } from "@/features/menus/messages";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useModal } from "@/components/admin/shared/common/modal";

const SITE_KIND_OPTIONS: { value: SiteKind; label: string }[] = [
  { value: "ecommerce", label: "eCommerce" },
];

type SiteItem = {
  id: string;
  name: string;
  domain: string;
  localeDefault?: "en";
  type?: SiteKind;
};

export default function MenuBuilder() {
  const router = useRouter();
  const modal = useModal();
  const [q, setQ] = useState("");
  const latestLoadId = useRef(0);

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
    generateMenusBySiteKind,
  } = useMenuStore();

  const {
    saving,
    loading,
    refreshing,
    sites,
    selectedSiteId,
    setSaving,
    setLoading,
    setRefreshing,
    setSites,
    setSelectedSiteId,
  } = useMenuBuilderUIStore();

  const hideSiteSelect = currentSet === "v1";

  const selectedSite = useMemo(
    () => (sites as SiteItem[]).find((s) => s.id === selectedSiteId),
    [sites, selectedSiteId],
  );

  const reloadAll = useCallback(async () => {
    if (!selectedSiteId) return;

    try {
      setRefreshing(true);
      await loadFromServer(currentSet, selectedSiteId);
    } catch (e) {
      modal.error("Cannot refresh data", (e as Error)?.message ?? M.error.unknown);
    } finally {
      setRefreshing(false);
    }
  }, [selectedSiteId, setRefreshing, loadFromServer, currentSet, modal]);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const list = (await fetchSites()) as SiteItem[];
        if (!active) return;
        setSites(list);
      } catch (e) {
        console.error("fetchSites failed:", e);
        if (active) setSites([]);
      }
    })();

    return () => {
      active = false;
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
    if (!selectedSiteId) return;

    const loadId = ++latestLoadId.current;

    (async () => {
      try {
        setLoading(true);
        await loadFromServer(currentSet, selectedSiteId);

        if (loadId !== latestLoadId.current) return;
      } catch (e) {
        if (loadId !== latestLoadId.current) return;
        console.error("loadFromServer failed:", e);
        modal.error("Cannot load data", (e as Error)?.message ?? M.error.unknown);
      } finally {
        if (loadId === latestLoadId.current) {
          setLoading(false);
        }
      }
    })();
  }, [currentSet, selectedSiteId, loadFromServer, setLoading, modal]);

  useEffect(() => {
    if (!selectedSite?.type) return;
    setSiteKind(selectedSite.type);
  }, [selectedSiteId, selectedSite?.type, setSiteKind]);

  const handleSaveAll = useCallback(async () => {
    if (!selectedSiteId) {
      modal.error("No website selected", "Please select a website before saving.");
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
      }

      await reloadAll();

      modal.success(
        triples.length > 0 ? M.notice.seoSavedTitle : M.notice.menuSavedTitle,
        triples.length > 0 ? M.notice.seoSavedMsg : M.notice.menuSavedMsg,
      );
    } catch (e: unknown) {
      modal.error(M.notice.saveFailedTitle, (e as Error)?.message ?? M.error.unknown);
    } finally {
      setSaving(false);
    }
  }, [
    selectedSiteId,
    setSaving,
    saveToServer,
    currentSet,
    activeMenu,
    INTERNAL_PAGES,
    reloadAll,
    modal,
  ]);

  const importJSONFromPrompt = useCallback(() => {
    const text = prompt("Please paste the menu JSON data below.");
    if (!text) return;

    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) {
        throw new Error(M.error.invalidJsonArray);
      }

      setActiveMenu(data);
      modal.success("Import successful", "Menu structure has been updated.");
    } catch (e: unknown) {
      modal.error("Cannot import data", (e as Error)?.message ?? M.error.unknown);
    }
  }, [setActiveMenu, modal]);

  const handleAutoCreateMenu = useCallback(() => {
    const ok = window.confirm(
      `The system will regenerate the default menu for "${siteKind}" and overwrite current data. Do you want to continue?`,
    );
    if (!ok) return;

    generateMenusBySiteKind(siteKind);
    setCurrentSet("home");

    modal.success(
      "Auto menu creation successful",
      `Default menu structure has been created for "${siteKind}" site type.`,
    );
  }, [siteKind, generateMenusBySiteKind, setCurrentSet, modal]);

  const pageFunctionKeys = useMemo(
    () => ({
      F5: () => addBlankItem(),
      F8: () => importJSONFromPrompt(),
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
                {(sites as SiteItem[]).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {s.domain}
                    {s.localeDefault ? ` (${s.localeDefault})` : ""}
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
              {SITE_KIND_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              className={`${styles.btn} ${styles.btnOutlineSecondary}`}
              style={{ marginLeft: 6 }}
              onClick={handleAutoCreateMenu}
              title="Generate default menu by site type"
            >
              <i className="bi bi-magic" /> Auto generate
            </button>
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
              placeholder="Search by title or path..."
              aria-label="Search in menu"
              className={styles.searchInput}
            />
          </div>

          {q ? (
            <button
              className={`${styles.btn} ${styles.btnOutlineSecondary}`}
              onClick={() => setQ("")}
              title="Clear search filter"
              type="button"
            >
              <i className="bi bi-x-circle" /> Clear filter
            </button>
          ) : null}

          {saving ? (
            <span className={styles.smallHelp} aria-live="polite">
              Saving data...
            </span>
          ) : null}

          {loading || refreshing ? (
            <span className={styles.smallHelp} aria-live="polite">
              {loading ? "Loading data..." : "Syncing data..."}
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
        </div>
      </div>
    </div>
  );
}