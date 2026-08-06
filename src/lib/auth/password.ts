import bcrypt from 'bcrypt';
import { BCRYPT_ROUNDS } from './constants';

export async function hashPassword(password: string) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string) {
    return bcrypt.compare(password, passwordHash);
}
