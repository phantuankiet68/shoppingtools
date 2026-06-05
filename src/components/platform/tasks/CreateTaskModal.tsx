'use client';

import { useEffect, useState } from 'react';

import styles from '@/styles/platform/tasks/CreateTaskModal.module.css';

interface Props {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const INITIAL_FORM = {
    title: '',
    description: '',
    imageUrl: '',

    category: 'DEVELOPMENT',

    priority: 'MEDIUM',

    startAt: '',

    endAt: '',
};

export default function CreateTaskModal({ open, onClose, onSuccess }: Props) {
    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');

    const [form, setForm] = useState(INITIAL_FORM);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (open) {
            window.addEventListener('keydown', handleEsc);
        }

        return () => window.removeEventListener('keydown', handleEsc);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    const updateField = (key: keyof typeof form, value: string) => {
        setForm((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const validate = () => {
        if (!form.title.trim()) {
            setError('Task title is required.');
            return false;
        }

        if (form.startAt && form.endAt && new Date(form.endAt) < new Date(form.startAt)) {
            setError('End time must be greater than start time.');
            return false;
        }

        setError('');

        return true;
    };

    const handleSubmit = async () => {
        if (!validate()) {
            return;
        }

        try {
            setLoading(true);

            const response = await fetch('/api/platform/tasks', {
                method: 'POST',

                headers: {
                    'Content-Type': 'application/json',
                },

                body: JSON.stringify(form),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Unable to create task');
            }

            setForm(INITIAL_FORM);

            onSuccess();

            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {/* HEADER */}

                <div className={styles.header}>
                    <div>
                        <div className={styles.badge}>
                            <i className="bi bi-stars" />
                            Create New Task
                        </div>

                        <h2>Task Workspace</h2>

                        <p>Organize your work, deadlines, priorities and productivity.</p>
                    </div>

                    <button className={styles.closeBtn} onClick={onClose}>
                        <i className="bi bi-x-lg" />
                    </button>
                </div>

                {/* BODY */}

                <div className={styles.body}>
                    {/* TITLE */}

                    <div className={styles.field}>
                        <label>
                            <i className="bi bi-pencil-square" />
                            Task Title
                        </label>

                        <input
                            value={form.title}
                            placeholder="Design Admin Dashboard"
                            onChange={(e) => updateField('title', e.target.value)}
                        />
                    </div>

                    {/* CATEGORY */}

                    <div className={styles.field}>
                        <label>
                            <i className="bi bi-grid-3x3-gap" />
                            Category
                        </label>

                        <select
                            value={form.category}
                            onChange={(e) => updateField('category', e.target.value)}
                        >
                            <option value="DEVELOPMENT">💻 Development</option>

                            <option value="DESIGN">🎨 Design</option>

                            <option value="LEARNING">📚 Learning</option>

                            <option value="JOB_SEARCH">💼 Job Search</option>

                            <option value="PERSONAL">🏡 Personal</option>
                        </select>
                    </div>

                    {/* DESCRIPTION */}

                    <div className={styles.fullWidth}>
                        <label>
                            <i className="bi bi-card-text" />
                            Description
                        </label>

                        <textarea
                            rows={5}
                            maxLength={500}
                            value={form.description}
                            placeholder="Describe the task..."
                            onChange={(e) => updateField('description', e.target.value)}
                        />

                        <div className={styles.counter}>
                            {form.description.length}
                            /500
                        </div>
                    </div>

                    {/* PRIORITY */}

                    <div className={styles.field}>
                        <label>
                            <i className="bi bi-flag-fill" />
                            Priority
                        </label>

                        <select
                            value={form.priority}
                            onChange={(e) => updateField('priority', e.target.value)}
                        >
                            <option value="LOW">🟢 Low</option>

                            <option value="MEDIUM">🟡 Medium</option>

                            <option value="HIGH">🟠 High</option>

                            <option value="URGENT">🔴 Urgent</option>
                        </select>
                    </div>

                    {/* IMAGE */}

                    <div className={styles.field}>
                        <label>
                            <i className="bi bi-image" />
                            Cover Image
                        </label>

                        <input
                            placeholder="https://..."
                            value={form.imageUrl}
                            onChange={(e) => updateField('imageUrl', e.target.value)}
                        />
                    </div>

                    {/* START */}

                    <div className={styles.field}>
                        <label>
                            <i className="bi bi-calendar-event" />
                            Start Time
                        </label>

                        <input
                            type="datetime-local"
                            value={form.startAt}
                            onChange={(e) => updateField('startAt', e.target.value)}
                        />
                    </div>

                    {/* END */}

                    <div className={styles.field}>
                        <label>
                            <i className="bi bi-calendar-check" />
                            End Time
                        </label>

                        <input
                            type="datetime-local"
                            value={form.endAt}
                            onChange={(e) => updateField('endAt', e.target.value)}
                        />
                    </div>

                    {/* IMAGE PREVIEW */}

                    {form.imageUrl && (
                        <div className={styles.fullWidth}>
                            <div className={styles.preview}>
                                <img src={form.imageUrl} alt="preview" />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className={styles.error}>
                            <i className="bi bi-exclamation-circle-fill" />
                            {error}
                        </div>
                    )}
                </div>

                {/* FOOTER */}

                <div className={styles.footer}>
                    <button className={styles.cancelBtn} onClick={onClose}>
                        <i className="bi bi-x-circle" />
                        Cancel
                    </button>

                    <button disabled={loading} className={styles.createBtn} onClick={handleSubmit}>
                        {loading ? (
                            <>
                                <i className="bi bi-arrow-repeat" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-rocket-takeoff-fill" />
                                Create Task
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
