"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/product/categories/categories.module.css";

type ApiCategory = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  isActive: boolean;
  sort: number;

  icon: string | null;
  coverImage: string | null;
  seoTitle: string | null;
  seoDesc: string | null;

  count?: number;
  createdAt?: string;
  updatedAt?: string;
};

type CategoryRow = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  enabled: boolean;
  sort: number;

  icon?: string;
  coverImage?: string;
  seoTitle?: string;
  seoDesc?: string;

  count?: number;
};

function slugify(input: string) {
  return String(input ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function bySort(a: CategoryRow, b: CategoryRow) {
  if (a.sort !== b.sort) return a.sort - b.sort;
  return a.name.localeCompare(b.name);
}

function buildTree(rows: CategoryRow[]) {
  const map = new Map<string, CategoryRow & { children: CategoryRow[] }>();
  rows.forEach((r) => map.set(r.id, { ...r, children: [] }));
  const roots: (CategoryRow & { children: CategoryRow[] })[] = [];

  for (const r of map.values()) {
    if (r.parentId && map.has(r.parentId)) map.get(r.parentId)!.children.push(r);
    else roots.push(r);
  }

  const sortRec = (n: any) => {
    n.children.sort(bySort);
    n.children.forEach(sortRec);
  };
  roots.sort(bySort);
  roots.forEach(sortRec);

  return roots;
}

async function jfetch<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (typeof json?.error === "string" && json.error) || "Request failed";
    throw new Error(msg);
  }
  return json as T;
}

export default function CategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");

  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string>("");

  // prevent PATCH spam when typing
  const patchTimer = useRef<any>(null);

  const active = useMemo(() => rows.find((x) => x.id === activeId) || null, [rows, activeId]);

  const tree = useMemo(() => buildTree(rows), [rows]);

  const filteredIds = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return new Set(rows.map((r) => r.id));

    const match = new Set<string>();
    for (const r of rows) {
      if ((r.name + " " + r.slug).toLowerCase().includes(qq)) match.add(r.id);
    }

    // include ancestors
    const byId = new Map(rows.map((r) => [r.id, r]));
    let changed = true;
    while (changed) {
      changed = false;
      for (const id of Array.from(match)) {
        const p = byId.get(id)?.parentId;
        if (p && !match.has(p)) {
          match.add(p);
          changed = true;
        }
      }
    }
    return match;
  }, [rows, q]);

  const flatSiblings = useMemo(() => {
    if (!active) return [];
    return rows
      .filter((x) => x.parentId === active.parentId)
      .slice()
      .sort(bySort);
  }, [rows, active]);

  async function loadTree() {
    setLoading(true);
    setErr("");
    try {
      const data = await jfetch<{ items: ApiCategory[] }>("/api/admin/product-categories?tree=1&sort=sortasc&pageSize=5000");

      const mapped: CategoryRow[] = (data.items || []).map((c) => ({
        id: c.id,
        parentId: c.parentId,
        name: c.name,
        slug: c.slug,
        enabled: !!c.isActive,
        sort: c.sort ?? 0,
        icon: c.icon ?? undefined,
        coverImage: c.coverImage ?? undefined,
        seoTitle: c.seoTitle ?? undefined,
        seoDesc: c.seoDesc ?? undefined,
        count: (c as any).count ?? (c as any)._count?.products ?? 0,
      }));

      mapped.sort(bySort);
      setRows(mapped);

      // choose active
      setActiveId((prev) => {
        if (prev && mapped.some((x) => x.id === prev)) return prev;
        return mapped[0]?.id || "";
      });
    } catch (e: any) {
      setErr(e?.message || "Failed to load categories");
      setRows([]);
      setActiveId("");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTree();
  }, []);

  function select(id: string) {
    setActiveId(id);
  }

  async function createCategory(parentId: string | null) {
    const name = prompt("Category name?");
    if (!name?.trim()) return;

    setBusy(true);
    try {
      const payload = {
        name: name.trim(),
        slug: slugify(name),
        parentId,
        isActive: true,
      };

      const res = await jfetch<{ item: ApiCategory }>("/api/admin/product-categories", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      const created = res.item;

      // update local state fast (no need reload)
      const row: CategoryRow = {
        id: created.id,
        parentId: created.parentId,
        name: created.name,
        slug: created.slug,
        enabled: created.isActive,
        sort: created.sort ?? 0,
        icon: created.icon ?? undefined,
        coverImage: created.coverImage ?? undefined,
        seoTitle: created.seoTitle ?? undefined,
        seoDesc: created.seoDesc ?? undefined,
        count: (created as any).count ?? 0,
      };

      setRows((prev) => [...prev, row]);
      setActiveId(row.id);
    } catch (e: any) {
      alert(e?.message || "Create failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeCategory(id: string) {
    const current = rows.find((x) => x.id === id);
    if (!current) return;

    const hasChildren = rows.some((x) => x.parentId === id);
    const ok = confirm(hasChildren ? `Delete "${current.name}"? (children will become root)` : `Delete "${current.name}"?`);
    if (!ok) return;

    setBusy(true);
    try {
      await jfetch(`/api/admin/product-categories/${id}`, {
        method: "DELETE",
      });

      // remove locally
      setRows((prev) => prev.filter((x) => x.id !== id));
      setActiveId((prev) => {
        if (prev !== id) return prev;
        const remain = rows.filter((x) => x.id !== id);
        return remain[0]?.id || "";
      });
    } catch (e: any) {
      alert(e?.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  async function toggleEnabled(id: string) {
    const cur = rows.find((x) => x.id === id);
    if (!cur) return;

    const nextEnabled = !cur.enabled;

    // optimistic
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: nextEnabled } : x)));

    try {
      await jfetch(`/api/admin/product-categories/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: nextEnabled }),
      });
    } catch (e: any) {
      // rollback
      setRows((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: cur.enabled } : x)));
      alert(e?.message || "Update failed");
    }
  }

  function patchActiveLocal(patch: Partial<CategoryRow>) {
    if (!active) return;
    setRows((prev) => prev.map((x) => (x.id === active.id ? { ...x, ...patch } : x)));
  }

  function patchActiveApiDebounced(patch: Record<string, any>) {
    if (!active) return;

    if (patchTimer.current) clearTimeout(patchTimer.current);
    patchTimer.current = setTimeout(async () => {
      try {
        await jfetch(`/api/admin/product-categories/${active.id}`, {
          method: "PATCH",
          body: JSON.stringify(patch),
        });
      } catch (e: any) {
        alert(e?.message || "Save failed");
        // safest: reload tree to sync
        loadTree();
      }
    }, 350);
  }

  function changeName(name: string) {
    if (!active) return;
    patchActiveLocal({ name });
    patchActiveApiDebounced({ name: name.trim() });
  }

  function changeSlug(slug: string) {
    if (!active) return;
    const s = slugify(slug);
    patchActiveLocal({ slug: s });
    patchActiveApiDebounced({ slug: s });
  }

  function moveParent(newParentId: string | null) {
    if (!active) return;
    if (newParentId === active.id) return;

    patchActiveLocal({ parentId: newParentId });
    patchActiveApiDebounced({ parentId: newParentId });
  }

  function autoSlugFromName() {
    if (!active) return;
    const s = slugify(active.name);
    patchActiveLocal({ slug: s });
    patchActiveApiDebounced({ slug: s });
  }

  // drag reorder
  const [dragId, setDragId] = useState<string | null>(null);
  function onDragStart(id: string) {
    setDragId(id);
  }

  async function onDrop(targetId: string) {
    if (!active) return;
    if (!dragId || dragId === targetId) return;

    const parentId = active.parentId;

    const sibs = rows
      .filter((x) => x.parentId === parentId)
      .slice()
      .sort(bySort);

    const from = sibs.findIndex((x) => x.id === dragId);
    const to = sibs.findIndex((x) => x.id === targetId);
    if (from < 0 || to < 0) return;

    const next = [...sibs];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    const sortMap = new Map(next.map((x, i) => [x.id, (i + 1) * 10]));

    // optimistic local
    setRows((prev) => prev.map((x) => (sortMap.has(x.id) ? { ...x, sort: sortMap.get(x.id)! } : x)));
    setDragId(null);

    // persist: PATCH each sibling (MVP)
    try {
      setBusy(true);
      await Promise.all(
        Array.from(sortMap.entries()).map(([id, sort]) =>
          jfetch(`/api/admin/product-categories/${id}`, {
            method: "PATCH",
            body: JSON.stringify({ sort }),
          })
        )
      );
    } catch (e: any) {
      alert(e?.message || "Reorder failed");
      loadTree();
    } finally {
      setBusy(false);
    }
  }

  function TreeNode({ node, depth }: { node: any; depth: number }) {
    const show = filteredIds.has(node.id);
    if (!show) return null;

    const isActive = node.id === activeId;

    return (
      <div className={styles.treeNode}>
        <button type="button" className={`${styles.treeBtn} ${isActive ? styles.treeActive : ""}`} onClick={() => select(node.id)} style={{ paddingLeft: 10 + depth * 14 }}>
          <i className={`bi ${node.icon || "bi-folder2"}`} />
          <span className={styles.treeName}>{node.name}</span>

          {typeof node.count === "number" && <span className={styles.treeCount}>{node.count}</span>}

          {!node.enabled && <span className={styles.badgeOff}>OFF</span>}
          <span className={styles.treeSlug}>/{node.slug}</span>
        </button>

        {node.children?.length > 0 && (
          <div className={styles.treeChildren}>
            {node.children.map((ch: any) => (
              <TreeNode key={ch.id} node={ch} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      {/* Topbar */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <span className={styles.brandDot} />
          <div className={styles.brandText}>
            <div className={styles.brandTitle}>Categories</div>
            <div className={styles.brandSub}>Tree · Sort · SEO · Enable/Disable</div>
          </div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.ghostBtn} type="button" onClick={() => loadTree()} disabled={busy || loading}>
            <i className="bi bi-arrow-repeat" /> Refresh
          </button>
          <button className={styles.primaryBtn} type="button" onClick={() => createCategory(active?.parentId ?? null)} disabled={busy}>
            <i className="bi bi-plus-lg" /> Add sibling
          </button>
        </div>
      </header>

      {err && (
        <div className={styles.pageError}>
          <i className="bi bi-exclamation-triangle" />
          <span>{err}</span>
        </div>
      )}

      <div className={styles.body}>
        {/* Sidebar tree */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Category tree</div>
          </div>

          <div className={styles.searchWrap}>
            <i className="bi bi-search" />
            <input className={styles.search} placeholder={loading ? "Loading..." : "Search name / slug..."} value={q} onChange={(e) => setQ(e.target.value)} disabled={loading} />
          </div>

          <div className={styles.tree}>
            {loading ? (
              <div className={styles.loadingBox}>
                <i className="bi bi-arrow-repeat" />
                <span>Loading categories...</span>
              </div>
            ) : tree.length === 0 ? (
              <div className={styles.loadingBox}>
                <i className="bi bi-inbox" />
                <span>No categories.</span>
              </div>
            ) : (
              tree.map((n) => <TreeNode key={n.id} node={n} depth={0} />)
            )}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.tip}>
              <i className="bi bi-lightbulb" />
              <span>Tip: Drag sort áp dụng trong “Order within parent”.</span>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className={styles.main}>
          <div className={styles.content}>
            {/* List panel */}
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Order within parent</div>
                  <div className={styles.panelSub}>Drag để sắp xếp (chỉ trong cùng parent)</div>
                </div>

                <div className={styles.panelHeaderActions}>
                  <button className={styles.ghostBtn} type="button" onClick={() => createCategory(active?.id ?? null)} disabled={!active || busy}>
                    <i className="bi bi-node-plus" /> Add child
                  </button>
                </div>
              </div>

              <div className={styles.list}>
                {!active ? (
                  <div className={styles.empty}>Select a category</div>
                ) : flatSiblings.length === 0 ? (
                  <div className={styles.empty}>No categories here</div>
                ) : (
                  flatSiblings.map((c) => {
                    const isActive = c.id === activeId;
                    return (
                      <div
                        key={c.id}
                        className={`${styles.item} ${isActive ? styles.itemActive : ""}`}
                        draggable
                        onDragStart={() => onDragStart(c.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => onDrop(c.id)}
                        onClick={() => select(c.id)}
                        role="button"
                        tabIndex={0}>
                        <div className={styles.itemLeft}>
                          <span className={styles.dragHandle} title="Drag">
                            <i className="bi bi-grip-vertical" />
                          </span>

                          <span className={styles.itemIcon}>
                            <i className={`bi ${c.icon || "bi-tag"}`} />
                          </span>

                          <div className={styles.itemText}>
                            <div className={styles.itemTitle}>
                              {c.name}
                              {!c.enabled && <span className={styles.badgeOff}>OFF</span>}
                            </div>

                            <div className={styles.itemMeta}>
                              <span className={styles.mono}>sort {c.sort}</span>
                              <span className={styles.dot}>•</span>
                              <span className={styles.mono}>/{c.slug}</span>
                              {typeof c.count === "number" ? (
                                <>
                                  <span className={styles.dot}>•</span>
                                  <span className={styles.mono}>{c.count} products</span>
                                </>
                              ) : null}
                            </div>
                          </div>
                        </div>

                        <div className={styles.itemActions} onClick={(e) => e.stopPropagation()}>
                          <button className={styles.iconBtn} type="button" title="Toggle" onClick={() => toggleEnabled(c.id)} disabled={busy}>
                            <i className={`bi ${c.enabled ? "bi-eye" : "bi-eye-slash"}`} />
                          </button>
                          <button className={styles.iconBtn} type="button" title="Delete" onClick={() => removeCategory(c.id)} disabled={busy}>
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* Inspector */}
            <aside className={styles.inspector}>
              <div className={styles.panel}>
                {!active ? (
                  <div className={styles.panelBody}>
                    <div className={styles.emptyInspector}>
                      <i className="bi bi-info-circle" />
                      <div>
                        <div className={styles.emptyTitle}>Select a category</div>
                        <div className={styles.emptyText}>Click a category to edit.</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.panelBody}>
                    <div className={styles.headerRow}>
                      <div>
                        <div className={styles.headTitle}>{active.name}</div>
                        <div className={styles.headMeta}>
                          <span className={styles.badge}>
                            <i className="bi bi-link-45deg" /> /{active.slug}
                          </span>
                          <span className={styles.badge}>
                            <i className="bi bi-toggle2-on" /> {active.enabled ? "enabled" : "disabled"}
                          </span>
                        </div>
                      </div>

                      <button className={styles.iconBtn} type="button" title="Toggle enabled" onClick={() => toggleEnabled(active.id)} disabled={busy}>
                        <i className={`bi ${active.enabled ? "bi-toggle2-on" : "bi-toggle2-off"}`} />
                      </button>
                    </div>

                    <div className={styles.form}>
                      <label className={styles.label}>Name</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-type" />
                        <input className={styles.input} value={active.name} onChange={(e) => changeName(e.target.value)} disabled={busy} />
                      </div>

                      <div className={styles.rowInline}>
                        <div className={styles.rowGrow}>
                          <label className={styles.label}>Slug</label>
                          <div className={styles.inputWrap}>
                            <i className="bi bi-hash" />
                            <input className={styles.input} value={active.slug} onChange={(e) => changeSlug(e.target.value)} disabled={busy} />
                          </div>
                        </div>

                        <button className={styles.ghostBtn} type="button" onClick={autoSlugFromName} disabled={busy}>
                          <i className="bi bi-magic" /> Auto
                        </button>
                      </div>

                      <label className={styles.label}>Parent</label>
                      <div className={styles.selectWrap}>
                        <i className="bi bi-diagram-3" />
                        <select className={styles.select} value={active.parentId ?? ""} onChange={(e) => moveParent(e.target.value ? e.target.value : null)} disabled={busy}>
                          <option value="">(no parent)</option>
                          {rows
                            .filter((x) => x.id !== active.id)
                            .slice()
                            .sort(bySort)
                            .map((x) => (
                              <option key={x.id} value={x.id}>
                                {x.name} (/ {x.slug})
                              </option>
                            ))}
                        </select>
                      </div>

                      <label className={styles.label}>Icon (Bootstrap)</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-bootstrap" />
                        <input
                          className={styles.input}
                          value={active.icon ?? ""}
                          onChange={(e) => {
                            const v = e.target.value.trim();
                            patchActiveLocal({ icon: v });
                            patchActiveApiDebounced({ icon: v || null });
                          }}
                          placeholder="e.g. bi-tag"
                          disabled={busy}
                        />
                      </div>

                      <label className={styles.label}>Cover image URL (optional)</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-image" />
                        <input
                          className={styles.input}
                          value={active.coverImage ?? ""}
                          onChange={(e) => {
                            const v = e.target.value;
                            patchActiveLocal({ coverImage: v });
                            patchActiveApiDebounced({ coverImage: v || null });
                          }}
                          placeholder="https://..."
                          disabled={busy}
                        />
                      </div>

                      <div className={styles.sectionTitle}>
                        <i className="bi bi-megaphone" /> SEO
                      </div>

                      <label className={styles.label}>SEO title</label>
                      <input
                        className={styles.inputPlain}
                        value={active.seoTitle ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          patchActiveLocal({ seoTitle: v });
                          patchActiveApiDebounced({ seoTitle: v || null });
                        }}
                        placeholder="Optional"
                        disabled={busy}
                      />

                      <label className={styles.label}>SEO description</label>
                      <textarea
                        className={styles.textarea}
                        value={active.seoDesc ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          patchActiveLocal({ seoDesc: v });
                          patchActiveApiDebounced({ seoDesc: v || null });
                        }}
                        placeholder="Optional"
                        disabled={busy}
                      />

                      <div className={styles.actions}>
                        <button className={styles.primaryBtn} type="button" onClick={() => loadTree()} disabled={busy}>
                          <i className="bi bi-save2" /> Reload
                        </button>

                        <button className={`${styles.ghostBtn} ${styles.dangerBtn}`} type="button" onClick={() => removeCategory(active.id)} disabled={busy}>
                          <i className="bi bi-trash" /> Delete
                        </button>
                      </div>

                      <div className={styles.tipInline}>
                        <i className="bi bi-lightbulb" />
                        <span>
                          Khi nối DB: index <span className={styles.mono}>parentId, sort</span> để load tree nhanh.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
