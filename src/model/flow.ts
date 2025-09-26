export type NodeType =
  | 'start'
  | 'end'
  | 'message'
  | 'button'
  | 'input'
  | 'condition'
  | 'function'
  | 'agent'
  | 'api'
  | 'form'
  | 'table'
  | 'decision_tree';

export interface FlowMetadata {
  category?: string;
  tags?: string[];
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FlowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object';
  default?: unknown;
}

export interface FlowNodePosition {
  x: number;
  y: number;
}

export interface FlowNode<TProps = Record<string, unknown>> {
  id: string;
  type: NodeType;
  position: FlowNodePosition;
  properties: TProps;
}

export interface FlowEdgeCondition {
  variable: string;
  operator: string;
  value: unknown;
}

export interface FlowEdge {
  id: string;
  type: 'default' | 'conditional' | 'parallel' | 'error';
  source: string;
  target: string | string[];
  sourceHandle?: string;
  targetHandle?: string;
  condition?: FlowEdgeCondition;
  waitForAll?: boolean;
  errorType?: string;
}

export interface FlowDefinition {
  flowId: string;
  name: string;
  version: string;
  description?: string;
  metadata?: FlowMetadata;
  triggers?: string[];
  variables?: Record<string, FlowVariable>;
  nodes: FlowNode[];
  edges: FlowEdge[];
}

export type FlowUpdateListener = (definition: FlowDefinition) => void;
