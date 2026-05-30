import crypto from "crypto";

const SECRET = process.env.OAUTH_STATE_SECRET!;

export type OAuthStatePayload = {
  siteId: string;
  userId: string;
  timestamp: number;
};

export function createOAuthState(payload: OAuthStatePayload) {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");

  const signature = crypto.createHmac("sha256", SECRET).update(encoded).digest("hex");

  return `${encoded}.${signature}`;
}

export function verifyOAuthState(state: string): OAuthStatePayload {
  const [encoded, signature] = state.split(".");

  if (!encoded || !signature) {
    throw new Error("INVALID_STATE");
  }

  const expected = crypto.createHmac("sha256", SECRET).update(encoded).digest("hex");

  if (expected !== signature) {
    throw new Error("INVALID_STATE");
  }

  return JSON.parse(Buffer.from(encoded, "base64url").toString());
}
