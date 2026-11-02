import { Google } from 'arctic';

const clientId = process.env.GOOGLE_CLIENT_ID?.trim();
const clientSecret = process.env.GOOGLE_CLIENT_SECRET?.trim();
const redirectURI = process.env.GOOGLE_REDIRECT_URI?.trim();

if (!clientId || !clientSecret || !redirectURI) {
    throw new Error('Google OAuth environment variables are missing.');
}

export const google = new Google(clientId, clientSecret, redirectURI);
