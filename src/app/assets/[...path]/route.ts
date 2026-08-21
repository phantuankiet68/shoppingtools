import { NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';

export const runtime = 'nodejs';

function getContentType(filePath: string) {
    const ext = path.extname(filePath).toLowerCase();

    switch (ext) {
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';

        case '.png':
            return 'image/png';

        case '.webp':
            return 'image/webp';

        case '.gif':
            return 'image/gif';

        case '.svg':
            return 'image/svg+xml';

        case '.avif':
            return 'image/avif';

        default:
            return 'application/octet-stream';
    }
}

export async function GET(_req: Request, { params }: { params: Promise<{ path?: string[] }> }) {
    try {
        const { path: segments } = await params;

        if (!segments || segments.length === 0) {
            return new NextResponse('Not Found', { status: 404 });
        }

        // Chặn path traversal
        const relativePath = segments.join('/');

        if (relativePath.includes('..') || relativePath.includes('\\')) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        const storageRoot = path.join(process.cwd(), 'storage');

        const filePath = path.resolve(storageRoot, ...segments);

        // Đảm bảo file vẫn nằm trong storage/
        if (filePath !== storageRoot && !filePath.startsWith(`${storageRoot}${path.sep}`)) {
            return new NextResponse('Forbidden', { status: 403 });
        }

        const file = await fs.readFile(filePath);

        const contentType = getContentType(filePath);

        return new Response(new Uint8Array(file), {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });
    } catch (error: unknown) {
        console.error('GET /assets/* error:', error);

        if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
            return new NextResponse('Not Found', {
                status: 404,
            });
        }

        return new NextResponse('Internal Server Error', {
            status: 500,
        });
    }
}
