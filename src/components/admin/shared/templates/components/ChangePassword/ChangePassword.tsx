'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { RegItem, InspectorField } from '@/lib/ui-builder/types';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';
import {
    changePassword,
    resendChangePassword,
    verifyChangePassword,
} from '@/hooks/v1/change-password/account';
import styles from '@/components/admin/shared/templates/components/ChangePassword/styles/ChangePassword.module.css';

const STEP_PASSWORD = 1;
const STEP_VERIFY = 2;
const STEP_SUCCESS = 3;

const TOTAL_STEPS = 3;

const OTP_LENGTH = 6;

const PASSWORD_RULE_COUNT = 5;

export interface ChangePassword01Props {
    siteId?: string;

    // Header
    headerTitle?: LocalizedText;
    headerSubtitle?: LocalizedText;
    stepLabel?: LocalizedText;
    ofLabel?: LocalizedText;

    // Stepper
    stepPassword?: LocalizedText;
    stepVerify?: LocalizedText;
    stepCompleted?: LocalizedText;

    // Password
    currentPasswordLabel?: LocalizedText;
    currentPasswordPlaceholder?: LocalizedText;

    newPasswordLabel?: LocalizedText;
    newPasswordPlaceholder?: LocalizedText;

    confirmPasswordLabel?: LocalizedText;
    confirmPasswordPlaceholder?: LocalizedText;

    passwordStrengthLabel?: LocalizedText;

    passwordRuleMinLength?: LocalizedText;
    passwordRuleUppercase?: LocalizedText;
    passwordRuleLowercase?: LocalizedText;
    passwordRuleNumber?: LocalizedText;
    passwordRuleSpecial?: LocalizedText;

    continueButton?: LocalizedText;
    cancelButton?: LocalizedText;

    // Verify
    verifyTitle?: LocalizedText;
    verifyDescription?: LocalizedText;

    verificationSentTitle?: LocalizedText;
    verificationSentDescription?: LocalizedText;

    resendCodeButton?: LocalizedText;
    verifyButton?: LocalizedText;
    backButton?: LocalizedText;

    securityNoticeTitle?: LocalizedText;
    securityNoticeDescription?: LocalizedText;

    // Success
    successTitle?: LocalizedText;
    successDescription?: LocalizedText;

    securityUpdatedLabel?: LocalizedText;
    justNowLabel?: LocalizedText;

    continueDashboardButton?: LocalizedText;

    // Messages
    unknownErrorMessage?: LocalizedText;
    supportLabel?: LocalizedText;
}

interface PasswordRule {
    label: LocalizedText;
    valid: boolean;
}

interface OtpInputProps {
    disabled: boolean;
}

interface PasswordInputProps {
    label: LocalizedText;
    placeholder: LocalizedText;
    value: string;
    visible: boolean;
    readOnly?: boolean;
    onChange: (value: string) => void;
    toggleVisible: () => void;
}

function localeText(en: string, vi: string, ja: string): LocalizedText {
    return {
        sourceLocale: 'en',
        default: en,
        translations: {
            vi,
            ja,
        },
    };
}

export const DEFAULT_PROPS: Required<ChangePassword01Props> = {
    siteId: '',

    // =====================
    // Header
    // =====================
    headerTitle: localeText('Change Your Password', 'Đổi mật khẩu', 'パスワードを変更'),
    headerSubtitle: localeText('Security Center', 'Trung tâm bảo mật', 'セキュリティセンター'),
    stepLabel: localeText('STEP', 'BƯỚC', 'ステップ'),
    ofLabel: localeText('OF', 'TRÊN', '／'),

    // =====================
    // Stepper
    // =====================
    stepPassword: localeText('Change Password', 'Đổi mật khẩu', 'パスワード変更'),
    stepVerify: localeText('Verify Identity', 'Xác minh', '本人確認'),
    stepCompleted: localeText('Completed', 'Hoàn tất', '完了'),

    // =====================
    // Password Form
    // =====================
    currentPasswordLabel: localeText('Current Password', 'Mật khẩu hiện tại', '現在のパスワード'),
    currentPasswordPlaceholder: localeText(
        'Enter your current password',
        'Nhập mật khẩu hiện tại',
        '現在のパスワードを入力してください',
    ),

    newPasswordLabel: localeText('New Password', 'Mật khẩu mới', '新しいパスワード'),
    newPasswordPlaceholder: localeText(
        'Enter your new password',
        'Nhập mật khẩu mới',
        '新しいパスワードを入力してください',
    ),

    confirmPasswordLabel: localeText('Confirm Password', 'Xác nhận mật khẩu', 'パスワードを確認'),
    confirmPasswordPlaceholder: localeText(
        'Re-enter your new password',
        'Nhập lại mật khẩu mới',
        '新しいパスワードを再入力してください',
    ),

    passwordStrengthLabel: localeText('Password Strength', 'Độ mạnh mật khẩu', 'パスワード強度'),

    passwordRuleMinLength: localeText('Minimum 8 characters', 'Ít nhất 8 ký tự', '8文字以上'),
    passwordRuleUppercase: localeText('Contains uppercase letter', 'Có chữ in hoa', '大文字を含む'),
    passwordRuleLowercase: localeText('Contains lowercase letter', 'Có chữ thường', '小文字を含む'),
    passwordRuleNumber: localeText('Contains a number', 'Có ít nhất một số', '数字を含む'),
    passwordRuleSpecial: localeText(
        'Contains special character',
        'Có ký tự đặc biệt',
        '特殊文字を含む',
    ),

    continueButton: localeText('Continue', 'Tiếp tục', '続行'),
    cancelButton: localeText('Cancel', 'Hủy', 'キャンセル'),
    // =====================
    // Verify Step
    // =====================
    verifyTitle: localeText('Verify Your Identity', 'Xác minh danh tính', '本人確認'),
    verifyDescription: localeText(
        'We have sent a verification code to your registered email address. Enter the code below to continue.',
        'Chúng tôi đã gửi mã xác minh đến email đã đăng ký. Vui lòng nhập mã để tiếp tục.',
        '登録済みのメールアドレスに認証コードを送信しました。続行するには入力してください。',
    ),

    verificationSentTitle: localeText(
        'Verification Code Sent',
        'Đã gửi mã xác minh',
        '認証コードを送信しました',
    ),
    verificationSentDescription: localeText(
        'Check your inbox and spam folder if you cannot find the email.',
        'Hãy kiểm tra hộp thư đến và cả thư rác nếu bạn chưa thấy email.',
        '受信トレイと迷惑メールフォルダをご確認ください。',
    ),

    resendCodeButton: localeText('Resend Code', 'Gửi lại mã', 'コードを再送信'),
    verifyButton: localeText('Verify', 'Xác minh', '認証'),
    backButton: localeText('Back', 'Quay lại', '戻る'),

    securityNoticeTitle: localeText('Security Notice', 'Lưu ý bảo mật', 'セキュリティ通知'),
    securityNoticeDescription: localeText(
        'For your security, the verification code expires after a short period of time.',
        'Để đảm bảo an toàn, mã xác minh sẽ hết hạn sau một khoảng thời gian ngắn.',
        'セキュリティ保護のため、認証コードは一定時間後に失効します。',
    ),

    // =====================
    // Success Step
    // =====================
    successTitle: localeText(
        'Password Updated',
        'Đổi mật khẩu thành công',
        'パスワードが更新されました',
    ),
    successDescription: localeText(
        'Your password has been updated successfully. You can now continue using your account securely.',
        'Mật khẩu của bạn đã được cập nhật thành công. Bạn có thể tiếp tục sử dụng tài khoản một cách an toàn.',
        'パスワードが正常に更新されました。安全にアカウントをご利用いただけます。',
    ),

    securityUpdatedLabel: localeText(
        'Security Updated',
        'Đã cập nhật bảo mật',
        'セキュリティ更新済み',
    ),
    justNowLabel: localeText('Just Now', 'Vừa xong', 'たった今'),

    continueDashboardButton: localeText(
        'Continue to Dashboard',
        'Tiếp tục đến bảng điều khiển',
        'ダッシュボードへ進む',
    ),

    // =====================
    // Messages
    // =====================
    unknownErrorMessage: localeText(
        'Something went wrong. Please try again.',
        'Đã xảy ra lỗi. Vui lòng thử lại.',
        'エラーが発生しました。もう一度お試しください。',
    ),

    supportLabel: localeText('Need Help?', 'Cần hỗ trợ?', 'サポートが必要ですか？'),
};

function ChangePassword01(props: ChangePassword01Props) {
    const mergedProps: Required<ChangePassword01Props> = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const {
        siteId,

        // Header
        headerTitle,
        headerSubtitle,
        stepLabel,
        ofLabel,

        // Stepper
        stepPassword,
        stepVerify,
        stepCompleted,

        // Password
        currentPasswordLabel,
        currentPasswordPlaceholder,

        newPasswordLabel,
        newPasswordPlaceholder,

        confirmPasswordLabel,
        confirmPasswordPlaceholder,

        passwordStrengthLabel,

        passwordRuleMinLength,
        passwordRuleUppercase,
        passwordRuleLowercase,
        passwordRuleNumber,
        passwordRuleSpecial,

        continueButton,
        cancelButton,

        // Verify
        verifyTitle,
        verifyDescription,

        verificationSentTitle,
        verificationSentDescription,

        resendCodeButton,
        verifyButton,
        backButton,

        securityNoticeTitle,
        securityNoticeDescription,

        // Success
        successTitle,
        successDescription,

        securityUpdatedLabel,
        justNowLabel,

        continueDashboardButton,

        // Messages
        unknownErrorMessage,

        supportLabel,
    } = mergedProps;

    const STEP_PASSWORD = 1;
    const STEP_VERIFY = 2;
    const STEP_SUCCESS = 3;

    const [step, setStep] = useState(STEP_PASSWORD);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');

    const [verificationId, setVerificationId] = useState('');

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [otp, setOtp] = useState<string[]>(Array(OTP_LENGTH).fill(''));

    const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const router = useRouter();

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

    const getPasswordRules = useCallback(
        (password: string): PasswordRule[] => [
            {
                label: passwordRuleMinLength,
                valid: password.length >= 8,
            },
            {
                label: passwordRuleUppercase,
                valid: /[A-Z]/.test(password),
            },
            {
                label: passwordRuleLowercase,
                valid: /[a-z]/.test(password),
            },
            {
                label: passwordRuleNumber,
                valid: /\d/.test(password),
            },
            {
                label: passwordRuleSpecial,
                valid: /[^A-Za-z0-9]/.test(password),
            },
        ],
        [
            passwordRuleMinLength,
            passwordRuleUppercase,
            passwordRuleLowercase,
            passwordRuleNumber,
            passwordRuleSpecial,
        ],
    );

    const passwordRules = useMemo(
        () => getPasswordRules(newPassword),
        [getPasswordRules, newPassword],
    );

    const passwordStrength = useMemo(
        () => passwordRules.filter((rule) => rule.valid).length,
        [passwordRules],
    );

    const handleRequestChangePassword = useCallback(async () => {
        if (loading) return;

        try {
            setLoading(true);
            setError('');

            const result = await changePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });

            setVerificationId(result.verificationId);

            setStep(2);
        } catch (err) {
            setError(err instanceof Error ? err.message : t(unknownErrorMessage));
        } finally {
            setLoading(false);
        }
    }, [loading, currentPassword, newPassword, confirmPassword, unknownErrorMessage, t]);

    const handleVerifyOtp = useCallback(async () => {
        if (loading) return;

        try {
            setLoading(true);
            setError('');

            await verifyChangePassword({
                verificationId,
                otp: otp.join(''),
            });

            setStep(TOTAL_STEPS);
        } catch (err) {
            setError(err instanceof Error ? err.message : t(unknownErrorMessage));
        } finally {
            setLoading(false);
        }
    }, [loading, verificationId, otp, unknownErrorMessage, t]);

    const handleResendOtp = useCallback(async () => {
        if (loading) return;

        try {
            setLoading(true);
            setError('');

            await resendChangePassword();
        } catch (err) {
            setError(err instanceof Error ? err.message : t(unknownErrorMessage));
        } finally {
            setLoading(false);
        }
    }, [loading, unknownErrorMessage, t]);

    function handleOtpChange(index: number, value: string) {
        if (!/^\d*$/.test(value)) return;

        const digit = value.slice(-1);

        const next = [...otp];

        next[index] = digit;

        setOtp(next);

        if (digit && index < 5) {
            const input = document.getElementById(`otp-${index + 1}`) as HTMLInputElement | null;

            input?.focus();
        }
    }

    function handleOtpKeyDown(index: number, event: React.KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Backspace' && !otp[index] && index > 0) {
            const input = document.getElementById(`otp-${index - 1}`) as HTMLInputElement | null;

            input?.focus();
        }
    }

    function handleOtpPaste(event: React.ClipboardEvent<HTMLInputElement>) {
        event.preventDefault();

        const paste = event.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);

        if (!paste) return;

        const values = [...otp];

        paste.split('').forEach((char, index) => {
            values[index] = char;
        });

        setOtp(values);
    }

    function renderHeader() {
        return (
            <div className={styles.header}>
                <div className={styles.brand}>
                    <div className={styles.brandIcon}>
                        <i className="bi bi-shield-lock-fill" />
                    </div>

                    <div>
                        <h2>{t(headerTitle)}</h2>

                        <span>{t(headerSubtitle)}</span>
                    </div>
                </div>

                <div className={styles.stepIndicator}>
                    {t(stepLabel)} {step} {t(ofLabel)} {TOTAL_STEPS}
                </div>
            </div>
        );
    }

    function renderStepper() {
        const items = [stepPassword, stepVerify, stepCompleted];

        return (
            <div className={styles.stepper}>
                {items.map((item, index) => {
                    const active = step >= index + 1;

                    return (
                        <div className={styles.stepItem} key={item.default}>
                            <div
                                className={`${styles.stepCircle} ${
                                    active ? styles.stepCircleActive : ''
                                }`}
                            >
                                {step > index + 1 ? <i className="bi bi-check-lg" /> : index + 1}
                            </div>

                            {index !== items.length - 1 && (
                                <div
                                    className={`${styles.stepLine} ${
                                        step > index + 1 ? styles.stepLineActive : ''
                                    }`}
                                />
                            )}

                            <span>{t(item)}</span>
                        </div>
                    );
                })}
            </div>
        );
    }

    function PasswordInput({
        label,
        placeholder,
        value,
        onChange,
        visible,
        toggleVisible,
        readOnly,
    }: PasswordInputProps) {
        return (
            <div className={styles.inputGroup}>
                <label>{t(label)}</label>

                <div className={styles.passwordInput}>
                    <i className={`bi bi-lock-fill ${styles.inputIcon}`} />

                    <input
                        type={visible ? 'text' : 'password'}
                        placeholder={t(placeholder)}
                        value={value}
                        readOnly={readOnly}
                        onChange={(e) => onChange(e.target.value)}
                    />

                    <button type="button" onClick={toggleVisible}>
                        <i className={`bi ${visible ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`} />
                    </button>
                </div>
            </div>
        );
    }

    function renderPasswordStrength() {
        return (
            <div className={styles.passwordStrength}>
                <div className={styles.passwordStrengthHeader}>
                    <span>{t(passwordStrengthLabel)}</span>

                    <strong>
                        {passwordStrength}/{PASSWORD_RULE_COUNT}
                    </strong>
                </div>

                <div className={styles.strengthBars}>
                    {Array.from({ length: PASSWORD_RULE_COUNT }, (_, index) => (
                        <span
                            key={index}
                            className={passwordStrength > index ? styles.barActive : ''}
                        />
                    ))}
                </div>

                <div className={styles.ruleList}>
                    {passwordRules.map((rule) => (
                        <div
                            key={rule.label.default}
                            className={`${styles.ruleItem} ${rule.valid ? styles.ruleValid : ''}`}
                        >
                            <i
                                className={`bi ${
                                    rule.valid ? 'bi-check-circle-fill' : 'bi-circle'
                                }`}
                            />

                            <span>{t(rule.label)}</span>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    function StepCard({
        title,
        active,
        completed,
        children,
    }: {
        title: LocalizedText;
        active: boolean;
        completed: boolean;
        children: React.ReactNode;
    }) {
        return (
            <section
                className={`
                ${styles.stepCard}
                ${active ? styles.stepCardActive : ''}
                ${completed ? styles.stepCardCompleted : ''}
            `}
            >
                <div className={styles.stepCardHeader}>
                    <div className={styles.stepCardBadge}>
                        {completed ? (
                            <i className="bi bi-check-lg" />
                        ) : (
                            <i className="bi bi-circle-fill" />
                        )}
                    </div>

                    <h3>{t(title)}</h3>
                </div>

                {children}
            </section>
        );
    }

    function renderPasswordStep() {
        const readOnly = step > STEP_PASSWORD;

        return (
            <div className={styles.content}>
                <div className={styles.form}>
                    <PasswordInput
                        label={currentPasswordLabel}
                        placeholder={currentPasswordPlaceholder}
                        value={currentPassword}
                        onChange={setCurrentPassword}
                        visible={showCurrentPassword}
                        toggleVisible={() => setShowCurrentPassword((prev) => !prev)}
                        readOnly={readOnly}
                    />

                    <PasswordInput
                        label={newPasswordLabel}
                        placeholder={newPasswordPlaceholder}
                        value={newPassword}
                        onChange={setNewPassword}
                        visible={showNewPassword}
                        toggleVisible={() => setShowNewPassword((prev) => !prev)}
                        readOnly={readOnly}
                    />

                    <PasswordInput
                        label={confirmPasswordLabel}
                        placeholder={confirmPasswordPlaceholder}
                        value={confirmPassword}
                        onChange={setConfirmPassword}
                        visible={showConfirmPassword}
                        toggleVisible={() => setShowConfirmPassword((prev) => !prev)}
                        readOnly={readOnly}
                    />

                    {renderPasswordStrength()}
                </div>

                <div className={styles.footer}>
                    <button className={styles.secondaryButton} type="button">
                        {t(cancelButton)}
                    </button>

                    <button
                        className={styles.primaryButton}
                        type="button"
                        onClick={handleRequestChangePassword}
                        disabled={loading}
                    >
                        {t(continueButton)}
                        <i className="bi bi-arrow-right" />
                    </button>
                </div>
            </div>
        );
    }

    function OTPInput({ disabled }: OtpInputProps) {
        return (
            <div className={styles.otpWrapper}>
                {Array.from({ length: OTP_LENGTH }, (_, index) => (
                    <input
                        key={index}
                        ref={(element) => {
                            otpRefs.current[index] = element;
                        }}
                        className={styles.otpInput}
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={1}
                        value={otp[index]}
                        aria-label={`OTP ${index + 1}`}
                        readOnly={disabled}
                        onPaste={handleOtpPaste}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    />
                ))}
            </div>
        );
    }

    function renderVerifyStep() {
        const readOnly = step > STEP_VERIFY;

        return (
            <div className={styles.content}>
                <div className={styles.pageTitle}>
                    <h1>{t(verifyTitle)}</h1>

                    <p>{t(verifyDescription)}</p>
                </div>

                <div className={styles.verifyCard}>
                    <div className={styles.successAlert}>
                        <i className="bi bi-envelope-check-fill" />

                        <div>
                            <strong>{t(verificationSentTitle)}</strong>

                            <span>{t(verificationSentDescription)}</span>
                        </div>
                    </div>

                    <OTPInput disabled={readOnly} />

                    <button
                        type="button"
                        className={styles.resendButton}
                        onClick={handleResendOtp}
                        disabled={loading}
                    >
                        {t(resendCodeButton)}
                    </button>
                </div>

                {!readOnly && (
                    <>
                        <div className={styles.securityNotice}>
                            <div className={styles.securityNoticeIcon}>
                                <i className="bi bi-shield-lock-fill" />
                            </div>

                            <div className={styles.securityNoticeContent}>
                                <h4>{t(securityNoticeTitle)}</h4>

                                <p>{t(securityNoticeDescription)}</p>
                            </div>
                        </div>

                        {error && <div className={styles.errorMessage}>{error}</div>}

                        <div className={styles.footer}>
                            <button
                                type="button"
                                className={styles.secondaryButton}
                                onClick={() => setStep(STEP_PASSWORD)}
                                disabled={loading}
                            >
                                <i className="bi bi-arrow-left" />
                                {t(backButton)}
                            </button>

                            <button
                                type="button"
                                className={styles.primaryButton}
                                onClick={handleVerifyOtp}
                                disabled={loading}
                            >
                                {t(verifyButton)}
                                <i className="bi bi-arrow-right" />
                            </button>
                        </div>
                    </>
                )}
            </div>
        );
    }

    function renderSuccessStep() {
        return (
            <div className={styles.successPage}>
                <div className={styles.successIcon}>
                    <i className="bi bi-check-lg" />
                </div>

                <h1>{t(successTitle)}</h1>

                <p>{t(successDescription)}</p>

                <div className={styles.successInfo}>
                    <div>
                        <i className="bi bi-shield-check" />

                        <span>{t(securityUpdatedLabel)}</span>
                    </div>

                    <div>
                        <i className="bi bi-clock-history" />

                        <span>{t(justNowLabel)}</span>
                    </div>
                </div>

                <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => router.push('/dashboard')}
                >
                    {t(continueDashboardButton)}
                    <i className="bi bi-arrow-right" />
                </button>
            </div>
        );
    }

    return (
        <section className={styles.changePassword}>
            <div className={styles.card}>
                {renderHeader()}

                {renderStepper()}

                <div className={styles.body}>
                    <StepCard
                        title={stepPassword}
                        active={step === STEP_PASSWORD}
                        completed={step > STEP_PASSWORD}
                    >
                        {renderPasswordStep()}
                    </StepCard>

                    <StepCard
                        title={stepVerify}
                        active={step === STEP_VERIFY}
                        completed={step > STEP_VERIFY}
                    >
                        {renderVerifyStep()}
                    </StepCard>

                    <StepCard
                        title={stepCompleted}
                        active={step === STEP_SUCCESS}
                        completed={false}
                    >
                        {renderSuccessStep()}
                    </StepCard>
                </div>
            </div>
        </section>
    );
}

function localizedTextField(key: string, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createInspector(): RegItem['inspector'] {
    return [
        localizedTextField('stepPassword', 'Step Password'),
        localizedTextField('stepVerify', 'Step Verify'),
        localizedTextField('stepCompleted', 'Step Completed'),
        localizedTextField('passwordRuleMinLength', 'Password Rule - Min Length'),
        localizedTextField('passwordRuleUppercase', 'Password Rule - Uppercase'),
        localizedTextField('passwordRuleLowercase', 'Password Rule - Lowercase'),
        localizedTextField('passwordRuleNumber', 'Password Rule - Number'),
        localizedTextField('passwordRuleSpecial', 'Password Rule - Special Character'),
        localizedTextField('securityNoticeTitle', 'Security Notice Title'),
        localizedTextField('securityNoticeDescription', 'Security Notice Description'),
        localizedTextField('successTitle', 'Success Title'),
        localizedTextField('successDescription', 'Success Description'),
        localizedTextField('securityUpdatedLabel', 'Security Updated Label'),
        localizedTextField('justNowLabel', 'Just Now Label'),
        localizedTextField('continueDashboardButton', 'Continue Dashboard Button'),
        localizedTextField('unknownErrorMessage', 'Unknown Error Message'),
        localizedTextField('supportLabel', 'Support Label'),
    ];
}
export const CHANGE_PASSWORD_01: RegItem = {
    kind: 'change-password-01',
    label: 'Change Password 01',
    defaults: DEFAULT_PROPS,
    inspector: createInspector(),
    render: (props) => <ChangePassword01 {...(props as ChangePassword01Props)} />,
};
