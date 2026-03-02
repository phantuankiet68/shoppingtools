"use client";

import styles from "@/styles/admin/builder/theme/theme-builder.module.css";
import { useTemplateEditorStore } from "@/store/builder/themes/useTemplateEditorStore";

function EditorActions(props: {
  onReset: () => void;
  onSave: () => void;
  onDelete?: () => void;
  disabledReset: boolean;
  disabledSave: boolean;
  disabledDelete?: boolean;
  saving: boolean;
}) {
  const { onReset, onSave, onDelete, disabledReset, disabledSave, disabledDelete, saving } = props;

  return (
    <div className={styles.actions}>
      <button className={styles.ghostBtn} type="button" onClick={onReset} disabled={disabledReset}>
        <i className="bi bi-arrow-counterclockwise" /> Reset
      </button>

      {onDelete && (
        <button className={styles.ghostBtn} type="button" onClick={onDelete} disabled={!!disabledDelete}>
          <i className="bi bi-trash" /> Delete
        </button>
      )}

      <button className={styles.primaryBtn} type="button" onClick={onSave} disabled={disabledSave}>
        <i className={`bi ${saving ? "bi-arrow-repeat" : "bi-save2"}`} /> {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

export default function TemplateCodeEditorPage() {
  const s = useTemplateEditorStore();

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
                value={s.query}
                onChange={(e) => s.setQuery(e.target.value)}
              />
            </div>

            <div className={styles.filters}>
              <div className={styles.selectWrap}>
                <select
                  className={styles.select}
                  value={s.kindFilter}
                  onChange={(e) => s.setKindFilter(e.target.value)}
                >
                  <option value="">All templates</option>
                  {s.kinds.map((k) => (
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
                value={s.newKind}
                onChange={(e) => s.setNewKind(e.target.value)}
              />
              <input
                className={styles.input}
                placeholder="Group (vd: ui/footer)"
                value={s.newGroup}
                onChange={(e) => s.setNewGroup(e.target.value)}
                style={{ marginTop: 6 }}
              />
              <input
                className={styles.input}
                placeholder="Template name (vd: FooterNew)"
                value={s.newName}
                onChange={(e) => s.setNewName(e.target.value)}
                style={{ marginTop: 6 }}
              />

              <button
                className={styles.primaryBtn}
                type="button"
                onClick={s.createNewTemplate}
                disabled={s.disableCreate}
                style={{ marginTop: 8, width: "100%" }}
              >
                <i className="bi bi-plus-lg" /> New template
              </button>
            </div>
          </div>

          <div className={styles.list}>
            {s.listLoading && s.items.length === 0 ? <div className={styles.empty}>Loading...</div> : null}
            {!s.listLoading && s.grouped.length === 0 ? <div className={styles.empty}>No templates found.</div> : null}

            {s.grouped.map((sec) => {
              const isCol = s.collapsed[sec.kind] ?? true;
              const limit = s.visibleCount[sec.kind] ?? 10;
              const shown = sec.items.slice(0, limit);
              const remaining = sec.items.length - shown.length;

              return (
                <div key={sec.kind} className={styles.section}>
                  <button type="button" className={styles.sectionHeader} onClick={() => s.toggleKind(sec.kind)}>
                    <div className={styles.sectionLeft}>
                      <i className={`bi ${isCol ? "bi-caret-right-fill" : "bi-caret-down-fill"}`} />
                      <span className={styles.sectionTitle}>{sec.kind}</span>
                    </div>
                    <span className={styles.badge}>{sec.items.length}</span>
                  </button>

                  {!isCol && (
                    <div className={styles.sectionBody}>
                      {shown.map((it) => {
                        const active = it.path === s.activePath;
                        return (
                          <button
                            key={it.path}
                            type="button"
                            className={`${styles.item} ${active ? styles.itemActive : ""}`}
                            onClick={() => s.setActivePath(it.path)}
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
                            s.setVisibleCount((v) => ({
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
          {!s.tsxPath ? (
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
                      <div>
                        <i className="bi bi-filetype-tsx" /> TSX
                      </div>

                      <EditorActions
                        onReset={s.reset}
                        onSave={s.save}
                        onDelete={s.deleteCssOnly}
                        disabledReset={s.disableReset}
                        disabledSave={s.disableSave}
                        disabledDelete={!s.cssPath || s.disableDelete}
                        saving={s.saving}
                      />
                    </div>

                    <div className={styles.panelSub}>
                      <span className={styles.mono}>{s.tsxPath}</span>
                      {s.isDirty && <span className={styles.dirty}>• modified</span>}
                      {s.fileLoading && <span className={styles.dirty}>• loading</span>}
                    </div>
                  </div>
                </div>

                <textarea
                  className={styles.code}
                  value={s.tsx}
                  onChange={(e) => s.setTsx(e.target.value)}
                  spellCheck={false}
                />
              </section>

              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div className={styles.panelHeaderBan}>
                    <div className={styles.panelTitle}>
                      <div>
                        <i className="bi bi-filetype-css" /> CSS Module
                      </div>

                      <EditorActions
                        onReset={s.reset}
                        onSave={s.save}
                        disabledReset={s.disableReset}
                        disabledSave={s.disableSave}
                        saving={s.saving}
                      />
                    </div>

                    <div className={styles.panelSub}>
                      <span className={styles.mono}>{s.cssPath || "No css module import found"}</span>
                    </div>
                  </div>
                </div>

                <textarea
                  className={styles.code}
                  value={s.css}
                  onChange={(e) => s.setCss(e.target.value)}
                  spellCheck={false}
                  disabled={!s.cssPath}
                />
              </section>
            </div>
          )}

          {s.toast && (
            <div className={`${styles.toast} ${s.toast.type === "ok" ? styles.toastOk : styles.toastErr}`}>
              <i className={`bi ${s.toast.type === "ok" ? "bi-check2-circle" : "bi-exclamation-triangle"}`} />
              <span>{s.toast.msg}</span>
              <button className={styles.toastClose} type="button" onClick={() => s.setToast(null)} aria-label="Close">
                <i className="bi bi-x-lg" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
