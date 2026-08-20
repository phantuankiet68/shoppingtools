'use client';

import React from 'react';
import styles from '@/styles/admin/sites/workflow/WorkflowNode.module.css';
import { WorkflowNode as WorkflowNodeType } from '@/features/workflow/types';

type Props = {
    node: WorkflowNodeType;
    active?: boolean;
    isLast?: boolean;
    onClick?: () => void;
    nodeRefs: React.RefObject<Record<string, HTMLElement | null>>;
};

export default function WorkflowNode({
    node,
    active = false,
    isLast = false,
    onClick,
    nodeRefs,
}: Props) {
    const status = node.runtimeStatus ?? node.status;
    const running = status === 'running';
    const success = status === 'success';
    const error = status === 'error';

    return (
        <article
            ref={(element) => {
                nodeRefs.current[node.id] = element;
            }}
            onClick={onClick}
            className={[styles.node, styles[status], active && styles.active]
                .filter(Boolean)
                .join(' ')}
        >
            <span className={`${styles.handle} ${styles.left}`} />

            <div className={styles.handleLeft}>
                <div className={styles.headerTop}>
                    <div className={`${styles.icon} ${styles[node.color]}`}>
                        <i className={node.icon} />
                    </div>
                </div>

                <div className={styles.body}>
                    <div className={styles.header}>
                        <h3 className={styles.title}>{node.title}</h3>
                    </div>

                    <span
                        className={`${styles.badge} ${
                            status === 'waiting'
                                ? styles.badgeWaiting
                                : status === 'running'
                                  ? styles.badgeRunning
                                  : status === 'success'
                                    ? styles.badgeSuccess
                                    : styles.badgeError
                        }`}
                    >
                        {node.badge ??
                            (running
                                ? 'Running'
                                : success
                                  ? 'Success'
                                  : error
                                    ? 'Error'
                                    : 'Waiting')}
                    </span>

                    {running && (
                        <div className={styles.progress}>
                            <div
                                className={`${styles.fill} ${
                                    node.progress === undefined ? styles.indeterminate : ''
                                }`}
                                style={
                                    node.progress !== undefined
                                        ? {
                                              width: `${Math.min(
                                                  100,
                                                  Math.max(0, node.progress),
                                              )}%`,
                                          }
                                        : undefined
                                }
                            />
                        </div>
                    )}

                    {error && node.error && (
                        <div className={styles.error}>
                            <i className="bi bi-exclamation-triangle" />
                            <span>{node.error}</span>
                        </div>
                    )}

                    {success && node.duration !== undefined && (
                        <div className={styles.duration}>
                            <i className="bi bi-clock" />
                            <span>{node.duration}ms</span>
                        </div>
                    )}
                </div>
            </div>

            {node.subtitle && <p className={styles.subtitle}>{node.subtitle}</p>}

            {node.api && (
                <div className={styles.api}>
                    <i className="bi bi-hdd-network" />
                    <span>{node.api}</span>
                </div>
            )}

            {!isLast && <span className={`${styles.handle} ${styles.right}`} />}
        </article>
    );
}
