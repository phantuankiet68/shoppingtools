// src/components/TopNav.tsx
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

export default function TopNav({ pageId, mode, onSwitch, onSave, saving, onCreate, noticeText }: Props) {
  const text = noticeText ?? "💡 Hãy tạo Menu trước; khi lưu Menu, Page / Path / Locale sẽ tự động được tạo & đồng bộ.";

  return (
    <nav className="navbar navbar-expand bg-white bg-opacity-75 border-bottom px-3 py-2">
      <div className="d-flex align-items-center gap-2">
        <div className="zb-logo">⚡</div>

        {/* Logo + ticker */}
        <div className={`d-flex align-items-center ${styles.brandWrap}`}>
          <div className="fw-bold me-2">Zento Builder</div>

          {/* Marquee */}
          <div className={styles.ticker} aria-live="polite" role="status">
            <div className={styles.tickerTrack}>
              <span className={styles.tickerItem}>{text}</span>
              {/* lặp 2 lần để chạy mượt, không bị khoảng trống */}
              <span className={styles.tickerItem} aria-hidden="true">
                {text}
              </span>
            </div>
          </div>
        </div>

        <span className="badge text-bg-light border ms-2">{pageId ? `ID: ${pageId}` : "(draft)"}</span>
      </div>

      {/* Actions bên phải */}
      <div className="ms-auto d-flex align-items-center gap-2 mx-3">
        {onCreate && (
          <button className="btn btn-primary btn-sm" onClick={onCreate} title="Tạo Menu">
            <i className="bi bi-plus-circle me-1"></i>
            Tạo Menu
          </button>
        )}
      </div>
    </nav>
  );
}
