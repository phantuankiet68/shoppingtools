"use client";

import React, { useMemo, useState } from "react";
import cls from "@/styles/templates/sections/Profile/ProfileOne.module.css";
import type { RegItem } from "@/lib/ui-builder/types";
import AccountSidebar from "@/components/admin/shared/templates/components/AccountSidebar";

export type ProfileOneProps = {
  preview?: boolean;

  avatar?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  country?: string;
  accountType?: string;
  dateOfBirth?: string;
  gender?: string;
  website?: string;
  password?: string;
  biography?: string;

  facebook?: string;
  twitter?: string;
  skype?: string;
  linkedin?: string;

  emailNotification?: boolean;
  successMessage?: string;
  profilePictureLabel?: string;
  submitLabel?: string;
};

const FALLBACK_AVATAR = "/assets/images/logo.jpg";

const DEFAULT_SIDEBAR_ITEMS = [
  { icon: "bi-bell", label: "Notifications", href: "/account/notification" },
  { icon: "bi-person", label: "My Account", href: "/account/profile", active: true },
  { icon: "bi-receipt", label: "My Orders", href: "/account" },
  { icon: "bi-ticket-perforated", label: "My Vouchers", href: "/account/voucher" },
  { icon: "bi-shield-lock", label: "Security", href: "/account/security" },
];

export function ProfileOne({
  preview = false,
  avatar = FALLBACK_AVATAR,
  firstName = "Saim",
  lastName = "Ansari",
  email = "saim@example.com",
  phone = "+84 000 000 000",
  country = "Vietnam",
  accountType = "Premium Customer",
  dateOfBirth = "1998-08-20",
  gender = "Male",
  website = "https://yourwebsite.com",
  password = "",
  biography = "I enjoy discovering modern products, premium experiences, and managing my purchases in one seamless dashboard.",
  facebook = "",
  twitter = "",
  skype = "",
  linkedin = "",
  emailNotification = true,
  successMessage = "Your profile has been updated successfully.",
  profilePictureLabel = "Update photo",
  submitLabel = "Save Changes",
}: ProfileOneProps) {
  const [form, setForm] = useState({
    firstName,
    lastName,
    email,
    phone,
    country,
    accountType,
    dateOfBirth,
    gender,
    website,
    password,
    biography,
    facebook,
    twitter,
    skype,
    linkedin,
  });

  const [enabled, setEnabled] = useState(emailNotification);
  const [marketingEnabled, setMarketingEnabled] = useState(true);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const onChange = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const customerName = [form.firstName, form.lastName].filter(Boolean).join(" ").trim() || "Customer";
  const customerEmail = form.email || "customer@example.com";

  const completion = useMemo(() => {
    const values = [
      form.firstName,
      form.lastName,
      form.email,
      form.phone,
      form.country,
      form.accountType,
      form.dateOfBirth,
      form.gender,
      form.website,
      form.biography,
      form.facebook,
      form.twitter,
      form.linkedin,
    ];

    const filled = values.filter((item) => String(item || "").trim()).length;
    return Math.round((filled / values.length) * 100);
  }, [form]);

  const accountBadge = useMemo(() => {
    if ((form.accountType || "").toLowerCase().includes("premium")) return "Premium";
    if ((form.accountType || "").toLowerCase().includes("vip")) return "VIP";
    if ((form.accountType || "").toLowerCase().includes("business")) return "Business";
    return "Standard";
  }, [form.accountType]);

  const stats = useMemo(
    () => [
      {
        icon: "bi-patch-check",
        label: "Profile completion",
        value: `${completion}%`,
        meta: completion >= 80 ? "Excellent profile quality" : "Complete more information",
      },
      {
        icon: "bi-envelope-check",
        label: "Primary contact",
        value: enabled ? "Enabled" : "Muted",
        meta: enabled ? "Email notifications active" : "No update emails",
      },
      {
        icon: "bi-shield-lock",
        label: "Account security",
        value: twoFactorEnabled ? "Strong" : "Normal",
        meta: twoFactorEnabled ? "2FA is protecting account" : "Consider enabling 2FA",
      },
    ],
    [completion, enabled, twoFactorEnabled],
  );

  return (
    <section className={cls.profileOne}>
      <div className={cls.container}>
        <div className={cls.layout}>
          <AccountSidebar
            preview={preview}
            avatar={avatar}
            customerName={customerName}
            customerEmail={customerEmail}
            customerEditHref="/account/profile"
            customerRankText={form.accountType || "Customer"}
            customerTagline="Manage your profile, preferences, security and connected social accounts."
            sidebarItems={DEFAULT_SIDEBAR_ITEMS}
          />

          <div className={cls.main}>
            <div className={cls.contentGrid}>
              <div className={cls.primaryColumn}>
                <section className={cls.sectionCard}>
                  <div className={cls.sectionHead}>
                    <div>
                      <span className={cls.sectionEyebrow}>Personal Information</span>
                    </div>
                    <span className={cls.sectionHint}>Visible across your account</span>
                  </div>

                  <div className={cls.formGrid}>
                    <div className={cls.field}>
                      <label className={cls.label}>First name</label>
                      <div className={cls.inputWrap}>
                        <i className={`bi bi-person ${cls.inputIcon}`} />
                        <input
                          className={cls.input}
                          type="text"
                          placeholder="Enter first name"
                          value={form.firstName}
                          onChange={(e) => onChange("firstName", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={cls.field}>
                      <label className={cls.label}>Last name</label>
                      <div className={cls.inputWrap}>
                        <i className={`bi bi-person-vcard ${cls.inputIcon}`} />
                        <input
                          className={cls.input}
                          type="text"
                          placeholder="Enter last name"
                          value={form.lastName}
                          onChange={(e) => onChange("lastName", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={cls.field}>
                      <label className={cls.label}>Date of birth</label>
                      <div className={cls.inputWrap}>
                        <i className={`bi bi-calendar-event ${cls.inputIcon}`} />
                        <input
                          className={cls.input}
                          type="text"
                          placeholder="YYYY-MM-DD"
                          value={form.dateOfBirth}
                          onChange={(e) => onChange("dateOfBirth", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={cls.field}>
                      <label className={cls.label}>Gender</label>
                      <div className={cls.selectWrap}>
                        <i className={`bi bi-person-badge ${cls.inputIcon}`} />
                        <select
                          className={cls.select}
                          value={form.gender}
                          onChange={(e) => onChange("gender", e.target.value)}
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                        <i className={`bi bi-chevron-down ${cls.selectIcon}`} />
                      </div>
                    </div>
                  </div>
                </section>

                <section className={cls.sectionCard}>
                  <div className={cls.sectionHead}>
                    <div>
                      <span className={cls.sectionEyebrow}>Contact & Account</span>
                    </div>
                    <span className={cls.sectionHint}>Used for order updates and login</span>
                  </div>

                  <div className={cls.formGrid}>
                    <div className={cls.field}>
                      <label className={cls.label}>Email address</label>
                      <div className={cls.inputWrap}>
                        <i className={`bi bi-envelope ${cls.inputIcon}`} />
                        <input
                          className={cls.input}
                          type="email"
                          placeholder="Enter email"
                          value={form.email}
                          onChange={(e) => onChange("email", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={cls.field}>
                      <label className={cls.label}>Phone number</label>
                      <div className={cls.inputWrap}>
                        <i className={`bi bi-telephone ${cls.inputIcon}`} />
                        <input
                          className={cls.input}
                          type="text"
                          placeholder="Enter phone number"
                          value={form.phone}
                          onChange={(e) => onChange("phone", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={cls.field}>
                      <label className={cls.label}>Country</label>
                      <div className={cls.selectWrap}>
                        <i className={`bi bi-globe2 ${cls.inputIcon}`} />
                        <select
                          className={cls.select}
                          value={form.country}
                          onChange={(e) => onChange("country", e.target.value)}
                        >
                          <option value="">Select country</option>
                          <option value="Vietnam">Vietnam</option>
                          <option value="Thailand">Thailand</option>
                          <option value="Singapore">Singapore</option>
                          <option value="Malaysia">Malaysia</option>
                          <option value="Indonesia">Indonesia</option>
                        </select>
                        <i className={`bi bi-chevron-down ${cls.selectIcon}`} />
                      </div>
                    </div>

                    <div className={cls.field}>
                      <label className={cls.label}>Account type</label>
                      <div className={cls.selectWrap}>
                        <i className={`bi bi-award ${cls.inputIcon}`} />
                        <select
                          className={cls.select}
                          value={form.accountType}
                          onChange={(e) => onChange("accountType", e.target.value)}
                        >
                          <option value="">Select account type</option>
                          <option value="Customer">Customer</option>
                          <option value="Premium Customer">Premium Customer</option>
                          <option value="VIP Customer">VIP Customer</option>
                          <option value="Business">Business</option>
                        </select>
                        <i className={`bi bi-chevron-down ${cls.selectIcon}`} />
                      </div>
                    </div>

                    <div className={`${cls.field} ${cls.fieldFull}`}>
                      <label className={cls.label}>Website</label>
                      <div className={cls.inputWrap}>
                        <i className={`bi bi-link-45deg ${cls.inputIcon}`} />
                        <input
                          className={cls.input}
                          type="text"
                          placeholder="https://yourwebsite.com"
                          value={form.website}
                          onChange={(e) => onChange("website", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                <section className={cls.sectionCard}>
                  <div className={cls.sectionHead}>
                    <div>
                      <span className={cls.sectionEyebrow}>About You</span>
                    </div>
                    <span className={cls.sectionHint}>Tell people more about your preferences</span>
                  </div>

                  <div className={cls.textareaWrap}>
                    <textarea
                      className={cls.textarea}
                      placeholder="Write a short, meaningful biography..."
                      value={form.biography}
                      onChange={(e) => onChange("biography", e.target.value)}
                      rows={7}
                    />
                  </div>
                </section>

                <section className={cls.sectionCard}>
                  <div className={cls.sectionHead}>
                    <div>
                      <span className={cls.sectionEyebrow}>Social Links</span>
                    </div>
                    <span className={cls.sectionHint}>Optional but useful for credibility</span>
                  </div>

                  <div className={cls.formGrid}>
                    <div className={cls.field}>
                      <label className={cls.label}>Facebook</label>
                      <div className={cls.inputWrap}>
                        <i className={`bi bi-facebook ${cls.inputIcon}`} />
                        <input
                          className={cls.input}
                          type="text"
                          placeholder="Facebook profile"
                          value={form.facebook}
                          onChange={(e) => onChange("facebook", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={cls.field}>
                      <label className={cls.label}>Twitter / X</label>
                      <div className={cls.inputWrap}>
                        <i className={`bi bi-twitter-x ${cls.inputIcon}`} />
                        <input
                          className={cls.input}
                          type="text"
                          placeholder="Twitter profile"
                          value={form.twitter}
                          onChange={(e) => onChange("twitter", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={cls.field}>
                      <label className={cls.label}>Skype</label>
                      <div className={cls.inputWrap}>
                        <i className={`bi bi-skype ${cls.inputIcon}`} />
                        <input
                          className={cls.input}
                          type="text"
                          placeholder="Skype account"
                          value={form.skype}
                          onChange={(e) => onChange("skype", e.target.value)}
                        />
                      </div>
                    </div>

                    <div className={cls.field}>
                      <label className={cls.label}>LinkedIn</label>
                      <div className={cls.inputWrap}>
                        <i className={`bi bi-linkedin ${cls.inputIcon}`} />
                        <input
                          className={cls.input}
                          type="text"
                          placeholder="LinkedIn profile"
                          value={form.linkedin}
                          onChange={(e) => onChange("linkedin", e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </section>
              </div>

              <aside className={cls.sideColumn}>
                <section className={cls.sideCard}>
                  <div className={cls.sideHead}>
                    <h3 className={cls.sideTitle}>Preferences</h3>
                    <p className={cls.sideText}>Control how you receive updates and offers.</p>
                  </div>

                  <div className={cls.toggleList}>
                    <label className={cls.toggleItem}>
                      <div className={cls.toggleText}>
                        <strong>Email notifications</strong>
                        <span>Receive account, order and activity updates</span>
                      </div>
                      <button
                        type="button"
                        className={`${cls.toggle} ${enabled ? cls.toggleActive : ""}`}
                        onClick={() => setEnabled((prev) => !prev)}
                        aria-pressed={enabled}
                      >
                        <span className={cls.toggleThumb} />
                      </button>
                    </label>

                    <label className={cls.toggleItem}>
                      <div className={cls.toggleText}>
                        <strong>Marketing emails</strong>
                        <span>Get exclusive offers, recommendations and campaigns</span>
                      </div>
                      <button
                        type="button"
                        className={`${cls.toggle} ${marketingEnabled ? cls.toggleActive : ""}`}
                        onClick={() => setMarketingEnabled((prev) => !prev)}
                        aria-pressed={marketingEnabled}
                      >
                        <span className={cls.toggleThumb} />
                      </button>
                    </label>
                  </div>
                </section>

                <section className={cls.sideCard}>
                  <div className={cls.sideHead}>
                    <h3 className={cls.sideTitle}>Security</h3>
                    <p className={cls.sideText}>Improve access protection for your customer account.</p>
                  </div>

                  <div className={cls.field}>
                    <label className={cls.label}>New password</label>
                    <div className={cls.inputWrap}>
                      <i className={`bi bi-lock ${cls.inputIcon}`} />
                      <input
                        className={cls.input}
                        type={preview ? "text" : "password"}
                        placeholder="Enter new password"
                        value={form.password}
                        onChange={(e) => onChange("password", e.target.value)}
                      />
                    </div>
                  </div>

                  <label className={cls.toggleItem}>
                    <div className={cls.toggleText}>
                      <strong>Two-factor authentication</strong>
                      <span>Add an extra layer of account protection</span>
                    </div>
                    <button
                      type="button"
                      className={`${cls.toggle} ${twoFactorEnabled ? cls.toggleActive : ""}`}
                      onClick={() => setTwoFactorEnabled((prev) => !prev)}
                      aria-pressed={twoFactorEnabled}
                    >
                      <span className={cls.toggleThumb} />
                    </button>
                  </label>
                </section>

                <section className={cls.sideCard}>
                  <div className={cls.sideHead}>
                    <h3 className={cls.sideTitle}>Quick summary</h3>
                    <p className={cls.sideText}>A concise overview of the current customer profile.</p>
                  </div>

                  <div className={cls.summaryList}>
                    <div className={cls.summaryRow}>
                      <span>Status</span>
                      <strong className={cls.summaryAccent}>Active</strong>
                    </div>
                    <div className={cls.summaryRow}>
                      <span>Plan</span>
                      <strong>{accountBadge}</strong>
                    </div>
                    <div className={cls.summaryRow}>
                      <span>Country</span>
                      <strong>{form.country || "Not set"}</strong>
                    </div>
                    <div className={cls.summaryRow}>
                      <span>Website</span>
                      <strong>{form.website || "Not added"}</strong>
                    </div>
                  </div>
                </section>
              </aside>
            </div>

            <div className={cls.actionBar}>
              <div className={cls.actionNote}>
                <i className="bi bi-check2-circle" />
                <span>{successMessage}</span>
              </div>

              <div className={cls.actionBtns}>
                <button
                  type="button"
                  className={cls.lightBtn}
                  onClick={() =>
                    setForm({
                      firstName,
                      lastName,
                      email,
                      phone,
                      country,
                      accountType,
                      dateOfBirth,
                      gender,
                      website,
                      password,
                      biography,
                      facebook,
                      twitter,
                      skype,
                      linkedin,
                    })
                  }
                >
                  Reset
                </button>

                <button type="button" className={cls.submitBtn}>
                  <i className="bi bi-floppy" />
                  <span>{submitLabel}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const SHOP_PROFILE_ONE: RegItem = {
  kind: "ProfileOne",
  label: "Profile One",
  defaults: {
    avatar: FALLBACK_AVATAR,
    firstName: "Saim",
    lastName: "Ansari",
    email: "saim@example.com",
    phone: "+84 000 000 000",
    country: "Vietnam",
    accountType: "Premium Customer",
    dateOfBirth: "1998-08-20",
    gender: "Male",
    website: "https://yourwebsite.com",
    password: "",
    biography:
      "I enjoy discovering modern products, premium experiences, and managing my purchases in one seamless dashboard.",
    facebook: "",
    twitter: "",
    skype: "",
    linkedin: "",
    emailNotification: true,
    successMessage: "Your profile has been updated successfully.",
    profilePictureLabel: "Update photo",
    submitLabel: "Save Changes",
  },
  inspector: [
    { key: "avatar", label: "Avatar", kind: "text" },
    { key: "firstName", label: "First Name", kind: "text" },
    { key: "lastName", label: "Last Name", kind: "text" },
    { key: "email", label: "Email", kind: "text" },
    { key: "phone", label: "Phone", kind: "text" },
    { key: "country", label: "Country", kind: "text" },
    { key: "accountType", label: "Account Type", kind: "text" },
    { key: "dateOfBirth", label: "Date of Birth", kind: "text" },
    { key: "gender", label: "Gender", kind: "text" },
    { key: "website", label: "Website", kind: "text" },
    { key: "password", label: "Password", kind: "text" },
    { key: "biography", label: "Biography", kind: "textarea", rows: 5 },
    { key: "facebook", label: "Facebook", kind: "text" },
    { key: "twitter", label: "Twitter", kind: "text" },
    { key: "skype", label: "Skype", kind: "text" },
    { key: "linkedin", label: "LinkedIn", kind: "text" },
    { key: "successMessage", label: "Success Message", kind: "text" },
    { key: "profilePictureLabel", label: "Picture Label", kind: "text" },
    { key: "submitLabel", label: "Submit Label", kind: "text" },
  ],
  render: (props) => {
    const data = props as Record<string, any>;

    return (
      <div aria-label="Profile One">
        <ProfileOne
          preview={Boolean(data.preview)}
          avatar={data.avatar}
          firstName={data.firstName}
          lastName={data.lastName}
          email={data.email}
          phone={data.phone}
          country={data.country}
          accountType={data.accountType}
          dateOfBirth={data.dateOfBirth}
          gender={data.gender}
          website={data.website}
          password={data.password}
          biography={data.biography}
          facebook={data.facebook}
          twitter={data.twitter}
          skype={data.skype}
          linkedin={data.linkedin}
          emailNotification={Boolean(data.emailNotification ?? true)}
          successMessage={data.successMessage}
          profilePictureLabel={data.profilePictureLabel}
          submitLabel={data.submitLabel}
        />
      </div>
    );
  },
};

export default ProfileOne;
