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
import { syncPagesFromMenu } from "@/services/menus/menuBuilder.service";
import { useMenuBuilderUIStore } from "@/store/menus/useMenuBuilderUIStore";
import { MENU_MESSAGES as M } from "@/features/menus/messages";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";
import { useModal } from "@/components/admin/shared/common/modal";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";

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
  const { t } = useAdminI18n();
  const [q, setQ] = useState("");
  const latestLoadId = useRef(0);

  const { user, site, currentWorkspace } = useAdminAuth();
  const userId = user?.id ?? "";
  const siteId = site?.id ?? "";
  const workspaceName = currentWorkspace?.name ?? "";
  const siteName = site?.name ?? "";
  const siteDomain = site?.domain ?? "";

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

  const hideSiteSelect = true;

  const selectedSite = useMemo<SiteItem | undefined>(() => {
    if (!siteId) return undefined;

    return {
      id: siteId,
      name: siteName,
      domain: siteDomain,
      type: site?.type as SiteKind | undefined,
    };
  }, [siteId, siteName, siteDomain, site?.type]);

  const reloadAll = useCallback(async () => {
    if (!selectedSiteId) return;

    try {
      setRefreshing(true);
      await loadFromServer(currentSet, selectedSiteId);
    } catch (e) {
      modal.error(
        t("menus.errors.cannotRefreshTitle"),
        (e as Error)?.message ?? M.error.unknown,
      );
    } finally {
      setRefreshing(false);
    }
  }, [selectedSiteId, setRefreshing, loadFromServer, currentSet, modal, t]);

  useEffect(() => {
    if (!siteId) {
      setSites([]);
      return;
    }

    const authSite: SiteItem = {
      id: siteId,
      name: siteName,
      domain: siteDomain,
      type: site?.type as SiteKind | undefined,
    };

    setSites([authSite]);
  }, [siteId, siteName, siteDomain, site?.type, setSites]);

  useEffect(() => {
    if (!siteId) return;
    if (selectedSiteId !== siteId) {
      setSelectedSiteId(siteId);
    }
  }, [siteId, selectedSiteId, setSelectedSiteId]);

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
  }, [currentSet, selectedSiteId, loadFromServer, setLoading, modal, t]);

  useEffect(() => {
    if (!selectedSite?.type) return;
    setSiteKind(selectedSite.type);
  }, [selectedSite?.type, setSiteKind]);

  const handleSaveAll = useCallback(async () => {
    if (!selectedSiteId) {
      modal.error(
        t("menus.errors.noWebsiteSelectedTitle"),
        t("menus.errors.noWebsiteSelectedMessage"),
      );
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
    t,
  ]);

  const importJSONFromPrompt = useCallback(() => {
    const text = prompt(t("menus.actions.importPrompt"));
    if (!text) return;

    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) {
        throw new Error(M.error.invalidJsonArray);
      }

      setActiveMenu(data);
      modal.success(
        t("menus.actions.importSuccessTitle"),
        t("menus.actions.importSuccessMessage"),
      );
    } catch (e: unknown) {
      modal.error(
        t("menus.errors.cannotImportTitle"),
        (e as Error)?.message ?? M.error.unknown,
      );
    }
  }, [setActiveMenu, modal, t]);

  const handleAutoCreateMenu = useCallback(() => {
    const ok = window.confirm(
      t("menus.actions.autoCreateConfirm").replace("{siteKind}", siteKind),
    );
    if (!ok) return;

    generateMenusBySiteKind(siteKind);
    setCurrentSet("home");

    modal.success(
      t("menus.actions.autoCreateSuccessTitle"),
      t("menus.actions.autoCreateSuccessMessage").replace("{siteKind}", siteKind),
    );
  }, [siteKind, generateMenusBySiteKind, setCurrentSet, modal, t]);

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
                aria-label={t("menus.aria.chooseSite")}
              >
                {!sites.length ? <option value="">{t("menus.misc.noSites")}</option> : null}
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
              aria-label={t("menus.aria.siteKind")}
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
              title={t("menus.actions.autoGenerateTitle")}
            >
              <i className="bi bi-magic" /> {t("menus.actions.autoGenerate")}
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
              placeholder={t("menus.search.placeholder")}
              aria-label={t("menus.search.ariaLabel")}
              className={styles.searchInput}
            />
          </div>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnOutlineSuccess}`}
            style={{ marginLeft: 6 }}
            onClick={addBlankItem}
            title={t("menus.actions.addNewItemTitle")}
          >
            <i className="bi bi-plus" /> {t("menus.actions.addNewItem")}
          </button>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnOutlinePrimary}`}
            style={{ marginLeft: 6 }}
            onClick={handleSaveAll}
            title={t("menus.actions.saveChangesTitle")}
          >
            <i className="bi bi-magic" /> {t("menus.actions.saveChanges")}
          </button>

          {q ? (
            <button
              className={`${styles.btn} ${styles.btnOutlineSecondary}`}
              onClick={() => setQ("")}
              title={t("menus.actions.clearFilterTitle")}
              type="button"
            >
              <i className="bi bi-x-circle" /> {t("menus.actions.clearFilter")}
            </button>
          ) : null}

          {saving ? (
            <span className={styles.smallHelp} aria-live="polite">
              {t("menus.status.saving")}
            </span>
          ) : null}

          {loading || refreshing ? (
            <span className={styles.smallHelp} aria-live="polite">
              {loading ? t("menus.status.loading") : t("menus.status.syncing")}
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