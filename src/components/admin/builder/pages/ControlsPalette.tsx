"use client";
import React from "react";
import { REGISTRY } from "@/lib/ui-builder/registry";
import styles from "@/styles/admin/builder/pages/navigators.module.css";

import { useControlsPaletteStore } from "@/store/builder/pages/add/controlsPalette.store";
import { filterTemplates, TEMPLATES, type RegistryKind } from "@/services/builder/pages/add/templates.service";

type Props = {
  search: string;
  setSearch: (v: string) => void;
  onDragStart: (kind: string) => (e: React.DragEvent) => void;
};

export default function ControlsPalette({ search, setSearch, onDragStart }: Props) {
  const registryByKind = React.useMemo(() => {
    const m = new Map<string, (typeof REGISTRY)[number]>();
    for (const r of REGISTRY) m.set(r.kind, r);
    return m;
  }, []);

  const q = search.trim().toLowerCase();

  const templatesFiltered = React.useMemo(() => {
    return filterTemplates({
      templates: TEMPLATES,
      query: q,
      registryByKind,
    });
  }, [q, registryByKind]);

  const { openTpl, setOpenTpl, toggleTpl, expandAll, collapseAll } = useControlsPaletteStore(
    TEMPLATES.map((t) => t.id),
  );

  // auto-expand templates when searching
  React.useEffect(() => {
    if (!q) return;
    setOpenTpl(new Set(templatesFiltered.map((t) => t.id)));
  }, [q, templatesFiltered, setOpenTpl]);

  const onDragTemplate = React.useCallback(
    (tplId: string) => (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", `template:${tplId}`);
      e.dataTransfer.setData("application/json", JSON.stringify({ templateId: tplId }));
      e.dataTransfer.effectAllowed = "copy";
    },
    [],
  );

  const expandAllTemplates = React.useCallback(
    () => expandAll(templatesFiltered.map((t) => t.id)),
    [expandAll, templatesFiltered],
  );

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${styles.tabActive}`} type="button">
            <i className="bi bi-grid-3x3-gap me-1" /> Elements
          </button>
        </div>

        <div className={styles.headTools}>
          <button className={styles.ghostBtn} onClick={expandAllTemplates} title="Expand templates" type="button">
            <i className="bi bi-arrows-expand" />
          </button>
          <button className={styles.ghostBtn} onClick={collapseAll} title="Collapse templates" type="button">
            <i className="bi bi-arrows-collapse" />
          </button>
        </div>
      </div>

      <div className={styles.searchBox}>
        <i className={`bi bi-search ${styles.searchIcon}`} />
        <input
          className={styles.searchInput}
          placeholder="Search elements…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.templatesWrapper}>
        <div className={styles.templatesBox}>
          <div className={styles.templatesHead}>
            <span className={styles.templatesTitle}>Templates</span>
            <span className={styles.templatesCount}>{templatesFiltered.length}</span>
          </div>

          <ul className={styles.templatesList}>
            {templatesFiltered.map((tpl) => (
              <li key={tpl.id} className={styles.tplItem}>
                <div className={styles.tplHeader}>
                  <button
                    type="button"
                    className={styles.tplCaret}
                    onClick={() => toggleTpl(tpl.id)}
                    aria-expanded={openTpl.has(tpl.id)}
                  >
                    <i className={`bi ${openTpl.has(tpl.id) ? "bi-caret-down-fill" : "bi-caret-right-fill"}`} />
                  </button>

                  <span className={styles.tplLabel}>{tpl.label}</span>

                  <button
                    type="button"
                    className={styles.tplDragAll}
                    draggable
                    onDragStart={onDragTemplate(tpl.id)}
                    title="Drag entire template"
                  >
                    <i className="bi bi-stack" /> Drag all
                  </button>
                </div>

                {openTpl.has(tpl.id) && (
                  <ul className={styles.tplChildren}>
                    {tpl.children.map((k: RegistryKind, i: number) => {
                      const reg = registryByKind.get(k);
                      const label = reg?.label ?? k;
                      const missing = !reg;

                      return (
                        <li
                          key={`${tpl.id}:${k}:${i}`}
                          className={`${styles.item} ${missing ? styles.itemMissing : ""}`}
                          draggable={!missing}
                          onDragStart={!missing ? onDragStart(k) : undefined}
                          title={missing ? `Missing in REGISTRY: ${k}` : `Drag to canvas: ${label}`}
                          role="treeitem"
                          aria-selected={false}
                        >
                          <div className={styles.itemLeft}>
                            <i className={`bi ${missing ? "bi-exclamation-triangle" : "bi-box"}`} />
                            <span className={styles.itemLabel}>
                              {label} {missing && <em className={styles.missTag}>(missing)</em>}
                            </span>
                          </div>
                          <div className={styles.itemRight}>
                            <i className="bi bi-arrow-right-circle" />
                          </div>
                        </li>
                      );
                    })}

                    {tpl.children.length === 0 && (
                      <li className={styles.item}>
                        <div className={styles.itemLeft}>
                          <i className="bi bi-info-circle" />
                          <span className={styles.itemLabel}>No matches</span>
                        </div>
                      </li>
                    )}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {templatesFiltered.length === 0 && (
            <div className={styles.emptyState}>
              <i className="bi bi-search me-1" />
              Không có template nào khớp với “{search.trim()}”
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
