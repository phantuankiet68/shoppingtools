import { NextResponse } from 'next/server';

import { requireAdminAuthUser } from '@/lib/auth/auth';
import {
    createVideoCharacter,
    listVideoCharacters,
} from '@/features/platform/ai-video/services/video-character-service';

const CHARACTER_GENDERS = ['FEMALE', 'MALE', 'NON_BINARY', 'UNSPECIFIED'] as const;

function isCharacterGender(value: unknown): value is (typeof CHARACTER_GENDERS)[number] {
    return (
        typeof value === 'string' &&
        CHARACTER_GENDERS.includes(value as (typeof CHARACTER_GENDERS)[number])
    );
}

export async function GET() {
    try {
        const user = await requireAdminAuthUser();

        const characters = await listVideoCharacters(user.id);

        return NextResponse.json({
            data: characters,
        });
    } catch (error) {
        console.error('[ai-video] GET /characters error:', error);

        return NextResponse.json(
            {
                error: 'Failed to load video characters',
            },
            {
                status: 500,
            },
        );
    }
}

export async function POST(request: Request) {
    try {
        const user = await requireAdminAuthUser();

        let body: unknown;

        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                {
                    error: 'Invalid JSON body',
                },
                {
                    status: 400,
                },
            );
        }

        if (!body || typeof body !== 'object') {
            return NextResponse.json(
                {
                    error: 'Request body must be an object',
                },
                {
                    status: 400,
                },
            );
        }

        const input = body as Record<string, unknown>;

        if (typeof input.name !== 'string' || !input.name.trim()) {
            return NextResponse.json(
                {
                    error: 'name is required',
                },
                {
                    status: 400,
                },
            );
        }

        if (typeof input.imageUrl !== 'string' || !input.imageUrl.trim()) {
            return NextResponse.json(
                {
                    error: 'imageUrl is required',
                },
                {
                    status: 400,
                },
            );
        }

        if (input.gender !== undefined && !isCharacterGender(input.gender)) {
            return NextResponse.json(
                {
                    error: 'Invalid gender',
                    allowedGenders: CHARACTER_GENDERS,
                },
                {
                    status: 400,
                },
            );
        }

        const character = await createVideoCharacter(user.id, {
            name: input.name.trim(),
            imageUrl: input.imageUrl.trim(),

            thumbnailUrl: typeof input.thumbnailUrl === 'string' ? input.thumbnailUrl : undefined,

            gender: isCharacterGender(input.gender) ? input.gender : undefined,

            language: typeof input.language === 'string' ? input.language : undefined,

            voiceProvider:
                typeof input.voiceProvider === 'string' ? input.voiceProvider : undefined,

            voiceId: typeof input.voiceId === 'string' ? input.voiceId : undefined,

            defaultMotion:
                typeof input.defaultMotion === 'string' ? input.defaultMotion : undefined,

            defaultStyle: typeof input.defaultStyle === 'string' ? input.defaultStyle : undefined,

            metadata: input.metadata,
        });

        return NextResponse.json(
            {
                data: character,
            },
            {
                status: 201,
            },
        );
    } catch (error) {
        console.error('[ai-video] POST /characters error:', error);

        return NextResponse.json(
            {
                error: 'Failed to create video character',
            },
            {
                status: 500,
            },
        );
    }
}
