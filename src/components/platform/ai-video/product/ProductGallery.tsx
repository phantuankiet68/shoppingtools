'use client';

import { memo, useRef, useState } from 'react';
import type { ProductImage } from '@/components/platform/ai-video/types';
import styles from './product-step.module.css';

interface ProductGalleryProps {
    images: ProductImage[];
    onChange: (images: ProductImage[]) => void;
}

interface UploadResponse {
    success?: boolean;
    data?: {
        id?: string;
        url?: string;
        fileName?: string;
        originalName?: string;
        size?: number;
        type?: string;
    };
    error?: string;
}

const MAX_IMAGES = 8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

function normalizeImageUrl(value: string): string {
    const url = value.trim();

    if (!url) {
        return '';
    }

    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:image/')) {
        return url;
    }

    if (typeof window !== 'undefined') {
        return new URL(url.startsWith('/') ? url : `/${url}`, window.location.origin).toString();
    }

    return url.startsWith('/') ? url : `/${url}`;
}

export const ProductGallery = memo(function ProductGallery({
    images,
    onChange,
}: ProductGalleryProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    async function uploadImage(file: File): Promise<ProductImage> {
        if (!ALLOWED_TYPES.has(file.type)) {
            throw new Error(`${file.name}: chỉ hỗ trợ JPG, PNG hoặc WebP.`);
        }

        if (file.size <= 0) {
            throw new Error(`${file.name}: file ảnh không hợp lệ.`);
        }

        if (file.size > MAX_FILE_SIZE) {
            throw new Error(`${file.name}: ảnh tối đa 5MB.`);
        }

        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/platform/ai-video/uploads', {
            method: 'POST',
            credentials: 'include',
            body: formData,
        });

        let data: UploadResponse;

        try {
            data = (await response.json()) as UploadResponse;
        } catch {
            throw new Error(`${file.name}: server trả về dữ liệu không hợp lệ.`);
        }

        if (!response.ok || !data.success || !data.data?.url) {
            throw new Error(data.error ?? `${file.name}: upload ảnh thất bại.`);
        }

        const normalizedUrl = normalizeImageUrl(data.data.url);

        if (!normalizedUrl) {
            throw new Error(`${file.name}: server không trả về URL ảnh hợp lệ.`);
        }

        const imageId =
            typeof data.data.id === 'string' && data.data.id
                ? data.data.id
                : `${data.data.fileName ?? file.name}-${Date.now()}`;

        const imageName = data.data.originalName ?? data.data.fileName ?? file.name;

        return {
            id: imageId,
            url: normalizedUrl,
            name: imageName,
            alt: imageName,
            isPrimary: images.length === 0,
            source: 'upload',
        };
    }

    async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(event.target.files ?? []);
        event.target.value = '';

        if (!files.length) {
            return;
        }

        const remainingSlots = MAX_IMAGES - images.length;

        if (remainingSlots <= 0) {
            setUploadError(`Bạn chỉ có thể thêm tối đa ${MAX_IMAGES} ảnh.`);
            return;
        }

        const filesToUpload = files.slice(0, remainingSlots);

        setUploadError(
            files.length > remainingSlots ? `Chỉ có thể thêm ${remainingSlots} ảnh nữa.` : null,
        );

        try {
            setUploading(true);

            const uploadedImages: ProductImage[] = [];

            for (const file of filesToUpload) {
                try {
                    uploadedImages.push(await uploadImage(file));
                } catch (error) {
                    const message =
                        error instanceof Error ? error.message : `${file.name}: upload thất bại.`;

                    setUploadError(message);
                }
            }

            if (uploadedImages.length > 0) {
                const nextImages = [...images, ...uploadedImages];

                if (nextImages.length > 0 && !nextImages.some((image) => image.isPrimary)) {
                    nextImages[0] = {
                        ...nextImages[0],
                        isPrimary: true,
                    };
                }

                onChange(nextImages);
            }
        } finally {
            setUploading(false);
        }
    }

    function removeImage(id: string) {
        const nextImages = images.filter((image) => image.id !== id);

        if (nextImages.length > 0 && !nextImages.some((image) => image.isPrimary)) {
            nextImages[0] = {
                ...nextImages[0],
                isPrimary: true,
            };
        }

        onChange(nextImages);
    }

    function setPrimaryImage(id: string) {
        onChange(
            images.map((image) => ({
                ...image,
                isPrimary: image.id === id,
            })),
        );
    }

    const canUpload = images.length < MAX_IMAGES;
    const remainingSlots = MAX_IMAGES - images.length;

    return (
        <section className={`${styles.galleryCard} ${uploading ? styles.galleryLoading : ''}`}>
            <div className={styles.cardTitle}>
                <div>
                    <div className={styles.cardTitleRow}>
                        <h3>Product images</h3>
                        <span className={styles.aiBadge}>
                            <i className="bi bi-stars" aria-hidden="true" />
                            AI ready
                        </span>
                    </div>
                </div>
                <span className={styles.imageCountBadge}>
                    {images.length}/{MAX_IMAGES}
                </span>
            </div>

            {uploadError && (
                <div className={styles.galleryError} role="alert">
                    <i className="bi bi-exclamation-circle" aria-hidden="true" />
                    <span>{uploadError}</span>
                    <button
                        type="button"
                        aria-label="Close upload error"
                        onClick={() => setUploadError(null)}
                    >
                        <i className="bi bi-x-lg" aria-hidden="true" />
                    </button>
                </div>
            )}

            <div className={styles.galleryGrid}>
                {canUpload && (
                    <button
                        type="button"
                        className={`${styles.uploadBox} ${uploading ? styles.uploadBoxLoading : ''}`}
                        disabled={uploading}
                        onClick={() => inputRef.current?.click()}
                    >
                        <span className={styles.uploadIcon}>
                            {uploading ? (
                                <span className={styles.uploadSpinner} />
                            ) : (
                                <i className="bi bi-cloud-arrow-up" aria-hidden="true" />
                            )}
                        </span>

                        <strong>{uploading ? 'Uploading...' : 'Add images'}</strong>

                        <small>
                            {uploading
                                ? 'Uploading securely...'
                                : `JPG, PNG, WebP · max 5MB · ${remainingSlots} slots left`}
                        </small>
                    </button>
                )}

                {images.map((image, index) => {
                    const imageUrl = normalizeImageUrl(image.url);

                    return (
                        <article
                            className={`${styles.imageItem} ${
                                image.isPrimary ? styles.primaryImage : ''
                            }`}
                            key={image.id}
                        >
                            {imageUrl ? (
                                <img
                                    src={imageUrl}
                                    alt={image.alt ?? image.name ?? `Product image ${index + 1}`}
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    decoding="async"
                                />
                            ) : (
                                <div className={styles.imagePlaceholder}>
                                    <i className="bi bi-image" aria-hidden="true" />
                                </div>
                            )}

                            <span className={styles.imageNumber}>
                                {String(index + 1).padStart(2, '0')}
                            </span>

                            {image.isPrimary && (
                                <span className={styles.primaryBadge}>
                                    <i className="bi bi-star-fill" aria-hidden="true" />
                                    Primary
                                </span>
                            )}

                            <div className={styles.imageActions}>
                                {!image.isPrimary && (
                                    <button
                                        type="button"
                                        className={styles.imageAction}
                                        title="Set as primary"
                                        aria-label={`Set image ${index + 1} as primary`}
                                        onClick={() => setPrimaryImage(image.id)}
                                    >
                                        <i className="bi bi-star" aria-hidden="true" />
                                    </button>
                                )}

                                <button
                                    type="button"
                                    className={styles.removeImage}
                                    title="Remove image"
                                    aria-label={`Remove image ${index + 1}`}
                                    onClick={() => removeImage(image.id)}
                                >
                                    <i className="bi bi-x-lg" aria-hidden="true" />
                                </button>
                            </div>
                        </article>
                    );
                })}
            </div>

            <div className={styles.galleryFooter}>
                <span className={styles.galleryStatus}>
                    <span className={styles.statusDot} />
                    {images.length > 0 ? 'Ready for AI' : 'Add at least one image'}
                </span>
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                hidden
                onChange={handleUpload}
            />
        </section>
    );
});

ProductGallery.displayName = 'ProductGallery';
