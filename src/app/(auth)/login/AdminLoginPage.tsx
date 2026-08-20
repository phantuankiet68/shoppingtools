'use client';

import Image from 'next/image';
import { adminAuthService } from '@/services/auth/adminAuthService';
import { useAdminAuthStore } from '@/store/auth/adminAuthStore';
import styles from '@/styles/admin/login/login.module.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';

type FormState = {
    email: string;
    password: string;
};

const MAX_FAIL = 3;
const LOCK_SECONDS = 10;

export default function AdminLoginPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const nextUrl = useMemo(() => searchParams.get('next') || '/admin', [searchParams]);

    const [form, setForm] = useState<FormState>({
        email: '',
        password: '',
    });

    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [failCount, setFailCount] = useState(0);
    const [lockedUntil, setLockedUntil] = useState<number | null>(null);
    const [secondsLeft, setSecondsLeft] = useState(0);

    const timerRef = useRef<number | null>(null);

    const isLocked = lockedUntil !== null && lockedUntil > Date.now();

    useEffect(() => {
        if (!lockedUntil) return;

        if (timerRef.current) {
            window.clearInterval(timerRef.current);
        }

        const tick = () => {
            const left = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));

            setSecondsLeft(left);

            if (left <= 0) {
                setLockedUntil(null);
                setSecondsLeft(0);
                setFailCount(0);

                if (timerRef.current) {
                    window.clearInterval(timerRef.current);
                }

                timerRef.current = null;
            }
        };

        tick();

        timerRef.current = window.setInterval(tick, 1000);

        return () => {
            if (timerRef.current) {
                window.clearInterval(timerRef.current);
            }

            timerRef.current = null;
        };
    }, [lockedUntil]);

    function lockFor10s() {
        const until = Date.now() + LOCK_SECONDS * 1000;

        setLockedUntil(until);
        setError(null);
    }

    const setAuthenticated = useAdminAuthStore((state) => state.setAuthenticated);

    async function handleLogin() {
        if (isLocked || loading) return;

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

                if (next >= MAX_FAIL) {
                    lockFor10s();
                }

                return next;
            });

            if (!isLocked) {
                setError(err?.message || 'Login failed');
            }
        } finally {
            setLoading(false);
        }
    }

    const remainingTries = Math.max(0, MAX_FAIL - failCount);

    return (
        <div className={styles.page}>
            <div className={styles.backgroundGlow} />
            <div className={styles.backgroundGrid} />
            <div className={styles.backgroundOrb} />

            <main className={styles.container}>
                <section className={styles.card} aria-label="KBuilder Admin Login">
                    {/* ==================================================
                        LEFT VISUAL PANEL
                    ================================================== */}
                    <section className={styles.visualPanel}>
                        <div className={styles.visualInner}>
                            {/* Brand */}
                            <header className={styles.brandHeader}>
                                <div className={styles.brand}>
                                    <div className={styles.brandLogo}>
                                        <span>K</span>
                                    </div>

                                    <div className={styles.brandText}>
                                        <strong>KBUILDER</strong>
                                        <span>Website Management Platform</span>
                                    </div>
                                </div>

                                <div className={styles.consoleBadge}>
                                    <i className="bi bi-shield-check" />
                                    <span>ADMIN CONSOLE</span>
                                </div>
                            </header>

                            {/* Hero copy */}
                            <div className={styles.heroContent}>
                                <div className={styles.eyebrow}>
                                    <span className={styles.eyebrowLine} />
                                    <span>CONTROL YOUR DIGITAL WORLD</span>
                                </div>

                                <h1 className={styles.heroTitle}>
                                    Build. Manage.
                                    <span>Grow.</span>
                                </h1>

                                <p className={styles.heroDescription}>
                                    Manage websites, projects and digital experiences from one
                                    powerful workspace.
                                </p>
                            </div>

                            {/* Robot IMAGE */}
                            <div className={styles.robotStage}>
                                <div className={styles.robotGlow} />

                                <div className={`${styles.robotOrbit} ${styles.robotOrbitOne}`} />
                                <div className={`${styles.robotOrbit} ${styles.robotOrbitTwo}`} />
                                <div className={`${styles.robotOrbit} ${styles.robotOrbitThree}`} />

                                <div className={`${styles.robotNode} ${styles.robotNodeOne}`} />
                                <div className={`${styles.robotNode} ${styles.robotNodeTwo}`} />
                                <div className={`${styles.robotNode} ${styles.robotNodeThree}`} />

                                <Image
                                    src="/assets/images/admin/robot-stage.png"
                                    alt="KBuilder workspace"
                                    fill
                                    priority
                                    sizes="620px"
                                    className={styles.robotImage}
                                />

                                <div className={`${styles.robotCard} ${styles.robotCardTemplates}`}>
                                    <div className={styles.robotCardIcon}>
                                        <i className="bi bi-grid-1x2-fill" />
                                    </div>

                                    <div>
                                        <strong>350+</strong>
                                        <span>Templates</span>
                                    </div>
                                </div>

                                <div className={`${styles.robotCard} ${styles.robotCardVisitors}`}>
                                    <span className={styles.liveDot} />

                                    <div>
                                        <strong>24.6K</strong>
                                        <span>Visitors</span>
                                    </div>

                                    <i className="bi bi-graph-up-arrow" />
                                </div>

                                <div className={`${styles.robotCard} ${styles.robotCardCode}`}>
                                    <i className="bi bi-code-slash" />
                                </div>
                            </div>

                            {/* Features */}
                            <div className={styles.featureList}>
                                <div className={styles.featureItem}>
                                    <div className={styles.featureIcon}>
                                        <i className="bi bi-layout-text-window-reverse" />
                                    </div>

                                    <div>
                                        <strong>Visual Builder</strong>
                                        <span>Build without limits</span>
                                    </div>
                                </div>

                                <div className={styles.featureItem}>
                                    <div className={styles.featureIcon}>
                                        <i className="bi bi-layers" />
                                    </div>

                                    <div>
                                        <strong>Powerful Components</strong>
                                        <span>Reusable & scalable</span>
                                    </div>
                                </div>

                                <div className={styles.featureItem}>
                                    <div className={styles.featureIcon}>
                                        <i className="bi bi-cloud-check" />
                                    </div>

                                    <div>
                                        <strong>Cloud Hosting</strong>
                                        <span>Fast & secure deployment</span>
                                    </div>
                                </div>
                            </div>

                            {/* Bottom features */}
                            <footer className={styles.visualFooter}>
                                <span>
                                    <i className="bi bi-shield-check" />
                                    Enterprise Security
                                </span>

                                <span>
                                    <i className="bi bi-lightning-charge-fill" />
                                    Fast Deployment
                                </span>

                                <span>
                                    <i className="bi bi-cloud-fill" />
                                    Cloud Powered
                                </span>
                            </footer>
                        </div>
                    </section>

                    {/* ==================================================
                        RIGHT LOGIN PANEL
                    ================================================== */}
                    <section className={styles.loginPanel}>
                        <div className={styles.loginContent}>
                            <div className={styles.loginHeader}>
                                <div className={styles.mobileBrand}>
                                    <div className={styles.brandLogo}>
                                        <span>K</span>
                                    </div>

                                    <strong>KBUILDER</strong>
                                </div>

                                <div className={styles.securityBadge}>
                                    <i className="bi bi-shield-lock" />
                                    <span>Admin Only</span>
                                </div>

                                <div className={styles.loginRobot}>
                                    <div className={styles.loginRobotGlow} />

                                    <Image
                                        src="/assets/images/admin/robot-stage.png"
                                        alt=""
                                        width={150}
                                        height={150}
                                        priority
                                        className={styles.loginRobotImage}
                                    />
                                </div>

                                <span className={styles.loginEyebrow}>SECURE ADMINISTRATION</span>

                                <h2 className={styles.loginTitle}>
                                    Welcome <span>back</span>
                                </h2>
                            </div>

                            {/* Status */}
                            {(isLocked || failCount > 0) && (
                                <div
                                    className={`${styles.statusBadge} ${
                                        isLocked ? styles.statusLocked : styles.statusWarning
                                    }`}
                                    role="status"
                                    aria-live="polite"
                                >
                                    <div className={styles.statusIcon}>
                                        <i
                                            className={`bi ${
                                                isLocked
                                                    ? 'bi-lock-fill'
                                                    : 'bi-exclamation-triangle'
                                            }`}
                                        />
                                    </div>

                                    <div className={styles.statusText}>
                                        {isLocked ? (
                                            <>
                                                <strong>Temporarily locked</strong>

                                                <span>Try again in {secondsLeft}s</span>
                                            </>
                                        ) : (
                                            <>
                                                <strong>Login attempt failed</strong>

                                                <span>{remainingTries} attempts remaining</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Form */}
                            <form
                                className={styles.form}
                                onSubmit={(event) => {
                                    event.preventDefault();
                                    handleLogin();
                                }}
                            >
                                {/* Email */}
                                <div className={styles.field}>
                                    <label className={styles.label} htmlFor="email">
                                        Email address
                                    </label>

                                    <div className={styles.inputShell}>
                                        <span className={styles.inputIcon}>
                                            <i className="bi bi-envelope" />
                                        </span>

                                        <input
                                            id="email"
                                            type="email"
                                            autoComplete="email"
                                            placeholder="admin@company.com"
                                            value={form.email}
                                            onChange={(event) =>
                                                setForm((state) => ({
                                                    ...state,
                                                    email: event.target.value,
                                                }))
                                            }
                                            className={styles.input}
                                            required
                                            disabled={isLocked || loading}
                                        />
                                    </div>
                                </div>

                                {/* Password */}
                                <div className={styles.field}>
                                    <div className={styles.labelRow}>
                                        <label className={styles.label} htmlFor="password">
                                            Password
                                        </label>

                                        <button type="button" className={styles.forgotButton}>
                                            Forgot password?
                                        </button>
                                    </div>

                                    <div className={styles.inputShell}>
                                        <span className={styles.inputIcon}>
                                            <i className="bi bi-lock" />
                                        </span>

                                        <input
                                            id="password"
                                            type={showPw ? 'text' : 'password'}
                                            autoComplete="current-password"
                                            placeholder="Enter your password"
                                            value={form.password}
                                            onChange={(event) =>
                                                setForm((state) => ({
                                                    ...state,
                                                    password: event.target.value,
                                                }))
                                            }
                                            className={styles.input}
                                            required
                                            disabled={isLocked || loading}
                                        />

                                        <button
                                            type="button"
                                            className={styles.eyeButton}
                                            onClick={() => setShowPw((state) => !state)}
                                            aria-label={showPw ? 'Hide password' : 'Show password'}
                                            disabled={isLocked || loading}
                                        >
                                            <i
                                                className={`bi ${
                                                    showPw ? 'bi-eye-slash' : 'bi-eye'
                                                }`}
                                            />
                                        </button>
                                    </div>
                                </div>

                                {/* Error */}
                                {error && !isLocked && (
                                    <div className={styles.error} role="alert" aria-live="polite">
                                        <i className="bi bi-x-circle" />
                                        <span>{error}</span>
                                    </div>
                                )}

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={loading || isLocked}
                                    className={styles.loginButton}
                                >
                                    <span className={styles.loginButtonIcon}>
                                        {loading ? (
                                            <span className={styles.spinner} />
                                        ) : (
                                            <i className="bi bi-arrow-right" />
                                        )}
                                    </span>

                                    <span>
                                        {isLocked
                                            ? `Locked · ${secondsLeft}s`
                                            : loading
                                              ? 'Signing in...'
                                              : 'Sign in to Admin'}
                                    </span>

                                    {!loading && !isLocked && (
                                        <i
                                            className={`bi bi-arrow-up-right ${styles.loginButtonArrow}`}
                                        />
                                    )}
                                </button>
                            </form>
                        </div>

                        <footer className={styles.loginFooter}>
                            <span>KBuilder Admin Console</span>
                            <span className={styles.footerDivider} />
                            <span>v1.0</span>
                        </footer>
                    </section>
                </section>
            </main>
        </div>
    );
}
