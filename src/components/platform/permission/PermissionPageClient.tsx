"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/platform/permission.module.css";
import { CreateTenantAccessModal } from "./CreateTenantAccessModal";
import { DomainAccessSection } from "./DomainAccessSection";
import { getAccessProfile } from "./mock-data";
import { MenuAccessSection } from "./MenuAccessSection";
import { PlanSummary } from "./PlanSummary";
import { TenantList } from "./TenantList";
import { TemplatesSection } from "./TemplatesSection";
import { StaffMember, UsageMetric } from "./types";
import { UsageLimits } from "./UsageLimits";
import { WebsiteTypesSection } from "./WebsiteTypesSection";
import { WorkspaceModal } from "./WorkspaceModal";

type StaffWithWorkspace = StaffMember & {
  workspaceId?: string | null;
  workspaceName?: string | null;
  workspaceSlug?: string | null;
};

type WorkspacePolicy = {
  planCode: string;
  maxSites: number;
  maxPages: number;
  maxMenus: number;
  maxProductCategories: number;
  maxProducts: number;
  maxCustomDomains: number;
  allowBlog: boolean;
  allowEcommerce: boolean;
  allowBooking: boolean;
  allowNews: boolean;
  allowLms: boolean;
  allowDirectory: boolean;
  hiddenMenuKeys: string[];
};

type WorkspaceUsage = {
  sites: number;
  pages: number;
  menus: number;
  productCategories: number;
  products: number;
};

type WorkspacePermissionResponse = {
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  policy: WorkspacePolicy | null;
  usage: WorkspaceUsage | null;
};

type CreateTenantResponse = StaffWithWorkspace;

export function PermissionPageClient() {
  const [staffList, setStaffList] = useState<StaffWithWorkspace[]>([]);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [workspacePermission, setWorkspacePermission] = useState<WorkspacePermissionResponse | null>(null);
  const [permissionLoading, setPermissionLoading] = useState(false);
  const [permissionError, setPermissionError] = useState("");

  const [workspaceModalOpen, setWorkspaceModalOpen] = useState(false);
  const [createTenantModalOpen, setCreateTenantModalOpen] = useState(false);

  const [isEditingWorkspace, setIsEditingWorkspace] = useState(false);
  const [workspaceNameDraft, setWorkspaceNameDraft] = useState("");
  const [workspaceSlugDraft, setWorkspaceSlugDraft] = useState("");
  const [workspaceSaving, setWorkspaceSaving] = useState(false);
  const [workspaceSaveError, setWorkspaceSaveError] = useState("");

  function handleStartEditWorkspace() {
    setWorkspaceNameDraft(selectedStaff?.workspaceName || workspacePermission?.workspace?.name || "");
    setWorkspaceSlugDraft(selectedStaff?.workspaceSlug || workspacePermission?.workspace?.slug || "");
    setWorkspaceSaveError("");
    setIsEditingWorkspace(true);
  }

  function handleCancelEditWorkspace() {
    setWorkspaceNameDraft(selectedStaff?.workspaceName || workspacePermission?.workspace?.name || "");
    setWorkspaceSlugDraft(selectedStaff?.workspaceSlug || workspacePermission?.workspace?.slug || "");
    setWorkspaceSaveError("");
    setIsEditingWorkspace(false);
  }

  async function handleSaveWorkspaceInfo() {
    if (!selectedStaff?.workspaceId) {
      setWorkspaceSaveError("Workspace not found.");
      return;
    }

    const nextName = workspaceNameDraft.trim();
    const nextSlug = workspaceSlugDraft.trim();

    if (!nextName) {
      setWorkspaceSaveError("Workspace name is required.");
      return;
    }

    if (!nextSlug) {
      setWorkspaceSaveError("Workspace slug is required.");
      return;
    }

    try {
      setWorkspaceSaving(true);
      setWorkspaceSaveError("");

      const response = await fetch("/api/platform/permission/workspaces", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          workspaceId: selectedStaff.workspaceId,
          name: nextName,
          slug: nextSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to update workspace");
      }

      setStaffList((prev) =>
        prev.map((item) =>
          item.id === selectedStaff.id
            ? {
                ...item,
                workspaceName: data.workspace.name,
                workspaceSlug: data.workspace.slug,
              }
            : item,
        ),
      );

      setWorkspacePermission((prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          workspace: {
            ...prev.workspace,
            name: data.workspace.name,
            slug: data.workspace.slug,
          },
        };
      });

      setIsEditingWorkspace(false);
    } catch (err) {
      console.error(err);
      setWorkspaceSaveError(err instanceof Error ? err.message : "Failed to update workspace");
    } finally {
      setWorkspaceSaving(false);
    }
  }

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/platform/permission/staff", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch admin staff");
        }

        const data: StaffWithWorkspace[] = await response.json();
        setStaffList(data);

        if (data.length > 0) {
          setSelectedStaffId(data[0].id);
        }
      } catch (err) {
        console.error(err);
        setError("Unable to load admin staff members.");
      } finally {
        setLoading(false);
      }
    };

    fetchAdmins();
  }, []);

  const filteredStaff = useMemo(() => {
    return staffList.filter((staff) => {
      const email = staff.email ?? "";
      const matchesSearch =
        staff.name.toLowerCase().includes(search.toLowerCase()) || email.toLowerCase().includes(search.toLowerCase());

      const matchesRole = roleFilter === "all" || staff.role.toLowerCase() === roleFilter.toLowerCase();

      return matchesSearch && matchesRole;
    });
  }, [staffList, search, roleFilter]);

  const selectedStaff = filteredStaff.find((staff) => staff.id === selectedStaffId) || filteredStaff[0] || null;

  const accessProfile = selectedStaff ? getAccessProfile(selectedStaff) : null;

  useEffect(() => {
    if (!selectedStaff && filteredStaff.length > 0) {
      setSelectedStaffId(filteredStaff[0].id);
    }
  }, [filteredStaff, selectedStaff]);

  useEffect(() => {
    const fetchWorkspacePermission = async () => {
      if (!selectedStaff?.workspaceId) {
        setWorkspacePermission(null);
        setPermissionError("");
        return;
      }

      try {
        setPermissionLoading(true);
        setPermissionError("");

        const response = await fetch(`/api/platform/permission/workspaces/${selectedStaff.workspaceId}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch workspace permission");
        }

        const data: WorkspacePermissionResponse = await response.json();
        setWorkspacePermission(data);
      } catch (err) {
        console.error(err);
        setWorkspacePermission(null);
        setPermissionError("Unable to load workspace limits.");
      } finally {
        setPermissionLoading(false);
      }
    };

    fetchWorkspacePermission();
  }, [selectedStaff?.workspaceId]);

  const usageItems = useMemo<UsageMetric[]>(() => {
    if (workspacePermission?.policy && workspacePermission?.usage) {
      return [
        {
          key: "sites",
          label: "Sites",
          used: workspacePermission.usage.sites,
          limit: workspacePermission.policy.maxSites,
          summary: "Total number of sites allowed in this workspace.",
        },
        {
          key: "pages",
          label: "Pages",
          used: workspacePermission.usage.pages,
          limit: workspacePermission.policy.maxPages,
          summary: "Total website pages allowed across all sites.",
        },
        {
          key: "menus",
          label: "Menus",
          used: workspacePermission.usage.menus,
          limit: workspacePermission.policy.maxMenus,
          summary: "Navigation structures available in the builder.",
        },
        {
          key: "categories",
          label: "Product Categories",
          used: workspacePermission.usage.productCategories,
          limit: workspacePermission.policy.maxProductCategories,
          summary: "Catalog category capacity for commerce websites.",
        },
        {
          key: "products",
          label: "Products",
          used: workspacePermission.usage.products,
          limit: workspacePermission.policy.maxProducts,
          summary: "Total products allowed across all sites in this workspace.",
        },
      ];
    }

    return accessProfile?.usage ?? [];
  }, [workspacePermission, accessProfile]);

  async function handleSaveUsageLimits(nextItems: UsageMetric[]) {
    if (!selectedStaff?.workspaceId) {
      console.warn("No workspaceId found for selected staff");
      return;
    }

    const payload = {
      maxSites: nextItems.find((x) => x.key === "sites")?.limit ?? 1,
      maxPages: nextItems.find((x) => x.key === "pages")?.limit ?? 10,
      maxMenus: nextItems.find((x) => x.key === "menus")?.limit ?? 3,
      maxProductCategories: nextItems.find((x) => x.key === "categories")?.limit ?? 20,
      maxProducts: nextItems.find((x) => x.key === "products")?.limit ?? 100,
    };

    const response = await fetch(`/api/platform/permission/workspaces/${selectedStaff.workspaceId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    let data: WorkspacePolicy | { message?: string } | null = null;
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      data = await response.json();
    }

    if (!response.ok) {
      throw new Error((data as { message?: string } | null)?.message || "Failed to update workspace limits");
    }

    const updatedPolicy = data as WorkspacePolicy;

    setWorkspacePermission((prev) => {
      if (!prev) return prev;

      return {
        ...prev,
        policy: {
          ...prev.policy,
          ...updatedPolicy,
        },
      };
    });
  }

  function handleCreatedTenant(newTenant: CreateTenantResponse) {
    setStaffList((prev) => [newTenant, ...prev]);
    setSelectedStaffId(newTenant.id);
    setCreateTenantModalOpen(false);
  }

  return (
    <div className={styles.page}>
      <div className={styles.tenantToolbar}>
        <div className={styles.tenantToolbarLeft}>
          <div className={styles.tenantSearchBox}>
            <i className={`bi bi-search ${styles.tenantSearchIcon}`} />
            <input
              type="text"
              placeholder="Search tenant by name or email"
              className={styles.tenantSearchInput}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className={styles.tenantToolbarRight}>
          <div className={styles.tenantFilterGroup}>
            <span className={styles.tenantFilterIcon}>
              <i className="bi bi-funnel" />
            </span>

            <select
              className={styles.tenantFilterSelect}
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All Tiers</option>
              <option value="teacher">Basic</option>
              <option value="moderator">Pro</option>
              <option value="manager">Enterprise</option>
            </select>
          </div>

          <button className={styles.tenantCreateButton} type="button" onClick={() => setCreateTenantModalOpen(true)}>
            <i className="bi bi-plus-lg" />
            <span>Create Tenant Access</span>
          </button>
        </div>
      </div>
      <div className={styles.contentGrid}>
        <TenantList
          staff={filteredStaff}
          loading={loading}
          error={error}
          selectedStaffId={selectedStaffId}
          onSelect={setSelectedStaffId}
        />

        <section className={styles.detailCard}>
          {!selectedStaff || !accessProfile ? (
            <div className={styles.emptyState}>Select a tenant to view plan access.</div>
          ) : (
            <>
              <PlanSummary staff={selectedStaff} profile={accessProfile} />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  marginTop: 16,
                  marginBottom: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h3 className={styles.sectionTitle}>Tenant Workspace Setup</h3>
                  <p className={styles.sectionDescription}>
                    Manage workspace assignment and usage limits for this tenant.
                  </p>
                </div>

                {!selectedStaff.workspaceId ? (
                  <button type="button" className={styles.inviteButton} onClick={() => setWorkspaceModalOpen(true)}>
                    <i className="bi bi-building-add" />
                    Create Workspace
                  </button>
                ) : (
                  <button type="button" className={styles.editButton} onClick={handleStartEditWorkspace}>
                    <i className="bi bi-pencil-square" />
                    Edit Workspace
                  </button>
                )}
              </div>

              <div
                style={{
                  marginBottom: 25,
                  padding: "14px 16px",
                  borderRadius: 8,
                  border: "1px solid #dbeafe",
                  background: selectedStaff.workspaceId
                    ? "linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(245, 247, 255, 0.92))"
                    : "#eff6ff",
                }}
              >
                {!selectedStaff.workspaceId ? (
                  <div
                    style={{
                      color: "#1e3a8a",
                      fontSize: 14,
                      lineHeight: 1.5,
                    }}
                  >
                    This user does not have a workspace yet. Create one first so you can apply real limits, plans, and
                    permissions.
                  </div>
                ) : (
                  <div
                    style={{
                      display: "grid",
                      gap: 8,
                    }}
                  >
                    {isEditingWorkspace ? (
                      <div
                        style={{
                          display: "grid",
                          gap: 12,
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                            gap: 12,
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#64748b",
                                marginBottom: 4,
                              }}
                            >
                              Workspace Name
                            </div>
                            <input
                              className={styles.searchInput}
                              value={workspaceNameDraft}
                              onChange={(e) => setWorkspaceNameDraft(e.target.value)}
                              placeholder="Workspace name"
                            />
                          </div>

                          <div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#64748b",
                                marginBottom: 4,
                              }}
                            >
                              Slug
                            </div>
                            <input
                              className={styles.searchInput}
                              value={workspaceSlugDraft}
                              onChange={(e) => setWorkspaceSlugDraft(e.target.value)}
                              placeholder="workspace-slug"
                            />
                          </div>

                          <div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#64748b",
                                marginBottom: 4,
                              }}
                            >
                              Workspace ID
                            </div>
                            <div
                              style={{
                                fontSize: 14,
                                color: "#64748b",
                                fontWeight: 400,
                                wordBreak: "break-all",
                                minHeight: 40,
                                display: "flex",
                                alignItems: "center",
                              }}
                            >
                              {selectedStaff.workspaceId || workspacePermission?.workspace?.id || "—"}
                            </div>
                          </div>
                        </div>

                        {workspaceSaveError ? <div className={styles.emptyState}>{workspaceSaveError}</div> : null}

                        <div className={styles.profileActions}>
                          <button
                            type="button"
                            className={styles.secondaryButton}
                            onClick={handleCancelEditWorkspace}
                            disabled={workspaceSaving}
                          >
                            Cancel
                          </button>

                          <button
                            type="button"
                            className={styles.editButton}
                            onClick={handleSaveWorkspaceInfo}
                            disabled={workspaceSaving}
                          >
                            {workspaceSaving ? "Saving..." : "Save Workspace"}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#64748b",
                              marginBottom: 4,
                            }}
                          >
                            Workspace Name
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#64748b",
                              fontWeight: 500,
                            }}
                          >
                            {selectedStaff.workspaceName || workspacePermission?.workspace?.name || "—"}
                          </div>
                        </div>

                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#64748b",
                              marginBottom: 4,
                            }}
                          >
                            Slug
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#64748b",
                              fontWeight: 500,
                            }}
                          >
                            {selectedStaff.workspaceSlug || workspacePermission?.workspace?.slug || "—"}
                          </div>
                        </div>

                        <div>
                          <div
                            style={{
                              fontSize: 12,
                              color: "#64748b",
                              marginBottom: 4,
                            }}
                          >
                            Workspace ID
                          </div>
                          <div
                            style={{
                              fontSize: 14,
                              color: "#64748b",
                              fontWeight: 500,
                            }}
                          >
                            {selectedStaff.workspaceId || workspacePermission?.workspace?.id || "—"}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {permissionError ? <div className={styles.emptyState}>{permissionError}</div> : null}

              <UsageLimits
                items={usageItems}
                editable={Boolean(selectedStaff.workspaceId)}
                loading={permissionLoading}
                onSave={handleSaveUsageLimits}
              />

              <WebsiteTypesSection items={accessProfile.websiteTypes} />
              <MenuAccessSection items={accessProfile.menuAccess} />
              <DomainAccessSection profile={accessProfile} />
              <TemplatesSection items={accessProfile.templates} />
            </>
          )}
        </section>
      </div>

      <CreateTenantAccessModal
        open={createTenantModalOpen}
        onClose={() => setCreateTenantModalOpen(false)}
        onCreated={handleCreatedTenant}
      />

      <WorkspaceModal
        open={workspaceModalOpen}
        ownerUserId={selectedStaff?.id ?? ""}
        ownerName={selectedStaff?.name ?? ""}
        onClose={() => setWorkspaceModalOpen(false)}
        onCreated={(data) => {
          setStaffList((prev) =>
            prev.map((item) =>
              item.id === selectedStaff?.id
                ? {
                    ...item,
                    workspaceId: data.workspace.id,
                    workspaceName: data.workspace.name,
                    workspaceSlug: data.workspace.slug,
                  }
                : item,
            ),
          );

          setWorkspacePermission((prev) => {
            if (prev) {
              return {
                ...prev,
                workspace: {
                  id: data.workspace.id,
                  name: data.workspace.name,
                  slug: data.workspace.slug,
                },
              };
            }

            return {
              workspace: {
                id: data.workspace.id,
                name: data.workspace.name,
                slug: data.workspace.slug,
              },
              policy: null,
              usage: null,
            };
          });
          setWorkspaceModalOpen(false);
        }}
      />
    </div>
  );
}
