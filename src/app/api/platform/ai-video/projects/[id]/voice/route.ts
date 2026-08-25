import { NextResponse } from 'next/server';
import { requireAdminAuthUser } from '@/lib/auth/auth';
import { voiceService } from '@/features/platform/ai-video/services/voice-service';
import { elevenLabsVoiceProvider } from '@/features/platform/ai-video/providers/voice/elevenlabs-voice-provider';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

const VOICE_PROVIDERS = ['elevenlabs'] as const;
type VoiceProvider = (typeof VOICE_PROVIDERS)[number];

function isVoiceProvider(value: unknown): value is VoiceProvider {
    return typeof value === 'string' && VOICE_PROVIDERS.includes(value as VoiceProvider);
}

export async function POST(request: Request, context: RouteContext) {
    try {
        const user = await requireAdminAuthUser();
        const { id } = await context.params;

        if (!id?.trim()) {
            return NextResponse.json({ error: 'Project id is required' }, { status: 400 });
        }

        let body: Record<string, unknown> = {};

        try {
            const parsed = await request.json();

            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                body = parsed as Record<string, unknown>;
            }
        } catch {
            body = {};
        }

        const voiceProvider = body.voiceProvider === undefined ? 'elevenlabs' : body.voiceProvider;

        if (!isVoiceProvider(voiceProvider)) {
            return NextResponse.json(
                {
                    error: 'Invalid voiceProvider',
                    allowedProviders: VOICE_PROVIDERS,
                },
                { status: 400 },
            );
        }

        if (
            body.voiceId !== undefined &&
            body.voiceId !== null &&
            typeof body.voiceId !== 'string'
        ) {
            return NextResponse.json({ error: 'Invalid voiceId' }, { status: 400 });
        }

        if (body.force !== undefined && typeof body.force !== 'boolean') {
            return NextResponse.json({ error: 'Invalid force value' }, { status: 400 });
        }

        const voiceId =
            typeof body.voiceId === 'string' && body.voiceId.trim()
                ? body.voiceId.trim()
                : undefined;

        const force = body.force === true;

        const result = await voiceService.generateVoice(id, user.id, {
            provider: elevenLabsVoiceProvider,
            voiceProvider,
            voiceId,
            force,
        });

        return NextResponse.json(
            {
                success: true,
                data: {
                    projectId: result.projectId,
                    voiceText: result.voiceText,
                    voiceUrl: result.voiceUrl,
                    provider: result.provider,
                    voiceId: result.voiceId ?? null,
                    durationSeconds: result.durationSeconds ?? null,
                },
                message: force ? 'Voice regenerated successfully' : 'Voice generated successfully',
            },
            { status: 200 },
        );
    } catch (error) {
        console.error('[ai-video] POST /projects/[id]/voice error:', error);

        const message = error instanceof Error ? error.message : 'Failed to generate voice';

        if (
            message.toLowerCase().includes('unauthorized') ||
            message.toLowerCase().includes('authentication')
        ) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json(
            {
                error: message,
            },
            { status: 500 },
        );
    }
}
