// src/components/menu/state/MenuStructure.tsx
"use client";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin/menu/MenuStructure.module.css";
import EditOffcanvas from "./EditOffcanvas";
import React from "react";
import { useMenuStore, type Locale, type MenuSetKey } from "@/components/admin/menu/state/useMenuStore";

type MenuItem = ReturnType<typeof useMenuStore>["activeMenu"][number];

type DragInfo = null | {
  kind: "move";
  id: string;
  source: "root" | "children";
  parentId?: string | null;
};

function slugifyLoose(input: string) {
  return (input || "")
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\- ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

type Props = {
  locale: Locale;
  siteId?: string;
};

export default function MenuStructure({ locale, siteId }: Props) {
  const router = useRouter();
  const { currentSet, activeMenu, setActiveMenu, removeItemById, saveToServer, loadFromServer, buildHref, findItem } = useMenuStore();

  const [editing, setEditing] = useState<MenuItem | null>(null);
  const dragInfo = useRef<DragInfo>(null);
  const overRef = useRef<HTMLElement | null>(null);

  const [q, setQ] = useState("");
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingDeleteId, setPendingDeleteId] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);

  const askDelete = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const doDelete = async () => {
    if (!pendingDeleteId) return;

    // 0) Ẩn ngay trên UI (không cần store)
    const el = document.querySelector(`[data-menu-id="${pendingDeleteId}"]`);
    if (el) (el as HTMLElement).style.opacity = "0.4";

    try {
      setBusy(true);
      const res = await fetch(`/api/admin/menu-items/${pendingDeleteId}`, { method: "DELETE", cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());

      router.refresh();
      setTimeout(() => window.location.reload(), 100);
    } catch (e: any) {
      alert(e?.message || "Xóa thất bại");
      if (el) (el as HTMLElement).style.opacity = ""; // rollback UI
    } finally {
      setBusy(false);
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  };

  const filteredTree = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return activeMenu;

    const now = new Date();
    const matchNode = (node: MenuItem): MenuItem | null => {
      const href = buildHref(node, now);
      const titleHit = (node.title || "").toLowerCase().includes(query);
      const hrefHit = (href || "").toLowerCase().includes(query);

      const keptChildren = (node.children || []).map(matchNode).filter(Boolean) as MenuItem[];

      if (titleHit || hrefHit || keptChildren.length > 0) {
        return { ...node, children: keptChildren };
      }
      return null;
    };

    return (activeMenu || []).map(matchNode).filter(Boolean) as MenuItem[];
  }, [activeMenu, q, buildHref]);

  function setOver(el: HTMLElement | null, on: boolean) {
    if (!el) return;
    if (on) el.classList.add(styles.dropActive);
    else el.classList.remove(styles.dropActive);
  }

  function onDropNew(e: React.DragEvent, zone: "root" | "children", parentId?: string) {
    e.preventDefault();
    e.stopPropagation();

    const raw = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");
    if (!raw) return;

    try {
      const payload = JSON.parse(raw);
      if (payload?.type !== "new") return;

      const title = (payload.name as string) || "Untitled";
      const linkType = (payload.linkType as string) ?? "internal";
      const baseId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);
      let rawPath: string | null = null;
      let slug: string | undefined = undefined;

      if (linkType === "internal") {
        rawPath = (payload.rawPath as string | undefined) || "";
        if (!rawPath) {
          const s = slugifyLoose(title) || "untitled";
          rawPath = `/${s}`;
        }
        const segs = rawPath.split("/").filter(Boolean);
        slug = segs.length ? segs[segs.length - 1] : "/";
      }

      const item: MenuItem = {
        id: baseId as any,
        title,
        icon: "",
        linkType: (linkType as any) ?? "internal",
        externalUrl: (payload.externalUrl as string) ?? "",
        newTab: false,
        internalPageId: (payload.internalPageId as string) ?? null,
        rawPath: rawPath as any,
        ...(slug ? { slug: slug as any } : {}),
        schedules: [],
        children: [],
      };

      if (zone === "root") {
        setActiveMenu([...(activeMenu || []), item]);
      } else {
        const next = (activeMenu || []).map((it) => (it.id === parentId ? { ...it, children: [...(it.children || []), item] } : it));
        setActiveMenu(next);
      }
    } finally {
      setOver(overRef.current as any, false);
      overRef.current = null;
    }
  }

  function onDragStartRow(e: React.DragEvent, it: MenuItem, source: "root" | "children", parentId?: string) {
    dragInfo.current = { kind: "move", id: it.id, source, parentId };
    (e.target as HTMLElement).classList.add(styles.ghost);
    e.dataTransfer.effectAllowed = "move";
  }
  function onDragEndRow(e: React.DragEvent) {
    (e.target as HTMLElement).classList.remove(styles.ghost);
    dragInfo.current = null;
  }
  function onDropMove(e: React.DragEvent, zone: "root" | "children", parentId?: string) {
    e.preventDefault();
    e.stopPropagation();

    const info = dragInfo.current;
    if (!info || info.kind !== "move") return;

    if (zone === "children" && parentId === info.id) return;
    const isDescendant = (nodeId: string, targetId?: string): boolean => {
      if (!targetId) return false;
      const node = findItem(nodeId);
      if (!node?.children?.length) return false;
      return node.children.some((c) => c.id === targetId || isDescendant(c.id, targetId));
    };
    if (zone === "children" && isDescendant(info.id, parentId)) return;

    const [removed, nextRoot] = removeItemById(info.id);
    if (!removed) return;

    if (zone === "root") {
      setActiveMenu([...nextRoot, removed]);
    } else {
      const next = nextRoot.map((it) => (it.id === parentId ? { ...it, children: [...(it.children || []), removed] } : it));
      setActiveMenu(next);
    }
    dragInfo.current = null;

    setOver(overRef.current as any, false);
    overRef.current = null;
  }

  const onDropzoneOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = dragInfo.current ? "move" : "copy";
    if (overRef.current !== e.currentTarget) {
      setOver(overRef.current as any, false);
      overRef.current = e.currentTarget;
      setOver(e.currentTarget, true);
    }
  };

  function highlight(text: string, needle: string) {
    if (!needle) return text;
    const ql = needle.toLowerCase();
    const tl = (text || "").toLowerCase();
    const i = tl.indexOf(ql);
    if (i === -1) return text;
    return (
      <>
        {text.slice(0, i)}
        <mark>{text.slice(i, i + needle.length)}</mark>
        {text.slice(i + needle.length)}
      </>
    );
  }

  function renderRow(item: MenuItem, idx: number, depth: number, parentId?: string) {
    const typeBadgeClass = item.linkType === "internal" ? styles.badgeSuccess : item.linkType === "scheduled" ? styles.badgeWarning : styles.badgePrimary;

    const hrefPreview = buildHref(item, new Date());

    return (
      <div key={item.id} className={styles.itemContainer}>
        <div className={styles.menuItem} draggable onDragStart={(e) => onDragStartRow(e, item, parentId ? "children" : "root", parentId)} onDragEnd={onDragEndRow} title={hrefPreview || ""}>
          <span className={`${styles.order} text-white`}>{idx + 1}</span>
          <i className={`bi bi-grip-vertical ${styles.handle}`} />
          <span className={`${styles.depthBadge} ${depth === 1 ? styles.depthMain : styles.depthSub}`}>{depth === 1 ? "Main" : "Sub"}</span>
          <span className={`${styles.typeBadge} ${typeBadgeClass}`}>{item.linkType}</span>

          <span className={styles.flex1}>{highlight(item.title || "(No title)", q.trim())}</span>

          {hrefPreview ? <span className={styles.linkPill}>{hrefPreview}</span> : null}

          <button className={`${styles.btn} ${styles.btnIcon} ${styles.btnOutlineLight}`} onClick={() => setEditing(item)}>
            <i className="bi bi-sliders2" />
          </button>

          <button
            type="button"
            className={`${styles.btn} ${styles.btnIcon} ${styles.btnOutlineDanger}`}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              askDelete(item.id);
            }}
            draggable={false}
            title="Xoá mục này">
            <i className="bi bi-x-lg" />
          </button>
          <ConfirmDialog
            open={confirmOpen}
            title="Xoá menu"
            message={busy ? "Đang xoá..." : "Bạn có chắc muốn xoá mục này? Thao tác này sẽ được lưu lại."}
            onCancel={() => {
              if (busy) return;
              setConfirmOpen(false);
              setPendingDeleteId(null);
            }}
            onConfirm={() => {
              if (!busy) void doDelete();
            }}
          />
        </div>

        <div className={styles.subwrap} data-parent={item.id}>
          <div className={styles.smallHelp}>
            <i className="bi bi-diagram-2" /> Submenu của <b>{item.title || "(No title)"}</b>
          </div>

          <div
            className={`${styles.dropzone} ${styles.appSoft}`}
            onDragOver={onDropzoneOver}
            onDragEnter={onDropzoneOver}
            onDragLeave={(e) => {
              if (overRef.current === e.currentTarget) {
                setOver(e.currentTarget, false);
                overRef.current = null;
              }
            }}
            onDrop={(e) => {
              if (dragInfo.current) onDropMove(e, "children", item.id);
              else onDropNew(e, "children", item.id);
            }}>
            {(item.children || []).length === 0 ? (
              <p className={`${styles.smallHelp} m-0 py-2`}>Kéo item vào đây để tạo Submenu (Cấp 2)</p>
            ) : (
              (item.children || []).map((child, i) => renderRow(child, i, depth + 1, item.id))
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={styles.cardHeader}>
        <h2 className={styles.h6}>Menu structure</h2>

        <div className={styles.headerRight}>
          <div className={styles.search}>
            <i className={`bi bi-search ${styles.iconSearch}`} aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm tiêu đề hoặc đường dẫn…" aria-label="Tìm trong menu" className={styles.searchInput} />
          </div>

          {q ? (
            <button className={`${styles.btn} ${styles.btnOutlineSecondary} ${styles.btnClear}`} onClick={() => setQ("")} title="Xoá từ khoá" type="button">
              <i className="bi bi-x-circle" />
              <span>Clear</span>
            </button>
          ) : null}
        </div>
      </div>
      <div className={styles.card}>
        <div
          className={`${styles.dropzone} ${styles.appSoft}`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = dragInfo.current ? "move" : "copy";
            if (overRef.current !== e.currentTarget) {
              setOver(overRef.current as any, false);
              overRef.current = e.currentTarget as any;
              setOver(e.currentTarget as any, true);
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragLeave={(e) => {
            if (overRef.current === e.currentTarget) {
              setOver(e.currentTarget as any, false);
              overRef.current = null;
            }
          }}
          onDrop={(e) => {
            if (dragInfo.current) onDropMove(e, "root");
            else onDropNew(e, "root");
          }}>
          {filteredTree.length === 0 ? (
            <p className={`${styles.smallHelp} text-center m-0 py-3`}>{q ? "Không tìm thấy kết quả" : "Thả block vào đây (Cấp 1)"}</p>
          ) : (
            filteredTree.map((it, idx) => renderRow(it, idx, 1))
          )}
        </div>

        {editing && <EditOffcanvas item={editing} onClose={() => setEditing(null)} />}
      </div>
    </>
  );
}

function ConfirmDialog({
  open,
  title = "Xác nhận xoá",
  message = "Bạn có chắc muốn xoá mục này?",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title?: string;
  message?: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div role="dialog" aria-modal="true" style={backdropStyle} onClick={onCancel}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <h5 style={{ margin: 0 }}>{title}</h5>
        <p style={{ margin: "8px 0 16px", color: "var(--text-red)" }}>{message}</p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <button className={`${styles.btn} ${styles.btnOutlineSecondary}`} onClick={onCancel}>
            Huỷ
          </button>
          <button className={`${styles.btn} ${styles.btnOutlineDanger}`} onClick={onConfirm}>
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

const backdropStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.35)",
  display: "grid",
  placeItems: "center",
  zIndex: 10000,
};
const modalStyle: React.CSSProperties = {
  width: 420,
  maxWidth: "92vw",
  background: "var(--card-bg,#fff)",
  border: "1px solid var(--card-bd,#e5e7eb)",
  borderRadius: 12,
  padding: 16,
};
