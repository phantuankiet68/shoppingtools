import type { ReactNode } from "react";
import styles from "@/styles/admin/layouts/DashboardA.module.css";
import ActiveProjectsUsers from "@/components/admin/pages/ActiveProjectsUsers";
export default function DashboardA() {
  return (
    <div className={styles.dashboard}>
      <section className={styles.topGrid}>
        <div className={styles.congratsCard}>
          <div className={styles.congratsLeft}>
            <div className={styles.congratsTitle}>
              Congratulations John! <span className={styles.party}>🎉</span>
            </div>
            <div className={styles.congratsSub}>
              You have done <b>72%</b> more sales today. <br />
              Check your new raising badge in your profile.
            </div>

            <button className={styles.primarySoftBtn} type="button">
              VIEW BADGES
            </button>
          </div>

          <div className={styles.congratsRight} aria-hidden="true">
            <div className={styles.illus}>
              <div className={styles.illusHead} />
              <div className={styles.illusBody} />
              <div className={styles.illusLaptop} />
            </div>

            <div className={styles.congratsClock}>
              <i className="bi bi-clock" />
            </div>
          </div>
        </div>

        <MiniStat icon="bi-graph-up" label="Profit" value="$12,628" delta="+72.8%" up />
        <MiniStat icon="bi-bag" label="Sales" value="$4,679" delta="+28.42%" up />
      </section>

      <section className={styles.mainGrid}>
        <Card title="Total Revenue" legend={<YearLegend />}>
          <RevenueBars />
        </Card>
        <Card title="" right={<PillSelect value="2023" />}>
          <GrowthDonut />
        </Card>
        <div className={styles.rightStack}>
          <div className={styles.rightMiniGrid}>
            <MetricMini icon="bi-paypal" label="Payments" value="$2,468" delta="-14.82%" up={false} tone="peach" />
            <MetricMini icon="bi-receipt" label="Transactions" value="$14,857" delta="+28.14%" up tone="violet" />
            <MetricMini icon="bi-currency-dollar" label="Profit" value="$12,628" delta="+72.8%" up tone="green" />
            <MetricMini icon="bi-cart2" label="Sales" value="$4,679" delta="+28.42%" up tone="blue" />
          </div>
        </div>
      </section>
      <ActiveProjectsUsers />
    </div>
  );
}

function Card({ title, legend, right, children }: { title: string; legend?: ReactNode; right?: ReactNode; children: ReactNode }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardHeadLeft}>
          {title ? <div className={styles.cardTitle}>{title}</div> : <div />}
          {legend && <div className={styles.cardLegend}>{legend}</div>}
        </div>
        <div className={styles.cardHeadRight}>
          {right}
          {!right && (
            <button className={styles.iconBtnSoft} type="button" aria-label="More">
              <i className="bi bi-three-dots" />
            </button>
          )}
        </div>
      </div>

      <div className={styles.cardBody}>{children}</div>
    </div>
  );
}

function MiniStat({ icon, label, value, delta, up }: { icon: string; label: string; value: string; delta: string; up: boolean }) {
  return (
    <div className={styles.miniStat}>
      <div className={styles.miniStatTop}>
        <div className={styles.miniIcon}>
          <i className={`bi ${icon}`} />
        </div>
        <button className={styles.iconBtnSoft} type="button" aria-label="More">
          <i className="bi bi-three-dots" />
        </button>
      </div>

      <div className={styles.miniLabel}>{label}</div>
      <div className={styles.miniValue}>{value}</div>
      <div className={`${styles.miniDelta} ${up ? styles.up : styles.down}`}>
        <i className={`bi ${up ? "bi-arrow-up-right" : "bi-arrow-down-right"}`} />
        <span>{delta}</span>
      </div>
    </div>
  );
}

function MetricMini({ icon, label, value, delta, up, tone }: { icon: string; label: string; value: string; delta: string; up: boolean; tone: "peach" | "violet" | "green" | "blue" }) {
  return (
    <div className={styles.metricMini}>
      <div className={styles.metricTop}>
        <div className={`${styles.metricIcon} ${styles[`tone_${tone}`]}`}>
          <i className={`bi ${icon}`} />
        </div>
        <button className={styles.iconBtnSoft} type="button" aria-label="More">
          <i className="bi bi-three-dots" />
        </button>
      </div>

      <div className={styles.metricLabel}>{label}</div>
      <div className={styles.metricValue}>{value}</div>
      <div className={`${styles.metricDelta} ${up ? styles.up : styles.down}`}>
        <i className={`bi ${up ? "bi-arrow-up-right" : "bi-arrow-down-right"}`} />
        <span>{delta}</span>
      </div>
    </div>
  );
}

function PillSelect({ value }: { value: string }) {
  return (
    <button className={styles.pillSelect} type="button">
      {value} <i className="bi bi-chevron-down" />
    </button>
  );
}

function YearLegend() {
  return (
    <div className={styles.yearLegend}>
      <span className={styles.dot} data-tone="p" />
      <span>2022</span>
      <span className={styles.dot} data-tone="c" />
      <span>2021</span>
    </div>
  );
}

function RevenueBars() {
  const a = [40, 18, 28, 55, 32, 24, 16];
  const b = [28, 12, 20, 42, 22, 34, 10];
  return (
    <div className={styles.revenueChart}>
      <div className={styles.revenueGrid} />
      <div className={styles.revenueBars}>
        {a.map((h, i) => (
          <div key={i} className={styles.revCol}>
            <div className={styles.revBarA} style={{ height: `${h}%` }} />
            <div className={styles.revBarB} style={{ height: `${b[i]}%` }} />
          </div>
        ))}
      </div>

      <div className={styles.revAxis}>
        {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul"].map((m) => (
          <span key={m}>{m}</span>
        ))}
      </div>
    </div>
  );
}

function GrowthDonut() {
  return (
    <div className={styles.donutWrap}>
      <div className={styles.donut}>
        <div className={styles.donutCenter}>
          <div className={styles.donutValue}>78%</div>
          <div className={styles.donutLabel}>Growth</div>
        </div>
      </div>
      <div className={styles.donutSub}>62% Company Growth</div>
      <div className={styles.donutFoot}>
        <div className={styles.donutFootItem}>
          <div className={styles.donutChip}>
            <i className="bi bi-currency-dollar" />
          </div>
          <div>
            <div className={styles.donutFootYear}>2023</div>
            <div className={styles.donutFootVal}>$32.5k</div>
          </div>
        </div>

        <div className={styles.donutFootItem}>
          <div className={styles.donutChip}>
            <i className="bi bi-credit-card-2-front" />
          </div>
          <div>
            <div className={styles.donutFootYear}>2022</div>
            <div className={styles.donutFootVal}>$41.2k</div>
          </div>
        </div>
      </div>
    </div>
  );
}
