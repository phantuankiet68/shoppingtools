"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/commerce/categories/categories.module.css";
import { useModal } from "@/components/admin/shared/common/modal";

import type { CategoryRow } from "@/services/commerce/categories/categories.service";
import { slugify } from "@/services/commerce/categories/categories.service";
import { useCategoriesStore } from "@/store/commerce/categories/categories.store";

/** ===== Tree Types ===== */
type CategoryTreeNode = CategoryRow & { children: CategoryTreeNode[] };

/** ===== Utils (UI-only) ===== */
function bySortOrder(a: CategoryRow, b: CategoryRow) {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.name.localeCompare(b.name);
}

function buildTree(rows: CategoryRow[]) {
  const map = new Map<string, CategoryTreeNode>();
  rows.forEach((r) => map.set(r.id, { ...r, children: [] }));

  const roots: CategoryTreeNode[] = [];
  for (const r of map.values()) {
    if (r.parentId && map.has(r.parentId)) map.get(r.parentId)!.children.push(r);
    else roots.push(r);
  }

  const sortRec = (n: CategoryTreeNode) => {
    n.children.sort(bySortOrder);
    n.children.forEach(sortRec);
  };

  roots.sort(bySortOrder);
  roots.forEach(sortRec);
  return roots;
}

export default function CategoriesPage() {
  const modal = useModal();

  /** ===== Store ===== */
  const siteId = useCategoriesStore((s) => s.siteId);
  const siteLoading = useCategoriesStore((s) => s.siteLoading);
  const siteErr = useCategoriesStore((s) => s.siteErr);

  const rows = useCategoriesStore((s) => s.rows);
  const loading = useCategoriesStore((s) => s.loading);
  const busy = useCategoriesStore((s) => s.busy);
  const err = useCategoriesStore((s) => s.err);

  const activeId = useCategoriesStore((s) => s.activeId);
  const q = useCategoriesStore((s) => s.q);

  const initSite = useCategoriesStore((s) => s.initSite);
  const loadTree = useCategoriesStore((s) => s.loadTree);
  const setActiveId = useCategoriesStore((s) => s.setActiveId);
  const setQ = useCategoriesStore((s) => s.setQ);

  const createOne = useCategoriesStore((s) => s.createOne);
  const patchOne = useCategoriesStore((s) => s.patchOne);
  const removeOne = useCategoriesStore((s) => s.removeOne);

  /** ===== Local UI state ===== */
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());

  const [createOpen, setCreateOpen] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [createName, setCreateName] = useState("");
  const createInputRef = useRef<HTMLInputElement | null>(null);

  const patchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (patchTimer.current) clearTimeout(patchTimer.current);
    };
  }, []);

  /** ===== Init ===== */
  useEffect(() => {
    initSite();
  }, [initSite]);

  useEffect(() => {
    if (!siteLoading && siteId) loadTree(siteId);
  }, [siteLoading, siteId, loadTree]);

  /** ===== Derived ===== */
  const active = useMemo(() => rows.find((x) => x.id === activeId) || null, [rows, activeId]);
  const byId = useMemo(() => new Map(rows.map((r) => [r.id, r] as const)), [rows]);
  const tree = useMemo(() => buildTree(rows), [rows]);

  const filteredIds = useMemo(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return new Set(rows.map((r) => r.id));

    const match = new Set<string>();
    for (const r of rows) {
      if ((r.name + " " + r.slug).toLowerCase().includes(qq)) match.add(r.id);
    }

    // include ancestors
    for (const id of Array.from(match)) {
      let cur = byId.get(id);
      while (cur?.parentId) {
        const p = cur.parentId;
        if (!match.has(p)) match.add(p);
        cur = byId.get(p);
        if (!cur) break;
      }
    }

    return match;
  }, [rows, q, byId]);

  useEffect(() => {
    const qq = q.trim().toLowerCase();
    if (!qq) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      for (const id of filteredIds) next.add(id);
      return next;
    });
  }, [q, filteredIds]);

  const flatSiblings = useMemo(() => {
    if (!active) return [];
    return rows
      .filter((x) => x.parentId === active.parentId)
      .slice()
      .sort(bySortOrder);
  }, [rows, active]);

  const PAGE_SIZE = 8;
  const [page, setPage] = useState(1);

  const pageCount = useMemo(() => Math.max(1, Math.ceil(flatSiblings.length / PAGE_SIZE)), [flatSiblings.length]);

  useEffect(() => {
    setPage(1);
  }, [active?.parentId]);

  useEffect(() => {
    setPage((p) => Math.min(Math.max(1, p), pageCount));
  }, [pageCount]);

  const pagedSiblings = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return flatSiblings.slice(start, start + PAGE_SIZE);
  }, [flatSiblings, page]);

  /** ===== Tree expand ===== */
  function isExpanded(id: string) {
    return expanded.has(id);
  }
  function toggleExpand(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  /** ===== Create ===== */
  function openCreate(parentId: string | null) {
    setCreateParentId(parentId);
    setCreateName("");
    setCreateOpen(true);
    setTimeout(() => createInputRef.current?.focus(), 0);
  }
  function closeCreate() {
    setCreateOpen(false);
    setCreateName("");
    setCreateParentId(null);
  }

  async function submitCreate() {
    const name = createName.trim();
    if (!name) return;

    if (!siteId) {
      modal.error("Missing site", "Please select a site first.");
      return;
    }

    try {
      // create via store (backend requires siteId handled in store)
      const created = await createOne(createParentId, name);

      // ensure slug is normalized (store createOne may not slugify)
      const s = slugify(name);
      if (created.slug !== s) {
        await patchOne(created.id, { slug: s });
      }

      modal.success("Success", `Created “${name}”.`);
      closeCreate();
    } catch (e: unknown) {
      const err = e as Error;
      modal.error("Create failed", err?.message || "Create failed");
    }
  }

  /** ===== Patch (debounced) ===== */
  function patchDebounced(id: string, patch: Partial<Pick<CategoryRow, "name" | "slug" | "parentId" | "sortOrder">>) {
    if (!siteId) {
      modal.error("Missing site", "Please select a site first.");
      return;
    }

    if (patchTimer.current) clearTimeout(patchTimer.current);
    patchTimer.current = setTimeout(async () => {
      try {
        await patchOne(id, patch);
      } catch (e: unknown) {
        const err = e as Error;
        modal.error("Save failed", err?.message || "Save failed");
        loadTree(siteId);
      }
    }, 350);
  }

  function changeName(v: string) {
    if (!active) return;
    const name = v;
    // optimistic in store via patchOne; but we debounce to reduce requests:
    // We'll do a tiny local optimistic by calling patchOne only in debounce.
    // UI displays from store rows, so we should update store immediately:
    useCategoriesStore.setState((s) => ({
      rows: s.rows.map((x) => (x.id === active.id ? { ...x, name } : x)),
    }));
    patchDebounced(active.id, { name: name.trim() });
  }

  function changeSlug(v: string) {
    if (!active) return;
    const s = slugify(v);
    useCategoriesStore.setState((st) => ({
      rows: st.rows.map((x) => (x.id === active.id ? { ...x, slug: s } : x)),
    }));
    patchDebounced(active.id, { slug: s });
  }

  function moveParent(newParentId: string | null) {
    if (!active) return;
    if (newParentId === active.id) return;

    useCategoriesStore.setState((st) => ({
      rows: st.rows.map((x) => (x.id === active.id ? { ...x, parentId: newParentId } : x)),
    }));
    patchDebounced(active.id, { parentId: newParentId });
  }

  function autoSlugFromName() {
    if (!active) return;
    const s = slugify(active.name);
    useCategoriesStore.setState((st) => ({
      rows: st.rows.map((x) => (x.id === active.id ? { ...x, slug: s } : x)),
    }));
    patchDebounced(active.id, { slug: s });
  }

  function changeSortOrder(v: number) {
    if (!active) return;
    const n = Math.trunc(Number(v));
    const sortOrder = Number.isFinite(n) ? n : 0;

    useCategoriesStore.setState((st) => ({
      rows: st.rows.map((x) => (x.id === active.id ? { ...x, sortOrder } : x)),
    }));
    patchDebounced(active.id, { sortOrder });
  }

  /** ===== Delete ===== */
  function askDelete(id: string, name: string) {
    modal.confirmDelete("Delete category?", `Delete “${name}”? This action cannot be undone.`, async () => {
      if (!siteId) {
        modal.error("Missing site", "Please select a site first.");
        return;
      }
      try {
        await removeOne(id);
        modal.success("Success", `Deleted “${name}” successfully.`);
      } catch (e: unknown) {
        const err = e as Error;
        modal.error("Delete failed", err?.message || "Delete failed");
      }
    });
  }

  /** ===== Drag reorder within same parent ===== */
  const [dragId, setDragId] = useState<string | null>(null);

  function onDragStart(id: string) {
    setDragId(id);
  }

  async function onDrop(targetId: string) {
    if (!siteId) {
      modal.error("Missing site", "Please select a site first.");
      return;
    }
    if (!active) return;
    if (!dragId || dragId === targetId) return;

    const parentId = active.parentId;

    const sibs = rows
      .filter((x) => x.parentId === parentId)
      .slice()
      .sort(bySortOrder);

    const from = sibs.findIndex((x) => x.id === dragId);
    const to = sibs.findIndex((x) => x.id === targetId);
    if (from < 0 || to < 0) return;

    const next = [...sibs];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);

    const sortMap = new Map(next.map((x, i) => [x.id, (i + 1) * 10] as const));
    const changed = Array.from(sortMap.entries()).filter(([id, so]) => {
      const before = rows.find((r) => r.id === id)?.sortOrder ?? 0;
      return before !== so;
    });

    // optimistic reorder in store (no extra local state)
    useCategoriesStore.setState((st) => ({
      rows: st.rows.map((x) => (sortMap.has(x.id) ? { ...x, sortOrder: sortMap.get(x.id)! } : x)),
    }));

    setDragId(null);
    if (changed.length === 0) return;

    try {
      await Promise.all(changed.map(([id, sortOrder]) => patchOne(id, { sortOrder })));
      modal.success("Success", "Reordered successfully.");
    } catch (e: unknown) {
      const err = e as Error;
      modal.error("Reorder failed", err?.message || "Reorder failed");
      loadTree(siteId);
    }
  }

  /** ===== Tree Node ===== */
  function TreeNode({ node, depth }: { node: CategoryTreeNode; depth: number }) {
    if (!filteredIds.has(node.id)) return null;

    const isActiveNode = node.id === activeId;
    const hasChildren = (node.children?.length || 0) > 0;
    const open = hasChildren ? isExpanded(node.id) : false;

    return (
      <div className={styles.treeNode}>
        <div className={styles.treeRow}>
          {hasChildren ? (
            <button
              type="button"
              className={styles.treeCaret}
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
              aria-label={open ? "Collapse" : "Expand"}
            >
              <i className={`bi ${open ? "bi-caret-down-fill" : "bi-caret-right-fill"}`} />
            </button>
          ) : (
            <span className={styles.treeCaretPlaceholder} />
          )}

          <button
            type="button"
            className={`${styles.treeBtn} ${isActiveNode ? styles.treeActive : ""}`}
            onClick={() => setActiveId(node.id)}
            style={{ paddingLeft: 10 + depth * 14 }}
          >
            <div className={styles.treeGroup}>
              <i className="bi bi-folder2" />
              <span className={styles.treeName}>{node.name}</span>
            </div>

            <span className={styles.treeCount}>{Number(node.count ?? 0)}</span>
          </button>
        </div>

        {hasChildren && open && (
          <div className={styles.treeChildren}>
            {node.children.map((ch) => (
              <TreeNode key={ch.id} node={ch} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  /** ===== Render ===== */
  return (
    <div className={styles.shell}>
      {/* HEADER */}
      <header className={styles.topbar}>
        <div className={styles.brand}>
          <div className={styles.brandMark} aria-hidden="true">
            <i className="bi bi-diagram-3" />
          </div>

          <div className={styles.brandText}>
            <div className={styles.brandTitleRow}>
              <div className={styles.brandTitle}>Categories</div>

              <span className={styles.badge}>
                <i className="bi bi-globe2" />
                {siteLoading ? "Loading site..." : siteId ? `Site: ${siteId.slice(0, 8)}…` : "No site"}
              </span>

              {(loading || busy) && (
                <span className={styles.badgeMuted}>
                  <i className="bi bi-arrow-repeat" /> Syncing
                </span>
              )}
            </div>

            <div className={styles.brandSub}>
              Tree · Sort order · Parent linking
              <span className={styles.dot} />
              <span className={styles.hint}>Tip: drag to reorder within parent</span>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <div className={styles.searchWrapTop}>
            <i className="bi bi-search" />
            <input
              className={styles.searchTop}
              placeholder={siteLoading ? "Loading..." : "Search categories..."}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              disabled={siteLoading || !siteId}
            />
            {q.trim() && (
              <button className={styles.clearBtn} type="button" onClick={() => setQ("")} aria-label="Clear search">
                <i className="bi bi-x-lg" />
              </button>
            )}
          </div>

          <div className={styles.actionBtns}>
            <button
              className={styles.ghostBtn}
              type="button"
              onClick={() => (siteId ? loadTree(siteId) : initSite())}
              disabled={busy || loading || siteLoading}
            >
              <i className={`bi bi-arrow-repeat ${loading ? styles.spin : ""}`} /> Refresh
            </button>

            <button
              className={styles.primaryBtn}
              type="button"
              onClick={() => openCreate(active?.parentId ?? null)}
              disabled={busy || siteLoading || !siteId}
            >
              <i className="bi bi-plus-lg" />
              <span>Add sibling</span>
            </button>
          </div>
        </div>
      </header>

      {(siteErr || err) && (
        <div className={styles.pageError}>
          <i className="bi bi-exclamation-triangle" />
          <span>{siteErr || err}</span>
        </div>
      )}

      {/* BODY */}
      <div className={styles.body}>
        {/* SIDEBAR TREE */}
        <aside className={styles.sidebar}>
          <div className={styles.tree}>
            {siteLoading ? (
              <div className={styles.loadingBox}>
                <i className="bi bi-arrow-repeat" />
                <span>Loading site...</span>
              </div>
            ) : !siteId ? (
              <div className={styles.loadingBox}>
                <i className="bi bi-exclamation-triangle" />
                <span>No site selected.</span>
              </div>
            ) : loading ? (
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
              <span>Tip: Drag sort is applied in Order within parent.</span>
            </div>
          </div>
        </aside>

        {/* MAIN */}
        <main className={styles.main}>
          <div className={styles.content}>
            {/* LIST PANEL */}
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div>
                  <div className={styles.panelTitle}>Order within parent</div>
                  <div className={styles.panelSub}>Drag to sort (only within the same parent)</div>
                </div>

                <div className={styles.panelHeaderActions}>
                  <button
                    className={styles.ghostBtn}
                    type="button"
                    onClick={() => openCreate(active?.id ?? null)}
                    disabled={!active || busy || siteLoading || !siteId}
                  >
                    <i className="bi bi-node-plus" /> Add child
                  </button>
                </div>
              </div>

              <div className={styles.pagerBar}>
                <div className={styles.pagerLeft}>
                  <span className={styles.pagerLabel}>Showing</span>

                  <span className={styles.pagerRange}>
                    {flatSiblings.length > 0 ? (
                      <>
                        {(page - 1) * PAGE_SIZE + 1}
                        <span className={styles.pagerDot} />
                        {Math.min(page * PAGE_SIZE, flatSiblings.length)}
                        <span style={{ opacity: 0.7, fontWeight: 700 }}>of</span> {flatSiblings.length}
                      </>
                    ) : (
                      <>0</>
                    )}
                  </span>
                </div>

                <div className={styles.pagerRight}>
                  <button
                    className={`${styles.ghostBtn} ${styles.pagerBtn}`}
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={busy || page <= 1 || flatSiblings.length === 0}
                  >
                    <i className="bi bi-chevron-left" /> Prev
                  </button>

                  <div className={styles.pagerCenter}>
                    <span>Page</span> <strong>{page}</strong>
                    <span style={{ opacity: 0.55 }}>/</span>
                    <strong>{pageCount}</strong>
                  </div>

                  <button
                    className={`${styles.ghostBtn} ${styles.pagerBtn}`}
                    type="button"
                    onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
                    disabled={busy || page >= pageCount || flatSiblings.length === 0}
                  >
                    Next <i className="bi bi-chevron-right" />
                  </button>
                </div>
              </div>

              <div className={styles.list}>
                {!active ? (
                  <div className={styles.empty}>Select a category</div>
                ) : flatSiblings.length === 0 ? (
                  <div className={styles.empty}>No categories here</div>
                ) : (
                  pagedSiblings.map((c) => {
                    const isActiveItem = c.id === activeId;
                    return (
                      <div
                        key={c.id}
                        className={`${styles.item} ${isActiveItem ? styles.itemActive : ""}`}
                        draggable
                        onDragStart={() => onDragStart(c.id)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => onDrop(c.id)}
                        onClick={() => setActiveId(c.id)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className={styles.itemLeft}>
                          <span className={styles.dragHandle} title="Drag">
                            <i className="bi bi-grip-vertical" />
                          </span>

                          <span className={styles.itemIcon}>
                            <i className="bi bi-tag" />
                          </span>

                          <div className={styles.itemText}>
                            <div className={styles.itemTitle}>{c.name}</div>

                            <div className={styles.itemMeta}>
                              <span className={styles.mono}>sortOrder {c.sortOrder}</span>
                              <span className={styles.dot}>•</span>
                              <span className={styles.mono}>/{c.slug}</span>
                              <span className={styles.dot}>•</span>
                              <span className={styles.mono}>{c.count} products</span>
                            </div>
                          </div>
                        </div>

                        <div className={styles.itemActions} onClick={(e) => e.stopPropagation()}>
                          <button
                            className={styles.iconBtn}
                            type="button"
                            title="Delete"
                            onClick={() => askDelete(c.id, c.name)}
                            disabled={busy}
                          >
                            <i className="bi bi-trash" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </section>

            {/* INSPECTOR */}
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
                            <i className="bi bi-sort-numeric-down" /> sortOrder {active.sortOrder}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.form}>
                      <label className={styles.label}>Name</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-type" />
                        <input
                          className={styles.input}
                          value={active.name}
                          onChange={(e) => changeName(e.target.value)}
                          disabled={busy}
                        />
                      </div>

                      <div className={styles.rowInline}>
                        <div className={styles.rowGrow}>
                          <label className={styles.label}>Slug</label>
                          <div className={styles.inputWrap}>
                            <i className="bi bi-hash" />
                            <input
                              className={styles.input}
                              value={active.slug}
                              onChange={(e) => changeSlug(e.target.value)}
                              disabled={busy}
                            />
                          </div>
                        </div>

                        <button className={styles.ghostBtn} type="button" onClick={autoSlugFromName} disabled={busy}>
                          <i className="bi bi-magic" /> Auto
                        </button>
                      </div>

                      <label className={styles.label}>Parent</label>
                      <div className={styles.selectWrap}>
                        <i className="bi bi-diagram-3" />
                        <select
                          className={styles.select}
                          value={active.parentId ?? ""}
                          onChange={(e) => moveParent(e.target.value ? e.target.value : null)}
                          disabled={busy}
                        >
                          <option value="">(no parent)</option>
                          {rows
                            .filter((x) => x.id !== active.id)
                            .slice()
                            .sort(bySortOrder)
                            .map((x) => (
                              <option key={x.id} value={x.id}>
                                {x.name} (/ {x.slug})
                              </option>
                            ))}
                        </select>
                      </div>

                      <label className={styles.label}>Sort order</label>
                      <div className={styles.inputWrap}>
                        <i className="bi bi-sort-numeric-down" />
                        <input
                          className={styles.input}
                          type="number"
                          value={Number.isFinite(active.sortOrder) ? active.sortOrder : 0}
                          onChange={(e) => changeSortOrder(Number(e.target.value))}
                          disabled={busy}
                        />
                      </div>

                      <div className={styles.actions}>
                        <button
                          className={styles.primaryBtn}
                          type="button"
                          onClick={() => loadTree(siteId)}
                          disabled={busy || !siteId}
                        >
                          <i className="bi bi-save2" /> Reload
                        </button>

                        <button
                          className={styles.iconBtn}
                          type="button"
                          title="Delete"
                          onClick={() => askDelete(active.id, active.name)}
                          disabled={busy}
                        >
                          <i className="bi bi-trash" />
                        </button>
                      </div>

                      <div className={styles.tipInline}>
                        <i className="bi bi-lightbulb" />
                        <span>
                          DB index gợi ý: <span className={styles.mono}>parentId</span>,{" "}
                          <span className={styles.mono}>sortOrder</span> để load tree nhanh.
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

      {/* CREATE MODAL */}
      {createOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeCreate();
          }}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeCreate();
          }}
        >
          <div className={styles.modal} role="dialog" aria-modal="true">
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Create category</div>
              <button className={styles.iconBtn} type="button" onClick={closeCreate} disabled={busy}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <label className={styles.label}>Name</label>
              <div className={styles.inputWrap}>
                <i className="bi bi-type" />
                <input
                  ref={createInputRef}
                  className={styles.input}
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") submitCreate();
                    if (e.key === "Escape") closeCreate();
                  }}
                  placeholder="e.g. Accessories"
                  disabled={busy}
                />
              </div>

              <div className={styles.modalHint}>
                Slug sẽ tự tạo: <span className={styles.mono}>/{slugify(createName)}</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.ghostBtn} type="button" onClick={closeCreate} disabled={busy}>
                Cancel
              </button>
              <button
                className={styles.primaryBtn}
                type="button"
                onClick={submitCreate}
                disabled={busy || !createName.trim()}
              >
                <i className="bi bi-plus-lg" /> Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
