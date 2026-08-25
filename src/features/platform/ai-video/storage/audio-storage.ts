// ============================================================
// Kbuilder AI Video — Audio Storage
// ============================================================

export interface AudioUploadInput {
    buffer: Buffer;
    fileName?: string;
    contentType?: string;
    projectId?: string;
}

export interface AudioUploadResult {
    url: string;
    key: string;
    contentType: string;
    size: number;
}

export interface AudioStorage {
    upload(input: AudioUploadInput): Promise<AudioUploadResult>;

    delete(key: string): Promise<void>;

    exists(key: string): Promise<boolean>;
}

// ============================================================
// Local Audio Storage
// ============================================================

class LocalAudioStorage implements AudioStorage {
    private readonly baseUrl: string;

    constructor() {
        this.baseUrl =
            process.env.AI_VIDEO_STORAGE_URL ??
            process.env.NEXT_PUBLIC_APP_URL ??
            'http://localhost:3000';
    }

    async upload(input: AudioUploadInput): Promise<AudioUploadResult> {
        if (!input.buffer || input.buffer.length === 0) {
            throw new Error('Audio buffer is empty');
        }

        const contentType = input.contentType ?? 'audio/mpeg';

        const extension = this.getExtension(contentType);

        const fileName =
            input.fileName ?? `${input.projectId ?? 'audio'}-${Date.now()}${extension}`;

        const key = this.buildKey(input.projectId, fileName);

        /*
         * Storage implementation thật sẽ được nối vào đây.
         *
         * Ví dụ:
         * - S3
         * - Cloudflare R2
         * - MinIO
         * - local filesystem
         *
         * Hiện tại chưa ghi file trực tiếp vì storage
         * backend chưa được xác định.
         */

        return {
            url: `${this.baseUrl}/api/platform/ai-video/storage/audio/${encodeURIComponent(key)}`,
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

        return `ai-video/audio/${safeProjectId}/${fileName}`;
    }

    private getExtension(contentType: string): string {
        switch (contentType) {
            case 'audio/wav':
                return '.wav';

            case 'audio/aac':
                return '.aac';

            case 'audio/ogg':
                return '.ogg';

            case 'audio/mpeg':
            case 'audio/mp3':
            default:
                return '.mp3';
        }
    }
}

// ============================================================
// Singleton
// ============================================================

export const audioStorage: AudioStorage = new LocalAudioStorage();
