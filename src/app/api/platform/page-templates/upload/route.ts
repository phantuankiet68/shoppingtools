import { getUserFromRequest } from '@/lib/auth/getUser';
import { hasRole } from '@/lib/auth/roles';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

function safeImageExtFromType(type: string) {
    switch (type) {
        case 'image/jpeg':
            return '.jpg';
        case 'image/png':
            return '.png';
        case 'image/webp':
            return '.webp';
        case 'image/gif':
            return '.gif';
        case 'image/svg+xml':
            return '.svg';
        default:
            return '';
    }
}

function safeBaseName(name: string) {
    return name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 50);
}

export async function POST(req: Request) {
    try {
        const user = await getUserFromRequest();

        if (!user || !hasRole(user.systemRole, 'SUPER_ADMIN')) {
            return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
        }

        const form = await req.formData();
        const file = form.get('file');

        if (!(file instanceof File)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'No file uploaded.',
                },
                { status: 400 },
            );
        }

        const ext = safeImageExtFromType(file.type);

        if (!ext) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Unsupported image type: ${file.type}`,
                },
                { status: 400 },
            );
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
                {
                    success: false,
                    error: `${file.name} is too large. Maximum size is 5MB.`,
                },
                { status: 400 },
            );
        }

        const directory = path.join(process.cwd(), 'public', 'assets', 'page-templates');

        await fs.mkdir(directory, {
            recursive: true,
        });

        const buffer = Buffer.from(await file.arrayBuffer());

        const originalName =
            typeof file.name === 'string' && file.name.trim() ? file.name.trim() : 'page-template';

        const nameWithoutExtension = originalName.replace(/\.[^.]+$/, '');

        const baseName = safeBaseName(nameWithoutExtension) || 'page-template';

        const fileName = `${baseName}-${crypto.randomBytes(8).toString('hex')}${ext}`;

        const fullPath = path.join(directory, fileName);

        await fs.writeFile(fullPath, buffer);

        const url = `/assets/page-templates/${fileName}`;

        return NextResponse.json({
            success: true,
            data: {
                url,
                fileName,
                originalName,
                size: file.size,
                type: file.type,
            },
        });
    } catch (error) {
        console.error('[POST /api/platform/page-templates/upload]', error);

        return NextResponse.json(
            {
                success: false,
                error: error instanceof Error ? error.message : 'Upload failed.',
            },
            { status: 500 },
        );
    }
}
