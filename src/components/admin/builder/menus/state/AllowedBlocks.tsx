"use client";

import React, { useMemo } from "react";
import styles from "@/styles/admin/menu/menu.module.css";

import { useMenuStore } from "@/components/admin/builder/menus/state/useMenuStore";
import { useAllowedBlocksStore } from "@/store/builder/menus/useAllowedBlocksStore";

import {
  filterSuggest,
  forcedTabFromSet,
  getSuggestBySite,
  isTabbedConfig,
  pickBaseNames,
  buildExistingPagesSet,
  buildExistingTitlesSet,
} from "@/services/builder/menus/allowedBlocks.service";

import { MENU_MESSAGES as M } from "@/features/builder/menus/messages";

type TabKey = "home" | "dashboard";

export default function AllowedBlocks() {
  const {
    TEMPLATE_ALLOWED,
    templateKey,
    activeMenu,
    setActiveMenu,
    addBlankItem,
    INTERNAL_PAGES,
    siteKind,
    currentSet,
  } = useMenuStore();

  const { addByName, onDragStart } = useAllowedBlocksStore();

  const tpl = TEMPLATE_ALLOWED[templateKey];
  const hasTabs = isTabbedConfig(tpl);

  const forcedTab: TabKey = forcedTabFromSet(currentSet);

  const internalPages = INTERNAL_PAGES || [];
  const menu = activeMenu || [];

  // Compute base names for left panel blocks
  const baseNames = useMemo(() => pickBaseNames(tpl as any, forcedTab), [tpl, forcedTab]);

  // Precompute sets for suggestion filtering
  const existingPages = useMemo(() => buildExistingPagesSet(internalPages), [internalPages]);
  const existingTitles = useMemo(() => buildExistingTitlesSet(menu), [menu]);

  const suggestSource = useMemo(() => getSuggestBySite(siteKind), [siteKind]);

  const filteredSuggest = useMemo(
    () =>
      filterSuggest({
        suggest: suggestSource,
        baseNames,
        existingTitles,
        existingPages,
      }),
    [suggestSource, baseNames, existingTitles, existingPages],
  );

  const forcedTabLabel = forcedTab === "dashboard" ? M.allowedBlocks.tabDashboard : M.allowedBlocks.tabHome;

  return (
    <div className={styles.cardform}>
      <div className={styles.cardHeader}>
        <button className={`${styles.btn} ${styles.btnOutlineLight}`} onClick={addBlankItem} type="button">
          <i className="bi bi-plus-lg" /> {M.allowedBlocks.addEmptyItem}
        </button>

        {hasTabs && (
          <div className={styles.smallHelp} style={{ marginLeft: "auto" }}>
            <button type="button" className={`${styles.btn} ${styles.btnOutlinePrimary}`} disabled>
              {M.allowedBlocks.showingPrefix} <b>{forcedTabLabel}</b>
            </button>
          </div>
        )}
      </div>

      <div className={styles.grid2}>
        {/* LEFT: base blocks */}
        <div className={styles.blocksGrid}>
          {baseNames.map((name) => (
            <div key={name} className={styles.blockCell}>
              <div
                className={`${styles.blockCard} ${styles.appCard}`}
                draggable
                onDragStart={(e) => onDragStart(e, { name, internalPages })}
                onClick={() =>
                  addByName({
                    name,
                    activeMenu: menu,
                    setActiveMenu,
                    internalPages,
                  })
                }
                title={M.allowedBlocks.baseBlockTooltip}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    addByName({ name, activeMenu: menu, setActiveMenu, internalPages });
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

        {/* RIGHT: suggestions */}
        <section
          className={styles.blocksGridRight}
          aria-label={M.allowedBlocks.suggestionsAria}
          style={{ display: "grid", gap: 6 }}
        >
          {Object.keys(filteredSuggest).length === 0 ? (
            <div className={styles.smallHelp}>{M.allowedBlocks.noMoreSuggestions}</div>
          ) : (
            Object.entries(filteredSuggest).map(([group, items]) => (
              <div key={group} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 500, marginBottom: 6, color: "rgb(134 134 134)", fontSize: 16 }}>{group}</div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {items.map((name) => (
                    <button
                      type="button"
                      key={name}
                      onClick={() => addByName({ name, activeMenu: menu, setActiveMenu, internalPages })}
                      onDragStart={(e) => onDragStart(e as any, { name, internalPages })}
                      draggable
                      className={styles.btn}
                      style={{
                        borderRadius: 20,
                        border: "1px dashed var(--bd,#cbd5e1)",
                        background: "var(--chip-bg,rgba(16,185,129,.08))",
                        padding: "6px 10px",
                        fontSize: 13,
                      }}
                      title={M.allowedBlocks.suggestChipTooltip}
                    >
                      <i className="bi bi-plus-lg" style={{ marginRight: 6 }} />
                      {name}
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
