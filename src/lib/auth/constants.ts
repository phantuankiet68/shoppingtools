export const AUTH_COOKIE_NAME = "user_session";

export const SESSION_EXPIRES_IN_MS = 1000 * 60 * 60 * 24 * 30; // 30 ngày
export const SESSION_EXPIRES_IN_SECONDS = Math.floor(SESSION_EXPIRES_IN_MS / 1000);

export const BCRYPT_ROUNDS = 12;
