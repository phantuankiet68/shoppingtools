'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '@/components/admin/shared/templates/services/headers/styles/header-service-01.module.css';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';
import { useSite } from '@/hooks/v1/useSiteHook';
import { useAuth } from '@/components/admin/providers/auth-provider';
import type { RegItem, InspectorField } from '@/lib/ui-builder/types';

const LOCALES = [
    { value: 'en', label: 'English', description: 'United States', flag: '/flags/us.png' },
    { value: 'vi', label: 'Tiếng Việt', description: 'Việt Nam', flag: '/flags/vn.png' },
    { value: 'ja', label: '日本語', description: 'Japan', flag: '/flags/jp.png' },
];

export type MenuTranslation = {
    vi: string;
    ja: string;
};

export type ServiceNavItem = {
    label: string;
    href: string;
    icon?: string | null;
    badge?: string;
    description?: string;
    children?: ServiceNavItem[];
};

export interface HeaderService01Props {
    siteId?: string;
    supportLabel?: LocalizedText;
    supportPhone?: string;
    wishlistText?: LocalizedText;
    wishlistHref?: string;
    checkoutText?: LocalizedText;
    checkoutHref?: string;
    logo?: string;
    logoTitle?: LocalizedText;
    logoSubtitle?: LocalizedText;
    loginTitle?: LocalizedText;
    loginSubtitle?: LocalizedText;
    loginHref?: string;
    offerTitle?: LocalizedText;
    offerSubtitle?: LocalizedText;
    offerHref?: string;
    searchPlaceholder?: LocalizedText;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    showTopbar?: boolean;
    showOfferCard?: boolean;
    showWishlist?: boolean;
    showCheckout?: boolean;
    showLogin?: boolean;
    profileText?: LocalizedText;
    profileHref?: string;
    accountText?: LocalizedText;
    accountHref?: string;
    logoutText?: LocalizedText;
}

function useSiteMenus(siteId?: string) {
    const [menus, setMenus] = useState<ServiceNavItem[]>([]);

    useEffect(() => {
        if (!siteId) {
            setMenus([]);
            return;
        }

        const controller = new AbortController();

        async function loadMenus() {
            try {
                const res = await fetch(`/api/v1/sites/${siteId}/menus`, {
                    signal: controller.signal,
                });
                if (!res.ok) throw new Error('Failed to load menus');
                const data = await res.json();
                setMenus(Array.isArray(data?.data) ? data.data : []);
            } catch (error) {
                if ((error as Error).name !== 'AbortError') setMenus([]);
            }
        }

        loadMenus();
        return () => controller.abort();
    }, [siteId]);

    return menus;
}

function localeText(en: string, vi: string, ja: string): LocalizedText {
    return {
        sourceLocale: 'en',
        default: en,
        translations: { vi, ja },
    };
}

export const DEFAULT_PROPS: Required<HeaderService01Props> = {
    siteId: '',
    supportLabel: localeText('Need Help?', 'Cần hỗ trợ?', 'サポートが必要ですか？'),
    supportPhone: '023-444-6666-5678',
    wishlistText: localeText('Wishlist', 'Yêu thích', 'お気に入り'),
    wishlistHref: '/wishlist',
    checkoutText: localeText('Checkout', 'Thanh toán', 'チェックアウト'),
    checkoutHref: '/checkout',
    logo: '/assets/images/logo.png',
    logoTitle: localeText('KBuilder', 'KBuilder', 'KBuilder'),
    logoSubtitle: localeText('Website Builder', 'Trình xây dựng website', 'ウェブサイトビルダー'),
    loginTitle: localeText('Login', 'Đăng nhập', 'ログイン'),
    loginSubtitle: localeText('Welcome Guest', 'Chào mừng Quý khách', 'ようこそ、ゲスト様'),
    loginHref: '/sign-in',
    offerTitle: localeText(
        'Developer Docs',
        'Tài liệu dành cho lập trình viên',
        '開発者向けドキュメント',
    ),
    offerSubtitle: localeText('Documentation', 'Tài liệu hướng dẫn', 'ドキュメント'),
    offerHref: '/docs',
    searchPlaceholder: localeText(
        'Search templates, features, guides...',
        'Tìm kiếm template, tính năng, hướng dẫn...',
        'テンプレート、機能、ガイドを検索...',
    ),
    primaryColor: '#4F8FF7',
    secondaryColor: '#A855F7',
    accentColor: '#7C5CFC',
    showTopbar: true,
    showOfferCard: true,
    showWishlist: true,
    showCheckout: true,
    showLogin: true,
    profileText: localeText('My Profile', 'Hồ sơ của tôi', 'マイプロフィール'),
    profileHref: '/profile',
    accountText: localeText('Change Password', 'Đổi mật khẩu', 'パスワード変更'),
    accountHref: '/change-password',
    logoutText: localeText('Sign Out', 'Đăng xuất', 'ログアウト'),
};

export function menuTranslation(vi: string, ja: string): MenuTranslation {
    return { vi, ja };
}

function themeStyle(primary: string, secondary: string, accent: string): React.CSSProperties {
    return {
        '--primary': primary,
        '--secondary': secondary,
        '--accent': accent,
    } as React.CSSProperties;
}

function renderBadge(badge?: string) {
    if (!badge) return null;
    return (
        <span className={`${styles.badge} ${badge === 'HOT' ? styles.hot : styles.new}`}>
            {badge}
        </span>
    );
}

const MENU_TRANSLATIONS = {
    '/': menuTranslation('Trang chủ', 'ホーム'),
    '/service': menuTranslation('Dịch vụ', 'サービス'),
    '/project': menuTranslation('Dự án', 'プロジェクト'),
    '/about': menuTranslation('Giới thiệu', '会社概要'),
    '/pricing': menuTranslation('Bảng giá', '料金'),
    '/blog': menuTranslation('Blog', 'ブログ'),
    '/contact': menuTranslation('Liên hệ', 'お問い合わせ'),
} as const;

const MENU_ICONS: Record<string, string> = {
    '/': 'bi-house-door-fill',
    '/service': 'bi-grid-fill',
    '/project': 'bi-folder2-open',
    '/about': 'bi-info-circle',
    '/pricing': 'bi-crown',
    '/blog': 'bi-journal-text',
    '/contact': 'bi-chat-dots',
};

function getMenuIcon(href: string, fallback?: string | null) {
    return fallback || MENU_ICONS[href] || 'bi-circle';
}

function HeaderService01(props: HeaderService01Props) {
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
        logoSubtitle,
        loginTitle,
        loginSubtitle,
        loginHref,
        offerTitle,
        offerSubtitle,
        offerHref,
        searchPlaceholder,
        primaryColor,
        secondaryColor,
        accentColor,
        showTopbar,
        showOfferCard,
        showWishlist,
        showCheckout,
        showLogin,
        profileHref,
        profileText,
        accountHref,
        accountText,
        logoutText,
    } = { ...DEFAULT_PROPS, ...props };

    const site = useSite(siteId);
    const menus = useSiteMenus(siteId);
    const pathname = usePathname();
    const { user, loading, logout } = useAuth();

    const [mobileOpen, setMobileOpen] = useState(false);
    const [languageOpen, setLanguageOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [selectedLocale, setSelectedLocale] = useState(() => {
        if (typeof window === 'undefined') return 'en';
        return localStorage.getItem('locale') ?? 'en';
    });

    const languageRef = useRef<HTMLDivElement>(null);
    const searchRef = useRef<HTMLInputElement>(null);

    const currentLocale = LOCALES.find((item) => item.value === selectedLocale) ?? LOCALES[0];
    const siteLogo = site?.logoUrl || logo || '/assets/images/logo.png';
    const siteName = site?.name ?? getLocalizedValue(logoTitle, selectedLocale);

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (languageRef.current && !languageRef.current.contains(event.target as Node)) {
                setLanguageOpen(false);
            }
        }

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        function onEscape(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                setLanguageOpen(false);
                setMobileOpen(false);
                searchRef.current?.blur();
            }

            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                searchRef.current?.focus();
            }
        }

        document.addEventListener('keydown', onEscape);
        return () => document.removeEventListener('keydown', onEscape);
    }, []);

    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    function getMenuLabel(href: string, fallback: string, locale: string) {
        if (locale === 'en') return fallback;
        return (
            MENU_TRANSLATIONS[href as keyof typeof MENU_TRANSLATIONS]?.[locale as 'vi' | 'ja'] ??
            fallback
        );
    }

    function handleLocaleChange(locale: string) {
        setSelectedLocale(locale);
        localStorage.setItem('locale', locale);
        window.dispatchEvent(new CustomEvent('locale-change', { detail: locale }));
        setLanguageOpen(false);
    }

    function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (!searchValue.trim()) {
            searchRef.current?.focus();
            return;
        }
        const query = encodeURIComponent(searchValue.trim());
        window.location.href = `/search?q=${query}`;
    }

    function renderUserMenu() {
        if (loading) return null;

        if (user) {
            return (
                <div className={styles.userMenu}>
                    <button type="button" className={styles.userButton} aria-label="Account">
                        <Image
                            src={user.avatar ?? '/assets/images/avatar.png'}
                            alt={user.name ?? 'User Avatar'}
                            width={34}
                            height={34}
                            className={styles.userAvatar}
                        />
                        <span className={styles.userInfo}>
                            <strong>{user.name}</strong>
                            <small>{user.systemRole}</small>
                        </span>
                        <i className="bi bi-chevron-down" />
                    </button>

                    <div className={styles.dropdown}>
                        <Link href={profileHref}>
                            <i className="bi bi-person" />
                            {getLocalizedValue(profileText, selectedLocale)}
                        </Link>
                        <Link href={accountHref}>
                            <i className="bi bi-gear" />
                            {getLocalizedValue(accountText, selectedLocale)}
                        </Link>
                        <button type="button" onClick={logout}>
                            <i className="bi bi-box-arrow-right" />
                            {getLocalizedValue(logoutText, selectedLocale)}
                        </button>
                    </div>
                </div>
            );
        }

        if (!showLogin) return null;

        return (
            <Link href={loginHref} className={styles.login}>
                <span className={styles.avatar}>
                    <i className="bi bi-person" />
                </span>
                <span className={styles.loginText}>
                    <strong>{getLocalizedValue(loginTitle, selectedLocale)}</strong>
                    <small>{getLocalizedValue(loginSubtitle, selectedLocale)}</small>
                </span>
            </Link>
        );
    }

    return (
        <header
            className={`${styles.header} ${styles.sticky}`}
            style={themeStyle(primaryColor, secondaryColor, accentColor)}
        >
            <div className={styles.headerGlow} />

            {showTopbar && (
                <div className={styles.topbar}>
                    <div className={styles.container}>
                        <div className={styles.topbarLeft}>
                            <span className={styles.support}>
                                <i className="bi bi-headset" />
                                <span>{getLocalizedValue(supportLabel, selectedLocale)}</span>
                                <b>{supportPhone}</b>
                            </span>

                            <span className={styles.separator} />

                            <div ref={languageRef} className={styles.languageWrapper}>
                                <button
                                    type="button"
                                    className={styles.languageButton}
                                    onClick={() => setLanguageOpen((prev) => !prev)}
                                    aria-expanded={languageOpen}
                                >
                                    <Image
                                        src={currentLocale.flag}
                                        alt={currentLocale.label}
                                        width={22}
                                        height={15}
                                        className={styles.flag}
                                    />
                                    <span>{currentLocale.label}</span>
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
                                                    onClick={() => handleLocaleChange(item.value)}
                                                >
                                                    <span className={styles.languageItemLeft}>
                                                        <Image
                                                            src={item.flag}
                                                            alt={item.label}
                                                            width={24}
                                                            height={16}
                                                            className={styles.flag}
                                                        />
                                                        <span>
                                                            <strong>{item.label}</strong>
                                                            <small>{item.description}</small>
                                                        </span>
                                                    </span>
                                                    {active && <i className="bi bi-check2" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className={styles.topbarRight}>
                            {showWishlist && (
                                <Link href={wishlistHref} className={styles.topbarAction}>
                                    <i className="bi bi-heart" />
                                    <span>{getLocalizedValue(wishlistText, selectedLocale)}</span>
                                </Link>
                            )}

                            {showCheckout && (
                                <Link href={checkoutHref} className={styles.topbarAction}>
                                    <i className="bi bi-bag" />
                                    <span>{getLocalizedValue(checkoutText, selectedLocale)}</span>
                                </Link>
                            )}

                            {(showWishlist || showCheckout) && (
                                <span className={styles.userDivider} />
                            )}

                            {renderUserMenu()}
                        </div>
                    </div>
                </div>
            )}

            <div className={styles.mainShell}>
                <div className={styles.mainInner}>
                    <Link href="/" className={styles.logo} aria-label={siteName}>
                        <span className={styles.logoMark}>
                            <Image
                                src={siteLogo}
                                alt={siteName}
                                width={44}
                                height={44}
                                className={styles.logoImage}
                                unoptimized
                            />
                        </span>
                        <span className={styles.logoContent}>
                            <strong>{siteName}</strong>
                            <small>{getLocalizedValue(logoSubtitle, selectedLocale)}</small>
                        </span>
                    </Link>

                    <nav className={styles.menu} aria-label="Main navigation">
                        {menus.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`${styles.menuItem} ${
                                    isActive(item.href) ? styles.active : ''
                                }`}
                            >
                                <i className={`bi ${getMenuIcon(item.href, item.icon)}`} />
                                <span>{getMenuLabel(item.href, item.label, selectedLocale)}</span>
                                {renderBadge(item.badge)}
                            </Link>
                        ))}
                    </nav>

                    <form className={styles.searchWrapper} onSubmit={handleSearchSubmit}>
                        <div className={styles.searchBox}>
                            <i className="bi bi-search" />
                            <input
                                ref={searchRef}
                                type="search"
                                value={searchValue}
                                onChange={(event) => setSearchValue(event.target.value)}
                                placeholder={getLocalizedValue(searchPlaceholder, selectedLocale)}
                                aria-label={getLocalizedValue(searchPlaceholder, selectedLocale)}
                            />
                        </div>
                    </form>

                    {showOfferCard && (
                        <Link href={offerHref} className={styles.offerCard}>
                            <span className={styles.offerIcon}>
                                <i className="bi bi-gift-fill" />
                            </span>
                            <span className={styles.offerContent}>
                                <strong>{getLocalizedValue(offerSubtitle, selectedLocale)}</strong>
                                <small>{getLocalizedValue(offerTitle, selectedLocale)}</small>
                            </span>
                            <i className="bi bi-chevron-right" />
                        </Link>
                    )}
                </div>
            </div>

            <button
                type="button"
                className={styles.mobileButton}
                onClick={() => setMobileOpen((prev) => !prev)}
                aria-label="Toggle navigation"
                aria-expanded={mobileOpen}
            >
                <i className={`bi ${mobileOpen ? 'bi-x-lg' : 'bi-list'}`} />
            </button>

            {mobileOpen && (
                <div className={styles.mobileMenu}>
                    <form className={styles.mobileSearch} onSubmit={handleSearchSubmit}>
                        <i className="bi bi-search" />
                        <input
                            type="search"
                            value={searchValue}
                            onChange={(event) => setSearchValue(event.target.value)}
                            placeholder={getLocalizedValue(searchPlaceholder, selectedLocale)}
                        />
                    </form>

                    <nav className={styles.mobileNav}>
                        {menus.map((item) => (
                            <Link
                                key={`${item.label}-${item.href}`}
                                href={item.href}
                                className={`${styles.mobileItem} ${
                                    isActive(item.href) ? styles.mobileItemActive : ''
                                }`}
                                onClick={() => setMobileOpen(false)}
                            >
                                <span className={styles.mobileItemLabel}>
                                    <i className={`bi ${getMenuIcon(item.href, item.icon)}`} />
                                    <span>
                                        {getMenuLabel(item.href, item.label, selectedLocale)}
                                    </span>
                                </span>
                                {renderBadge(item.badge)}
                            </Link>
                        ))}
                    </nav>

                    <div className={styles.mobileActions}>
                        {showWishlist && (
                            <Link href={wishlistHref}>
                                <i className="bi bi-heart" />
                                {getLocalizedValue(wishlistText, selectedLocale)}
                            </Link>
                        )}
                        {showCheckout && (
                            <Link href={checkoutHref}>
                                <i className="bi bi-bag" />
                                {getLocalizedValue(checkoutText, selectedLocale)}
                            </Link>
                        )}
                        {renderUserMenu()}
                    </div>
                </div>
            )}
        </header>
    );
}

function textField(key: string, label: string): InspectorField {
    return { key, label, kind: 'text' };
}

function localizedTextField(key: string, label: string): InspectorField {
    return { key, label, kind: 'localized-text' };
}

function checkField(key: string, label: string): InspectorField {
    return { key, label, kind: 'check' };
}

function imageField(key: string, label: string, folder?: string): InspectorField {
    return { key, label, kind: 'image', folder };
}

function createAccountInspector(): RegItem['inspector'] {
    return [
        localizedTextField('profileText', 'Profile Text'),
        textField('profileHref', 'Profile Url'),
        localizedTextField('accountText', 'Account Text'),
        textField('accountHref', 'Account Url'),
        localizedTextField('logoutText', 'Logout Text'),
    ];
}

function createTopbarInspector(): RegItem['inspector'] {
    return [
        localizedTextField('supportLabel', 'Support Label'),
        textField('supportPhone', 'Support Phone'),
        localizedTextField('wishlistText', 'Wishlist Text'),
        localizedTextField('checkoutText', 'Checkout Text'),
    ];
}

function createLogoInspector(): RegItem['inspector'] {
    return [
        localizedTextField('logoTitle', 'Logo Title'),
        localizedTextField('logoSubtitle', 'Logo Subtitle'),
        imageField('logo', 'Logo', 'logos'),
    ];
}

function createLoginInspector(): RegItem['inspector'] {
    return [
        localizedTextField('loginTitle', 'Login Title'),
        localizedTextField('loginSubtitle', 'Login Subtitle'),
        textField('loginHref', 'Login Url'),
    ];
}

function createOfferInspector(): RegItem['inspector'] {
    return [
        localizedTextField('offerTitle', 'Offer Title'),
        localizedTextField('offerSubtitle', 'Offer Subtitle'),
        localizedTextField('searchPlaceholder', 'Search Placeholder'),
        textField('offerHref', 'Offer Url'),
    ];
}

function createThemeInspector(): RegItem['inspector'] {
    return [
        textField('primaryColor', 'Primary Color'),
        textField('secondaryColor', 'Secondary Color'),
        textField('accentColor', 'Accent Color'),
    ];
}

function createLayoutInspector(): RegItem['inspector'] {
    return [
        checkField('showTopbar', 'Show Topbar'),
        checkField('showOfferCard', 'Show Offer Card'),
        checkField('showWishlist', 'Show Wishlist'),
        checkField('showCheckout', 'Show Checkout'),
        checkField('showLogin', 'Show Login'),
    ];
}

function inspectorGroup(...groups: RegItem['inspector'][]): RegItem['inspector'] {
    return groups.flat();
}

function createInspector(): RegItem['inspector'] {
    return inspectorGroup(
        createTopbarInspector(),
        createLoginInspector(),
        createOfferInspector(),
        createThemeInspector(),
        createLayoutInspector(),
        createLogoInspector(),
        createAccountInspector(),
    );
}

export const HEADER_SERVICE_01: RegItem = {
    kind: 'header-service-01',
    label: 'Header Service 01',
    defaults: DEFAULT_PROPS,
    inspector: createInspector(),
    render: (props) => <HeaderService01 {...(props as HeaderService01Props)} />,
};
