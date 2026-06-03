"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";

import { useAdminI18n } from "@/components/admin/providers/AdminI18nProvider";

import styles from "@/styles/admin/profile/AvatarUploadModal.module.css";

type Props = {
  open: boolean;
  onClose: () => void;
  currentImage?: string | null;
  onUploaded?: (newImageUrl: string) => void;
};

const MAX_MB = 5;
const ACCEPT = "image/*";

export default function AvatarUploadModal({ open, onClose, currentImage, onUploaded }: Props) {
  const { t } = useAdminI18n();

  const inputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const previewUrl = useMemo(() => {
    if (!file) {
      return "";
    }

    return URL.createObjectURL(file);
  }, [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function resetForm() {
    setFile(null);
    setErr("");
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  const hint = useMemo(() => `PNG, JPG, WEBP • Max ${MAX_MB}MB`, []);

  function pickFile() {
    inputRef.current?.click();
  }

  function validateAndSet(f: File | null) {
    if (!f) {
      return;
    }

    if (!f.type.startsWith("image/")) {
      setErr(t("profile.avatarModal.onlyImage"));
      return;
    }

    setErr(t("profile.avatarModal.imageTooLarge"));

    setErr("");
    setFile(f);
  }

  function onInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selectedFile = e.target.files?.[0] ?? null;

    validateAndSet(selectedFile);

    e.target.value = "";
  }

  function onDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();

    const selectedFile = e.dataTransfer.files?.[0] ?? null;

    validateAndSet(selectedFile);
  }

  function onDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
  }

  async function upload() {
    if (!file) {
      setErr(t("profile.avatarModal.selectImage"));

      return;
    }

    setBusy(true);
    setErr("");

    try {
      const fd = new FormData();

      fd.append("file", file);

      const res = await fetch("/api/admin/profile/upload", {
        method: "POST",
        body: fd,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setErr(data?.error ?? t("profile.avatarModal.uploadFailed"));

        return;
      }

      const imageUrl = data?.image as string | undefined;

      if (imageUrl) {
        onUploaded?.(imageUrl);
      }

      handleClose();
    } catch (error) {
      console.error(error);

      setErr(t("profile.avatarModal.uploadFailed"));
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className={styles.modalOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={t("profile.avatarModal.dialogLabel")}
    >
      <div className={styles.modalCard}>
        <div className={styles.modalHeader}>
          <div>
            <div className={styles.modalTitle}>{t("profile.avatarModal.title")}</div>

            <div className={styles.modalSub}>{t("profile.avatarModal.subtitle")}</div>
          </div>

          <button
            type="button"
            className={styles.modalClose}
            onClick={handleClose}
            aria-label={t("profile.avatarModal.close")}
            disabled={busy}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.modalBody}>
          <div className={styles.uploadGrid}>
            <div
              className={styles.dropzone}
              onClick={pickFile}
              onDrop={onDrop}
              onDragOver={onDragOver}
              role="button"
              tabIndex={0}
            >
              <div className={styles.dropIcon}>
                <i className="bi bi-cloud-arrow-up" />
              </div>

              <div className={styles.dropTitle}>{t("profile.avatarModal.dragDrop")}</div>

              <div className={styles.dropOr}>{t("profile.avatarModal.or")}</div>

              <div className={styles.dropBrowse}>{t("profile.avatarModal.browse")}</div>

              <div className={styles.dropHint}>{hint}</div>

              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className={styles.hiddenFile}
                onChange={onInputChange}
              />
            </div>

            <div className={styles.previewPanel}>
              <div className={styles.previewTitle}>{t("profile.avatarModal.preview")}</div>

              <div className={styles.previewBox}>
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt={t("profile.avatarModal.previewAvatar")}
                    fill
                    sizes="300px"
                    className={styles.previewImg}
                  />
                ) : currentImage ? (
                  <Image
                    src={currentImage}
                    alt={t("profile.avatarModal.currentAvatar")}
                    fill
                    sizes="300px"
                    className={styles.previewImg}
                  />
                ) : (
                  <div className={styles.previewEmpty}>{t("profile.avatarModal.noImage")}</div>
                )}
              </div>

              <div className={styles.previewMeta}>
                <div className={styles.previewName}>{file?.name ?? "—"}</div>

                <div className={styles.previewStatus}>
                  {file ? t("profile.avatarModal.ready") : t("profile.avatarModal.noFileSelected")}
                </div>
              </div>

              <div className={styles.previewActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setFile(null)}
                  disabled={busy || !file}
                >
                  {t("profile.avatarModal.remove")}
                </button>

                <button type="button" className={styles.primaryBtn} onClick={upload} disabled={busy || !file}>
                  {busy ? t("profile.avatarModal.uploading") : t("profile.avatarModal.upload")}
                </button>
              </div>

              {err ? <div className={styles.errorText}>{err}</div> : null}
            </div>
          </div>
        </div>

        <div className={styles.modalFooter}>
          <button type="button" className={styles.linkBtn} onClick={handleClose} disabled={busy}>
            {t("profile.avatarModal.close")}
          </button>
        </div>
      </div>
    </div>
  );
}
