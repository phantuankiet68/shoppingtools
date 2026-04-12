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
import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

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
  const { t, locale } = useAdminI18n();
  const currentLocale = (locale ?? "en") as "en" | "vi" | "ja";

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

  const getPageTitle = useCallback(
    (page?: InternalPage, fallback?: string) => {
      if (page?.labelKey) return t(page.labelKey);
      if (fallback && fallback.includes(".")) return t(fallback);
      return fallback ?? "";
    },
    [t],
  );

  const resolveDraftTitle = useCallback(
    (menuItem: BuilderMenuItem) => {
      const page = menuItem.internalPageId ? pagesById.get(menuItem.internalPageId) : undefined;
      return getPageTitle(page, menuItem.title);
    },
    [pagesById, getPageTitle],
  );

  const pagesForSet = useMemo(() => {
    const pages = INTERNAL_PAGES || [];
    return uniqBy(pages, (page) => page.id);
  }, [INTERNAL_PAGES]);

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
        return (page?.paths?.[currentLocale] ?? page?.paths?.en ?? raw) || null;
      }

      return null;
    },
    [pagesById, currentLocale],
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
    const fallbackPath =
      fallbackPage?.paths?.[currentLocale] ??
      fallbackPage?.paths?.en ??
      safeDraft.rawPath ??
      "";

    setDraft({
      ...safeDraft,
      internalPageId: fallbackPageId,
      rawPath: fallbackPath,
      title: getPageTitle(fallbackPage, safeDraft.title),
    });

    setPathInput(fallbackPath);
  }, [
    safeDraft,
    safeDraft.linkType,
    safeDraft.internalPageId,
    safeDraft.rawPath,
    safeDraft.title,
    pagesForSet,
    pagesById,
    currentLocale,
    setDraft,
    setPathInput,
    getPageTitle,
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
      return (
        page?.paths?.[currentLocale] ??
        page?.paths?.en ??
        (typeof safeDraft.rawPath === "string" ? safeDraft.rawPath : "") ??
        ""
      );
    }

    return buildHref(safeDraft, now);
  }, [safeDraft, pathInput, buildHref, pagesById, currentLocale]);

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

      const page = safeDraft.internalPageId ? pagesById.get(safeDraft.internalPageId) : undefined;
      const resolvedTitle =
        safeDraft.linkType === "internal"
          ? getPageTitle(page, safeDraft.title)
          : safeDraft.title;

      const nextDraft: BuilderMenuItem = {
        ...safeDraft,
        title: resolvedTitle,
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
        `${t("menus.edit.cannotUpdate")} ${
          (error as Error)?.message || t("menus.edit.unknownError")
        }`,
      );
    } finally {
      setSaving(false);
    }
  }, [
    pathInput,
    resolvePathForPatch,
    safeDraft,
    updateItem,
    setSaving,
    onClose,
    pagesById,
    getPageTitle,
    t,
  ]);

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

          if (page) {
            nextDraft.rawPath = page.paths?.[currentLocale] ?? page.paths?.en ?? "";
            nextDraft.title = getPageTitle(page, nextDraft.title);
            setPathInput(nextDraft.rawPath ?? "");
          }
        }

        return nextDraft;
      });
    },
    [
      setDraft,
      safeDraft,
      pathInput,
      setPathInput,
      pagesForSet,
      pagesById,
      currentLocale,
      getPageTitle,
    ],
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
        aria-label={t("menus.edit.title")}
      >
        <div className={styles.ocHeader}>
          <div className={styles.ocHeaderLeft}>
            <div className={styles.ocIcon} aria-hidden>
              <i className={iconPreview} />
            </div>
            <div>
              <div className={styles.ocTitle}>{t("menus.edit.title")}</div>
              <div className={styles.ocSub}>
                {t("menus.edit.menuSet")}: <b>{currentSet}</b> • ID: <code>{String(safeDraft.id)}</code>
              </div>
            </div>
          </div>

          <button
            className={styles.ocClose}
            onClick={onClose}
            type="button"
            aria-label={t("menus.edit.close")}
            disabled={saving}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.ocBody}>
          <section className={styles.panel}>
            <div className={styles.panelTitle}>
              <i className="bi bi-card-text" /> {t("menus.edit.basicInformation")}
            </div>

            <div className={styles.grid2}>
              <div>
                <label className={styles.formLabel}>{t("menus.edit.titleLabel")}</label>
                <input
                  className={styles.formControl}
                  value={resolveDraftTitle(safeDraft)}
                  onChange={(event) =>
                    setDraft({ ...safeDraft, title: event.target.value })
                  }
                />
              </div>

              <div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>{t("menus.edit.iconLabel")}</label>
                  <div className={styles.smallHelp}>
                    <i className="bi bi-box-arrow-up-right" />{" "}
                    <a
                      href="https://icons.getbootstrap.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {t("menus.edit.bootstrapIcons")}
                    </a>
                  </div>
                </div>

                <div className={styles.inputGroup}>
                  <span className={styles.inputGroupText}>
                    <i className={iconPreview} />
                  </span>
                  <input
                    className={styles.formControl}
                    placeholder={t("menus.edit.iconPlaceholder")}
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
              <i className="bi bi-link-45deg" /> {t("menus.edit.linkSettings")}
            </div>

            <div className={styles.grid2}>
              <div>
                <label className={styles.formLabel}>{t("menus.edit.linkType")}</label>
                <select
                  className={styles.formSelect}
                  value={safeDraft.linkType}
                  onChange={(event) =>
                    handleLinkTypeChange(event.target.value as BuilderMenuItem["linkType"])
                  }
                >
                  <option value="external">{t("menus.link.external")}</option>
                  <option value="internal">{t("menus.link.internal")}</option>
                  <option value="scheduled">{t("menus.link.scheduled")}</option>
                </select>
              </div>

              {safeDraft.linkType === "external" ? (
                <div>
                  <label className={styles.formLabel}>{t("menus.edit.externalUrl")}</label>
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
                    <span>{t("menus.edit.openInNewTab")}</span>
                  </label>
                </div>
              ) : null}

              {safeDraft.linkType === "internal" ? (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className={styles.formLabel}>{t("menus.edit.selectPage")}</label>
                  <select
                    className={styles.formSelect}
                    value={safeDraft.internalPageId || pagesForSet[0]?.id || ""}
                    onChange={(event) => {
                      const id = event.target.value;
                      const page = pagesById.get(id);

                      setDraft({
                        ...safeDraft,
                        internalPageId: id,
                        rawPath:
                          page?.paths?.[currentLocale] ??
                          page?.paths?.en ??
                          safeDraft.rawPath,
                        title: getPageTitle(page, safeDraft.title),
                      });

                      if (page) {
                        setPathInput(page.paths?.[currentLocale] ?? page.paths?.en ?? "");
                      }
                    }}
                  >
                    {pagesForSet.map((page) => (
                      <option key={page.id} value={page.id}>
                        {t(page.labelKey)} ({page.paths?.[currentLocale] ?? page.paths?.en ?? ""})
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
                        {t("menus.edit.schedulePoints")}
                      </label>
                      <div className={styles.smallHelp}>
                        {t("menus.edit.schedulePointsHelp")}
                      </div>
                    </div>

                    <button
                      className={`${styles.btn} ${styles.btnOutlineLight}`}
                      onClick={addScheduleRow}
                      type="button"
                    >
                      <i className="bi bi-plus-lg" /> {t("menus.edit.addPoint")}
                    </button>
                  </div>

                  {(safeDraft.schedules || []).length === 0 ? (
                    <div className={styles.emptyBox}>
                      <i className="bi bi-calendar2-week" />
                      <div>
                        <div className={styles.emptyTitle}>{t("menus.edit.noSchedulePoints")}</div>
                        <div className={styles.smallHelp}>
                          {t("menus.edit.noSchedulePointsHelp")}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.scheduleList}>
                      {(safeDraft.schedules || []).map(
                        (schedule: { when: string; url: string }, index: number) => (
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
                              title={t("menus.edit.delete")}
                            >
                              <i className="bi bi-trash3" />
                            </button>
                          </div>
                        ),
                      )}
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelTitle}>
              <i className="bi bi-signpost-2" /> {t("menus.edit.pathPreview")}
            </div>

            <div>
              <label className={styles.formLabel}>{t("menus.edit.pathSavedToDatabase")}</label>
              <input
                className={styles.formControl}
                placeholder={
                  safeDraft.linkType === "scheduled"
                    ? t("menus.edit.scheduledPathPlaceholder")
                    : t("menus.edit.pathPlaceholder")
                }
                value={pathInput}
                onChange={(event) => {
                  const value = event.target.value;
                  setPathInput(value);
                  setDraft({ ...safeDraft, rawPath: value });
                }}
              />
              <div className={styles.smallHelp}>{t("menus.edit.pathAutoHelp")}</div>
            </div>

            <div className={styles.previewBox}>
              <div className={styles.previewLeft}>
                <div className={styles.previewLabel}>
                  <i className="bi bi-eye" /> {t("menus.edit.previewUrl")}
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
                {copied ? t("menus.edit.copied") : t("menus.edit.copy")}
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
            <i className="bi bi-x-circle" /> {t("menus.edit.close")}
          </button>

          <button
            className={`${styles.btn} ${styles.btnPrimary}`}
            onClick={handleSave}
            disabled={saving}
            type="button"
          >
            {saving ? (
              <>
                <span className={styles.spinner} aria-hidden /> {t("menus.edit.saving")}
              </>
            ) : (
              <>
                <i className="bi bi-save" /> {t("menus.edit.saveChanges")}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}