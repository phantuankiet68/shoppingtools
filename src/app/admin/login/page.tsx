"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import styles from "@/styles/admin/login/login.module.css";
import { adminAuthService } from "@/services/auth/adminAuthService";
import { useAdminAuthStore } from "@/store/auth/adminAuthStore";

type FormState = { email: string; password: string };

const MAX_FAIL = 3;
const LOCK_SECONDS = 10;

export default function AdminLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextUrl = useMemo(() => searchParams.get("next") || "/admin", [searchParams]);

  const [form, setForm] = useState<FormState>({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // lock state
  const [failCount, setFailCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const now = Date.now();
  const isLocked = lockedUntil !== null && lockedUntil > now;

  const timerRef = useRef<number | null>(null);

  // countdown tick
  useEffect(() => {
    if (!lockedUntil) return;

    // clear old
    if (timerRef.current) window.clearInterval(timerRef.current);

    const tick = () => {
      const left = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
      setSecondsLeft(left);

      if (left <= 0) {
        setLockedUntil(null);
        setSecondsLeft(0);
        setFailCount(0); // reset after lock ends
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };

    tick();
    timerRef.current = window.setInterval(tick, 250);

    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [lockedUntil]);

  function lockFor10s() {
    const until = Date.now() + LOCK_SECONDS * 1000;
    setLockedUntil(until);
    setError(null);
  }

  const setAuthenticated = useAdminAuthStore((s) => s.setAuthenticated);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (isLocked) return;

    setError(null);
    setLoading(true);

    try {
      await adminAuthService.login(form);
      setFailCount(0);
      setLockedUntil(null);
      setSecondsLeft(0);
      setAuthenticated(true);
      router.replace(nextUrl);
    } catch (err: any) {
      setFailCount((prev) => {
        const next = prev + 1;
        if (next >= MAX_FAIL) lockFor10s();
        return next;
      });
      if (!isLocked) setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  const remainingTries = Math.max(0, MAX_FAIL - failCount);

  return (
    <div className={styles.page}>
      <div className={styles.bgGlowA} />
      <div className={styles.bgGlowB} />
      <div className={styles.bgGrid} />
      <div className={styles.noise} />

      <main className={styles.container}>
        <section className={styles.card} aria-label="Admin Login">
          {/* Hero */}
          <div className={styles.hero}>
            <div className={styles.robot} aria-hidden="true">
              <svg viewBox="0 0 160 160" className={styles.robotSvg}>
                {/* LEFT ARM */}
                <g className={styles.armLeft}>
                  <rect x="8" y="78" width="36" height="18" rx="9" fill="#ffffff" />
                  <circle cx="10" cy="87" r="6" fill="#ffffff" />
                </g>

                {/* RIGHT ARM */}
                <g className={styles.armRight}>
                  <rect x="116" y="78" width="36" height="18" rx="9" fill="#ffffff" />
                  <circle cx="150" cy="87" r="6" fill="#ffffff" />
                </g>

                {/* HEAD */}
                <rect x="40" y="22" width="80" height="60" rx="26" fill="#ffffff" />
                <rect x="52" y="36" width="56" height="32" rx="16" fill="#0f172a" />

                {/* EYES */}
                <circle cx="70" cy="52" r="5" fill="#3b82f6" />
                <circle cx="90" cy="52" r="5" fill="#3b82f6" />

                {/* BODY */}
                <rect x="54" y="86" width="52" height="40" rx="20" fill="#ffffff" />
                <circle cx="80" cy="106" r="6" fill="#22c55e" />
              </svg>

              <div className={styles.robotShadow} />
            </div>

            <div className={styles.heroText}>
              <p className={styles.kicker}>
                <span className={styles.pill}>
                  <i className="bi bi-shield-lock" />
                  Admin Only
                </span>
              </p>
              <h1 className={styles.title}>Welcome back</h1>
              <p className={styles.subtitle}>Sign in to manage your system securely</p>

              {/* Floating status badge (top-left) */}
              {(isLocked || failCount > 0) && (
                <div
                  className={`${styles.statusBadge} ${isLocked ? styles.statusLocked : styles.statusWarn}`}
                  role="status"
                  aria-live="polite"
                >
                  <i className={`bi ${isLocked ? "bi-lock-fill" : "bi-exclamation-triangle"}`} />
                  <div className={styles.statusText}>
                    {isLocked ? (
                      <>
                        <strong>Locked</strong>
                        <span>{secondsLeft}s remaining</span>
                      </>
                    ) : (
                      <>
                        <strong>Login failed</strong>
                        <span>Remaining tries: {remainingTries}</span>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <form onSubmit={onSubmit} className={styles.form}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>

              <div className={styles.inputShell}>
                <i className={`bi bi-envelope ${styles.inputIcon}`} aria-hidden="true" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@company.com"
                  value={form.email}
                  onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  className={styles.input}
                  required
                  disabled={isLocked || loading}
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Password
              </label>

              <div className={styles.inputShell}>
                <i className={`bi bi-lock ${styles.inputIcon}`} aria-hidden="true" />
                <input
                  id="password"
                  type={showPw ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={form.password}
                  onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                  className={styles.input}
                  required
                  disabled={isLocked || loading}
                />
                <button
                  type="button"
                  className={styles.eyeBtn}
                  onClick={() => setShowPw((s) => !s)}
                  aria-label={showPw ? "Hide password" : "Show password"}
                  disabled={isLocked || loading}
                >
                  <i className={`bi ${showPw ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </div>

            {error && !isLocked ? (
              <div className={styles.error} role="alert" aria-live="polite">
                <i className="bi bi-x-circle" aria-hidden="true" />
                <span>{error}</span>
              </div>
            ) : null}

            <button type="submit" disabled={loading || isLocked} className={styles.button}>
              {loading ? <span className={styles.spinner} /> : <i className="bi bi-box-arrow-in-right" />}
              <span>{isLocked ? `Locked (${secondsLeft}s)` : loading ? "Logging in..." : "Login"}</span>
            </button>

            <div className={styles.footerNote}>
              <i className="bi bi-info-circle" aria-hidden="true" />
              <span>After 3 failed attempts, lock 10s (UI). Add server rate-limit too.</span>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
