export function getRequestMeta(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");

  const ipAddress = forwardedFor?.split(",")[0]?.trim() || realIp || null;

  const userAgent = req.headers.get("user-agent");

  return {
    ipAddress,
    userAgent,
  };
}
