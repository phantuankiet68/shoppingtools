import bcrypt from 'bcrypt';
import { AUTH } from '@/constants/auth';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, AUTH.BCRYPT_ROUNDS);
}

export async function verifyPassword(password: string, passwordHash: string): Promise<boolean> {
    return bcrypt.compare(password, passwordHash);
}
