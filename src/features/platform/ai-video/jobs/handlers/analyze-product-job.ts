import { prisma } from '@/lib/prisma';

import { createVideoJob } from '../video-job-service';
import type { VideoJobHandler } from '../video-job-types';

export const analyzeProductJob: VideoJobHandler = async ({ job }) => {
    const project = await prisma.videoProject.findUnique({
        where: {
            id: job.projectId,
        },
        include: {
            videoAffiliate: true,
        },
    });

    if (!project) {
        throw new Error('Video project not found');
    }

    if (!project.videoAffiliateId || !project.videoAffiliate) {
        throw new Error('Video affiliate is not configured');
    }

    const affiliate = project.videoAffiliate;

    const hasProductData = Boolean(
        affiliate.title || affiliate.description || affiliate.productImages,
    );

    if (!hasProductData) {
        throw new Error('Product does not contain enough information for analysis');
    }

    const analysis = {
        title: affiliate.title,
        description: affiliate.description,
        category: affiliate.category,
        priceMin: affiliate.priceMin?.toString() ?? null,
        priceMax: affiliate.priceMax?.toString() ?? null,
        rating: affiliate.rating?.toString() ?? null,
        reviewCount: affiliate.reviewCount,
        soldCount: affiliate.soldCount,
        productImages: affiliate.productImages,
        highlights: affiliate.highlights,
    };

    await prisma.videoAffiliate.update({
        where: {
            id: affiliate.id,
        },
        data: {
            analysisJson: analysis,
            status: 'READY',
        },
    });

    await prisma.videoProject.update({
        where: {
            id: project.id,
        },
        data: {
            currentStep: 'GENERATE_SCRIPT',
            progress: 15,
            status: 'GENERATING',
            errorMessage: null,
        },
    });

    const existingScriptJob = await prisma.videoJob.findFirst({
        where: {
            projectId: project.id,
            type: 'GENERATE_SCRIPT',
            status: {
                in: ['QUEUED', 'PROCESSING'],
            },
        },
        orderBy: {
            createdAt: 'desc',
        },
    });

    if (!existingScriptJob) {
        await createVideoJob(project.createdById, {
            projectId: project.id,
            type: 'GENERATE_SCRIPT',
            maxAttempts: 1,
            inputJson: {
                source: 'analyze-product-job',
            },
        });
    }

    return {
        projectId: project.id,
        affiliateId: affiliate.id,
        analyzed: true,
        nextStep: 'GENERATE_SCRIPT',
    };
};

export default analyzeProductJob;
