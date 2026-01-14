"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/builder/blocks/blocks-builder.module.css";

type BlockRow = {
  id: string;
  type: string; // "heading" | "paragraph" | "image" | ...
  enabled: boolean;
  sort: number;
  data: any; // props/config
  style?: any | null;
};

const BLOCK_TYPES = [
  // Text
  { key: "heading", label: "Heading", icon: "bi-type-h1", group: "Text" },
  { key: "paragraph", label: "Paragraph", icon: "bi-text-paragraph", group: "Text" },
  { key: "richText", label: "Rich Text", icon: "bi-body-text", group: "Text" },

  // Media
  { key: "image", label: "Image", icon: "bi-image", group: "Media" },
  { key: "gallery", label: "Gallery", icon: "bi-images", group: "Media" },
  { key: "video", label: "Video", icon: "bi-play-btn", group: "Media" },

  // Interactive
  { key: "button", label: "Button", icon: "bi-hand-index-thumb", group: "Interactive" },
  { key: "form", label: "Form", icon: "bi-ui-checks", group: "Interactive" },
  { key: "accordion", label: "Accordion", icon: "bi-list-nested", group: "Interactive" },

  // Layout
  { key: "divider", label: "Divider", icon: "bi-dash-lg", group: "Layout" },
  { key: "spacer", label: "Spacer", icon: "bi-arrows-expand", group: "Layout" },
  { key: "columns", label: "Columns", icon: "bi-layout-three-columns", group: "Layout" },
];

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function safeJsonParse(s: string) {
  try {
    return { ok: true as const, value: JSON.parse(s) };
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

function defaultDataFor(type: string) {
  switch (type) {
    case "heading":
      return { text: "New heading", level: 1, align: "left" };
    case "paragraph":
      return { text: "Write something here..." };
    case "image":
      return { src: "/placeholder.png", alt: "Image", ratio: "16/9" };
    case "button":
      return { label: "Click me", href: "/", variant: "primary" };
    case "columns":
      return {
        cols: [{ blocks: [{ type: "paragraph", data: { text: "Column 1" }, style: {} }] }, { blocks: [{ type: "paragraph", data: { text: "Column 2" }, style: {} }] }],
        gap: 16,
      };
    case "divider":
      return { variant: "line" };
    case "spacer":
      return { height: 24 };
    default:
      return {};
  }
}

export default function BlocksBuilderPage() {
  // Demo seed (bạn sẽ thay bằng fetch từ DB)
  const [blocks, setBlocks] = useState<BlockRow[]>(() => [
    {
      id: uid(),
      type: "heading",
      enabled: true,
      sort: 10,
      data: { text: "Blocks Builder", level: 1, align: "left" },
      style: { marginBottom: 12 },
    },
    {
      id: uid(),
      type: "paragraph",
      enabled: true,
      sort: 20,
      data: { text: "Blocks là đơn vị nhỏ hơn section. Bạn có thể dùng blocks để build layout chi tiết." },
      style: { opacity: 0.9 },
    },
    {
      id: uid(),
      type: "button",
      enabled: true,
      sort: 30,
      data: { label: "Preview", href: "/admin/builder/blocks", variant: "primary" },
      style: { marginTop: 8 },
    },
  ]);

  const ordered = useMemo(() => [...blocks].sort((a, b) => a.sort - b.sort), [blocks]);

  const [activeId, setActiveId] = useState<string>(() => ordered[0]?.id || "");
  const active = ordered.find((b) => b.id === activeId) || null;

  const [dataText, setDataText] = useState<string>(() => prettyJson(active?.data));
  const [styleText, setStyleText] = useState<string>(() => prettyJson(active?.style ?? {}));
  const [err, setErr] = useState<string>("");

  function selectBlock(id: string) {
    setActiveId(id);
    const b = ordered.find((x) => x.id === id);
    setDataText(prettyJson(b?.data));
    setStyleText(prettyJson(b?.style ?? {}));
    setErr("");
  }

  function addBlock(type: string) {
    const nextSort = (ordered.at(-1)?.sort ?? 0) + 10;
    const row: BlockRow = {
      id: uid(),
      type,
      enabled: true,
      sort: nextSort,
      data: defaultDataFor(type),
      style: {},
    };
    setBlocks((prev) => [...prev, row]);
    setTimeout(() => selectBlock(row.id), 0);
  }

  function toggleEnabled(id: string) {
    setBlocks((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));
  }

  function duplicateBlock(id: string) {
    const b = ordered.find((x) => x.id === id);
    if (!b) return;
    const nextSort = (ordered.at(-1)?.sort ?? 0) + 10;
    const copy: BlockRow = {
      ...b,
      id: uid(),
      sort: nextSort,
      data: JSON.parse(JSON.stringify(b.data ?? {})),
      style: JSON.parse(JSON.stringify(b.style ?? {})),
    };
    setBlocks((prev) => [...prev, copy]);
    setTimeout(() => selectBlock(copy.id), 0);
  }

  function removeBlock(id: string) {
    setBlocks((prev) => prev.filter((x) => x.id !== id));
    if (activeId === id) {
      const remain = ordered.filter((x) => x.id !== id);
      if (remain[0]) setTimeout(() => selectBlock(remain[0].id), 0);
      else {
        setActiveId("");
        setDataText("{}");
        setStyleText("{}");
      }
    }
  }

  // DnD reorder
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

    const next = list.map((x, i) => ({ ...x, sort: (i + 1) * 10 }));
    setBlocks(next);
    setDragId(null);
  }

  function applyInspector() {
    if (!active) return;

    const dataRes = safeJsonParse(dataText.trim() || "{}");
    if (!dataRes.ok) return setErr(`Data JSON error: ${dataRes.error}`);

    const styleRes = safeJsonParse(styleText.trim() || "{}");
    if (!styleRes.ok) return setErr(`Style JSON error: ${styleRes.error}`);

    setBlocks((prev) => prev.map((x) => (x.id === active.id ? { ...x, data: dataRes.value, style: styleRes.value } : x)));
    setErr("");
  }

  function setType(type: string) {
    if (!active) return;
    setBlocks((prev) => prev.map((x) => (x.id === active.id ? { ...x, type } : x)));
  }

  const groups = useMemo(() => {
    const g: Record<string, typeof BLOCK_TYPES> = {};
    for (const t of BLOCK_TYPES) {
      (g[t.group] ||= []).push(t);
    }
    return g;
  }, []);

  const activeMeta = BLOCK_TYPES.find((t) => t.key === active?.type);

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Blocks Builder</div>
            <div className={styles.brandSub}>Drag · Duplicate · Edit JSON · Apply</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.ghostBtn} type="button" onClick={() => addBlock("paragraph")}>
            <i className="bi bi-plus-lg" /> Add Paragraph
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
            <div className={styles.sidebarTitle}>Blocks</div>
            <div className={styles.sidebarHint}>Blocks nhỏ hơn Sections — dùng để build chi tiết.</div>
          </div>

          <div className={styles.addWrap}>
            {Object.entries(groups).map(([group, items]) => (
              <div key={group} className={styles.group}>
                <div className={styles.groupTitle}>{group}</div>
                <div className={styles.addGrid}>
                  {items.map((t) => (
                    <button key={t.key} className={styles.addTile} type="button" onClick={() => addBlock(t.key)}>
                      <i className={`bi ${t.icon}`} />
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.list}>
            {ordered.length === 0 && <div className={styles.empty}>No blocks yet. Add one above.</div>}

            {ordered.map((b) => {
              const meta = BLOCK_TYPES.find((t) => t.key === b.type);
              const isActive = b.id === activeId;

              return (
                <div
                  key={b.id}
                  className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                  draggable
                  onDragStart={() => onDragStart(b.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(b.id)}
                  onClick={() => selectBlock(b.id)}
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
                        {meta?.label ?? b.type}
                        {!b.enabled && <span className={styles.badgeOff}>OFF</span>}
                      </div>
                      <div className={styles.itemMeta}>
                        <span className={styles.mono}>sort {b.sort}</span>
                        <span className={styles.dot}>•</span>
                        <span className={styles.mono}>{b.id.slice(0, 6)}</span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.itemActions} onClick={(e) => e.stopPropagation()}>
                    <button className={styles.iconBtn} type="button" title={b.enabled ? "Disable" : "Enable"} onClick={() => toggleEnabled(b.id)}>
                      <i className={`bi ${b.enabled ? "bi-eye" : "bi-eye-slash"}`} />
                    </button>
                    <button className={styles.iconBtn} type="button" title="Duplicate" onClick={() => duplicateBlock(b.id)}>
                      <i className="bi bi-files" />
                    </button>
                    <button className={`${styles.iconBtn} ${styles.danger}`} type="button" title="Delete" onClick={() => removeBlock(b.id)}>
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
                <i className="bi bi-boxes" />
                <div className={styles.blankTitle}>Select a block</div>
                <div className={styles.blankText}>Chọn block bên trái để chỉnh props/style.</div>
              </div>
            </div>
          ) : (
            <div className={styles.mainGrid}>
              {/* Inspector */}
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <div className={styles.panelTitle}>Block Inspector</div>
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
                  <label className={styles.label}>Block type</label>
                  <div className={styles.selectWrap}>
                    <i className={`bi ${activeMeta?.icon ?? "bi-square"}`} />
                    <select className={styles.select} value={active.type} onChange={(e) => setType(e.target.value)}>
                      {BLOCK_TYPES.map((t) => (
                        <option key={t.key} value={t.key}>
                          {t.group} · {t.label} ({t.key})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.twoCols}>
                    <div>
                      <label className={styles.label}>Props / Data (JSON)</label>
                      <textarea className={styles.textarea} value={dataText} onChange={(e) => setDataText(e.target.value)} spellCheck={false} />
                    </div>

                    <div>
                      <label className={styles.label}>Style (JSON)</label>
                      <textarea className={styles.textarea} value={styleText} onChange={(e) => setStyleText(e.target.value)} spellCheck={false} />
                    </div>
                  </div>

                  {err && (
                    <div className={styles.error}>
                      <i className="bi bi-exclamation-triangle" />
                      <span>{err}</span>
                    </div>
                  )}

                  <div className={styles.formActions}>
                    <button className={styles.primaryBtn} type="button" onClick={applyInspector}>
                      <i className="bi bi-check2-circle" /> Apply
                    </button>
                    <button
                      className={styles.ghostBtn}
                      type="button"
                      onClick={() => {
                        setDataText(prettyJson(active.data));
                        setStyleText(prettyJson(active.style ?? {}));
                        setErr("");
                      }}>
                      <i className="bi bi-arrow-counterclockwise" /> Reset
                    </button>
                  </div>
                </div>
              </section>

              {/* Quick Preview */}
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <div className={styles.panelTitle}>Quick Preview</div>
                    <div className={styles.panelSub}>Preview nhanh từ JSON (builder UI)</div>
                  </div>
                </div>

                <div className={styles.preview}>
                  <div className={styles.previewCard}>
                    <div className={styles.previewType}>
                      <i className={`bi ${activeMeta?.icon ?? "bi-square"}`} /> {activeMeta?.label ?? active.type}
                    </div>
                    <div className={styles.previewBody}>
                      <pre className={styles.pre}>{prettyJson(active.data)}</pre>
                    </div>
                  </div>

                  <div className={styles.previewNote}>
                    <i className="bi bi-lightbulb" />
                    <span>
                      Public renderer sẽ map <span className={styles.mono}>block.type</span> → component để render thật.
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
