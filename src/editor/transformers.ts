import { Edge, Node } from 'reactflow';
import { FlowDefinition, FlowEdge, FlowNode } from '../model/flow';
import { nodeSchemas } from '../model/nodeDefinitions';
import { DesignerNodeData } from './types';

export const createNodeId = (type: string, index: number) => `${type}_${index}`;

export function flowNodeToReactNode(flowNode: FlowNode): Node<DesignerNodeData> {
  const schema = nodeSchemas[flowNode.type];
  const outputs = schema.computeOutputs?.(flowNode.properties) ?? [];
  const inputs = schema.computeInputs?.(flowNode.properties) ?? (outputs.length ? [] : ['previous']);
  return {
    id: flowNode.id,
    type: 'flowNode',
    position: flowNode.position,
    data: {
      id: flowNode.id,
      type: flowNode.type,
      title: schema.title,
      schema,
      properties: flowNode.properties,
      inputs,
      outputs
    }
  };
}

export function flowEdgeToReactEdge(flowEdge: FlowEdge): Edge {
  return {
    id: flowEdge.id,
    source: flowEdge.source,
    target: Array.isArray(flowEdge.target) ? flowEdge.target[0] : flowEdge.target,
    sourceHandle: flowEdge.sourceHandle,
    targetHandle: flowEdge.targetHandle,
    type: 'default',
    data: {
      definition: flowEdge
    }
  };
}

export function flowToReact(flow: FlowDefinition): { nodes: Node<DesignerNodeData>[]; edges: Edge[] } {
  const nodes = flow.nodes.map(flowNodeToReactNode);
  const edges: Edge[] = [];

  flow.edges.forEach((edge) => {
    if (Array.isArray(edge.target)) {
      edge.target.forEach((targetId, index) => {
        const splitted: FlowEdge = { ...edge, target: targetId };
        const reactEdge = flowEdgeToReactEdge(splitted);
        edges.push({
          ...reactEdge,
          id: `${edge.id}_${index}`,
          data: {
            definition: splitted,
            parallelGroup: edge.id,
            originalEdge: edge
          }
        });
      });
    } else {
      edges.push(flowEdgeToReactEdge(edge));
    }
  });

  return { nodes, edges };
}

export function reactNodeToFlowNode(node: Node<DesignerNodeData>): FlowNode {
  return {
    id: node.id,
    type: node.data.type,
    position: node.position,
    properties: node.data.properties
  };
}

export function reactEdgeToFlowEdge(edge: Edge): FlowEdge {
  const definition = edge.data?.definition as FlowEdge | undefined;
  if (definition) {
    return {
      ...definition,
      sourceHandle: edge.sourceHandle ?? definition.sourceHandle,
      targetHandle: edge.targetHandle ?? definition.targetHandle
    };
  }
  return {
    id: edge.id,
    type: 'default',
    source: edge.source,
    target: edge.target,
    sourceHandle: edge.sourceHandle,
    targetHandle: edge.targetHandle
  };
}

export function reactToFlow(flow: FlowDefinition, nodes: Node<DesignerNodeData>[], edges: Edge[]): FlowDefinition {
  const normalizedEdges: FlowEdge[] = [];
  const parallelGroups = new Map<string, FlowEdge>();

  edges.forEach((edge) => {
    const groupId = edge.data?.parallelGroup as string | undefined;
    if (groupId) {
      const original = edge.data?.originalEdge as FlowEdge | undefined;
      const definition = (edge.data?.definition as FlowEdge | undefined) ?? {
        id: edge.id,
        type: 'parallel',
        source: edge.source,
        target: edge.target
      };
      const base = parallelGroups.get(groupId) ?? {
        ...(original ?? definition),
        id: groupId,
        target: Array.isArray(original?.target) ? [...(original?.target as string[])] : []
      };
      const targets = Array.isArray(base.target) ? base.target : [];
      targets.push(edge.target);
      base.target = targets;
      parallelGroups.set(groupId, base);
    } else {
      normalizedEdges.push(reactEdgeToFlowEdge(edge));
    }
  });

  parallelGroups.forEach((edge) => {
    if (!Array.isArray(edge.target)) {
      edge.target = [edge.target as string];
    }
    normalizedEdges.push(edge);
  });

  return {
    ...flow,
    nodes: nodes.map(reactNodeToFlowNode),
    edges: normalizedEdges
  };
}
