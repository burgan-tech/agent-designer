import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  Node,
  OnEdgesChange,
  OnNodesChange,
  addEdge,
  useEdgesState,
  useNodesState,
  ReactFlowProvider,
  useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import { FlowDefinition, FlowMetadata, FlowVariable, NodeType } from '../model/flow';
import { nodeSchemas } from '../model/nodeDefinitions';
import { flowToReact, reactToFlow, flowNodeToReactNode } from './transformers';
import { DesignerNodeData } from './types';
import FlowNode from '../nodes/FlowNode';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Select } from '../components/ui/select';
import { SchemaForm } from './SchemaForm';
import { sampleFlow } from '../model/sampleFlow';
import { applyAutoLayout, isLayoutInitialized } from './layout';
import { FloatingNodeToolbar } from '../components/FloatingNodeToolbar';

export interface FlowEditorProps {
  initialFlow?: FlowDefinition;
  onFlowChange?: (definition: FlowDefinition) => void;
  showMetadata?: boolean;
}

const nodeTypes = { flowNode: FlowNode };

type FlowMeta = Omit<FlowDefinition, 'nodes' | 'edges'>;

const extractMeta = (flow: FlowDefinition): FlowMeta => ({
  flowId: flow.flowId,
  name: flow.name,
  version: flow.version,
  description: flow.description,
  metadata: flow.metadata,
  triggers: flow.triggers ?? [],
  variables: flow.variables ?? {}
});

const createFlowDefinition = (
  meta: FlowMeta,
  nodes: Node<DesignerNodeData>[],
  edges: Edge[]
): FlowDefinition => {
  const base: FlowDefinition = {
    ...meta,
    nodes: [],
    edges: []
  } as FlowDefinition;
  return reactToFlow(base, nodes, edges);
};

const createUniqueNodeId = (type: NodeType, nodes: Node<DesignerNodeData>[]) => {
  let index = nodes.length + 1;
  let candidate = `${type}_${index}`;
  while (nodes.some((node) => node.id === candidate)) {
    index += 1;
    candidate = `${type}_${index}`;
  }
  return candidate;
};

const FlowMetadataForm: React.FC<{
  meta: FlowMeta;
  onMetaChange: (updater: (prev: FlowMeta) => FlowMeta) => void;
}> = ({ meta, onMetaChange }) => {
  const updateField = (field: keyof FlowMeta, value: any) => {
    onMetaChange((prev) => ({ ...prev, [field]: value }));
  };

  const updateMetadata = (field: keyof FlowMetadata, value: any) => {
    onMetaChange((prev) => ({
      ...prev,
      metadata: {
        ...prev.metadata,
        [field]: value
      }
    }));
  };

  const updateVariables = (name: string, variable: FlowVariable | null) => {
    onMetaChange((prev) => {
      const variables = { ...(prev.variables ?? {}) };
      delete variables[name];
      if (variable) {
        variables[variable.name] = variable;
      }
      return { ...prev, variables };
    });
  };

  const variableEntries = Object.entries(meta.variables ?? {});

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flow Bilgileri</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="meta-form-grid">
          <div className="space-y-1">
            <Label>Flow ID</Label>
            <Input value={meta.flowId} onChange={(event) => updateField('flowId', event.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Ad</Label>
            <Input value={meta.name} onChange={(event) => updateField('name', event.target.value)} />
          </div>
          <div className="space-y-1">
            <Label>Versiyon</Label>
            <Input value={meta.version} onChange={(event) => updateField('version', event.target.value)} />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Açıklama</Label>
          <Textarea
            value={meta.description ?? ''}
            onChange={(event) => updateField('description', event.target.value)}
          />
        </div>
        <div className="meta-form-grid">
          <div className="space-y-1">
            <Label>Kategori</Label>
            <Input
              value={meta.metadata?.category ?? ''}
              onChange={(event) => updateMetadata('category', event.target.value)}
            />
          </div>
          <div className="space-y-1">
            <Label>Yazar</Label>
            <Input
              value={meta.metadata?.author ?? ''}
              onChange={(event) => updateMetadata('author', event.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label>Etiketler</Label>
          <Input
            value={(meta.metadata?.tags ?? []).join(', ')}
            onChange={(event) =>
              updateMetadata(
                'tags',
                event.target.value.split(',').map((tag) => tag.trim()).filter(Boolean)
              )
            }
          />
        </div>
        <div className="space-y-2">
          <Label>Tetikleyiciler</Label>
          <Textarea
            value={(meta.triggers ?? []).join('\n')}
            onChange={(event) => updateField('triggers', event.target.value.split('\n').filter(Boolean))}
            placeholder={'kredi başvurusu\nkredi almak istiyorum'}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Değişkenler</Label>
            <Button
              type="button"
              variant="ghost"
              onClick={() =>
                updateVariables(`variable_${variableEntries.length + 1}`, {
                  name: `variable_${variableEntries.length + 1}`,
                  type: 'string',
                  default: ''
                })
              }
            >
              + Değişken
            </Button>
          </div>
          <div className="space-y-2">
            {variableEntries.map(([name, variable]) => (
              <div key={name} className="rounded-md border border-slate-200 p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <Input
                    value={variable.name}
                    onChange={(event) =>
                      updateVariables(name, {
                        ...variable,
                        name: event.target.value
                      })
                    }
                  />
                  <Select
                    value={variable.type}
                    onChange={(event) =>
                      updateVariables(name, {
                        ...variable,
                        type: event.target.value as FlowVariable['type']
                      })
                    }
                    options={[
                      { label: 'String', value: 'string' },
                      { label: 'Number', value: 'number' },
                      { label: 'Boolean', value: 'boolean' },
                      { label: 'Object', value: 'object' }
                    ]}
                  />
                  <Button type="button" variant="ghost" onClick={() => updateVariables(name, null)}>
                    Sil
                  </Button>
                </div>
                <Input
                  placeholder="Varsayılan değer"
                  value={String(variable.default ?? '')}
                  onChange={(event) =>
                    updateVariables(name, {
                      ...variable,
                      default: event.target.value
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


const NodeInspector: React.FC<{
  node: Node<DesignerNodeData> | null;
  onChange: (properties: any) => void;
}> = ({ node, onChange }) => {
  if (!node) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Node Özellikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Bir node seçerek özelliklerini düzenleyin.</p>
        </CardContent>
      </Card>
    );
  }

  const schema = node.data.schema;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{schema.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <SchemaForm schema={schema} value={node.data.properties} onChange={onChange} />
      </CardContent>
    </Card>
  );
};

const FlowEditorContent: React.FC<FlowEditorProps> = ({
  initialFlow = sampleFlow,
  onFlowChange,
  showMetadata = true
}) => {
  const [meta, setMeta] = useState<FlowMeta>(() => extractMeta(initialFlow));
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => flowToReact(initialFlow), [initialFlow]);
  const [nodes, setNodes, onNodesChange] = useNodesState<DesignerNodeData>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [layoutInitialized, setLayoutInitialized] = useState<boolean>(() => isLayoutInitialized(initialNodes));
  const [isLayouting, setIsLayouting] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const reactFlow = useReactFlow<DesignerNodeData>();
  const flowWrapperRef = useRef<HTMLDivElement | null>(null);
  const layoutingRef = useRef(false);

  useEffect(() => {
    setMeta(extractMeta(initialFlow));
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNodeId(null);
    setLayoutInitialized(isLayoutInitialized(initialNodes));
  }, [initialFlow, initialNodes, initialEdges, setNodes, setEdges]);

  useEffect(() => {
    const definition = createFlowDefinition(meta, nodes, edges);
    onFlowChange?.(definition);
  }, [meta, nodes, edges, onFlowChange]);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      setNodes((nds) =>
        nds.map((node) => {
          const schema = nodeSchemas[node.data.type];
          return {
            ...node,
            data: {
              ...node.data,
              inputs: schema.computeInputs?.(node.data.properties) ?? node.data.inputs,
              outputs: schema.computeOutputs?.(node.data.properties) ?? node.data.outputs
            }
          };
        })
      );
    },
    [onNodesChange, setNodes]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      onEdgesChange(changes);
    },
    [onEdgesChange]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      setEdges((eds) => addEdge(connection, eds));
    },
    [setEdges]
  );

  const handleAddNode = useCallback((type: NodeType, position?: { x: number; y: number }) => {
    const schema = nodeSchemas[type];
    const id = createUniqueNodeId(type, nodes);
    const nodePosition = position || { x: 400, y: 100 + nodes.length * 80 };
    const newNode = flowNodeToReactNode({
      id,
      type,
      position: nodePosition,
      properties: schema.defaultProperties()
    });
    setNodes((current) => [...current, newNode]);
    setSelectedNodeId(id);
  }, [nodes, setNodes, setSelectedNodeId]);

  // Drag and drop handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const nodeType = event.dataTransfer.getData('application/reactflow') as NodeType;
      console.log('Drop event triggered, nodeType:', nodeType);

      if (!nodeType) {
        console.log('No nodeType found in drop event');
        return;
      }

      const position = reactFlow.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      console.log('Drop position:', position);
      handleAddNode(nodeType, position);
    },
    [reactFlow, handleAddNode]
  );

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId]
  );

  const updateNodeProperties = (nodeId: string, properties: any) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id !== nodeId) return node;
        const schema = nodeSchemas[node.data.type];
        const outputs = schema.computeOutputs?.(properties) ?? node.data.outputs;
        const inputs = schema.computeInputs?.(properties) ?? node.data.inputs;
        return {
          ...node,
          data: {
            ...node.data,
            properties,
            inputs,
            outputs
          }
        };
      })
    );
  };

  const runAutoLayout = useCallback(async () => {
    if (!nodes.length || layoutingRef.current) {
      return;
    }

    layoutingRef.current = true;
    setIsLayouting(true);
    setContextMenu(null);

    try {
      const layoutedNodes = await applyAutoLayout(nodes, edges);
      setNodes(layoutedNodes);
      setLayoutInitialized(true);
      requestAnimationFrame(() => {
        try {
          reactFlow.fitView({ padding: 0.2, duration: 400 });
        } catch (error) {
          console.warn('fitView failed', error);
        }
      });
    } catch (error) {
      console.error('Failed to apply auto layout', error);
    } finally {
      layoutingRef.current = false;
      setIsLayouting(false);
    }
  }, [edges, nodes, reactFlow, setNodes]);

  // Ensure auto-layout runs when a new flow without positions is loaded.
  // Use initialNodes/initialEdges from props to avoid race conditions with state updates.
  useEffect(() => {
    const needsLayout = !isLayoutInitialized(initialNodes) && initialNodes.length > 0;
    if (!needsLayout || layoutingRef.current) return;

    layoutingRef.current = true;
    setIsLayouting(true);
    setContextMenu(null);

    (async () => {
      try {
        const layoutedNodes = await applyAutoLayout(initialNodes, initialEdges);
        setNodes(layoutedNodes);
        setLayoutInitialized(true);
        requestAnimationFrame(() => {
          try {
            reactFlow.fitView({ padding: 0.2, duration: 400 });
          } catch (error) {
            console.warn('fitView failed', error);
          }
        });
      } catch (error) {
        console.error('Failed to apply auto layout on load', error);
      } finally {
        layoutingRef.current = false;
        setIsLayouting(false);
      }
    })();
  }, [initialNodes, initialEdges, reactFlow, setNodes]);

  useEffect(() => {
    if (!contextMenu) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (!flowWrapperRef.current) return;
      const target = event.target as HTMLElement | null;
      if (target && !flowWrapperRef.current.contains(target)) {
        setContextMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [contextMenu]);

  return (
    <div className="flow-editor-shell">
      {showMetadata && (
        <div className="space-y-3 overflow-y-auto pr-2">
          <FlowMetadataForm meta={meta} onMetaChange={(updater) => setMeta((prev) => updater(prev))} />
        </div>
      )}
      <div className="shad-card overflow-hidden">
        <Tabs defaultValue="design">
          <TabsList>
            <TabsTrigger value="design">Tasarım</TabsTrigger>
            <TabsTrigger value="json">Flow JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="design">
            <div
              ref={flowWrapperRef}
              style={{ height: '70vh', position: 'relative' }}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={onConnect}
                onSelectionChange={(params) => {
                  if (!params) return;
                  const nodeId = params.nodes?.[0]?.id;
                  setSelectedNodeId(nodeId ?? null);
                }}
                onPaneContextMenu={(event) => {
                  event.preventDefault();
                  if (!flowWrapperRef.current) return;
                  const bounds = flowWrapperRef.current.getBoundingClientRect();
                  setContextMenu({
                    x: event.clientX - bounds.left,
                    y: event.clientY - bounds.top
                  });
                }}
                onPaneClick={() => setContextMenu(null)}
                onDrop={onDrop}
                onDragOver={onDragOver}
                fitView
              >
                <MiniMap />
                <Controls />
                <Background />
                <FloatingNodeToolbar onAddNode={handleAddNode} />
              </ReactFlow>
              {contextMenu && (
                <div className="flow-context-menu" style={{ top: contextMenu.y, left: contextMenu.x }}>
                  <button type="button" onClick={() => void runAutoLayout()} disabled={isLayouting}>
                    {isLayouting ? 'Yerleşim uygulanıyor…' : 'Otomatik Yerleşim'}
                  </button>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="json">
            <pre>{JSON.stringify(createFlowDefinition(meta, nodes, edges), null, 2)}</pre>
          </TabsContent>
        </Tabs>
      </div>
      <div className="space-y-3 overflow-y-auto pl-2">
        <NodeInspector
          node={selectedNode}
          onChange={(properties) => {
            if (!selectedNode) return;
            updateNodeProperties(selectedNode.id, properties);
          }}
        />
      </div>
    </div>
  );
};

const FlowEditor: React.FC<FlowEditorProps> = (props) => (
  <ReactFlowProvider>
    <FlowEditorContent {...props} />
  </ReactFlowProvider>
);

export default FlowEditor;
