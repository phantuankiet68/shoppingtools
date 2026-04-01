"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/platform/permission.module.css";
import type { StaffMember } from "./types";

type CreatedStaff = StaffMember & {
  workspaceId?: string | null;
  workspaceName?: string | null;
  workspaceSlug?: string | null;
  systemRole?: string;
  status?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (staff: CreatedStaff) => void;
};

export function CreateTenantAccessModal({ open, onClose, onCreated }: Props) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fullNamePreview = useMemo(() => `${firstName} ${lastName}`.trim() || "New Admin", [firstName, lastName]);

  useEffect(() => {
    if (!open) return;

    setFirstName("");
    setLastName("");
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setSubmitting(false);
    setError("");
  }, [open]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Email is required.");
      return;
    }

    if (!password) {
      setError("Password is required.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Confirm password does not match.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch("/api/platform/permission/create-tenants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: trimmedFirstName,
          lastName: trimmedLastName,
          email: normalizedEmail,
          password,
        }),
      });

      let data: CreatedStaff | { message?: string } | null = null;
      const contentType = response.headers.get("content-type") || "";

      if (contentType.includes("application/json")) {
        data = await response.json();
      }

      if (!response.ok) {
        throw new Error((data as { message?: string } | null)?.message || "Failed to create tenant access");
      }

      onCreated?.(data as CreatedStaff);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to create tenant access");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalCard} onClick={(e) => e.stopPropagation()}>
        <div className={styles.sectionHeader}>
          <div>
            <h3 className={styles.sectionTitle}>Create Tenant Access</h3>
            <p className={styles.sectionDescription}>
              Create a new tenant admin account with default SystemRole = ADMIN.
            </p>
          </div>
        </div>

        <div
          style={{
            marginBottom: 16,
            padding: "12px 14px",
            borderRadius: 12,
            border: "1px solid #dbeafe",
            background: "#eff6ff",
            color: "#1e3a8a",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 4 }}>Default account configuration</div>
          <div>Name preview: {fullNamePreview}</div>
          <div>SystemRole: ADMIN</div>
          <div>Status: ACTIVE</div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: 12,
            }}
          >
            <div className={styles.field}>
              <label className={styles.label}>First Name</label>
              <input
                className={styles.searchInput}
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Last Name</label>
              <input
                className={styles.searchInput}
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Last name"
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={styles.searchInput}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tenant-admin@example.com"
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
              <label className={styles.label}>Password</label>
              <input
                type="password"
                className={styles.searchInput}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 8 characters"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Confirm Password</label>
              <input
                type="password"
                className={styles.searchInput}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
              />
            </div>
          </div>

          {error ? <div className={styles.emptyState}>{error}</div> : null}

          <div className={styles.profileActions}>
            <button type="button" className={styles.secondaryButton} onClick={onClose} disabled={submitting}>
              Cancel
            </button>

            <button type="submit" className={styles.inviteButton} disabled={submitting}>
              {submitting ? "Creating..." : "Create Tenant Access"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
