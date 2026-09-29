import { NextRequest, NextResponse } from 'next/server';
import path from 'path';
import fs from 'fs/promises';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { getCurrentSession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FOLDERS = ['portfolios', 'projects', 'pages', 'templates', 'media'] as const;

type UploadFolder = (typeof ALLOWED_FOLDERS)[number];

const MIME_TO_EXTENSION: Record<string, string> = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/webp': '.webp',
    'image/gif': '.gif',
    'image/svg+xml': '.svg',
};

function safeImageExtFromType(type: string) {
    return MIME_TO_EXTENSION[type] ?? '';
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

function isAllowedFolder(value: string): value is UploadFolder {
    return ALLOWED_FOLDERS.includes(value as UploadFolder);
}

function jsonError(message: string, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        { status },
    );
}

export async function POST(request: NextRequest) {
    try {
        const session = await getCurrentSession();

        if (!session) {
            return jsonError('Unauthorized.', 401);
        }

        const workspaceId = session.currentWorkspace?.id;

        if (!workspaceId) {
            return jsonError('Workspace not found.', 403);
        }
        const formData = await request.formData();

        const file = formData.get('file');
        const siteId = String(formData.get('siteId') ?? '').trim();
        const folderValue = String(formData.get('folder') ?? 'media')
            .trim()
            .toLowerCase();

        if (!file || typeof file === 'string') {
            return jsonError('No file uploaded.');
        }

        if (!siteId) {
            return jsonError('Site ID is required.');
        }

        if (!isAllowedFolder(folderValue)) {
            return jsonError(
                `Invalid upload folder. Allowed folders: ${ALLOWED_FOLDERS.join(', ')}`,
            );
        }

        const site = await prisma.site.findFirst({
            where: {
                id: siteId,
                workspaceId,
                deletedAt: null,
            },
            select: {
                id: true,
                name: true,
            },
        });

        if (!site) {
            return jsonError('Site not found.', 404);
        }
        const extension = safeImageExtFromType(file.type);

        if (!extension) {
            return jsonError(`Unsupported image type: ${file.type}`);
        }

        if (file.size <= 0) {
            return jsonError('The uploaded file is empty.');
        }

        if (file.size > MAX_FILE_SIZE) {
            return jsonError(`${file.name} is too large. Maximum file size is 5MB.`);
        }
        const directory = path.join(process.cwd(), 'storage', 'sites', site.id, folderValue);

        await fs.mkdir(directory, {
            recursive: true,
        });

        const originalName =
            typeof file.name === 'string' && file.name.trim() ? file.name.trim() : 'image';

        const originalBaseName = originalName.replace(/\.[^.]+$/, '');

        const baseName = safeBaseName(originalBaseName) || 'image';

        const randomSuffix = crypto.randomBytes(8).toString('hex');

        const fileName = `${baseName}-${randomSuffix}${extension}`;

        const fullPath = path.join(directory, fileName);
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        await fs.writeFile(fullPath, buffer);

        const url = `/assets/sites/${site.id}/${folderValue}/${fileName}`;

        const storagePath = `storage/sites/${site.id}/${folderValue}/${fileName}`;

        return NextResponse.json({
            success: true,
            message: 'Image uploaded successfully.',
            file: {
                fileName,
                originalName,
                mimeType: file.type,
                size: file.size,
                extension,
                siteId: site.id,
                folder: folderValue,
                storagePath,
                url,
            },
        });
    } catch (error: unknown) {
        console.error('POST /api/admin/upload error:', error);

        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Upload failed.',
            },
            { status: 500 },
        );
    }
}
