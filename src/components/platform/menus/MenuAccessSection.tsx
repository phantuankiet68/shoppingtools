"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ModalAddMenus } from "@/components/platform/menus/modalAddMenus";
import styles from "@/styles/platform/MenuAccessSection.module.css";

type SystemRole = "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";
type MenuArea = "PLATFORM" | "ADMIN" | "SITE";
type FilterMode = "all" | "enabled" | "disabled";
type AreaFilter = "ALL" | MenuArea;

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

export type TenantAccessProfile = {
  planName: "Basic" | "Pro" | "Enterprise";
  monthlyPrice: string;
  customDomainEnabled: boolean;
  maxCustomDomains: number;
  platformSubdomain: string;
  customDomains: { domain: string; status: "Verified" | "Pending" | "Failed" }[];
  menuAccess: { key: string; label: string; enabled: boolean }[];
};

type MenuAccessItem = TenantAccessProfile["menuAccess"][number];

type Props = {
  items?: TenantAccessProfile["menuAccess"];
};

const AREA_OPTIONS: Array<{ value: AreaFilter; label: string }> = [
  { value: "ALL", label: "All areas" },
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

type SortKey = "title" | "path" | "area" | "visible" | "permission";
type SortDirection = "asc" | "desc";

type PaginatedMenuResponse = {
  items: MenuRecord[];
  pagination: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
    hasPreviousPage: boolean;
    hasNextPage: boolean;
  };
  summary: {
    total: number;
    enabled: number;
    disabled: number;
    visible: number;
    hidden: number;
    root: number;
  };
};

const PAGE_SIZE = 8;

export function MenuAccessSection({ items = [] }: Props) {
  const [menus, setMenus] = useState<MenuRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingMenuId, setSavingMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterMode>("all");
  const [areaFilter, setAreaFilter] = useState<AreaFilter>("ALL");
  const [openAddModal, setOpenAddModal] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey>("title");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [page, setPage] = useState(1);

  const activeRequestIdRef = useRef(0);

  const [pagination, setPagination] = useState({
    page: 1,
    size: PAGE_SIZE,
    total: 0,
    totalPages: 1,
    hasPreviousPage: false,
    hasNextPage: false,
  });

  const [summary, setSummary] = useState({
    total: 0,
    enabled: 0,
    disabled: 0,
    visible: 0,
    hidden: 0,
    root: 0,
  });

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 300);

    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, statusFilter, areaFilter, sortKey, sortDirection]);

  const fetchMenus = useCallback(
    async (signal?: AbortSignal) => {
      const requestId = ++activeRequestIdRef.current;

      try {
        setLoading(true);
        setError("");

        const params = new URLSearchParams();
        params.set("systemRole", "ADMIN");
        params.set("page", String(page));
        params.set("size", String(PAGE_SIZE));
        params.set("sortKey", sortKey);
        params.set("sortDirection", sortDirection);

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
          signal,
        });

        const contentType = response.headers.get("content-type") || "";
        const data: PaginatedMenuResponse | { message?: string } | null = contentType.includes("application/json")
          ? await response.json()
          : null;

        if (!response.ok) {
          throw new Error((data as { message?: string } | null)?.message || "Failed to load menus");
        }

        if (requestId === activeRequestIdRef.current) {
          const normalized = data as PaginatedMenuResponse;
          setMenus(normalized.items || []);
          setPagination(normalized.pagination);
          setSummary(normalized.summary);
        }
      } catch (err) {
        if ((err as Error)?.name === "AbortError") return;

        console.error(err);

        if (requestId === activeRequestIdRef.current) {
          setMenus([]);
          setPagination({
            page: 1,
            size: PAGE_SIZE,
            total: 0,
            totalPages: 1,
            hasPreviousPage: false,
            hasNextPage: false,
          });
          setSummary({
            total: 0,
            enabled: 0,
            disabled: 0,
            visible: 0,
            hidden: 0,
            root: 0,
          });
          setError(err instanceof Error ? err.message : "Failed to load menus");
        }
      } finally {
        if (requestId === activeRequestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [page, debouncedQuery, statusFilter, areaFilter, sortKey, sortDirection],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchMenus(controller.signal);

    return () => controller.abort();
  }, [fetchMenus]);

  const handleRefresh = useCallback(() => {
    const controller = new AbortController();
    fetchMenus(controller.signal);
  }, [fetchMenus]);

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

        if (wasEnabled === isEnabled) return prev;

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

  const siteIdOptions = useMemo(() => Array.from(new Set(menus.map((item) => item.siteId))).filter(Boolean), [menus]);

  const parentOptions = useMemo(
    () =>
      menus.map((item) => ({
        id: item.id,
        title: item.title,
        path: item.path,
        area: item.area,
      })),
    [menus],
  );

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  const handleBulkToggleByArea = useCallback(
    async (targetArea: MenuArea, enabled: boolean) => {
      try {
        setLoading(true);

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

        handleRefresh();
      } catch (err) {
        console.error(err);
        window.alert(err instanceof Error ? err.message : "Bulk update failed");
      } finally {
        setLoading(false);
      }
    },
    [menus, handleRefresh],
  );

  return (
    <>
      <section className={styles.page}>
        <div className={styles.topbar}>
          <div className={styles.topbarLeft}>
            <div className={styles.titleInline}>
              <span className={styles.kicker}>Permission</span>
              <h1 className={styles.pageTitle}>Admin Menu Access</h1>
            </div>
          </div>

          <div className={styles.topbarRight}>
            <button type="button" className={styles.addButton} onClick={() => setOpenAddModal(true)}>
              <i className="bi bi-plus-lg" />
              Add menu
            </button>

            <button type="button" className={styles.refreshButton} onClick={handleRefresh} disabled={loading}>
              <i className="bi bi-arrow-clockwise" />
              {loading ? "Refreshing..." : "Refresh"}
            </button>

            <button
              type="button"
              className={styles.bulkEnableButton}
              onClick={() => handleBulkToggleByArea("PLATFORM", true)}
              disabled={loading}
            >
              <i className="bi bi-toggle-on" />
              Enable PLATFORM
            </button>

            <button
              type="button"
              className={styles.bulkDisableButton}
              onClick={() => handleBulkToggleByArea("PLATFORM", false)}
              disabled={loading}
            >
              <i className="bi bi-toggle-off" />
              Disable PLATFORM
            </button>

            <button
              type="button"
              className={styles.bulkEnableButton}
              onClick={() => handleBulkToggleByArea("ADMIN", true)}
              disabled={loading}
            >
              <i className="bi bi-toggle-on" />
              Enable ADMIN
            </button>

            <button
              type="button"
              className={styles.bulkDisableButton}
              onClick={() => handleBulkToggleByArea("ADMIN", false)}
              disabled={loading}
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
                <button onClick={() => handleSort("title")} className={styles.th}>
                  Menu
                  <SortIcon active={sortKey === "title"} direction={sortDirection} />
                </button>

                <button onClick={() => handleSort("path")} className={styles.th}>
                  Path
                  <SortIcon active={sortKey === "path"} direction={sortDirection} />
                </button>

                <button onClick={() => handleSort("area")} className={styles.th}>
                  Area
                  <SortIcon active={sortKey === "area"} direction={sortDirection} />
                </button>

                <button onClick={() => handleSort("visible")} className={styles.th}>
                  Visibility
                  <SortIcon active={sortKey === "visible"} direction={sortDirection} />
                </button>

                <button onClick={() => handleSort("permission")} className={styles.th}>
                  Admin
                  <SortIcon active={sortKey === "permission"} direction={sortDirection} />
                </button>

                <span>Action</span>
              </div>

              {loading ? (
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
                              className={`${styles.badge} ${permissionEnabled ? styles.badgeSuccessSoft : styles.badgeDangerSoft}`}
                            >
                              {permissionEnabled ? "Enabled" : "Disabled"}
                            </span>
                          </div>

                          <div className={styles.actionCell}>
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
                        disabled={!pagination.hasPreviousPage || loading}
                      >
                        First
                      </button>

                      <button
                        type="button"
                        className={styles.paginationButton}
                        onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                        disabled={!pagination.hasPreviousPage || loading}
                      >
                        Previous
                      </button>

                      <button
                        type="button"
                        className={styles.paginationButton}
                        onClick={() => setPage((prev) => prev + 1)}
                        disabled={!pagination.hasNextPage || loading}
                      >
                        Next
                      </button>

                      <button
                        type="button"
                        className={styles.paginationButton}
                        onClick={() => setPage(pagination.totalPages)}
                        disabled={!pagination.hasNextPage || loading}
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
                <p className={styles.sideCardDescription}>Quick operational summary for current ADMIN menu access.</p>
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
        siteIdOptions={siteIdOptions}
        parentOptions={parentOptions}
        defaultSiteId={siteIdOptions[0] || ""}
      />
    </>
  );
}

function SortIcon({ active, direction }: { active: boolean; direction: "asc" | "desc" }) {
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
