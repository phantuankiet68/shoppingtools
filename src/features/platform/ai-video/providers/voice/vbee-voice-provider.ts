import type {
    GeneratedVoice,
    VoiceGenerationInput,
} from '@/features/platform/ai-video/types/voice';

import type { VoiceProvider } from './voice-provider';

interface VbeeVoiceOptions {
    appId?: string;
    token?: string;
    voiceCode?: string;
    callbackUrl?: string;
    speedRate?: number;
    bitrate?: number;
    baseUrl?: string;
    timeoutMs?: number;
    pollIntervalMs?: number;
}

interface VbeeTtsResponse {
    status?: number;
    error_code?: string | number;
    error_message?: string;
    details?: unknown;
    result?: {
        request_id?: string;
        status?: string;
        audio_link?: string;
        audio_type?: string;
        voice_code?: string;
        speed_rate?: number;
        characters?: number;
    };
}

export class VbeeVoiceProvider implements VoiceProvider {
    readonly name = 'vbee';

    private readonly appId: string;
    private readonly token: string;
    private readonly voiceCode?: string;
    private readonly callbackUrl: string;
    private readonly speedRate: number;
    private readonly bitrate: number;
    private readonly baseUrl: string;
    private readonly timeoutMs: number;
    private readonly pollIntervalMs: number;

    constructor(options: VbeeVoiceOptions = {}) {
        const appId = options.appId ?? process.env.VBEE_APP_ID;
        const token = options.token ?? process.env.VBEE_TOKEN;
        const callbackUrl = options.callbackUrl ?? process.env.VBEE_CALLBACK_URL;

        if (!appId) {
            throw new Error('VBEE_APP_ID is not configured');
        }

        if (!token) {
            throw new Error('VBEE_TOKEN is not configured');
        }

        if (!callbackUrl) {
            throw new Error('VBEE_CALLBACK_URL is not configured');
        }

        this.appId = appId;
        this.token = token;
        this.voiceCode = options.voiceCode ?? process.env.VBEE_VOICE_CODE ?? undefined;

        this.callbackUrl = callbackUrl;

        this.speedRate = this.normalizeSpeedRate(
            options.speedRate ?? Number(process.env.VBEE_SPEED_RATE ?? 1),
        );

        this.bitrate = options.bitrate ?? Number(process.env.VBEE_BITRATE ?? 128);

        this.baseUrl = options.baseUrl ?? process.env.VBEE_API_BASE_URL ?? 'https://vbee.vn/api/v1';

        this.timeoutMs = options.timeoutMs ?? Number(process.env.VBEE_TIMEOUT_MS ?? 90_000);

        this.pollIntervalMs =
            options.pollIntervalMs ?? Number(process.env.VBEE_POLL_INTERVAL_MS ?? 2_000);
    }

    async generate(input: VoiceGenerationInput): Promise<GeneratedVoice> {
        const text = input.text?.trim();

        if (!text) {
            throw new Error('Voice text cannot be empty');
        }

        const voiceCode = input.voiceId ?? this.voiceCode ?? undefined;

        const body: Record<string, unknown> = {
            app_id: this.appId,
            input_text: text,
            audio_type: 'mp3',
            bitrate: this.bitrate,
            speed_rate: this.speedRate,
            callbackUrl: this.callbackUrl,
        };

        if (voiceCode) {
            body.voice_code = voiceCode;
        }

        console.log('[vbee] Creating TTS request:', {
            url: `${this.baseUrl}/tts`,
            appId: this.appId,
            voiceCode: voiceCode ?? null,
            callbackUrl: this.callbackUrl,
            language: input.language,
            characters: text.length,
            speedRate: this.speedRate,
            bitrate: this.bitrate,
        });

        const createResponse = await this.request<VbeeTtsResponse>('/tts', {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(body),
        });

        if (createResponse.status !== 1) {
            throw new Error(
                [
                    'Vbee voice generation failed:',
                    createResponse.error_code ?? 'UNKNOWN',
                    createResponse.error_message ?? '',
                    createResponse.details ? JSON.stringify(createResponse.details) : '',
                ]
                    .filter(Boolean)
                    .join(' '),
            );
        }

        const requestId = createResponse.result?.request_id;

        const directAudioUrl = createResponse.result?.audio_link;

        if (directAudioUrl) {
            return this.toGeneratedVoice(
                directAudioUrl,
                requestId,
                input,
                voiceCode,
                createResponse.result,
            );
        }

        if (!requestId) {
            throw new Error('Vbee did not return a request_id');
        }

        console.log('[vbee] TTS request created:', {
            requestId,
            voiceCode: voiceCode ?? null,
        });

        const result = await this.waitForResult(requestId);

        if (!result.audio_link) {
            throw new Error('Vbee completed the request without an audio_link');
        }

        return this.toGeneratedVoice(
            result.audio_link,
            requestId,
            input,
            result.voice_code ?? voiceCode,
            result,
        );
    }

    private async waitForResult(
        requestId: string,
    ): Promise<NonNullable<VbeeTtsResponse['result']>> {
        const startedAt = Date.now();

        while (Date.now() - startedAt < this.timeoutMs) {
            await this.sleep(this.pollIntervalMs);

            const response = await this.request<VbeeTtsResponse>(
                `/tts/${encodeURIComponent(requestId)}`,
                {
                    method: 'GET',
                    headers: this.getHeaders(),
                },
            );

            if (response.status !== 1) {
                throw new Error(
                    [
                        'Vbee status check failed:',
                        response.error_code ?? 'UNKNOWN',
                        response.error_message ?? '',
                        response.details ? JSON.stringify(response.details) : '',
                    ]
                        .filter(Boolean)
                        .join(' '),
                );
            }

            const result = response.result;

            const status = String(result?.status ?? '').toUpperCase();

            console.log('[vbee] TTS status:', {
                requestId,
                status: status || 'UNKNOWN',
            });

            if (status === 'SUCCESS' && result?.audio_link) {
                return result;
            }

            if (status === 'FAILURE' || status === 'FAILED' || status === 'ERROR') {
                throw new Error(`Vbee voice generation failed for request ${requestId}`);
            }
        }

        throw new Error(`Vbee voice generation timed out after ${this.timeoutMs}ms`);
    }

    private async request<T>(requestPath: string, init: RequestInit): Promise<T> {
        const controller = new AbortController();

        const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

        const url = `${this.baseUrl}${requestPath}`;

        try {
            const response = await fetch(url, {
                ...init,
                signal: controller.signal,
            });

            const rawBody = await response.text();

            let data: T;

            try {
                data = JSON.parse(rawBody) as T;
            } catch {
                throw new Error(`Vbee returned invalid JSON: ${rawBody.slice(0, 500)}`);
            }

            if (!response.ok) {
                const error = data as VbeeTtsResponse;

                console.error('[vbee] HTTP error:', {
                    url,
                    status: response.status,
                    statusText: response.statusText,
                    body: error,
                });

                const details = error.details ? JSON.stringify(error.details) : '';

                throw new Error(
                    [
                        'Vbee API request failed:',
                        response.status,
                        error.error_code ?? '',
                        error.error_message ?? response.statusText,
                        details,
                    ]
                        .filter(Boolean)
                        .join(' '),
                );
            }

            return data;
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                throw new Error(`Vbee API request timed out after ${this.timeoutMs}ms`);
            }

            throw error;
        } finally {
            clearTimeout(timeout);
        }
    }

    private getHeaders(): HeadersInit {
        return {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };
    }

    private toGeneratedVoice(
        audioUrl: string,
        requestId: string | undefined,
        input: VoiceGenerationInput,
        voiceCode: string | undefined,
        result?: VbeeTtsResponse['result'],
    ): GeneratedVoice {
        const durationSeconds = 0;

        console.log('[vbee] Voice generated:', {
            requestId: requestId ?? null,
            voiceCode: voiceCode ?? null,
            characters: result?.characters ?? input.text.length,
            audioType: result?.audio_type ?? 'mp3',
            audioUrl,
        });

        return {
            audioUrl,
            durationSeconds,
            provider: 'vbee',
            providerRequestId: requestId,
            format: 'mp3',
            metadata: {
                language: input.language,
                voiceId: voiceCode,
                emotion: input.emotion,
                speedRate: result?.speed_rate ?? this.speedRate,
            },
        };
    }

    private normalizeSpeedRate(value: number): number {
        if (!Number.isFinite(value)) {
            return 1;
        }

        return Math.min(1.9, Math.max(0.1, value));
    }

    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}

export const vbeeVoiceProvider = new VbeeVoiceProvider();

export default vbeeVoiceProvider;
