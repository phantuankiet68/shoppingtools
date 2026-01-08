"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/profile/AvatarUploadModal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  currentImage?: string | null;
  onUploaded?: (newImageUrl: string) => void; // để update UI sau upload
};

const MAX_MB = 5;
const ACCEPT = "image/*";

export default function AvatarUploadModal({ open, onClose, currentImage, onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setFile(null);
    setErr("");
    setPreviewUrl("");
  }, [open]);

  // create preview URL
  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const hint = useMemo(() => `PNG, JPG, WEBP • Max ${MAX_MB}MB`, []);

  function pickFile() {
    inputRef.current?.click();
  }

  function validateAndSet(f: File | null) {
    if (!f) return;

    if (!f.type.startsWith("image/")) {
      setErr("Chỉ cho phép file ảnh (PNG/JPG/WEBP).");
      return;
    }

    const maxBytes = MAX_MB * 1024 * 1024;
    if (f.size > maxBytes) {
      setErr(`Ảnh quá lớn. Tối đa ${MAX_MB}MB.`);
      return;
    }

    setErr("");
    setFile(f);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    validateAndSet(f);
    // reset input để chọn lại cùng 1 file vẫn trigger change
    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] ?? null;
    validateAndSet(f);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  async function upload() {
    if (!file) {
      setErr("Vui lòng chọn 1 ảnh trước khi upload.");
      return;
    }

    setBusy(true);
    setErr("");
    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/admin/user/avatar", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data?.error || "Upload thất bại.");
        return;
      }

      const url = data?.image as string | undefined;
      if (url) onUploaded?.(url);
      onClose();
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true" aria-label="Upload avatar">
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>Upload Avatar</div>
            <div className={styles.modalSub}>Chỉ chọn 1 ảnh • Có preview</div>
          </div>

          <button type="button" className={styles.modalClose} onClick={onClose} aria-label="Close" disabled={busy}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.uploadGrid}>
            {/* Left: Dropzone */}
            <div className={styles.dropzone} onClick={pickFile} onDrop={onDrop} onDragOver={onDragOver} role="button" tabIndex={0}>
              <div className={styles.dropIcon}>
                <i className="bi bi-cloud-arrow-up" />
              </div>

              <div className={styles.dropTitle}>Drag & Drop ảnh vào đây</div>
              <div className={styles.dropOr}>hoặc</div>
              <div className={styles.dropBrowse}>Bấm để chọn ảnh</div>
              <div className={styles.dropHint}>{hint}</div>

              <input ref={inputRef} type="file" accept={ACCEPT} className={styles.hiddenFile} onChange={onInputChange} />
            </div>

            {/* Right: Preview */}
            <div className={styles.previewPanel}>
              <div className={styles.previewTitle}>Preview</div>

              <div className={styles.previewBox}>
                {previewUrl ? (
                  <img className={styles.previewImg} src={previewUrl} alt="Preview avatar" />
                ) : currentImage ? (
                  <img className={styles.previewImg} src={currentImage} alt="Current avatar" />
                ) : (
                  <div className={styles.previewEmpty}>Chưa có ảnh</div>
                )}
              </div>

              <div className={styles.previewMeta}>
                <div className={styles.previewName}>{file?.name ?? "—"}</div>
                <div className={styles.previewStatus}>{file ? "Ready" : "No file selected"}</div>
              </div>

              <div className={styles.previewActions}>
                <button type="button" className={styles.secondaryBtn} onClick={() => setFile(null)} disabled={busy || !file}>
                  Remove
                </button>

                <button type="button" className={styles.primaryBtn} onClick={upload} disabled={busy || !file}>
                  {busy ? "Uploading..." : "Upload"}
                </button>
              </div>

              {err ? <div className={styles.errorText}>{err}</div> : null}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.linkBtn} onClick={onClose} disabled={busy}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
