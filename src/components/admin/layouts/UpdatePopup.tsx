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
          <div className={styles.updatePopupTitle}>Update Available</div>
          <div className={styles.updatePopupVersion}>{version}</div>
        </div>

        <p className={styles.updatePopupDesc}>Your application isn't updated to our latest version. New features like Quick Chats, Connect Premium are available in newer version.</p>

        <div className={styles.updatePopupActions}>
          <a href="#" className={styles.updatePopupLink} onClick={(e) => e.preventDefault()}>
            Know More
          </a>

          <button type="button" className={styles.updatePopupPrimary} onClick={() => onUpdate?.()}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
}
