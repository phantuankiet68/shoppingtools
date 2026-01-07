import { NextResponse } from "next/server";
import { authenticator } from "otplib";
import QRCode from "qrcode";

type Store = {
  enabled: boolean;
  secret?: string; // store encrypted in real DB
  updatedAt?: string;

  failedCount: number;
  lockedUntil?: number | null; // epoch ms
};

const ISSUER = "YourAdmin";
const LABEL = "admin@example.com";

/** In-memory store (DEMO). Replace with DB per-user. */
const store: Store = {
  enabled: false,
  secret: undefined,
  updatedAt: undefined,
  failedCount: 0,
  lockedUntil: null,
};

function isLocked() {
  if (!store.lockedUntil) return false;
  return Date.now() < store.lockedUntil;
}

function lockInfo() {
  return {
    failedCount: store.failedCount,
    lockedUntil: store.lockedUntil ? new Date(store.lockedUntil).toLocaleString() : null,
  };
}

async function buildState(extra?: Partial<any>) {
  return {
    enabled: store.enabled,
    hasSecret: !!store.secret,
    issuer: ISSUER,
    label: LABEL,
    updatedAt: store.updatedAt ?? "—",
    lockInfo: lockInfo(),
    ...extra,
  };
}

export async function GET() {
  return NextResponse.json(await buildState());
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const action = body?.action as string | undefined;
  const otp = (body?.otp as string | undefined)?.trim();

  if (!action) return NextResponse.json({ error: "Missing action" }, { status: 400 });

  // If locked, block verify/enable/rotate (you can decide policy)
  if (isLocked() && ["verify", "enable", "rotate", "delete", "disable"].includes(action)) {
    return NextResponse.json({ error: "Account is locked due to failed attempts. Try later.", state: await buildState() }, { status: 423 });
  }

  // CREATE secret (generate)
  if (action === "generate") {
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(LABEL, ISSUER, secret);
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

    store.secret = secret;
    store.updatedAt = new Date().toLocaleString();
    store.failedCount = 0;
    store.lockedUntil = null;

    return NextResponse.json({
      message: "2FA key created. Scan QR then verify.",
      state: await buildState({ otpauthUrl, qrDataUrl }),
    });
  }

  // ROTATE secret
  if (action === "rotate") {
    if (!store.secret) return NextResponse.json({ error: "No 2FA key to rotate.", state: await buildState() }, { status: 400 });

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(LABEL, ISSUER, secret);
    const qrDataUrl = await QRCode.toDataURL(otpauthUrl);

    store.secret = secret;
    store.updatedAt = new Date().toLocaleString();
    store.failedCount = 0;
    store.lockedUntil = null;
    store.enabled = false; // require enable after verify, optional

    return NextResponse.json({
      message: "Key rotated. Scan new QR and verify.",
      state: await buildState({ otpauthUrl, qrDataUrl }),
    });
  }

  // DELETE secret
  if (action === "delete") {
    store.secret = undefined;
    store.enabled = false;
    store.updatedAt = new Date().toLocaleString();
    store.failedCount = 0;
    store.lockedUntil = null;
    return NextResponse.json({ message: "2FA key deleted.", state: await buildState() });
  }

  // ENABLE / DISABLE
  if (action === "enable") {
    if (!store.secret) return NextResponse.json({ error: "Create 2FA key first.", state: await buildState() }, { status: 400 });
    store.enabled = true;
    store.updatedAt = new Date().toLocaleString();
    return NextResponse.json({ message: "2FA enabled.", state: await buildState() });
  }

  if (action === "disable") {
    store.enabled = false;
    store.updatedAt = new Date().toLocaleString();
    return NextResponse.json({ message: "2FA disabled.", state: await buildState() });
  }

  // VERIFY OTP
  if (action === "verify") {
    if (!store.secret) return NextResponse.json({ error: "Create 2FA key first.", state: await buildState() }, { status: 400 });
    if (!otp || otp.length < 6) return NextResponse.json({ error: "OTP is required.", state: await buildState() }, { status: 400 });

    const ok = authenticator.check(otp, store.secret);

    if (!ok) {
      store.failedCount += 1;

      // lock after 3 failures
      if (store.failedCount >= 3) {
        store.lockedUntil = Date.now() + 15 * 60 * 1000; // 15 minutes
        return NextResponse.json({ error: "Invalid code. Account locked for 15 minutes.", state: await buildState() }, { status: 423 });
      }

      return NextResponse.json({ error: `Invalid code. ${3 - store.failedCount} attempt(s) left.`, state: await buildState() }, { status: 400 });
    }

    // success resets failures
    store.failedCount = 0;
    store.lockedUntil = null;

    return NextResponse.json({ message: "Code verified successfully.", state: await buildState() });
  }

  return NextResponse.json({ error: "Unknown action", state: await buildState() }, { status: 400 });
}
