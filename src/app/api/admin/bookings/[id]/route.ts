import { NextRequest, NextResponse } from 'next/server';
import { BookingSource, BookingStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

type Context = {
  params: Promise<{
    id: string;
  }>;
};

function isValidDate(value: unknown) {
  if (typeof value !== 'string') return false;
  const time = Date.parse(value);
  return !Number.isNaN(time);
}

export async function GET(_: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: booking,
    });
  } catch (error) {
    console.error('GET /api/admin/bookings/[id] error:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to fetch booking' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const existing = await prisma.booking.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    const nextStart =
      body.start !== undefined ? body.start : existing.start.toISOString();
    const nextEnd =
      body.end !== undefined ? body.end : existing.end.toISOString();

    if (!isValidDate(nextStart) || !isValidDate(nextEnd)) {
      return NextResponse.json(
        { success: false, message: 'start and end must be valid date strings' },
        { status: 400 }
      );
    }

    if (new Date(nextStart).getTime() >= new Date(nextEnd).getTime()) {
      return NextResponse.json(
        { success: false, message: 'end must be greater than start' },
        { status: 400 }
      );
    }

    if (
      body.status !== undefined &&
      !Object.values(BookingStatus).includes(body.status as BookingStatus)
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid booking status' },
        { status: 400 }
      );
    }

    if (
      body.source !== undefined &&
      !Object.values(BookingSource).includes(body.source as BookingSource)
    ) {
      return NextResponse.json(
        { success: false, message: 'Invalid booking source' },
        { status: 400 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(body.customerName !== undefined
          ? { customerName: String(body.customerName).trim() }
          : {}),
        ...(body.customerPhone !== undefined
          ? { customerPhone: String(body.customerPhone).trim() }
          : {}),
        ...(body.serviceName !== undefined
          ? { serviceName: String(body.serviceName).trim() }
          : {}),
        ...(body.start !== undefined ? { start: new Date(body.start) } : {}),
        ...(body.end !== undefined ? { end: new Date(body.end) } : {}),
        ...(body.status !== undefined
          ? { status: body.status as BookingStatus }
          : {}),
        ...(body.source !== undefined
          ? { source: body.source as BookingSource }
          : {}),
        ...(body.note !== undefined
          ? {
              note:
                body.note === null || String(body.note).trim() === ''
                  ? null
                  : String(body.note).trim(),
            }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      data: updated,
      message: 'Booking updated successfully',
    });
  } catch (error) {
    console.error('PATCH /api/admin/bookings/[id] error:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to update booking' },
      { status: 500 }
    );
  }
}

export async function DELETE(_: NextRequest, context: Context) {
  try {
    const { id } = await context.params;

    const existing = await prisma.booking.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!existing) {
      return NextResponse.json(
        { success: false, message: 'Booking not found' },
        { status: 404 }
      );
    }

    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('DELETE /api/admin/bookings/[id] error:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to delete booking' },
      { status: 500 }
    );
  }
}