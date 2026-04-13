import { NextRequest, NextResponse } from 'next/server';
import { BookingSource, BookingStatus, Prisma } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

function isValidDate(value: unknown) {
  if (typeof value !== 'string') return false;
  const time = Date.parse(value);
  return !Number.isNaN(time);
}

function containsMode(): Prisma.QueryMode | undefined {
  return 'insensitive';
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get('q')?.trim() || '';
    const siteId = searchParams.get('siteId')?.trim() || '';
    const status = searchParams.get('status')?.trim() || '';
    const date = searchParams.get('date')?.trim() || '';

    if (!siteId) {
      return NextResponse.json(
        { success: false, message: 'siteId is required' },
        { status: 400 }
      );
    }

    const where: Prisma.BookingWhereInput = {
      siteId,
      ...(status ? { status: status as BookingStatus } : {}),
    };

    if (date) {
      const startOfDay = new Date(`${date}T00:00:00.000`);
      const endOfDay = new Date(`${date}T23:59:59.999`);

      where.start = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    if (q) {
      where.OR = [
        {
          customerName: {
            contains: q,
            mode: containsMode(),
          },
        },
        {
          customerPhone: {
            contains: q,
            mode: containsMode(),
          },
        },
        {
          serviceName: {
            contains: q,
            mode: containsMode(),
          },
        },
        {
          note: {
            contains: q,
            mode: containsMode(),
          },
        },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      orderBy: {
        start: 'asc',
      },
    });

    return NextResponse.json({
      success: true,
      data: bookings,
      total: bookings.length,
    });
  } catch (error) {
    console.error('GET /api/admin/bookings error:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const customerName = String(body.customerName ?? '').trim();
    const customerPhone = String(body.customerPhone ?? '').trim();
    const serviceName = String(body.serviceName ?? '').trim();
    const siteId = String(body.siteId ?? '').trim();
    const start = body.start;
    const end = body.end;
    const source = String(body.source ?? '').trim();
    const status = String(body.status ?? 'pending').trim();
    const note =
      body.note === undefined || body.note === null
        ? null
        : String(body.note).trim();

    if (!customerName) {
      return NextResponse.json(
        { success: false, message: 'customerName is required' },
        { status: 400 }
      );
    }

    if (!customerPhone) {
      return NextResponse.json(
        { success: false, message: 'customerPhone is required' },
        { status: 400 }
      );
    }

    if (!serviceName) {
      return NextResponse.json(
        { success: false, message: 'serviceName is required' },
        { status: 400 }
      );
    }

    if (!siteId) {
      return NextResponse.json(
        { success: false, message: 'siteId is required' },
        { status: 400 }
      );
    }

    if (!isValidDate(start) || !isValidDate(end)) {
      return NextResponse.json(
        { success: false, message: 'start and end must be valid date strings' },
        { status: 400 }
      );
    }

    if (new Date(start).getTime() >= new Date(end).getTime()) {
      return NextResponse.json(
        { success: false, message: 'end must be greater than start' },
        { status: 400 }
      );
    }

    if (!Object.values(BookingSource).includes(source as BookingSource)) {
      return NextResponse.json(
        { success: false, message: 'Invalid booking source' },
        { status: 400 }
      );
    }

    if (!Object.values(BookingStatus).includes(status as BookingStatus)) {
      return NextResponse.json(
        { success: false, message: 'Invalid booking status' },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        customerName,
        customerPhone,
        serviceName,
        start: new Date(start),
        end: new Date(end),
        status: status as BookingStatus,
        source: source as BookingSource,
        note,
        siteId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: booking,
        message: 'Booking created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('POST /api/admin/bookings error:', error);

    return NextResponse.json(
      { success: false, message: 'Failed to create booking' },
      { status: 500 }
    );
  }
}