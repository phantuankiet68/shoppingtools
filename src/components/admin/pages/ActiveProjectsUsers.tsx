import styles from "@/styles/admin/layouts/ActiveProjectsUsers.module.css";

type ProjectStatus = "Completed" | "In Progress" | "Pending";

const projects = [
  {
    name: "Bamboo Watch",
    lead: "Amy Elsner",
    progress: 75,
    assignees: ["AE", "JW", "MR"],
    status: "In Progress" as ProjectStatus,
    due: "06 Aug 2020",
  },
  {
    name: "Blue Band",
    lead: "Asiya Javayant",
    progress: 52,
    assignees: ["AJ", "KT"],
    status: "In Progress" as ProjectStatus,
    due: "18 Sep 2020",
  },
  {
    name: "Crypto App",
    lead: "Ioni Bowcher",
    progress: 28,
    assignees: ["IB", "NL", "SC"],
    status: "Pending" as ProjectStatus,
    due: "04 Dec 2020",
  },
  {
    name: "Designer",
    lead: "Ivan Magalhaes",
    progress: 80,
    assignees: ["IM", "AH", "OT", "RK"],
    status: "Completed" as ProjectStatus,
    due: "12 Dec 2020",
  },
  {
    name: "Company",
    lead: "Amy Elsner",
    progress: 40,
    assignees: ["AE", "JW", "MR", "KT", "NL"],
    status: "Completed" as ProjectStatus,
    due: "22 Jan 2021",
  },
];

const activeUsers = [
  { country: "India", flag: "🇮🇳", percent: 50 },
  { country: "Canada", flag: "🇨🇦", percent: 35 },
  { country: "Russia", flag: "🇷🇺", percent: 30 },
  { country: "United Kingdom", flag: "🇬🇧", percent: 40 },
  { country: "Australia", flag: "🇦🇺", percent: 25 },
  { country: "United States", flag: "🇺🇸", percent: 30 },
  { country: "Pakistan", flag: "🇵🇰", percent: 20 },
  { country: "Germany", flag: "🇩🇪", percent: 45 },
];

export default function ActiveProjectsUsers() {
  return (
    <section className={styles.grid}>
      <div className={styles.card}>
        <div className={styles.cardHead}>
          <div className={styles.title}>Active Projects</div>

          <button className={styles.exportBtn} type="button">
            <i className="bi bi-download" />
            Export Report
          </button>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Project name</th>
                <th>Project lead</th>
                <th>Progress</th>
                <th>Assignees</th>
                <th>Status</th>
                <th>Due Date</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((p) => (
                <tr key={p.name}>
                  <td className={styles.projectCell}>
                    <div className={styles.projectName}>{p.name}</div>
                    <div className={styles.projectMeta}>UI / Dashboard</div>
                  </td>

                  <td>
                    <div className={styles.lead}>
                      <span className={styles.leadAvatar}>
                        {p.lead
                          .split(" ")
                          .slice(0, 2)
                          .map((x) => x[0])
                          .join("")}
                      </span>
                      <span className={styles.leadName}>{p.lead}</span>
                    </div>
                  </td>

                  <td>
                    <div className={styles.progressRow}>
                      <div className={styles.progressBar}>
                        <span className={styles.progressFill} style={{ width: `${p.progress}%` }} />
                      </div>
                      <span className={styles.progressText}>{p.progress}%</span>
                    </div>
                  </td>

                  <td>
                    <div className={styles.avatars}>
                      {p.assignees.slice(0, 4).map((a, idx) => (
                        <span key={a + idx} className={styles.avatar}>
                          {a}
                        </span>
                      ))}
                      {p.assignees.length > 4 && <span className={styles.avatarMore}>+{p.assignees.length - 4}</span>}
                    </div>
                  </td>

                  <td>
                    <StatusPill status={p.status} />
                  </td>

                  <td className={styles.due}>{p.due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.tableFoot}>
          <span className={styles.footHint}>Showing 1 to 5 of 23 entries</span>
          <div className={styles.pager}>
            <button className={styles.pagerBtn} type="button" aria-label="Prev">
              <i className="bi bi-chevron-left" />
            </button>
            <button className={`${styles.pagerBtn} ${styles.pagerActive}`} type="button">
              1
            </button>
            <button className={styles.pagerBtn} type="button">
              2
            </button>
            <button className={styles.pagerBtn} type="button">
              3
            </button>
            <button className={styles.pagerBtn} type="button" aria-label="Next">
              <i className="bi bi-chevron-right" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function StatusPill({ status }: { status: ProjectStatus }) {
  const cls = status === "Completed" ? styles.statusCompleted : status === "In Progress" ? styles.statusProgress : styles.statusPending;

  return <span className={`${styles.status} ${cls}`}>{status}</span>;
}
