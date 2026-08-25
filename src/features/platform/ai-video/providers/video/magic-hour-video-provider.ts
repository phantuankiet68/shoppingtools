import type {
    GeneratedVideo,
    VideoGenerationInput,
    VideoProviderOptions,
    VideoProviderWaitOptions,
} from '../../types/video';
import type { VideoProvider } from './video-provider';

interface MagicHourCreateResponse {
    id?: string;
    credits_charged?: number;
    message?: string;
}

interface MagicHourDownload {
    url?: string;
    expires_at?: string;
}

interface MagicHourError {
    message?: string;
    error?: string;
    code?: string;
    details?: unknown;
}

interface MagicHourProjectResponse {
    id?: string;
    name?: string | null;
    status?: string;
    type?: string;
    created_at?: string;
    width?: number;
    height?: number;
    enabled?: boolean;
    start_seconds?: number;
    end_seconds?: number;
    credits_charged?: number;
    fps?: number;
    error?: unknown;
    downloads?: MagicHourDownload[];
}

type MagicHourResolution = '480p' | '720p';

interface InternalWaitOptions {
    durationSeconds: number;
    width?: number;
    height?: number;
    intervalMs: number;
    timeoutMs: number;
}

export class MagicHourVideoProvider implements VideoProvider {
    readonly name = 'magichour';

    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly model = 'ltx-2.3';

    constructor(options: VideoProviderOptions = {}) {
        const apiKey = options.apiKey ?? process.env.MAGIC_HOUR_API_KEY;

        if (!apiKey?.trim()) {
            throw new Error('MAGIC_HOUR_API_KEY is not configured');
        }

        this.apiKey = apiKey.trim();

        this.baseUrl = (
            options.baseUrl ??
            process.env.MAGIC_HOUR_API_BASE_URL ??
            'https://api.magichour.ai/v1'
        ).replace(/\/+$/, '');
    }

    async generate(input: VideoGenerationInput): Promise<GeneratedVideo> {
        const projectId = input.projectId?.trim();

        if (!projectId) {
            throw new Error('Magic Hour project id is required');
        }

        const imageUrl = input.imageUrl?.trim();

        if (!imageUrl) {
            throw new Error('Magic Hour image URL is required');
        }

        this.validateImageUrl(imageUrl);

        const durationSeconds = this.normalizeDuration(input.durationSeconds);

        const resolution = this.normalizeResolution(input.width, input.height);

        const prompt = this.buildPrompt(input);

        const payload = {
            name: `Kbuilder ${projectId}`,
            end_seconds: durationSeconds,
            model: this.model,
            resolution,
            audio: false,
            style: {
                prompt,
            },
            assets: {
                image_file_path: imageUrl,
            },
        };

        const endpoint = `${this.baseUrl}/image-to-video`;

        console.log('[magichour] Creating image-to-video job:', {
            projectId,
            model: this.model,
            endpoint,
            resolution,
            durationSeconds,
            imageHost: this.getSafeHost(imageUrl),
        });

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(payload),
        });

        const rawBody = await response.text();

        console.log('[magichour] Create response:', {
            status: response.status,
            ok: response.ok,
        });

        if (!response.ok) {
            throw new Error(
                `Magic Hour video generation failed: ${this.formatError(response.status, rawBody)}`,
            );
        }

        let data: MagicHourCreateResponse;

        try {
            data = JSON.parse(rawBody) as MagicHourCreateResponse;
        } catch {
            throw new Error(`Magic Hour returned invalid JSON [HTTP ${response.status}]`);
        }

        if (!data.id) {
            throw new Error('Magic Hour did not return a video project id');
        }

        console.log('[magichour] Video project created:', {
            providerJobId: data.id,
            creditsCharged: data.credits_charged,
        });

        return this.waitForVideoProject(data.id, {
            durationSeconds,
            width: input.width,
            height: input.height,
            intervalMs: 3000,
            timeoutMs: 10 * 60 * 1000,
        });
    }

    async waitForCompletion(
        providerJobId: string,
        options: VideoProviderWaitOptions = {},
    ): Promise<GeneratedVideo> {
        const intervalMs =
            typeof options.intervalMs === 'number' && Number.isFinite(options.intervalMs)
                ? Math.max(1000, options.intervalMs)
                : 3000;

        const timeoutMs =
            typeof options.timeoutMs === 'number' && Number.isFinite(options.timeoutMs)
                ? Math.max(intervalMs, options.timeoutMs)
                : 10 * 60 * 1000;

        return this.waitForVideoProject(providerJobId, {
            durationSeconds: 5,
            intervalMs,
            timeoutMs,
        });
    }

    async getStatus(providerJobId: string): Promise<GeneratedVideo> {
        const project = await this.getVideoProject(providerJobId);

        const status = this.mapStatus(project.status);

        const videoUrl = project.downloads?.[0]?.url;

        return {
            provider: this.name,
            providerJobId,
            status,
            videoUrl,
            durationSeconds: project.end_seconds,
            width: project.width,
            height: project.height,
            metadata: {
                model: this.model,
                magicHourStatus: project.status,
                creditsCharged: project.credits_charged,
                fps: project.fps,
                failureReason: this.extractFailureReason(project.error),
            },
        };
    }

    async cancel(providerJobId: string): Promise<void> {
        const id = providerJobId.trim();

        if (!id) {
            throw new Error('Magic Hour video project id is required');
        }

        const response = await fetch(`${this.baseUrl}/video-projects/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: this.getHeaders(),
        });

        const rawBody = await response.text();

        if (!response.ok && response.status !== 404) {
            throw new Error(
                `Magic Hour cancellation failed: ${this.formatError(response.status, rawBody)}`,
            );
        }
    }

    private async waitForVideoProject(
        providerJobId: string,
        options: InternalWaitOptions,
    ): Promise<GeneratedVideo> {
        const id = providerJobId.trim();

        if (!id) {
            throw new Error('Magic Hour video project id is required');
        }

        const startedAt = Date.now();

        while (true) {
            const project = await this.getVideoProject(id);

            const status = this.mapStatus(project.status);

            if (status === 'COMPLETED' && project.downloads?.length) {
                const videoUrl = project.downloads[0]?.url;

                if (!videoUrl) {
                    throw new Error(
                        'Magic Hour completed the video but did not return a download URL',
                    );
                }

                return {
                    provider: this.name,
                    providerJobId: id,
                    status: 'COMPLETED',
                    videoUrl,
                    durationSeconds: project.end_seconds ?? options.durationSeconds,
                    width: project.width ?? options.width ?? 576,
                    height: project.height ?? options.height ?? 1024,
                    metadata: {
                        model: this.model,
                        magicHourStatus: project.status,
                        creditsCharged: project.credits_charged,
                        fps: project.fps,
                        downloadExpiresAt: project.downloads?.[0]?.expires_at,
                    },
                };
            }

            if (status === 'FAILED') {
                throw new Error(this.extractProjectError(project.error));
            }

            if (Date.now() - startedAt >= options.timeoutMs) {
                throw new Error(
                    `Magic Hour video generation timed out after ${Math.round(
                        options.timeoutMs / 1000,
                    )} seconds`,
                );
            }

            await this.sleep(options.intervalMs);
        }
    }

    private async getVideoProject(providerJobId: string): Promise<MagicHourProjectResponse> {
        const id = providerJobId.trim();

        const endpoint = `${this.baseUrl}/video-projects/${encodeURIComponent(id)}`;

        const response = await fetch(endpoint, {
            method: 'GET',
            headers: this.getHeaders(),
        });

        const rawBody = await response.text();

        if (!response.ok) {
            throw new Error(
                `Magic Hour status request failed: ${this.formatError(response.status, rawBody)}`,
            );
        }

        try {
            return JSON.parse(rawBody) as MagicHourProjectResponse;
        } catch {
            throw new Error(`Magic Hour returned invalid status JSON [HTTP ${response.status}]`);
        }
    }

    private buildPrompt(input: VideoGenerationInput): string {
        const parts: string[] = [];

        if (input.prompt?.trim()) {
            parts.push(input.prompt.trim());
        }

        if (input.motion?.trim()) {
            parts.push(`Motion: ${input.motion.trim()}.`);
        }

        if (input.cameraMotion?.trim()) {
            parts.push(`Camera movement: ${input.cameraMotion.trim()}.`);
        }

        if (input.style?.trim()) {
            parts.push(`Style: ${input.style.trim()}.`);
        }

        if (input.negativePrompt?.trim()) {
            parts.push(`Avoid: ${input.negativePrompt.trim()}.`);
        }

        const prompt = parts.join(' ').trim();

        return (
            prompt ||
            'Animate the product naturally with subtle camera movement, realistic lighting, and smooth commercial motion.'
        ).slice(0, 5000);
    }

    private normalizeDuration(durationSeconds?: number): number {
        const value = durationSeconds ?? 5;

        if (!Number.isFinite(value) || value <= 0) {
            return 5;
        }

        return Math.min(10, Math.max(1, Math.round(value)));
    }

    private normalizeResolution(width?: number, height?: number): MagicHourResolution {
        void width;
        void height;

        return '480p';
    }

    private mapStatus(status?: string): GeneratedVideo['status'] {
        switch (status?.toLowerCase()) {
            case 'complete':
            case 'completed':
                return 'COMPLETED';

            case 'error':
            case 'failed':
            case 'canceled':
            case 'cancelled':
                return 'FAILED';

            case 'rendering':
            case 'processing':
                return 'PROCESSING';

            case 'queued':
            case 'draft':
            default:
                return 'QUEUED';
        }
    }

    private extractProjectError(error: unknown): string {
        if (typeof error === 'string') {
            return `Magic Hour video generation failed: ${error}`;
        }

        if (error && typeof error === 'object') {
            const value = error as Record<string, unknown>;

            if (typeof value.message === 'string') {
                return `Magic Hour video generation failed: ${value.message}`;
            }

            if (typeof value.error === 'string') {
                return `Magic Hour video generation failed: ${value.error}`;
            }
        }

        return 'Magic Hour video generation failed';
    }

    private extractFailureReason(error: unknown): string | undefined {
        if (typeof error === 'string') {
            return error;
        }

        if (error && typeof error === 'object') {
            const value = error as Record<string, unknown>;

            if (typeof value.message === 'string') {
                return value.message;
            }

            if (typeof value.error === 'string') {
                return value.error;
            }
        }

        return undefined;
    }

    private validateImageUrl(imageUrl: string): void {
        let parsed: URL;

        try {
            parsed = new URL(imageUrl);
        } catch {
            throw new Error('Magic Hour image URL is invalid');
        }

        if (parsed.protocol !== 'https:') {
            throw new Error('Magic Hour image URL must use HTTPS');
        }
    }

    private getHeaders(): Record<string, string> {
        return {
            Accept: 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }

    private formatError(status: number, rawBody: string): string {
        const body = rawBody.trim();

        if (!body) {
            return `HTTP ${status}`;
        }

        try {
            const parsed = JSON.parse(body) as MagicHourError;

            const message = parsed.message ?? parsed.error ?? `HTTP ${status}`;

            return `${message} [HTTP ${status}]`;
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

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export function createMagicHourVideoProvider(
    options: VideoProviderOptions = {},
): MagicHourVideoProvider {
    return new MagicHourVideoProvider(options);
}

export default MagicHourVideoProvider;
