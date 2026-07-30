import { randomBytes } from 'crypto';

export function generateToken(size = 64): string {
    return randomBytes(size).toString('hex');
}

export function generateSessionId(): string {
    return randomBytes(32).toString('hex');
}
