'use client';

import styles from '@/components/admin/shared/templates/services/contacts/styles/contact-service-01.module.css';
import type { RegItem, InspectorField } from '@/lib/ui-builder/types';
import { useEffect, useRef, useState, useMemo } from 'react';
import { LocalizedText, getLocalizedValue } from '@/lib/ui-builder/localization';

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
    socialTitle?: LocalizedText;
    headline?: LocalizedText;
    headlineAccent?: LocalizedText;
    subheadline?: LocalizedText;

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

    // Contact 1
    contact1Label?: LocalizedText;
    contact1Value?: LocalizedText;
    contact1Description?: LocalizedText;

    // Contact 2
    contact2Label?: LocalizedText;
    contact2Value?: LocalizedText;
    contact2Description?: LocalizedText;

    // Contact 3
    contact3Label?: LocalizedText;
    contact3Value?: LocalizedText;
    contact3Description?: LocalizedText;
}
export const DEFAULT_PROPS: Required<ContactService01Props> = {
    siteId: '',
    socialTitle: {
        sourceLocale: 'en',
        default: 'Follow us',
        translations: {
            vi: 'Theo dõi chúng tôi',
            ja: 'フォローしてください',
        },
    },
    headline: {
        sourceLocale: 'en',
        default: "Let's build something",
        translations: {
            vi: 'Hãy cùng xây dựng điều gì đó tuyệt vời.',
            ja: '一緒に素晴らしいものを作りましょう。',
        },
    },

    headlineAccent: {
        sourceLocale: 'en',
        default: 'great together.',
        translations: {
            vi: 'cùng nhau.',
            ja: '一緒に。',
        },
    },

    subheadline: {
        sourceLocale: 'en',
        default:
            'Have a question about Kbuilder, need a demo, or just want to say hi? Fill out the form and our team will get back to you shortly.',
        translations: {
            vi: 'Bạn có câu hỏi về Kbuilder, cần bản demo hoặc chỉ muốn liên hệ? Hãy điền vào biểu mẫu và đội ngũ của chúng tôi sẽ phản hồi bạn sớm nhất.',
            ja: 'Kbuilderについてのご質問やデモのご希望、またはお問い合わせがございましたら、フォームにご記入ください。担当チームよりできるだけ早くご連絡いたします。',
        },
    },

    emailLabel: {
        sourceLocale: 'en',
        default: 'Email',
        translations: {
            vi: 'Email',
            ja: 'メール',
        },
    },

    emailPlaceholder: {
        sourceLocale: 'en',
        default: 'you@company.com',
        translations: {
            vi: 'ban@congty.com',
            ja: 'your@company.com',
        },
    },

    phoneLabel: {
        sourceLocale: 'en',
        default: 'Phone',
        translations: {
            vi: 'Điện thoại',
            ja: '電話番号',
        },
    },

    phonePlaceholder: {
        sourceLocale: 'en',
        default: '+84 000 000 000',
        translations: {
            vi: '+84 000 000 000',
            ja: '+81 000 000 000',
        },
    },

    nameLabel: {
        sourceLocale: 'en',
        default: 'Name',
        translations: {
            vi: 'Họ và tên',
            ja: 'お名前',
        },
    },

    namePlaceholder: {
        sourceLocale: 'en',
        default: 'Your full name',
        translations: {
            vi: 'Nhập họ và tên',
            ja: 'お名前をご入力ください',
        },
    },

    messageLabel: {
        sourceLocale: 'en',
        default: 'Message',
        translations: {
            vi: 'Nội dung',
            ja: 'メッセージ',
        },
    },

    messagePlaceholder: {
        sourceLocale: 'en',
        default: 'Tell us a bit about your project...',
        translations: {
            vi: 'Hãy chia sẻ đôi chút về dự án của bạn...',
            ja: 'あなたのプロジェクトについて教えてください。',
        },
    },

    formButtonText: {
        sourceLocale: 'en',
        default: 'Send Message',
        translations: {
            vi: 'Gửi tin nhắn',
            ja: 'メッセージを送信',
        },
    },

    formSuccessText: {
        sourceLocale: 'en',
        default: 'Message Sent',
        translations: {
            vi: 'Đã gửi thành công',
            ja: '送信が完了しました',
        },
    },

    contact1Label: {
        sourceLocale: 'en',
        default: 'Call Us',
        translations: {
            vi: 'Gọi cho chúng tôi',
            ja: 'お電話はこちら',
        },
    },

    contact1Value: {
        sourceLocale: 'en',
        default: '(+84) 765 665 991',
        translations: {
            vi: '(+84) 765 665 991',
            ja: '(+81) 03-1234-5678',
        },
    },

    contact1Description: {
        sourceLocale: 'en',
        default: 'Mon – Fri, 8:00 to 17:00',
        translations: {
            vi: 'Thứ Hai - Thứ Sáu, 8:00 - 17:00',
            ja: '月曜日〜金曜日 8:00〜17:00',
        },
    },

    contact2Label: {
        sourceLocale: 'en',
        default: 'Email Us',
        translations: {
            vi: 'Gửi email',
            ja: 'メールでお問い合わせ',
        },
    },

    contact2Value: {
        sourceLocale: 'en',
        default: 'hello@kbuilder.io',
        translations: {
            vi: 'hello@kbuilder.io',
            ja: 'hello@kbuilder.io',
        },
    },

    contact2Description: {
        sourceLocale: 'en',
        default: 'We reply within 24 hours',
        translations: {
            vi: 'Chúng tôi sẽ phản hồi trong vòng 24 giờ.',
            ja: '24時間以内に返信いたします。',
        },
    },

    contact3Label: {
        sourceLocale: 'en',
        default: 'Visit Us',
        translations: {
            vi: 'Đến văn phòng',
            ja: 'オフィスへお越しください',
        },
    },

    contact3Value: {
        sourceLocale: 'en',
        default: 'District 1, Ho Chi Minh City',
        translations: {
            vi: 'Quận 1, TP. Hồ Chí Minh',
            ja: 'ホーチミン市第1区',
        },
    },

    contact3Description: {
        sourceLocale: 'en',
        default: 'Our office is open for walk-ins',
        translations: {
            vi: 'Văn phòng luôn sẵn sàng đón tiếp khách.',
            ja: 'ご予約なしでもお気軽にお越しください。',
        },
    },
};
/* ─────────────────────────────────────────────────
   Hook
───────────────────────────────────────────────── */
function useInView(ref: React.RefObject<HTMLElement | null>, threshold = 0.05) {
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
/* ─────────────────────────────────────────────────
   Component
───────────────────────────────────────────────── */
export function ContactService01(props: ContactService01Props) {
    const mergedProps: Required<ContactService01Props> = {
        ...DEFAULT_PROPS,
        ...props,
    };

    const {
        socialTitle,
        headline,
        headlineAccent,
        subheadline,
        emailLabel,
        emailPlaceholder,
        phoneLabel,
        phonePlaceholder,
        nameLabel,
        namePlaceholder,
        messageLabel,
        messagePlaceholder,
        formButtonText,
        formSuccessText,
    } = mergedProps;
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

    const contacts = useMemo<ContactInfoItem[]>(
        () => [
            createContact(1, 'telephone-fill', '#6366F1', mergedProps),
            createContact(2, 'envelope-fill', '#0EA5E9', mergedProps),
            createContact(3, 'geo-alt-fill', '#F59E0B', mergedProps),
        ],
        [mergedProps],
    );
    const [formState, setFormState] = useState({ email: '', phone: '', name: '', message: '' });
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleFormChange =
        (field: keyof typeof formState) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormState((prev) => ({ ...prev, [field]: e.target.value }));
        };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const res = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formState),
            });

            const data = await res.json();

            if (data.success) {
                setSubmitted(true);

                setFormState({
                    email: '',
                    phone: '',
                    name: '',
                    message: '',
                });

                setTimeout(() => {
                    setSubmitted(false);
                }, 3000);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <section
            ref={rootRef}
            className={`${styles.root} ${inView ? styles.inView : ''}`}
            aria-label="Contact"
        >
            {/* Decorative background */}
            <div className={styles.bgDots} aria-hidden="true" />
            <div className={styles.bgOrbA} aria-hidden="true" />
            <div className={styles.bgOrbB} aria-hidden="true" />

            <div className={styles.wrap}>
                <div className={styles.contactCard}>
                    {/* LEFT */}

                    <div
                        className={`${styles.left} ${styles.r}`}
                        style={{ '--i': 1 } as React.CSSProperties}
                    >
                        <div className={styles.heroContent}>
                            <h2 className={styles.heading}>
                                {t(headline)}

                                <span className={styles.accent}>{t(headlineAccent)}</span>
                            </h2>

                            <p className={styles.sub}>{t(subheadline)}</p>
                        </div>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <label className={styles.field}>
                                <span>
                                    <i className="bi bi-person" />

                                    {t(nameLabel)}
                                </span>

                                <input
                                    type="text"
                                    placeholder={t(namePlaceholder)}
                                    value={formState.name}
                                    onChange={handleFormChange('name')}
                                    required
                                />
                            </label>

                            <label className={styles.field}>
                                <span>
                                    <i className="bi bi-envelope" />
                                    {t(emailLabel)}
                                </span>

                                <input
                                    type="email"
                                    placeholder={t(emailPlaceholder)}
                                    value={formState.email}
                                    onChange={handleFormChange('email')}
                                    required
                                />
                            </label>

                            <label className={styles.field}>
                                <span>
                                    <i className="bi bi-envelope" />
                                    {t(phoneLabel)}
                                </span>

                                <input
                                    type="phone"
                                    placeholder={t(phonePlaceholder)}
                                    value={formState.phone}
                                    onChange={handleFormChange('email')}
                                    required
                                />
                            </label>

                            <label className={styles.field}>
                                <span>
                                    <i className="bi bi-chat-left-text" />
                                    {t(messageLabel)}
                                </span>

                                <textarea
                                    rows={5}
                                    placeholder={t(messagePlaceholder)}
                                    value={formState.message}
                                    onChange={handleFormChange('message')}
                                    required
                                />
                            </label>
                            <button type="submit" className={styles.formButton}>
                                <span>{submitted ? t(formSuccessText) : t(formButtonText)}</span>

                                <i className={`bi ${submitted ? 'bi-check2' : 'bi-send-fill'}`} />
                            </button>
                        </form>
                    </div>

                    <div
                        className={`${styles.right} ${styles.r}`}
                        style={{ '--i': 2 } as React.CSSProperties}
                    >
                        {/* Illustration */}

                        <div className={styles.heroIllustration}>
                            <div className={styles.heroCircle} />

                            <div className={styles.heroRing} />

                            <div className={styles.mailCard}>
                                <i className="bi bi-envelope-paper-heart-fill" />
                            </div>

                            <span className={styles.paperPlane}>
                                <i className="bi bi-send-fill" />
                            </span>

                            <span className={styles.chatBubble}>
                                <i className="bi bi-chat-dots-fill" />
                            </span>

                            <span className={styles.likeBubble}>
                                <i className="bi bi-hand-thumbs-up-fill" />
                            </span>
                            {['dotOne', 'dotTwo', 'dotThree'].map((cls) => (
                                <span key={cls} className={styles[cls]} />
                            ))}

                            {['crossOne', 'crossTwo'].map((cls) => (
                                <span key={cls} className={styles[cls]}>
                                    +
                                </span>
                            ))}
                        </div>

                        {/* Contact */}

                        <div className={styles.contactList}>
                            {contacts.map((contact) => {
                                const accent = contact.accentColor ?? '#6366F1';

                                return (
                                    <div key={contact.id} className={styles.contactItem}>
                                        <div
                                            className={styles.contactIcon}
                                            style={{
                                                background: `${accent}15`,
                                                color: accent,
                                            }}
                                        >
                                            <i className={`bi bi-${contact.icon}`} />
                                        </div>

                                        <div className={styles.contactContent}>
                                            <h4>{t(contact.label)}</h4>

                                            <strong>{t(contact.value)}</strong>

                                            {contact.description && <p>{t(contact.description)}</p>}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div className={styles.divider} />
                        {/* Social */}

                        <div className={styles.socialSection}>
                            <span className={styles.socialTitle}>{t(socialTitle)}</span>

                            <div className={styles.socialList}>
                                <a href="#" className={styles.socialItem} aria-label="Facebook">
                                    <i className="bi bi-facebook" />
                                </a>

                                <a href="#" className={styles.socialItem} aria-label="Twitter">
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

                        <span className={styles.blurOne} />

                        <span className={styles.blurTwo} />

                        <span className={styles.gridDecoration} />
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

        createLocalizedTextField('socialTitle', 'Social Title'),

        ...createContactInspector(1),
        ...createContactInspector(2),
        ...createContactInspector(3),
    ];
}
/* ─────────────────────────────────────────────────
   Registry
───────────────────────────────────────────────── */
export const CONTACT_SERVICE_01: RegItem = {
    kind: 'contact-page-01',
    label: 'Contact Service 01',
    defaults: DEFAULT_PROPS,
    inspector: createInspector(),
    render: (props) => <ContactService01 {...(props as ContactService01Props)} />,
};

export default ContactService01;
