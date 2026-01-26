"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin/menu/MenuStructure.module.css";
import EditOffcanvas from "./EditOffcanvas";
import { useMenuStore, type Locale, type BuilderMenuItem } from "@/components/admin/menu/state/useMenuStore";
import ConfirmDialog from "@/components/admin/popup/delete/ConfirmDialog";

type MenuItem = BuilderMenuItem;

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

function findItemInTree(tree: MenuItem[] | undefined, id: string): MenuItem | null {
  const arr = tree || [];
  for (const it of arr) {
    if (it.id === id) return it;
    if (it.children?.length) {
      const found = findItemInTree(it.children, id);
      if (found) return found;
    }
  }
  return null;
}

function removeItemByIdFromTree(tree: MenuItem[] | undefined, id: string): { removed: MenuItem | null; next: MenuItem[] } {
  const arr = tree || [];
  let removed: MenuItem | null = null;

  const walk = (nodes: MenuItem[]): MenuItem[] => {
    const out: MenuItem[] = [];
    for (const n of nodes) {
      if (n.id === id) {
        removed = n;
        continue;
      }
      if (n.children?.length) {
        const nextChildren = walk(n.children);
        out.push(nextChildren !== n.children ? { ...n, children: nextChildren } : n);
      } else {
        out.push(n);
      }
    }
    return out;
  };

  const next = walk(arr);
  return { removed, next };
}

function isDescendant(tree: MenuItem[] | undefined, sourceId: string, targetParentId?: string): boolean {
  if (!targetParentId) return false;
  const sourceNode = findItemInTree(tree, sourceId);
  if (!sourceNode?.children?.length) return false;

  const walk = (node: MenuItem): boolean => {
    return (node.children || []).some((c) => c.id === targetParentId || walk(c));
  };
  return walk(sourceNode);
}

type Props = {
  locale: Locale;
  siteId?: string;
};

export default function MenuStructure({ locale, siteId }: Props) {
  const router = useRouter();

  const { activeMenu, setActiveMenu, buildHref } = useMenuStore();

  const [editing, setEditing] = useState<MenuItem | null>(null);

  const dragInfo = useRef<DragInfo>(null);
  const overRef = useRef<HTMLElement | null>(null);

  const [q, setQ] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const askDelete = useCallback((id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  }, []);

  const doDelete = useCallback(async () => {
    if (!pendingDeleteId) return;

    const el = document.querySelector(`[data-menu-id="${pendingDeleteId}"]`) as HTMLElement | null;
    if (el) el.style.opacity = "0.4";

    try {
      setBusy(true);
      const res = await fetch(`/api/admin/menu-items/${pendingDeleteId}`, { method: "DELETE", cache: "no-store" });
      if (!res.ok) throw new Error(await res.text());
      const { next } = removeItemByIdFromTree(activeMenu, pendingDeleteId);
      setActiveMenu(next);

      router.refresh();
    } catch (e: any) {
      alert(e?.message || "Delete failed");
      if (el) el.style.opacity = "";
    } finally {
      setBusy(false);
      setConfirmOpen(false);
      setPendingDeleteId(null);
    }
  }, [pendingDeleteId, activeMenu, setActiveMenu, router]);

  const filteredTree = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return activeMenu || [];

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

  const setOver = useCallback((el: HTMLElement | null, on: boolean) => {
    if (!el) return;
    if (on) el.classList.add(styles.dropActive);
    else el.classList.remove(styles.dropActive);
  }, []);

  const onDropzoneOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = dragInfo.current ? "move" : "copy";

      if (overRef.current !== e.currentTarget) {
        setOver(overRef.current as any, false);
        overRef.current = e.currentTarget;
        setOver(e.currentTarget, true);
      }
    },
    [setOver],
  );

  const onDropNew = useCallback(
    (e: React.DragEvent, zone: "root" | "children", parentId?: string) => {
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
        let slug: string | undefined;

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
    },
    [activeMenu, setActiveMenu, setOver],
  );

  const onDragStartRow = useCallback((e: React.DragEvent, it: MenuItem, source: "root" | "children", parentId?: string) => {
    dragInfo.current = { kind: "move", id: it.id, source, parentId };
    (e.currentTarget as HTMLElement).classList.add(styles.ghost);
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const onDragEndRow = useCallback((e: React.DragEvent) => {
    (e.currentTarget as HTMLElement).classList.remove(styles.ghost);
    dragInfo.current = null;
  }, []);

  const onDropMove = useCallback(
    (e: React.DragEvent, zone: "root" | "children", parentId?: string) => {
      e.preventDefault();
      e.stopPropagation();

      const info = dragInfo.current;
      if (!info || info.kind !== "move") return;
      if (zone === "children" && parentId === info.id) return;
      if (zone === "children" && isDescendant(activeMenu, info.id, parentId)) return;

      const { removed, next } = removeItemByIdFromTree(activeMenu, info.id);
      if (!removed) return;

      if (zone === "root") {
        setActiveMenu([...next, removed]);
      } else {
        const nextRoot = next.map((it) => (it.id === parentId ? { ...it, children: [...(it.children || []), removed] } : it));
        setActiveMenu(nextRoot);
      }
      dragInfo.current = null;
      setOver(overRef.current as any, false);
      overRef.current = null;
    },
    [activeMenu, setActiveMenu, setOver],
  );

  const highlight = useCallback((text: string, needle: string) => {
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
  }, []);

  const renderRow = useCallback(
    (item: MenuItem, idx: number, depth: number, parentId?: string) => {
      const typeBadgeClass = item.linkType === "internal" ? styles.badgeSuccess : item.linkType === "scheduled" ? styles.badgeWarning : styles.badgePrimary;

      const hrefPreview = buildHref(item, new Date());

      return (
        <div key={item.id} className={styles.itemContainer} data-menu-id={item.id}>
          <div className={styles.menuItem} draggable onDragStart={(e) => onDragStartRow(e, item, parentId ? "children" : "root", parentId)} onDragEnd={onDragEndRow} title={hrefPreview || ""}>
            <span className={`${styles.order} text-white`}>{idx + 1}</span>
            <i className={`bi bi-grip-vertical ${styles.handle}`} />
            <span className={`${styles.depthBadge} ${depth === 1 ? styles.depthMain : styles.depthSub}`}>{depth === 1 ? "Main" : "Sub"}</span>
            <span className={`${styles.typeBadge} ${typeBadgeClass}`}>{item.linkType}</span>

            <span className={styles.flex1}>{highlight(item.title || "(No title)", q.trim())}</span>

            {hrefPreview ? <span className={styles.linkPill}>{hrefPreview}</span> : null}

            <button type="button" className={`${styles.btn} ${styles.btnIcon} ${styles.btnOutlineLight}`} onClick={() => setEditing(item)}>
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
              title="Delete this item">
              <i className="bi bi-x-lg" />
            </button>
          </div>

          <div className={styles.subwrap} data-parent={item.id}>
            <div className={styles.smallHelp}>
              <i className="bi bi-diagram-2" /> Submenu with <b>{item.title || "(No title)"}</b>
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
                <p className={`${styles.smallHelp} m-0 py-2`}>Drag an item here to create a Submenu (Level 2)</p>
              ) : (
                (item.children || []).map((child, i) => renderRow(child, i, depth + 1, item.id))
              )}
            </div>
          </div>
        </div>
      );
    },
    [askDelete, buildHref, highlight, onDragEndRow, onDragStartRow, onDropMove, onDropNew, onDropzoneOver, q, setOver],
  );

  return (
    <>
      <div className={styles.cardHeader}>
        <h2 className={styles.h6}>Menu structure</h2>

        <div className={styles.headerRight}>
          <div className={styles.search}>
            <i className={`bi bi-search ${styles.iconSearch}`} aria-hidden />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find the title or link…" aria-label="Find it in the menu." className={styles.searchInput} />
          </div>

          {q ? (
            <button className={`${styles.btn} ${styles.btnOutlineSecondary} ${styles.btnClear}`} onClick={() => setQ("")} title="Delete keywords" type="button">
              <i className="bi bi-x-circle" />
              <span>Clear</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className={styles.card}>
        <div
          className={`${styles.dropzone} ${styles.appSoft}`}
          onDragOver={onDropzoneOver}
          onDragEnter={onDropzoneOver}
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
            <p className={`${styles.smallHelp} text-center m-0 py-3`}>{q ? "No results found" : "Drop blocks here (Level 1)"}</p>
          ) : (
            filteredTree.map((it, idx) => renderRow(it, idx, 1))
          )}
        </div>

        {editing && <EditOffcanvas item={editing} onClose={() => setEditing(null)} />}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        title="Delete menu"
        message={busy ? "Deleting..." : "Are you sure you want to delete this item? This action will be saved."}
        onCancel={() => {
          if (busy) return;
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
        onConfirm={() => {
          if (!busy) void doDelete();
        }}
      />
    </>
  );
}
