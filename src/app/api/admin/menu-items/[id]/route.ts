// app/api/menu-items/[id]/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

async function resolveParams(ctx: { params?: any }) {
  const p = ctx?.params;
  if (!p) return { id: undefined as unknown as string };
  return typeof p.then === "function" ? await p : p;
}

function normStr(input: unknown, { allowNull = true } = {}) {
  if (input === undefined) return undefined;
  if (input === null) return allowNull ? null : undefined;
  return String(input).trim();
}

type Ctx = { params?: any };

export async function GET(_req: Request, ctx: Ctx) {
  try {
    const { id } = await resolveParams(ctx);
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const item = await prisma.menuItem.findUnique({ where: { id } });
    if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json(item);
  } catch (e) {
    console.error("GET /api/menu-items/[id] error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, ctx: Ctx) {
  try {
    const { id } = await resolveParams(ctx);
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const data: any = {};
    const title = normStr(body.title, { allowNull: false });
    if (title !== undefined) data.title = title;

    const icon = normStr(body.icon);
    if (icon !== undefined) data.icon = icon; // string|null

    const path = normStr(body.path);
    if (path !== undefined) data.path = path; // string|null

    if (body.sortOrder !== undefined) data.sortOrder = Number(body.sortOrder) || 0;
    if (body.visible !== undefined) data.visible = Boolean(body.visible);
    if (body.locale !== undefined && ["en"].includes(String(body.locale))) data.locale = body.locale;
    if (body.parentId !== undefined) data.parentId = body.parentId as string | null;

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const updated = await prisma.menuItem.update({
      where: { id },
      data,
    });

    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("PATCH /api/menu-items/[id] error:", e);
    if (e?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: Ctx) {
  try {
    const { id } = await resolveParams(ctx);
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    await prisma.menuItem.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/menu-items/[id] error:", e);
    if (e?.code === "P2025") return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
