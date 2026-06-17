export function resolveMenuValue(messages: Record<string, any>, key: string): string {
    const value = key.split('.').reduce<any>((acc, part) => acc?.[part], messages);

    return typeof value === 'string' ? value : key;
}
