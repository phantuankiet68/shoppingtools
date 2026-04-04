"use client";

import { useCallback, useMemo } from "react";
import styles from "@/styles/admin/builder/menus/menu.module.css";

import { useMenuStore } from "@/components/admin/builder/menus/state/useMenuStore";
import { useAllowedBlocksStore } from "@/store/builder/menus/useAllowedBlocksStore";

import {
  filterSuggest,
  forcedTabFromSet,
  getSuggestBySite,
  pickBaseNames,
  buildExistingPagesSet,
  buildExistingTitlesSet,
} from "@/services/builder/menus/allowedBlocks.service";

import { MENU_MESSAGES as M } from "@/features/builder/menus/messages";
import { useModal } from "@/components/admin/shared/common/modal";

type TabKey = "home" | "dashboard";

export default function AllowedBlocks() {
  const modal = useModal();

  const {
    TEMPLATE_ALLOWED,
    templateKey,
    activeMenu,
    setActiveMenu,
    INTERNAL_PAGES,
    siteKind,
    currentSet,
  } = useMenuStore();

  const { addByName, onDragStart } = useAllowedBlocksStore();

  const tpl = TEMPLATE_ALLOWED[templateKey];
  const forcedTab: TabKey = forcedTabFromSet(currentSet);

  const baseNames = useMemo(() => pickBaseNames(tpl, forcedTab), [tpl, forcedTab]);

  const existingPages = useMemo(
    () => buildExistingPagesSet(INTERNAL_PAGES || []),
    [INTERNAL_PAGES],
  );

  const existingTitles = useMemo(
    () => buildExistingTitlesSet(activeMenu || []),
    [activeMenu],
  );

  const suggestSource = useMemo(
    () => getSuggestBySite(siteKind),
    [siteKind],
  );

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

  const handleAddName = useCallback(
    (name: string) => {
      try {
        addByName({
          name,
          activeMenu: activeMenu || [],
          setActiveMenu,
          internalPages: INTERNAL_PAGES || [],
        });

        modal.success(
          "Block added successfully",
          `Block "${name}" has been added to the menu.`,
        );
      } catch (e: unknown) {
        modal.error(
          "Cannot add block",
          (e as Error)?.message || "An error occurred while adding the block.",
        );
      }
    },
    [addByName, activeMenu, setActiveMenu, INTERNAL_PAGES, modal],
  );

  return (
    <div className={styles.cardform}>
      <div className={styles.grid2}>
        <div className={styles.blocksGrid}>
          {baseNames.map((name) => (
            <div key={name} className={styles.blockCell}>
              <div
                className={`${styles.blockCard} ${styles.appCard}`}
                draggable
                onDragStart={(e) =>
                  onDragStart(e, { name, internalPages: INTERNAL_PAGES || [] })
                }
                onClick={() => handleAddName(name)}
                title={M.allowedBlocks.baseBlockTooltip}
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

        <section
          className={styles.blocksGridRight}
          aria-label={M.allowedBlocks.suggestionsAria}
        >
          {Object.keys(filteredSuggest).length === 0 ? (
            <div className={styles.smallHelp}>
              {M.allowedBlocks.noMoreSuggestions}
            </div>
          ) : (
            Object.entries(filteredSuggest).map(([group, items]) => (
              <div key={group} style={{ marginBottom: 10 }}>
                <div
                  style={{
                    fontWeight: 500,
                    marginBottom: 6,
                    color: "rgb(134 134 134)",
                    fontSize: 13,
                  }}
                >
                  {group}
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {items.map((name) => (
                    <button
                      type="button"
                      key={name}
                      onClick={() => handleAddName(name)}
                      onDragStart={(e) =>
                        onDragStart(e, {
                          name,
                          internalPages: INTERNAL_PAGES || [],
                        })
                      }
                      draggable
                      className={styles.btn}
                      style={{
                        borderRadius: 20,
                        border: "1px dashed var(--bd,#cbd5e1)",
                        background: "var(--bg-pro)",
                        padding: "6px 10px",
                        fontSize: 13,
                      }}
                      title={M.allowedBlocks.suggestChipTooltip}
                    >
                      <i
                        className="bi bi-plus-lg"
                        style={{ marginRight: 6 }}
                      />
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