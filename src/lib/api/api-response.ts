import { NextResponse } from 'next/server';

export function apiSuccess<T>(data: T, status = 200) {
    return NextResponse.json({ success: true, data }, { status });
}

export function apiError(error: unknown) {
    console.error('[API_ERROR]', error);

    const message = error instanceof Error ? error.message : 'Internal server error.';
    const status = message.startsWith('Invalid analytics') ? 400 : 500;

    return NextResponse.json(
        {
            success: false,
            error: {
                message: status === 500 ? 'Internal server error.' : message,
            },
        },
        { status },
    );
}
