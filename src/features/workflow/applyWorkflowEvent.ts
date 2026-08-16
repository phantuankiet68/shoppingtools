import { WorkflowData, WorkflowEvent, WorkflowNode, WorkflowStageId } from './types';

function findNode(workflow: WorkflowData, nodeId: WorkflowStageId): WorkflowNode | undefined {
    for (const group of workflow.groups) {
        const node = group.nodes.find((item) => item.id === nodeId);

        if (node) {
            return node;
        }
    }

    return undefined;
}

function updateNode(
    workflow: WorkflowData,
    nodeId: WorkflowStageId,
    updater: (node: WorkflowNode) => WorkflowNode,
): WorkflowData {
    return {
        ...workflow,
        groups: workflow.groups.map((group) => ({
            ...group,
            nodes: group.nodes.map((node) => (node.id === nodeId ? updater(node) : node)),
        })),
    };
}

function getCompletedSteps(workflow: WorkflowData) {
    return workflow.groups
        .flatMap((group) => group.nodes)
        .filter((node) => node.runtimeStatus === 'success' || node.status === 'success').length;
}

export function applyWorkflowEvent(workflow: WorkflowData, event: WorkflowEvent): WorkflowData {
    switch (event.type) {
        case 'workflow:start': {
            return {
                ...workflow,
                runtime: {
                    status: 'running',
                    currentNodeId: undefined,
                    startedAt: event.startedAt,
                    completedAt: undefined,
                    duration: undefined,
                    error: undefined,
                    completedSteps: 0,
                    totalSteps: workflow.groups.reduce(
                        (total, group) => total + group.nodes.length,
                        0,
                    ),
                },
                groups: workflow.groups.map((group) => ({
                    ...group,
                    nodes: group.nodes.map((node) => ({
                        ...node,
                        status: 'waiting',
                        runtimeStatus: 'idle',
                        progress: 0,
                        error: undefined,
                        requestData: undefined,
                        responseData: undefined,
                        startedAt: undefined,
                        completedAt: undefined,
                        duration: undefined,
                    })),
                })),
            };
        }

        case 'node:start': {
            const nextWorkflow = updateNode(workflow, event.nodeId, (node) => ({
                ...node,
                status: 'running',
                runtimeStatus: 'running',
                progress: 0,
                error: undefined,
                requestData: event.requestData,
                startedAt: event.startedAt,
                completedAt: undefined,
                duration: undefined,
            }));

            return {
                ...nextWorkflow,
                runtime: nextWorkflow.runtime
                    ? {
                          ...nextWorkflow.runtime,
                          status: 'running',
                          currentNodeId: event.nodeId,
                          error: undefined,
                      }
                    : undefined,
            };
        }

        case 'node:progress': {
            return updateNode(workflow, event.nodeId, (node) => ({
                ...node,
                status: 'running',
                runtimeStatus: 'running',
                progress: Math.max(0, Math.min(100, event.progress)),
            }));
        }

        case 'node:success': {
            const nextWorkflow = updateNode(workflow, event.nodeId, (node) => ({
                ...node,
                status: 'success',
                runtimeStatus: 'success',
                progress: 100,
                responseData: event.responseData,
                error: undefined,
                completedAt: event.completedAt,
                duration: event.duration,
            }));

            return {
                ...nextWorkflow,
                runtime: nextWorkflow.runtime
                    ? {
                          ...nextWorkflow.runtime,
                          status: 'running',
                          currentNodeId: undefined,
                          completedSteps: getCompletedSteps(nextWorkflow),
                      }
                    : undefined,
            };
        }

        case 'node:error': {
            const nextWorkflow = updateNode(workflow, event.nodeId, (node) => ({
                ...node,
                status: 'error',
                runtimeStatus: 'error',
                error: event.error,
                completedAt: event.completedAt,
                duration: event.duration,
            }));

            return {
                ...nextWorkflow,
                runtime: nextWorkflow.runtime
                    ? {
                          ...nextWorkflow.runtime,
                          status: 'error',
                          currentNodeId: event.nodeId,
                          completedAt: event.completedAt,
                          duration:
                              event.completedAt -
                              (nextWorkflow.runtime.startedAt ?? event.completedAt),
                          error: event.error,
                          completedSteps: getCompletedSteps(nextWorkflow),
                      }
                    : undefined,
            };
        }

        case 'workflow:complete': {
            return {
                ...workflow,
                runtime: workflow.runtime
                    ? {
                          ...workflow.runtime,
                          status: 'success',
                          currentNodeId: undefined,
                          completedAt: event.completedAt,
                          duration: event.duration,
                          error: undefined,
                          completedSteps: getCompletedSteps(workflow),
                      }
                    : undefined,
            };
        }

        case 'workflow:error': {
            return {
                ...workflow,
                runtime: workflow.runtime
                    ? {
                          ...workflow.runtime,
                          status: 'error',
                          completedAt: event.completedAt,
                          duration: event.duration,
                          error: event.error,
                          completedSteps: getCompletedSteps(workflow),
                      }
                    : undefined,
            };
        }

        default:
            return workflow;
    }
}
