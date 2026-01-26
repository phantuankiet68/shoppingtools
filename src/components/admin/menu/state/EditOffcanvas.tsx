"use client";

import React, { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/menu/offcanvasBackdrop.module.css";
import { useMenuStore, type BuilderMenuItem, type InternalPage } from "@/components/admin/menu/state/useMenuStore";

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

  const [draft, setDraft] = useState<BuilderMenuItem>(item);
  const [saving, setSaving] = useState(false);
  const [pathInput, setPathInput] = useState<string>("");
  const [copied, setCopied] = useState(false);

  // Map pages by id để lookup nhanh
  const pagesById = useMemo(() => {
    const m = new Map<string, InternalPage>();
    (INTERNAL_PAGES || []).forEach((p) => {
      // nếu id trùng thì item sau sẽ overwrite — OK cho lookup, UI option sẽ được dedupe ở pagesForSet
      m.set(p.id, p);
    });
    return m;
  }, [INTERNAL_PAGES]);

  // ✅ chuẩn hoá pages theo set hiện tại + dedupe theo (id + path)
  const pagesForSet = useMemo(() => {
    const pages = INTERNAL_PAGES || [];
    const filtered = currentSet === "v1" ? pages.filter((p: InternalPage) => (p.path || "").startsWith("/v1")) : pages.filter((p: InternalPage) => !(p.path || "").startsWith("/v1"));

    // dedupe tránh trùng key (orders, etc.)
    const deduped = uniqBy(filtered, (p) => `${p.id}__${p.path || ""}`);
    return deduped;
  }, [currentSet, INTERNAL_PAGES]);

  // khi item đổi -> reset draft + pathInput
  useEffect(() => {
    setDraft(item);
    setPathInput(resolvePathForPatch(item) ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item]);

  // ESC + lock scroll
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

    return null; // scheduled
  }

  const hrefPreview = useMemo(() => {
    const now = new Date();
    const manual = (pathInput ?? "").trim();

    if (draft.linkType === "external") return manual || draft.externalUrl || "";
    if (draft.linkType === "internal") {
      if (manual) return manual;
      const p = draft.internalPageId ? pagesById.get(draft.internalPageId) : undefined;
      return p?.path ?? (typeof draft.rawPath === "string" ? draft.rawPath : "") ?? "";
    }
    return buildHref(draft, now);
  }, [draft, pathInput, buildHref, pagesById]);

  async function save() {
    try {
      setSaving(true);

      const manual = (pathInput ?? "").trim();
      const computed = resolvePathForPatch(draft);
      const finalPath = manual || computed || null;

      const nextDraft: BuilderMenuItem = {
        ...draft,
        ...(draft.linkType === "external" && manual ? { externalUrl: manual } : {}),
        ...(manual ? { rawPath: manual } : {}),
      };

      updateItem(nextDraft);

      const url = new URL(`/api/admin/menu-items/${nextDraft.id}`, window.location.origin);
      const res = await fetch(url.toString(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: nextDraft.title,
          icon: nextDraft.icon ?? null,
          path: finalPath,
          newTab: (nextDraft as any).newTab ?? null,
        }),
      });

      if (!res.ok && res.status !== 404) {
        const txt = await res.text().catch(() => "");
        alert("Unable to update the database: " + (txt || res.status));
      }
    } finally {
      setSaving(false);
      onClose();
    }
  }

  function addScheduleRow() {
    const row: ScheduleRow = { when: "", url: "" };
    setDraft((d) => ({ ...d, schedules: [...(d.schedules || []), row] }));
  }

  function delScheduleRow(idx: number) {
    setDraft((d) => {
      const next = [...(d.schedules || [])];
      next.splice(idx, 1);
      return { ...d, schedules: next };
    });
  }

  async function copyPreview() {
    try {
      await navigator.clipboard.writeText(hrefPreview || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 900);
    } catch {}
  }

  const iconPreview = (draft.icon || "").trim() ? `bi ${draft.icon}` : "bi bi-link-45deg";

  // ✅ chọn default internalPageId hợp lệ theo pagesForSet (tránh select value mismatch)
  useEffect(() => {
    if (draft.linkType !== "internal") return;
    const current = draft.internalPageId || "";
    if (current && pagesForSet.some((p) => p.id === current)) return;

    const fallback = pagesForSet[0]?.id;
    if (!fallback) return;

    setDraft((d) => ({ ...d, internalPageId: fallback, rawPath: pagesById.get(fallback)?.path ?? d.rawPath }));
    const p = pagesById.get(fallback);
    if (p?.path) setPathInput(p.path);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.linkType, pagesForSet]);

  return (
    <div
      className={styles.offcanvasBackdrop}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation">
      <div className={styles.offcanvas} onMouseDown={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        {/* Header */}
        <div className={styles.ocHeader}>
          <div className={styles.ocHeaderLeft}>
            <div className={styles.ocIcon} aria-hidden>
              <i className={iconPreview} />
            </div>
            <div>
              <div className={styles.ocTitle}>Edit menu item</div>
              <div className={styles.ocSub}>
                Set: <b>{currentSet}</b> • ID: <code>{String(draft.id)}</code>
              </div>
            </div>
          </div>

          <button className={styles.ocClose} onClick={onClose} type="button" aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {/* Body */}
        <div className={styles.ocBody}>
          {/* Basics */}
          <section className={styles.panel}>
            <div className={styles.panelTitle}>
              <i className="bi bi-card-text" /> Basics
            </div>

            <div className={styles.grid2}>
              <div>
                <label className={styles.formLabel}>Title</label>
                <input className={styles.formControl} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              </div>

              <div>
                <label className={styles.formLabel}>Bootstrap Icon</label>
                <div className={styles.inputGroup}>
                  <span className={styles.inputGroupText}>
                    <i className={iconPreview} />
                  </span>
                  <input className={styles.formControl} placeholder="vd: bi-house-door, bi-bag" value={draft.icon || ""} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} />
                </div>
                <div className={styles.smallHelp}>
                  <i className="bi bi-box-arrow-up-right" />{" "}
                  <a href="https://icons.getbootstrap.com/" target="_blank" rel="noopener noreferrer">
                    Bootstrap Icons
                  </a>
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
                  value={draft.linkType}
                  onChange={(e) => {
                    const lt = e.target.value as BuilderMenuItem["linkType"];
                    setDraft((d) => {
                      const next = { ...d, linkType: lt } as BuilderMenuItem;

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
                  }}>
                  <option value="external">External URL</option>
                  <option value="internal">Internal Page</option>
                  <option value="scheduled">Scheduled Links</option>
                </select>
              </div>

              {draft.linkType === "external" ? (
                <div>
                  <label className={styles.formLabel}>External URL</label>
                  <input
                    className={styles.formControl}
                    placeholder="https://example.com"
                    value={draft.externalUrl || ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      setDraft({ ...draft, externalUrl: v });

                      const current = (pathInput ?? "").trim();
                      if (!current || current === resolvePathForPatch(draft)) setPathInput(v);
                    }}
                  />
                  <label className={styles.formCheck}>
                    <input type="checkbox" checked={!!(draft as any).newTab} onChange={(e) => setDraft({ ...(draft as any), newTab: e.target.checked })} />
                    <span>Open in new tab</span>
                  </label>
                </div>
              ) : null}

              {draft.linkType === "internal" ? (
                <div style={{ gridColumn: "1 / -1" }}>
                  <label className={styles.formLabel}>Select internal page</label>
                  <select
                    className={styles.formSelect}
                    value={draft.internalPageId || pagesForSet[0]?.id || ""}
                    onChange={(e) => {
                      const id = e.target.value;
                      setDraft((d) => {
                        const next = { ...d, internalPageId: id };
                        const p = pagesById.get(id);
                        if (p?.path) {
                          setPathInput(p.path);
                          next.rawPath = p.path;
                        }
                        return next;
                      });
                    }}>
                    {pagesForSet.map((p) => (
                      // ✅ key unique tuyệt đối, tránh warning
                      <option key={`${p.id}__${p.path || ""}`} value={p.id}>
                        {p.label} ({p.path})
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {draft.linkType === "scheduled" ? (
                <div style={{ gridColumn: "1 / -1" }}>
                  <div className={styles.rowBetween}>
                    <div>
                      <label className={styles.formLabel} style={{ marginBottom: 0 }}>
                        Timeline
                      </label>
                      <div className={styles.smallHelp}>Add milestones to switch URL at specific times.</div>
                    </div>
                    <button className={`${styles.btn} ${styles.btnOutlineLight}`} onClick={addScheduleRow} type="button">
                      <i className="bi bi-plus-lg" /> Add milestone
                    </button>
                  </div>

                  {(draft.schedules || []).length === 0 ? (
                    <div className={styles.emptyBox}>
                      <i className="bi bi-calendar2-week" />
                      <div>
                        <div className={styles.emptyTitle}>No milestones yet</div>
                        <div className={styles.smallHelp}>Click “Add milestone” to create scheduled links.</div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.scheduleList}>
                      {(draft.schedules || []).map((s, i) => (
                        <div key={`${draft.id}-schedule-${i}`} className={styles.scheduleRow}>
                          <div className={styles.scheduleIdx}>{i + 1}</div>

                          <input
                            type="datetime-local"
                            className={styles.formControl}
                            value={s.when ? toLocalInputValue(s.when) : ""}
                            onChange={(e) => {
                              const v = e.target.value;
                              setDraft((d) => {
                                const next = [...(d.schedules || [])];
                                next[i] = { ...next[i], when: v };
                                return { ...d, schedules: next };
                              });
                            }}
                          />
                          <input
                            className={styles.formControl}
                            placeholder="https://..."
                            value={s.url}
                            onChange={(e) => {
                              const v = e.target.value;
                              setDraft((d) => {
                                const next = [...(d.schedules || [])];
                                next[i] = { ...next[i], url: v };
                                return { ...d, schedules: next };
                              });
                            }}
                          />

                          <button className={styles.btnIconDanger} onClick={() => delScheduleRow(i)} type="button" title="Remove">
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

          {/* Path & Preview */}
          <section className={styles.panel}>
            <div className={styles.panelTitle}>
              <i className="bi bi-signpost-2" /> Path & preview
            </div>

            <div>
              <label className={styles.formLabel}>Path saved to DB</label>
              <input
                className={styles.formControl}
                placeholder={draft.linkType === "scheduled" ? "(Scheduled path will not be saved.)" : "/path hoặc https://..."}
                value={pathInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setPathInput(v);
                  setDraft((d) => ({ ...d, rawPath: v }));
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

              <button className={`${styles.btn} ${styles.btnOutlineSecondary}`} onClick={copyPreview} type="button" disabled={!hrefPreview}>
                <i className={copied ? "bi bi-check2" : "bi bi-clipboard"} /> {copied ? "Copied" : "Copy"}
              </button>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className={styles.ocFooter}>
          <button className={`${styles.btn} ${styles.btnOutlineSecondary}`} onClick={onClose} type="button" disabled={saving}>
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
