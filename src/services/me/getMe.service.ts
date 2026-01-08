import { API_ENDPOINTS } from "@/constants/api";

export async function getClientIP() {
  const res = await fetch(API_ENDPOINTS.ADMIN.GET_CLIENT_IP, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Cannot get client IP");
  }

  return res.json();
}
