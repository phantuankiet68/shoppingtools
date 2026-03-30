"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import type { Route } from "next";
import cls from "@/styles/templates/sections/Security/SecurityOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";
import AccountSidebar from "@/components/admin/shared/templates/components/AccountSidebar";

export type ChangePasswordSidebarItem = {
  icon: string;
  label: string;
  href: string;
  badge?: string;
  active?: boolean;
};

export type PasswordRuleItem = {
  id: string;
  label: string;
};

export type PasswordActivityItem = {
  id: string;
  icon: string;
  title: string;
  desc: string;
  time: string;
  tone?: "neutral" | "success" | "warning" | "danger";
};

export type ChangePasswordOneProps = {
  preview?: boolean;

  avatar?: string;
  customerName?: string;
  customerEmail?: string;
  customerEditHref?: string;
  customerRankText?: string;
  customerTagline?: string;

  sidebarItems?: ChangePasswordSidebarItem[];

  heroEyebrow?: string;
  heroTitle?: string;
  heroDesc?: string;
  announcementText?: string;

  formTitle?: string;
  formDesc?: string;

  currentPasswordLabel?: string;
  newPasswordLabel?: string;
  confirmPasswordLabel?: string;

  currentPasswordPlaceholder?: string;
  newPasswordPlaceholder?: string;
  confirmPasswordPlaceholder?: string;

  saveButtonText?: string;
  forgotPasswordText?: string;
  forgotPasswordHref?: string;

  passwordRules?: PasswordRuleItem[];
  activities?: PasswordActivityItem[];
};

const FALLBACK_AVATAR = "/assets/images/logo.jpg";

const DEFAULT_SIDEBAR: ChangePasswordSidebarItem[] = [
  { icon: "bi-bell", label: "Notifications", href: "/account/notification" },
  { icon: "bi-person", label: "My Account", href: "/account/profile" },
  { icon: "bi-shield-lock", label: "Security", href: "/account/security", active: true },
  { icon: "bi-key", label: "Change Password", href: "/account/security", active: true },
  { icon: "bi-box-arrow-right", label: "Login Activity", href: "/account/login-activity" },
];

const DEFAULT_RULES: PasswordRuleItem[] = [
  { id: "r1", label: "At least 8 characters" },
  { id: "r2", label: "Include at least 1 uppercase letter" },
  { id: "r3", label: "Include at least 1 number" },
  { id: "r4", label: "Include at least 1 special character" },
];

const DEFAULT_ACTIVITIES: PasswordActivityItem[] = [
  {
    id: "a1",
    icon: "bi-check-circle",
    title: "Password changed successfully",
    desc: "Your password was updated from your current device.",
    time: "Today • 09:24",
    tone: "success",
  },
  {
    id: "a2",
    icon: "bi-shield-exclamation",
    title: "New device requested password access",
    desc: "A new login required verification before access was granted.",
    time: "Yesterday • 21:02",
    tone: "warning",
  },
  {
    id: "a3",
    icon: "bi-clock-history",
    title: "Password last updated",
    desc: "Your last password update was recorded securely.",
    time: "24 days ago",
    tone: "neutral",
  },
];

function toneClass(tone?: "neutral" | "success" | "warning" | "danger") {
  switch (tone) {
    case "success":
      return cls.toneSuccess;
    case "warning":
      return cls.toneWarning;
    case "danger":
      return cls.toneDanger;
    default:
      return cls.toneNeutral;
  }
}

function SmartLink({
  preview,
  href,
  className,
  children,
}: {
  preview?: boolean;
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (preview) {
    return (
      <a
        href="#"
        className={className}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {children}
      </a>
    );
  }

  return (
    <Link href={href as Route} className={className}>
      {children}
    </Link>
  );
}

export function SecurityOne({
  preview = false,

  avatar = FALLBACK_AVATAR,
  customerName = "Security Customer",
  customerEmail = "tuankietity@gmail.com",
  customerEditHref = "/account/profile",
  customerRankText = "Protected Account",
  customerTagline = "Update your password regularly to keep your customer account protected.",

  sidebarItems = DEFAULT_SIDEBAR,

  heroEyebrow = "Change Password",
  heroTitle = "Create a stronger password for better account protection",
  heroDesc = "Use a unique password that you do not use elsewhere. A strong password helps keep your customer account safe.",
  announcementText = "For your safety, choose a strong password and avoid reusing old credentials.",

  formTitle = "Update Password",
  formDesc = "Enter your current password and create a new secure password below.",

  currentPasswordLabel = "Current Password",
  newPasswordLabel = "New Password",
  confirmPasswordLabel = "Confirm New Password",

  currentPasswordPlaceholder = "Enter current password",
  newPasswordPlaceholder = "Enter new password",
  confirmPasswordPlaceholder = "Confirm new password",

  saveButtonText = "Save New Password",
  forgotPasswordText = "Forgot your password?",
  forgotPasswordHref = "/forgot-password",

  passwordRules = DEFAULT_RULES,
  activities = DEFAULT_ACTIVITIES,
}: ChangePasswordOneProps) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const passwordStrength = useMemo(() => {
    let score = 0;

    if (newPassword.length >= 8) score++;
    if (/[A-Z]/.test(newPassword)) score++;
    if (/[0-9]/.test(newPassword)) score++;
    if (/[^A-Za-z0-9]/.test(newPassword)) score++;

    if (score <= 1) {
      return { label: "Weak", className: cls.strengthWeak, progress: "25%" };
    }
    if (score === 2 || score === 3) {
      return { label: "Medium", className: cls.strengthMedium, progress: "65%" };
    }

    return { label: "Strong", className: cls.strengthStrong, progress: "100%" };
  }, [newPassword]);

  const rulesChecked = useMemo(() => {
    return {
      length: newPassword.length >= 8,
      uppercase: /[A-Z]/.test(newPassword),
      number: /[0-9]/.test(newPassword),
      special: /[^A-Za-z0-9]/.test(newPassword),
      matched: !!newPassword && newPassword === confirmPassword,
    };
  }, [newPassword, confirmPassword]);

  return (
    <section className={cls.changePasswordOne}>
      <div className={cls.container}>
        <AccountSidebar
          preview={preview}
          avatar={avatar}
          customerName={customerName}
          customerEmail={customerEmail}
          customerEditHref={customerEditHref}
          customerRankText={customerRankText}
          customerTagline={customerTagline}
          sidebarItems={sidebarItems}
        />

        <div className={cls.main}>
          <div className={cls.contentGrid}>
            <section className={cls.formPanel}>
              <div className={cls.panelHead}>
                <span className={cls.panelEyebrow}>Credentials</span>
                <h2 className={cls.panelTitle}>{formTitle}</h2>
                <p className={cls.panelDesc}>{formDesc}</p>
              </div>

              <form className={cls.form}>
                <div className={cls.field}>
                  <label>{currentPasswordLabel}</label>
                  <div className={cls.inputWrap}>
                    <i className="bi bi-lock" />
                    <input
                      type="password"
                      placeholder={currentPasswordPlaceholder}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className={cls.field}>
                  <label>{newPasswordLabel}</label>
                  <div className={cls.inputWrap}>
                    <i className="bi bi-key" />
                    <input
                      type="password"
                      placeholder={newPasswordPlaceholder}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className={cls.strengthBox}>
                  <div className={cls.strengthTop}>
                    <span>Password strength</span>
                    <strong className={passwordStrength.className}>{passwordStrength.label}</strong>
                  </div>
                  <div className={cls.strengthBar}>
                    <span style={{ width: passwordStrength.progress }} className={passwordStrength.className} />
                  </div>
                </div>

                <div className={cls.field}>
                  <label>{confirmPasswordLabel}</label>
                  <div className={cls.inputWrap}>
                    <i className="bi bi-shield-check" />
                    <input
                      type="password"
                      placeholder={confirmPasswordPlaceholder}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div className={cls.formActions}>
                  <button type="submit" className={cls.primaryBtn}>
                    <i className="bi bi-check2-circle" />
                    <span>{saveButtonText}</span>
                  </button>

                  <SmartLink preview={preview} href={forgotPasswordHref} className={cls.inlineLink}>
                    {forgotPasswordText}
                  </SmartLink>
                </div>
              </form>
              <section className={cls.panel}>
                <div className={cls.panelHeadSm}>
                  <span className={cls.panelEyebrow}>Tips</span>
                  <h3 className={cls.panelTitleSm}>Security guidance</h3>
                </div>

                <div className={cls.tipList}>
                  <div className={cls.tipItem}>
                    <i className="bi bi-stars" />
                    <p>Avoid using personal info like your birthday or phone number.</p>
                  </div>
                  <div className={cls.tipItem}>
                    <i className="bi bi-fingerprint" />
                    <p>Use a password that is unique and not shared with other websites.</p>
                  </div>
                  <div className={cls.tipItem}>
                    <i className="bi bi-shield-lock" />
                    <p>Enable two-factor authentication for stronger protection.</p>
                  </div>
                </div>
              </section>
            </section>

            <div className={cls.sidePanels}>
              <section className={cls.panel}>
                <div className={cls.panelHeadSm}>
                  <span className={cls.panelEyebrow}>Requirements</span>
                  <h3 className={cls.panelTitleSm}>Password rules</h3>
                </div>

                <div className={cls.ruleList}>
                  <div className={cls.ruleItem}>
                    <i className={`bi ${rulesChecked.length ? "bi-check-circle-fill" : "bi-circle"}`} />
                    <span>{passwordRules[0]?.label || "At least 8 characters"}</span>
                  </div>
                  <div className={cls.ruleItem}>
                    <i className={`bi ${rulesChecked.uppercase ? "bi-check-circle-fill" : "bi-circle"}`} />
                    <span>{passwordRules[1]?.label || "Include at least 1 uppercase letter"}</span>
                  </div>
                  <div className={cls.ruleItem}>
                    <i className={`bi ${rulesChecked.number ? "bi-check-circle-fill" : "bi-circle"}`} />
                    <span>{passwordRules[2]?.label || "Include at least 1 number"}</span>
                  </div>
                  <div className={cls.ruleItem}>
                    <i className={`bi ${rulesChecked.special ? "bi-check-circle-fill" : "bi-circle"}`} />
                    <span>{passwordRules[3]?.label || "Include at least 1 special character"}</span>
                  </div>
                  <div className={cls.ruleItem}>
                    <i className={`bi ${rulesChecked.matched ? "bi-check-circle-fill" : "bi-circle"}`} />
                    <span>Confirmation password matches</span>
                  </div>
                </div>
              </section>

              <section className={cls.panel}>
                <div className={cls.panelHeadSm}>
                  <span className={cls.panelEyebrow}>History</span>
                  <h3 className={cls.panelTitleSm}>Recent activity</h3>
                </div>

                <div className={cls.activityList}>
                  {activities.map((item) => (
                    <article key={item.id} className={cls.activityItem}>
                      <span className={`${cls.activityIcon} ${toneClass(item.tone)}`}>
                        <i className={`bi ${item.icon}`} />
                      </span>
                      <div className={cls.activityContent}>
                        <h4>{item.title}</h4>
                        <p>{item.desc}</p>
                        <small>{item.time}</small>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const SHOP_SECURITY_ONE: RegItem = {
  kind: "SecurityOne",
  label: "Security One",
  defaults: {
    avatar: FALLBACK_AVATAR,
    customerName: "Security Customer",
    customerEmail: "tuankietity@gmail.com",
    customerEditHref: "/account/profile",
    customerRankText: "Protected Account",
    customerTagline: "Update your password regularly to keep your customer account protected.",

    heroEyebrow: "Change Password",
    heroTitle: "Create a stronger password for better account protection",
    heroDesc:
      "Use a unique password that you do not use elsewhere. A strong password helps keep your customer account safe.",
    announcementText: "For your safety, choose a strong password and avoid reusing old credentials.",

    formTitle: "Update Password",
    formDesc: "Enter your current password and create a new secure password below.",

    currentPasswordLabel: "Current Password",
    newPasswordLabel: "New Password",
    confirmPasswordLabel: "Confirm New Password",

    currentPasswordPlaceholder: "Enter current password",
    newPasswordPlaceholder: "Enter new password",
    confirmPasswordPlaceholder: "Confirm new password",

    saveButtonText: "Save New Password",
    forgotPasswordText: "Forgot your password?",
    forgotPasswordHref: "/forgot-password",
  },
  inspector: [
    { key: "avatar", label: "Avatar", kind: "text" },
    { key: "customerName", label: "Customer Name", kind: "text" },
    { key: "customerEmail", label: "Customer Email", kind: "text" },
    { key: "customerEditHref", label: "Customer Edit Href", kind: "text" },
    { key: "customerRankText", label: "Customer Rank Text", kind: "text" },
    { key: "customerTagline", label: "Customer Tagline", kind: "textarea", rows: 4 },

    { key: "heroEyebrow", label: "Hero Eyebrow", kind: "text" },
    { key: "heroTitle", label: "Hero Title", kind: "textarea", rows: 2 },
    { key: "heroDesc", label: "Hero Description", kind: "textarea", rows: 4 },
    { key: "announcementText", label: "Announcement Text", kind: "textarea", rows: 4 },

    { key: "formTitle", label: "Form Title", kind: "text" },
    { key: "formDesc", label: "Form Desc", kind: "textarea", rows: 3 },

    { key: "currentPasswordLabel", label: "Current Password Label", kind: "text" },
    { key: "newPasswordLabel", label: "New Password Label", kind: "text" },
    { key: "confirmPasswordLabel", label: "Confirm Password Label", kind: "text" },

    { key: "currentPasswordPlaceholder", label: "Current Password Placeholder", kind: "text" },
    { key: "newPasswordPlaceholder", label: "New Password Placeholder", kind: "text" },
    { key: "confirmPasswordPlaceholder", label: "Confirm Password Placeholder", kind: "text" },

    { key: "saveButtonText", label: "Save Button Text", kind: "text" },
    { key: "forgotPasswordText", label: "Forgot Password Text", kind: "text" },
    { key: "forgotPasswordHref", label: "Forgot Password Href", kind: "text" },
  ],
  render: (props) => {
    const data = props as Record<string, any>;

    return (
      <div aria-label="Shop Change Password One">
        <SecurityOne
          preview={Boolean(data.preview)}
          avatar={data.avatar}
          customerName={data.customerName}
          customerEmail={data.customerEmail}
          customerEditHref={data.customerEditHref}
          customerRankText={data.customerRankText}
          customerTagline={data.customerTagline}
          heroEyebrow={data.heroEyebrow}
          heroTitle={data.heroTitle}
          heroDesc={data.heroDesc}
          announcementText={data.announcementText}
          formTitle={data.formTitle}
          formDesc={data.formDesc}
          currentPasswordLabel={data.currentPasswordLabel}
          newPasswordLabel={data.newPasswordLabel}
          confirmPasswordLabel={data.confirmPasswordLabel}
          currentPasswordPlaceholder={data.currentPasswordPlaceholder}
          newPasswordPlaceholder={data.newPasswordPlaceholder}
          confirmPasswordPlaceholder={data.confirmPasswordPlaceholder}
          saveButtonText={data.saveButtonText}
          forgotPasswordText={data.forgotPasswordText}
          forgotPasswordHref={data.forgotPasswordHref}
        />
      </div>
    );
  },
};

export default SecurityOne;
