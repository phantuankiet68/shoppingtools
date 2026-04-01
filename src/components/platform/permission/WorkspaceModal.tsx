"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/platform/permission.module.css";

type WorkspacePayload = {
  workspace: {
    id: string;
    name: string;
    slug: string;
    ownerUserId: string;
  };
};

type Props = {
  open: boolean;
  ownerUserId: string;
  ownerName: string;
  onClose: () => void;
  onCreated?: (data: WorkspacePayload) => void;
};

function toSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

export function WorkspaceModal({ open, ownerUserId, ownerName, onClose, onCreated }: Props) {
  const defaultName = useMemo(() => {
    return ownerName ? `${ownerName} Workspace` : "New Workspace";
  }, [ownerName]);

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setName(defaultName);
    setSlug(toSlug(defaultName));
    setSubmitting(false);
    setError("");
  }, [open, defaultName]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedName = name.trim();
    const normalizedSlug = toSlug(slug || name);

    if (!trimmedName) {
      setError("Workspace name is required.");
      return;
    }

    if (!normalizedSlug) {
      setError("Workspace slug is required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch("/api/platform/permission/workspaces", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: trimmedName,
          slug: normalizedSlug,
          ownerUserId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create workspace");
      }

      onCreated?.(data);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to create workspace");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Create Workspace</h3>
            <p className={styles.sectionDescription}>Create a workspace and assign it to this user.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label}>Workspace Name</label>
            <input
              className={styles.searchInput}
              value={name}
              onChange={(e) => {
                const nextName = e.target.value;
                setName(nextName);
                setSlug(toSlug(nextName));
              }}
              placeholder="Workspace name"
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Slug</label>
            <input
              className={styles.searchInput}
              value={slug}
              onChange={(e) => setSlug(toSlug(e.target.value))}
              placeholder="workspace-slug"
            />
          </div>

          {error ? <div className={styles.emptyState}>{error}</div> : null}

          <div className={styles.profileActions}>
            <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={submitting}>
              Cancel
            </button>

            <button type="submit" className={styles.editButton} disabled={submitting}>
              {submitting ? "Creating..." : "Create Workspace"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
