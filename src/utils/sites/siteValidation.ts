import { WebsiteType } from '@/features/sites/types';
import { DOMAIN_REGEX, WEBSITE_TYPES, normalizeDomain } from '@/utils/sites/siteHelpers';

export function validateSiteName(value: string, t: (key: string) => string): string {
    const name = value.trim();

    if (!name) {
        return t('sites.validation.siteNameRequired');
    }

    if (name.length < 3) {
        return t('sites.validation.min3');
    }

    if (name.length > 100) {
        return t('sites.validation.max100');
    }

    if (!/^[a-zA-Z0-9\s-_]+$/.test(name)) {
        return t('sites.validation.invalidCharacters');
    }

    return '';
}

export function validateDomain(value: string, t: (key: string) => string): string {
    const domain = normalizeDomain(value);

    if (!domain) {
        return t('sites.validation.domainRequired');
    }

    if (domain.length > 255) {
        return t('sites.validation.domainTooLong');
    }

    if (!DOMAIN_REGEX.test(domain)) {
        return t('sites.validation.invalidDomain');
    }

    return '';
}

export function validateWebsiteType(value: string, t: (key: string) => string): string {
    if (!WEBSITE_TYPES.includes(value as WebsiteType)) {
        return t('sites.validation.invalidType');
    }

    return '';
}

export function validateEmail(value: string): string {
    if (!value) {
        return '';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailRegex.test(value) ? '' : 'Invalid email address';
}

export function validatePhone(value: string): string {
    if (!value) {
        return '';
    }

    const phoneRegex = /^[0-9+\-\s()]{8,20}$/;

    return phoneRegex.test(value) ? '' : 'Invalid phone number';
}

export function validateSeoTitle(value: string): string {
    if (value && value.length > 60) {
        return 'SEO title should be less than 60 characters';
    }

    return '';
}

export function validateSeoDescription(value: string): string {
    if (value && value.length > 160) {
        return 'SEO description should be less than 160 characters';
    }

    return '';
}

export function validateLogoUrl(value: string): string {
    if (!value) {
        return '';
    }

    try {
        new URL(value);

        return '';
    } catch {
        return 'Invalid logo URL';
    }
}

export function validateFaviconUrl(value: string): string {
    if (!value) {
        return '';
    }

    try {
        new URL(value);

        return '';
    } catch {
        return 'Invalid favicon URL';
    }
}
