import "server-only";
import type { AdminLocale } from "./config";

const loaders = {
  vi: () => import("./messages/vi").then((m) => m.default),
  en: () => import("./messages/en").then((m) => m.default),
  ja: () => import("./messages/ja").then((m) => m.default),
};

export async function getAdminMessages(locale: AdminLocale) {
  return loaders[locale]();
}