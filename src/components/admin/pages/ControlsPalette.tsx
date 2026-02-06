"use client";
import React from "react";
import { REGISTRY } from "@/lib/ui-builder/registry";
import styles from "@/styles/admin/pages/navigators.module.css";

type Props = {
  search: string;
  setSearch: (v: string) => void;
  onDragStart: (kind: string) => (e: React.DragEvent) => void;
};

type RegistryKind = (typeof REGISTRY)[number]["kind"];

function tpl(id: string, label: string, children: RegistryKind[]) {
  return { id, label, children };
}

const HEADER_KINDS: readonly string[] = [];
const VISIBLE_HEADER_KINDS = new Set<string>(["HeaderShopFlex"]);

const TEMPLATES = [
  tpl("tpl-shop-green", "ShopGreen", ["Topbar1", "Header1", "Hero1", "BestSeller1", "Brand1", "Makeup1", "Skincare1", "BodyCare1", "KidsCare1", "MenCare1", "Accessories1", "Footer1"]),
  tpl("tpl-topbar-basic", "Topbar", [
    "TopbarPro",
    "TopbarPink",
    "TopbarOrange2025",
    "TopbarGreen",
    "TopbarProLang",
    "TopbarYellow",
    "TopbarBlueKind",
    "TopbarBlueDark",
    "TopbarBright",
    "TopbarAurora",
    "Topbar2026",
    "TopbarMultiKind",
  ]),
  tpl("tpl-header-basic", "Header", [
    "HeaderProKind",
    "HeaderPink",
    "HeaderOrange",
    "HeaderWear",
    "HeaderGreenKind",
    "HeaderBlue",
    "HeaderDark",
    "HeaderAuroraKind",
    "HeaderFashionKind",
    "HeaderWearKind",
    "HeaderWhiteKind",
    "HeaderSimpleKind",
    "Header2025Kind",
  ]),
  tpl("tpl-footer-basic", "Footer", [
    "FooterAurora",
    "FooterBlue",
    "FooterBright",
    "FooterDark",
    "FooterDarkOne",
    "FooterFashion",
    "FooterGreen",
    "FooterOne",
    "FooterOrange",
    "FooterPink",
    "FooterPro",
    "FooterTop",
    "FooterWear",
    "FooterYellow",
  ]),
] as const;

export default function ControlsPalette({ search, setSearch, onDragStart }: Props) {
  const registryByKind = React.useMemo(() => {
    const m = new Map<string, (typeof REGISTRY)[number]>();
    for (const r of REGISTRY) m.set(r.kind, r);
    return m;
  }, []);

  const registryVisible = React.useMemo(() => {
    if (HEADER_KINDS.length === 0) return REGISTRY;

    return REGISTRY.filter((r) => {
      const isHeader = HEADER_KINDS.includes(r.kind);
      return isHeader ? VISIBLE_HEADER_KINDS.has(r.kind) : true;
    });
  }, []);

  const q = search.trim().toLowerCase();

  const templatesFiltered = React.useMemo(() => {
    if (!q) return TEMPLATES as readonly { id: string; label: string; children: RegistryKind[] }[];

    return TEMPLATES.map((t) => {
      const matchTpl = t.label.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      if (matchTpl) return t;

      const filteredChildren = t.children.filter((k) => {
        const reg = registryByKind.get(k);
        const label = (reg?.label ?? "").toLowerCase();
        return k.toLowerCase().includes(q) || label.includes(q);
      });

      return { ...t, children: filteredChildren };
    }).filter((t) => t.children.length > 0);
  }, [q, registryByKind]);

  const [openTpl, setOpenTpl] = React.useState<Set<string>>(() => new Set(TEMPLATES.map((t) => t.id)));

  React.useEffect(() => {
    if (!q) return;
    setOpenTpl(new Set(templatesFiltered.map((t) => t.id)));
  }, [q, templatesFiltered]);

  const toggleTpl = React.useCallback((id: string) => {
    setOpenTpl((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  }, []);

  const onDragTemplate = React.useCallback(
    (tplId: string) => (e: React.DragEvent) => {
      e.dataTransfer.setData("text/plain", `template:${tplId}`);
      e.dataTransfer.setData("application/json", JSON.stringify({ templateId: tplId }));
      e.dataTransfer.effectAllowed = "copy";
    },
    [],
  );

  const expandAllTemplates = React.useCallback(() => setOpenTpl(new Set(templatesFiltered.map((t) => t.id))), [templatesFiltered]);
  const collapseAllTemplates = React.useCallback(() => setOpenTpl(new Set()), []);

  const _registryVisible = registryVisible;

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${styles.tabActive}`} type="button">
            <i className="bi bi-grid-3x3-gap me-1" /> Elements
          </button>
          <button className={styles.tab} type="button" title="Variables (coming soon)">
            <i className="bi bi-sliders me-1" /> Variables
          </button>
        </div>

        <div className={styles.headTools}>
          <button className={styles.ghostBtn} onClick={expandAllTemplates} title="Expand templates" type="button">
            <i className="bi bi-arrows-expand" />
          </button>
          <button className={styles.ghostBtn} onClick={collapseAllTemplates} title="Collapse templates" type="button">
            <i className="bi bi-arrows-collapse" />
          </button>
        </div>
      </div>

      <div className={styles.searchBox}>
        <i className={`bi bi-search ${styles.searchIcon}`} />
        <input className={styles.searchInput} placeholder="Search elements…" value={search} onChange={(e) => setSearch(e.target.value)} />
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
                  <button type="button" className={styles.tplCaret} onClick={() => toggleTpl(tpl.id)} aria-expanded={openTpl.has(tpl.id)}>
                    <i className={`bi ${openTpl.has(tpl.id) ? "bi-caret-down-fill" : "bi-caret-right-fill"}`} />
                  </button>

                  <span className={styles.tplLabel}>{tpl.label}</span>

                  <button type="button" className={styles.tplDragAll} draggable onDragStart={onDragTemplate(tpl.id)} title="Drag entire template">
                    <i className="bi bi-stack" /> Drag all
                  </button>
                </div>

                {openTpl.has(tpl.id) && (
                  <ul className={styles.tplChildren}>
                    {tpl.children.map((k, i) => {
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
                          role="treeitem">
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
                      <li className={styles.item} aria-disabled="true">
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
