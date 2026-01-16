"use client";
import React from "react";
import styles from "./TopNav.module.css";

type Props = {
  pageId: string | null;
  mode: "pages" | "settings" | "design" | "code" | "preview";
  onSwitch: (m: "pages" | "settings") => void;
  onSave: () => void;
  saving: boolean;
  onCreate?: () => void;
  noticeText?: string;
};

export default function TopNav({ pageId, onCreate, noticeText }: Props) {
  return (
    <header className={styles.topNav}>
      {/* Left */}
      <div className={styles.left}>
        <div className={styles.logo}>⚡</div>

        <div className={styles.brand}>
          <div className={styles.brandName}>Zento Builder</div>
        </div>

        <span className={styles.badge}>{pageId ? `ID: ${pageId}` : "Draft"}</span>
      </div>

      {/* Right */}
      <div className={styles.right}>
        {onCreate && (
          <button className={styles.primaryBtn} onClick={onCreate}>
            <i className="bi bi-plus-circle" />
            <span>Tạo Menu</span>
          </button>
        )}
      </div>
    </header>
  );
}
