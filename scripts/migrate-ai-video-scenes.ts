import fs from 'node:fs/promises';
import path from 'node:path';

import { prisma } from '@/lib/prisma';

const PROJECT_ID = 'cmt32z4fy0000fwjzz1evbufe';

async function main() {
    const scenes = await prisma.videoScene.findMany({
        where: {
            projectId: PROJECT_ID,
            status: 'COMPLETED',
            sceneNumber: {
                lte: 4,
            },
        },
        orderBy: {
            sceneNumber: 'asc',
        },
        select: {
            id: true,
            sceneNumber: true,
            generatedVideoUrl: true,
        },
    });

    if (!scenes.length) {
        throw new Error('No completed scenes found');
    }

    for (const scene of scenes) {
        const sourceUrl = scene.generatedVideoUrl?.trim();

        if (!sourceUrl) {
            throw new Error(`Scene ${scene.sceneNumber} does not have generatedVideoUrl`);
        }

        if (sourceUrl.startsWith('/assets/ai-video/projects/')) {
            console.log(`[migrate] Scene ${scene.sceneNumber} already stored`);

            continue;
        }

        if (!/^https?:\/\//i.test(sourceUrl)) {
            throw new Error(`Unsupported scene URL for scene ${scene.sceneNumber}: ${sourceUrl}`);
        }

        const storageDir = path.join(
            process.cwd(),
            'storage',
            'ai-video',
            'projects',
            PROJECT_ID,
            'scenes',
        );

        await fs.mkdir(storageDir, {
            recursive: true,
        });

        const fileName = `scene-${String(scene.sceneNumber).padStart(2, '0')}.mp4`;

        const filePath = path.join(storageDir, fileName);

        const tempPath = `${filePath}.tmp`;

        console.log(`[migrate] Downloading scene ${scene.sceneNumber}...`);

        const response = await fetch(sourceUrl, {
            method: 'GET',
            redirect: 'follow',
        });

        if (!response.ok) {
            throw new Error(`Scene ${scene.sceneNumber}: HTTP ${response.status}`);
        }

        const buffer = Buffer.from(await response.arrayBuffer());

        if (!buffer.length) {
            throw new Error(`Scene ${scene.sceneNumber} downloaded file is empty`);
        }

        await fs.writeFile(tempPath, buffer);

        await fs.rename(tempPath, filePath);

        const publicUrl = `/assets/ai-video/projects/${PROJECT_ID}/scenes/${fileName}`;

        await prisma.videoScene.update({
            where: {
                id: scene.id,
            },
            data: {
                generatedVideoUrl: publicUrl,
            },
        });

        console.log(`[migrate] Scene ${scene.sceneNumber} → ${publicUrl}`);
    }

    console.log('[migrate] Done');
}

main()
    .catch((error) => {
        console.error('[migrate] Failed:', error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
