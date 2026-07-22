import { LocalizedText } from './localized-text';

export function getLocalizedValue(value: LocalizedText | string | undefined, locale: string) {
    if (!value) {
        return '';
    }

    // Hỗ trợ dữ liệu cũ
    if (typeof value === 'string') {
        return value;
    }

    return value.translations?.[locale] ?? value.default;
}
