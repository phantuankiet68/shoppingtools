'use client';

import { memo, useCallback } from 'react';
import type { ProductInfo, ScriptScene } from '@/components/platform/ai-video/types';
import { ProductGallery } from './ProductGallery';
import { ProductDetails } from './ProductDetails';
import { ProductHighlights } from './ProductHighlights';
import styles from './product-step.module.css';

interface ProductStepProps {
    product: ProductInfo;
    script: ScriptScene[];
    productUrl: string;
    analyzing: boolean;
    onProductChange: (product: ProductInfo) => void;
    onScriptChange: (script: ScriptScene[]) => void;
    onProductUrlChange: (value: string) => void;
    onAnalyze: () => void;
    onGenerateScript?: () => void;
}

export const ProductStep = memo(function ProductStep({
    product,
    productUrl,
    analyzing,
    onProductChange,
    onProductUrlChange,
    onAnalyze,
}: ProductStepProps) {
    const handleImagesChange = useCallback(
        (images: ProductInfo['images']) => {
            onProductChange({
                ...product,
                images,
            });
        },
        [onProductChange, product],
    );

    const handleDetailsChange = useCallback(
        (nextProduct: ProductInfo) => {
            onProductChange(nextProduct);
        },
        [onProductChange],
    );

    const handleHighlightsChange = useCallback(
        (highlights: ProductInfo['highlights']) => {
            onProductChange({
                ...product,
                highlights,
            });
        },
        [onProductChange, product],
    );

    return (
        <div className={styles.productStep}>
            <div className={styles.productEditorGrid}>
                <ProductGallery images={product.images} onChange={handleImagesChange} />
                <ProductDetails product={product} onChange={handleDetailsChange} />
            </div>

            <ProductHighlights highlights={product.highlights} onChange={handleHighlightsChange} />

            <div className={styles.productTip}>
                <span className={styles.tipIcon}>
                    <i className="bi bi-stars" aria-hidden="true" />
                </span>
                <div>
                    <strong>AI uses these details</strong>
                    <span>
                        Your product images, description and highlights will be reused when
                        generating the script and scenes.
                    </span>
                </div>
            </div>
        </div>
    );
});

ProductStep.displayName = 'ProductStep';
