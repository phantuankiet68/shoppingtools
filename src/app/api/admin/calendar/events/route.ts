import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

type EventColor = "BLUE" | "PURPLE" | "GREEN" | "AMBER" | "RED" | "TEAL";

function toInt(v: string | null) {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function isValidColor(c: any): c is EventColor {
  return ["BLUE", "PURPLE", "GREEN", "AMBER", "RED", "TEAL"].includes(String(c));
}

function parseTimeToMinutes(hhmm?: string | null) {
  if (!hhmm) return null;
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/**
 * Nếu bạn có model Calendar (recommended)
 */
async function getOrCreateDefaultCalendar(ownerId: string) {
  const existing = await prisma.calendar.findFirst({
    where: { ownerId, isDefault: true },
    select: { id: true, name: true, isDefault: true },
  });
  if (existing) return existing;

  return prisma.calendar.create({
    data: { ownerId, name: "Default", isDefault: true },
    select: { id: true, name: true, isDefault: true },
  });
}

/**
 * GET /api/admin/calendar/events?year=YYYY&month=1..12
 */
export async function GET(req: Request) {
  try {
    const user = await requireAdminAuthUser();

    const url = new URL(req.url);
    const year = toInt(url.searchParams.get("year"));
    const month = toInt(url.searchParams.get("month"));

    if (!year || !month || month < 1 || month > 12) {
      return NextResponse.json({ error: "Invalid query. Use ?year=YYYY&month=1..12" }, { status: 400 });
    }

    const cal = await getOrCreateDefaultCalendar(user.id);

    // khoảng tháng theo UTC để query ổn định
    const from = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0));
    const to = new Date(Date.UTC(year, month, 1, 0, 0, 0));

    // ✅ bỏ deletedAt
    // ✅ select chỉ các field chắc chắn có trong schema của bạn
    const events = await prisma.calendarEvent.findMany({
      where: {
        calendarId: cal.id,
        // lấy event giao với tháng: start < to AND end > from
        startAt: { lt: to },
        endAt: { gt: from },
      },
      orderBy: [{ startAt: "asc" }, { endAt: "asc" }],
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        color: true,
        allDay: true,
        startAt: true,
        endAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ calendar: cal, range: { from, to }, events });
  } catch (err: any) {
    // ✅ phân biệt 401 (auth) và 500
    const msg = String(err?.message ?? "");
    if (msg.toLowerCase().includes("unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error", detail: msg }, { status: 500 });
  }
}

/**
 * POST /api/admin/calendar/events
 * body: { title, date:"YYYY-MM-DD", time?:"HH:mm", durationMinutes?, color?, description?, location?, allDay? }
 */
export async function POST(req: Request) {
  try {
    const user = await requireAdminAuthUser();
    const body = await req.json().catch(() => ({}));

    const title = String(body.title ?? "").trim();
    const dateStr = String(body.date ?? "").trim();
    const timeStr = body.time == null ? "09:00" : String(body.time).trim();
    const durationMinutes = body.durationMinutes == null ? 60 : Number(body.durationMinutes);

    const allDay = Boolean(body.allDay ?? false);
    const color: EventColor = isValidColor(body.color) ? body.color : "BLUE";

    if (!title) return NextResponse.json({ error: "Title is required." }, { status: 400 });

    const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
    if (!dm) return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });

    const y = Number(dm[1]);
    const m = Number(dm[2]);
    const d = Number(dm[3]);

    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      return NextResponse.json({ error: "durationMinutes must be positive." }, { status: 400 });
    }

    const minutes = allDay ? 0 : parseTimeToMinutes(timeStr);
    if (!allDay && minutes == null) {
      return NextResponse.json({ error: "time must be HH:mm" }, { status: 400 });
    }

    const cal = await getOrCreateDefaultCalendar(user.id);

    const startAt = allDay ? new Date(Date.UTC(y, m - 1, d, 0, 0, 0)) : new Date(Date.UTC(y, m - 1, d, Math.floor(minutes! / 60), minutes! % 60, 0));

    const endAt = allDay ? new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0)) : new Date(startAt.getTime() + durationMinutes * 60 * 1000);

    const created = await prisma.calendarEvent.create({
      data: {
        calendarId: cal.id,
        creatorId: user.id,
        title,
        description: body.description ? String(body.description) : null,
        location: body.location ? String(body.location) : null,
        color,
        allDay,
        startAt,
        endAt,
      },
      select: {
        id: true,
        title: true,
        description: true,
        location: true,
        color: true,
        allDay: true,
        startAt: true,
        endAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ event: created }, { status: 201 });
  } catch (err: any) {
    const msg = String(err?.message ?? "");
    if (msg.toLowerCase().includes("unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error", detail: msg }, { status: 500 });
  }
}
