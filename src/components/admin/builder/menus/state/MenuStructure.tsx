"use client";

import React, { useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin/menu/MenuStructure.module.css";

import EditOffcanvas from "./EditOffcanvas";
import ConfirmDialog from "@/components/admin/shared/popup/delete/ConfirmDialog";

import { useMenuStore, type BuilderMenuItem } from "@/components/admin/builder/menus/state/useMenuStore";
import { useMenuStructureStore } from "@/store/builder/menus/useMenuStructureStore";
import { deleteMenuItem } from "@/services/builder/menus/menuStructure.service";

import { MENU_MESSAGES as M } from "@/features/builder/menus/messages";

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

function removeItemByIdFromTree(
  tree: MenuItem[] | undefined,
  id: string,
): { removed: MenuItem | null; next: MenuItem[] } {
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

  return { removed, next: walk(arr) };
}

function isDescendant(tree: MenuItem[] | undefined, sourceId: string, targetParentId?: string): boolean {
  if (!targetParentId) return false;
  const sourceNode = findItemInTree(tree, sourceId);
  if (!sourceNode?.children?.length) return false;

  const walk = (node: MenuItem): boolean => (node.children || []).some((c) => c.id === targetParentId || walk(c));
  return walk(sourceNode);
}

type Props = {
  siteId?: string;
};

export default function MenuStructure(_props: Props) {
  const router = useRouter();
  const { activeMenu, setActiveMenu, buildHref } = useMenuStore();

  const dragInfoRef = useRef<DragInfo>(null);
  const overElRef = useRef<HTMLElement | null>(null);

  const {
    editing,
    q,
    confirmOpen,
    pendingDeleteId,
    busy,
    setEditing,
    setQ,
    askDelete,
    closeConfirm,
    setBusy,
    clearDeleteState,
  } = useMenuStructureStore();

  const now = useMemo(() => new Date(), []);

  const setDropHighlight = useCallback((el: HTMLElement | null, on: boolean) => {
    if (!el) return;
    if (on) el.classList.add(styles.dropActive);
    else el.classList.remove(styles.dropActive);
  }, []);

  const clearOverHighlight = useCallback(() => {
    setDropHighlight(overElRef.current, false);
    overElRef.current = null;
  }, [setDropHighlight]);

  const handleDropzoneOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      e.dataTransfer.dropEffect = dragInfoRef.current ? "move" : "copy";

      if (overElRef.current !== e.currentTarget) {
        setDropHighlight(overElRef.current, false);
        overElRef.current = e.currentTarget;
        setDropHighlight(e.currentTarget, true);
      }
    },
    [setDropHighlight],
  );

  const handleDragStartRow = useCallback(
    (e: React.DragEvent, item: MenuItem, source: "root" | "children", parentId?: string) => {
      dragInfoRef.current = { kind: "move", id: item.id, source, parentId };
      (e.currentTarget as HTMLElement).classList.add(styles.ghost);
      e.dataTransfer.effectAllowed = "move";
    },
    [],
  );

  const handleDragEndRow = useCallback(
    (e: React.DragEvent) => {
      (e.currentTarget as HTMLElement).classList.remove(styles.ghost);
      dragInfoRef.current = null;
      clearOverHighlight();
    },
    [clearOverHighlight],
  );

  const handleDropNew = useCallback(
    (e: React.DragEvent, zone: "root" | "children", parentId?: string) => {
      e.preventDefault();
      e.stopPropagation();

      const raw = e.dataTransfer.getData("application/json") || e.dataTransfer.getData("text/plain");
      if (!raw) return;

      try {
        const payload = JSON.parse(raw);
        if (payload?.type !== "new") return;

        const title = (payload.name as string) || M.menuStructure.untitled;
        const linkType = (payload.linkType as string) ?? "internal";
        const baseId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

        let rawPath: string | null = null;
        if (linkType === "internal") {
          rawPath = (payload.rawPath as string | undefined) || "";
          if (!rawPath) {
            const s = slugifyLoose(title) || M.menuStructure.defaultSlug;
            rawPath = `/${s}`;
          }
        }

        const item: MenuItem = {
          id: String(baseId),
          title,
          icon: "",
          visible: true,
          linkType: (linkType as any) ?? "internal",
          externalUrl: (payload.externalUrl as string) ?? "",
          internalPageId: (payload.internalPageId as string) || undefined,
          rawPath,
          schedules: [],
          children: [],
        };

        if (zone === "root") {
          setActiveMenu([...(activeMenu || []), item]);
        } else {
          const next = (activeMenu || []).map((it) =>
            it.id === parentId ? { ...it, children: [...(it.children || []), item] } : it,
          );
          setActiveMenu(next);
        }
      } finally {
        clearOverHighlight();
      }
    },
    [activeMenu, setActiveMenu, clearOverHighlight],
  );

  const handleDropMove = useCallback(
    (e: React.DragEvent, zone: "root" | "children", parentId?: string) => {
      e.preventDefault();
      e.stopPropagation();

      const info = dragInfoRef.current;
      if (!info || info.kind !== "move") return;

      if (zone === "children" && parentId === info.id) return;
      if (zone === "children" && isDescendant(activeMenu, info.id, parentId)) return;

      const { removed, next } = removeItemByIdFromTree(activeMenu, info.id);
      if (!removed) return;

      if (zone === "root") {
        setActiveMenu([...next, removed]);
      } else {
        const nextRoot = next.map((it) =>
          it.id === parentId ? { ...it, children: [...(it.children || []), removed] } : it,
        );
        setActiveMenu(nextRoot);
      }

      dragInfoRef.current = null;
      clearOverHighlight();
    },
    [activeMenu, setActiveMenu, clearOverHighlight],
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

  const filteredTree = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return activeMenu || [];

    const matchNode = (node: MenuItem): MenuItem | null => {
      const href = buildHref(node, now);
      const titleHit = (node.title || "").toLowerCase().includes(query);
      const hrefHit = (href || "").toLowerCase().includes(query);

      const keptChildren = (node.children || []).map(matchNode).filter(Boolean) as MenuItem[];
      if (titleHit || hrefHit || keptChildren.length > 0) return { ...node, children: keptChildren };
      return null;
    };

    return (activeMenu || []).map(matchNode).filter(Boolean) as MenuItem[];
  }, [activeMenu, q, buildHref, now]);

  const doDelete = useCallback(async () => {
    if (!pendingDeleteId) return;

    const el = document.querySelector(`[data-menu-id="${pendingDeleteId}"]`) as HTMLElement | null;
    if (el) el.style.opacity = "0.4";

    try {
      setBusy(true);
      await deleteMenuItem(pendingDeleteId);

      const { next } = removeItemByIdFromTree(activeMenu, pendingDeleteId);
      setActiveMenu(next);
      router.refresh();
    } catch (e: any) {
      console.error("deleteMenuItem failed:", e);
      if (el) el.style.opacity = "";
      alert(e?.message || M.menuStructure.deleteFailed);
    } finally {
      setBusy(false);
      clearDeleteState();
    }
  }, [pendingDeleteId, activeMenu, setActiveMenu, router, setBusy, clearDeleteState]);

  // ✅ Important: use a normal function with explicit return type for recursion
  const renderRow = (item: MenuItem, idx: number, depth: number, parentId?: string): React.ReactElement => {
    const typeBadgeClass =
      item.linkType === "internal"
        ? styles.badgeSuccess
        : item.linkType === "scheduled"
          ? styles.badgeWarning
          : styles.badgePrimary;

    const hrefPreview = buildHref(item, now);
    const depthLabel = depth === 1 ? M.menuStructure.depthMain : M.menuStructure.depthSub;
    const title = item.title || M.menuStructure.noTitle;

    return (
      <div key={item.id} className={styles.itemContainer} data-menu-id={item.id}>
        <div
          className={styles.menuItem}
          draggable
          onDragStart={(e) => handleDragStartRow(e, item, parentId ? "children" : "root", parentId)}
          onDragEnd={handleDragEndRow}
          title={hrefPreview || ""}
        >
          <span className={`${styles.order} text-white`}>{idx + 1}</span>
          <i className={`bi bi-grip-vertical ${styles.handle}`} />
          <span className={`${styles.depthBadge} ${depth === 1 ? styles.depthMain : styles.depthSub}`}>
            {depthLabel}
          </span>
          <span className={`${styles.typeBadge} ${typeBadgeClass}`}>{item.linkType}</span>

          <span className={styles.flex1}>{highlight(title, q.trim())}</span>

          {hrefPreview ? <span className={styles.linkPill}>{hrefPreview}</span> : null}

          <button
            type="button"
            className={`${styles.btn} ${styles.btnIcon} ${styles.btnOutlineLight}`}
            onClick={() => setEditing(item)}
          >
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
            title={M.menuStructure.deleteItemTitle}
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={styles.subwrap} data-parent={item.id}>
          <div className={styles.smallHelp}>
            <i className="bi bi-diagram-2" /> {M.menuStructure.submenuLabelPrefix} <b>{title}</b>
          </div>

          <div
            className={`${styles.dropzone} ${styles.appSoft}`}
            onDragOver={handleDropzoneOver}
            onDragEnter={handleDropzoneOver}
            onDragLeave={(e) => {
              if (overElRef.current === e.currentTarget) {
                setDropHighlight(e.currentTarget, false);
                overElRef.current = null;
              }
            }}
            onDrop={(e) => {
              if (dragInfoRef.current) handleDropMove(e, "children", item.id);
              else handleDropNew(e, "children", item.id);
            }}
          >
            {(item.children || []).length === 0 ? (
              <p className={`${styles.smallHelp} m-0 py-2`}>{M.menuStructure.emptyChildrenHelp}</p>
            ) : (
              (item.children || []).map((child, i) => renderRow(child, i, depth + 1, item.id))
            )}
          </div>
        </div>
      </div>
    );
  };

  const emptyRootText = q ? M.menuStructure.emptyRootNoResults : M.menuStructure.emptyRootDropHere;

  return (
    <>
      <div className={styles.cardHeader}>
        <h2 className={styles.h6}>{M.menuStructure.headerTitle}</h2>

        <div className={styles.headerRight}>
          <div className={styles.search}>
            <i className={`bi bi-search ${styles.iconSearch}`} aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={M.menuStructure.searchPlaceholder}
              aria-label={M.menuStructure.searchAria}
              className={styles.searchInput}
            />
          </div>

          {q ? (
            <button
              className={`${styles.btn} ${styles.btnOutlineSecondary} ${styles.btnClear}`}
              onClick={() => setQ("")}
              title={M.menuStructure.clearTitle}
              type="button"
            >
              <i className="bi bi-x-circle" />
              <span>{M.menuStructure.clearBtn}</span>
            </button>
          ) : null}
        </div>
      </div>

      <div className={styles.card}>
        <div
          className={`${styles.dropzone} ${styles.appSoft}`}
          onDragOver={handleDropzoneOver}
          onDragEnter={handleDropzoneOver}
          onDragLeave={(e) => {
            if (overElRef.current === e.currentTarget) {
              setDropHighlight(e.currentTarget as any, false);
              overElRef.current = null;
            }
          }}
          onDrop={(e) => {
            if (dragInfoRef.current) handleDropMove(e, "root");
            else handleDropNew(e, "root");
          }}
        >
          {filteredTree.length === 0 ? (
            <p className={`${styles.smallHelp} text-center m-0 py-3`}>{emptyRootText}</p>
          ) : (
            filteredTree.map((it, idx) => renderRow(it, idx, 1))
          )}
        </div>

        {editing && <EditOffcanvas item={editing} onClose={() => setEditing(null)} />}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={M.menuStructure.confirmDeleteTitle}
        message={busy ? M.menuStructure.confirmDeleting : M.menuStructure.confirmDeleteMsg}
        onCancel={() => {
          if (busy) return;
          closeConfirm();
        }}
        onConfirm={() => {
          if (!busy) void doDelete();
        }}
      />
    </>
  );
}
