"use client";

import { useMemo, useRef, useState } from "react";
import styles from "@/styles/admin/profile/tasks.module.css";

type Member = { id: string; key: "A" | "B" | "C" | "D"; name: string; sub: string; color: "blue" | "purple" | "pink" | "amber" };
type TimelineItem = { id: string; label: string; pct: number; startCol: number; span: number; color: Member["color"] };
type Task = { id: string; title: string; dot?: Member["color"]; meta?: string; starred?: boolean };

type ColKey = "draft" | "progress" | "editing" | "done";

type DragPayload = {
  taskId: string;
  fromCol: ColKey;
};

type DragState = {
  dragging?: DragPayload;
  overCol?: ColKey;
  overIndex?: number; // vị trí sẽ insert vào (0..len)
};

export default function AdminTasksClient() {
  const members: Member[] = useMemo(
    () => [
      { id: "m1", key: "A", name: "Incident UI Labore", sub: "A Team", color: "blue" },
      { id: "m2", key: "B", name: "Mini Admin Vietnam", sub: "B Team", color: "purple" },
      { id: "m3", key: "C", name: "Adipiscing Elit", sub: "C Team", color: "pink" },
      { id: "m4", key: "D", name: "Excepteur Sint", sub: "D Team", color: "amber" },
    ],
    []
  );

  const timeline: TimelineItem[] = useMemo(
    () => [
      { id: "t1", label: "Lorem", pct: 55, startCol: 1, span: 5, color: "blue" },
      { id: "t2", label: "Ipsum", pct: 80, startCol: 2, span: 6, color: "purple" },
      { id: "t3", label: "Dolor", pct: 65, startCol: 2, span: 4, color: "pink" },
      { id: "t4", label: "Magna", pct: 75, startCol: 4, span: 6, color: "amber" },
    ],
    []
  );

  // ====== Kanban state (thay vì useMemo cố định) ======
  const [kanban, setKanban] = useState<Record<ColKey, Task[]>>({
    draft: [
      { id: "d1", title: "Incident ut labore et dolore", dot: "blue", meta: "2 files • 1 note" },
      { id: "d2", title: "Magna aliqua enim", dot: "purple", meta: "3 subtasks" },
    ],
    progress: [
      { id: "p1", title: "Incident ut labore et dolore", dot: "pink", meta: "Progress 75%", starred: true },
      { id: "p2", title: "Consectetur adipiscing", dot: "blue", meta: "Needs review" },
    ],
    editing: [
      { id: "e1", title: "Adipiscing elit sed do", dot: "purple", meta: "Supervisor: A" },
      { id: "e2", title: "Labore magna aliqua", dot: "blue", meta: "2 comments" },
      { id: "e3", title: "Excepteur sint occaecat", dot: "amber", meta: "QA" },
    ],
    done: [
      { id: "x1", title: "Incididunt ut labore et…", dot: "blue", meta: "Done" },
      { id: "x2", title: "Magna aliqua enim…", dot: "purple", meta: "Done" },
      { id: "x3", title: "Incididunt ut labore et…", dot: "pink", meta: "Done" },
    ],
  });

  // ====== Drag helpers ======
  const [drag, setDrag] = useState<DragState>({});
  const dragImageRef = useRef<HTMLDivElement | null>(null);

  function setDataTransfer(e: React.DragEvent, payload: DragPayload) {
    e.dataTransfer.setData("application/x-kanban-task", JSON.stringify(payload));
    e.dataTransfer.effectAllowed = "move";

    // Optional: custom drag image (nhẹ nhàng hơn)
    if (dragImageRef.current) {
      e.dataTransfer.setDragImage(dragImageRef.current, 10, 10);
    }
  }

  function readPayload(e: React.DragEvent): DragPayload | null {
    const raw = e.dataTransfer.getData("application/x-kanban-task");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DragPayload;
    } catch {
      return null;
    }
  }

  function removeFromColumn(col: ColKey, taskId: string, state: Record<ColKey, Task[]>) {
    const idx = state[col].findIndex((t) => t.id === taskId);
    if (idx < 0) return { next: state, removed: null as Task | null, removedIndex: -1 };

    const removed = state[col][idx];
    const nextCol = state[col].slice();
    nextCol.splice(idx, 1);

    return {
      next: { ...state, [col]: nextCol },
      removed,
      removedIndex: idx,
    };
  }

  function insertIntoColumn(col: ColKey, item: Task, index: number, state: Record<ColKey, Task[]>) {
    const nextCol = state[col].slice();
    const safeIndex = Math.max(0, Math.min(index, nextCol.length));
    nextCol.splice(safeIndex, 0, item);
    return { ...state, [col]: nextCol };
  }

  function moveTask(payload: DragPayload, toCol: ColKey, toIndex: number) {
    setKanban((prev) => {
      // 1) remove from source
      const { next: afterRemove, removed } = removeFromColumn(payload.fromCol, payload.taskId, prev);
      if (!removed) return prev;

      // 2) adjust index if moving within same column and removing above insertion point
      let finalIndex = toIndex;
      if (payload.fromCol === toCol) {
        // if removed index < toIndex, then insertion index shifts by -1
        const oldIndex = prev[payload.fromCol].findIndex((t) => t.id === payload.taskId);
        if (oldIndex >= 0 && oldIndex < toIndex) finalIndex = Math.max(0, toIndex - 1);
      }

      // 3) insert into target
      return insertIntoColumn(toCol, removed, finalIndex, afterRemove);
    });
  }

  // ====== Render ======
  return (
    <div className={styles.page}>
      {/* invisible drag image */}
      <div
        ref={dragImageRef}
        style={{
          position: "fixed",
          top: -9999,
          left: -9999,
          padding: 8,
          borderRadius: 12,
          background: "rgba(0,0,0,.75)",
          color: "#fff",
          fontSize: 12,
          pointerEvents: "none",
        }}>
        Moving…
      </div>

      {/* Header */}
      <div className={styles.top}>
        <div className={styles.topLeft}>
          <div className={styles.title}>Task Management</div>
        </div>

        <div className={styles.topRight}>
          <button className={styles.iconBtn} type="button" title="Search">
            <i className="bi bi-search" />
          </button>
          <button className={styles.iconBtn} type="button" title="Filter">
            <i className="bi bi-funnel" />
          </button>
          <button className={styles.primaryBtn} type="button">
            <i className="bi bi-plus-lg" /> New task
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {/* Left members */}
        <aside className={styles.left}>
          <div className={styles.leftCard}>
            <div className={styles.leftHead}>
              <div className={styles.leftHeadTitle}>Teams</div>
              <button className={styles.miniBtn} type="button" title="More">
                <i className="bi bi-three-dots" />
              </button>
            </div>

            <div className={styles.memberList}>
              {members.map((m) => (
                <button key={m.id} className={styles.memberItem} type="button">
                  <div className={`${styles.memberBadge} ${styles[`c_${m.color}`]}`}>{m.key}</div>
                  <div className={styles.memberMeta}>
                    <div className={styles.memberName}>{m.name}</div>
                    <div className={styles.memberSub}>{m.sub}</div>
                  </div>
                  <span className={styles.memberChevron}>
                    <i className="bi bi-chevron-right" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Center: timeline */}
        <section className={styles.center}>
          <div className={styles.timelineCard}>
            <div className={styles.timelineGrid}>
              {/* columns header */}
              <div className={styles.timelineHeaderRow}>
                {["28", "29", "30", "31", "01", "02", "03", "04", "05", "06"].map((d) => (
                  <div key={d} className={styles.dayCell}>
                    {d}
                  </div>
                ))}
              </div>

              {/* vertical grid lines */}
              <div className={styles.timelineLines}>
                {Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className={styles.vline} />
                ))}
              </div>

              {/* bars */}
              <div className={styles.bars}>
                {timeline.map((t) => (
                  <div
                    key={t.id}
                    className={`${styles.bar} ${styles[`c_${t.color}`]}`}
                    style={{
                      gridColumn: `${t.startCol} / span ${t.span}`,
                    }}>
                    <div className={styles.barLeft}>
                      <span className={styles.toggle}>
                        <span className={styles.toggleDot} />
                      </span>
                      <div className={styles.barLabel}>
                        <div className={styles.barTitle}>{t.label}</div>
                        <div className={styles.barSub}>Task progress</div>
                      </div>
                    </div>
                    <div className={styles.barPct}>{t.pct}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Kanban */}
      <div className={styles.kanban}>
        <KanbanCol
          colKey="draft"
          title="Draft"
          items={kanban.draft}
          drag={drag}
          onDragStart={(payload) => setDrag({ dragging: payload })}
          onDragOverIndex={(colKey, index) => setDrag((s) => ({ ...s, overCol: colKey, overIndex: index }))}
          onDrop={(payload, colKey, index) => {
            moveTask(payload, colKey, index);
            setDrag({});
          }}
          onDragEnd={() => setDrag({})}
          setDataTransfer={setDataTransfer}
        />

        <KanbanCol
          colKey="progress"
          title="In Progress"
          items={kanban.progress}
          drag={drag}
          onDragStart={(payload) => setDrag({ dragging: payload })}
          onDragOverIndex={(colKey, index) => setDrag((s) => ({ ...s, overCol: colKey, overIndex: index }))}
          onDrop={(payload, colKey, index) => {
            moveTask(payload, colKey, index);
            setDrag({});
          }}
          onDragEnd={() => setDrag({})}
          setDataTransfer={setDataTransfer}
        />

        <KanbanCol
          colKey="editing"
          title="Editing"
          items={kanban.editing}
          drag={drag}
          onDragStart={(payload) => setDrag({ dragging: payload })}
          onDragOverIndex={(colKey, index) => setDrag((s) => ({ ...s, overCol: colKey, overIndex: index }))}
          onDrop={(payload, colKey, index) => {
            moveTask(payload, colKey, index);
            setDrag({});
          }}
          onDragEnd={() => setDrag({})}
          setDataTransfer={setDataTransfer}
        />

        <KanbanCol
          colKey="done"
          title="Done"
          items={kanban.done}
          drag={drag}
          onDragStart={(payload) => setDrag({ dragging: payload })}
          onDragOverIndex={(colKey, index) => setDrag((s) => ({ ...s, overCol: colKey, overIndex: index }))}
          onDrop={(payload, colKey, index) => {
            moveTask(payload, colKey, index);
            setDrag({});
          }}
          onDragEnd={() => setDrag({})}
          setDataTransfer={setDataTransfer}
        />
      </div>
    </div>
  );
}

function KanbanCol(props: {
  colKey: ColKey;
  title: string;
  items: Task[];
  drag: DragState;
  onDragStart: (payload: DragPayload) => void;
  onDragOverIndex: (colKey: ColKey, index: number) => void;
  onDrop: (payload: DragPayload, colKey: ColKey, index: number) => void;
  onDragEnd: () => void;
  setDataTransfer: (e: React.DragEvent, payload: DragPayload) => void;
}) {
  const { colKey, title, items, drag, onDragStart, onDragOverIndex, onDrop, onDragEnd, setDataTransfer } = props;

  const isOverThisCol = drag.overCol === colKey;
  const overIndex = isOverThisCol ? drag.overIndex : undefined;

  function handleColDragOver(e: React.DragEvent) {
    // cần preventDefault để cho phép drop
    e.preventDefault();
    // nếu kéo vào khoảng trống cuối cột => insert ở cuối
    onDragOverIndex(colKey, items.length);
  }

  function handleColDrop(e: React.DragEvent) {
    e.preventDefault();
    const payload = readPayload(e);
    if (!payload) return;
    const index = typeof overIndex === "number" ? overIndex : items.length;
    onDrop(payload, colKey, index);
  }

  function readPayload(e: React.DragEvent): DragPayload | null {
    const raw = e.dataTransfer.getData("application/x-kanban-task");
    if (!raw) return null;
    try {
      return JSON.parse(raw) as DragPayload;
    } catch {
      return null;
    }
  }

  return (
    <div
      className={styles.col}
      onDragOver={handleColDragOver}
      onDrop={handleColDrop}
      style={
        isOverThisCol
          ? {
              outline: "2px dashed rgba(0,0,0,.12)",
              outlineOffset: 6,
              borderRadius: 16,
            }
          : undefined
      }>
      <div className={styles.colHead}>
        <div className={styles.colTitle}>{title}</div>
        <span className={styles.colCount}>{items.length}</span>
      </div>

      <div className={styles.cardList}>
        {/* placeholder line at top (index 0) */}
        {isOverThisCol && overIndex === 0 && <DropLine />}

        {items.map((t, idx) => {
          const isDraggingThis = drag.dragging?.taskId === t.id;

          return (
            <div key={t.id}>
              <div
                className={styles.taskCard}
                draggable
                onDragStart={(e) => {
                  const payload: DragPayload = { taskId: t.id, fromCol: colKey };
                  setDataTransfer(e, payload);
                  onDragStart(payload);
                }}
                onDragEnd={onDragEnd}
                onDragOver={(e) => {
                  e.preventDefault();
                  // Khi rê qua card này, ta set vị trí insert = idx (trước card)
                  onDragOverIndex(colKey, idx);
                }}
                style={
                  isDraggingThis
                    ? {
                        opacity: 0.45,
                        transform: "scale(0.99)",
                      }
                    : undefined
                }>
                <div className={styles.taskTop}>
                  <span className={`${styles.taskDot} ${t.dot ? styles[`c_${t.dot}`] : ""}`} />
                  <div className={styles.taskTitle}>{t.title}</div>
                  {t.starred && (
                    <span className={styles.star} title="Starred">
                      <i className="bi bi-star-fill" />
                    </span>
                  )}
                </div>

                {t.meta && <div className={styles.taskMeta}>{t.meta}</div>}

                <div className={styles.taskFoot}>
                  <span className={styles.pill}>
                    <i className="bi bi-check2-circle" /> Main Task
                  </span>
                  <span className={styles.smallIcons}>
                    <i className="bi bi-chat-dots" />
                    <i className="bi bi-paperclip" />
                  </span>
                </div>
              </div>

              {/* placeholder line between items: insert at idx+1 */}
              {isOverThisCol && overIndex === idx + 1 && <DropLine />}
            </div>
          );
        })}

        {/* Nếu cột trống và đang over, show drop line */}
        {items.length === 0 && isOverThisCol && <DropLine />}
      </div>
    </div>
  );
}

function DropLine() {
  return (
    <div
      style={{
        height: 10,
        margin: "10px 6px",
        borderRadius: 999,
        background: "rgba(0,0,0,.10)",
      }}
    />
  );
}

function Ring({ label, value, color }: { label: string; value: number; color: "blue" | "purple" | "pink" | "amber" }) {
  return (
    <div className={styles.ringItem}>
      <div className={`${styles.ring} ${styles[`c_${color}`]}`}>
        <div className={styles.ringInner}>{value}</div>
      </div>
      <div className={styles.ringLabel}>{label}</div>
    </div>
  );
}
