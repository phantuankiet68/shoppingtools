"use client";
import React from "react";
import type { Block } from "@/lib/page/types";
import { REGISTRY } from "@/lib/ui-builder/registry";
import cls from "@/styles/admin/pages/canvas.module.css";

type Device = "desktop" | "tablet" | "mobile";

type SectionChildrenMap = Map<string, Block[]>;
type RowChildrenMap = Map<string, Map<number, Block[]>>;
type RowColCountsMap = Map<string, Record<number, number>>;

function isRootBlock(b: Block) {
  const p: any = b.props || {};
  const inRow = !!p._parentRowId;
  const inSection = !!p.__parent?.id;
  return !inRow && !inSection;
}

function buildRegistryMap() {
  const m = new Map<string, (typeof REGISTRY)[number]>();
  for (const r of REGISTRY) m.set(r.kind, r);
  return m;
}

function buildIndexes(blocks: Block[]) {
  const sectionChildren: SectionChildrenMap = new Map();
  const rowChildren: RowChildrenMap = new Map();
  const rowColCounts: RowColCountsMap = new Map();

  for (const child of blocks) {
    const p: any = child.props || {};

    const par = p.__parent;
    if (par?.id) {
      const slot = par.slot ?? "children";
      if (slot === "children") {
        const arr = sectionChildren.get(par.id) ?? [];
        arr.push(child);
        sectionChildren.set(par.id, arr);
      }
    }

    const rowId = p._parentRowId;
    const ciRaw = p._parentColIndex;
    const ci = Number(ciRaw);
    if (rowId && Number.isFinite(ci)) {
      let colMap = rowChildren.get(rowId);
      if (!colMap) {
        colMap = new Map<number, Block[]>();
        rowChildren.set(rowId, colMap);
      }
      const arr = colMap.get(ci) ?? [];
      arr.push(child);
      colMap.set(ci, arr);

      // counts
      const counts = rowColCounts.get(rowId) ?? {};
      counts[ci] = (counts[ci] || 0) + 1;
      rowColCounts.set(rowId, counts);
    }
  }

  return { sectionChildren, rowChildren, rowColCounts };
}

type RenderBlockProps = {
  b: Block;
  selected: boolean;
  onSelect: () => void;
  setActiveId: (id: string | null) => void;
  move?: (dir: -1 | 1) => void;
  activeId: string | null;
  device: Device;
  registryMap: Map<string, (typeof REGISTRY)[number]>;
  sectionChildren: SectionChildrenMap;
  rowChildren: RowChildrenMap;
  rowColCounts: RowColCountsMap;
};

function RenderBlock({ b, selected, onSelect, setActiveId, move, activeId, device, registryMap, sectionChildren, rowChildren, rowColCounts }: RenderBlockProps) {
  const reg = registryMap.get(b.kind);
  let content: React.ReactNode;

  if (!reg) {
    content = <div className="text-muted small">Unknown: {b.kind}</div>;
  } else {
    try {
      const slots = {
        slot: (_name?: string) => {
          if (b.kind !== "Section") return null;
          const kids = sectionChildren.get(b.id) ?? [];
          if (kids.length === 0) return null;

          return (
            <div className="d-grid gap-2">
              {kids.map((child) => (
                <div key={child.id} className="border rounded-3 p-2">
                  <RenderBlock
                    b={child}
                    selected={activeId === child.id}
                    onSelect={() => setActiveId(child.id)}
                    setActiveId={setActiveId}
                    move={move}
                    activeId={activeId}
                    device={device}
                    registryMap={registryMap}
                    sectionChildren={sectionChildren}
                    rowChildren={rowChildren}
                    rowColCounts={rowColCounts}
                  />
                </div>
              ))}
            </div>
          );
        },

        slotAt: (idx: number, _name?: string) => {
          if (b.kind !== "Row") return null;
          const colMap = rowChildren.get(b.id);
          const kids = colMap?.get(idx) ?? [];
          if (kids.length === 0) return null;

          return (
            <div className="d-grid gap-2">
              {kids.map((child) => (
                <div key={child.id} className="border rounded-3 p-2">
                  <RenderBlock
                    b={child}
                    selected={activeId === child.id}
                    onSelect={() => setActiveId(child.id)}
                    setActiveId={setActiveId}
                    move={move}
                    activeId={activeId}
                    device={device}
                    registryMap={registryMap}
                    sectionChildren={sectionChildren}
                    rowChildren={rowChildren}
                    rowColCounts={rowColCounts}
                  />
                </div>
              ))}
            </div>
          );
        },
      };

      const baseProps = b.props ?? {};

      const renderProps =
        b.kind === "Row"
          ? { ...baseProps, _selfId: b.id, _colCounts: rowColCounts.get(b.id), _device: device }
          : b.kind === "Section"
            ? { ...baseProps, _selfId: b.id, _device: device }
            : { ...baseProps, _device: device };

      content = (reg as any).render(renderProps, slots) ?? <div className="text-muted small">No preview from {b.kind}</div>;
    } catch (e: any) {
      content = (
        <div className="alert alert-danger py-2 px-3 mb-0 small">
          <i className="bi bi-bug" /> Render error: {e?.message}
        </div>
      );
    }
  }

  return (
    <div
      className={`${cls.block} ${selected ? cls.selected : ""}`}
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      aria-label={`Block ${b.kind}`}
      onPointerDownCapture={(e) => {
        const ne = e.nativeEvent as PointerEvent;
        if (ne.pointerType !== "mouse" || ne.buttons === 1) onSelect();
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      onClickCapture={(e) => {
        const el = e.target as HTMLElement;
        const a = el.closest("a") as HTMLAnchorElement | null;
        if (a && a.getAttribute("href")) {
          e.preventDefault();
          e.stopPropagation();
        }
      }}>
      <div className={cls.blockBody}>
        <div className={cls.badge}>
          <span className={cls.badgeDot} />
          <span className={cls.badgeText}>{b.kind}</span>
        </div>
        <div className={cls.blockInner}>{content}</div>
      </div>
    </div>
  );
}

type Props = {
  blocks: Block[];
  activeId: string | null;
  setActiveId: (id: string | null) => void;
  onDrop: (e: React.DragEvent) => void;
  move?: (dir: -1 | 1) => void;
  device: Device;
};

export default function Canvas({ blocks, activeId, setActiveId, onDrop, move, device }: Props) {
  const [dragOver, setDragOver] = React.useState(false);
  const dragRafRef = React.useRef<number | null>(null);
  const dragDesiredRef = React.useRef(false);

  const setDragOverThrottled = React.useCallback((v: boolean) => {
    dragDesiredRef.current = v;
    if (dragRafRef.current != null) return;
    dragRafRef.current = window.requestAnimationFrame(() => {
      dragRafRef.current = null;
      setDragOver(dragDesiredRef.current);
    });
  }, []);

  React.useEffect(() => {
    return () => {
      if (dragRafRef.current != null) cancelAnimationFrame(dragRafRef.current);
    };
  }, []);

  const registryMap = React.useMemo(() => buildRegistryMap(), []);
  const { sectionChildren, rowChildren, rowColCounts } = React.useMemo(() => buildIndexes(blocks), [blocks]);

  const rootBlocks = React.useMemo(() => blocks.filter(isRootBlock), [blocks]);

  const getDropMeta = React.useCallback((ev: React.DragEvent) => {
    const target = ev.target as HTMLElement | null;
    if (!target) return null;

    const colEl = target.closest("[data-col-slot]") as HTMLElement | null;
    if (colEl) {
      const rowId = colEl.dataset.rowId || (colEl as any).dataset.rowid;
      const colIndex = Number(colEl.dataset.colSlot);
      if (rowId != null && Number.isFinite(colIndex)) {
        return { type: "row-col" as const, parentRowId: String(rowId), colIndex };
      }
    }

    const secEl = target.closest("[data-section-slot]") as HTMLElement | null;
    if (secEl) {
      const parentSectionId = secEl.dataset.hostId || (secEl as any).dataset.hostid || secEl.dataset.sectionId;
      const slot = secEl.dataset.sectionSlot || "children";
      if (parentSectionId) {
        return {
          type: "section" as const,
          parentSectionId: String(parentSectionId),
          slot,
        };
      }
    }

    return null;
  }, []);

  return (
    <div className={`card ${cls.card}`}>
      <div className="card-body p-0">
        <div
          className={`${cls.canvas} ${dragOver ? cls.canvasDropping : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOverThrottled(true);
          }}
          onDragLeave={() => setDragOverThrottled(false)}
          onDrop={(e) => {
            setDragOverThrottled(false);
            const meta = getDropMeta(e);
            (e as any).zbMeta = meta;
            onDrop(e);
          }}
          onClick={(e) => {
            if (e.currentTarget === e.target) setActiveId(null);
          }}>
          {rootBlocks.length === 0 && (
            <div className={cls.empty}>
              <div className={cls.emptyIcon}>
                <i className="bi bi-magic" />
              </div>
              <div className={cls.emptyTitle}>Kéo block vào đây</div>
              <div className={cls.emptyHint}>Thả component từ palette sang để bắt đầu thiết kế ✨</div>
            </div>
          )}
          <div className={cls.viewportOuter}>
            <div className={`${cls.viewport} ${device === "desktop" ? cls.viewportDesktop : device === "tablet" ? cls.viewportTablet : cls.viewportMobile}`}>
              <div className={cls.grid}>
                {rootBlocks.map((b, idx) => {
                  const selected = activeId === b.id;

                  return (
                    <div key={b.id} className={cls.gridItem}>
                      <RenderBlock
                        b={b}
                        selected={selected}
                        onSelect={() => setActiveId(b.id)}
                        setActiveId={setActiveId}
                        move={move}
                        activeId={activeId}
                        device={device}
                        registryMap={registryMap}
                        sectionChildren={sectionChildren}
                        rowChildren={rowChildren}
                        rowColCounts={rowColCounts}
                      />

                      {selected && (
                        <div className={cls.floatingTools}>
                          {typeof move === "function" && (
                            <>
                              <button type="button" className={`${cls.ftBtn} ${cls.ftGhost}`} onClick={() => move(-1)} title="Move up">
                                <i className="bi bi-arrow-up" />
                              </button>
                              <button type="button" className={`${cls.ftBtn} ${cls.ftGhost}`} onClick={() => move(1)} title="Move down">
                                <i className="bi bi-arrow-down" />
                              </button>
                              <div className={cls.ftSep} />
                            </>
                          )}
                        </div>
                      )}

                      {idx < rootBlocks.length - 1 && <div className={cls.slot} />}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className={cls.dropOverlay} aria-hidden>
            <div className={cls.dropRing} />
            <div className={cls.dropText}>Thả để thêm block</div>
          </div>
        </div>
      </div>
    </div>
  );
}
