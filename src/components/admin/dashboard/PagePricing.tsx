'use client';

import { useAdminAuth } from '@/components/admin/providers/AdminAuthProvider';
import { useAdminI18n } from '@/components/admin/providers/AdminI18nProvider';
import styles from '@/styles/admin/dashboard/PagePricing.module.css';

export default function PagePricing() {
    const { memberships } = useAdminAuth();
    const { t, locale } = useAdminI18n();

    const tier = memberships?.[0]?.tier || 'BASIC';
    const activePlan = tier.toLowerCase();

    const plans = [
        {
            id: 'basic',
            name: 'pricing.basic',
            prices: {
                vi: '59.000₫',
                en: '$5',
                ja: '¥800',
            },
            websites: 1,
            pages: 10,
            products: 20,
            categories: 10,
            brands: 10,
            menus: 10,
            users: 20,
            seo: 'pricing.basicSeo',
            analytics: 'pricing.analyticsDashboard',
        },
        {
            id: 'standard',
            name: 'pricing.standard',
            prices: {
                vi: '129.000₫',
                en: '$10',
                ja: '¥1,500',
            },
            websites: 2,
            pages: 15,
            products: 100,
            categories: 30,
            brands: 15,
            menus: 20,
            users: 50,
            seo: 'pricing.basicSeo',
            analytics: 'pricing.analyticsDashboard',
            highlight: true,
        },
        {
            id: 'professional',
            name: 'pricing.professional',
            prices: {
                vi: '299.000₫',
                en: '$20',
                ja: '¥3,000',
            },
            websites: 3,
            pages: 30,
            products: 'pricing.unlimited',
            categories: 50,
            brands: 30,
            menus: 30,
            users: 100,
            seo: 'pricing.premiumSeo',
            analytics: 'pricing.advancedAnalytics',
        },
    ];

    return (
        <div className={styles.wrapper}>
            {plans.map((plan) => (
                <div
                    key={plan.id}
                    className={`${styles.card}
            ${activePlan === plan.id ? styles.active : ''}
            ${plan.highlight ? styles.highlight : ''}`}
                >
                    {/* HEADER */}
                    <div className={styles.header}>
                        <div className={styles.planInfo}>
                            <div className={styles.iconBox}>🌐</div>

                            <div>
                                <h3 className={styles.name}>{t(plan.name)}</h3>
                                <div className={styles.meta}>
                                    {plan.websites} {t('pricing.websites')}
                                </div>
                            </div>
                        </div>

                        {plan.highlight && (
                            <span className={styles.badge}>🔥 {t('pricing.popular')}</span>
                        )}
                    </div>

                    {/* BODY */}
                    <div className={styles.cardBody}>
                        {/* PRICE */}
                        <div className={styles.priceWrapper}>
                            <span className={styles.price}>
                                {plan.prices[locale] ?? plan.prices.vi}
                            </span>
                            <span className={styles.period}>/{t('pricing.month')}</span>
                        </div>

                        <ul className={styles.features}>
                            <li>
                                🌐 {plan.websites} {t('pricing.websites')}
                            </li>
                            <li>
                                🎨 {plan.pages} {t('pricing.pages')}
                            </li>
                            <li>
                                📦 {t(`${plan.products}`)} {t('pricing.products')}
                            </li>
                            <li>
                                📁 {plan.categories} {t('pricing.categories')}
                            </li>
                            <li>
                                🏷️ {plan.brands} {t('pricing.brands')}
                            </li>
                            <li>
                                📋 {plan.menus} {t('pricing.menus')}
                            </li>
                            <li>
                                👥 {plan.users} {t('pricing.users')}
                            </li>
                            <li>🔍 {t(`${plan.seo}`)}</li>
                            <li>📊 {t(`${plan.analytics}`)}</li>
                            <li>⚡ {t('pricing.dragDropBuilder')}</li>
                            <li>🌎 {t('pricing.customDomain')}</li>
                        </ul>

                        {/* CTA */}
                        <button
                            className={`${styles.btn} ${activePlan === plan.id ? styles.active : ''}`}
                        >
                            {activePlan === plan.id
                                ? t('pricing.currentPlan')
                                : t('pricing.upgrade')}
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
