'use client';

import styles from '@/components/admin/shared/templates/services/footers/styles/footer-service-09.module.css';
import { useSite } from '@/hooks/v1/useSiteHook';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';
import type { InspectorField, RegItem } from '@/lib/ui-builder/types';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
/* ─────────────────────────────────────────────────
   Types
───────────────────────────────────────────────── */
export type FooterNavItem = {
    label: string;
    href: string;
    children?: FooterNavItem[];
};

export interface FooterService09Props {
    siteId?: string;
    address?: LocalizedText;
    tagline?: LocalizedText;
    ctaTitle?: LocalizedText;
    ctaDescription?: LocalizedText;
    ctaButtonText?: LocalizedText;
    ctaButtonHref?: string;
    newsletterBadge?: LocalizedText;
    subscriberCount?: LocalizedText;
    subscriberText?: LocalizedText;
    subscribeLabel?: LocalizedText;
    subscribeTitle?: LocalizedText;
    subscribePlaceholder?: LocalizedText;
    subscribeLoadingText?: LocalizedText;
    subscribeSuccessTitle?: LocalizedText;
    subscribeSuccessDescription?: LocalizedText;
    subscribeButtonText?: LocalizedText;
    subscribeNote?: LocalizedText;
    companyTitle?: LocalizedText;
    resourcesTitle?: LocalizedText;
    contactTitle?: LocalizedText;
    mobileAppsTitle?: LocalizedText;
    privacyText?: LocalizedText;
    termsText?: LocalizedText;
    cookiesText?: LocalizedText;
    languageLabel?: LocalizedText;
    copyrightText?: LocalizedText;
    appStoreHref?: string;
    googlePlayHref?: string;
    showAppDownload?: boolean;
}
/* ─────────────────────────────────────────────────
   Hooks
───────────────────────────────────────────────── */
function useSiteMenus(siteId?: string) {
    const [menus, setMenus] = useState<FooterNavItem[]>([]);

    useEffect(() => {
        if (!siteId) {
            setMenus([]);
            return;
        }
        fetch(`/api/v1/sites/${siteId}/menus`)
            .then((r) => r.json())
            .then((d) => setMenus(Array.isArray(d?.data) ? d.data : []))
            .catch(() => setMenus([]));
    }, [siteId]);

    return menus;
}

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.06) {
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setInView(true);
                    obs.disconnect();
                }
            },
            { threshold },
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, [ref, threshold]);
    return inView;
}

export const DEFAULT_PROPS: Required<FooterService09Props> = {
    siteId: '',

    address: {
        sourceLocale: 'en',
        default: 'Ho Chi Minh City, Vietnam',
        translations: {
            vi: 'Thành phố Hồ Chí Minh, Việt Nam',
            ja: 'ベトナム・ホーチミン市',
        },
    },

    tagline: {
        sourceLocale: 'en',
        default:
            'We craft digital products that perform as well as they look — built for scale, designed for humans.',
        translations: {
            vi: 'Chúng tôi tạo ra các sản phẩm số đẹp mắt, hiệu quả và sẵn sàng mở rộng cho doanh nghiệp.',
            ja: '美しさと実用性を兼ね備えた、拡張性の高いデジタルプロダクトを提供します。',
        },
    },

    ctaTitle: {
        sourceLocale: 'en',
        default: 'Get the inside edge',
        translations: {
            vi: 'Đón đầu xu hướng',
            ja: '最新情報を手に入れよう',
        },
    },

    ctaDescription: {
        sourceLocale: 'en',
        default: 'Weekly insights on product design, engineering, AI and modern web development.',
        translations: {
            vi: 'Nhận những chia sẻ hàng tuần về thiết kế sản phẩm, AI và phát triển website hiện đại.',
            ja: 'プロダクトデザイン、AI、最新のWeb開発に関する情報を毎週お届けします。',
        },
    },

    ctaButtonText: {
        sourceLocale: 'en',
        default: 'Join the list',
        translations: {
            vi: 'Tham gia ngay',
            ja: '今すぐ登録',
        },
    },

    ctaButtonHref: '/contact',

    newsletterBadge: {
        sourceLocale: 'en',
        default: 'Weekly Newsletter',
        translations: {
            vi: 'Bản tin hàng tuần',
            ja: '週間ニュースレター',
        },
    },

    subscriberCount: {
        sourceLocale: 'en',
        default: '2,000+',
        translations: {
            vi: '2.000+',
            ja: '2,000+',
        },
    },

    subscriberText: {
        sourceLocale: 'en',
        default: 'developers already joined',
        translations: {
            vi: 'lập trình viên đã tham gia',
            ja: '人以上の開発者が参加しています',
        },
    },

    subscribeLabel: {
        sourceLocale: 'en',
        default: 'Join our community',
        translations: {
            vi: 'Tham gia cộng đồng',
            ja: 'コミュニティへ参加',
        },
    },

    subscribeTitle: {
        sourceLocale: 'en',
        default: 'Stay ahead of the trend',
        translations: {
            vi: 'Luôn dẫn đầu xu hướng',
            ja: '常にトレンドの先へ',
        },
    },

    subscribePlaceholder: {
        sourceLocale: 'en',
        default: 'Enter your email',
        translations: {
            vi: 'Nhập địa chỉ email',
            ja: 'メールアドレスを入力',
        },
    },

    subscribeLoadingText: {
        sourceLocale: 'en',
        default: 'Joining...',
        translations: {
            vi: 'Đang đăng ký...',
            ja: '登録中...',
        },
    },

    subscribeSuccessTitle: {
        sourceLocale: 'en',
        default: 'Welcome aboard!',
        translations: {
            vi: 'Chào mừng bạn!',
            ja: 'ご登録ありがとうございます！',
        },
    },

    subscribeSuccessDescription: {
        sourceLocale: 'en',
        default: 'Thanks for subscribing. Check your inbox for the next issue.',
        translations: {
            vi: 'Cảm ơn bạn đã đăng ký. Hãy kiểm tra hộp thư để nhận bản tin tiếp theo.',
            ja: 'ご登録ありがとうございます。次回のニュースレターをメールでお届けします。',
        },
    },

    subscribeButtonText: {
        sourceLocale: 'en',
        default: 'Join Newsletter',
        translations: {
            vi: 'Đăng ký nhận tin',
            ja: 'ニュースレター登録',
        },
    },

    subscribeNote: {
        sourceLocale: 'en',
        default: 'No spam. Unsubscribe anytime.',
        translations: {
            vi: 'Không spam. Có thể hủy đăng ký bất cứ lúc nào.',
            ja: 'スパムは送りません。いつでも配信停止できます。',
        },
    },

    companyTitle: {
        sourceLocale: 'en',
        default: 'Company',
        translations: {
            vi: 'Công ty',
            ja: '会社情報',
        },
    },

    resourcesTitle: {
        sourceLocale: 'en',
        default: 'Resources',
        translations: {
            vi: 'Tài nguyên',
            ja: 'リソース',
        },
    },

    contactTitle: {
        sourceLocale: 'en',
        default: 'Contact',
        translations: {
            vi: 'Liên hệ',
            ja: 'お問い合わせ',
        },
    },

    mobileAppsTitle: {
        sourceLocale: 'en',
        default: 'Mobile Apps',
        translations: {
            vi: 'Ứng dụng di động',
            ja: 'モバイルアプリ',
        },
    },

    privacyText: {
        sourceLocale: 'en',
        default: 'Privacy',
        translations: {
            vi: 'Chính sách bảo mật',
            ja: 'プライバシー',
        },
    },

    termsText: {
        sourceLocale: 'en',
        default: 'Terms',
        translations: {
            vi: 'Điều khoản',
            ja: '利用規約',
        },
    },

    cookiesText: {
        sourceLocale: 'en',
        default: 'Cookies',
        translations: {
            vi: 'Cookie',
            ja: 'Cookie',
        },
    },

    languageLabel: {
        sourceLocale: 'en',
        default: 'English',
        translations: {
            vi: 'Tiếng Việt',
            ja: '日本語',
        },
    },

    copyrightText: {
        sourceLocale: 'en',
        default: 'All rights reserved.',
        translations: {
            vi: 'Đã đăng ký bản quyền.',
            ja: '無断転載を禁じます。',
        },
    },

    appStoreHref: '#',

    googlePlayHref: '#',

    showAppDownload: true,
};

/* ─────────────────────────────────────────────────
   Component
───────────────────────────────────────────────── */
export function FooterService09(props: FooterService09Props) {
    const mergedProps: Required<FooterService09Props> = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const {
        siteId,
        address,
        tagline,
        ctaTitle,
        ctaDescription,
        ctaButtonText,
        ctaButtonHref,
        newsletterBadge,
        subscriberCount,
        subscriberText,
        subscribeLabel,
        subscribeTitle,
        subscribePlaceholder,
        subscribeLoadingText,
        subscribeSuccessTitle,
        subscribeSuccessDescription,
        subscribeButtonText,
        subscribeNote,
        companyTitle,
        resourcesTitle,
        contactTitle,
        mobileAppsTitle,
        privacyText,
        termsText,
        cookiesText,
        languageLabel,
        copyrightText,
        appStoreHref,
        googlePlayHref,
        showAppDownload,
    } = mergedProps;

    const site = useSite(siteId);

    const menus = useSiteMenus(siteId);

    const rootRef = useRef<HTMLElement>(null);

    const inView = useInView(rootRef);

    const [selectedLocale, setSelectedLocale] = useState(() => {
        if (typeof window === 'undefined') {
            return 'en';
        }

        return localStorage.getItem('locale') ?? 'en';
    });

    useEffect(() => {
        const handleLocaleChange = (event: Event) => {
            const customEvent = event as CustomEvent<string>;
            setSelectedLocale(customEvent.detail);
        };

        window.addEventListener('locale-change', handleLocaleChange as EventListener);

        return () => {
            window.removeEventListener('locale-change', handleLocaleChange as EventListener);
        };
    }, []);

    const t = (value: LocalizedText) => getLocalizedValue(value, selectedLocale);

    const [email, setEmail] = useState('');

    const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    const siteLogo = site?.logoUrl ?? '/assets/images/logo.png';

    const siteName = site?.name ?? 'Website';

    const { companyMenus, resourceMenus } = useMemo(() => {
        const half = Math.ceil(menus.length / 2);

        return {
            companyMenus: menus.slice(0, half),
            resourceMenus: menus.slice(half),
        };
    }, [menus]);

    const handleSubscribe = async () => {
        if (!email.trim() || subStatus !== 'idle') return;

        setSubStatus('loading');

        await new Promise((resolve) => setTimeout(resolve, 1000));

        setSubStatus('success');

        setEmail('');
    };

    const AVATARS = [
        {
            src: '/assets/images/avatar-1.png',
            alt: 'Community member 1',
        },
        {
            src: '/assets/images/avatar-2.png',
            alt: 'Community member 2',
        },
        {
            src: '/assets/images/avatar-3.png',
            alt: 'Community member 3',
        },
        {
            src: '/assets/images/avatar-4.png',
            alt: 'Community member 4',
        },
    ];

    const SOCIALS = [
        { id: 'facebook', label: 'Facebook' },
        { id: 'instagram', label: 'Instagram' },
        { id: 'linkedin', label: 'LinkedIn' },
        { id: 'youtube', label: 'YouTube' },
        { id: 'tiktok', label: 'TikTok' },
    ];

    const MENU_TRANSLATIONS = {
        '/': {
            vi: 'Trang chủ',
            ja: 'ホーム',
        },

        '/service': {
            vi: 'Dịch vụ',
            ja: 'サービス',
        },

        '/project': {
            vi: 'Dự án',
            ja: 'プロジェクト',
        },

        '/about': {
            vi: 'Giới thiệu',
            ja: '会社概要',
        },

        '/pricing': {
            vi: 'Bảng giá',
            ja: '料金',
        },

        '/blog': {
            vi: 'Blog',
            ja: 'ブログ',
        },

        '/contact': {
            vi: 'Liên hệ',
            ja: 'お問い合わせ',
        },
    } as const;

    function getMenuLabel(href: string, fallback: string, locale: string) {
        if (locale === 'en') {
            return fallback;
        }

        return (
            MENU_TRANSLATIONS[href as keyof typeof MENU_TRANSLATIONS]?.[locale as 'vi' | 'ja'] ??
            fallback
        );
    }

    return (
        <footer ref={rootRef} className={`${styles.root} ${inView ? styles.inView : ''}`}>
            <div className={styles.wrap}>
                <section className={styles.newsletter}>
                    <div className={styles.newsletterGlow} />

                    <div className={styles.newsletterGrid}>
                        <div className={styles.newsletterContent}>
                            <span className={styles.newsletterBadge}>
                                <i className="bi bi-stars" />
                                {t(newsletterBadge)}
                            </span>

                            <h2 className={styles.newsletterTitle}>{t(ctaTitle)}</h2>

                            <p className={styles.newsletterDescription}>{t(ctaDescription)}</p>

                            <div className={styles.subscriberRow}>
                                <div className={styles.avatarGroup}>
                                    {AVATARS.map((avatar) => (
                                        <div key={avatar.src} className={styles.avatar}>
                                            <Image
                                                src={avatar.src}
                                                alt={avatar.alt}
                                                fill
                                                sizes="44px"
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className={styles.subscriberText}>
                                    <strong>{t(subscriberCount)}</strong>

                                    <span>{t(subscriberText)}</span>
                                </div>
                            </div>
                        </div>
                        <div className={styles.newsletterVisual}>
                            <div className={styles.visualCircle} />

                            <div className={styles.visualCard}>
                                <div className={styles.visualIcon}>
                                    <i className="bi bi-envelope-paper-heart-fill" />
                                </div>

                                <div className={styles.visualMail}>
                                    <div className={styles.mailLine} />
                                    <div className={styles.mailLine} />
                                    <div className={styles.mailLineSmall} />
                                </div>
                            </div>

                            {[
                                {
                                    icon: 'bi-send-fill',
                                    className: styles.floatIcon1,
                                },
                                {
                                    icon: 'bi-lightning-charge-fill',
                                    className: styles.floatIcon2,
                                },
                                {
                                    icon: 'bi-stars',
                                    className: styles.floatIcon3,
                                },
                            ].map((item) => (
                                <span key={item.icon} className={item.className}>
                                    <i className={`bi ${item.icon}`} />
                                </span>
                            ))}
                        </div>

                        <div className={styles.subscribeCard}>
                            <span className={styles.subscribeLabel}>{t(subscribeLabel)}</span>

                            <h3 className={styles.subscribeTitle}>{t(subscribeTitle)}</h3>

                            {subStatus === 'success' ? (
                                <div className={styles.subscribeSuccess}>
                                    <div className={styles.successIcon}>
                                        <i className="bi bi-check-lg" />
                                    </div>

                                    <div>
                                        <strong>{t(subscribeSuccessTitle)}</strong>

                                        <p>{t(subscribeSuccessDescription)}</p>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className={styles.inputGroup}>
                                        <i className="bi bi-envelope-fill" />

                                        <input
                                            type="email"
                                            placeholder={t(subscribePlaceholder)}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            onKeyDown={(e) =>
                                                e.key === 'Enter' && handleSubscribe()
                                            }
                                            disabled={subStatus === 'loading'}
                                        />
                                    </div>

                                    <button
                                        type="button"
                                        className={styles.subscribeButton}
                                        disabled={subStatus === 'loading'}
                                        onClick={handleSubscribe}
                                    >
                                        {subStatus === 'loading' ? (
                                            <>
                                                <span className={styles.spinner} />

                                                {t(subscribeLoadingText)}
                                            </>
                                        ) : (
                                            <>
                                                {t(subscribeButtonText)}

                                                <i className="bi bi-arrow-right" />
                                            </>
                                        )}
                                    </button>

                                    <p className={styles.subscribeNote}>
                                        <i className="bi bi-shield-check" />

                                        {t(subscribeNote)}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                </section>
                <section className={styles.footerMain}>
                    <article className={styles.brandCard}>
                        <Link href="/" className={styles.brandLogo}>
                            <span className={styles.logoWrapper}>
                                <Image
                                    src={siteLogo}
                                    alt={siteName}
                                    fill
                                    sizes="56px"
                                    className={styles.logoImage}
                                />
                            </span>

                            <span className={styles.brandTitle}>{siteName}</span>
                        </Link>

                        <p className={styles.brandDescription}>
                            {site?.seoDescription ?? t(tagline)}
                        </p>

                        <div className={styles.socialList}>
                            {SOCIALS.map(({ id, label }) => (
                                <a
                                    key={id}
                                    href="#"
                                    className={styles.socialButton}
                                    aria-label={label}
                                >
                                    <i className={`bi bi-${id}`} />
                                </a>
                            ))}
                        </div>
                    </article>

                    <div className={styles.footerCards}>
                        {/* Company */}

                        <article className={styles.footerCard}>
                            <span className={styles.cardLabel}>{t(companyTitle)}</span>

                            <ul className={styles.footerLinks}>
                                {companyMenus.map((item) => (
                                    <li key={item.href}>
                                        <Link href={item.href} className={styles.footerLink}>
                                            {getMenuLabel(item.href, item.label, selectedLocale)}
                                            <i className="bi bi-arrow-right-short" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </article>

                        {/* Resources */}

                        <article className={styles.footerCard}>
                            <span className={styles.cardLabel}>{t(resourcesTitle)}</span>

                            <ul className={styles.footerLinks}>
                                {resourceMenus.map((item) => (
                                    <li key={item.href}>
                                        <Link href={item.href} className={styles.footerLink}>
                                            {getMenuLabel(item.href, item.label, selectedLocale)}
                                            <i className="bi bi-arrow-right-short" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </article>

                        {/* Contact */}

                        <article className={styles.footerCard}>
                            <span className={styles.cardLabel}>{t(contactTitle)}</span>

                            <div className={styles.contactList}>
                                {site?.contactPhone && (
                                    <a
                                        href={`tel:${site.contactPhone}`}
                                        className={styles.contactItem}
                                    >
                                        <i className="bi bi-telephone-fill" />

                                        <span>{site.contactPhone}</span>
                                    </a>
                                )}

                                {site?.contactEmail && (
                                    <a
                                        href={`mailto:${site.contactEmail}`}
                                        className={styles.contactItem}
                                    >
                                        <i className="bi bi-envelope-fill" />

                                        <span>{site.contactEmail}</span>
                                    </a>
                                )}

                                <div className={styles.contactItem}>
                                    <i className="bi bi-geo-alt-fill" />

                                    <span>{t(address)}</span>
                                </div>
                            </div>
                        </article>

                        {/* Mobile Apps */}

                        {showAppDownload && (
                            <article className={styles.footerCard}>
                                <span className={styles.cardLabel}>{t(mobileAppsTitle)}</span>

                                <div className={styles.appButtons}>
                                    <a href={googlePlayHref} className={styles.storeButton}>
                                        <i className="bi bi-google-play" />

                                        <div>
                                            <small>Get it on</small>

                                            <strong>Google Play</strong>
                                        </div>

                                        <i className="bi bi-arrow-up-right" />
                                    </a>

                                    <a href={appStoreHref} className={styles.storeButton}>
                                        <i className="bi bi-apple" />

                                        <div>
                                            <small>Download on</small>

                                            <strong>App Store</strong>
                                        </div>

                                        <i className="bi bi-arrow-up-right" />
                                    </a>
                                </div>
                            </article>
                        )}
                    </div>
                </section>
                <div className={styles.footerBottom}>
                    <div className={styles.footerBottomLeft}>
                        <span className={styles.copyright}>
                            © {new Date().getFullYear()} {siteName}. {t(copyrightText)}
                        </span>
                    </div>

                    <nav className={styles.footerLegal} aria-label="Legal">
                        <Link href="/privacy">{t(privacyText)}</Link>

                        <span />

                        <Link href="/terms">{t(termsText)}</Link>

                        <span />

                        <Link href="/cookies">{t(cookiesText)}</Link>
                    </nav>

                    <div className={styles.footerBottomRight}>
                        <button type="button" className={styles.languageButton}>
                            <i className="bi bi-globe2" />

                            {t(languageLabel)}
                        </button>

                        <button
                            type="button"
                            className={styles.topButton}
                            onClick={() =>
                                window.scrollTo({
                                    top: 0,
                                    behavior: 'smooth',
                                })
                            }
                            aria-label="Back to top"
                        >
                            <i className="bi bi-arrow-up" />
                        </button>
                    </div>
                </div>
            </div>
        </footer>
    );
}

function createLocalizedTextField(key: keyof FooterService09Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createTextField(key: keyof FooterService09Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'text',
    };
}

function createCheckField(key: keyof FooterService09Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'check',
    };
}

function createInspector(): InspectorField[] {
    return [
        createLocalizedTextField('address', 'Address'),

        createLocalizedTextField('tagline', 'Brand Tagline'),

        createLocalizedTextField('ctaTitle', 'Newsletter Title'),

        createLocalizedTextField('ctaDescription', 'Newsletter Description'),

        createLocalizedTextField('newsletterBadge', 'Newsletter Badge'),

        createLocalizedTextField('subscriberCount', 'Subscriber Count'),

        createLocalizedTextField('subscriberText', 'Subscriber Text'),

        createLocalizedTextField('subscribeLabel', 'Subscribe Label'),

        createLocalizedTextField('subscribeTitle', 'Subscribe Title'),

        createLocalizedTextField('subscribePlaceholder', 'Email Placeholder'),

        createLocalizedTextField('subscribeButtonText', 'Subscribe Button'),

        createLocalizedTextField('subscribeLoadingText', 'Loading Text'),

        createLocalizedTextField('subscribeSuccessTitle', 'Success Title'),

        createLocalizedTextField('subscribeSuccessDescription', 'Success Description'),

        createLocalizedTextField('subscribeNote', 'Subscribe Note'),

        createLocalizedTextField('companyTitle', 'Company Title'),

        createLocalizedTextField('resourcesTitle', 'Resources Title'),

        createLocalizedTextField('contactTitle', 'Contact Title'),

        createLocalizedTextField('mobileAppsTitle', 'Apps Title'),

        createLocalizedTextField('privacyText', 'Privacy'),

        createLocalizedTextField('termsText', 'Terms'),

        createLocalizedTextField('cookiesText', 'Cookies'),

        createLocalizedTextField('languageLabel', 'Language'),

        createLocalizedTextField('copyrightText', 'Copyright'),

        createTextField('ctaButtonHref', 'CTA Button URL'),

        createTextField('googlePlayHref', 'Google Play URL'),

        createTextField('appStoreHref', 'App Store URL'),

        createCheckField('showAppDownload', 'Show Mobile Apps'),
    ];
}
/* ─────────────────────────────────────────────────
   Registry
───────────────────────────────────────────────── */
export const FOOTER_SERVICE_09: RegItem = {
    kind: 'FooterService09',

    label: 'Footer Service 09',

    defaults: DEFAULT_PROPS,

    inspector: createInspector(),

    render: (props) => <FooterService09 {...(props as FooterService09Props)} />,
};

export default FooterService09;
