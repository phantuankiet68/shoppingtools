import { http } from "@/services/http";
import { API_ROUTES } from "@/constants/api";

export type AdminLoginPayload = { email: string; password: string };
export type AdminLoginResponse = { ok: true };

export const adminAuthService = {
  login(payload: AdminLoginPayload) {
    return http<AdminLoginResponse>(API_ROUTES.ADMIN_LOGIN, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
};
