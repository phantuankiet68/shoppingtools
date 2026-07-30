import { Google } from 'arctic';

export const google = new Google(
    process.env.GOOGLE_LOGIN_CLIENT_ID!,
    process.env.GOOGLE_LOGIN_CLIENT_SECRET!,
    process.env.GOOGLE_LOGIN_REDIRECT_URI!,
);
