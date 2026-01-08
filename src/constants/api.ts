export const API_ENDPOINTS = {
  ADMIN_USER: {
    CHANGE_PASSWORD: "/api/admin/user/change-password",
  },
  ADMIN: {
    PROFILE: "/api/admin/profile",
    GET_CLIENT_IP: "/api/admin/me/get-client-ip",
  },
} as const;
