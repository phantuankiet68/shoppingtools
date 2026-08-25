import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { requireAdminAuthUser } from '@/lib/auth/auth';

import { sceneService } from '@/features/platform/ai-video/services/scene-service';

import { createVideoProvider } from '@/features/platform/ai-video/providers/video/video-provider-factory';

interface RouteContext {
    params: Promise<{
        id: string;
    }>;
}

// ============================================================
// GET — List Project Scenes
// ============================================================

export async function GET(_request: Request, context: RouteContext) {
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

        const project = await prisma.videoProject.findFirst({
            where: {
                id,
                createdById: user.id,
            },
            select: {
                id: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                {
                    error: 'Video project not found',
                },
                {
                    status: 404,
                },
            );
        }

        const scenes = await prisma.videoScene.findMany({
            where: {
                projectId: project.id,
            },
            orderBy: {
                sceneNumber: 'asc',
            },
        });

        return NextResponse.json(scenes);
    } catch (error) {
        console.error('[ai-video] GET scenes error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to load video scenes',
            },
            {
                status: 500,
            },
        );
    }
}

// ============================================================
// POST — Generate Project Scenes
// ============================================================

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

        // --------------------------------------------------------
        // Parse body
        // --------------------------------------------------------

        let body: Record<string, unknown> = {};

        try {
            const parsed = await request.json();

            if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
                body = parsed as Record<string, unknown>;
            }
        } catch {
            // Empty body is allowed.
        }

        // --------------------------------------------------------
        // Check project ownership
        // --------------------------------------------------------

        const project = await prisma.videoProject.findFirst({
            where: {
                id,
                createdById: user.id,
            },
            select: {
                id: true,
                status: true,
                videoAffiliateId: true,
            },
        });

        if (!project) {
            return NextResponse.json(
                {
                    error: 'Video project not found',
                },
                {
                    status: 404,
                },
            );
        }

        // --------------------------------------------------------
        // Archived project
        // --------------------------------------------------------

        if (project.status === 'ARCHIVED') {
            return NextResponse.json(
                {
                    error: 'Archived projects cannot generate scenes',
                },
                {
                    status: 409,
                },
            );
        }

        // --------------------------------------------------------
        // Create video provider
        // --------------------------------------------------------

        let provider;

        try {
            provider = createVideoProvider();
        } catch (error) {
            console.error('[ai-video] Video provider creation error:', error);

            return NextResponse.json(
                {
                    error:
                        error instanceof Error ? error.message : 'Video provider is not configured',
                },
                {
                    status: 501,
                },
            );
        }

        // --------------------------------------------------------
        // Generate scenes
        // --------------------------------------------------------

        const regenerate = body.regenerate === true;

        const result = await sceneService.generateScenes(project.id, user.id, {
            provider,
            regenerate,
        });

        return NextResponse.json(
            {
                success: true,
                projectId: project.id,
                total: result.total,
                completed: result.completed,
                scenes: result.scenes,
            },
            {
                status: 200,
            },
        );
    } catch (error) {
        console.error('[ai-video] POST scenes error:', error);

        return NextResponse.json(
            {
                error: error instanceof Error ? error.message : 'Failed to generate video scenes',
            },
            {
                status: 500,
            },
        );
    }
}
