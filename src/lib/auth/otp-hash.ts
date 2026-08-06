import bcrypt from 'bcrypt';

const OTP_COST = 10;

export async function hashOtp(otp: string) {
    return bcrypt.hash(otp, OTP_COST);
}

export async function verifyOtp(otp: string, hash: string) {
    return bcrypt.compare(otp, hash);
}
