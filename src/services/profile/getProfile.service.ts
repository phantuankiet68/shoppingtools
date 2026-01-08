import { API_ENDPOINTS } from "@/constants/api";
import { safeJson } from "@/utils/safeJson";
export async function getAdminProfile() {
  const res = await fetch(API_ENDPOINTS.ADMIN.PROFILE, {
    credentials: "include",
    cache: "no-store",
  });

  return res;
}

export async function patchAdminProfile(payload: unknown) {
  const res = await fetch(API_ENDPOINTS.ADMIN.PROFILE, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  const data = await safeJson(res);
  return { res, data };
}
