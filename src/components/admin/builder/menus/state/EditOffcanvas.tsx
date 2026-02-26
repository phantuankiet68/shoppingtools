"use client";

import React, { useEffect, useMemo } from "react";
import styles from "@/styles/admin/menu/offcanvasBackdrop.module.css";
import {
  useMenuStore,
  type BuilderMenuItem,
  type InternalPage,
} from "@/components/admin/builder/menus/state/useMenuStore";

import { patchMenuItem } from "@/services/builder/menus/editOffcanvas.service";
import { useEditOffcanvasStore } from "@/store/builder/menus/useEditOffcanvasStore";

type ScheduleRow = { when: string; url: string };

type Props = {
  item: BuilderMenuItem;
  onClose: () => void;
};

function toLocalInputValue(v: string) {
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 16);
}

function uniqBy<T>(arr: T[], getKey: (t: T) => string) {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of arr) {
    const k = getKey(it);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
}

export default function EditOffcanvas({ item, onClose }: Props) {
  const { activeMenu, setActiveMenu, buildHref, currentSet, INTERNAL_PAGES } = useMenuStore();

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

  // Nếu draft chưa init thì dùng item
  const safeDraft = draft ?? item;

  const pagesById = useMemo(() => {
    const m = new Map<string, InternalPage>();
    (INTERNAL_PAGES || []).forEach((p) => m.set(p.id, p));
    return m;
  }, [INTERNAL_PAGES]);

  const pagesForSet = useMemo(() => {
    const pages = INTERNAL_PAGES || [];
    const filtered =
      currentSet === "v1"
        ? pages.filter((p: InternalPage) => (p.path || "").startsWith("/v1"))
        : pages.filter((p: InternalPage) => !(p.path || "").startsWith("/v1"));

    return uniqBy(filtered, (p) => `${p.id}__${p.path || ""}`);
  }, [currentSet, INTERNAL_PAGES]);

  function resolvePathForPatch(it: BuilderMenuItem): string | null {
    if (it.linkType === "external") {
      const url = (it.externalUrl ?? "").trim();
      const raw = typeof it.rawPath === "string" ? it.rawPath.trim() : "";
      return url || raw || null;
    }

    if (it.linkType === "internal") {
      const page = it.internalPageId ? pagesById.get(it.internalPageId) : undefined;
      const raw = typeof it.rawPath === "string" ? it.rawPath.trim() : "";
      return page?.path ?? (raw || null);
    }

    return null;
  }

  // init store state khi item đổi
  useEffect(() => {
    initFromItem(item, resolvePathForPatch(item) ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
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

  function updateItem(next: BuilderMenuItem) {
    const walk = (arr: BuilderMenuItem[]): BuilderMenuItem[] =>
      arr.map((it) => {
        if (it.id === next.id) return next;
        if (it.children?.length) return { ...it, children: walk(it.children) };
        return it;
      });

    setActiveMenu(walk(activeMenu || []));
  }

  const hrefPreview = useMemo(() => {
    const now = new Date();
    const manual = (pathInput ?? "").trim();

    if (safeDraft.linkType === "external") return manual || safeDraft.externalUrl || "";
    if (safeDraft.linkType === "internal") {
      if (manual) return manual;
      const p = safeDraft.internalPageId ? pagesById.get(safeDraft.internalPageId) : undefined;
      return p?.path ?? (typeof safeDraft.rawPath === "string" ? safeDraft.rawPath : "") ?? "";
    }
    return buildHref(safeDraft, now);
  }, [safeDraft, pathInput, buildHref, pagesById]);

  async function save() {
    try {
      setSaving(true);

      const manual = (pathInput ?? "").trim();
      const computed = resolvePathForPatch(safeDraft);

      const finalPath = safeDraft.linkType === "scheduled" ? null : manual || computed || null;

      const nextDraft: BuilderMenuItem = {
        ...safeDraft,
        ...(safeDraft.linkType === "external" && manual ? { externalUrl: manual } : {}),
        ...(manual ? { rawPath: manual } : {}),
      };

      updateItem(nextDraft);

      await patchMenuItem(nextDraft.id, {
        title: nextDraft.title,
        icon: nextDraft.icon ?? null,
        path: finalPath,
        visible: true, // giữ đúng logic cũ của bạn
      });
    } catch (e: any) {
      alert("Unable to update the database: " + (e?.message || "Unknown error"));
    } finally {
      setSaving(false);
      onClose();
    }
  }

  async function copyPreview() {
    try {
      await navigator.clipboard.writeText(hrefPreview || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {}
  }

  const iconPreview = (safeDraft.icon || "").trim() ? `bi ${safeDraft.icon}` : "bi bi-link-45deg";

  // đảm bảo internalPageId hợp lệ theo set
  useEffect(() => {
    if (safeDraft.linkType !== "internal") return;
    const current = safeDraft.internalPageId || "";
    if (current && pagesForSet.some((p) => p.id === current)) return;

    const fallback = pagesForSet[0]?.id;
    if (!fallback) return;

    const p = pagesById.get(fallback);
    setDraft({ ...safeDraft, internalPageId: fallback, rawPath: p?.path ?? safeDraft.rawPath });
    if (p?.path) setPathInput(p.path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeDraft.linkType, pagesForSet]);

  return (
    <div
      className={styles.offcanvasBackdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div className={styles.offcanvas} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className={styles.ocHeader}>
          <div className={styles.ocHeaderLeft}>
            <div className={styles.ocIcon} aria-hidden>
              <i className={iconPreview} />
            </div>
            <div>
              <div className={styles.ocTitle}>Edit menu item</div>
              <div className={styles.ocSub}>
                Set: <b>{currentSet}</b> • ID: <code>{String(safeDraft.id)}</code>
              </div>
            </div>
          </div>

          <button className={styles.ocClose} onClick={onClose} type="button" aria-label="Close" disabled={saving}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.ocBody}>
          {/* Basics */}
          <section className={styles.panel}>
            <div className={styles.panelTitle}>
              <i className="bi bi-card-text" /> Basics
            </div>

            <div className={styles.grid2}>
              <div>
                <label className={styles.formLabel}>Title</label>
                <input
                  className={styles.formControl}
                  value={safeDraft.title}
                  onChange={(e) => setDraft({ ...safeDraft, title: e.target.value })}
                />
              </div>

              <div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Icon</label>
                  <div className={styles.smallHelp}>
                    <i className="bi bi-box-arrow-up-right" />{" "}
                    <a href="https://icons.getbootstrap.com/" target="_blank" rel="noopener noreferrer">
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
                    placeholder="vd: bi-house-door, bi-bag"
                    value={safeDraft.icon || ""}
                    onChange={(e) => setDraft({ ...safeDraft, icon: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Link settings */}
          <section className={styles.panel}>
            <div className={styles.panelTitle}>
              <i className="bi bi-link-45deg" /> Link settings
            </div>

            <div className={styles.grid2}>
              <div>
                <label className={styles.formLabel}>Link Strategy</label>
                <select
                  className={styles.formSelect}
                  value={safeDraft.linkType}
                  onChange={(e) => {
                    const lt = e.target.value as BuilderMenuItem["linkType"];
                    setDraft(() => {
                      const next = { ...safeDraft, linkType: lt } as BuilderMenuItem;

                      if (lt === "external") {
                        const manual = (pathInput ?? "").trim();
                        if (!manual && next.externalUrl) setPathInput(next.externalUrl);
                        if (next.externalUrl) next.rawPath = next.externalUrl;
                      } else if (lt === "internal") {
                        const pid = next.internalPageId || pagesForSet[0]?.id;
                        const p = pid ? pagesById.get(pid) : undefined;
                        if (pid) next.internalPageId = pid;
                        if (p?.path) {
                          setPathInput(p.path);
                          next.rawPath = p.path;
                        }
                      }
                      return next;
                    });
                  }}
                >
                  <option value="external">External URL</option>
                  <option value="internal">Internal Page</option>
                  <option value="scheduled">Scheduled Links</option>
                </select>
              </div>

              {safeDraft.linkType === "external" ? (
                <div>
                  <label className={styles.formLabel}>External URL</label>
                  <input
                    className={styles.formControl}
                    placeholder="https://example.com"
                    value={safeDraft.externalUrl || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDraft({ ...safeDraft, externalUrl: v });

                      const current = (pathInput ?? "").trim();
                      if (!current || current === resolvePathForPatch(safeDraft)) setPathInput(v);
                    }}
                  />

                  <label className={styles.formCheck}>
                    <input
                      type="checkbox"
                      checked={!!(safeDraft as any).newTab}
                      onChange={(e) => setDraft({ ...(safeDraft as any), newTab: e.target.checked })}
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
                    onChange={(e) => {
                      const id = e.target.value;
                      const p = pagesById.get(id);
                      setDraft({ ...safeDraft, internalPageId: id, rawPath: p?.path ?? safeDraft.rawPath });
                      if (p?.path) setPathInput(p.path);
                    }}
                  >
                    {pagesForSet.map((p) => (
                      <option key={`${p.id}__${p.path || ""}`} value={p.id}>
                        {p.label} ({p.path})
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
                        Timeline
                      </label>
                      <div className={styles.smallHelp}>Add milestones to switch URL at specific times.</div>
                    </div>
                    <button
                      className={`${styles.btn} ${styles.btnOutlineLight}`}
                      onClick={addScheduleRow}
                      type="button"
                    >
                      <i className="bi bi-plus-lg" /> Add milestone
                    </button>
                  </div>

                  {(safeDraft.schedules || []).length === 0 ? (
                    <div className={styles.emptyBox}>
                      <i className="bi bi-calendar2-week" />
                      <div>
                        <div className={styles.emptyTitle}>No milestones yet</div>
                        <div className={styles.smallHelp}>Click “Add milestone” to create scheduled links.</div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.scheduleList}>
                      {(safeDraft.schedules || []).map((s, i) => (
                        <div key={`${safeDraft.id}-schedule-${i}`} className={styles.scheduleRow}>
                          <div className={styles.scheduleIdx}>{i + 1}</div>

                          <input
                            type="datetime-local"
                            className={styles.formControl}
                            value={s.when ? toLocalInputValue(s.when) : ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              const next = [...(safeDraft.schedules || [])];
                              next[i] = { ...next[i], when: v };
                              setDraft({ ...safeDraft, schedules: next });
                            }}
                          />
                          <input
                            className={styles.formControl}
                            placeholder="https://..."
                            value={s.url}
                            onChange={(e) => {
                              const v = e.target.value;
                              const next = [...(safeDraft.schedules || [])];
                              next[i] = { ...next[i], url: v };
                              setDraft({ ...safeDraft, schedules: next });
                            }}
                          />

                          <button
                            className={styles.btnIconDanger}
                            onClick={() => delScheduleRow(i)}
                            type="button"
                            title="Remove"
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

          {/* Path & preview */}
          <section className={styles.panel}>
            <div className={styles.panelTitle}>
              <i className="bi bi-signpost-2" /> Path & preview
            </div>

            <div>
              <label className={styles.formLabel}>Path saved to DB</label>
              <input
                className={styles.formControl}
                placeholder={
                  safeDraft.linkType === "scheduled" ? "(Scheduled path will not be saved.)" : "/path hoặc https://..."
                }
                value={pathInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setPathInput(v);
                  setDraft({ ...safeDraft, rawPath: v });
                }}
              />
              <div className={styles.smallHelp}>• Blank = auto-compute.</div>
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
                onClick={copyPreview}
                type="button"
                disabled={!hrefPreview}
              >
                <i className={copied ? "bi bi-check2" : "bi bi-clipboard"} /> {copied ? "Copied" : "Copy"}
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

          <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={save} disabled={saving} type="button">
            {saving ? (
              <>
                <span className={styles.spinner} aria-hidden /> Saving...
              </>
            ) : (
              <>
                <i className="bi bi-save" /> Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
