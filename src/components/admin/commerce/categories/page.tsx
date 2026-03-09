"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/commerce/categories/categories.module.css";
import { useModal } from "@/components/admin/shared/common/modal";
import { usePageFunctionKeys } from "@/components/admin/shared/hooks/usePageFunctionKeys";

import type { CategoryRow } from "@/services/commerce/categories/categories.service";
import { slugify } from "@/services/commerce/categories/categories.service";
import { useCategoriesStore } from "@/store/commerce/categories/categories.store";
import { useSiteStore } from "@/store/site/site.store";
import { CATEGORY_MESSAGES as _MESSAGES } from "@/features/commerce/categories/messages";

/** ===== Types ===== */
type CategoryTreeNode = CategoryRow & {
  children: CategoryTreeNode[];
};

type CategoryPatch = Partial<Pick<CategoryRow, "name" | "slug" | "parentId" | "sortOrder">>;

/** ===== Utils ===== */
function bySortOrder(a: CategoryRow, b: CategoryRow): number {
  if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
  return a.name.localeCompare(b.name);
}

function buildTree(rows: CategoryRow[]): CategoryTreeNode[] {
  const map = new Map<string, CategoryTreeNode>();

  for (const row of rows) {
    map.set(row.id, { ...row, children: [] });
  }

  const roots: CategoryTreeNode[] = [];

  for (const node of map.values()) {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortRecursively = (node: CategoryTreeNode): void => {
    node.children.sort(bySortOrder);
    for (const child of node.children) {
      sortRecursively(child);
    }
  };

  roots.sort(bySortOrder);
  for (const root of roots) {
    sortRecursively(root);
  }

  return roots;
}

function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(1, page), Math.max(1, pageCount));
}

/** ===== Page ===== */
export default function CategoriesPage() {
  const modal = useModal();

  /** ===== Categories store ===== */
  const siteId = useCategoriesStore((s) => s.siteId);
  const siteLoading = useCategoriesStore((s) => s.siteLoading);
  const siteErr = useCategoriesStore((s) => s.siteErr);

  const rows = useCategoriesStore((s) => s.rows);
  const loading = useCategoriesStore((s) => s.loading);
  const busy = useCategoriesStore((s) => s.busy);
  const err = useCategoriesStore((s) => s.err);

  const activeId = useCategoriesStore((s) => s.activeId);
  const globalQuery = useCategoriesStore((s) => s.q);

  const initSite = useCategoriesStore((s) => s.initSite);
  const loadTree = useCategoriesStore((s) => s.loadTree);
  const setActiveId = useCategoriesStore((s) => s.setActiveId);
  const setQ = useCategoriesStore((s) => s.setQ);

  const createOne = useCategoriesStore((s) => s.createOne);
  const patchOne = useCategoriesStore((s) => s.patchOne);
  const removeOne = useCategoriesStore((s) => s.removeOne);

  /** ===== Site store ===== */
  const sites = useSiteStore((s) => s.sites);
  const sitesLoading = useSiteStore((s) => s.loading);
  const sitesErr = useSiteStore((s) => s.err);
  const selectedSiteId = useSiteStore((s) => s.siteId);
  const setSelectedSiteId = useSiteStore((s) => s.setSiteId);
  const hydrateFromStorage = useSiteStore((s) => s.hydrateFromStorage);
  const loadSites = useSiteStore((s) => s.loadSites);

  /** ===== Local UI ===== */
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [createOpen, setCreateOpen] = useState<boolean>(false);
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [createName, setCreateName] = useState<string>("");

  const [siblingQuery, setSiblingQuery] = useState<string>("");
  const [pageSize, setPageSize] = useState<number>(8);
  const [page, setPage] = useState<number>(1);

  const createInputRef = useRef<HTMLInputElement | null>(null);
  const globalSearchRef = useRef<HTMLInputElement | null>(null);

  /** ===== Draft editor state ===== */
  const active = useMemo<CategoryRow | null>(() => {
    return rows.find((item) => item.id === activeId) ?? null;
  }, [rows, activeId]);

  const [draftName, setDraftName] = useState<string>("");
  const [draftSlug, setDraftSlug] = useState<string>("");
  const [draftParentId, setDraftParentId] = useState<string>("");
  const [draftSortOrder, setDraftSortOrder] = useState<number>(0);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  /** ===== Debounced queries ===== */
  const debouncedGlobalQuery = useDebouncedValue(globalQuery, 250);
  const debouncedSiblingQuery = useDebouncedValue(siblingQuery, 250);

  /** ===== One-time site boot ===== */
  useEffect(() => {
    hydrateFromStorage();
    loadSites();
  }, [hydrateFromStorage, loadSites]);

  useEffect(() => {
    initSite();
  }, [initSite]);

  /**
   * Đồng bộ site đã chọn sang categories store khi thực sự khác nhau.
   */
  useEffect(() => {
    if (selectedSiteId && selectedSiteId !== siteId) {
      useCategoriesStore.setState({ siteId: selectedSiteId });
    }
  }, [selectedSiteId, siteId]);

  /**
   * Chỉ load tree khi siteId sẵn sàng.
   */
  useEffect(() => {
    if (!siteLoading && siteId) {
      void loadTree(siteId);
    }
  }, [siteLoading, siteId, loadTree]);

  /**
   * Đồng bộ draft khi category active đổi.
   */
  useEffect(() => {
    if (!active) {
      setDraftName("");
      setDraftSlug("");
      setDraftParentId("");
      setDraftSortOrder(0);
      setIsEditing(false);
      return;
    }

    setDraftName(active.name);
    setDraftSlug(active.slug);
    setDraftParentId(active.parentId ?? "");
    setDraftSortOrder(Number.isFinite(active.sortOrder) ? active.sortOrder : 0);
    setIsEditing(false);
  }, [active]);

  /** ===== Derived ===== */
  const byId = useMemo<Map<string, CategoryRow>>(() => {
    return new Map(rows.map((row) => [row.id, row] as const));
  }, [rows]);

  const tree = useMemo<CategoryTreeNode[]>(() => buildTree(rows), [rows]);

  const filteredIds = useMemo<Set<string>>(() => {
    const query = debouncedGlobalQuery.trim().toLowerCase();
    if (!query) return new Set(rows.map((row) => row.id));

    const matched = new Set<string>();

    for (const row of rows) {
      const haystack = `${row.name} ${row.slug}`.toLowerCase();
      if (haystack.includes(query)) {
        matched.add(row.id);
      }
    }

    for (const id of Array.from(matched)) {
      let current = byId.get(id);
      while (current?.parentId) {
        matched.add(current.parentId);
        current = byId.get(current.parentId);
      }
    }

    return matched;
  }, [rows, debouncedGlobalQuery, byId]);

  useEffect(() => {
    if (!debouncedGlobalQuery.trim()) return;

    setExpanded((prev) => {
      const next = new Set(prev);
      for (const id of filteredIds) next.add(id);
      return next;
    });
  }, [debouncedGlobalQuery, filteredIds]);

  const siblingRows = useMemo<CategoryRow[]>(() => {
    if (!active) return [];
    return rows
      .filter((row) => row.parentId === active.parentId)
      .slice()
      .sort(bySortOrder);
  }, [rows, active]);

  const filteredSiblings = useMemo<CategoryRow[]>(() => {
    const query = debouncedSiblingQuery.trim().toLowerCase();
    if (!query) return siblingRows;

    return siblingRows.filter((row) => {
      const haystack = `${row.name} ${row.slug}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [siblingRows, debouncedSiblingQuery]);

  const pageCount = useMemo<number>(() => {
    return Math.max(1, Math.ceil(filteredSiblings.length / pageSize));
  }, [filteredSiblings.length, pageSize]);

  useEffect(() => {
    setPage(1);
  }, [active?.parentId, debouncedSiblingQuery, pageSize]);

  useEffect(() => {
    setPage((current) => clampPage(current, pageCount));
  }, [pageCount]);

  const pagedSiblings = useMemo<CategoryRow[]>(() => {
    const start = (page - 1) * pageSize;
    return filteredSiblings.slice(start, start + pageSize);
  }, [filteredSiblings, page, pageSize]);

  /** ===== Helpers ===== */
  const ensureSiteId = useCallback((): string | null => {
    if (!siteId) {
      modal.error(_MESSAGES.missingSiteTitle, _MESSAGES.missingSiteDescription);
      return null;
    }
    return siteId;
  }, [siteId, modal]);

  const refreshTree = useCallback((): void => {
    if (siteId) {
      void loadTree(siteId);
    } else {
      void initSite();
    }
  }, [siteId, loadTree, initSite]);

  /** ===== Create ===== */
  const openCreate = useCallback((parentId: string | null): void => {
    setCreateParentId(parentId);
    setCreateName("");
    setCreateOpen(true);
    window.setTimeout(() => createInputRef.current?.focus(), 0);
  }, []);

  const closeCreate = useCallback((): void => {
    setCreateOpen(false);
    setCreateName("");
    setCreateParentId(null);
  }, []);

  const submitCreate = useCallback(async (): Promise<void> => {
    const name = createName.trim();
    if (!name) return;

    const currentSiteId = ensureSiteId();
    if (!currentSiteId) return;

    try {
      const created = await createOne(createParentId, name);
      const normalizedSlug = slugify(name);

      if (created.slug !== normalizedSlug) {
        await patchOne(created.id, { slug: normalizedSlug });
      }

      modal.success(_MESSAGES.successTitle, _MESSAGES.createSuccess(name));
      closeCreate();
      await loadTree(currentSiteId);
      setActiveId(created.id);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : _MESSAGES.createFailedTitle;
      modal.error(_MESSAGES.createFailedTitle, message);
    }
  }, [createName, ensureSiteId, createOne, createParentId, patchOne, modal, closeCreate, loadTree, setActiveId]);

  const removeCategory = useCallback(
    async (id: string): Promise<void> => {
      const currentSiteId = ensureSiteId();
      if (!currentSiteId) return;

      const current = rows.find((row) => row.id === id);
      if (!current) return;

      const fallbackActive =
        rows.find((row) => row.parentId === current.parentId && row.id !== id) ?? rows.find((row) => row.id !== id);

      try {
        await removeOne(id);
        modal.success(_MESSAGES.successTitle, _MESSAGES.deleteSuccess(current.name));

        if (activeId === id && fallbackActive) {
          setActiveId(fallbackActive.id);
        }

        await loadTree(currentSiteId);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : _MESSAGES.deleteFailedTitle;
        modal.error(_MESSAGES.deleteFailedTitle, message);
      }
    },
    [ensureSiteId, rows, removeOne, modal, loadTree, activeId, setActiveId],
  );

  const handleDeleteById = useCallback(
    (id: string): void => {
      const current = rows.find((row) => row.id === id);
      if (!current) return;

      modal.confirmDelete(_MESSAGES.deleteConfirmTitle, _MESSAGES.deleteConfirmDescription(current.name), () => {
        void removeCategory(id);
      });
    },
    [rows, modal, removeCategory],
  );

  const handleDelete = useCallback((): void => {
    if (!active) return;
    handleDeleteById(active.id);
  }, [active, handleDeleteById]);

  /** ===== Inspector actions ===== */
  const handleEnterEditMode = useCallback((): void => {
    if (!active) return;
    setIsEditing(true);
  }, [active]);

  const handleAutoSlug = useCallback((): void => {
    if (!active) return;
    setIsEditing(true);
    setDraftSlug(slugify(draftName));
  }, [active, draftName]);

  const handleAddSibling = useCallback((): void => {
    openCreate(active?.parentId ?? null);
  }, [active, openCreate]);

  const handleCreateChild = useCallback((): void => {
    if (!active) return;
    openCreate(active.id);
  }, [active, openCreate]);

  const handleFocusSearch = useCallback((): void => {
    globalSearchRef.current?.focus();
  }, []);

  const handleSave = useCallback(async (): Promise<void> => {
    if (!active) return;

    const currentSiteId = ensureSiteId();
    if (!currentSiteId) return;

    const nextName = draftName.trim();
    const nextSlug = slugify(draftSlug);
    const nextParentId = draftParentId || null;
    const nextSortOrder = Number.isFinite(draftSortOrder) ? Math.trunc(draftSortOrder) : 0;

    if (!nextName) {
      modal.error("Validation", "Name is required.");
      return;
    }

    if (nextParentId === active.id) {
      modal.error("Validation", "A category cannot be its own parent.");
      return;
    }

    const patch: CategoryPatch = {};

    if (nextName !== active.name) patch.name = nextName;
    if (nextSlug !== active.slug) patch.slug = nextSlug;
    if (nextParentId !== active.parentId) patch.parentId = nextParentId;
    if (nextSortOrder !== active.sortOrder) patch.sortOrder = nextSortOrder;

    if (Object.keys(patch).length === 0) {
      modal.success(_MESSAGES.successTitle, "Nothing changed.");
      setIsEditing(false);
      return;
    }

    try {
      await patchOne(active.id, patch);
      modal.success(_MESSAGES.successTitle, `Saved “${nextName}”.`);
      setIsEditing(false);
      await loadTree(currentSiteId);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : _MESSAGES.saveFailedTitle;
      modal.error(_MESSAGES.saveFailedTitle, message);
    }
  }, [active, ensureSiteId, draftName, draftSlug, draftParentId, draftSortOrder, modal, patchOne, loadTree]);

  /** ===== Drag reorder ===== */
  const [dragId, setDragId] = useState<string | null>(null);

  const onDragStart = useCallback((id: string): void => {
    setDragId(id);
  }, []);

  const onDrop = useCallback(
    async (targetId: string): Promise<void> => {
      const currentSiteId = ensureSiteId();
      if (!currentSiteId) return;
      if (!active) return;
      if (!dragId || dragId === targetId) return;

      const parentId = active.parentId ?? null;

      const siblings = rows
        .filter((row) => (row.parentId ?? null) === parentId)
        .slice()
        .sort(bySortOrder);

      const fromIndex = siblings.findIndex((row) => row.id === dragId);
      const toIndex = siblings.findIndex((row) => row.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return;

      const reordered = [...siblings];
      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);

      const changedItems = reordered
        .map((row, index) => ({ id: row.id, sortOrder: (index + 1) * 10 }))
        .filter(({ id, sortOrder }) => {
          const prevSort = rows.find((row) => row.id === id)?.sortOrder ?? 0;
          return prevSort !== sortOrder;
        });

      setDragId(null);

      if (changedItems.length === 0) return;

      try {
        await Promise.all(changedItems.map((item) => patchOne(item.id, { sortOrder: item.sortOrder })));
        modal.success(_MESSAGES.successTitle, _MESSAGES.reorderSuccess);
        await loadTree(currentSiteId);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : _MESSAGES.reorderFailedTitle;
        modal.error(_MESSAGES.reorderFailedTitle, message);
        await loadTree(currentSiteId);
      }
    },
    [ensureSiteId, active, dragId, rows, patchOne, modal, loadTree],
  );

  /** ===== Function keys ===== */
  const functionKeyActions = useMemo(
    () => ({
      F3: handleDelete,
      F5: handleAddSibling,
      F6: handleEnterEditMode,
      F9: handleAutoSlug,
      F10: () => {
        void handleSave();
      },
    }),
    [handleDelete, handleAddSibling, handleEnterEditMode, handleAutoSlug, handleSave],
  );

  usePageFunctionKeys(functionKeyActions);

  /** ===== Tree ===== */
  const isExpanded = useCallback(
    (id: string): boolean => {
      return expanded.has(id);
    },
    [expanded],
  );

  const toggleExpand = useCallback((id: string): void => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  function TreeNode({ node, depth }: { node: CategoryTreeNode; depth: number }) {
    if (!filteredIds.has(node.id)) return null;

    const isActiveNode = node.id === activeId;
    const hasChildren = node.children.length > 0;
    const open = hasChildren ? isExpanded(node.id) : false;

    return (
      <div className={styles.treeNode}>
        <div className={styles.treeRow}>
          {hasChildren ? (
            <button
              type="button"
              className={styles.treeCaret}
              onClick={(event) => {
                event.stopPropagation();
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
            {node.children.map((child) => (
              <TreeNode key={child.id} node={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </div>
    );
  }

  const fromIndex = filteredSiblings.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const toIndex = Math.min(page * pageSize, filteredSiblings.length);

  /** ===== Render ===== */
  return (
    <div className={styles.shell}>
      {(siteErr || err) && (
        <div className={styles.pageError}>
          <i className="bi bi-exclamation-triangle" />
          <span>{siteErr || err}</span>
        </div>
      )}

      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <div className={styles.tree}>
            {siteLoading ? (
              <div className={styles.loadingBox}>
                <i className="bi bi-arrow-repeat" />
                <span>{_MESSAGES.loadingSite}</span>
              </div>
            ) : !siteId ? (
              <div className={styles.loadingBox}>
                <i className="bi bi-exclamation-triangle" />
                <span>{_MESSAGES.noSiteSelected}</span>
              </div>
            ) : loading ? (
              <div className={styles.loadingBox}>
                <i className="bi bi-arrow-repeat" />
                <span>{_MESSAGES.loadingCategories}</span>
              </div>
            ) : tree.length === 0 ? (
              <div className={styles.loadingBox}>
                <i className="bi bi-inbox" />
                <span>{_MESSAGES.noCategories}</span>
              </div>
            ) : (
              tree.map((node) => <TreeNode key={node.id} node={node} depth={0} />)
            )}
          </div>

          <div className={styles.sidebarFooter}>
            <div className={styles.tip}>
              <i className="bi bi-lightbulb" />
              <span>{_MESSAGES.dragTip}</span>
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <div className={styles.content}>
            <section className={styles.panel}>
              <div className={styles.panelHeader}>
                <div className={styles.panelDflex}>
                  <div className={styles.panelTitle}>{_MESSAGES.orderWithinParent}</div>
                  <div className={styles.badge} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <i className="bi bi-globe2" />

                    <select
                      value={selectedSiteId || ""}
                      onChange={(event) => setSelectedSiteId(event.target.value)}
                      disabled={sitesLoading}
                      style={{
                        background: "transparent",
                        border: "none",
                        outline: "none",
                        color: "inherit",
                        fontWeight: 700,
                        cursor: sitesLoading ? "not-allowed" : "pointer",
                        maxWidth: 240,
                      }}
                    >
                      <option value="">
                        {sitesLoading ? _MESSAGES.loadingSitesOption : _MESSAGES.selectSiteOption}
                      </option>

                      {sites.map((site) => (
                        <option key={site.id} value={site.id}>
                          {site.name ?? site.id} ({site.id})
                        </option>
                      ))}
                    </select>

                    {sitesErr ? <span style={{ marginLeft: 8, opacity: 0.8 }}>({sitesErr})</span> : null}
                  </div>
                </div>

                <div className={styles.panelHeaderActions} style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <div className={styles.searchWrapTop} style={{ minWidth: 260 }}>
                    <i className="bi bi-search" />
                    <input
                      className={styles.searchTop}
                      placeholder={_MESSAGES.siblingSearchPlaceholder}
                      value={siblingQuery}
                      onChange={(event) => setSiblingQuery(event.target.value)}
                      disabled={!active || busy}
                    />
                    {siblingQuery.trim() && (
                      <button
                        className={styles.clearBtn}
                        type="button"
                        onClick={() => setSiblingQuery("")}
                        aria-label="Clear sibling search"
                      >
                        <i className="bi bi-x-lg" />
                      </button>
                    )}
                  </div>

                  <button
                    className={styles.ghostBtn}
                    type="button"
                    onClick={handleCreateChild}
                    disabled={!active || busy || siteLoading || !siteId}
                  >
                    <i className="bi bi-node-plus" /> {_MESSAGES.addChild}
                  </button>
                </div>
              </div>

              <div className={styles.pagerBar}>
                <div className={styles.pagerLeft}>
                  <span className={styles.pagerLabel}>{_MESSAGES.showing}</span>

                  <span className={styles.pagerRange}>
                    {filteredSiblings.length > 0 ? (
                      <>
                        {fromIndex}
                        <span className={styles.pagerDot} />
                        {toIndex}
                        <span style={{ opacity: 0.7, fontWeight: 700 }}>{_MESSAGES.of}</span> {filteredSiblings.length}
                      </>
                    ) : (
                      <>0</>
                    )}
                  </span>
                </div>

                <div className={styles.pagerRight} style={{ gap: 10 }}>
                  <select
                    className={styles.select}
                    value={pageSize}
                    onChange={(event) => setPageSize(Number(event.target.value))}
                    style={{ maxWidth: 100 }}
                  >
                    <option value={8}>8 / page</option>
                    <option value={12}>12 / page</option>
                    <option value={20}>20 / page</option>
                    <option value={50}>50 / page</option>
                  </select>

                  <button
                    className={`${styles.ghostBtn} ${styles.pagerBtn}`}
                    type="button"
                    onClick={() => setPage(1)}
                    disabled={page <= 1 || filteredSiblings.length === 0}
                  >
                    « First
                  </button>

                  <button
                    className={`${styles.ghostBtn} ${styles.pagerBtn}`}
                    type="button"
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                    disabled={page <= 1 || filteredSiblings.length === 0}
                  >
                    <i className="bi bi-chevron-left" /> {_MESSAGES.prev}
                  </button>

                  <div className={styles.pagerCenter}>
                    <span>{_MESSAGES.page}</span> <strong>{page}</strong>
                    <span style={{ opacity: 0.55 }}>/</span>
                    <strong>{pageCount}</strong>
                  </div>

                  <button
                    className={`${styles.ghostBtn} ${styles.pagerBtn}`}
                    type="button"
                    onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                    disabled={page >= pageCount || filteredSiblings.length === 0}
                  >
                    {_MESSAGES.next} <i className="bi bi-chevron-right" />
                  </button>

                  <button
                    className={`${styles.ghostBtn} ${styles.pagerBtn}`}
                    type="button"
                    onClick={() => setPage(pageCount)}
                    disabled={page >= pageCount || filteredSiblings.length === 0}
                  >
                    Last »
                  </button>
                </div>
              </div>

              <div className={styles.list}>
                {!active ? (
                  <div className={styles.empty}>{_MESSAGES.selectCategory}</div>
                ) : filteredSiblings.length === 0 ? (
                  <div className={styles.empty}>{_MESSAGES.noCategoriesHere}</div>
                ) : (
                  pagedSiblings.map((category) => {
                    const isActiveItem = category.id === activeId;

                    return (
                      <div
                        key={category.id}
                        className={`${styles.item} ${isActiveItem ? styles.itemActive : ""}`}
                        draggable
                        onDragStart={() => onDragStart(category.id)}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={() => void onDrop(category.id)}
                        onClick={() => setActiveId(category.id)}
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
                            <div className={styles.itemTitle}>{category.name}</div>

                            <div className={styles.itemMeta}>
                              <span className={styles.mono}>{_MESSAGES.sortOrderText(category.sortOrder)}</span>
                              <span className={styles.dot}>•</span>
                              <span className={styles.mono}>{_MESSAGES.slugPath(category.slug)}</span>
                              <span className={styles.dot}>•</span>
                              <span className={styles.mono}>
                                {_MESSAGES.productsCount(Number(category.count ?? 0))}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className={styles.itemActions} onClick={(event) => event.stopPropagation()}>
                          <button
                            className={styles.iconBtn}
                            type="button"
                            title="Delete"
                            onClick={() => handleDeleteById(category.id)}
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

            <aside className={styles.inspector}>
              <div className={styles.panel}>
                {!active ? (
                  <div className={styles.panelBody}>
                    <div className={styles.emptyInspector}>
                      <i className="bi bi-info-circle" />
                      <div>
                        <div className={styles.emptyTitle}>{_MESSAGES.selectCategory}</div>
                        <div className={styles.emptyText}>{_MESSAGES.selectCategoryDescription}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.panelBody}>
                    <div className={styles.inspectorHeader}>
                      <div className={styles.titleBlock}>
                        <h3 className={styles.headTitle}>{draftName || active.name}</h3>

                        <div className={styles.headMeta}>
                          <span className={styles.badge}>
                            <i className="bi bi-link-45deg" />/{draftSlug || active.slug}
                          </span>

                          <span className={styles.badge}>
                            <i className="bi bi-sort-numeric-down" />
                            {_MESSAGES.sortOrderText(draftSortOrder)}
                          </span>

                          <span className={styles.badge}>
                            <i className="bi bi-box-seam" />
                            {_MESSAGES.productsCount(Number(active.count ?? 0))}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formSection}>
                      <div className={styles.sectionTitle}>Editable information</div>

                      <div className={styles.formGrid}>
                        <div className={styles.field}>
                          <label className={styles.label}>{_MESSAGES.name}</label>
                          <div className={styles.inputWrap}>
                            <i className="bi bi-type" />
                            <input
                              className={styles.input}
                              value={draftName}
                              onChange={(event) => setDraftName(event.target.value)}
                              disabled={busy || !isEditing}
                              placeholder="Category name"
                            />
                          </div>
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>{_MESSAGES.slug}</label>
                          <div className={styles.inputWithAction}>
                            <div className={styles.inputWrap}>
                              <i className="bi bi-hash" />
                              <input
                                className={styles.input}
                                value={draftSlug}
                                onChange={(event) => setDraftSlug(event.target.value)}
                                disabled={busy || !isEditing}
                                placeholder="category-slug"
                              />
                            </div>
                          </div>
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>{_MESSAGES.parent}</label>
                          <div className={styles.selectWrap}>
                            <i className="bi bi-diagram-3" />
                            <select
                              className={styles.selectItem}
                              value={draftParentId}
                              onChange={(event) => setDraftParentId(event.target.value)}
                              disabled={busy || !isEditing}
                            >
                              <option value="">{_MESSAGES.noParent}</option>
                              {rows
                                .filter((row) => row.id !== active.id)
                                .slice()
                                .sort(bySortOrder)
                                .map((row) => (
                                  <option key={row.id} value={row.id}>
                                    {row.name} (/{row.slug})
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>

                        <div className={styles.field}>
                          <label className={styles.label}>{_MESSAGES.sortOrder}</label>
                          <div className={styles.inputWrap}>
                            <i className="bi bi-sort-numeric-down" />
                            <input
                              className={styles.input}
                              type="number"
                              value={draftSortOrder}
                              onChange={(event) => {
                                const nextValue = Number(event.target.value);
                                setDraftSortOrder(Number.isFinite(nextValue) ? Math.trunc(nextValue) : 0);
                              }}
                              disabled={busy || !isEditing}
                              placeholder="0"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={styles.formSection}>
                      <div className={styles.sectionTitle}>System information</div>

                      <div className={styles.metaGrid}>
                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>ID</span>
                          <span className={styles.metaValueMono}>{active.id}</span>
                        </div>

                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Site ID</span>
                          <span className={styles.metaValueMono}>{active.siteId}</span>
                        </div>

                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Parent ID</span>
                          <span className={styles.metaValueMono}>{active.parentId ?? "—"}</span>
                        </div>

                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Products</span>
                          <span className={styles.metaValue}>{Number(active.count ?? 0)}</span>
                        </div>

                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Created at</span>
                          <span className={styles.metaValue}>
                            {active.createdAt ? new Date(active.createdAt).toLocaleString("vi-VN") : "—"}
                          </span>
                        </div>

                        <div className={styles.metaItem}>
                          <span className={styles.metaLabel}>Updated at</span>
                          <span className={styles.metaValue}>
                            {active.updatedAt ? new Date(active.updatedAt).toLocaleString("vi-VN") : "—"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className={styles.tipInline}>
                      <i className="bi bi-lightbulb" />
                      <span className={styles.mono}>{_MESSAGES.dbHint}</span>
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>
      </div>

      {createOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeCreate();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closeCreate();
          }}
        >
          <div className={styles.modal} role="dialog" aria-modal="true">
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>{_MESSAGES.createCategory}</div>
              <button className={styles.iconBtn} type="button" onClick={closeCreate} disabled={busy}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <label className={styles.label}>{_MESSAGES.name}</label>
              <div className={styles.inputWrap}>
                <i className="bi bi-type" />
                <input
                  ref={createInputRef}
                  className={styles.input}
                  value={createName}
                  onChange={(event) => setCreateName(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void submitCreate();
                    if (event.key === "Escape") closeCreate();
                  }}
                  placeholder={_MESSAGES.createPlaceholder}
                  disabled={busy}
                />
              </div>

              <div className={styles.modalHint}>
                {_MESSAGES.slugPreviewPrefix} <span className={styles.mono}>/{slugify(createName)}</span>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button className={styles.ghostBtn} type="button" onClick={closeCreate} disabled={busy}>
                {_MESSAGES.cancel}
              </button>
              <button
                className={styles.primaryBtn}
                type="button"
                onClick={() => void submitCreate()}
                disabled={busy || !createName.trim()}
              >
                <i className="bi bi-plus-lg" /> {_MESSAGES.create}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
