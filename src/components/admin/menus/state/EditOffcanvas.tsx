"use client";

import React, { useCallback, useEffect, useMemo, useRef } from "react";
import styles from "@/styles/admin/menus/offcanvasBackdrop.module.css";
import {
  useMenuStore,
  type BuilderMenuItem,
  type InternalPage,
} from "@/components/admin/menus/state/useMenuStore";

import { patchMenuItem } from "@/services/menus/editOffcanvas.service";
import { useEditOffcanvasStore } from "@/store/menus/useEditOffcanvasStore";

type Props = {
  item: BuilderMenuItem;
  onClose: () => void;
};

function toLocalInputValue(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

function uniqBy<T>(arr: T[], getKey: (t: T) => string) {
  const seen = new Set<string>();
  const out: T[] = [];

  for (const item of arr) {
    const key = getKey(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  return out;
}

export default function EditOffcanvas({ item, onClose }: Props) {
  const {
    activeMenu,
    setActiveMenu,
    buildHref,
    currentSet,
    INTERNAL_PAGES,
  } = useMenuStore();

  const {
    draft,
    saving,
    pathInput,
    copied,
    initFromItem,
    setDraft,
    setSaving,
    setPathInput,
    setCopied,
    addScheduleRow,
    delScheduleRow,
  } = useEditOffcanvasStore();

  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const safeDraft = draft ?? item;

  const pagesById = useMemo(() => {
    const map = new Map<string, InternalPage>();
    (INTERNAL_PAGES || []).forEach((page) => {
      map.set(page.id, page);
    });
    return map;
  }, [INTERNAL_PAGES]);

  const pagesForSet = useMemo(() => {
    const pages = INTERNAL_PAGES || [];

    const filtered =
      currentSet === "v1"
        ? pages.filter((page) => (page.path || "").startsWith("/v1"))
        : pages.filter((page) => !(page.path || "").startsWith("/v1"));

    return uniqBy(filtered, (page) => `${page.id}__${page.path || ""}`);
  }, [currentSet, INTERNAL_PAGES]);

  const resolvePathForPatch = useCallback(
    (menuItem: BuilderMenuItem): string | null => {
      if (menuItem.linkType === "external") {
        const url = (menuItem.externalUrl ?? "").trim();
        const raw = typeof menuItem.rawPath === "string" ? menuItem.rawPath.trim() : "";
        return url || raw || null;
      }

      if (menuItem.linkType === "internal") {
        const page = menuItem.internalPageId ? pagesById.get(menuItem.internalPageId) : undefined;
        const raw = typeof menuItem.rawPath === "string" ? menuItem.rawPath.trim() : "";
        return (page?.path ?? raw) || null;
      }

      return null;
    },
    [pagesById],
  );

  useEffect(() => {
    initFromItem(item, resolvePathForPatch(item) ?? "");
  }, [item, initFromItem, resolvePathForPatch]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (safeDraft.linkType !== "internal") return;

    const currentInternalPageId = safeDraft.internalPageId || "";
    const isValidCurrentPage = currentInternalPageId
      ? pagesForSet.some((page) => page.id === currentInternalPageId)
      : false;

    if (isValidCurrentPage) return;

    const fallbackPageId = pagesForSet[0]?.id;
    if (!fallbackPageId) return;

    const fallbackPage = pagesById.get(fallbackPageId);
    const fallbackPath = fallbackPage?.path ?? safeDraft.rawPath ?? "";

    setDraft({
      ...safeDraft,
      internalPageId: fallbackPageId,
      rawPath: fallbackPath,
    });

    setPathInput(fallbackPath);
  }, [
    safeDraft,
    safeDraft.linkType,
    safeDraft.internalPageId,
    safeDraft.rawPath,
    pagesForSet,
    pagesById,
    setDraft,
    setPathInput,
  ]);

  const updateItem = useCallback(
    (nextItem: BuilderMenuItem) => {
      const walk = (items: BuilderMenuItem[]): BuilderMenuItem[] => {
        let changed = false;

        const result = items.map((menuItem) => {
          if (menuItem.id === nextItem.id) {
            changed = true;
            return nextItem;
          }

          if (menuItem.children?.length) {
            const nextChildren = walk(menuItem.children);
            if (nextChildren !== menuItem.children) {
              changed = true;
              return { ...menuItem, children: nextChildren };
            }
          }

          return menuItem;
        });

        return changed ? result : items;
      };

      setActiveMenu(walk(activeMenu || []));
    },
    [activeMenu, setActiveMenu],
  );

  const hrefPreview = useMemo(() => {
    const now = new Date();
    const manualPath = (pathInput ?? "").trim();

    if (safeDraft.linkType === "external") {
      return manualPath || safeDraft.externalUrl || "";
    }

    if (safeDraft.linkType === "internal") {
      if (manualPath) return manualPath;

      const page = safeDraft.internalPageId ? pagesById.get(safeDraft.internalPageId) : undefined;
      return page?.path ?? (typeof safeDraft.rawPath === "string" ? safeDraft.rawPath : "") ?? "";
    }

    return buildHref(safeDraft, now);
  }, [safeDraft, pathInput, buildHref, pagesById]);

  const iconPreview = useMemo(() => {
    return (safeDraft.icon || "").trim() ? `bi ${safeDraft.icon}` : "bi bi-link-45deg";
  }, [safeDraft.icon]);

  const handleSave = useCallback(async () => {
    try {
      setSaving(true);

      const manualPath = (pathInput ?? "").trim();
      const computedPath = resolvePathForPatch(safeDraft);

      const finalPath =
        safeDraft.linkType === "scheduled" ? null : manualPath || computedPath || null;

      const nextDraft: BuilderMenuItem = {
        ...safeDraft,
        ...(safeDraft.linkType === "external" && manualPath
          ? { externalUrl: manualPath }
          : {}),
        ...(manualPath ? { rawPath: manualPath } : {}),
      };

      updateItem(nextDraft);

      await patchMenuItem(nextDraft.id, {
        title: nextDraft.title,
        icon: nextDraft.icon ?? null,
        path: finalPath,
        visible: true,
      });

      onClose();
    } catch (error: unknown) {
      alert(
        "Cannot update data. " +
          ((error as Error)?.message || "An unknown error occurred."),
      );
    } finally {
      setSaving(false);
    }
  }, [pathInput, resolvePathForPatch, safeDraft, updateItem, setSaving, onClose]);

  const handleCopyPreview = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(hrefPreview || "");
      setCopied(true);

      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }

      copyTimerRef.current = setTimeout(() => {
        setCopied(false);
      }, 900);
    } catch {
      // no-op
    }
  }, [hrefPreview, setCopied]);

  const handleLinkTypeChange = useCallback(
    (value: BuilderMenuItem["linkType"]) => {
      setDraft((prevDraft: BuilderMenuItem | null) => {
        const baseDraft = prevDraft ?? safeDraft;
        const nextDraft = { ...baseDraft, linkType: value } as BuilderMenuItem;

        if (value === "external") {
          const manualPath = (pathInput ?? "").trim();
          if (!manualPath && nextDraft.externalUrl) {
            setPathInput(nextDraft.externalUrl);
          }
          if (nextDraft.externalUrl) {
            nextDraft.rawPath = nextDraft.externalUrl;
          }
        }

        if (value === "internal") {
          const pageId = nextDraft.internalPageId || pagesForSet[0]?.id;
          const page = pageId ? pagesById.get(pageId) : undefined;

          if (pageId) {
            nextDraft.internalPageId = pageId;
          }

          if (page?.path) {
            nextDraft.rawPath = page.path;
            setPathInput(page.path);
          }
        }

        return nextDraft;
      });
    },
    [setDraft, safeDraft, pathInput, setPathInput, pagesForSet, pagesById],
  );

  return (
    <div
      className={styles.offcanvasBackdrop}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
      role="presentation"
    >
      <div
        className={styles.offcanvas}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Edit menu item"
      >
        <div className={styles.ocHeader}>
          <div className={styles.ocHeaderLeft}>
            <div className={styles.ocIcon} aria-hidden>
              <i className={iconPreview} />
            </div>
            <div>
              <div className={styles.ocTitle}>Edit menu item</div>
              <div className={styles.ocSub}>
                Menu set: <b>{currentSet}</b> • ID: <code>{String(safeDraft.id)}</code>
              </div>
            </div>
          </div>

          <button
            className={styles.ocClose}
            onClick={onClose}
            type="button"
            aria-label="Close"
            disabled={saving}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.ocBody}>
          <section className={styles.panel}>
            <div className={styles.panelTitle}>
              <i className="bi bi-card-text" /> Basic information
            </div>

            <div className={styles.grid2}>
              <div>
                <label className={styles.formLabel}>Title</label>
                <input
                  className={styles.formControl}
                  value={safeDraft.title}
                  onChange={(event) =>
                    setDraft({ ...safeDraft, title: event.target.value })
                  }
                />
              </div>

              <div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Icon</label>
                  <div className={styles.smallHelp}>
                    <i className="bi bi-box-arrow-up-right" />{" "}
                    <a
                      href="https://icons.getbootstrap.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Bootstrap Icons
                    </a>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <span className={styles.inputGroupText}>
                    <i className={iconPreview} />
                  </span>
                  <input
                    className={styles.formControl}
                    placeholder="Example: bi-house-door, bi-bag"
                    value={safeDraft.icon || ""}
                    onChange={(event) =>
                      setDraft({ ...safeDraft, icon: event.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelTitle}>
              <i className="bi bi-link-45deg" /> Link settings
            </div>

            <div className={styles.grid2}>
              <div>
                <label className={styles.formLabel}>Link type</label>
                <select
                  className={styles.formSelect}
                  value={safeDraft.linkType}
                  onChange={(event) =>
                    handleLinkTypeChange(event.target.value as BuilderMenuItem["linkType"])
                  }
                >
                  <option value="external">External link</option>
                  <option value="internal">Internal page</option>
                  <option value="scheduled">Scheduled link</option>
                </select>
              </div>

              {safeDraft.linkType === "external" ? (
                <div>
                  <label className={styles.formLabel}>External URL</label>
                  <input
                    className={styles.formControl}
                    placeholder="https://example.com"
                    value={safeDraft.externalUrl || ""}
                    onChange={(event) => {
                      const value = event.target.value;
                      setDraft({ ...safeDraft, externalUrl: value });

                      const currentPath = (pathInput ?? "").trim();
                      if (!currentPath || currentPath === resolvePathForPatch(safeDraft)) {
                        setPathInput(value);
                      }
                    }}
                  />

                  <label className={styles.formCheck}>
                    <input
                      type="checkbox"
                      checked={!!safeDraft.newTab}
                      onChange={(event) =>
                        setDraft({ ...safeDraft, newTab: event.target.checked })
                      }
                    />
                    <span>Open in new tab</span>
                  </label>
                </div>
              ) : null}

              {safeDraft.linkType === "internal" ? (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className={styles.formLabel}>Select internal page</label>
                  <select
                    className={styles.formSelect}
                    value={safeDraft.internalPageId || pagesForSet[0]?.id || ""}
                    onChange={(event) => {
                      const id = event.target.value;
                      const page = pagesById.get(id);

                      setDraft({
                        ...safeDraft,
                        internalPageId: id,
                        rawPath: page?.path ?? safeDraft.rawPath,
                      });

                      if (page?.path) {
                        setPathInput(page.path);
                      }
                    }}
                  >
                    {pagesForSet.map((page) => (
                      <option key={`${page.id}__${page.path || ""}`} value={page.id}>
                        {page.label} ({page.path})
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {safeDraft.linkType === "scheduled" ? (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div className={styles.rowBetween}>
                    <div>
                      <label className={styles.formLabel} style={{ marginBottom: 0 }}>
                        Schedule points
                      </label>
                      <div className={styles.smallHelp}>
                        Add schedule points to automatically switch URLs based on the configured time.
                      </div>
                    </div>

                    <button
                      className={`${styles.btn} ${styles.btnOutlineLight}`}
                      onClick={addScheduleRow}
                      type="button"
                    >
                      <i className="bi bi-plus-lg" /> Add point
                    </button>
                  </div>

                  {(safeDraft.schedules || []).length === 0 ? (
                    <div className={styles.emptyBox}>
                      <i className="bi bi-calendar2-week" />
                      <div>
                        <div className={styles.emptyTitle}>No schedule points yet</div>
                        <div className={styles.smallHelp}>
                          Choose “Add point” to configure scheduled links.
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.scheduleList}>
                      {(safeDraft.schedules || []).map((schedule: { when: string; url: string }, index: number) => (
                        <div
                          key={`${safeDraft.id}-schedule-${index}`}
                          className={styles.scheduleRow}
                        >
                          <div className={styles.scheduleIdx}>{index + 1}</div>

                          <input
                            type="datetime-local"
                            className={styles.formControl}
                            value={schedule.when ? toLocalInputValue(schedule.when) : ""}
                            onChange={(event) => {
                              const value = event.target.value;
                              const nextSchedules = [...(safeDraft.schedules || [])];
                              nextSchedules[index] = {
                                ...nextSchedules[index],
                                when: value,
                              };
                              setDraft({ ...safeDraft, schedules: nextSchedules });
                            }}
                          />

                          <input
                            className={styles.formControl}
                            placeholder="https://..."
                            value={schedule.url}
                            onChange={(event) => {
                              const value = event.target.value;
                              const nextSchedules = [...(safeDraft.schedules || [])];
                              nextSchedules[index] = {
                                ...nextSchedules[index],
                                url: value,
                              };
                              setDraft({ ...safeDraft, schedules: nextSchedules });
                            }}
                          />

                          <button
                            className={styles.btnIconDanger}
                            onClick={() => delScheduleRow(index)}
                            type="button"
                            title="Delete"
                          >
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelTitle}>
              <i className="bi bi-signpost-2" /> Path and preview
            </div>

            <div>
              <label className={styles.formLabel}>Path saved to database</label>
              <input
                className={styles.formControl}
                placeholder={
                  safeDraft.linkType === "scheduled"
                    ? "(Scheduled links will not save a fixed path.)"
                    : "/path or https://..."
                }
                value={pathInput}
                onChange={(event) => {
                  const value = event.target.value;
                  setPathInput(value);
                  setDraft({ ...safeDraft, rawPath: value });
                }}
              />
              <div className={styles.smallHelp}>Leave empty = system will calculate it automatically.</div>
            </div>

            <div className={styles.previewBox}>
              <div className={styles.previewLeft}>
                <div className={styles.previewLabel}>
                  <i className="bi bi-eye" /> Preview URL
                </div>
                <div className={styles.previewValue}>
                  <code>{hrefPreview || "(empty)"}</code>
                </div>
              </div>

              <button
                className={`${styles.btn} ${styles.btnOutlineSecondary}`}
                onClick={handleCopyPreview}
                type="button"
                disabled={!hrefPreview}
              >
                <i className={copied ? "bi bi-check2" : "bi bi-clipboard"} />{" "}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </section>
        </div>

        <div className={styles.ocFooter}>
          <button
            className={`${styles.btn} ${styles.btnOutlineSecondary}`}
            onClick={onClose}
            type="button"
            disabled={saving}
          >
            <i className="bi bi-x-circle" /> Close
          </button>

          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleSave}
            disabled={saving}
            type="button"
          >
            {saving ? (
              <>
                <span className={styles.spinner} aria-hidden /> Saving...
              </>
            ) : (
              <>
                <i className="bi bi-save" /> Save changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}