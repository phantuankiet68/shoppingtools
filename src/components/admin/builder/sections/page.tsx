"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/builder/sections/sections-builder.module.css";

type SectionRow = {
  id: string;
  type: string; // "hero" | "text" | ...
  enabled: boolean;
  sort: number;
  data: any;
  style?: any | null;
};

const SECTION_TYPES = [
  { key: "hero", label: "Hero", icon: "bi-window" },
  { key: "text", label: "Text", icon: "bi-text-paragraph" },
  { key: "gallery", label: "Gallery", icon: "bi-images" },
  { key: "cta", label: "CTA", icon: "bi-megaphone" },
  { key: "faq", label: "FAQ", icon: "bi-question-circle" },
  { key: "pricing", label: "Pricing", icon: "bi-tags" },
  { key: "custom", label: "Custom", icon: "bi-braces" },
];

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function safeJsonParse(s: string) {
  try {
    const v = JSON.parse(s);
    return { ok: true as const, value: v };
  } catch (e: any) {
    return { ok: false as const, error: e?.message || "Invalid JSON" };
  }
}

function prettyJson(v: any) {
  try {
    return JSON.stringify(v ?? {}, null, 2);
  } catch {
    return "{}";
  }
}

export default function SectionsBuilderPage() {
  // Demo seed (thay bằng fetch API của bạn)
  const [sections, setSections] = useState<SectionRow[]>(() => [
    {
      id: uid(),
      type: "hero",
      enabled: true,
      sort: 10,
      data: { title: "Welcome", subtitle: "Build your page with sections", buttons: [{ label: "Get started", href: "/start" }] },
      style: { padding: "56px 0", background: "linear-gradient(135deg, #eaf4ff, #f5fbff)" },
    },
    {
      id: uid(),
      type: "text",
      enabled: true,
      sort: 20,
      data: { heading: "About", body: "This is a low-code builder page. Edit JSON on the right." },
      style: { padding: "32px 0" },
    },
  ]);

  const ordered = useMemo(() => [...sections].sort((a, b) => a.sort - b.sort), [sections]);

  const [activeId, setActiveId] = useState<string>(() => ordered[0]?.id || "");
  const active = ordered.find((s) => s.id === activeId) || null;

  // Inspector editors (string)
  const [dataText, setDataText] = useState<string>(() => prettyJson(active?.data));
  const [styleText, setStyleText] = useState<string>(() => prettyJson(active?.style ?? {}));
  const [inspectorErr, setInspectorErr] = useState<string>("");

  // keep inspector sync when switching active section
  function selectSection(id: string) {
    setActiveId(id);
    const s = ordered.find((x) => x.id === id);
    setDataText(prettyJson(s?.data));
    setStyleText(prettyJson(s?.style ?? {}));
    setInspectorErr("");
  }

  function addSection(type: string) {
    const nextSort = (ordered.at(-1)?.sort ?? 0) + 10;
    const newRow: SectionRow = {
      id: uid(),
      type,
      enabled: true,
      sort: nextSort,
      data: type === "hero" ? { title: "New Hero", subtitle: "Edit me" } : {},
      style: { padding: "24px 0" },
    };
    setSections((prev) => [...prev, newRow]);
    // select it
    setTimeout(() => selectSection(newRow.id), 0);
  }

  function removeSection(id: string) {
    setSections((prev) => prev.filter((x) => x.id !== id));
    if (activeId === id) {
      const remain = ordered.filter((x) => x.id !== id);
      if (remain[0]) setTimeout(() => selectSection(remain[0].id), 0);
      else {
        setActiveId("");
        setDataText("{}");
        setStyleText("{}");
      }
    }
  }

  function duplicateSection(id: string) {
    const s = ordered.find((x) => x.id === id);
    if (!s) return;
    const nextSort = (ordered.at(-1)?.sort ?? 0) + 10;
    const copy: SectionRow = {
      ...s,
      id: uid(),
      sort: nextSort,
      // deep clone for safety
      data: JSON.parse(JSON.stringify(s.data ?? {})),
      style: JSON.parse(JSON.stringify(s.style ?? {})),
    };
    setSections((prev) => [...prev, copy]);
    setTimeout(() => selectSection(copy.id), 0);
  }

  function toggleEnabled(id: string) {
    setSections((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));
  }

  // Drag & drop reorder: update sort by current order 10,20,30...
  const [dragId, setDragId] = useState<string | null>(null);

  function onDragStart(id: string) {
    setDragId(id);
  }
  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;

    const list = [...ordered];
    const from = list.findIndex((x) => x.id === dragId);
    const to = list.findIndex((x) => x.id === targetId);
    if (from < 0 || to < 0) return;

    const [moved] = list.splice(from, 1);
    list.splice(to, 0, moved);

    // reassign sorts
    const next = list.map((x, i) => ({ ...x, sort: (i + 1) * 10 }));
    setSections(next);
    setDragId(null);
  }

  function applyInspector() {
    if (!active) return;

    const dataRes = safeJsonParse(dataText.trim() || "{}");
    if (!dataRes.ok) {
      setInspectorErr(`Data JSON error: ${dataRes.error}`);
      return;
    }

    const styleRes = safeJsonParse(styleText.trim() || "{}");
    if (!styleRes.ok) {
      setInspectorErr(`Style JSON error: ${styleRes.error}`);
      return;
    }

    setSections((prev) =>
      prev.map((x) =>
        x.id === active.id
          ? {
              ...x,
              data: dataRes.value,
              style: styleRes.value,
            }
          : x
      )
    );

    setInspectorErr("");
  }

  function setType(type: string) {
    if (!active) return;
    setSections((prev) => prev.map((x) => (x.id === active.id ? { ...x, type } : x)));
  }

  const activeTypeMeta = SECTION_TYPES.find((t) => t.key === active?.type);

  return (
    <div className={styles.shell}>
      {/* Top bar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Sections Builder</div>
            <div className={styles.brandSub}>Next.js 15 · CSS Modules · Bootstrap Icons</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.ghostBtn} type="button" onClick={() => addSection("text")}>
            <i className="bi bi-plus-lg" /> Add Text
          </button>
          <button className={styles.primaryBtn} type="button" onClick={applyInspector} disabled={!active}>
            <i className="bi bi-check2-circle" /> Apply changes
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Page Sections</div>
            <div className={styles.sidebarHint}>Drag to reorder · Click to edit</div>
          </div>

          <div className={styles.addGrid}>
            {SECTION_TYPES.slice(0, 6).map((t) => (
              <button key={t.key} className={styles.addTile} type="button" onClick={() => addSection(t.key)}>
                <i className={`bi ${t.icon}`} />
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          <div className={styles.list}>
            {ordered.length === 0 && <div className={styles.empty}>No sections yet. Add one above.</div>}

            {ordered.map((s) => {
              const meta = SECTION_TYPES.find((t) => t.key === s.type);
              const isActive = s.id === activeId;

              return (
                <div
                  key={s.id}
                  className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                  draggable
                  onDragStart={() => onDragStart(s.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(s.id)}
                  onClick={() => selectSection(s.id)}
                  role="button"
                  tabIndex={0}>
                  <div className={styles.itemLeft}>
                    <div className={styles.dragHandle} title="Drag to reorder">
                      <i className="bi bi-grip-vertical" />
                    </div>

                    <div className={styles.itemIcon}>
                      <i className={`bi ${meta?.icon ?? "bi-square"}`} />
                    </div>

                    <div className={styles.itemText}>
                      <div className={styles.itemTitle}>
                        {meta?.label ?? s.type}
                        {!s.enabled && <span className={styles.badgeOff}>OFF</span>}
                      </div>
                      <div className={styles.itemMeta}>
                        <span className={styles.mono}>sort {s.sort}</span>
                        <span className={styles.dot}>•</span>
                        <span className={styles.mono}>{s.id.slice(0, 6)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.itemActions} onClick={(e) => e.stopPropagation()}>
                    <button className={styles.iconBtn} type="button" title={s.enabled ? "Disable" : "Enable"} onClick={() => toggleEnabled(s.id)}>
                      <i className={`bi ${s.enabled ? "bi-eye" : "bi-eye-slash"}`} />
                    </button>
                    <button className={styles.iconBtn} type="button" title="Duplicate" onClick={() => duplicateSection(s.id)}>
                      <i className="bi bi-files" />
                    </button>
                    <button className={`${styles.iconBtn} ${styles.danger}`} type="button" title="Delete" onClick={() => removeSection(s.id)}>
                      <i className="bi bi-trash" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          {!active ? (
            <div className={styles.blank}>
              <div className={styles.blankCard}>
                <i className="bi bi-ui-checks-grid" />
                <div className={styles.blankTitle}>Select a section</div>
                <div className={styles.blankText}>Choose a section from the left to edit its data & style.</div>
              </div>
            </div>
          ) : (
            <div className={styles.mainGrid}>
              {/* Inspector */}
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <div className={styles.panelTitle}>Inspector</div>
                    <div className={styles.panelSub}>
                      <span className={styles.mono}>id:</span> <span className={styles.mono}>{active.id}</span>
                    </div>
                  </div>

                  <div className={styles.panelHeaderActions}>
                    <button className={styles.ghostBtn} type="button" onClick={() => toggleEnabled(active.id)}>
                      <i className={`bi ${active.enabled ? "bi-eye" : "bi-eye-slash"}`} /> {active.enabled ? "Enabled" : "Disabled"}
                    </button>
                  </div>
                </div>

                <div className={styles.form}>
                  <label className={styles.label}>Section type</label>
                  <div className={styles.selectWrap}>
                    <i className={`bi ${activeTypeMeta?.icon ?? "bi-square"}`} />
                    <select className={styles.select} value={active.type} onChange={(e) => setType(e.target.value)}>
                      {SECTION_TYPES.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.label} ({t.key})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.twoCols}>
                    <div>
                      <label className={styles.label}>Data (JSON)</label>
                      <textarea className={styles.textarea} value={dataText} onChange={(e) => setDataText(e.target.value)} spellCheck={false} />
                    </div>

                    <div>
                      <label className={styles.label}>Style (JSON)</label>
                      <textarea className={styles.textarea} value={styleText} onChange={(e) => setStyleText(e.target.value)} spellCheck={false} />
                    </div>
                  </div>

                  {inspectorErr && (
                    <div className={styles.error}>
                      <i className="bi bi-exclamation-triangle" />
                      <span>{inspectorErr}</span>
                    </div>
                  )}

                  <div className={styles.formActions}>
                    <button className={styles.primaryBtn} type="button" onClick={applyInspector}>
                      <i className="bi bi-check2-circle" /> Apply changes
                    </button>
                    <button
                      className={styles.ghostBtn}
                      type="button"
                      onClick={() => {
                        setDataText(prettyJson(active.data));
                        setStyleText(prettyJson(active.style ?? {}));
                        setInspectorErr("");
                      }}>
                      <i className="bi bi-arrow-counterclockwise" /> Reset
                    </button>
                  </div>
                </div>
              </section>

              {/* Preview */}
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <div className={styles.panelTitle}>Preview (Quick)</div>
                    <div className={styles.panelSub}>A lightweight preview from JSON (for builder only)</div>
                  </div>
                </div>

                <div className={styles.preview}>
                  <div className={styles.previewCard}>
                    <div className={styles.previewType}>
                      <i className={`bi ${activeTypeMeta?.icon ?? "bi-square"}`} /> {activeTypeMeta?.label ?? active.type}
                    </div>
                    <div className={styles.previewBody}>
                      <pre className={styles.pre}>{prettyJson(active.data)}</pre>
                    </div>
                  </div>

                  <div className={styles.previewNote}>
                    <i className="bi bi-info-circle" />
                    <span>
                      Khi nối với public renderer, bạn sẽ render bằng <span className={styles.mono}>SECTION_MAP[type]</span> thay vì chỉ hiển thị JSON.
                    </span>
                  </div>
                </div>
              </section>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
