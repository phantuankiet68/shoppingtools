"use client";

import { Dispatch, SetStateAction, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "@/styles/admin/builder/menus/MenuStructure.module.css";
import EditOffcanvas from "./EditOffcanvas";
import React from "react";
import { useMenuStore } from "@/components/admin/builder/menus/state/useMenuStore";
import { MENU_MESSAGES as M } from "@/features/builder/menus/messages";
import { useModal } from "@/components/admin/shared/common/modal";

type MenuItem = ReturnType<typeof useMenuStore>["activeMenu"][number];

type DragInfo = null | {
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

export default function MenuStructure({ q }: MenuStructureProps) {
  const router = useRouter();
  const modal = useModal();
  const { activeMenu, setActiveMenu, removeItemById, buildHref, findItem } = useMenuStore();

  const [editing, setEditing] = useState<MenuItem | null>(null);
  const dragInfo = useRef<DragInfo>(null);
  const overRef = useRef<HTMLElement | null>(null);

  const handleDelete = async (id: string) => {
    const current = findItem(id);
    const el = document.querySelector(`[data-menu-id="${id}"]`);

    if (el) {
      (el as HTMLElement).style.opacity = "0.4";
    }

    try {
      const res = await fetch(`/api/admin/builder/menus/${id}`, {
        method: "DELETE",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      modal.success("Success", `Deleted “${current?.title || "menu item"}” successfully.`);

      router.refresh();
      setTimeout(() => window.location.reload(), 100);
    } catch (e: unknown) {
      modal.error("Delete failed", (e as Error)?.message || "Xóa thất bại");
      if (el) {
        (el as HTMLElement).style.opacity = "";
      }
    }
  };

  const askDelete = (id: string) => {
    const current = findItem(id);

    modal.confirmDelete(
      M.menuStructure.confirmDeleteTitle || "Delete menu item?",
      `Delete “${current?.title || "this item"}”? This action cannot be undone.`,
      () => {
        void handleDelete(id);
      },
    );
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

  function isRootItemId(id?: string) {
    if (!id) return false;
    return (activeMenu || []).some((it) => it.id === id);
  }

  function onDropNew(e: React.DragEvent, zone: "root" | "children", parentId?: string) {
    e.preventDefault();
    e.stopPropagation();

    if (zone === "children" && !isRootItemId(parentId)) return;

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
        id: baseId,
        title,
        icon: "",
        linkType: (linkType as MenuItem["linkType"]) ?? "internal",
        externalUrl: (payload.externalUrl as string) ?? "",
        newTab: false,
        internalPageId: (payload.internalPageId as string) ?? null,
        rawPath: (rawPath as string) ?? "",
        ...(slug ? { slug } : {}),
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
      setOver(overRef.current, false);
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

    if (zone === "children" && !isRootItemId(parentId)) return;
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
      const next = nextRoot.map((it) =>
        it.id === parentId ? { ...it, children: [...(it.children || []), removed] } : it,
      );
      setActiveMenu(next);
    }

    dragInfo.current = null;

    setOver(overRef.current, false);
    overRef.current = null;
  }

  const onDropzoneOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = dragInfo.current ? "move" : "copy";

    if (overRef.current !== e.currentTarget) {
      setOver(overRef.current, false);
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
    const typeBadgeClass =
      item.linkType === "internal"
        ? styles.badgeSuccess
        : item.linkType === "scheduled"
          ? styles.badgeWarning
          : styles.badgePrimary;

    const hrefPreview = buildHref(item, new Date());

    return (
      <div key={item.id} className={styles.itemContainer} data-menu-id={item.id}>
        <div
          className={styles.menuItem}
          draggable
          onDragStart={(e) => onDragStartRow(e, item, parentId ? "children" : "root", parentId)}
          onDragEnd={onDragEndRow}
          title={hrefPreview || ""}
        >
          <span className={`${styles.order} text-white`}>{idx + 1}</span>
          <i className={`bi bi-grip-vertical ${styles.handle}`} />
          <span className={`${styles.depthBadge} ${depth === 1 ? styles.depthMain : styles.depthSub}`}>
            {depth === 1 ? "Main" : "Sub"}
          </span>
          <span className={`${styles.typeBadge} ${typeBadgeClass}`}>{item.linkType}</span>

          <span className={styles.flex1}>{highlight(item.title || "(No title)", q.trim())}</span>

          {hrefPreview ? <span className={styles.linkPill}>{highlight(hrefPreview, q.trim())}</span> : null}

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
            title="Xoá mục này"
          >
            <i className="bi bi-x-lg" />
          </button>
        </div>

        {depth < 2 ? (
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
              }}
            >
              {(item.children || []).length === 0 ? (
                <p className={`${styles.smallHelp} m-0 py-2`}>Kéo item vào đây để tạo Submenu (Cấp 2)</p>
              ) : (
                (item.children || []).map((child, i) => renderRow(child, i, depth + 1, item.id))
              )}
            </div>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <>
      <div className={styles.card}>
        <div
          className={`${styles.dropzone} ${styles.appSoft}`}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = dragInfo.current ? "move" : "copy";

            if (overRef.current !== e.currentTarget) {
              setOver(overRef.current, false);
              overRef.current = e.currentTarget as HTMLElement;
              setOver(e.currentTarget as HTMLElement, true);
            }
          }}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDragLeave={(e) => {
            if (overRef.current === e.currentTarget) {
              setOver(e.currentTarget as HTMLElement, false);
              overRef.current = null;
            }
          }}
          onDrop={(e) => {
            if (dragInfo.current) onDropMove(e, "root");
            else onDropNew(e, "root");
          }}
        >
          {filteredTree.length === 0 ? (
            <p className={`${styles.smallHelp} text-center m-0 py-3`}>
              {q ? "Không tìm thấy kết quả" : "Thả block vào đây (Cấp 1)"}
            </p>
          ) : (
            filteredTree.map((it, idx) => renderRow(it, idx, 1))
          )}
        </div>

        {editing && <EditOffcanvas item={editing} onClose={() => setEditing(null)} />}
      </div>
    </>
  );
}
