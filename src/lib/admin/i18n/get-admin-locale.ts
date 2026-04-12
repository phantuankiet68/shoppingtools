import { cookies, headers } from "next/headers";
import {
  countryToAdminLocale,
  DEFAULT_ADMIN_LOCALE,
  isAdminLocale,
  type AdminLocale,
} from "./config";

export async function getAdminLocale(): Promise<AdminLocale> {
  const cookieStore = await cookies();
  const headerStore = await headers();

  const savedLocale = cookieStore.get("admin-locale")?.value;

  if (savedLocale && isAdminLocale(savedLocale)) {
    return savedLocale;
  }

  const vercelCountry = headerStore.get("x-vercel-ip-country");
  const cfCountry = headerStore.get("cf-ipcountry");
  const devCountry = process.env.NODE_ENV === "development" ? "VN" : null;

  const country = vercelCountry || cfCountry || devCountry;

  if (country) {
    return countryToAdminLocale(country);
  }

  return DEFAULT_ADMIN_LOCALE;
}