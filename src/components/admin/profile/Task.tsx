"use client";

import { useMemo } from "react";
import styles from "@/styles/admin/profile/tasks.module.css";

type Member = { id: string; key: "A" | "B" | "C" | "D"; name: string; sub: string; color: "blue" | "purple" | "pink" | "amber" };
type TimelineItem = { id: string; label: string; pct: number; startCol: number; span: number; color: Member["color"] };
type Task = { id: string; title: string; dot?: Member["color"]; meta?: string; starred?: boolean };

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

  const draft: Task[] = useMemo(
    () => [
      { id: "d1", title: "Incident ut labore et dolore", dot: "blue", meta: "2 files • 1 note" },
      { id: "d2", title: "Magna aliqua enim", dot: "purple", meta: "3 subtasks" },
    ],
    []
  );

  const progress: Task[] = useMemo(
    () => [
      { id: "p1", title: "Incident ut labore et dolore", dot: "pink", meta: "Progress 75%", starred: true },
      { id: "p2", title: "Consectetur adipiscing", dot: "blue", meta: "Needs review" },
    ],
    []
  );

  const editing: Task[] = useMemo(
    () => [
      { id: "e1", title: "Adipiscing elit sed do", dot: "purple", meta: "Supervisor: A" },
      { id: "e2", title: "Labore magna aliqua", dot: "blue", meta: "2 comments" },
      { id: "e3", title: "Excepteur sint occaecat", dot: "amber", meta: "QA" },
    ],
    []
  );

  const done: Task[] = useMemo(
    () => [
      { id: "x1", title: "Incididunt ut labore et…", dot: "blue", meta: "Done" },
      { id: "x2", title: "Magna aliqua enim…", dot: "purple", meta: "Done" },
      { id: "x3", title: "Incididunt ut labore et…", dot: "pink", meta: "Done" },
    ],
    []
  );

  return (
    <div className={styles.page}>
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

        {/* Center: timeline + kanban */}
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
      <div className={styles.kanban}>
        <KanbanCol title="Draft" items={draft} />
        <KanbanCol title="In Progress" items={progress} />
        <KanbanCol title="Editing" items={editing} />
        <KanbanCol title="Done" items={done} />
      </div>
    </div>
  );
}

function KanbanCol({ title, items }: { title: string; items: Task[] }) {
  return (
    <div className={styles.col}>
      <div className={styles.colHead}>
        <div className={styles.colTitle}>{title}</div>
        <span className={styles.colCount}>{items.length}</span>
      </div>

      <div className={styles.cardList}>
        {items.map((t) => (
          <div key={t.id} className={styles.taskCard}>
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
        ))}
      </div>
    </div>
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
