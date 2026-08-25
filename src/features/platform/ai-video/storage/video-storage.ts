// ============================================================
// Kbuilder AI Video — Video Storage
// ============================================================

export interface VideoUploadInput {
    buffer: Buffer;
    fileName?: string;
    contentType?: string;
    projectId?: string;
}

export interface VideoUploadResult {
    url: string;
    key: string;
    contentType: string;
    size: number;
}

export interface VideoStorage {
    upload(input: VideoUploadInput): Promise<VideoUploadResult>;

    delete(key: string): Promise<void>;

    exists(key: string): Promise<boolean>;
}

// ============================================================
// Local Video Storage
// ============================================================

class LocalVideoStorage implements VideoStorage {
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl =
            process.env.AI_VIDEO_STORAGE_URL ??
            process.env.NEXT_PUBLIC_APP_URL ??
            'http://localhost:3000';
    }

    async upload(input: VideoUploadInput): Promise<VideoUploadResult> {
        if (!input.buffer || input.buffer.length === 0) {
            throw new Error('Video buffer is empty');
        }

        const contentType = input.contentType ?? 'video/mp4';

        const extension = this.getExtension(contentType);

        const fileName =
            input.fileName ?? `${input.projectId ?? 'video'}-${Date.now()}${extension}`;

        const key = this.buildKey(input.projectId, fileName);

        /*
         * Storage backend sẽ được implement ở phase tiếp theo.
         *
         * Có thể sử dụng:
         * - Cloudflare R2
         * - AWS S3
         * - MinIO
         * - VPS filesystem
         */

        return {
            url: `${this.baseUrl}/api/platform/ai-video/storage/video/${encodeURIComponent(key)}`,
            key,
            contentType,
            size: input.buffer.length,
        };
    }

    async delete(_key: string): Promise<void> {
        /*
         * TODO:
         * Implement delete when storage backend is connected.
         */
    }

    async exists(_key: string): Promise<boolean> {
        /*
         * TODO:
         * Implement existence check when storage backend
         * is connected.
         */

        return false;
    }

    private buildKey(projectId: string | undefined, fileName: string): string {
        const safeProjectId = projectId ?? 'general';

        return `ai-video/video/${safeProjectId}/${fileName}`;
    }

    private getExtension(contentType: string): string {
        switch (contentType) {
            case 'video/webm':
                return '.webm';

            case 'video/quicktime':
                return '.mov';

            case 'video/x-matroska':
                return '.mkv';

            case 'video/mp4':
            default:
                return '.mp4';
        }
    }
}

// ============================================================
// Singleton
// ============================================================

export const videoStorage: VideoStorage = new LocalVideoStorage();
