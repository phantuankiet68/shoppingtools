export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

export async function changePassword(body: ChangePasswordRequest) {
    const response = await fetch('/api/v1/account/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}
export interface VerifyChangePasswordRequest {
    verificationId: string;
    otp: string;
}

export async function verifyChangePassword(body: VerifyChangePasswordRequest) {
    const response = await fetch('/api/v1/account/change-password/verify', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}
export async function resendChangePassword() {
    const response = await fetch('/api/v1/account/change-password/resend', {
        method: 'POST',
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.message);
    }

    return result;
}
