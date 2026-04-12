import { headers } from "next/headers";

export async function getRequestCountry(): Promise<string | null> {
  const headerStore = await headers();

  return (
    headerStore.get("x-vercel-ip-country") ||
    headerStore.get("cf-ipcountry") ||
    null
  );
}