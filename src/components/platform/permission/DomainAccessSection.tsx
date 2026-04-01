"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/platform/permission.module.css";

type SiteItem = {
  id: string;
  name: string;
  domain: string;
  type: "landing" | "blog" | "company" | "ecommerce" | "booking" | "news" | "lms" | "directory";
  status: "DRAFT" | "ACTIVE" | "SUSPENDED";
  isPublic: boolean;
  publishedAt?: string | null;
  ownerUserId?: string;
  createdByUserId?: string | null;
  workspaceId?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type Props = {
  workspaceId?: string | null;
  selectedStaffId?: string;
};

const WEBSITE_TYPE_OPTIONS: Array<SiteItem["type"]> = [
  "landing",
  "blog",
  "company",
  "ecommerce",
  "booking",
  "news",
  "lms",
  "directory",
];

const SITE_STATUS_OPTIONS: Array<SiteItem["status"]> = ["DRAFT", "ACTIVE", "SUSPENDED"];

function toLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getStatusClass(status: SiteItem["status"]) {
  if (status === "ACTIVE") return styles.badgeSuccess;
  if (status === "DRAFT") return styles.badgeWarning;
  return styles.badgeDanger;
}

export function DomainAccessSection({ workspaceId, selectedStaffId }: Props) {
  const [sites, setSites] = useState<SiteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [selectedSite, setSelectedSite] = useState<SiteItem | null>(null);

  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [type, setType] = useState<SiteItem["type"]>("company");
  const [status, setStatus] = useState<SiteItem["status"]>("DRAFT");
  const [isPublic, setIsPublic] = useState(false);
  const [formError, setFormError] = useState("");

  const summary = useMemo(() => {
    return {
      total: sites.length,
      active: sites.filter((site) => site.status === "ACTIVE").length,
      draft: sites.filter((site) => site.status === "DRAFT").length,
    };
  }, [sites]);

  async function fetchSites() {
    if (!workspaceId) {
      setSites([]);
      setError("");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`/api/platform/permission/workspaces/${workspaceId}/sites`, {
        cache: "no-store",
      });

      let data: SiteItem[] | { message?: string } | null = null;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error((data as { message?: string } | null)?.message || "Failed to load sites");
      }

      setSites((data as SiteItem[]) ?? []);
    } catch (err) {
      console.error(err);
      setSites([]);
      setError(err instanceof Error ? err.message : "Failed to load sites");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSites();
  }, [workspaceId]);

  function resetForm() {
    setName("");
    setDomain("");
    setType("company");
    setStatus("DRAFT");
    setIsPublic(false);
    setFormError("");
  }

  function openCreateModal() {
    resetForm();
    setCreateOpen(true);
  }

  function openEditModal(site: SiteItem) {
    setSelectedSite(site);
    setName(site.name);
    setDomain(site.domain);
    setType(site.type);
    setStatus(site.status);
    setIsPublic(site.isPublic);
    setFormError("");
    setEditOpen(true);
  }

  function closeCreateModal() {
    if (submitting) return;
    setCreateOpen(false);
    resetForm();
  }

  function closeEditModal() {
    if (submitting) return;
    setEditOpen(false);
    setSelectedSite(null);
    resetForm();
  }

  async function handleCreateSite(e: React.FormEvent) {
    e.preventDefault();

    if (!workspaceId) {
      setFormError("Workspace not found.");
      return;
    }

    if (!name.trim()) {
      setFormError("Site name is required.");
      return;
    }

    if (!domain.trim()) {
      setFormError("Domain is required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const response = await fetch(`/api/platform/permission/workspaces/${workspaceId}/sites`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          domain: domain.trim(),
          type,
          status,
          isPublic,
          createdByUserId: selectedStaffId ?? null,
        }),
      });

      let data: SiteItem | { message?: string } | null = null;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error((data as { message?: string } | null)?.message || "Failed to create site");
      }

      setSites((prev) => [data as SiteItem, ...prev]);
      closeCreateModal();
    } catch (err) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : "Failed to create site");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdateSite(e: React.FormEvent) {
    e.preventDefault();

    if (!workspaceId || !selectedSite?.id) {
      setFormError("Site not found.");
      return;
    }

    if (!name.trim()) {
      setFormError("Site name is required.");
      return;
    }

    if (!domain.trim()) {
      setFormError("Domain is required.");
      return;
    }

    try {
      setSubmitting(true);
      setFormError("");

      const response = await fetch(`/api/platform/permission/workspaces/${workspaceId}/sites/${selectedSite.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          domain: domain.trim(),
          type,
          status,
          isPublic,
        }),
      });

      let data: SiteItem | { message?: string } | null = null;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error((data as { message?: string } | null)?.message || "Failed to update site");
      }

      setSites((prev) => prev.map((item) => (item.id === selectedSite.id ? (data as SiteItem) : item)));
      closeEditModal();
    } catch (err) {
      console.error(err);
      setFormError(err instanceof Error ? err.message : "Failed to update site");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteSite(siteId: string) {
    if (!workspaceId) return;

    const confirmed = window.confirm("Are you sure you want to delete this site?");
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/platform/permission/workspaces/${workspaceId}/sites/${siteId}`, {
        method: "DELETE",
      });

      let data: { success?: boolean; message?: string } | null = null;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error(data?.message || "Failed to delete site");
      }

      setSites((prev) => prev.filter((site) => site.id !== siteId));
    } catch (err) {
      console.error(err);
      window.alert(err instanceof Error ? err.message : "Failed to delete site");
    }
  }

  return (
    <>
      <div className={styles.permissionSection}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Site Management</h3>
            <p className={styles.sectionDescription}>Create and edit sites assigned to this workspace.</p>
          </div>

          <button type="button" className={styles.inviteButton} onClick={openCreateModal} disabled={!workspaceId}>
            <i className="bi bi-plus-lg" />
            Create Site
          </button>
        </div>

        {!workspaceId ? (
          <div className={styles.emptyState}>
            This tenant does not have a workspace yet. Create a workspace first to manage sites.
          </div>
        ) : loading ? (
          <div className={styles.emptyState}>Loading sites...</div>
        ) : error ? (
          <div className={styles.emptyState}>{error}</div>
        ) : sites.length === 0 ? (
          <div className={styles.emptyState}>
            No sites found in this workspace. Create the first site to start managing publishing.
          </div>
        ) : (
          <div className={styles.sitePermissionTable}>
            <div className={styles.sitePermissionHead}>
              <span>Site</span>
              <span>Type</span>
              <span>Status</span>
              <span>Domain</span>
              <span>Action</span>
            </div>

            <div className={styles.sitePermissionBody}>
              {sites.map((site) => (
                <div key={site.id} className={styles.sitePermissionRow}>
                  <div className={styles.sitePermissionSite}>
                    <div className={styles.sitePermissionSiteInfo}>
                      <span className={styles.sitePermissionSiteName}>{site.name}</span>
                      <span className={styles.sitePermissionSiteVisibility}>
                        {site.isPublic ? "Public" : "Private"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.sitePermissionCellCenter}>
                    <div className={styles.sitePermissionBadge}>{toLabel(site.type)}</div>
                  </div>

                  <div className={styles.sitePermissionCellCenter}>
                    <div className={`${styles.sitePermissionBadge} ${styles[`sitePermissionStatus${site.status}`]}`}>
                      {site.status}
                    </div>
                  </div>

                  <div className={styles.sitePermissionDomain}>{site.domain}</div>

                  <div className={styles.sitePermissionActions}>
                    <button
                      type="button"
                      className={styles.sitePermissionEditButton}
                      onClick={() => openEditModal(site)}
                    >
                      <i className="bi bi-pencil-square" />
                      Edit
                    </button>

                    <button
                      type="button"
                      className={styles.sitePermissionDeleteButton}
                      onClick={() => handleDeleteSite(site.id)}
                    >
                      <i className="bi bi-trash" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {createOpen ? (
        <div className={styles.modalOverlay} onClick={closeCreateModal}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Create Site</h3>
                <p className={styles.sectionDescription}>Add a new site to this workspace.</p>
              </div>
            </div>

            <form onSubmit={handleCreateSite} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Site Name</label>
                <input
                  className={styles.searchInput}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Site name"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Domain</label>
                <input
                  className={styles.searchInput}
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="my-site.example.com"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <div className={styles.field}>
                  <label className={styles.label}>Website Type</label>
                  <select
                    className={styles.filterSelect}
                    value={type}
                    onChange={(e) => setType(e.target.value as SiteItem["type"])}
                  >
                    {WEBSITE_TYPE_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {toLabel(item)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Status</label>
                  <select
                    className={styles.filterSelect}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SiteItem["status"])}
                  >
                    {SITE_STATUS_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                  Public Site
                </label>
              </div>

              {formError ? <div className={styles.emptyState}>{formError}</div> : null}

              <div className={styles.profileActions}>
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={closeCreateModal}
                  disabled={submitting}
                >
                  Cancel
                </button>

                <button type="submit" className={styles.inviteButton} disabled={submitting}>
                  {submitting ? "Creating..." : "Create Site"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {editOpen ? (
        <div className={styles.modalOverlay} onClick={closeEditModal}>
          <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
            <div className={styles.sectionHeader}>
              <div>
                <h3 className={styles.sectionTitle}>Edit Site</h3>
                <p className={styles.sectionDescription}>Update site information for this workspace.</p>
              </div>
            </div>

            <form onSubmit={handleUpdateSite} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Site Name</label>
                <input
                  className={styles.searchInput}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Site name"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Domain</label>
                <input
                  className={styles.searchInput}
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="my-site.example.com"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 12,
                }}
              >
                <div className={styles.field}>
                  <label className={styles.label}>Website Type</label>
                  <select
                    className={styles.filterSelect}
                    value={type}
                    onChange={(e) => setType(e.target.value as SiteItem["type"])}
                  >
                    {WEBSITE_TYPE_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {toLabel(item)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Status</label>
                  <select
                    className={styles.filterSelect}
                    value={status}
                    onChange={(e) => setStatus(e.target.value as SiteItem["status"])}
                  >
                    {SITE_STATUS_OPTIONS.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
                  Public Site
                </label>
              </div>

              {formError ? <div className={styles.emptyState}>{formError}</div> : null}

              <div className={styles.profileActions}>
                <button type="button" className={styles.secondaryButton} onClick={closeEditModal} disabled={submitting}>
                  Cancel
                </button>

                <button type="submit" className={styles.editButton} disabled={submitting}>
                  {submitting ? "Saving..." : "Save Site"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
