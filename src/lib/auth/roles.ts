export const SYSTEM_ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ADMIN: "ADMIN",
  CUSTOMER: "CUSTOMER",
} as const;

export type SystemRole = (typeof SYSTEM_ROLES)[keyof typeof SYSTEM_ROLES];

const ROLE_LEVEL: Record<SystemRole, number> = {
  CUSTOMER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

export function isSuperAdmin(role?: SystemRole | null): boolean {
  return role === SYSTEM_ROLES.SUPER_ADMIN;
}

export function isAdmin(role?: SystemRole | null): boolean {
  return hasRole(role, SYSTEM_ROLES.ADMIN);
}

export function hasRole(role: SystemRole | null | undefined, requiredRole: SystemRole): boolean {
  if (!role) return false;
  return ROLE_LEVEL[role] >= ROLE_LEVEL[requiredRole];
}

export function requireSuperAdmin(role?: SystemRole | null): void {
  if (!isSuperAdmin(role)) {
    throw new Error("FORBIDDEN");
  }
}

export function requireAdmin(role?: SystemRole | null): void {
  if (!isAdmin(role)) {
    throw new Error("FORBIDDEN");
  }
}
