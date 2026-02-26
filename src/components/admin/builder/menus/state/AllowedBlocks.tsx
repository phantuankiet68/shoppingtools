"use client";

import React from "react";
import { useMenuStore, type BuilderMenuItem } from "@/components/admin/builder/menus/state/useMenuStore";
import styles from "@/styles/admin/menu/menu.module.css";

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

  const baseNames: string[] = React.useMemo(() => pickBaseNames(tpl as any, forcedTab), [tpl, forcedTab]);

  const existingPages = React.useMemo(() => buildExistingPagesSet(INTERNAL_PAGES || []), [INTERNAL_PAGES]);

  const SUGGEST = React.useMemo(() => getSuggestBySite(siteKind), [siteKind]);

  const existingTitles = React.useMemo(() => buildExistingTitlesSet(activeMenu || []), [activeMenu]);

  const filteredSuggest = React.useMemo(
    () =>
      filterSuggest({
        suggest: SUGGEST,
        baseNames,
        existingTitles,
        existingPages,
      }),
    [SUGGEST, baseNames, existingTitles, existingPages],
  );

  return (
    <div className={styles.cardform}>
      <div className={styles.cardHeader}>
        <button className={`${styles.btn} ${styles.btnOutlineLight}`} onClick={addBlankItem} type="button">
          <i className="bi bi-plus-lg" /> Add empty item
        </button>

        {hasTabs && (
          <div className={styles.smallHelp} style={{ marginLeft: "auto" }}>
            <button type="button" className={`${styles.btn} ${styles.btnOutlinePrimary}`}>
              Showing: <b>{forcedTab === "dashboard" ? "Dashboard" : "Home"}</b>
            </button>
          </div>
        )}
      </div>

      <div className={styles.grid2}>
        <div className={styles.blocksGrid}>
          {baseNames.map((n) => (
            <div key={n} className={styles.blockCell}>
              <div
                className={`${styles.blockCard} ${styles.appCard}`}
                draggable
                onDragStart={(e) => onDragStart(e, { name: n, internalPages: INTERNAL_PAGES || [] })}
                onClick={() =>
                  addByName({
                    name: n,
                    activeMenu: activeMenu || [],
                    setActiveMenu,
                    internalPages: INTERNAL_PAGES || [],
                  })
                }
                title="Kéo thả hoặc nhấn để thêm vào Menu"
              >
                <div className={styles.blockIconWrap}>
                  <i className="bi bi-cursor" />
                </div>
                <div>
                  <div className={styles.blockTitle}>{n}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <section
          className={styles.blocksGridRight}
          aria-label="Suggestions for expanding the menu"
          style={{ display: "grid", gap: 6 }}
        >
          {Object.keys(filteredSuggest).length === 0 ? (
            <div className={styles.smallHelp}>
              No more suggestions — you've got all the important points already. 🎉
            </div>
          ) : (
            Object.entries(filteredSuggest).map(([group, items]) => (
              <div key={group} style={{ marginBottom: 10 }}>
                <div style={{ fontWeight: 500, marginBottom: 6, color: "rgb(134 134 134)", fontSize: 16 }}>{group}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {items.map((name) => (
                    <button
                      type="button"
                      key={name}
                      onClick={() =>
                        addByName({
                          name,
                          activeMenu: activeMenu || [],
                          setActiveMenu,
                          internalPages: INTERNAL_PAGES || [],
                        })
                      }
                      onDragStart={(e) => onDragStart(e as any, { name, internalPages: INTERNAL_PAGES || [] })}
                      draggable
                      className={styles.btn}
                      style={{
                        borderRadius: 20,
                        border: "1px dashed var(--bd,#cbd5e1)",
                        background: "var(--chip-bg,rgba(16,185,129,.08))",
                        padding: "6px 10px",
                        fontSize: 13,
                      }}
                      title="Click to add, or drag and drop into structure"
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
