"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/profile/images.module.css";

type ImgItem = {
  id: string;
  name: string;
  size: string;
  dim: string;
  updated: string;
  tag?: "NEW" | "HDR" | "AI";
  color?: "blue" | "purple" | "green" | "amber";
};

export default function AdminImagesClient() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"all" | "recent" | "tagged">("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const items: ImgItem[] = useMemo(
    () => [
      { id: "i1", name: "hero_home.webp", size: "428 KB", dim: "1920×1080", updated: "Jan 7, 2026", tag: "NEW", color: "blue" },
      { id: "i2", name: "banner_sale.png", size: "1.2 MB", dim: "1600×900", updated: "Jan 5, 2026", tag: "HDR", color: "purple" },
      { id: "i3", name: "avatar_admin.jpg", size: "96 KB", dim: "512×512", updated: "Dec 29, 2025", color: "green" },
      { id: "i4", name: "product_01.png", size: "768 KB", dim: "1200×1200", updated: "Dec 22, 2025", tag: "AI", color: "amber" },
      { id: "i5", name: "cover_blog.png", size: "540 KB", dim: "1440×900", updated: "Dec 19, 2025", color: "blue" },
      { id: "i6", name: "team_photo.jpg", size: "2.8 MB", dim: "2400×1600", updated: "Dec 10, 2025", color: "purple" },
    ],
    []
  );

  const shown = useMemo(() => {
    const t = q.trim().toLowerCase();
    return items
      .filter((x) => (t ? x.name.toLowerCase().includes(t) : true))
      .filter((x) => {
        if (filter === "recent") return x.updated.includes("Jan");
        if (filter === "tagged") return !!x.tag;
        return true;
      });
  }, [items, q, filter]);

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div className={styles.headLeft}>
          <div className={styles.title}>Images</div>
        </div>

        <div className={styles.headRight}>
          <button className={styles.actionBtn} type="button">
            <i className="bi bi-folder-plus" /> <span>New folder</span>
          </button>
          <button className={`${styles.actionBtn} ${styles.primary}`} type="button">
            <i className="bi bi-cloud-arrow-up" /> <span>Upload</span>
          </button>
        </div>
      </div>

      {/* toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.search}>
          <i className={`bi bi-search ${styles.searchIcon}`} />
          <input className={styles.searchInput} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search images..." />
          {q && (
            <button className={styles.clearBtn} type="button" onClick={() => setQ("")} title="Clear">
              <i className="bi bi-x" />
            </button>
          )}
        </div>

        <div className={styles.pills}>
          <button className={`${styles.pill} ${filter === "all" ? styles.pillActive : ""}`} onClick={() => setFilter("all")} type="button">
            All
          </button>
          <button className={`${styles.pill} ${filter === "recent" ? styles.pillActive : ""}`} onClick={() => setFilter("recent")} type="button">
            Recent
          </button>
          <button className={`${styles.pill} ${filter === "tagged" ? styles.pillActive : ""}`} onClick={() => setFilter("tagged")} type="button">
            Tagged
          </button>
        </div>

        <div className={styles.viewGroup}>
          <button className={`${styles.iconBtn} ${view === "grid" ? styles.iconBtnActive : ""}`} onClick={() => setView("grid")} type="button" title="Grid">
            <i className="bi bi-grid-3x3-gap" />
          </button>
          <button className={`${styles.iconBtn} ${view === "list" ? styles.iconBtnActive : ""}`} onClick={() => setView("list")} type="button" title="List">
            <i className="bi bi-list" />
          </button>
        </div>
      </div>

      {/* content */}
      {view === "grid" ? (
        <div className={styles.grid}>
          {shown.map((it) => (
            <button key={it.id} className={styles.card} type="button">
              <div className={`${styles.thumb} ${it.color ? styles[`c_${it.color}`] : ""}`}>
                <i className="bi bi-image" />
                {it.tag && <span className={styles.tag}>{it.tag}</span>}
              </div>

              <div className={styles.meta}>
                <div className={styles.name} title={it.name}>
                  {it.name}
                </div>
                <div className={styles.row}>
                  <span>{it.dim}</span>
                  <span className={styles.dot} />
                  <span>{it.size}</span>
                </div>
                <div className={styles.row2}>
                  <span className={styles.muted}>Updated</span>
                  <span className={styles.muted2}>{it.updated}</span>
                </div>
              </div>

              <div className={styles.cardActions} aria-hidden="true">
                <span className={styles.smallIcon}>
                  <i className="bi bi-link-45deg" />
                </span>
                <span className={styles.smallIcon}>
                  <i className="bi bi-download" />
                </span>
                <span className={styles.smallIcon}>
                  <i className="bi bi-trash3" />
                </span>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className={styles.listCard}>
          <div className={styles.listHead}>
            <div>Name</div>
            <div>Size</div>
            <div>Dimensions</div>
            <div>Updated</div>
            <div />
          </div>

          {shown.map((it) => (
            <div key={it.id} className={styles.listRow}>
              <div className={styles.listName}>
                <span className={`${styles.listIcon} ${it.color ? styles[`c_${it.color}`] : ""}`}>
                  <i className="bi bi-image" />
                </span>
                <span className={styles.listNameText} title={it.name}>
                  {it.name}
                </span>
                {it.tag && <span className={styles.tagMini}>{it.tag}</span>}
              </div>
              <div className={styles.listCell}>{it.size}</div>
              <div className={styles.listCell}>{it.dim}</div>
              <div className={styles.listCell}>{it.updated}</div>
              <div className={styles.listOps}>
                <button className={styles.opBtn} type="button" title="Copy link">
                  <i className="bi bi-link-45deg" />
                </button>
                <button className={styles.opBtn} type="button" title="Download">
                  <i className="bi bi-download" />
                </button>
                <button className={`${styles.opBtn} ${styles.opDanger}`} type="button" title="Delete">
                  <i className="bi bi-trash3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
