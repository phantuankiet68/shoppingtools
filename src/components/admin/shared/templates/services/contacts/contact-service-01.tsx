'use client';

import styles from '@/components/admin/shared/templates/services/contacts/styles/contact-service-01.module.css';
import type { RegItem } from '@/lib/ui-builder/types';
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────────────────────────────
   Types
───────────────────────────────────────────────── */
export interface ContactInfoItem {
    id: string;
    icon: string;
    label: string;
    value: string;
    description?: string;
    accentColor?: string;
}

export interface ContactService01Props {
    siteId?: string;

    eyebrow?: string;
    headline?: string;
    headlineAccent?: string;
    subheadline?: string;

    formTitle?: string;
    formSubtitle?: string;

    emailLabel?: string;
    emailPlaceholder?: string;

    phoneLabel?: string;
    phonePlaceholder?: string;

    nameLabel?: string;
    namePlaceholder?: string;

    messageLabel?: string;
    messagePlaceholder?: string;

    formButtonText?: string;
    formSuccessText?: string;

    newsletterTitle?: string;
    newsletterSubtitle?: string;
    newsletterPlaceholder?: string;
    newsletterButtonText?: string;

    // Contact 1
    contact1Label?: string;
    contact1Value?: string;
    contact1Description?: string;

    // Contact 2
    contact2Label?: string;
    contact2Value?: string;
    contact2Description?: string;

    // Contact 3
    contact3Label?: string;
    contact3Value?: string;
    contact3Description?: string;
}
/* ─────────────────────────────────────────────────
   Default data
───────────────────────────────────────────────── */
const DEFAULT_CONTACT_INFO: ContactInfoItem[] = [
    {
        id: 'phone',
        icon: 'telephone-fill',
        label: 'Call Us',
        value: '(+84) 765 665 991',
        description: 'Mon – Fri, 8:00 to 17:00',
        accentColor: '#6366F1',
    },
    {
        id: 'email',
        icon: 'envelope-fill',
        label: 'Email Us',
        value: 'hello@kbuilder.io',
        description: 'We reply within 24 hours',
        accentColor: '#0EA5E9',
    },
    {
        id: 'address',
        icon: 'geo-alt-fill',
        label: 'Visit Us',
        value: 'District 1, Ho Chi Minh City',
        description: 'Our office is open for walk-ins',
        accentColor: '#F59E0B',
    },
];

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

/* ─────────────────────────────────────────────────
   Component
───────────────────────────────────────────────── */
export function ContactService01({
    eyebrow = 'Get In Touch',
    headline = "Let's build something",
    headlineAccent = 'great together.',
    subheadline = 'Have a question about Kbuilder, need a demo, or just want to say hi? Fill out the form and our team will get back to you shortly.',

    formTitle = 'Send us a message',
    formSubtitle = "We'd love to hear from you.",

    emailLabel = 'Email',
    emailPlaceholder = 'you@company.com',

    phoneLabel = 'Phone',
    phonePlaceholder = '+84 000 000 000',

    nameLabel = 'Name',
    namePlaceholder = 'Your full name',

    messageLabel = 'Message',
    messagePlaceholder = 'Tell us a bit about your project...',

    formButtonText = 'Send Message',
    formSuccessText = 'Message Sent',

    newsletterTitle = 'Our Newsletter',
    newsletterSubtitle = 'Product tips, new templates and release notes — delivered straight to your inbox, once a month.',
    newsletterPlaceholder = 'Enter your email',
    newsletterButtonText = 'Subscribe',

    contact1Label = 'Call Us',
    contact1Value = '(+84) 765 665 991',
    contact1Description = 'Mon – Fri, 8:00 to 17:00',

    contact2Label = 'Email Us',
    contact2Value = 'hello@kbuilder.io',
    contact2Description = 'We reply within 24 hours',

    contact3Label = 'Visit Us',
    contact3Value = 'District 1, Ho Chi Minh City',
    contact3Description = 'Our office is open for walk-ins',
}: ContactService01Props) {
    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);
    const contactInfo: ContactInfoItem[] = [
        {
            id: 'phone',
            icon: 'telephone-fill',
            label: contact1Label,
            value: contact1Value,
            description: contact1Description,
            accentColor: '#6366F1',
        },
        {
            id: 'email',
            icon: 'envelope-fill',
            label: contact2Label,
            value: contact2Value,
            description: contact2Description,
            accentColor: '#0EA5E9',
        },
        {
            id: 'address',
            icon: 'geo-alt-fill',
            label: contact3Label,
            value: contact3Value,
            description: contact3Description,
            accentColor: '#F59E0B',
        },
    ];
    const [formState, setFormState] = useState({ email: '', phone: '', name: '', message: '' });
    const [newsletterEmail, setNewsletterEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleFormChange =
        (field: keyof typeof formState) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            setFormState((prev) => ({ ...prev, [field]: e.target.value }));
        };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
        setFormState({ email: '', phone: '', name: '', message: '' });
        window.setTimeout(() => setSubmitted(false), 3000);
    };

    const handleNewsletterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setNewsletterEmail('');
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
                {/* ── Form + Newsletter ── */}
                <div className={styles.top}>
                    <div
                        className={`${styles.formCard} ${styles.r}`}
                        style={{ '--i': 1 } as React.CSSProperties}
                    >
                        <div className={styles.headerRow}>
                            <span className={styles.badge}>{eyebrow}</span>

                            <h2>
                                {headline} <span className={styles.accent}>{headlineAccent}</span>
                            </h2>

                            <p className={styles.sub}>{subheadline}</p>
                        </div>

                        <div className={styles.formHeading}>
                            <h3>{formTitle}</h3>
                            <p>{formSubtitle}</p>
                        </div>

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formRow}>
                                <label className={styles.field}>
                                    <span>{emailLabel}</span>

                                    <input
                                        type="email"
                                        placeholder={emailPlaceholder}
                                        value={formState.email}
                                        onChange={handleFormChange('email')}
                                        required
                                    />
                                </label>
                                <label className={styles.field}>
                                    <span>{phoneLabel}</span>

                                    <input
                                        type="tel"
                                        placeholder={phonePlaceholder}
                                        value={formState.phone}
                                        onChange={handleFormChange('phone')}
                                    />
                                </label>
                            </div>

                            <label className={styles.field}>
                                <span>{nameLabel}</span>

                                <input
                                    type="text"
                                    placeholder={namePlaceholder}
                                    value={formState.name}
                                    onChange={handleFormChange('name')}
                                    required
                                />
                            </label>

                            <label className={styles.field}>
                                <span>{messageLabel}</span>

                                <textarea
                                    placeholder={messagePlaceholder}
                                    rows={4}
                                    value={formState.message}
                                    onChange={handleFormChange('message')}
                                    required
                                />
                            </label>

                            <button type="submit" className={styles.formButton}>
                                {submitted ? formSuccessText : formButtonText}
                                <i className={`bi ${submitted ? 'bi-check2' : 'bi-send-fill'}`} />
                            </button>
                        </form>
                    </div>

                    <div
                        className={`${styles.newsletterCard} ${styles.r}`}
                        style={{ '--i': 2 } as React.CSSProperties}
                    >
                        <div className={styles.divider}>
                            <span className={styles.newsletterIcon}>
                                <i className="bi bi-envelope-paper-fill" />
                            </span>

                            <div className={styles.newsletterHeading}>
                                <h3>{newsletterTitle}</h3>
                                <p>{newsletterSubtitle}</p>
                            </div>
                        </div>
                        <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
                            <input
                                type="email"
                                placeholder={newsletterPlaceholder}
                                value={newsletterEmail}
                                onChange={(e) => setNewsletterEmail(e.target.value)}
                                required
                            />
                            <button type="submit">
                                {newsletterButtonText}
                                <i className="bi bi-arrow-right" />
                            </button>
                        </form>
                        {/* ── Contact info cards ── */}
                        <div className={styles.infoGrid}>
                            {contactInfo.map((item, idx) => {
                                const accent = item.accentColor ?? '#6366F1';
                                return (
                                    <div
                                        key={item.id}
                                        className={`${styles.infoCard} ${styles.r}`}
                                        style={{ '--i': idx + 3 } as React.CSSProperties}
                                    >
                                        <span
                                            className={styles.infoIcon}
                                            style={{
                                                background: `${accent}14`,
                                                border: `1.5px solid ${accent}28`,
                                                color: accent,
                                            }}
                                        >
                                            <i className={`bi bi-${item.icon}`} />
                                        </span>
                                        <div className={styles.infoBody}>
                                            <h4>{item.label}</h4>
                                            <p className={styles.infoValue}>{item.value}</p>
                                            {item.description && (
                                                <p className={styles.infoDesc}>
                                                    {item.description}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ─────────────────────────────────────────────────
   Registry
───────────────────────────────────────────────── */
export const CONTACT_SERVICE_01: RegItem = {
    kind: 'ContactService01',
    label: 'Contact Service 01',

    defaults: {
        eyebrow: 'Get In Touch',
        headline: "Let's build something",
        headlineAccent: 'great together.',
        subheadline:
            'Have a question about Kbuilder, need a demo, or just want to say hi? Fill out the form and our team will get back to you shortly.',

        formTitle: 'Send us a message',
        formSubtitle: "We'd love to hear from you.",

        emailLabel: 'Email',
        emailPlaceholder: 'you@company.com',

        phoneLabel: 'Phone',
        phonePlaceholder: '+84 000 000 000',

        nameLabel: 'Name',
        namePlaceholder: 'Your full name',

        messageLabel: 'Message',
        messagePlaceholder: 'Tell us a bit about your project...',

        formButtonText: 'Send Message',
        formSuccessText: 'Message Sent',

        newsletterTitle: 'Our Newsletter',
        newsletterSubtitle:
            'Product tips, new templates and release notes — delivered straight to your inbox, once a month.',
        newsletterPlaceholder: 'Enter your email',
        newsletterButtonText: 'Subscribe',

        contact1Label: 'Call Us',
        contact1Value: '(+84) 765 665 991',
        contact1Description: 'Mon – Fri, 8:00 to 17:00',

        contact2Label: 'Email Us',
        contact2Value: 'hello@kbuilder.io',
        contact2Description: 'We reply within 24 hours',

        contact3Label: 'Visit Us',
        contact3Value: 'District 1, Ho Chi Minh City',
        contact3Description: 'Our office is open for walk-ins',
    },

    inspector: [
        {
            key: 'eyebrow',
            label: 'Eyebrow',
            kind: 'text',
        },
        {
            key: 'headline',
            label: 'Headline',
            kind: 'text',
        },
        {
            key: 'headlineAccent',
            label: 'Headline Accent',
            kind: 'text',
        },
        {
            key: 'subheadline',
            label: 'Subheadline',
            kind: 'textarea',
        },

        {
            key: 'formTitle',
            label: 'Form Title',
            kind: 'text',
        },
        {
            key: 'formSubtitle',
            label: 'Form Subtitle',
            kind: 'textarea',
        },

        {
            key: 'emailLabel',
            label: 'Email Label',
            kind: 'text',
        },
        {
            key: 'emailPlaceholder',
            label: 'Email Placeholder',
            kind: 'text',
        },

        {
            key: 'phoneLabel',
            label: 'Phone Label',
            kind: 'text',
        },
        {
            key: 'phonePlaceholder',
            label: 'Phone Placeholder',
            kind: 'text',
        },

        {
            key: 'nameLabel',
            label: 'Name Label',
            kind: 'text',
        },
        {
            key: 'namePlaceholder',
            label: 'Name Placeholder',
            kind: 'text',
        },

        {
            key: 'messageLabel',
            label: 'Message Label',
            kind: 'text',
        },
        {
            key: 'messagePlaceholder',
            label: 'Message Placeholder',
            kind: 'textarea',
        },

        {
            key: 'formButtonText',
            label: 'Form Button Text',
            kind: 'text',
        },
        {
            key: 'formSuccessText',
            label: 'Form Success Text',
            kind: 'text',
        },

        {
            key: 'newsletterTitle',
            label: 'Newsletter Title',
            kind: 'text',
        },
        {
            key: 'newsletterSubtitle',
            label: 'Newsletter Subtitle',
            kind: 'textarea',
        },
        {
            key: 'newsletterPlaceholder',
            label: 'Newsletter Placeholder',
            kind: 'text',
        },
        {
            key: 'newsletterButtonText',
            label: 'Newsletter Button Text',
            kind: 'text',
        },

        // Contact 1
        {
            key: 'contact1Label',
            label: 'Contact 1 Label',
            kind: 'text',
        },
        {
            key: 'contact1Value',
            label: 'Contact 1 Value',
            kind: 'text',
        },
        {
            key: 'contact1Description',
            label: 'Contact 1 Description',
            kind: 'textarea',
        },

        // Contact 2
        {
            key: 'contact2Label',
            label: 'Contact 2 Label',
            kind: 'text',
        },
        {
            key: 'contact2Value',
            label: 'Contact 2 Value',
            kind: 'text',
        },
        {
            key: 'contact2Description',
            label: 'Contact 2 Description',
            kind: 'textarea',
        },

        // Contact 3
        {
            key: 'contact3Label',
            label: 'Contact 3 Label',
            kind: 'text',
        },
        {
            key: 'contact3Value',
            label: 'Contact 3 Value',
            kind: 'text',
        },
        {
            key: 'contact3Description',
            label: 'Contact 3 Description',
            kind: 'textarea',
        },
    ],

    render: (props) => <ContactService01 {...(props as unknown as ContactService01Props)} />,
};

export default ContactService01;
