import { Google } from 'arctic';

const clientId = process.env.GOOGLE_CLIENT_ID;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
const redirectURI = process.env.GOOGLE_REDIRECT_URI;

if (!clientId || !clientSecret || !redirectURI) {
    throw new Error(
        'Google Login OAuth configuration is missing. Check GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REDIRECT_URI.',
    );
}

export const google = new Google(clientId, clientSecret, redirectURI);
