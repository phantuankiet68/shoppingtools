import type { GeneratedVideo, VideoGenerationInput, VideoProviderOptions } from '../../types/video';
import type { VideoProvider } from './video-provider';

interface LumaGenerationResponse {
    id?: string;
    state?: string;
    status?: string;
    failure_reason?: string | null;
    assets?: {
        video?: string | { url?: string };
        [key: string]: unknown;
    };
    model?: string;
    progress?: number;
    [key: string]: unknown;
}

interface LumaErrorResponse {
    code?: string | number;
    error?: unknown;
    message?: unknown;
    detail?: unknown;
    failure_reason?: unknown;
    [key: string]: unknown;
}

type LumaAspectRatio = '1:1' | '16:9' | '9:16' | '4:3' | '3:4' | '21:9' | '9:21';

type LumaResolution = '540p' | '720p' | '1080' | '4k';
type LumaDuration = '5s' | '9s';

interface LumaConfig {
    apiKey: string;
    baseUrl: string;
    createPath: string;
}

export class LumaVideoProvider implements VideoProvider {
    readonly name = 'luma';

    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly createPath: string;
    private readonly model = 'ray-2';

    constructor(options: VideoProviderOptions = {}) {
        const config = this.resolveConfig(options);

        this.apiKey = config.apiKey;
        this.baseUrl = config.baseUrl.replace(/\/+$/, '');
        this.createPath = config.createPath;
    }

    async generate(input: VideoGenerationInput): Promise<GeneratedVideo> {
        const projectId = input.projectId?.trim();

        if (!projectId) {
            throw new Error('Luma project id is required');
        }

        const prompt = this.buildPrompt(input);
        const imageUrl = input.imageUrl?.trim();

        if (!imageUrl) {
            throw new Error('Luma product image URL is required');
        }

        this.validateImageUrl(imageUrl);

        const aspectRatio = this.normalizeAspectRatio(input.aspectRatio);
        const durationSeconds = this.normalizeDuration(input.durationSeconds);
        const duration = `${durationSeconds}s` as LumaDuration;
        const resolution = this.normalizeResolution(input.width, input.height);

        const payload = {
            prompt,
            model: this.model,
            aspect_ratio: aspectRatio,
            resolution,
            duration,
            keyframes: {
                frame0: {
                    type: 'image',
                    url: imageUrl,
                },
            },
        };

        const url = `${this.baseUrl}${this.createPath}`;

        console.log('[luma] Creating image-to-video generation:', {
            projectId,
            model: this.model,
            endpoint: url,
            aspectRatio,
            resolution,
            duration,
            imageHost: this.getSafeHost(imageUrl),
        });

        const response = await fetch(url, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(payload),
        });

        const rawBody = await response.text();

        console.log('[luma] Create response:', {
            status: response.status,
            ok: response.ok,
        });

        if (!response.ok) {
            throw new Error(
                `Luma video generation failed: ${this.formatErrorResponse(
                    response.status,
                    rawBody,
                )}`,
            );
        }

        let data: LumaGenerationResponse;

        try {
            data = JSON.parse(rawBody) as LumaGenerationResponse;
        } catch {
            throw new Error(`Luma returned invalid JSON [HTTP ${response.status}]`);
        }

        if (!data.id) {
            throw new Error('Luma did not return a generation id');
        }

        console.log('[luma] Generation created:', {
            generationId: data.id,
            state: data.state ?? data.status ?? 'unknown',
        });

        const initial = this.mapGeneration(
            data,
            durationSeconds,
            aspectRatio,
            input.width,
            input.height,
        );

        if (initial.status === 'COMPLETED' && initial.videoUrl) {
            return initial;
        }

        return this.waitForCompletion(data.id, {
            durationSeconds,
            aspectRatio,
            width: input.width,
            height: input.height,
            intervalMs: 3000,
            timeoutMs: 10 * 60 * 1000,
        });
    }

    async getStatus(providerJobId: string): Promise<GeneratedVideo> {
        const id = providerJobId.trim();

        if (!id) {
            throw new Error('Luma generation id is required');
        }

        const response = await fetch(`${this.baseUrl}/generations/${encodeURIComponent(id)}`, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        const rawBody = await response.text();

        if (!response.ok) {
            throw new Error(
                `Luma status request failed: ${this.formatErrorResponse(response.status, rawBody)}`,
            );
        }

        let data: LumaGenerationResponse;

        try {
            data = JSON.parse(rawBody) as LumaGenerationResponse;
        } catch {
            throw new Error(`Luma status returned invalid JSON [HTTP ${response.status}]`);
        }

        return this.mapGeneration(data, undefined, undefined, undefined, undefined);
    }

    async waitForCompletion(
        providerJobId: string,
        options: {
            intervalMs?: number;
            timeoutMs?: number;
            durationSeconds?: number;
            aspectRatio?: LumaAspectRatio;
            width?: number;
            height?: number;
        } = {},
    ): Promise<GeneratedVideo> {
        const id = providerJobId.trim();

        if (!id) {
            throw new Error('Luma generation id is required');
        }

        const intervalMs = Math.max(1000, options.intervalMs ?? 3000);
        const timeoutMs = Math.max(intervalMs, options.timeoutMs ?? 600000);
        const startedAt = Date.now();

        while (true) {
            const result = await this.getStatus(id);

            if (result.status === 'COMPLETED' && result.videoUrl) {
                return {
                    ...result,
                    durationSeconds: result.durationSeconds ?? options.durationSeconds,
                    width:
                        result.width ??
                        this.resolveWidth(options.aspectRatio ?? '9:16', options.width),
                    height:
                        result.height ??
                        this.resolveHeight(options.aspectRatio ?? '9:16', options.height),
                };
            }

            if (result.status === 'FAILED') {
                const metadata =
                    result.metadata &&
                    typeof result.metadata === 'object' &&
                    !Array.isArray(result.metadata)
                        ? (result.metadata as Record<string, unknown>)
                        : undefined;

                const failureReason =
                    typeof metadata?.failureReason === 'string'
                        ? metadata.failureReason
                        : 'Luma video generation failed';

                throw new Error(failureReason);
            }

            if (Date.now() - startedAt >= timeoutMs) {
                throw new Error(
                    `Luma video generation timed out after ${Math.round(timeoutMs / 1000)} seconds`,
                );
            }

            await this.sleep(intervalMs);
        }
    }

    async cancel(providerJobId: string): Promise<void> {
        const id = providerJobId.trim();

        if (!id) {
            throw new Error('Luma generation id is required');
        }

        const response = await fetch(`${this.baseUrl}/generations/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        if (!response.ok && response.status !== 404) {
            const rawBody = await response.text();

            throw new Error(
                `Luma generation cancellation failed: ${this.formatErrorResponse(
                    response.status,
                    rawBody,
                )}`,
            );
        }
    }

    private mapGeneration(
        data: LumaGenerationResponse,
        durationSeconds?: number,
        aspectRatio?: LumaAspectRatio,
        requestedWidth?: number,
        requestedHeight?: number,
    ): GeneratedVideo {
        const status = this.mapStatus(data.state ?? data.status);

        const videoUrl = this.extractVideoUrl(data);

        const ratio = aspectRatio ?? '9:16';

        return {
            provider: this.name,
            providerJobId: data.id,
            status,
            videoUrl,
            durationSeconds,
            width: this.resolveWidth(ratio, requestedWidth),
            height: this.resolveHeight(ratio, requestedHeight),
            metadata: {
                model: typeof data.model === 'string' ? data.model : this.model,
                lumaState: data.state ?? data.status,
                lumaProgress: typeof data.progress === 'number' ? data.progress : undefined,
                failureReason: data.failure_reason ?? undefined,
            },
        };
    }

    private buildPrompt(input: VideoGenerationInput): string {
        const parts: string[] = [];

        if (input.prompt?.trim()) {
            parts.push(input.prompt.trim());
        }

        if (input.style?.trim()) {
            parts.push(`Visual style: ${input.style.trim()}.`);
        }

        if (input.motion?.trim()) {
            parts.push(`Motion: ${input.motion.trim()}.`);
        }

        if (input.cameraMotion?.trim()) {
            parts.push(`Camera movement: ${input.cameraMotion.trim()}.`);
        }

        if (input.negativePrompt?.trim()) {
            parts.push(`Avoid: ${input.negativePrompt.trim()}.`);
        }

        const prompt = parts.join(' ').trim();

        if (!prompt) {
            throw new Error('Luma prompt is empty');
        }

        return prompt.slice(0, 5000);
    }

    private normalizeDuration(durationSeconds?: number): 5 | 9 {
        const duration = durationSeconds ?? 5;

        if (!Number.isFinite(duration)) {
            return 5;
        }

        return duration <= 7 ? 5 : 9;
    }

    private normalizeAspectRatio(aspectRatio?: string): LumaAspectRatio {
        switch (aspectRatio?.trim()) {
            case '1:1':
                return '1:1';
            case '16:9':
            case '1280:720':
            case 'landscape':
                return '16:9';
            case '4:3':
                return '4:3';
            case '3:4':
                return '3:4';
            case '21:9':
                return '21:9';
            case '9:21':
                return '9:21';
            case '9:16':
            case '720:1280':
            case 'portrait':
            default:
                return '9:16';
        }
    }

    private normalizeResolution(width?: number, height?: number): LumaResolution {
        const largest = Math.max(width ?? 0, height ?? 0);

        if (largest >= 2000) {
            return '1080';
        }

        if (largest >= 1000) {
            return '720p';
        }

        return '540p';
    }

    private extractVideoUrl(data: LumaGenerationResponse): string | undefined {
        const video = data.assets?.video;

        if (typeof video === 'string' && video.trim()) {
            return video.trim();
        }

        if (
            video &&
            typeof video === 'object' &&
            typeof video.url === 'string' &&
            video.url.trim()
        ) {
            return video.url.trim();
        }

        return undefined;
    }

    private mapStatus(status?: string): GeneratedVideo['status'] {
        switch (status?.toLowerCase()) {
            case 'completed':
            case 'succeeded':
            case 'success':
                return 'COMPLETED';

            case 'failed':
            case 'error':
                return 'FAILED';

            case 'dreaming':
            case 'processing':
            case 'running':
            case 'in_progress':
                return 'PROCESSING';

            case 'queued':
            case 'pending':
            case 'starting':
            default:
                return 'QUEUED';
        }
    }

    private validateImageUrl(imageUrl: string): void {
        if (!/^https:\/\//i.test(imageUrl)) {
            throw new Error('Luma image-to-video requires an HTTPS image URL');
        }

        if (imageUrl.length > 5000) {
            throw new Error('Luma image URL is too long');
        }
    }

    private getHeaders(): Record<string, string> {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        };
    }

    private resolveConfig(options: VideoProviderOptions): LumaConfig {
        const apiKey = options.apiKey ?? process.env.LUMA_API_KEY;

        if (!apiKey) {
            throw new Error('LUMA_API_KEY is not configured');
        }

        return {
            apiKey: apiKey.trim(),
            baseUrl:
                options.baseUrl ??
                process.env.LUMA_API_BASE_URL ??
                'https://api.lumalabs.ai/dream-machine/v1',
            createPath: process.env.LUMA_CREATE_PATH ?? '/generations/video',
        };
    }

    private formatErrorResponse(status: number, rawBody: string): string {
        const body = rawBody.trim();

        if (!body) {
            return `HTTP ${status}`;
        }

        try {
            const parsed = JSON.parse(body) as LumaErrorResponse;

            if (typeof parsed.message === 'string') {
                return `${parsed.message} [HTTP ${status}]`;
            }

            if (typeof parsed.error === 'string') {
                return `${parsed.error} [HTTP ${status}]`;
            }

            return `${JSON.stringify(parsed)} [HTTP ${status}]`;
        } catch {
            return `${body.slice(0, 1000)} [HTTP ${status}]`;
        }
    }

    private getSafeHost(value: string): string {
        try {
            return new URL(value).host;
        } catch {
            return 'invalid-url';
        }
    }

    private resolveWidth(ratio: LumaAspectRatio, requestedWidth?: number): number {
        if (requestedWidth) {
            return requestedWidth;
        }

        switch (ratio) {
            case '16:9':
                return 1280;
            case '9:16':
                return 720;
            case '4:3':
                return 1152;
            case '3:4':
                return 864;
            case '21:9':
                return 1552;
            case '9:21':
                return 656;
            default:
                return 1024;
        }
    }

    private resolveHeight(ratio: LumaAspectRatio, requestedHeight?: number): number {
        if (requestedHeight) {
            return requestedHeight;
        }

        switch (ratio) {
            case '16:9':
                return 720;
            case '9:16':
                return 1280;
            case '4:3':
                return 864;
            case '3:4':
                return 1152;
            case '21:9':
                return 656;
            case '9:21':
                return 1024;
            default:
                return 1024;
        }
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export function createLumaVideoProvider(options: VideoProviderOptions = {}): LumaVideoProvider {
    return new LumaVideoProvider(options);
}

export default LumaVideoProvider;
