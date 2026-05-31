import { prisma } from "@/lib/prisma";

import { decrypt, encrypt } from "@/lib/security/encryption";

export async function refreshAccessToken(siteId: string) {
  const provider = await prisma.emailProviderConfig.findUnique({
    where: {
      siteId,
    },
  });

  if (!provider) {
    throw new Error("EMAIL_PROVIDER_NOT_FOUND");
  }

  if (!provider.googleClientId) {
    throw new Error("GOOGLE_CLIENT_ID_NOT_FOUND");
  }

  if (!provider.googleClientSecretEncrypted) {
    throw new Error("GOOGLE_CLIENT_SECRET_NOT_FOUND");
  }

  const refreshToken = decrypt(provider.refreshTokenEncrypted);

  const googleClientSecret = decrypt(provider.googleClientSecretEncrypted);

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",

    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },

    body: new URLSearchParams({
      client_id: provider.googleClientId,

      client_secret: googleClientSecret,

      refresh_token: refreshToken,

      grant_type: "refresh_token",
    }),
  });

  const data = await response.json();

  if (!data.access_token) {
    console.error(data);

    throw new Error("REFRESH_TOKEN_FAILED");
  }

  const encryptedAccessToken = encrypt(data.access_token);

  const expiresAt = new Date(Date.now() + data.expires_in * 1000);

  await prisma.emailProviderConfig.update({
    where: {
      siteId,
    },

    data: {
      accessTokenEncrypted: encryptedAccessToken,

      expiresAt,
    },
  });

  return {
    accessToken: data.access_token,

    expiresIn: data.expires_in,
  };
}
type SendGoogleMailParams = {
  accessToken: string;

  from: string;

  to: string;

  subject: string;

  html: string;
};

export async function sendGoogleMail({ accessToken, from, to, subject, html }: SendGoogleMailParams) {
  const email = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/html; charset="UTF-8"',
    "",
    html,
  ].join("\r\n");

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
    if (response.status !== 401) {
      console.error(data);
    }

    throw new Error(data?.error?.status ?? data?.error?.message ?? "SEND_EMAIL_FAILED");
  }

  return data;
}
