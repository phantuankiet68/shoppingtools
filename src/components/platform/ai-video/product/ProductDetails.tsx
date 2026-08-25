'use client';

import { memo, useCallback } from 'react';
import type { ProductInfo } from '@/components/platform/ai-video/types';
import styles from './product-step.module.css';

interface ProductDetailsProps {
    product: ProductInfo;
    onChange: (product: ProductInfo) => void;
}

export const ProductDetails = memo(function ProductDetails({
    product,
    onChange,
}: ProductDetailsProps) {
    const updateStringField = useCallback(
        (field: 'title' | 'category' | 'price' | 'description', value: string) => {
            onChange({
                ...product,
                [field]: value,
            });
        },
        [onChange, product],
    );

    const updateRating = useCallback(
        (value: string) => {
            const parsed = Number(value);

            onChange({
                ...product,
                rating: Number.isFinite(parsed) ? Math.min(5, Math.max(0, parsed)) : 0,
            });
        },
        [onChange, product],
    );

    const handleTitleChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            updateStringField('title', event.target.value);
        },
        [updateStringField],
    );

    const handleCategoryChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            updateStringField('category', event.target.value);
        },
        [updateStringField],
    );

    const handlePriceChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            updateStringField('price', event.target.value);
        },
        [updateStringField],
    );

    const handleRatingChange = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            updateRating(event.target.value);
        },
        [updateRating],
    );

    const handleDescriptionChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            updateStringField('description', event.target.value);
        },
        [updateStringField],
    );

    const ratingValue = Number.isFinite(Number(product.rating))
        ? Math.min(5, Math.max(0, Number(product.rating)))
        : 0;

    return (
        <section className={styles.detailsCard}>
            <div className={styles.cardTitle}>
                <div className={styles.cardTitleContent}>
                    <div className={styles.titleIcon}>
                        <i className="bi bi-stars" aria-hidden="true" />
                    </div>
                    <div className={styles.cardTitleMain}>
                        <div className={styles.cardTitleRow}>
                            <h3>Product information</h3>
                            <span className={styles.aiBadge}>
                                <i className="bi bi-stars" aria-hidden="true" />
                                AI extracted
                            </span>
                        </div>
                        <p>Review the key information AI extracted from your product.</p>
                    </div>
                </div>
            </div>

            <div className={styles.formGrid}>
                <label className={styles.field}>
                    <span>
                        <i className="bi bi-box-seam" aria-hidden="true" />
                        Product name
                    </span>

                    <input
                        type="text"
                        value={product.title}
                        onChange={handleTitleChange}
                        placeholder="Product name"
                        autoComplete="off"
                    />
                </label>

                <label className={styles.field}>
                    <span>
                        <i className="bi bi-grid" aria-hidden="true" />
                        Category
                    </span>

                    <input
                        type="text"
                        value={product.category}
                        onChange={handleCategoryChange}
                        placeholder="Category"
                        autoComplete="off"
                    />
                </label>

                <label className={styles.field}>
                    <span>
                        <i className="bi bi-tag" aria-hidden="true" />
                        Price
                    </span>

                    <input
                        type="text"
                        value={product.price}
                        onChange={handlePriceChange}
                        placeholder="$19.99"
                        inputMode="decimal"
                    />
                </label>

                <label className={styles.field}>
                    <span>
                        <i className="bi bi-star" aria-hidden="true" />
                        Rating
                        <div className={styles.ratingPreview} aria-hidden="true">
                            <span>
                                {Array.from({ length: 5 }).map((_, index) => (
                                    <i
                                        key={index}
                                        className={`bi ${
                                            index + 1 <= Math.round(ratingValue)
                                                ? 'bi-star-fill'
                                                : 'bi-star'
                                        }`}
                                    />
                                ))}
                            </span>
                        </div>
                    </span>

                    <div className={styles.ratingField}>
                        <input
                            type="number"
                            value={ratingValue}
                            onChange={handleRatingChange}
                            min="0"
                            max="5"
                            step="0.1"
                            inputMode="decimal"
                            aria-label="Product rating"
                        />
                    </div>
                </label>

                <label className={`${styles.field} ${styles.fullField}`}>
                    <span>
                        <i className="bi bi-card-text" aria-hidden="true" />
                        Product description
                    </span>

                    <textarea
                        value={product.description}
                        onChange={handleDescriptionChange}
                        placeholder="Describe the product..."
                        rows={5}
                        maxLength={500}
                    />

                    <div className={styles.fieldFooter}>
                        <small>Used by AI when creating the script and scenes.</small>
                        <small>{product.description.length}/500</small>
                    </div>
                </label>
            </div>

            <div className={styles.detailsHint}>
                <i className="bi bi-lightbulb" aria-hidden="true" />
                <span>Keep the product name and description precise for better AI results.</span>
            </div>
        </section>
    );
});

ProductDetails.displayName = 'ProductDetails';
