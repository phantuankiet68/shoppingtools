// app/admin/profile/page.tsx
import styles from "@/styles/admin/profile/ProfilePage.module.css";

type Person = {
  name: string;
  title: string;
  bio: string;
  location: string;
};

const person: Person = {
  name: "Nora Tsunoda",
  title: "Security Lead",
  bio: "Skateboarder, coffee addict, audiophile. Mad Men fan and holistic designer. Performing at the sweet spot between art and sustainability to craft experiences that go beyond design.",
  location: "Tokyo, Japan",
};

const spendsTimeOn = [
  { icon: "bi-hdd-network", label: "Product Infrastructure" },
  { icon: "bi-shield-lock", label: "Network Security" },
  { icon: "bi-bug", label: "Security Testing" },
  { icon: "bi-clipboard-check", label: "Security Audit Outsourcing" },
  { icon: "bi-exclamation-triangle", label: "Bugs" },
];

const worksWith = [
  { name: "Joe A.", color: "#6c5ce7" },
  { name: "Dylan C.", color: "#00b894" },
  { name: "Ethan C.", color: "#0984e3" },
  { name: "Louis W.", color: "#fdcb6e" },
  { name: "Jacob S.", color: "#e84393" },
  { name: "Julia G.", color: "#d63031" },
  { name: "Katie U.", color: "#2d3436" },
];

const teams = [
  { title: "Product", members: 34 },
  { title: "Security", members: 24, owner: true },
  { title: "Japan", members: 34 },
];

const responsibilities = ["Security", "Encryption", "Keys and Secrets"];

export default function AdminProfilePage() {
  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.profileBlock}>
          <div className={styles.avatarWrap}>
            <div className={styles.avatar} />
            <button className={styles.addBtn}>
              <i className="bi bi-plus" />
            </button>
          </div>

          <h3 className={styles.personName}>{person.name}</h3>
          <p className={styles.personTitle}>{person.title}</p>
        </div>

        {/* Menu */}
        <nav className={styles.nav}>
          <a className={`${styles.navItem} ${styles.active}`}>
            <i className="bi bi-person" />
            <span>Profile</span>
          </a>

          <a className={styles.navItem}>
            <i className="bi bi-check2-square" />
            <span>Tasks</span>
          </a>

          <a className={styles.navItem}>
            <i className="bi bi-calendar3" />
            <span>Calendar</span>
          </a>

          <a className={styles.navItem}>
            <i className="bi bi-folder2" />
            <span>Files</span>
          </a>
          <a className={styles.navItem}>
            <i className="bi bi-folder2" />
            <span>Change password</span>
          </a>
          <a className={styles.navItem}>
            <i className="bi bi-folder2" />
            <span>Images</span>
          </a>
          <a className={styles.navItem}>
            <i className="bi bi-folder2" />
            <span>Spending</span>
          </a>
          <a className={styles.navItem}>
            <i className="bi bi-folder2" />
            <span>CV</span>
          </a>
        </nav>
      </aside>

      {/* Main content */}
      <main className={styles.main}>
        <section className={styles.card}>
          <div className={styles.cardTitle}>Nora spends most of their time on…</div>
          <div className={styles.pills}>
            {spendsTimeOn.map((x) => (
              <div key={x.label} className={styles.pillRow}>
                <i className={`bi ${x.icon} ${styles.pillIcon}`} />
                <span className={styles.pillText}>{x.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardTitle}>Works most with…</div>
          <div className={styles.avatarsRow}>
            {worksWith.map((p) => (
              <div key={p.name} className={styles.miniPerson}>
                <div className={styles.miniAvatar} style={{ background: p.color }} />
                <div className={styles.miniName}>{p.name}</div>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.card}>
          <div className={styles.cardTitle}>In these teams…</div>
          <div className={styles.teamsRow}>
            {teams.map((t) => (
              <div key={t.title} className={styles.teamCircle}>
                <div className={styles.teamInner}>
                  <div className={styles.teamTitle}>{t.title}</div>
                  <div className={styles.teamMeta}>{t.members} members</div>
                  {t.owner && <div className={styles.teamOwner}>OWNER</div>}
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <aside className={styles.right}>
        <div className={styles.mapBg} aria-hidden="true" />

        <div className={styles.rightInner}>
          <section className={styles.rightCard}>
            <div className={styles.rightTitle}>BIOGRAPHY</div>
            <p className={styles.rightText}>{person.bio}</p>

            <div className={styles.rightTitle} style={{ marginTop: 18 }}>
              LOCATION
            </div>
            <div className={styles.locationRow}>
              <i className="bi bi-geo-alt" />
              <span>{person.location}</span>
            </div>

            <div className={styles.rightTitle} style={{ marginTop: 18 }}>
              DIRECT RESPONSIBILITIES
            </div>
            <div className={styles.tags}>
              {responsibilities.map((r) => (
                <span key={r} className={styles.tag}>
                  {r} <i className={`bi bi-chevron-right ${styles.tagIcon}`} />
                </span>
              ))}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
