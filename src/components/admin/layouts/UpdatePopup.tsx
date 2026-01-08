"use client";

import { useEffect, useState } from "react";
import styles from "@/styles/admin/layouts/UpdatePopup.module.css";

type Props = {
  open?: boolean;
  version?: string;
  onUpdate?: () => void;
  onClose?: () => void;
};

export default function UpdatePopup({ open = true, version = "v5.11.2", onUpdate, onClose }: Props) {
  const [show, setShow] = useState(open);

  useEffect(() => setShow(open), [open]);

  if (!show) return null;

  return (
    <div className={styles.updatePopupWrap} role="dialog" aria-label="Update available">
      <div className={styles.updatePopupCard}>
        <button
          type="button"
          className={styles.updatePopupClose}
          aria-label="Close"
          onClick={() => {
            setShow(false);
            onClose?.();
          }}>
          <i className="bi bi-x" />
        </button>

        <div className={styles.updatePopupHeader}>
          <div className={styles.updatePopupTitle}>
            <i className="bi bi-rocket-takeoff" style={{ marginRight: 8 }} />
            Sales & Marketing Update
          </div>
        </div>

        <p className={styles.updatePopupDesc}>New tools are ready to boost revenue: better order tracking, campaign performance.</p>

        <div className={styles.updatePopupActions}>
          <a href="#" className={styles.updatePopupLink} onClick={(e) => e.preventDefault()}>
            <i className="bi bi-bar-chart-line" style={{ marginRight: 6 }} />
            View changelog
          </a>

          <button type="button" className={styles.updatePopupPrimary} onClick={() => onUpdate?.()}>
            <i className="bi bi-arrow-up-circle" style={{ marginRight: 6 }} />
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
