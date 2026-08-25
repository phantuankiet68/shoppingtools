'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ProductInfo, ScriptScene, VideoSettings, WorkflowStep } from './types';
import {
    DEFAULT_PRODUCT,
    DEFAULT_SETTINGS,
    DEFAULT_WORKFLOW,
    getWorkflowFromProject,
    normalizeProductImages,
} from './data';
import styles from './ai-video-create.module.css';
import type { VideoProject as AiVideoProject } from '@/features/platform/ai-video/types';
import { ProductStep } from './product/ProductStep';

const PROJECT_ID = 'cmt32z4fy0000fwjzz1evbufe';
const POLL_INTERVAL_MS = 5000;
const MAX_POLL_DURATION_MS = 10 * 60 * 1000;
const MAX_SCRIPT_SCENES = 4;
const TARGET_VIDEO_DURATION_SECONDS = 30;

type AiVideoTab = 'product' | 'script' | 'voice' | 'scenes' | 'settings';

type AiVideoProjectWithAffiliate = AiVideoProject & {
    videoAffiliateId: string | null;
    scriptJson?: unknown;
    voiceProvider?: string | null;
    voiceId?: string | null;
    voiceUrl?: string | null;
    videoAffiliate?: {
        id?: string;
        title?: string | null;
        description?: string | null;
        category?: string | null;
        rating?: number | null;
        reviewCount?: number | null;
        soldCount?: number | null;
        priceMin?: number | string | null;
        priceMax?: number | string | null;
        productImages?: unknown;
        highlights?: unknown;
        sourceUrl?: string | null;
        sourcePlatform?: string | null;
    } | null;
};

const TAB_ITEMS: Array<{
    id: AiVideoTab;
    label: string;
    icon: string;
}> = [
    { id: 'product', label: 'Product', icon: 'bi-box-seam' },
    { id: 'script', label: 'Script', icon: 'bi-file-earmark-text' },
    { id: 'voice', label: 'Voice', icon: 'bi-mic' },
    { id: 'scenes', label: 'Scenes', icon: 'bi-grid-3x3-gap' },
    { id: 'settings', label: 'Settings', icon: 'bi-sliders2' },
];

function formatProductPrice(priceMin: unknown, priceMax: unknown, fallback: string): string {
    const hasMin = priceMin !== null && priceMin !== undefined;
    const hasMax = priceMax !== null && priceMax !== undefined;

    if (!hasMin && !hasMax) {
        return fallback;
    }

    const min = hasMin ? Number(priceMin).toFixed(2) : '';
    const max = hasMax ? Number(priceMax).toFixed(2) : '';

    if (hasMin && hasMax) {
        return `${min} – ${max}`;
    }

    return min || max;
}

function normalizeHighlights(value: unknown, fallback: string[]): string[] {
    if (!Array.isArray(value)) {
        return fallback;
    }

    const highlights = value.filter(
        (item): item is string => typeof item === 'string' && item.trim().length > 0,
    );

    return highlights.length > 0 ? highlights : fallback;
}

function normalizeScript(value: unknown): ScriptScene[] | null {
    let rawScenes: unknown[] = [];

    if (Array.isArray(value)) {
        rawScenes = value;
    } else if (value && typeof value === 'object') {
        const source = value as {
            scenes?: unknown;
        };

        if (Array.isArray(source.scenes)) {
            rawScenes = source.scenes;
        }
    }

    if (!rawScenes.length) {
        return null;
    }

    let elapsedSeconds = 0;

    const scenes: ScriptScene[] = rawScenes.slice(0, MAX_SCRIPT_SCENES).map((item, index) => {
        const scene = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};

        const sceneNumber = Number(scene.sceneNumber ?? index + 1) || index + 1;

        const title =
            typeof scene.title === 'string' && scene.title.trim()
                ? scene.title.trim()
                : `Scene ${sceneNumber}`;

        const text =
            typeof scene.narration === 'string' && scene.narration.trim()
                ? scene.narration.trim()
                : typeof scene.voiceText === 'string' && scene.voiceText.trim()
                  ? scene.voiceText.trim()
                  : typeof scene.text === 'string'
                    ? scene.text.trim()
                    : '';

        const durationSecondsRaw = Number(scene.durationSeconds);
        const durationSeconds =
            Number.isFinite(durationSecondsRaw) && durationSecondsRaw > 0
                ? durationSecondsRaw
                : 30 / MAX_SCRIPT_SCENES;

        const start = elapsedSeconds;
        const end = start + durationSeconds;
        elapsedSeconds = end;

        const formatTime = (seconds: number) => {
            const minutes = Math.floor(seconds / 60);
            const remaining = Math.round(seconds % 60);
            return `${minutes}:${String(remaining).padStart(2, '0')}`;
        };

        const time = `${formatTime(start)} – ${formatTime(end)}`;

        return {
            id: typeof scene.id === 'string' && scene.id.trim() ? scene.id : `scene-${sceneNumber}`,
            title,
            text,
            time,
        };
    });

    const validScenes = scenes.filter((scene) => scene.text.length > 0);

    return validScenes.length > 0 ? validScenes : null;
}

function normalizeSourcePlatform(
    value: unknown,
    fallback: ProductInfo['sourcePlatform'],
): ProductInfo['sourcePlatform'] {
    if (typeof value !== 'string') {
        return fallback;
    }

    const normalized = value.trim().toUpperCase();

    if (
        normalized === 'TIKTOK' ||
        normalized === 'SHOPEE' ||
        normalized === 'LAZADA' ||
        normalized === 'AMAZON' ||
        normalized === 'WEBSITE' ||
        normalized === 'OTHER'
    ) {
        return normalized as ProductInfo['sourcePlatform'];
    }

    return fallback;
}

function isGeneratingStatus(status?: string | null): boolean {
    return status === 'GENERATING';
}

function isTerminalProjectStatus(status?: string | null): boolean {
    return (
        status === 'COMPLETED' || status === 'FAILED' || status === 'ARCHIVED' || status === 'DRAFT'
    );
}

function areProductImagesEqual(
    current: ProductInfo['images'],
    next: ProductInfo['images'],
): boolean {
    if (current.length !== next.length) {
        return false;
    }

    return current.every((image, index) => {
        const nextImage = next[index];

        return Boolean(
            nextImage &&
            image.id === nextImage.id &&
            image.url === nextImage.url &&
            image.name === nextImage.name &&
            image.alt === nextImage.alt &&
            image.isPrimary === nextImage.isPrimary &&
            image.source === nextImage.source,
        );
    });
}

function areStringArraysEqual(current: string[], next: string[]): boolean {
    if (current.length !== next.length) {
        return false;
    }

    return current.every((value, index) => value === next[index]);
}

function areScriptsEqual(current: ScriptScene[], next: ScriptScene[]): boolean {
    if (current.length !== next.length) {
        return false;
    }

    return current.every((scene, index) => {
        const nextScene = next[index];

        if (!nextScene) {
            return false;
        }

        return scene.id === nextScene.id && scene.text === nextScene.text;
    });
}

function areWorkflowEqual(current: WorkflowStep[], next: WorkflowStep[]): boolean {
    if (current.length !== next.length) {
        return false;
    }

    return current.every((step, index) => {
        const nextStep = next[index];

        if (!nextStep) {
            return false;
        }

        return (
            step.id === nextStep.id &&
            step.status === nextStep.status &&
            step.meta === nextStep.meta &&
            step.title === nextStep.title &&
            step.icon === nextStep.icon
        );
    });
}

function areProjectStateEqual(
    current: AiVideoProjectWithAffiliate | null,
    next: AiVideoProjectWithAffiliate,
): boolean {
    if (!current) {
        return false;
    }

    return (
        current.id === next.id &&
        current.status === next.status &&
        current.progress === next.progress &&
        current.currentStep === next.currentStep &&
        current.finalVideoUrl === next.finalVideoUrl &&
        current.thumbnailUrl === next.thumbnailUrl &&
        current.errorMessage === next.errorMessage &&
        current.voiceUrl === next.voiceUrl &&
        current.voiceProvider === next.voiceProvider &&
        current.voiceId === next.voiceId
    );
}

export default function AiVideoCreatePage() {
    const [activeTab, setActiveTab] = useState<AiVideoTab>('product');
    const [productUrl, setProductUrl] = useState('');
    const [product, setProduct] = useState<ProductInfo>(DEFAULT_PRODUCT);
    const [script, setScript] = useState<ScriptScene[]>([]);
    const [settings] = useState<VideoSettings>(() => ({
        ...DEFAULT_SETTINGS,
        duration: TARGET_VIDEO_DURATION_SECONDS,
    }));
    const [workflow, setWorkflow] = useState<WorkflowStep[]>(DEFAULT_WORKFLOW);
    const [project, setProject] = useState<AiVideoProjectWithAffiliate | null>(null);

    const [analyzing, setAnalyzing] = useState(false);
    const [generatingScript, setGeneratingScript] = useState(false);
    const [generatingVideo, setGeneratingVideo] = useState(false);
    const [savingProduct, setSavingProduct] = useState(false);
    const [actionError, setActionError] = useState<string | null>(null);

    const mountedRef = useRef(true);
    const initialLoadRef = useRef(false);
    const pollingActiveRef = useRef(false);
    const pollingRequestRef = useRef(false);
    const pollingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const pollingStartedAtRef = useRef<number | null>(null);

    const completedSteps = useMemo(
        () => workflow.filter((step) => step.status === 'completed').length,
        [workflow],
    );

    const progress = useMemo(() => {
        if (!workflow.length) {
            return 0;
        }

        const completedOrProcessing = workflow.filter(
            (step) => step.status === 'completed' || step.status === 'processing',
        ).length;

        return Math.round((completedOrProcessing / workflow.length) * 100);
    }, [workflow]);

    const activeTabLabel = TAB_ITEMS.find((item) => item.id === activeTab)?.label ?? 'Product';
    const isProjectGenerating = isGeneratingStatus(project?.status);
    const isCompleted = project?.status === 'COMPLETED';
    const voiceUrl = project?.voiceUrl ?? null;
    const voiceProvider = project?.voiceProvider ?? 'fish';
    const voiceId = project?.voiceId ?? '';
    const hasScript = script.length > 0;
    const scriptSceneCount = hasScript ? Math.min(script.length, MAX_SCRIPT_SCENES) : 0;
    const isScriptReady = scriptSceneCount === MAX_SCRIPT_SCENES;

    const stopProjectPolling = useCallback(() => {
        pollingActiveRef.current = false;
        pollingStartedAtRef.current = null;

        if (pollingTimerRef.current !== null) {
            clearTimeout(pollingTimerRef.current);
            pollingTimerRef.current = null;
        }
    }, []);

    const applyProjectData = useCallback(
        (data: AiVideoProjectWithAffiliate) => {
            if (!mountedRef.current) {
                return;
            }

            setProject((current) => (areProjectStateEqual(current, data) ? current : data));

            setWorkflow((current) => {
                const next = getWorkflowFromProject(data.status, data.currentStep, data.progress);

                return areWorkflowEqual(current, next) ? current : next;
            });

            if (data.videoAffiliate) {
                const affiliate = data.videoAffiliate;
                const images = normalizeProductImages(affiliate.productImages);
                const nextSourcePlatform = normalizeSourcePlatform(
                    affiliate.sourcePlatform,
                    product.sourcePlatform,
                );

                setProduct((current) => {
                    const nextProduct: ProductInfo = {
                        ...current,
                        title: affiliate.title ?? current.title,
                        description: affiliate.description ?? current.description,
                        category: affiliate.category ?? current.category,
                        rating:
                            affiliate.rating != null ? Number(affiliate.rating) : current.rating,
                        reviews:
                            affiliate.reviewCount != null
                                ? `${affiliate.reviewCount} reviews`
                                : current.reviews,
                        sold:
                            affiliate.soldCount != null
                                ? `${affiliate.soldCount} sold`
                                : current.sold,
                        price: formatProductPrice(
                            affiliate.priceMin,
                            affiliate.priceMax,
                            current.price,
                        ),
                        imageUrl: images[0]?.url ?? current.imageUrl,
                        images,
                        highlights: normalizeHighlights(affiliate.highlights, current.highlights),
                        sourceUrl: affiliate.sourceUrl ?? current.sourceUrl,
                        sourcePlatform: nextSourcePlatform,
                    };

                    const same =
                        current.title === nextProduct.title &&
                        current.description === nextProduct.description &&
                        current.category === nextProduct.category &&
                        current.rating === nextProduct.rating &&
                        current.reviews === nextProduct.reviews &&
                        current.sold === nextProduct.sold &&
                        current.price === nextProduct.price &&
                        current.imageUrl === nextProduct.imageUrl &&
                        current.sourceUrl === nextProduct.sourceUrl &&
                        current.sourcePlatform === nextProduct.sourcePlatform &&
                        areProductImagesEqual(current.images, nextProduct.images) &&
                        areStringArraysEqual(current.highlights, nextProduct.highlights);

                    return same ? current : nextProduct;
                });

                if (typeof affiliate.sourceUrl === 'string' && affiliate.sourceUrl.trim()) {
                    setProductUrl((current) =>
                        current === affiliate.sourceUrl ? current : affiliate.sourceUrl!,
                    );
                }
            }

            const projectScript =
                normalizeScript(data.scriptJson) ??
                normalizeScript(
                    (
                        data as AiVideoProjectWithAffiliate & {
                            scenes?: Array<{
                                id?: string;
                                sceneNumber?: number;
                                title?: string | null;
                                durationSeconds?: number;
                                scriptText?: string | null;
                                voiceText?: string | null;
                            }>;
                        }
                    ).scenes?.map((scene) => ({
                        id: scene.id,
                        sceneNumber: scene.sceneNumber,
                        title: scene.title,
                        durationSeconds: scene.durationSeconds,
                        narration: scene.voiceText ?? scene.scriptText ?? '',
                    })),
                );

            if (projectScript) {
                setScript((current) =>
                    areScriptsEqual(current, projectScript) ? current : projectScript,
                );
            }

            if (isTerminalProjectStatus(data.status)) {
                setGeneratingVideo(false);
                stopProjectPolling();
            }
        },
        [product.sourcePlatform, stopProjectPolling],
    );

    const loadProject = useCallback(
        async (projectId: string): Promise<AiVideoProjectWithAffiliate | null> => {
            try {
                const response = await fetch(`/api/platform/ai-video/projects/${projectId}`, {
                    method: 'GET',
                    cache: 'no-store',
                    credentials: 'include',
                });

                const responseData = await response.json();

                if (!response.ok) {
                    throw new Error(responseData?.error ?? 'Failed to load project');
                }

                const data = responseData.data as AiVideoProjectWithAffiliate | undefined;

                if (!data) {
                    throw new Error('Project data is missing');
                }

                applyProjectData(data);

                if (isTerminalProjectStatus(data.status)) {
                    stopProjectPolling();
                }

                return data;
            } catch (error) {
                if (mountedRef.current) {
                    setActionError(
                        error instanceof Error ? error.message : 'Failed to load project',
                    );
                }

                return null;
            }
        },
        [applyProjectData, stopProjectPolling],
    );

    const pollProject = useCallback(
        async (projectId: string) => {
            if (!pollingActiveRef.current || pollingRequestRef.current) {
                return;
            }

            const startedAt = pollingStartedAtRef.current;

            if (startedAt !== null && Date.now() - startedAt >= MAX_POLL_DURATION_MS) {
                stopProjectPolling();
                setGeneratingVideo(false);
                setActionError('Video generation timed out. Vui lòng kiểm tra worker và thử lại.');
                return;
            }

            pollingRequestRef.current = true;

            try {
                const data = await loadProject(projectId);

                if (!data || isTerminalProjectStatus(data.status)) {
                    stopProjectPolling();
                    return;
                }
            } finally {
                pollingRequestRef.current = false;
            }

            if (!pollingActiveRef.current) {
                return;
            }

            pollingTimerRef.current = setTimeout(() => {
                pollingTimerRef.current = null;
                void pollProject(projectId);
            }, POLL_INTERVAL_MS);
        },
        [loadProject, stopProjectPolling],
    );

    const startProjectPolling = useCallback(
        (projectId: string) => {
            if (pollingActiveRef.current) {
                return;
            }

            pollingActiveRef.current = true;
            pollingStartedAtRef.current = Date.now();
            void pollProject(projectId);
        },
        [pollProject],
    );

    useEffect(() => {
        mountedRef.current = true;

        return () => {
            mountedRef.current = false;
            stopProjectPolling();
        };
    }, [stopProjectPolling]);

    useEffect(() => {
        if (initialLoadRef.current) {
            return;
        }

        initialLoadRef.current = true;
        void loadProject(PROJECT_ID);
    }, [loadProject]);

    useEffect(() => {
        if (!project?.id) {
            stopProjectPolling();
            return;
        }

        if (!isGeneratingStatus(project.status)) {
            stopProjectPolling();
            setGeneratingVideo(false);
        }
    }, [project?.id, project?.status, stopProjectPolling]);

    const saveProductToAffiliate = useCallback(
        async (nextProduct: ProductInfo): Promise<boolean> => {
            const affiliateId = project?.videoAffiliateId;

            if (!affiliateId) {
                throw new Error('Video affiliate chưa được liên kết với project.');
            }

            try {
                setSavingProduct(true);

                const response = await fetch(`/api/platform/ai-video/affiliates/${affiliateId}`, {
                    method: 'PATCH',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        title: nextProduct.title,
                        description: nextProduct.description,
                        category: nextProduct.category,
                        sourceUrl: nextProduct.sourceUrl,
                        sourcePlatform: nextProduct.sourcePlatform,
                        productImages: nextProduct.images,
                        highlights: nextProduct.highlights,
                    }),
                });

                const data = await response.json();

                if (!response.ok) {
                    throw new Error(data?.error ?? 'Failed to save product');
                }

                return true;
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Failed to save product';

                setActionError(message);
                throw error;
            } finally {
                setSavingProduct(false);
            }
        },
        [project?.videoAffiliateId],
    );

    const updateProduct = useCallback(
        (nextProduct: ProductInfo) => {
            setProduct((current) => (current === nextProduct ? current : nextProduct));

            void saveProductToAffiliate(nextProduct).catch(() => {
                // Error is already handled by saveProductToAffiliate.
            });
        },
        [saveProductToAffiliate],
    );

    const analyzeProduct = useCallback(async () => {
        const normalizedUrl = productUrl.trim();

        if (!normalizedUrl) {
            setActionError('Vui lòng nhập link sản phẩm.');
            return;
        }

        try {
            new URL(normalizedUrl);
        } catch {
            setActionError('Link sản phẩm không hợp lệ.');
            return;
        }

        try {
            setAnalyzing(true);
            setActionError(null);

            const response = await fetch('/api/platform/ai-video/affiliates', {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    projectId: PROJECT_ID,
                    sourceUrl: normalizedUrl,
                    sourcePlatform: product.sourcePlatform,
                    title: product.title,
                    description: product.description,
                    category: product.category,
                    productImages: product.images,
                    highlights: product.highlights,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error ?? 'Không thể phân tích sản phẩm.');
            }

            const affiliate = data?.affiliate ?? data?.data ?? data;

            if (!affiliate || typeof affiliate !== 'object') {
                throw new Error('API không trả về dữ liệu sản phẩm hợp lệ.');
            }

            const images = normalizeProductImages(affiliate.productImages);

            const nextProduct: ProductInfo = {
                ...product,
                title: affiliate.title ?? product.title,
                description: affiliate.description ?? product.description,
                category: affiliate.category ?? product.category,
                rating: affiliate.rating != null ? Number(affiliate.rating) : product.rating,
                reviews:
                    affiliate.reviewCount != null
                        ? `${affiliate.reviewCount} reviews`
                        : product.reviews,
                sold: affiliate.soldCount != null ? `${affiliate.soldCount} sold` : product.sold,
                price: formatProductPrice(affiliate.priceMin, affiliate.priceMax, product.price),
                imageUrl: images[0]?.url ?? product.imageUrl,
                images,
                highlights: normalizeHighlights(affiliate.highlights, product.highlights),
                sourceUrl: affiliate.sourceUrl ?? normalizedUrl,
                sourcePlatform: normalizeSourcePlatform(
                    affiliate.sourcePlatform,
                    product.sourcePlatform,
                ),
            };

            setProduct(nextProduct);

            if (typeof affiliate.sourceUrl === 'string' && affiliate.sourceUrl.trim()) {
                setProductUrl(affiliate.sourceUrl);
            }

            await loadProject(PROJECT_ID);
            setActiveTab('product');
        } catch (error) {
            setActionError(
                error instanceof Error ? error.message : 'Không thể phân tích sản phẩm.',
            );
        } finally {
            setAnalyzing(false);
        }
    }, [loadProject, product, productUrl]);

    const generateScript = useCallback(async () => {
        try {
            setGeneratingScript(true);
            setActionError(null);

            await saveProductToAffiliate(product);

            const response = await fetch(`/api/platform/ai-video/projects/${PROJECT_ID}/script`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    force: true,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error ?? 'Không thể tạo kịch bản.');
            }

            const generatedScript =
                normalizeScript(data?.scriptJson) ??
                normalizeScript(data?.script) ??
                normalizeScript(data?.scenes);

            if (generatedScript) {
                setScript(generatedScript);
            }

            await loadProject(PROJECT_ID);
            setActiveTab('script');
        } catch (error) {
            setActionError(error instanceof Error ? error.message : 'Không thể tạo kịch bản.');
        } finally {
            setGeneratingScript(false);
        }
    }, [loadProject, product, saveProductToAffiliate]);

    const generateVideo = useCallback(async () => {
        const currentProjectId = project?.id;

        if (!currentProjectId) {
            setActionError('Video project chưa được tải.');
            return;
        }

        if (savingProduct) {
            setActionError('Vui lòng chờ lưu thông tin sản phẩm.');
            return;
        }

        if (!isScriptReady) {
            setActionError('Vui lòng tạo script AI 4 scene trước khi tạo video.');
            setActiveTab('script');
            return;
        }

        if (generatingVideo || isGeneratingStatus(project?.status)) {
            return;
        }

        try {
            setGeneratingVideo(true);
            setActionError(null);
            stopProjectPolling();

            await saveProductToAffiliate(product);

            const response = await fetch(
                `/api/platform/ai-video/projects/${currentProjectId}/generate`,
                {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        force: false,
                    }),
                },
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data?.error ?? 'Không thể tạo video.');
            }

            const nextStatus = data.status ?? 'GENERATING';

            setProject((current) => {
                if (!current) {
                    return current;
                }

                const nextProject = {
                    ...current,
                    status: nextStatus,
                    progress: Number(data.progress ?? current.progress),
                    currentStep: data.currentStep ?? current.currentStep,
                    finalVideoUrl: data.finalVideoUrl ?? current.finalVideoUrl,
                    thumbnailUrl: data.thumbnailUrl ?? current.thumbnailUrl,
                };

                return areProjectStateEqual(current, nextProject) ? current : nextProject;
            });

            if (isGeneratingStatus(nextStatus)) {
                startProjectPolling(currentProjectId);
            } else {
                setGeneratingVideo(false);
            }
        } catch (error) {
            setGeneratingVideo(false);
            stopProjectPolling();
            setActionError(error instanceof Error ? error.message : 'Không thể tạo video.');
        }
    }, [
        generatingVideo,
        isScriptReady,
        product,
        project?.id,
        project?.status,
        saveProductToAffiliate,
        savingProduct,
        startProjectPolling,
        stopProjectPolling,
    ]);

    const updateScript = useCallback((nextScript: ScriptScene[]) => {
        setScript((current) => (areScriptsEqual(current, nextScript) ? current : nextScript));
    }, []);

    const renderTabContent = () => {
        switch (activeTab) {
            case 'product':
                return (
                    <ProductStep
                        productUrl={productUrl}
                        product={product}
                        script={script}
                        analyzing={analyzing}
                        onProductUrlChange={setProductUrl}
                        onAnalyze={analyzeProduct}
                        onProductChange={updateProduct}
                        onScriptChange={updateScript}
                        onGenerateScript={generatingScript ? undefined : generateScript}
                    />
                );

            case 'script':
                return (
                    <section className={styles.scriptWorkspaceCard}>
                        <div className={styles.scriptWorkspaceHeader}>
                            <div className={styles.cardTitle}>
                                <div className={styles.cardTitleContent}>
                                    <div className={styles.titleIcon}>
                                        <i className="bi bi-stars" aria-hidden="true" />
                                    </div>
                                    <div className={styles.cardTitleMain}>
                                        <div className={styles.cardTitleRow}>
                                            <h3>
                                                {' '}
                                                {hasScript
                                                    ? `${scriptSceneCount} scenes · ${TARGET_VIDEO_DURATION_SECONDS}s`
                                                    : 'Generate your script'}
                                            </h3>
                                            <span className={styles.aiBadge}>
                                                <i className="bi bi-stars" aria-hidden="true" />
                                                AI extracted
                                            </span>
                                        </div>
                                        <p>
                                            {hasScript
                                                ? 'AI created the script from the product information, images and highlights.'
                                                : 'AI will turn your saved product information into 4 scenes for a 30-second video.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={styles.secondaryButton}
                                disabled={generatingScript}
                                onClick={() => {
                                    void generateScript();
                                }}
                            >
                                {generatingScript ? (
                                    <>
                                        <span className={styles.buttonSpinner} />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-stars" />
                                        {hasScript ? 'Regenerate AI' : 'Generate Script'}
                                    </>
                                )}
                            </button>
                        </div>

                        {hasScript ? (
                            <>
                                <div className={styles.compactSceneList}>
                                    {script.slice(0, MAX_SCRIPT_SCENES).map((scene, index) => (
                                        <button
                                            key={scene.id}
                                            type="button"
                                            className={styles.compactSceneItem}
                                            onClick={() => setActiveTab('script')}
                                        >
                                            <span className={styles.compactSceneIndex}>
                                                {String(index + 1).padStart(2, '0')}
                                            </span>

                                            <span className={styles.compactSceneBody}>
                                                <strong>
                                                    {scene.title || `Scene ${index + 1}`}
                                                </strong>
                                                <small>{scene.time}</small>
                                                <span>{scene.text}</span>
                                            </span>

                                            <i className="bi bi-chevron-right" aria-hidden="true" />
                                        </button>
                                    ))}
                                </div>

                                <div className={styles.workspaceHint}>
                                    <i className="bi bi-stars" aria-hidden="true" />
                                    <span>
                                        AI script is based on the saved Product information. The
                                        current video target is 4 scenes and 30 seconds.
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className={styles.emptyState}>
                                <i className="bi bi-file-earmark-text" aria-hidden="true" />
                                <strong>No AI script yet.</strong>
                                <span>
                                    Complete the Product tab first, then generate the 4-scene /
                                    30-second script automatically.
                                </span>
                                <button
                                    type="button"
                                    className={styles.primaryButton}
                                    disabled={generatingScript || savingProduct}
                                    onClick={() => {
                                        void generateScript();
                                    }}
                                >
                                    <i className="bi bi-stars" aria-hidden="true" />
                                    {generatingScript ? 'Generating...' : 'Generate Script'}
                                </button>
                            </div>
                        )}
                    </section>
                );

            case 'voice':
                return (
                    <section className={styles.toolCard}>
                        <div className={styles.cardTitle}>
                            <div className={styles.cardTitleContent}>
                                <div className={styles.titleIcon}>
                                    <i className="bi bi-stars" aria-hidden="true" />
                                </div>
                                <div className={styles.cardTitleMain}>
                                    <div className={styles.cardTitleRow}>
                                        <h3>VOICE SYNTHESIS</h3>
                                        <span className={styles.statusBadgeSuccess}>
                                            <i className="bi bi-check2-circle" />
                                            {voiceUrl ? 'Ready' : 'Not generated'}
                                        </span>
                                    </div>
                                    <p>
                                        Current voice configuration used by the AI video pipeline.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.infoGrid}>
                            <div className={styles.infoItem}>
                                <span>Provider</span>
                                <strong>Fish Audio</strong>
                            </div>
                            <div className={styles.infoItem}>
                                <span>Model</span>
                                <strong>S2.1 Pro Free</strong>
                            </div>
                            <div className={styles.infoItem}>
                                <span>Reference</span>
                                <strong>{voiceId || 'Configured in environment'}</strong>
                            </div>
                            <div className={styles.infoItem}>
                                <span>Status</span>
                                <strong>
                                    {voiceProvider === 'fish' ? 'Fish Audio' : voiceProvider}
                                </strong>
                            </div>
                        </div>

                        {voiceUrl ? (
                            <div className={styles.audioPreviewCard}>
                                <div>
                                    <span>Generated voice</span>
                                    <strong>Preview narration</strong>
                                </div>
                                <audio controls preload="metadata" src={voiceUrl} />
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <i className="bi bi-mic" />
                                <strong>Voice has not been generated yet.</strong>
                                <span>
                                    Generate the video to create the narration automatically.
                                </span>
                            </div>
                        )}
                    </section>
                );

            case 'scenes':
                return (
                    <section className={styles.toolCard}>
                        <div className={styles.cardTitle}>
                            <div className={styles.cardTitleContent}>
                                <div className={styles.titleIcon}>
                                    <i className="bi bi-stars" aria-hidden="true" />
                                </div>
                                <div className={styles.cardTitleMain}>
                                    <div className={styles.cardTitleRow}>
                                        <h3>SCENE GENERATION</h3>
                                        <span className={styles.countBadge}>
                                            {scriptSceneCount}/{MAX_SCRIPT_SCENES} scenes
                                        </span>
                                    </div>
                                    <p>
                                        {hasScript
                                            ? `${scriptSceneCount} scenes are prepared for the video pipeline.`
                                            : 'Generate the AI script to prepare the 4 scenes.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.sceneGrid}>
                            {script.slice(0, MAX_SCRIPT_SCENES).map((scene, index) => (
                                <article key={scene.id} className={styles.sceneCardCompact}>
                                    <div className={styles.sceneCardThumb}>
                                        {product.images[
                                            index % Math.max(product.images.length, 1)
                                        ] ? (
                                            <img
                                                src={
                                                    product.images[
                                                        index % Math.max(product.images.length, 1)
                                                    ]?.url
                                                }
                                                alt=""
                                            />
                                        ) : (
                                            <i className="bi bi-image" />
                                        )}
                                        <span>{String(index + 1).padStart(2, '0')}</span>
                                    </div>
                                    <div className={styles.sceneCardContent}>
                                        <strong>{scene.title || `Scene ${index + 1}`}</strong>
                                        <small>{scene.time}</small>
                                    </div>
                                </article>
                            ))}
                        </div>
                    </section>
                );

            case 'settings':
                return (
                    <section className={styles.toolCard}>
                        <div className={styles.cardTitle}>
                            <div className={styles.cardTitleContent}>
                                <div className={styles.titleIcon}>
                                    <i className="bi bi-stars" aria-hidden="true" />
                                </div>
                                <div className={styles.cardTitleMain}>
                                    <div className={styles.cardTitleRow}>
                                        <h3>VIDEO SETTINGS</h3>
                                        <span className={styles.statusBadgeSuccess}>
                                            <i className="bi bi-check2-circle" />
                                            {voiceUrl ? 'Settings' : 'Not generated'}
                                        </span>
                                    </div>
                                    <p>Current generation settings for this project.</p>
                                </div>
                            </div>
                        </div>

                        <div className={styles.settingsGrid}>
                            <div className={styles.settingRow}>
                                <span>
                                    <i className="bi bi-clock" /> Duration
                                </span>
                                <strong>{settings.duration}s</strong>
                            </div>
                            <div className={styles.settingRow}>
                                <span>
                                    <i className="bi bi-phone" /> Aspect ratio
                                </span>
                                <strong>{settings.aspectRatio}</strong>
                            </div>
                            <div className={styles.settingRow}>
                                <span>
                                    <i className="bi bi-display" /> Resolution
                                </span>
                                <strong>{settings.resolution}</strong>
                            </div>
                            <div className={styles.settingRow}>
                                <span>
                                    <i className="bi bi-magic" /> Style
                                </span>
                                <strong>{settings.style}</strong>
                            </div>
                            <div className={styles.settingRow}>
                                <span>
                                    <i className="bi bi-music-note" /> Music
                                </span>
                                <strong>{settings.music}</strong>
                            </div>
                            <div className={styles.settingRow}>
                                <span>
                                    <i className="bi bi-mic" /> Voice
                                </span>
                                <strong>{settings.voice}</strong>
                            </div>
                        </div>
                    </section>
                );
        }
    };

    return (
        <main className={styles.page}>
            {actionError && (
                <div className={styles.errorBanner} role="alert">
                    <i className="bi bi-exclamation-triangle" />
                    <span>{actionError}</span>
                    <button
                        type="button"
                        aria-label="Close error"
                        onClick={() => setActionError(null)}
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </div>
            )}

            <section className={styles.workspace}>
                <div className={styles.sourceBarWrap}>
                    <div className={styles.sourceBarTitle}>
                        <span className={styles.sourceBarIcon}>
                            <i className="bi bi-link-45deg" />
                        </span>
                        <div>
                            <strong>Product source</strong>
                            <span>Paste a product link and let AI extract the product.</span>
                        </div>
                    </div>

                    <div
                        className={styles.editorTabs}
                        role="tablist"
                        aria-label="AI video editor sections"
                    >
                        {TAB_ITEMS.map((tab) => {
                            const active = activeTab === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    role="tab"
                                    aria-selected={active}
                                    className={`${styles.editorTab} ${active ? styles.editorTabActive : ''}`}
                                    onClick={() => setActiveTab(tab.id)}
                                >
                                    <i className={`bi ${tab.icon}`} aria-hidden="true" />
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className={styles.layout}>
                    <div className={styles.mainColumn}>
                        {renderTabContent()}

                        <section className={styles.generateCard}>
                            <div className={styles.cardTitle}>
                                <div className={styles.cardTitleContent}>
                                    <div className={styles.titleIcon}>
                                        <i className="bi bi-stars" aria-hidden="true" />
                                    </div>
                                    <div className={styles.cardTitleMain}>
                                        <div className={styles.cardTitleRow}>
                                            <h3>
                                                {isCompleted
                                                    ? 'Video is ready'
                                                    : 'Ready to generate'}
                                            </h3>
                                            <span className={styles.aiBadge}>
                                                <i className="bi bi-stars" />
                                                Magic Hour + Fish Audio
                                            </span>
                                        </div>
                                        <p>
                                            {isCompleted
                                                ? 'Your final video is rendered and ready for preview.'
                                                : 'Product, script, voice and AI scenes will run in sequence.'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.generateMeta}>
                                <div>
                                    <span>Duration</span>
                                    <strong>{settings.duration}s</strong>
                                </div>
                                <div>
                                    <span>Format</span>
                                    <strong>{settings.aspectRatio}</strong>
                                </div>
                                <div>
                                    <span>Scenes</span>
                                    <strong>{scriptSceneCount}</strong>
                                </div>
                                <div>
                                    <span>Voice</span>
                                    <strong>Fish Audio</strong>
                                </div>
                            </div>

                            <button
                                type="button"
                                className={styles.primaryButton}
                                disabled={
                                    !project?.id ||
                                    generatingVideo ||
                                    isProjectGenerating ||
                                    analyzing ||
                                    savingProduct
                                }
                                onClick={() => {
                                    void generateVideo();
                                }}
                            >
                                {generatingVideo || isProjectGenerating ? (
                                    <>
                                        <span className={styles.buttonSpinner} />
                                        Generating {project?.progress ?? 0}%
                                    </>
                                ) : isCompleted ? (
                                    <>
                                        <i className="bi bi-arrow-repeat" />
                                        Regenerate video
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-stars" />
                                        Generate video
                                    </>
                                )}
                            </button>
                        </section>
                    </div>

                    <aside className={styles.previewColumn}>
                        <section className={styles.workflowCard}>
                            <div className={styles.workflowHeader}>
                                <div className={styles.cardTitle}>
                                    <div className={styles.cardTitleContent}>
                                        <div className={styles.titleIcon}>
                                            <i className="bi bi-stars" aria-hidden="true" />
                                        </div>
                                        <div className={styles.cardTitleMain}>
                                            <div className={styles.cardTitleRow}>
                                                <h3>AI VIDEO WORKFLOW</h3>
                                            </div>
                                            <p>Generation progress</p>
                                        </div>
                                    </div>
                                </div>
                                <div className={styles.workflowProgress}>
                                    <strong>{project?.progress ?? progress}%</strong>
                                    <span>
                                        {completedSteps}/{workflow.length} completed
                                    </span>
                                </div>
                            </div>

                            <div className={styles.workflowList}>
                                {workflow.map((step) => (
                                    <div
                                        key={step.id}
                                        className={`${styles.workflowItem} ${styles[step.status]}`}
                                    >
                                        <span className={styles.workflowIcon}>
                                            <i className={`bi ${step.icon}`} />
                                        </span>
                                        <div className={styles.workflowContent}>
                                            <strong>{step.title}</strong>
                                            {step.meta && <span>{step.meta}</span>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        <aside className={styles.previewCard}>
                            <div className={styles.cardTitle}>
                                <div className={styles.cardTitleContent}>
                                    <div className={styles.titleIcon}>
                                        <i className="bi bi-stars" aria-hidden="true" />
                                    </div>
                                    <div className={styles.cardTitleMain}>
                                        <div className={styles.cardTitleRow}>
                                            <h3>LIVE PREVIEW</h3>
                                            <span className={styles.aiBadge}>
                                                <i className="bi bi-phone" />
                                                {settings.aspectRatio}
                                            </span>
                                        </div>
                                        <p>
                                            {isCompleted
                                                ? 'Your generated video is ready.'
                                                : (project?.currentStep ??
                                                  'Waiting for generation')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className={styles.videoFrame}>
                                {project?.finalVideoUrl ? (
                                    <video
                                        key={project.finalVideoUrl}
                                        className={styles.video}
                                        src={project.finalVideoUrl}
                                        poster={project.thumbnailUrl ?? undefined}
                                        controls
                                        playsInline
                                        preload="metadata"
                                    />
                                ) : (
                                    <div className={styles.videoEmpty}>
                                        {product.images[0] ? (
                                            <img
                                                src={product.images[0].url}
                                                alt={product.images[0].alt ?? product.title}
                                                loading="eager"
                                                decoding="async"
                                            />
                                        ) : (
                                            <i className="bi bi-image" />
                                        )}

                                        <div className={styles.videoEmptyOverlay}>
                                            <i className="bi bi-play-circle" />
                                            <strong>Video preview</strong>
                                            <span>
                                                {project?.progress
                                                    ? `${project.progress}% processing`
                                                    : 'Not generated yet'}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className={styles.previewMetaRow}>
                                <span>
                                    <i className="bi bi-film" />
                                    {scriptSceneCount}/{MAX_SCRIPT_SCENES} scenes
                                </span>
                                <span>
                                    <i className="bi bi-mic" />
                                    Fish Audio
                                </span>
                                <span>
                                    <i className="bi bi-magic" />
                                    Magic Hour
                                </span>
                            </div>

                            {project?.status === 'FAILED' && project.errorMessage && (
                                <div className={styles.previewError}>
                                    <i className="bi bi-exclamation-octagon" />
                                    <span>{project.errorMessage}</span>
                                </div>
                            )}
                        </aside>
                    </aside>
                </div>
            </section>
        </main>
    );
}
