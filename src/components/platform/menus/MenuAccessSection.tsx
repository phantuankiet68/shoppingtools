"use client";

import type { CSSProperties, FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ModalAddMenus,
  type MenuArea,
  type ParentOption,
  type SiteOption,
} from "@/components/platform/menus/modalAddMenus";
import styles from "@/styles/platform/MenuAccessSection.module.css";

type SystemRole = "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";
type FilterMode = "all" | "enabled" | "disabled";
type AreaFilter = "ALL" | MenuArea;
type SortKey = "title" | "path" | "area" | "visible" | "permission";
type SortDirection = "asc" | "desc";

type MenuPermission = {
  id: string | null;
  systemRole: SystemRole;
  enabled: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type MenuRecord = {
  id: string;
  siteId: string;
  parentId: string | null;
  title: string;
  path: string | null;
  icon: string | null;
  sortOrder: number;
  visible: boolean;
  area: MenuArea;
  createdAt?: string;
  updatedAt?: string;
  permission: MenuPermission;
};

type PaginationState = {
  page: number;
  size: number;
  total: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
};

type SummaryState = {
  total: number;
  enabled: number;
  disabled: number;
  visible: number;
  hidden: number;
  root: number;
};

type PaginatedMenuResponse = {
  items: MenuRecord[];
  pagination: PaginationState;
  summary: SummaryState;
};

type SiteOptionsResponse = {
  ok?: boolean;
  data?: SiteOption[];
  message?: string;
};

export type TenantAccessProfile = {
  planName: "Basic" | "Pro" | "Enterprise";
  customDomainEnabled: boolean;
  maxCustomDomains: number;
  platformSubdomain: string;
  customDomains: { domain: string; status: "Verified" | "Pending" | "Failed" }[];
  menuAccess: { key: string; label: string; enabled: boolean }[];
};

type MenuAccessItem = TenantAccessProfile["menuAccess"][number];

type MenuAccessSectionProps = {
  items?: TenantAccessProfile["menuAccess"];
};

type EditMenuFormState = {
  title: string;
  path: string;
  icon: string;
  sortOrder: string;
  visible: boolean;
  area: MenuArea;
  siteId: string;
  parentId: string;
};

const PAGE_SIZE = 8;

const EMPTY_PAGINATION: PaginationState = {
  page: 1,
  size: PAGE_SIZE,
  total: 0,
  totalPages: 1,
  hasPreviousPage: false,
  hasNextPage: false,
};

const EMPTY_SUMMARY: SummaryState = {
  total: 0,
  enabled: 0,
  disabled: 0,
  visible: 0,
  hidden: 0,
  root: 0,
};

const AREA_OPTIONS: ReadonlyArray<{ value: AreaFilter; label: string }> = [
  { value: "ALL", label: "All areas" },
  { value: "PLATFORM", label: "Platform" },
  { value: "ADMIN", label: "Admin" },
  { value: "SITE", label: "Site" },
];

const MENU_AREA_OPTIONS: ReadonlyArray<{ value: MenuArea; label: string }> = [
  { value: "PLATFORM", label: "Platform" },
  { value: "ADMIN", label: "Admin" },
  { value: "SITE", label: "Site" },
];

function getInitials(value: string) {
  return value
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

function formatDate(value?: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function createEditForm(menu: MenuRecord): EditMenuFormState {
  return {
    title: menu.title ?? "",
    path: menu.path ?? "",
    icon: menu.icon ?? "",
    sortOrder: String(menu.sortOrder ?? 0),
    visible: menu.visible,
    area: menu.area,
    siteId: menu.siteId ?? "",
    parentId: menu.parentId ?? "",
  };
}

function getSiteLabel(site: SiteOption) {
  if ("name" in site && typeof site.name === "string" && site.name.trim()) {
    return site.name;
  }

  return site.id;
}

export function MenuAccessSection({ items = [] }: MenuAccessSectionProps) {
  const [menus, setMenus] = useState<MenuRecord[]>([]);
  const [siteOptions, setSiteOptions] = useState<SiteOption[]>([]);
  const [loadingMenus, setLoadingMenus] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [error, setError] = useState("");
  const [savingMenuId, setSavingMenuId] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [statusFilter, setStatusFilter] = useState<FilterMode>("all");
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("ALL");
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);

  const [openAddModal, setOpenAddModal] = useState(false);
  const [openEditModal, setOpenEditModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState<MenuRecord | null>(null);

  const [pagination, setPagination] = useState<PaginationState>(EMPTY_PAGINATION);
  const [summary, setSummary] = useState<SummaryState>(EMPTY_SUMMARY);

  const menuAbortRef = useRef<AbortController | null>(null);
  const siteAbortRef = useRef<AbortController | null>(null);
  const activeMenuRequestIdRef = useRef(0);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, statusFilter, areaFilter, sortKey, sortDirection]);

  const fetchMenus = useCallback(async () => {
    const requestId = ++activeMenuRequestIdRef.current;

    menuAbortRef.current?.abort();
    const controller = new AbortController();
    menuAbortRef.current = controller;

    try {
      setLoadingMenus(true);
      setError("");

      const params = new URLSearchParams({
        systemRole: "ADMIN",
        page: String(page),
        size: String(PAGE_SIZE),
        sortKey,
        sortDirection,
      });

      if (debouncedQuery) {
        params.set("q", debouncedQuery);
      }

      if (areaFilter !== "ALL") {
        params.set("area", areaFilter);
      }

      if (statusFilter !== "all") {
        params.set("enabled", statusFilter === "enabled" ? "true" : "false");
      }

      const response = await fetch(`/api/platform/menus?${params.toString()}`, {
        cache: "no-store",
        signal: controller.signal,
      });

      const contentType = response.headers.get("content-type") || "";
      const data: PaginatedMenuResponse | { message?: string } | null = contentType.includes("application/json")
        ? await response.json()
        : null;

      if (!response.ok) {
        throw new Error((data as { message?: string } | null)?.message || "Failed to load menus");
      }

      if (requestId !== activeMenuRequestIdRef.current) {
        return;
      }

      const normalized = data as PaginatedMenuResponse;

      setMenus(Array.isArray(normalized.items) ? normalized.items : []);
      setPagination(normalized.pagination ?? EMPTY_PAGINATION);
      setSummary(normalized.summary ?? EMPTY_SUMMARY);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        return;
      }

      console.error(err);

      if (requestId !== activeMenuRequestIdRef.current) {
        return;
      }

      setMenus([]);
      setPagination(EMPTY_PAGINATION);
      setSummary(EMPTY_SUMMARY);
      setError(err instanceof Error ? err.message : "Failed to load menus");
    } finally {
      if (requestId === activeMenuRequestIdRef.current) {
        setLoadingMenus(false);
      }
    }
  }, [page, debouncedQuery, statusFilter, areaFilter, sortKey, sortDirection]);

  const fetchSiteOptions = useCallback(async () => {
    siteAbortRef.current?.abort();
    const controller = new AbortController();
    siteAbortRef.current = controller;

    try {
      setLoadingSites(true);

      const response = await fetch("/api/platform/sites/options", {
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        signal: controller.signal,
      });

      const data = (await response.json().catch(() => null)) as SiteOptionsResponse | null;

      if (!response.ok) {
        throw new Error(data?.message || "Failed to load sites");
      }

      setSiteOptions(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      if ((err as Error)?.name === "AbortError") {
        return;
      }

      console.error(err);
    } finally {
      if (!controller.signal.aborted) {
        setLoadingSites(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchMenus();

    return () => {
      menuAbortRef.current?.abort();
    };
  }, [fetchMenus]);

  useEffect(() => {
    fetchSiteOptions();

    return () => {
      siteAbortRef.current?.abort();
    };
  }, [fetchSiteOptions]);

  const handleRefresh = useCallback(() => {
    void fetchMenus();
    void fetchSiteOptions();
  }, [fetchMenus, fetchSiteOptions]);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        return;
      }

      setSortKey(key);
      setSortDirection("asc");
    },
    [sortKey],
  );

  const handleToggleAdminPermission = useCallback(async (menu: MenuRecord) => {
    try {
      setSavingMenuId(menu.id);

      const response = await fetch(`/api/platform/menus/${menu.id}/role-permission`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemRole: "ADMIN",
          enabled: !menu.permission.enabled,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data:
        | {
            id: string;
            menuId: string;
            systemRole: SystemRole;
            enabled: boolean;
            createdAt?: string;
            updatedAt?: string;
          }
        | { message?: string }
        | null = contentType.includes("application/json") ? await response.json() : null;

      if (!response.ok) {
        throw new Error((data as { message?: string } | null)?.message || "Failed to update menu permission");
      }

      const updatedPermission = data as {
        id: string;
        menuId: string;
        systemRole: SystemRole;
        enabled: boolean;
        createdAt?: string;
        updatedAt?: string;
      };

      setMenus((prev) =>
        prev.map((item) =>
          item.id === menu.id
            ? {
                ...item,
                permission: {
                  id: updatedPermission.id,
                  systemRole: updatedPermission.systemRole,
                  enabled: updatedPermission.enabled,
                  createdAt: updatedPermission.createdAt,
                  updatedAt: updatedPermission.updatedAt,
                },
              }
            : item,
        ),
      );

      setSummary((prev) => {
        const wasEnabled = menu.permission.enabled;
        const isEnabled = updatedPermission.enabled;

        if (wasEnabled === isEnabled) {
          return prev;
        }

        return {
          ...prev,
          enabled: isEnabled ? prev.enabled + 1 : prev.enabled - 1,
          disabled: isEnabled ? prev.disabled - 1 : prev.disabled + 1,
        };
      });
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Failed to update menu permission");
    } finally {
      setSavingMenuId(null);
    }
  }, []);

  const handleBulkToggleByArea = useCallback(
    async (targetArea: MenuArea, enabled: boolean) => {
      try {
        setLoadingMenus(true);

        const targetMenus = menus.filter((menu) => menu.area === targetArea);

        await Promise.all(
          targetMenus.map(async (menu) => {
            const response = await fetch(`/api/platform/menus/${menu.id}/role-permission`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemRole: "ADMIN",
                enabled,
              }),
            });

            if (!response.ok) {
              const contentType = response.headers.get("content-type") || "";
              const data = contentType.includes("application/json") ? await response.json() : null;
              throw new Error(data?.message || `Failed to update ${menu.title}`);
            }
          }),
        );

        await fetchMenus();
      } catch (err) {
        console.error(err);
        window.alert(err instanceof Error ? err.message : "Bulk update failed");
      } finally {
        setLoadingMenus(false);
      }
    },
    [menus, fetchMenus],
  );

  const handleOpenEditModal = useCallback((menu: MenuRecord) => {
    setEditingMenu(menu);
    setOpenEditModal(true);
  }, []);

  const handleCloseEditModal = useCallback(() => {
    setOpenEditModal(false);
    setEditingMenu(null);
  }, []);

  const parentOptions = useMemo<ParentOption[]>(
    () =>
      menus.map((item) => ({
        id: item.id,
        title: item.title,
        path: item.path,
        area: item.area,
      })),
    [menus],
  );

  const isBusy = loadingMenus || loadingSites;

  return (
    <>
      <section className={styles.page}>
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <div className={styles.titleInline}>
              <span className={styles.kicker}>Admin Menu Access</span>
            </div>
          </div>

          <div className={styles.topbarRight}>
            <button type="button" className={styles.addButton} onClick={() => setOpenAddModal(true)}>
              <i className="bi bi-plus-lg" />
              Add menu
            </button>

            <button type="button" className={styles.refreshButton} onClick={handleRefresh} disabled={isBusy}>
              <i className="bi bi-arrow-clockwise" />
              {isBusy ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              className={styles.bulkEnableButton}
              onClick={() => handleBulkToggleByArea("PLATFORM", true)}
              disabled={loadingMenus}
            >
              <i className="bi bi-toggle-on" />
              Enable PLATFORM
            </button>

            <button
              type="button"
              className={styles.bulkDisableButton}
              onClick={() => handleBulkToggleByArea("PLATFORM", false)}
              disabled={loadingMenus}
            >
              <i className="bi bi-toggle-off" />
              Disable PLATFORM
            </button>

            <button
              type="button"
              className={styles.bulkEnableButton}
              onClick={() => handleBulkToggleByArea("ADMIN", true)}
              disabled={loadingMenus}
            >
              <i className="bi bi-toggle-on" />
              Enable ADMIN
            </button>

            <button
              type="button"
              className={styles.bulkDisableButton}
              onClick={() => handleBulkToggleByArea("ADMIN", false)}
              disabled={loadingMenus}
            >
              <i className="bi bi-toggle-off" />
              Disable ADMIN
            </button>
          </div>
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.mainPanel}>
            <div className={styles.toolbar}>
              <div className={styles.toolbarLeft}>
                <label className={styles.searchBox}>
                  <i className={`bi bi-search ${styles.searchIcon}`} />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search title, path, icon, area..."
                    className={styles.searchInput}
                  />
                </label>

                <div className={styles.areaFilter}>
                  <div className={styles.areaFilterControl}>
                    <i className={`bi bi-diagram-3 ${styles.areaFilterIcon}`} aria-hidden="true" />

                    <select
                      id="menu-area-filter"
                      value={areaFilter}
                      onChange={(event) => setAreaFilter(event.target.value as AreaFilter)}
                      className={styles.areaFilterSelect}
                      aria-label="Filter by menu area"
                    >
                      {AREA_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>

                    <i className={`bi bi-chevron-down ${styles.areaFilterChevron}`} aria-hidden="true" />
                  </div>
                </div>

                <div className={styles.segmented}>
                  <button
                    type="button"
                    className={`${styles.segmentButton} ${statusFilter === "all" ? styles.segmentButtonActive : ""}`}
                    onClick={() => setStatusFilter("all")}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    className={`${styles.segmentButton} ${statusFilter === "enabled" ? styles.segmentButtonActive : ""}`}
                    onClick={() => setStatusFilter("enabled")}
                  >
                    Enabled
                  </button>
                  <button
                    type="button"
                    className={`${styles.segmentButton} ${statusFilter === "disabled" ? styles.segmentButtonActive : ""}`}
                    onClick={() => setStatusFilter("disabled")}
                  >
                    Disabled
                  </button>
                </div>
              </div>

              <div className={styles.toolbarRight}>
                <span className={styles.resultCount}>{pagination.total} result(s)</span>
              </div>
            </div>

            <div className={styles.tableCard}>
              <div className={styles.tableHead}>
                <button type="button" onClick={() => handleSort("title")} className={styles.th}>
                  Menu
                  <SortIcon active={sortKey === "title"} direction={sortDirection} />
                </button>

                <button type="button" onClick={() => handleSort("path")} className={styles.th}>
                  Path
                  <SortIcon active={sortKey === "path"} direction={sortDirection} />
                </button>

                <button type="button" onClick={() => handleSort("area")} className={styles.th}>
                  Area
                  <SortIcon active={sortKey === "area"} direction={sortDirection} />
                </button>

                <button type="button" onClick={() => handleSort("visible")} className={styles.th}>
                  Visibility
                  <SortIcon active={sortKey === "visible"} direction={sortDirection} />
                </button>

                <button type="button" onClick={() => handleSort("permission")} className={styles.th}>
                  Admin
                  <SortIcon active={sortKey === "permission"} direction={sortDirection} />
                </button>

                <span>Action</span>
              </div>

              {loadingMenus ? (
                <div className={styles.stateRow}>
                  <div className={styles.spinner} />
                  <div>
                    <h3>Loading menu access</h3>
                    <p>Fetching the latest permission registry.</p>
                  </div>
                </div>
              ) : error ? (
                <div className={`${styles.stateRow} ${styles.stateRowError}`}>
                  <div className={styles.stateIcon}>!</div>
                  <div>
                    <h3>Unable to load menus</h3>
                    <p>{error}</p>
                  </div>
                </div>
              ) : menus.length === 0 ? (
                <div className={styles.stateRow}>
                  <div className={styles.stateIcon}>⌕</div>
                  <div>
                    <h3>No menus found</h3>
                    <p>Adjust the search keyword or filters to see more results.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className={styles.tableBody}>
                    {menus.map((menu) => {
                      const isSaving = savingMenuId === menu.id;
                      const permissionEnabled = menu.permission.enabled;

                      return (
                        <div key={menu.id} className={styles.tableRow}>
                          <div className={styles.menuCell}>
                            <div className={styles.avatar}>{getInitials(menu.title || "M")}</div>
                            <div className={styles.menuMeta}>
                              <strong className={styles.menuTitle}>{menu.title}</strong>
                              <div className={styles.menuSubline}>
                                <span>{menu.parentId ? "Child menu" : "Root menu"}</span>
                                <span className={styles.dot} />
                                <span>#{menu.sortOrder}</span>
                                <span className={styles.dot} />
                                <span>{formatDate(menu.updatedAt)}</span>
                              </div>
                            </div>
                          </div>

                          <div className={styles.pathCell}>{menu.path || "—"}</div>

                          <div className={styles.centerCell}>
                            <span className={styles.badge}>{menu.area}</span>
                          </div>

                          <div className={styles.centerCell}>
                            <span
                              className={`${styles.badge} ${menu.visible ? styles.badgeSuccessSoft : styles.badgeNeutralSoft}`}
                            >
                              {menu.visible ? "Visible" : "Hidden"}
                            </span>
                          </div>

                          <div className={styles.centerCell}>
                            <span
                              className={`${styles.badge} ${
                                permissionEnabled ? styles.badgeSuccessSoft : styles.badgeDangerSoft
                              }`}
                            >
                              {permissionEnabled ? "Enabled" : "Disabled"}
                            </span>
                          </div>

                          <div className={styles.actionCell}>
                            <div style={actionGroupStyle}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(menu)}
                                aria-label={`Edit ${menu.title}`}
                                title={`Edit ${menu.title}`}
                                style={editButtonStyle}
                              >
                                <i className="bi bi-pencil-square" />
                              </button>

                              <button
                                type="button"
                                role="switch"
                                aria-checked={permissionEnabled}
                                aria-label={permissionEnabled ? `Disable ${menu.title}` : `Enable ${menu.title}`}
                                className={`${styles.switch} ${permissionEnabled ? styles.switchActive : ""}`}
                                onClick={() => handleToggleAdminPermission(menu)}
                                disabled={isSaving}
                              >
                                <span className={styles.switchTrack}>
                                  <span className={styles.switchThumb} />
                                </span>
                                <span className={styles.switchText}>
                                  {isSaving ? "Saving..." : permissionEnabled ? "On" : "Off"}
                                </span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className={styles.pagination}>
                    <div className={styles.paginationInfo}>
                      Page <strong>{pagination.page}</strong> / <strong>{pagination.totalPages || 1}</strong>
                      <span className={styles.dot} />
                      <span>{pagination.total} total item(s)</span>
                    </div>

                    <div className={styles.paginationActions}>
                      <button
                        type="button"
                        className={styles.paginationButton}
                        onClick={() => setPage(1)}
                        disabled={!pagination.hasPreviousPage || loadingMenus}
                      >
                        First
                      </button>

                      <button
                        type="button"
                        className={styles.paginationButton}
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={!pagination.hasPreviousPage || loadingMenus}
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        className={styles.paginationButton}
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={!pagination.hasNextPage || loadingMenus}
                      >
                        Next
                      </button>

                      <button
                        type="button"
                        className={styles.paginationButton}
                        onClick={() => setPage(pagination.totalPages)}
                        disabled={!pagination.hasNextPage || loadingMenus}
                      >
                        Last
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sideCard}>
              <div className={styles.sideCardHeader}>
                <h2 className={styles.sideCardTitle}>Overview</h2>
              </div>

              <div className={styles.overviewList}>
                <div className={styles.overviewItem}>
                  <span>Enabled rate</span>
                  <strong>{summary.total ? Math.round((summary.enabled / summary.total) * 100) : 0}%</strong>
                </div>
                <div className={styles.overviewItem}>
                  <span>Visible rate</span>
                  <strong>{summary.total ? Math.round((summary.visible / summary.total) * 100) : 0}%</strong>
                </div>
                <div className={styles.overviewItem}>
                  <span>Disabled menus</span>
                  <strong>{summary.disabled}</strong>
                </div>
                <div className={styles.overviewItem}>
                  <span>Hidden menus</span>
                  <strong>{summary.hidden}</strong>
                </div>
              </div>

              <div className={styles.metricsInline}>
                <span>
                  <strong>{summary.total}</strong> total
                </span>
                <span>
                  <strong>{summary.enabled}</strong> enabled
                </span>
                <span>
                  <strong>{summary.visible}</strong> visible
                </span>
                <span>
                  <strong>{summary.root}</strong> root
                </span>
              </div>
            </div>

            {items.length > 0 ? (
              <div className={styles.sideCard}>
                <div className={styles.sideCardHeader}>
                  <h2 className={styles.sideCardTitle}>Extra access map</h2>
                  <p className={styles.sideCardDescription}>Optional items passed from parent scope.</p>
                </div>

                <div className={styles.accessList}>
                  {items.map((item: MenuAccessItem) => (
                    <div key={item.key} className={styles.accessItem}>
                      <div>
                        <strong className={styles.accessLabel}>{item.label}</strong>
                        <span className={styles.accessKey}>{item.key}</span>
                      </div>
                      <span
                        className={`${styles.badge} ${item.enabled ? styles.badgeSuccessSoft : styles.badgeNeutralSoft}`}
                      >
                        {item.enabled ? "Visible" : "Hidden"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </aside>
        </div>
      </section>

      <ModalAddMenus
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        onCreated={handleRefresh}
        siteOptions={siteOptions}
        parentOptions={parentOptions}
        defaultSiteId={siteOptions[0]?.id || ""}
      />

      <EditMenuModal
        open={openEditModal}
        menu={editingMenu}
        siteOptions={siteOptions}
        parentOptions={parentOptions}
        onClose={handleCloseEditModal}
        onUpdated={async () => {
          handleCloseEditModal();
          await fetchMenus();
        }}
      />
    </>
  );
}

function SortIcon({ active, direction }: { active: boolean; direction: SortDirection }) {
  return (
    <span className={styles.sortIcon}>
      {active ? (
        direction === "asc" ? (
          <i className="bi bi-arrow-up" />
        ) : (
          <i className="bi bi-arrow-down" />
        )
      ) : (
        <i className="bi bi-arrow-down-up" />
      )}
    </span>
  );
}

type EditMenuModalProps = {
  open: boolean;
  menu: MenuRecord | null;
  siteOptions: SiteOption[];
  parentOptions: ParentOption[];
  onClose: () => void;
  onUpdated: () => void | Promise<void>;
};

function EditMenuModal({ open, menu, siteOptions, parentOptions, onClose, onUpdated }: EditMenuModalProps) {
  const [form, setForm] = useState<EditMenuFormState | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!open || !menu) {
      setForm(null);
      setSubmitError("");
      setSubmitting(false);
      return;
    }

    setForm(createEditForm(menu));
    setSubmitError("");
    setSubmitting(false);
  }, [open, menu]);

  const availableParentOptions = useMemo(() => {
    if (!form || !menu) {
      return [];
    }

    return parentOptions.filter((option) => option.id !== menu.id && option.area === form.area);
  }, [form, menu, parentOptions]);

  const handleChange = useCallback(<K extends keyof EditMenuFormState>(key: K, value: EditMenuFormState[K]) => {
    setForm((prev) => {
      if (!prev) {
        return prev;
      }

      return {
        ...prev,
        [key]: value,
      };
    });
  }, []);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      if (!menu || !form) {
        return;
      }

      try {
        setSubmitting(true);
        setSubmitError("");

        const payload = {
          title: form.title.trim(),
          path: form.path.trim() || null,
          icon: form.icon.trim() || null,
          sortOrder: Number(form.sortOrder) || 0,
          visible: form.visible,
          area: form.area,
          siteId: form.siteId,
          parentId: form.parentId || null,
        };

        const response = await fetch(`/api/platform/menus/${menu.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        const contentType = response.headers.get("content-type") || "";
        const data: { message?: string } | null = contentType.includes("application/json")
          ? await response.json().catch(() => null)
          : null;

        if (!response.ok) {
          throw new Error(data?.message || "Failed to update menu");
        }

        await onUpdated();
      } catch (err) {
        console.error(err);
        setSubmitError(err instanceof Error ? err.message : "Failed to update menu");
      } finally {
        setSubmitting(false);
      }
    },
    [form, menu, onUpdated],
  );

  if (!open || !menu || !form) {
    return null;
  }

  return (
    <div role="dialog" aria-modal="true" aria-labelledby="edit-menu-title" onClick={onClose} style={modalOverlayStyle}>
      <div onClick={(event) => event.stopPropagation()} style={modalCardStyle}>
        <div style={modalHeaderStyle}>
          <div>
            <h2 id="edit-menu-title" style={modalTitleStyle}>
              Edit menu
            </h2>
            <p style={modalSubtitleStyle}>Update menu information and save changes.</p>
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle} aria-label="Close edit menu modal">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={modalBodyGridStyle}>
            <Field label="Title">
              <input
                value={form.title}
                onChange={(event) => handleChange("title", event.target.value)}
                placeholder="Menu title"
                required
                style={inputStyle}
              />
            </Field>

            <Field label="Area">
              <select
                value={form.area}
                onChange={(event) => {
                  const nextArea = event.target.value as MenuArea;
                  handleChange("area", nextArea);
                  handleChange("parentId", "");
                }}
                style={inputStyle}
              >
                {MENU_AREA_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Path">
              <input
                value={form.path}
                onChange={(event) => handleChange("path", event.target.value)}
                placeholder="/dashboard"
                style={inputStyle}
              />
            </Field>

            <Field label="Icon">
              <input
                value={form.icon}
                onChange={(event) => handleChange("icon", event.target.value)}
                placeholder="bi bi-grid"
                style={inputStyle}
              />
            </Field>

            <Field label="Site">
              <select
                value={form.siteId}
                onChange={(event) => handleChange("siteId", event.target.value)}
                style={inputStyle}
              >
                <option value="">Select site</option>
                {siteOptions.map((site) => (
                  <option key={site.id} value={site.id}>
                    {getSiteLabel(site)}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Parent menu">
              <select
                value={form.parentId}
                onChange={(event) => handleChange("parentId", event.target.value)}
                style={inputStyle}
              >
                <option value="">No parent</option>
                {availableParentOptions.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.title}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Sort order">
              <input
                type="number"
                value={form.sortOrder}
                onChange={(event) => handleChange("sortOrder", event.target.value)}
                placeholder="0"
                style={inputStyle}
              />
            </Field>

            <Field label="Visibility">
              <label style={checkboxContainerStyle}>
                <input
                  type="checkbox"
                  checked={form.visible}
                  onChange={(event) => handleChange("visible", event.target.checked)}
                />
                Visible on UI
              </label>
            </Field>

            {submitError ? <div style={errorBoxStyle}>{submitError}</div> : null}
          </div>

          <div style={modalFooterStyle}>
            <button type="button" onClick={onClose} disabled={submitting} style={secondaryButtonStyle}>
              Cancel
            </button>

            <button type="submit" disabled={submitting} style={primaryButtonStyle}>
              {submitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label style={fieldStyle}>
      <span style={fieldLabelStyle}>{label}</span>
      {children}
    </label>
  );
}

const actionGroupStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const editButtonStyle: CSSProperties = {
  border: "1px solid rgba(148, 163, 184, 0.35)",
  background: "#fff",
  color: "#0f172a",
  borderRadius: 10,
  padding: "8px 10px",
  cursor: "pointer",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalOverlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 1000,
  background: "rgba(15, 23, 42, 0.45)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 24,
};

const modalCardStyle: CSSProperties = {
  width: "100%",
  maxWidth: 720,
  background: "#fff",
  borderRadius: 20,
  boxShadow: "0 24px 64px rgba(15, 23, 42, 0.18)",
  overflow: "hidden",
};

const modalHeaderStyle: CSSProperties = {
  padding: "20px 24px 16px",
  borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
};

const modalTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
  color: "#0f172a",
};

const modalSubtitleStyle: CSSProperties = {
  margin: "6px 0 0",
  color: "#64748b",
  fontSize: 14,
};

const closeButtonStyle: CSSProperties = {
  border: "none",
  background: "transparent",
  cursor: "pointer",
  fontSize: 20,
  color: "#64748b",
};

const modalBodyGridStyle: CSSProperties = {
  padding: 24,
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 16,
};

const modalFooterStyle: CSSProperties = {
  padding: "16px 24px 24px",
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  borderTop: "1px solid rgba(148, 163, 184, 0.2)",
};

const fieldStyle: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 8,
};

const fieldLabelStyle: CSSProperties = {
  fontSize: 14,
  fontWeight: 600,
  color: "#334155",
};

const inputStyle: CSSProperties = {
  width: "100%",
  minHeight: 44,
  borderRadius: 12,
  border: "1px solid rgba(148, 163, 184, 0.35)",
  padding: "10px 12px",
  outline: "none",
  color: "#0f172a",
  background: "#fff",
};

const checkboxContainerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  minHeight: 44,
  padding: "10px 12px",
  border: "1px solid rgba(148, 163, 184, 0.35)",
  borderRadius: 12,
  color: "#0f172a",
};

const errorBoxStyle: CSSProperties = {
  gridColumn: "1 / -1",
  borderRadius: 12,
  padding: "12px 14px",
  background: "rgba(239, 68, 68, 0.08)",
  color: "#b91c1c",
  fontSize: 14,
};

const secondaryButtonStyle: CSSProperties = {
  border: "1px solid rgba(148, 163, 184, 0.35)",
  background: "#fff",
  color: "#0f172a",
  borderRadius: 12,
  padding: "10px 16px",
  fontWeight: 600,
  cursor: "pointer",
};

const primaryButtonStyle: CSSProperties = {
  border: "none",
  background: "#2563eb",
  color: "#fff",
  borderRadius: 12,
  padding: "10px 16px",
  fontWeight: 700,
  cursor: "pointer",
};
