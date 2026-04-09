"use client";

import styles from "@/styles/admin/theme/theme-builder.module.css";
import { useTemplateEditorStore } from "@/store/builder/themes/useTemplateEditorStore";
import { useMemo } from "react";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";

function EditorActions(props: {
  onReset: () => void;
  onSave: () => void;
  onDelete?: () => void;
  disabledReset: boolean;
  disabledSave: boolean;
  disabledDelete?: boolean;
  saving: boolean;
}) {
  return <div className={styles.actions}></div>;
}

export default function TemplateCodeEditorPage() {
  const s = useTemplateEditorStore();

  const {
    query,
    setQuery,
    kindFilter,
    setKindFilter,
    kinds,
    newKind,
    setNewKind,
    newGroup,
    setNewGroup,
    newName,
    setNewName,
    createNewTemplate,
    disableCreate,
    listLoading,
    items,
    grouped,
    collapsed,
    visibleCount,
    toggleKind,
    setVisibleCount,
    activePath,
    setActivePath,
    tsxPath,
    cssPath,
    disableDelete,
    deleteCssOnly,
    reset,
    save,
    disableReset,
    disableSave,
    saving,
    isDirty,
    fileLoading,
    tsx,
    setTsx,
    css,
    setCss,
    toast,
    setToast,
  } = s;

  const pageFunctionKeys = useMemo(
    () => ({
      F3: () => {
        if (!cssPath || disableDelete) return;
        deleteCssOnly();
      },
      F5: () => {
        if (disableCreate) return;
        createNewTemplate();
      },
      F10: () => {
        if (disableSave) return;
        save();
      },
    }),
    [cssPath, disableDelete, deleteCssOnly, disableCreate, createNewTemplate, disableSave, save],
  );

  usePageFunctionKeys(pageFunctionKeys);

  return (
    <div className={styles.shell}>
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sideTop}>
            <div className={styles.searchRow}>
              <i className="bi bi-search" />
              <input
                className={styles.search}
                placeholder="Search template..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className={styles.filters}>
              <div className={styles.selectWrap}>
                <select className={styles.select} value={kindFilter} onChange={(e) => setKindFilter(e.target.value)}>
                  <option value="">All templates</option>
                  {kinds.map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>

                <i className={`bi bi-chevron-down ${styles.selectIcon}`} />
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              <input
                className={styles.input}
                placeholder="Kind (vd: ShopTemplate)"
                value={newKind}
                onChange={(e) => setNewKind(e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="Group (vd: ui/footer)"
                value={newGroup}
                onChange={(e) => setNewGroup(e.target.value)}
                style={{ marginTop: 6 }}
              />
              <input
                className={styles.input}
                placeholder="Template name (vd: FooterNew)"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ marginTop: 6 }}
              />
            </div>
          </div>

          <div className={styles.list}>
            {listLoading && items.length === 0 ? <div className={styles.empty}>Loading...</div> : null}
            {!listLoading && grouped.length === 0 ? <div className={styles.empty}>No templates found.</div> : null}

            {grouped.map((sec) => {
              const isCol = collapsed[sec.kind] ?? true;
              const limit = visibleCount[sec.kind] ?? 10;
              const shown = sec.items.slice(0, limit);
              const remaining = sec.items.length - shown.length;

              return (
                <div key={sec.kind} className={styles.section}>
                  <button type="button" className={styles.sectionHeader} onClick={() => toggleKind(sec.kind)}>
                    <div className={styles.sectionLeft}>
                      <i className={`bi ${isCol ? "bi-caret-right-fill" : "bi-caret-down-fill"}`} />
                      <span className={styles.sectionTitle}>{sec.kind}</span>
                    </div>
                    <span className={styles.badge}>{sec.items.length}</span>
                  </button>

                  {!isCol && (
                    <div className={styles.sectionBody}>
                      {shown.map((it) => {
                        const active = it.path === activePath;
                        return (
                          <button
                            key={it.path}
                            type="button"
                            className={`${styles.item} ${active ? styles.itemActive : ""}`}
                            onClick={() => setActivePath(it.path)}
                            title={it.path}
                          >
                            <div className={styles.itemIcon}>
                              <i className="bi bi-braces" />
                            </div>

                            <div className={styles.itemBody}>
                              <div className={styles.itemName}>{it.name}</div>
                              <div className={styles.itemMeta}>
                                <span className={styles.mono}>{it.group || ""}</span>
                                <span className={styles.sep}>•</span>
                                <span className={styles.monoPath}>{it.path}</span>
                              </div>
                            </div>

                            {active && <span className={styles.activeMark} />}
                          </button>
                        );
                      })}

                      {remaining > 0 && (
                        <button
                          type="button"
                          className={styles.loadMore}
                          onClick={() =>
                            setVisibleCount((v) => ({
                              ...v,
                              [sec.kind]: (v[sec.kind] ?? 10) + 10,
                            }))
                          }
                        >
                          Xem thêm {Math.min(10, remaining)} / còn {remaining}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <main className={styles.main}>
          {!tsxPath ? (
            <div className={styles.blank}>
              <div className={styles.blankCard}>
                <i className="bi bi-code-slash" />
                <div className={styles.blankTitle}>Select a template</div>
                <div className={styles.blankSub}>Choose a component template from the left sidebar to edit.</div>
              </div>
            </div>
          ) : (
            <div className={styles.editorGrid}>
              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelHeaderBan}>
                    <div className={styles.panelTitle}>
                      <div className={styles.panelMono}>
                        <div>
                          <i className="bi bi-filetype-tsx" /> TSX
                        </div>
                        <span className={styles.mono}>{tsxPath}</span>
                      </div>{" "}
                      <EditorActions
                        onReset={reset}
                        onSave={save}
                        onDelete={deleteCssOnly}
                        disabledReset={disableReset}
                        disabledSave={disableSave}
                        disabledDelete={!cssPath || disableDelete}
                        saving={saving}
                      />
                    </div>

                    <div className={styles.panelSub}>
                      {isDirty && <span className={styles.dirty}>• modified</span>}
                      {fileLoading && <span className={styles.dirty}>• loading</span>}
                    </div>
                  </div>
                </div>

                <textarea
                  className={styles.code}
                  value={tsx}
                  onChange={(e) => setTsx(e.target.value)}
                  spellCheck={false}
                />
              </section>

              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelHeaderBan}>
                    <div className={styles.panelTitle}>
                      <div className={styles.panelMono}>
                        <div>
                          <i className="bi bi-filetype-css" /> CSS Module
                        </div>
                        <span className={styles.mono}>{cssPath || "No css module import found"}</span>
                      </div>

                      <EditorActions
                        onReset={reset}
                        onSave={save}
                        disabledReset={disableReset}
                        disabledSave={disableSave}
                        saving={saving}
                      />
                    </div>
                  </div>
                </div>

                <textarea
                  className={styles.code}
                  value={css}
                  onChange={(e) => setCss(e.target.value)}
                  spellCheck={false}
                  disabled={!cssPath}
                />
              </section>
            </div>
          )}

          {toast && (
            <div className={`${styles.toast} ${toast.type === "ok" ? styles.toastOk : styles.toastErr}`}>
              <i className={`bi ${toast.type === "ok" ? "bi-check2-circle" : "bi-exclamation-triangle"}`} />
              <span>{toast.msg}</span>
              <button className={styles.toastClose} type="button" onClick={() => setToast(null)} aria-label="Close">
                <i className="bi bi-x-lg" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
