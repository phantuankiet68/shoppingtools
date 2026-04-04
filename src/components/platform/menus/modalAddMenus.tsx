"use client";

import { FormEvent, MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/platform/modalAddMenus.module.css";

export type MenuArea = "PLATFORM" | "ADMIN" | "SITE";

export type ParentOption = {
  id: string;
  title: string;
  path: string | null;
  area?: MenuArea;
};

export type SiteOption = {
  id: string;
  name: string;
  domain: string;
  status?: string;
  isPublic?: boolean;
};

type ModalAddMenusProps = {
  open: boolean;
  onClose: () => void;
  onCreated?: () => void | Promise<void>;
  siteOptions?: SiteOption[];
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

type SiteOptionsResponse = {
  ok?: boolean;
  data?: SiteOption[];
  message?: string;
};

type CreateMenuResponse = {
  ok?: boolean;
  message?: string;
};

const MENU_AREA_OPTIONS: Array<{ value: MenuArea; label: string }> = [
  { value: "PLATFORM", label: "Platform" },
  { value: "ADMIN", label: "Admin" },
  { value: "SITE", label: "Site" },
];

const EMPTY_SITE_OPTIONS: SiteOption[] = [];
const EMPTY_PARENT_OPTIONS: ParentOption[] = [];

function createInitialForm(defaultSiteId = "", defaultArea: MenuArea = "ADMIN"): FormState {
  return {
    siteId: defaultSiteId,
    parentId: "",
    title: "",
    path: "",
    icon: "",
    sortOrder: "0",
    visible: true,
    area: defaultArea,
  };
}

function normalizeOptionalString(value: string): string | null {
  const normalized = value.trim();
  return normalized ? normalized : null;
}

function slugifyTitle(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildPathFromTitle(area: MenuArea, title: string): string {
  const slug = slugifyTitle(title);
  if (!slug) return "";

  switch (area) {
    case "ADMIN":
      return `/admin/${slug}`;
    case "PLATFORM":
      return `/platform/${slug}`;
    case "SITE":
      return `/${slug}`;
    default:
      return `/admin/${slug}`;
  }
}

function safeParseInteger(value: string): number {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : 0;
}

export function ModalAddMenus({
  open,
  onClose,
  onCreated,
  siteOptions,
  parentOptions,
  defaultSiteId = "",
  defaultArea = "ADMIN",
}: ModalAddMenusProps) {
  const externalSiteOptions = siteOptions ?? EMPTY_SITE_OPTIONS;
  const availableParentOptions = parentOptions ?? EMPTY_PARENT_OPTIONS;

  const [form, setForm] = useState<FormState>(() => createInitialForm(defaultSiteId, defaultArea));
  const [submitting, setSubmitting] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fetchedSiteOptions, setFetchedSiteOptions] = useState<SiteOption[]>([]);

  const didUserEditPathRef = useRef(false);

  const effectiveSiteOptions = useMemo<SiteOption[]>(() => {
    return externalSiteOptions.length > 0 ? externalSiteOptions : fetchedSiteOptions;
  }, [externalSiteOptions, fetchedSiteOptions]);

  const filteredParentOptions = useMemo<ParentOption[]>(() => {
    return availableParentOptions.filter((parent) => !parent.area || parent.area === form.area);
  }, [availableParentOptions, form.area]);

  const canSubmit = useMemo(() => {
    return Boolean(form.siteId.trim()) && Boolean(form.title.trim()) && !submitting && !loadingSites;
  }, [form.siteId, form.title, submitting, loadingSites]);

  useEffect(() => {
    if (!open) return;

    didUserEditPathRef.current = false;
    setErrorMessage("");
    setSubmitting(false);
    setForm(createInitialForm(defaultSiteId, defaultArea));
  }, [open, defaultSiteId, defaultArea]);

  useEffect(() => {
    if (!open) return;
    if (externalSiteOptions.length > 0) return;

    const controller = new AbortController();

    async function fetchSites() {
      try {
        setLoadingSites(true);
        setErrorMessage("");

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

        const nextSites = Array.isArray(data?.data) ? data.data : [];
        setFetchedSiteOptions(nextSites);

        setForm((prev) => {
          if (prev.siteId.trim()) return prev;
          if (defaultSiteId.trim()) return prev;
          if (nextSites.length === 0) return prev;

          return {
            ...prev,
            siteId: nextSites[0].id,
          };
        });
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setErrorMessage(error instanceof Error ? error.message : "Failed to load sites");
      } finally {
        if (!controller.signal.aborted) {
          setLoadingSites(false);
        }
      }
    }

    fetchSites();

    return () => {
      controller.abort();
    };
  }, [open, externalSiteOptions, defaultSiteId]);

  function updateFormField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  function handleTitleChange(value: string) {
    setForm((prev) => {
      const nextPath = didUserEditPathRef.current ? prev.path : buildPathFromTitle(prev.area, value);

      return {
        ...prev,
        title: value,
        path: nextPath,
      };
    });
  }

  function handleAreaChange(nextArea: MenuArea) {
    setForm((prev) => {
      const nextPath = didUserEditPathRef.current ? prev.path : buildPathFromTitle(nextArea, prev.title);

      return {
        ...prev,
        area: nextArea,
        parentId: "",
        path: nextPath,
      };
    });
  }

  function handlePathChange(value: string) {
    didUserEditPathRef.current = true;
    updateFormField("path", value);
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
      setErrorMessage("Site và title là bắt buộc.");
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage("");

      const response = await fetch("/api/platform/menus/add", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify({
          siteId: form.siteId.trim(),
          parentId: normalizeOptionalString(form.parentId),
          title: form.title.trim(),
          path: normalizeOptionalString(form.path),
          icon: normalizeOptionalString(form.icon),
          sortOrder: safeParseInteger(form.sortOrder),
          visible: form.visible,
          area: form.area,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      const data =
        contentType.includes("application/json")
          ? ((await response.json()) as CreateMenuResponse)
          : null;

      if (!response.ok) {
        throw new Error(data?.message || "Failed to create menu");
      }

      await onCreated?.();
      onClose();
    } catch (error) {
      console.error(error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to create menu");
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
              Tạo menu mới và tự sinh path theo <strong>MenuArea</strong>.
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
                Site <em>*</em>
              </span>
              {effectiveSiteOptions.length > 0 ? (
                <select
                  value={form.siteId}
                  onChange={(event) => updateFormField("siteId", event.target.value)}
                  className={styles.control}
                  required
                  disabled={submitting || loadingSites}
                >
                  <option value="">Select site</option>
                  {effectiveSiteOptions.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name} ({site.domain})
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={form.siteId}
                  onChange={(event) => updateFormField("siteId", event.target.value)}
                  className={styles.control}
                  placeholder="Enter siteId"
                  required
                  disabled={submitting || loadingSites}
                />
              )}
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Menu Area</span>
              <select
                value={form.area}
                onChange={(event) => handleAreaChange(event.target.value as MenuArea)}
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
                onChange={(event) => updateFormField("parentId", event.target.value)}
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
                onChange={(event) => handleTitleChange(event.target.value)}
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
                onChange={(event) => handlePathChange(event.target.value)}
                className={styles.control}
                placeholder="/admin/dashboard"
                disabled={submitting}
              />
            </label>

            <label className={styles.field}>
              <span className={styles.label}>Bootstrap icon</span>
              <input
                value={form.icon}
                onChange={(event) => updateFormField("icon", event.target.value)}
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
                onChange={(event) => updateFormField("sortOrder", event.target.value)}
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

            <div className={styles.metaBox}>
              <span className={styles.metaLabel}>Preview path</span>
              <strong className={styles.metaValue}>{form.path || "-"}</strong>
            </div>

            <label className={styles.visibilityToggle}>
              <input
                type="checkbox"
                checked={form.visible}
                onChange={(event) => updateFormField("visible", event.target.checked)}
                disabled={submitting}
              />
              <span className={styles.visibilityTrack}>
                <span className={styles.visibilityThumb} />
              </span>
              <span className={styles.visibilityText}>{form.visible ? "Visible" : "Hidden"}</span>
            </label>
          </div>

          {loadingSites ? <div className={styles.infoBox}>Loading sites...</div> : null}
          {errorMessage ? <div className={styles.errorBox}>{errorMessage}</div> : null}

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