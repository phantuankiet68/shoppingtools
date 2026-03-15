"use client";

import React, { useEffect, useRef, useState } from "react";
import cls from "@/styles/templates/sections/Header/HeaderAnnouncement.module.css";

type AuthMode = "login" | "register";

export type HeaderAuthModalProps = {
  open: boolean;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  onLogin?: (payload: { email: string; password: string }) => Promise<void> | void;
  onRegister?: (payload: { name: string; email: string; password: string }) => Promise<void> | void;
};

export default function HeaderAuthModal({
  open,
  mode,
  onModeChange,
  onClose,
  onLogin,
  onRegister,
}: HeaderAuthModalProps) {
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirmPass, setRegConfirmPass] = useState("");

  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => firstInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, mode]);

  useEffect(() => {
    if (!open) {
      setBusy(false);
      setErr("");
      setShowPass(false);
      setShowConfirmPass(false);
      setLoginEmail("");
      setLoginPass("");
      setRegName("");
      setRegEmail("");
      setRegPass("");
      setRegConfirmPass("");
      setAcceptTerms(false);
    }
  }, [open]);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v.trim());

  const submitLogin = async () => {
    setErr("");
    const email = loginEmail.trim();
    const password = loginPass;

    if (!validateEmail(email)) return setErr("Please enter a valid email.");
    if (!password || password.length < 6) {
      return setErr("Password must be at least 6 characters.");
    }

    setBusy(true);
    try {
      await onLogin?.({ email, password });
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Login failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const submitRegister = async () => {
    setErr("");
    const name = regName.trim();
    const email = regEmail.trim();
    const password = regPass;
    const confirmPassword = regConfirmPass;

    if (!name) return setErr("Please enter your full name.");
    if (!validateEmail(email)) return setErr("Please enter a valid email.");
    if (!password || password.length < 6) {
      return setErr("Password must be at least 6 characters.");
    }
    if (password !== confirmPassword) {
      return setErr("Password confirmation does not match.");
    }
    if (!acceptTerms) {
      return setErr("Please agree to the terms and privacy policy.");
    }

    setBusy(true);
    try {
      await onRegister?.({ name, email, password });
      onClose();
    } catch (e: any) {
      setErr(e?.message || "Registration failed. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className={cls.authOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={mode === "login" ? "Login dialog" : "Register dialog"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={cls.authPanel}>
        <div className={cls.authGlow} />

        <div className={cls.authHead}>
          <div className={cls.authHeadContent}>
            <span className={cls.authKicker}>
              {mode === "login" ? "Customer Account" : "Member Registration"}
            </span>
            <div className={cls.authTitle}>
              {mode === "login" ? "Welcome back" : "Create a new account"}
            </div>
            <p className={cls.authDesc}>
              {mode === "login"
                ? "Sign in to track your orders, save favorite products, and receive exclusive offers just for you."
                : "Create an account to shop faster, manage your orders, and enjoy many attractive offers."}
            </p>
          </div>

          <button className={cls.authClose} type="button" onClick={onClose} aria-label="Close">
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={cls.authTabs} role="tablist" aria-label="Auth tabs">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={`${cls.authTab} ${mode === "login" ? cls.authTabActive : ""}`}
            onClick={() => {
              setErr("");
              onModeChange("login");
            }}
          >
            <i className="bi bi-box-arrow-in-right" />
            <span>Login</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            className={`${cls.authTab} ${mode === "register" ? cls.authTabActive : ""}`}
            onClick={() => {
              setErr("");
              onModeChange("register");
            }}
          >
            <i className="bi bi-person-plus" />
            <span>Register</span>
          </button>
        </div>

        {err ? (
          <div className={cls.authError} role="status" aria-live="polite">
            <i className="bi bi-exclamation-triangle-fill" />
            <span>{err}</span>
          </div>
        ) : null}

        {mode === "login" ? (
          <form
            className={cls.authForm}
            onSubmit={(e) => {
              e.preventDefault();
              if (busy) return;
              submitLogin();
            }}
          >
            <label className={cls.authLabel}>
              <span className={cls.authLabelText}>Email</span>
              <div className={cls.authInputWrap}>
                <i className={`bi bi-envelope ${cls.authInputIcon}`} />
                <input
                  ref={firstInputRef}
                  className={cls.authInput}
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </label>

            <label className={cls.authLabel}>
              <span className={cls.authLabelText}>Password</span>
              <div className={cls.authInputWrap}>
                <i className={`bi bi-lock ${cls.authInputIcon}`} />
                <input
                  className={cls.authInput}
                  type={showPass ? "text" : "password"}
                  value={loginPass}
                  onChange={(e) => setLoginPass(e.target.value)}
                  placeholder="••••••••"
                  autoComplete={rememberMe ? "current-password" : "off"}
                />
                <button
                  className={cls.authEye}
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  aria-label={showPass ? "Hide password" : "Show password"}
                >
                  <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
            </label>

            <div className={cls.authMeta}>
              <label className={cls.authRemember}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember password</span>
              </label>

              <button type="button" className={cls.authLinkBtn}>
                Forgot password?
              </button>
            </div>

            <div className={cls.authRow}>
              <button className={cls.authPrimary} type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <span className={cls.authSpinner} />
                    <span>Logging in…</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right" />
                    <span>Login</span>
                  </>
                )}
              </button>

              <button
                className={cls.authGhost}
                type="button"
                onClick={() => {
                  setErr("");
                  onModeChange("register");
                }}
              >
                <span>Create account</span>
              </button>
            </div>

            <div className={cls.authDivider}>
              <span>Or continue with</span>
            </div>

            <div className={cls.authSocials}>
              <button
                type="button"
                className={cls.authSocialBtn}
                aria-label="Continue with Google"
              >
                <i className="bi bi-google" />
                <span>Google</span>
              </button>

              <button
                type="button"
                className={cls.authSocialBtn}
                aria-label="Continue with Facebook"
              >
                <i className="bi bi-facebook" />
                <span>Facebook</span>
              </button>

              <button
                type="button"
                className={cls.authSocialBtn}
                aria-label="Continue with Apple"
              >
                <i className="bi bi-apple" />
                <span>Apple</span>
              </button>
            </div>
          </form>
        ) : (
          <form
            className={cls.authForm}
            onSubmit={(e) => {
              e.preventDefault();
              if (busy) return;
              submitRegister();
            }}
          >
            <label className={cls.authLabel}>
              <span className={cls.authLabelText}>Full name</span>
              <div className={cls.authInputWrap}>
                <i className={`bi bi-person ${cls.authInputIcon}`} />
                <input
                  ref={firstInputRef}
                  className={cls.authInput}
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                />
              </div>
            </label>

            <label className={cls.authLabel}>
              <span className={cls.authLabelText}>Email</span>
              <div className={cls.authInputWrap}>
                <i className={`bi bi-envelope ${cls.authInputIcon}`} />
                <input
                  className={cls.authInput}
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </div>
            </label>

            <div className={cls.authGridTwo}>
              <label className={cls.authLabel}>
                <span className={cls.authLabelText}>Password</span>
                <div className={cls.authInputWrap}>
                  <i className={`bi bi-lock ${cls.authInputIcon}`} />
                  <input
                    className={cls.authInput}
                    type={showPass ? "text" : "password"}
                    value={regPass}
                    onChange={(e) => setRegPass(e.target.value)}
                    placeholder="At least 6 characters"
                    autoComplete="new-password"
                  />
                  <button
                    className={cls.authEye}
                    type="button"
                    onClick={() => setShowPass((v) => !v)}
                    aria-label={showPass ? "Hide password" : "Show password"}
                  >
                    <i className={`bi ${showPass ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
              </label>

              <label className={cls.authLabel}>
                <span className={cls.authLabelText}>Confirm password</span>
                <div className={cls.authInputWrap}>
                  <i className={`bi bi-shield-lock ${cls.authInputIcon}`} />
                  <input
                    className={cls.authInput}
                    type={showConfirmPass ? "text" : "password"}
                    value={regConfirmPass}
                    onChange={(e) => setRegConfirmPass(e.target.value)}
                    placeholder="Re-enter password"
                    autoComplete="new-password"
                  />
                  <button
                    className={cls.authEye}
                    type="button"
                    onClick={() => setShowConfirmPass((v) => !v)}
                    aria-label={showConfirmPass ? "Hide password" : "Show password"}
                  >
                    <i className={`bi ${showConfirmPass ? "bi-eye-slash" : "bi-eye"}`} />
                  </button>
                </div>
              </label>
            </div>

            <label className={cls.authRemember}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
              />
              <span>
                I agree to the{" "}
                <button type="button" className={cls.authInlineLink}>
                  terms
                </button>{" "}
                and{" "}
                <button type="button" className={cls.authInlineLink}>
                  privacy policy
                </button>
              </span>
            </label>

            <div className={cls.authRow}>
              <button className={cls.authPrimary} type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <span className={cls.authSpinner} />
                    <span>Creating account…</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus" />
                    <span>Register</span>
                  </>
                )}
              </button>

              <button
                className={cls.authGhost}
                type="button"
                onClick={() => {
                  setErr("");
                  onModeChange("login");
                }}
              >
                <span>I already have an account</span>
              </button>
            </div>

            <div className={cls.authDivider}>
              <span>Or register with</span>
            </div>

            <div className={cls.authSocials}>
              <button
                type="button"
                className={cls.authSocialBtn}
                aria-label="Register with Google"
              >
                <i className="bi bi-google" />
                <span>Google</span>
              </button>

              <button
                type="button"
                className={cls.authSocialBtn}
                aria-label="Register with Facebook"
              >
                <i className="bi bi-facebook" />
                <span>Facebook</span>
              </button>

              <button
                type="button"
                className={cls.authSocialBtn}
                aria-label="Register with Apple"
              >
                <i className="bi bi-apple" />
                <span>Apple</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}