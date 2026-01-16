"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/builder/theme/theme-builder.module.css";

type TemplateItem = {
  path: string; // "header/HeaderPro.tsx"
  name: string; // "HeaderPro"
  kind: string; // "header"
};

function basenameNoExt(p: string) {
  const file = p.split("/").at(-1) || p;
  return file.replace(/\.tsx$/i, "");
}

function kindOf(p: string) {
  return p.split("/")[0] || "unknown";
}

async function apiList(kind?: string) {
  const qs = kind ? `?kind=${encodeURIComponent(kind)}` : "";
  const res = await fetch(`/api/admin/template-files/list${qs}`, { cache: "no-store" });
  const json = await res.json();
  if (!json.ok) throw new Error(json.error || "List failed");
  return (json.files as string[]) || [];
}

async function apiRead(relPath: string) {
  const res = await fetch("/api/admin/template-files/read", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ path: relPath }),
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

function guessCssModulePath(tsxPath: string, tsxCode: string): string | null {
  const m = tsxCode.match(/from\s+["']([^"']+\.module\.css)["']/);
  if (!m) return null;

  // convert "@/styles/..." -> "styles/..."
  const importPath = m[1];
  if (importPath.startsWith("@/")) return importPath.replace("@/", "");
  return null; // nếu bạn import relative thì tuỳ bạn mở rộng sau
}

export default function TemplateCodeEditorPage() {
  const [kindFilter, setKindFilter] = useState<string>(""); // "" = all
  const [query, setQuery] = useState("");
  const [items, setItems] = useState<TemplateItem[]>([]);
  const [activePath, setActivePath] = useState<string>("");

  const [tsxPath, setTsxPath] = useState<string>("");
  const [tsx, setTsx] = useState<string>("");
  const [cssPath, setCssPath] = useState<string>("");
  const [css, setCss] = useState<string>("");

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "ok" | "err"; msg: string } | null>(null);

  const originalRef = useRef<{ tsx: string; css: string; tsxPath: string; cssPath: string }>({
    tsx: "",
    css: "",
    tsxPath: "",
    cssPath: "",
  });

  const isDirty = useMemo(() => {
    return tsx !== originalRef.current.tsx || css !== originalRef.current.css;
  }, [tsx, css]);

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
    (async () => {
      try {
        setLoading(true);
        const files = await apiList();
        const list = files.map((p) => ({
          path: p,
          kind: kindOf(p),
          name: basenameNoExt(p),
        }));
        setItems(list);
        if (!activePath && list[0]) setActivePath(list[0].path);
      } catch (e: any) {
        setToast({ type: "err", msg: e?.message || "Load list failed" });
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // load active file
  useEffect(() => {
    if (!activePath) return;
    (async () => {
      try {
        setLoading(true);
        setToast(null);

        const code = await apiRead(activePath);

        const cssGuess = guessCssModulePath(activePath, code);
        let cssCode = "";
        if (cssGuess) {
          try {
            cssCode = await apiRead(cssGuess);
          } catch {
            cssCode = "";
          }
        }

        setTsxPath(activePath);
        setTsx(code);
        setCssPath(cssGuess || "");
        setCss(cssCode);

        originalRef.current = { tsx: code, css: cssCode, tsxPath: activePath, cssPath: cssGuess || "" };
      } catch (e: any) {
        setToast({ type: "err", msg: e?.message || "Load file failed" });
      } finally {
        setLoading(false);
      }
    })();
  }, [activePath]);

  async function save() {
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
  }

  function reset() {
    setTsx(originalRef.current.tsx);
    setCss(originalRef.current.css);
    setToast(null);
  }

  return (
    <div className={styles.shell}>
      <div className={styles.body}>
        {/* Sidebar */}
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
            {loading && items.length === 0 ? <div className={styles.empty}>Loading...</div> : null}
            {!loading && filtered.length === 0 ? <div className={styles.empty}>No templates found.</div> : null}

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

        {/* Editor */}
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
                      <div className={styles.actions}>
                        <button className={styles.ghostBtn} type="button" onClick={reset} disabled={!isDirty || loading || saving}>
                          <i className="bi bi-arrow-counterclockwise" /> Reset
                        </button>

                        <button className={styles.primaryBtn} type="button" onClick={save} disabled={!isDirty || !tsxPath || loading || saving}>
                          <i className={`bi ${saving ? "bi-arrow-repeat" : "bi-save2"}`} /> {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                    <div className={styles.panelSub}>
                      <span className={styles.mono}>{tsxPath}</span>
                      {isDirty && <span className={styles.dirty}>• modified</span>}
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
                      <div className={styles.actions}>
                        <button className={styles.ghostBtn} type="button" onClick={reset} disabled={!isDirty || loading || saving}>
                          <i className="bi bi-arrow-counterclockwise" /> Reset
                        </button>

                        <button className={styles.primaryBtn} type="button" onClick={save} disabled={!isDirty || !tsxPath || loading || saving}>
                          <i className={`bi ${saving ? "bi-arrow-repeat" : "bi-save2"}`} /> {saving ? "Saving..." : "Save"}
                        </button>
                      </div>
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
