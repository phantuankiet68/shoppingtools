// components/ui/PopupNotice.tsx
"use client";

import React, { useEffect } from "react";
import css from "@/styles/ui/popupNotice.module.css";

type Variant = "success" | "error" | "info" | "warning";

export default function PopupNotice({
  open,
  title,
  message,
  variant = "info",
  autoHideMs = 2800,
  onClose,
}: {
  open: boolean;
  title?: string;
  message?: string;
  variant?: Variant;
  autoHideMs?: number;
  onClose?: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), autoHideMs);
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onEsc);
    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onEsc);
    };
  }, [open, autoHideMs, onClose]);

  if (!open) return null;

  return (
    <div className={`${css.wrap}`}>
      <div className={`${css.card} ${css[variant]}`} role="status" aria-live="polite">
        <div className={css.header}>
          <span className={css.title}>
            {iconFor(variant)} {title ?? "Thông báo"}
          </span>
          <button className={css.closeBtn} onClick={onClose} aria-label="Đóng">
            ×
          </button>
        </div>
        {message ? <div className={css.body}>{message}</div> : null}
      </div>
    </div>
  );
}

function iconFor(v: Variant) {
  switch (v) {
    case "success":
      return <i className="bi bi-check-circle-fill" style={{ marginRight: 6 }} />;
    case "error":
      return <i className="bi bi-x-circle-fill" style={{ marginRight: 6 }} />;
    case "warning":
      return <i className="bi bi-exclamation-triangle-fill" style={{ marginRight: 6 }} />;
    default:
      return <i className="bi bi-info-circle-fill" style={{ marginRight: 6 }} />;
  }
}
