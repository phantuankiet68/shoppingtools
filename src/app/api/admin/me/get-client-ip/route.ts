import { NextResponse } from "next/server";

function getClientIp(req: Request) {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim(); // IP đầu tiên là client (thường vậy)
  const xri = req.headers.get("x-real-ip");
  if (xri) return xri.trim();
  return null;
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  return NextResponse.json({ ip });
}
