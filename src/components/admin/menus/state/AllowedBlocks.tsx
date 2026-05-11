"use client";

import { useCallback, useMemo } from "react";
import styles from "@/styles/admin/menus/menu.module.css";

import { useMenuStore } from "@/components/admin/menus/state/useMenuStore";
import { useAllowedBlocksStore } from "@/store/menus/useAllowedBlocksStore";
import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";

import {
  filterSuggest,
  forcedTabFromSet,
  getSuggestBySite,
  pickBaseNames,
  buildExistingTitlesSet,
} from "@/services/menus/allowedBlocks.service";

import { useModal } from "@/components/admin/shared/common/modal";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

type TabKey = "home" | "dashboard";

function countMenus(items: any[]): number {
  if (!Array.isArray(items)) return 0;

  return items.reduce((total, item) => {
    const childCount = item?.children?.length > 0 ? countMenus(item.children) : 0;

    return total + 1 + childCount;
  }, 0);
}

export default function AllowedBlocks() {
  const modal = useModal();

  const { t, locale } = useAdminI18n();

  const { currentWorkspace } = useAdminAuth();

  const workspacePolicy = (currentWorkspace as any)?.accessPolicy;

  const maxMenus = workspacePolicy?.maxMenus ?? Number.MAX_SAFE_INTEGER;

  const { TEMPLATE_ALLOWED, templateKey, activeMenu, setActiveMenu, INTERNAL_PAGES, siteKind, currentSet } =
    useMenuStore();

  const { addByName, onDragStart } = useAllowedBlocksStore();

  const currentLocale = (locale ?? "en") as "en" | "vi" | "ja";

  const tpl = TEMPLATE_ALLOWED[templateKey];

  const forcedTab: TabKey = forcedTabFromSet(currentSet);

  const menuItems = activeMenu || [];

  const baseKeys = useMemo(() => pickBaseNames(tpl, forcedTab), [tpl, forcedTab]);

  const baseNames = useMemo(
    () =>
      baseKeys.map((key) => {
        const page = INTERNAL_PAGES.find((p) => p.id === key);

        return page?.labelKey ? t(page.labelKey) : key;
      }),
    [baseKeys, INTERNAL_PAGES, t],
  );

  const existingTitles = useMemo(() => buildExistingTitlesSet(menuItems), [menuItems]);

  const suggestSource = useMemo(() => getSuggestBySite(siteKind), [siteKind]);

  const filteredSuggest = useMemo(
    () =>
      filterSuggest({
        suggest: suggestSource,
        baseNames,
        existingTitles,
        existingPages: new Set(),
      }),
    [suggestSource, baseNames, existingTitles],
  );

  const currentMenuCount = useMemo(() => countMenus(menuItems), [menuItems]);

  const isLimitReached = currentMenuCount >= maxMenus;

  const handleAddName = useCallback(
    (name: string) => {
      try {
        const currentMenus = activeMenu || [];

        const latestMenuCount = countMenus(currentMenus);

        if (latestMenuCount >= maxMenus) {
          modal.error(`Maximum menu limit is ${maxMenus}`);
          return;
        }

        addByName({
          name,
          activeMenu: currentMenus,
          setActiveMenu,
          internalPages: INTERNAL_PAGES,
          locale: currentLocale,
          t,
        });
      } catch (e: unknown) {
        modal.error(
          t("menus.allowedBlocks.addErrorTitle"),
          (e as Error)?.message || t("menus.allowedBlocks.addErrorMessage"),
        );
      }
    },
    [activeMenu, maxMenus, addByName, setActiveMenu, INTERNAL_PAGES, currentLocale, t, modal],
  );

  return (
    <div className={styles.cardform}>
      <div className={styles.grid2}>
        <div className={styles.blocksGrid}>
          {baseNames.map((name) => (
            <div key={name} className={styles.blockCell}>
              <div
                className={`${styles.blockCard} ${styles.appCard}`}
                draggable={!isLimitReached}
                onDragStart={(e) =>
                  onDragStart(e, {
                    name,
                    internalPages: INTERNAL_PAGES,
                    locale: currentLocale,
                    t,
                  })
                }
                onClick={() => handleAddName(name)}
                title={t("menus.allowedBlocks.baseBlockTooltip")}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleAddName(name);
                  }
                }}
              >
                <div className={styles.blockIconWrap}>
                  <i className="bi bi-cursor" />
                </div>

                <div>
                  <div className={styles.blockTitle}>{name}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section className={styles.blocksGridRight} aria-label={t("menus.allowedBlocks.suggestionsAria")}>
          {Object.keys(filteredSuggest).length === 0 ? (
            <div className={styles.smallHelp}>{t("menus.allowedBlocks.noMoreSuggestions")}</div>
          ) : (
            Object.entries(filteredSuggest).map(([group, items]) => (
              <div
                key={group}
                style={{
                  marginBottom: 10,
                }}
              >
                <div
                  style={{
                    fontWeight: 600,
                    marginBottom: 6,
                    color: "rgb(134 134 134)",
                    fontSize: 13,
                  }}
                >
                  {t(group)}
                </div>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                  }}
                >
                  {items.map((name) => (
                    <button
                      type="button"
                      key={name}
                      draggable={!isLimitReached}
                      onClick={() => handleAddName(name)}
                      onDragStart={(e) =>
                        onDragStart(e, {
                          name,
                          internalPages: INTERNAL_PAGES,
                          locale: currentLocale,
                          t,
                        })
                      }
                      className={styles.btn}
                      style={{
                        borderRadius: 20,
                        border: "1px dashed var(--bd,#cbd5e1)",
                        background: "var(--bg-pro)",
                        padding: "6px 10px",
                        fontSize: 13,
                      }}
                      title={t("menus.allowedBlocks.suggestChipTooltip")}
                    >
                      <i
                        className="bi bi-plus-lg"
                        style={{
                          marginRight: 6,
                        }}
                      />

                      {t(name)}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      <div className={styles.divider} />
    </div>
  );
}
