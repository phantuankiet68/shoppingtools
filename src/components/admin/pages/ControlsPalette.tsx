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

const HEADER_KINDS = [] as const;

const VISIBLE_HEADER_KINDS = new Set<string | (typeof HEADER_KINDS)[number]>(["HeaderShopFlex"]);

const TEMPLATES = [
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
];

type Tree = Record<string, { id: string; label: string; kind: string }[]>;

export default function ControlsPalette({ search, setSearch, onDragStart }: Props) {
  const REGISTRY_VISIBLE = React.useMemo(() => {
    return REGISTRY.filter((r) => {
      const isHeader = (HEADER_KINDS as readonly string[]).includes(r.kind);
      return isHeader ? VISIBLE_HEADER_KINDS.has(r.kind) : true;
    });
  }, []);

  // 2) Search filter trên REGISTRY_VISIBLE
  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    const base = REGISTRY_VISIBLE;
    if (!q) return base;
    return base.filter((r) => r.label.toLowerCase().includes(q) || r.kind.toLowerCase().includes(q));
  }, [search, REGISTRY_VISIBLE]);

  // 3) Build tree theo nhóm
  const tree: Tree = React.useMemo(() => {
    const t: Tree = {};
    for (const r of filtered) {
      const isHeader = (HEADER_KINDS as readonly string[]).includes(r.kind);
      const group = isHeader ? "Headers" : "Elements";
      (t[group] ??= []).push({ id: r.kind, label: r.label, kind: r.kind });
    }
    Object.keys(t).forEach((k) => t[k].sort((a, b) => a.label.localeCompare(b.label)));
    return t;
  }, [filtered]);

  const defaultOpen = React.useMemo(() => Object.keys(tree), [tree]);
  const [open, setOpen] = React.useState<Set<string>>(new Set(defaultOpen));
  React.useEffect(() => setOpen(new Set(defaultOpen)), [defaultOpen]);

  const toggle = (key: string) =>
    setOpen((prev) => {
      const n = new Set(prev);
      n.has(key) ? n.delete(key) : n.add(key);
      return n;
    });

  // Collapsible cho Templates box
  const [openTpl, setOpenTpl] = React.useState<Set<string>>(new Set(TEMPLATES.map((t) => t.id)));
  const toggleTpl = (id: string) =>
    setOpenTpl((prev) => {
      const n = new Set(prev);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  // Kéo toàn bộ template (ghi metadata vào dataTransfer)
  const onDragTemplate = (tplId: string) => (e: React.DragEvent) => {
    const tpl = TEMPLATES.find((t) => t.id === tplId);
    e.dataTransfer.setData("text/plain", `template:${tplId}`);
    if (tpl) {
      e.dataTransfer.setData("application/json", JSON.stringify({ templateId: tplId, kinds: tpl.children }));
    }
    e.dataTransfer.effectAllowed = "copy";
  };

  const expandAll = () => setOpen(new Set(Object.keys(tree)));
  const collapseAll = () => setOpen(new Set());

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${styles.tabActive}`}>
            <i className="bi bi-grid-3x3-gap me-1" /> Elements
          </button>
          <button className={styles.tab} title="Variables (coming soon)">
            <i className="bi bi-sliders me-1" /> Variables
          </button>
        </div>
        <div className={styles.headTools}>
          <button className={styles.ghostBtn} onClick={expandAll} title="Expand all">
            <i className="bi bi-arrows-expand" />
          </button>
          <button className={styles.ghostBtn} onClick={collapseAll} title="Collapse all">
            <i className="bi bi-arrows-collapse" />
          </button>
        </div>
      </div>

      <div className={styles.searchBox}>
        <i className={`bi bi-search ${styles.searchIcon}`} />
        <input className={styles.searchInput} placeholder="Search elements…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className={styles.templatesWrapper}>
        {/* Templates Box */}
        <div className={styles.templatesBox}>
          <div className={styles.templatesHead}>
            <span className={styles.templatesTitle}>Templates</span>
            <span className={styles.templatesCount}>{TEMPLATES.length}</span>
          </div>
          <ul className={styles.templatesList}>
            {TEMPLATES.map((tpl) => (
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
                      const reg = REGISTRY.find((r) => r.kind === k);
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
                            <i className="bi bi-arrow-right-circle"></i>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
