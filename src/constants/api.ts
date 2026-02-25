export const API_ENDPOINTS = {
  ADMIN_USER: {
    CHANGE_PASSWORD: "/api/admin/user/change-password",
  },
  ADMIN: {
    PROFILE: "/api/admin/profile",
    GET_CLIENT_IP: "/api/admin/me/get-client-ip",
  },
} as const;

export const API_ROUTES = {
  ADMIN_LOGIN: "/api/admin/login",
  ADMIN_ME: "/api/admin/me",
  ADMIN_LOGOUT: "/api/admin/logout",
} as const;
