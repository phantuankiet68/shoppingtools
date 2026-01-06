// app/(admin)/menu/components/EditOffcanvas.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/menu/offcanvasBackdrop.module.css";
import { useMenuStore, INTERNAL_PAGES, type BuilderMenuItem } from "@/components/admin/menu/state/useMenuStore";

type ScheduleRow = { when: string; url: string };

type Props = {
  item: BuilderMenuItem;
  onClose: () => void;
};

export default function EditOffcanvas({ item, onClose }: Props) {
  const { activeMenu, setActiveMenu, buildHref, currentSet } = useMenuStore();
  const [draft, setDraft] = useState<BuilderMenuItem>(item);
  const [saving, setSaving] = useState(false);

  const [pathInput, setPathInput] = useState<string>("");

  useEffect(() => {
    setDraft(item);
    setPathInput(resolvePathForPatch(item) ?? "");
  }, [item]);

  function updateItem(next: BuilderMenuItem) {
    function walk(arr: BuilderMenuItem[]): BuilderMenuItem[] {
      return arr.map((it) => {
        if (it.id === next.id) return next;
        if (it.children?.length) return { ...it, children: walk(it.children) };
        return it;
      });
    }
    setActiveMenu(walk(activeMenu));
  }

  /** Tính path mặc định (chỉ để gợi ý/so sánh) */
  function resolvePathForPatch(it: BuilderMenuItem): string | null {
    if (it.linkType === "external") {
      const url = (it.externalUrl ?? "").trim();
      const raw = (it as any).rawPath ? String((it as any).rawPath).trim() : "";
      return url || raw || null;
    }
    if (it.linkType === "internal") {
      const page = it.internalPageId ? INTERNAL_PAGES.find((x) => x.id === it.internalPageId) : undefined;
      const raw = (it as any).rawPath ? String((it as any).rawPath).trim() : "";
      return page?.path ?? (raw || null);
    }
    // scheduled không lưu path
    return null;
  }

  /** Preview ưu tiên pathInput để phản hồi tức thời */
  const hrefPreview = useMemo(() => {
    const now = new Date();
    const manual = (pathInput ?? "").trim();

    if (draft.linkType === "external") {
      return manual || draft.externalUrl || "";
    }
    if (draft.linkType === "internal") {
      if (manual) return manual;
      const p = draft.internalPageId ? INTERNAL_PAGES.find((x) => x.id === draft.internalPageId) : undefined;
      return p?.path ?? (draft as any).rawPath ?? "";
    }
    // scheduled
    return buildHref(draft, now);
  }, [draft, pathInput, buildHref]);

  /** Lưu: cập nhật state + PATCH DB (title, icon, path) */
  async function save() {
    try {
      setSaving(true);

      const manual = (pathInput ?? "").trim();
      const computed = resolvePathForPatch(draft);
      const finalPath = manual || computed || null;

      // Đồng bộ optimistic vào state
      const nextDraft: BuilderMenuItem = {
        ...draft,
        ...(draft.linkType === "external" && manual ? { externalUrl: manual } : {}),
        ...(manual ? { rawPath: manual as any } : {}),
      };
      updateItem(nextDraft);

      // PATCH tuyệt đối (tránh bị chèn /vi/)
      const url = new URL(`/api/menu-items/${nextDraft.id}`, window.location.origin);
      const res = await fetch(url.toString(), {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: nextDraft.title,
          icon: nextDraft.icon ?? null,
          path: finalPath, // string | null
        }),
      });

      // Item mới (id tạm) có thể 404 – bỏ qua để không chặn flow
      if (!res.ok && res.status !== 404) {
        const txt = await res.text().catch(() => "");
        alert("Không thể cập nhật DB: " + (txt || res.status));
      }
    } finally {
      setSaving(false);
      onClose();
    }
  }

  function addScheduleRow() {
    const row: ScheduleRow = { when: "", url: "" };
    setDraft({ ...draft, schedules: [...(draft.schedules || []), row] });
  }

  function delScheduleRow(idx: number) {
    const next = [...(draft.schedules || [])];
    next.splice(idx, 1);
    setDraft({ ...draft, schedules: next });
  }

  // Gợi ý internal pages theo bộ hiện tại (home/v1)
  const pagesForSet = useMemo(() => {
    if (currentSet === "v1") return INTERNAL_PAGES.filter((p) => (p.path || "").startsWith("/v1"));
    return INTERNAL_PAGES.filter((p) => !(p.path || "").startsWith("/v1"));
  }, [currentSet]);

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;

    // lock background scroll
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";

    return () => {
      // restore
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
    };
  }, []);

  return (
    <div className={styles.offcanvasBackdrop}>
      <div className={styles.offcanvas}>
        <div className={styles.offcanvasHeader}>
          <h5>Chỉnh sửa MenuItem</h5>
          <button className={styles.btnClose} onClick={onClose} />
        </div>

        <div className={styles.offcanvasBody}>
          <div className={styles.vstack}>
            <div>
              <label className={styles.formLabel}>Tiêu đề</label>
              <input className={styles.formControl} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
            </div>

            {/* Icon */}
            <div>
              <label className={styles.formLabel}>Bootstrap Icon</label>
              <div className={styles.inputGroup}>
                <span className={styles.inputGroupText}>
                  <i className={`bi ${draft.icon || "bi-link-45deg"}`} />
                </span>
                <input className={styles.formControl} placeholder="vd: bi-house-door, bi-bag" value={draft.icon || ""} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} />
              </div>
              <div className={styles.smallHelp}>
                Danh sách:{" "}
                <a href="https://icons.getbootstrap.com/" target="_blank" rel="noopener">
                  Bootstrap Icons
                </a>
              </div>
            </div>

            {/* Link Strategy */}
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
                      if (!manual && next.externalUrl) {
                        setPathInput(next.externalUrl);
                        (next as any).rawPath = next.externalUrl;
                      }
                    } else if (lt === "internal") {
                      const p = next.internalPageId ? INTERNAL_PAGES.find((x) => x.id === next.internalPageId) : undefined;
                      if (p?.path) {
                        setPathInput(p.path);
                        (next as any).rawPath = p.path;
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

            {/* External */}
            {draft.linkType === "external" && (
              <div className={styles.vstack}>
                <label className={styles.formLabel}>External URL</label>
                <input
                  className={styles.formControl}
                  placeholder="https://example.com"
                  value={draft.externalUrl || ""}
                  onChange={(e) => {
                    const v = e.target.value;
                    setDraft({ ...draft, externalUrl: v });
                    const current = (pathInput ?? "").trim();
                    if (!current || current === resolvePathForPatch(draft)) {
                      setPathInput(v);
                    }
                  }}
                />
                <label className={styles.formCheck}>
                  <input type="checkbox" checked={!!draft.newTab} onChange={(e) => setDraft({ ...draft, newTab: e.target.checked })} />
                  <span>Mở tab mới</span>
                </label>
              </div>
            )}

            {/* Internal */}
            {draft.linkType === "internal" && (
              <div className={styles.vstack}>
                <label className={styles.formLabel}>
                  Chọn Page nội bộ (gợi ý theo <code>{currentSet}</code>)
                </label>
                <select
                  className={styles.formSelect}
                  value={draft.internalPageId || pagesForSet[0]?.id || ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    setDraft((d) => {
                      const next = { ...d, internalPageId: id };
                      const p = INTERNAL_PAGES.find((x) => x.id === id);
                      if (p?.path) {
                        setPathInput(p.path);
                        (next as any).rawPath = p.path;
                      }
                      return next;
                    });
                  }}>
                  {pagesForSet.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label} ({p.path})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Scheduled */}
            {draft.linkType === "scheduled" && (
              <div className={styles.vstack}>
                <div className={styles.headerRow}>
                  <label className={styles.formLabel}>Mốc thời gian</label>
                  <button className={`${styles.btn} ${styles.btnOutlineLight}`} onClick={addScheduleRow}>
                    <i className="bi bi-plus" /> Thêm mốc
                  </button>
                </div>
                <div className={styles.scheduleList}>
                  {(draft.schedules || []).map((s, i) => (
                    <div key={i} className={styles.scheduleRow}>
                      <input
                        type="datetime-local"
                        className={styles.formControl}
                        value={s.when ? new Date(s.when).toISOString().slice(0, 16) : ""}
                        onChange={(e) => {
                          const next = [...(draft.schedules || [])];
                          next[i] = { ...next[i], when: e.target.value };
                          setDraft({ ...draft, schedules: next });
                        }}
                      />
                      <input
                        className={styles.formControl}
                        placeholder="https://..."
                        value={s.url}
                        onChange={(e) => {
                          const next = [...(draft.schedules || [])];
                          next[i] = { ...next[i], url: e.target.value };
                          setDraft({ ...draft, schedules: next });
                        }}
                      />
                      <button className={`${styles.btn} ${styles.btnOutlineDanger} ${styles.btnIcon}`} onClick={() => delScheduleRow(i)}>
                        <i className="bi bi-dash" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Path editable */}
            <div className={styles.divider} />
            <div>
              <label className={styles.formLabel}>Đường dẫn (path) — sẽ lưu vào DB</label>
              <input
                className={styles.formControl}
                placeholder={draft.linkType === "scheduled" ? "(scheduled không lưu path)" : "/path hoặc https://..."}
                value={pathInput}
                onChange={(e) => {
                  const v = e.target.value;
                  setPathInput(v);
                  setDraft((d) => ({ ...d, rawPath: v as any }));
                }}
              />
              <div className={styles.smallHelp}>
                • Nếu để trống, hệ thống tự tính theo kiểu link ở trên.
                {draft.linkType === "external" ? " • Với external: path sẽ bằng chính URL." : ""}
              </div>
            </div>

            {/* Preview */}
            <div className={styles.smallHelp} style={{ marginTop: 8 }}>
              <i className="bi bi-eye" /> Preview URL:&nbsp;
              <code>{hrefPreview || "(trống)"}</code>
            </div>

            {/* Footer */}
            <div className={styles.footerRow} style={{ marginTop: 12 }}>
              <button className={`${styles.btn} ${styles.btnOutlineSecondary}`} onClick={onClose}>
                Đóng
              </button>
              <button className={`${styles.btn} ${styles.btnPrimary}`} onClick={save} disabled={saving}>
                <i className="bi bi-save" /> {saving ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
