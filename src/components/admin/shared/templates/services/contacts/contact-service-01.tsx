'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { RegItem, InspectorField } from '@/lib/ui-builder/types';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';
import styles from '@/components/admin/shared/templates/services/contacts/styles/contact-service-01.module.css';

export interface ContactInfoItem {
    id: string;
    icon: string;
    label: LocalizedText;
    value: LocalizedText;
    description?: LocalizedText;
    accentColor?: string;
}

export interface ContactService01Props {
    siteId?: string;
    eyebrow?: LocalizedText;
    socialTitle?: LocalizedText;
    headline?: LocalizedText;
    headlineAccent?: LocalizedText;
    subheadline?: LocalizedText;
    privacyText?: LocalizedText;

    emailLabel?: LocalizedText;
    emailPlaceholder?: LocalizedText;
    phoneLabel?: LocalizedText;
    phonePlaceholder?: LocalizedText;
    nameLabel?: LocalizedText;
    namePlaceholder?: LocalizedText;
    messageLabel?: LocalizedText;
    messagePlaceholder?: LocalizedText;

    formButtonText?: LocalizedText;
    formSuccessText?: LocalizedText;

    contact1Label?: LocalizedText;
    contact1Value?: LocalizedText;
    contact1Description?: LocalizedText;
    contact2Label?: LocalizedText;
    contact2Value?: LocalizedText;
    contact2Description?: LocalizedText;
    contact3Label?: LocalizedText;
    contact3Value?: LocalizedText;
    contact3Description?: LocalizedText;
}

const lt = (en: string, vi: string, ja: string): LocalizedText => ({
    sourceLocale: 'en',
    default: en,
    translations: { vi, ja },
});

export const DEFAULT_PROPS: Required<ContactService01Props> = {
    siteId: '',
    eyebrow: lt('CONTACT US', 'LIÊN HỆ VỚI CHÚNG TÔI', 'お問い合わせ'),
    socialTitle: lt('Follow us', 'Theo dõi chúng tôi', 'フォローしてください'),
    headline: lt("Let's build something", 'Cùng nhau tạo nên', '一緒に素晴らしいものを'),
    headlineAccent: lt('great together.', 'những điều tuyệt vời.', '作りましょう。'),
    subheadline: lt(
        'Have a question about KBuilder, need a demo, or simply want to say hello? Fill out the form below and our team will get back to you as soon as possible.',
        'KBuilder luôn sẵn sàng lắng nghe ý kiến, câu hỏi và đề xuất của bạn. Hãy điền vào biểu mẫu bên dưới, đội ngũ của chúng tôi sẽ phản hồi sớm nhất có thể.',
        'KBuilderについてのご質問やデモのご希望、またはご相談がございましたら、以下のフォームよりお気軽にお問い合わせください。',
    ),
    privacyText: lt(
        'Your information is protected and used only to contact you.',
        'Thông tin của bạn được bảo mật và chỉ sử dụng để liên hệ.',
        'お客様の情報は保護され、お問い合わせへの対応のみに使用されます。',
    ),
    emailLabel: lt('Email', 'Email', 'メール'),
    emailPlaceholder: lt('you@company.com', 'your@company.com', 'your@company.com'),
    phoneLabel: lt('Phone', 'Số điện thoại', '電話番号'),
    phonePlaceholder: lt('+84 000 000 000', '+84 000 000 000', '+81 000 000 000'),
    nameLabel: lt('Full name', 'Họ và tên', 'お名前'),
    namePlaceholder: lt('Enter your full name', 'Nhập họ và tên của bạn', 'お名前をご入力ください'),
    messageLabel: lt('Message', 'Nội dung tin nhắn', 'メッセージ'),
    messagePlaceholder: lt(
        'What would you like to talk about?',
        'Bạn muốn trao đổi về vấn đề gì?',
        'ご相談内容をお聞かせください',
    ),
    formButtonText: lt('Send Message', 'Gửi tin nhắn', 'メッセージを送信'),
    formSuccessText: lt('Message Sent', 'Đã gửi thành công', '送信が完了しました'),
    contact1Label: lt('Call us', 'Gọi cho chúng tôi', 'お電話はこちら'),
    contact1Value: lt('(+84) 023-444-6666-5678', '(+84) 023-444-6666-5678', '(+81) 03-1234-5678'),
    contact1Description: lt(
        'Mon – Fri, 8:00 – 17:00',
        'Thứ 2 – Thứ 6, 8:00 – 17:00',
        '月曜日〜金曜日 8:00〜17:00',
    ),
    contact2Label: lt('Email us', 'Email cho chúng tôi', 'メールでお問い合わせ'),
    contact2Value: lt('hello@kbuilder.io', 'hello@kbuilder.io', 'hello@kbuilder.io'),
    contact2Description: lt(
        'We reply within 24 hours',
        'Chúng tôi sẽ phản hồi trong vòng 24 giờ.',
        '24時間以内に返信いたします。',
    ),
    contact3Label: lt('Our office', 'Văn phòng của chúng tôi', 'オフィス所在地'),
    contact3Value: lt(
        'District 1, Ho Chi Minh City',
        'Quận 1, TP. Hồ Chí Minh',
        'ホーチミン市第1区',
    ),
    contact3Description: lt(
        'We are happy to welcome you',
        'Rất hân hạnh được đón tiếp bạn.',
        '皆様のお越しをお待ちしております。',
    ),
};

function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.08) {
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        if (!('IntersectionObserver' in window)) {
            setInView(true);
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setInView(true);
                    observer.disconnect();
                }
            },
            { threshold },
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [ref, threshold]);

    return inView;
}

function createContact(
    index: 1 | 2 | 3,
    icon: string,
    accentColor: string,
    props: Required<ContactService01Props>,
): ContactInfoItem {
    return {
        id: `contact-${index}`,
        icon,
        label: props[`contact${index}Label`],
        value: props[`contact${index}Value`],
        description: props[`contact${index}Description`],
        accentColor,
    };
}

export function ContactService01(props: ContactService01Props) {
    const mergedProps: Required<ContactService01Props> = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);

    const [selectedLocale, setSelectedLocale] = useState(() => {
        if (typeof window === 'undefined') return 'en';
        return localStorage.getItem('locale') ?? 'en';
    });

    const [formState, setFormState] = useState({
        name: '',
        email: '',
        phone: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(false);

    useEffect(() => {
        const handleLocaleChange = (event: Event) => {
            const customEvent = event as CustomEvent<string>;
            setSelectedLocale(customEvent.detail || 'en');
        };

        window.addEventListener('locale-change', handleLocaleChange as EventListener);

        return () => {
            window.removeEventListener('locale-change', handleLocaleChange as EventListener);
        };
    }, []);

    const t = (value: LocalizedText) => getLocalizedValue(value, selectedLocale);

    const contacts = useMemo<ContactInfoItem[]>(
        () => [
            createContact(1, 'telephone-fill', '#6366F1', mergedProps),
            createContact(2, 'envelope-fill', '#0EA5E9', mergedProps),
            createContact(3, 'geo-alt-fill', '#F59E0B', mergedProps),
        ],
        [mergedProps],
    );

    const handleFormChange =
        (field: keyof typeof formState) =>
        (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormState((previous) => ({
                ...previous,
                [field]: event.target.value,
            }));

            if (error) setError(false);
            if (submitted) setSubmitted(false);
        };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();

        if (submitting) return;

        setSubmitting(true);
        setError(false);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formState),
            });

            const data = await response.json().catch(() => null);

            if (!response.ok || !data?.success) {
                throw new Error('Contact request failed');
            }

            setSubmitted(true);
            setFormState({
                name: '',
                email: '',
                phone: '',
                message: '',
            });

            window.setTimeout(() => {
                setSubmitted(false);
            }, 3000);
        } catch (submitError) {
            console.error(submitError);
            setError(true);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <section
            ref={rootRef}
            className={`${styles.root} ${inView ? styles.inView : ''}`}
            aria-label={t(mergedProps.eyebrow)}
        >
            <div className={styles.bgGlowA} aria-hidden="true" />
            <div className={styles.bgGlowB} aria-hidden="true" />
            <div className={styles.bgGlowC} aria-hidden="true" />
            <div className={styles.bgDots} aria-hidden="true" />
            <div className={styles.bgCurve} aria-hidden="true" />

            <div className={styles.wrap}>
                <div className={styles.contactCard}>
                    <div
                        className={`${styles.left} ${styles.reveal}`}
                        style={
                            {
                                '--i': 1,
                            } as React.CSSProperties
                        }
                    >
                        <div className={styles.heroContent}>
                            <span className={styles.badge}>
                                <i className="bi bi-person-lines-fill" />
                                {t(mergedProps.eyebrow)}
                            </span>

                            <h2 className={styles.heading}>
                                <span>{t(mergedProps.headline)}</span>
                                <span className={styles.accent}>
                                    {t(mergedProps.headlineAccent)}
                                </span>
                            </h2>

                            <p className={styles.sub}>{t(mergedProps.subheadline)}</p>
                        </div>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>
                                    <i className="bi bi-person" />
                                    {t(mergedProps.nameLabel)}
                                </span>

                                <span className={styles.inputShell}>
                                    <i className="bi bi-person" />
                                    <input
                                        type="text"
                                        placeholder={t(mergedProps.namePlaceholder)}
                                        value={formState.name}
                                        onChange={handleFormChange('name')}
                                        autoComplete="name"
                                        required
                                    />
                                </span>
                            </label>

                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>
                                    <i className="bi bi-envelope" />
                                    {t(mergedProps.emailLabel)}
                                </span>

                                <span className={styles.inputShell}>
                                    <i className="bi bi-envelope" />
                                    <input
                                        type="email"
                                        placeholder={t(mergedProps.emailPlaceholder)}
                                        value={formState.email}
                                        onChange={handleFormChange('email')}
                                        autoComplete="email"
                                        required
                                    />
                                </span>
                            </label>

                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>
                                    <i className="bi bi-telephone" />
                                    {t(mergedProps.phoneLabel)}
                                </span>

                                <span className={styles.inputShell}>
                                    <i className="bi bi-telephone" />
                                    <input
                                        type="tel"
                                        inputMode="tel"
                                        placeholder={t(mergedProps.phonePlaceholder)}
                                        value={formState.phone}
                                        onChange={handleFormChange('phone')}
                                        autoComplete="tel"
                                        required
                                    />
                                </span>
                            </label>

                            <label className={styles.field}>
                                <span className={styles.fieldLabel}>
                                    <i className="bi bi-chat-left-text" />
                                    {t(mergedProps.messageLabel)}
                                </span>

                                <span className={`${styles.textareaShell} ${styles.inputShell}`}>
                                    <i className="bi bi-chat-left-text" />
                                    <textarea
                                        rows={5}
                                        maxLength={500}
                                        placeholder={t(mergedProps.messagePlaceholder)}
                                        value={formState.message}
                                        onChange={handleFormChange('message')}
                                        required
                                    />
                                    <small>
                                        {formState.message.length}
                                        /500
                                    </small>
                                </span>
                            </label>

                            {error && (
                                <div className={styles.error} role="alert">
                                    <i className="bi bi-exclamation-circle" />
                                    <span>
                                        {selectedLocale === 'vi'
                                            ? 'Không thể gửi tin nhắn. Vui lòng thử lại.'
                                            : selectedLocale === 'ja'
                                              ? '送信できませんでした。もう一度お試しください。'
                                              : 'We could not send your message. Please try again.'}
                                    </span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className={styles.formButton}
                                disabled={submitting}
                            >
                                <span>
                                    {submitted
                                        ? t(mergedProps.formSuccessText)
                                        : submitting
                                          ? selectedLocale === 'vi'
                                              ? 'Đang gửi...'
                                              : selectedLocale === 'ja'
                                                ? '送信中...'
                                                : 'Sending...'
                                          : t(mergedProps.formButtonText)}
                                </span>

                                <i
                                    className={`bi ${
                                        submitted
                                            ? 'bi-check2'
                                            : submitting
                                              ? 'bi-arrow-repeat'
                                              : 'bi-send-fill'
                                    }`}
                                />
                            </button>

                            <p className={styles.privacy}>
                                <i className="bi bi-lock-fill" />
                                <span>{t(mergedProps.privacyText)}</span>
                            </p>
                        </form>
                    </div>

                    <div
                        className={`${styles.right} ${styles.reveal}`}
                        style={
                            {
                                '--i': 2,
                            } as React.CSSProperties
                        }
                    >
                        <div className={styles.illustrationHeader}>
                            <div className={styles.illustrationCopy}>
                                <span>LET&apos;S</span>
                                <strong>Build Together</strong>
                            </div>

                            <div className={styles.sparkle}>✦</div>
                        </div>

                        <div className={styles.heroIllustration}>
                            <div className={styles.illustrationGlow} />
                            <div className={styles.illustrationOrb} />
                            <div className={styles.illustrationRing} />

                            <div className={styles.networkLineOne} />
                            <div className={styles.networkLineTwo} />
                            <div className={styles.networkLineThree} />

                            <span className={styles.chatBubble}>
                                <i className="bi bi-chat-dots-fill" />
                            </span>

                            <span className={styles.planeBubble}>
                                <i className="bi bi-send-fill" />
                            </span>

                            <span className={styles.peopleBubble}>
                                <i className="bi bi-people-fill" />
                            </span>

                            <div className={styles.mailCard}>
                                <div className={styles.mailBack} />
                                <div className={styles.mailEnvelope}>
                                    <div className={styles.mailHeart}>
                                        <i className="bi bi-heart-fill" />
                                    </div>
                                </div>
                            </div>

                            <div className={styles.messageCard}>
                                <strong>
                                    {selectedLocale === 'vi'
                                        ? 'Mọi ý tưởng đều bắt đầu'
                                        : selectedLocale === 'ja'
                                          ? 'すべてのアイデアは'
                                          : 'Every great idea'}
                                </strong>
                                <span>
                                    {selectedLocale === 'vi'
                                        ? 'bằng một cuộc trò chuyện'
                                        : selectedLocale === 'ja'
                                          ? '会話から始まります'
                                          : 'starts with a conversation'}
                                </span>
                                <b>—</b>
                            </div>
                        </div>

                        <div className={styles.contactList}>
                            {contacts.map((contact) => {
                                const accent = contact.accentColor ?? '#6366F1';

                                return (
                                    <div key={contact.id} className={styles.contactItem}>
                                        <div
                                            className={styles.contactIcon}
                                            style={
                                                {
                                                    '--contact-accent': accent,
                                                } as React.CSSProperties
                                            }
                                        >
                                            <i className={`bi bi-${contact.icon}`} />
                                        </div>

                                        <div className={styles.contactContent}>
                                            <h4>{t(contact.label)}</h4>
                                            <strong>{t(contact.value)}</strong>
                                            {contact.description && <p>{t(contact.description)}</p>}
                                        </div>

                                        <i
                                            className={`${styles.contactArrow} bi bi-chevron-right`}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div className={styles.divider} />

                        <div className={styles.socialSection}>
                            <div>
                                <span className={styles.socialTitle}>
                                    {t(mergedProps.socialTitle)}
                                </span>
                                <small>
                                    {selectedLocale === 'vi'
                                        ? 'Cập nhật tin tức và sản phẩm mới nhất.'
                                        : selectedLocale === 'ja'
                                          ? '最新のお知らせや製品情報をお届けします。'
                                          : 'Stay updated with our latest news and products.'}
                                </small>
                            </div>

                            <div className={styles.socialList}>
                                <a href="#" className={styles.socialItem} aria-label="Facebook">
                                    <i className="bi bi-facebook" />
                                </a>
                                <a href="#" className={styles.socialItem} aria-label="X">
                                    <i className="bi bi-twitter-x" />
                                </a>
                                <a href="#" className={styles.socialItem} aria-label="Instagram">
                                    <i className="bi bi-instagram" />
                                </a>
                                <a href="#" className={styles.socialItem} aria-label="LinkedIn">
                                    <i className="bi bi-linkedin" />
                                </a>
                            </div>
                        </div>

                        <span className={styles.decorBlurOne} aria-hidden="true" />
                        <span className={styles.decorBlurTwo} aria-hidden="true" />
                    </div>
                </div>
            </div>
        </section>
    );
}

function createLocalizedTextField(key: keyof ContactService01Props, label: string): InspectorField {
    return {
        key,
        label,
        kind: 'localized-text',
    };
}

function createContactInspector(index: 1 | 2 | 3): InspectorField[] {
    return [
        createLocalizedTextField(`contact${index}Label`, `Contact ${index} Label`),
        createLocalizedTextField(`contact${index}Value`, `Contact ${index} Value`),
        createLocalizedTextField(`contact${index}Description`, `Contact ${index} Description`),
    ];
}

function createInspector(): InspectorField[] {
    return [
        createLocalizedTextField('eyebrow', 'Eyebrow'),
        createLocalizedTextField('headline', 'Headline'),
        createLocalizedTextField('headlineAccent', 'Headline Accent'),
        createLocalizedTextField('subheadline', 'Subheadline'),
        createLocalizedTextField('nameLabel', 'Name Label'),
        createLocalizedTextField('namePlaceholder', 'Name Placeholder'),
        createLocalizedTextField('emailLabel', 'Email Label'),
        createLocalizedTextField('emailPlaceholder', 'Email Placeholder'),
        createLocalizedTextField('phoneLabel', 'Phone Label'),
        createLocalizedTextField('phonePlaceholder', 'Phone Placeholder'),
        createLocalizedTextField('messageLabel', 'Message Label'),
        createLocalizedTextField('messagePlaceholder', 'Message Placeholder'),
        createLocalizedTextField('formButtonText', 'Form Button Text'),
        createLocalizedTextField('formSuccessText', 'Form Success Text'),
        createLocalizedTextField('privacyText', 'Privacy Text'),
        createLocalizedTextField('socialTitle', 'Social Title'),
        ...createContactInspector(1),
        ...createContactInspector(2),
        ...createContactInspector(3),
    ];
}

export const CONTACT_SERVICE_01: RegItem = {
    kind: 'contact-page-01',
    label: 'Contact Service 01',
    defaults: DEFAULT_PROPS,
    inspector: createInspector(),
    render: (props) => <ContactService01 {...(props as ContactService01Props)} />,
};

export default ContactService01;
