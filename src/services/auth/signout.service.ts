import { verifyAccessToken } from './jwt.service';
import { revokeSession } from './auth.repository';

export async function signOut(accessToken: string) {
    const payload = await verifyAccessToken(accessToken);

    await revokeSession(payload.sid);
}
