import { verifyPassword } from '@/lib/auth/password';
import { getRequestMeta } from '@/lib/auth/request';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';
function isValidEmail(email: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email.trim());
}
export async function createUserSession(_: {
    userId: string;
    ipAddress?: string | null;
    userAgent?: string | null;
}) {
    return {
        token: 'temp-token',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
}

export function setSessionCookie(response: NextResponse, token: string, expiresAt: Date) {
    response.cookies.set('admin_session', token, {
        expires: expiresAt,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/',
    });
}

export async function POST(req: Request) {
    const meta = getRequestMeta(req);

    try {
        const body = await req.json();
        const email = String(body?.email ?? '')
            .trim()
            .toLowerCase();
        const password = String(body?.password ?? '');

        if (!isValidEmail(email)) {
            return NextResponse.json({ message: 'Email không hợp lệ.' }, { status: 400 });
        }

        if (password.length < 6) {
            return NextResponse.json({ message: 'Mật khẩu không hợp lệ.' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            await prisma.loginAttempt.create({
                data: {
                    email,
                    ipAddress: meta.ipAddress || 'unknown',
                    userAgent: meta.userAgent,
                    success: false,
                },
            });

            return NextResponse.json({ message: 'Sai email hoặc mật khẩu.' }, { status: 401 });
        }

        if (user.systemRole !== 'CUSTOMER') {
            await prisma.loginAttempt.create({
                data: {
                    email,
                    userId: user.id,
                    ipAddress: meta.ipAddress || 'unknown',
                    userAgent: meta.userAgent,
                    success: false,
                },
            });

            return NextResponse.json(
                { message: 'Tài khoản này không đăng nhập ở cổng CUSTOMER.' },
                { status: 403 },
            );
        }

        if (user.status !== 'ACTIVE') {
            await prisma.loginAttempt.create({
                data: {
                    email,
                    userId: user.id,
                    ipAddress: meta.ipAddress || 'unknown',
                    userAgent: meta.userAgent,
                    success: false,
                },
            });

            return NextResponse.json({ message: 'Tài khoản đang bị khóa.' }, { status: 403 });
        }

        const ok = await verifyPassword(password, user.passwordHash);

        await prisma.loginAttempt.create({
            data: {
                email,
                userId: user.id,
                ipAddress: meta.ipAddress || 'unknown',
                userAgent: meta.userAgent,
                success: ok,
            },
        });

        if (!ok) {
            return NextResponse.json({ message: 'Sai email hoặc mật khẩu.' }, { status: 401 });
        }

        const session = await createUserSession({
            userId: user.id,
            ipAddress: meta.ipAddress,
            userAgent: meta.userAgent,
        });

        await prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
            },
        });

        await prisma.auditLog.create({
            data: {
                actorUserId: user.id,
                targetUserId: user.id,
                action: 'AUTH_LOGIN',
                ipAddress: meta.ipAddress,
                userAgent: meta.userAgent,
            },
        });

        const response = NextResponse.json({
            message: 'Đăng nhập thành công.',
            user: {
                id: user.id,
                email: user.email,
                systemRole: user.systemRole,
                status: user.status,
                image: user.image,
            },
        });

        setSessionCookie(response, session.token, session.expiresAt);

        return response;
    } catch (error) {
        console.error('LOGIN_ERROR', error);
        return NextResponse.json({ message: 'Đăng nhập thất bại.' }, { status: 500 });
    }
}
