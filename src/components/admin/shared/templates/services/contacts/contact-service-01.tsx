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
    formButtonText?: string;

    newsletterTitle?: string;
    newsletterSubtitle?: string;
    newsletterButtonText?: string;

    contactInfo?: ContactInfoItem[];

    mapEmbedSrc?: string;
    mapCardTitle?: string;
    mapCardRating?: string;
    mapCardReviews?: string;
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
    formButtonText = 'Send Message',

    newsletterTitle = 'Our Newsletter',
    newsletterSubtitle = 'Product tips, new templates and release notes — delivered straight to your inbox, once a month.',
    newsletterButtonText = 'Subscribe',

    contactInfo = DEFAULT_CONTACT_INFO,

    mapEmbedSrc = 'https://www.google.com/maps?q=Ho+Chi+Minh+City&output=embed',
    mapCardTitle = 'Kbuilder HQ',
    mapCardRating = '4.9',
    mapCardReviews = '320 reviews',
}: ContactService01Props) {
    const rootRef = useRef<HTMLElement>(null);
    const inView = useInView(rootRef);

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

                        <form className={styles.form} onSubmit={handleSubmit}>
                            <div className={styles.formRow}>
                                <label className={styles.field}>
                                    <span>Email</span>
                                    <input
                                        type="email"
                                        placeholder="you@company.com"
                                        value={formState.email}
                                        onChange={handleFormChange('email')}
                                        required
                                    />
                                </label>
                                <label className={styles.field}>
                                    <span>Phone</span>
                                    <input
                                        type="tel"
                                        placeholder="+84 000 000 000"
                                        value={formState.phone}
                                        onChange={handleFormChange('phone')}
                                    />
                                </label>
                            </div>

                            <label className={styles.field}>
                                <span>Name</span>
                                <input
                                    type="text"
                                    placeholder="Your full name"
                                    value={formState.name}
                                    onChange={handleFormChange('name')}
                                    required
                                />
                            </label>

                            <label className={styles.field}>
                                <span>Message</span>
                                <textarea
                                    placeholder="Tell us a bit about your project..."
                                    rows={4}
                                    value={formState.message}
                                    onChange={handleFormChange('message')}
                                    required
                                />
                            </label>

                            <button type="submit" className={styles.formButton}>
                                {submitted ? 'Message Sent' : formButtonText}
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
                            <h3>{newsletterTitle}</h3>
                        </div>
                        <form className={styles.newsletterForm} onSubmit={handleNewsletterSubmit}>
                            <input
                                type="email"
                                placeholder="Enter your email"
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
        formButtonText: 'Send Message',
        newsletterTitle: 'Our Newsletter',
        newsletterSubtitle:
            'Product tips, new templates and release notes — delivered straight to your inbox, once a month.',
        newsletterButtonText: 'Subscribe',
        contactInfo: DEFAULT_CONTACT_INFO,
        mapEmbedSrc: 'https://www.google.com/maps?q=Ho+Chi+Minh+City&output=embed',
        mapCardTitle: 'Kbuilder HQ',
        mapCardRating: '4.9',
        mapCardReviews: '320 reviews',
    },

    inspector: [
        { key: 'eyebrow', label: 'Eyebrow', kind: 'text' },
        { key: 'headline', label: 'Headline', kind: 'text' },
        { key: 'headlineAccent', label: 'Headline Accent', kind: 'text' },
        { key: 'subheadline', label: 'Subheadline', kind: 'text' },
        { key: 'formTitle', label: 'Form Title', kind: 'text' },
        { key: 'formSubtitle', label: 'Form Subtitle', kind: 'text' },
        { key: 'formButtonText', label: 'Form Button Text', kind: 'text' },
        { key: 'newsletterTitle', label: 'Newsletter Title', kind: 'text' },
        { key: 'newsletterSubtitle', label: 'Newsletter Subtitle', kind: 'text' },
        { key: 'newsletterButtonText', label: 'Newsletter Button Text', kind: 'text' },
        { key: 'mapEmbedSrc', label: 'Map Embed URL', kind: 'text' },
        { key: 'mapCardTitle', label: 'Map Card Title', kind: 'text' },
        { key: 'mapCardRating', label: 'Map Card Rating', kind: 'text' },
        { key: 'mapCardReviews', label: 'Map Card Reviews', kind: 'text' },
    ],

    render: (props) => {
        const d = props as Record<string, any>;
        return (
            <ContactService01
                siteId={d.siteId}
                eyebrow={d.eyebrow}
                headline={d.headline}
                headlineAccent={d.headlineAccent}
                subheadline={d.subheadline}
                formTitle={d.formTitle}
                formSubtitle={d.formSubtitle}
                formButtonText={d.formButtonText}
                newsletterTitle={d.newsletterTitle}
                newsletterSubtitle={d.newsletterSubtitle}
                newsletterButtonText={d.newsletterButtonText}
                contactInfo={d.contactInfo}
                mapEmbedSrc={d.mapEmbedSrc}
                mapCardTitle={d.mapCardTitle}
                mapCardRating={d.mapCardRating}
                mapCardReviews={d.mapCardReviews}
            />
        );
    },
};

export default ContactService01;
