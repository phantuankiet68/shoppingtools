"use client";

import { useMemo, useState } from "react";
import styles from "@/styles/admin/profile/ProfileForm.module.css";

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
  language: "en" | "vi" | "ja";
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
  lastLogin: string;
  lastIP: string;
};

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

function cx(...arr: Array<string | false | undefined | null>) {
  return arr.filter(Boolean).join(" ");
}

export default function ProfileForm() {
  const [profile, setProfile] = useState<Profile>({
    firstName: "Arthur",
    lastName: "Nancy",
    username: "arthur.nancy",
    email: "bradley.ortiz@gmail.com",
    backupEmail: "backup@gmail.com",
    phone: "477-046-1827",
    address: "116 Jaskolski Stravenue Suite 883",
    city: "Tokyo",
    country: "Japan",

    role: "admin",
    status: "active",

    company: "Envato",
    department: "Design",
    jobTitle: "Senior Product Designer",
    manager: "Julia G.",
    hireDate: "2023-09-15",

    gender: "male",
    language: "en",
    timezone: "Asia/Tokyo",

    dobMonth: "September",
    dobDay: "31",
    dobYear: "1990",

    twitter: "twitter.com/envato",
    linkedin: "linkedin.com/in/envato",
    facebook: "facebook.com/envato",
    github: "github.com/envato",
    website: "envato.com",

    slogan: "Land acquisition Specialist",
    bio: "Designing at the sweet spot between product craft and business impact.",

    twoFA: true,
    lastLogin: "Sep 21, 2025 · 09:32",
    lastIP: "192.168.1.23",
  });

  const [payments, setPayments] = useState<Payment[]>([
    { id: "p1", brand: "visa", last4: "8314", expires: "06/24", holder: "Arthur Nancy", isDefault: true },
    { id: "p2", brand: "mastercard", last4: "4452", expires: "11/26", holder: "Arthur Nancy" },
  ]);

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

  const onSave = () => {
    // TODO: call API here
    console.log("Saving profile", profile, payments);
    alert("Saved ✅ (demo)");
  };

  return (
    <div className={styles.wrap}>
      {/* Header */}
      <div className={styles.topBar}>
        <div>
          <div className={styles.topTitle}>Profile Settings</div>
        </div>

        <div className={styles.topActions}>
          <button className={styles.linkBtn} type="button">
            Cancel
          </button>
          <button className={styles.iconBtn} type="button" aria-label="Close">
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
                <input className={styles.input} value={profile.firstName} onChange={onChange("firstName")} />
              </Field>
              <Field label="Last Name">
                <input className={styles.input} value={profile.lastName} onChange={onChange("lastName")} />
              </Field>
            </div>

            <div className={styles.twoCols}>
              <Field label="Username">
                <div className={styles.inputIcon}>
                  <span className={styles.prefix}>@</span>
                  <input className={styles.inputBare} value={profile.username} onChange={onChange("username")} />
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

            <Field label="Email">
              <input className={styles.input} value={profile.email} onChange={onChange("email")} />
            </Field>

            <Field label="Backup Email">
              <input className={styles.input} value={profile.backupEmail} onChange={onChange("backupEmail")} />
            </Field>

            <Field label="Phone">
              <input className={styles.input} value={profile.phone} onChange={onChange("phone")} />
            </Field>

            <Field label="Address">
              <input className={styles.input} value={profile.address} onChange={onChange("address")} />
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
                  <span className={styles.muted}>Last IP</span>
                  <strong className={styles.strong}>{profile.lastIP}</strong>
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

                <Field label="Language">
                  <select className={styles.input} value={profile.language} onChange={onChange("language")}>
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
          <button className={styles.secondaryBtn} type="button">
            Reset
          </button>
          <button className={styles.primaryBtn} type="button" onClick={onSave}>
            Save changes
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
