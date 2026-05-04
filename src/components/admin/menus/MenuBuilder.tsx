"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/menus/menu.module.css";

import {
  useMenuStore,
  type SiteKind,
} from "@/components/admin/menus/state/useMenuStore";

import AllowedBlocks from "@/components/admin/menus/state/AllowedBlocks";
import MenuStructure from "@/components/admin/menus/state/MenuStructure";

import { flattenTriples } from "@/lib/menu/deriveTitleSlugPath";
import { syncPagesFromMenu } from "@/services/menus/menuBuilder.service";

import { useMenuBuilderUIStore } from "@/store/menus/useMenuBuilderUIStore";
import { MENU_MESSAGES as M } from "@/features/menus/messages";

import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useModal } from "@/components/admin/shared/common/modal";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";

const SITE_KIND_OPTIONS: { value: SiteKind; label: string }[] = [
  { value: "ecommerce", label: "eCommerce" },
  { value: "landing", label: "Landing" }, // 🔥 thêm
];

type SiteItem = {
  id: string;
  name: string;
  domain: string;
  type?: SiteKind;
};

export default function MenuBuilder() {
  const modal = useModal();
  const { t } = useAdminI18n();
  const [q, setQ] = useState("");
  const latestLoadId = useRef(0);

  const { sites: authSites } = useAdminAuth();

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

  useEffect(() => {
    if (!authSites?.length) {
      setSites([]);
      return;
    }

    const mapped: SiteItem[] = authSites.map((s) => ({
      id: s.id,
      name: s.name,
      domain: s.domain,
      type: s.type as SiteKind,
    }));

    setSites(mapped);
  }, [authSites, setSites]);

  useEffect(() => {
    if (!sites.length) return;

    if (!selectedSiteId) {
      setSelectedSiteId(sites[0].id);
    }
  }, [sites, selectedSiteId, setSelectedSiteId]);

  const selectedSite = useMemo<SiteItem | undefined>(() => {
    return sites.find((s) => s.id === selectedSiteId);
  }, [sites, selectedSiteId]);

  useEffect(() => {
    if (!selectedSite?.type) return;
    setSiteKind(selectedSite.type);
  }, [selectedSite?.type, setSiteKind]);

  useEffect(() => {
    if (!selectedSiteId) return;

    const loadId = ++latestLoadId.current;

    (async () => {
      try {
        setLoading(true);
        await loadFromServer(currentSet, selectedSiteId);
      } catch (e) {
        console.error(e);
        modal.error(
          t("menus.errors.cannotLoadTitle"),
          (e as Error)?.message ?? M.error.unknown,
        );
      } finally {
        if (loadId === latestLoadId.current) {
          setLoading(false);
        }
      }
    })();
  }, [currentSet, selectedSiteId]);

  const handleSaveAll = useCallback(async () => {
    if (!selectedSiteId) return;

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

      modal.success("Saved", "Menu saved successfully");
    } catch (e) {
      modal.error("Error", (e as Error).message);
    } finally {
      setSaving(false);
    }
  }, [selectedSiteId, currentSet, activeMenu]);

  const handleAutoCreateMenu = useCallback(() => {
    console.log("CLICK OK 🔥");
    generateMenusBySiteKind(siteKind);
    setCurrentSet("home");
  }, [siteKind, generateMenusBySiteKind, setCurrentSet]);

  const pageFunctionKeys = useMemo(
  () => ({
    F5: () => addBlankItem(),
    F10: () => handleSaveAll(),
  }),
  [addBlankItem, handleSaveAll]
);

usePageFunctionKeys(pageFunctionKeys);
  return (
    <div className={styles.container}>
      <header className={styles.topbar}>
        <div className={styles.topbarRight}>
          {/* 🔥 SELECT SITE */}
          <div className={styles.inline}>
            <i className="bi bi-globe2" />
            <select
              className={`${styles.formSelectSm} ${styles.selectStyled}`}
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.domain}
                </option>
              ))}
            </select>
          </div>

          {/* 🔥 SITE TYPE */}
          <div className={styles.inline}>
            <i className="bi bi-layers" />
            <select
              className={`${styles.formSelectSm} ${styles.selectStyled}`}
              value={siteKind}
              onChange={(e) => setSiteKind(e.target.value as SiteKind)}
            >
              {SITE_KIND_OPTIONS.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>

            <button
              className={`${styles.btn} ${styles.btnOutlineSecondary}`}
              onClick={handleAutoCreateMenu}
            >
              ⚡{t("menus.actions.autoGenerate")}
            </button>
          </div>
        </div>

        <div className={styles.topbarRight}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
             placeholder={t("menus.search.placeholder")}
            className={styles.searchInput}
          />

          <button
            className={`${styles.btn} ${styles.btnOutlineSuccess}`}
            onClick={addBlankItem}
          >
            <i className="bi bi-plus"></i> {t("menus.actions.addNewItem")}
          </button>

          <button
            className={`${styles.btn} ${styles.btnOutlinePrimary}`}
            onClick={handleSaveAll}
          >
            <i className="bi bi-save"></i> {t("menus.actions.saveChanges")}
          </button>

          {saving && <span>Saving...</span>}
          {(loading || refreshing) && <span>Loading...</span>}
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