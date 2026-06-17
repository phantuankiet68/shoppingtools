import { SiteStatus, WebsiteType } from '@/features/sites/types';

export const WEBSITE_TYPES: WebsiteType[] = ['landing', 'blog', 'ecommerce', 'booking', 'lms'];

export const SITE_STATUSES: SiteStatus[] = ['DRAFT', 'ACTIVE', 'SUSPENDED'];

export const DOMAIN_REGEX = /^(?!-)[a-z0-9-]{1,63}(?<!-)(\.[a-z]{2,})+$/i;

export const SITE_NAME_MIN_LENGTH = 3;

export const SITE_NAME_MAX_LENGTH = 100;

export const DOMAIN_MAX_LENGTH = 255;

export const SEO_TITLE_MAX_LENGTH = 60;

export const SEO_DESCRIPTION_MAX_LENGTH = 160;

export const PHONE_MIN_LENGTH = 8;

export const PHONE_MAX_LENGTH = 20;

export const DEFAULT_SITE_STATUS: SiteStatus = 'DRAFT';

export const DEFAULT_WEBSITE_TYPE: WebsiteType = 'ecommerce';

export const DEFAULT_PUBLIC_SITE = false;

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const PHONE_REGEX = /^[0-9+\-\s()]{8,20}$/;

export const URL_PROTOCOLS = ['http:', 'https:'] as const;

export const WEBSITE_CATEGORIES = {
    landing: [
        'Company Profile',
        'Personal Profile',
        'Portfolio',
        'Agency',
        'Product',
        'Service',
        'Restaurant',
        'Spa',
        'Real Estate',
        'Event',
    ],

    blog: ['Tech Blog', 'Travel Blog', 'Food Blog', 'News Blog', 'Personal Blog'],

    ecommerce: ['Fashion', 'Electronics', 'Books', 'Digital Products', 'Food', 'Beauty'],

    booking: ['Hotel', 'Homestay', 'Spa', 'Clinic', 'Restaurant', 'Gym', 'Car Rental'],

    lms: [
        'Online Course',
        'Japanese Learning',
        'English Learning',
        'School',
        'Training Center',
        'Exam Platform',
    ],
} as const;
