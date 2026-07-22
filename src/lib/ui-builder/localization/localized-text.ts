export interface LocalizedText {
    sourceLocale?: string;
    default: string;
    translations?: Record<string, string>;
}
