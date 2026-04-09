"use client";

import React from "react";
import { REGISTRY } from "@/lib/ui-builder/registry";
import type { RegItem } from "@/lib/ui-builder/types";
import styles from "@/styles/admin/builder/pages/navigators.module.css";

import { useControlsPaletteStore } from "@/store/builder/pages/add/controlsPalette.store";
import { filterTemplates, TEMPLATES, type RegistryKind } from "@/services/builder/pages/add/templates.service";

type Props = {
  search: string;
  setSearch: (v: string) => void;
  onDragStart: (kind: string) => (e: React.DragEvent) => void;
  registry?: RegItem[];
  templateGroup?: string | null;
};

type SpecialTemplateGroup = "Topbar" | "Header" | "Footer" | "Sidebar";

function normalizeText(value?: string | null) {
  return (value || "").trim().toLowerCase();
}

function getSpecialTemplateGroup(value?: string | null): SpecialTemplateGroup | null {
  const normalized = normalizeText(value);

  if (normalized === "topbar") return "Topbar";
  if (normalized === "header") return "Header";
  if (normalized === "footer") return "Footer";
  if (normalized === "sidebar") return "Sidebar";

  return null;
}

function isSpecialTemplateLabel(label?: string | null) {
  const normalized = normalizeText(label);

  return normalized === "topbar" || normalized === "header" || normalized === "footer" || normalized === "sidebar";
}

export default function ControlsPalette({ search, setSearch, onDragStart, registry, templateGroup }: Props) {
  const sourceRegistry = React.useMemo(() => registry ?? REGISTRY, [registry]);

  const registryByKind = React.useMemo(() => {
    const m = new Map<string, RegItem>();
    for (const r of sourceRegistry) m.set(r.kind, r);
    return m;
  }, [sourceRegistry]);

  const q = search.trim().toLowerCase();

  const specialTemplateGroup = React.useMemo(() => getSpecialTemplateGroup(templateGroup), [templateGroup]);

  const templatesFiltered = React.useMemo(() => {
    const baseTemplates = specialTemplateGroup
      ? TEMPLATES.filter((tpl) => normalizeText(tpl.label) === normalizeText(specialTemplateGroup))
      : TEMPLATES.filter((tpl) => !isSpecialTemplateLabel(tpl.label));

    const raw = filterTemplates({
      templates: baseTemplates,
      query: q,
      registryByKind,
    });

    return raw
      .map((tpl) => ({
        ...tpl,
        children: tpl.children.filter((k) => registryByKind.has(k)),
      }))
      .filter((tpl) => tpl.children.length > 0);
  }, [specialTemplateGroup, q, registryByKind]);

  const templateIds = React.useMemo(() => templatesFiltered.map((t) => t.id), [templatesFiltered]);

  const { openTpl, setOpenTpl, toggleTpl, expandAll, collapseAll } = useControlsPaletteStore(templateIds);

  React.useEffect(() => {
    if (templatesFiltered.length > 0) {
      setOpenTpl(new Set(templatesFiltered.map((t) => t.id)));
      return;
    }

    setOpenTpl(new Set());
  }, [templatesFiltered, setOpenTpl]);

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
            <i className="bi bi-grid-3x3-gap me-1" /> Templates
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

                      return (
                        <li
                          key={`${tpl.id}:${k}:${i}`}
                          className={styles.item}
                          draggable
                          onDragStart={onDragStart(k)}
                          title={`Drag to canvas: ${label}`}
                          role="treeitem"
                          aria-selected={false}
                        >
                          <div className={styles.itemLeft}>
                            <i className="bi bi-box" />
                            <span className={styles.itemLabel}>{label}</span>
                          </div>
                          <div className={styles.itemRight}>
                            <i className="bi bi-arrow-right-circle" />
                          </div>
                        </li>
                      );
                    })}
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
