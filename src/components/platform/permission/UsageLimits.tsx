"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/platform/permission.module.css";
import { UsageMetric } from "./types";

type Props = {
  items: UsageMetric[];
  editable?: boolean;
  loading?: boolean;
  onSave?: (items: UsageMetric[]) => Promise<void> | void;
};

export function UsageLimits({ items, editable = false, loading = false, onSave }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftItems, setDraftItems] = useState<UsageMetric[]>(items);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setDraftItems(items);
  }, [items]);

  const hasChanges = useMemo(() => {
    return JSON.stringify(draftItems) !== JSON.stringify(items);
  }, [draftItems, items]);

  function updateItem(index: number, patch: Partial<UsageMetric>) {
    setDraftItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  async function handleSave() {
    if (!onSave) {
      setIsEditing(false);
      return;
    }

    try {
      setSaving(true);
      await onSave(draftItems);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save usage limits", error);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraftItems(items);
    setIsEditing(false);
  }

  return (
    <div className={styles.permissionSection}>
      <div className={styles.sectionHeader}>
        <div>
          <h3 className={styles.sectionTitle}>Usage Limits</h3>
          <p className={styles.sectionDescription}>
            Quota by plan for pages, menus, categories, images, and templates.
          </p>
        </div>

        {editable ? (
          <div className={styles.profileActions}>
            {!isEditing ? (
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                <i className="bi bi-pencil-square" />
                Edit Limits
              </button>
            ) : (
              <>
                <button type="button" className={styles.secondaryButton} onClick={handleCancel} disabled={saving}>
                  <i className="bi bi-x-lg" />
                  Cancel
                </button>

                <button
                  type="button"
                  className={styles.editButton}
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                >
                  <i className="bi bi-check2-circle" />
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </>
            )}
          </div>
        ) : null}
      </div>

      <div className={styles.permissionTable}>
        <div className={styles.permissionTableHead}>
          <span>Resource</span>
          <span>Usage</span>
          <span>Summary</span>
        </div>

        <div className={styles.permissionRows}>
          {draftItems.map((item, index) => {
            const usageRatio = item.limit > 0 ? item.used / item.limit : 0;
            const badgeClass = usageRatio > 0.8 ? styles.badgeWarning : styles.badgeSuccess;

            return (
              <div key={item.key} className={styles.permissionRow}>
                <div className={styles.permissionType}>
                  {isEditing ? (
                    <input
                      type="text"
                      value={item.label}
                      onChange={(e) => updateItem(index, { label: e.target.value })}
                      className={styles.searchInput}
                    />
                  ) : (
                    item.label
                  )}
                </div>

                <div className={styles.permissionControl}>
                  {isEditing ? (
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <input
                        type="number"
                        min={0}
                        value={item.used}
                        onChange={(e) => updateItem(index, { used: Number(e.target.value) || 0 })}
                        className={styles.searchInput}
                        style={{ width: 90 }}
                      />
                      <span>/</span>
                      <input
                        type="number"
                        min={0}
                        value={item.limit}
                        onChange={(e) => updateItem(index, { limit: Number(e.target.value) || 0 })}
                        className={styles.searchInput}
                        style={{ width: 90 }}
                      />
                    </div>
                  ) : (
                    <div className={`${styles.permissionBadge} ${badgeClass}`}>
                      {item.used} / {item.limit}
                    </div>
                  )}
                </div>

                <div className={styles.permissionSummary}>
                  {isEditing ? (
                    <textarea
                      value={item.summary}
                      onChange={(e) => updateItem(index, { summary: e.target.value })}
                      className={styles.searchInput}
                      rows={3}
                      style={{ width: "100%", resize: "vertical" }}
                    />
                  ) : (
                    item.summary
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
