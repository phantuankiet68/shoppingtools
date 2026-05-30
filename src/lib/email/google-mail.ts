import { decrypt } from "@/lib/security/encryption";

export async function refreshAccessToken(refreshTokenEncrypted: string) {
  const refreshToken = decrypt(refreshTokenEncrypted);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();

  if (!data.access_token) {
    throw new Error("REFRESH_TOKEN_FAILED");
  }

  return {
    accessToken: data.access_token,
    expiresIn: data.expires_in,
  };
}

export async function sendGoogleMail({
  accessToken,
  from,
  to,
  subject,
  html,
}: {
  accessToken: string;
  from: string;
  to: string;
  subject: string;
  html: string;
}) {
  const email = [
    `From: ${from}`,
    `To: ${to}`,
    "Content-Type: text/html; charset=UTF-8",
    `Subject: ${subject}`,
    "",
    html,
  ].join("\n");

  const raw = Buffer.from(email).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  const response = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      raw,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error(data);

    throw new Error("SEND_EMAIL_FAILED");
  }

  return data;
}
