'use client';

import { useEffect, useState } from 'react';

import { createApiHealth } from '@/services/platform/api-health/index.service';

import type { ApiHealthEndpoint } from '@/services/platform/api-health/index.service';

import styles from '@/styles/platform/api-health/api-health-create-modal.module.css';

interface Props {
    open: boolean;
    onClose: () => void;
    onCreated: (item: ApiHealthEndpoint) => void;
}

type FormData = {
    name: string;
    endpoint: string;
    method: ApiHealthEndpoint['method'];
    category: string;
};

const INITIAL_FORM: FormData = {
    name: '',
    endpoint: '',
    method: 'GET',
    category: 'Platform',
};

const METHODS: ApiHealthEndpoint['method'][] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export default function ApiHealthCreateModal({ open, onClose, onCreated }: Props) {
    const [form, setForm] = useState<FormData>(INITIAL_FORM);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!open) {
            setForm(INITIAL_FORM);
            setError(null);
            setLoading(false);
        }
    }, [open]);

    if (!open) {
        return null;
    }

    const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
        setForm((current) => ({
            ...current,
            [field]: value,
        }));

        if (error) {
            setError(null);
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (loading) {
            return;
        }

        const name = form.name.trim();
        const endpoint = form.endpoint.trim();
        const category = form.category.trim();

        if (!name) {
            setError('API name is required.');
            return;
        }

        if (!endpoint) {
            setError('API endpoint is required.');
            return;
        }

        if (!endpoint.startsWith('/')) {
            setError('Endpoint must be a relative API path, for example /api/platform/sites.');
            return;
        }

        if (!category) {
            setError('Category is required.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const result = await createApiHealth({
                name,
                endpoint,
                method: form.method,
                category,
            });

            onCreated(result.item);
            onClose();
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to create API endpoint.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            className={styles.overlay}
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            <section
                className={styles.modal}
                role="dialog"
                aria-modal="true"
                aria-labelledby="api-health-create-title"
            >
                <div className={styles.header}>
                    <div className={styles.heading}>
                        <div className={styles.icon}>
                            <i className="bi bi-plus-lg" />
                        </div>

                        <div>
                            <span>API Health</span>

                            <h2 id="api-health-create-title">Create Endpoint</h2>
                        </div>
                    </div>

                    <button
                        type="button"
                        className={styles.close}
                        onClick={onClose}
                        disabled={loading}
                        aria-label="Close"
                    >
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                <form className={styles.form} onSubmit={handleSubmit}>
                    <div className={styles.field}>
                        <label htmlFor="api-name">API Name</label>

                        <input
                            id="api-name"
                            type="text"
                            value={form.name}
                            onChange={(event) => updateField('name', event.target.value)}
                            placeholder="Platform Sites"
                            autoComplete="off"
                            disabled={loading}
                        />

                        <span>A readable name for this endpoint.</span>
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="api-endpoint">Endpoint</label>

                        <div className={styles.inputWithIcon}>
                            <i className="bi bi-link-45deg" />

                            <input
                                id="api-endpoint"
                                type="text"
                                value={form.endpoint}
                                onChange={(event) => updateField('endpoint', event.target.value)}
                                placeholder="/api/platform/sites"
                                autoComplete="off"
                                disabled={loading}
                            />
                        </div>

                        <span>Use a relative internal API endpoint.</span>
                    </div>

                    <div className={styles.row}>
                        <div className={styles.field}>
                            <label htmlFor="api-method">Method</label>

                            <select
                                id="api-method"
                                value={form.method}
                                onChange={(event) =>
                                    updateField('method', event.target.value as FormData['method'])
                                }
                                disabled={loading}
                            >
                                {METHODS.map((method) => (
                                    <option key={method} value={method}>
                                        {method}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className={styles.field}>
                            <label htmlFor="api-category">Category</label>

                            <input
                                id="api-category"
                                type="text"
                                value={form.category}
                                onChange={(event) => updateField('category', event.target.value)}
                                placeholder="Platform"
                                autoComplete="off"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    {error && (
                        <div className={styles.error}>
                            <i className="bi bi-exclamation-circle-fill" />

                            <div>
                                <strong>Unable to create endpoint</strong>

                                <p>{error}</p>
                            </div>
                        </div>
                    )}

                    <div className={styles.footer}>
                        <button
                            type="button"
                            className={styles.secondary}
                            onClick={onClose}
                            disabled={loading}
                        >
                            Cancel
                        </button>

                        <button type="submit" className={styles.primary} disabled={loading}>
                            <i
                                className={`bi ${loading ? 'bi-arrow-repeat' : 'bi-plus-lg'} ${
                                    loading ? styles.spin : ''
                                }`}
                            />

                            {loading ? 'Creating...' : 'Create Endpoint'}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
}
