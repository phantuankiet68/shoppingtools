'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/components/admin/shared/templates/services/headers/styles/header-service-09.module.css';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';
import { useSite } from '@/hooks/v1/useSiteHook';

import type { RegItem } from '@/lib/ui-builder/types';
const LOCALES = [
    {
        value: 'en',
        label: 'English',
        description: 'United States',
        flag: '/flags/us.png',
    },
    {
        value: 'vi',
        label: 'Tiếng Việt',
        description: 'Việt Nam',
        flag: '/flags/vn.png',
    },
    {
        value: 'ja',
        label: '日本語',
        description: 'Japan',
        flag: '/flags/jp.png',
    },
];
export type ServiceNavItem = {
    label: string;
    href: string;
    icon?: string | null;
    badge?: string;
    description?: string;
    children?: ServiceNavItem[];
};

export interface HeaderService09Props {
    siteId?: string;
    supportLabel?: LocalizedText;
    supportPhone?: string;
    wishlistText?: LocalizedText;
    wishlistHref?: string;
    checkoutText?: LocalizedText;
    checkoutHref?: string;
    logo?: string;
    logoTitle?: LocalizedText;
    loginTitle?: LocalizedText;
    loginSubtitle?: LocalizedText;
    loginHref?: string;
    offerTitle?: LocalizedText;
    offerSubtitle?: LocalizedText;
    offerHref?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    showTopbar?: boolean;
    showOfferCard?: boolean;
    showCheckout?: boolean;
    showLogin?: boolean;
}

function useSiteMenus(siteId?: string) {
    const [menus, setMenus] = useState<ServiceNavItem[]>([]);

    useEffect(() => {
        if (!siteId) {
            setMenus([]);
            return;
        }

        fetch(`/api/v1/sites/${siteId}/menus`)
            .then((res) => res.json())
            .then((data) => {
                setMenus(Array.isArray(data?.data) ? data.data : []);
            })
            .catch(() => {
                setMenus([]);
            });
    }, [siteId]);

    return menus;
}

export const DEFAULT_PROPS: Required<HeaderService09Props> = {
    siteId: '',

    supportLabel: {
        sourceLocale: 'en',
        default: 'Need Help?',
        translations: {
            vi: 'Cần hỗ trợ?',
            ja: 'サポートが必要ですか？',
        },
    },

    supportPhone: '023-444-6666-5678',

    wishlistText: {
        sourceLocale: 'en',
        default: 'Wishlist',
        translations: {
            vi: 'Yêu thích',
            ja: 'お気に入り',
        },
    },

    wishlistHref: '/wishlist',

    checkoutText: {
        sourceLocale: 'en',
        default: 'Checkout',
        translations: {
            vi: 'Thanh toán',
            ja: 'チェックアウト',
        },
    },

    checkoutHref: '/checkout',

    logo: '/assets/images/logo.png',

    logoTitle: {
        sourceLocale: 'en',
        default: 'ETRO STORES',
        translations: {
            vi: 'ETRO STORES',
            ja: 'ETRO STORES',
        },
    },

    loginTitle: {
        sourceLocale: 'en',
        default: 'Login',
        translations: {
            vi: 'Đăng nhập',
            ja: 'ログイン',
        },
    },

    loginSubtitle: {
        sourceLocale: 'en',
        default: 'Welcome Guest',
        translations: {
            vi: 'Chào mừng Quý khách',
            ja: 'ようこそ、ゲスト様',
        },
    },

    loginHref: '/login',

    offerTitle: {
        sourceLocale: 'en',
        default: 'Developer Docs',
        translations: {
            vi: 'Tài liệu dành cho lập trình viên',
            ja: '開発者向けドキュメント',
        },
    },

    offerSubtitle: {
        sourceLocale: 'en',
        default: 'Documentation',
        translations: {
            vi: 'Tài liệu hướng dẫn',
            ja: 'ドキュメント',
        },
    },

    offerHref: '/docs',

    primaryColor: '#7C3AED',
    secondaryColor: '#EC4899',
    accentColor: '#FF8A00',

    showTopbar: true,
    showOfferCard: true,
    showCheckout: true,
    showLogin: true,
};
function HeaderService09(props: HeaderService09Props) {
    const {
        siteId,
        supportLabel,
        supportPhone,
        wishlistText,
        wishlistHref,
        checkoutText,
        checkoutHref,
        logo,
        logoTitle,
        loginTitle,
        loginSubtitle,
        loginHref,
        offerTitle,
        offerSubtitle,
        offerHref,
        primaryColor,
        secondaryColor,
        accentColor,
        showTopbar,
        showOfferCard,
        showCheckout,
        showLogin,
    } = {
        ...DEFAULT_PROPS,
        ...props,
    };
    const site = useSite(siteId);
    const menus = useSiteMenus(siteId);

    const [mobileOpen, setMobileOpen] = useState(false);

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const pathname = usePathname();

    const siteLogo = site?.logoUrl || logo || '/assets/images/logo.png';
    const isActive = (href: string) => {
        if (href === '/') {
            return pathname === '/';
        }

        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const [languageOpen, setLanguageOpen] = useState(false);

    const [selectedLocale, setSelectedLocale] = useState(() => {
        if (typeof window === 'undefined') {
            return 'en';
        }

        return localStorage.getItem('locale') ?? 'en';
    });

    const currentLocale = LOCALES.find((item) => item.value === selectedLocale) ?? LOCALES[0];

    const languageRef = useRef<HTMLDivElement>(null);

    const siteName = site?.name ?? getLocalizedValue(logoTitle, selectedLocale);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
                setLanguageOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);
    useEffect(() => {
        function onEscape(e: KeyboardEvent) {
            if (e.key === 'Escape') {
                setLanguageOpen(false);
            }
        }

        document.addEventListener('keydown', onEscape);

        return () => {
            document.removeEventListener('keydown', onEscape);
        };
    }, []);

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
        <header
            className={`${styles.header} ${styles.sticky}`}
            style={
                {
                    '--primary': primaryColor,
                    '--secondary': secondaryColor,
                    '--accent': accentColor,
                } as React.CSSProperties
            }
        >
            {showTopbar && (
                <div className={styles.topbar}>
                    <div className={styles.container}>
                        <div className={styles.topbarLeft}>
                            <span>
                                <i className="bi bi-headset" />
                                {getLocalizedValue(supportLabel, selectedLocale)} {supportPhone}
                            </span>

                            <span className={styles.separator} />

                            <div ref={languageRef} className={styles.languageWrapper}>
                                <button
                                    type="button"
                                    className={styles.languageButton}
                                    onClick={() => setLanguageOpen((prev) => !prev)}
                                >
                                    <Image
                                        src={currentLocale.flag}
                                        alt={currentLocale.label}
                                        width={32}
                                        height={22}
                                        className={styles.flag}
                                    />

                                    <span className={styles.languageLabel}>
                                        {currentLocale.label}
                                    </span>

                                    <i
                                        className={`bi ${
                                            languageOpen ? 'bi-chevron-up' : 'bi-chevron-down'
                                        }`}
                                    />
                                </button>

                                {languageOpen && (
                                    <div className={styles.languageMenu}>
                                        {LOCALES.map((item) => {
                                            const active = item.value === selectedLocale;

                                            return (
                                                <button
                                                    key={item.value}
                                                    type="button"
                                                    className={`${styles.languageItem} ${
                                                        active ? styles.languageItemActive : ''
                                                    }`}
                                                    onClick={() => {
                                                        setSelectedLocale(item.value);
                                                        localStorage.setItem('locale', item.value);

                                                        window.dispatchEvent(
                                                            new CustomEvent('locale-change', {
                                                                detail: item.value,
                                                            }),
                                                        );

                                                        setLanguageOpen(false);
                                                    }}
                                                >
                                                    <div className={styles.languageItemLeft}>
                                                        <Image
                                                            src={item.flag}
                                                            alt={item.label}
                                                            width={32}
                                                            height={22}
                                                            className={styles.flag}
                                                        />

                                                        <div>
                                                            <strong>{item.label}</strong>
                                                        </div>
                                                    </div>

                                                    {active && <i className="bi bi-check2" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <span className={styles.separator} />
                        </div>

                        <div className={styles.topbarRight}>
                            <Link href={wishlistHref}>
                                <i className="bi bi-heart" />
                                {getLocalizedValue(wishlistText, selectedLocale)}
                            </Link>

                            <Link href={checkoutHref}>
                                <i className="bi bi-bag" />
                                {getLocalizedValue(checkoutText, selectedLocale)}
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* ================= MIDDLE ================= */}

            <div className={styles.middle}>
                <div className={styles.container}>
                    {/* Logo */}

                    <Link href="/" className={styles.logo}>
                        <Image
                            src={siteLogo}
                            alt={siteName}
                            width={60}
                            height={60}
                            className={styles.logoImage}
                            unoptimized
                        />
                    </Link>

                    {/* Search */}
                    <nav className={styles.menu}>
                        {menus.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.menuItem} ${
                                    isActive(item.href) ? styles.active : ''
                                }`}
                            >
                                {getMenuLabel(item.href, item.label, selectedLocale)}

                                {!!item.badge && (
                                    <span
                                        className={`${styles.badge} ${
                                            item.badge === 'HOT' ? styles.hot : styles.new
                                        }`}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </nav>
                    {/* Right */}

                    <div className={styles.rightArea}>
                        {showOfferCard && (
                            <Link href={offerHref} className={styles.offerCard}>
                                <div className={styles.offerIcon}>
                                    <i className="bi bi-gift" />
                                </div>

                                <div className={styles.offerContent}>
                                    <strong>
                                        {getLocalizedValue(offerSubtitle, selectedLocale)}
                                    </strong>
                                    <span>{getLocalizedValue(offerTitle, selectedLocale)}</span>
                                </div>

                                <i className="bi bi-chevron-right" />
                            </Link>
                        )}

                        {showLogin && (
                            <Link href={loginHref} className={styles.login}>
                                <div className={styles.avatar}>
                                    <i className="bi bi-person" />
                                </div>

                                <div>
                                    <strong>{getLocalizedValue(loginTitle, selectedLocale)}</strong>

                                    <span>{getLocalizedValue(loginSubtitle, selectedLocale)}</span>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* ================= MOBILE BUTTON ================= */}

            <button
                type="button"
                className={styles.mobileButton}
                onClick={() => setMobileOpen(!mobileOpen)}
            >
                <i className={`bi ${mobileOpen ? 'bi-x-lg' : 'bi-list'}`} />
            </button>

            {/* ================= MOBILE MENU ================= */}

            {mounted && mobileOpen && (
                <div className={styles.mobileMenu}>
                    <div className={styles.mobileNav}>
                        {menus.map((item) => (
                            <Link
                                key={`${item.label}-${item.href}`}
                                href={item.href}
                                className={styles.mobileItem}
                                onClick={() => setMobileOpen(false)}
                            >
                                <span>{getMenuLabel(item.href, item.label, selectedLocale)}</span>

                                {!!item.badge && (
                                    <span
                                        className={`${styles.badge} ${
                                            item.badge === 'HOT' ? styles.hot : styles.new
                                        }`}
                                    >
                                        {item.badge}
                                    </span>
                                )}
                            </Link>
                        ))}
                    </div>

                    <div className={styles.mobileActions}>
                        <Link href={wishlistHref}>
                            <i className="bi bi-heart" />
                            {getLocalizedValue(wishlistText, selectedLocale)}
                        </Link>

                        {showCheckout && (
                            <Link href={checkoutHref}>
                                <i className="bi bi-bag" />
                                {getLocalizedValue(checkoutText, selectedLocale)}
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}

function createTopbarInspector(): RegItem['inspector'] {
    return [
        {
            key: 'supportLabel',
            label: 'Support Label',
            kind: 'localized-text',
        },

        {
            key: 'supportPhone',
            label: 'Support Phone',
            kind: 'text',
        },

        {
            key: 'wishlistText',
            label: 'Wishlist Text',
            kind: 'localized-text',
        },

        {
            key: 'checkoutText',
            label: 'Checkout Text',
            kind: 'localized-text',
        },
    ];
}

function createLogoInspector(): RegItem['inspector'] {
    return [
        {
            key: 'logoTitle',
            label: 'Logo Title',
            kind: 'localized-text',
        },
        {
            key: 'logo',
            label: 'Logo',
            kind: 'image',
            folder: 'logos',
        },
    ];
}

function createLoginInspector(): RegItem['inspector'] {
    return [
        {
            key: 'loginTitle',
            label: 'Login Title',
            kind: 'localized-text',
        },

        {
            key: 'loginSubtitle',
            label: 'Login Subtitle',
            kind: 'localized-text',
        },

        {
            key: 'loginHref',
            label: 'Login Url',
            kind: 'text',
        },
    ];
}

function createOfferInspector(): RegItem['inspector'] {
    return [
        {
            key: 'offerTitle',
            label: 'Offer Title',
            kind: 'localized-text',
        },

        {
            key: 'offerSubtitle',
            label: 'Offer Subtitle',
            kind: 'localized-text',
        },

        {
            key: 'offerHref',
            label: 'Offer Url',
            kind: 'text',
        },
    ];
}

function createThemeInspector(): RegItem['inspector'] {
    return [
        {
            key: 'primaryColor',
            label: 'Primary Color',
            kind: 'text',
        },

        {
            key: 'secondaryColor',
            label: 'Secondary Color',
            kind: 'text',
        },

        {
            key: 'accentColor',
            label: 'Accent Color',
            kind: 'text',
        },
    ];
}

function createLayoutInspector(): RegItem['inspector'] {
    return [
        {
            key: 'showTopbar',
            label: 'Show Topbar',
            kind: 'check',
        },

        {
            key: 'showOfferCard',
            label: 'Show Offer Card',
            kind: 'check',
        },

        {
            key: 'showWishlist',
            label: 'Show Wishlist',
            kind: 'check',
        },

        {
            key: 'showCheckout',
            label: 'Show Checkout',
            kind: 'check',
        },

        {
            key: 'showLogin',
            label: 'Show Login',
            kind: 'check',
        },
    ];
}

function createInspector(): RegItem['inspector'] {
    return [
        ...createTopbarInspector(),

        ...createLoginInspector(),

        ...createOfferInspector(),

        ...createThemeInspector(),

        ...createLayoutInspector(),

        ...createLogoInspector(),
    ];
}
export const HEADER_SERVICE_09: RegItem = {
    kind: 'HeaderService09',

    label: 'Header Service 09',

    defaults: DEFAULT_PROPS,

    inspector: createInspector(),

    render: (props) => <HeaderService09 {...(props as HeaderService09Props)} />,
};
