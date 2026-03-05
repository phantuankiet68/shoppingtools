"use client";

import { useEffect } from "react";
import styles from "@/styles/admin/shared/common/delete-confirm-modal.module.css";

type Props = {
  open: boolean;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  danger?: boolean; // reserved if you want variants later
  onClose: () => void;
  onConfirm: () => void;
};

export default function DeleteConfirmModal({
  open,
  title = "Delete?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  onClose,
  onConfirm,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.iconWrap} aria-hidden="true">
          <div className={styles.iconCircle}>
            <i className={`bi bi-trash3 ${styles.trashIcon}`} />
          </div>
        </div>

        <div className={styles.title}>{title}</div>
        <div className={styles.desc}>{description}</div>

        <div className={styles.actions}>
          <button className={styles.cancelBtn} type="button" onClick={onClose} disabled={loading}>
            {cancelText}
          </button>

          <button className={styles.deleteBtn} type="button" onClick={onConfirm} disabled={loading}>
            {loading ? (
              <span className={styles.loading}>
                <i className={`bi bi-arrow-repeat ${styles.spin}`} /> Deleting...
              </span>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
