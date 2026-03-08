"use client";

import styles from "@/styles/admin/layouts/Topbar.module.css";
import { FunctionKeyCode } from "./functionKeys";

type Props = {
  hotkey: FunctionKeyCode;
  label: string;
  icon?: string;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
};

export default function FunctionKeyButton({ hotkey, label, icon, onClick, className = "", disabled = false }: Props) {
  return (
    <button
      type="button"
      className={`${styles.functionKey} ${className}`.trim()}
      onClick={onClick}
      title={`${hotkey} - ${label}`}
      disabled={disabled}
    >
      <div className={styles.functionKeyHeader}>
        {icon && (
          <span className={styles.functionIcon}>
            <i className={`bi ${icon}`} />
          </span>
        )}
        <span className={styles.functionKeyCode}>{hotkey}</span>
      </div>
      <span className={styles.functionKeyLabel}>{label}</span>
    </button>
  );
}
