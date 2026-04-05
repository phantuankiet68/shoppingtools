import styles from '@/styles/admin/email/WelcomeTemplate.module.css';
import type { EmailTemplateData } from '@/features/email/types';

type Props = {
  data: EmailTemplateData;
};

export default function WelcomeTemplate({ data }: Props) {
  const subject = data.subject || 'Welcome to your SEO growth workspace';

  const description =
    data.content ||
    'Build stronger organic visibility, prioritize the right pages, and turn SEO opportunities into measurable pipeline growth with a workflow your whole team can actually use.';

  const ctaText = data.ctaText || 'Start onboarding';

  const productName = data.productName || 'SEO Growth Suite';

  const primaryBenefits =
    data.benefits && data.benefits.length > 0
      ? data.benefits.slice(0, 3)
      : [
          'Find high-impact ranking opportunities across your priority landing pages',
          'Turn SEO insights into structured actions for content, CRO, and performance teams',
          'Measure progress with a clearer path from visibility to conversion outcomes',
        ];

  return (
    <section className={styles.wrapper}>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.brand}>
            <div className={styles.brandMark}>G</div>
            <div className={styles.brandContent}>
              <strong className={styles.brandName}>Growth Welcome Series</strong>
              <span className={styles.brandSubtext}>
                SEO onboarding · Professional email experience
              </span>
            </div>
          </div>

          <span className={styles.headerBadge}>New account</span>
        </header>

        <div className={styles.banner}>
          Organic growth starts with the right workflow
        </div>

        <section className={styles.hero}>
          <div className={styles.heroMain}>
            <p className={styles.eyebrow}>WELCOME TO YOUR WORKSPACE</p>
            <h1 className={styles.title}>{subject}</h1>
            <p className={styles.description}>{description}</p>

            <div className={styles.heroVisual}>
              <div className={styles.visualFrame}>
                <div className={styles.visualTop}>
                  <span className={styles.visualPillPrimary}>SEO workspace</span>
                  <span className={styles.visualPill}>Live onboarding</span>
                </div>

                <div className={styles.visualChartCard}>
                  <div className={styles.visualChartHeader}>
                    <strong>Organic opportunity overview</strong>
                    <span>Last 30 days</span>
                  </div>

                  <div className={styles.visualBars}>
                    <span className={styles.bar1} />
                    <span className={styles.bar2} />
                    <span className={styles.bar3} />
                    <span className={styles.bar4} />
                    <span className={styles.bar5} />
                    <span className={styles.bar6} />
                    <span className={styles.bar7} />
                  </div>
                </div>

                <div className={styles.visualInsightRow}>
                  <div className={styles.visualInsightCard}>
                    <small>Priority page</small>
                    <strong>/seo-services</strong>
                  </div>
                  <div className={styles.visualInsightCard}>
                    <small>Next action</small>
                    <strong>Improve CTR copy</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.actionGroup}>
              <button className={styles.primaryButton} type="button">
                <span>{ctaText}</span>
                <span aria-hidden="true">→</span>
              </button>

              <div className={styles.meta}>
                <strong className={styles.metaTitle}>Fast setup</strong>
                <span className={styles.metaText}>
                  Designed for SEO teams, marketers, and growth operators
                </span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.asideSection}>
          <div className={styles.asidePanel}>
            <p className={styles.asideLabel}>Recommended first action</p>
            <h2 className={styles.asideTitle}>
              Connect your highest-priority landing page
            </h2>
            <p className={styles.asideDescription}>
              Start with the page closest to revenue impact, then review
              visibility, search opportunity, and the next optimization moves
              your team should prioritize.
            </p>

            <div className={styles.metricList}>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Priority</span>
                <strong className={styles.metricValue}>High</strong>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Setup</span>
                <strong className={styles.metricValue}>Ready</strong>
              </div>
              <div className={styles.metricItem}>
                <span className={styles.metricLabel}>Goal</span>
                <strong className={styles.metricValue}>Growth</strong>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.statsRow}>
          <div className={styles.statCard}>
            <strong>3 min</strong>
            <span>Average setup flow</span>
          </div>
          <div className={styles.statCard}>
            <strong>1 workspace</strong>
            <span>SEO, content, CRO, and analytics</span>
          </div>
          <div className={styles.statCard}>
            <strong>Clear next steps</strong>
            <span>From audit to execution</span>
          </div>
        </section>

        <section className={styles.socialProof}>
          <span className={styles.socialProofLabel}>Built for modern growth teams</span>
          <div className={styles.socialProofItems}>
            <span>SEO</span>
            <span>CONTENT</span>
            <span>CRO</span>
            <span>ANALYTICS</span>
          </div>
        </section>

        <section className={styles.featureGrid}>
          <article className={styles.featureCard}>
            <strong>Track ranking opportunities</strong>
            <p>
              Surface the pages with the highest upside and focus effort on the
              updates most likely to improve visibility and clicks.
            </p>
          </article>

          <article className={styles.featureCard}>
            <strong>Align teams around execution</strong>
            <p>
              Create a shared workflow so SEO, content, and performance teams
              can move faster with better context and less guesswork.
            </p>
          </article>

          <article className={styles.featureCard}>
            <strong>Measure impact with more clarity</strong>
            <p>
              Connect organic improvements to meaningful business signals such
              as engagement, conversion progress, and pipeline quality.
            </p>
          </article>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionMain}>
            <p className={styles.sectionKicker}>WHAT YOU CAN DO NEXT</p>
            <h3 className={styles.sectionTitle}>{productName}</h3>

            <ul className={styles.benefits}>
              {primaryBenefits.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>

            <button className={styles.secondaryButton} type="button">
              <span>Review setup steps</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <section className={styles.infoSection}>
          <div className={styles.infoMain}>
            <p className={styles.infoLabel}>RECOMMENDED NEXT STEP</p>
            <h3 className={styles.infoTitle}>Launch your first growth workflow</h3>
            <p className={styles.infoText}>
              Add your most important landing page, review current search
              performance, and begin with the first set of recommendations for
              visibility, messaging, and conversion improvement.
            </p>
          </div>

          <div className={styles.infoSide}>
            <p className={styles.infoSideLabel}>Why this matters</p>
            <p className={styles.infoSideText}>
              The sooner your team aligns around the right page and the right
              actions, the faster you move from SEO activity to commercial
              outcomes.
            </p>
          </div>
        </section>

        <footer className={styles.footer}>
          <div className={styles.footerBrand}>
            <strong>Your Brand</strong>
            <span>Support: support@yourbrand.com</span>
          </div>

          <div className={styles.footerLinks}>
            <span>Manage preferences</span>
            <span>Unsubscribe</span>
          </div>
        </footer>
      </div>
    </section>
  );
}