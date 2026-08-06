import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendChangePasswordOtpOptions {
    email: string;
    otp: string;
}

export async function sendChangePasswordOtp({ email, otp }: SendChangePasswordOtpOptions) {
    const { data, error } = await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: email,
        subject: 'Change Password Verification',
        html: `
            <div style="font-family:Arial,sans-serif">
                <h2>Password Verification</h2>

                <p>You requested to change your password.</p>

                <p>Your verification code is:</p>

                <h1 style="letter-spacing:6px">${otp}</h1>

                <p>
                    This code will expire in
                    <strong>5 minutes</strong>.
                </p>

                <p>
                    If you didn't request this change,
                    please ignore this email.
                </p>
            </div>
        `,
    });

    if (error) {
        throw new Error(error.message);
    }

    return data;
}
