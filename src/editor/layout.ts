import ELK from 'elkjs/lib/elk.bundled.js';
import type { Edge, Node } from 'reactflow';
import type { DesignerNodeData } from './types';

const elk = new ELK();

const DEFAULT_NODE_WIDTH = 240;
const DEFAULT_NODE_HEIGHT = 160;

const LAYOUT_OPTIONS = {
  'elk.algorithm': 'layered',
  'elk.direction': 'RIGHT',
  'elk.layered.spacing.nodeNodeBetweenLayers': '140',
  'elk.layered.spacing.edgeNodeBetweenLayers': '60',
  'elk.spacing.nodeNode': '80',
  'elk.spacing.componentComponent': '120'
};

type ElkLayoutNode = {
  id: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
};

type ElkLayoutEdge = {
  id: string;
  sources: string[];
  targets: string[];
};

type ElkLayoutGraph = {
  id: string;
  layoutOptions?: Record<string, string>;
  children?: ElkLayoutNode[];
  edges?: ElkLayoutEdge[];
};

// Consider layout initialized only when all nodes have non-zero positions.
// This avoids falsely treating partially positioned graphs as initialized.
export const isLayoutInitialized = (nodes: Node<DesignerNodeData>[]): boolean => {
  if (!nodes.length) return false;
  return nodes.every((node) => {
    const x = node.position?.x ?? 0;
    const y = node.position?.y ?? 0;
    return x !== 0 || y !== 0;
  });
};

export async function applyAutoLayout(
  nodes: Node<DesignerNodeData>[],
  edges: Edge[]
): Promise<Node<DesignerNodeData>[]> {
  if (!nodes.length) {
    return nodes;
  }

  const graph: ElkLayoutGraph = {
    id: 'root',
    layoutOptions: LAYOUT_OPTIONS,
    children: nodes.map((node) => ({
      id: node.id,
      width: typeof node.width === 'number' ? node.width : DEFAULT_NODE_WIDTH,
      height: typeof node.height === 'number' ? node.height : DEFAULT_NODE_HEIGHT
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      sources: [edge.source],
      targets: [edge.target]
    }))
  };

  const layout = (await elk.layout(graph as any)) as ElkLayoutGraph;

  const positions = new Map<string, { x: number; y: number }>();
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;

  layout.children?.forEach((child) => {
    if (typeof child.x === 'number' && typeof child.y === 'number') {
      minX = Math.min(minX, child.x);
      minY = Math.min(minY, child.y);
      positions.set(child.id, { x: child.x, y: child.y });
    }
  });

  const offsetX = Number.isFinite(minX) ? minX : 0;
  const offsetY = Number.isFinite(minY) ? minY : 0;

  return nodes.map((node) => {
    const position = positions.get(node.id);
    if (!position) {
      return node;
    }

    const x = Math.round((position.x - offsetX) * 100) / 100;
    const y = Math.round((position.y - offsetY) * 100) / 100;

    return {
      ...node,
      position: { x, y },
      positionAbsolute: { x, y }
    };
  });
}
