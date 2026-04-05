import styles from '@/styles/admin/email/PromotionTemplate.module.css';
import type { EmailTemplateData } from '@/features/email/types';

type Props = {
  data: EmailTemplateData;
};

export default function PromotionTemplate({ data }: Props) {
  const subject =
    data.subject || 'Order now and enjoy Free Delivery completely on us';

  const description =
    data.content ||
    'Complete your order today and use your exclusive code below to unlock free delivery on your purchase before this offer expires.';

  const promoCode = data.promoCode || 'AC41FD2P';
  const ctaText = data.ctaText || 'Complete My Order';
  const productName = data.productName || 'Featured Product';

  const benefits =
    data.benefits && data.benefits.length > 0
      ? data.benefits.slice(0, 4)
      : [
          'Premium-quality product selected to improve customer confidence',
          'Clear value proposition designed to boost conversion intent',
          'Offer messaging built for urgency without looking overly aggressive',
          'Easy to review, edit, and send as part of your campaign workflow',
        ];

  return (
    <section className={styles.wrapper}>
      <div className={styles.emailCard}>
        <header className={styles.emailHeader}>
          <div className={styles.emailBrand}>
            <div className={styles.emailBrandMark}>P</div>
            <div className={styles.emailBrandContent}>
              <strong className={styles.emailBrandName}>Promotion Campaign</strong>
              <p className={styles.emailBrandSubtext}>
                Conversion-focused offer · High-intent email journey
              </p>
            </div>
          </div>

          <span className={styles.emailHeaderBadge}>Limited Offer</span>
        </header>

        <div className={styles.emailTopBanner}>
          Don&apos;t miss your exclusive free delivery offer
        </div>

        <section className={styles.emailHeroSection}>
          <div className={styles.emailHeroContent}>
            <p className={styles.emailEyebrow}>YOU&apos;RE CLOSE TO CHECKOUT</p>

            <h1 className={styles.emailHeadline}>{subject}</h1>

            <p className={styles.emailDescription}>{description}</p>

            <div className={styles.emailOfferRow}>
              <div className={styles.emailCode}>CODE: {promoCode}</div>
              <span className={styles.emailOfferBadge}>Exclusive benefit</span>
            </div>

            <div className={styles.emailVisualPanel}>
              <div className={styles.emailVisualTop}>
                <span className={styles.emailVisualPillPrimary}>Offer active</span>
                <span className={styles.emailVisualPill}>Checkout recovery</span>
              </div>

              <div className={styles.emailVisualCard}>
                <div className={styles.emailVisualCardHeader}>
                  <strong>Promotion summary</strong>
                  <span>Today</span>
                </div>

                <div className={styles.emailVisualMetrics}>
                  <div className={styles.emailVisualMetric}>
                    <small>Offer</small>
                    <strong>Free delivery</strong>
                  </div>
                  <div className={styles.emailVisualMetric}>
                    <small>Intent</small>
                    <strong>High</strong>
                  </div>
                  <div className={styles.emailVisualMetric}>
                    <small>Path</small>
                    <strong>Checkout</strong>
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
                <strong>Offer-ready</strong>
                <span>Designed to reduce drop-off and encourage completion</span>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.emailSummarySection}>
          <div className={styles.emailMockCard}>
            <p className={styles.emailMockLabel}>Offer summary</p>
            <h2 className={styles.emailMockTitle}>A strong incentive to complete the order</h2>
            <p className={styles.emailMockText}>
              Pair urgency, a clear reward, and a direct CTA to help customers move
              from consideration to action more confidently.
            </p>

            <div className={styles.emailMockMetrics}>
              <div className={styles.emailMockMetric}>
                <span>Goal</span>
                <strong>Purchase</strong>
              </div>
              <div className={styles.emailMockMetric}>
                <span>Offer</span>
                <strong>Free delivery</strong>
              </div>
              <div className={styles.emailMockMetric}>
                <span>Intent</span>
                <strong>High</strong>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.emailTrustRow}>
          <div className={styles.emailTrustItem}>
            <strong>Fast checkout</strong>
            <span>Reduce friction and bring users back to purchase intent</span>
          </div>
          <div className={styles.emailTrustItem}>
            <strong>Clear incentive</strong>
            <span>One visible code makes the value immediately obvious</span>
          </div>
          <div className={styles.emailTrustItem}>
            <strong>Conversion focus</strong>
            <span>Built for remarketing, cart recovery, and direct response</span>
          </div>
        </section>

        <section className={styles.emailSocialProof}>
          <span>Built for promotional email performance</span>
          <div className={styles.emailSocialProofLogos}>
            <span>REMARKETING</span>
            <span>CHECKOUT</span>
            <span>OFFER</span>
            <span>CONVERSION</span>
          </div>
        </section>

        {data.productImage ? (
          <section className={styles.emailProductMediaSection}>
            <div className={styles.emailProductWrap}>
              <img
                src={data.productImage}
                alt={productName}
                className={styles.emailProductImage}
              />
            </div>
          </section>
        ) : null}

        <section className={styles.emailProductSection}>
          <div className={styles.emailProductInfo}>
            <p className={styles.emailSectionKicker}>FEATURED OFFER</p>
            <h3>{productName}</h3>

            <ul className={styles.emailBenefits}>
              {benefits.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>

            <button className={styles.emailSecondaryCta} type="button">
              Review product details
              <span>→</span>
            </button>
          </div>
        </section>

        <section className={styles.emailInfoSection}>
          <div className={styles.emailInfoCard}>
            <p className={styles.emailInfoLabel}>RECOMMENDED NEXT STEP</p>
            <h3 className={styles.emailInfoTitle}>Send customers directly back to checkout</h3>
            <p className={styles.emailInfoText}>
              Keep the path simple: remind them of the benefit, show the offer code,
              and link them back to the page where they can complete their order with
              the fewest possible steps.
            </p>
          </div>

          <div className={styles.emailInfoSideCard}>
            <p className={styles.emailInfoSideLabel}>Why this works</p>
            <p className={styles.emailInfoSideText}>
              Promotional emails perform better when the benefit is immediate, the
              message is focused, and the CTA is closely aligned with purchase intent.
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