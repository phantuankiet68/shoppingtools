"use client";

import { useEffect } from "react";
import styles from "@/styles/admin/shared/common/error-modal.module.css";

type Props = {
  open: boolean;
  title?: string;
  message?: string;
  buttonText?: string;
  onClose: () => void;
};

export default function ErrorModal({
  open,
  title = "Error",
  message = "Something went wrong. Please try again.",
  buttonText = "OK",
  onClose,
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
        <div className={styles.sparkles} aria-hidden="true">
          <span className={styles.sp} />
          <span className={styles.sp} />
          <span className={styles.sp} />
          <span className={styles.sp} />
          <span className={styles.sp} />
        </div>

        <div className={styles.iconWrap} aria-hidden="true">
          <div className={styles.ring}>
            <div className={styles.ringInner}>
              <i className={`bi bi-x-lg ${styles.xIcon}`} />
            </div>
          </div>
        </div>

        <div className={styles.title}>{title}</div>
        <div className={styles.desc}>{message}</div>

        <button className={styles.okBtn} type="button" onClick={onClose}>
          {buttonText}
        </button>
      </div>
    </div>
  );
}
