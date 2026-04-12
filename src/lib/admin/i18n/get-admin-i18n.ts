import { getAdminLocale } from "./get-admin-locale";
import { getAdminMessages } from "./get-admin-messages";

export async function getAdminI18n() {
  const locale = await getAdminLocale();
  const messages = await getAdminMessages(locale);

  return {
    locale,
    messages,
  };
}