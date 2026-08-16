export type WorkflowStatus = 'success' | 'running' | 'waiting' | 'error';
export type WorkflowRuntimeStatus = 'idle' | 'running' | 'success' | 'error' | 'skipped';
export type WorkflowColor = 'green' | 'blue' | 'purple' | 'orange' | 'yellow' | 'red' | 'gray';
export type WorkflowMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'INTERNAL';
export type WorkflowRuntimeState = 'idle' | 'running' | 'success' | 'error';
export type WorkflowStageId =
    | 'validate'
    | 'check-domain'
    | 'create'
    | 'assets'
    | 'menu-template'
    | 'menu-translate'
    | 'menu-generate'
    | 'menu-save'
    | 'system-pages'
    | 'public-pages'
    | 'page-seo'
    | 'complete'
    | 'reload'
    | 'end';

export interface WorkflowNode {
    id: string;
    title: string;
    subtitle?: string;
    description?: string;
    icon: string;
    color: WorkflowColor;
    status: WorkflowStatus;
    runtimeStatus?: WorkflowRuntimeStatus;
    method?: WorkflowMethod;
    api?: string;
    step?: number;
    progress?: number;
    badge?: string;
    request?: string[];
    response?: string[];
    requestData?: unknown;
    responseData?: unknown;
    error?: string;
    startedAt?: number;
    completedAt?: number;
    duration?: number;
}

export interface WorkflowGroup {
    id: string;
    title: string;
    color: string;
    nodes: WorkflowNode[];
}

export interface WorkflowApi {
    method: Exclude<WorkflowMethod, 'INTERNAL'>;
    endpoint: string;
    description: string[];
    color: string;
}

export interface WorkflowBenefit {
    id: string;
    icon: string;
    title: string;
    description: string;
}

export interface WorkflowSidebar {
    request: string[];
    response: string[];
    apis: WorkflowApi[];
}

export interface WorkflowRuntime {
    status: WorkflowRuntimeState;
    currentNodeId?: string;
    startedAt?: number;
    completedAt?: number;
    duration?: number;
    error?: string;
    completedSteps: number;
    totalSteps: number;
}

export interface WorkflowData {
    title: string;
    subtitle: string;
    groups: WorkflowGroup[];
    sidebar: WorkflowSidebar;
    benefits: WorkflowBenefit[];
    runtime?: WorkflowRuntime;
}

export type WorkflowEvent =
    | {
          type: 'workflow:start';
          startedAt: number;
      }
    | {
          type: 'node:start';
          nodeId: WorkflowStageId;
          startedAt: number;
          requestData?: unknown;
      }
    | {
          type: 'node:progress';
          nodeId: WorkflowStageId;
          progress: number;
      }
    | {
          type: 'node:success';
          nodeId: WorkflowStageId;
          completedAt: number;
          duration: number;
          responseData?: unknown;
      }
    | {
          type: 'node:error';
          nodeId: WorkflowStageId;
          completedAt: number;
          duration: number;
          error: string;
      }
    | {
          type: 'workflow:complete';
          completedAt: number;
          duration: number;
      }
    | {
          type: 'workflow:error';
          completedAt: number;
          duration: number;
          error: string;
      };
