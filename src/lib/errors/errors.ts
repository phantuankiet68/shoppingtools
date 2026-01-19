// lib/errors.ts
export function isUnauthorized(e: any) {
  return e?.message === "UNAUTHORIZED";
}
