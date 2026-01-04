import type { ReactNode } from "react";
import styles from "@/styles/admin/layouts/LayoutC.module.css";

export default function LayoutC({ children }: { children: ReactNode }) {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sbBrand}>
          <div className={styles.sbLogo}>
            <i className="bi bi-boxes" />
          </div>
          <div>
            <div className={styles.sbTitle}>Dashboard</div>
            <div className={styles.sbSub}>Business</div>
          </div>
        </div>

        <nav className={styles.sbNav}>
          <div className={styles.sbGroup}>
            <div className={styles.sbGroupHead}>
              <span className={styles.sbGroupIcon}>
                <i className="bi bi-grid" />
              </span>
              <span className={styles.sbGroupText}>Dashboard</span>
              <i className={`bi bi-chevron-up ${styles.sbChevron}`} />
            </div>

            <a className={`${styles.sbItem} ${styles.sbActive}`} href="#">
              <i className="bi bi-house-door" />
              Overview
            </a>
            <a className={styles.sbItem} href="#">
              <i className="bi bi-graph-up" />
              Performance
            </a>
            <a className={styles.sbItem} href="#">
              <i className="bi bi-bar-chart" />
              Analytics
            </a>
            <a className={styles.sbItem} href="#">
              <i className="bi bi-file-earmark-text" />
              Reports
            </a>
            <a className={styles.sbItem} href="#">
              <i className="bi bi-kanban" />
              Projects
            </a>
          </div>

          <a className={styles.sbItem2} href="#">
            <i className="bi bi-columns-gap" />
            Boards
          </a>
          <a className={styles.sbItem2} href="#">
            <i className="bi bi-calendar3" />
            Calendar
          </a>
          <a className={styles.sbItem2} href="#">
            <i className="bi bi-newspaper" />
            News Feed
          </a>
          <a className={styles.sbItem2} href="#">
            <i className="bi bi-megaphone" />
            Marketing
          </a>
          <a className={styles.sbItem2} href="#">
            <i className="bi bi-bag" />
            Orders
          </a>
          <a className={styles.sbItem2} href="#">
            <i className="bi bi-gear" />
            Settings
          </a>
        </nav>

        <div className={styles.sbUser}>
          <div className={styles.sbAvatar} />
          <div>
            <div className={styles.sbUserName}>Victor James</div>
            <div className={styles.sbUserRole}>Admin</div>
          </div>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}

/* ---------- Reusable ---------- */

function Card({ title, right, children }: { title: string; right?: ReactNode; children: ReactNode }) {
  return (
    <section className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardTitle}>{title}</div>
        <div className={styles.cardRight}>{right}</div>
      </div>
      <div className={styles.cardBody}>{children}</div>
    </section>
  );
}

function MiniStat({ icon, label, value, sub, delta, up }: { icon: string; label: string; value: string; sub: string; delta: string; up?: boolean }) {
  return (
    <div className={styles.miniStat}>
      <div className={styles.miniIcon}>
        <i className={`bi ${icon}`} />
      </div>

      <div className={styles.miniMeta}>
        <div className={styles.miniLabel}>{label}</div>
        <div className={styles.miniValue}>{value}</div>

        <div className={styles.miniFoot}>
          <span className={styles.miniSub}>{sub}</span>
          <span className={`${styles.delta} ${up ? styles.up : styles.down}`}>
            {delta} <i className={`bi ${up ? "bi-arrow-up" : "bi-arrow-down"}`} />
          </span>
        </div>
      </div>
    </div>
  );
}

function IconDots() {
  return (
    <button className={styles.iconDots} type="button" aria-label="More">
      <i className="bi bi-three-dots" />
    </button>
  );
}

function Pill({ value }: { value: string }) {
  return <span className={styles.pill}>{value}</span>;
}

function SmallBtn({ label }: { label: string }) {
  return (
    <button className={styles.smallBtn} type="button">
      {label}
    </button>
  );
}

function LinkBtn({ label }: { label: string }) {
  return (
    <a className={styles.linkBtn} href="#">
      {label}
    </a>
  );
}

function SmallSelect({ label }: { label: string }) {
  return (
    <button className={styles.smallSelect} type="button">
      {label} <i className="bi bi-chevron-down" />
    </button>
  );
}

/* Timeline item */
function TimeItem({ tone, title, text, time }: { tone: "tBlue" | "tViolet" | "tGreen" | "tRed"; title: string; text: string; time: string }) {
  return (
    <div className={styles.timeItem}>
      <div className={`${styles.timeDot} ${styles[tone]}`} />
      <div className={styles.timeBody}>
        <div className={styles.timeLine}>
          <b>{title}</b> <span>{text}</span>
        </div>
        <div className={styles.timeAgo}>{time}</div>
      </div>
      <i className={`bi bi-chevron-right ${styles.timeArrow}`} />
    </div>
  );
}

function InvoiceItem({ title, status, order }: { title: string; status: "Paid" | "Pending"; order: string }) {
  return (
    <div className={styles.invoiceItem}>
      <div className={styles.invoiceIcon}>
        <i className="bi bi-receipt" />
      </div>
      <div className={styles.invoiceInfo}>
        <div className={styles.invoiceTitle}>{title}</div>
        <div className={styles.invoiceSub}>
          <span className={`${styles.tag} ${status === "Paid" ? styles.tagPaid : styles.tagPending}`}>{status}</span>
          <span className={styles.order}>{order}</span>
        </div>
      </div>
      <button className={styles.iconDots} type="button" aria-label="More">
        <i className="bi bi-three-dots-vertical" />
      </button>
    </div>
  );
}

function Schedule() {
  const days = [
    ["Sat", "04"],
    ["Sun", "05"],
    ["Mon", "06"],
    ["Tue", "07"],
    ["Wed", "08"],
    ["Thu", "09"],
    ["Fri", "10"],
  ] as const;

  return (
    <div className={styles.schedule}>
      <div className={styles.weekRow}>
        {days.map(([d, n]) => (
          <div key={d} className={`${styles.day} ${d === "Tue" ? styles.dayActive : ""}`}>
            <div className={styles.dow}>{d}</div>
            <div className={styles.dnum}>{n}</div>
          </div>
        ))}
      </div>

      <div className={styles.schHead}>
        <div className={styles.schTitle}>Todays Schedule</div>
        <a className={styles.linkBtn} href="#">
          Add a Schedule
        </a>
      </div>

      <div className={styles.schList}>
        <ScheduleItem time="10:00 - 11:00 AM" title="Project Estimation Meeting" lead="John Smith" tone="violet" />
        <ScheduleItem time="12:00 - 01:30 PM" title="Dashboard UI/UX Design Review" lead="Harry" tone="green" />
        <ScheduleItem time="10:00 - 11:00 AM" title="Dashboard Design Review" lead="Jonathan" tone="blue" />
      </div>
    </div>
  );
}

function ScheduleItem({ time, title, lead, tone }: { time: string; title: string; lead: string; tone: "violet" | "green" | "blue" }) {
  return (
    <div className={styles.schItem}>
      <div className={`${styles.schBar} ${styles[`sch_${tone}`]}`} />
      <div className={styles.schMain}>
        <div className={styles.schTime}>{time}</div>
        <div className={styles.schName}>{title}</div>
        <div className={styles.schLead}>
          Lead by <b>{lead}</b>
        </div>
      </div>
      <button className={styles.smallBtn} type="button">
        View Details
      </button>
    </div>
  );
}

function TodoList() {
  const items = [
    ["Design a Facebook Ad", true, "violet"],
    ["Analyze Dashboard Data", false, "blue"],
    ["Stockholder Meeting", false, "red"],
    ["Design a Instagram Ad", false, "violet"],
    ["Analyze Dashboard Data", false, "green"],
  ] as const;

  return (
    <div className={styles.todo}>
      {items.map(([t, done, tone], i) => (
        <div key={i} className={styles.todoRow}>
          <label className={styles.todoLeft}>
            <input type="checkbox" defaultChecked={done} />
            <span className={`${styles.box} ${styles[`box_${tone}`]}`} />
            <span className={`${styles.todoText} ${done ? styles.done : ""}`}>{t}</span>
          </label>
          <button className={styles.iconDots} type="button" aria-label="More">
            <i className="bi bi-three-dots-vertical" />
          </button>
        </div>
      ))}
    </div>
  );
}

function ProjectTable() {
  return (
    <div className={styles.tableWrap}>
      <div className={styles.tableHead}>
        <div>PROJECT</div>
        <div>TEAM MEMBERS</div>
        <div>BUDGET</div>
        <div>DUE DATE</div>
      </div>

      <div className={styles.tableRow}>
        <div className={styles.tProject}>Dashboard Design</div>
        <div className={styles.tTeam}>
          <span className={styles.av} />
          <span className={styles.av} />
        </div>
        <div className={styles.tBudget}>$18,500</div>
        <div className={styles.tDue}>9th Aug, 2023</div>
      </div>

      <div className={styles.tableRow}>
        <div className={styles.tProject}>CRM Dashboard Design</div>
        <div className={styles.tTeam}>
          <span className={styles.av} />
          <span className={styles.av} />
        </div>
        <div className={styles.tBudget}>$50,00</div>
        <div className={styles.tDue}>8th Aug, 2023</div>
      </div>
    </div>
  );
}

/* Big line chart placeholder */
function BigLineMock() {
  return (
    <div className={styles.bigLine}>
      <div className={styles.bigLegend}>
        <span>
          <i className="bi bi-square-fill" /> This Week
        </span>
        <span>
          <i className="bi bi-square-fill" /> Previous Week
        </span>
      </div>
      <div className={styles.bigGrid} />
      <div className={styles.bigPathA} />
      <div className={styles.bigPathB} />
      <div className={styles.bigAxis}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>
    </div>
  );
}
