"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/profile/calendar.module.css";

type EventItem = {
  id: string;
  title: string;
  day: number; // 1..31 for demo
  time?: string;
  color: "blue" | "purple" | "green" | "amber" | "red" | "teal";
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AdminCalendarClient() {
  const [monthLabel] = useState("April 2025");
  const [activeView, setActiveView] = useState<"Month" | "Week" | "Day">("Month");

  // demo: April 2025 starts on Tue (index 2) and has 30 days
  const startDow = 2;
  const daysInMonth = 30;

  const events: EventItem[] = useMemo(
    () => [
      { id: "e1", title: "Cybersecurity audit", day: 1, time: "03:03", color: "blue" },
      { id: "e2", title: "My Event 1", day: 1, time: "10:30", color: "purple" },
      { id: "e3", title: "Marathon training", day: 2, time: "19:00", color: "blue" },
      { id: "e4", title: "Doctor's appointment", day: 4, time: "16:48", color: "amber" },
      { id: "e5", title: "Gym workout", day: 8, time: "02:42", color: "green" },
      { id: "e6", title: "Budget review", day: 10, time: "19:30", color: "blue" },
      { id: "e7", title: "Theater play", day: 11, time: "03:43", color: "amber" },
      { id: "e8", title: "API integration", day: 12, time: "01:32", color: "red" },
      { id: "e9", title: "Business trip", day: 12, time: "07:54", color: "purple" },
      { id: "e10", title: "Hotel check-in", day: 14, time: "22:44", color: "purple" },
      { id: "e11", title: "Customer support", day: 15, time: "19:57", color: "purple" },
      { id: "e12", title: "Client presentation", day: 16, time: "20:54", color: "red" },
      { id: "e13", title: "Football match", day: 19, time: "03:29", color: "amber" },
      { id: "e14", title: "HR interview", day: 21, time: "17:51", color: "blue" },
      { id: "e15", title: "Investor relations", day: 22, time: "16:10", color: "amber" },
      { id: "e16", title: "Business meeting", day: 23, time: "19:54", color: "green" },
      { id: "e17", title: "Marathon training", day: 23, time: "19:55", color: "amber" },
      { id: "e18", title: "Car maintenance", day: 25, time: "19:41", color: "amber" },
      { id: "e19", title: "Blood donation", day: 26, time: "20:49", color: "blue" },
      { id: "e20", title: "Blood donation", day: 30, time: "20:49", color: "blue" },
    ],
    []
  );

  const cells = useMemo(() => {
    const used = startDow + daysInMonth; // số ô có ngày + offset
    const weeks = Math.ceil(used / 7); // số tuần thực tế (4–6)
    const total = weeks * 7;

    const arr: Array<{ day: number | null; events: EventItem[] }> = [];

    for (let i = 0; i < total; i++) {
      const d = i - startDow + 1;
      const day = d >= 1 && d <= daysInMonth ? d : null;
      arr.push({ day, events: day ? events.filter((e) => e.day === day) : [] });
    }

    return arr;
  }, [events, startDow, daysInMonth]);

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.top}>
        <div className={styles.topLeft}>
          <div className={styles.monthPill}>
            <span className={styles.monthTag}>APR</span>
            <span className={styles.monthDay}>15</span>
          </div>

          <div className={styles.monthBlock}>
            <div className={styles.monthTitle}>
              {monthLabel} <span className={styles.monthCount}>33 events</span>
            </div>
            <div className={styles.monthRange}>Apr 1, 2025 - Apr 30, 2025</div>
          </div>
        </div>

        <div className={styles.topRight}>
          <button className={styles.iconBtn} type="button" title="Filter">
            <i className="bi bi-funnel" />
          </button>

          <div className={styles.viewGroup} role="group" aria-label="View">
            {(["Day", "Week", "Month"] as const).map((v) => (
              <button key={v} type="button" className={`${styles.viewBtn} ${activeView === v ? styles.viewBtnActive : ""}`} onClick={() => setActiveView(v)}>
                {v}
              </button>
            ))}
          </div>

          <div className={styles.avatarGroup} title="Team">
            {["M", "A", "R", "I"].map((c) => (
              <span key={c} className={styles.avatarChip}>
                {c}
              </span>
            ))}
            <span className={styles.avatarMore}>All</span>
          </div>

          <button className={styles.primaryBtn} type="button">
            <i className="bi bi-plus-lg" />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Calendar */}
      <div className={styles.card}>
        <div className={styles.weekHeader}>
          {WEEKDAYS.map((d) => (
            <div key={d} className={styles.weekCell}>
              {d}
            </div>
          ))}
        </div>

        <div className={styles.grid}>
          {cells.map((c, idx) => (
            <div key={idx} className={styles.cell}>
              <div className={styles.cellTop}>{c.day ? <span className={styles.dayNum}>{c.day}</span> : <span className={styles.dayBlank} />}</div>

              <div className={styles.events}>
                {c.events.slice(0, 3).map((e) => (
                  <button key={e.id} type="button" className={`${styles.event} ${styles[`c_${e.color}`]}`}>
                    <span className={styles.eventTitle}>{e.title}</span>
                    {e.time && <span className={styles.eventTime}>{e.time}</span>}
                  </button>
                ))}

                {c.events.length > 3 && (
                  <button type="button" className={styles.more}>
                    +{c.events.length - 3} more
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
