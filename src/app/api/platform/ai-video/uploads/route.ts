import { NextResponse } from 'next/server';
import { requireAdminAuthUser } from '@/lib/auth/auth';
import path from 'node:path';
import fs from 'node:fs/promises';
import crypto from 'node:crypto';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function getImageExtension(type: string): string {
    switch (type) {
        case 'image/jpeg':
            return '.jpg';
        case 'image/png':
            return '.png';
        case 'image/webp':
            return '.webp';
        default:
            return '';
    }
}

function safeBaseName(name: string): string {
    return (
        name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .slice(0, 50) || 'product-image'
    );
}

export async function POST(request: Request) {
    try {
        const user = await requireAdminAuthUser();

        const formData = await request.formData();
        const file = formData.get('file');

        if (!file || typeof file === 'string') {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No image file uploaded',
                },
                {
                    status: 400,
                },
            );
        }

        if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unsupported image type',
                    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
                },
                {
                    status: 400,
                },
            );
        }

        if (file.size <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Uploaded image is empty',
                },
                {
                    status: 400,
                },
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Image is too large. Maximum size is 5MB',
                },
                {
                    status: 400,
                },
            );
        }

        const extension = getImageExtension(file.type);

        if (!extension) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unsupported image format',
                },
                {
                    status: 400,
                },
            );
        }

        const originalName =
            typeof file.name === 'string' && file.name.trim() ? file.name.trim() : 'product-image';

        const baseName = safeBaseName(originalName.replace(/\.[^.]+$/, ''));

        const uniqueName = `${baseName}-${crypto.randomBytes(8).toString('hex')}${extension}`;

        const uploadDir = path.join(process.cwd(), 'storage', 'ai-video', 'products');

        await fs.mkdir(uploadDir, {
            recursive: true,
        });

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const fullPath = path.join(uploadDir, uniqueName);

        await fs.writeFile(fullPath, buffer);

        const url = `/assets/ai-video/products/${uniqueName}`;

        return NextResponse.json(
            {
                success: true,
                data: {
                    id: crypto.randomUUID(),
                    url,
                    fileName: uniqueName,
                    originalName,
                    size: file.size,
                    type: file.type,
                },
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error('[ai-video] POST /uploads error:', error);

        const message = error instanceof Error ? error.message : 'Upload failed';

        if (
            message.toLowerCase().includes('unauthorized') ||
            message.toLowerCase().includes('authentication')
        ) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Unauthorized',
                },
                {
                    status: 401,
                },
            );
        }

        return NextResponse.json(
            {
                success: false,
                error: message,
            },
            {
                status: 500,
            },
        );
    }
}
