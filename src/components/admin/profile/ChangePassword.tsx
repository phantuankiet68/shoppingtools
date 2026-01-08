"use client";

import { useMemo, useState, useEffect } from "react";
import styles from "@/styles/admin/profile/ChangePassword.module.css";
import { changePassword } from "@/services/adminUser.service";
import { getAdminProfile } from "@/services/profile/getProfile.service";

type Account = {
  email: string;
  username: string;
  role: "Admin" | "Staff" | "Viewer";
  status: "Active" | "Suspended";
  twoFA: boolean;
  lastLogin: string;
  lastIP: string;
  device: string;
  location: string;
};

type FormState = {
  email: string;
  confirmEmail: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  agree: boolean;
  signOutAll: boolean;
};

function validatePassword(pw: string) {
  const atLeast8 = pw.length >= 8;
  const upper = /[A-Z]/.test(pw);
  const lower = /[a-z]/.test(pw);
  const number = /[0-9]/.test(pw);
  const special = /[^A-Za-z0-9]/.test(pw);

  return {
    atLeast8,
    upper,
    lower,
    number,
    special,
    all: atLeast8 && upper && lower && number && special,
  };
}

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score += 25;
  if (pw.length >= 12) score += 10;
  if (/[A-Z]/.test(pw)) score += 15;
  if (/[a-z]/.test(pw)) score += 15;
  if (/[0-9]/.test(pw)) score += 15;
  if (/[^A-Za-z0-9]/.test(pw)) score += 20;
  return Math.min(100, score);
}

function cx(...arr: Array<string | false | undefined | null>) {
  return arr.filter(Boolean).join(" ");
}

function fmt(dt?: string | Date | null) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("vi-VN", { hour12: false });
}

export default function ChangePasswordPro() {
  const [account, setAccount] = useState<Account | null>(null);

  const [form, setForm] = useState<FormState>({
    email: "",
    confirmEmail: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    agree: false,
    signOutAll: true,
  });

  const [show, setShow] = useState({ cur: false, next: false, confirm: false });

  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  const rules = useMemo(() => validatePassword(form.newPassword), [form.newPassword]);
  const strength = useMemo(() => passwordStrength(form.newPassword), [form.newPassword]);

  const matchesConfirm = form.newPassword.length > 0 && form.newPassword === form.confirmPassword;

  const emailConfirmed = form.confirmEmail.trim().length > 0 && form.confirmEmail.trim().toLowerCase() === form.email.toLowerCase();

  // ✅ thêm điều kiện account đã load
  const canSubmit = !!account && form.currentPassword.length > 0 && rules.all && matchesConfirm && form.agree && emailConfirmed && status.type !== "loading";

  const update =
    <K extends keyof FormState>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = key === "agree" || key === "signOutAll" ? (e.target as HTMLInputElement).checked : e.target.value;

      setForm((p) => ({ ...p, [key]: value as FormState[K] }));
      if (status.type !== "idle") setStatus({ type: "idle" });
    };

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await getAdminProfile();
        if (!res.ok) {
          if (!alive) return;

          if (res.status === 401) {
            setStatus({ type: "error", message: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại." });
          } else {
            setStatus({ type: "error", message: "Không thể tải thông tin tài khoản." });
          }
          return;
        }

        const data = await res.json();

        if (!alive) return;

        const nextAccount: Account = {
          email: data?.user?.email ?? "",
          username: data?.profile?.username ?? "—",
          role: data?.profile?.role === "admin" ? "Admin" : data?.profile?.role === "staff" ? "Staff" : "Viewer",
          status: data?.profile?.status === "active" ? "Active" : "Suspended",
          twoFA: Boolean(data?.profile?.twoFA),
          lastLogin: fmt(data?.profile?.lastLoginAt ?? null),
          lastIP: data?.profile?.lastLoginIp ?? "—",
          device: data?.session?.userAgent ?? "—",
          location: data?.session?.country ?? "—",
        };

        setAccount(nextAccount);

        setForm((p) => ({
          ...p,
          email: nextAccount.email,
        }));
      } catch {
        if (!alive) return;
        setStatus({ type: "error", message: "Có lỗi mạng khi tải dữ liệu." });
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!canSubmit) {
      setStatus({
        type: "error",
        message: "Vui lòng hoàn tất xác nhận email, policy mật khẩu và checkbox đồng ý.",
      });
      return;
    }

    setStatus({ type: "loading", message: "Đang đổi mật khẩu..." });

    try {
      await changePassword({
        confirmEmail: form.confirmEmail,
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
        signOutAll: form.signOutAll,
      });

      setForm((p) => ({
        ...p,
        confirmEmail: "",
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        agree: false,
        signOutAll: true,
      }));

      setStatus({ type: "success", message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại." });
    } catch (err: any) {
      setStatus({ type: "error", message: err?.message ?? "Có lỗi xảy ra. Vui lòng thử lại." });
    }
  }
  if (!account) {
    return (
      <div className={styles.page}>
        <div className={styles.shell}>
          <div className={styles.panel} style={{ width: "100%" }}>
            <div className={styles.panelTitle}>Loading…</div>
            <div className={styles.formSub}>Đang tải thông tin tài khoản.</div>

            {status.type === "error" ? (
              <div className={cx(styles.alert, styles.alertErr)}>
                <i className="bi bi-exclamation-triangle" />
                <span>{status.message}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        {/* LEFT: info + policy */}
        <aside className={styles.left}>
          <div className={styles.header}>
            <h1 className={styles.title}>Change Password</h1>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>Security context</div>

            <div className={styles.kv}>
              <div className={styles.k}>
                <i className="bi bi-lock" /> 2FA
              </div>
              <div className={styles.v}>
                <span className={cx(styles.pill, account.twoFA ? styles.pillOk : styles.pillWarn)}>{account.twoFA ? "Enabled" : "Disabled"}</span>
              </div>
            </div>

            <div className={styles.kv}>
              <div className={styles.k}>
                <i className="bi bi-router" /> Last IP
              </div>
              <div className={styles.v}>{account.lastIP}</div>
            </div>

            <div className={styles.kv}>
              <div className={styles.k}>
                <i className="bi bi-laptop" /> Device
              </div>
              <div className={styles.v}>{account.device}</div>
            </div>

            <div className={styles.kv}>
              <div className={styles.k}>
                <i className="bi bi-geo-alt" /> Location
              </div>
              <div className={styles.v}>{account.location}</div>
            </div>

            <button className={styles.outlineBtn} type="button">
              <i className="bi bi-shield-exclamation" />
              Review active sessions
            </button>
          </div>

          <div className={styles.panel}>
            <div className={styles.panelTitle}>Password policy</div>

            <ul className={styles.rules}>
              <Rule ok={rules.atLeast8} text="At least 8 characters" />
              <Rule ok={rules.upper} text="At least 1 upper-case letter (A–Z)" />
              <Rule ok={rules.lower} text="At least 1 lower-case letter (a–z)" />
              <Rule ok={rules.number} text="At least 1 number (0–9)" />
              <Rule ok={rules.special} text="At least 1 special character (!@#$…)" />
              <Rule ok={matchesConfirm} text="New password matches confirmation" />
            </ul>

            <div className={styles.strength}>
              <div className={styles.strTop}>
                <span className={styles.muted}>Strength</span>
                <span className={styles.strong}>{strength}/100</span>
              </div>
              <div className={styles.bar}>
                <div className={styles.barFill} style={{ width: `${strength}%` }} />
              </div>
              <div className={styles.smallNote}>Tip: Use a long passphrase + special chars. Avoid reusing old passwords.</div>
            </div>
          </div>
        </aside>

        {/* RIGHT: form */}
        <section className={styles.right}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.formTitle}>Confirm change</div>
            <div className={styles.formSub}>For safety, please confirm your email and provide your current password.</div>

            <Field label="Account Email (read-only)">
              <div className={styles.inputWrap}>
                <i className={`bi bi-envelope ${styles.leftIcon}`} />
                <input className={styles.input} value={form.email} readOnly />
                <i className={`bi bi-check-lg ${styles.okIcon}`} />
              </div>
            </Field>

            <Field label="Type your email to confirm">
              <div className={styles.inputWrap}>
                <i className={`bi bi-pencil ${styles.leftIcon}`} />
                <input className={styles.input} value={form.confirmEmail} onChange={update("confirmEmail")} placeholder="Enter your email again" autoComplete="email" />
                <i className={`bi ${emailConfirmed ? "bi-check-lg" : "bi-x-lg"} ${emailConfirmed ? styles.okIcon : styles.badIcon}`} />
              </div>
            </Field>

            <Divider />

            <Field label="Current Password">
              <PasswordInput
                value={form.currentPassword}
                onChange={update("currentPassword")}
                show={show.cur}
                onToggle={() => setShow((p) => ({ ...p, cur: !p.cur }))}
                ok={form.currentPassword.length > 0}
              />
            </Field>

            <Field label="New Password">
              <PasswordInput value={form.newPassword} onChange={update("newPassword")} show={show.next} onToggle={() => setShow((p) => ({ ...p, next: !p.next }))} ok={rules.all} />
            </Field>

            <Field label="Confirm New Password">
              <PasswordInput
                value={form.confirmPassword}
                onChange={update("confirmPassword")}
                show={show.confirm}
                onToggle={() => setShow((p) => ({ ...p, confirm: !p.confirm }))}
                ok={matchesConfirm}
              />
            </Field>

            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={form.signOutAll} onChange={update("signOutAll")} />
              <span>Sign out of all other devices after changing password</span>
            </label>

            <label className={styles.checkboxRow}>
              <input type="checkbox" checked={form.agree} onChange={update("agree")} />
              <span>I understand this action is irreversible and I agree to change my password.</span>
            </label>

            {status.type !== "idle" && (
              <div className={cx(styles.alert, status.type === "success" && styles.alertOk, status.type === "error" && styles.alertErr, status.type === "loading" && styles.alertInfo)}>
                <i className={`bi ${status.type === "loading" ? "bi-arrow-repeat" : status.type === "success" ? "bi-check-circle" : "bi-exclamation-triangle"}`} />
                <span>{status.message}</span>
              </div>
            )}

            <button className={styles.saveBtn} type="submit" disabled={!canSubmit}>
              {status.type === "loading" ? "SAVING..." : "SAVE"}
            </button>

            <button
              className={styles.cancelBtn}
              type="button"
              onClick={() => {
                setForm((p) => ({
                  ...p,
                  confirmEmail: "",
                  currentPassword: "",
                  newPassword: "",
                  confirmPassword: "",
                  agree: false,
                  signOutAll: true,
                }));
                setStatus({ type: "idle" });
              }}>
              Cancel
            </button>

            <div className={styles.footerNote}>Having trouble? Contact your administrator or reset via email verification.</div>
          </form>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={styles.field}>
      <div className={styles.label}>{label}</div>
      {children}
    </label>
  );
}

function Rule({ ok, text }: { ok: boolean; text: string }) {
  return (
    <li className={styles.rule}>
      <i className={`bi ${ok ? "bi-check2" : "bi-circle"} ${ok ? styles.ruleOk : styles.ruleOff}`} />
      <span className={ok ? styles.ruleOkText : styles.ruleOffText}>{text}</span>
    </li>
  );
}

function Divider() {
  return <div className={styles.divider} />;
}

function PasswordInput({ value, onChange, show, onToggle, ok }: { value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; show: boolean; onToggle: () => void; ok: boolean }) {
  return (
    <div className={styles.inputWrap}>
      <i className={`bi bi-lock ${styles.leftIcon}`} />

      <input className={styles.input} value={value} onChange={onChange} type={show ? "text" : "password"} placeholder="••••••••" autoComplete="off" />

      <button className={styles.eyeBtn} type="button" onClick={onToggle} aria-label="Toggle password">
        <i className={`bi ${show ? "bi-eye-slash" : "bi-eye"}`} />
      </button>

      <i className={`bi ${ok ? "bi-check-lg" : "bi-x-lg"} ${ok ? styles.okIcon : styles.badIcon}`} />
    </div>
  );
}
