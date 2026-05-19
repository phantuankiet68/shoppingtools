import { prisma } from "@/lib/prisma";
import { pusherServer } from "@/lib/pusher/pusher";

export async function GET() {
  try {
    const now = new Date(
      new Date().toLocaleString("en-US", {
        timeZone: "Asia/Ho_Chi_Minh",
      }),
    );

    console.log("NOW:", now);

    const bookings = await prisma.booking.findMany({
      where: {
        start: {
          lte: now,
        },

        end: {
          gte: now,
        },

        notifiedAt: null,
      },
    });

    const allBookings = await prisma.booking.findMany();

    for (const booking of bookings) {
      await pusherServer.trigger("bookings", "booking-started", {
        title: "Booking Started",
        message: `${booking.customerName} đã tới lịch hẹn`,
        bookingId: booking.id,
      });

      await prisma.booking.update({
        where: {
          id: booking.id,
        },
        data: {
          notifiedAt: now,
        },
      });

      console.log("NOTIFIED:", booking.customerName);
    }

    return Response.json({
      success: true,
      total: bookings.length,
    });
  } catch (error) {
    console.error(error);

    return Response.json(
      {
        success: false,
      },
      {
        status: 500,
      },
    );
  }
}
