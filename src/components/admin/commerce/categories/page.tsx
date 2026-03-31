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

import { ECOMMERCE_CATEGORY_PRESETS, WEBSITE_TYPES } from "@/constants/categories/index";

type CategoryTreeNode = CategoryRow & {
  children: CategoryTreeNode[];
};

type CategoryPatch = Partial<Pick<CategoryRow, "name" | "slug" | "parentId" | "sortOrder">>;

type DraftState = {
  name: string;
  slug: string;
  parentId: string;
  sortOrder: number;
};

type WebsiteTypeValue = string;
type PresetCategory = {
  name: string;
  children?: string[];
};

type EcommercePreset = {
  key: string;
  label: string;
  categories: PresetCategory[];
};

const EMPTY_DRAFT: DraftState = {
  name: "",
  slug: "",
  parentId: "",
  sortOrder: 0,
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

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
    node.children.forEach(sortRecursively);
  };

  roots.sort(bySortOrder);
  roots.forEach(sortRecursively);

  return roots;
}

function clampPage(page: number, pageCount: number): number {
  return Math.min(Math.max(1, page), Math.max(1, pageCount));
}

function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState<T>(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debounced;
}

function toDraft(active: CategoryRow | null): DraftState {
  if (!active) return EMPTY_DRAFT;

  return {
    name: active.name,
    slug: active.slug,
    parentId: active.parentId ?? "",
    sortOrder: Number.isFinite(active.sortOrder) ? active.sortOrder : 0,
  };
}

function normalizePresetSource(input: unknown): EcommercePreset[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((item): EcommercePreset | null => {
      if (!item || typeof item !== "object") return null;

      const raw = item as {
        key?: unknown;
        label?: unknown;
        categories?: unknown;
      };

      if (typeof raw.key !== "string" || typeof raw.label !== "string" || !Array.isArray(raw.categories)) {
        return null;
      }

      const categories = raw.categories
        .map((category): PresetCategory | null => {
          if (!category || typeof category !== "object") return null;

          const rawCategory = category as {
            name?: unknown;
            children?: unknown;
          };

          if (typeof rawCategory.name !== "string") return null;

          return {
            name: rawCategory.name,
            children: Array.isArray(rawCategory.children)
              ? rawCategory.children.filter((child): child is string => typeof child === "string")
              : undefined,
          };
        })
        .filter((item): item is PresetCategory => Boolean(item));

      return {
        key: raw.key,
        label: raw.label,
        categories,
      };
    })
    .filter((item): item is EcommercePreset => Boolean(item));
}

function normalizeWebsiteTypes(input: unknown): Array<{ value: string; label: string }> {
  if (!Array.isArray(input)) {
    return [{ value: "ecommerce", label: "Ecommerce" }];
  }

  const normalized = input
    .map((item): { value: string; label: string } | null => {
      if (!item || typeof item !== "object") return null;

      const raw = item as { value?: unknown; label?: unknown };
      if (typeof raw.value !== "string" || typeof raw.label !== "string") return null;

      return {
        value: raw.value,
        label: raw.label,
      };
    })
    .filter((item): item is { value: string; label: string } => Boolean(item));

  return normalized.length > 0 ? normalized : [{ value: "ecommerce", label: "Ecommerce" }];
}

type TreeNodeProps = {
  node: CategoryTreeNode;
  depth: number;
  activeId: string | null;
  filteredIds: Set<string>;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
};

function TreeNode({ node, depth, activeId, filteredIds, expanded, onToggle, onSelect }: TreeNodeProps) {
  if (!filteredIds.has(node.id)) return null;

  const isActiveNode = node.id === activeId;
  const hasChildren = node.children.length > 0;
  const open = hasChildren && expanded.has(node.id);

  return (
    <div className={styles.treeNode}>
      <button
        type="button"
        className={cx(styles.treeItem, isActiveNode && styles.treeItemActive)}
        onClick={() => onSelect(node.id)}
      >
        <span className={styles.treeToggleSlot}>
          {hasChildren ? (
            <span
              className={styles.treeCaret}
              onClick={(event) => {
                event.stopPropagation();
                onToggle(node.id);
              }}
              aria-label={open ? "Collapse" : "Expand"}
              role="button"
            >
              <i className={`bi ${open ? "bi-caret-down-fill" : "bi-caret-right-fill"}`} />
            </span>
          ) : (
            <span className={styles.treeCaretPlaceholder} />
          )}
        </span>

        <span className={styles.treeMain}>
          <span className={styles.treeGroup}>
            <i className="bi bi-folder2" />
            <span className={styles.treeName}>{node.name}</span>
          </span>
        </span>

        <span className={styles.treeCount}>{Number(node.count ?? 0)}</span>
      </button>

      {open && (
        <div className={styles.treeChildren} style={{ "--tree-indent": `${3 + depth * 16}px` } as React.CSSProperties}>
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              depth={depth + 1}
              activeId={activeId}
              filteredIds={filteredIds}
              expanded={expanded}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

type CategoryListItemProps = {
  category: CategoryRow;
  isActive: boolean;
  busy: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onDragStart: (id: string) => void;
  onDrop: (id: string) => void;
};

function CategoryListItem({
  category,
  isActive,
  busy,
  onSelect,
  onDelete,
  onDragStart,
  onDrop,
}: CategoryListItemProps) {
  return (
    <div
      className={cx(styles.item, isActive && styles.itemActive)}
      draggable
      onDragStart={() => onDragStart(category.id)}
      onDragOver={(event) => event.preventDefault()}
      onDrop={() => onDrop(category.id)}
      onClick={() => onSelect(category.id)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(category.id);
        }
      }}
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
            <span className={styles.mono}>{_MESSAGES.productsCount(Number(category.count ?? 0))}</span>
          </div>
        </div>
      </div>

      <div className={styles.itemActions} onClick={(event) => event.stopPropagation()}>
        <button
          className={styles.iconBtn}
          type="button"
          title="Delete"
          onClick={() => onDelete(category.id)}
          disabled={busy}
        >
          <i className="bi bi-trash" />
        </button>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const modal = useModal();

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

  const createOne = useCategoriesStore((s) => s.createOne);
  const patchOne = useCategoriesStore((s) => s.patchOne);
  const removeOne = useCategoriesStore((s) => s.removeOne);

  const sites = useSiteStore((s) => s.sites);
  const sitesLoading = useSiteStore((s) => s.loading);
  const sitesErr = useSiteStore((s) => s.err);
  const selectedSiteId = useSiteStore((s) => s.siteId);
  const setSelectedSiteId = useSiteStore((s) => s.setSiteId);
  const hydrateFromStorage = useSiteStore((s) => s.hydrateFromStorage);
  const loadSites = useSiteStore((s) => s.loadSites);

  const presetOptions = useMemo(() => normalizePresetSource(ECOMMERCE_CATEGORY_PRESETS), []);
  const websiteTypeOptions = useMemo(() => normalizeWebsiteTypes(WEBSITE_TYPES), []);

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set());
  const [createOpen, setCreateOpen] = useState(false);
  const [createParentId, setCreateParentId] = useState<string | null>(null);
  const [createName, setCreateName] = useState("");

  const [presetOpen, setPresetOpen] = useState(false);
  const [websiteType, setWebsiteType] = useState<WebsiteTypeValue>(websiteTypeOptions[0]?.value ?? "ecommerce");
  const [selectedPresetKeys, setSelectedPresetKeys] = useState<string[]>([]);
  const [presetSearch, setPresetSearch] = useState("");

  const [siblingQuery, setSiblingQuery] = useState("");
  const [pageSize, setPageSize] = useState(8);
  const [page, setPage] = useState(1);

  const [draft, setDraft] = useState<DraftState>(EMPTY_DRAFT);
  const [isEditing, setIsEditing] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const createInputRef = useRef<HTMLInputElement | null>(null);

  const active = useMemo<CategoryRow | null>(() => {
    return rows.find((item) => item.id === activeId) ?? null;
  }, [rows, activeId]);

  const debouncedGlobalQuery = useDebouncedValue(globalQuery, 250);
  const debouncedSiblingQuery = useDebouncedValue(siblingQuery, 250);
  const debouncedPresetSearch = useDebouncedValue(presetSearch, 200);

  useEffect(() => {
    hydrateFromStorage();
    loadSites();
  }, [hydrateFromStorage, loadSites]);

  useEffect(() => {
    initSite();
  }, [initSite]);

  useEffect(() => {
    if (selectedSiteId && selectedSiteId !== siteId) {
      useCategoriesStore.setState({ siteId: selectedSiteId });
    }
  }, [selectedSiteId, siteId]);

  useEffect(() => {
    if (!siteLoading && siteId) {
      void loadTree(siteId);
    }
  }, [siteLoading, siteId, loadTree]);

  useEffect(() => {
    setDraft(toDraft(active));
    setIsEditing(false);
  }, [active]);

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

  const filteredPresetOptions = useMemo<EcommercePreset[]>(() => {
    const query = debouncedPresetSearch.trim().toLowerCase();
    if (!query) return presetOptions;

    return presetOptions.filter((preset) => {
      const rootNames = preset.categories
        .map((item) => item.name)
        .join(" ")
        .toLowerCase();
      const childNames = preset.categories
        .flatMap((item) => item.children ?? [])
        .join(" ")
        .toLowerCase();

      return `${preset.label} ${rootNames} ${childNames}`.includes(query);
    });
  }, [debouncedPresetSearch, presetOptions]);

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

  const ensureSiteId = useCallback((): string | null => {
    if (!siteId) {
      modal.error(_MESSAGES.missingSiteTitle, _MESSAGES.missingSiteDescription);
      return null;
    }
    return siteId;
  }, [siteId, modal]);

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

  const openPresetModal = useCallback((): void => {
    setPresetOpen(true);
    setPresetSearch("");
    setSelectedPresetKeys([]);
    setWebsiteType(websiteTypeOptions[0]?.value ?? "ecommerce");
  }, [websiteTypeOptions]);

  const closePresetModal = useCallback((): void => {
    setPresetOpen(false);
    setPresetSearch("");
    setSelectedPresetKeys([]);
    setWebsiteType(websiteTypeOptions[0]?.value ?? "ecommerce");
  }, [websiteTypeOptions]);

  const togglePresetKey = useCallback((key: string): void => {
    setSelectedPresetKeys((prev) => (prev.includes(key) ? prev.filter((item) => item !== key) : [...prev, key]));
  }, []);

  const selectAllFilteredPresets = useCallback((): void => {
    setSelectedPresetKeys((prev) => {
      const next = new Set(prev);
      filteredPresetOptions.forEach((item) => next.add(item.key));
      return Array.from(next);
    });
  }, [filteredPresetOptions]);

  const clearSelectedPresets = useCallback((): void => {
    setSelectedPresetKeys([]);
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

  const createPresetCategories = useCallback(async (): Promise<void> => {
    const currentSiteId = ensureSiteId();
    if (!currentSiteId) return;

    if (websiteType !== "ecommerce") {
      modal.error("Thông báo", "Hiện tại chỉ hỗ trợ khởi tạo tự động cho website ecommerce.");
      return;
    }

    if (selectedPresetKeys.length === 0) {
      modal.error("Validation", "Vui lòng chọn ít nhất 1 ngành hàng.");
      return;
    }

    const existingSlugSet = new Set(rows.map((row) => `${row.parentId ?? "root"}::${row.slug}`));

    try {
      let rootSortOrderBase = Math.max(0, ...rows.filter((row) => !row.parentId).map((row) => row.sortOrder || 0));

      for (const presetKey of selectedPresetKeys) {
        const preset = presetOptions.find((item) => item.key === presetKey);
        if (!preset) continue;

        for (const rootCategory of preset.categories) {
          const rootSlug = slugify(rootCategory.name);
          const rootFingerprint = `root::${rootSlug}`;

          if (existingSlugSet.has(rootFingerprint)) {
            continue;
          }

          rootSortOrderBase += 10;
          const createdParent = await createOne(null, rootCategory.name);

          await patchOne(createdParent.id, {
            slug: rootSlug,
            sortOrder: rootSortOrderBase,
          });

          existingSlugSet.add(rootFingerprint);

          let childSortOrder = 0;

          for (const childName of rootCategory.children ?? []) {
            const childSlug = slugify(childName);
            const childFingerprint = `${createdParent.id}::${childSlug}`;

            if (existingSlugSet.has(childFingerprint)) {
              continue;
            }

            childSortOrder += 10;
            const createdChild = await createOne(createdParent.id, childName);

            await patchOne(createdChild.id, {
              slug: childSlug,
              sortOrder: childSortOrder,
            });

            existingSlugSet.add(childFingerprint);
          }
        }
      }

      await loadTree(currentSiteId);
      closePresetModal();
      modal.success("Thành công", "Đã tạo categories tự động theo ngành hàng đã chọn.");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Không thể khởi tạo categories mẫu.";
      modal.error("Khởi tạo thất bại", message);
    }
  }, [
    ensureSiteId,
    websiteType,
    selectedPresetKeys,
    rows,
    presetOptions,
    createOne,
    patchOne,
    loadTree,
    closePresetModal,
    modal,
  ]);

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

  const handleEnterEditMode = useCallback((): void => {
    if (!active) return;
    setIsEditing(true);
  }, [active]);

  const handleAutoSlug = useCallback((): void => {
    if (!active) return;
    setIsEditing(true);
    setDraft((prev) => ({ ...prev, slug: slugify(prev.name) }));
  }, [active]);

  const handleAddSibling = useCallback((): void => {
    openCreate(active?.parentId ?? null);
  }, [active, openCreate]);

  const handleCreateChild = useCallback((): void => {
    if (!active) return;
    openCreate(active.id);
  }, [active, openCreate]);

  const handleSave = useCallback(async (): Promise<void> => {
    if (!active) return;

    const currentSiteId = ensureSiteId();
    if (!currentSiteId) return;

    const nextName = draft.name.trim();
    const nextSlug = slugify(draft.slug);
    const nextParentId = draft.parentId || null;
    const nextSortOrder = Number.isFinite(draft.sortOrder) ? Math.trunc(draft.sortOrder) : 0;

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
  }, [active, ensureSiteId, draft, modal, patchOne, loadTree]);

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

  const functionKeyActions = useMemo(
    () => ({
      F3: handleDelete,
      F5: handleAddSibling,
      F6: handleEnterEditMode,
      F8: openPresetModal,
      F9: handleAutoSlug,
      F10: () => {
        void handleSave();
      },
    }),
    [handleDelete, handleAddSibling, handleEnterEditMode, openPresetModal, handleAutoSlug, handleSave],
  );

  usePageFunctionKeys(functionKeyActions);

  const toggleExpand = useCallback((id: string): void => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const fromIndex = filteredSiblings.length === 0 ? 0 : (page - 1) * pageSize + 1;
  const toIndex = Math.min(page * pageSize, filteredSiblings.length);

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
              tree.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  depth={0}
                  activeId={activeId}
                  filteredIds={filteredIds}
                  expanded={expanded}
                  onToggle={toggleExpand}
                  onSelect={setActiveId}
                />
              ))
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
                        fontWeight: 500,
                        cursor: sitesLoading ? "not-allowed" : "pointer",
                        maxWidth: 240,
                        fontSize: "13px",
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

                <div
                  className={styles.panelHeaderActions}
                  style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}
                >
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
                    onClick={openPresetModal}
                    disabled={busy || siteLoading || !siteId}
                    title="Khởi tạo danh mục theo mô hình ecommerce"
                  >
                    <i className="bi bi-shop" /> Khởi tạo ecommerce
                  </button>

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
                    className={cx(styles.ghostBtn, styles.pagerBtn)}
                    type="button"
                    onClick={() => setPage(1)}
                    disabled={page <= 1 || filteredSiblings.length === 0}
                  >
                    « First
                  </button>

                  <button
                    className={cx(styles.ghostBtn, styles.pagerBtn)}
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
                    className={cx(styles.ghostBtn, styles.pagerBtn)}
                    type="button"
                    onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
                    disabled={page >= pageCount || filteredSiblings.length === 0}
                  >
                    {_MESSAGES.next} <i className="bi bi-chevron-right" />
                  </button>

                  <button
                    className={cx(styles.ghostBtn, styles.pagerBtn)}
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
                  pagedSiblings.map((category) => (
                    <CategoryListItem
                      key={category.id}
                      category={category}
                      isActive={category.id === activeId}
                      busy={busy}
                      onSelect={setActiveId}
                      onDelete={handleDeleteById}
                      onDragStart={onDragStart}
                      onDrop={(id) => {
                        void onDrop(id);
                      }}
                    />
                  ))
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
                        <h3 className={styles.headTitle}>{draft.name || active.name}</h3>

                        <div className={styles.headMeta}>
                          <span className={styles.badge}>
                            <i className="bi bi-link-45deg" />/{draft.slug || active.slug}
                          </span>

                          <span className={styles.badge}>
                            <i className="bi bi-sort-numeric-down" />
                            {_MESSAGES.sortOrderText(draft.sortOrder)}
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
                              value={draft.name}
                              onChange={(event) => setDraft((prev) => ({ ...prev, name: event.target.value }))}
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
                                value={draft.slug}
                                onChange={(event) => setDraft((prev) => ({ ...prev, slug: event.target.value }))}
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
                              value={draft.parentId}
                              onChange={(event) => setDraft((prev) => ({ ...prev, parentId: event.target.value }))}
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
                              value={draft.sortOrder}
                              onChange={(event) => {
                                const nextValue = Number(event.target.value);
                                setDraft((prev) => ({
                                  ...prev,
                                  sortOrder: Number.isFinite(nextValue) ? Math.trunc(nextValue) : 0,
                                }));
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

      {presetOpen && (
        <div
          className={styles.modalOverlay}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePresetModal();
          }}
          onKeyDown={(event) => {
            if (event.key === "Escape") closePresetModal();
          }}
        >
          <div
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            style={{ width: "min(760px, calc(100vw - 32px))" }}
          >
            <div className={styles.modalHeader}>
              <div className={styles.modalTitle}>Khởi tạo danh mục ecommerce</div>
              <button className={styles.iconBtn} type="button" onClick={closePresetModal} disabled={busy}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.formSection} style={{ paddingTop: 0 }}>
                <div className={styles.sectionTitle}>Loại website</div>
                <div className={styles.selectWrap}>
                  <i className="bi bi-globe2" />
                  <select
                    className={styles.selectItem}
                    value={websiteType}
                    onChange={(event) => setWebsiteType(event.target.value)}
                    disabled={busy}
                  >
                    {websiteTypeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {websiteType === "ecommerce" ? (
                <>
                  <div className={styles.formSection}>
                    <div className={styles.sectionTitle}>Ngành hàng muốn bán</div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <div className={styles.searchWrapTop} style={{ minWidth: "56%", marginBottom: 12 }}>
                        <i className="bi bi-search" />
                        <input
                          className={styles.searchTop}
                          placeholder="Tìm ngành hàng, category con..."
                          value={presetSearch}
                          onChange={(event) => setPresetSearch(event.target.value)}
                          disabled={busy}
                        />
                        {presetSearch.trim() && (
                          <button
                            className={styles.clearBtn}
                            type="button"
                            onClick={() => setPresetSearch("")}
                            aria-label="Clear preset search"
                          >
                            <i className="bi bi-x-lg" />
                          </button>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 8, marginBottom: 12, flexWrap: "wrap" }}>
                        <button
                          className={styles.ghostBtn}
                          type="button"
                          onClick={selectAllFilteredPresets}
                          disabled={busy || filteredPresetOptions.length === 0}
                        >
                          <i className="bi bi-check2-square" /> Chọn tất cả đang lọc
                        </button>
                        <button
                          className={styles.ghostBtn}
                          type="button"
                          onClick={clearSelectedPresets}
                          disabled={busy || selectedPresetKeys.length === 0}
                        >
                          <i className="bi bi-eraser" /> Bỏ chọn
                        </button>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
                      {filteredPresetOptions.length === 0 ? (
                        <div className={styles.empty} style={{ gridColumn: "1 / -1" }}>
                          Không tìm thấy nhóm ngành phù hợp.
                        </div>
                      ) : (
                        filteredPresetOptions.map((preset) => {
                          const checked = selectedPresetKeys.includes(preset.key);
                          return (
                            <label
                              key={preset.key}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: 8,
                                border: checked
                                  ? "1px solid var(--primary, #2563eb)"
                                  : "1px solid var(--line, #dae7fb)",
                                borderRadius: 12,
                                padding: 12,
                                cursor: "pointer",
                                background: checked ? "rgba(37,99,235,0.04)" : "transparent",
                              }}
                            >
                              <span
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 10,
                                  fontWeight: 500,
                                  fontSize: "14px",
                                }}
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => togglePresetKey(preset.key)}
                                  disabled={busy}
                                />
                                {preset.label}
                              </span>

                              <span style={{ fontSize: 12, opacity: 0.78, lineHeight: 1.5 }}>
                                {preset.categories
                                  .slice(0, 4)
                                  .map((item) => item.name)
                                  .join(", ")}
                                {preset.categories.length > 4 ? "..." : ""}
                              </span>
                            </label>
                          );
                        })
                      )}
                    </div>
                  </div>

                  <div className={styles.tipInline}>
                    <i className="bi bi-lightbulb" />
                    <span className={styles.mono}>
                      Đã chọn {selectedPresetKeys.length} nhóm ngành. Khi xác nhận, hệ thống sẽ tự tạo category cha và
                      category con tương ứng.
                    </span>
                  </div>
                </>
              ) : (
                <div className={styles.emptyInspector}>
                  <i className="bi bi-info-circle" />
                  <div>
                    <div className={styles.emptyTitle}>Chưa hỗ trợ loại website này</div>
                    <div className={styles.emptyText}>Hiện modal này đang xử lý tự động cho mô hình ecommerce.</div>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.modalActions}>
              <button className={styles.ghostBtn} type="button" onClick={closePresetModal} disabled={busy}>
                {_MESSAGES.cancel}
              </button>
              <button
                className={styles.primaryBtn}
                type="button"
                onClick={() => void createPresetCategories()}
                disabled={busy || websiteType !== "ecommerce" || selectedPresetKeys.length === 0}
              >
                <i className="bi bi-magic" /> Tạo categories tự động
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
