"use client";

import React, { useEffect, useRef } from "react";
import styles from "@/styles/admin/popup/delete/ConfirmDialog.module.css";

export default function ConfirmDialog({
  open,
  title = "Confirm deletion",
  message = "Are you sure you want to delete this item?",
  dangerText = "Delete",
  cancelText = "Cancel",
  busy = false,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  message?: string;
  dangerText?: string;
  cancelText?: string;
  busy?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const dialogRef = useRef<HTMLDivElement | null>(null);

  // ESC to close + lock scroll
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      // focus trap minimal
      if (e.key === "Tab") {
        const root = dialogRef.current;
        if (!root) return;
        const focusables = Array.from(root.querySelectorAll<HTMLElement>('button,[href],[tabindex]:not([tabindex="-1"])')).filter((el) => !el.hasAttribute("disabled"));

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    const prevOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    window.addEventListener("keydown", onKeyDown);
    // focus Cancel by default
    setTimeout(() => cancelBtnRef.current?.focus(), 0);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.documentElement.style.overflow = prevOverflow;
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className={styles.backdrop}
      role="presentation"
      onMouseDown={(e) => {
        // click outside
        if (e.target === e.currentTarget) onCancel();
      }}>
      <div ref={dialogRef} className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-message" onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <div className={styles.iconWrap} aria-hidden>
              <i className="bi bi-exclamation-triangle" />
            </div>
            <div>
              <h5 id="confirm-title" className={styles.title}>
                {title}
              </h5>
              <div id="confirm-message" className={styles.message}>
                {message}
              </div>
            </div>
          </div>

          <button type="button" className={styles.close} onClick={onCancel} aria-label="Close" disabled={busy} title="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.footer}>
          <button ref={cancelBtnRef} type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onCancel} disabled={busy}>
            {cancelText}
          </button>

          <button type="button" className={`${styles.btn} ${styles.btnDanger}`} onClick={onConfirm} disabled={busy}>
            {busy ? (
              <>
                <span className={styles.spinner} aria-hidden />
                Deleting...
              </>
            ) : (
              <>
                <i className="bi bi-trash3" /> {dangerText}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
