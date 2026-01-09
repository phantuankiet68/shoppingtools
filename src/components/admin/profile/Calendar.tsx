"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/profile/calendar.module.css";

type EventColor = "blue" | "purple" | "green" | "amber" | "red" | "teal";
type Mode = "create" | "edit";

type EventItem = {
  id: string;
  title: string;
  day: number; // ngày trong tháng đang xem
  time?: string; // "HH:mm"
  color: EventColor;
  description?: string;
  location?: string;
  allDay?: boolean;
  startAt?: string; // ISO (optional for debug)
  endAt?: string; // ISO (optional for debug)
};

type ApiEvent = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  color: "BLUE" | "PURPLE" | "GREEN" | "AMBER" | "RED" | "TEAL";
  allDay: boolean;
  startAt: string; // ISO
  endAt: string; // ISO
};

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function isValidTime(v: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);
}

function colorLabel(c: EventColor) {
  switch (c) {
    case "blue":
      return "Blue";
    case "purple":
      return "Purple";
    case "green":
      return "Green";
    case "amber":
      return "Amber";
    case "red":
      return "Red";
    case "teal":
      return "Teal";
    default:
      return c;
  }
}

function apiColorToUi(c: ApiEvent["color"]): EventColor {
  switch (c) {
    case "BLUE":
      return "blue";
    case "PURPLE":
      return "purple";
    case "GREEN":
      return "green";
    case "AMBER":
      return "amber";
    case "RED":
      return "red";
    case "TEAL":
      return "teal";
    default:
      return "blue";
  }
}

function uiColorToApi(c: EventColor): ApiEvent["color"] {
  switch (c) {
    case "blue":
      return "BLUE";
    case "purple":
      return "PURPLE";
    case "green":
      return "GREEN";
    case "amber":
      return "AMBER";
    case "red":
      return "RED";
    case "teal":
      return "TEAL";
    default:
      return "BLUE";
  }
}

function toYmd(year: number, month0: number, day: number) {
  // month0: 0..11
  return `${year}-${pad2(month0 + 1)}-${pad2(day)}`;
}

function isoToLocalTimeHHmm(iso: string) {
  const d = new Date(iso);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

export default function AdminCalendarClient() {
  // ===== Month state (default April 2025) =====
  const [cursor, setCursor] = useState(() => new Date(2025, 3, 1));
  const year = cursor.getFullYear();
  const month = cursor.getMonth(); // 0..11

  const monthLabel = cursor.toLocaleString("en-US", { month: "long", year: "numeric" });

  const startDow = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // ===== Data state (from API) =====
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loadingMonth, setLoadingMonth] = useState(false);
  const [monthError, setMonthError] = useState<string | null>(null);

  // ===== View =====
  const [activeView, setActiveView] = useState<"Month" | "Week" | "Day">("Month");

  // ===== Popup state =====
  const [popupOpen, setPopupOpen] = useState(false);
  const [popupMode, setPopupMode] = useState<Mode>("create");
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // draft form
  const [draftTitle, setDraftTitle] = useState("");
  const [draftTime, setDraftTime] = useState("09:00");
  const [draftColor, setDraftColor] = useState<EventColor>("blue");
  const [draftDesc, setDraftDesc] = useState("");
  const [draftLocation, setDraftLocation] = useState("");

  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // ===== Fetch month events =====
  useEffect(() => {
    let alive = true;

    async function run() {
      try {
        setLoadingMonth(true);
        setMonthError(null);

        const res = await fetch(`/api/admin/calendar/events?year=${year}&month=${month + 1}`, { cache: "no-store" });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          const msg = data?.error ? String(data.error) : "Failed to load events.";
          throw new Error(msg);
        }

        const apiEvents: ApiEvent[] = Array.isArray(data?.events) ? data.events : [];

        const mapped: EventItem[] = apiEvents.map((e) => {
          const start = new Date(e.startAt);
          const day = start.getDate(); // local day (UI theo local)
          return {
            id: e.id,
            title: e.title,
            day,
            time: e.allDay ? undefined : isoToLocalTimeHHmm(e.startAt),
            color: apiColorToUi(e.color),
            description: e.description ?? undefined,
            location: e.location ?? undefined,
            allDay: e.allDay,
            startAt: e.startAt,
            endAt: e.endAt,
          };
        });

        // sort: day then time
        mapped.sort((a, b) => a.day - b.day || (a.time ?? "").localeCompare(b.time ?? ""));

        if (alive) setEvents(mapped);
      } catch (err: any) {
        if (alive) setMonthError(err?.message ?? "Failed to load.");
      } finally {
        if (alive) setLoadingMonth(false);
      }
    }

    run();
    return () => {
      alive = false;
    };
  }, [year, month]);

  const monthRangeLabel = useMemo(() => {
    const from = `${cursor.toLocaleString("en-US", { month: "short" })} 1, ${year}`;
    const to = `${cursor.toLocaleString("en-US", { month: "short" })} ${daysInMonth}, ${year}`;
    return `${from} - ${to}`;
  }, [cursor, year, daysInMonth]);

  const monthEventsCount = useMemo(() => events.length, [events]);

  const cells = useMemo(() => {
    const used = startDow + daysInMonth;
    const weeks = Math.ceil(used / 7);
    const total = weeks * 7;

    const arr: Array<{ day: number | null; events: EventItem[] }> = [];

    // pre-group for speed
    const byDay = new Map<number, EventItem[]>();
    for (const e of events) {
      const list = byDay.get(e.day) ?? [];
      list.push(e);
      byDay.set(e.day, list);
    }
    for (const [, list] of byDay) {
      list.sort((a, b) => (a.time ?? "").localeCompare(b.time ?? ""));
    }

    for (let i = 0; i < total; i++) {
      const d = i - startDow + 1;
      const day = d >= 1 && d <= daysInMonth ? d : null;
      arr.push({ day, events: day ? byDay.get(day) ?? [] : [] });
    }

    return arr;
  }, [events, startDow, daysInMonth]);

  function closePopup() {
    setPopupOpen(false);
    setFormError(null);
    setEditingId(null);
    setSelectedDay(null);
    setSaving(false);
  }

  function openCreate(day: number) {
    setPopupMode("create");
    setSelectedDay(day);
    setEditingId(null);

    setDraftTitle("");
    setDraftTime("09:00");
    setDraftColor("blue");
    setDraftDesc("");
    setDraftLocation("");
    setFormError(null);

    setPopupOpen(true);
  }

  function openEdit(evt: EventItem) {
    setPopupMode("edit");
    setSelectedDay(evt.day);
    setEditingId(evt.id);

    setDraftTitle(evt.title ?? "");
    setDraftTime(evt.time ?? "09:00");
    setDraftColor(evt.color);
    setDraftDesc(evt.description ?? "");
    setDraftLocation(evt.location ?? "");
    setFormError(null);

    setPopupOpen(true);
  }

  async function handleSave() {
    if (!selectedDay) {
      setFormError("Missing selected day.");
      return;
    }
    if (!draftTitle.trim()) {
      setFormError("Title is required.");
      return;
    }
    if (draftTime && !isValidTime(draftTime)) {
      setFormError("Time must be in HH:mm format.");
      return;
    }

    setFormError(null);
    setSaving(true);

    const payloadBase = {
      title: draftTitle.trim(),
      date: toYmd(year, month, selectedDay),
      time: draftTime.trim(),
      durationMinutes: 60,
      color: uiColorToApi(draftColor),
      description: draftDesc.trim() || undefined,
      location: draftLocation.trim() || undefined,
    };

    try {
      if (popupMode === "create") {
        const res = await fetch("/api/admin/calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payloadBase),
        });
        const data = await res.json().catch(() => ({}));

        if (!res.ok) throw new Error(data?.error ?? "Create failed.");

        const ev: ApiEvent = data?.event;
        if (!ev?.id) throw new Error("Create failed (invalid response).");

        const mapped: EventItem = {
          id: ev.id,
          title: ev.title,
          day: new Date(ev.startAt).getDate(),
          time: ev.allDay ? undefined : isoToLocalTimeHHmm(ev.startAt),
          color: apiColorToUi(ev.color),
          description: ev.description ?? undefined,
          location: ev.location ?? undefined,
          allDay: ev.allDay,
          startAt: ev.startAt,
          endAt: ev.endAt,
        };

        setEvents((prev) => [...prev, mapped].sort((a, b) => a.day - b.day || (a.time ?? "").localeCompare(b.time ?? "")));
        closePopup();
        return;
      }

      // edit
      if (!editingId) {
        setFormError("Missing editing id.");
        setSaving(false);
        return;
      }

      const res = await fetch(`/api/admin/calendar/events/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadBase),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Update failed.");

      const ev: ApiEvent = data?.event;
      if (!ev?.id) throw new Error("Update failed (invalid response).");

      const mapped: EventItem = {
        id: ev.id,
        title: ev.title,
        day: new Date(ev.startAt).getDate(),
        time: ev.allDay ? undefined : isoToLocalTimeHHmm(ev.startAt),
        color: apiColorToUi(ev.color),
        description: ev.description ?? undefined,
        location: ev.location ?? undefined,
        allDay: ev.allDay,
        startAt: ev.startAt,
        endAt: ev.endAt,
      };

      setEvents((prev) => prev.map((x) => (x.id === editingId ? mapped : x)).sort((a, b) => a.day - b.day || (a.time ?? "").localeCompare(b.time ?? "")));

      closePopup();
    } catch (err: any) {
      setFormError(err?.message ?? "Save failed.");
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!editingId) return;
    setSaving(true);
    setFormError(null);

    try {
      const res = await fetch(`/api/admin/calendar/events/${editingId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error ?? "Delete failed.");

      setEvents((prev) => prev.filter((e) => e.id !== editingId));
      closePopup();
    } catch (err: any) {
      setFormError(err?.message ?? "Delete failed.");
      setSaving(false);
    }
  }

  function prevMonth() {
    setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  const popupTitle = popupMode === "create" ? `Create event — ${monthLabel} ${selectedDay ?? ""}` : `Edit event — ${monthLabel} ${selectedDay ?? ""}`;

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <div className={styles.top}>
        <div className={styles.topLeft}>
          <div className={styles.monthPill}>
            <span className={styles.monthTag}>{cursor.toLocaleString("en-US", { month: "short" }).toUpperCase()}</span>
            <span className={styles.monthDay}>15</span>
          </div>

          <div className={styles.monthBlock}>
            <div className={styles.monthTitle}>
              {monthLabel} <span className={styles.monthCount}>{monthEventsCount} events</span>
              {loadingMonth ? (
                <span className={styles.monthCount} style={{ marginLeft: 10 }}>
                  Loading…
                </span>
              ) : null}
            </div>
            <div className={styles.monthRange}>{monthRangeLabel}</div>
            {monthError ? (
              <div className={styles.formError} style={{ marginTop: 10 }}>
                {monthError}
              </div>
            ) : null}
          </div>
        </div>

        <div className={styles.topRight}>
          {/* Month nav */}
          <button className={styles.iconBtn} type="button" title="Previous month" onClick={prevMonth} disabled={loadingMonth}>
            <i className="bi bi-chevron-left" />
          </button>
          <button className={styles.iconBtn} type="button" title="Next month" onClick={nextMonth} disabled={loadingMonth}>
            <i className="bi bi-chevron-right" />
          </button>

          <button className={styles.iconBtn} type="button" title="Filter">
            <i className="bi bi-funnel" />
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
          {cells.map((c, idx) => {
            const isEmpty = !c.day;
            const day = c.day;

            return (
              <div key={idx} className={styles.cell}>
                <div className={styles.cellTop}>
                  {day ? (
                    <button type="button" className={styles.dayNum} title={`Create event on ${monthLabel} ${day}`} onClick={() => openCreate(day)} disabled={loadingMonth}>
                      {day}
                    </button>
                  ) : (
                    <span className={styles.dayBlank} />
                  )}
                </div>

                <div className={styles.events}>
                  {!isEmpty &&
                    c.events.slice(0, 3).map((e) => (
                      <button key={e.id} type="button" className={`${styles.event} ${styles[`c_${e.color}`]}`} title="Edit event" onClick={() => openEdit(e)} disabled={loadingMonth}>
                        <span className={styles.eventTitle}>{e.title}</span>
                        {e.time && <span className={styles.eventTime}>{e.time}</span>}
                      </button>
                    ))}

                  {!isEmpty && c.events.length > 3 && (
                    <button type="button" className={styles.more} onClick={() => openCreate(day!)} title="Create another event" disabled={loadingMonth}>
                      +{c.events.length - 3} more
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Popup (Create / Edit) */}
      {popupOpen && (
        <div
          className={styles.popupOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={popupTitle}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closePopup();
          }}>
          <div className={styles.popupCard}>
            <div className={styles.popupHeader}>
              <div className={styles.popupTitle}>{popupTitle}</div>
              <button type="button" className={styles.popupClose} aria-label="Close" onClick={closePopup} disabled={saving}>
                <i className="bi bi-x-lg" />
              </button>
            </div>

            <div className={styles.popupBody}>
              {/* Day selector */}
              <div className={styles.formRow}>
                <label className={styles.label}>Day</label>
                <select className={styles.select} value={selectedDay ?? 1} onChange={(e) => setSelectedDay(Number(e.target.value))} disabled={saving}>
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = i + 1;
                    return (
                      <option key={d} value={d}>
                        {monthLabel} {d}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Title</label>
                <input className={styles.input} value={draftTitle} onChange={(e) => setDraftTitle(e.target.value)} placeholder="e.g. Team sync" autoFocus disabled={saving} />
              </div>

              <div className={styles.formRowTwo}>
                <div className={styles.formRow}>
                  <label className={styles.label}>Time</label>
                  <input className={styles.input} value={draftTime} onChange={(e) => setDraftTime(e.target.value)} placeholder="HH:mm" disabled={saving} />
                </div>

                <div className={styles.formRow}>
                  <label className={styles.label}>Color</label>
                  <select className={styles.select} value={draftColor} onChange={(e) => setDraftColor(e.target.value as EventColor)} disabled={saving}>
                    {(["blue", "purple", "green", "amber", "red", "teal"] as EventColor[]).map((c) => (
                      <option key={c} value={c}>
                        {colorLabel(c)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Location</label>
                <input className={styles.input} value={draftLocation} onChange={(e) => setDraftLocation(e.target.value)} placeholder="Optional" disabled={saving} />
              </div>

              <div className={styles.formRow}>
                <label className={styles.label}>Description</label>
                <textarea className={styles.textarea} rows={4} value={draftDesc} onChange={(e) => setDraftDesc(e.target.value)} placeholder="Optional notes…" disabled={saving} />
              </div>

              {formError && <div className={styles.formError}>{formError}</div>}
            </div>

            <div className={styles.popupFooter}>
              {popupMode === "edit" ? (
                <>
                  <button type="button" className={styles.dangerBtn} onClick={handleDelete} disabled={saving}>
                    <i className="bi bi-trash" />
                    <span>{saving ? "Working…" : "Delete"}</span>
                  </button>

                  <div className={styles.footerRight}>
                    <button type="button" className={styles.ghostBtn} onClick={closePopup} disabled={saving}>
                      Cancel
                    </button>
                    <button type="button" className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <button type="button" className={styles.ghostBtn} onClick={closePopup} disabled={saving}>
                    Cancel
                  </button>
                  <button type="button" className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
                    {saving ? "Creating…" : "Create event"}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
