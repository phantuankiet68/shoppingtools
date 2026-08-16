'use client';

import { useEffect, useRef, useState } from 'react';
import styles from '@/styles/admin/sites/workflow/WorkflowCanvas.module.css';
import WorkflowGroup from './WorkflowGroup';
import WorkflowInfo from './WorkflowInfo';
import { WorkflowData, WorkflowNode } from '@/features/workflow/types';

type Props = {
    workflow: WorkflowData;
};

export default function WorkflowCanvas({ workflow }: Props) {
    const firstNode = workflow.groups[0]?.nodes[0];

    const [selectedNode, setSelectedNode] = useState<WorkflowNode | undefined>(firstNode);

    const nodeRefs = useRef<Record<string, HTMLDivElement | null>>({});

    useEffect(() => {
        if (!workflow.runtime?.currentNodeId) return;

        const nodeId = workflow.runtime.currentNodeId;

        const node = workflow.groups
            .flatMap((group) => group.nodes)
            .find((item) => item.id === nodeId);

        if (node) {
            setSelectedNode(node);
        }

        const element = nodeRefs.current[nodeId];

        if (!element) return;

        requestAnimationFrame(() => {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center',
            });
        });
    }, [workflow.runtime?.currentNodeId, workflow.groups]);

    useEffect(() => {
        if (!selectedNode) {
            setSelectedNode(firstNode);
        }
    }, [firstNode, selectedNode]);

    const handleSelectNode = (node: WorkflowNode) => {
        setSelectedNode(node);
    };

    return (
        <section className={styles.wrapper}>
            <div className={styles.content}>
                {workflow.groups.map((group) => (
                    <WorkflowGroup
                        key={group.id}
                        workflow={workflow}
                        group={group}
                        selectedNode={selectedNode}
                        onSelectNode={handleSelectNode}
                        nodeRefs={nodeRefs}
                    />
                ))}
            </div>

            <aside className={styles.sidebar}>
                <WorkflowInfo node={selectedNode} />
            </aside>
        </section>
    );
}
