"use client";

import React, { createContext, useContext, useRef, useState } from "react";
import styles from "@/styles/ui/toast.module.css";

type Kind = "success" | "error" | "info" | "warning";
type Toast = { id: string; kind: Kind; title: string; desc?: string; timeout?: number };

type Ctx = {
  show: (t: Omit<Toast, "id">) => void;
};

const ToastCtx = createContext<Ctx>({ show: () => {} });

export function useToast() {
  return useContext(ToastCtx);
}
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [list, setList] = useState<Toast[]>([]);
  const idRef = useRef(0);

  function show(t: Omit<Toast, "id">) {
    const id = `t_${++idRef.current}`;
    const item: Toast = { id, timeout: 4200, ...t };
    setList((s) => [item, ...s]);
    if (item.timeout) {
      setTimeout(() => dismiss(id), item.timeout);
    }
  }
  function dismiss(id: string) {
    setList((s) => s.filter((x) => x.id !== id));
  }

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className={styles.stack}>
        {list.map((t) => (
          <div key={t.id} className={`${styles.card} ${styles[t.kind]}`}>
            <div className={styles.iconWrap}>
              {t.kind === "success" && <i className="bi bi-check2-circle" />}
              {t.kind === "error" && <i className="bi bi-x-octagon" />}
              {t.kind === "info" && <i className="bi bi-info-circle" />}
              {t.kind === "warning" && <i className="bi bi-exclamation-triangle" />}
            </div>
            <div className={styles.body}>
              <div className={styles.title}>{t.title}</div>
              {t.desc && <div className={styles.desc}>{t.desc}</div>}
            </div>
            <button className={styles.close} onClick={() => dismiss(t.id)} aria-label="Close">
              <i className="bi bi-x-lg" />
            </button>
            {t.kind === "success" && <div className={styles.confetti} aria-hidden />}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
