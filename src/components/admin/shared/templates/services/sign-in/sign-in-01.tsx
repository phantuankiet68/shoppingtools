'use client';

import React from 'react';
import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';
import Image from 'next/image';
import type { RegItem, InspectorField } from '@/lib/ui-builder/types';
import { useRouter } from 'next/navigation';

import styles from '@/components/admin/shared/templates/services/sign-in/styles/sign-in-01.module.css';

export interface SignIn01Props {
    logoImage?: string;
    logoText?: LocalizedText;

    signinTitle?: LocalizedText;
    signinTitleAccent?: LocalizedText;
    signinDescription?: LocalizedText;

    signupTitle?: LocalizedText;
    signupTitleAccent?: LocalizedText;
    signupDescription?: LocalizedText;

    showGoogle?: boolean;
    showFacebook?: boolean;

    googleButtonText?: LocalizedText;
    googleButtonHref?: string;

    facebookButtonText?: LocalizedText;
    facebookButtonHref?: string;

    dividerText?: LocalizedText;

    signinEmailLabel?: LocalizedText;
    signinEmailPlaceholder?: LocalizedText;

    signinPasswordLabel?: LocalizedText;
    signinPasswordPlaceholder?: LocalizedText;

    rememberText?: LocalizedText;

    forgotPasswordText?: LocalizedText;
    forgotPasswordHref?: string;

    signinButtonText?: LocalizedText;
    signinLoadingText?: LocalizedText;

    signupNameLabel?: LocalizedText;
    signupNamePlaceholder?: LocalizedText;

    signupEmailLabel?: LocalizedText;
    signupEmailPlaceholder?: LocalizedText;

    signupPasswordLabel?: LocalizedText;
    signupPasswordPlaceholder?: LocalizedText;

    confirmPasswordLabel?: LocalizedText;
    confirmPasswordPlaceholder?: LocalizedText;

    acceptTermsText?: LocalizedText;

    signupButtonText?: LocalizedText;
    signupLoadingText?: LocalizedText;

    noAccountText?: LocalizedText;
    createAccountText?: LocalizedText;

    alreadyAccountText?: LocalizedText;
    signinLinkText?: LocalizedText;

    heroImage?: string;

    publishTitle?: LocalizedText;
    publishSubtitle?: LocalizedText;

    aiTitle?: LocalizedText;
    aiSubtitle?: LocalizedText;

    analyticsValue?: LocalizedText;
    analyticsLabel?: LocalizedText;

    stat1Value?: LocalizedText;
    stat1Label?: LocalizedText;

    stat2Value?: LocalizedText;
    stat2Label?: LocalizedText;

    stat3Value?: LocalizedText;
    stat3Label?: LocalizedText;

    stat4Value?: LocalizedText;
    stat4Label?: LocalizedText;

    passwordMismatchMessage?: LocalizedText;
    acceptTermsMessage?: LocalizedText;

    signinFailedMessage?: LocalizedText;
    signupFailedMessage?: LocalizedText;

    redirectAfterSignin?: string;
    redirectAfterSignup?: string;
}
export const DEFAULT_PROPS: Required<SignIn01Props> = {
    /* ==========================================================
       Branding
    ========================================================== */

    logoImage: '/assets/images/logo.png',

    logoText: {
        sourceLocale: 'en',
        default: 'Kbuilder',
        translations: {
            vi: 'Kbuilder',
            ja: 'Kbuilder',
        },
    },

    /* ==========================================================
       Hero
    ========================================================== */

    signinTitle: {
        sourceLocale: 'en',
        default: 'Welcome to',
        translations: {
            vi: 'Chào mừng đến với',
            ja: 'ようこそ',
        },
    },

    signinTitleAccent: {
        sourceLocale: 'en',
        default: 'Kbuilder',
        translations: {
            vi: 'Kbuilder',
            ja: 'Kbuilder',
        },
    },

    signinDescription: {
        sourceLocale: 'en',
        default:
            'Sign in to your account and start creating beautiful websites with our visual builder.',
        translations: {
            vi: 'Đăng nhập vào tài khoản để bắt đầu xây dựng website chuyên nghiệp bằng trình chỉnh sửa trực quan.',
            ja: 'アカウントにサインインして、ビジュアルビルダーで美しいウェブサイトを作成しましょう。',
        },
    },

    signupTitle: {
        sourceLocale: 'en',
        default: 'Create your',
        translations: {
            vi: 'Tạo',
            ja: '作成',
        },
    },

    signupTitleAccent: {
        sourceLocale: 'en',
        default: 'Account',
        translations: {
            vi: 'Tài khoản',
            ja: 'アカウント',
        },
    },

    signupDescription: {
        sourceLocale: 'en',
        default: 'Create your Kbuilder account and start building beautiful websites in minutes.',
        translations: {
            vi: 'Tạo tài khoản Kbuilder và bắt đầu xây dựng website chuyên nghiệp chỉ trong vài phút.',
            ja: 'Kbuilderアカウントを作成し、数分で美しいウェブサイトを構築しましょう。',
        },
    },

    /* ==========================================================
       Social Login
    ========================================================== */

    showGoogle: true,

    showFacebook: true,

    googleButtonText: {
        sourceLocale: 'en',
        default: 'Continue with Google',
        translations: {
            vi: 'Tiếp tục với Google',
            ja: 'Googleで続行',
        },
    },

    googleButtonHref: '/api/v1/auth/google',

    facebookButtonText: {
        sourceLocale: 'en',
        default: 'Continue with Facebook',
        translations: {
            vi: 'Tiếp tục với Facebook',
            ja: 'Facebookで続行',
        },
    },

    facebookButtonHref: '/api/v1/auth/facebook',

    dividerText: {
        sourceLocale: 'en',
        default: 'Or continue with email',
        translations: {
            vi: 'Hoặc tiếp tục bằng email',
            ja: 'またはメールで続行',
        },
    },

    /* ==========================================================
       Sign In Form
    ========================================================== */

    signinEmailLabel: {
        sourceLocale: 'en',
        default: 'Email Address',
        translations: {
            vi: 'Địa chỉ Email',
            ja: 'メールアドレス',
        },
    },

    signinEmailPlaceholder: {
        sourceLocale: 'en',
        default: 'example@mail.com',
        translations: {
            vi: 'example@mail.com',
            ja: 'example@mail.com',
        },
    },

    signinPasswordLabel: {
        sourceLocale: 'en',
        default: 'Password',
        translations: {
            vi: 'Mật khẩu',
            ja: 'パスワード',
        },
    },

    signinPasswordPlaceholder: {
        sourceLocale: 'en',
        default: 'Enter your password',
        translations: {
            vi: 'Nhập mật khẩu',
            ja: 'パスワードを入力',
        },
    },

    rememberText: {
        sourceLocale: 'en',
        default: 'Remember me',
        translations: {
            vi: 'Ghi nhớ đăng nhập',
            ja: 'ログイン状態を保持',
        },
    },

    forgotPasswordText: {
        sourceLocale: 'en',
        default: 'Forgot password?',
        translations: {
            vi: 'Quên mật khẩu?',
            ja: 'パスワードをお忘れですか？',
        },
    },

    forgotPasswordHref: '/forgot-password',

    signinButtonText: {
        sourceLocale: 'en',
        default: 'Sign In',
        translations: {
            vi: 'Đăng nhập',
            ja: 'ログイン',
        },
    },

    signinLoadingText: {
        sourceLocale: 'en',
        default: 'Signing In...',
        translations: {
            vi: 'Đang đăng nhập...',
            ja: 'ログイン中...',
        },
    },

    /* ==========================================================
       Sign Up Form
    ========================================================== */

    signupNameLabel: {
        sourceLocale: 'en',
        default: 'Full Name',
        translations: {
            vi: 'Họ và tên',
            ja: '氏名',
        },
    },

    signupNamePlaceholder: {
        sourceLocale: 'en',
        default: 'John Doe',
        translations: {
            vi: 'Nguyễn Văn A',
            ja: '山田 太郎',
        },
    },

    signupEmailLabel: {
        sourceLocale: 'en',
        default: 'Email Address',
        translations: {
            vi: 'Địa chỉ Email',
            ja: 'メールアドレス',
        },
    },

    signupEmailPlaceholder: {
        sourceLocale: 'en',
        default: 'example@mail.com',
        translations: {
            vi: 'example@mail.com',
            ja: 'example@mail.com',
        },
    },

    signupPasswordLabel: {
        sourceLocale: 'en',
        default: 'Password',
        translations: {
            vi: 'Mật khẩu',
            ja: 'パスワード',
        },
    },

    signupPasswordPlaceholder: {
        sourceLocale: 'en',
        default: 'Create password',
        translations: {
            vi: 'Tạo mật khẩu',
            ja: 'パスワードを作成',
        },
    },

    confirmPasswordLabel: {
        sourceLocale: 'en',
        default: 'Confirm Password',
        translations: {
            vi: 'Xác nhận mật khẩu',
            ja: 'パスワード確認',
        },
    },

    confirmPasswordPlaceholder: {
        sourceLocale: 'en',
        default: 'Confirm password',
        translations: {
            vi: 'Nhập lại mật khẩu',
            ja: 'パスワードを再入力',
        },
    },

    acceptTermsText: {
        sourceLocale: 'en',
        default: 'I agree to the Terms & Conditions',
        translations: {
            vi: 'Tôi đồng ý với Điều khoản & Điều kiện',
            ja: '利用規約に同意します',
        },
    },

    signupButtonText: {
        sourceLocale: 'en',
        default: 'Create Account',
        translations: {
            vi: 'Tạo tài khoản',
            ja: 'アカウントを作成',
        },
    },

    signupLoadingText: {
        sourceLocale: 'en',
        default: 'Creating Account...',
        translations: {
            vi: 'Đang tạo tài khoản...',
            ja: 'アカウントを作成中...',
        },
    },

    /* ==========================================================
       Footer Switch
    ========================================================== */

    noAccountText: {
        sourceLocale: 'en',
        default: "Don't have an account?",
        translations: {
            vi: 'Chưa có tài khoản?',
            ja: 'アカウントをお持ちではありませんか？',
        },
    },

    createAccountText: {
        sourceLocale: 'en',
        default: 'Create Account',
        translations: {
            vi: 'Tạo tài khoản',
            ja: 'アカウントを作成',
        },
    },

    alreadyAccountText: {
        sourceLocale: 'en',
        default: 'Already have an account?',
        translations: {
            vi: 'Đã có tài khoản?',
            ja: 'すでにアカウントをお持ちですか？',
        },
    },

    signinLinkText: {
        sourceLocale: 'en',
        default: 'Sign In',
        translations: {
            vi: 'Đăng nhập',
            ja: 'ログイン',
        },
    },

    /* ==========================================================
       Hero Image
    ========================================================== */

    heroImage: '/assets/images/hero-builder.png',

    /* ==========================================================
       Publish Card
    ========================================================== */

    publishTitle: {
        sourceLocale: 'en',
        default: 'Publish',
        translations: {
            vi: 'Xuất bản',
            ja: '公開',
        },
    },

    publishSubtitle: {
        sourceLocale: 'en',
        default: 'One Click Deploy',
        translations: {
            vi: 'Triển khai chỉ với một lần nhấp',
            ja: 'ワンクリックデプロイ',
        },
    },

    /* ==========================================================
       AI Card
    ========================================================== */

    aiTitle: {
        sourceLocale: 'en',
        default: 'AI Builder',
        translations: {
            vi: 'AI Builder',
            ja: 'AIビルダー',
        },
    },

    aiSubtitle: {
        sourceLocale: 'en',
        default: 'Create Faster',
        translations: {
            vi: 'Xây dựng nhanh hơn',
            ja: 'より速く作成',
        },
    },

    /* ==========================================================
       Analytics Card
    ========================================================== */

    analyticsValue: {
        sourceLocale: 'en',
        default: '+48%',
        translations: {
            vi: '+48%',
            ja: '+48%',
        },
    },

    analyticsLabel: {
        sourceLocale: 'en',
        default: 'Traffic',
        translations: {
            vi: 'Lưu lượng',
            ja: 'トラフィック',
        },
    },

    /* ==========================================================
       Statistics
    ========================================================== */

    stat1Value: {
        sourceLocale: 'en',
        default: '18K+',
        translations: {
            vi: '18K+',
            ja: '18K+',
        },
    },

    stat1Label: {
        sourceLocale: 'en',
        default: 'Users',
        translations: {
            vi: 'Người dùng',
            ja: 'ユーザー',
        },
    },

    stat2Value: {
        sourceLocale: 'en',
        default: '10K+',
        translations: {
            vi: '10K+',
            ja: '10K+',
        },
    },

    stat2Label: {
        sourceLocale: 'en',
        default: 'Websites',
        translations: {
            vi: 'Website',
            ja: 'ウェブサイト',
        },
    },

    stat3Value: {
        sourceLocale: 'en',
        default: '4.9/5',
        translations: {
            vi: '4.9/5',
            ja: '4.9/5',
        },
    },

    stat3Label: {
        sourceLocale: 'en',
        default: 'Rating',
        translations: {
            vi: 'Đánh giá',
            ja: '評価',
        },
    },

    stat4Value: {
        sourceLocale: 'en',
        default: '99.9%',
        translations: {
            vi: '99.9%',
            ja: '99.9%',
        },
    },

    stat4Label: {
        sourceLocale: 'en',
        default: 'Uptime',
        translations: {
            vi: 'Thời gian hoạt động',
            ja: '稼働率',
        },
    },

    /* ==========================================================
       Messages
    ========================================================== */

    passwordMismatchMessage: {
        sourceLocale: 'en',
        default: 'Passwords do not match.',
        translations: {
            vi: 'Mật khẩu xác nhận không khớp.',
            ja: 'パスワードが一致しません。',
        },
    },

    acceptTermsMessage: {
        sourceLocale: 'en',
        default: 'Please accept the Terms of Service.',
        translations: {
            vi: 'Vui lòng đồng ý với Điều khoản dịch vụ.',
            ja: '利用規約に同意してください。',
        },
    },

    signinFailedMessage: {
        sourceLocale: 'en',
        default: 'Unable to sign in.',
        translations: {
            vi: 'Không thể đăng nhập.',
            ja: 'ログインできません。',
        },
    },

    signupFailedMessage: {
        sourceLocale: 'en',
        default: 'Unable to create account.',
        translations: {
            vi: 'Không thể tạo tài khoản.',
            ja: 'アカウントを作成できません。',
        },
    },

    /* ==========================================================
       Redirect
    ========================================================== */

    redirectAfterSignin: '/',

    redirectAfterSignup: '/',
};

export function SignIn01(props: SignIn01Props) {
    const mergedProps: Required<SignIn01Props> = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const {
        logoImage,
        logoText,

        signinTitle,
        signinTitleAccent,
        signinDescription,

        signupTitle,
        signupTitleAccent,
        signupDescription,

        showGoogle,
        showFacebook,

        googleButtonText,
        googleButtonHref,

        facebookButtonText,
        facebookButtonHref,

        dividerText,
        signinEmailLabel,
        signinEmailPlaceholder,

        signinPasswordLabel,
        signinPasswordPlaceholder,

        rememberText,

        forgotPasswordText,
        forgotPasswordHref,

        signinButtonText,
        signinLoadingText,

        signupNameLabel,
        signupNamePlaceholder,

        signupEmailLabel,
        signupEmailPlaceholder,

        signupPasswordLabel,
        signupPasswordPlaceholder,

        confirmPasswordLabel,
        confirmPasswordPlaceholder,

        acceptTermsText,

        signupButtonText,
        signupLoadingText,

        noAccountText,
        createAccountText,

        alreadyAccountText,
        signinLinkText,

        heroImage,

        publishTitle,
        publishSubtitle,

        aiTitle,
        aiSubtitle,

        analyticsValue,
        analyticsLabel,

        stat1Value,
        stat1Label,

        stat2Value,
        stat2Label,

        stat3Value,
        stat3Label,

        stat4Value,
        stat4Label,

        passwordMismatchMessage,
        acceptTermsMessage,

        signinFailedMessage,
        signupFailedMessage,

        redirectAfterSignin,
        redirectAfterSignup,
    } = mergedProps;

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

    const t = useCallback(
        (value: LocalizedText) => getLocalizedValue(value, selectedLocale),
        [selectedLocale],
    );

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [fullName, setFullName] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [acceptTerms, setAcceptTerms] = useState(false);

    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const router = useRouter();

    const [mode, setMode] = useState<'signin' | 'signup'>('signin');

    useEffect(() => {
        setError('');

        setPassword('');
        setSignupPassword('');
        setConfirmPassword('');

        setShowPassword(false);
        setShowSignupPassword(false);
        setShowConfirmPassword(false);

        setRememberMe(false);
        setAcceptTerms(false);
    }, [mode]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (loading) return;

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/v1/auth/signin', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                    rememberMe,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message ?? 'Sign in failed.');
            }
            setError('');
            router.refresh();
            const next = new URLSearchParams(window.location.search).get('next');

            if (next) {
                router.replace(next);
                return;
            }
            router.refresh();

            window.location.href = '/';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to sign in.');
        } finally {
            setLoading(false);
        }
    };
    const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (loading) return;

        if (signupPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (!acceptTerms) {
            setError('Please accept the Terms of Service.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/v1/auth/signup', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fullName,
                    email: signupEmail,
                    password: signupPassword,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message ?? 'Unable to create account.');
            }
            router.refresh();
            window.location.href = '/';
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unable to create account.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <main className={styles.page}>
                <div className={styles.background}>
                    <span className={styles.blurOne} />
                    <span className={styles.blurTwo} />
                    <span className={styles.blurThree} />
                </div>

                <div className={styles.container}>
                    <section className={styles.left}>
                        {/* Logo */}
                        <div className={styles.logo}>
                            <Image src={logoImage} alt={t(logoText)} width={46} height={46} />

                            <div className={styles.header}>
                                <h1>
                                    {mode === 'signin' ? (
                                        <>
                                            {t(signinTitle)}
                                            <span>{t(signinTitleAccent)}</span>
                                        </>
                                    ) : (
                                        <>
                                            {t(signupTitle)}
                                            <span>{t(signupTitleAccent)}</span>
                                        </>
                                    )}
                                </h1>
                            </div>
                        </div>

                        {/* Heading */}
                        <p>{mode === 'signin' ? t(signinDescription) : t(signupDescription)}</p>

                        {/* Social Login */}
                        <div className={styles.social}>
                            {showGoogle && (
                                <button
                                    type="button"
                                    className={styles.socialButtonGoogle}
                                    onClick={() => {
                                        if (!googleButtonHref) return;

                                        window.location.href = googleButtonHref;
                                    }}
                                >
                                    <i className="bi bi-google" />
                                    <span>{t(googleButtonText)}</span>
                                </button>
                            )}

                            {showFacebook && (
                                <button
                                    type="button"
                                    className={styles.socialButton}
                                    onClick={() => {
                                        if (!facebookButtonHref) return;

                                        window.location.href = facebookButtonHref;
                                    }}
                                >
                                    <i className="bi bi-facebook" />
                                    <span>{t(facebookButtonText)}</span>
                                </button>
                            )}
                        </div>

                        {/* Divider */}
                        <div className={styles.divider}>
                            <span />
                            <p>{t(dividerText)}</p>
                            <span />
                        </div>
                        <div className={styles.formWrapper}>
                            {mode === 'signin' ? (
                                <form className={styles.form} onSubmit={handleSubmit}>
                                    <div className={styles.field}>
                                        <label>{t(signinEmailLabel)}</label>

                                        <div className={styles.input}>
                                            <i className="bi bi-envelope" />

                                            <input
                                                type="email"
                                                placeholder={t(signinEmailPlaceholder)}
                                                autoComplete="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className={styles.field}>
                                        <label>{t(signinPasswordLabel)}</label>
                                        <div className={styles.input}>
                                            <i className="bi bi-lock" />

                                            <input
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder={t(signinPasswordPlaceholder)}
                                                autoComplete="current-password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                required
                                            />

                                            <button
                                                type="button"
                                                className={styles.eye}
                                                onClick={() => setShowPassword((v) => !v)}
                                            >
                                                <i
                                                    className={`bi ${
                                                        showPassword ? 'bi-eye' : 'bi-eye-slash'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className={styles.actions}>
                                        <label className={styles.checkbox}>
                                            <input
                                                type="checkbox"
                                                checked={rememberMe}
                                                onChange={(e) => setRememberMe(e.target.checked)}
                                            />
                                            <span>Remember me</span>
                                        </label>

                                        <Link href={forgotPasswordHref}>
                                            {t(forgotPasswordText)}
                                        </Link>
                                    </div>
                                    {error && (
                                        <div className={styles.errorMessage}>
                                            <i className="bi bi-exclamation-circle-fill" />
                                            <span>{error}</span>
                                        </div>
                                    )}
                                    {/* Login */}
                                    <button
                                        type="submit"
                                        className={styles.loginButton}
                                        disabled={loading}
                                    >
                                        <span>
                                            {loading ? t(signinLoadingText) : t(signinButtonText)}
                                        </span>

                                        <i className="bi bi-arrow-right" />
                                    </button>
                                </form>
                            ) : (
                                <form className={styles.form} onSubmit={handleSignup}>
                                    {/* Full Name */}

                                    <div className={styles.field}>
                                        <label>{t(signupNameLabel)}</label>

                                        <div className={styles.input}>
                                            <i className="bi bi-person" />

                                            <input
                                                type="text"
                                                placeholder={t(signupNamePlaceholder)}
                                                value={fullName}
                                                onChange={(e) => setFullName(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Email */}

                                    <div className={styles.field}>
                                        <label>{t(signupEmailLabel)}</label>

                                        <div className={styles.input}>
                                            <i className="bi bi-envelope" />

                                            <input
                                                type="email"
                                                placeholder={t(signupEmailPlaceholder)}
                                                value={signupEmail}
                                                onChange={(e) => setSignupEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Password */}

                                    <div className={styles.field}>
                                        <label>{t(signupPasswordLabel)}</label>

                                        <div className={styles.input}>
                                            <i className="bi bi-lock" />

                                            <input
                                                type={showSignupPassword ? 'text' : 'password'}
                                                placeholder={t(signupPasswordPlaceholder)}
                                                value={signupPassword}
                                                onChange={(e) => setSignupPassword(e.target.value)}
                                                required
                                            />

                                            <button
                                                type="button"
                                                className={styles.eye}
                                                onClick={() => setShowSignupPassword((v) => !v)}
                                            >
                                                <i
                                                    className={`bi ${
                                                        showSignupPassword
                                                            ? 'bi-eye'
                                                            : 'bi-eye-slash'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm */}

                                    <div className={styles.field}>
                                        <label>{t(confirmPasswordLabel)}</label>

                                        <div className={styles.input}>
                                            <i className="bi bi-shield-lock" />

                                            <input
                                                type={showConfirmPassword ? 'text' : 'password'}
                                                placeholder={t(confirmPasswordPlaceholder)}
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                required
                                            />

                                            <button
                                                type="button"
                                                className={styles.eye}
                                                onClick={() => setShowConfirmPassword((v) => !v)}
                                            >
                                                <i
                                                    className={`bi ${
                                                        showConfirmPassword
                                                            ? 'bi-eye'
                                                            : 'bi-eye-slash'
                                                    }`}
                                                />
                                            </button>
                                        </div>
                                    </div>

                                    <label className={styles.checkbox}>
                                        <input
                                            type="checkbox"
                                            checked={acceptTerms}
                                            onChange={(e) => setAcceptTerms(e.target.checked)}
                                        />

                                        <span>{t(acceptTermsText)}</span>
                                    </label>

                                    {error && (
                                        <div className={styles.errorMessage}>
                                            <i className="bi bi-exclamation-circle-fill" />
                                            <span>{error}</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        className={styles.loginButton}
                                        disabled={loading}
                                    >
                                        <span>
                                            {loading ? t(signupLoadingText) : t(signupButtonText)}
                                        </span>

                                        <i className="bi bi-arrow-right" />
                                    </button>
                                </form>
                            )}
                        </div>
                        <div className={styles.footer}>
                            {mode === 'signin' ? (
                                <>
                                    <span>{t(noAccountText)}</span>

                                    <button
                                        type="button"
                                        className={styles.linkButton}
                                        onClick={() => setMode('signup')}
                                    >
                                        {t(createAccountText)}
                                    </button>
                                </>
                            ) : (
                                <>
                                    <span>{t(alreadyAccountText)}</span>

                                    <button
                                        type="button"
                                        className={styles.linkButton}
                                        onClick={() => setMode('signin')}
                                    >
                                        {t(signinLinkText)}
                                    </button>
                                </>
                            )}
                        </div>
                    </section>

                    <section className={styles.right}>
                        {/* Background */}
                        <div className={styles.heroBackground}>
                            <span className={styles.blurTop} />
                            <span className={styles.blurBottom} />
                            <span className={styles.heroCircle} />
                            <span className={styles.heroDots} />
                        </div>

                        {/* Main Preview */}
                        <div className={styles.preview}>
                            <Image
                                src={heroImage}
                                alt={t(logoText)}
                                width={860}
                                height={700}
                                priority
                            />
                        </div>

                        {/* Floating Publish */}
                        <div className={styles.cardPublish}>
                            <div className={styles.cardIcon}>
                                <i className="bi bi-cloud-upload-fill" />
                            </div>

                            <div>
                                <strong>{t(publishTitle)}</strong>
                                <span>{t(publishSubtitle)}</span>
                            </div>
                        </div>

                        {/* Floating AI */}
                        <div className={styles.cardAI}>
                            <div className={styles.cardIcon}>
                                <i className="bi bi-stars" />
                            </div>

                            <div>
                                <strong>{t(aiTitle)}</strong>
                                <span>{t(aiSubtitle)}</span>
                            </div>
                        </div>

                        {/* Floating Analytics */}
                        <div className={styles.cardAnalytics}>
                            <div className={styles.chart}>
                                <span />
                                <span />
                                <span />
                                <span />
                            </div>

                            <div className={styles.analyticsContent}>
                                <strong>{t(analyticsValue)}</strong>
                                <span>{t(analyticsLabel)}</span>
                            </div>
                        </div>

                        {/* Floating Image */}
                        <div className={styles.imageCard}>
                            <i className="bi bi-image-fill" />
                        </div>

                        {/* Floating Cursor */}
                        <div className={styles.cursorCard}>
                            <i className="bi bi-cursor-fill" />
                        </div>

                        {/* Bottom Stats */}
                        <div className={styles.stats}>
                            <div className={styles.stat}>
                                <i className="bi bi-people" />
                                <div>
                                    <strong>{t(stat1Value)}</strong>
                                    <span>{t(stat1Label)}</span>
                                </div>
                            </div>

                            <div className={styles.stat}>
                                <i className="bi bi-globe2" />
                                <div>
                                    <strong>{t(stat2Value)}</strong>
                                    <span>{t(stat2Label)}</span>
                                </div>
                            </div>

                            <div className={styles.stat}>
                                <i className="bi bi-star-fill" />
                                <div>
                                    <strong>{t(stat3Value)}</strong>
                                    <span>{t(stat3Label)}</span>
                                </div>
                            </div>

                            <div className={styles.stat}>
                                <i className="bi bi-lightning-charge-fill" />
                                <div>
                                    <strong>{t(stat4Value)}</strong>
                                    <span>{t(stat4Label)}</span>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </>
    );
}

function createTextField(key: string, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createTextareaField(key: string, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createCheckField(key: string, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'check',
    };
}
export interface SelectOption {
    label: string;
    value: string;
}

function createBrandingInspector(): InspectorField[] {
    return [
        {
            key: 'logoImage',
            label: 'Logo Image',
            kind: 'image',
            folder: 'signin',
        },
        createTextField('logoText', 'Logo Text'),
    ];
}
function createHeroInspector(): InspectorField[] {
    return [
        createTextField('signinTitle', 'Sign In Title'),
        createTextField('signinTitleAccent', 'Sign In Accent'),
        createTextareaField('signinDescription', 'Sign In Description'),

        createTextField('signupTitle', 'Sign Up Title'),
        createTextField('signupTitleAccent', 'Sign Up Accent'),
        createTextareaField('signupDescription', 'Sign Up Description'),

        {
            key: 'heroImage',
            label: 'Hero Image',
            kind: 'image',
            folder: 'signin',
        },
    ];
}

function createSocialInspector(): InspectorField[] {
    return [
        createCheckField('showGoogle', 'Show Google'),
        createCheckField('showFacebook', 'Show Facebook'),

        createTextField('googleButtonText', 'Google Button'),
        {
            key: 'googleButtonHref',
            label: 'Google URL',
            kind: 'text',
        },

        createTextField('facebookButtonText', 'Facebook Button'),
        {
            key: 'facebookButtonHref',
            label: 'Facebook URL',
            kind: 'text',
        },

        createTextField('dividerText', 'Divider'),
    ];
}

function createSigninInspector(): InspectorField[] {
    return [
        createTextField('signinEmailLabel', 'Email Label'),
        createTextField('signinEmailPlaceholder', 'Email Placeholder'),

        createTextField('signinPasswordLabel', 'Password Label'),
        createTextField('signinPasswordPlaceholder', 'Password Placeholder'),

        createTextField('rememberText', 'Remember Text'),

        createTextField('forgotPasswordText', 'Forgot Password'),

        {
            key: 'forgotPasswordHref',
            label: 'Forgot Password URL',
            kind: 'text',
        },

        createTextField('signinButtonText', 'Button'),

        createTextField('signinLoadingText', 'Loading'),
    ];
}

function createSignupInspector(): InspectorField[] {
    return [
        createTextField('signupNameLabel', 'Name Label'),
        createTextField('signupNamePlaceholder', 'Name Placeholder'),

        createTextField('signupEmailLabel', 'Email Label'),
        createTextField('signupEmailPlaceholder', 'Email Placeholder'),

        createTextField('signupPasswordLabel', 'Password Label'),
        createTextField('signupPasswordPlaceholder', 'Password Placeholder'),

        createTextField('confirmPasswordLabel', 'Confirm Label'),
        createTextField('confirmPasswordPlaceholder', 'Confirm Placeholder'),

        createTextField('acceptTermsText', 'Terms'),

        createTextField('signupButtonText', 'Button'),
        createTextField('signupLoadingText', 'Loading'),
    ];
}
function createFooterInspector(): InspectorField[] {
    return [
        createTextField('noAccountText', 'No Account'),

        createTextField('createAccountText', 'Create Account'),

        createTextField('alreadyAccountText', 'Already Account'),

        createTextField('signinLinkText', 'Sign In'),
    ];
}

function createHeroCardInspector(): InspectorField[] {
    return [
        createTextField('publishTitle', 'Publish Title'),
        createTextField('publishSubtitle', 'Publish Subtitle'),

        createTextField('aiTitle', 'AI Title'),
        createTextField('aiSubtitle', 'AI Subtitle'),

        createTextField('analyticsValue', 'Analytics Value'),
        createTextField('analyticsLabel', 'Analytics Label'),
    ];
}

function createStatisticsInspector(): InspectorField[] {
    return [
        createTextField('stat1Value', 'Stat 1 Value'),
        createTextField('stat1Label', 'Stat 1 Label'),

        createTextField('stat2Value', 'Stat 2 Value'),
        createTextField('stat2Label', 'Stat 2 Label'),

        createTextField('stat3Value', 'Stat 3 Value'),
        createTextField('stat3Label', 'Stat 3 Label'),

        createTextField('stat4Value', 'Stat 4 Value'),
        createTextField('stat4Label', 'Stat 4 Label'),
    ];
}
function createMessageInspector(): InspectorField[] {
    return [
        createTextField('passwordMismatchMessage', 'Password Mismatch'),

        createTextField('acceptTermsMessage', 'Accept Terms'),

        createTextField('signinFailedMessage', 'Sign In Failed'),

        createTextField('signupFailedMessage', 'Sign Up Failed'),
    ];
}

function createRedirectInspector(): InspectorField[] {
    return [
        {
            key: 'redirectAfterSignin',
            label: 'Redirect After Sign In',
            kind: 'text',
        },

        {
            key: 'redirectAfterSignup',
            label: 'Redirect After Sign Up',
            kind: 'text',
        },
    ];
}

function createInspector(): RegItem['inspector'] {
    return [
        ...createBrandingInspector(),
        ...createHeroInspector(),
        ...createSocialInspector(),
        ...createSigninInspector(),
        ...createSignupInspector(),
        ...createFooterInspector(),
        ...createHeroCardInspector(),
        ...createStatisticsInspector(),
        ...createMessageInspector(),
        ...createRedirectInspector(),
    ];
}
export const SIGN_IN_01: RegItem = {
    kind: 'sign-in-01',

    label: 'Sign In 01',

    defaults: DEFAULT_PROPS,

    inspector: createInspector(),

    render: (props) => <SignIn01 {...(props as SignIn01Props)} />,
};

export default SignIn01;
