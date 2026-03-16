import { NextResponse } from "next/server";
import { getCurrentSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getCurrentSession();

    if (!session) {
      return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
        status: session.user.status,
        image: session.user.image,
        name: null, // hiện tại model User chưa có name
      },
    });
  } catch (error) {
    console.error("ME_ERROR", error);
    return NextResponse.json({ authenticated: false, user: null }, { status: 401 });
  }
}
