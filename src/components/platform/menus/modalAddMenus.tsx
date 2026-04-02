"use client";

import { FormEvent, MouseEvent, useEffect, useMemo, useState } from "react";
import styles from "@/styles/platform/modalAddMenus.module.css";

type MenuArea = "PLATFORM" | "ADMIN" | "SITE";

type ParentOption = {
  id: string;
  title: string;
  path: string | null;
  area?: MenuArea;
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
  siteIdOptions?: string[];
  parentOptions?: ParentOption[];
  defaultSiteId?: string;
  defaultArea?: MenuArea;
};

type FormState = {
  siteId: string;
  parentId: string;
  title: string;
  path: string;
  icon: string;
  sortOrder: string;
  visible: boolean;
  area: MenuArea;
};

const MENU_AREA_OPTIONS: Array<{ value: MenuArea; label: string }> = [
  { value: "PLATFORM", label: "Platform" },
  { value: "ADMIN", label: "Admin" },
  { value: "SITE", label: "Site" },
];

const createInitialForm = (defaultSiteId = "sitea01", defaultArea: MenuArea = "ADMIN"): FormState => ({
  siteId: defaultSiteId,
  parentId: "",
  title: "",
  path: "",
  icon: "",
  sortOrder: "0",
  visible: true,
  area: defaultArea,
});

function normalizeOptionalString(value: string): string | null {
  const normalized = value.trim();
  return normalized ? normalized : null;
}

export function ModalAddMenus({
  open,
  onClose,
  onCreated,
  siteIdOptions = [],
  parentOptions = [],
  defaultSiteId = "",
  defaultArea = "ADMIN",
}: Props) {
  const [form, setForm] = useState<FormState>(() => createInitialForm(defaultSiteId, defaultArea));
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setForm(createInitialForm(defaultSiteId, defaultArea));
    setError("");
    setSubmitting(false);
  }, [open, defaultSiteId, defaultArea]);

  const filteredParentOptions = useMemo(() => {
    return parentOptions.filter((parent) => !parent.area || parent.area === form.area);
  }, [parentOptions, form.area]);

  const canSubmit = useMemo(() => {
    return Boolean(form.siteId.trim()) && Boolean(form.title.trim()) && !submitting;
  }, [form.siteId, form.title, submitting]);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  function handleOverlayClick() {
    handleClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!canSubmit) {
      setError("Site ID and menu title are required.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await fetch("/api/platform/menus/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          siteId: form.siteId.trim(),
          parentId: normalizeOptionalString(form.parentId),
          title: form.title.trim(),
          path: normalizeOptionalString(form.path),
          icon: normalizeOptionalString(form.icon),
          sortOrder: Number(form.sortOrder || 0),
          visible: form.visible,
          area: form.area,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data: { message?: string } | null = contentType.includes("application/json") ? await response.json() : null;

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create menu");
      }

      await onCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Failed to create menu");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) return null;

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-menu-title"
        aria-describedby="add-menu-description"
        onClick={(event: MouseEvent<HTMLDivElement>) => event.stopPropagation()}
      >
        <div className={styles.header}>
          <div>
            <div className="d-flex gap-10">
              <span className={styles.eyebrow}>Create menu item</span>
              <h2 id="add-menu-title" className={styles.title}>
                Add Menu
              </h2>
            </div>
            <p id="add-menu-description" className={styles.description}>
              Create a new menu item and choose the appropriate <strong>MenuArea</strong>.
            </p>
          </div>

          <button
            type="button"
            className={styles.iconButton}
            onClick={handleClose}
            aria-label="Close modal"
            disabled={submitting}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.grid}>
            <label className={styles.field}>
              <span className={styles.label}>
                Site ID <em>*</em>
              </span>
              {siteIdOptions.length > 0 ? (
                <select
                  value={form.siteId}
                  onChange={(event) => updateField("siteId", event.target.value)}
                  className={styles.control}
                  required
                  disabled={submitting}
                >
                  <option value="">Select site</option>
                  {siteIdOptions.map((siteId) => (
                    <option key={siteId} value={siteId}>
                      {siteId}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={form.siteId}
                  onChange={(event) => updateField("siteId", event.target.value)}
                  className={styles.control}
                  placeholder="Enter siteId"
                  required
                  disabled={submitting}
                />
              )}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Menu Area</span>
              <select
                value={form.area}
                onChange={(event) => {
                  const nextArea = event.target.value as MenuArea;
                  setForm((prev) => ({
                    ...prev,
                    area: nextArea,
                    parentId: "",
                  }));
                }}
                className={styles.control}
                disabled={submitting}
              >
                {MENU_AREA_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Parent menu</span>
              <select
                value={form.parentId}
                onChange={(event) => updateField("parentId", event.target.value)}
                className={styles.control}
                disabled={submitting}
              >
                <option value="">No parent (root menu)</option>
                {filteredParentOptions.map((parent) => (
                  <option key={parent.id} value={parent.id}>
                    {parent.title}
                    {parent.path ? ` · ${parent.path}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className={styles.field}>
              <span className={styles.label}>
                Title <em>*</em>
              </span>
              <input
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className={styles.control}
                placeholder="Example: Dashboard"
                required
                disabled={submitting}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Path</span>
              <input
                value={form.path}
                onChange={(event) => updateField("path", event.target.value)}
                className={styles.control}
                placeholder="/admin/dashboard"
                disabled={submitting}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Bootstrap icon</span>
              <input
                value={form.icon}
                onChange={(event) => updateField("icon", event.target.value)}
                className={styles.control}
                placeholder="bi bi-grid"
                disabled={submitting}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Sort order</span>
              <input
                type="number"
                min={0}
                step={1}
                value={form.sortOrder}
                onChange={(event) => updateField("sortOrder", event.target.value)}
                className={styles.control}
                placeholder="0"
                disabled={submitting}
              />
            </label>
          </div>

          <div className={styles.inlineMeta}>
            <div className={styles.metaBox}>
              <span className={styles.metaLabel}>MenuArea</span>
              <strong className={styles.metaValue}>{form.area}</strong>
            </div>

            <label className={styles.visibilityToggle}>
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(event) => updateField("visible", event.target.checked)}
                disabled={submitting}
              />
              <span className={styles.visibilityTrack}>
                <span className={styles.visibilityThumb} />
              </span>
              <span className={styles.visibilityText}>{form.visible ? "Visible" : "Hidden"}</span>
            </label>
          </div>

          {error ? <div className={styles.errorBox}>{error}</div> : null}

          <div className={styles.footer}>
            <button type="button" className={styles.secondaryButton} onClick={handleClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className={styles.primaryButton} disabled={!canSubmit}>
              <i className="bi bi-plus-lg" />
              {submitting ? "Creating..." : "Create menu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
