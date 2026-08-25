'use client';

import { memo, useCallback, useState } from 'react';
import styles from './product-step.module.css';

interface ProductHighlightsProps {
    highlights: string[];
    onChange: (highlights: string[]) => void;
}

export const ProductHighlights = memo(function ProductHighlights({
    highlights,
    onChange,
}: ProductHighlightsProps) {
    const [value, setValue] = useState('');
    const [isFocused, setIsFocused] = useState(false);

    const normalizedValue = value.trim();

    const addHighlight = useCallback(() => {
        if (!normalizedValue || highlights.includes(normalizedValue)) {
            return;
        }

        onChange([...highlights, normalizedValue]);
        setValue('');
    }, [highlights, normalizedValue, onChange]);

    const removeHighlight = useCallback(
        (item: string) => {
            onChange(highlights.filter((highlight) => highlight !== item));
        },
        [highlights, onChange],
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.key !== 'Enter') {
                return;
            }

            event.preventDefault();
            addHighlight();
        },
        [addHighlight],
    );

    return (
        <section
            className={`${styles.highlightCard} ${isFocused ? styles.highlightCardFocused : ''}`}
        >
            <div className={styles.cardTitle}>
                <div className={styles.cardTitleContent}>
                    <div className={styles.titleIcon}>
                        <i className="bi bi-stars" aria-hidden="true" />
                    </div>
                    <div className={styles.cardTitleMain}>
                        <div className={styles.cardTitleRow}>
                            <h3>Product highlights</h3>
                            <span className={styles.aiBadge}>
                                <i className="bi bi-stars" aria-hidden="true" />
                                AI extracted
                            </span>
                        </div>
                        <p>Key selling points the AI can use in your script and scenes.</p>
                    </div>
                </div>
            </div>

            <div className={styles.highlightList}>
                {highlights.length > 0 ? (
                    highlights.map((item, index) => (
                        <button
                            type="button"
                            key={`${item}-${index}`}
                            className={styles.highlightChip}
                            onClick={() => removeHighlight(item)}
                            title="Remove highlight"
                            aria-label={`Remove highlight: ${item}`}
                        >
                            <span className={styles.highlightChipIcon}>
                                <i className="bi bi-check2" aria-hidden="true" />
                            </span>

                            <span className={styles.highlightChipText}>{item}</span>

                            <i className="bi bi-x-lg" aria-hidden="true" />
                        </button>
                    ))
                ) : (
                    <div className={styles.highlightsEmpty}>
                        <span>
                            <i className="bi bi-stars" aria-hidden="true" />
                        </span>
                        <div>
                            <strong>No highlights yet</strong>
                            <small>
                                Add short selling points such as “Soft silicone”, “4 colors”, or
                                “Camera protection”.
                            </small>
                        </div>
                    </div>
                )}

                <div
                    className={`${styles.addHighlight} ${isFocused ? styles.addHighlightFocused : ''}`}
                >
                    <span className={styles.addHighlightIcon}>
                        <i className="bi bi-plus-lg" aria-hidden="true" />
                    </span>

                    <input
                        value={value}
                        onChange={(event) => setValue(event.target.value)}
                        onKeyDown={handleKeyDown}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        placeholder="Add a selling point..."
                        aria-label="Add product highlight"
                        maxLength={120}
                    />

                    <button
                        type="button"
                        onClick={addHighlight}
                        disabled={!normalizedValue}
                        aria-label="Add highlight"
                        title="Add highlight"
                    >
                        <i className="bi bi-arrow-up" aria-hidden="true" />
                    </button>
                </div>
            </div>

            <div className={styles.highlightFooter}>
                <span className={styles.highlightFootertop}>
                    <i className="bi bi-lightbulb" aria-hidden="true" />
                    Keep each point short and specific.
                </span>
                <span>{value.length}/120</span>
            </div>
        </section>
    );
});

ProductHighlights.displayName = 'ProductHighlights';
