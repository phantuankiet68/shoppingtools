"use client";

import React, { Dispatch, SetStateAction, useCallback, useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/builder/menus/MenuStructure.module.css";
import EditOffcanvas from "./EditOffcanvas";
import { useMenuStore } from "@/components/admin/builder/menus/state/useMenuStore";
import { MENU_MESSAGES as M } from "@/features/builder/menus/messages";
import { useModal } from "@/components/admin/shared/common/modal";

type MenuItem = ReturnType<typeof useMenuStore>["activeMenu"][number];

type DragInfo =
  | null
  | {
      kind: "move";
      id: string;
      source: "root" | "children";
      parentId?: string | null;
    };

type MenuStructureProps = {
  q: string;
  setQ: Dispatch<SetStateAction<string>>;
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

function highlight(text: string, needle: string) {
  if (!needle) return text;

  const normalizedText = (text || "").toLowerCase();
  const normalizedNeedle = needle.toLowerCase();
  const index = normalizedText.indexOf(normalizedNeedle);

  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <mark>{text.slice(index, index + needle.length)}</mark>
      {text.slice(index + needle.length)}
    </>
  );
}

export default function MenuStructure({ q }: MenuStructureProps) {
  const modal = useModal();

  const { activeMenu, setActiveMenu, removeItemById, buildHref, findItem } = useMenuStore();

  const [editing, setEditing] = useState<MenuItem | null>(null);
  const [deletingIds, setDeletingIds] = useState<Record<string, boolean>>({});
  const dragInfo = useRef<DragInfo>(null);
  const overRef = useRef<HTMLElement | null>(null);

  const normalizedQuery = q.trim().toLowerCase();

  const setOver = useCallback((element: HTMLElement | null, isActive: boolean) => {
    if (!element) return;

    if (isActive) {
      element.classList.add(styles.dropActive);
    } else {
      element.classList.remove(styles.dropActive);
    }
  }, []);

  const clearOverState = useCallback(() => {
    setOver(overRef.current, false);
    overRef.current = null;
  }, [setOver]);

  const isRootItemId = useCallback(
    (id?: string) => {
      if (!id) return false;
      return (activeMenu || []).some((item) => item.id === id);
    },
    [activeMenu],
  );

  const isDescendant = useCallback(
    (nodeId: string, targetId?: string): boolean => {
      if (!targetId) return false;

      const node = findItem(nodeId);
      if (!node?.children?.length) return false;

      return node.children.some(
        (child) => child.id === targetId || isDescendant(child.id, targetId),
      );
    },
    [findItem],
  );

  const filteredTree = useMemo(() => {
    if (!normalizedQuery) return activeMenu || [];

    const now = new Date();

    const matchNode = (node: MenuItem): MenuItem | null => {
      const href = buildHref(node, now);
      const titleHit = (node.title || "").toLowerCase().includes(normalizedQuery);
      const hrefHit = (href || "").toLowerCase().includes(normalizedQuery);

      const keptChildren = (node.children || [])
        .map(matchNode)
        .filter(Boolean) as MenuItem[];

      if (titleHit || hrefHit || keptChildren.length > 0) {
        return {
          ...node,
          children: keptChildren,
        };
      }

      return null;
    };

    return (activeMenu || []).map(matchNode).filter(Boolean) as MenuItem[];
  }, [activeMenu, normalizedQuery, buildHref]);

  const updateDeletingState = useCallback((id: string, value: boolean) => {
    setDeletingIds((prev) => {
      if (value && prev[id]) return prev;
      if (!value && !prev[id]) return prev;

      const next = { ...prev };
      if (value) {
        next[id] = true;
      } else {
        delete next[id];
      }
      return next;
    });
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      const current = findItem(id);
      updateDeletingState(id, true);

      try {
        const response = await fetch(`/api/admin/builder/menus/${id}`, {
          method: "DELETE",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(await response.text());
        }

        const [, nextRoot] = removeItemById(id);
        setActiveMenu(nextRoot);

        if (editing?.id === id) {
          setEditing(null);
        }

        modal.success(
          "Menu item deleted successfully",
          `Removed "${current?.title || "menu item"}" from the menu structure.`,
        );
      } catch (error: unknown) {
        modal.error(
          "Cannot delete menu item",
          (error as Error)?.message || "An error occurred while deleting the menu item.",
        );
      } finally {
        updateDeletingState(id, false);
      }
    },
    [findItem, updateDeletingState, removeItemById, setActiveMenu, editing?.id, modal],
  );

  const askDelete = useCallback(
    (id: string) => {
      const current = findItem(id);

      modal.confirmDelete(
        M.menuStructure.confirmDeleteTitle || "Delete menu item?",
        `Are you sure you want to delete "${current?.title || "this item"}"? This action cannot be undone.`,
        () => {
          void handleDelete(id);
        },
      );
    },
    [findItem, modal, handleDelete],
  );

  const createNewItemFromPayload = useCallback((payload: Record<string, unknown>): MenuItem | null => {
    if (payload?.type !== "new") return null;

    const title = (payload.name as string) || "Untitled";
    const linkType = ((payload.linkType as string) ?? "internal") as MenuItem["linkType"];
    const baseId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2);

    let rawPath = "";
    let slug: string | undefined;

    if (linkType === "internal") {
      rawPath = (payload.rawPath as string | undefined) || "";
      if (!rawPath) {
        const fallbackSlug = slugifyLoose(title) || "untitled";
        rawPath = `/${fallbackSlug}`;
      }

      const segments = rawPath.split("/").filter(Boolean);
      slug = segments.length ? segments[segments.length - 1] : "/";
    }

    return {
      id: baseId,
      title,
      icon: "",
      linkType,
      externalUrl: (payload.externalUrl as string) ?? "",
      newTab: false,
      internalPageId: (payload.internalPageId as string) ?? null,
      rawPath,
      ...(slug ? { slug } : {}),
      schedules: [],
      children: [],
    };
  }, []);

  const handleDropNew = useCallback(
    (event: React.DragEvent, zone: "root" | "children", parentId?: string) => {
      event.preventDefault();
      event.stopPropagation();

      if (zone === "children" && !isRootItemId(parentId)) {
        clearOverState();
        return;
      }

      const raw =
        event.dataTransfer.getData("application/json") || event.dataTransfer.getData("text/plain");

      if (!raw) {
        clearOverState();
        return;
      }

      try {
        const payload = JSON.parse(raw) as Record<string, unknown>;
        const item = createNewItemFromPayload(payload);

        if (!item) return;

        if (zone === "root") {
          setActiveMenu([...(activeMenu || []), item]);
          return;
        }

        const nextMenu = (activeMenu || []).map((menuItem) =>
          menuItem.id === parentId
            ? { ...menuItem, children: [...(menuItem.children || []), item] }
            : menuItem,
        );

        setActiveMenu(nextMenu);
      } catch {
        modal.error("Cannot add block", "Block data is invalid or corrupted.");
      } finally {
        clearOverState();
      }
    },
    [isRootItemId, clearOverState, createNewItemFromPayload, setActiveMenu, activeMenu, modal],
  );

  const onDragStartRow = useCallback(
    (event: React.DragEvent, item: MenuItem, source: "root" | "children", parentId?: string) => {
      dragInfo.current = { kind: "move", id: item.id, source, parentId };
      (event.currentTarget as HTMLElement).classList.add(styles.ghost);
      event.dataTransfer.effectAllowed = "move";
    },
    [],
  );

  const onDragEndRow = useCallback(
    (event: React.DragEvent) => {
      (event.currentTarget as HTMLElement).classList.remove(styles.ghost);
      dragInfo.current = null;
      clearOverState();
    },
    [clearOverState],
  );

  const handleDropMove = useCallback(
    (event: React.DragEvent, zone: "root" | "children", parentId?: string) => {
      event.preventDefault();
      event.stopPropagation();

      const info = dragInfo.current;
      if (!info || info.kind !== "move") {
        clearOverState();
        return;
      }

      if (zone === "children" && !isRootItemId(parentId)) {
        clearOverState();
        return;
      }

      if (zone === "children" && parentId === info.id) {
        clearOverState();
        return;
      }

      if (zone === "children" && isDescendant(info.id, parentId)) {
        clearOverState();
        return;
      }

      const [removed, nextRoot] = removeItemById(info.id);
      if (!removed) {
        clearOverState();
        return;
      }

      if (zone === "root") {
        setActiveMenu([...nextRoot, removed]);
      } else {
        const nextMenu = nextRoot.map((menuItem) =>
          menuItem.id === parentId
            ? { ...menuItem, children: [...(menuItem.children || []), removed] }
            : menuItem,
        );
        setActiveMenu(nextMenu);
      }

      dragInfo.current = null;
      clearOverState();
    },
    [clearOverState, isRootItemId, isDescendant, removeItemById, setActiveMenu],
  );

  const handleDropzoneOver = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      event.dataTransfer.dropEffect = dragInfo.current ? "move" : "copy";

      if (overRef.current !== event.currentTarget) {
        setOver(overRef.current, false);
        overRef.current = event.currentTarget;
        setOver(event.currentTarget, true);
      }
    },
    [setOver],
  );

  const handleDropzoneLeave = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      if (overRef.current === event.currentTarget) {
        setOver(event.currentTarget, false);
        overRef.current = null;
      }
    },
    [setOver],
  );

  const renderRow = useCallback(
    (item: MenuItem, idx: number, depth: number, parentId?: string) => {
      const typeBadgeClass =
        item.linkType === "internal"
          ? styles.badgeSuccess
          : item.linkType === "scheduled"
            ? styles.badgeWarning
            : styles.badgePrimary;

      const hrefPreview = buildHref(item, new Date());
      const isDeleting = !!deletingIds[item.id];

      return (
        <div key={item.id} className={styles.itemContainer} data-menu-id={item.id}>
          <div
            className={styles.menuItem}
            draggable={!isDeleting}
            onDragStart={(event) =>
              onDragStartRow(event, item, parentId ? "children" : "root", parentId)
            }
            onDragEnd={onDragEndRow}
            title={hrefPreview || ""}
            style={isDeleting ? { opacity: 0.5, pointerEvents: "none" } : undefined}
          >
            <span className={`${styles.order} text-white`}>{idx + 1}</span>
            <i className={`bi bi-grip-vertical ${styles.handle}`} />
            <span
              className={`${styles.depthBadge} ${
                depth === 1 ? styles.depthMain : styles.depthSub
              }`}
            >
              {depth === 1 ? "Main" : "Sub"}
            </span>
            <span className={`${styles.typeBadge} ${typeBadgeClass}`}>{item.linkType}</span>

            <span className={styles.flex1}>
              {highlight(item.title || "(Untitled)", q.trim())}
            </span>

            {hrefPreview ? (
              <span className={styles.linkPill}>{highlight(hrefPreview, q.trim())}</span>
            ) : null}

            <button
              type="button"
              className={`${styles.btn} ${styles.btnIcon} ${styles.btnOutlineLight}`}
              onClick={() => setEditing(item)}
              disabled={isDeleting}
              title="Edit menu item"
            >
              <i className="bi bi-sliders2" />
            </button>

            <button
              type="button"
              className={`${styles.btn} ${styles.btnIcon} ${styles.btnOutlineDanger}`}
              onMouseDown={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                askDelete(item.id);
              }}
              draggable={false}
              disabled={isDeleting}
              title="Delete this item"
            >
              <i className={`bi ${isDeleting ? "bi-hourglass-split" : "bi-x-lg"}`} />
            </button>
          </div>

          {depth < 2 ? (
            <div className={styles.subwrap} data-parent={item.id}>
              <div className={styles.smallHelp}>
                <i className="bi bi-diagram-2" /> Children of{" "}
                <b>{item.title || "(Untitled)"}</b>
              </div>

              <div
                className={`${styles.dropzone} ${styles.appSoft}`}
                onDragOver={handleDropzoneOver}
                onDragEnter={handleDropzoneOver}
                onDragLeave={handleDropzoneLeave}
                onDrop={(event) => {
                  if (dragInfo.current) {
                    handleDropMove(event, "children", item.id);
                  } else {
                    handleDropNew(event, "children", item.id);
                  }
                }}
              >
                {(item.children || []).length === 0 ? (
                  <p className={`${styles.smallHelp} m-0 py-2`}>
                    Drag items here to create a submenu (Level 2)
                  </p>
                ) : (
                  (item.children || []).map((child, childIndex) =>
                    renderRow(child, childIndex, depth + 1, item.id),
                  )
                )}
              </div>
            </div>
          ) : null}
        </div>
      );
    },
    [
      buildHref,
      deletingIds,
      q,
      onDragStartRow,
      onDragEndRow,
      askDelete,
      handleDropzoneOver,
      handleDropzoneLeave,
      handleDropMove,
      handleDropNew,
    ],
  );

  return (
    <div className={styles.card}>
      <div
        className={`${styles.dropzone} ${styles.appSoft}`}
        onDragOver={handleDropzoneOver}
        onDragEnter={handleDropzoneOver}
        onDragLeave={handleDropzoneLeave}
        onDrop={(event) => {
          if (dragInfo.current) {
            handleDropMove(event, "root");
          } else {
            handleDropNew(event, "root");
          }
        }}
      >
        {filteredTree.length === 0 ? (
          <p className={`${styles.smallHelp} text-center m-0 py-3`}>
            {q ? "No matching results found" : "Drag blocks here to create a level 1 menu"}
          </p>
        ) : (
          filteredTree.map((item, idx) => renderRow(item, idx, 1))
        )}
      </div>

      {editing ? <EditOffcanvas item={editing} onClose={() => setEditing(null)} /> : null}
    </div>
  );
}