import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
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
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { FlowDefinition, FlowMetadata, FlowVariable, NodeType } from '../model/flow';
import { nodeSchemas } from '../model/nodeDefinitions';
import { flowToReact, reactToFlow, flowNodeToReactNode } from './transformers';
import { DesignerNodeData } from './types';
import FlowNode from '../nodes/FlowNode';
import FlowNodeWithLabels from '../nodes/FlowNodeWithLabels';
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

const nodeTypes = {
  flowNode: FlowNode,
  flowNodeWithLabels: FlowNodeWithLabels
};

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
      <CardContent className="p-0">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Akış Bilgileri</TabsTrigger>
            <TabsTrigger value="variables">Değişkenler</TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Flow ID</Label>
                <Input value={meta.flowId} onChange={(event) => updateField('flowId', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Ad</Label>
                <Input value={meta.name} onChange={(event) => updateField('name', event.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Versiyon</Label>
                <Input value={meta.version} onChange={(event) => updateField('version', event.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Açıklama</Label>
              <Textarea
                value={meta.description ?? ''}
                onChange={(event) => updateField('description', event.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Input
                  value={meta.metadata?.category ?? ''}
                  onChange={(event) => updateMetadata('category', event.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Yazar</Label>
                <Input
                  value={meta.metadata?.author ?? ''}
                  onChange={(event) => updateMetadata('author', event.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
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
          </TabsContent>

          <TabsContent value="variables" className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Değişkenler</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
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
            <div className="space-y-3">
              {variableEntries.map(([name, variable]) => (
                <Card key={name}>
                  <CardContent className="p-4 space-y-3">
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
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => updateVariables(name, null)}
                        className="text-destructive hover:text-destructive"
                      >
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
                  </CardContent>
                </Card>
              ))}
              {variableEntries.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Henüz değişken eklenmemiş</p>
                  <p className="text-sm">Yeni değişken eklemek için yukarıdaki butonu kullanın</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};


const NodeInspector: React.FC<{
  node: Node<DesignerNodeData> | null;
  onChange: (properties: any) => void;
  variables?: Record<string, FlowVariable>;
}> = ({ node, onChange, variables }) => {
  if (!node) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Node Özellikleri</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Bir node seçerek özelliklerini düzenleyin.</p>
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
        <SchemaForm schema={schema} value={node.data.properties} onChange={onChange} variables={variables} />
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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [, setLayoutInitialized] = useState<boolean>(() => isLayoutInitialized(initialNodes));
  const [isLayouting, setIsLayouting] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const reactFlow = useReactFlow();
  const flowWrapperRef = useRef<HTMLDivElement | null>(null);
  const layoutingRef = useRef(false);
  const layoutAttemptedRef = useRef(false);
  const isDraggingRef = useRef(false);

  const lastFlowIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Simple check to prevent re-initialization of the same flow
    if (lastFlowIdRef.current === initialFlow.flowId) {
      console.log('Skipping flow update - same flowId');
      return;
    }

    console.log('FlowEditor initialFlow changed:', initialFlow);
    console.log('Setting nodes to initialNodes:', initialNodes);
    console.log('Setting edges to initialEdges:', initialEdges);

    // Reset layout attempt flag for new flows
    layoutAttemptedRef.current = false;

    setMeta(extractMeta(initialFlow));
    setNodes(initialNodes);
    setEdges(initialEdges);
    setSelectedNodeId(null);
    setLayoutInitialized(isLayoutInitialized(initialNodes));

    // Remember this flow ID to prevent unnecessary re-initialization
    lastFlowIdRef.current = initialFlow.flowId;
  }, [initialFlow, initialNodes, initialEdges]);

  

  // Helper function to update flow model with fresh state
  const updateFlowModel = useCallback((reason: string) => {
    console.log(`Updating flow model: ${reason}`);

    // Get fresh state from React Flow instead of using stale closures
    setNodes((currentNodes) => {
      setEdges((currentEdges) => {
        const definition = createFlowDefinition(meta, currentNodes, currentEdges);
        if (onFlowChange) {
          onFlowChange(definition);
        }
        return currentEdges;
      });
      return currentNodes;
    });
  }, [meta, onFlowChange]);

  const handleNodesChange: OnNodesChange = useCallback(
    (changes: any) => {
      // Apply changes to React Flow immediately for smooth visual feedback
      onNodesChange(changes);

      // Check for dragging
      const isDragging = changes.some((change: any) =>
        change.type === 'position' && change.dragging === true
      );

      if (isDragging) {
        isDraggingRef.current = true;
        return; // Skip everything during drag for performance
      }

      const dragEnded = changes.some((change: any) =>
        change.type === 'position' && change.dragging === false
      );

      if (dragEnded) {
        isDraggingRef.current = false;
        // Don't update model immediately after drag - let position stabilize
        return;
      }

      // Only update model for non-position changes
      const hasNonPositionChanges = changes.some((change: any) =>
        change.type !== 'position' && change.type !== 'select'
      );

      if (hasNonPositionChanges) {
        setTimeout(() => updateFlowModel('nodes changed'), 0);
      }
    },
    [onNodesChange, updateFlowModel]
  );

  const handleEdgesChange: OnEdgesChange = useCallback(
    (changes) => {
      // Apply changes to React Flow immediately
      onEdgesChange(changes);

      // Skip selection changes during dragging
      if (isDraggingRef.current) {
        return;
      }

      // Only update model for structural changes
      const hasStructuralChanges = changes.some((change: any) =>
        change.type === 'add' || change.type === 'remove'
      );

      if (hasStructuralChanges) {
        setTimeout(() => updateFlowModel('edges changed'), 0);
      }
    },
    [onEdgesChange, updateFlowModel]
  );

  const onConnect = useCallback(
    (connection: Connection) => {
      console.log('Connecting nodes:', connection);

      // Update edges in React Flow
      setEdges((currentEdges) => {
        const updatedEdges = addEdge(connection, currentEdges);
        // Update flow model with fresh edges
        setTimeout(() => updateFlowModel('edge connected'), 0);
        return updatedEdges;
      });
    },
    [setEdges, updateFlowModel]
  );

  const handleAddNode = useCallback((type: NodeType, position?: { x: number; y: number }) => {
    console.log('handleAddNode called with type:', type, 'position:', position);

    const schema = nodeSchemas[type];
    if (!schema) {
      console.error('No schema found for node type:', type);
      return;
    }

    // Update nodes in React Flow
    setNodes((currentNodes) => {
      const id = createUniqueNodeId(type, currentNodes);
      const nodePosition = position || { x: 400, y: 100 + currentNodes.length * 80 };

      const newNode = flowNodeToReactNode({
        id,
        type,
        position: nodePosition,
        properties: schema.defaultProperties()
      });

      console.log('New node created:', newNode);

      // Update selection and flow model
      setSelectedNodeId(id);
      setTimeout(() => updateFlowModel(`added ${type} node`), 0);

      return [...currentNodes, newNode];
    });
  }, [setNodes, setSelectedNodeId, updateFlowModel]);

  // Drag and drop handlers
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      console.log('Drop event triggered', event);
      console.log('DataTransfer types:', event.dataTransfer.types);

      const nodeType = event.dataTransfer.getData('application/reactflow') as NodeType;
      console.log('NodeType from dataTransfer:', nodeType);

      if (!nodeType) {
        console.log('No nodeType found in drop event');
        // Try fallback method
        const textData = event.dataTransfer.getData('text/plain');
        console.log('Text data fallback:', textData);
        if (textData && nodeSchemas[textData as NodeType]) {
          try {
            const position = reactFlow.screenToFlowPosition({
              x: event.clientX,
              y: event.clientY,
            });
            console.log('Using fallback, adding node:', textData, 'at position:', position);
            handleAddNode(textData as NodeType, position);
          } catch (error) {
            console.error('Error with reactFlow.screenToFlowPosition:', error);
          }
        } else {
          console.log('Invalid text data or no schema found:', textData);
        }
        return;
      }

      try {
        const position = reactFlow.screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });

        console.log('Adding node:', nodeType, 'at position:', position);
        handleAddNode(nodeType, position);
      } catch (error) {
        console.error('Error in onDrop:', error);
      }
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

    // Update flow model when node properties change
    updateFlowModel(`updated ${nodeId} properties`);
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

      // Update flow model after layout
      setTimeout(() => updateFlowModel('auto layout applied'), 0);

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
  }, [edges, nodes, reactFlow, updateFlowModel]);

  // Ensure auto-layout runs when a new flow without positions is loaded.
  // Use initialNodes/initialEdges from props to avoid race conditions with state updates.
  useEffect(() => {
    console.log('Layout effect triggered');
    console.log('initialNodes:', initialNodes);
    console.log('isLayoutInitialized(initialNodes):', isLayoutInitialized(initialNodes));
    console.log('layoutAttemptedRef.current:', layoutAttemptedRef.current);

    const needsLayout = !isLayoutInitialized(initialNodes) && initialNodes.length > 0;
    console.log('needsLayout:', needsLayout);
    console.log('layoutingRef.current:', layoutingRef.current);

    if (!needsLayout || layoutingRef.current || layoutAttemptedRef.current) {
      console.log('Skipping layout - needsLayout:', needsLayout, 'layoutingRef.current:', layoutingRef.current, 'layoutAttemptedRef.current:', layoutAttemptedRef.current);
      return;
    }

    console.log('Starting auto layout');
    layoutingRef.current = true;
    layoutAttemptedRef.current = true;
    setIsLayouting(true);
    setContextMenu(null);

    (async () => {
      try {
        console.log('Applying auto layout to:', initialNodes.length, 'nodes');
        const layoutedNodes = await applyAutoLayout(initialNodes, initialEdges);
        console.log('Layout result:', layoutedNodes);

        setNodes(layoutedNodes);
        setLayoutInitialized(true);
        console.log('Layout applied successfully');
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
  }, [initialNodes, initialEdges, reactFlow]);

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
    <div className={showMetadata ? "grid grid-cols-1 lg:grid-cols-3 gap-6 h-full min-h-0" : "h-full min-h-0"}>
      {showMetadata && (
        <div className="space-y-4 overflow-y-auto">
          <FlowMetadataForm meta={meta} onMetaChange={(updater) => {
            setMeta((prev) => {
              const newMeta = updater(prev);
              updateFlowModel('metadata updated');
              return newMeta;
            });
          }} />
        </div>
      )}
      <Card className={showMetadata ? "lg:col-span-2 overflow-hidden flex flex-col h-full" : "h-full overflow-hidden flex flex-col"}>
        <Tabs defaultValue="design" className="flex-1 flex flex-col min-h-0">
          <TabsList className="flex-shrink-0">
            <TabsTrigger value="design">Tasarım</TabsTrigger>
            <TabsTrigger value="json">Flow JSON</TabsTrigger>
          </TabsList>
          <TabsContent value="design" className="flex-1 overflow-hidden min-h-0 p-0">
            <div
              ref={flowWrapperRef}
              className="h-full w-full relative"
              onDrop={onDrop}
              onDragOver={onDragOver}
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes as any}
                onNodesChange={handleNodesChange}
                onEdgesChange={handleEdgesChange}
                onConnect={onConnect}
                onSelectionChange={(params) => {
                  // Skip selection during dragging for better performance
                  if (isDraggingRef.current) return;

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
                fitView
                defaultViewport={{ x: 0, y: 0, zoom: 1 }}
                minZoom={0.1}
                maxZoom={2}
                elevateNodesOnSelect={false}
                selectNodesOnDrag={false}
                connectionRadius={20}
                snapToGrid={false}
                nodeDragThreshold={1}
              >
                <MiniMap />
                <Controls />
                <Background />
                <FloatingNodeToolbar onAddNode={handleAddNode} />
              </ReactFlow>
              {contextMenu && (
                <div className="absolute bg-background border border-border rounded-md shadow-md p-2 z-50" style={{ top: contextMenu.y, left: contextMenu.x }}>
                  <Button variant="ghost" size="sm" onClick={() => void runAutoLayout()} disabled={isLayouting}>
                    {isLayouting ? 'Yerleşim uygulanıyor…' : 'Otomatik Yerleşim'}
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
          <TabsContent value="json" className="flex-1 overflow-hidden min-h-0 p-4">
            <pre className="text-xs bg-muted p-4 rounded-md border h-full overflow-auto">{JSON.stringify(createFlowDefinition(meta, nodes, edges), null, 2)}</pre>
          </TabsContent>
        </Tabs>
      </Card>
      {showMetadata && (
        <div className="space-y-4 overflow-y-auto">
          <NodeInspector
            node={selectedNode}
            onChange={(properties) => {
              if (!selectedNode) return;
              updateNodeProperties(selectedNode.id, properties);
            }}
            variables={meta.variables}
          />
        </div>
      )}
    </div>
  );
};

const FlowEditor: React.FC<FlowEditorProps> = (props) => (
  <ReactFlowProvider>
    <FlowEditorContent {...props} />
  </ReactFlowProvider>
);

export default FlowEditor;
