"use client";

import React from "react";
import { REGISTRY } from "@/lib/ui-builder/registry";
import type { RegItem } from "@/lib/ui-builder/types";
import styles from "@/styles/admin/pages/navigators.module.css";

import { useControlsPaletteStore } from "@/store/pages/add/controlsPalette.store";

type Props = {
  search: string;
  setSearch: (v: string) => void;
  onDragStart: (kind: string) => (e: React.DragEvent) => void;
  registry?: RegItem[];
  templateGroup?: string | null;
};

type RegistryKind = string;

type SpecialTemplateGroup = "Topbar" | "Header" | "Footer" | "Sidebar";

type TemplateApiItem = {
  id: string;
  code?: string;
  label: string;
  kind?: string;
  group?:
    | string
    | {
        id?: string;
        code?: string;
        name?: string;
      }
    | null;
  children?: string[];
};

type BuilderTemplate = {
  id: string;
  label: string;
  group: string | null;
  kind: string | null;
  children: RegistryKind[];
};

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

function getTemplateGroupName(group?: TemplateApiItem["group"]): string | null {
  if (!group) return null;
  if (typeof group === "string") return group;
  return group.name ?? group.code ?? null;
}

function inferGroupFromKind(kind?: string | null): string | null {
  const normalized = normalizeText(kind);

  if (normalized.startsWith("topbar")) return "Topbar";
  if (normalized.startsWith("header")) return "Header";
  if (normalized.startsWith("footer")) return "Footer";
  if (normalized.startsWith("sidebar")) return "Sidebar";
  if (normalized.startsWith("hero")) return "Hero";
  if (normalized.startsWith("section")) return "Section";
  if (normalized.startsWith("detail")) return "Detail";
  if (normalized.startsWith("product")) return "Product";

  return null;
}

function filterTemplates({
  templates,
  query,
  registryByKind,
}: {
  templates: BuilderTemplate[];
  query: string;
  registryByKind: Map<string, RegItem>;
}) {
  const normalizedQuery = normalizeText(query);

  if (!normalizedQuery) return templates;

  return templates
    .map((tpl) => {
      const labelMatched = normalizeText(tpl.label).includes(normalizedQuery);
      const groupMatched = normalizeText(tpl.group).includes(normalizedQuery);
      const kindMatched = normalizeText(tpl.kind).includes(normalizedQuery);

      const children = tpl.children.filter((kind) => {
        const reg = registryByKind.get(kind);
        const regLabel = normalizeText(reg?.label ?? kind);
        return regLabel.includes(normalizedQuery) || normalizeText(kind).includes(normalizedQuery);
      });

      if (labelMatched || groupMatched || kindMatched) {
        return {
          ...tpl,
          children: tpl.children,
        };
      }

      return {
        ...tpl,
        children,
      };
    })
    .filter((tpl) => tpl.children.length > 0);
}

export default function ControlsPalette({ search, setSearch, onDragStart, registry, templateGroup }: Props) {
  const sourceRegistry = React.useMemo(() => registry ?? REGISTRY, [registry]);

  const registryByKind = React.useMemo(() => {
    const map = new Map<string, RegItem>();
    for (const item of sourceRegistry) {
      map.set(item.kind, item);
    }
    return map;
  }, [sourceRegistry]);

  const [templates, setTemplates] = React.useState<BuilderTemplate[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);

  const q = search.trim().toLowerCase();
  const specialTemplateGroup = React.useMemo(() => getSpecialTemplateGroup(templateGroup), [templateGroup]);

  React.useEffect(() => {
    let cancelled = false;

    async function fetchTemplates() {
      try {
        setLoading(true);
        setLoadError(null);

        const response = await fetch("/api/platform/templates/template-list", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch templates: ${response.status}`);
        }

        const json = (await response.json()) as {
          success?: boolean;
          data?: TemplateApiItem[];
          message?: string;
        };

        const rawTemplates = Array.isArray(json?.data) ? json.data : [];

        const mappedTemplates: BuilderTemplate[] = rawTemplates
          .map((item) => {
            const children = Array.isArray(item.children)
              ? item.children.filter((kind): kind is string => typeof kind === "string" && kind.trim().length > 0)
              : [];

            const primaryKind = item.kind ?? children[0] ?? null;
            const inferredGroup = inferGroupFromKind(primaryKind);
            const apiGroup = getTemplateGroupName(item.group);

            return {
              id: item.code || item.id,
              label: item.label,
              group: inferredGroup ?? apiGroup,
              kind: primaryKind,
              children,
            };
          })
          .filter((item) => item.children.length > 0);

        if (!cancelled) {
          setTemplates(mappedTemplates);
        }
      } catch (error) {
        if (!cancelled) {
          const message = error instanceof Error ? error.message : "Không thể tải danh sách template";
          setLoadError(message);
          setTemplates([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchTemplates();

    return () => {
      cancelled = true;
    };
  }, []);

  const templatesFiltered = React.useMemo(() => {
    const baseTemplates = specialTemplateGroup
      ? templates.filter((tpl) => normalizeText(tpl.group) === normalizeText(specialTemplateGroup))
      : templates;

    const raw = filterTemplates({
      templates: baseTemplates,
      query: q,
      registryByKind,
    });

    // KHÔNG loại template nếu registry chưa đủ
    // Chỉ làm sạch children bị trùng
    return raw.map((tpl) => ({
      ...tpl,
      children: Array.from(new Set(tpl.children)),
    }));
  }, [specialTemplateGroup, templates, q, registryByKind]);

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
          {loading && <div className={styles.emptyState}>Đang tải danh sách template...</div>}

          {!loading && loadError && (
            <div className={styles.emptyState}>
              <i className="bi bi-exclamation-triangle me-1" />
              {loadError}
            </div>
          )}

          {!loading && !loadError && (
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
                      <i className="bi bi-stack" /> Drag
                    </button>
                  </div>

                  {openTpl.has(tpl.id) && (
                    <ul className={styles.tplChildren}>
                      {tpl.children.map((kind, index) => {
                        const reg = registryByKind.get(kind);
                        const label = reg?.label ?? kind;

                        return (
                          <li
                            key={`${tpl.id}:${kind}:${index}`}
                            className={styles.item}
                            draggable
                            onDragStart={onDragStart(kind)}
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
          )}

          {!loading && !loadError && templatesFiltered.length === 0 && (
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