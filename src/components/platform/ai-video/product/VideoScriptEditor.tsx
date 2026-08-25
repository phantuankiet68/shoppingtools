'use client';

import { memo, useCallback } from 'react';
import type { ScriptScene } from '@/components/platform/ai-video/types';
import styles from './product-step.module.css';

interface VideoScriptEditorProps {
    script: ScriptScene[];
    onChange: (script: ScriptScene[]) => void;
    onGenerate?: () => void;
}

export const VideoScriptEditor = memo(function VideoScriptEditor({
    script,
    onChange,
    onGenerate,
}: VideoScriptEditorProps) {
    const updateScene = useCallback(
        (id: string, field: keyof ScriptScene, value: string) => {
            const nextScript = script.map((scene) =>
                scene.id === id
                    ? {
                          ...scene,
                          [field]: value,
                      }
                    : scene,
            );

            onChange(nextScript);
        },
        [onChange, script],
    );

    const addScene = useCallback(() => {
        const index = script.length + 1;

        onChange([
            ...script,
            {
                id: `scene-${Date.now()}`,
                time: '0:12 – 0:17',
                title: `Scene ${index}`,
                text: '',
                visual: '',
                voice: 'Energetic female voice',
            },
        ]);
    }, [onChange, script]);

    const removeScene = useCallback(
        (id: string) => {
            if (script.length <= 1) {
                return;
            }

            onChange(script.filter((scene) => scene.id !== id));
        },
        [onChange, script],
    );

    const handleGenerate = useCallback(() => {
        onGenerate?.();
    }, [onGenerate]);

    return (
        <section className={styles.scriptCard}>
            <div className={styles.scriptHeader}>
                <div className={styles.sectionHeading}>
                    <div className={`${styles.headingIcon} ${styles.scriptIcon}`}>
                        <i className="bi bi-stars" aria-hidden="true" />
                    </div>

                    <div>
                        <h2>AI video script</h2>

                        <p>Control exactly what the AI voice will say in each scene.</p>
                    </div>
                </div>

                <button
                    type="button"
                    className={styles.aiAction}
                    onClick={handleGenerate}
                    disabled={!onGenerate}
                >
                    <i className="bi bi-stars" aria-hidden="true" />
                    Regenerate with AI
                </button>
            </div>

            <div className={styles.scriptNotice}>
                <i className="bi bi-info-circle" aria-hidden="true" />

                <span>
                    The <strong>Voice text</strong> is what your AI voice will read aloud. Visual
                    description is used to generate the scene.
                </span>
            </div>

            <div className={styles.sceneList}>
                {script.map((scene, index) => (
                    <article className={styles.sceneEditor} key={scene.id}>
                        <div className={styles.sceneRail}>
                            <span>{index + 1}</span>

                            {index < script.length - 1 && <i />}
                        </div>

                        <div className={styles.sceneContent}>
                            <div className={styles.sceneTop}>
                                <div>
                                    <span className={styles.sceneTime}>{scene.time}</span>

                                    <input
                                        className={styles.sceneTitle}
                                        value={scene.title}
                                        onChange={(event) =>
                                            updateScene(scene.id, 'title', event.target.value)
                                        }
                                        aria-label={`Scene ${index + 1} title`}
                                    />
                                </div>

                                <button
                                    type="button"
                                    className={styles.iconButton}
                                    onClick={() => removeScene(scene.id)}
                                    title="Remove scene"
                                    aria-label={`Remove scene ${index + 1}`}
                                    disabled={script.length <= 1}
                                >
                                    <i className="bi bi-trash3" aria-hidden="true" />
                                </button>
                            </div>

                            <label className={styles.scriptField}>
                                <span>
                                    <i className="bi bi-mic" aria-hidden="true" />
                                    Voice text
                                </span>

                                <textarea
                                    value={scene.text}
                                    onChange={(event) =>
                                        updateScene(scene.id, 'text', event.target.value)
                                    }
                                    placeholder="Write what the AI voice should say..."
                                    rows={3}
                                />

                                <small>{scene.text.length} characters</small>
                            </label>

                            <div className={styles.sceneMetaGrid}>
                                <label className={styles.scriptField}>
                                    <span>
                                        <i className="bi bi-camera-video" aria-hidden="true" />
                                        Visual direction
                                    </span>

                                    <input
                                        value={scene.visual ?? ''}
                                        onChange={(event) =>
                                            updateScene(scene.id, 'visual', event.target.value)
                                        }
                                        placeholder="Example: Close-up product shot..."
                                    />
                                </label>

                                <label className={styles.scriptField}>
                                    <span>
                                        <i className="bi bi-soundwave" aria-hidden="true" />
                                        Voice style
                                    </span>

                                    <input
                                        value={scene.voice ?? ''}
                                        onChange={(event) =>
                                            updateScene(scene.id, 'voice', event.target.value)
                                        }
                                        placeholder="Energetic female voice"
                                    />
                                </label>
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            <button type="button" className={styles.addSceneButton} onClick={addScene}>
                <i className="bi bi-plus-lg" aria-hidden="true" />
                Add scene
            </button>
        </section>
    );
});

VideoScriptEditor.displayName = 'VideoScriptEditor';
