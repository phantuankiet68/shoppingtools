import { NextResponse } from 'next/server';

import { requireAdminAuthUser } from '@/lib/auth/auth';

import { scriptService } from '@/features/platform/ai-video/services/script-service';
import { geminiScriptProvider } from '@/features/platform/ai-video/providers/script/gemini-script-provider';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

export async function POST(request: Request, context: RouteContext) {
    try {
        const user = await requireAdminAuthUser();

        const { id } = await context.params;

        if (!id) {
            return NextResponse.json(
                {
                    error: 'Project id is required',
                },
                {
                    status: 400,
                },
            );
        }

        let body: Record<string, unknown> = {};

        try {
            const parsed: unknown = await request.json();

            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                body = parsed as Record<string, unknown>;
            }
        } catch {
            body = {};
        }

        const force = body.force === true;

        const result = force
            ? await scriptService.regenerateScript(id, user.id, geminiScriptProvider)
            : await scriptService.generateScript(id, user.id, {
                  provider: geminiScriptProvider,
                  force: false,
              });

        return NextResponse.json(
            {
                data: {
                    projectId: result.projectId,
                    scriptText: result.scriptText,
                    scriptJson: result.scriptJson,
                },
                message: force
                    ? 'Script regenerated successfully'
                    : 'Script generated successfully',
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error('[ai-video] POST /projects/[id]/script error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to generate script',
            },
            {
                status: 500,
            },
        );
    }
}
