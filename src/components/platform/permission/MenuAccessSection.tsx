"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/platform/permission.module.css";
import { TenantAccessProfile } from "./types";

type MenuPermissionItem = {
  id: string | null;
  systemRole: "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";
  enabled: boolean;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type MenuItem = {
  id: string;
  siteId: string;
  parentId?: string | null;
  title: string;
  path?: string | null;
  icon?: string | null;
  sortOrder: number;
  visible: boolean;
  setKey: "home" | "v1";
  createdAt?: string;
  updatedAt?: string;
  permission: MenuPermissionItem;
};

type Props = {
  items: TenantAccessProfile["menuAccess"];
};

export function MenuAccessSection({ items }: Props) {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savingMenuId, setSavingMenuId] = useState<string | null>(null);

  async function fetchMenus() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/platform/permission/menus?setKey=v1&systemRole=ADMIN", {
        cache: "no-store",
      });

      let data: MenuItem[] | { message?: string } | null = null;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error((data as { message?: string } | null)?.message || "Failed to load menus");
      }

      setMenus(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setMenus([]);
      setError(err instanceof Error ? err.message : "Failed to load menus");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMenus();
  }, []);

  async function handleToggleAdminPermission(menu: MenuItem) {
    try {
      setSavingMenuId(menu.id);

      const response = await fetch(`/api/platform/permission/menus/${menu.id}/role-permission`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemRole: "ADMIN",
          enabled: !menu.permission.enabled,
        }),
      });

      let data:
        | {
            id: string;
            menuId: string;
            systemRole: "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";
            enabled: boolean;
            createdAt?: string;
            updatedAt?: string;
          }
        | { message?: string }
        | null = null;

      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error((data as { message?: string } | null)?.message || "Failed to update menu permission");
      }

      const updatedPermission = data as {
        id: string;
        menuId: string;
        systemRole: "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";
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
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Failed to update menu permission");
    } finally {
      setSavingMenuId(null);
    }
  }

  const summary = useMemo(() => {
    const enabledCount = menus.filter((item) => item.permission.enabled).length;
    const disabledCount = menus.length - enabledCount;

    return {
      total: menus.length,
      enabled: enabledCount,
      disabled: disabledCount,
    };
  }, [menus]);

  return (
    <div className={styles.permissionSection}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Menu Visibility</h3>
          <p className={styles.sectionDescription}>Manage admin access for global menus using setKey = v1.</p>
        </div>
      </div>

      {loading ? (
        <div className={styles.emptyState}>Loading menus...</div>
      ) : error ? (
        <div className={styles.emptyState}>{error}</div>
      ) : (
        <>
          {menus.length === 0 ? (
            <div className={styles.emptyState}>No menus found for setKey = v1.</div>
          ) : (
            <div className={styles.sitePermissionTable}>
              <div className={styles.sitePermissionHead}>
                <span>Menu</span>
                <span>Path</span>
                <span>Global</span>
                <span>Admin Role</span>
                <span>Action</span>
              </div>

              <div className={styles.sitePermissionBody}>
                {menus.map((menu) => (
                  <div key={menu.id} className={styles.sitePermissionRow}>
                    <div className={styles.sitePermissionSite}>
                      <div className={styles.sitePermissionSiteInfo}>
                        <span className={styles.sitePermissionSiteName}>{menu.title}</span>
                        <span className={styles.sitePermissionSiteVisibility}>
                          {menu.parentId ? "Child menu" : "Root menu"}
                        </span>
                      </div>
                    </div>

                    <div className={styles.sitePermissionDomain}>{menu.path || "—"}</div>

                    <div className={styles.sitePermissionCellCenter}>
                      <div
                        className={`${styles.sitePermissionBadge} ${
                          menu.visible ? styles.sitePermissionStatusACTIVE : styles.sitePermissionStatusSUSPENDED
                        }`}
                      >
                        {menu.visible ? "Visible" : "Hidden"}
                      </div>
                    </div>

                    <div className={styles.sitePermissionCellCenter}>
                      <div
                        className={`${styles.sitePermissionBadge} ${
                          menu.permission.enabled
                            ? styles.sitePermissionStatusACTIVE
                            : styles.sitePermissionStatusSUSPENDED
                        }`}
                      >
                        {menu.permission.enabled ? "Enabled" : "Disabled"}
                      </div>
                    </div>

                    <div className={styles.sitePermissionActions}>
                      <button
                        type="button"
                        className={
                          menu.permission.enabled ? styles.sitePermissionDeleteButton : styles.sitePermissionEditButton
                        }
                        onClick={() => handleToggleAdminPermission(menu)}
                        disabled={savingMenuId === menu.id}
                      >
                        <i className={`bi ${menu.permission.enabled ? "bi-toggle-on" : "bi-toggle-off"}`} />
                        {savingMenuId === menu.id ? "Saving..." : menu.permission.enabled ? "Disable" : "Enable"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {items?.length ? (
            <div className={styles.infoGrid} style={{ marginTop: 16 }}>
              {items.map((item) => (
                <div key={item.key} className={styles.infoItem}>
                  <span className={styles.infoLabel}>{item.label}</span>
                  <span className={styles.infoValue}>{item.enabled ? "Visible" : "Hidden"}</span>
                </div>
              ))}
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
