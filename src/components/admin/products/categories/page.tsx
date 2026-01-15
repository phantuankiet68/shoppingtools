"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/product/categories/categories.module.css";

type CategoryRow = {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  enabled: boolean;
  sort: number;

  icon?: string; // bootstrap icon
  coverImage?: string; // url
  seoTitle?: string;
  seoDesc?: string;
};

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
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

export default function CategoriesPage() {
  const [rows, setRows] = useState<CategoryRow[]>(() => [
    { id: uid(), parentId: null, name: "Products", slug: "products", enabled: true, sort: 10, icon: "bi-box" },
    { id: uid(), parentId: null, name: "Blog", slug: "blog", enabled: true, sort: 20, icon: "bi-journal-text" },
    { id: uid(), parentId: null, name: "Support", slug: "support", enabled: true, sort: 30, icon: "bi-life-preserver" },
    { id: uid(), parentId: null, name: "Collections", slug: "collections", enabled: true, sort: 40, icon: "bi-grid-3x3-gap" },
  ]);

  // add children demo
  const [bootstrapped, setBootstrapped] = useState(false);
  if (!bootstrapped) {
    setBootstrapped(true);
    setRows((prev) => {
      const products = prev.find((x) => x.slug === "products")!;
      const collections = prev.find((x) => x.slug === "collections")!;
      return [
        ...prev,
        { id: uid(), parentId: products.id, name: "Shoes", slug: "shoes", enabled: true, sort: 10, icon: "bi-bag" },
        { id: uid(), parentId: products.id, name: "Accessories", slug: "accessories", enabled: true, sort: 20, icon: "bi-gem" },
        { id: uid(), parentId: collections.id, name: "Summer", slug: "summer", enabled: true, sort: 10, icon: "bi-sun" },
        { id: uid(), parentId: collections.id, name: "Winter", slug: "winter", enabled: true, sort: 20, icon: "bi-snow" },
      ];
    });
  }

  const [q, setQ] = useState("");
  const [activeId, setActiveId] = useState<string>(() => rows[0]?.id || "");
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
    const sibs = rows
      .filter((x) => x.parentId === active.parentId)
      .slice()
      .sort(bySort);
    return sibs;
  }, [rows, active]);

  // drag reorder (within same parent)
  const [dragId, setDragId] = useState<string | null>(null);
  function onDragStart(id: string) {
    setDragId(id);
  }
  function onDrop(targetId: string) {
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
    setRows((prev) => prev.map((x) => (sortMap.has(x.id) ? { ...x, sort: sortMap.get(x.id)! } : x)));
    setDragId(null);
  }

  function select(id: string) {
    setActiveId(id);
  }

  function createCategory(parentId: string | null) {
    const name = prompt("Category name?");
    if (!name?.trim()) return;
    const slug = slugify(name);
    const maxSort = Math.max(0, ...rows.filter((x) => x.parentId === parentId).map((x) => x.sort)) + 10;

    const row: CategoryRow = {
      id: uid(),
      parentId,
      name: name.trim(),
      slug,
      enabled: true,
      sort: maxSort,
      icon: "bi-tag",
    };
    setRows((prev) => [...prev, row]);
    setTimeout(() => select(row.id), 0);
  }

  function removeCategory(id: string) {
    const current = rows.find((x) => x.id === id);
    if (!current) return;

    const hasChildren = rows.some((x) => x.parentId === id);
    const ok = confirm(hasChildren ? `Delete "${current.name}" and its children?` : `Delete "${current.name}"?`);
    if (!ok) return;

    // cascade delete (MVP)
    const toDelete = new Set<string>();
    const walk = (cid: string) => {
      toDelete.add(cid);
      rows.filter((x) => x.parentId === cid).forEach((ch) => walk(ch.id));
    };
    walk(id);

    setRows((prev) => prev.filter((x) => !toDelete.has(x.id)));
    if (activeId === id) {
      const remain = rows.filter((x) => !toDelete.has(x.id));
      setActiveId(remain[0]?.id || "");
    }
  }

  function toggleEnabled(id: string) {
    setRows((prev) => prev.map((x) => (x.id === id ? { ...x, enabled: !x.enabled } : x)));
  }

  function patchActive(patch: Partial<CategoryRow>) {
    if (!active) return;
    setRows((prev) => prev.map((x) => (x.id === active.id ? { ...x, ...patch } : x)));
  }

  function changeName(name: string) {
    if (!active) return;
    patchActive({ name });
    // auto slug if user hasn’t edited slug manually (simple heuristic)
  }

  function changeSlug(slug: string) {
    patchActive({ slug: slugify(slug) });
  }

  function moveParent(newParentId: string | null) {
    if (!active) return;
    if (newParentId === active.id) return;

    // prevent cycles
    const byId = new Map(rows.map((r) => [r.id, r]));
    let p = newParentId;
    while (p) {
      if (p === active.id) return; // cycle
      p = byId.get(p)?.parentId ?? null;
    }

    const maxSort = Math.max(0, ...rows.filter((x) => x.parentId === newParentId).map((x) => x.sort)) + 10;

    patchActive({ parentId: newParentId, sort: maxSort });
  }

  function autoSlugFromName() {
    if (!active) return;
    patchActive({ slug: slugify(active.name) });
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
          <button className={styles.ghostBtn} type="button" onClick={() => createCategory(active?.id ?? null)} disabled={!active}>
            <i className="bi bi-node-plus" /> Add child
          </button>
          <button className={styles.primaryBtn} type="button" onClick={() => createCategory(active?.parentId ?? null)}>
            <i className="bi bi-plus-lg" /> Add sibling
          </button>
        </div>
      </header>

      <div className={styles.body}>
        {/* Sidebar tree */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarTitle}>Category tree</div>
            <div className={styles.sidebarHint}>Search and select a category</div>
          </div>

          <div className={styles.searchWrap}>
            <i className="bi bi-search" />
            <input className={styles.search} placeholder="Search name / slug..." value={q} onChange={(e) => setQ(e.target.value)} />
          </div>

          <div className={styles.tree}>
            {tree.map((n) => (
              <TreeNode key={n.id} node={n} depth={0} />
            ))}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.tip}>
              <i className="bi bi-lightbulb" />
              <span>Bạn có thể dùng categories cho Products, Blog, hoặc Sections preset.</span>
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
                  <button className={styles.ghostBtn} type="button" onClick={() => createCategory(active?.parentId ?? null)}>
                    <i className="bi bi-plus-lg" /> Add
                  </button>
                </div>
              </div>

              <div className={styles.list}>
                {flatSiblings.length === 0 ? (
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
                            </div>
                          </div>
                        </div>

                        <div className={styles.itemActions} onClick={(e) => e.stopPropagation()}>
                          <button className={styles.iconBtn} type="button" title="Toggle" onClick={() => toggleEnabled(c.id)}>
                            <i className={`bi ${c.enabled ? "bi-eye" : "bi-eye-slash"}`} />
                          </button>
                          <button className={styles.iconBtn} type="button" title="Delete" onClick={() => removeCategory(c.id)}>
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
                <div className={styles.panelHeader}>
                  <div>
                    <div className={styles.panelTitle}>Inspector</div>
                    <div className={styles.panelSub}>Edit details, SEO & hierarchy</div>
                  </div>
                </div>

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

                      <button className={styles.iconBtn} type="button" title="Toggle enabled" onClick={() => toggleEnabled(active.id)}>
                        <i className={`bi ${active.enabled ? "bi-toggle2-on" : "bi-toggle2-off"}`} />
                      </button>
                    </div>

                    <div className={styles.form}>
                      <label className={styles.label}>Name</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-type" />
                        <input className={styles.input} value={active.name} onChange={(e) => changeName(e.target.value)} />
                      </div>

                      <div className={styles.rowInline}>
                        <div className={styles.rowGrow}>
                          <label className={styles.label}>Slug</label>
                          <div className={styles.inputWrap}>
                            <i className="bi bi-hash" />
                            <input className={styles.input} value={active.slug} onChange={(e) => changeSlug(e.target.value)} />
                          </div>
                        </div>

                        <button className={styles.ghostBtn} type="button" onClick={autoSlugFromName}>
                          <i className="bi bi-magic" /> Auto
                        </button>
                      </div>

                      <label className={styles.label}>Parent</label>
                      <div className={styles.selectWrap}>
                        <i className="bi bi-diagram-3" />
                        <select className={styles.select} value={active.parentId ?? ""} onChange={(e) => moveParent(e.target.value ? e.target.value : null)}>
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
                        <input className={styles.input} value={active.icon ?? ""} onChange={(e) => patchActive({ icon: e.target.value.trim() })} placeholder="e.g. bi-tag" />
                      </div>

                      <label className={styles.label}>Cover image URL (optional)</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-image" />
                        <input className={styles.input} value={active.coverImage ?? ""} onChange={(e) => patchActive({ coverImage: e.target.value })} placeholder="https://..." />
                      </div>

                      <div className={styles.sectionTitle}>
                        <i className="bi bi-megaphone" /> SEO
                      </div>

                      <label className={styles.label}>SEO title</label>
                      <input className={styles.inputPlain} value={active.seoTitle ?? ""} onChange={(e) => patchActive({ seoTitle: e.target.value })} placeholder="Optional" />

                      <label className={styles.label}>SEO description</label>
                      <textarea className={styles.textarea} value={active.seoDesc ?? ""} onChange={(e) => patchActive({ seoDesc: e.target.value })} placeholder="Optional" />

                      <div className={styles.actions}>
                        <button className={styles.primaryBtn} type="button" onClick={() => alert("Demo only. Wire API to save.")}>
                          <i className="bi bi-save2" /> Save
                        </button>
                        <button className={`${styles.ghostBtn} ${styles.dangerBtn}`} type="button" onClick={() => removeCategory(active.id)}>
                          <i className="bi bi-trash" /> Delete
                        </button>
                      </div>

                      <div className={styles.tipInline}>
                        <i className="bi bi-lightbulb" />
                        <span>
                          Khi nối DB: dùng unique <span className={styles.mono}>[siteId, slug]</span> và index <span className={styles.mono}>parentId, sort</span>.
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
