'use client';

import styles from '@/styles/admin/sites/workflow/WorkflowGroup.module.css';
import WorkflowNode from './WorkflowNode';
import WorkflowConnector from './WorkflowConnector';
import React, { Fragment } from 'react';
import {
    WorkflowData,
    WorkflowGroup as WorkflowGroupType,
    WorkflowNode as WorkflowNodeType,
} from '@/features/workflow/types';

type Props = {
    workflow: WorkflowData;
    group: WorkflowGroupType;
    selectedNode?: WorkflowNodeType;
    onSelectNode: (node: WorkflowNodeType) => void;
    nodeRefs: React.RefObject<Record<string, HTMLElement | null>>;
};

export default function WorkflowGroup({
    workflow,
    group,
    selectedNode,
    onSelectNode,
    nodeRefs,
}: Props) {
    return (
        <section className={styles.group}>
            <header className={styles.header}>
                <span className={styles.indicator} style={{ background: group.color }} />

                <h3 className={styles.title}>{group.title}</h3>
            </header>

            <div className={styles.nodes}>
                {group.nodes.map((node, index) => (
                    <Fragment key={node.id}>
                        <WorkflowNode
                            node={node}
                            active={selectedNode?.id === node.id}
                            isLast={index === group.nodes.length - 1}
                            onClick={() => onSelectNode(node)}
                            nodeRefs={nodeRefs}
                        />

                        {index < group.nodes.length - 1 && (
                            <WorkflowConnector
                                active={(node.runtimeStatus ?? node.status) === 'success'}
                            />
                        )}
                    </Fragment>
                ))}
            </div>
        </section>
    );
}
