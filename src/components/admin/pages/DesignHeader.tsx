"use client";

import React from "react";
import cls from "@/styles/admin/pages/design-header.module.css";

type Device = "desktop" | "tablet";

type Props = {
  title: string;
  setTitle?: (v: string) => void;
  slug?: string;
  setSlug?: (v: string) => void;
  path?: string;
  saving?: boolean;
  saved?: boolean;
  publishing?: boolean;
  onSave?: () => void;
  onPublish?: () => void;
  onPreview?: () => void;
  onRefresh?: () => void;
  device?: Device;
  setDevice?: (d: Device) => void;
};

export default function DesignHeader({ title, setTitle, slug, setSlug, path, saving, saved, publishing, onSave, onPublish, onPreview, onRefresh, device = "desktop", setDevice }: Props) {
  const canEditTitle = Boolean(setTitle);
  const canEditSlug = Boolean(setSlug);

  return (
    <div className={`${cls.bar} mb-2`} role="toolbar" aria-label="Builder header">
      <div className={cls.left}>
        <div className={cls.iconGroup}>
          <button
            type="button"
            className={cls.iconBtn}
            onClick={() => {
              window.location.href = "/admin/builder/page";
            }}
            title="Refresh"
            aria-label="Refresh">
            <i className="bi bi-arrow-repeat" />
          </button>
        </div>
      </div>

      <div className={cls.center}>
        <div className={cls.titleRow}>
          {canEditTitle ? (
            <input className={cls.titleInput} value={title} onChange={(e) => setTitle?.(e.target.value)} placeholder="Nhập tiêu đề trang…" aria-label="Page title" />
          ) : (
            <span className={cls.title} title={title || "Untitled"}>
              {title || "Untitled"}
            </span>
          )}
        </div>

        <div className={cls.subRow}>
          {path && (
            <div className={`${cls.kv} ms-3`}>
              <span className="text-secondary small me-2">Path</span>
              <code className={cls.code}>{path}</code>
              <button
                type="button"
                className={`${cls.ghostBtn} ms-2`}
                title="Copy path"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(path);
                  } catch {}
                }}>
                <i className="bi bi-clipboard-check" />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={cls.right}>
        <div className={cls.btnGroup}>
          <button type="button" className={cls.ghostBtn} onClick={onSave} title="Save" aria-label="Save" disabled={saving}>
            {saving ? <span className="spinner-border spinner-border-sm me-2" /> : <i className="bi bi-save me-1" />}
            {saving ? "Saving…" : "Save"}
          </button>

          <button type="button" className={cls.ghostBtn} onClick={onPreview} title="Preview" aria-label="Preview">
            <i className="bi bi-eye me-1" />
            Preview
          </button>
        </div>

        <div className={cls.deviceGroup} role="group" aria-label="Device">
          {(["desktop"] as const).map((d) => (
            <button key={d} type="button" className={`${cls.deviceBtn} ${device === d ? cls.deviceActive : ""}`} onClick={() => setDevice?.(d)} title={d} aria-pressed={device === d}>
              <i className={`bi ${d === "desktop" ? "bi-display" : d === "tablet" ? "bi-tablet" : "bi-phone"}`} />
            </button>
          ))}
        </div>

        <button className={cls.publishBtn} onClick={onPublish} disabled={publishing || saving} aria-busy={publishing || saving} title="Publish">
          {publishing ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Đang publish…
            </>
          ) : (
            <>
              Publish
              <i className="bi bi-arrow-right-short ms-1" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
