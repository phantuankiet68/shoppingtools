import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminAuthUser } from "@/lib/auth/auth";

type EventColor = "BLUE" | "PURPLE" | "GREEN" | "AMBER" | "RED" | "TEAL";

function isValidColor(c: any): c is EventColor {
  return ["BLUE", "PURPLE", "GREEN", "AMBER", "RED", "TEAL"].includes(String(c));
}

function parseTimeToMinutes(hhmm?: string | null) {
  if (!hhmm) return null;
  const m = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(hhmm);
  if (!m) return null;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** ✅ Next mới: params có thể là Promise -> luôn await */
async function getIdFromCtx(ctx: any): Promise<string> {
  const p = await ctx?.params; // works for both Promise and plain object
  const id = p?.id;
  if (!id || typeof id !== "string") throw new Error("Missing route param: id");
  return id;
}

/** Ensure event thuộc calendar của user (owner) */
async function findOwnedEvent(userId: string, eventId: string) {
  return prisma.calendarEvent.findFirst({
    where: {
      id: eventId,
      calendar: { ownerId: userId },
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
      calendarId: true,
      creatorId: true,
    },
  });
}

export async function GET(req: Request, ctx: any) {
  try {
    const user = await requireAdminAuthUser();
    const id = await getIdFromCtx(ctx);

    const ev = await findOwnedEvent(user.id, id);
    if (!ev) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ event: ev });
  } catch (err: any) {
    const msg = String(err?.message ?? "");
    if (msg.toLowerCase().includes("unauthorized")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Server error", detail: msg }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: any) {
  try {
    const user = await requireAdminAuthUser();
    const id = await getIdFromCtx(ctx);
    const body = await req.json().catch(() => ({}));

    const current = await findOwnedEvent(user.id, id);
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const patch: any = {};

    if (body.title != null) {
      const t = String(body.title).trim();
      if (!t) return NextResponse.json({ error: "Title cannot be empty." }, { status: 400 });
      patch.title = t;
    }

    if (body.description !== undefined) patch.description = body.description ? String(body.description) : null;
    if (body.location !== undefined) patch.location = body.location ? String(body.location) : null;

    if (body.color != null) {
      if (!isValidColor(body.color)) return NextResponse.json({ error: "Invalid color." }, { status: 400 });
      patch.color = body.color;
    }

    if (body.allDay != null) patch.allDay = Boolean(body.allDay);

    // Recalc time range nếu có date/time/duration/allDay
    const dateStr = body.date != null ? String(body.date).trim() : null; // YYYY-MM-DD
    const timeStr = body.time != null ? String(body.time).trim() : null; // HH:mm
    const durationMinutes = body.durationMinutes == null ? null : Number(body.durationMinutes);

    const wantRecalc = dateStr != null || timeStr != null || durationMinutes != null || body.allDay != null;

    if (wantRecalc) {
      const allDay = body.allDay != null ? Boolean(body.allDay) : current.allDay;

      let y = current.startAt.getUTCFullYear();
      let m = current.startAt.getUTCMonth() + 1;
      let d = current.startAt.getUTCDate();

      if (dateStr) {
        const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
        if (!dm) return NextResponse.json({ error: "date must be YYYY-MM-DD" }, { status: 400 });
        y = Number(dm[1]);
        m = Number(dm[2]);
        d = Number(dm[3]);
      }

      let minutes = current.startAt.getUTCHours() * 60 + current.startAt.getUTCMinutes();
      if (timeStr != null) {
        const mm = allDay ? 0 : parseTimeToMinutes(timeStr);
        if (!allDay && mm == null) return NextResponse.json({ error: "time must be HH:mm" }, { status: 400 });
        minutes = allDay ? 0 : mm!;
      }

      let dur = Math.max(1, Math.round((current.endAt.getTime() - current.startAt.getTime()) / 60000));
      if (durationMinutes != null) {
        if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
          return NextResponse.json({ error: "durationMinutes must be positive." }, { status: 400 });
        }
        dur = durationMinutes;
      }

      const startAt = allDay ? new Date(Date.UTC(y, m - 1, d, 0, 0, 0)) : new Date(Date.UTC(y, m - 1, d, Math.floor(minutes / 60), minutes % 60, 0));

      const endAt = allDay ? new Date(Date.UTC(y, m - 1, d + 1, 0, 0, 0)) : new Date(startAt.getTime() + dur * 60 * 1000);

      patch.startAt = startAt;
      patch.endAt = endAt;
      patch.allDay = allDay;
    }

    const updated = await prisma.calendarEvent.update({
      where: { id },
      data: patch,
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

    return NextResponse.json({ event: updated });
  } catch (err: any) {
    const msg = String(err?.message ?? "");
    if (msg.toLowerCase().includes("unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error", detail: msg }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: any) {
  try {
    const user = await requireAdminAuthUser();
    const id = await getIdFromCtx(ctx);

    const current = await findOwnedEvent(user.id, id);
    if (!current) return NextResponse.json({ error: "Not found" }, { status: 404 });

    await prisma.calendarEvent.delete({ where: { id } });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    const msg = String(err?.message ?? "");
    if (msg.toLowerCase().includes("unauthorized")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "Server error", detail: msg }, { status: 500 });
  }
}
