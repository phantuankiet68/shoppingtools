import styles from '@/styles/admin/email/ReminderTemplate.module.css';
import type { EmailTemplateData } from '@/features/email/types';

type Props = {
  data: EmailTemplateData;
};

export default function ReminderTemplate({ data }: Props) {
  const subject = data.subject || 'Important reminder: your next step is waiting';

  const description =
    data.content ||
    'We noticed there is still an important step left to complete. Review your latest activity, pick up where you left off, and move forward with the clearest next action.';

  const ctaText = data.ctaText || 'Review now';
  const productName = data.productName || 'Action checklist';

  const benefits =
    data.benefits && data.benefits.length > 0
      ? data.benefits.slice(0, 4)
      : [
          'See exactly what still needs attention',
          'Return to the most important step with less friction',
          'Keep progress moving without losing context',
          'Designed for clear reminders and higher completion intent',
        ];

  return (
    <section className={styles.wrapper}>
      <div className={styles.emailCard}>
        <header className={styles.emailHeader}>
          <div className={styles.emailBrand}>
            <div className={styles.emailBrandMark}>R</div>
            <div className={styles.emailBrandContent}>
              <strong className={styles.emailBrandName}>Reminder Campaign</strong>
              <p className={styles.emailBrandSubtext}>
                Re-engagement flow · Action-focused follow-up
              </p>
            </div>
          </div>

          <span className={styles.emailHeaderBadge}>Needs attention</span>
        </header>

        <div className={styles.emailTopBanner}>
          Friendly reminder — don&apos;t lose momentum
        </div>

        <section className={styles.emailHeroSection}>
          <div className={styles.emailHeroContent}>
            <p className={styles.emailEyebrow}>IMPORTANT NEXT STEP</p>

            <h1 className={styles.emailHeadline}>{subject}</h1>

            <p className={styles.emailDescription}>{description}</p>

            <div className={styles.emailVisualPanel}>
              <div className={styles.emailVisualTop}>
                <span className={styles.emailVisualPillPrimary}>Reminder active</span>
                <span className={styles.emailVisualPill}>Continuation flow</span>
              </div>

              <div className={styles.emailVisualCard}>
                <div className={styles.emailVisualCardHeader}>
                  <strong>Pending action overview</strong>
                  <span>Today</span>
                </div>

                <div className={styles.emailVisualMetrics}>
                  <div className={styles.emailVisualMetric}>
                    <small>Status</small>
                    <strong>Incomplete</strong>
                  </div>
                  <div className={styles.emailVisualMetric}>
                    <small>Intent</small>
                    <strong>Return</strong>
                  </div>
                  <div className={styles.emailVisualMetric}>
                    <small>Next step</small>
                    <strong>Review</strong>
                  </div>
                </div>
              </div>
            </div>

            <div className={styles.emailActionRow}>
              <button className={styles.emailCta} type="button">
                {ctaText}
                <span>→</span>
              </button>

              <div className={styles.emailMetaInfo}>
                <strong>Action-ready</strong>
                <span>Clear message designed to bring users back with less friction</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.emailSummarySection}>
          <div className={styles.emailMockCard}>
            <p className={styles.emailMockLabel}>Reminder summary</p>
            <h2 className={styles.emailMockTitle}>A simple prompt to continue progress</h2>
            <p className={styles.emailMockText}>
              Use a short, clear reminder to help users return to the exact step
              that matters most, without overwhelming them with too much detail.
            </p>

            <div className={styles.emailMockMetrics}>
              <div className={styles.emailMockMetric}>
                <span>Intent</span>
                <strong>Return</strong>
              </div>
              <div className={styles.emailMockMetric}>
                <span>Message</span>
                <strong>Focused</strong>
              </div>
              <div className={styles.emailMockMetric}>
                <span>Goal</span>
                <strong>Complete</strong>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.emailTrustRow}>
          <div className={styles.emailTrustItem}>
            <strong>Clear reminder</strong>
            <span>Help users understand what still needs to be completed</span>
          </div>
          <div className={styles.emailTrustItem}>
            <strong>Lower drop-off</strong>
            <span>Bring attention back to the action with a focused message</span>
          </div>
          <div className={styles.emailTrustItem}>
            <strong>Better completion</strong>
            <span>Useful for renewals, reviews, unfinished steps, and follow-ups</span>
          </div>
        </section>

        <section className={styles.emailSocialProof}>
          <span>Built for thoughtful reminder journeys</span>
          <div className={styles.emailSocialProofLogos}>
            <span>FOLLOW-UP</span>
            <span>RENEWAL</span>
            <span>REVIEW</span>
            <span>RE-ENGAGEMENT</span>
          </div>
        </section>

        <section className={styles.emailInfoSection}>
          <div className={styles.emailInfoCard}>
            <p className={styles.emailInfoLabel}>RECOMMENDED NEXT STEP</p>
            <h3 className={styles.emailInfoTitle}>Guide users back to one clear action</h3>
            <p className={styles.emailInfoText}>
              Keep the reminder simple: explain what is pending, why it matters, and
              give users one direct CTA that helps them continue immediately from
              where they left off.
            </p>
          </div>

          <div className={styles.emailInfoSideCard}>
            <p className={styles.emailInfoSideLabel}>Why this works</p>
            <p className={styles.emailInfoSideText}>
              Reminder emails are most effective when they reduce hesitation, restore
              context quickly, and make the next action feel easy to complete.
            </p>
          </div>
        </section>

        <footer className={styles.emailFooter}>
          <div className={styles.emailFooterBrand}>
            <strong>Your Brand</strong>
            <span>Support: support@yourbrand.com</span>
          </div>

          <div className={styles.emailFooterLinks}>
            <span>Manage preferences</span>
            <span>Unsubscribe</span>
          </div>
        </footer>
      </div>
    </section>
  );
}