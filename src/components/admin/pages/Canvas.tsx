"use client";
import React from "react";
import type { Block } from "@/lib/page/types";
import { REGISTRY } from "@/lib/ui-builder/registry";
import cls from "@/styles/admin/pages/canvas.module.css";

const findReg = (kind: string) => REGISTRY.find((r) => r.kind === kind);

type Device = "desktop" | "tablet" | "mobile";

type RenderBlockProps = {
  b: Block;
  selected: boolean;
  onSelect: () => void;
  allBlocks: Block[];
  setActiveId: (id: string | null) => void;
  move?: (dir: -1 | 1) => void;
  activeId: string | null;
  device: Device; // NEW
};

function RenderBlock({ b, selected, onSelect, allBlocks, setActiveId, move, activeId, device }: RenderBlockProps) {
  const reg = findReg(b.kind);
  let content: React.ReactNode;

  if (!reg) {
    content = <div className="text-muted small">Unknown: {b.kind}</div>;
  } else {
    try {
      const slots = {
        slot: (_name?: string) => {
          if (b.kind !== "Section") return null;
          const kids = allBlocks.filter((child) => {
            const par = (child.props as any)?.__parent;
            return par && par.id === b.id && (par.slot ?? "children") === "children";
          });
          if (kids.length === 0) return null;

          return (
            <div className="d-grid gap-2">
              {kids.map((child) => (
                <div key={child.id} className="border rounded-3 p-2">
                  <RenderBlock
                    b={child}
                    selected={activeId === child.id}
                    onSelect={() => setActiveId(child.id)}
                    allBlocks={allBlocks}
                    setActiveId={setActiveId}
                    move={move}
                    activeId={activeId}
                    device={device} // NEW
                  />
                </div>
              ))}
            </div>
          );
        },
        slotAt: (idx: number, _name?: string) => {
          if (b.kind !== "Row") return null;
          const kids = allBlocks.filter((child) => (child.props as any)?._parentRowId === b.id && Number((child.props as any)?._parentColIndex) === idx);
          if (kids.length === 0) return null;

          return (
            <div className="d-grid gap-2">
              {kids.map((child) => (
                <div key={child.id} className="border rounded-3 p-2">
                  <RenderBlock
                    b={child}
                    selected={activeId === child.id}
                    onSelect={() => setActiveId(child.id)}
                    allBlocks={allBlocks}
                    setActiveId={setActiveId}
                    move={move}
                    activeId={activeId}
                    device={device} // NEW
                  />
                </div>
              ))}
            </div>
          );
        },
      };

      let colCounts: Record<number, number> | undefined;
      if (b.kind === "Row") {
        colCounts = allBlocks.reduce((acc, x) => {
          const pid = (x.props as any)?._parentRowId;
          const ci = (x.props as any)?._parentColIndex;
          if (pid === b.id && Number.isFinite(ci)) {
            acc[Number(ci)] = (acc[Number(ci)] || 0) + 1;
          }
          return acc;
        }, {} as Record<number, number>);
      }

      const baseProps = b.props ?? {};

      const renderProps =
        b.kind === "Row"
          ? { ...baseProps, _selfId: b.id, _colCounts: colCounts, _device: device }
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
      // chặn navigation khi click vào <a> trong preview
      onClickCapture={(e) => {
        const el = e.target as HTMLElement;
        const a = el.closest("a");
        if (a) {
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
  device: Device; // NEW
};

export default function Canvas({ blocks, activeId, setActiveId, onDrop, move, device }: Props) {
  const [dragOver, setDragOver] = React.useState(false);

  const rootBlocks = React.useMemo(
    () =>
      blocks.filter((b) => {
        const p: any = b.props || {};
        const inRow = !!p._parentRowId;
        const inSection = !!p.__parent?.id;
        return !inRow && !inSection;
      }),
    [blocks]
  );

  function getDropMeta(ev: React.DragEvent) {
    const target = ev.target as HTMLElement;
    if (!target) return null;

    const colEl = target.closest("[data-col-slot]") as HTMLElement | null;
    if (colEl) {
      const rowId = (colEl as any).dataset.rowId || (colEl as any).dataset.rowid;
      const colIndex = Number((colEl as any).dataset.colSlot);
      if (rowId != null && Number.isFinite(colIndex)) {
        return { type: "row-col", parentRowId: String(rowId), colIndex };
      }
    }

    const secEl = target.closest("[data-section-slot]") as HTMLElement | null;
    if (secEl) {
      const parentSectionId = (secEl as any).dataset.hostId || (secEl as any).dataset.hostid || (secEl as any).dataset.sectionId;
      const slot = (secEl as any).dataset.sectionSlot || "children";
      if (parentSectionId) {
        return {
          type: "section",
          parentSectionId: String(parentSectionId),
          slot,
        };
      }
    }

    return null;
  }

  return (
    <div className={`card ${cls.card}`}>
      <div className="card-body p-0">
        <div
          className={`${cls.canvas} ${dragOver ? cls.canvasDropping : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            setDragOver(false);
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

          {/* Viewport theo device */}
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
                        allBlocks={blocks}
                        setActiveId={setActiveId}
                        move={move}
                        activeId={activeId}
                        device={device} // NEW
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
