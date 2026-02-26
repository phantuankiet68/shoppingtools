"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styles from "@/styles/admin/builder/theme/theme-builder.module.css";

type TemplateItem = {
  path: string;
  name: string;
  kind: string;
};

function basenameNoExt(p: string) {
  const file = p.split("/").at(-1) || p;
  return file.replace(/\.tsx$/i, "");
}

function kindOf(p: string) {
  return p.split("/")[0] || "unknown";
}

async function apiList(kind?: string, signal?: AbortSignal) {
  const qs = kind ? `?kind=${encodeURIComponent(kind)}` : "";
  const res = await fetch(`/api/admin/template-files/list${qs}`, { cache: "no-store", signal });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "List failed");
  return (json.files as string[]) || [];
}

async function apiRead(relPath: string, signal?: AbortSignal) {
  const res = await fetch("/api/admin/template-files/read", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path: relPath }),
    signal,
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Read failed");
  return String(json.content ?? "");
}

async function apiWrite(relPath: string, content: string) {
  const res = await fetch("/api/admin/template-files/write", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path: relPath, content }),
  });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "Write failed");
  return true;
}

function guessCssModulePath(tsxCode: string): string | null {
  const m = tsxCode.match(/from\s+["']([^"']+\.module\.css)["']/);
  if (!m) return null;

  const importPath = m[1];
  if (importPath.startsWith("@/")) return importPath.replace("@/", "");

  return null;
}

function EditorActions(props: { onReset: () => void; onSave: () => void; disabledReset: boolean; disabledSave: boolean; saving: boolean }) {
  const { onReset, onSave, disabledReset, disabledSave, saving } = props;

  return (
    <div className={styles.actions}>
      <button className={styles.ghostBtn} type="button" onClick={onReset} disabled={disabledReset}>
        <i className="bi bi-arrow-counterclockwise" /> Reset
      </button>

      <button className={styles.primaryBtn} type="button" onClick={onSave} disabled={disabledSave}>
        <i className={`bi ${saving ? "bi-arrow-repeat" : "bi-save2"}`} /> {saving ? "Saving..." : "Save"}
      </button>
    </div>
  );
}

export default function TemplateCodeEditorPage() {
  const [kindFilter, setKindFilter] = useState<string>("");
  const [query, setQuery] = useState("");

  const [items, setItems] = useState<TemplateItem[]>([]);
  const [activePath, setActivePath] = useState<string>("");

  const [tsxPath, setTsxPath] = useState<string>("");
  const [tsx, setTsx] = useState<string>("");
  const [cssPath, setCssPath] = useState<string>("");
  const [css, setCss] = useState<string>("");

  const [listLoading, setListLoading] = useState(false);
  const [fileLoading, setFileLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const originalRef = useRef<{ tsx: string; css: string; tsxPath: string; cssPath: string }>({
    tsx: "",
    css: "",
    tsxPath: "",
    cssPath: "",
  });

  const loadSeqRef = useRef(0);

  const isDirty = useMemo(() => tsx !== originalRef.current.tsx || css !== originalRef.current.css, [tsx, css]);

  const kinds = useMemo(() => {
    const set = new Set(items.map((x) => x.kind));
    return Array.from(set).sort();
  }, [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((x) => {
      if (kindFilter && x.kind !== kindFilter) return false;
      if (!q) return true;
      return x.name.toLowerCase().includes(q) || x.path.toLowerCase().includes(q);
    });
  }, [items, query, kindFilter]);

  useEffect(() => {
    const ac = new AbortController();

    (async () => {
      try {
        setListLoading(true);
        const files = await apiList(undefined, ac.signal);
        const list: TemplateItem[] = files.map((p) => ({
          path: p,
          kind: kindOf(p),
          name: basenameNoExt(p),
        }));

        setItems(list);

        setActivePath((prev) => prev || list[0]?.path || "");
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setToast({ type: "err", msg: e?.message || "Load list failed" });
      } finally {
        setListLoading(false);
      }
    })();

    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (!activePath) return;

    const seq = ++loadSeqRef.current;
    const ac = new AbortController();

    (async () => {
      try {
        setFileLoading(true);
        setToast(null);

        const code = await apiRead(activePath, ac.signal);
        if (ac.signal.aborted || seq !== loadSeqRef.current) return;

        const cssGuess = guessCssModulePath(code);
        let cssCode = "";

        if (cssGuess) {
          try {
            cssCode = await apiRead(cssGuess, ac.signal);
          } catch (err: any) {
            if (err?.name !== "AbortError") cssCode = "";
          }
        }

        if (ac.signal.aborted || seq !== loadSeqRef.current) return;

        setTsxPath(activePath);
        setTsx(code);
        setCssPath(cssGuess || "");
        setCss(cssCode);

        originalRef.current = {
          tsx: code,
          css: cssCode,
          tsxPath: activePath,
          cssPath: cssGuess || "",
        };
      } catch (e: any) {
        if (e?.name === "AbortError") return;
        setToast({ type: "err", msg: e?.message || "Load file failed" });
      } finally {
        if (!ac.signal.aborted && seq === loadSeqRef.current) setFileLoading(false);
      }
    })();

    return () => ac.abort();
  }, [activePath]);

  const save = useCallback(async () => {
    if (!tsxPath) return;
    try {
      setSaving(true);
      setToast(null);

      await apiWrite(tsxPath, tsx);
      if (cssPath) await apiWrite(cssPath, css);

      originalRef.current = { tsx, css, tsxPath, cssPath };
      setToast({ type: "ok", msg: "Saved successfully" });
    } catch (e: any) {
      setToast({ type: "err", msg: e?.message || "Save failed" });
    } finally {
      setSaving(false);
    }
  }, [tsxPath, tsx, cssPath, css]);

  const reset = useCallback(() => {
    setTsx(originalRef.current.tsx);
    setCss(originalRef.current.css);
    setToast(null);
  }, []);

  const disableReset = !isDirty || listLoading || fileLoading || saving;
  const disableSave = !isDirty || !tsxPath || listLoading || fileLoading || saving;

  return (
    <div className={styles.shell}>
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.sideTop}>
            <div className={styles.searchRow}>
              <i className="bi bi-search" />
              <input className={styles.search} placeholder="Search template..." value={query} onChange={(e) => setQuery(e.target.value)} />
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
          </div>

          <div className={styles.list}>
            {listLoading && items.length === 0 ? <div className={styles.empty}>Loading...</div> : null}
            {!listLoading && filtered.length === 0 ? <div className={styles.empty}>No templates found.</div> : null}

            {filtered.map((it) => {
              const active = it.path === activePath;
              return (
                <button key={it.path} type="button" className={`${styles.item} ${active ? styles.itemActive : ""}`} onClick={() => setActivePath(it.path)} title={it.path}>
                  <div className={styles.itemIcon}>
                    <i className={`bi ${it.kind === "header" ? "bi-layout-text-window-reverse" : "bi-braces"}`} />
                  </div>
                  <div className={styles.itemBody}>
                    <div className={styles.itemName}>{it.name}</div>
                    <div className={styles.itemMeta}>
                      <span className={styles.mono}>{it.kind}</span>
                      <span className={styles.sep}>•</span>
                      <span className={styles.mono}>{it.path}</span>
                    </div>
                  </div>
                  {active && <span className={styles.activeMark} />}
                </button>
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
                  <div>
                    <div className={styles.panelTitle}>
                      <div>
                        <i className="bi bi-filetype-tsx" /> TSX
                      </div>

                      <EditorActions onReset={reset} onSave={save} disabledReset={disableReset} disabledSave={disableSave} saving={saving} />
                    </div>

                    <div className={styles.panelSub}>
                      <span className={styles.mono}>{tsxPath}</span>
                      {isDirty && <span className={styles.dirty}>• modified</span>}
                      {fileLoading && <span className={styles.dirty}>• loading</span>}
                    </div>
                  </div>
                </div>

                <textarea className={styles.code} value={tsx} onChange={(e) => setTsx(e.target.value)} spellCheck={false} />
              </section>

              <section className={styles.panel}>
                <div className={styles.panelHeader}>
                  <div>
                    <div className={styles.panelTitle}>
                      <div>
                        <i className="bi bi-filetype-css" /> CSS Module
                      </div>

                      <EditorActions onReset={reset} onSave={save} disabledReset={disableReset} disabledSave={disableSave} saving={saving} />
                    </div>

                    <div className={styles.panelSub}>
                      <span className={styles.mono}>{cssPath || "No css module import found"}</span>
                    </div>
                  </div>
                </div>

                <textarea className={styles.code} value={css} onChange={(e) => setCss(e.target.value)} spellCheck={false} disabled={!cssPath} />
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
