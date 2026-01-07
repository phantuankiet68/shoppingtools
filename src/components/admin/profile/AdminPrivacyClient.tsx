"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "@/styles/admin/profile/privacy.module.css";

type TwoFAState = {
  enabled: boolean;
  hasSecret: boolean;
  issuer: string;
  label: string;
  otpauthUrl?: string;
  qrDataUrl?: string;
  updatedAt?: string;
  lockInfo?: { failedCount: number; lockedUntil?: string | null };
};

type Toast = { type: "ok" | "err"; text: string } | null;

type ActivityItem = {
  id: string;
  title: string;
  meta: string;
  when: string;
  level: "ok" | "warn";
};

type DeviceItem = {
  id: string;
  name: string;
  meta: string;
  lastSeen: string;
  current?: boolean;
};

function maskOtpAuth(url?: string) {
  if (!url) return "";
  if (url.length <= 42) return url;
  return `${url.slice(0, 34)}…${url.slice(-6)}`;
}

function genRecoveryCodes(n = 8) {
  // UI demo — replace with server-generated codes
  const codes: string[] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.random().toString(36).slice(2, 6).toUpperCase();
    const b = Math.random().toString(36).slice(2, 6).toUpperCase();
    codes.push(`${a}-${b}`);
  }
  return codes;
}

export default function AdminPrivacyClient() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [state, setState] = useState<TwoFAState | null>(null);

  const [otp, setOtp] = useState("");
  const [msg, setMsg] = useState<Toast>(null);

  // extra UI policies (demo/local)
  const [requireReverify, setRequireReverify] = useState(true);
  const [autoSignOut, setAutoSignOut] = useState<"30m" | "2h" | "8h">("2h");
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [showOtpAuth, setShowOtpAuth] = useState(false);

  const activity: ActivityItem[] = useMemo(() => [{ id: "a3", title: "Failed verification", meta: "Wrong code entered", when: "Jan 5, 2026 10:12", level: "warn" }], []);

  const devices: DeviceItem[] = useMemo(
    () => [
      { id: "d1", name: "Chrome (Windows)", meta: "HCMC, VN • IP 103.12.xx.xx", lastSeen: "Now", current: true },
      { id: "d2", name: "Safari (iPhone)", meta: "HCMC, VN • IP 14.16.xx.xx", lastSeen: "Jan 3, 2026" },
      { id: "d3", name: "Edge (Windows)", meta: "Tokyo, JP • IP 52.19.xx.xx", lastSeen: "Dec 27, 2025" },
    ],
    []
  );

  async function refresh() {
    setLoading(true);
    setMsg(null);
    try {
      const r = await fetch("/api/admin/privacy/2fa", { credentials: "include" });
      const data = await r.json();
      setState(data);
    } catch {
      setMsg({ type: "err", text: "Failed to load privacy settings." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const canVerify = useMemo(() => otp.trim().length >= 6, [otp]);
  const locked = !!state?.lockInfo?.lockedUntil;

  async function call(action: "generate" | "rotate" | "enable" | "disable" | "delete" | "verify") {
    if (!state) return;
    setBusy(true);
    setMsg(null);

    try {
      const r = await fetch("/api/admin/privacy/2fa", {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action, otp: otp.trim() || undefined }),
      });

      const data = await r.json();

      if (!r.ok) {
        setMsg({ type: "err", text: data?.error ?? "Something went wrong" });
      } else {
        setMsg({ type: "ok", text: data?.message ?? "Success" });
        setOtp("");
      }

      setState(data?.state ?? data);
    } catch {
      setMsg({ type: "err", text: "Network error. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  async function copyText(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setMsg({ type: "ok", text: "Copied to clipboard." });
    } catch {
      setMsg({ type: "err", text: "Copy failed." });
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.head}>
        <div>
          <div className={styles.title}>Privacy & Security</div>
        </div>

        <div className={styles.headRight}>
          <button className={styles.ghostBtn} type="button" onClick={refresh} disabled={loading || busy}>
            <i className="bi bi-arrow-clockwise" /> Refresh
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {/* LEFT */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardTitle}>
              <span className={styles.iconBubble}>
                <i className="bi bi-shield-lock" />
              </span>
              <div>
                <div className={styles.h}>Two-factor authentication (2FA)</div>
                <div className={styles.p}>Use an authenticator app to generate a 6-digit code.</div>
              </div>
            </div>

            <span className={`${styles.badge} ${state?.enabled ? styles.badgeOn : styles.badgeOff}`}>
              <span className={styles.dot} />
              {state?.enabled ? "Enabled" : "Disabled"}
            </span>
          </div>

          {loading ? (
            <div className={styles.skel}>Loading security settings…</div>
          ) : (
            <>
              <div className={styles.rowInfo}>
                <div className={styles.kv}>
                  <div className={styles.k}>Secret</div>
                  <div className={styles.v}>{state?.hasSecret ? "Created" : "Not created"}</div>
                </div>

                <div className={styles.kv}>
                  <div className={styles.k}>Last updated</div>
                  <div className={styles.v}>{state?.updatedAt ?? "—"}</div>
                </div>

                <div className={styles.kv}>
                  <div className={styles.k}>Failed attempts</div>
                  <div className={styles.v}>
                    {state?.lockInfo?.failedCount ?? 0}
                    {locked ? (
                      <span className={styles.locked}>
                        <i className="bi bi-lock-fill" /> Locked until {state?.lockInfo?.lockedUntil}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {state?.qrDataUrl ? (
                <div className={styles.setup}>
                  <div className={styles.qrBox}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className={styles.qr} src={state.qrDataUrl} alt="2FA QR" />
                  </div>

                  <div className={styles.setupText}>
                    <div className={styles.setupTitle}>Scan QR to set up</div>
                    <div className={styles.setupHint}>Open Google Authenticator / Microsoft Authenticator → Scan QR → then verify below.</div>

                    <div className={styles.warn}>
                      <i className="bi bi-exclamation-triangle" />
                      Don’t share this QR or secret.
                    </div>

                    {state.otpauthUrl ? (
                      <div className={styles.revealWrap}>
                        <button type="button" className={styles.btn} onClick={() => setShowOtpAuth((v) => !v)} disabled={busy}>
                          <i className={`bi ${showOtpAuth ? "bi-eye-slash" : "bi-eye"}`} /> {showOtpAuth ? "Hide setup link" : "Show setup link"}
                        </button>

                        {showOtpAuth ? (
                          <button type="button" className={styles.revealLine} onClick={() => copyText(state.otpauthUrl!)} disabled={busy} title="Copy otpauth url">
                            <i className="bi bi-clipboard" /> Copy setup link: {maskOtpAuth(state.otpauthUrl)}
                          </button>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              <div className={styles.actions}>
                {!state?.hasSecret ? (
                  <button className={styles.primaryBtn} type="button" onClick={() => call("generate")} disabled={busy || locked}>
                    <i className="bi bi-key-fill" /> Create 2FA key
                  </button>
                ) : (
                  <>
                    <button className={styles.primaryBtn} type="button" onClick={() => call(state.enabled ? "disable" : "enable")} disabled={busy || locked}>
                      <i className={`bi ${state.enabled ? "bi-toggle-on" : "bi-toggle-off"}`} /> {state.enabled ? "Disable" : "Enable"}
                    </button>

                    <button className={styles.btn} type="button" onClick={() => call("rotate")} disabled={busy || locked}>
                      <i className="bi bi-arrow-repeat" /> Rotate key
                    </button>

                    <button className={styles.dangerBtn} type="button" onClick={() => call("delete")} disabled={busy || locked}>
                      <i className="bi bi-trash3" /> Delete key
                    </button>
                  </>
                )}
              </div>

              <div className={styles.verify}>
                <div className={styles.verifyLeft}>
                  <div className={styles.verifyTitle}>Verify code</div>
                  <div className={styles.verifyHint}>Enter the 6-digit code from your authenticator app.</div>
                </div>

                <div className={styles.verifyRight}>
                  <input
                    className={styles.otp}
                    inputMode="numeric"
                    placeholder="123456"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    disabled={busy || locked || !state?.hasSecret}
                  />
                  <button className={styles.btn} type="button" onClick={() => call("verify")} disabled={busy || locked || !state?.hasSecret || !canVerify}>
                    <i className="bi bi-check2-circle" /> Verify
                  </button>
                </div>
              </div>

              {msg ? (
                <div className={`${styles.msg} ${msg.type === "ok" ? styles.msgOk : styles.msgErr}`}>
                  <i className={`bi ${msg.type === "ok" ? "bi-check-circle" : "bi-x-circle"}`} />
                  <span>{msg.text}</span>
                </div>
              ) : null}

              <div className={styles.note}>
                <i className="bi bi-info-circle" />
                Policy: If you enter a wrong code <b>3 times</b>, the account will be <b>locked</b> temporarily.
              </div>
            </>
          )}
        </section>

        {/* RIGHT */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <div className={styles.cardTitle}>
              <span className={styles.iconBubble}>
                <i className="bi bi-shield-check" />
              </span>
              <div>
                <div className={styles.h}>Security dashboard</div>
                <div className={styles.p}>Recommendations, login activity, and trusted devices.</div>
              </div>
            </div>
          </div>

          <div className={styles.policyList}>
            <div className={styles.policy}>
              <div className={styles.policyLeft}>
                <div className={styles.policyName}>Lockout after failed 2FA attempts</div>
                <div className={styles.policyDesc}>Lock account after 3 failed codes (cooldown 15 minutes).</div>
              </div>
              <span className={styles.pill}>ON</span>
            </div>

            <div className={styles.policy}>
              <div className={styles.policyLeft}>
                <div className={styles.policyName}>Require 2FA for admin routes</div>
                <div className={styles.policyDesc}>Block admin access when 2FA is enabled but not verified.</div>
              </div>
              <span className={styles.pill}>ON</span>
            </div>

            <div className={styles.policy}>
              <div className={styles.policyLeft}>
                <div className={styles.policyName}>Re-verify after inactivity</div>
                <div className={styles.policyDesc}>Ask for OTP again after inactivity.</div>
              </div>
              <span className={`${styles.pill} ${styles.pillSoft}`}>{requireReverify ? "ENABLED" : "OFF"}</span>
            </div>

            <div className={styles.policy}>
              <div className={styles.policyLeft}>
                <div className={styles.policyName}>Session timeout</div>
                <div className={styles.policyDesc}>Automatically sign out inactive sessions.</div>
              </div>

              <div className={styles.pillsRow}>
                {(["30m", "2h", "8h"] as const).map((v) => (
                  <button key={v} type="button" className={`${styles.miniPillBtn} ${autoSignOut === v ? styles.miniPillActive : ""}`} onClick={() => setAutoSignOut(v)} disabled={busy}>
                    <i className="bi bi-clock" /> {v}
                  </button>
                ))}

                <button type="button" className={styles.miniPillBtn} onClick={() => setRequireReverify((x) => !x)} disabled={busy}>
                  <i className={`bi ${requireReverify ? "bi-toggle-on" : "bi-toggle-off"}`} /> Re-verify
                </button>
              </div>
            </div>

            <div className={styles.stack}>
              {activity.map((a) => (
                <div key={a.id} className={styles.itemCard}>
                  <div className={styles.itemTop}>
                    <div className={styles.itemTitle}>
                      <i className={`bi ${a.level === "ok" ? "bi-check2-circle" : "bi-exclamation-triangle"} ${a.level === "ok" ? styles.iconOk : styles.iconWarn}`} />
                      <span>{a.title}</span>
                    </div>
                    <div className={styles.itemWhen}>{a.when}</div>
                  </div>
                  <div className={styles.itemMeta}>{a.meta}</div>
                </div>
              ))}
            </div>

            {recoveryCodes.length ? (
              <div className={styles.codesBox}>
                <div className={styles.codesHead}>
                  <i className="bi bi-key" style={{ color: "var(--primary2)" }} /> Your recovery codes
                </div>

                <div className={styles.codesGrid}>
                  {recoveryCodes.map((c) => (
                    <div key={c} className={styles.codeCell}>
                      {c}
                    </div>
                  ))}
                </div>

                <div className={styles.codesHint}>Store these codes in a safe place. Each code can be used once.</div>
              </div>
            ) : null}

            <div className={styles.policy}>
              <div className={styles.policyLeft}>
                <div className={`${styles.policyName} ${styles.dangerTitle}`}>Danger zone</div>
                <div className={styles.policyDesc}>High-impact actions for account security.</div>
              </div>
              <span className={`${styles.pill} ${styles.pillSoft}`}>CAREFUL</span>
            </div>

            <div className={styles.pillsRow} style={{ justifyContent: "flex-start" }}>
              <button className={styles.btn} type="button" disabled={busy} onClick={() => setMsg({ type: "ok", text: "Logged out all sessions (demo)." })}>
                <i className="bi bi-box-arrow-right" /> Logout all sessions
              </button>

              <button className={styles.dangerBtn} type="button" disabled={busy} onClick={() => setMsg({ type: "err", text: "Account locked (demo). Implement via DB lockedUntil." })}>
                <i className="bi bi-lock-fill" /> Lock account now
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
