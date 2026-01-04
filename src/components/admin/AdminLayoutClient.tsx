"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";

import LayoutA from "@/components/admin/layouts/LayoutA";
import LayoutB from "@/components/admin/layouts/LayoutB";
import LayoutC from "@/components/admin/layouts/LayoutC";

import styles from "@/styles/admin/layouts/AdminLayoutClient.module.css";

type LayoutKey = "A" | "B" | "C";
const STORAGE_KEY = "admin_layout";

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  const [mounted, setMounted] = useState(false);
  const [layout, setLayout] = useState<LayoutKey | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isLoginPage) return;

    const saved = window.localStorage.getItem(STORAGE_KEY) as LayoutKey | null;

    if (saved === "A" || saved === "B" || saved === "C") {
      setLayout(saved);
      setOpen(false);
    } else {
      setLayout(null);
      setOpen(true);
    }
  }, [isLoginPage]);

  const Chosen = useMemo(() => {
    if (layout === "B") return LayoutB;
    if (layout === "C") return LayoutC;
    return LayoutA;
  }, [layout]);

  const applyLayout = (k: LayoutKey) => {
    window.localStorage.setItem(STORAGE_KEY, k);
    setLayout(k);
    setOpen(false);
  };

  if (!mounted) return null;
  if (isLoginPage) return <>{children}</>;

  if (open) {
    return (
      <ChooseLayoutModal
        onPick={applyLayout}
        onClose={() => {
          // Nếu bạn muốn BẮT BUỘC chọn layout thì đổi thành: return;
          // Hiện tại: cho đóng và mặc định A
          setLayout("A");
          setOpen(false);
        }}
      />
    );
  }

  return <Chosen>{children}</Chosen>;
}

function ChooseLayoutModal({ onPick, onClose }: { onPick: (k: LayoutKey) => void; onClose: () => void }) {
  const items: Array<{
    key: LayoutKey;
    title: string;
    desc: string;
    details: string; // mô tả dài hơn
    icon: string;
    tag: string;
    useCases: string[]; // badge "phù hợp cho"
    highlights: string[]; // 1 dòng điểm nổi bật
    bullets: string[];
  }> = [
    {
      key: "A",
      title: "Layout A",
      desc: "Sidebar + content standard dashboards",
      details: "A familiar layout for admin systems: clear sidebar navigation, multi-level menus, easy module expansion, and stable as the project scales.",
      icon: "bi-layout-sidebar-inset",
      tag: "Classic",
      useCases: ["Product management", "Orders", "User roles"],
      highlights: ["Strong navigation", "Easy to scale", "Admin-optimized"],
      bullets: ["Full menu", "Easy to extend", "Optimized for admin"],
    },
    {
      key: "B",
      title: "Layout B",
      desc: "Topbar + content — clean and modern",
      details: "Maximum focus on content: quick topbar navigation, ideal for wide screens, spacious tables and charts, and a clean, minimal experience.",
      icon: "bi-window",
      tag: "Modern",
      useCases: ["Reports", "Analytics", "Content management"],
      highlights: ["Spacious", "Content-focused", "Minimal UI"],
      bullets: ["Wide layout", "Content-focused", "Minimal design"],
    },
    {
      key: "C",
      title: "Layout C",
      desc: "Mini sidebar icons — fast and professional",
      details: "A modern SaaS-style design: compact icon-based sidebar, fast interactions, optimized for 13–14 inch laptops, and a more premium look and feel.",
      icon: "bi-layout-text-window-reverse",
      tag: "Pro",
      useCases: ["Fast operations", "Small screens", "Power users"],
      highlights: ["Fast", "Compact", "Premium feel"],
      bullets: ["Lightweight", "Premium UI", "Optimized for small screens"],
    },
  ];

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <i className="bi bi-sliders2" />
            </div>
            <div>
              <div className={styles.title}>Choose Admin Layout</div>
              <div className={styles.subtitle}>
                Select once. You can change it later in <b>Settings → Layout</b>.
              </div>
            </div>
          </div>

          <button className={styles.closeBtn} onClick={onClose} aria-label="Đóng">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.grid}>
            {items.map((it) => (
              <button key={it.key} className={styles.cardBtn} onClick={() => onPick(it.key)} type="button">
                <div className={styles.card}>
                  <div className={styles.tag}>{it.tag}</div>

                  {/* Header card */}
                  <div className={styles.cardTop}>
                    <div className={styles.cardIcon}>
                      <i className={`bi ${it.icon}`} />
                    </div>

                    <div className={styles.cardHeading}>
                      <div className={styles.cardTitle}>{it.title}</div>
                      <div className={styles.cardDesc}>{it.desc}</div>
                    </div>
                  </div>

                  <div className={styles.cardDetails}>{it.details}</div>

                  <div className={styles.badges}>
                    {it.useCases.map((t) => (
                      <span key={t} className={styles.badge}>
                        {t}
                      </span>
                    ))}
                  </div>
                  <div className={styles.highlights}>
                    <span className={styles.highlightsLabel}>Highlights:</span>
                    <span className={styles.highlightsText}>{it.highlights.join(" • ")}</span>
                  </div>

                  <div className={styles.preview}>
                    <MiniPreview type={it.key} />
                  </div>
                  <ul className={styles.bullets}>
                    {it.bullets.map((b) => (
                      <li key={b}>
                        <i className="bi bi-check2-circle" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  <div className={styles.cardBottom}>
                    <span className={styles.hint}>Click to apply</span>
                    <span className={styles.applyBtn}>
                      Apply <i className="bi bi-arrow-right" />
                    </span>
                  </div>

                  <div className={styles.glow} />
                </div>
              </button>
            ))}
          </div>

          <div className={styles.footer}>
            <div className={styles.footerLeft}>
              <i className="bi bi-shield-check" />
              <span>Your selection is saved in the browser (localStorage). It does not affect your account.</span>
            </div>

            <div className={styles.footerRight}>
              <i className="bi bi-gear" />
              <span>Tip: you can change it later in Settings</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniPreview({ type }: { type: LayoutKey }) {
  if (type === "A") {
    return (
      <div className={`${styles.pv} ${styles.pvA}`}>
        <div className={styles.pvSide}>
          <div className={styles.pvLineStrong} />
          <div className={styles.pvLines}>
            <div className={styles.pvLine} />
            <div className={styles.pvLine} />
            <div className={styles.pvLine} />
          </div>
        </div>
        <div className={styles.pvMain}>
          <div className={styles.pvTopRow}>
            <div className={styles.pvChip1} />
            <div className={styles.pvChip2} />
          </div>
          <div className={styles.pvBox} />
        </div>
      </div>
    );
  }

  if (type === "B") {
    return (
      <div className={`${styles.pv} ${styles.pvB}`}>
        <div className={styles.pvTopbar}>
          <div className={styles.pvLineStrong} />
          <div className={styles.pvLine} />
        </div>
        <div className={styles.pvMainOnly}>
          <div className={styles.pvBox} />
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.pv} ${styles.pvC}`}>
      <div className={styles.pvMiniSide}>
        <div className={styles.pvDot} />
        <div className={styles.pvDot} />
        <div className={styles.pvDot} />
      </div>
      <div className={styles.pvMain}>
        <div className={styles.pvTopRow}>
          <div className={styles.pvChip1} />
          <div className={styles.pvChip2} />
        </div>
        <div className={styles.pvBox} />
      </div>
    </div>
  );
}
