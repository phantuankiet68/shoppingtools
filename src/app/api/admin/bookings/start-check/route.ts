import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const now = new Date();

    const bookings = await prisma.booking.findMany({
      where: {
        start: {
          lte: now,
        },

        notifiedAt: null,

        status: {
          notIn: ["completed", "cancelled"],
        },
      },
    });

    for (const booking of bookings) {
      await prisma.notification.create({
        data: {
          title: "Booking Started",

          message: `${booking.customerName} booking is starting now`,

          type: "BOOKING_STARTED",

          entityId: booking.id,

          link: `/admin/calendar?id=${booking.id}`,

          metadata: {
            bookingId: booking.id,
            customerName: booking.customerName,
            serviceName: booking.serviceName,
          },
        },
      });

      await prisma.booking.update({
        where: {
          id: booking.id,
        },

        data: {
          notifiedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    );
  }
}
