import type {
    Character,
    ProductImage,
    ProductInfo,
    ScriptScene,
    VideoSettings,
    WorkflowStep,
} from './types';

export const DEFAULT_PRODUCT: ProductInfo = {
    title: 'Ốp Lưng iPhone Silicon Dẻo Camera Nhám Mờ Awifi X5-1',
    rating: 4.9,
    reviews: '3.4K đánh giá',
    sold: '60K+ đã bán',
    description:
        'Ốp lưng iPhone silicon dẻo với thiết kế camera bảo vệ nâng cao, bề mặt nhám mờ, cầm chắc tay và hỗ trợ nhiều phiên bản iPhone từ iPhone 11 đến iPhone 17 Pro Max.',
    category: 'Phụ kiện điện thoại',
    price: '31.560₫ – 32.000₫',
    imageUrl: '',
    images: [],
    highlights: [
        'Silicon dẻo mềm',
        'Bề mặt nhám mờ',
        'Thiết kế bảo vệ camera',
        'Ôm sát thân máy',
        '4 màu lựa chọn',
        'Hỗ trợ nhiều dòng iPhone',
    ],
    sourceUrl: '',
    sourcePlatform: 'SHOPEE',
};

export const DEFAULT_CHARACTERS: Character[] = [
    {
        id: 'sarah',
        name: 'Sarah',
        role: 'Product Reviewer',
        gender: 'FEMALE',
        language: 'vi-VN',
        image: 'S',
        voiceProvider: 'elevenlabs',
        voiceId: '',
        defaultMotion: 'natural',
        defaultStyle: 'product-review',
    },
    {
        id: 'mike',
        name: 'Mike',
        role: 'Product Reviewer',
        gender: 'MALE',
        language: 'vi-VN',
        image: 'M',
        voiceProvider: 'elevenlabs',
        voiceId: '',
        defaultMotion: 'natural',
        defaultStyle: 'product-review',
    },
];

export const DEFAULT_SETTINGS: VideoSettings = {
    duration: 30,
    aspectRatio: '9:16',
    resolution: '1080 × 1920',
    language: 'vi-VN',
    style: 'Product Review',
    music: 'Upbeat & Fun',
    voice: 'Female · Energetic',
};

export const DEFAULT_WORKFLOW: WorkflowStep[] = [
    {
        id: 'product',
        title: 'Product Analysis',
        icon: 'bi-box-seam',
        status: 'waiting',
    },
    {
        id: 'script',
        title: 'Script Generation',
        icon: 'bi-stars',
        status: 'waiting',
    },
    {
        id: 'voice',
        title: 'Voice Synthesis',
        icon: 'bi-mic',
        status: 'waiting',
    },
    {
        id: 'scene',
        title: 'Scene Generation',
        icon: 'bi-layers',
        status: 'waiting',
    },
    {
        id: 'compose',
        title: 'Video Composition',
        icon: 'bi-collection-play',
        status: 'waiting',
    },
    {
        id: 'render',
        title: 'Final Rendering',
        icon: 'bi-film',
        status: 'waiting',
    },
    {
        id: 'ready',
        title: 'Video Ready',
        icon: 'bi-check2-circle',
        status: 'waiting',
    },
];

export function getWorkflowFromProject(
    status: string | undefined,
    currentStep: string | null | undefined,
    progress: number | undefined,
): WorkflowStep[] {
    const workflow = DEFAULT_WORKFLOW.map((step) => ({
        ...step,
        status: 'waiting' as WorkflowStep['status'],
        meta: undefined,
    }));

    if (!status) {
        return workflow;
    }

    const stepMap: Record<string, string> = {
        ANALYZE_PRODUCT: 'product',
        GENERATE_SCRIPT: 'script',
        GENERATE_VOICE: 'voice',
        GENERATE_SCENES: 'scene',
        COMPOSE_VIDEO: 'compose',
        RENDER_VIDEO: 'render',
        COMPLETED: 'ready',
    };

    const currentId = currentStep ? stepMap[currentStep] : undefined;

    if (status === 'COMPLETED' || currentStep === 'COMPLETED') {
        return workflow.map((step) => ({
            ...step,
            status: 'completed',
            meta: step.id === 'ready' ? '100%' : undefined,
        }));
    }

    if (status === 'FAILED') {
        return workflow.map((step) => {
            if (step.id === currentId) {
                return {
                    ...step,
                    status: 'failed',
                    meta: 'Failed',
                };
            }

            return step;
        });
    }

    if (currentId) {
        const currentIndex = workflow.findIndex((step) => step.id === currentId);

        if (currentIndex === -1) {
            return workflow;
        }

        return workflow.map((step, index) => {
            if (index < currentIndex) {
                return {
                    ...step,
                    status: 'completed',
                    meta: undefined,
                };
            }

            if (index === currentIndex) {
                return {
                    ...step,
                    status: 'processing',
                    meta: `${Math.max(0, Math.min(100, progress ?? 0))}%`,
                };
            }

            return {
                ...step,
                status: 'waiting',
                meta: undefined,
            };
        });
    }

    if (status === 'READY') {
        const productIndex = workflow.findIndex((step) => step.id === 'product');

        return workflow.map((step, index) => {
            if (index <= productIndex) {
                return {
                    ...step,
                    status: 'completed',
                };
            }

            return {
                ...step,
                status: 'waiting',
            };
        });
    }

    return workflow;
}

export const DEFAULT_SCRIPT: ScriptScene[] = [
    {
        id: 'scene-1',
        time: '0:00 – 0:05',
        title: 'Hook',
        text: 'Bạn đang tìm một chiếc ốp lưng vừa đẹp vừa bảo vệ tốt cho chiếc iPhone của mình?',
        visual: 'Model holding iPhone with the product case',
        voice: 'Energetic female voice',
        productImageIds: [],
    },
    {
        id: 'scene-2',
        time: '0:05 – 0:10',
        title: 'Problem',
        text: 'Nếu bạn thích một chiếc ốp mỏng nhẹ nhưng vẫn muốn bảo vệ phần camera thì mẫu này rất đáng để tham khảo.',
        visual: 'Close-up of iPhone camera and case protection',
        voice: 'Energetic female voice',
        productImageIds: [],
    },
    {
        id: 'scene-3',
        time: '0:10 – 0:16',
        title: 'Design',
        text: 'Ốp được làm từ silicon dẻo, bề mặt nhám mờ giúp cầm chắc tay và hạn chế cảm giác trơn trượt khi sử dụng.',
        visual: 'Product close-up showing matte silicone texture',
        voice: 'Energetic female voice',
        productImageIds: [],
    },
    {
        id: 'scene-4',
        time: '0:16 – 0:22',
        title: 'Camera Protection',
        text: 'Phần camera được thiết kế nâng cao giúp hạn chế tiếp xúc trực tiếp với bề mặt khi đặt điện thoại xuống.',
        visual: 'Macro shot of raised camera protection',
        voice: 'Energetic female voice',
        productImageIds: [],
    },
    {
        id: 'scene-5',
        time: '0:22 – 0:27',
        title: 'Variants',
        text: 'Sản phẩm có nhiều màu sắc và hỗ trợ nhiều phiên bản iPhone từ iPhone 11 đến các dòng iPhone mới.',
        visual: 'Show multiple case colors and iPhone models',
        voice: 'Energetic female voice',
        productImageIds: [],
    },
    {
        id: 'scene-6',
        time: '0:27 – 0:30',
        title: 'CTA',
        text: 'Giá chỉ từ hơn 31 nghìn đồng. Nếu bạn đang cần một chiếc ốp đẹp, đơn giản và dễ sử dụng thì có thể xem thử sản phẩm ngay nhé!',
        visual: 'Product hero shot with CTA',
        voice: 'Energetic female voice',
        productImageIds: [],
    },
];

export function normalizeProductImages(value: unknown): ProductImage[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item, index): ProductImage | null => {
            if (typeof item === 'string') {
                if (!item.trim()) {
                    return null;
                }

                return {
                    id: `product-image-${index}`,
                    url: item,
                    name: `Product image ${index + 1}`,
                    alt: `Product image ${index + 1}`,
                    isPrimary: index === 0,
                };
            }

            if (!item || typeof item !== 'object') {
                return null;
            }

            const image = item as {
                id?: unknown;
                url?: unknown;
                name?: unknown;
                alt?: unknown;
                isPrimary?: unknown;
            };

            if (typeof image.url !== 'string' || !image.url.trim()) {
                return null;
            }

            return {
                id:
                    typeof image.id === 'string' && image.id.trim()
                        ? image.id
                        : `product-image-${index}`,
                url: image.url,
                name:
                    typeof image.name === 'string' && image.name.trim()
                        ? image.name
                        : `Product image ${index + 1}`,
                alt:
                    typeof image.alt === 'string' && image.alt.trim()
                        ? image.alt
                        : `Product image ${index + 1}`,
                isPrimary: typeof image.isPrimary === 'boolean' ? image.isPrimary : index === 0,
            };
        })
        .filter((image): image is ProductImage => image !== null);
}

export function createProductImages(value: unknown): ProductImage[] {
    return normalizeProductImages(value);
}

export function getPrimaryProductImage(images: ProductImage[]): ProductImage | undefined {
    if (!images.length) {
        return undefined;
    }

    return images.find((image) => image.isPrimary) ?? images[0];
}

export function getProductImageUrls(images: ProductImage[]): string[] {
    return images.map((image) => image.url).filter((url): url is string => Boolean(url));
}

export function attachProductImagesToScript(
    script: ScriptScene[],
    images: ProductImage[],
): ScriptScene[] {
    if (!images.length) {
        return script;
    }

    const imageIds = images.map((image) => image.id);

    return script.map((scene, index) => {
        if (scene.productImageIds?.length) {
            return scene;
        }

        const imageId = imageIds[index % imageIds.length];

        return {
            ...scene,
            productImageIds: imageId ? [imageId] : [],
        };
    });
}
