import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { NextRequest, NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getCustomerContextFromRequest } from '@/lib/auth/customer-guard';

export const runtime = 'nodejs';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

const VALID_TYPES = ['avatar', 'banner', 'thumbnail'] as const;

type UploadType = (typeof VALID_TYPES)[number];

function error(message: string, status = 400) {
    return NextResponse.json(
        {
            success: false,
            message,
        },
        {
            status,
        },
    );
}

export async function POST(request: NextRequest) {
    try {
        const auth = await getCustomerContextFromRequest(request);

        if (!auth.ok) {
            return error('Unauthorized.', 401);
        }

        const formData = await request.formData();

        const file = formData.get('file');
        const type = formData.get('type');

        if (!(file instanceof File)) {
            return error('File is required.');
        }

        if (typeof type !== 'string' || !VALID_TYPES.includes(type as UploadType)) {
            return error('Invalid upload type.');
        }

        if (!file.type.startsWith('image/')) {
            return error('Only image files are allowed.');
        }

        if (file.size > MAX_UPLOAD_BYTES) {
            return error('Maximum upload size is 10 MB.');
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        let width = 512;
        let height = 512;

        switch (type) {
            case 'avatar':
                width = 512;
                height = 512;
                break;

            case 'banner':
                width = 1600;
                height = 500;
                break;

            case 'thumbnail':
                width = 1200;
                height = 800;
                break;
        }

        const optimized = await sharp(buffer)
            .rotate()
            .resize(width, height, {
                fit: 'cover',
            })
            .webp({
                quality: 85,
            })
            .toBuffer();

        const folder = `${type}s`;

        const uploadDir = path.join(process.cwd(), 'public', 'uploads', folder);

        await fs.mkdir(uploadDir, {
            recursive: true,
        });

        const filename = `${crypto.randomUUID()}-${Date.now()}.webp`;

        await fs.writeFile(path.join(uploadDir, filename), optimized);

        const imageUrl = `/uploads/${folder}/${filename}`;

        let profile = null;

        if (type === 'avatar' || type === 'banner') {
            profile = await prisma.profile.upsert({
                where: {
                    userId: auth.user.id,
                },

                create: {
                    userId: auth.user.id,
                    [type]: imageUrl,
                },

                update: {
                    [type]: imageUrl,
                },

                select: {
                    id: true,
                    avatar: true,
                    banner: true,
                },
            });
        }

        return NextResponse.json({
            success: true,
            message: 'Image uploaded successfully.',
            type,
            image: imageUrl,
            profile,
        });
    } catch (err) {
        console.error('[PROFILE_UPLOAD]', err);

        return error('Internal server error.', 500);
    }
}
