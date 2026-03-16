"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import cls from "@/styles/templates/sections/Header/HeaderAnnouncement.module.css";
import { loginUser, registerUser } from "@/store/auth/auth-client";

type AuthMode = "login" | "register";

export type HeaderAuthModalProps = {
  open: boolean;
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onClose: () => void;
  onSuccess?: (payload: {
    type: AuthMode;
    user: {
      id: string;
      email: string;
      role: string;
      status: string;
      image?: string | null;
    };
  }) => void | Promise<void>;
};

type FieldErrors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  terms?: string;
  general?: string;
};

export default function HeaderAuthModal({ open, mode, onModeChange, onClose, onSuccess }: HeaderAuthModalProps) {
  const firstInputRef = useRef<HTMLInputElement | null>(null);

  const [busy, setBusy] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPass, setRegPass] = useState("");
  const [regConfirmPass, setRegConfirmPass] = useState("");

  const [showLoginPass, setShowLoginPass] = useState(false);
  const [showRegisterPass, setShowRegisterPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [rememberMe, setRememberMe] = useState(true);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [errors, setErrors] = useState<FieldErrors>({});

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => firstInputRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, [open, mode]);

  useEffect(() => {
    if (!open) {
      setBusy(false);
      setSuccessMessage("");
      setErrors({});
      setLoginEmail("");
      setLoginPass("");
      setRegName("");
      setRegEmail("");
      setRegPass("");
      setRegConfirmPass("");
      setShowLoginPass(false);
      setShowRegisterPass(false);
      setShowConfirmPass(false);
      setRememberMe(true);
      setAcceptTerms(false);
    }
  }, [open]);

  const isLogin = mode === "login";
  const isRegister = mode === "register";

  const title = useMemo(() => {
    return isLogin ? "Welcome back" : "Create your account";
  }, [isLogin]);

  const subtitle = useMemo(() => {
    return isLogin ? "Login to continue your experience." : "Register a new account to start using the platform.";
  }, [isLogin]);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(v.trim());

  const clearMessages = () => {
    setErrors({});
    setSuccessMessage("");
  };

  const validateLogin = (): boolean => {
    const nextErrors: FieldErrors = {};
    const email = loginEmail.trim();
    const password = loginPass;

    if (!email) {
      nextErrors.email = "Please enter your email.";
    } else if (!validateEmail(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Please enter your password.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const validateRegister = (): boolean => {
    const nextErrors: FieldErrors = {};
    const name = regName.trim();
    const email = regEmail.trim();
    const password = regPass;
    const confirmPassword = regConfirmPass;

    if (!name) {
      nextErrors.name = "Please enter your full name.";
    } else if (name.length < 2) {
      nextErrors.name = "Full name must be at least 2 characters.";
    }

    if (!email) {
      nextErrors.email = "Please enter your email.";
    } else if (!validateEmail(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!password) {
      nextErrors.password = "Please enter your password.";
    } else if (password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters.";
    } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
      nextErrors.password = "Password should include both letters and numbers.";
    }

    if (!confirmPassword) {
      nextErrors.confirmPassword = "Please confirm your password.";
    } else if (password !== confirmPassword) {
      nextErrors.confirmPassword = "Password confirmation does not match.";
    }

    if (!acceptTerms) {
      nextErrors.terms = "Please agree to the terms and privacy policy.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitLogin = async () => {
    clearMessages();
    if (!validateLogin()) return;

    setBusy(true);

    try {
      const res = await loginUser({
        email: loginEmail.trim(),
        password: loginPass,
      });

      setSuccessMessage("Login successful.");

      await onSuccess?.({
        type: "login",
        user: res.user,
      });

      onClose();
    } catch (e: any) {
      setErrors({
        general: e?.message || "Login failed. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const submitRegister = async () => {
    clearMessages();
    if (!validateRegister()) return;

    setBusy(true);

    try {
      const res = await registerUser({
        name: regName.trim(),
        email: regEmail.trim(),
        password: regPass,
      });

      setSuccessMessage("Account created successfully.");

      await onSuccess?.({
        type: "register",
        user: {
          id: res.user.id,
          email: res.user.email,
          role: res.user.role,
          status: res.user.status,
          image: null,
        },
      });

      onClose();
    } catch (e: any) {
      setErrors({
        general: e?.message || "Registration failed. Please try again.",
      });
    } finally {
      setBusy(false);
    }
  };

  const renderFieldError = (message?: string) => {
    if (!message) return null;
    return (
      <span className={cls.authFieldError} role="alert">
        {message}
      </span>
    );
  };

  if (!open) return null;

  return (
    <div
      className={cls.authOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={isLogin ? "Login dialog" : "Register dialog"}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div className={cls.authPanel}>
        <div className={cls.authGlow} />

        <div className={cls.authHead}>
          <div className={cls.authHeadContent}>
            <div className={cls.authKicker}>{title}</div>
            <h3 className={cls.authTitle}>{isLogin ? "Sign in" : "Create account"}</h3>
            <p className={cls.authDesc}>{subtitle}</p>
          </div>

          <button className={cls.authClose} type="button" onClick={onClose} aria-label="Close" disabled={busy}>
            <i className="bi bi-x-lg" />
          </button>
        </div>

        <div className={cls.authTabs} role="tablist" aria-label="Authentication tabs">
          <button
            type="button"
            role="tab"
            aria-selected={isLogin}
            className={`${cls.authTab} ${isLogin ? cls.authTabActive : ""}`}
            onClick={() => {
              clearMessages();
              onModeChange("login");
            }}
            disabled={busy}
          >
            <i className="bi bi-box-arrow-in-right" />
            <span>Login</span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={isRegister}
            className={`${cls.authTab} ${isRegister ? cls.authTabActive : ""}`}
            onClick={() => {
              clearMessages();
              onModeChange("register");
            }}
            disabled={busy}
          >
            <i className="bi bi-person-plus" />
            <span>Register</span>
          </button>
        </div>

        {errors.general ? (
          <div className={cls.authError} role="alert" aria-live="polite">
            <i className="bi bi-exclamation-triangle-fill" />
            <span>{errors.general}</span>
          </div>
        ) : null}

        {!errors.general && successMessage ? (
          <div className={cls.authSuccess} role="status" aria-live="polite">
            <i className="bi bi-check-circle-fill" />
            <span>{successMessage}</span>
          </div>
        ) : null}

        {isLogin ? (
          <form
            className={cls.authForm}
            onSubmit={(e) => {
              e.preventDefault();
              if (busy) return;
              submitLogin();
            }}
            noValidate
          >
            <label className={cls.authLabel}>
              <span className={cls.authLabelText}>Email address</span>
              <div className={`${cls.authInputWrap} ${errors.email ? cls.authInputWrapError : ""}`}>
                <i className={`bi bi-envelope ${cls.authInputIcon}`} />
                <input
                  ref={firstInputRef}
                  className={cls.authInput}
                  type="email"
                  value={loginEmail}
                  onChange={(e) => {
                    setLoginEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={busy}
                  aria-invalid={!!errors.email}
                />
              </div>
              {renderFieldError(errors.email)}
            </label>

            <label className={cls.authLabel}>
              <span className={cls.authLabelText}>Password</span>
              <div className={`${cls.authInputWrap} ${errors.password ? cls.authInputWrapError : ""}`}>
                <i className={`bi bi-lock ${cls.authInputIcon}`} />
                <input
                  className={cls.authInput}
                  type={showLoginPass ? "text" : "password"}
                  value={loginPass}
                  onChange={(e) => {
                    setLoginPass(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Enter your password"
                  autoComplete={rememberMe ? "current-password" : "off"}
                  disabled={busy}
                  aria-invalid={!!errors.password}
                />
                <button
                  className={cls.authEye}
                  type="button"
                  onClick={() => setShowLoginPass((v) => !v)}
                  aria-label={showLoginPass ? "Hide password" : "Show password"}
                  disabled={busy}
                >
                  <i className={`bi ${showLoginPass ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
              {renderFieldError(errors.password)}
            </label>

            <div className={cls.authMeta}>
              <label className={cls.authRemember}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={busy}
                />
                <span>Remember me</span>
              </label>

              <button type="button" className={cls.authLinkBtn} disabled={busy}>
                Forgot password?
              </button>
            </div>

            <div className={cls.authRow}>
              <button className={cls.authPrimary} type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <span className={cls.authSpinner} />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-in-right" />
                    <span>Sign in</span>
                  </>
                )}
              </button>

              <button
                className={cls.authGhost}
                type="button"
                onClick={() => {
                  clearMessages();
                  onModeChange("register");
                }}
                disabled={busy}
              >
                <span>Create account</span>
              </button>
            </div>

            <div className={cls.authDivider}>
              <span>Or continue with</span>
            </div>

            <div className={cls.authSocials}>
              <button type="button" className={cls.authSocialBtn} aria-label="Continue with Google" disabled={busy}>
                <i className="bi bi-google" />
                <span>Google</span>
              </button>

              <button type="button" className={cls.authSocialBtn} aria-label="Continue with Facebook" disabled={busy}>
                <i className="bi bi-facebook" />
                <span>Facebook</span>
              </button>

              <button type="button" className={cls.authSocialBtn} aria-label="Continue with Apple" disabled={busy}>
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
            noValidate
          >
            <label className={cls.authLabel}>
              <span className={cls.authLabelText}>Full name</span>
              <div className={`${cls.authInputWrap} ${errors.name ? cls.authInputWrapError : ""}`}>
                <i className={`bi bi-person ${cls.authInputIcon}`} />
                <input
                  ref={firstInputRef}
                  className={cls.authInput}
                  type="text"
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder="Your full name"
                  autoComplete="name"
                  disabled={busy}
                  aria-invalid={!!errors.name}
                />
              </div>
              {renderFieldError(errors.name)}
            </label>

            <label className={cls.authLabel}>
              <span className={cls.authLabelText}>Email address</span>
              <div className={`${cls.authInputWrap} ${errors.email ? cls.authInputWrapError : ""}`}>
                <i className={`bi bi-envelope ${cls.authInputIcon}`} />
                <input
                  className={cls.authInput}
                  type="email"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  placeholder="you@example.com"
                  autoComplete="email"
                  disabled={busy}
                  aria-invalid={!!errors.email}
                />
              </div>
              {renderFieldError(errors.email)}
            </label>

            <label className={cls.authLabel}>
              <span className={cls.authLabelText}>Password</span>
              <div className={`${cls.authInputWrap} ${errors.password ? cls.authInputWrapError : ""}`}>
                <i className={`bi bi-lock ${cls.authInputIcon}`} />
                <input
                  className={cls.authInput}
                  type={showRegisterPass ? "text" : "password"}
                  value={regPass}
                  onChange={(e) => {
                    setRegPass(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="Use at least 6 characters"
                  autoComplete="new-password"
                  disabled={busy}
                  aria-invalid={!!errors.password}
                />
                <button
                  className={cls.authEye}
                  type="button"
                  onClick={() => setShowRegisterPass((v) => !v)}
                  aria-label={showRegisterPass ? "Hide password" : "Show password"}
                  disabled={busy}
                >
                  <i className={`bi ${showRegisterPass ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
              {renderFieldError(errors.password)}
            </label>

            <label className={cls.authLabel}>
              <span className={cls.authLabelText}>Confirm password</span>
              <div className={`${cls.authInputWrap} ${errors.confirmPassword ? cls.authInputWrapError : ""}`}>
                <i className={`bi bi-shield-lock ${cls.authInputIcon}`} />
                <input
                  className={cls.authInput}
                  type={showConfirmPass ? "text" : "password"}
                  value={regConfirmPass}
                  onChange={(e) => {
                    setRegConfirmPass(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                    }
                  }}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  disabled={busy}
                  aria-invalid={!!errors.confirmPassword}
                />
                <button
                  className={cls.authEye}
                  type="button"
                  onClick={() => setShowConfirmPass((v) => !v)}
                  aria-label={showConfirmPass ? "Hide password" : "Show password"}
                  disabled={busy}
                >
                  <i className={`bi ${showConfirmPass ? "bi-eye-slash" : "bi-eye"}`} />
                </button>
              </div>
              {renderFieldError(errors.confirmPassword)}
            </label>

            <label className={cls.authRemember}>
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => {
                  setAcceptTerms(e.target.checked);
                  if (errors.terms) setErrors((prev) => ({ ...prev, terms: undefined }));
                }}
                disabled={busy}
              />
              <span>
                I agree to the{" "}
                <button type="button" className={cls.authInlineLink} disabled={busy}>
                  terms
                </button>{" "}
                and{" "}
                <button type="button" className={cls.authInlineLink} disabled={busy}>
                  privacy policy
                </button>
              </span>
            </label>
            {renderFieldError(errors.terms)}

            <div className={cls.authRow}>
              <button className={cls.authPrimary} type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <span className={cls.authSpinner} />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <i className="bi bi-person-plus" />
                    <span>Create account</span>
                  </>
                )}
              </button>

              <button
                className={cls.authGhost}
                type="button"
                onClick={() => {
                  clearMessages();
                  onModeChange("login");
                }}
                disabled={busy}
              >
                <span>I already have an account</span>
              </button>
            </div>

            <div className={cls.authDivider}>
              <span>Or register with</span>
            </div>

            <div className={cls.authSocials}>
              <button type="button" className={cls.authSocialBtn} aria-label="Register with Google" disabled={busy}>
                <i className="bi bi-google" />
                <span>Google</span>
              </button>

              <button type="button" className={cls.authSocialBtn} aria-label="Register with Facebook" disabled={busy}>
                <i className="bi bi-facebook" />
                <span>Facebook</span>
              </button>

              <button type="button" className={cls.authSocialBtn} aria-label="Register with Apple" disabled={busy}>
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
