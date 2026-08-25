import { NextResponse } from 'next/server';

import { requireAdminAuthUser } from '@/lib/auth/auth';

const PROVIDERS = {
    script: [
        {
            id: 'openai',
            name: 'OpenAI',
            type: 'script',
            enabled: true,
            models: [
                {
                    id: 'gpt-5',
                    name: 'GPT-5',
                },
            ],
        },
    ],

    voice: [
        {
            id: 'elevenlabs',
            name: 'ElevenLabs',
            type: 'voice',
            enabled: true,
            languages: ['vi-VN', 'en-US', 'ja-JP', 'ko-KR', 'zh-CN'],
        },
    ],

    video: [
        {
            id: 'runway',
            name: 'Runway',
            type: 'video',
            enabled: false,
        },
        {
            id: 'kling',
            name: 'Kling AI',
            type: 'video',
            enabled: false,
        },
        {
            id: 'veo',
            name: 'Google Veo',
            type: 'video',
            enabled: false,
        },
    ],
} as const;

export async function GET() {
    try {
        await requireAdminAuthUser();

        return NextResponse.json({
            data: PROVIDERS,
        });
    } catch (error) {
        console.error('[ai-video] GET /providers error:', error);

        return NextResponse.json(
            {
                error: 'Failed to load AI providers',
            },
            {
                status: 500,
            },
        );
    }
}
