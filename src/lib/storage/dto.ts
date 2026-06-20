// lib/storage/dto.ts
import type { StorageBucket, StorageIntegration, StorageLog } from '@/generated/prisma';
import { maskSecret } from '@/lib/storage/crypto';

/**
 * Map DB integration -> UI settings shape.
 * Note: Secrets are masked only. UI should not receive plaintext secrets.
 */
export function integrationToSettings(i: StorageIntegration) {
    return {
        provider: i.provider,
        status: i.status,

        // Common
        publicBaseUrl: i.publicBaseUrl,
        rootPrefix: i.rootPrefix,
        privateByDefault: i.privateByDefault,
        signedUrlEnabled: i.signedUrlEnabled,
        signedUrlTtlSeconds: i.signedUrlTtlSeconds,

        maxUploadMb: i.maxUploadMb,
        allowedMime: i.allowedMime,
        enableImageOptimization: i.enableImageOptimization,

        // Local
        localDir: i.localDir ?? '',

        // S3/R2
        region: i.region ?? '',
        bucket: i.bucket ?? '',
        endpointUrl: i.endpointUrl ?? '',
        secretAccessKey: i.secretAccessKeyEnc
            ? maskSecret('SECR' + i.secretAccessKeyEnc.slice(-4))
            : '',

        // CDN
        cacheControl: i.cacheControl,
        purgeEnabled: i.purgeEnabled,
    };
}

export function bucketToRow(b: StorageBucket) {
    return {
        id: b.id,
        name: b.name,
        region: b.region ?? undefined,
        provider: b.provider,
        updatedAt: b.updatedAt.toISOString(),
    };
}

export function logToRow(l: StorageLog) {
    return {
        id: l.id,
        at: l.createdAt.toISOString(),
        level: l.level,
        action: l.action,
        message: l.message,
    };
}
