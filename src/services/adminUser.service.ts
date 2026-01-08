import { API_ENDPOINTS } from "@/constants/api";

interface ChangePasswordPayload {
  confirmEmail: string;
  currentPassword: string;
  newPassword: string;
  signOutAll: boolean;
}

export async function changePassword(payload: ChangePasswordPayload) {
  const res = await fetch(API_ENDPOINTS.ADMIN_USER.CHANGE_PASSWORD, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => null);
    throw new Error(error?.message || "Change password failed");
  }

  return res.json();
}
