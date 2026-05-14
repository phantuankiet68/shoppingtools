"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/categories/categories.module.css";
import { useAdminAuth } from "@/components/admin/providers/AdminAuthProvider";
import CategoryAutomationModal from "@/components/admin/categories/CategoryAutomationModal";
import {
  ECOMMERCE_CATEGORY_PRESETS,
  LANDING_PAGE_PRESETS,
  type EcommercePresetKey,
  type LandingPagePresetKey,
} from "@/constants/categories";
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";
import { useModal } from "@/components/admin/shared/common/modal";

type PresetKey = EcommercePresetKey | LandingPagePresetKey;

type WebsiteType = "ecommerce" | "landing-page" | "other";

type Category = {
  id: string;
  siteId: string;
  parentId: string | null;
  name: string;
  slug: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  count?: number;
};

type TreeNode = Category & {
  children: TreeNode[];
};

type CategoryRowProps = {
  node: TreeNode;
  rows: Category[];
  level: number;
  expanded: Record<string, boolean>;
  toggleExpand: (id: string) => void;
  reload: () => Promise<void>;
  maxCategories: number;
};

const CHILD_PER_PAGE = 3;

const createSlug = (value: string) => {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\p{L}\p{N}-]/gu, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};

function buildTree(rows: Category[] = []): TreeNode[] {
  const map = new Map<string, TreeNode>();

  rows.forEach((row) => {
    map.set(row.id, {
      ...row,
      children: [],
    });
  });

  const roots: TreeNode[] = [];

  map.forEach((node) => {
    if (node.parentId && map.has(node.parentId)) {
      map.get(node.parentId)?.children.push(node);
    } else {
      roots.push(node);
    }
  });

  const sortRecursive = (items: TreeNode[]) => {
    items.sort((a, b) => a.sortOrder - b.sortOrder);

    items.forEach((item) => {
      if (item.children.length > 0) {
        sortRecursive(item.children);
      }
    });
  };

  sortRecursive(roots);

  return roots;
}

export default function CategoriesPage() {
  const { currentSite, sites, currentWorkspace } = useAdminAuth();
  const { t } = useAdminI18n();
  const modal = useModal();

  const [rows, setRows] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [sortBy, setSortBy] = useState("name");
  const [filterType, setFilterType] = useState("all");

  const [selectedSiteId, setSelectedSiteId] = useState(currentSite?.id ?? "");

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createParentId, setCreateParentId] = useState("");
  const [creating, setCreating] = useState(false);

  const [openPresetModal, setOpenPresetModal] = useState(false);
  const [creatingPreset, setCreatingPreset] = useState(false);

  const maxCategories = currentWorkspace?.accessPolicy?.maxCategories ?? 0;

  const isCategoryLimitReached = rows.length >= maxCategories;

  useEffect(() => {
    if (currentSite?.id) {
      setSelectedSiteId(currentSite.id);
    }
  }, [currentSite?.id]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setSearch(searchInput.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [searchInput]);

  const loadCategories = useCallback(
    async (signal?: AbortSignal) => {
      if (!selectedSiteId) {
        setRows([]);
        return;
      }

      try {
        setLoading(true);

        const response = await fetch(`/api/admin/categories?tree=1&sort=sortasc&siteId=${selectedSiteId}`, {
          signal,
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load categories");
        }

        const data = await response.json();

        setRows(Array.isArray(data.items) ? data.items : []);
      } catch (error) {
        if ((error as Error)?.name !== "AbortError") {
          console.error(error);

          modal.error(t("common.error"), t("categories.messages.loadError"));
        }
      } finally {
        setLoading(false);
      }
    },
    [modal, selectedSiteId, t],
  );

  useEffect(() => {
    const controller = new AbortController();

    void loadCategories(controller.signal);

    return () => {
      controller.abort();
    };
  }, [loadCategories]);

  const filteredRows = useMemo(() => {
    const keyword = search.toLowerCase();

    let result = [...rows];

    if (keyword) {
      result = result.filter(
        (row) => row.name.toLowerCase().includes(keyword) || row.slug.toLowerCase().includes(keyword),
      );
    }

    switch (filterType) {
      case "root":
        result = result.filter((row) => !row.parentId);
        break;

      case "children":
        result = result.filter((row) => rows.some((item) => item.parentId === row.id));
        break;

      case "empty":
        result = result.filter((row) => Number(row.count ?? 0) === 0);
        break;

      default:
        break;
    }

    switch (sortBy) {
      case "name":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case "newest":
        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;

      case "updated":
        result.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;

      case "products":
        result.sort((a, b) => Number(b.count ?? 0) - Number(a.count ?? 0));
        break;

      default:
        break;
    }

    return result;
  }, [filterType, rows, search, sortBy]);

  const tree = useMemo(() => buildTree(filteredRows), [filteredRows]);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  const handleCreateCategory = async () => {
    if (!selectedSiteId) {
      modal.error(t("common.error"), t("categories.messages.selectSite"));
      return;
    }

    if (rows.length >= maxCategories) {
      modal.error(t("common.error"), `${t("categories.messages.maxCategoriesReached")} (${maxCategories})`);

      return;
    }
    if (!createName.trim()) {
      modal.error(t("common.error"), t("categories.messages.enterName"));
      return;
    }

    try {
      setCreating(true);

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteId: selectedSiteId,
          name: createName.trim(),
          slug: createSlug(createName),
          parentId: createParentId || null,
          sortOrder: rows.length * 10 + 10,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Create category failed");
      }

      modal.success(t("common.success"), t("categories.messages.createSuccess"));

      setOpenCreateModal(false);
      setCreateName("");
      setCreateParentId("");

      await loadCategories();
    } catch (error) {
      console.error(error);

      modal.error(t("common.error"), (error as Error).message || t("categories.messages.createError"));
    } finally {
      setCreating(false);
    }
  };

  const createPresetCategories = async (websiteType: WebsiteType, selectedKeys: PresetKey[]) => {
    if (!selectedSiteId) {
      modal.error(t("common.error"), t("categories.messages.selectSite"));
      return;
    }

    try {
      setCreatingPreset(true);

      const presets = websiteType === "landing-page" ? LANDING_PAGE_PRESETS : ECOMMERCE_CATEGORY_PRESETS;

      const selectedPresets = presets.filter((preset) => selectedKeys.includes(preset.key));

      const preparedCategories: {
        tempId?: string;
        parentTempId?: string;
        name: string;
        slug: string;
        sortOrder: number;
      }[] = [];

      let sortOrder = 10;

      selectedPresets.forEach((preset) => {
        preset.categories.forEach((category) => {
          const parentTempId = crypto.randomUUID();
          const parentName = t(category.name);

          preparedCategories.push({
            tempId: parentTempId,
            name: parentName,
            slug: createSlug(parentName),
            sortOrder,
          });

          sortOrder += 10;

          category.children?.forEach((child) => {
            const childName = t(child);

            preparedCategories.push({
              parentTempId,
              name: childName,
              slug: createSlug(childName),
              sortOrder,
            });

            sortOrder += 10;
          });
        });
      });

      const totalAfterCreate = rows.length + preparedCategories.length;

      if (totalAfterCreate > maxCategories) {
        modal.error(t("common.error"), `${t("categories.messages.maxCategoriesExceeded")} (${maxCategories})`);

        return;
      }

      const response = await fetch("/api/admin/categories/bulk-create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteId: selectedSiteId,
          categories: preparedCategories,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Bulk create failed");
      }

      modal.success(t("common.success"), t("categories.messages.automationSuccess"));

      setOpenPresetModal(false);

      await loadCategories();
    } catch (error) {
      console.error(error);

      modal.error(t("common.error"), (error as Error).message || t("categories.messages.automationError"));
    } finally {
      setCreatingPreset(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <div className={styles.siteSelect}>
            <i className="bi bi-globe2" />

            <select value={selectedSiteId} onChange={(e) => setSelectedSiteId(e.target.value)}>
              {sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.searchBox}>
            <i className="bi bi-search" />

            <input
              placeholder={t("categories.searchPlaceholder")}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />

            {searchInput && (
              <button
                type="button"
                className={styles.clearSearchBtn}
                onClick={() => {
                  setSearch("");
                  setSearchInput("");
                }}
              >
                <i className="bi bi-x-lg" />
              </button>
            )}
          </div>

          <div className={styles.filterSelect}>
            <i className="bi bi-funnel" />

            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">{t("categories.filters.all")}</option>
              <option value="root">{t("categories.filters.root")}</option>
              <option value="children">{t("categories.filters.children")}</option>
              <option value="empty">{t("categories.filters.empty")}</option>
            </select>
          </div>

          <div className={styles.filterSelect}>
            <i className="bi bi-sort-down" />

            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="name">{t("categories.sort.az")}</option>
              <option value="newest">{t("categories.sort.newest")}</option>
              <option value="updated">{t("categories.sort.updated")}</option>
              <option value="products">{t("categories.sort.products")}</option>
            </select>
          </div>
        </div>

        <div className={styles.toolbarActions}>
          <div
            className={styles.counterBadge}
            style={{
              background: filteredRows.length >= maxCategories ? "rgba(239, 68, 68, 0.15)" : undefined,
              border: filteredRows.length >= maxCategories ? "1px solid rgba(239, 68, 68, 0.4)" : undefined,
              color: filteredRows.length >= maxCategories ? "#ef4444" : undefined,
            }}
          >
            <i className="bi bi-folder2-open" />
            {filteredRows.length} / {maxCategories} {t("categories.total")}
          </div>

          <button
            className={styles.secondaryBtn}
            onClick={() => setOpenPresetModal(true)}
            disabled={isCategoryLimitReached}
          >
            <i className="bi bi-magic" />
            {t("categories.automation")}
          </button>

          <button
            className={styles.primaryBtn}
            onClick={() => setOpenCreateModal(true)}
            disabled={isCategoryLimitReached}
          >
            <i className="bi bi-plus-lg" />
            {t("categories.addCategory")}
          </button>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <div className={styles.tableHeader}>
          <div className="d-flex center">✅</div>
          <div>{t("categories.table.category")}</div>
          <div>{t("categories.table.slug")}</div>
          <div>{t("categories.table.parent")}</div>
          <div>{t("categories.table.products")}</div>
          <div>{t("categories.table.sort")}</div>
          <div>{t("categories.table.updated")}</div>
          <div className="d-flex center">{t("categories.table.actions")}</div>
        </div>

        {loading ? (
          <div className={styles.loading}>{t("categories.loading")}</div>
        ) : (
          <div className={styles.tableBody}>
            {tree.map((node) => (
              <CategoryRow
                key={node.id}
                node={node}
                rows={rows}
                level={0}
                expanded={expanded}
                toggleExpand={toggleExpand}
                reload={loadCategories}
                maxCategories={maxCategories}
              />
            ))}
          </div>
        )}
      </div>

      {openCreateModal && (
        <div className={styles.modalOverlay} onClick={() => setOpenCreateModal(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3>{t("categories.createTitle")}</h3>

              <button className={styles.closeBtn} onClick={() => setOpenCreateModal(false)}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label>{t("categories.fields.name")}</label>

                <input
                  placeholder={t("categories.placeholders.name")}
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label>{t("categories.fields.parent")}</label>

                <select value={createParentId} onChange={(e) => setCreateParentId(e.target.value)}>
                  <option value="">{t("categories.root")}</option>

                  {rows.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={() => setOpenCreateModal(false)}>
                {t("common.cancel")}
              </button>

              <button className={styles.primaryBtn} onClick={handleCreateCategory} disabled={creating}>
                <i className="bi bi-plus-lg" />
                {creating ? t("common.creating") : t("categories.createCategory")}
              </button>
            </div>
          </div>
        </div>
      )}

      <CategoryAutomationModal
        open={openPresetModal}
        loading={creatingPreset}
        onClose={() => setOpenPresetModal(false)}
        onSubmit={createPresetCategories}
      />
    </div>
  );
}

function CategoryRow({ node, rows, level, expanded, toggleExpand, reload, maxCategories }: CategoryRowProps) {
  const { t } = useAdminI18n();
  const modal = useModal();

  const [selectedCategoryId, setSelectedCategoryId] = useState(node.id);
  const [name, setName] = useState(node.name);
  const [slug, setSlug] = useState(node.slug);
  const [sortOrder, setSortOrder] = useState(node.sortOrder);
  const [childPage, setChildPage] = useState(1);
  const [saving, setSaving] = useState(false);

  const isExpanded = expanded[node.id] ?? false;

  const selectedCategory = useMemo(() => {
    return rows.find((item) => item.id === selectedCategoryId) ?? node;
  }, [node, rows, selectedCategoryId]);

  useEffect(() => {
    setName(selectedCategory.name);
    setSlug(selectedCategory.slug);
    setSortOrder(selectedCategory.sortOrder ?? 0);
  }, [selectedCategory]);

  const parentNameMap = useMemo(() => {
    return new Map(rows.map((row) => [row.id, row.name]));
  }, [rows]);

  const paginatedChildren = useMemo(() => {
    const start = (childPage - 1) * CHILD_PER_PAGE;

    return node.children.slice(start, start + CHILD_PER_PAGE);
  }, [childPage, node.children]);

  const totalChildPages = useMemo(() => {
    return Math.ceil(node.children.length / CHILD_PER_PAGE);
  }, [node.children.length]);

  const handleSave = async () => {
    if (!selectedCategory?.id || saving) {
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`/api/admin/categories/${selectedCategory.id}?siteId=${selectedCategory.siteId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          slug: slug.trim(),
          sortOrder: Number(sortOrder),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Update failed");
      }

      modal.success(t("common.success"), t("categories.messages.updateSuccess"));

      await reload();
    } catch (error) {
      console.error(error);

      modal.error(t("common.error"), (error as Error).message || t("categories.messages.updateError"));
    } finally {
      setSaving(false);
    }
  };

  const removeCategory = async (id: string) => {
    try {
      setSaving(true);

      const response = await fetch(`/api/admin/categories/${id}?siteId=${selectedCategory.siteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();

        throw new Error(errorData.error || "Delete failed");
      }

      modal.success(t("common.success"), t("categories.messages.deleteSuccess"));

      await reload();
    } catch (error) {
      console.error(error);

      modal.error(t("common.error"), (error as Error).message || t("categories.messages.deleteError"));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    if (!selectedCategory?.id) {
      return;
    }

    modal.confirmDelete(t("categories.messages.deleteTitle"), `${t("categories.messages.deleteDescription")}`, () =>
      removeCategory(selectedCategory.id),
    );
  };

  const handleAddChild = async () => {
    if (saving) {
      return;
    }

    if (rows.length >= maxCategories) {
      modal.error(t("common.error"), `${t("categories.messages.maxCategoriesReached")} (${maxCategories})`);

      return;
    }

    try {
      setSaving(true);

      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          siteId: node.siteId,
          name: t("categories.newChild"),
          slug: `new-child-${Date.now()}`,
          parentId: node.id,
          sortOrder: node.children.length * 10 + 10,
        }),
      });

      if (!response.ok) {
        throw new Error("Create child failed");
      }

      modal.success(t("common.success"), t("categories.messages.childCreated"));

      await reload();
    } catch (error) {
      console.error(error);

      modal.error(t("common.error"), t("categories.messages.childError"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className={styles.row}>
        <div className={styles.checkboxCell}>
          <input type="checkbox" checked={isExpanded} onChange={() => toggleExpand(node.id)} />
        </div>

        <div
          className={styles.categoryCell}
          style={{
            paddingLeft: `${16 + level * 22}px`,
          }}
        >
          <div className={styles.categoryWrap}>
            {node.children.length > 0 && (
              <button className={styles.expandBtn} onClick={() => toggleExpand(node.id)}>
                <i className={`bi ${isExpanded ? "bi-chevron-down" : "bi-chevron-right"}`} />
              </button>
            )}

            <i className="bi bi-folder2" />

            <div className={styles.categoryMain}>
              <span className={styles.categoryName}>{node.name}</span>
            </div>
          </div>
        </div>

        <div className={styles.parentCell}>
          <span className={styles.categorySlug}>/{node.slug}</span>
        </div>

        <div className={styles.parentCell}>
          {node.parentId ? (parentNameMap.get(node.parentId) ?? "-") : t("categories.root")}
        </div>

        <div className={styles.productCell}>{node.count || 0}</div>
        <div className={styles.sortCell}>{node.sortOrder}</div>

        <div className={styles.updatedCell}>{new Date(node.updatedAt).toLocaleDateString("vi-VN")}</div>

        <div className={styles.actionCell}>
          <button className={styles.editBtn} onClick={() => setSelectedCategoryId(node.id)}>
            <i className="bi bi-pencil-square" />
          </button>

          <button className={styles.deleteBtn} onClick={handleDelete}>
            <i className="bi bi-trash3" />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className={styles.expanded}>
          <div className={styles.expandedGrid}>
            <div className={styles.childrenBox}>
              <div className={styles.childrenHeader}>
                <h4>{t("categories.childCategories")}</h4>

                <button
                  className={styles.smallPrimaryBtn}
                  onClick={handleAddChild}
                  disabled={rows.length >= maxCategories}
                >
                  <i className="bi bi-plus-lg" />
                  {t("categories.addChild")}
                </button>
              </div>

              <div className={styles.childList}>
                {paginatedChildren.map((child) => (
                  <div
                    key={child.id}
                    className={`${styles.childItem} ${selectedCategoryId === child.id ? styles.activeChild : ""}`}
                    onClick={() => setSelectedCategoryId(child.id)}
                  >
                    <div className={styles.childMain}>
                      <span className={styles.childName}>{child.name}</span>
                      <span className={styles.childSlug}>/{child.slug}</span>
                    </div>

                    <div className={styles.countBadge}>{child.count || 0}</div>
                  </div>
                ))}
              </div>

              {totalChildPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    className={styles.pageBtn}
                    disabled={childPage === 1}
                    onClick={() => setChildPage((prev) => prev - 1)}
                  >
                    <i className="bi bi-chevron-left" />
                  </button>

                  {Array.from({ length: totalChildPages }).map((_, index) => {
                    const page = index + 1;

                    return (
                      <button
                        key={page}
                        className={`${styles.pageBtn} ${childPage === page ? styles.activePageBtn : ""}`}
                        onClick={() => setChildPage(page)}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    className={styles.pageBtn}
                    disabled={childPage === totalChildPages}
                    onClick={() => setChildPage((prev) => prev + 1)}
                  >
                    <i className="bi bi-chevron-right" />
                  </button>
                </div>
              )}
            </div>

            <div className={styles.formBox}>
              <div className={styles.formHeader}>
                <div className={styles.editingHeader}>
                  <div className={styles.editingIcon}>
                    <i className="bi bi-folder2-open" />
                  </div>

                  <div>
                    <h3>{name}</h3>
                    <span>/{slug}</span>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button className={styles.secondaryBtn} onClick={() => setSlug(createSlug(name))}>
                    <i className="bi bi-magic" />
                    {t("categories.autoSlug")}
                  </button>

                  <button className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
                    <i className="bi bi-save" />
                    {saving ? t("common.saving") : t("common.save")}
                  </button>

                  <button className={styles.dangerBtn} onClick={handleDelete} disabled={saving}>
                    <i className="bi bi-trash" />
                    {t("common.delete")}
                  </button>
                </div>
              </div>

              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label>{t("categories.fields.name")}</label>
                  <input value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                <div className={styles.field}>
                  <label>{t("categories.fields.slug")}</label>
                  <input value={slug} onChange={(e) => setSlug(e.target.value)} />
                </div>

                <div className={styles.field}>
                  <label>{t("categories.fields.sortOrder")}</label>

                  <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
