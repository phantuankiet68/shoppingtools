export function toI18nKey(value?: string) {
  if (!value) return "";

  return value.trim().toLowerCase().replace(/\s+/g, "_");
}
