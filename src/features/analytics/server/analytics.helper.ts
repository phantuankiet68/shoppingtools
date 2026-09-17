import type { AnalyticsPaymentType, AnalyticsQuery, ExpiringSiteQuery } from './analytics.types';

const MIN_YEAR = 2000;
const MAX_YEAR = 2100;

function getUtcYearRange(year: number) {
    return {
        start: new Date(Date.UTC(year, 0, 1)),
        end: new Date(Date.UTC(year + 1, 0, 1)),
    };
}

export function parseAnalyticsQuery(searchParams: URLSearchParams): AnalyticsQuery {
    const rawYear = searchParams.get('year');
    const year = rawYear ? Number(rawYear) : new Date().getUTCFullYear();

    if (!Number.isInteger(year) || year < MIN_YEAR || year > MAX_YEAR) {
        throw new Error('Invalid analytics year.');
    }

    const { start, end } = getUtcYearRange(year);

    return {
        year,
        start,
        end,
    };
}

export function parseAnalyticsPaymentType(value: string | null): AnalyticsPaymentType {
    if (value === 'paid' || value === 'unpaid' || value === 'awaiting_confirmation') {
        return value;
    }

    return 'paid';
}

export function parseExpiringSiteQuery(searchParams: URLSearchParams): ExpiringSiteQuery {
    const days = Number(searchParams.get('days') ?? 30);
    const limit = Number(searchParams.get('limit') ?? 5);

    if (!Number.isInteger(days) || days < 1 || days > 365) {
        throw new Error('Invalid expiring sites days.');
    }

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
        throw new Error('Invalid expiring sites limit.');
    }

    return {
        days,
        limit,
    };
}

export function parseNotificationLimit(searchParams: URLSearchParams) {
    const limit = Number(searchParams.get('limit') ?? 5);

    if (!Number.isInteger(limit) || limit < 1 || limit > 20) {
        throw new Error('Invalid analytics notification limit.');
    }

    return limit;
}

export function getPreviousYearRange(year: number) {
    return getUtcYearRange(year - 1);
}

export function toNumber(value: unknown): number {
    if (value == null) return 0;

    if (typeof value === 'number') {
        return Number.isFinite(value) ? value : 0;
    }

    if (typeof value === 'bigint') {
        return Number(value);
    }

    const result = Number(value);

    return Number.isFinite(result) ? result : 0;
}

export function toIso(value: Date | null | undefined) {
    return value ? value.toISOString() : null;
}

export function daysUntil(date: Date, now = new Date()) {
    return Math.max(0, Math.ceil((date.getTime() - now.getTime()) / 86_400_000));
}

export function percentageChange(current: number, previous: number) {
    if (previous === 0) {
        return current === 0 ? 0 : null;
    }

    return Number((((current - previous) / previous) * 100).toFixed(2));
}
