"use client";

import { useMemo, useState, useEffect } from "react";
import styles from "@/styles/admin/profile/ProfileForm.module.css";
import { validateProfileInput } from "@/lib/validators/profile";

type Payment = {
  id: string;
  brand: "visa" | "mastercard";
  last4: string;
  expires: string;
  holder: string;
  isDefault?: boolean;
};

type Profile = {
  firstName: string;
  lastName: string;
  username: string;

  // email thuộc User, mình vẫn giữ để render input
  email: string;

  backupEmail: string;
  phone: string;
  address: string;
  city: string;
  country: string;

  role: "admin" | "staff" | "viewer";
  status: "active" | "suspended";

  company: string;
  department: string;
  jobTitle: string;
  manager: string;
  hireDate: string; // YYYY-MM-DD

  gender: "male" | "female" | "other";
  locale: "en" | "vi" | "ja";
  timezone: string;

  dobMonth: string;
  dobDay: string;
  dobYear: string;

  twitter: string;
  linkedin: string;
  facebook: string;
  github: string;
  website: string;

  slogan: string;
  bio: string;

  twoFA: boolean;

  // display-only
  lastLogin: string;
  lastIP: string;
};

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function cx(...arr: Array<string | false | undefined | null>) {
  return arr.filter(Boolean).join(" ");
}

function normalizeIp(ip?: string | null) {
  if (!ip) return "";
  return ip.startsWith("::ffff:") ? ip.replace("::ffff:", "") : ip;
}

function fmt(dt?: string | null) {
  if (!dt) return "—";
  const d = new Date(dt);
  if (Number.isNaN(d.getTime())) return dt; // fallback nếu dt là string đã format sẵn
  return d.toLocaleString("vi-VN", { hour12: false });
}

const EMPTY: Profile = {
  firstName: "",
  lastName: "",
  username: "",
  email: "",

  backupEmail: "",
  phone: "",
  address: "",
  city: "",
  country: "",

  role: "viewer",
  status: "active",

  company: "",
  department: "",
  jobTitle: "",
  manager: "",
  hireDate: "",

  gender: "other",
  locale: "vi",
  timezone: "Asia/Ho_Chi_Minh",

  dobMonth: "",
  dobDay: "",
  dobYear: "",

  twitter: "",
  linkedin: "",
  facebook: "",
  github: "",
  website: "",

  slogan: "",
  bio: "",

  twoFA: false,
  lastLogin: "—",
  lastIP: "",
};

export default function ProfileForm() {
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof Profile, string>>>({});

  const [profile, setProfile] = useState<Profile>(EMPTY);

  const [payments, setPayments] = useState<Payment[]>([
    { id: "p1", brand: "visa", last4: "8314", expires: "06/24", holder: "Arthur Nancy", isDefault: true },
    { id: "p2", brand: "mastercard", last4: "4452", expires: "11/26", holder: "Arthur Nancy" },
  ]);
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/profile", { cache: "no-store" });
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();

        const user = data.user;
        const p = user?.profile ?? null;

        setProfile((prev) => ({
          ...prev,
          email: user?.email ?? prev.email,

          firstName: p?.firstName ?? prev.firstName,
          lastName: p?.lastName ?? prev.lastName,
          username: p?.username ?? prev.username,

          backupEmail: p?.backupEmail ?? prev.backupEmail,
          phone: p?.phone ?? prev.phone,
          address: p?.address ?? prev.address,
          city: p?.city ?? prev.city,
          country: p?.country ?? prev.country,

          role: (p?.role ?? prev.role) as Profile["role"],
          status: (p?.status ?? prev.status) as Profile["status"],

          company: p?.company ?? prev.company,
          department: p?.department ?? prev.department,
          jobTitle: p?.jobTitle ?? prev.jobTitle,
          manager: p?.manager ?? prev.manager,
          hireDate: p?.hireDate ? String(p.hireDate).slice(0, 10) : prev.hireDate,

          gender: (p?.gender ?? prev.gender) as Profile["gender"],
          locale: (p?.locale ?? prev.locale) as Profile["locale"],
          timezone: p?.timezone ?? prev.timezone,

          dobMonth: p?.dobMonth ?? prev.dobMonth,
          dobDay: p?.dobDay ? String(p.dobDay) : prev.dobDay,
          dobYear: p?.dobYear ? String(p.dobYear) : prev.dobYear,

          twitter: p?.twitter ?? prev.twitter,
          linkedin: p?.linkedin ?? prev.linkedin,
          facebook: p?.facebook ?? prev.facebook,
          github: p?.github ?? prev.github,
          website: p?.website ?? prev.website,

          slogan: p?.slogan ?? prev.slogan,
          bio: p?.bio ?? prev.bio,

          twoFA: typeof p?.twoFA === "boolean" ? p.twoFA : prev.twoFA,

          lastLogin: fmt(p?.lastLoginAt ?? null),
          lastIP: p?.lastLoginIp ?? prev.lastIP,
        }));

        setLoading(false);
      } catch {
        setLoading(false);
      }
    })();
  }, []);

  // Lấy IP hiện tại (session ip) để show ở UI (không phải last login ip)
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/me/get-client-ip", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const ip = normalizeIp(data.ip);

        setProfile((prev) => ({ ...prev, lastIP: ip || prev.lastIP }));
      } catch {}
    })();
  }, []);

  const initials = useMemo(() => {
    const a = profile.firstName?.[0] ?? "";
    const b = profile.lastName?.[0] ?? "";
    return (a + b).toUpperCase();
  }, [profile.firstName, profile.lastName]);

  const onChange =
    <K extends keyof Profile>(key: K) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setProfile((p) => ({ ...p, [key]: e.target.value as Profile[K] }));
    };

  const toggle2FA = () => setProfile((p) => ({ ...p, twoFA: !p.twoFA }));
  const removePayment = (id: string) => setPayments((p) => p.filter((x) => x.id !== id));
  const setDefaultPayment = (id: string) => setPayments((p) => p.map((x) => ({ ...x, isDefault: x.id === id })));

  const onSave = async () => {
    // ✅ 1) Validate client trước khi gọi API
    const v = validateProfileInput({
      firstName: profile.firstName,
      lastName: profile.lastName,
      username: profile.username,
      role: profile.role,
      status: profile.status,
      email: profile.email, // Email (User) bắt buộc theo yêu cầu của bạn
      backupEmail: profile.backupEmail,
      phone: profile.phone,
      address: profile.address,
    });

    if (v.length > 0) {
      const map: Record<string, string> = {};
      for (const e of v) map[e.field] = e.message;
      setErrors(map);
      // optional: alert gọn
      alert(Object.values(map).join("\n"));
      return;
    }

    setErrors({});
    setBusy(true);

    try {
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        username: profile.username,

        // ⚠️ email thuộc User nên thường không update ở profile API,
        // nhưng bạn yêu cầu validate bắt buộc, nên vẫn gửi lên để server check nếu bạn muốn.
        email: profile.email,

        backupEmail: profile.backupEmail,
        phone: profile.phone,
        address: profile.address,
        city: profile.city,
        country: profile.country,

        role: profile.role,
        status: profile.status,

        company: profile.company,
        department: profile.department,
        jobTitle: profile.jobTitle,
        manager: profile.manager,
        hireDate: profile.hireDate || null,

        gender: profile.gender,
        locale: profile.locale,
        timezone: profile.timezone,

        dobMonth: profile.dobMonth,
        dobDay: profile.dobDay ? Number(profile.dobDay) : null,
        dobYear: profile.dobYear ? Number(profile.dobYear) : null,

        twitter: profile.twitter,
        linkedin: profile.linkedin,
        facebook: profile.facebook,
        github: profile.github,
        website: profile.website,

        slogan: profile.slogan,
        bio: profile.bio,

        twoFA: profile.twoFA,
      };

      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (data?.error === "VALIDATION_ERROR" && Array.isArray(data.errors)) {
          const map: Record<string, string> = {};
          for (const e of data.errors) map[e.field] = e.message;
          setErrors(map);
          alert(Object.values(map).join("\n"));
          return;
        }

        alert(data?.error || "Save failed");
        return;
      }

      setProfile((prev) => ({
        ...prev,
        lastLogin: fmt(data?.profile?.lastLoginAt ?? null),
        lastIP: data?.profile?.lastLoginIp ?? prev.lastIP,
      }));

      alert("Saved ✅");
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return <div className={styles.wrap}>Loading profile…</div>;
  }

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.topBar}>
        <div>
          <div className={styles.topTitle}>Profile Settings</div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.linkBtn} type="button" disabled={busy}>
            Cancel
          </button>
          <button className={styles.iconBtn} type="button" aria-label="Close" disabled={busy}>
            <i className="bi bi-x-lg" />
          </button>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.grid}>
          {/* LEFT */}
          <section className={styles.left}>
            <div className={styles.twoCols}>
              <Field label="First Name">
                <input
                  className={styles.input}
                  value={profile.firstName}
                  onChange={(e) => {
                    onChange("firstName")(e);
                    setErrors((m) => ({ ...m, firstName: "" }));
                  }}
                />
                {errors.firstName ? <div className={styles.errorText}>{errors.firstName}</div> : null}
              </Field>
              <Field label="Last Name">
                <input
                  className={styles.input}
                  value={profile.lastName}
                  onChange={(e) => {
                    onChange("lastName")(e);
                    setErrors((m) => ({ ...m, lastName: "" }));
                  }}
                />
                {errors.lastName ? <div className={styles.errorText}>{errors.lastName}</div> : null}
              </Field>
            </div>

            <div className={styles.twoCols}>
              <Field label="Username">
                <div className={styles.inputIcon}>
                  <span className={styles.prefix}>@</span>
                  <input
                    className={styles.inputBare}
                    value={profile.username}
                    onChange={(e) => {
                      onChange("username")(e);
                      setErrors((m) => ({ ...m, username: "" }));
                    }}
                  />
                  {errors.username ? <div className={styles.errorText}>{errors.username}</div> : null}
                </div>
              </Field>

              <Field label="Role">
                <select className={styles.input} value={profile.role} onChange={onChange("role")}>
                  <option value="admin">Admin</option>
                  <option value="staff">Staff</option>
                  <option value="viewer">Viewer</option>
                </select>
              </Field>
            </div>

            <div className={styles.twoCols}>
              <Field label="Account Status">
                <select className={styles.input} value={profile.status} onChange={onChange("status")}>
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </Field>

              <Field label="Timezone">
                <input className={styles.input} value={profile.timezone} onChange={onChange("timezone")} />
              </Field>
            </div>

            <div className={styles.blockTitle}>Contact</div>

            <Field label="Email (User)">
              <input className={styles.input} value={profile.email} readOnly />
            </Field>

            <Field label="Backup Email">
              <input
                className={styles.input}
                value={profile.backupEmail}
                onChange={(e) => {
                  onChange("backupEmail")(e);
                  setErrors((m) => ({ ...m, backupEmail: "" }));
                }}
              />
              {errors.backupEmail ? <div className={styles.errorText}>{errors.backupEmail}</div> : null}
            </Field>

            <Field label="Phone">
              <input
                className={styles.input}
                value={profile.phone}
                onChange={(e) => {
                  onChange("phone")(e);
                  setErrors((m) => ({ ...m, phone: "" }));
                }}
              />
              {errors.phone ? <div className={styles.errorText}>{errors.phone}</div> : null}
            </Field>

            <Field label="Address">
              <input
                className={styles.input}
                value={profile.address}
                onChange={(e) => {
                  onChange("address")(e);
                  setErrors((m) => ({ ...m, address: "" }));
                }}
              />
              {errors.address ? <div className={styles.errorText}>{errors.address}</div> : null}
            </Field>

            <div className={styles.twoCols}>
              <Field label="City">
                <input className={styles.input} value={profile.city} onChange={onChange("city")} />
              </Field>
              <Field label="Country">
                <input className={styles.input} value={profile.country} onChange={onChange("country")} />
              </Field>
            </div>

            <div className={styles.blockTitle}>Professional</div>

            <div className={styles.twoCols}>
              <Field label="Company">
                <input className={styles.input} value={profile.company} onChange={onChange("company")} />
              </Field>
              <Field label="Department">
                <input className={styles.input} value={profile.department} onChange={onChange("department")} />
              </Field>
            </div>

            <div className={styles.twoCols}>
              <Field label="Job Title">
                <input className={styles.input} value={profile.jobTitle} onChange={onChange("jobTitle")} />
              </Field>
              <Field label="Manager">
                <input className={styles.input} value={profile.manager} onChange={onChange("manager")} />
              </Field>
            </div>

            <Field label="Hire Date">
              <input className={styles.input} type="date" value={profile.hireDate} onChange={onChange("hireDate")} />
            </Field>

            <div className={styles.panel}>
              <div className={styles.panelTitle}>Security</div>

              <div className={styles.securityGrid}>
                <div className={styles.securityItem}>
                  <span className={styles.muted}>2FA</span>
                  <button type="button" className={cx(styles.pill, profile.twoFA ? styles.pillOn : styles.pillOff)} onClick={toggle2FA}>
                    <span className={styles.pillDot} />
                    {profile.twoFA ? "Enabled" : "Disabled"}
                  </button>
                </div>

                <div className={styles.securityItem}>
                  <span className={styles.muted}>Last login</span>
                  <strong className={styles.strong}>{profile.lastLogin}</strong>
                </div>

                <div className={styles.securityItem}>
                  <span className={styles.muted}>Current IP</span>
                  <strong className={styles.strong}>{profile.lastIP || "—"}</strong>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT */}
          <section className={styles.right}>
            <div className={styles.panel}>
              <div className={styles.panelTitle}>Preferences</div>

              <div className={styles.twoCols}>
                <Field label="Gender">
                  <select className={styles.input} value={profile.gender} onChange={onChange("gender")}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </Field>

                <Field label="Locale">
                  <select className={styles.input} value={profile.locale} onChange={onChange("locale")}>
                    <option value="en">English</option>
                    <option value="vi">Vietnamese</option>
                    <option value="ja">Japanese</option>
                  </select>
                </Field>
              </div>

              <Field label="Date of Birth">
                <div className={styles.dobRow}>
                  <select className={styles.input} value={profile.dobMonth} onChange={onChange("dobMonth")}>
                    {months.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>

                  <select className={styles.input} value={profile.dobDay} onChange={onChange("dobDay")}>
                    {Array.from({ length: 31 }, (_, i) => String(i + 1)).map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>

                  <select className={styles.input} value={profile.dobYear} onChange={onChange("dobYear")}>
                    {Array.from({ length: 80 }, (_, i) => String(2026 - i)).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </Field>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelTitle}>About</div>

              <Field label="Slogan">
                <input className={styles.input} value={profile.slogan} onChange={onChange("slogan")} />
              </Field>

              <Field label="Bio">
                <textarea className={styles.textarea} value={profile.bio} onChange={onChange("bio")} rows={4} />
              </Field>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelTitle}>Social</div>

              <div className={styles.twoCols}>
                <Field label="Twitter">
                  <input className={styles.input} value={profile.twitter} onChange={onChange("twitter")} />
                </Field>
                <Field label="LinkedIn">
                  <input className={styles.input} value={profile.linkedin} onChange={onChange("linkedin")} />
                </Field>
              </div>

              <div className={styles.twoCols}>
                <Field label="Facebook">
                  <input className={styles.input} value={profile.facebook} onChange={onChange("facebook")} />
                </Field>
                <Field label="GitHub">
                  <input className={styles.input} value={profile.github} onChange={onChange("github")} />
                </Field>
              </div>

              <Field label="Website">
                <input className={styles.input} value={profile.website} onChange={onChange("website")} />
              </Field>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelTitle}>Payment Method</div>

              <div className={styles.payments}>
                {payments.map((p) => (
                  <div key={p.id} className={cx(styles.payCard, p.isDefault && styles.payCardDefault)}>
                    <div className={styles.payTop}>
                      <div className={styles.brand}>
                        <span className={cx(styles.brandPill, p.brand === "mastercard" && styles.brandMC)}>{p.brand === "visa" ? "VISA" : "MASTERCARD"}</span>
                        {p.isDefault && <span className={styles.defaultBadge}>Default</span>}
                      </div>

                      <button className={styles.moreBtn} type="button" onClick={() => setDefaultPayment(p.id)}>
                        <i className="bi bi-check2-circle" /> Set default
                      </button>
                    </div>

                    <div className={styles.payMid}>
                      <div className={styles.cardNumber}>
                        <span className={styles.muted}>••••</span> {p.last4}
                      </div>
                      <div className={styles.muted}>Expires {p.expires}</div>
                      <div className={styles.muted}>Holder: {p.holder}</div>
                    </div>

                    <div className={styles.payBottom}>
                      <button className={styles.removeBtn} type="button" onClick={() => removePayment(p.id)}>
                        REMOVE
                      </button>
                    </div>
                  </div>
                ))}

                <button className={styles.addPay} type="button">
                  <i className="bi bi-plus-circle" />
                  <span>ADD PAYMENT METHOD</span>
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button className={styles.secondaryBtn} type="button" disabled={busy} onClick={() => setProfile(EMPTY)}>
            Reset
          </button>
          <button className={styles.primaryBtn} type="button" onClick={onSave} disabled={busy}>
            {busy ? "Saving..." : "Save changes"}
          </button>
        </div>
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
