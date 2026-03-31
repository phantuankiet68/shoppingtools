import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export type SystemRole = "SUPER_ADMIN" | "ADMIN" | "CUSTOMER";
export type UserStatus = "ACTIVE" | "SUSPENDED";

export type AdminJwtPayload = JWTPayload & {
  sub: string;
  email: string;
  systemRole: SystemRole;
  status: UserStatus;
};

function getAccessSecret(): Uint8Array {
  const secret = process.env.JWT_ACCESS_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_ACCESS_SECRET");
  }
  return new TextEncoder().encode(secret);
}

function getRefreshSecret(): Uint8Array {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    throw new Error("Missing JWT_REFRESH_SECRET");
  }
  return new TextEncoder().encode(secret);
}

function isValidRole(role: unknown): role is SystemRole {
  return role === "SUPER_ADMIN" || role === "ADMIN" || role === "CUSTOMER";
}

function isValidStatus(status: unknown): status is UserStatus {
  return status === "ACTIVE" || status === "SUSPENDED";
}

function isValidPayload(payload: JWTPayload): payload is AdminJwtPayload {
  return (
    typeof payload.sub === "string" &&
    typeof payload.email === "string" &&
    isValidRole(payload.systemRole) &&
    isValidStatus(payload.status)
  );
}

export async function signAdminAccessToken(payload: {
  userId: string;
  email: string;
  systemRole: SystemRole;
  status: UserStatus;
}) {
  return new SignJWT({
    email: payload.email,
    systemRole: payload.systemRole,
    status: payload.status,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(getAccessSecret());
}

export async function signAdminRefreshToken(payload: {
  userId: string;
  email: string;
  systemRole: SystemRole;
  status: UserStatus;
}) {
  return new SignJWT({
    email: payload.email,
    systemRole: payload.systemRole,
    status: payload.status,
  })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getRefreshSecret());
}

export async function verifyAdminAccessToken(token: string): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getAccessSecret(), {
      algorithms: ["HS256"],
    });

    if (!isValidPayload(payload)) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function verifyAdminRefreshToken(token: string): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getRefreshSecret(), {
      algorithms: ["HS256"],
    });

    if (!isValidPayload(payload)) return null;
    return payload;
  } catch {
    return null;
  }
}
